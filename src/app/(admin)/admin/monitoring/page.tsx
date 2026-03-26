"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Admin: NEOCORTEX Monitoring
// Real-time system health dashboard
// Connected to neocortex_monitoring + hippocampe queries
// ═══════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Brain,
    BarChart3,
    Zap,
    Shield,
    RefreshCcw,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Status badge ─────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
        healthy: { label: "Opérationnel", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
        degraded: { label: "Dégradé", className: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: AlertTriangle },
        critical: { label: "Critique", className: "bg-red-500/15 text-red-400 border-red-500/30", icon: AlertTriangle },
        unknown: { label: "Inconnu", className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30", icon: Clock },
    };
    const c = config[status] ?? config.unknown;
    const Icon = c.icon;
    return (
        <Badge className={`${c.className} gap-1.5 px-3 py-1 text-xs font-semibold`}>
            <Icon className="h-3.5 w-3.5" /> {c.label}
        </Badge>
    );
}

/* ─── Mini health bar ──────────────────────────── */

function HealthTimeline({ history }: { history: { valeur: number; createdAt: number }[] }) {
    if (history.length === 0) return <p className="text-xs text-muted-foreground">Pas de données</p>;
    return (
        <div className="flex items-end gap-1 h-8">
            {history.map((h, i) => (
                <div
                    key={i}
                    className={`flex-1 rounded-sm min-w-[6px] ${h.valeur === 2 ? "bg-emerald-500" : h.valeur === 1 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ height: `${((h.valeur + 1) / 3) * 100}%` }}
                    title={new Date(h.createdAt).toLocaleTimeString("fr-FR")}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MONITORING PAGE
   ═══════════════════════════════════════════════ */

export default function NeocortexMonitoringPage() {
    // Real Convex queries
    const dashboard = useQuery(api.neocortex_monitoring.dashboard);
    const stats = useQuery(api.neocortex_monitoring.stats);
    const alertes = useQuery(api.auditif.resumeAlertes, { heures: 24 });

    const isLoading = dashboard === undefined;

    return (
        <motion.div
            className="space-y-6 max-w-7xl mx-auto"
            variants={stagger}
            initial="hidden"
            animate="visible"
        >
            {/* ── Header ── */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-violet-400" />
                        Monitoring NEOCORTEX
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Système nerveux de la plateforme — santé, signaux et métriques en temps réel
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                        <StatusBadge status={dashboard?.sante?.status ?? "unknown"} />
                    )}
                </div>
            </motion.div>

            {/* ── KPI Row ── */}
            <motion.div variants={fadeUp}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Signaux Total */}
                    <Card className="glass border-white/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoading ? "—" : dashboard?.signaux?.dernieres24h ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Signaux (24h)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Non traités */}
                    <Card className="glass border-white/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoading ? "—" : stats?.nonTraites ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Non traités</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Critiques */}
                    <Card className="glass border-white/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${(stats?.critiques ?? 0) > 0 ? "bg-gradient-to-br from-red-600 to-pink-500" : "bg-gradient-to-br from-emerald-600 to-teal-500"}`}>
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoading ? "—" : stats?.critiques ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Alertes critiques</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions 24h */}
                    <Card className="glass border-white/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {isLoading ? "—" : dashboard?.actions?.dernieres24h ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Actions (24h)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* ── Health Timeline + Cortex Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Health Timeline */}
                <motion.div variants={fadeUp} className="lg:col-span-2">
                    <Card className="glass border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                                        Historique Santé
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Dernière heure — Intervalle 5 min
                                    </CardDescription>
                                </div>
                                <StatusBadge status={dashboard?.sante?.status ?? "unknown"} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-8 animate-pulse bg-white/5 rounded" />
                            ) : (
                                <HealthTimeline history={dashboard?.healthHistory ?? []} />
                            )}
                            <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Sain
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-sm bg-amber-500" /> Dégradé
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-sm bg-red-500" /> Critique
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* System Config Summary */}
                <motion.div variants={fadeUp}>
                    <Card className="glass border-white/5 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Système</CardTitle>
                            <CardDescription className="text-xs">Métriques globales</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Configurations</span>
                                <span className="text-sm font-semibold">{isLoading ? "—" : dashboard?.configs ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Poids adaptatifs</span>
                                <span className="text-sm font-semibold">{isLoading ? "—" : dashboard?.poidsAdaptatifs ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Signaux totaux</span>
                                <span className="text-sm font-semibold">{isLoading ? "—" : dashboard?.signaux?.total ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Actions totales</span>
                                <span className="text-sm font-semibold">{isLoading ? "—" : dashboard?.actions?.total ?? 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ── Cortex Activity Grid ── */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-violet-400" />
                            Activité par Cortex (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {(dashboard?.cortex ?? []).map((c) => {
                                    const icons: Record<string, string> = {
                                        limbique: "💓", hippocampe: "📚", plasticite: "🔧", prefrontal: "🎯",
                                        sensoriel: "📡", visuel: "👁️", auditif: "👂", moteur: "🏃",
                                    };
                                    return (
                                        <div key={c.nom} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{icons[c.nom] ?? "🧠"}</span>
                                                <span className="text-xs font-semibold capitalize">{c.nom}</span>
                                            </div>
                                            <p className="text-xl font-bold">{c.signaux}</p>
                                            <p className="text-[10px] text-muted-foreground">signaux</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Alertes Critiques ── */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                                    Alertes Critiques (24h)
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {alertes ? `${alertes.total} alerte(s) depuis ${alertes.depuis}` : "Chargement…"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!alertes || alertes.total === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-400 opacity-40" />
                                <p className="text-sm">Aucune alerte critique</p>
                                <p className="text-xs opacity-60">Le système fonctionne normalement</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alertes.alertes.slice(0, 10).map((a: any) => (
                                    <div key={a._id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{a.action}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {new Date(a.createdAt).toLocaleString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Actions par Catégorie ── */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Répartition des Actions (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-20 animate-pulse bg-white/5 rounded" />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(dashboard?.actions?.parCategorie ?? {}).map(([cat, count]) => {
                                    const catConfig: Record<string, { label: string; color: string }> = {
                                        metier: { label: "Métier", color: "text-violet-400" },
                                        systeme: { label: "Système", color: "text-blue-400" },
                                        utilisateur: { label: "Utilisateur", color: "text-emerald-400" },
                                        securite: { label: "Sécurité", color: "text-red-400" },
                                    };
                                    const cc = catConfig[cat] ?? { label: cat, color: "text-muted-foreground" };
                                    return (
                                        <div key={cat} className="p-3 rounded-lg border border-white/5">
                                            <p className={`text-xs font-semibold ${cc.color}`}>{cc.label}</p>
                                            <p className="text-2xl font-bold mt-1">{count as number}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
