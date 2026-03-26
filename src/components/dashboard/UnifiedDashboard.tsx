"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Component: UnifiedDashboard
// Shared dashboard for all spaces (admin, subadmin, institutional, pro)
// Eliminates 2000+ LoC of duplication
// ═══════════════════════════════════════════════════════════

import React, { useMemo } from "react";
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
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Users,
    BarChart3,
    Loader2,
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
    canManageTeam,
    isReadOnly,
} from "@/config/role-helpers";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

/* ─── Types ────────────────────────────────────── */

export interface DashboardTheme {
    /** Gradient class for text highlights, e.g. "from-violet-400 to-indigo-400" */
    accentGradient: string;
    /** Activity chart bar gradient, e.g. "from-violet-600/60 to-indigo-400/80" */
    chartGradient: string;
    /** Accent color for icons/badges, e.g. "text-violet-400" */
    accentColor: string;
    /** Module card gradients [iDoc, iArchive, iSig, iAsted] */
    moduleGradients: [string, string, string, string];
}

export interface DashboardConfig {
    /** Route space prefix, e.g. "/admin", "/pro", "/institutional", "/subadmin" */
    spacePrefix: string;
    /** Module base route, e.g. "/admin/digitalium" or "/pro" */
    moduleBase: string;
    /** Team management link, e.g. "/admin/digitalium/team" */
    teamLink: string;
    /** Theme color configuration */
    theme: DashboardTheme;
}

/* ─── Preset Themes ────────────────────────────── */

export const DASHBOARD_THEMES: Record<string, DashboardTheme> = {
    admin: {
        accentGradient: "from-violet-400 to-indigo-400",
        chartGradient: "from-violet-600/60 to-indigo-400/80",
        accentColor: "text-violet-400",
        moduleGradients: [
            "from-violet-600 to-indigo-500",
            "from-indigo-600 to-cyan-500",
            "from-violet-600 to-pink-500",
            "from-emerald-600 to-teal-500",
        ],
    },
    institutional: {
        accentGradient: "from-emerald-400 to-teal-400",
        chartGradient: "from-emerald-600/60 to-teal-400/80",
        accentColor: "text-emerald-400",
        moduleGradients: [
            "from-emerald-600 to-teal-500",
            "from-teal-600 to-cyan-500",
            "from-emerald-600 to-green-500",
            "from-amber-600 to-orange-500",
        ],
    },
    pro: {
        accentGradient: "from-violet-400 to-indigo-400",
        chartGradient: "from-violet-600/60 to-indigo-400/80",
        accentColor: "text-violet-400",
        moduleGradients: [
            "from-violet-600 to-indigo-500",
            "from-indigo-600 to-blue-500",
            "from-violet-600 to-pink-500",
            "from-sky-600 to-cyan-500",
        ],
    },
};

/* ─── Animation helpers ────────────────────────── */

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

