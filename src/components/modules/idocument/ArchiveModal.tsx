"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Archive Modal
// Transition approved docs to iArchive with SHA-256
// ═══════════════════════════════════════════════

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Archive,
    Shield,
    Hash,
    Calendar,
    Tag,
    FolderArchive,
    CheckCircle2,
    Loader2,
    FileText,
    Lock,
    Sparkles,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

export type ArchiveCategory =
    | "fiscal"
    | "social"
    | "legal"
    | "client"
    | "vault";

interface ArchiveModalProps {
    open: boolean;
    documentTitle: string;
    onClose: () => void;
    onConfirm: (data: {
        category: ArchiveCategory;
        tags: string[];
        sha256Hash: string;
        retentionYears: number;
    }) => void;
}

// ─── Categories ─────────────────────────────────

const CATEGORIES: {
    key: ArchiveCategory;
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    retention: number;
    retentionLabel: string;
}[] = [
        {
            key: "fiscal",
            label: "Fiscal",
            icon: FileText,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
            retention: 10,
            retentionLabel: "10 ans",
        },
        {
            key: "social",
            label: "Social",
            icon: Tag,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
            retention: 5,
            retentionLabel: "5 ans",
        },
        {
            key: "legal",
            label: "Juridique",
            icon: Shield,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            retention: 30,
            retentionLabel: "30 ans",
        },
        {
            key: "client",
            label: "Client",
            icon: FolderArchive,
            color: "text-violet-400",
            bg: "bg-violet-500/10 border-violet-500/20",
            retention: 5,
            retentionLabel: "5 ans",
        },
        {
            key: "vault",
            label: "Coffre-fort",
            icon: Lock,
            color: "text-rose-400",
            bg: "bg-rose-500/10 border-rose-500/20",
            retention: 99,
            retentionLabel: "Permanent",
        },
    ];

// ─── Archival steps ─────────────────────────────

const ARCHIVAL_STEPS = [
    { label: "Génération du PDF figé", icon: FileText },
    { label: "Calcul du hash SHA-256", icon: Hash },
    { label: "Création de l'entrée archive", icon: Archive },
    { label: "Génération du certificat", icon: Shield },
    { label: "Mise à jour du statut", icon: CheckCircle2 },
    { label: "Log d'audit créé", icon: Sparkles },
];

export default function ArchiveModal({
    open,
    documentTitle,
    onClose,
    onConfirm,
}: ArchiveModalProps) {
    const [category, setCategory] = useState<ArchiveCategory | null>(null);
    const [tags, setTags] = useState("");
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [sha256, setSha256] = useState("");

    const selectedCat = CATEGORIES.find((c) => c.key === category);

    // Simulate SHA-256 computation (in real app, would compute from PDF blob)
    const computeHash = useCallback(async () => {
        const data = new TextEncoder().encode(
            documentTitle + Date.now().toString() + Math.random().toString()
        );
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }, [documentTitle]);

    const handleArchive = async () => {
        if (!category) return;
        setProcessing(true);

        // Step through archival process
        for (let i = 0; i < ARCHIVAL_STEPS.length; i++) {
            setCurrentStep(i);
            if (i === 1) {
                // Compute SHA-256 at step 1
                const hash = await computeHash();
                setSha256(hash);
            }
            await new Promise((r) => setTimeout(r, 600));
        }

        // Complete
        const hash = sha256 || (await computeHash());
        onConfirm({
            category,
            tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            sha256Hash: hash,
            retentionYears: selectedCat?.retention ?? 10,
        });

        // Reset
        setProcessing(false);
        setCurrentStep(-1);
        setSha256("");
        setCategory(null);
        setTags("");
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                    <Archive className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Archiver dans iArchive
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 truncate max-w-[280px]">
                                        {documentTitle}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                onClick={onClose}
                                disabled={processing}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {!processing ? (
                            /* ─── Configuration Form ─── */
                            <div className="px-5 py-4 space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2.5">
                                        <FolderArchive className="h-3 w-3" />
                                        Catégorie d&apos;archivage
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {CATEGORIES.map((cat) => {
                                            const CatIcon = cat.icon;
                                            return (
                                                <button
                                                    key={cat.key}
                                                    onClick={() => setCategory(cat.key)}
                                                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${category === cat.key
                                                            ? `${cat.bg} ${cat.color}`
                                                            : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10"
                                                        }`}
                                                >
                                                    <CatIcon className="h-4 w-4 mb-1.5" />
                                                    <span className="text-[11px] font-medium">
                                                        {cat.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Retention info */}
                                {selectedCat && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                                    >
                                        <Calendar className="h-4 w-4 text-zinc-400" />
                                        <div>
                                            <p className="text-[11px] text-zinc-400">
                                                Durée de rétention
                                            </p>
                                            <p className="text-xs font-semibold text-white">
                                                {selectedCat.retentionLabel}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`ml-auto text-[9px] h-5 ${selectedCat.bg} ${selectedCat.color}`}
                                        >
                                            Auto-calculée
                                        </Badge>
                                    </motion.div>
                                )}

                                {/* Tags */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                        <Tag className="h-3 w-3" />
                                        Tags supplémentaires
                                    </label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="contrat, SOGARA, 2025 (séparés par virgule)"
                                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/30 placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Info box */}
                                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                                    <p className="text-[11px] text-violet-300/80 leading-relaxed">
                                        L&apos;archivage va générer un PDF figé, calculer le hash
                                        SHA-256, créer un certificat d&apos;intégrité et enregistrer
                                        le tout dans iArchive.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* ─── Processing Steps ─── */
                            <div className="px-5 py-4">
                                <div className="space-y-3">
                                    {ARCHIVAL_STEPS.map((step, i) => {
                                        const StepIcon = step.icon;
                                        const isDone = i < currentStep;
                                        const isActive = i === currentStep;
                                        const isPending = i > currentStep;

                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isActive
                                                        ? "bg-violet-500/10 border border-violet-500/20"
                                                        : isDone
                                                            ? "bg-emerald-500/5"
                                                            : "opacity-40"
                                                    }`}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                ) : isActive ? (
                                                    <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                                                ) : (
                                                    <StepIcon className="h-4 w-4 text-zinc-500" />
                                                )}
                                                <span
                                                    className={`text-xs ${isDone
                                                            ? "text-emerald-300/80"
                                                            : isActive
                                                                ? "text-violet-300 font-medium"
                                                                : "text-zinc-500"
                                                        }`}
                                                >
                                                    {step.label}
                                                </span>
                                                {isDone && (
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-auto text-[8px] h-4 border-emerald-500/20 text-emerald-400"
                                                    >
                                                        ✓
                                                    </Badge>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Hash display */}
                                {sha256 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash className="h-3 w-3 text-zinc-400" />
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                SHA-256
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-mono text-emerald-400/80 break-all leading-relaxed">
                                            {sha256}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        {!processing && (
                            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-zinc-400"
                                    onClick={onClose}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 text-xs text-white gap-1.5 bg-violet-600 hover:bg-violet-700"
                                    onClick={handleArchive}
                                    disabled={!category}
                                >
                                    <Archive className="h-3 w-3" />
                                    Confirmer l&apos;archivage
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
