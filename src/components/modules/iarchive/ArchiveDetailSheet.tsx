"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: ArchiveDetailSheet
// Detailed archive view with metadata, OCR, history
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    FileText,
    Hash,
    Calendar,
    User,
    Building2,
    Shield,
    Clock,
    Download,
    Eye,
    HardDrive,
    Tag,
    Lock,
    ScanText,
    History,
    CheckCircle2,
    AlertTriangle,
    XCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface ArchiveDetail {
    id: string;
    title: string;
    description?: string;
    category: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    sha256Hash: string;
    status: "active" | "expired" | "on_hold" | "destroyed";
    createdAt: number;
    uploadedBy: string;
    retentionYears: number;
    retentionExpiresAt: number;
    ocrText?: string;
    confidentiality?: string;
    certificateNumber?: string;
    lastIntegrityCheck?: number;
    integrityValid?: boolean;
    tags?: string[];
    auditLog?: { action: string; userId: string; createdAt: number; details?: string }[];
}

interface Props {
    open: boolean;
    onClose: () => void;
    archive: ArchiveDetail | null;
    onVerify?: () => void;
    onDownload?: () => void;
    onExtendRetention?: () => void;
}

// ─── Helpers ────────────────────────────────────

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function daysUntil(ts: number): number {
    return Math.max(0, Math.ceil((ts - Date.now()) / (24 * 3600 * 1000)));
}

// ─── Status mapping ─────────────────────────────

const STATUS_CONFIG = {
    active: { label: "Actif", icon: CheckCircle2, className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    expired: { label: "Expiré", icon: XCircle, className: "text-red-400 bg-red-500/10 border-red-500/20" },
    on_hold: { label: "Suspendu", icon: AlertTriangle, className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    destroyed: { label: "Détruit", icon: XCircle, className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
};

// ─── Section Component ──────────────────────────

function DetailSection({ icon: Icon, title, children }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{title}</span>
            </div>
            <div className="ml-5.5 space-y-1.5">{children}</div>
        </div>
    );
}

function DetailRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-zinc-500 shrink-0">{label}</span>
            <span className={`text-[11px] text-right ${className ?? "text-zinc-300"}`}>{value}</span>
        </div>
    );
}

// ─── Component ──────────────────────────────────

