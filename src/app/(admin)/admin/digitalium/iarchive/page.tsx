// ═══════════════════════════════════════════════
// DIGITALIUM.IO — DIGITALIUM: iArchive
// Archivage légal interne DIGITALIUM
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
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
    AlertTriangle,
    Clock,
    Hash,
    FileText,
    CheckCircle2,
    Search,
    Shield,
    HardDrive,
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

// ─── Category config ────────────────────────────

const CATEGORIES = [
    {
        key: "fiscal",
        label: "Archives Fiscales",
        icon: Landmark,
        gradient: "from-amber-600 to-orange-500",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
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
        gradient: "from-blue-600 to-cyan-500",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
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
        gradient: "from-emerald-600 to-teal-500",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
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
        gradient: "from-violet-600 to-purple-500",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
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
        gradient: "from-rose-600 to-pink-500",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        retention: "Illimité",
        count: 8,
        total: 20,
        sizeGB: 0.4,
        chartColor: "#f43f5e",
    },
];

const TOTAL_DOCS = CATEGORIES.reduce((s, c) => s + c.count, 0);
const TOTAL_SIZE = CATEGORIES.reduce((s, c) => s + c.sizeGB, 0);

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

// ─── Alerts data ────────────────────────────────

const ALERTS = [
    { id: 1, title: "Contrat SHO 2016 — expire dans 3 mois", category: "fiscal", severity: "warning" as const },
    { id: 2, title: "Convention syndicale 2021 — expire dans 5 mois", category: "social", severity: "warning" as const },
    { id: 3, title: "PV Assemblée 2024 — vérification intégrité recommandée", category: "legal", severity: "error" as const },
    { id: 4, title: "Attestation CNSS 2021 — expire dans 15 jours", category: "social", severity: "error" as const },
];

// ─── Chart data ─────────────────────────────────

const CHART_DATA = CATEGORIES.map((c) => ({
    name: c.label,
    value: c.count,
    color: c.chartColor,
}));

const CAT_COLORS: Record<string, string> = {
    fiscal: "text-amber-400",
    social: "text-blue-400",
    legal: "text-emerald-400",
    client: "text-violet-400",
    vault: "text-rose-400",
};

// ═════════════════════════════════════════════════

export default function DigitaliumIarchivePage() {
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
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                        <Archive className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">iArchive — DIGITALIUM</h1>
                        <p className="text-xs text-muted-foreground">
                            Archivage légal interne avec intégrité SHA-256 garantie
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs border-white/10" disabled>
                        <Shield className="h-3.5 w-3.5 mr-1.5" />
                        Certificats
                    </Button>
                    <Button
                        size="sm"
                        className="text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
                        disabled
                    >
                        <Archive className="h-3.5 w-3.5 mr-1.5" />
                        Archiver un document
                    </Button>
                </div>
            </motion.div>

            {/* ═══ SEARCH BAR ═══ */}
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher dans les archives (titres, descriptions, contenu OCR, hash)…"
                        className="h-9 pl-9 text-xs bg-white/5 border-white/10 focus-visible:ring-emerald-500/30"
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
                    { label: "Total archives", value: TOTAL_DOCS.toString(), icon: Archive, color: "text-emerald-400" },
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
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-lg font-bold">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ═══ CATEGORY CARDS ═══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {CATEGORIES.map((cat, i) => {
                        const CatIcon = cat.icon;
                        const pct = Math.round((cat.count / cat.total) * 100);
                        return (
                            <motion.div
                                key={cat.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 + i * 0.04 }}
                                className={`p-4 rounded-xl ${cat.bg} border ${cat.border} transition-all`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <CatIcon className={`h-5 w-5 ${cat.color}`} />
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${cat.bg} ${cat.color}`}>
                                        {cat.retention}
                                    </Badge>
                                </div>
                                <p className="text-sm font-semibold mb-1">{cat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold">{cat.count}</span>
                                    <span className="text-[10px] text-muted-foreground">/ {cat.total}</span>
                                </div>
                                <div className="h-1 rounded-full bg-white/10 mt-2 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`} style={{ width: `${pct}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">{cat.sizeGB} Go</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ═══ CHARTS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-5 border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-4">Répartition par catégorie</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={CHART_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                                    {CHART_DATA.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                                    labelStyle={{ color: "#a1a1aa" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {CHART_DATA.map((d) => (
                            <div key={d.name} className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-[10px] text-muted-foreground">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="glass-card rounded-2xl p-5 border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-4">Archivages mensuels</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MONTHLY_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* ═══ TIMELINE + ALERTS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="glass-card rounded-2xl p-5 border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        Activité récente
                    </h3>
                    <div className="space-y-3">
                        {TIMELINE.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText className={`h-4 w-4 ${CAT_COLORS[item.category] || "text-zinc-400"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-muted-foreground">{item.user}</span>
                                        <span className="text-[10px] text-zinc-600">·</span>
                                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Hash className="h-2.5 w-2.5 text-zinc-600" />
                                        <span className="text-[9px] font-mono text-zinc-500">{item.hash}</span>
                                        <span className="text-[9px] font-mono text-emerald-400">{item.cert}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Alerts + File Types */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="glass-card rounded-2xl p-5 border border-white/5"
                    >
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            Alertes
                        </h3>
                        <div className="space-y-2">
                            {ALERTS.map((alert) => (
                                <div key={alert.id} className={`p-3 rounded-lg border ${alert.severity === "error" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                                    <p className={`text-[11px] font-medium ${alert.severity === "error" ? "text-red-400" : "text-amber-400"}`}>
                                        {alert.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className="glass-card rounded-2xl p-5 border border-white/5"
                    >
                        <h3 className="text-sm font-semibold mb-4">Types de fichiers</h3>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={FILE_TYPES} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                                        {FILE_TYPES.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 justify-center">
                            {FILE_TYPES.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-[10px] text-muted-foreground">{d.name} ({d.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
