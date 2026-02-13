"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Dashboard
// Overview with category cards, charts, search, alerts, stats
// ═══════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Archive,
    Landmark,
    Users2,
    Scale,
    Building2,
    Lock,
    ChevronRight,
    Plus,
    AlertTriangle,
    ShieldAlert,
    Clock,
    Hash,
    FileText,
    CheckCircle2,
    Upload,
    TrendingUp,
    Search,
    Shield,
    SlidersHorizontal,
    CalendarPlus,
    Eye,
    HardDrive,
    BarChart3,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import ArchiveSearchBar from "@/components/modules/iarchive/ArchiveSearchBar";

// ─── Category config ────────────────────────────

const CATEGORIES = [
    {
        key: "fiscal",
        label: "Archives Fiscales",
        icon: Landmark,
        href: "/pro/iarchive/fiscal",
        gradient: "from-amber-600 to-orange-500",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        ring: "ring-amber-500/20",
        retention: "10 ans",
        count: 47,
        total: 100,
        sizeGB: 2.3,
        chartColor: "#f59e0b",
    },
    {
        key: "social",
        label: "Archives Sociales",
        icon: Users2,
        href: "/pro/iarchive/social",
        gradient: "from-blue-600 to-cyan-500",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        ring: "ring-blue-500/20",
        retention: "5 ans",
        count: 23,
        total: 50,
        sizeGB: 0.8,
        chartColor: "#3b82f6",
    },
    {
        key: "legal",
        label: "Archives Juridiques",
        icon: Scale,
        href: "/pro/iarchive/legal",
        gradient: "from-emerald-600 to-teal-500",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        ring: "ring-emerald-500/20",
        retention: "10 ans",
        count: 31,
        total: 60,
        sizeGB: 1.5,
        chartColor: "#10b981",
    },
    {
        key: "client",
        label: "Archives Clients",
        icon: Building2,
        href: "/pro/iarchive/client",
        gradient: "from-violet-600 to-purple-500",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        ring: "ring-violet-500/20",
        retention: "5 ans",
        count: 15,
        total: 40,
        sizeGB: 0.6,
        chartColor: "#8b5cf6",
    },
    {
        key: "vault",
        label: "Coffre-Fort Numérique",
        icon: Lock,
        href: "/pro/iarchive/vault",
        gradient: "from-rose-600 to-pink-500",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        ring: "ring-rose-500/20",
        retention: "Illimité",
        count: 8,
        total: 20,
        sizeGB: 0.4,
        chartColor: "#f43f5e",
    },
];

const TOTAL_DOCS = CATEGORIES.reduce((s, c) => s + c.count, 0);
const TOTAL_SIZE = CATEGORIES.reduce((s, c) => s + c.sizeGB, 0);
const QUOTA_SIZE = 10; // Go

// ─── Monthly bar chart data ─────────────────────

const MONTHLY_DATA = [
    { month: "Sep", count: 8 },
    { month: "Oct", count: 12 },
    { month: "Nov", count: 15 },
    { month: "Déc", count: 9 },
    { month: "Jan", count: 22 },
    { month: "Fév", count: 18 },
];

// ─── File type distribution ─────────────────────

const FILE_TYPES = [
    { name: "PDF", value: 62, color: "#ef4444" },
    { name: "Images", value: 21, color: "#3b82f6" },
    { name: "Word", value: 12, color: "#8b5cf6" },
    { name: "Excel", value: 5, color: "#10b981" },
];

// ─── Timeline data ──────────────────────────────

const TIMELINE = [
    { id: 1, title: "Contrat SOGARA — Prestation IT", category: "fiscal", user: "Daniel Nguema", time: "Il y a 2h", hash: "5854a1eb…47a5", cert: "CERT-2026-07997" },
    { id: 2, title: "Convention collective 2026", category: "social", user: "Aimée Gondjout", time: "Il y a 5h", hash: "a3e8b12c…9f01", cert: "CERT-2026-07996" },
    { id: 3, title: "Bail commercial — Immeuble Triomphal", category: "legal", user: "Claude Mboumba", time: "Il y a 1j", hash: "7c6f2d8e…5b43", cert: "CERT-2026-07995" },
    { id: 4, title: "Facture N°2026-0042 — SEEG", category: "fiscal", user: "Marie Obame", time: "Il y a 2j", hash: "d1f4e6a9…2c78", cert: "CERT-2026-07994" },
    { id: 5, title: "Brevet logiciel — iDETUDE v3", category: "vault", user: "Daniel Nguema", time: "Il y a 3j", hash: "92b5c8d1…1a4e", cert: "CERT-2026-07993" },
];

