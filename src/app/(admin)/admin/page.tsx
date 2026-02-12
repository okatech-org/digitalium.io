// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin Dashboard
// 4 KPIs, storage gauge, activity chart,
// activity feed, quick access cards
// ═══════════════════════════════════════════════

"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
    Users,
    Building2,
    Activity,
    Wallet,
    Target,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Archive,
    Shield,
    UserPlus,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ──────────────────────────────────── */

const KPI_DATA = [
    {
        label: "Total Utilisateurs",
        value: 2847,
        icon: Users,
        trend: +12.3,
        suffix: "",
        color: "from-digitalium-blue to-blue-400",
    },
    {
        label: "Organisations actives",
        value: 156,
        icon: Building2,
        trend: +8.1,
        suffix: "",
        color: "from-digitalium-violet to-purple-400",
    },
    {
        label: "Actions ce mois",
        value: 34521,
        icon: Activity,
        trend: +23.5,
        suffix: "",
        color: "from-emerald-500 to-green-400",
    },
    {
        label: "Revenus",
        value: 18450000,
        icon: Wallet,
        trend: +5.2,
        suffix: " XAF",
        color: "from-amber-500 to-yellow-400",
    },
];

const STORAGE = { used: 2.4, total: 10, unit: "TB" };

// 30-day chart data
const CHART_DATA = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        utilisateurs: Math.floor(15 + Math.random() * 30),
        documents: Math.floor(40 + Math.random() * 80),
        archives: Math.floor(10 + Math.random() * 25),
    };
});

const RECENT_ACTIVITY = [
    { name: "Ornella DOUMBA", action: "a créé une organisation", resource: "ASCOMA Gabon", time: "Il y a 5 min", icon: Building2, color: "text-digitalium-violet" },
    { name: "Jean-Paul MBOUMBA", action: "a uploadé un document", resource: "Contrat_2026.pdf", time: "Il y a 12 min", icon: FileText, color: "text-digitalium-blue" },
    { name: "Marie NDONG", action: "a archivé un dossier", resource: "Audit Q4 2025", time: "Il y a 23 min", icon: Archive, color: "text-emerald-400" },
    { name: "Patrick OBIANG", action: "a modifié les rôles", resource: "Équipe Finance", time: "Il y a 45 min", icon: Shield, color: "text-amber-400" },
    { name: "Système", action: "Nouveau lead enregistré", resource: "Ministère Pêche", time: "Il y a 1h", icon: Target, color: "text-red-400" },
    { name: "Claire MOUSSAVOU", action: "a créé un compte", resource: "claire@exemple.ga", time: "Il y a 2h", icon: UserPlus, color: "text-cyan-400" },
];

