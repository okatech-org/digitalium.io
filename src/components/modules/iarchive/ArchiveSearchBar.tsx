"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: ArchiveSearchBar
// Connected to Convex — searches archives in real-time
// ═══════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import {
    Search,
    X,
    SlidersHorizontal,
    FileText,
    Hash,
    HardDrive,
    Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

type SortBy = "relevance" | "date" | "size";

interface SearchFilters {
    categorySlug: string | null;
    status: string | null;
    sortBy: SortBy;
}

interface Props {
    onSelect: (id: Id<"archives">) => void;
}

// ─── Status config ──────────────────────────────

const STATUS_OPTIONS: { key: string; label: string; cls: string }[] = [
    { key: "active", label: "Actif", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { key: "semi_active", label: "Semi-actif", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { key: "archived", label: "Archivé", cls: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    { key: "expired", label: "Expiré", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
    { key: "destroyed", label: "Détruit", cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
];

// ─── Helpers ────────────────────────────────────

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

export default function ArchiveSearchBar({ onSelect }: Props) {
    const { convexOrgId } = useConvexOrgId();
    const [query, setQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        categorySlug: null,
        status: null,
        sortBy: "relevance",
    });

    // Load categories dynamically
    const categories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // Search archives — uses the list query with search param
    const searchResults = useQuery(
        api.archives.list,
        convexOrgId && query.length >= 2
            ? {
                organizationId: convexOrgId,
                search: query,
                categorySlug: filters.categorySlug ?? undefined,
                status: filters.status ?? undefined,
            }
            : "skip"
    );

    const isSearching = query.length >= 2 && searchResults === undefined;
    const results = searchResults ?? [];

    const handleFilterChange = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({ categorySlug: null, status: null, sortBy: "relevance" });
    }, []);

    const activeFilterCount = [filters.categorySlug, filters.status].filter(Boolean).length;

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher dans les archives (titre, nom fichier, tags…)"
                        className="h-9 pl-9 pr-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
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
                            {/* Category — dynamic from Convex */}
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Catégorie</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(categories ?? []).map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => handleFilterChange("categorySlug", filters.categorySlug === cat.slug ? null : cat.slug)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${filters.categorySlug === cat.slug
                                                    ? "bg-violet-500/10 text-violet-300 border border-violet-500/30"
                                                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Statut</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.key}
                                            onClick={() => handleFilterChange("status", filters.status === opt.key ? null : opt.key)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${filters.status === opt.key
                                                    ? opt.cls + " border"
                                                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            {opt.label}
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
                                            className={`px-2 py-0.5 rounded text-[10px] ${filters.sortBy === s ? "bg-violet-500/15 text-violet-300" : "text-zinc-500 hover:text-zinc-300"
                                                }`}
                                        >
                                            {s === "relevance" ? "Pertinence" : s === "date" ? "Date" : "Taille"}
                                        </button>
                                    ))}
                                </div>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-[10px] text-zinc-500 hover:text-zinc-300">
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
                        {isSearching ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Recherche en cours…
                            </span>
                        ) : (
                            `${results.length} résultat${results.length !== 1 ? "s" : ""}`
                        )}
                    </p>
                    {results.map((r, i) => {
                        const statusOpt = STATUS_OPTIONS.find((s) => s.key === r.status);
                        return (
                            <motion.div
                                key={r._id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => onSelect(r._id)}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                            >
                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4 text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate group-hover:text-violet-300 transition-colors">
                                        {highlightMatch(r.title, query)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-zinc-500">{r.fileName}</span>
                                        <span className="text-[10px] text-zinc-600">·</span>
                                        <span className="text-[10px] text-zinc-500">{formatFileSize(r.fileSize)}</span>
                                        <span className="text-[10px] text-zinc-600">·</span>
                                        <span className="text-[9px] font-mono text-zinc-600">{r.sha256Hash?.slice(0, 8)}…</span>
                                    </div>
                                </div>
                                {statusOpt && (
                                    <Badge variant="outline" className={`text-[9px] h-5 ${statusOpt.cls}`}>
                                        {statusOpt.label}
                                    </Badge>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
