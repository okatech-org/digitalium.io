"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: IntegrityVerifier
// Client-side SHA-256 recomputation and comparison
// ═══════════════════════════════════════════════

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Upload,
    Loader2,
    CheckCircle2,
    XCircle,
    Hash,
    FileText,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface Props {
    originalHash: string;
    archiveTitle: string;
    onVerificationComplete?: (result: { isValid: boolean; currentHash: string }) => void;
}

// ─── SHA-256 ────────────────────────────────────

async function computeSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Component ──────────────────────────────────

export default function IntegrityVerifier({ originalHash, archiveTitle, onVerificationComplete }: Props) {
    const [status, setStatus] = useState<"idle" | "hashing" | "valid" | "invalid">("idle");
    const [currentHash, setCurrentHash] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setFileName(file.name);
        setStatus("hashing");
        setCurrentHash(null);

        try {
            const hash = await computeSHA256(file);
            setCurrentHash(hash);
            const isValid = hash === originalHash;
            setStatus(isValid ? "valid" : "invalid");
            onVerificationComplete?.({ isValid, currentHash: hash });
        } catch {
            setStatus("invalid");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold">Vérification d&apos;intégrité</h3>
            </div>

            <p className="text-[11px] text-zinc-400">
                Déposez le fichier original pour vérifier que son empreinte SHA-256 correspond
                à celle enregistrée pour <span className="text-zinc-200 font-medium">{archiveTitle}</span>.
            </p>

            {/* Drop zone */}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.01] transition-all"
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                />
                {status === "hashing" ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                        <p className="text-xs text-violet-300">Calcul SHA-256 en cours…</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-zinc-500" />
                        <p className="text-xs font-medium">
                            Déposez le fichier ici ou cliquez
                        </p>
                        <p className="text-[10px] text-zinc-500">
                            Le fichier ne sera pas uploadé, uniquement analysé localement
                        </p>
                    </div>
                )}
            </div>

            {/* Results */}
            <AnimatePresence>
                {status !== "idle" && status !== "hashing" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        {/* Status banner */}
                        <div
                            className={`p-3 rounded-lg border ${
                                status === "valid"
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : "bg-red-500/10 border-red-500/20"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {status === "valid" ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-400">
                                                Intégrité vérifiée
                                            </p>
                                            <p className="text-[10px] text-emerald-400/70">
                                                Les empreintes correspondent — le fichier est intact.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5 text-red-400" />
                                        <div>
                                            <p className="text-xs font-semibold text-red-400">
                                                ALERTE : Fichier modifié !
                                            </p>
                                            <p className="text-[10px] text-red-400/70">
                                                Les empreintes ne correspondent pas — le fichier a été altéré.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Hash comparison */}
                        <div className="space-y-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            {fileName && (
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-[11px] text-zinc-300">{fileName}</span>
                                </div>
                            )}
                            <div>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                                    Hash original (stocké)
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <Hash className="h-3 w-3 text-violet-400 shrink-0" />
                                    <p className="text-[10px] font-mono text-violet-400 break-all">
                                        {originalHash}
                                    </p>
                                </div>
                            </div>
                            {currentHash && (
                                <div>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                                        Hash recalculé
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <Hash className={`h-3 w-3 shrink-0 ${
                                            status === "valid" ? "text-emerald-400" : "text-red-400"
                                        }`} />
                                        <p className={`text-[10px] font-mono break-all ${
                                            status === "valid" ? "text-emerald-400" : "text-red-400"
                                        }`}>
                                            {currentHash}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-white/10"
                            onClick={() => {
                                setStatus("idle");
                                setCurrentHash(null);
                                setFileName(null);
                            }}
                        >
                            Vérifier un autre fichier
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
