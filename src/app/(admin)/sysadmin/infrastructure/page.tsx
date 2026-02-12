// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Infrastructure
// Cloud Functions, Firebase stats
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Server,
    Globe,
    Zap,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    ArrowUpRight,
    Flame,
    Cloud,
    Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
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

const CLOUD_FUNCTIONS = [
    { name: "auth-webhook", status: "active" as const, region: "us-east-1", invocations: 12450, avgLatency: "45ms", errors: 3, runtime: "Node 20" },
    { name: "document-processor", status: "active" as const, region: "eu-west-1", invocations: 8923, avgLatency: "120ms", errors: 12, runtime: "Node 20" },
    { name: "archive-cron", status: "active" as const, region: "us-east-1", invocations: 720, avgLatency: "850ms", errors: 0, runtime: "Node 20" },
    { name: "notification-sender", status: "active" as const, region: "us-east-1", invocations: 3465, avgLatency: "32ms", errors: 1, runtime: "Node 20" },
    { name: "signature-verify", status: "inactive" as const, region: "eu-west-1", invocations: 0, avgLatency: "—", errors: 0, runtime: "Node 18" },
    { name: "analytics-aggregator", status: "active" as const, region: "us-east-1", invocations: 1580, avgLatency: "210ms", errors: 5, runtime: "Node 20" },
    { name: "backup-scheduler", status: "active" as const, region: "us-east-1", invocations: 48, avgLatency: "1.2s", errors: 0, runtime: "Node 20" },
    { name: "email-templates", status: "error" as const, region: "eu-west-1", invocations: 452, avgLatency: "95ms", errors: 87, runtime: "Node 18" },
];

const FIREBASE_STATS = [
    { label: "Auth Users", value: "2,847", change: "+124", trend: "up" as const },
    { label: "Firestore Reads", value: "1.2M", change: "+15%", trend: "up" as const },
    { label: "Firestore Writes", value: "340K", change: "-8%", trend: "down" as const },
    { label: "Storage Used", value: "2.4 TB", change: "+120 GB", trend: "up" as const },
    { label: "Bandwidth", value: "890 GB", change: "+45 GB", trend: "up" as const },
    { label: "Cloud Messaging", value: "45K", change: "+12%", trend: "up" as const },
];

const INVOCATION_CHART = [
    { fn: "auth-webhook", count: 12450 },
    { fn: "doc-processor", count: 8923 },
    { fn: "notifications", count: 3465 },
    { fn: "analytics", count: 1580 },
    { fn: "archive-cron", count: 720 },
    { fn: "email-tpl", count: 452 },
    { fn: "backup", count: 48 },
];

const fnStatusCfg = {
    active: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Actif" },
    inactive: { color: "text-muted-foreground", bg: "bg-white/5", label: "Inactif" },
    error: { color: "text-red-400", bg: "bg-red-500/10", label: "Erreur" },
};

export default function InfrastructurePage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Infrastructure</h1>
                <p className="text-sm text-muted-foreground mt-1">Cloud Functions, services & statistiques Firebase</p>
            </motion.div>

            {/* Firebase Stats */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    Firebase — Vue d&apos;ensemble
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    {FIREBASE_STATS.map((s) => (
                        <motion.div key={s.label} variants={fadeUp} className="glass-card rounded-xl p-4 text-center">
                            <p className="text-lg font-bold">{s.value}</p>
                            <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                            <Badge
                                variant="secondary"
                                className={`text-[9px] border-0 ${s.trend === "up"
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-red-500/15 text-red-400"
                                    }`}
                            >
                                {s.trend === "up" ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : null}
                                {s.change}
                            </Badge>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Invocations Chart + Cloud Functions Table */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
                {/* Chart */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-3">Invocations / fonction</h2>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={INVOCATION_CHART} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="fn" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={85} />
                                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-orange-400" />
                        Cloud Functions
                    </h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="text-left py-2 px-2 font-medium">Nom</th>
                                <th className="text-left py-2 px-2 font-medium">Statut</th>
                                <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Région</th>
                                <th className="text-right py-2 px-2 font-medium">Invocations</th>
                                <th className="text-right py-2 px-2 font-medium hidden md:table-cell">Latence moy.</th>
                                <th className="text-right py-2 px-2 font-medium">Erreurs</th>
                                <th className="text-left py-2 px-2 font-medium hidden lg:table-cell">Runtime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CLOUD_FUNCTIONS.map((fn) => {
                                const cfg = fnStatusCfg[fn.status];
                                return (
                                    <tr key={fn.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-2.5 px-2 font-mono font-medium">{fn.name}</td>
                                        <td className="py-2.5 px-2">
                                            <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0`}>
                                                {cfg.label}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{fn.region}</td>
                                        <td className="py-2.5 px-2 text-right font-mono">{fn.invocations.toLocaleString("fr")}</td>
                                        <td className="py-2.5 px-2 text-right text-muted-foreground hidden md:table-cell">{fn.avgLatency}</td>
                                        <td className={`py-2.5 px-2 text-right font-mono ${fn.errors > 10 ? "text-red-400" : fn.errors > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                                            {fn.errors}
                                        </td>
                                        <td className="py-2.5 px-2 text-muted-foreground hidden lg:table-cell">{fn.runtime}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
