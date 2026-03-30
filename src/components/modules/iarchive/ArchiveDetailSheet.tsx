"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: ArchiveDetailSheet
// Connected to Convex — loads archive by ID
// Lifecycle timeline, extend retention, request destruction
// ═══════════════════════════════════════════════

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
    FileText,
    Hash,
    Calendar,
    User,
    Shield,
    Clock,
    Download,
    HardDrive,
    Tag,
    Lock,
    ScanText,
    History,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    TimerReset,
    Trash2,
    Loader2,
    ArrowRight,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
    active: { label: "Actif", icon: CheckCircle2, className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    semi_active: { label: "Semi-actif", icon: Clock, className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    archived: { label: "Archivé", icon: Lock, className: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    expired: { label: "Expiré", icon: XCircle, className: "text-red-400 bg-red-500/10 border-red-500/20" },
    on_hold: { label: "Suspendu", icon: AlertTriangle, className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    destroyed: { label: "Détruit", icon: XCircle, className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
};

// ─── Section Components ─────────────────────────

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

// ─── Lifecycle timeline step ────────────────────

interface LifecyclePhase {
    label: string;
    status: "done" | "current" | "future";
    date?: string;
}

function LifecycleTimeline({ phases }: { phases: LifecyclePhase[] }) {
    return (
        <div className="flex items-center gap-1">
            {phases.map((phase, i) => (
                <React.Fragment key={i}>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium ${phase.status === "done" ? "bg-emerald-500/10 text-emerald-400" :
                        phase.status === "current" ? "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20" :
                            "bg-white/5 text-zinc-500"
                        }`}>
                        {phase.status === "done" && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {phase.status === "current" && <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />}
                        <span>{phase.label}</span>
                        {phase.date && <span className="text-[10px] opacity-70">({phase.date})</span>}
                    </div>
                    {i < phases.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-zinc-600 shrink-0" />}
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── Props ──────────────────────────────────────

interface Props {
    open: boolean;
    onClose: () => void;
    archiveId: Id<"archives"> | null;
    onDownload?: () => void;
}

// ─── Component ──────────────────────────────────

export default function ArchiveDetailSheet({ open, onClose, archiveId, onDownload }: Props) {
    const { user } = useAuth();
    const userName = user?.displayName || user?.email?.split("@")[0] || "Utilisateur";

    const [activeTab, setActiveTab] = useState<"info" | "ocr" | "history">("info");
    const [extending, setExtending] = useState(false);
    const [extendYears, setExtendYears] = useState(2);
    const [extendReason, setExtendReason] = useState("");
    const [destroying, setDestroying] = useState(false);
    const [destroyReason, setDestroyReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Convex queries
    const archive = useQuery(
        api.archives.get,
        archiveId ? { id: archiveId } : "skip"
    );
    const certificate = useQuery(
        api.archives.getCertificate,
        archiveId ? { archiveId } : "skip"
    );
    const destructionCert = useQuery(
        api.archives.getDestructionCertificate,
        archiveId ? { archiveId } : "skip"
    );
    const auditLogs = useQuery(
        api.auditLogs.listByResource,
        archiveId ? { resourceType: "archive" as const, resourceId: archiveId } : "skip"
    );

    // Mutations
    const extendRetention = useMutation(api.archives.extendRetention);
    const requestDestruction = useMutation(api.archives.requestDestruction);

    // ─── Actions ────────────────────────────────
    const handleExtend = useCallback(async () => {
        if (!archiveId || !extendReason.trim()) return;
        setActionLoading(true);
        try {
            await extendRetention({
                archiveId,
                additionalYears: extendYears,
                userId: userName,
                reason: extendReason,
            });
            setExtending(false);
            setExtendReason("");
        } catch (err) {
            console.error("Extend error:", err);
        } finally {
            setActionLoading(false);
        }
    }, [archiveId, extendYears, extendReason, extendRetention]);

    const handleDestroy = useCallback(async () => {
        if (!archiveId || !destroyReason.trim()) return;
        setActionLoading(true);
        try {
            await requestDestruction({
                archiveId,
                userId: userName,
                reason: destroyReason,
                method: "manual_request" as const,
            });
            setDestroying(false);
            setDestroyReason("");
        } catch (err) {
            console.error("Destroy error:", err);
        } finally {
            setActionLoading(false);
        }
    }, [archiveId, destroyReason, requestDestruction]);

    if (!archive) {
        return (
            <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
                <SheetContent className="w-full sm:max-w-lg bg-zinc-950 border-white/5">
                    <SheetTitle className="sr-only">Chargement</SheetTitle>
                    <div className="flex items-center justify-center h-full">
                        {archiveId ? (
                            <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                        ) : (
                            <p className="text-sm text-zinc-500">Sélectionnez une archive</p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    const statusCfg = STATUS_CONFIG[archive.status] ?? STATUS_CONFIG.active;
    const StatusIcon = statusCfg.icon;
    const daysLeft = archive.retentionExpiresAt ? daysUntil(archive.retentionExpiresAt) : Infinity;
    const canExtend = ["active", "semi_active", "archived", "expired"].includes(archive.status);
    const canDestroy = ["archived", "expired"].includes(archive.status) && !archive.isVault;

    // Build lifecycle phases
    const lifecyclePhases: LifecyclePhase[] = [];
    const now = Date.now();
    if (archive.activeUntil) {
        lifecyclePhases.push({
            label: "Actif",
            status: archive.lifecycleState === "active" ? "current" : now > archive.activeUntil ? "done" : "future",
            date: formatDate(archive.activeUntil),
        });
    }
    if (archive.semiActiveUntil) {
        lifecyclePhases.push({
            label: "Semi-actif",
            status: archive.lifecycleState === "semi_active" ? "current" : now > archive.semiActiveUntil ? "done" : "future",
            date: formatDate(archive.semiActiveUntil),
        });
    }
    lifecyclePhases.push({
        label: archive.isVault ? "Permanent" : "Archivé",
        status: archive.lifecycleState === "archived" ? "current" : archive.status === "destroyed" ? "done" : "future",
        date: archive.retentionExpiresAt ? formatDate(archive.retentionExpiresAt) : "∞",
    });
    if (archive.status === "destroyed") {
        lifecyclePhases.push({ label: "Détruit", status: "current" });
    }

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
                                {certificate?.certificateNumber && (
                                    <Badge variant="outline" className="text-[9px] h-5 border-violet-500/20 text-violet-400">
                                        {certificate.certificateNumber}
                                    </Badge>
                                )}
                                {archive.sourceType && (
                                    <Badge variant="outline" className="text-[9px] h-5 border-white/10 text-zinc-500">
                                        {archive.sourceType}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10" onClick={onDownload}>
                            <Download className="h-3 w-3 mr-1" />Télécharger
                        </Button>
                        {canExtend && (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10" onClick={() => setExtending(!extending)}>
                                <TimerReset className="h-3 w-3 mr-1" />Prolonger
                            </Button>
                        )}
                        {canDestroy && (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => setDestroying(!destroying)}>
                                <Trash2 className="h-3 w-3 mr-1" />Détruire
                            </Button>
                        )}
                    </div>

                    {/* Extend form */}
                    {extending && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 space-y-2">
                            <div className="flex items-center gap-2">
                                <select value={extendYears} onChange={(e) => setExtendYears(Number(e.target.value))} className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white">
                                    {[1, 2, 3, 5, 10].map((y) => <option key={y} value={y} className="bg-zinc-900">{y} an{y > 1 ? "s" : ""}</option>)}
                                </select>
                                <input type="text" value={extendReason} onChange={(e) => setExtendReason(e.target.value)} placeholder="Raison de la prolongation…" className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500/30 placeholder:text-zinc-600" />
                            </div>
                            <Button size="sm" className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700 text-white" onClick={handleExtend} disabled={actionLoading || !extendReason.trim()}>
                                {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <TimerReset className="h-3 w-3 mr-1" />}
                                Confirmer la prolongation
                            </Button>
                        </motion.div>
                    )}

                    {/* Destroy form */}
                    {destroying && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-2">
                            <p className="text-[10px] text-red-300">⚠️ La destruction est irréversible. Un certificat de destruction sera généré.</p>
                            <input type="text" value={destroyReason} onChange={(e) => setDestroyReason(e.target.value)} placeholder="Motif de destruction (obligatoire)…" className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-red-500/30 placeholder:text-zinc-600" />
                            <Button size="sm" className="h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white" onClick={handleDestroy} disabled={actionLoading || !destroyReason.trim()}>
                                {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                                Confirmer la destruction
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Lifecycle Timeline */}
                {lifecyclePhases.length > 0 && (
                    <div className="py-3 border-b border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Cycle de vie</span>
                        <LifecycleTimeline phases={lifecyclePhases} />
                    </div>
                )}

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
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] transition-all ${activeTab === tab.key
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
                                {archive.description && <DetailRow label="Description" value={archive.description} />}
                                <DetailRow label="Catégorie" value={archive.categorySlug} className="capitalize text-violet-300" />
                                {archive.tags && archive.tags.length > 0 && (
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] text-zinc-500 shrink-0">Tags</span>
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {archive.tags.map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-[10px] h-4 border-white/10 text-zinc-400">
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
                                <DetailRow label="Créé le" value={formatDate(archive.createdAt)} />
                            </DetailSection>

                            <DetailSection icon={Shield} title="Intégrité — Double Hash">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] text-zinc-500 shrink-0">SHA-256 (fichier)</span>
                                        <span className="text-[10px] font-mono text-emerald-400 text-right break-all">
                                            {archive.sha256Hash}
                                        </span>
                                    </div>
                                    {archive.contentHash && (
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[11px] text-zinc-500 shrink-0">SHA-256 (JSON)</span>
                                            <span className="text-[10px] font-mono text-cyan-400 text-right break-all">
                                                {archive.contentHash}
                                            </span>
                                        </div>
                                    )}
                                    {archive.pdfHash && (
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[11px] text-zinc-500 shrink-0">SHA-256 (PDF)</span>
                                            <span className="text-[10px] font-mono text-violet-400 text-right break-all">
                                                {archive.pdfHash}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </DetailSection>

                            <DetailSection icon={Clock} title="Rétention">
                                <DetailRow label="Durée totale" value={archive.isVault ? "∞ Perpétuel" : `${archive.retentionYears ?? "—"} ans`} />
                                {archive.retentionExpiresAt && (
                                    <>
                                        <DetailRow label="Expire le" value={formatDate(archive.retentionExpiresAt)} />
                                        <DetailRow
                                            label="Jours restants"
                                            value={`${daysLeft} jours`}
                                            className={daysLeft < 30 ? "text-red-400 font-medium" : daysLeft < 90 ? "text-amber-400" : "text-zinc-300"}
                                        />
                                        <div className="pt-1">
                                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${daysLeft < 30 ? "bg-red-500" : daysLeft < 90 ? "bg-amber-500" : "bg-emerald-500"}`}
                                                    style={{ width: `${Math.min(100, Math.max(2, (1 - daysLeft / ((archive.retentionYears ?? 10) * 365)) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </DetailSection>

                            <DetailSection icon={User} title="Émetteur">
                                <DetailRow label="Archivé par" value={archive.uploadedBy} />
                                {archive.metadata?.confidentiality && (
                                    <DetailRow label="Confidentialité" value={archive.metadata.confidentiality} className="capitalize" />
                                )}
                                {archive.sourceType && (
                                    <DetailRow label="Source" value={archive.sourceType} className="font-mono text-[10px] text-zinc-400" />
                                )}
                            </DetailSection>

                            {/* Destruction certificate */}
                            {archive.status === "destroyed" && destructionCert && (
                                <DetailSection icon={Trash2} title="Certificat de destruction">
                                    <DetailRow label="N° certificat" value={destructionCert.certificateNumber ?? "—"} className="font-mono text-red-400" />
                                    <DetailRow label="Détruit par" value={destructionCert.destroyedBy} />
                                    <DetailRow label="Motif" value={destructionCert.destructionReason} />
                                    <DetailRow label="Date" value={formatDate(destructionCert.destroyedAt)} />
                                </DetailSection>
                            )}
                        </>
                    )}

                    {activeTab === "ocr" && (
                        <div className="space-y-3">
                            <p className="text-[11px] text-zinc-400">
                                Texte extrait automatiquement du document par OCR.
                            </p>
                            <div className="p-6 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                                <ScanText className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">
                                    Aucun texte OCR extrait pour ce document.
                                </p>
                                <Button size="sm" variant="outline" className="mt-3 text-[10px] border-white/10">
                                    <ScanText className="h-3 w-3 mr-1" />
                                    Lancer l&apos;extraction OCR
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-2">
                            <p className="text-[11px] text-zinc-400 mb-3">
                                Journal des actions et vérifications.
                            </p>
                            {!auditLogs ? (
                                <div className="p-6 text-center">
                                    <Loader2 className="h-6 w-6 text-violet-400 animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-zinc-500">Chargement de l&apos;historique…</p>
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <div className="p-6 text-center">
                                    <History className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                                    <p className="text-xs text-zinc-500">Aucun événement enregistré.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {auditLogs.map((log) => {
                                        const actionLabels: Record<string, string> = {
                                            "archive.created": "Archive créée",
                                            "archive.retention_extended": "Rétention prolongée",
                                            "archive.destruction_requested": "Destruction demandée",
                                            "archive.destroyed": "Archive détruite",
                                            "archive.expired": "Archive expirée",
                                            "archive.auto_destroyed": "Auto-destruction",
                                            "archive.integrity_verified": "Intégrité vérifiée",
                                            "document.archive": "Document archivé",
                                        };
                                        const label = actionLabels[log.action] ?? log.action;
                                        return (
                                            <div key={log._id} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                                <div className="h-5 w-5 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <History className="h-2.5 w-2.5 text-violet-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[11px] font-medium text-zinc-200">{label}</span>
                                                        <span className="text-[9px] text-zinc-500 shrink-0">
                                                            {formatDate(log.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">
                                                        Par {log.userId}
                                                        {log.details?.reason && ` — ${log.details.reason}`}
                                                        {log.details?.categorySlug && ` (${log.details.categorySlug})`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
