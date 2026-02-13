"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: ArchiveSearchBar
// Full-text search with filters and highlighting
// ═══════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    X,
    Filter,
    SlidersHorizontal,
    FileText,
    Hash,
    Calendar,
    HardDrive,
    Landmark,
    Users2,
    Scale,
    Building2,
    Lock,
    Eye,
    Shield,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

type ArchiveCategory = "fiscal" | "social" | "legal" | "client" | "vault";
type ArchiveStatus = "active" | "expired" | "on_hold" | "destroyed";
type SortBy = "relevance" | "date" | "size";

interface SearchFilters {
    category: ArchiveCategory | null;
    status: ArchiveStatus | null;
    mimeType: string | null;
    dateFrom: string;
    dateTo: string;
    sortBy: SortBy;
}

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    category: ArchiveCategory;
    sha256Hash: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    status: ArchiveStatus;
    createdAt: number;
    ocrText?: string;
    matchField?: string;
}

interface Props {
    results: SearchResult[];
    onSearch: (query: string, filters: SearchFilters) => void;
    onSelect: (id: string) => void;
    isSearching?: boolean;
}

// ─── Helpers ────────────────────────────────────

const CATEGORY_CONFIG: Record<ArchiveCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
    fiscal: { label: "Fiscal", icon: Landmark, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    social: { label: "Social", icon: Users2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    legal: { label: "Juridique", icon: Scale, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    client: { label: "Client", icon: Building2, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    vault: { label: "Coffre-fort", icon: Lock, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

const STATUS_CONFIG: Record<ArchiveStatus, { label: string; color: string }> = {
    active: { label: "Actif", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    expired: { label: "Expiré", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    on_hold: { label: "Suspendu", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    destroyed: { label: "Détruit", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query || query.length < 2) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-violet-500/30 text-violet-200 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    );
}

// ─── Component ──────────────────────────────────

export default function ArchiveSearchBar({ results, onSearch, onSelect, isSearching }: Props) {
    const [query, setQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        category: null,
        status: null,
        mimeType: null,
        dateFrom: "",
        dateTo: "",
        sortBy: "relevance",
    });

    const handleSearch = (q: string) => {
        setQuery(q);
        if (q.length >= 2) {
            onSearch(q, filters);
        }
    };

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (query.length >= 2) onSearch(query, newFilters);
    };

    const clearFilters = () => {
        const reset: SearchFilters = { category: null, status: null, mimeType: null, dateFrom: "", dateTo: "", sortBy: "relevance" };
        setFilters(reset);
        if (query.length >= 2) onSearch(query, reset);
    };

    const activeFilterCount = [
        filters.category,
        filters.status,
        filters.mimeType,
        filters.dateFrom,
        filters.dateTo,
    ].filter(Boolean).length;

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Rechercher dans les titres, descriptions, contenu OCR, hash…"
                        className="h-9 pl-9 pr-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(""); }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-sm hover:bg-white/10 flex items-center justify-center"
                        >
                            <X className="h-3 w-3 text-zinc-400" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`text-xs border-white/10 h-9 ${showFilters ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : ""}`}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                    Filtres
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px] bg-violet-500/20 text-violet-300 border-0">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-3">
                            {/* Category */}
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Catégorie</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(Object.entries(CATEGORY_CONFIG) as [ArchiveCategory, typeof CATEGORY_CONFIG.fiscal][]).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleFilterChange("category", filters.category === key ? null : key)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                                                filters.category === key
                                                    ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                                                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                            }`}
                                        >
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Statut</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(Object.entries(STATUS_CONFIG) as [ArchiveStatus, typeof STATUS_CONFIG.active][]).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleFilterChange("status", filters.status === key ? null : key)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                                                filters.status === key
                                                    ? cfg.color + " border"
                                                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                            }`}
                                        >
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File type */}
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Type de fichier</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { key: "pdf", label: "PDF" },
                                        { key: "image", label: "Images" },
                                        { key: "word", label: "Word" },
                                        { key: "spreadsheet", label: "Excel" },
                                    ].map((t) => (
                                        <button
                                            key={t.key}
                                            onClick={() => handleFilterChange("mimeType", filters.mimeType === t.key ? null : t.key)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                                                filters.mimeType === t.key
                                                    ? "bg-violet-500/10 text-violet-300 border border-violet-500/30"
                                                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort + clear */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-500">Tri :</span>
                                    {(["relevance", "date", "size"] as SortBy[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleFilterChange("sortBy", s)}
                                            className={`px-2 py-0.5 rounded text-[10px] ${
                                                filters.sortBy === s
                                                    ? "bg-violet-500/15 text-violet-300"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                        >
                                            {s === "relevance" ? "Pertinence" : s === "date" ? "Date" : "Taille"}
                                        </button>
                                    ))}
                                </div>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-[10px] text-zinc-500 hover:text-zinc-300"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {query.length >= 2 && (
                <div className="space-y-1.5">
                    <p className="text-[10px] text-zinc-500">
                        {results.length} résultat{results.length !== 1 ? "s" : ""}
                        {isSearching && " — recherche en cours…"}
                    </p>
                    {results.map((r, i) => {
                        const catCfg = CATEGORY_CONFIG[r.category];
                        const CatIcon = catCfg.icon;
                        const statusCfg = STATUS_CONFIG[r.status];
                        return (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => onSelect(r.id)}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                            >
                                <div className={`h-8 w-8 rounded-lg ${catCfg.bg} flex items-center justify-center shrink-0`}>
                                    <CatIcon className={`h-4 w-4 ${catCfg.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate group-hover:text-violet-300 transition-colors">
                                        {highlightMatch(r.title, query)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-zinc-500">{r.fileName}</span>
                                        <span className="text-[10px] text-zinc-600">·</span>
                                        <span className="text-[10px] text-zinc-500">{formatFileSize(r.fileSize)}</span>
                                        {r.ocrText && (
                                            <>
                                                <span className="text-[10px] text-zinc-600">·</span>
                                                <Badge variant="outline" className="text-[8px] h-3.5 border-blue-500/20 text-blue-400">
                                                    OCR
                                                </Badge>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className={`text-[9px] h-5 ${statusCfg.color}`}>
                                    {statusCfg.label}
                                </Badge>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