// ─── Alerts data (enhanced with expiration alerts) ──

const ALERTS = [
    { id: 1, type: "expiration" as const, title: "Contrat SHO 2016 — expire dans 3 mois", category: "fiscal", severity: "warning" as const, expiresAt: Date.now() + 90 * 24 * 3600 * 1000, action: "extend" as const },
    { id: 2, type: "expiration" as const, title: "Convention syndicale 2021 — expire dans 5 mois", category: "social", severity: "warning" as const, expiresAt: Date.now() + 150 * 24 * 3600 * 1000, action: "extend" as const },
    { id: 3, type: "integrity" as const, title: "PV Assemblée 2024 — vérification d'intégrité recommandée", category: "legal", severity: "error" as const, expiresAt: 0, action: "verify" as const },
    { id: 4, type: "expiration" as const, title: "Attestation CNSS 2021 — expire dans 15 jours", category: "social", severity: "error" as const, expiresAt: Date.now() + 15 * 24 * 3600 * 1000, action: "extend" as const },
    { id: 5, type: "expiration" as const, title: "Contrat bail local B — expire dans 28 jours", category: "legal", severity: "error" as const, expiresAt: Date.now() + 28 * 24 * 3600 * 1000, action: "extend" as const },
];

// ─── Chart data ─────────────────────────────────

const CHART_DATA = CATEGORIES.map((c) => ({
    name: c.label,
    value: c.count,
    color: c.chartColor,
}));

