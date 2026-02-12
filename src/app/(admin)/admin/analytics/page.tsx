// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Analytics
// Graphiques d'utilisation, engagement,
// tendances par module, rétention
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    FileText,
    Archive,
    PenTool,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Eye,
    Calendar,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ──────────────────────────────────── */

const ENGAGEMENT_KPIS = [
    { label: "Sessions / jour", value: "4 521", trend: +14.2, icon: Activity, color: "from-blue-600 to-cyan-500" },
    { label: "Temps moyen", value: "12m 34s", trend: +6.8, icon: Clock, color: "from-violet-600 to-purple-500" },
    { label: "Pages / session", value: "8.2", trend: +3.1, icon: Eye, color: "from-emerald-600 to-green-500" },
    { label: "Rétention 30j", value: "78%", trend: +2.4, icon: Users, color: "from-amber-600 to-orange-500" },
];

const USAGE_DATA = Array.from({ length: 12 }, (_, i) => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    return {
        month: months[i],
        documents: Math.floor(800 + Math.random() * 600 + i * 50),
        archives: Math.floor(200 + Math.random() * 200 + i * 20),
        signatures: Math.floor(100 + Math.random() * 150 + i * 15),
    };
});

const MODULE_USAGE = [
    { name: "iDocument", value: 45, color: "#3b82f6" },
    { name: "iArchive", value: 28, color: "#f59e0b" },
    { name: "iSignature", value: 20, color: "#8b5cf6" },
    { name: "Autres", value: 7, color: "#6b7280" },
];

const DAILY_ACTIVE = Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    users: Math.floor(120 + Math.random() * 80 + Math.sin(i / 3) * 30),
    newUsers: Math.floor(5 + Math.random() * 15),
}));

const TOP_FEATURES = [
    { feature: "Création document", usage: 2340, change: "+12%", module: "iDocument" },
    { feature: "Upload fichier", usage: 1890, change: "+8%", module: "iDocument" },
    { feature: "Archivage fiscal", usage: 1456, change: "+23%", module: "iArchive" },
    { feature: "Signature électronique", usage: 987, change: "+34%", module: "iSignature" },
    { feature: "Partage document", usage: 876, change: "+5%", module: "iDocument" },
    { feature: "Recherche archives", usage: 654, change: "+11%", module: "iArchive" },
    { feature: "Workflow signature", usage: 432, change: "+45%", module: "iSignature" },
    { feature: "Export PDF", usage: 321, change: "-2%", module: "iDocument" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Custom Tooltip ─────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl">
            <p className="font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground capitalize">{p.name}</span>
                    <span className="ml-auto font-medium text-foreground">{p.value.toLocaleString("fr-FR")}</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   ANALYTICS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminAnalyticsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-400" />
                        Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Données d&apos;utilisation et de performance de la plateforme
                    </p>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-white/5 border-0 gap-1">
                    <Calendar className="h-3 w-3" /> 30 derniers jours
                </Badge>
            </motion.div>

            {/* Engagement KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {ENGAGEMENT_KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    const trendUp = kpi.trend > 0;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <Badge variant="secondary" className={`text-[9px] border-0 ${trendUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(kpi.trend)}%
                                </Badge>
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                {/* Usage by Module Chart */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold">Utilisation par module — 12 mois</h2>
                        <p className="text-xs text-muted-foreground">Documents, archives, signatures créés</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={USAGE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gDocs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gArch" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gSig" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="documents" stroke="#3b82f6" fill="url(#gDocs)" strokeWidth={2} name="Documents" />
                                <Area type="monotone" dataKey="archives" stroke="#f59e0b" fill="url(#gArch)" strokeWidth={2} name="Archives" />
                                <Area type="monotone" dataKey="signatures" stroke="#8b5cf6" fill="url(#gSig)" strokeWidth={2} name="Signatures" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Module Distribution Pie */}
                <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                    <h2 className="text-sm font-semibold mb-4 self-start">Répartition par module</h2>
                    <div className="h-[200px] w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MODULE_USAGE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {MODULE_USAGE.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 w-full">
                        {MODULE_USAGE.map((m) => (
                            <div key={m.name} className="flex items-center gap-2 text-xs">
                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                                <span className="text-muted-foreground">{m.name}</span>
                                <span className="ml-auto font-semibold">{m.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* DAU chart + Top features */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Daily Active Users */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold">Utilisateurs actifs quotidiens</h2>
                        <p className="text-xs text-muted-foreground">30 derniers jours</p>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DAILY_ACTIVE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="users" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Utilisateurs" />
                                <Bar dataKey="newUsers" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Nouveaux" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Features */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        Fonctionnalités les plus utilisées
                    </h2>
                    <div className="space-y-2">
                        {TOP_FEATURES.map((f, i) => {
                            const maxUsage = TOP_FEATURES[0].usage;
                            const pct = (f.usage / maxUsage) * 100;
                            const changePositive = f.change.startsWith("+");
                            return (
                                <div key={f.feature} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground w-4 text-right">{i + 1}.</span>
                                            <span className="font-medium">{f.feature}</span>
                                            <Badge variant="secondary" className="text-[8px] bg-white/5 border-0">
                                                {f.module}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">{f.usage.toLocaleString("fr-FR")}</span>
                                            <span className={`text-[10px] ${changePositive ? "text-emerald-400" : "text-red-400"}`}>
                                                {f.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
