"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iAsted: Analytics & Insights
// Document health, compliance, team productivity
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    ArrowUpRight,
    Shield,
    FileText,
    Archive,
    PenTool,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Search,
    Bot,
    Brain,
} from "lucide-react";
import {
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Mock Data ─────────────────────────────────

const HEALTH_SCORE = 87;

const HEALTH_BREAKDOWN = [
    { metric: "Certificats", value: 94, full: 100 },
    { metric: "Archives", value: 91, full: 100 },
    { metric: "Signatures", value: 88, full: 100 },
    { metric: "Rétention", value: 76, full: 100 },
    { metric: "Conformité", value: 92, full: 100 },
    { metric: "Intégrité", value: 98, full: 100 },
];

const RADAR_DATA = [
    { subject: "Documents", A: 85, fullMark: 100 },
    { subject: "Archives", A: 91, fullMark: 100 },
    { subject: "Signatures", A: 88, fullMark: 100 },
    { subject: "Conformité", A: 92, fullMark: 100 },
    { subject: "Sécurité", A: 95, fullMark: 100 },
    { subject: "Collaboration", A: 78, fullMark: 100 },
];

const TREND_DATA = [
    { month: "Sep", documents: 15, archives: 8, signatures: 28 },
    { month: "Oct", documents: 22, archives: 11, signatures: 35 },
    { month: "Nov", documents: 18, archives: 14, signatures: 42 },
    { month: "Déc", documents: 12, archives: 9, signatures: 31 },
    { month: "Jan", documents: 20, archives: 13, signatures: 38 },
    { month: "Fév", documents: 18, archives: 12, signatures: 47 },
];

const TEAM_PRODUCTIVITY = [
    { name: "D. Nguema", docs: 8, archives: 4, signatures: 15, score: 95 },
    { name: "M. Obame", docs: 6, archives: 3, signatures: 12, score: 88 },
    { name: "A. Gondjout", docs: 4, archives: 6, signatures: 9, score: 82 },
    { name: "C. Mboumba", docs: 5, archives: 2, signatures: 8, score: 79 },
    { name: "O. Doumba", docs: 3, archives: 2, signatures: 6, score: 72 },
];

const COMPLIANCE_ITEMS = [
    { label: "Certificats d'archivage valides", value: 94, status: "ok" as const },
    { label: "Archives avec rétention conforme", value: 91, status: "ok" as const },
    { label: "Signatures complétées à temps", value: 88, status: "warning" as const },
    { label: "Documents avec workflow validé", value: 76, status: "warning" as const },
    { label: "Intégrité SHA-256 vérifiée", value: 98, status: "ok" as const },
    { label: "Audit logs complets", value: 100, status: "ok" as const },
];

const MODULE_STATS = [
    { name: "iDocument", value: 23, icon: FileText, color: "from-blue-600 to-cyan-500", trend: +12 },
    { name: "iArchive", value: 580, icon: Archive, color: "from-amber-600 to-orange-500", trend: +8 },
    { name: "iSignature", value: 47, icon: PenTool, color: "from-violet-600 to-indigo-500", trend: +15 },
    { name: "iAsted", value: 34, icon: Bot, color: "from-emerald-600 to-teal-500", trend: +22 },
];

// ─── Tooltip ─────────────────────────────────────

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

export default function IAstedAnalyticsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <Link href="/pro/iasted">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Intelligence Analytique</h1>
                        <p className="text-xs text-muted-foreground">Insights IA et métriques cross-module</p>
                    </div>
                </div>
            </motion.div>

            {/* Cross-module Search */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Recherche sémantique cross-module (documents, archives, signatures)…"
                    className="h-10 pl-9 text-xs bg-white/[0.02] border-white/5 focus-visible:ring-violet-500/30"
                />
            </motion.div>

            {/* Module Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {MODULE_STATS.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                        <motion.div
                            key={mod.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">
                                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                    +{mod.trend}%
                                </Badge>
                            </div>
                            <p className="text-xl font-bold">{mod.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{mod.name}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Row 1: Health Score + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Health Score Gauge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center"
                >
                    <h3 className="text-sm font-semibold mb-1 self-start">Score de santé documentaire</h3>
                    <p className="text-[10px] text-zinc-500 mb-4 self-start">Évaluation globale IA</p>

                    {/* Circular Gauge */}
                    <div className="relative h-36 w-36 mb-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="40" fill="none"
                                stroke={HEALTH_SCORE >= 80 ? "#10b981" : HEALTH_SCORE >= 60 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${HEALTH_SCORE * 2.51} 251`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{HEALTH_SCORE}</span>
                            <span className="text-[10px] text-zinc-500">/100</span>
                        </div>
                    </div>

                    <div className="w-full space-y-2">
                        {HEALTH_BREAKDOWN.slice(0, 4).map((item) => (
                            <div key={item.metric}>
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] text-zinc-400">{item.metric}</span>
                                    <span className="text-[10px] font-medium">{item.value}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.value >= 90 ? "bg-emerald-500" : item.value >= 80 ? "bg-amber-500" : "bg-red-500"}`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-2 p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">Profil organisationnel</h3>
                    <p className="text-[10px] text-zinc-500 mb-4">Score par dimension</p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={RADAR_DATA}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#71717a" }} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.15}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Row 2: Activity Trends */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
            >
                <h3 className="text-sm font-semibold mb-1">Tendances d&apos;activité (6 mois)</h3>
                <p className="text-[10px] text-zinc-500 mb-4">Volume par module</p>
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TREND_DATA}>
                            <defs>
                                <linearGradient id="gDocs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gArch" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gSigs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="documents" stroke="#3b82f6" fill="url(#gDocs)" strokeWidth={2} name="Documents" />
                            <Area type="monotone" dataKey="archives" stroke="#f59e0b" fill="url(#gArch)" strokeWidth={2} name="Archives" />
                            <Area type="monotone" dataKey="signatures" stroke="#8b5cf6" fill="url(#gSigs)" strokeWidth={2} name="Signatures" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Row 3: Team Productivity + Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Team Productivity */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <h3 className="text-sm font-semibold mb-1">Productivité de l&apos;équipe</h3>
                    <p className="text-[10px] text-zinc-500 mb-4">Ce mois</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-2 px-2 text-[10px] text-zinc-500">Membre</th>
                                    <th className="text-center py-2 px-1 text-[10px] text-zinc-500">Docs</th>
                                    <th className="text-center py-2 px-1 text-[10px] text-zinc-500">Arch.</th>
                                    <th className="text-center py-2 px-1 text-[10px] text-zinc-500">Sig.</th>
                                    <th className="text-right py-2 px-2 text-[10px] text-zinc-500">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TEAM_PRODUCTIVITY.map((member) => (
                                    <tr key={member.name} className="border-b border-white/[0.03]">
                                        <td className="py-2 px-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                    <span className="text-[7px] text-violet-300 font-bold">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-medium">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-1 text-center text-[11px]">{member.docs}</td>
                                        <td className="py-2 px-1 text-center text-[11px]">{member.archives}</td>
                                        <td className="py-2 px-1 text-center text-[11px]">{member.signatures}</td>
                                        <td className="py-2 px-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <div className="w-10 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${member.score >= 85 ? "bg-emerald-500" : member.score >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${member.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono w-5">{member.score}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Compliance Scoring */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold mb-1">Score de conformité</h3>
                            <p className="text-[10px] text-zinc-500">Analyse IA des obligations</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">
                            <Shield className="h-3 w-3 mr-1" />
                            {HEALTH_SCORE}/100
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {COMPLIANCE_ITEMS.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        {item.status === "ok" ? (
                                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                        ) : (
                                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                                        )}
                                        <span className="text-[11px] text-zinc-300">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-medium ${item.value >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                                        {item.value}%
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden ml-[18px]">
                                    <div
                                        className={`h-full rounded-full transition-all ${item.value >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-[11px] font-medium text-violet-300">Recommandation IA</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                            Renouveler les 12 certificats expirants et compléter les 4 signatures en attente
                            augmenterait votre score de 87 à 94.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
