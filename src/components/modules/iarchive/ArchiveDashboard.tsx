"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Dashboard
// Connected to Convex — stats, alerts, expirations, compliance
// ═══════════════════════════════════════════════

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import {
    Archive,
    Shield,
    HardDrive,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Loader2,
    FileText,
    Lock,
    Landmark,
    Users2,
    Scale,
    Briefcase,
    Calendar,
    ArrowRight,
    ShieldCheck,
    BarChart3,
    Timer,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} Mo`;
    return `${(bytes / 1073741824).toFixed(2)} Go`;
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
}

function daysUntil(ts: number): number {
    return Math.max(0, Math.ceil((ts - Date.now()) / (24 * 3600 * 1000)));
}

// ─── Icon map for categories ────────────────────

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    fiscal: { icon: Landmark, color: "text-amber-400", bg: "bg-amber-500/10" },
    social: { icon: Users2, color: "text-blue-400", bg: "bg-blue-500/10" },
    juridique: { icon: Scale, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    client: { icon: Briefcase, color: "text-violet-400", bg: "bg-violet-500/10" },
    coffre: { icon: Lock, color: "text-rose-400", bg: "bg-rose-500/10" },
};

const FALLBACK_CAT = { icon: FileText, color: "text-zinc-400", bg: "bg-zinc-500/10" };

// ─── Status config ──────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", icon: CheckCircle2 },
    semi_active: { label: "Semi-actif", color: "text-blue-400", icon: Clock },
    archived: { label: "Archivé", color: "text-violet-400", icon: Archive },
    expired: { label: "Expiré", color: "text-red-400", icon: XCircle },
    on_hold: { label: "Suspendu", color: "text-amber-400", icon: AlertTriangle },
    destroyed: { label: "Détruit", color: "text-zinc-400", icon: XCircle },
};

// ─── Animations ─────────────────────────────────

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
};

// ─── Component ──────────────────────────────────

export default function ArchiveDashboard() {
    const { convexOrgId } = useConvexOrgId();

    const stats = useQuery(
        api.archives.getStats,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const categories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const allArchives = useQuery(
        api.archives.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // Computed data
    const expiring = useMemo(() => {
        if (!allArchives) return [];
        const now = Date.now();
        const sixMonths = 180 * 24 * 3600 * 1000;
        return allArchives
            .filter((a) => a.retentionExpiresAt && a.retentionExpiresAt - now < sixMonths && a.retentionExpiresAt > now && a.status !== "destroyed")
            .sort((a, b) => a.retentionExpiresAt - b.retentionExpiresAt);
    }, [allArchives]);

    const expiredPending = useMemo(() => {
        if (!allArchives) return [];
        return allArchives.filter((a) => a.status === "expired");
    }, [allArchives]);

    const compliance = useMemo(() => {
        if (!allArchives || !stats) return null;
        const withCert = allArchives.filter((a) => a.certificateId).length;
        const total = stats.totalArchives || 1;
        const certRate = Math.round((withCert / total) * 100);
        const destroyed = stats.byStatus?.destroyed ?? 0;
        const notDestroyed = total - destroyed;
        return { certRate, totalWithCert: withCert, notDestroyed };
    }, [allArchives, stats]);

    if (!stats || !categories) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* ═══ HEADER ═══ */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Dashboard iArchive</h1>
                    <p className="text-xs text-muted-foreground">
                        Vue d&apos;ensemble · {stats.totalArchives} archives · {formatSize(stats.totalSizeBytes)}
                    </p>
                </div>
            </motion.div>

            {/* ═══ SECTION 1 — Stats globales ═══ */}
            <motion.div variants={fadeUp}>
                <SectionTitle icon={TrendingUp} title="Statistiques globales" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <StatCard
                        label="Total archives"
                        value={stats.totalArchives}
                        icon={Archive}
                        color="text-violet-400"
                        bg="bg-violet-500/10"
                    />
                    <StatCard
                        label="Espace utilisé"
                        value={formatSize(stats.totalSizeBytes)}
                        icon={HardDrive}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                    />
                    <StatCard
                        label="Expirations proches"
                        value={stats.expiringSoon}
                        icon={Timer}
                        color={stats.expiringSoon > 0 ? "text-amber-400" : "text-emerald-400"}
                        bg={stats.expiringSoon > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"}
                    />
                    <StatCard
                        label="Certificats valides"
                        value={`${compliance?.certRate ?? 0}%`}
                        icon={ShieldCheck}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10"
                    />
                </div>
            </motion.div>

            {/* ═══ SECTION 2 — Par catégorie ═══ */}
            <motion.div variants={fadeUp}>
                <SectionTitle icon={Archive} title="Répartition par catégorie" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
                    {categories.map((cat) => {
                        const cfg = CATEGORY_ICONS[cat.slug] ?? FALLBACK_CAT;
                        const CatIcon = cfg.icon;
                        const count = stats.byCategory[cat.slug] ?? 0;
                        return (
                            <div key={cat._id} className={`p-3 rounded-xl border border-white/5 ${cfg.bg} bg-opacity-50`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <CatIcon className={`h-4 w-4 ${cfg.color}`} />
                                    <span className="text-xs font-medium truncate">{cat.name}</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-bold tabular-nums">{count}</span>
                                    <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-500">
                                        {cat.isPerpetual ? "∞" : `${cat.retentionYears}a`}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ═══ SECTION 3 — Par statut ═══ */}
            <motion.div variants={fadeUp}>
                <SectionTitle icon={Shield} title="Répartition par statut" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const StatusIcon = cfg.icon;
                        const count = stats.byStatus[key] ?? 0;
                        return (
                            <div key={key} className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
                                    <span className="text-[10px] text-zinc-400">{cfg.label}</span>
                                </div>
                                <span className={`text-xl font-bold tabular-nums ${count > 0 ? cfg.color : "text-zinc-600"}`}>
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ═══ SECTION 4 — Expirations proches ═══ */}
            <motion.div variants={fadeUp}>
                <SectionTitle
                    icon={Calendar}
                    title="Expirations proches"
                    badge={expiring.length > 0 ? `${expiring.length}` : undefined}
                    badgeColor={expiring.length > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : undefined}
                />
                {expiring.length === 0 ? (
                    <EmptyState icon={CheckCircle2} message="Aucune archive expirant dans les 6 prochains mois" color="text-emerald-400" />
                ) : (
                    <div className="space-y-1.5 mt-3">
                        {expiring.slice(0, 10).map((a, i) => {
                            const days = daysUntil(a.retentionExpiresAt);
                            const urgency = days < 30 ? "text-red-400" : days < 90 ? "text-amber-400" : "text-zinc-400";
                            return (
                                <motion.div
                                    key={a._id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className={`h-2 w-2 rounded-full ${days < 30 ? "bg-red-500" : days < 90 ? "bg-amber-500" : "bg-zinc-500"}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{a.title}</p>
                                        <p className="text-[10px] text-zinc-500">{a.categorySlug} · {a.fileName}</p>
                                    </div>
                                    <Badge variant="outline" className={`text-[9px] h-5 ${urgency} border-current/20`}>
                                        {days}j
                                    </Badge>
                                    <span className="text-[10px] text-zinc-500 shrink-0 w-20 text-right">
                                        {formatDate(a.retentionExpiresAt)}
                                    </span>
                                </motion.div>
                            );
                        })}
                        {expiring.length > 10 && (
                            <p className="text-[10px] text-zinc-500 text-center py-2">
                                + {expiring.length - 10} autres archives en expiration
                            </p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* ═══ SECTION 5 — Archives expirées en attente ═══ */}
            <motion.div variants={fadeUp}>
                <SectionTitle
                    icon={AlertTriangle}
                    title="Archives expirées — action requise"
                    badge={expiredPending.length > 0 ? `${expiredPending.length}` : undefined}
                    badgeColor={expiredPending.length > 0 ? "bg-red-500/10 text-red-400 border-red-500/20" : undefined}
                />
                {expiredPending.length === 0 ? (
                    <EmptyState icon={CheckCircle2} message="Aucune archive en attente d'action" color="text-emerald-400" />
                ) : (
                    <div className="space-y-1.5 mt-3">
                        {expiredPending.slice(0, 8).map((a, i) => (
                            <motion.div
                                key={a._id}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/[0.03] border border-red-500/10 hover:border-red-500/20 transition-colors"
                            >
                                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{a.title}</p>
                                    <p className="text-[10px] text-zinc-500">{a.categorySlug} · expiré le {formatDate(a.retentionExpiresAt)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] text-amber-400 hover:bg-amber-500/10 px-2">
                                        <Clock className="h-3 w-3 mr-1" />Prolonger
                                    </Button>
                                    <ArrowRight className="h-3 w-3 text-zinc-600" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ═══ SECTION 6 — Conformité ═══ */}
            <motion.div variants={fadeUp}>
                <SectionTitle icon={ShieldCheck} title="Conformité & Intégrité" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <ComplianceCard
                        label="Certificats valides"
                        value={`${compliance?.certRate ?? 0}%`}
                        detail={`${compliance?.totalWithCert ?? 0} / ${stats.totalArchives} archives certifiées`}
                        color={compliance && compliance.certRate >= 90 ? "emerald" : compliance && compliance.certRate >= 50 ? "amber" : "red"}
                    />
                    <ComplianceCard
                        label="Archives actives"
                        value={`${stats.byStatus.active ?? 0}`}
                        detail="Archives en phase active de conservation"
                        color="blue"
                    />
                    <ComplianceCard
                        label="Coffre-fort"
                        value={`${allArchives?.filter((a) => a.isVault).length ?? 0}`}
                        detail="Archives en conservation perpétuelle"
                        color="violet"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Sub-Components ─────────────────────────────

function SectionTitle({ icon: Icon, title, badge, badgeColor }: {
    icon: React.ElementType;
    title: string;
    badge?: string;
    badgeColor?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold">{title}</h2>
            {badge && (
                <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${badgeColor ?? ""}`}>
                    {badge}
                </Badge>
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bg: string;
}) {
    return (
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
                <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
            </div>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
        </div>
    );
}

function ComplianceCard({ label, value, detail, color }: {
    label: string;
    value: string;
    detail: string;
    color: "emerald" | "amber" | "red" | "blue" | "violet";
}) {
    const colors = {
        emerald: "border-emerald-500/20 bg-emerald-500/5",
        amber: "border-amber-500/20 bg-amber-500/5",
        red: "border-red-500/20 bg-red-500/5",
        blue: "border-blue-500/20 bg-blue-500/5",
        violet: "border-violet-500/20 bg-violet-500/5",
    };
    const textColors = {
        emerald: "text-emerald-400",
        amber: "text-amber-400",
        red: "text-red-400",
        blue: "text-blue-400",
        violet: "text-violet-400",
    };
    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${textColors[color]}`}>{value}</p>
            <p className="text-[10px] text-zinc-500 mt-1">{detail}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, message, color }: {
    icon: React.ElementType;
    message: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-2.5 p-4 rounded-lg bg-white/[0.02] border border-white/5 mt-3">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-xs text-zinc-400">{message}</span>
        </div>
    );
}
