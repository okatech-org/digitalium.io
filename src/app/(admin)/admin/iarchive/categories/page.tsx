// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Gestion des Catégories
// CRUD des catégories d'archivage (admin)
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    SlidersHorizontal,
    Plus,
    Pencil,
    ToggleLeft,
    ToggleRight,
    GripVertical,
    Landmark,
    Briefcase,
    Scale,
    Users,
    Lock,
    Shield,
    FileText,
    Palette,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Color palette ──────────────────────── */

const COLOR_OPTIONS = [
    { value: "amber", label: "Ambre", class: "bg-amber-500" },
    { value: "blue", label: "Bleu", class: "bg-blue-500" },
    { value: "emerald", label: "Émeraude", class: "bg-emerald-500" },
    { value: "violet", label: "Violet", class: "bg-violet-500" },
    { value: "rose", label: "Rose", class: "bg-rose-500" },
    { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "teal", label: "Teal", class: "bg-teal-500" },
];

const COLOR_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    amber: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-500" },
    blue: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-500" },
    emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500" },
    violet: { bg: "bg-violet-500/15", text: "text-violet-400", dot: "bg-violet-500" },
    rose: { bg: "bg-rose-500/15", text: "text-rose-400", dot: "bg-rose-500" },
    cyan: { bg: "bg-cyan-500/15", text: "text-cyan-400", dot: "bg-cyan-500" },
    orange: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-500" },
    teal: { bg: "bg-teal-500/15", text: "text-teal-400", dot: "bg-teal-500" },
};

/* ─── Icon mapping ───────────────────────── */

const ICON_MAP: Record<string, React.ElementType> = {
    Landmark, Briefcase, Scale, Users, Shield, FileText, Lock,
};

const ICON_OPTIONS = [
    { value: "Landmark", label: "Fiscal" },
    { value: "Briefcase", label: "Social" },
    { value: "Scale", label: "Juridique" },
    { value: "Users", label: "Clients" },
    { value: "Shield", label: "Sécurité" },
    { value: "FileText", label: "Document" },
];

/* ─── Mock categories ────────────────────── */

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
    retentionYears: number;
    defaultConfidentiality: string;
    isFixed: boolean;
    isActive: boolean;
    sortOrder: number;
    fileCount: number;
}

