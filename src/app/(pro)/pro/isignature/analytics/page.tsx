"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Analytics
// Signature metrics, charts & insights (real data)
// ═══════════════════════════════════════════════

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    PenTool,
    CheckCircle2,
    XCircle,
    Timer,
    Clock,
    TrendingUp,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Chart Tooltip ────────────────────────────

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl bg-zinc-900/90 backdrop-blur-sm">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                    />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-medium">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Month label helper ────────────────────────

const MONTH_LABELS: Record<string, string> = {
    "01": "Jan",
    "02": "Fev",
    "03": "Mar",
    "04": "Avr",
    "05": "Mai",
    "06": "Juin",
    "07": "Juil",
    "08": "Aout",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
};

function formatMonthLabel(isoMonth: string): string {
    const parts = isoMonth.split("-");
    if (parts.length < 2) return isoMonth;
    const monthNum = parts[1];
    return MONTH_LABELS[monthNum] ?? isoMonth;
}

// ─── Component ────────────────────────────────

export default function SignatureAnalyticsPage() {
    const { convexOrgId } = useConvexOrgId();

    const analytics = useQuery(
        api.signatures.getSignatureAnalytics,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // Transform byMonth data for the chart
    const monthlyData = useMemo(() => {
        if (!analytics?.byMonth) return [];
        return Object.entries(analytics.byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({
                month: formatMonthLabel(month),
                created: data.created,
                completed: data.completed,
            }));
    }, [analytics?.byMonth]);

    // Status distribution for pie chart
    const statusDistribution = useMemo(() => {
        if (!analytics) return [];
        return [
            { name: "Completees", value: analytics.completed, color: "#10b981" },
            { name: "En attente", value: analytics.pending, color: "#f59e0b" },
            { name: "Expirees", value: analytics.expired, color: "#6b7280" },
        ].filter((item) => item.value > 0);
    }, [analytics]);

    // KPI cards config
    const kpis = useMemo(() => {
        if (!analytics)
            return [
                { label: "Total signatures", value: "--", icon: PenTool, color: "from-violet-600 to-indigo-500" },
                { label: "Temps moyen", value: "--", icon: Timer, color: "from-emerald-600 to-teal-500" },
                { label: "Taux de completion", value: "--", icon: CheckCircle2, color: "from-blue-600 to-cyan-500" },
                { label: "Expirees", value: "--", icon: AlertTriangle, color: "from-rose-600 to-pink-500" },
            ];
        return [
            {
                label: "Total signatures",
                value: String(analytics.total),
                icon: PenTool,
                color: "from-violet-600 to-indigo-500",
            },
            {
                label: "Temps moyen",
                value: analytics.avgTimeDays > 0 ? `${analytics.avgTimeDays}j` : "N/A",
                icon: Timer,
                color: "from-emerald-600 to-teal-500",
            },
            {
                label: "Taux de completion",
                value: `${analytics.completionRate}%`,
                icon: CheckCircle2,
                color: "from-blue-600 to-cyan-500",
            },
            {
                label: "Expirees",
                value: String(analytics.expired),
                icon: AlertTriangle,
                color: "from-rose-600 to-pink-500",
            },
        ];
    }, [analytics]);

    // Loading state
    if (analytics === undefined) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                    <p className="text-sm text-muted-foreground">
                        Chargement des analytics...
                    </p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-xl font-bold">
                            Analytics Signature
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Suivi des performances et insights
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div
                                    className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}
                                >
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {kpi.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Additional metric cards */}
            {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs text-muted-foreground">
                                Completees
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">
                            {analytics.completed}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                            <span className="text-xs text-muted-foreground">
                                En attente
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-amber-400">
                            {analytics.pending}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.21 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-violet-400" />
                            <span className="text-xs text-muted-foreground">
                                Taux de completion
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-violet-400">
                            {analytics.completionRate}%
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Monthly Signatures Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">
                        Volume mensuel de signatures
                    </h3>
                    <p className="text-[10px] text-zinc-500 mb-4">
                        Signatures creees vs completees (6 derniers mois)
                    </p>
                    <div className="h-[240px]">
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barGap={2}>
                                    <defs>
                                        <linearGradient
                                            id="gCreated"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#8b5cf6"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#6366f1"
                                                stopOpacity={0.4}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="gCompleted"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#10b981"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#059669"
                                                stopOpacity={0.4}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(255,255,255,0.04)"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10, fill: "#71717a" }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#71717a" }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="created"
                                        fill="url(#gCreated)"
                                        radius={[4, 4, 0, 0]}
                                        name="Creees"
                                    />
                                    <Bar
                                        dataKey="completed"
                                        fill="url(#gCompleted)"
                                        radius={[4, 4, 0, 0]}
                                        name="Completees"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-zinc-500">
                                Aucune donnee pour cette periode
                            </div>
                        )}
                    </div>
                    {/* Accessible data table for screen readers */}
                    <table className="sr-only">
                        <caption>Signatures par mois</caption>
                        <thead><tr><th>Mois</th><th>Cr&eacute;&eacute;es</th><th>Compl&eacute;t&eacute;es</th></tr></thead>
                        <tbody>
                            {monthlyData.map((m) => (
                                <tr key={m.month}><td>{m.month}</td><td>{m.created}</td><td>{m.completed}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Status Distribution Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">
                        Repartition des statuts
                    </h3>
                    <p className="text-[10px] text-zinc-500 mb-3">
                        Vue d&apos;ensemble
                    </p>
                    <div className="h-[160px]">
                        {statusDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {statusDistribution.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-zinc-500">
                                Aucune donnee
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 mt-2">
                        {statusDistribution.map((s) => (
                            <div
                                key={s.name}
                                className="flex items-center gap-1.5"
                            >
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: s.color }}
                                />
                                <span className="text-[10px] text-zinc-400 truncate">
                                    {s.name}
                                </span>
                                <span className="text-[10px] font-medium ml-auto">
                                    {s.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Accessible data table for screen readers */}
                    <table className="sr-only">
                        <caption>Distribution des statuts</caption>
                        <thead><tr><th>Statut</th><th>Nombre</th></tr></thead>
                        <tbody>
                            {statusDistribution.map((s) => (
                                <tr key={s.name}><td>{s.name}</td><td>{s.value}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>

            {/* Summary table */}
            {analytics && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">
                        Resume par mois
                    </h3>
                    <p className="text-[10px] text-zinc-500 mb-4">
                        Derniers 6 mois
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-2 px-3 text-[10px] text-zinc-500 font-medium">
                                        Mois
                                    </th>
                                    <th className="text-right py-2 px-3 text-[10px] text-zinc-500 font-medium">
                                        Creees
                                    </th>
                                    <th className="text-right py-2 px-3 text-[10px] text-zinc-500 font-medium">
                                        Completees
                                    </th>
                                    <th className="text-right py-2 px-3 text-[10px] text-zinc-500 font-medium">
                                        Taux
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((row) => {
                                    const rate =
                                        row.created > 0
                                            ? Math.round(
                                                  (row.completed / row.created) *
                                                      100
                                              )
                                            : 0;
                                    return (
                                        <tr
                                            key={row.month}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                                        >
                                            <td className="py-2.5 px-3 font-medium">
                                                {row.month}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                {row.created}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-emerald-400">
                                                {row.completed}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[9px] border-0 ${
                                                        rate >= 80
                                                            ? "bg-emerald-500/15 text-emerald-400"
                                                            : rate >= 50
                                                              ? "bg-amber-500/15 text-amber-400"
                                                              : "bg-red-500/15 text-red-400"
                                                    }`}
                                                >
                                                    {rate}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {monthlyData.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-8 text-center text-zinc-500"
                                        >
                                            Aucune donnee disponible
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