export default function IArchiveDashboard() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Archive className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">iArchive</h1>
                        <p className="text-xs text-muted-foreground">
                            Archivage légal avec intégrité SHA-256 garantie
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/pro/iarchive/certificates">
                        <Button variant="outline" size="sm" className="text-xs border-white/10">
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            Certificats
                        </Button>
                    </Link>
                    <Link href="/pro/iarchive/upload">
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                        >
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            Archiver un document
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* ═══ SEARCH BAR ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 }}
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher dans les archives (titres, descriptions, contenu OCR, hash)…"
                        className="h-9 pl-9 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                    />
                </div>
            </motion.div>

            {/* ═══ STATS BAR ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
                {[
                    { label: "Total archives", value: TOTAL_DOCS.toString(), icon: Archive, color: "text-violet-400" },
                    { label: "Stockage utilisé", value: `${TOTAL_SIZE.toFixed(1)} Go`, icon: HardDrive, color: "text-blue-400" },
                    { label: "Certificats émis", value: TOTAL_DOCS.toString(), icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Alertes actives", value: ALERTS.length.toString(), icon: AlertTriangle, color: "text-amber-400" },
                ].map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <StatIcon className={`h-3.5 w-3.5 ${stat.color}`} />
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-lg font-bold">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ═══ CATEGORY CARDS + CHARTS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category cards (2 cols) */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <Archive className="h-4 w-4 text-violet-400" />
                        Catégories d&apos;archivage
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CATEGORIES.map((cat, i) => {
                            const CatIcon = cat.icon;
                            const pct = Math.round((cat.count / cat.total) * 100);
                            return (
                                <Link key={cat.key} href={cat.href}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`group relative p-4 rounded-xl border ${cat.border} ${cat.bg} hover:ring-1 ${cat.ring} transition-all cursor-pointer`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                                                <CatIcon className="h-4.5 w-4.5 text-white" />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] h-5 ${cat.border} ${cat.color}`}
                                            >
                                                {cat.retention}
                                            </Badge>
                                        </div>

                                        <p className={`text-sm font-semibold mb-0.5 group-hover:${cat.color} transition-colors`}>
                                            {cat.label}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mb-3">
                                            {cat.count} documents · {cat.sizeGB} Go
                                        </p>

                                        <div className="relative">
                                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`}
                                                />
                                            </div>
                                            <p className="text-[9px] text-zinc-500 mt-1 text-right">
                                                {pct}% capacité
                                            </p>
                                        </div>

                                        <ChevronRight className="absolute top-4 right-4 h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Charts column */}
                <div className="space-y-4">
                    {/* Donut chart */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                            Répartition
                        </h2>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={CHART_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {CHART_DATA.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(24,24,27,0.95)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            fontSize: "11px",
                                        }}
                                        formatter={(value: number, name: string) => [`${value} docs`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="space-y-1.5">
                                {CATEGORIES.map((c) => (
                                    <div
                                        key={c.key}
                                        className="flex items-center gap-2 text-[11px]"
                                    >
                                        <div
                                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                                            style={{ backgroundColor: c.chartColor }}
                                        />
                                        <span className="text-zinc-400 flex-1 truncate">{c.label}</span>
                                        <span className="text-zinc-300 font-medium">{c.count}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Storage gauge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Espace stockage</span>
                            <span className="text-xs font-medium">{TOTAL_SIZE.toFixed(1)} / {QUOTA_SIZE} Go</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(TOTAL_SIZE / QUOTA_SIZE) * 100}%` }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className={`h-full rounded-full ${
                                    TOTAL_SIZE / QUOTA_SIZE > 0.8
                                        ? "bg-gradient-to-r from-red-500 to-red-400"
                                        : TOTAL_SIZE / QUOTA_SIZE > 0.6
                                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                        : "bg-gradient-to-r from-violet-500 to-indigo-400"
                                }`}
                            />
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1">
                            {Math.round((TOTAL_SIZE / QUOTA_SIZE) * 100)}% utilisé
                        </p>
                    </motion.div>

                    {/* File type pie */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 block">Types de fichier</span>
                        <div className="space-y-1.5">
                            {FILE_TYPES.map((ft) => (
                                <div key={ft.name} className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: ft.color }} />
                                    <span className="text-[11px] text-zinc-400 flex-1">{ft.name}</span>
                                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${ft.value}%`, backgroundColor: ft.color }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-zinc-300 w-8 text-right">{ft.value}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══ MONTHLY BAR CHART ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-violet-400" />
                    Volume d&apos;archivage par mois
                </h2>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={MONTHLY_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(24,24,27,0.95)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                }}
                                formatter={(value: number) => [`${value} archives`, "Volume"]}
                            />
                            <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ═══ ALERTS (enhanced) ═══ */}
            {ALERTS.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        Alertes d&apos;expiration
                        <Badge variant="outline" className="text-[9px] h-4 ml-1 border-amber-500/20 text-amber-400">
                            {ALERTS.length}
                        </Badge>
                    </h2>

                    <div className="space-y-2">
                        {ALERTS.map((alert, i) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.05 }}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${alert.severity === "error"
                                        ? "bg-red-500/5 border-red-500/15"
                                        : "bg-amber-500/5 border-amber-500/15"
                                    }`}
                            >
                                {alert.type === "integrity" ? (
                                    <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                                ) : (
                                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium ${alert.severity === "error" ? "text-red-300" : "text-amber-300"
                                        }`}>
                                        {alert.title}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 capitalize">{alert.category}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {alert.action === "extend" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-6 text-[10px] ${
                                                alert.severity === "error"
                                                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                            }`}
                                        >
                                            <CalendarPlus className="h-2.5 w-2.5 mr-1" />
                                            Prolonger
                                        </Button>
                                    )}
                                    {alert.action === "verify" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Shield className="h-2.5 w-2.5 mr-1" />
                                            Vérifier
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                    >
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ═══ TIMELINE ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    Derniers archivages
                </h2>

                <div className="space-y-2">
                    {TIMELINE.map((item, i) => {
                        const cat = CATEGORIES.find((c) => c.key === item.category);
                        const CatIcon = cat?.icon ?? Archive;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div
                                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${cat?.chartColor}15` }}
                                >
                                    <CatIcon
                                        className="h-4 w-4"
                                        style={{ color: cat?.chartColor }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate group-hover:text-violet-300 transition-colors">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-zinc-500">{item.user}</span>
                                        <span className="text-[10px] text-zinc-600">·</span>
                                        <span className="text-[10px] text-zinc-500">{item.time}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="hidden sm:flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                                        <Hash className="h-2.5 w-2.5" />
                                        {item.hash}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`text-[9px] h-5 ${cat?.border} ${cat?.color}`}
                                    >
                                        <FileText className="h-2.5 w-2.5 mr-0.5" />
                                        {item.cert}
                                    </Badge>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
