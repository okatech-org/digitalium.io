"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: Dashboard Institutionnel
// KPI cards · Activity chart · Quick actions · Recent docs
// Conformité · Équipe · Emerald/teal theme
// ═══════════════════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    FileText,
    Archive,
    PenTool,
    Shield,
    Plus,
    Upload,
    FileSignature,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Users,
    BarChart3,
    Bot,
    Landmark,
    Eye,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
    getUserShortName,
    getUserDisplayName,
    getRoleLabel,
    canCreateContent,
    canManageTeam,
    isReadOnly,
} from "@/config/role-helpers";

/* ─── Animation helpers ────────────────────────── */

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

/* ─── Module KPI Config ────────────────────────── */

const moduleKPIs = [
    {
        label: "iDocument",
        icon: FileText,
        href: "/institutional/idocument",
        gradient: "from-emerald-600 to-teal-500",
        stats: [
            { label: "Documents", value: "583" },
            { label: "En validation", value: "18" },
        ],
        trend: "+12%",
        trendUp: true,
    },
    {
        label: "iArchive",
        icon: Archive,
        href: "/institutional/iarchive/legal",
        gradient: "from-teal-600 to-cyan-500",
        stats: [
            { label: "Archives", value: "3,247" },
            { label: "Légales", value: "1,892" },
        ],
        trend: "+8%",
        trendUp: true,
    },
    {
        label: "iSignature",
        icon: PenTool,
        href: "/institutional/isignature/pending",
        gradient: "from-emerald-600 to-green-500",
        stats: [
            { label: "En attente", value: "7" },
            { label: "Paraphés", value: "156" },
        ],
        trend: "+31%",
        trendUp: true,
    },
    {
        label: "Conformité",
        icon: Shield,
        href: "/institutional/compliance",
        gradient: "from-amber-600 to-orange-500",
        stats: [
            { label: "Score", value: "94%" },
            { label: "Alertes", value: "2" },
        ],
        trend: "+3%",
        trendUp: true,
    },
];

/* ─── Quick actions (filtered by role) ─────────── */

const allQuickActions = [
    { label: "Nouveau document officiel", icon: Plus, href: "/institutional/idocument", color: "text-emerald-400", minLevel: 4 },
    { label: "Archiver document", icon: Upload, href: "/institutional/iarchive/legal", color: "text-teal-400", minLevel: 4 },
    { label: "Demander signature", icon: FileSignature, href: "/institutional/isignature/pending", color: "text-green-400", minLevel: 3 },
    { label: "Rapport conformité", icon: Shield, href: "/institutional/compliance", color: "text-amber-400", minLevel: 3 },
    { label: "Consulter iAsted", icon: Bot, href: "/institutional/iasted", color: "text-cyan-400", minLevel: 4 },
];

/* ─── Recent documents mock ────────────────────── */

const recentDocs = [
    { title: "Arrêté portant réglementation de la pêche artisanale", type: "Arrêté", updatedAt: "Il y a 15 min", status: "validation" },
    { title: "Rapport d'inspection zone maritime N°47", type: "Rapport", updatedAt: "Il y a 1h", status: "approved" },
    { title: "PV de réunion DGPA — Campagne 2026", type: "PV", updatedAt: "Il y a 2h", status: "signed" },
    { title: "Convention ANPA — Pêcheurs du Littoral", type: "Convention", updatedAt: "Il y a 3h", status: "validation" },
    { title: "Note de service — Moratorium saison sèche", type: "Note", updatedAt: "Il y a 5h", status: "approved" },
];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    validation: { label: "En validation", className: "bg-amber-500/15 text-amber-400", icon: Clock },
    approved: { label: "Approuvé", className: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
    signed: { label: "Paraphé", className: "bg-teal-500/15 text-teal-400", icon: CheckCircle2 },
};

/* ─── Team members mock ────────────────────────── */

const teamMembers = [
    { initials: "MN", name: "Ministre", online: true },
    { initials: "AP", name: "Admin Pêche", online: true },
    { initials: "DG", name: "DGPA", online: false },
    { initials: "AN", name: "ANPA", online: true },
    { initials: "IP", name: "Inspecteur", online: false },
];

/* ─── Activity Graph (30 days) ─────────────────── */

