// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Monitoring
// Real-time charts (simulated), uptime SLA
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Gauge,
    BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Mock data ──────────────────────────────────── */

const REQUESTS_60 = Array.from({ length: 60 }, (_, i) => ({
    time: `${60 - i}s`,
    value: Math.floor(80 + Math.random() * 120),
}));

const ERRORS_60 = Array.from({ length: 60 }, (_, i) => ({
    time: `${60 - i}s`,
    value: Math.floor(Math.random() * 8),
}));

const LATENCY_60 = Array.from({ length: 60 }, (_, i) => ({
    time: `${60 - i}s`,
    p50: Math.floor(15 + Math.random() * 20),
    p95: Math.floor(80 + Math.random() * 60),
    p99: Math.floor(150 + Math.random() * 100),
}));

const UPTIME_SERVICES = [
    { name: "API Gateway", uptime: 99.99, incidents: 0, lastDowntime: "N/A" },
    { name: "Convex Backend", uptime: 99.98, incidents: 1, lastDowntime: "2 fév — 2min" },
    { name: "Firebase Auth", uptime: 99.99, incidents: 0, lastDowntime: "N/A" },
    { name: "Supabase DB", uptime: 99.95, incidents: 2, lastDowntime: "8 fév — 12min" },
    { name: "Supabase Storage", uptime: 99.72, incidents: 4, lastDowntime: "Aujourd'hui — 8min" },
    { name: "Edge Functions", uptime: 99.97, incidents: 1, lastDowntime: "1 fév — 5min" },
    { name: "Redis Cache", uptime: 100, incidents: 0, lastDowntime: "N/A" },
    { name: "DNS / CDN", uptime: 99.99, incidents: 0, lastDowntime: "N/A" },
];

const UPTIME_30D = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        uptime: 99.5 + Math.random() * 0.5,
    };
});

function uptimeColor(v: number) {
    if (v >= 99.99) return "text-emerald-400";
    if (v >= 99.9) return "text-green-400";
    if (v >= 99.5) return "text-amber-400";
    return "text-red-400";
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="ml-auto font-medium">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function MonitoringPage() {
    const overallUptime = (UPTIME_SERVICES.reduce((a, s) => a + s.uptime, 0) / UPTIME_SERVICES.length).toFixed(3);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Monitoring</h1>
                <p className="text-sm text-muted-foreground mt-1">Performances en temps réel & SLA</p>
            </motion.div>

            {/* Summary KPIs */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Requêtes/min", value: "1,247", icon: TrendingUp, color: "text-orange-400" },
                    { label: "Erreurs/min", value: "4.2", icon: AlertTriangle, color: "text-amber-400" },
                    { label: "Latence P95", value: "112ms", icon: Gauge, color: "text-cyan-400" },
                    { label: "Uptime SLA", value: `${overallUptime}%`, icon: CheckCircle2, color: "text-emerald-400" },
                ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`h-4 w-4 ${kpi.color}`} />
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Real-time charts */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Requests */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-1">Requêtes / sec</h2>
                    <p className="text-[10px] text-muted-foreground mb-3">60 dernières secondes</p>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REQUESTS_60} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#gReq)" strokeWidth={1.5} name="req/s" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Errors */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-1">Erreurs / sec</h2>
                    <p className="text-[10px] text-muted-foreground mb-3">60 dernières secondes</p>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ERRORS_60} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#gErr)" strokeWidth={1.5} name="err/s" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latency Percentiles */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-1">Latence (ms)</h2>
                    <p className="text-[10px] text-muted-foreground mb-3">P50 · P95 · P99</p>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={LATENCY_60} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={1.5} dot={false} name="P50" />
                                <Line type="monotone" dataKey="p95" stroke="#f97316" strokeWidth={1.5} dot={false} name="P95" />
                                <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1.5} dot={false} name="P99" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* Uptime SLA */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4">
                <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        Uptime SLA par service — 30 jours
                    </h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="text-left py-2 px-2 font-medium">Service</th>
                                <th className="text-right py-2 px-2 font-medium">Uptime</th>
                                <th className="text-right py-2 px-2 font-medium">Incidents</th>
                                <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Dernier downtime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {UPTIME_SERVICES.map((svc) => (
                                <tr key={svc.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-2.5 px-2 font-medium">{svc.name}</td>
                                    <td className={`py-2.5 px-2 text-right font-mono font-bold ${uptimeColor(svc.uptime)}`}>
                                        {svc.uptime.toFixed(2)}%
                                    </td>
                                    <td className={`py-2.5 px-2 text-right ${svc.incidents > 2 ? "text-red-400" : svc.incidents > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                                        {svc.incidents}
                                    </td>
                                    <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{svc.lastDowntime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Uptime trend */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-3">Uptime global — 30j</h2>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={UPTIME_30D} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gUptime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis domain={[99, 100]} tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="url(#gUptime)" strokeWidth={2} name="Uptime %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
