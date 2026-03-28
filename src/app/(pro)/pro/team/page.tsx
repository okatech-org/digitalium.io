// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Équipe
// Gestion des membres de l'organisation
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Mail,
    Shield,
    Crown,
    CheckCircle2,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";

/* ─── Status config ────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dotColor: "bg-emerald-400", icon: CheckCircle2 },
    invited: { label: "Invité", color: "bg-blue-500/15 text-blue-400 border-blue-500/20", dotColor: "bg-blue-400", icon: Clock },
    suspended: { label: "Suspendu", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", dotColor: "bg-amber-400", icon: AlertTriangle },
};


/* ─── Helpers ──────────────────────────────────── */

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function getAvatarGradient(name: string): string {
    const gradients = [
        "from-violet-600 to-indigo-500",
        "from-emerald-600 to-teal-500",
        "from-amber-600 to-orange-500",
        "from-blue-600 to-cyan-500",
        "from-rose-600 to-pink-500",
        "from-fuchsia-600 to-purple-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
}

/* ─── Animation ────────────────────────────────── */

const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
};

/* ═══════════════════════════════════════════════
   ÉQUIPE PAGE
   ═══════════════════════════════════════════════ */

export default function EquipePage() {
    const { convexOrgId } = useConvexOrgId();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "invited" | "suspended">("all");

    // ── Convex data ────────────────────────────
    const members = useQuery(
        api.orgMembers.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const memberStats = useQuery(
        api.orgMembers.getStats,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const businessRoles = useQuery(
        api.businessRoles.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const orgUnits = useQuery(
        api.orgUnits.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // ── Build lookup maps ─────────────────────
    const roleMap = useMemo(() => {
        if (!businessRoles) return new Map<string, string>();
        return new Map(businessRoles.map((r) => [r._id, r.nom]));
    }, [businessRoles]);

    const unitMap = useMemo(() => {
        if (!orgUnits) return new Map<string, string>();
        return new Map(orgUnits.map((u) => [u._id, u.nom]));
    }, [orgUnits]);

    // ── Filter ────────────────────────────────
    const filtered = useMemo(() => {
        if (!members) return [];
        let list = members;
        if (statusFilter !== "all") {
            list = list.filter((m) => m.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (m) =>
                    (m.nom && m.nom.toLowerCase().includes(q)) ||
                    (m.email && m.email.toLowerCase().includes(q)) ||
                    (m.poste && m.poste.toLowerCase().includes(q)) ||
                    m.userId.toLowerCase().includes(q)
            );
        }
        return list;
    }, [members, search, statusFilter]);

    const isLoading = members === undefined || memberStats === undefined;

    // ── KPIs ──────────────────────────────────
    const kpis = [
        {
            label: "Total Membres",
            value: memberStats?.total ?? 0,
            icon: Users,
            gradient: "from-violet-600 to-indigo-500",
        },
        {
            label: "Actifs",
            value: memberStats?.active ?? 0,
            icon: CheckCircle2,
            gradient: "from-emerald-600 to-teal-500",
        },
        {
            label: "Invités",
            value: memberStats?.invited ?? 0,
            icon: Clock,
            gradient: "from-blue-600 to-cyan-500",
        },
        {
            label: "Suspendus",
            value: memberStats?.suspended ?? 0,
            icon: AlertTriangle,
            gradient: "from-amber-600 to-orange-500",
        },
    ];

    const statusTabs: { key: typeof statusFilter; label: string }[] = [
        { key: "all", label: "Tous" },
        { key: "active", label: "Actifs" },
        { key: "invited", label: "Invités" },
        { key: "suspended", label: "Suspendus" },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ── Header ──────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Gestion de l&apos;Équipe</h1>
                        <p className="text-xs text-muted-foreground">
                            Membres, rôles et permissions de votre organisation.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── KPI Cards ───────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} custom={i} initial="hidden" animate="visible" variants={fadeIn}>
                        <Card className="glass border-white/5 hover:border-white/10 transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                                        <kpi.icon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">{isLoading ? "—" : kpi.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ── Filters ─────────────────────────── */}
            <Card className="glass border-white/5">
                <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusFilter(tab.key)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === tab.key
                                        ? "bg-violet-600 text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un membre…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Members Table ────────────────────── */}
            <Card className="glass border-white/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isLoading
                            ? "Chargement…"
                            : `${filtered.length} membre${filtered.length > 1 ? "s" : ""}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_120px_120px_80px_140px] gap-2 px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        <span>Membre</span>
                        <span>Rôle Métier</span>
                        <span>Unité</span>
                        <span>Statut</span>
                        <span>Contact</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/3">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-[1fr_120px_120px_80px_140px] gap-2 px-4 py-3 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white/5" />
                                        <div className="h-3 w-28 rounded bg-white/5" />
                                    </div>
                                    <div className="h-3 w-16 rounded bg-white/5 self-center" />
                                    <div className="h-3 w-20 rounded bg-white/5 self-center" />
                                    <div className="h-5 w-12 rounded-full bg-white/5 self-center" />
                                    <div className="h-3 w-24 rounded bg-white/5 self-center" />
                                </div>
                            ))
                            : filtered.map((member, i) => {
                                const name = member.nom || member.userId;
                                const sc = STATUS_CONFIG[member.status] ?? STATUS_CONFIG.active;
                                const roleName = member.businessRoleId
                                    ? roleMap.get(member.businessRoleId) ?? "—"
                                    : "—";
                                const unitName = member.orgUnitId
                                    ? unitMap.get(member.orgUnitId) ?? "—"
                                    : "—";

                                return (
                                    <motion.div
                                        key={member._id}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn}
                                        className="grid grid-cols-[1fr_120px_120px_80px_140px] gap-2 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        {/* Avatar + Name + Poste */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarFallback
                                                    className={`bg-gradient-to-br ${getAvatarGradient(name)} text-white text-[10px] font-medium`}
                                                >
                                                    {getInitials(name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                                                        {name}
                                                    </p>
                                                    {member.estAdmin && (
                                                        <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                                                    )}
                                                    {member.role === "admin" && !member.estAdmin && (
                                                        <Shield className="h-3 w-3 text-violet-400 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground/60 truncate">
                                                    {member.poste ?? "Membre"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Business Role */}
                                        <div className="flex items-center">
                                            <span className="text-xs text-muted-foreground truncate">
                                                {roleName}
                                            </span>
                                        </div>

                                        {/* Org Unit */}
                                        <div className="flex items-center">
                                            <span className="text-xs text-muted-foreground truncate">
                                                {unitName}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center">
                                            <Badge variant="outline" className={`text-[10px] h-5 border ${sc.color}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${sc.dotColor} mr-1`} />
                                                {sc.label}
                                            </Badge>
                                        </div>

                                        {/* Contact */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            {member.email && (
                                                <span className="text-[10px] text-muted-foreground/60 truncate flex items-center gap-1">
                                                    <Mail className="h-2.5 w-2.5 shrink-0" />
                                                    {member.email}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                        {!isLoading && filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Users className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucun membre trouvé</p>
                                <p className="text-xs mt-1 opacity-60">
                                    {search ? "Essayez une autre recherche" : "Les membres apparaîtront ici"}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
