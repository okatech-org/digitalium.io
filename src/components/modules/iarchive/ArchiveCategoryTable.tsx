"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Reusable Category Table
// Shared by all 5 category pages (fiscal, social, legal, client, vault)
// ═══════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Download,
    Eye,
    Shield,
    Clock,
    Hash,
    ChevronDown,
    FileText,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Loader2,
    Trash2,
    ArrowLeft,
    Upload,
    MoreHorizontal,
    RefreshCw,
    CalendarPlus,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

export type ArchiveStatus = "active" | "expiring" | "expired" | "pending" | "destroyed";

export interface ArchiveEntry {
    id: string;
    title: string;
    archivedAt: string;
    expiresAt: string;
    size: string;
    hash: string;
    status: ArchiveStatus;
    certId: string;
    archivedBy: string;
}

export interface CategoryConfig {
    key: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    color: string;
    bg: string;
    border: string;
    retention: string;
    chartColor: string;
}

// ─── Status config ──────────────────────────────

const STATUS_CONFIG: Record<ArchiveStatus, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    dotColor: string;
}> = {
    active: {
        label: "Actif",
        icon: CheckCircle2,
        className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        dotColor: "bg-emerald-400",
    },
    expiring: {
        label: "Expiration proche",
        icon: AlertTriangle,
        className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        dotColor: "bg-amber-400",
    },
    expired: {
        label: "Expiré",
        icon: XCircle,
        className: "text-red-400 bg-red-500/10 border-red-500/20",
        dotColor: "bg-red-400",
    },
    pending: {
        label: "En attente",
        icon: Loader2,
        className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        dotColor: "bg-blue-400",
    },
    destroyed: {
        label: "Détruit",
        icon: Trash2,
        className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
        dotColor: "bg-zinc-400",
    },
};

// ─── Quick filters ──────────────────────────────

const YEAR_FILTERS = ["Tout", "2026", "2025", "2024", "2023"];
const STATUS_FILTERS: { key: "all" | ArchiveStatus; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "active", label: "Actifs" },
    { key: "expiring", label: "Expiration" },
    { key: "expired", label: "Expirés" },
    { key: "pending", label: "En attente" },
    { key: "destroyed", label: "Détruits" },
];

// ─── Component ──────────────────────────────────

interface Props {
    config: CategoryConfig;
    entries: ArchiveEntry[];
    isVault?: boolean;
}

