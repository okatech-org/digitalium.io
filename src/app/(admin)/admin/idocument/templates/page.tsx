// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Templates de dossiers
// Modèles de dossiers préconfigurés
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FileStack,
    Plus,
    FolderOpen,
    Lock,
    Globe,
    UsersRound,
    Copy,
    MoreVertical,
    Pencil,
    Trash2,
    FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Tag / Visibility colors ────────────── */

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
    fiscal: { bg: "bg-amber-500/15", text: "text-amber-400" },
    social: { bg: "bg-blue-500/15", text: "text-blue-400" },
    juridique: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    client: { bg: "bg-violet-500/15", text: "text-violet-400" },
    interne: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
};

const VIS_ICONS = {
    private: { icon: Lock, label: "Privé" },
    shared: { icon: Globe, label: "Partagé" },
    team: { icon: UsersRound, label: "Équipe" },
};

/* ─── Mock templates ─────────────────────── */

const MOCK_TEMPLATES = [
    {
        id: "t1",
        name: "Dossier Fiscal Standard",
        description: "Structure pour les déclarations fiscales annuelles avec archivage automatique",
        defaultTags: ["fiscal"],
        defaultVisibility: "shared" as const,
        subFolders: ["TVA", "IS/IR", "Justificatifs", "Bilans"],
        autoArchive: true,
        archiveCategory: "fiscal",
        usageCount: 12,
    },
    {
        id: "t2",
        name: "Dossier Social — Paie",
        description: "Organisation des bulletins de paie et documents sociaux mensuels",
        defaultTags: ["social"],
        defaultVisibility: "team" as const,
        subFolders: ["Bulletins", "CNSS", "Congés"],
        autoArchive: true,
        archiveCategory: "social",
        usageCount: 8,
    },
    {
        id: "t3",
        name: "Dossier Client",
        description: "Template pour les dossiers clients avec contrats et correspondances",
        defaultTags: ["client", "juridique"],
        defaultVisibility: "shared" as const,
        subFolders: ["Contrats", "Factures", "Correspondances"],
        autoArchive: false,
        archiveCategory: null,
        usageCount: 15,
    },
    {
        id: "t4",
        name: "Dossier Juridique — AG",
        description: "Structure pour les assemblées générales et PV de réunion",
        defaultTags: ["juridique"],
        defaultVisibility: "private" as const,
        subFolders: ["PV", "Résolutions", "Mandats"],
        autoArchive: true,
        archiveCategory: "juridique",
        usageCount: 4,
    },
    {
        id: "t5",
        name: "Projet Interne",
        description: "Template générique pour les projets internes de l'entreprise",
        defaultTags: ["interne"],
        defaultVisibility: "team" as const,
        subFolders: ["Documents", "Livrables", "Annexes"],
        autoArchive: false,
        archiveCategory: null,
        usageCount: 6,
    },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function TemplatesPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTags, setNewTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        setNewTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileStack className="h-6 w-6 text-violet-400" />
                        Templates de dossiers
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {MOCK_TEMPLATES.length} modèles préconfigurés
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau template
                </Button>
            </motion.div>

            {/* Templates grid */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {MOCK_TEMPLATES.map((tpl) => {
                    const vis = VIS_ICONS[tpl.defaultVisibility];
                    const VisIcon = vis.icon;
                    return (
                        <motion.div
                            key={tpl.id}
                            variants={fadeUp}
                            whileHover={{ y: -2 }}
                            className="glass-card rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-all group"
                        >
                            {/* Title row */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <FileStack className="h-4 w-4 text-violet-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{tpl.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{tpl.description}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0">
                                            <MoreVertical className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-xs gap-2"><Pencil className="h-3 w-3" /> Modifier</DropdownMenuItem>
                                        <DropdownMenuItem className="text-xs gap-2"><Copy className="h-3 w-3" /> Dupliquer</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-xs gap-2 text-red-400"><Trash2 className="h-3 w-3" /> Supprimer</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {tpl.defaultTags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className={`text-[9px] border-0 ${TAG_COLORS[tag]?.bg || "bg-zinc-500/15"} ${TAG_COLORS[tag]?.text || "text-zinc-400"}`}>
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Sub-folders preview */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {tpl.subFolders.map((sf) => (
                                    <span key={sf} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-muted-foreground">
                                        <FolderOpen className="h-2.5 w-2.5" />
                                        {sf}
                                    </span>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <VisIcon className="h-3 w-3" />
                                        {vis.label}
                                    </span>
                                    {tpl.autoArchive && (
                                        <Badge variant="secondary" className="text-[9px] border-0 bg-amber-500/10 text-amber-400">
                                            Auto-archive
                                        </Badge>
                                    )}
                                </div>
                                <span>{tpl.usageCount} utilisations</span>
                            </div>

                            {/* Use button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-3 text-xs text-violet-400 hover:bg-violet-500/10 gap-1.5"
                            >
                                <FolderPlus className="h-3.5 w-3.5" />
                                Utiliser ce template
                            </Button>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ═══ Create template modal ═══ */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[480px] glass-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <FileStack className="h-5 w-5 text-violet-400" />
                            Nouveau template
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Créez un modèle de dossier réutilisable
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Nom du template</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="ex: Dossier Fiscal Standard"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Description</label>
                            <Textarea
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Description du template…"
                                className="text-xs bg-white/5 border-white/10 min-h-[60px] resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Tags par défaut</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(TAG_COLORS).map(([tag, colors]) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                                            newTags.includes(tag)
                                                ? `${colors.bg} ${colors.text} border-transparent`
                                                : "border-white/10 text-muted-foreground hover:bg-white/5"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCreateOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 text-white"
                            disabled={!newName.trim()}
                            onClick={() => { setCreateOpen(false); setNewName(""); setNewDesc(""); setNewTags([]); }}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Créer le template
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
