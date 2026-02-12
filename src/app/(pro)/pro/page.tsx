"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: Dashboard Pro (Entreprises)
// KPI cards · Activity chart · Quick actions · Recent docs
// ═══════════════════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    FileText,
    Archive,
    PenTool,
    Bot,
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
        href: "/pro/idocument",
        gradient: "from-violet-600 to-indigo-500",
        stats: [
            { label: "Documents", value: "247" },
            { label: "En édition", value: "12" },
        ],
        trend: "+18%",
        trendUp: true,
    },
    {
        label: "iArchive",
        icon: Archive,
        href: "/pro/iarchive",
        gradient: "from-indigo-600 to-cyan-500",
        stats: [
            { label: "Archives", value: "1,842" },
            { label: "À renouveler", value: "6" },
        ],
        trend: "+5%",
        trendUp: true,
    },
    {
        label: "iSignature",
        icon: PenTool,
        href: "/pro/isignature",
        gradient: "from-violet-600 to-pink-500",
        stats: [
            { label: "En attente", value: "4" },
            { label: "Signées", value: "89" },
        ],
        trend: "+24%",
        trendUp: true,
    },
    {
        label: "iAsted",
        icon: Bot,
        href: "/pro/iasted",
        gradient: "from-emerald-600 to-teal-500",
        stats: [
            { label: "Analyses", value: "32" },
            { label: "Ce mois", value: "12" },
        ],
        trend: "-3%",
        trendUp: false,
    },
];

/* ─── Quick actions ────────────────────────────── */

const quickActions = [
    { label: "Nouveau document", icon: Plus, href: "/pro/idocument/edit", color: "text-violet-400" },
    { label: "Uploader archive", icon: Upload, href: "/pro/iarchive", color: "text-indigo-400" },
    { label: "Demander signature", icon: FileSignature, href: "/pro/isignature/pending", color: "text-pink-400" },
];

/* ─── Recent documents mock ────────────────────── */

const recentDocs = [
    { title: "Contrat de prestation SOGARA", type: "Contrat", updatedAt: "Il y a 10 min", status: "editing" },
    { title: "Facture FV-2026-0847", type: "Facture", updatedAt: "Il y a 35 min", status: "pending" },
    { title: "Rapport financier T4-2025", type: "Rapport", updatedAt: "Il y a 1h", status: "signed" },
    { title: "Avenant contrat SEEG", type: "Avenant", updatedAt: "Il y a 2h", status: "editing" },
    { title: "PV Conseil Administration", type: "PV", updatedAt: "Il y a 3h", status: "signed" },
];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    editing: { label: "En édition", className: "bg-blue-500/15 text-blue-400", icon: Clock },
    pending: { label: "En attente", className: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
    signed: { label: "Signé", className: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
};

/* ─── Team members mock ────────────────────────── */

const teamMembers = [
    { initials: "DG", name: "Directeur Général", online: true },
    { initials: "CM", name: "Commercial", online: true },
    { initials: "SN", name: "Sinistres", online: false },
    { initials: "AG", name: "Agent", online: true },
    { initials: "JR", name: "Juridique", online: false },
];

/* ─── Activity Graph (30 days) ─────────────────── */

function ActivityChart() {
    // Simulated 30-day activity data
    const data = [
        3, 7, 5, 12, 8, 14, 6, 9, 11, 15,
        4, 10, 8, 13, 7, 16, 5, 11, 9, 12,
        6, 14, 10, 8, 17, 9, 13, 7, 11, 15,
    ];
    const max = Math.max(...data);

    return (
        <div className="flex items-end gap-[3px] h-24 w-full">
            {data.map((val, i) => (
                <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600/60 to-indigo-400/80 min-w-[4px]"
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

export default function ProDashboard() {
    const firstName = "Directeur";
    const orgName = "ASCOMA Gabon";

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
            >
                <h1 className="text-2xl font-bold">
                    Bonjour{" "}
                    <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        {firstName}
                    </span>
                    , bienvenue chez{" "}
                    <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        {orgName}
                    </span>
                </h1>
                <p className="text-muted-foreground text-sm">
                    Voici un aperçu de l&apos;activité de votre organisation
                </p>
            </motion.div>

            {/* 4 Module KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                                <Card className="glass border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer group">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-medium ${mod.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                                                {mod.trendUp ? (
                                                    <TrendingUp className="h-3 w-3" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3" />
                                                )}
                                                {mod.trend}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold group-hover:text-violet-300 transition-colors">
                                                {mod.label}
                                            </p>
                                            <div className="flex gap-4 mt-1">
                                                {mod.stats.map((s) => (
                                                    <div key={s.label} className="text-xs text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{s.value}</span>{" "}
                                                        {s.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground group-hover:text-violet-400 transition-colors">
                                            Voir détails
                                            <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Activity Chart + Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Activity Chart */}
                <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="lg:col-span-2"
                >
                    <Card className="glass border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Activité Organisation</CardTitle>
                                    <CardDescription className="text-xs">
                                        30 derniers jours · Documents, archives et signatures
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                    <TrendingUp className="h-3 w-3" />
                                    +12% ce mois
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <ActivityChart />
                            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3 text-violet-400" />
                                    <span className="font-semibold text-foreground">312</span> actions totales
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-indigo-400" />
                                    <span className="font-semibold text-foreground">156</span> documents
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <Card className="glass border-white/5 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Actions Rapides</CardTitle>
                            <CardDescription className="text-xs">
                                Créez, archivez ou signez en un clic
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link key={action.label} href={action.href}>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-3 h-10 text-xs border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5"
                                        >
                                            <Icon className={`h-4 w-4 ${action.color}`} />
                                            {action.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Documents + Team Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Documents */}
                <motion.div
                    custom={6}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="lg:col-span-2"
                >
                    <Card className="glass border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Documents Récents</CardTitle>
                                    <CardDescription className="text-xs">
                                        Dernières modifications dans votre organisation
                                    </CardDescription>
                                </div>
                                <Link href="/pro/idocument">
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-violet-400">
                                        Tout voir <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {recentDocs.map((doc, i) => {
                                    const st = statusConfig[doc.status];
                                    const StatusIcon = st.icon;
                                    return (
                                        <React.Fragment key={doc.title}>
                                            <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3 transition-colors cursor-pointer group">
                                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                                    <FileText className="h-4 w-4 text-violet-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                                                        {doc.title}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {doc.type} · {doc.updatedAt}
                                                    </p>
                                                </div>
                                                <Badge className={`${st.className} text-[10px] h-5 gap-1 border-0`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {st.label}
                                                </Badge>
                                            </div>
                                            {i < recentDocs.length - 1 && (
                                                <Separator className="bg-white/3" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Team */}
                <motion.div
                    custom={7}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <Card className="glass border-white/5 h-full">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Équipe</CardTitle>
                                    <CardDescription className="text-xs">
                                        {teamMembers.filter((t) => t.online).length} membres connectés
                                    </CardDescription>
                                </div>
                                <Link href="/pro/team">
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-violet-400">
                                        <Users className="h-3.5 w-3.5 mr-1" /> Gérer
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {teamMembers.map((member) => (
                                <div key={member.initials} className="flex items-center gap-3 py-1.5">
                                    <div className="relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-violet-500/15 text-violet-300 text-[10px] font-bold">
                                                {member.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${member.online ? "bg-emerald-500" : "bg-muted-foreground/30"
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
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
