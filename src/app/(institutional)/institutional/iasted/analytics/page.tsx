"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Analytics IA (Institutional)
// Compact, no-scroll dashboard with KPIs + Recharts graphs
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
    BarChart3, FileSearch, Shield, Tag, Clock, Brain,
    TrendingUp, FileText, Folder, Zap, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Mock Data ──────────────────────────────────────────────────

const KPI_DATA = [
    { label: "Documents analysés", value: "1 247", change: "+12%", up: true, icon: FileSearch, gradient: "from-cyan-600 to-blue-500", bg: "bg-cyan-500/10" },
    { label: "Taux de conformité", value: "94.2%", change: "+2.1%", up: true, icon: Shield, gradient: "from-emerald-600 to-teal-500", bg: "bg-emerald-500/10" },
    { label: "Tags IA appliqués", value: "3 891", change: "+18%", up: true, icon: Tag, gradient: "from-violet-600 to-indigo-500", bg: "bg-violet-500/10" },
    { label: "Temps moyen", value: "2.4s", change: "-0.3s", up: true, icon: Clock, gradient: "from-amber-600 to-orange-500", bg: "bg-amber-500/10" },
];

const MONTHLY_DATA = [
    { month: "Sep", analyses: 142, tags: 320 },
    { month: "Oct", analyses: 186, tags: 450 },
    { month: "Nov", analyses: 210, tags: 520 },
    { month: "Déc", analyses: 178, tags: 410 },
    { month: "Jan", analyses: 256, tags: 640 },
    { month: "Fév", analyses: 275, tags: 710 },
];

const TOP_CATEGORIES = [
    { name: "Contrats", count: 342, fill: "#06b6d4" },
    { name: "Rapports", count: 287, fill: "#8b5cf6" },
    { name: "Factures", count: 231, fill: "#10b981" },
    { name: "PV", count: 189, fill: "#f59e0b" },
    { name: "Notes", count: 124, fill: "#ec4899" },
];

const DOC_TYPES = [
    { name: "PDF", value: 45, fill: "#ef4444" },
    { name: "Word", value: 28, fill: "#3b82f6" },
    { name: "Excel", value: 15, fill: "#10b981" },
    { name: "Images", value: 12, fill: "#f59e0b" },
];

const RECENT_ACTIVITY = [
    { action: "Analyse de conformité", doc: "Contrat SOGARA #247", time: "Il y a 5 min", type: "analysis" },
    { action: "Classification automatique", doc: "Rapport Q4 Finances", time: "Il y a 12 min", type: "classify" },
    { action: "Détection d'anomalie", doc: "Facture FV-2026-0901", time: "Il y a 28 min", type: "alert" },
    { action: "Tags IA appliqués", doc: "PV Conseil Jan. 2026", time: "Il y a 45 min", type: "tag" },
    { action: "Résumé généré", doc: "Note télétravail 2026", time: "Il y a 1h", type: "summary" },
];

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
    analysis: { icon: Shield, color: "text-emerald-400 bg-emerald-500/15" },
    classify: { icon: Folder, color: "text-cyan-400 bg-cyan-500/15" },
    alert: { icon: Zap, color: "text-amber-400 bg-amber-500/15" },
    tag: { icon: Tag, color: "text-violet-400 bg-violet-500/15" },
    summary: { icon: Brain, color: "text-blue-400 bg-blue-500/15" },
};

// ─── Custom Tooltip ──────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Animations ──────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AnalyticsIAPage() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-[1400px] mx-auto space-y-4"
            style={{ maxHeight: "calc(100vh - 180px)" }}
        >
            {/* ── Header ─────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Analytics IA</h1>
                        <p className="text-[11px] text-muted-foreground">
                            Vue d'ensemble de l'activité de l'intelligence artificielle
                        </p>
                    </div>
                </div>
                <Badge className="text-[10px] bg-cyan-500/15 text-cyan-300 border-cyan-500/20 gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Temps réel
                </Badge>
            </motion.div>

            {/* ── KPI Row ────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {KPI_DATA.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.label} className="glass border-white/5 overflow-hidden">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`h-8 w-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                                        <Icon className="h-4 w-4 text-current" style={{ color: `var(--tw-gradient-from)` }} />
                                    </div>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-medium ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                                        {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {kpi.change}
                                    </div>
                                </div>
                                <p className="text-lg font-bold">{kpi.value}</p>
                                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </motion.div>

            {/* ── Charts Row 1 ───────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Area Chart — Monthly AI Usage */}
                <Card className="glass border-white/5">
                    <CardHeader className="pb-0 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                            Utilisation IA mensuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={MONTHLY_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradAnalyses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradTags" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="analyses" name="Analyses" stroke="#06b6d4" strokeWidth={2} fill="url(#gradAnalyses)" />
                                <Area type="monotone" dataKey="tags" name="Tags" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradTags)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="flex items-center gap-4 mt-1 pl-2">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                                <span className="text-[10px] text-muted-foreground">Analyses</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-violet-400" />
                                <span className="text-[10px] text-muted-foreground">Tags</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bar Chart — Top Categories */}
                <Card className="glass border-white/5">
                    <CardHeader className="pb-0 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                            <Folder className="h-3.5 w-3.5 text-violet-400" />
                            Top catégories IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={TOP_CATEGORIES} layout="vertical" margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Documents" radius={[0, 4, 4, 0]} barSize={14}>
                                    {TOP_CATEGORIES.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Charts Row 2 ───────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Donut Chart — Doc Types */}
                <Card className="glass border-white/5">
                    <CardHeader className="pb-0 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-400" />
                            Types de documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <div className="flex items-center">
                            <ResponsiveContainer width="50%" height={130}>
                                <PieChart>
                                    <Pie
                                        data={DOC_TYPES}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={35}
                                        outerRadius={55}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {DOC_TYPES.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2 pl-2">
                                {DOC_TYPES.map((dt) => (
                                    <div key={dt.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: dt.fill }} />
                                            <span className="text-[11px]">{dt.name}</span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-mono">{dt.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="glass border-white/5">
                    <CardHeader className="pb-0 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            Activité récente IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-2 space-y-1">
                        {RECENT_ACTIVITY.map((act, i) => {
                            const cfg = ACTIVITY_ICONS[act.type];
                            const Icon = cfg.icon;
                            return (
                                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                                    <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${cfg.color}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium truncate">{act.action}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{act.doc}</p>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{act.time}</span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