export default function ArchiveCategoryTable({ config, entries, isVault = false }: Props) {
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState("Tout");
    const [statusFilter, setStatusFilter] = useState<"all" | ArchiveStatus>("all");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const CatIcon = config.icon;

    const filtered = useMemo(() => {
        return entries.filter((e) => {
            const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                e.hash.toLowerCase().includes(search.toLowerCase()) ||
                e.certId.toLowerCase().includes(search.toLowerCase());
            const matchYear = yearFilter === "Tout" || e.archivedAt.includes(yearFilter);
            const matchStatus = statusFilter === "all" || e.status === statusFilter;
            return matchSearch && matchYear && matchStatus;
        });
    }, [entries, search, yearFilter, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: entries.length };
        entries.forEach((e) => {
            counts[e.status] = (counts[e.status] || 0) + 1;
        });
        return counts;
    }, [entries]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <Link href="/pro/iarchive">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <CatIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{config.label}</h1>
                            {isVault && (
                                <Badge variant="outline" className="text-[9px] h-4 border-rose-500/30 text-rose-400">
                                    🔐 Accès restreint
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {config.description} · Rétention : {config.retention}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/pro/iarchive/upload">
                        <Button variant="outline" size="sm" className="text-xs border-white/10">
                            <Upload className="h-3.5 w-3.5 mr-1.5" />Archiver
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-xs border-white/10">
                        <Download className="h-3.5 w-3.5 mr-1.5" />Exporter
                    </Button>
                </div>
            </motion.div>

            {/* ═══ SEARCH + FILTERS ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="space-y-3"
            >
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par titre, hash ou certificat…"
                            className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                        />
                    </div>
                </div>

                {/* Year chips */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Année</span>
                    {YEAR_FILTERS.map((y) => (
                        <button
                            key={y}
                            onClick={() => setYearFilter(y)}
                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${yearFilter === y
                                ? `${config.bg} ${config.color} border ${config.border}`
                                : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                }`}
                        >
                            {y}
                        </button>
                    ))}

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Statut</span>
                    {STATUS_FILTERS.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setStatusFilter(s.key)}
                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${statusFilter === s.key
                                ? `${config.bg} ${config.color} border ${config.border}`
                                : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                }`}
                        >
                            {s.label}
                            {statusCounts[s.key] != null && (
                                <span className="ml-1 opacity-60">{statusCounts[s.key]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ═══ TABLE ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/5 overflow-hidden"
            >
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/5 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <div className="col-span-4">Titre</div>
                    <div className="col-span-2">Date archivage</div>
                    <div className="col-span-2">Expiration</div>
                    <div className="col-span-1 text-right">Taille</div>
                    <div className="col-span-1">Statut</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.03]">
                    {filtered.length === 0 && (
                        <div className="px-4 py-12 text-center text-xs text-zinc-500">
                            Aucune archive trouvée pour ces critères.
                        </div>
                    )}

                    {filtered.map((entry, i) => {
                        const statusCfg = STATUS_CONFIG[entry.status];
                        const StatusIcon = statusCfg.icon;
                        const isExpanded = expandedRow === entry.id;

                        return (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <div
                                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 hover:bg-white/[0.015] transition-colors cursor-pointer items-center"
                                    onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                                >
                                    {/* Title */}
                                    <div className="sm:col-span-4 flex items-center gap-2">
                                        <div className={`h-7 w-7 rounded-md ${config.bg} flex items-center justify-center shrink-0`}>
                                            <FileText className={`h-3.5 w-3.5 ${config.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{entry.title}</p>
                                            <p className="text-[9px] text-zinc-500 font-mono hidden sm:block">
                                                {entry.certId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Archived date */}
                                    <div className="sm:col-span-2 text-[11px] text-zinc-400">
                                        {entry.archivedAt}
                                    </div>

                                    {/* Expiry */}
                                    <div className={`sm:col-span-2 text-[11px] ${entry.status === "expiring" ? "text-amber-400" :
                                            entry.status === "expired" ? "text-red-400" :
                                                "text-zinc-400"
                                        }`}>
                                        {entry.expiresAt}
                                    </div>

                                    {/* Size */}
                                    <div className="sm:col-span-1 text-[11px] text-zinc-500 text-right">
                                        {entry.size}
                                    </div>

                                    {/* Status */}
                                    <div className="sm:col-span-1">
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] h-5 ${statusCfg.className}`}
                                        >
                                            <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                            {statusCfg.label}
                                        </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="sm:col-span-2 flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            <Download className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-zinc-500 hover:text-emerald-400"
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            <Shield className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            <ChevronDown
                                                className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                            />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded row details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-3 pt-1 ml-9 space-y-2">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div>
                                                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                                                            Empreinte SHA-256
                                                        </p>
                                                        <p className="text-[11px] font-mono text-emerald-400 break-all">
                                                            {entry.hash}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                                                            Archivé par
                                                        </p>
                                                        <p className="text-[11px] text-zinc-300">
                                                            {entry.archivedBy}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                                                            Certificat
                                                        </p>
                                                        <p className="text-[11px] text-violet-400">{entry.certId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                                                            Rétention
                                                        </p>
                                                        <p className="text-[11px] text-zinc-300">{config.retention}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <Button variant="outline" size="sm" className="h-6 text-[10px] border-white/10">
                                                        <Shield className="h-2.5 w-2.5 mr-1" />
                                                        Vérifier intégrité
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-6 text-[10px] border-white/10">
                                                        <CalendarPlus className="h-2.5 w-2.5 mr-1" />
                                                        Prolonger rétention
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-6 text-[10px] border-white/10">
                                                        <RefreshCw className="h-2.5 w-2.5 mr-1" />
                                                        Recertifier
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-6 text-[10px] border-white/10">
                                                        <Download className="h-2.5 w-2.5 mr-1" />
                                                        Télécharger
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ═══ FOOTER ═══ */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{filtered.length} archive{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}</span>
                <span>{entries.length} total · Rétention : {config.retention}</span>
            </div>
        </div>
    );
}
