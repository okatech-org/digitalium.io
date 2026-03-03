"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Corbeille (Trash) — Connecté Convex
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2, FileText, RotateCcw, XCircle, Search, AlertTriangle,
    CheckCircle2, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

// ─── Helpers ────────────────────────────────────────────────────

function formatTimeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}

function formatSize(bytes?: number): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getDaysRemaining(trashedAt?: number): number {
    if (!trashedAt) return 30;
    const elapsed = Date.now() - trashedAt;
    return Math.max(0, 30 - Math.floor(elapsed / 86400000));
}

const STATUS_LABELS: Record<string, string> = {
    draft: "Brouillon",
    review: "En révision",
    approved: "Approuvé",
    archived: "Archivé",
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DocumentTrashPage() {
    // ─── Convex data ─────────────────────────
    const trashedDocs = useQuery(api.documents.listTrashed, {});
    const restoreMut = useMutation(api.documents.restore);
    const permanentDeleteMut = useMutation(api.documents.permanentDelete);

    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showEmptyDialog, setShowEmptyDialog] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    const items = trashedDocs ?? [];

    const filtered = useMemo(() => {
        if (!search) return items;
        const q = search.toLowerCase();
        return items.filter(
            (d) =>
                d.title.toLowerCase().includes(q) ||
                (d.trashedBy && d.trashedBy.toLowerCase().includes(q))
        );
    }, [items, search]);

    const toggleSelect = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelected((prev) =>
            prev.size === filtered.length ? new Set() : new Set(filtered.map((d) => d._id))
        );
    }, [filtered]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleRestore = useCallback(
        async (id: string) => {
            setLoadingIds((prev) => new Set(prev).add(id));
            try {
                await restoreMut({ id: id as Id<"documents"> });
                setSelected((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                showToast("Document restauré avec succès");
            } catch (err) {
                console.error("[Trash] Restore error:", err);
                showToast("Erreur lors de la restauration");
            }
            setLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        },
        [restoreMut]
    );

    const handleRestoreSelected = useCallback(async () => {
        const ids = Array.from(selected);
        for (const id of ids) {
            try {
                await restoreMut({ id: id as Id<"documents"> });
            } catch (err) {
                console.error("[Trash] Bulk restore error:", err);
            }
        }
        setSelected(new Set());
        showToast(`${ids.length} document(s) restauré(s)`);
    }, [selected, restoreMut]);

    const handleDeletePermanent = useCallback(
        async (id: string) => {
            setLoadingIds((prev) => new Set(prev).add(id));
            try {
                await permanentDeleteMut({ id: id as Id<"documents"> });
                setSelected((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                showToast("Document supprimé définitivement");
            } catch (err) {
                console.error("[Trash] Delete error:", err);
                showToast("Erreur lors de la suppression");
            }
            setLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        },
        [permanentDeleteMut]
    );

    const handleEmptyTrash = useCallback(async () => {
        setShowEmptyDialog(false);
        for (const doc of items) {
            try {
                await permanentDeleteMut({ id: doc._id });
            } catch (err) {
                console.error("[Trash] Empty error:", err);
            }
        }
        setSelected(new Set());
        showToast("Corbeille vidée");
    }, [items, permanentDeleteMut]);

    // ─── Loading state ──────────────────────────
    if (trashedDocs === undefined) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement de la corbeille…</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Trash2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Corbeille</h1>
                        <p className="text-sm text-muted-foreground">
                            {items.length} élément{items.length > 1 ? "s" : ""} · Suppression auto après 30 jours
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                    onClick={() => setShowEmptyDialog(true)}
                    disabled={items.length === 0}
                >
                    <XCircle className="h-3.5 w-3.5" /> Vider la corbeille
                </Button>
            </motion.div>

            {/* Toolbar */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher dans la corbeille…"
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-white/5 border-white/10"
                                />
                            </div>

                            {/* Bulk actions when selected */}
                            <AnimatePresence>
                                {selected.size > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="ml-auto flex items-center gap-2"
                                    >
                                        <span className="text-[11px] text-violet-400 font-medium">
                                            {selected.size} sélectionné(s)
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[11px] gap-1 text-emerald-400 hover:bg-emerald-500/10"
                                            onClick={handleRestoreSelected}
                                        >
                                            <RotateCcw className="h-3 w-3" /> Restaurer
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Toast */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-500/15 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-emerald-400"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trash items */}
            <Card className="glass border-white/5">
                <CardContent className="p-0">
                    {filtered.length > 0 ? (
                        <div>
                            {/* Header row */}
                            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 text-[11px] text-muted-foreground">
                                <Checkbox
                                    checked={selected.size === filtered.length && filtered.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <span className="flex-1">Document</span>
                                <span className="w-28 hidden sm:block">Supprimé par</span>
                                <span className="w-24 hidden md:block">Taille</span>
                                <span className="w-28 hidden lg:block">Expire dans</span>
                                <span className="w-24 text-right">Actions</span>
                            </div>

                            {/* Items */}
                            <AnimatePresence>
                                {filtered.map((doc) => {
                                    const isSelected = selected.has(doc._id);
                                    const daysRemaining = getDaysRemaining(doc.trashedAt);
                                    const isUrgent = daysRemaining <= 10;
                                    const isLoading = loadingIds.has(doc._id);
                                    return (
                                        <motion.div
                                            key={doc._id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                            className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] group transition-colors ${isSelected ? "bg-violet-500/5" : ""
                                                }`}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(doc._id)}
                                                className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                            />

                                            {/* Document info */}
                                            <div className="flex-1 flex items-center gap-2.5 min-w-0">
                                                <FileText className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground truncate">
                                                        {doc.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/60">
                                                        {doc.trashedAt ? formatTimeAgo(doc.trashedAt) : "—"} · Statut: {STATUS_LABELS[doc.previousStatus ?? "draft"] ?? doc.previousStatus}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="w-28 text-[11px] text-muted-foreground hidden sm:block truncate">
                                                {doc.trashedBy ?? doc.createdBy}
                                            </span>

                                            <span className="w-24 text-[11px] text-muted-foreground font-mono hidden md:block">
                                                {formatSize(doc.fileSize)}
                                            </span>

                                            <div className="w-28 hidden lg:block">
                                                <Badge
                                                    className={`text-[9px] h-5 border-0 ${isUrgent
                                                        ? "bg-red-500/15 text-red-400"
                                                        : "bg-zinc-500/15 text-zinc-400"
                                                        }`}
                                                >
                                                    {isUrgent && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                                                    {daysRemaining} jours
                                                </Badge>
                                            </div>

                                            {/* Actions */}
                                            <div className="w-24 flex items-center gap-1 justify-end">
                                                {isLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-[10px] text-emerald-400 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 gap-1 transition-opacity"
                                                            onClick={() => handleRestore(doc._id)}
                                                        >
                                                            <RotateCcw className="h-3 w-3" /> Restaurer
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDeletePermanent(doc._id)}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-16 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                                <Trash2 className="h-8 w-8 text-red-400/60" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Corbeille vide</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Les documents supprimés apparaîtront ici pendant 30 jours.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Empty trash confirmation */}
            <Dialog open={showEmptyDialog} onOpenChange={setShowEmptyDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Vider la corbeille
                        </DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Tous les {items.length} document(s) seront
                            définitivement supprimés et ne pourront plus être récupérés.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEmptyDialog(false)} className="border-white/10">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleEmptyTrash}
                            className="bg-red-600 hover:bg-red-700 text-white border-0 gap-1.5"
                        >
                            <Trash2 className="h-4 w-4" /> Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