function ActivityChart() {
    const data = [
        8, 12, 6, 15, 11, 19, 9, 14, 16, 22,
        7, 18, 13, 20, 10, 24, 8, 17, 14, 19,
        11, 21, 15, 12, 25, 13, 18, 10, 16, 20,
    ];
    const max = Math.max(...data);

    return (
        <div className="flex items-end gap-[3px] h-24 w-full">
            {data.map((val, i) => (
                <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600/60 to-teal-400/80 min-w-[4px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / max) * 100}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════ */

export default function InstitutionalDashboard() {
    const { user } = useAuth();
    const { orgName, orgConfig } = useOrganization();
    const firstName = getUserShortName(user);
    const userLevel = user?.level ?? 4;
    const readOnly = isReadOnly(userLevel);
    const showTeam = canManageTeam(userLevel);
    const quickActions = allQuickActions.filter((a) => userLevel <= a.minLevel);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Read-only banner for viewer */}
            {readOnly && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                >
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-300">
                        <span className="font-semibold">Mode consultation</span> — Vous avez un accès en lecture seule.
                    </p>
                </motion.div>
            )}

            {/* ── Greeting ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-2xl font-bold">
                    Bonjour, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{firstName}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {orgName} — {getRoleLabel(user)} · Voici votre tableau de bord institutionnel
                </p>
            </motion.div>

            {/* ── Module KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {moduleKPIs.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                        <motion.div
                            key={mod.label}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                        >
                            <Link href={mod.href}>
                                <Card className="bg-white/[0.02] border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <CardTitle className="text-sm font-semibold mt-2">{mod.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            {mod.stats.map((s) => (
                                                <div key={s.label}>
                                                    <p className="text-xl font-bold">{s.value}</p>
                                                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 mt-2">
                                            {mod.trendUp ? (
                                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3 text-red-400" />
                                            )}
                                            <span className={`text-[11px] font-medium ${mod.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                                                {mod.trend}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">ce mois</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Activity + Quick Actions Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card className="bg-white/[0.02] border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-semibold">Activité documentaire</CardTitle>
                                    <CardDescription className="text-[11px]">Actions sur les 30 derniers jours</CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                                    <BarChart3 className="h-3 w-3 mr-1" /> +15% vs mois précédent
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ActivityChart />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                {!readOnly && quickActions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <Card className="bg-white/[0.02] border-white/5 h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5">
                                {quickActions.map((action) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <Link key={action.label} href={action.href}>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-9 text-xs font-medium hover:bg-white/5 group"
                                            >
                                                <ActionIcon className={`h-4 w-4 mr-2 ${action.color}`} />
                                                {action.label}
                                                <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* ── Recent docs + Team row ── */}
            <div className={`grid grid-cols-1 ${showTeam ? "lg:grid-cols-3" : ""} gap-4`}>
                {/* Recent Documents */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    className={showTeam ? "lg:col-span-2" : ""}
                >
                    <Card className="bg-white/[0.02] border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold">Documents récents</CardTitle>
                                <Link href="/institutional/idocument">
                                    <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground h-7">
                                        Voir tout <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {recentDocs.map((doc, i) => {
                                    const status = statusConfig[doc.status];
                                    const StatusIcon = status?.icon ?? Clock;
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <FileText className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{doc.title}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {doc.type} · {doc.updatedAt}
                                                </p>
                                            </div>
                                            {status && (
                                                <Badge className={`text-[9px] h-5 gap-1 border-0 ${status.className}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </Badge>
                                            )}
                                            <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Team Widget */}
                {showTeam && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        <Card className="bg-white/[0.02] border-white/5 h-full">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Équipe</CardTitle>
                                    <Link href="/institutional/users">
                                        <Button variant="ghost" size="sm" className="text-[11px] h-7 text-muted-foreground">
                                            <Users className="h-3 w-3 mr-1" /> Gérer
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {teamMembers.map((member) => (
                                        <div key={member.name} className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                                                        {member.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span
                                                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${member.online ? "bg-emerald-500" : "bg-gray-500"
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {member.online ? "En ligne" : "Hors ligne"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* ── Conformité Summary ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
            >
                <Card className="bg-white/[0.02] border-white/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-emerald-400" />
                                    Conformité & Sécurité
                                </CardTitle>
                                <CardDescription className="text-[11px]">
                                    État de conformité réglementaire de l&apos;institution
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                                Score: 94%
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-2xl font-bold text-emerald-400">3,247</p>
                                <p className="text-[10px] text-muted-foreground">Archives conformes</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-2xl font-bold text-emerald-400">156</p>
                                <p className="text-[10px] text-muted-foreground">Signatures valides</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <p className="text-2xl font-bold text-amber-400">2</p>
                                <p className="text-[10px] text-muted-foreground">Alertes rétention</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-2xl font-bold text-emerald-400">100%</p>
                                <p className="text-[10px] text-muted-foreground">Audit trail complet</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