export default function ArchiveDetailSheet({ open, onClose, archive, onVerify, onDownload, onExtendRetention }: Props) {
    const [activeTab, setActiveTab] = useState<"info" | "ocr" | "history">("info");

    if (!archive) return null;

    const statusCfg = STATUS_CONFIG[archive.status];
    const StatusIcon = statusCfg.icon;
    const daysLeft = daysUntil(archive.retentionExpiresAt);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent className="w-full sm:max-w-lg bg-zinc-950 border-white/5 overflow-y-auto">
                <SheetTitle className="sr-only">Détails de l&apos;archive</SheetTitle>

                {/* Header */}
                <div className="pb-4 border-b border-white/5">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold truncate">{archive.title}</h2>
                            {archive.description && (
                                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{archive.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`text-[9px] h-5 ${statusCfg.className}`}>
                                    <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                    {statusCfg.label}
                                </Badge>
                                {archive.certificateNumber && (
                                    <Badge variant="outline" className="text-[9px] h-5 border-violet-500/20 text-violet-400">
                                        {archive.certificateNumber}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-3">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10" onClick={onDownload}>
                            <Download className="h-3 w-3 mr-1" />Télécharger
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10" onClick={onVerify}>
                            <Shield className="h-3 w-3 mr-1" />Vérifier
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10" onClick={onExtendRetention}>
                            <Clock className="h-3 w-3 mr-1" />Prolonger
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-white/5 py-2">
                    {[
                        { key: "info" as const, label: "Informations", icon: FileText },
                        { key: "ocr" as const, label: "Texte OCR", icon: ScanText },
                        { key: "history" as const, label: "Historique", icon: History },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] transition-all ${
                                activeTab === tab.key
                                    ? "bg-violet-500/10 text-violet-300"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            }`}
                        >
                            <tab.icon className="h-3 w-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="py-4 space-y-5">
                    {activeTab === "info" && (
                        <>
                            <DetailSection icon={FileText} title="Informations générales">
                                <DetailRow label="Titre" value={archive.title} />
                                {archive.description && (
                                    <DetailRow label="Description" value={archive.description} />
                                )}
                                <DetailRow label="Catégorie" value={archive.category} className="capitalize text-violet-300" />
                                {archive.tags && archive.tags.length > 0 && (
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] text-zinc-500 shrink-0">Tags</span>
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {archive.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-[8px] h-4 border-white/10 text-zinc-400">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </DetailSection>

                            <DetailSection icon={HardDrive} title="Fichier">
                                <DetailRow label="Nom" value={archive.fileName} />
                                <DetailRow label="Taille" value={formatFileSize(archive.fileSize)} />
                                <DetailRow label="Type MIME" value={archive.mimeType} className="font-mono text-zinc-400 text-[10px]" />
                                <DetailRow label="Uploadé le" value={formatDate(archive.createdAt)} />
                            </DetailSection>

                            <DetailSection icon={Shield} title="Intégrité">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-[11px] text-zinc-500 shrink-0">SHA-256</span>
                                    <span className="text-[10px] font-mono text-emerald-400 text-right break-all">
                                        {archive.sha256Hash}
                                    </span>
                                </div>
                                {archive.lastIntegrityCheck && (
                                    <DetailRow
                                        label="Dernier check"
                                        value={formatDate(archive.lastIntegrityCheck)}
                                    />
                                )}
                                <DetailRow
                                    label="Statut intégrité"
                                    value={
                                        archive.integrityValid !== undefined
                                            ? archive.integrityValid ? "Vérifié" : "Non vérifié"
                                            : "Non vérifié"
                                    }
                                    className={archive.integrityValid ? "text-emerald-400" : "text-zinc-500"}
                                />
                            </DetailSection>

                            <DetailSection icon={Clock} title="Rétention">
                                <DetailRow label="Durée" value={`${archive.retentionYears} ans`} />
                                <DetailRow label="Expire le" value={formatDate(archive.retentionExpiresAt)} />
                                <DetailRow
                                    label="Jours restants"
                                    value={`${daysLeft} jours`}
                                    className={daysLeft < 30 ? "text-amber-400 font-medium" : daysLeft < 90 ? "text-amber-400" : "text-zinc-300"}
                                />
                                {/* Progress bar */}
                                <div className="pt-1">
                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                daysLeft < 30
                                                    ? "bg-red-500"
                                                    : daysLeft < 90
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-500"
                                            }`}
                                            style={{
                                                width: `${Math.min(100, (1 - daysLeft / (archive.retentionYears * 365)) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </DetailSection>

                            <DetailSection icon={User} title="Émetteur">
                                <DetailRow label="Archivé par" value={archive.uploadedBy} />
                                {archive.confidentiality && (
                                    <DetailRow label="Confidentialité" value={archive.confidentiality} className="capitalize" />
                                )}
                            </DetailSection>
                        </>
                    )}

                    {activeTab === "ocr" && (
                        <div className="space-y-3">
                            <p className="text-[11px] text-zinc-400">
                                Texte extrait automatiquement du document par OCR.
                            </p>
                            {archive.ocrText ? (
                                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <pre className="text-[11px] text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                                        {archive.ocrText}
                                    </pre>
                                </div>
                            ) : (
                                <div className="p-6 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                                    <ScanText className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                                    <p className="text-xs text-zinc-500">
                                        Aucun texte OCR extrait pour ce document.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-3 text-[10px] border-white/10"
                                    >
                                        <ScanText className="h-3 w-3 mr-1" />
                                        Lancer l&apos;extraction OCR
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-2">
                            <p className="text-[11px] text-zinc-400 mb-3">
                                Journal des accès et vérifications.
                            </p>
                            {archive.auditLog && archive.auditLog.length > 0 ? (
                                archive.auditLog.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02]"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] text-zinc-300">{log.action}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-zinc-500">{log.userId}</span>
                                                <span className="text-[10px] text-zinc-600">·</span>
                                                <span className="text-[10px] text-zinc-500">
                                                    {formatDate(log.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-6 text-center">
                                    <History className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                                    <p className="text-xs text-zinc-500">Aucun historique disponible.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
