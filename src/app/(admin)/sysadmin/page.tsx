// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin Dashboard
// Service health, system metrics, alerts, latency chart
// ═══════════════════════════════════════════════

"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Cpu,
    MemoryStick,
    HardDrive,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Shield,
    Clock,
    Database,
    Server,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";

/* ─── Mock data ──────────────────────────────────── */

const SERVICES = [
    { name: "Convex", status: "operational" as const, latency: "12ms", region: "us-east-1", uptime: "99.98%" },
    { name: "Supabase", status: "operational" as const, latency: "34ms", region: "eu-west-1", uptime: "99.95%" },
    { name: "Firebase Auth", status: "operational" as const, latency: "89ms", region: "global", uptime: "99.99%" },
    { name: "Supabase Storage", status: "degraded" as const, latency: "245ms", region: "eu-west-1", uptime: "99.72%" },
    { name: "Edge Functions", status: "operational" as const, latency: "18ms", region: "us-east-1", uptime: "99.97%" },
    { name: "Redis Cache", status: "operational" as const, latency: "2ms", region: "us-east-1", uptime: "100%" },
];

const METRICS = [
    { label: "CPU", value: 34, max: 100, unit: "%", icon: Cpu, color: "from-orange-500 to-red-500" },
    { label: "RAM", value: 6.2, max: 16, unit: "GB", icon: MemoryStick, color: "from-blue-500 to-cyan-500" },
    { label: "Stockage", value: 2.4, max: 10, unit: "TB", icon: HardDrive, color: "from-violet-500 to-purple-500" },
    { label: "Requêtes/min", value: 1247, max: 5000, unit: "req", icon: Zap, color: "from-emerald-500 to-green-500" },
];

const ALERTS = [
    { severity: "warning" as const, message: "Supabase Storage latency élevée (>200ms)", time: "Il y a 2 min", service: "Supabase" },
    { severity: "info" as const, message: "Mise à jour Convex déployée v2.14.1", time: "Il y a 15 min", service: "Convex" },
    { severity: "warning" as const, message: "Rate limit atteint sur /api/documents (429)", time: "Il y a 32 min", service: "Edge Functions" },
    { severity: "success" as const, message: "Sauvegarde quotidienne terminée — 847 tables", time: "Il y a 1h", service: "Supabase" },
    { severity: "error" as const, message: "Connexion Redis timeout (retry 3/5)", time: "Il y a 2h", service: "Redis" },
    { severity: "info" as const, message: "Certificat SSL renouvelé — expire dans 364j", time: "Il y a 3h", service: "Infrastructure" },
];

// 30 data points for latency chart
const LATENCY_DATA = Array.from({ length: 30 }, (_, i) => ({
    time: `${30 - i}m`,
    convex: Math.floor(8 + Math.random() * 12),
    supabase: Math.floor(25 + Math.random() * 20),
    firebase: Math.floor(60 + Math.random() * 50),
}));

const REQUESTS_DATA = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    success: Math.floor(800 + Math.random() * 400),
    errors: Math.floor(5 + Math.random() * 25),
}));

/* ─── Helpers ─────────────────────────────────────── */

const statusConfig = {
    operational: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Opérationnel" },
    degraded: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: "Dégradé" },
    down: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "En panne" },
};

const severityConfig = {
    error: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
    warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
    info: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
    success: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Metric Gauge ───────────────────────────────── */

function MetricGauge({ label, value, max, unit, icon: Icon, color }: {
    label: string; value: number; max: number; unit: string; icon: React.ElementType; color: string;
}) {
    const pct = (value / max) * 100;
    return (
        <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-bold">{value}{unit === "%" || unit === "GB" || unit === "TB" ? "" : " "}{unit}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{pct.toFixed(0)}% de {max}{unit === "req" ? " max" : ` ${unit}`}</p>
        </div>
    );
}

/* ─── Chart Tooltip ──────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl">
            <p className="font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="ml-auto font-medium text-foreground">{p.value}ms</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════ */

export default function SysAdminDashboardPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Dashboard Système</h1>
                <p className="text-sm text-muted-foreground mt-1">État des services & métriques en temps réel</p>
            </motion.div>

            {/* Service Health */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Server className="h-4 w-4 text-orange-400" />
                    État des services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {SERVICES.map((svc) => {
                        const cfg = statusConfig[svc.status];
                        const StatusIcon = cfg.icon;
                        return (
                            <motion.div
                                key={svc.name}
                                variants={fadeUp}
                                className={`glass-card rounded-xl p-4 flex items-center gap-3 border ${svc.status === "degraded" ? "border-amber-500/20" : "border-transparent"}`}
                            >
                                <div className={`h-9 w-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                    <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">{svc.name}</p>
                                        <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0`}>
                                            {cfg.label}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {svc.region} · {svc.latency} · SLA {svc.uptime}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* System Metrics */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-orange-400" />
                    Métriques système
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {METRICS.map((m) => (
                        <MetricGauge key={m.label} {...m} />
                    ))}
                </div>
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Latency Chart */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold">Latence API — 30 dernières minutes</h2>
                        <p className="text-xs text-muted-foreground">Convex, Supabase, Firebase</p>
                    </div>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={LATENCY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gConvex" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gSupabase" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gFirebase" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="convex" stroke="#f97316" fill="url(#gConvex)" strokeWidth={2} name="Convex" />
                                <Area type="monotone" dataKey="supabase" stroke="#22c55e" fill="url(#gSupabase)" strokeWidth={2} name="Supabase" />
                                <Area type="monotone" dataKey="firebase" stroke="#eab308" fill="url(#gFirebase)" strokeWidth={2} name="Firebase" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Requests Chart */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold">Requêtes — 24 dernières heures</h2>
                        <p className="text-xs text-muted-foreground">Succès vs erreurs</p>
                    </div>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={REQUESTS_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval={3} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="success" fill="#22c55e" radius={[2, 2, 0, 0]} name="Succès" />
                                <Bar dataKey="errors" fill="#ef4444" radius={[2, 2, 0, 0]} name="Erreurs" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* Alerts */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    Alertes récentes
                </h2>
                <div className="glass-card rounded-2xl p-4 space-y-1">
                    {ALERTS.map((alert, i) => {
                        const cfg = severityConfig[alert.severity];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.06 }}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.bg}`}
                            >
                                <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs">
                                        <span className={`font-semibold ${cfg.color}`}>[{alert.service}]</span>{" "}
                                        <span className="text-foreground/90">{alert.message}</span>
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">{alert.time}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
