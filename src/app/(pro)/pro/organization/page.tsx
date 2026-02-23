// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Organisation
// Vue de la structure organisationnelle
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Network,
    Users,
    ChevronRight,
    ChevronDown,
    FolderTree,
    Layers,
    Globe,
    MapPin,
    Briefcase,
    Shield,
    Crown,
    Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useOrganization } from "@/contexts/OrganizationContext";

/* ─── Type config ──────────────────────────────── */

const UNIT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    direction: { label: "Direction", icon: Crown, color: "text-amber-400" },
    departement: { label: "Département", icon: Building2, color: "text-violet-400" },
    service: { label: "Service", icon: Briefcase, color: "text-blue-400" },
    pole: { label: "Pôle", icon: Layers, color: "text-cyan-400" },
    cellule: { label: "Cellule", icon: Shield, color: "text-emerald-400" },
};

const ORG_TYPE_LABELS: Record<string, string> = {
    enterprise: "Entreprise",
    government: "Gouvernement",
    ngo: "ONG",
    education: "Éducation",
    startup: "Startup",
};

/* ─── Animation ────────────────────────────────── */

const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
};

/* ─── Tree Node Component ──────────────────────── */

interface TreeNode {
    _id: string;
    nom: string;
    type: string;
    description?: string;
    responsable?: string;
    couleur?: string;
    estActif?: boolean;
    children?: TreeNode[];
}

function OrgTreeNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = node.children && node.children.length > 0;
    const config = UNIT_TYPE_CONFIG[node.type] ?? UNIT_TYPE_CONFIG.service;
    const Icon = config.icon;

    return (
        <div>
            <button
                onClick={() => hasChildren && setExpanded(!expanded)}
                className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-left transition-all hover:bg-white/[0.03] group ${depth === 0 ? "" : ""
                    }`}
                style={{ paddingLeft: `${depth * 20 + 12}px` }}
            >
                {/* Expand/collapse */}
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {hasChildren ? (
                        expanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                        )
                    ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    )}
                </div>

                {/* Icon */}
                <div
                    className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 border border-white/5"
                    style={{
                        backgroundColor: node.couleur
                            ? `${node.couleur}20`
                            : "rgba(139,92,246,0.1)",
                    }}
                >
                    <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: node.couleur || undefined }}
                    />
                </div>

                {/* Name + Meta */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                            {node.nom}
                        </span>
                        <Badge variant="outline" className="text-[9px] h-4 border-white/10 text-muted-foreground/60 shrink-0">
                            {config.label}
                        </Badge>
                    </div>
                    {(node.responsable || node.description) && (
                        <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
                            {node.responsable
                                ? `Resp. ${node.responsable}`
                                : node.description}
                        </p>
                    )}
                </div>

                {/* Children count */}
                {hasChildren && (
                    <span className="text-[10px] text-muted-foreground/40 shrink-0">
                        {node.children!.length}
                    </span>
                )}
            </button>

            {/* Children */}
            {hasChildren && expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {node.children!.map((child) => (
                        <OrgTreeNode key={child._id} node={child as TreeNode} depth={depth + 1} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   ORGANISATION PAGE
   ═══════════════════════════════════════════════ */

export default function OrganisationPage() {
    const { orgId, orgName, orgType } = useOrganization();

    // ── Convex data ────────────────────────────
    const tree = useQuery(
        api.orgUnits.getTree,
        orgId ? { organizationId: orgId as any } : "skip"
    );
    const memberStats = useQuery(
        api.orgMembers.getStats,
        orgId ? { organizationId: orgId as any } : "skip"
    );

    const isLoading = tree === undefined;

    // Count unit types
    const unitCounts = { direction: 0, departement: 0, service: 0, pole: 0, cellule: 0 };
    const countNodes = (nodes: TreeNode[]) => {
        for (const n of nodes) {
            if (n.type in unitCounts) unitCounts[n.type as keyof typeof unitCounts]++;
            if (n.children) countNodes(n.children as TreeNode[]);
        }
    };
    if (tree) countNodes(tree as TreeNode[]);
    const totalUnits = Object.values(unitCounts).reduce((a, b) => a + b, 0);

    // ── KPI cards ─────────────────────────────
    const kpis = [
        {
            label: "Unités",
            value: totalUnits,
            icon: Network,
            gradient: "from-violet-600 to-indigo-500",
        },
        {
            label: "Directions",
            value: unitCounts.direction,
            icon: Crown,
            gradient: "from-amber-600 to-orange-500",
        },
        {
            label: "Départements",
            value: unitCounts.departement,
            icon: Building2,
            gradient: "from-blue-600 to-cyan-500",
        },
        {
            label: "Membres",
            value: memberStats?.total ?? 0,
            icon: Users,
            gradient: "from-emerald-600 to-teal-500",
        },
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
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Organisation</h1>
                        <p className="text-xs text-muted-foreground">
                            Structure organisationnelle et organigramme.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Org Identity Card ────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="glass border-white/5 bg-gradient-to-br from-violet-600/5 to-indigo-500/5">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold">{orgName}</h2>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-[10px] border-violet-500/20 text-violet-400">
                                        {ORG_TYPE_LABELS[orgType] ?? orgType}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Network className="h-3 w-3" />
                                        {totalUnits} unités
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {memberStats?.total ?? 0} membres
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── KPI Cards ───────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} custom={i + 1} initial="hidden" animate="visible" variants={fadeIn}>
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

            {/* ── Org Tree ─────────────────────────── */}
            <Card className="glass border-white/5">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-violet-400" />
                        <CardTitle className="text-sm">Organigramme</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                        Structure hiérarchique des unités organisationnelles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {isLoading ? (
                        <div className="space-y-2 py-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse" style={{ paddingLeft: `${i * 20}px` }}>
                                    <div className="h-7 w-7 rounded-md bg-white/5" />
                                    <div className="h-3 w-32 rounded bg-white/5" />
                                </div>
                            ))}
                        </div>
                    ) : tree && tree.length > 0 ? (
                        <div className="py-1">
                            {tree.map((node: any) => (
                                <OrgTreeNode key={node._id} node={node as TreeNode} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Network className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Aucune unité organisationnelle</p>
                            <p className="text-xs mt-1 opacity-60">La structure sera affichée après configuration.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
