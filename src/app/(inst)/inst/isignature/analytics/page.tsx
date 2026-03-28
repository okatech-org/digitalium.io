"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Analytics
// Signature metrics, charts & insights
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    PenTool,
    CheckCircle2,
    XCircle,
    Timer,
} from "lucide-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Mock Data ─────────────────────────────────

const KPIS = [
    { label: "Signatures ce mois", value: "47", trend: +12.5, icon: PenTool, color: "from-violet-600 to-indigo-500" },
    { label: "Temps moyen signature", value: "1.8j", trend: -8.2, icon: Timer, color: "from-emerald-600 to-teal-500" },
    { label: "Taux de complétion", value: "92%", trend: +3.1, icon: CheckCircle2, color: "from-blue-600 to-cyan-500" },
    { label: "Refus ce mois", value: "4", trend: -25.0, icon: XCircle, color: "from-rose-600 to-pink-500" },
];

const MONTHLY_DATA = [
    { month: "Sep", signatures: 28, completed: 25, refused: 3 },
    { month: "Oct", signatures: 35, completed: 32, refused: 2 },
    { month: "Nov", signatures: 42, completed: 38, refused: 4 },
    { month: "Déc", signatures: 31, completed: 29, refused: 2 },
    { month: "Jan", signatures: 38, completed: 35, refused: 3 },
    { month: "Fév", signatures: 47, completed: 43, refused: 4 },
];

const STATUS_DISTRIBUTION = [
    { name: "Signés", value: 43, color: "#10b981" },
    { name: "En attente", value: 12, color: "#f59e0b" },
    { name: "Refusés", value: 4, color: "#ef4444" },
    { name: "Expirés", value: 2, color: "#6b7280" },
];

const SIGNER_PERFORMANCE = [
    { name: "D. Nguema", signed: 15, avgDays: 1.2 },
    { name: "M. Obame", signed: 12, avgDays: 0.8 },
    { name: "A. Gondjout", signed: 9, avgDays: 2.1 },
    { name: "C. Mboumba", signed: 8, avgDays: 1.5 },
    { name: "O. Doumba", signed: 6, avgDays: 3.2 },
];

const DAILY_ACTIVITY = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    signatures: Math.floor(Math.random() * 5) + 1,
    views: Math.floor(Math.random() * 12) + 3,
}));

const WORKFLOW_USAGE = [
    { name: "Validation Manager", count: 18, color: "#8b5cf6" },
    { name: "Double Approbation", count: 12, color: "#10b981" },
    { name: "Circuit DG", count: 8, color: "#f59e0b" },
    { name: "Validation Juridique", count: 5, color: "#ec4899" },
    { name: "Custom", count: 4, color: "#6366f1" },
];

// ─── Chart Tooltips ─────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-medium">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Component ─────────────────────────────────

export default function SignatureAnalyticsPage() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Analytics Signature</h1>
                        <p className="text-xs text-muted-foreground">Suivi des performances et insights</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.02] border border-white/5">
                    {(["7d", "30d", "90d"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${period === p
                                    ? "bg-violet-500/20 text-violet-300"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            {p === "7d" ? "7 jours" : p === "30d" ? "30 jours" : "90 jours"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {KPIS.map((kpi, i) => {
                    const Icon = kpi.icon;
                    const trendUp = kpi.trend > 0;
                    const trendGood = kpi.label.includes("Refus") ? !trendUp : (kpi.label.includes("Temps") ? !trendUp : trendUp);
                    return (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`text-[9px] border-0 ${trendGood ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
                                >
                                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(kpi.trend)}%
                                </Badge>
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Monthly Signatures Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">Volume mensuel de signatures</h3>
                    <p className="text-[10px] text-zinc-500 mb-4">Signatures envoyées vs complétées</p>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MONTHLY_DATA} barGap={2}>
                                <defs>
                                    <linearGradient id="gSig" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                                    </linearGradient>
                                    <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="signatures" fill="url(#gSig)" radius={[4, 4, 0, 0]} name="Envoyées" />
                                <Bar dataKey="completed" fill="url(#gComp)" radius={[4, 4, 0, 0]} name="Complétées" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Status Distribution Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">Répartition des statuts</h3>
                    <p className="text-[10px] text-zinc-500 mb-3">Ce mois</p>
                    <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={STATUS_DISTRIBUTION}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {STATUS_DISTRIBUTION.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {STATUS_DISTRIBUTION.map((s) => (
                            <div key={s.name} className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                <span className="text-[10px] text-zinc-400 truncate">{s.name}</span>
                                <span className="text-[10px] font-medium ml-auto">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Daily Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">Activité quotidienne</h3>
                    <p className="text-[10px] text-zinc-500 mb-4">Signatures et consultations ce mois</p>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={DAILY_ACTIVITY}>
                                <defs>
                                    <linearGradient id="gDaily" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="views" stroke="#06b6d4" fill="url(#gViews)" strokeWidth={1.5} name="Consultations" />
                                <Area type="monotone" dataKey="signatures" stroke="#8b5cf6" fill="url(#gDaily)" strokeWidth={2} name="Signatures" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Workflow Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">Circuits les plus utilisés</h3>
                    <p className="text-[10px] text-zinc-500 mb-4">Top 5 ce mois</p>
                    <div className="space-y-3">
                        {WORKFLOW_USAGE.map((wf, i) => {
                            const maxCount = Math.max(...WORKFLOW_USAGE.map((w) => w.count));
                            return (
                                <div key={wf.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">{wf.name}</span>
                                        <span className="text-[10px] text-zinc-400">{wf.count} utilisations</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(wf.count / maxCount) * 100}%` }}
                                            transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: wf.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Signer Performance Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
                <h3 className="text-sm font-semibold mb-1">Performance des signataires</h3>
                <p className="text-[10px] text-zinc-500 mb-4">Classement par réactivité</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-2 px-3 text-[10px] text-zinc-500 font-medium">#</th>
                                <th className="text-left py-2 px-3 text-[10px] text-zinc-500 font-medium">Signataire</th>
                                <th className="text-right py-2 px-3 text-[10px] text-zinc-500 font-medium">Documents signés</th>
                                <th className="text-right py-2 px-3 text-[10px] text-zinc-500 font-medium">Temps moyen</th>
                                <th className="text-right py-2 px-3 text-[10px] text-zinc-500 font-medium">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SIGNER_PERFORMANCE.map((signer, i) => {
                                const score = Math.round(Math.max(0, 100 - signer.avgDays * 20));
                                return (
                                    <tr key={signer.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                        <td className="py-2.5 px-3">
                                            <span className={`text-[10px] font-bold ${i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-500"}`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                    <span className="text-[8px] text-violet-300 font-bold">
                                                        {signer.name.split(" ").map((n) => n[0]).join("")}
                                                    </span>
                                                </div>
                                                <span className="font-medium">{signer.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-medium">{signer.signed}</td>
                                        <td className="py-2.5 px-3 text-right">
                                            <span className={signer.avgDays <= 1.5 ? "text-emerald-400" : signer.avgDays <= 2.5 ? "text-amber-400" : "text-red-400"}>
                                                {signer.avgDays}j
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono w-6 text-right">{score}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
