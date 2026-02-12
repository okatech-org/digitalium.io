"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Archive Certificate
// Printable certificate with SHA-256 integrity proof
// ═══════════════════════════════════════════════

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Shield,
    Hash,
    Calendar,
    FileText,
    Printer,
    Download,
    CheckCircle2,
} from "lucide-react";

interface ArchiveCertificateProps {
    open: boolean;
    onClose: () => void;
    certificate: {
        certificateNumber: string;
        documentTitle: string;
        category: string;
        sha256Hash: string;
        retentionYears: number;
        archivedAt: number;
        issuedBy: string;
        validUntil: number;
    } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
    fiscal: "Fiscal",
    social: "Social",
    legal: "Juridique",
    client: "Client",
    vault: "Coffre-fort",
};

export default function ArchiveCertificate({
    open,
    onClose,
    certificate,
}: ArchiveCertificateProps) {
    if (!certificate) return null;

    const formatDate = (ts: number) =>
        new Date(ts).toLocaleDateString("fr-GA", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    const handlePrint = () => {
        window.print();
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
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md overflow-hidden"
                    >
                        {/* Close button */}
                        <div className="flex justify-end mb-2 print:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Certificate card */}
                        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950/30 border border-violet-500/20 rounded-2xl p-6 shadow-2xl shadow-violet-500/5 print:bg-white print:border-zinc-300 print:shadow-none">
                            {/* Header ornament */}
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-violet-400" />
                                </div>
                            </div>

                            <h2 className="text-center text-sm font-bold tracking-wide uppercase text-violet-300/80 mb-1">
                                Certificat d&apos;Archivage
                            </h2>
                            <p className="text-center text-[10px] text-zinc-500 mb-5">
                                DIGITALIUM.IO — iArchive
                            </p>

                            {/* Certificate number */}
                            <div className="flex items-center justify-center mb-5">
                                <Badge
                                    variant="outline"
                                    className="text-xs px-3 py-1.5 border-violet-500/30 text-violet-300 bg-violet-500/5 font-mono"
                                >
                                    {certificate.certificateNumber}
                                </Badge>
                            </div>

                            {/* Info rows */}
                            <div className="space-y-3 mb-5">
                                <InfoRow
                                    icon={FileText}
                                    label="Document"
                                    value={certificate.documentTitle}
                                />
                                <InfoRow
                                    icon={Shield}
                                    label="Catégorie"
                                    value={
                                        CATEGORY_LABELS[
                                        certificate.category
                                        ] ?? certificate.category
                                    }
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Archivé le"
                                    value={formatDate(certificate.archivedAt)}
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Rétention"
                                    value={
                                        certificate.retentionYears >= 99
                                            ? "Permanent"
                                            : `${certificate.retentionYears} ans`
                                    }
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Valide jusqu'au"
                                    value={formatDate(certificate.validUntil)}
                                />
                                <InfoRow
                                    icon={CheckCircle2}
                                    label="Émis par"
                                    value={certificate.issuedBy}
                                />
                            </div>

                            {/* SHA-256 Hash */}
                            <div className="p-3 rounded-lg bg-black/20 border border-white/5 mb-5 print:bg-zinc-100 print:border-zinc-200">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Hash className="h-3 w-3 text-zinc-400" />
                                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
                                        Empreinte SHA-256
                                    </span>
                                </div>
                                <p className="text-[9px] font-mono text-emerald-400/80 break-all leading-relaxed print:text-emerald-700">
                                    {certificate.sha256Hash}
                                </p>
                            </div>

                            {/* Validity badge */}
                            <div className="flex items-center justify-center">
                                <Badge
                                    variant="outline"
                                    className="text-[10px] h-6 gap-1 border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Certificat valide
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-2 mt-3 print:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 border-white/10 text-zinc-300"
                                onClick={handlePrint}
                            >
                                <Printer className="h-3 w-3" />
                                Imprimer
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 border-white/10 text-zinc-300"
                                onClick={handlePrint}
                            >
                                <Download className="h-3 w-3" />
                                Télécharger PDF
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Helper ─────────────────────────────────────

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
                <p className="text-xs text-zinc-200 truncate print:text-zinc-800">
                    {value}
                </p>
            </div>
        </div>
    );
}