const MOCK_CATEGORIES: CategoryItem[] = [
    { id: "c1", name: "Fiscal", slug: "fiscal", description: "Déclarations fiscales, bilans et justificatifs comptables", color: "amber", icon: "Landmark", retentionYears: 10, defaultConfidentiality: "internal", isFixed: false, isActive: true, sortOrder: 1, fileCount: 28 },
    { id: "c2", name: "Social", slug: "social", description: "Contrats de travail, bulletins de paie et documents RH", color: "blue", icon: "Briefcase", retentionYears: 5, defaultConfidentiality: "confidential", isFixed: false, isActive: true, sortOrder: 2, fileCount: 45 },
    { id: "c3", name: "Juridique", slug: "juridique", description: "Statuts, PV, contrats commerciaux et actes notariés", color: "emerald", icon: "Scale", retentionYears: 10, defaultConfidentiality: "confidential", isFixed: false, isActive: true, sortOrder: 3, fileCount: 12 },
    { id: "c4", name: "Clients", slug: "clients", description: "Dossiers clients, correspondances et documents commerciaux", color: "violet", icon: "Users", retentionYears: 5, defaultConfidentiality: "internal", isFixed: false, isActive: true, sortOrder: 4, fileCount: 19 },
    { id: "c0", name: "Coffre-Fort", slug: "vault", description: "Documents ultra-sécurisés et chiffrés — Catégorie fixe", color: "rose", icon: "Lock", retentionYears: 30, defaultConfidentiality: "secret", isFixed: true, isActive: true, sortOrder: 0, fileCount: 15 },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function CategoriesPage() {
    const [categories] = useState(MOCK_CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder));
    const [createOpen, setCreateOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);

    // Form state
    const [formName, setFormName] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formColor, setFormColor] = useState("amber");
    const [formIcon, setFormIcon] = useState("Landmark");
    const [formRetention, setFormRetention] = useState("10");
    const [formConfidentiality, setFormConfidentiality] = useState("internal");

    const openEdit = (cat: CategoryItem) => {
        setEditCategory(cat);
        setFormName(cat.name);
        setFormDesc(cat.description);
        setFormColor(cat.color);
        setFormIcon(cat.icon);
        setFormRetention(String(cat.retentionYears));
        setFormConfidentiality(cat.defaultConfidentiality);
    };

    const openCreate = () => {
        setEditCategory(null);
        setFormName("");
        setFormDesc("");
        setFormColor("amber");
        setFormIcon("Landmark");
        setFormRetention("10");
        setFormConfidentiality("internal");
        setCreateOpen(true);
    };

    const closeModal = () => {
        setCreateOpen(false);
        setEditCategory(null);
    };

    const isModalOpen = createOpen || editCategory !== null;

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <SlidersHorizontal className="h-6 w-6 text-violet-400" />
                        Gestion des Catégories
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {categories.filter((c) => c.isActive).length} catégories actives · Organisez la segmentation de vos archives
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Nouvelle catégorie
                </Button>
            </motion.div>

            {/* Info notice */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                <Palette className="h-4 w-4 text-violet-400 shrink-0" />
                <p className="text-xs text-muted-foreground">
                    Les catégories définissent la segmentation des archives. Chaque catégorie a une couleur, une icône et une rétention par défaut.
                    Le <strong className="text-amber-400">Coffre-Fort</strong> est une catégorie fixe non supprimable.
                </p>
            </motion.div>

            {/* Categories list */}
            <motion.div variants={fadeUp} className="space-y-2">
                {categories.map((cat) => {
                    const colorStyle = COLOR_STYLES[cat.color] || COLOR_STYLES.amber;
                    const Icon = ICON_MAP[cat.icon] || FileText;
                    return (
                        <motion.div
                            key={cat.id}
                            variants={fadeUp}
                            className={`glass-card rounded-xl p-4 border ${cat.isActive ? "border-white/5" : "border-white/5 opacity-50"} hover:border-white/10 transition-all group`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Drag handle */}
                                {!cat.isFixed && (
                                    <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab shrink-0" />
                                )}
                                {cat.isFixed && <div className="w-4 shrink-0" />}

                                {/* Icon */}
                                <div className={`h-10 w-10 rounded-lg ${colorStyle.bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-5 w-5 ${colorStyle.text}`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">{cat.name}</p>
                                        <div className={`h-2 w-2 rounded-full ${colorStyle.dot}`} />
                                        {cat.isFixed && (
                                            <Badge variant="secondary" className="text-[9px] border-0 bg-rose-500/10 text-rose-400">
                                                Fixe
                                            </Badge>
                                        )}
                                        {!cat.isActive && (
                                            <Badge variant="secondary" className="text-[9px] border-0 bg-zinc-500/15 text-zinc-400">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                                </div>

                                {/* Stats */}
                                <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground shrink-0">
                                    <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {cat.fileCount} fichiers
                                    </span>
                                    <span>{cat.retentionYears} ans rétention</span>
                                    <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-muted-foreground">
                                        {cat.defaultConfidentiality}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {!cat.isFixed && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                                            onClick={() => { /* toggle active */ }}
                                        >
                                            {cat.isActive ? (
                                                <ToggleRight className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4 text-zinc-500" />
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                                        onClick={() => openEdit(cat)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ═══ Create / Edit modal ═══ */}
            <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent className="sm:max-w-[520px] glass-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            {editCategory ? (
                                <>
                                    <Pencil className="h-5 w-5 text-violet-400" />
                                    Modifier la catégorie
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5 text-violet-400" />
                                    Nouvelle catégorie
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {editCategory ? "Modifiez les paramètres de cette catégorie d'archivage" : "Créez une nouvelle catégorie pour segmenter vos archives"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        {/* Name */}
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Nom de la catégorie</label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="ex: Ressources Humaines"
                                className="h-9 text-xs bg-white/5 border-white/10"
                                disabled={editCategory?.isFixed}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Description</label>
                            <Textarea
                                value={formDesc}
                                onChange={(e) => setFormDesc(e.target.value)}
                                placeholder="Description de la catégorie…"
                                className="text-xs bg-white/5 border-white/10 min-h-[60px] resize-none"
                            />
                        </div>

                        {/* Color */}
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Couleur</label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setFormColor(c.value)}
                                        className={`h-8 w-8 rounded-lg ${c.class} transition-all ${
                                            formColor === c.value
                                                ? "ring-2 ring-white/40 scale-110"
                                                : "opacity-50 hover:opacity-80"
                                        }`}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Icône</label>
                            <div className="flex flex-wrap gap-2">
                                {ICON_OPTIONS.map((ic) => {
                                    const Ic = ICON_MAP[ic.value];
                                    return (
                                        <button
                                            key={ic.value}
                                            onClick={() => setFormIcon(ic.value)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                                formIcon === ic.value
                                                    ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                                                    : "border-white/10 text-muted-foreground hover:bg-white/5"
                                            }`}
                                        >
                                            <Ic className="h-3.5 w-3.5" />
                                            {ic.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Retention + Confidentiality */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium mb-1.5 block">Rétention (années)</label>
                                <Select value={formRetention} onValueChange={setFormRetention}>
                                    <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 an</SelectItem>
                                        <SelectItem value="3">3 ans</SelectItem>
                                        <SelectItem value="5">5 ans</SelectItem>
                                        <SelectItem value="10">10 ans</SelectItem>
                                        <SelectItem value="20">20 ans</SelectItem>
                                        <SelectItem value="30">30 ans</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block">Confidentialité</label>
                                <Select value={formConfidentiality} onValueChange={setFormConfidentiality}>
                                    <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="internal">Interne</SelectItem>
                                        <SelectItem value="confidential">Confidentiel</SelectItem>
                                        <SelectItem value="secret">Secret</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={closeModal}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 text-white"
                            disabled={!formName.trim()}
                            onClick={closeModal}
                        >
                            {editCategory ? "Enregistrer" : "Créer la catégorie"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
