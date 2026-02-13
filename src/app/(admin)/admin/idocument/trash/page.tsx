// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Corbeille
// Dossiers et fichiers supprimés
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Trash2,
    FolderOpen,
    FileText,
    File,
    Image as ImageIcon,
    RotateCcw,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Mock data ──────────────────────────── */

const TRASHED_ITEMS = [
    { id: "1", name: "Ancien dossier brouillons", type: "folder" as const, fileCount: 3, deletedBy: "Marie Nzé", deletedAt: "il y a 2j", expiresIn: "28 jours" },
    { id: "2", name: "note_interne_v1.pdf", type: "pdf" as const, size: "1.2 MB", deletedBy: "Patrick Obiang", deletedAt: "il y a 5j", expiresIn: "25 jours" },
    { id: "3", name: "facture_brouillon.docx", type: "docx" as const, size: "450 KB", deletedBy: "Alice Ndong", deletedAt: "il y a 1 sem", expiresIn: "23 jours" },
    { id: "4", name: "photo_reunion.jpg", type: "image" as const, size: "3.4 MB", deletedBy: "Jean Moussavou", deletedAt: "il y a 2 sem", expiresIn: "16 jours" },
    { id: "5", name: "Dossier test import", type: "folder" as const, fileCount: 0, deletedBy: "Marie Nzé", deletedAt: "il y a 3 sem", expiresIn: "7 jours" },
];

function getItemIcon(type: string) {
    switch (type) {
        case "folder": return <FolderOpen className="h-4 w-4 text-violet-400" />;
        case "pdf": return <FileText className="h-4 w-4 text-red-400" />;
        case "image": return <ImageIcon className="h-4 w-4 text-blue-400" />;
        case "docx": return <File className="h-4 w-4 text-blue-500" />;
        default: return <File className="h-4 w-4 text-zinc-400" />;
    }
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function TrashPage() {
    const [items] = useState(TRASHED_ITEMS);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trash2 className="h-6 w-6 text-red-400" />
                        Corbeille
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {items.length} éléments supprimés · Suppression automatique après 30 jours
                    </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs text-red-400 border-red-500/20 hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Vider la corbeille
                </Button>
            </motion.div>

            {/* Warning */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-muted-foreground">
                    Les éléments dans la corbeille seront définitivement supprimés après 30 jours.
                    Restaurez-les avant l&apos;expiration pour les récupérer.
                </p>
            </motion.div>

            {/* Items list */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="space-y-0">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    {getItemIcon(item.type)}
                                </div>
                                <div>
                                    <p className="text-xs font-medium">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {item.type === "folder" ? `${item.fileCount} fichiers` : item.size}
                                        {" · "}Supprimé par {item.deletedBy} · {item.deletedAt}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-muted-foreground gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {item.expiresIn}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-violet-400 hover:bg-violet-500/10 gap-1.5 opacity-0 group-hover:opacity-100"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Restaurer
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {items.length === 0 && (
                <motion.div variants={fadeUp} className="text-center py-16">
                    <Trash2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">La corbeille est vide</p>
                </motion.div>
            )}
        </motion.div>
    );
}
