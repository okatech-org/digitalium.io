"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: iArchive Dashboard
// Root page for /subadmin/iarchive
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Archive,
    Landmark,
    Users,
    Scale,
    Briefcase,
    Lock,
    ShieldCheck,
    FileText,
    AlertTriangle,
    ArrowRight,
    Loader2,
    Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useOrganization } from "@/contexts/OrganizationContext";

/* ─── Animations ──────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ─── Category display config ─────────────────── */

const CATEGORY_DISPLAY: Record<string, {
    slug: string;
    route: string;
    icon: React.ElementType;
    gradient: string;
    color: string;
    bg: string;
    border: string;
}> = {
    fiscal: {
        slug: "fiscal",
        route: "/subadmin/iarchive/fiscal",
        icon: Landmark,
        gradient: "from-amber-600 to-orange-500",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    social: {
        slug: "social",
        route: "/subadmin/iarchive/social",
        icon: Users,
        gradient: "from-blue-600 to-cyan-500",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    juridique: {
        slug: "juridique",
        route: "/subadmin/iarchive/legal",
        icon: Scale,
        gradient: "from-emerald-600 to-teal-500",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    client: {
        slug: "client",
        route: "/subadmin/iarchive/clients",
        icon: Briefcase,
        gradient: "from-violet-600 to-purple-500",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
    },
    coffre: {
        slug: "coffre",
        route: "/subadmin/iarchive/vault",
        icon: Lock,
        gradient: "from-rose-600 to-pink-500",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
    },
};

const FALLBACK_DISPLAY = {
    icon: FileText,
    gradient: "from-zinc-600 to-zinc-500",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
};

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function SubAdminIArchivePage() {
    const { orgId } = useOrganization();
    const isConvexId = orgId.length > 10;
    const convexOrgId = isConvexId ? (orgId as Id<"organizations">) : undefined;

    // Fetch categories and all archives for this org
    const categories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const archives = useQuery(
        api.archives.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    const isLoading = isConvexId && (categories === undefined || archives === undefined);

    // Compute stats
    const totalArchives = archives?.length ?? 0;
    const activeCount = archives?.filter((a) => a.status === "active" || a.status === "semi_active").length ?? 0;
    const expiringCount = archives?.filter((a) => {
        if (!a.retentionExpiresAt) return false;
        const daysLeft = (a.retentionExpiresAt - Date.now()) / (1000 * 60 * 60 * 24);
        return daysLeft > 0 && daysLeft <= 90;
    }).length ?? 0;
    const expiredCount = archives?.filter((a) => a.status === "expired").length ?? 0;

    // Count per category slug
    const archivesByCategory = React.useMemo(() => {
        const map: Record<string, number> = {};
        if (archives) {
            for (const a of archives) {
                const slug = a.categorySlug || "other";
                map[slug] = (map[slug] || 0) + 1;
            }
        }
        return map;
    }, [archives]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement des archives…</span>
            </div>
        );
    }

    const sortedCategories = [...(categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Archive className="h-6 w-6 text-violet-400" />
                    iArchive
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Archivage légal et cycle de vie documentaire — Conformité OHADA
                </p>
            </motion.div>

            {/* OHADA Compliance Banner */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                    <span className="font-semibold">Configuration conforme OHADA</span> — Durées légales d&apos;archivage intégrées et horodatage certifié
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatsCard label="Total archives" value={totalArchives} icon={Archive} color="text-violet-400" bg="bg-violet-500/10" />
                <StatsCard label="Actifs" value={activeCount} icon={FileText} color="text-emerald-400" bg="bg-emerald-500/10" />
                <StatsCard label="Expiration proche" value={expiringCount} icon={AlertTriangle} color="text-amber-400" bg="bg-amber-500/10" />
                <StatsCard label="Expirés" value={expiredCount} icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10" />
            </motion.div>

            {/* Categories Grid */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-400" />
                    Catégories d&apos;archive
                </h2>

                {sortedCategories.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
                        <Archive className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Aucune catégorie configurée.
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Les catégories OHADA seront créées automatiquement lors de la configuration de l&apos;organisation.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sortedCategories.map((cat) => {
                            const display = CATEGORY_DISPLAY[cat.slug] || FALLBACK_DISPLAY;
                            const Icon = display.icon;
                            const count = archivesByCategory[cat.slug] ?? 0;
                            const route = (CATEGORY_DISPLAY[cat.slug]?.route) ?? `/subadmin/iarchive/${cat.slug}`;

                            return (
                                <Link key={cat._id} href={route} className="group">
                                    <motion.div
                                        variants={fadeUp}
                                        className={`bg-white/[0.02] border ${display.border} rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300 group-hover:scale-[1.01]`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${display.gradient} flex items-center justify-center`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <Badge variant="secondary" className={`${display.bg} ${display.color} border-0 text-[10px]`}>
                                                {count} {count === 1 ? "document" : "documents"}
                                            </Badge>
                                        </div>

                                        <h3 className="text-sm font-semibold">{cat.name}</h3>
                                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                            {cat.description || `Archives ${cat.name.toLowerCase()}`}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                                <span className="text-[10px] text-muted-foreground">
                                                    {cat.retentionYears} {cat.isPerpetual ? "ans (perpétuel)" : "ans"}
                                                </span>
                                            </div>
                                            <ArrowRight className={`h-3.5 w-3.5 ${display.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Certificates Quick Link */}
            <motion.div variants={fadeUp}>
                <Link href="/subadmin/iarchive/certificates" className="group">
                    <div className="bg-white/[0.02] border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Certificats d&apos;archivage</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Preuves d&apos;intégrité et horodatage certifié des documents archivés
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </motion.div>
        </motion.div>
    );
}

/* ─── Stats Card ─────────────────────────────── */

function StatsCard({
    label,
    value,
    icon: Icon,
    color,
    bg,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bg: string;
}) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
        </div>
    );
}
