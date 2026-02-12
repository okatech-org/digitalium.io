"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Document List & Management
// Grid / List toggle · Search · Filters · Multi-select · Actions
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Plus, Grid3X3, List, Filter, MoreHorizontal,
    Edit3, Share2, Archive, Trash2, CheckSquare, Clock, Eye,
    ArrowUpDown, ArrowUp, ArrowDown, Tag, User, X, Sparkles,
    ChevronRight, Calendar, PenTool,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Types ──────────────────────────────────────────────────────

type DocStatus = "draft" | "review" | "approved" | "archived";
type SortField = "title" | "author" | "updatedAt" | "status";
type SortDir = "asc" | "desc";

interface DocItem {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    authorInitials: string;
    authorAvatar?: string;
    updatedAt: string;
    updatedAtTs: number;
    status: DocStatus;
    tags: string[];
    version: number;
}

// ─── Status config ──────────────────────────────────────────────

const STATUS_CFG: Record<DocStatus, { label: string; icon: React.ElementType; class: string; dot: string }> = {
    draft: { label: "Brouillon", icon: PenTool, class: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-400" },
    review: { label: "En révision", icon: Eye, class: "bg-blue-500/15 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    approved: { label: "Approuvé", icon: CheckSquare, class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    archived: { label: "Archivé", icon: Archive, class: "bg-violet-500/15 text-violet-400 border-violet-500/20", dot: "bg-violet-400" },
};

const STATUS_FILTERS: { value: DocStatus | "all"; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "draft", label: "Brouillons" },
    { value: "review", label: "En révision" },
    { value: "approved", label: "Approuvés" },
    { value: "archived", label: "Archivés" },
];

// ─── Demo data (Gabon-realistic) ────────────────────────────────

const DEMO_DOCUMENTS: DocItem[] = [
    {
        id: "doc-1",
        title: "Contrat de prestation de services — SOGARA",
        excerpt: "Contrat cadre pour la fourniture de services numériques à la Société Gabonaise de Raffinage…",
        author: "Daniel Nguema", authorInitials: "DN",
        updatedAt: "Il y a 10 min", updatedAtTs: Date.now() - 600_000,
        status: "review", tags: ["Contrat", "SOGARA"], version: 3,
    },
    {
        id: "doc-2",
        title: "Rapport financier T4-2025 — ASCOMA Gabon",
        excerpt: "Synthèse des performances financières pour le quatrième trimestre 2025, incluant les projections…",
        author: "Aimée Gondjout", authorInitials: "AG",
        updatedAt: "Il y a 35 min", updatedAtTs: Date.now() - 2_100_000,
        status: "approved", tags: ["Finance", "Rapport"], version: 5,
    },
    {
        id: "doc-3",
        title: "Note de service — Politique de télétravail 2026",
        excerpt: "Mise à jour de la politique de télétravail pour l'ensemble des collaborateurs de l'organisation…",
        author: "Claude Mboumba", authorInitials: "CM",
        updatedAt: "Il y a 1h", updatedAtTs: Date.now() - 3_600_000,
        status: "draft", tags: ["RH", "Note"], version: 1,
    },
    {
        id: "doc-4",
        title: "PV du Conseil d'Administration — Janvier 2026",
        excerpt: "Procès-verbal de la réunion du conseil tenue le 28 janvier 2026, avec les résolutions adoptées…",
        author: "Daniel Nguema", authorInitials: "DN",
        updatedAt: "Il y a 2h", updatedAtTs: Date.now() - 7_200_000,
        status: "approved", tags: ["PV", "Direction"], version: 2,
    },
    {
        id: "doc-5",
        title: "Cahier des charges — Migration Cloud SEEG",
        excerpt: "Spécifications techniques pour la migration des systèmes legacy de la SEEG vers le cloud souverain…",
        author: "Patrick Obiang", authorInitials: "PO",
        updatedAt: "Il y a 3h", updatedAtTs: Date.now() - 10_800_000,
        status: "review", tags: ["Technique", "Cloud"], version: 4,
    },
    {
        id: "doc-6",
        title: "Devis prestation audit IT — Ministère de la Pêche",
        excerpt: "Proposition commerciale pour l'audit complet de l'infrastructure IT du ministère de la Pêche…",
        author: "Marie Nzé", authorInitials: "MN",
        updatedAt: "Il y a 5h", updatedAtTs: Date.now() - 18_000_000,
        status: "draft", tags: ["Devis", "Ministère"], version: 1,
    },
    {
        id: "doc-7",
        title: "Facture FV-2026-0847 — Gabon Télécom",
        excerpt: "Facture pour la prestation de connectivité réseau et maintenance technique au siège de Libreville…",
        author: "Aimée Gondjout", authorInitials: "AG",
        updatedAt: "Il y a 1j", updatedAtTs: Date.now() - 86_400_000,
        status: "approved", tags: ["Facture", "Télécom"], version: 1,
    },
    {
        id: "doc-8",
        title: "Plan stratégique numérique 2026-2028",
        excerpt: "Feuille de route pour la transformation digitale de l'organisation sur les trois prochaines années…",
        author: "Claude Mboumba", authorInitials: "CM",
        updatedAt: "Il y a 2j", updatedAtTs: Date.now() - 172_800_000,
        status: "draft", tags: ["Stratégie", "Direction"], version: 2,
    },
    {
        id: "doc-9",
        title: "Compte-rendu réunion interministérielle — Numérique",
        excerpt: "Résumé des échanges et décisions prises lors de la réunion du 5 février 2026 au SGG…",
        author: "Jeanne Reteno", authorInitials: "JR",
        updatedAt: "Il y a 3j", updatedAtTs: Date.now() - 259_200_000,
        status: "archived", tags: ["CR", "Interministériel"], version: 3,
    },
    {
        id: "doc-10",
        title: "Avenant contrat maintenance — COMILOG",
        excerpt: "Avenant n°2 au contrat de maintenance des systèmes numériques de la Compagnie Minière de l'Ogooué…",
        author: "Patrick Obiang", authorInitials: "PO",
        updatedAt: "Il y a 5j", updatedAtTs: Date.now() - 432_000_000,
        status: "approved", tags: ["Contrat", "Mines"], version: 2,
    },
    {
        id: "doc-11",
        title: "Guide d'utilisation — Module iSignature",
        excerpt: "Documentation utilisateur pour le module de signature électronique qualifiée conforme eIDAS/CEMAC…",
        author: "Marie Nzé", authorInitials: "MN",
        updatedAt: "Il y a 7j", updatedAtTs: Date.now() - 604_800_000,
        status: "archived", tags: ["Guide", "iSignature"], version: 6,
    },
    {
        id: "doc-12",
        title: "Accord-cadre partenariat — BGFIBank",
        excerpt: "Convention de partenariat stratégique pour les solutions de gestion documentaire bancaire…",
        author: "Daniel Nguema", authorInitials: "DN",
        updatedAt: "Il y a 10j", updatedAtTs: Date.now() - 864_000_000,
        status: "review", tags: ["Contrat", "Banque"], version: 1,
    },
];

// All unique tags from demo data
const ALL_TAGS = Array.from(new Set(DEMO_DOCUMENTS.flatMap((d) => d.tags))).sort();

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};
const cardHover = {
    rest: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
    hover: {
        scale: 1.015,
        boxShadow: "0 8px 30px rgba(139,92,246,0.12)",
        transition: { duration: 0.2 },
    },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DocumentListPage() {
    const router = useRouter();

    // ─── State ──────────────────────────────────────────────────
    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all");
    const [tagFilter, setTagFilter] = useState<string | null>(null);
    const [authorFilter, setAuthorFilter] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>("updatedAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState("");
    const [documents, setDocuments] = useState<DocItem[]>(DEMO_DOCUMENTS);

    // ─── Derived ────────────────────────────────────────────────

    const authors = useMemo(() => Array.from(new Set(documents.map((d) => d.author))).sort(), [documents]);

    const filtered = useMemo(() => {
        let list = [...documents];

        // Search
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (d) =>
                    d.title.toLowerCase().includes(q) ||
                    d.excerpt.toLowerCase().includes(q) ||
                    d.tags.some((t) => t.toLowerCase().includes(q)) ||
                    d.author.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            list = list.filter((d) => d.status === statusFilter);
        }

        // Tag filter
        if (tagFilter) {
            list = list.filter((d) => d.tags.includes(tagFilter));
        }

        // Author filter
        if (authorFilter) {
            list = list.filter((d) => d.author === authorFilter);
        }

        // Sort
        list.sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case "title":
                    cmp = a.title.localeCompare(b.title, "fr");
                    break;
                case "author":
                    cmp = a.author.localeCompare(b.author, "fr");
                    break;
                case "updatedAt":
                    cmp = a.updatedAtTs - b.updatedAtTs;
                    break;
                case "status":
                    cmp = a.status.localeCompare(b.status);
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return list;
    }, [documents, search, statusFilter, tagFilter, authorFilter, sortField, sortDir]);

    // ─── Handlers ───────────────────────────────────────────────

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
            prev.size === filtered.length
                ? new Set()
                : new Set(filtered.map((d) => d.id))
        );
    }, [filtered]);

    const clearFilters = useCallback(() => {
        setSearch("");
        setStatusFilter("all");
        setTagFilter(null);
        setAuthorFilter(null);
    }, []);

    const toggleSort = useCallback(
        (field: SortField) => {
            if (sortField === field) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
                setSortField(field);
                setSortDir("asc");
            }
        },
        [sortField]
    );

    const handleCreateDocument = useCallback(() => {
        if (!newDocTitle.trim()) return;
        const newDoc: DocItem = {
            id: `doc-${Date.now()}`,
            title: newDocTitle.trim(),
            excerpt: "Nouveau document créé — commencez à rédiger votre contenu…",
            author: "Vous",
            authorInitials: "V",
            updatedAt: "À l'instant",
            updatedAtTs: Date.now(),
            status: "draft",
            tags: [],
            version: 1,
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setNewDocTitle("");
        setShowNewDialog(false);
    }, [newDocTitle]);

    const handleDeleteSelected = useCallback(() => {
        setDocuments((prev) => prev.filter((d) => !selected.has(d.id)));
        setSelected(new Set());
    }, [selected]);

    const handleArchiveSelected = useCallback(() => {
        setDocuments((prev) =>
            prev.map((d) =>
                selected.has(d.id) ? { ...d, status: "archived" as DocStatus } : d
            )
        );
        setSelected(new Set());
    }, [selected]);

    const handleStatusChange = useCallback((id: string, status: DocStatus) => {
        setDocuments((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status } : d))
        );
    }, []);

    const handleDelete = useCallback((id: string) => {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const hasActiveFilters = statusFilter !== "all" || tagFilter || authorFilter || search;

    // ─── Sort icon helper ───────────────────────────────────────

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
        return sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3 text-violet-400" />
        ) : (
            <ArrowDown className="h-3 w-3 text-violet-400" />
        );
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-5 max-w-[1400px] mx-auto"
        >
            {/* ── Header ────────────────────────────────────── */}
            <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Gestion Documentaire
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {filtered.length} document{filtered.length > 1 ? "s" : ""} ·{" "}
                            {documents.filter((d) => d.status === "review").length} en révision
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowNewDialog(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0 gap-2 shadow-lg shadow-violet-500/20"
                >
                    <Plus className="h-4 w-4" />
                    Nouveau Document
                </Button>
            </motion.div>

            {/* ── Toolbar ───────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un document…"
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>

                            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />

                            {/* Status filter pills */}
                            <div className="flex items-center gap-1">
                                {STATUS_FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => setStatusFilter(f.value)}
                                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${statusFilter === f.value
                                            ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                                            : "text-muted-foreground hover:bg-white/5"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />

                            {/* Author filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant={authorFilter ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-7 text-[11px] gap-1.5"
                                    >
                                        <User className="h-3 w-3" />
                                        {authorFilter || "Auteur"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-44">
                                    <DropdownMenuItem
                                        className="text-xs"
                                        onClick={() => setAuthorFilter(null)}
                                    >
                                        Tous les auteurs
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {authors.map((a) => (
                                        <DropdownMenuItem
                                            key={a}
                                            className="text-xs"
                                            onClick={() => setAuthorFilter(a)}
                                        >
                                            {a}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Tag filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant={tagFilter ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-7 text-[11px] gap-1.5"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tagFilter || "Tags"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-44">
                                    <DropdownMenuItem
                                        className="text-xs"
                                        onClick={() => setTagFilter(null)}
                                    >
                                        Tous les tags
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {ALL_TAGS.map((t) => (
                                        <DropdownMenuItem
                                            key={t}
                                            className="text-xs"
                                            onClick={() => setTagFilter(t)}
                                        >
                                            {t}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Clear filters */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[11px] gap-1.5 text-red-400 hover:text-red-300"
                                    onClick={clearFilters}
                                >
                                    <X className="h-3 w-3" /> Effacer
                                </Button>
                            )}

                            {/* Right side: view toggle + bulk actions */}
                            <div className="ml-auto flex items-center gap-2">
                                {/* Bulk actions */}
                                <AnimatePresence>
                                    {selected.size > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center gap-1.5"
                                        >
                                            <span className="text-[11px] text-violet-400 font-medium">
                                                {selected.size} sélectionné(s)
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[11px] gap-1 text-violet-400"
                                                onClick={handleArchiveSelected}
                                            >
                                                <Archive className="h-3 w-3" /> Archiver
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[11px] gap-1 text-red-400"
                                                onClick={handleDeleteSelected}
                                            >
                                                <Trash2 className="h-3 w-3" /> Supprimer
                                            </Button>
                                            <Separator orientation="vertical" className="h-5 bg-white/10" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* View toggle */}
                                <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setView("grid")}
                                        className={`p-1.5 rounded-md transition-all ${view === "grid"
                                            ? "bg-violet-500/20 text-violet-300"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <Grid3X3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setView("list")}
                                        className={`p-1.5 rounded-md transition-all ${view === "list"
                                            ? "bg-violet-500/20 text-violet-300"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <List className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Content ───────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {view === "grid" ? (
                    /* ═══ GRID VIEW ═══ */
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {filtered.map((doc) => {
                            const st = STATUS_CFG[doc.status];
                            const isSelected = selected.has(doc.id);
                            return (
                                <motion.div
                                    key={doc.id}
                                    variants={fadeUp}
                                    initial="rest"
                                    whileHover="hover"
                                    animate="rest"
                                    className="relative group"
                                >
                                    <motion.div variants={cardHover}>
                                        <Card
                                            className={`glass border-white/5 overflow-hidden cursor-pointer transition-colors ${isSelected ? "ring-1 ring-violet-500/50 bg-violet-500/5" : ""
                                                }`}
                                        >
                                            {/* Selection checkbox (top-left) */}
                                            <div className={`absolute top-3 left-3 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                }`}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleSelect(doc.id)}
                                                    className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                                />
                                            </div>

                                            <CardContent className="p-4 space-y-3">
                                                {/* Status badge + actions */}
                                                <div className="flex items-center justify-between">
                                                    <Badge className={`text-[10px] h-5 border ${st.class}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1.5`} />
                                                        {st.label}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem className="text-xs gap-2">
                                                                <Edit3 className="h-3 w-3" /> Modifier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-xs gap-2">
                                                                <Share2 className="h-3 w-3" /> Partager
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleStatusChange(doc.id, "review")}>
                                                                <Eye className="h-3 w-3" /> Passer en révision
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleStatusChange(doc.id, "approved")}>
                                                                <CheckSquare className="h-3 w-3" /> Approuver
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleStatusChange(doc.id, "archived")}>
                                                                <Archive className="h-3 w-3" /> Archiver
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-xs gap-2 text-destructive"
                                                                onClick={() => handleDelete(doc.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" /> Supprimer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* Title + excerpt */}
                                                <div onClick={() => router.push(`/pro/idocument/edit/${doc.id}`)} className="cursor-pointer">
                                                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                                        {doc.excerpt}
                                                    </p>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1">
                                                    {doc.tags.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Footer: author + date */}
                                                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarFallback className="bg-violet-500/15 text-violet-300 text-[8px]">
                                                                {doc.authorInitials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {doc.author}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {doc.updatedAt}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    /* ═══ LIST VIEW ═══ */
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="glass border-white/5 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="py-2.5 px-3 text-left w-8">
                                                    <Checkbox
                                                        checked={selected.size === filtered.length && filtered.length > 0}
                                                        onCheckedChange={toggleSelectAll}
                                                        className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                                    />
                                                </th>
                                                <th className="py-2.5 px-3 text-left">
                                                    <button
                                                        onClick={() => toggleSort("title")}
                                                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        Titre <SortIcon field="title" />
                                                    </button>
                                                </th>
                                                <th className="py-2.5 px-3 text-left hidden md:table-cell">
                                                    <button
                                                        onClick={() => toggleSort("author")}
                                                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        Auteur <SortIcon field="author" />
                                                    </button>
                                                </th>
                                                <th className="py-2.5 px-3 text-left hidden lg:table-cell">
                                                    <button
                                                        onClick={() => toggleSort("updatedAt")}
                                                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        Dernière modif. <SortIcon field="updatedAt" />
                                                    </button>
                                                </th>
                                                <th className="py-2.5 px-3 text-center">
                                                    <button
                                                        onClick={() => toggleSort("status")}
                                                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mx-auto"
                                                    >
                                                        Statut <SortIcon field="status" />
                                                    </button>
                                                </th>
                                                <th className="py-2.5 px-3 text-left hidden xl:table-cell text-muted-foreground">
                                                    Tags
                                                </th>
                                                <th className="py-2.5 px-3 text-center w-10" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((doc) => {
                                                const st = STATUS_CFG[doc.status];
                                                const isSelected = selected.has(doc.id);
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        className={`border-b border-white/5 hover:bg-white/[0.02] group transition-colors ${isSelected ? "bg-violet-500/5" : ""
                                                            }`}
                                                    >
                                                        <td className="py-2.5 px-3">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSelect(doc.id)}
                                                                className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                                            />
                                                        </td>
                                                        <td className="py-2.5 px-3 cursor-pointer" onClick={() => router.push(`/pro/idocument/edit/${doc.id}`)}>
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                                                    <FileText className="h-4 w-4 text-violet-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium truncate max-w-[320px] group-hover:text-violet-300 transition-colors">
                                                                        {doc.title}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[280px]">
                                                                        {doc.excerpt}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 hidden md:table-cell">
                                                            <div className="flex items-center gap-1.5">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarFallback className="bg-violet-500/15 text-violet-300 text-[8px]">
                                                                        {doc.authorInitials}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-muted-foreground">{doc.author}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-muted-foreground hidden lg:table-cell">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> {doc.updatedAt}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <Badge className={`text-[10px] h-5 border ${st.class}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1`} />
                                                                {st.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2.5 px-3 hidden xl:table-cell">
                                                            <div className="flex gap-1">
                                                                {doc.tags.map((t) => (
                                                                    <span
                                                                        key={t}
                                                                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground"
                                                                    >
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-44">
                                                                    <DropdownMenuItem className="text-xs gap-2">
                                                                        <Edit3 className="h-3 w-3" /> Modifier
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-xs gap-2">
                                                                        <Share2 className="h-3 w-3" /> Partager
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-xs gap-2" onClick={() => handleStatusChange(doc.id, "review")}>
                                                                        <Eye className="h-3 w-3" /> Passer en révision
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-xs gap-2" onClick={() => handleStatusChange(doc.id, "approved")}>
                                                                        <CheckSquare className="h-3 w-3" /> Approuver
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-xs gap-2" onClick={() => handleStatusChange(doc.id, "archived")}>
                                                                        <Archive className="h-3 w-3" /> Archiver
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-xs gap-2 text-destructive"
                                                                        onClick={() => handleDelete(doc.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" /> Supprimer
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {filtered.length === 0 && (
                <motion.div variants={fadeUp} className="flex flex-col items-center py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-violet-400/60" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Aucun document trouvé</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        {hasActiveFilters
                            ? "Essayez de modifier vos filtres ou votre recherche."
                            : "Créez votre premier document pour commencer."}
                    </p>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 text-xs gap-1.5"
                            onClick={clearFilters}
                        >
                            <X className="h-3 w-3" /> Effacer les filtres
                        </Button>
                    )}
                </motion.div>
            )}

            {/* ── New Document Dialog ───────────────────────── */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                            Nouveau Document
                        </DialogTitle>
                        <DialogDescription>
                            Créez un nouveau document ou partez d&apos;un modèle existant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="doc-title" className="text-xs">
                                Titre du document *
                            </Label>
                            <Input
                                id="doc-title"
                                placeholder="Ex: Rapport mensuel février 2026"
                                value={newDocTitle}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocTitle(e.target.value)}
                                className="bg-white/5 border-white/10"
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === "Enter") handleCreateDocument();
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowNewDialog(false)}
                            className="border-white/10"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateDocument}
                            disabled={!newDocTitle.trim()}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