/* ─── Status config ────────────────────────────── */

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    draft: { label: "Brouillon", className: "bg-zinc-500/15 text-zinc-400", icon: Clock },
    editing: { label: "En édition", className: "bg-blue-500/15 text-blue-400", icon: Clock },
    review: { label: "En revue", className: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
    approved: { label: "Approuvé", className: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
    archived: { label: "Archivé", className: "bg-violet-500/15 text-violet-400", icon: Archive },
    pending: { label: "En attente", className: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
    signed: { label: "Signé", className: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
};

/* ─── Time ago helper ──────────────────────────── */

function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hier";
    return `Il y a ${days}j`;
}

/* ─── Activity Chart ───────────────────────────── */

function ActivityChart({ documents, chartGradient }: { documents: any[] | undefined; chartGradient: string }) {
    const data = useMemo(() => {
        const days = Array(30).fill(0);
        if (!documents) return days;
        const now = Date.now();
        for (const doc of documents) {
            const age = now - (doc.updatedAt ?? doc.createdAt ?? now);
            const dayIndex = Math.floor(age / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < 30) {
                days[29 - dayIndex]++;
            }
        }
        return days;
    }, [documents]);

    const max = Math.max(...data, 1);

    return (
        <div className="flex items-end gap-[3px] h-24 w-full">
            {data.map((val, i) => (
                <motion.div
                    key={i}
                    className={`flex-1 rounded-t-sm bg-gradient-to-t ${chartGradient} min-w-[4px]`}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / max) * 100}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   UNIFIED DASHBOARD COMPONENT
   ═══════════════════════════════════════════════ */

export function UnifiedDashboard({ config }: { config: DashboardConfig }) {
    const { user } = useAuth();
    const { orgName } = useOrganization();
    const firstName = getUserShortName(user);
    const userLevel = user?.level ?? 4;
    const readOnly = isReadOnly(userLevel);
    const showTeam = canManageTeam(userLevel);

    const { theme, moduleBase, teamLink } = config;

    // ── Quick actions ──
    const allQuickActions = [
        { label: "Nouveau document", icon: Plus, href: `${moduleBase}/idocument`, color: theme.accentColor, minLevel: 4 },
        { label: "Uploader archive", icon: Upload, href: `${moduleBase}/iarchive`, color: "text-indigo-400", minLevel: 4 },
        { label: "Demander signature", icon: FileSignature, href: `${moduleBase}/isignature`, color: "text-pink-400", minLevel: 3 },
    ];
    const quickActions = allQuickActions.filter((a) => userLevel <= a.minLevel);

    // ── Convex queries ──
    const orgId = user?.organizations?.[0]?.id;
    const isValidConvexId = orgId && !orgId.includes("-") && orgId.length > 10;
    const convexOrgId = isValidConvexId ? (orgId as Id<"organizations">) : undefined;

    const documents = useQuery(
        api.documents.list,
        convexOrgId ? { organizationId: convexOrgId } : {}
    );
    const members = useQuery(
        api.orgMembers.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const memberStats = useQuery(
        api.orgMembers.getStats,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const signatures = useQuery(
        api.signatures.listByOrganization,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    const isLoading = documents === undefined;

    // ── KPIs ──
    const kpis = useMemo(() => {
        const totalDocs = documents?.length ?? 0;
        const editingDocs = documents?.filter((d) => d.status === "draft" || d.status === "review").length ?? 0;
        const totalSigsPending = signatures?.filter((s: any) => s.status === "pending" || s.status === "sent").length ?? 0;
        const totalSigsSigned = signatures?.filter((s: any) => s.status === "signed" || s.status === "completed").length ?? 0;
        const archivedDocs = documents?.filter((d) => d.status === "archived").length ?? 0;

        return [
            {
                label: "iDocument", icon: FileText, href: `${moduleBase}/idocument`,
                gradient: theme.moduleGradients[0],
                stats: [{ label: "Documents", value: totalDocs.toString() }, { label: "En cours", value: editingDocs.toString() }],
            },
            {
                label: "iArchive", icon: Archive, href: `${moduleBase}/iarchive`,
                gradient: theme.moduleGradients[1],
                stats: [{ label: "Archivés", value: archivedDocs.toString() }, { label: "Documents", value: totalDocs.toString() }],
            },
            {
                label: "iSignature", icon: PenTool, href: `${moduleBase}/isignature`,
                gradient: theme.moduleGradients[2],
                stats: [{ label: "En attente", value: totalSigsPending.toString() }, { label: "Signées", value: totalSigsSigned.toString() }],
            },
            {
                label: "iAsted", icon: Bot, href: `${moduleBase}/iasted`,
                gradient: theme.moduleGradients[3],
                stats: [{ label: "Membres", value: (memberStats?.total ?? 0).toString() }, { label: "Actifs", value: (memberStats?.active ?? 0).toString() }],
            },
        ];
    }, [documents, signatures, memberStats, moduleBase, theme.moduleGradients]);

    // ── Recent docs ──
    const recentDocs = useMemo(() => {
        if (!documents) return [];
        return [...documents]
            .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
            .slice(0, 5)
            .map((doc) => ({
                id: doc._id,
                title: doc.title,
                type: doc.tags?.[0] ?? "Document",
                updatedAt: timeAgo(doc.updatedAt ?? doc.createdAt ?? Date.now()),
                status: doc.status ?? "draft",
            }));
    }, [documents]);

    // ── Team ──
    const teamData = useMemo(() => {
        if (!members) return [];
        return members
            .filter((m: any) => m.status === "active")
            .slice(0, 5)
            .map((m: any) => ({
                initials: m.nom
                    ? m.nom.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                    : "??",
                name: m.nom ?? m.email ?? "Membre",
                role: m.poste ?? m.role ?? "Membre",
                online: m.status === "active",
            }));
    }, [members]);

    const totalActions = documents?.length ?? 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Read-only banner */}
            {readOnly && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                >
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-300">Mode consultation</p>
                        <p className="text-xs text-muted-foreground">Votre accès est en lecture seule — aucune modification possible.</p>
                    </div>
                </motion.div>
            )}

            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <h1 className="text-2xl font-bold">
                    Bonjour{" "}
                    <span className={`bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent`}>
                        {firstName}
                    </span>
                    , bienvenue chez{" "}
                    <span className={`bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent`}>
                        {orgName}
                    </span>
                </h1>
                <p className="text-muted-foreground text-sm">
                    {readOnly ? "Consultez les documents et archives de votre organisation" : "Voici un aperçu de l\u0027activité de votre organisation"}
                </p>
            </motion.div>

            {/* 4 Module KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                        <motion.div key={mod.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
                            <Link href={mod.href}>
                                <Card className="glass border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer group">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold group-hover:${theme.accentColor.replace("text-", "text-")} transition-colors`}>
                                                {mod.label}
                                            </p>
                                            <div className="flex gap-4 mt-1">
                                                {mod.stats.map((s) => (
                                                    <div key={s.label} className="text-xs text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{isLoading ? "—" : s.value}</span> {s.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`flex items-center text-xs text-muted-foreground group-hover:${theme.accentColor.replace("text-", "text-")} transition-colors`}>
                                            Voir détails <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Activity Chart + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2">
                    <Card className="glass border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Activité Organisation</CardTitle>
                                    <CardDescription className="text-xs">30 derniers jours · Documents, archives et signatures</CardDescription>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                    <TrendingUp className="h-3 w-3" />
                                    {totalActions} actions
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <ActivityChart documents={documents} chartGradient={theme.chartGradient} />
                            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BarChart3 className={`h-3 w-3 ${theme.accentColor}`} />
                                    <span className="font-semibold text-foreground">{totalActions}</span> documents
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3 text-indigo-400" />
                                    <span className="font-semibold text-foreground">{memberStats?.total ?? 0}</span> membres
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {quickActions.length > 0 && (
                    <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp}>
                        <Card className="glass border-white/5 h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Actions Rapides</CardTitle>
                                <CardDescription className="text-xs">Créez, archivez ou signez en un clic</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link key={action.label} href={action.href}>
                                            <Button variant="outline" className="w-full justify-start gap-3 h-10 text-xs border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5">
                                                <Icon className={`h-4 w-4 ${action.color}`} />
                                                {action.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Recent Documents + Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2">
                    <Card className="glass border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Documents Récents</CardTitle>
                                    <CardDescription className="text-xs">Dernières modifications dans votre organisation</CardDescription>
                                </div>
                                <Link href={`${moduleBase}/idocument`}>
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-violet-400">
                                        Tout voir <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                                            <div className="h-8 w-8 rounded-lg bg-white/5" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3 w-40 rounded bg-white/5" />
                                                <div className="h-2 w-24 rounded bg-white/5" />
                                            </div>
                                            <div className="h-5 w-16 rounded-full bg-white/5" />
                                        </div>
                                    ))}
                                </div>
                            ) : recentDocs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">Aucun document pour l&apos;instant</p>
                                    <p className="text-xs mt-1 opacity-60">Créez votre premier document pour commencer</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {recentDocs.map((doc, i) => {
                                        const st = statusConfig[doc.status] ?? statusConfig.draft;
                                        const StatusIcon = st.icon;
                                        return (
                                            <React.Fragment key={doc.id}>
                                                <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3 transition-colors cursor-pointer group">
                                                    <div className={`h-8 w-8 rounded-lg ${theme.accentColor.replace("text-", "bg-")}/10 flex items-center justify-center shrink-0`}>
                                                        <FileText className={`h-4 w-4 ${theme.accentColor}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate group-hover:${theme.accentColor.replace("text-", "text-")} transition-colors`}>
                                                            {doc.title}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">{doc.type} · {doc.updatedAt}</p>
                                                    </div>
                                                    <Badge className={`${st.className} text-[10px] h-5 gap-1 border-0`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {st.label}
                                                    </Badge>
                                                </div>
                                                {i < recentDocs.length - 1 && <Separator className="bg-white/3" />}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {showTeam && (
                    <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
                        <Card className="glass border-white/5 h-full">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Équipe</CardTitle>
                                        <CardDescription className="text-xs">
                                            {isLoading ? "Chargement…" : `${memberStats?.active ?? 0} membres actifs`}
                                        </CardDescription>
                                    </div>
                                    <Link href={teamLink}>
                                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-violet-400">
                                            <Users className="h-3.5 w-3.5 mr-1" /> Gérer
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {isLoading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 py-1.5 animate-pulse">
                                                <div className="h-8 w-8 rounded-full bg-white/5" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-3 w-20 rounded bg-white/5" />
                                                    <div className="h-2 w-14 rounded bg-white/5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : teamData.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                                        <Users className="h-6 w-6 mb-2 opacity-20" />
                                        <p className="text-xs">Aucun membre</p>
                                    </div>
                                ) : (
                                    teamData.map((member) => (
                                        <div key={member.name} className="flex items-center gap-3 py-1.5">
                                            <div className="relative">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className={`${theme.accentColor.replace("text-", "bg-")}/15 ${theme.accentColor.replace("text-", "text-")} text-[10px] font-bold`}>
                                                        {member.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span
                                                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${member.online ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{member.role}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
