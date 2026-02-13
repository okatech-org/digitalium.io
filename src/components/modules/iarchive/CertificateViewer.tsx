"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: CertificateViewer
// Professional certificate display with verify + download
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Shield,
    ShieldCheck,
    ShieldAlert,
    QrCode,
    Loader2,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface CertificateData {
    certificateNumber: string;
    documentTitle: string;
    sha256Hash: string;
    archivedAt: number;
    archivedBy: string;
    organization: string;
    retentionYears: number;
    retentionExpiresAt: number;
    status: "valid" | "revoked";
    category: string;
}

interface Props {
    certificate: CertificateData;
    onVerifyIntegrity?: () => Promise<{ isValid: boolean }>;
    onDownloadPDF?: () => void;
}

// ─── Helpers ────────────────────────────────────

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatDateTime(ts: number): string {
    const d = new Date(ts);
    return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

// ─── Component ──────────────────────────────────

export default function CertificateViewer({ certificate, onVerifyIntegrity, onDownloadPDF }: Props) {
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<null | boolean>(null);
    const [copied, setCopied] = useState(false);

    const isValid = certificate.status === "valid";
    const hashShort = `${certificate.sha256Hash.slice(0, 12)}...${certificate.sha256Hash.slice(-8)}`;
    const expiresDate = formatDate(certificate.retentionExpiresAt);

    const handleVerify = async () => {
        if (!onVerifyIntegrity) return;
        setVerifying(true);
        setVerifyResult(null);
        try {
            const result = await onVerifyIntegrity();
            setVerifyResult(result.isValid);
        } catch {
            setVerifyResult(false);
        }
        setVerifying(false);
    };

    const handleCopyHash = async () => {
        await navigator.clipboard.writeText(certificate.sha256Hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto"
        >
            {/* Certificate card */}
            <div className="rounded-xl border-2 border-violet-500/30 bg-gradient-to-b from-violet-950/40 to-zinc-950/80 overflow-hidden">
                {/* Top border accent */}
                <div className="h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center border-b border-white/5">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-violet-400" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
                            Certificat d&apos;Archivage Numérique
                        </h2>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                        DIGITALIUM.IO
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-3">
                    {/* Certificate number */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">N° Certificat</span>
                        <Badge
                            variant="outline"
                            className={`text-xs font-mono ${
                                isValid
                                    ? "border-emerald-500/30 text-emerald-400"
                                    : "border-red-500/30 text-red-400"
                            }`}
                        >
                            {certificate.certificateNumber}
                        </Badge>
                    </div>

                    {/* Document */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Document</span>
                        <span className="text-xs text-zinc-200 font-medium text-right max-w-[60%] truncate">
                            {certificate.documentTitle}
                        </span>
                    </div>

                    {/* SHA-256 */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">Hash SHA-256</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-emerald-400 truncate">
                                {hashShort}
                            </span>
                            <button
                                onClick={handleCopyHash}
                                className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/5 transition-colors"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                    <Copy className="h-3 w-3 text-zinc-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Archived date */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Archivé le</span>
                        <span className="text-xs text-zinc-300">
                            {formatDateTime(certificate.archivedAt)}
                        </span>
                    </div>

                    {/* Archived by */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Par</span>
                        <span className="text-xs text-zinc-300">{certificate.archivedBy}</span>
                    </div>

                    {/* Organization */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Organisation</span>
                        <span className="text-xs text-zinc-300">{certificate.organization}</span>
                    </div>

                    {/* Retention */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Rétention</span>
                        <span className="text-xs text-zinc-300">
                            {certificate.retentionYears} ans (jusqu&apos;au {expiresDate})
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/5 pt-3">
                        {/* Status */}
                        <div className="flex items-center justify-center gap-2">
                            {isValid ? (
                                <>
                                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm font-semibold text-emerald-400">
                                        INTÉGRITÉ VÉRIFIÉE
                                    </span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="h-5 w-5 text-red-400" />
                                    <span className="text-sm font-semibold text-red-400">
                                        CERTIFICAT RÉVOQUÉ
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Verify result */}
                        {verifyResult !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-3 p-2.5 rounded-lg text-center ${
                                    verifyResult
                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                        : "bg-red-500/10 border border-red-500/20"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {verifyResult ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span className="text-xs font-medium text-emerald-400">
                                                Intégrité confirmée — le fichier n&apos;a pas été modifié
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-red-400" />
                                            <span className="text-xs font-medium text-red-400">
                                                ALERTE : Le fichier a été modifié !
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-white/5 flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={onDownloadPDF}
                        className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                    >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Télécharger le certificat
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleVerify}
                        disabled={verifying}
                        className="text-xs border-white/10"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Vérification…
                            </>
                        ) : (
                            <>
                                <Shield className="h-3.5 w-3.5 mr-1.5" />
                                Vérifier l&apos;intégrité
                            </>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-white/10"
                    >
                        <QrCode className="h-3.5 w-3.5 mr-1.5" />
                        QR Code
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