const QUICK_ACCESS = [
    { label: "Leads & Contacts", href: "/admin/leads", icon: Target, count: 7, color: "from-red-500/20 to-orange-500/20 border-red-500/30" },
    { label: "Utilisateurs", href: "/admin/users", icon: Users, count: 2847, color: "from-digitalium-blue/20 to-blue-500/20 border-digitalium-blue/30" },
    { label: "Abonnements", href: "/admin/subscriptions", icon: CreditCard, count: 89, color: "from-digitalium-violet/20 to-purple-500/20 border-digitalium-violet/30" },
    { label: "Organisations", href: "/admin/organizations", icon: Building2, count: 156, color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30" },
];

/* ─── Animation helpers ──────────────────────────── */

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ─── Animated Counter ───────────────────────────── */

function Counter({ to, suffix = "", duration = 1.2 }: { to: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        const start = Date.now();
        const end = start + duration * 1000;

        const tick = () => {
            const now = Date.now();
            const progress = Math.min((now - start) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * to));
            if (now < end) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [inView, to, duration]);

    const formatted = count >= 1000000
        ? `${(count / 1000000).toFixed(1)}M`
        : count >= 1000
            ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
            : count.toLocaleString("fr-FR");

    return <span ref={ref}>{formatted}{suffix}</span>;
}

/* ─── Storage Gauge (SVG donut) ──────────────────── */

function StorageGauge({ used, total, unit }: { used: number; total: number; unit: string }) {
    const pct = (used / total) * 100;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    const ref = useRef<SVGSVGElement>(null);
    const inView = useInView(ref, { once: true });

    return (
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
                Stockage Plateforme
            </p>
            <svg ref={ref} width="150" height="150" viewBox="0 0 150 150" className="drop-shadow-lg">
                {/* Background ring */}
                <circle
                    cx="75" cy="75" r={radius}
                    fill="none" stroke="currentColor"
                    className="text-white/5"
                    strokeWidth="12"
                />
                {/* Progress ring */}
                <motion.circle
                    cx="75" cy="75" r={radius}
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={inView ? { strokeDashoffset: offset } : {}}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    transform="rotate(-90 75 75)"
                />
                <defs>
                    <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="hsl(217,91%,60%)" />
                        <stop offset="100%" stopColor="hsl(263,70%,50%)" />
                    </linearGradient>
                </defs>
                <text x="75" y="70" textAnchor="middle" className="fill-foreground text-2xl font-bold">
                    {used}
                </text>
                <text x="75" y="92" textAnchor="middle" className="fill-muted-foreground text-xs">
                    / {total} {unit}
                </text>
            </svg>
            <p className="text-xs text-muted-foreground mt-3">{pct.toFixed(0)}% utilisé</p>
        </div>
    );
}

/* ─── Custom Chart Tooltip ───────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl">
            <p className="font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground capitalize">{p.name}</span>
                    <span className="ml-auto font-medium text-foreground">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════ */

export default function AdminDashboardPage() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6 max-w-[1400px] mx-auto"
        >
            {/* ── Title ── */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">
                    Tableau de bord
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Vue d&apos;ensemble de la plateforme DIGITALIUM
                </p>
            </motion.div>

            {/* ── KPI Cards ── */}
            <motion.div
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
                {KPI_DATA.map((kpi) => {
                    const Icon = kpi.icon;
                    const trendUp = kpi.trend > 0;
                    return (
                        <motion.div
                            key={kpi.label}
                            variants={fadeUp}
                            className="glass-card rounded-2xl p-5 group hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`text-[10px] font-semibold px-1.5 ${trendUp
                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                        : "bg-red-500/15 text-red-400 border-red-500/30"
                                        }`}
                                >
                                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(kpi.trend)}%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">
                                <Counter to={kpi.value} suffix={kpi.suffix} />
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ── Chart + Storage Gauge ── */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
                {/* Chart */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold">Activité — 30 derniers jours</h2>
                            <p className="text-xs text-muted-foreground">Utilisateurs, documents, archives</p>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gUtilisateurs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(217,91%,60%)" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gDocuments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(263,70%,50%)" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="hsl(263,70%,50%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gArchives" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(160,60%,50%)" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="hsl(160,60%,50%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={4}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={6}
                                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                />
                                <Area type="monotone" dataKey="utilisateurs" stroke="hsl(217,91%,60%)" fill="url(#gUtilisateurs)" strokeWidth={2} />
                                <Area type="monotone" dataKey="documents" stroke="hsl(263,70%,50%)" fill="url(#gDocuments)" strokeWidth={2} />
                                <Area type="monotone" dataKey="archives" stroke="hsl(160,60%,50%)" fill="url(#gArchives)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Storage Gauge */}
                <StorageGauge {...STORAGE} />
            </motion.div>

            {/* ── Activity Feed + Quick Access ── */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
                {/* Activity Feed */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold mb-4">Activité récente</h2>
                    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                        {RECENT_ACTIVITY.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                                >
                                    <div className={`h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs">
                                            <span className="font-semibold text-foreground">{item.name}</span>
                                            {" "}
                                            <span className="text-muted-foreground">{item.action}</span>
                                            {" — "}
                                            <span className="text-foreground/80">{item.resource}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">
                                        {item.time}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Access */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold">Accès rapides</h2>
                    {QUICK_ACCESS.map((qa) => {
                        const Icon = qa.icon;
                        return (
                            <Link key={qa.href} href={qa.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer border bg-gradient-to-r ${qa.color} hover:shadow-lg transition-shadow`}
                                >
                                    <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{qa.label}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] bg-white/10 border-0">
                                        {qa.count.toLocaleString("fr-FR")}
                                    </Badge>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
