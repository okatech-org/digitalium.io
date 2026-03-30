"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — LegalHoldManager
// Interface de gestion du gel juridique
// Utilise archives.applyLegalHold / releaseLegalHold
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import {
    ShieldAlert,
    Lock,
    Unlock,
    Loader2,
    Clock,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// ─── Helpers ──────────────────────────────────

function formatDuration(ms: number): string {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (days < 1) return "Moins d'un jour";
    if (days < 30) return `${days} jour${days > 1 ? "s" : ""}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} mois`;
    const years = Math.floor(months / 12);
    return `${years} an${years > 1 ? "s" : ""}`;
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Component ──────────────────────────────────

export default function LegalHoldManager() {
    const { user } = useAuth();
    const { convexOrgId } = useConvexOrgId();

    // List archives on hold
    const onHoldArchives = useQuery(
        api.archives.listOnHold,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // All archives (for applying hold to new ones)
    const allArchives = useQuery(
        api.archives.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // Mutations
    const applyHold = useMutation(api.archives.applyLegalHold);
    const releaseHold = useMutation(api.archives.releaseLegalHold);

    // Dialog state
    const [showApplyDialog, setShowApplyDialog] = useState(false);
    const [showReleaseDialog, setShowReleaseDialog] = useState(false);
    const [selectedArchiveId, setSelectedArchiveId] = useState<Id<"archives"> | null>(null);
    const [holdReason, setHoldReason] = useState("");
    const [releaseReason, setReleaseReason] = useState("");
    const [processing, setProcessing] = useState(false);

    // Eligible archives for hold (not already on hold, not destroyed)
    const eligibleArchives = (allArchives ?? []).filter(
        (a) => a.status !== "on_hold" && a.status !== "destroyed"
    );

    const handleApplyHold = async () => {
        if (!selectedArchiveId || !holdReason.trim() || !user) return;
        setProcessing(true);
        try {
            await applyHold({
                archiveId: selectedArchiveId,
                userId: user.uid,
                reason: holdReason.trim(),
            });
            setShowApplyDialog(false);
            setSelectedArchiveId(null);
            setHoldReason("");
        } finally {
            setProcessing(false);
        }
    };

    const handleReleaseHold = async () => {
        if (!selectedArchiveId || !user) return;
        setProcessing(true);
        try {
            await releaseHold({
                archiveId: selectedArchiveId,
                userId: user.uid,
                releaseReason: releaseReason.trim() || undefined,
            });
            setShowReleaseDialog(false);
            setSelectedArchiveId(null);
            setReleaseReason("");
        } finally {
            setProcessing(false);
        }
    };

    const now = Date.now();

    if (onHoldArchives === undefined) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white/80">
                        Gel juridique
                    </h3>
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs">
                        {onHoldArchives.length} en gel
                    </Badge>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowApplyDialog(true)}
                    className="h-7 text-xs gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/20 hover:bg-amber-500/25"
                >
                    <Lock className="h-3 w-3" />
                    Appliquer un gel
                </Button>
            </div>

            {/* Info */}
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    ⚖️ Le gel juridique suspend toute opération sur une archive
                    (destruction, modification, prolongation). Il est utilisé
                    lors de litiges, contrôles ou obligations légales.
                </p>
            </div>

            {/* List of frozen archives */}
            {onHoldArchives.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400/50" />
                    </div>
                    <p className="text-sm text-white/40">
                        Aucune archive en gel juridique
                    </p>
                    <p className="text-xs text-white/25 mt-1 max-w-xs">
                        Toutes vos archives suivent leur cycle de vie normal.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {onHoldArchives.map((archive) => {
                        const holdDuration = archive.legalHoldAppliedAt
                            ? now - archive.legalHoldAppliedAt
                            : 0;

                        return (
                            <div
                                key={archive._id}
                                className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-lg bg-amber-500/15">
                                        <Lock className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium text-white/80 truncate">
                                                {archive.title}
                                            </p>
                                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] px-1.5 py-0 h-4 shrink-0">
                                                En gel
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-white/35">
                                            {archive.fileName}
                                        </p>

                                        {/* Hold details */}
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-white/50">
                                            {archive.legalHoldAppliedAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Depuis {formatDate(archive.legalHoldAppliedAt)}
                                                </span>
                                            )}
                                            {holdDuration > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3 text-amber-400/50" />
                                                    Durée: {formatDuration(holdDuration)}
                                                </span>
                                            )}
                                            {archive.legalHoldAppliedBy && (
                                                <span>
                                                    Par: {archive.legalHoldAppliedBy}
                                                </span>
                                            )}
                                        </div>
                                        {archive.legalHoldReason && (
                                            <p className="text-xs text-amber-300/50 mt-1.5 italic">
                                                « {archive.legalHoldReason} »
                                            </p>
                                        )}
                                    </div>

                                    {/* Release button */}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setSelectedArchiveId(archive._id);
                                            setShowReleaseDialog(true);
                                        }}
                                        className="h-7 text-[11px] gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
                                    >
                                        <Unlock className="h-3 w-3" />
                                        Lever
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Apply Hold Dialog */}
            <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-amber-400" />
                            Appliquer un gel juridique
                        </DialogTitle>
                        <DialogDescription>
                            Sélectionnez une archive et indiquez le motif du gel.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Archive selection */}
                        <div>
                            <label className="text-xs font-medium text-white/50 mb-1.5 block">
                                Archive à geler *
                            </label>
                            <select
                                value={selectedArchiveId ?? ""}
                                onChange={(e) =>
                                    setSelectedArchiveId(
                                        e.target.value as Id<"archives">
                                    )
                                }
                                title="Archive à geler"
                                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/30 text-white/80"
                            >
                                <option value="">Sélectionner une archive…</option>
                                {eligibleArchives.map((a) => (
                                    <option key={a._id} value={a._id}>
                                        {a.title} ({a.fileName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="text-xs font-medium text-white/50 mb-1.5 block">
                                Motif du gel *
                            </label>
                            <textarea
                                value={holdReason}
                                onChange={(e) => setHoldReason(e.target.value)}
                                placeholder="Ex: Litige commercial en cours, contrôle fiscal..."
                                rows={3}
                                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/30 placeholder:text-zinc-600 resize-none text-white/80"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowApplyDialog(false)}
                            className="text-white/50"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleApplyHold}
                            disabled={processing || !selectedArchiveId || !holdReason.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                        >
                            {processing && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            <Lock className="h-4 w-4" />
                            Appliquer le gel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Release Hold Dialog */}
            <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Unlock className="h-5 w-5 text-emerald-400" />
                            Lever le gel juridique
                        </DialogTitle>
                        <DialogDescription>
                            L&apos;archive retrouvera son statut précédent.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <p className="text-[11px] text-amber-300/80">
                                ⚠️ Assurez-vous que les obligations légales
                                justifiant le gel sont levées.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-white/50 mb-1.5 block">
                                Motif de levée (optionnel)
                            </label>
                            <textarea
                                value={releaseReason}
                                onChange={(e) => setReleaseReason(e.target.value)}
                                placeholder="Ex: Fin du litige, décision de justice rendue..."
                                rows={2}
                                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/30 placeholder:text-zinc-600 resize-none text-white/80"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowReleaseDialog(false)}
                            className="text-white/50"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleReleaseHold}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            {processing && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            <Unlock className="h-4 w-4" />
                            Lever le gel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
