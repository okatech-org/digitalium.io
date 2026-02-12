"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Corbeille (Trash)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2, FileText, RotateCcw, XCircle, Search, Clock, AlertTriangle,
    CheckCircle2,
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

// ─── Types ──────────────────────────────────────────────────────

interface TrashedDoc {
    id: string;
    title: string;
    deletedBy: string;
    deletedAt: string;
    daysRemaining: number;
    size: string;
    originalStatus: string;
}

// ─── Demo data ──────────────────────────────────────────────────

const INITIAL_TRASH: TrashedDoc[] = [
    {
        id: "tr-1",
        title: "Ancien organigramme 2025 — ASCOMA Gabon",
        deletedBy: "Marie Nzé", deletedAt: "Il y a 2 jours",
        daysRemaining: 28, size: "1.2 MB", originalStatus: "Approuvé",
    },
    {
        id: "tr-2",
        title: "Brouillon contrat prestation v1 — Gabon Télécom",
        deletedBy: "Patrick Obiang", deletedAt: "Il y a 5 jours",
        daysRemaining: 25, size: "456 KB", originalStatus: "Brouillon",
    },
    {
        id: "tr-3",
        title: "Notes réunion SEEG — version obsolète",
        deletedBy: "Aimée Gondjout", deletedAt: "Il y a 8 jours",
        daysRemaining: 22, size: "234 KB", originalStatus: "Brouillon",
    },
    {
        id: "tr-4",
        title: "Rapport Q3 2025 — version remplacée",
        deletedBy: "Claude Mboumba", deletedAt: "Il y a 12 jours",
        daysRemaining: 18, size: "3.1 MB", originalStatus: "Archivé",
    },
    {
        id: "tr-5",
        title: "Devis prestation audit — doublon",
        deletedBy: "Daniel Nguema", deletedAt: "Il y a 20 jours",
        daysRemaining: 10, size: "890 KB", originalStatus: "En révision",
    },
];

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DocumentTrashPage() {
    const [items, setItems] = useState<TrashedDoc[]>(INITIAL_TRASH);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showEmptyDialog, setShowEmptyDialog] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const filtered = useMemo(() => {
        if (!search) return items;
        const q = search.toLowerCase();
        return items.filter(
            (d) => d.title.toLowerCase().includes(q) || d.deletedBy.toLowerCase().includes(q)
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
            prev.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id))
        );
    }, [filtered]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleRestore = useCallback(
        (id: string) => {
            const doc = items.find((d) => d.id === id);
            setItems((prev) => prev.filter((d) => d.id !== id));
            setSelected((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            showToast(`« ${doc?.title} » restauré avec succès`);
        },
        [items]
    );

    const handleRestoreSelected = useCallback(() => {
        const count = selected.size;
        setItems((prev) => prev.filter((d) => !selected.has(d.id)));
        setSelected(new Set());
        showToast(`${count} document(s) restauré(s)`);
    }, [selected]);

    const handleDeletePermanent = useCallback(
        (id: string) => {
            setItems((prev) => prev.filter((d) => d.id !== id));
            setSelected((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            showToast("Document supprimé définitivement");
        },
        []
    );

    const handleEmptyTrash = useCallback(() => {
        setItems([]);
        setSelected(new Set());
        setShowEmptyDialog(false);
        showToast("Corbeille vidée");
    }, []);

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
                                    const isSelected = selected.has(doc.id);
                                    const isUrgent = doc.daysRemaining <= 10;
                                    return (
                                        <motion.div
                                            key={doc.id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                            className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] group transition-colors ${isSelected ? "bg-violet-500/5" : ""
                                                }`}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(doc.id)}
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
                                                        {doc.deletedAt} · Statut: {doc.originalStatus}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="w-28 text-[11px] text-muted-foreground hidden sm:block truncate">
                                                {doc.deletedBy}
                                            </span>

                                            <span className="w-24 text-[11px] text-muted-foreground font-mono hidden md:block">
                                                {doc.size}
                                            </span>

                                            <div className="w-28 hidden lg:block">
                                                <Badge
                                                    className={`text-[9px] h-5 border-0 ${isUrgent
                                                            ? "bg-red-500/15 text-red-400"
                                                            : "bg-zinc-500/15 text-zinc-400"
                                                        }`}
                                                >
                                                    {isUrgent && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                                                    {doc.daysRemaining} jours
                                                </Badge>
                                            </div>

                                            {/* Actions */}
                                            <div className="w-24 flex items-center gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] text-emerald-400 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 gap-1 transition-opacity"
                                                    onClick={() => handleRestore(doc.id)}
                                                >
                                                    <RotateCcw className="h-3 w-3" /> Restaurer
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeletePermanent(doc.id)}
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                </Button>
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
