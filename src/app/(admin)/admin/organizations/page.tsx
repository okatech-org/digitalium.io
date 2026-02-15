// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Organisations
// Liste live (Convex) avec statuts, progress, modules
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
    Building2,
    Search,
    Plus,
    MoreHorizontal,
    Users,
    FileText,
    Archive,
    PenTool,
    Eye,
    Settings,
    AlertCircle,
    Globe,
    Cloud,
    Server,
    HardDrive,
    Sparkles,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    brouillon: { label: "Brouillon", color: "text-zinc-400", bg: "bg-zinc-500/15" },
    prete: { label: "Prête", color: "text-blue-400", bg: "bg-blue-500/15" },
    active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/15" },
    trial: { label: "Essai", color: "text-amber-400", bg: "bg-amber-500/15" },
    suspended: { label: "Suspendue", color: "text-orange-400", bg: "bg-orange-500/15" },
    resiliee: { label: "Résiliée", color: "text-red-400", bg: "bg-red-500/15" },
};

const STATUS_GRADIENT: Record<string, string> = {
    brouillon: "from-zinc-500 to-zinc-400",
    prete: "from-blue-500 to-cyan-500",
    active: "from-emerald-500 to-green-500",
    trial: "from-amber-500 to-yellow-500",
    suspended: "from-orange-500 to-red-400",
    resiliee: "from-red-500 to-red-700",
};

const MODULE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    iDocument: { label: "iDocument", color: "text-blue-300", bg: "bg-blue-500/15" },
    iArchive: { label: "iArchive", color: "text-amber-300", bg: "bg-amber-500/15" },
    iSignature: { label: "iSignature", color: "text-violet-300", bg: "bg-violet-500/15" },
    iAsted: { label: "iAsted", color: "text-orange-300", bg: "bg-orange-500/15" },
};

const HOSTING_ICONS: Record<string, React.ElementType> = {
    cloud: Cloud,
    datacenter: HardDrive,
    local: Server,
};

const HOSTING_LABELS: Record<string, string> = {
    cloud: "Cloud DIGITALIUM",
    datacenter: "DC LA POSTE",
    local: "On-Premise",
};

type OrgType = "enterprise" | "institution" | "government" | "organism";
const ORG_TYPE_LABELS: Record<OrgType, string> = {
    enterprise: "Entreprise",
    institution: "Institution",
    government: "Administration",
    organism: "Organisme",
};

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Progress bar component ─── */

function ConfigProgress({ progress }: {
    progress?: {
        profilComplete: boolean;
        structureOrgComplete: boolean;
        structureClassementComplete: boolean;
        modulesConfigComplete: boolean;
        automationConfigComplete: boolean;
        deploymentConfigComplete: boolean;
    }
}) {
    if (!progress) return null;
    const items = [
        progress.profilComplete,
        progress.structureOrgComplete,
        progress.structureClassementComplete,
        progress.modulesConfigComplete,
        progress.automationConfigComplete,
        progress.deploymentConfigComplete,
    ];
    const done = items.filter(Boolean).length;
    const pct = Math.round((done / items.length) * 100);
    return (
        <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${pct === 100 ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-violet-500 to-blue-500"
                        }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono w-8 text-right">{pct}%</span>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function AdminOrganizationsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const router = useRouter();

    // Live Convex data
    const organizations = useQuery(api.organizations.list, statusFilter ? { status: statusFilter as "brouillon" | "prete" | "active" | "trial" | "suspended" | "resiliee" } : {});
    const stats = useQuery(api.organizations.getStats);

    const isLoading = organizations === undefined;

    // Filter
    const filteredOrgs = (organizations ?? []).filter((org) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
            org.name?.toLowerCase().includes(q) ||
            org.sector?.toLowerCase().includes(q) ||
            org.ville?.toLowerCase().includes(q) ||
            org.type?.toLowerCase().includes(q)
        );
    });

    // KPIs from live stats
    const kpis = [
        { label: "Organisations", value: stats?.total ?? "—", icon: Building2, color: "from-blue-600 to-violet-500" },
        { label: "Brouillons", value: stats?.brouillon ?? "—", icon: FileText, color: "from-zinc-500 to-zinc-400" },
        { label: "Prêtes", value: stats?.prete ?? "—", icon: Sparkles, color: "from-blue-600 to-cyan-500" },
        { label: "Actives", value: stats?.active ?? "—", icon: Building2, color: "from-emerald-600 to-green-500" },
    ];

    // Status filter tabs
    const statusTabs = [
        { key: null, label: "Toutes" },
        { key: "brouillon", label: "Brouillons" },
        { key: "prete", label: "Prêtes" },
        { key: "active", label: "Actives" },
        { key: "trial", label: "Essai" },
        { key: "suspended", label: "Suspendues" },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        Organisations
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {stats?.total ?? "—"} organisations enregistrées
                    </p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Nouvelle Organisation</span>
                    </Button>
                </Link>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-2`}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Search + Filter */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une organisation…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key ?? "all"}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === tab.key
                                ? "bg-white/10 text-white border border-white/20"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
            )}

            {/* Organisations Grid */}
            {!isLoading && (
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredOrgs.map((org) => {
                        const statusCfg = STATUS_CONFIG[org.status] ?? STATUS_CONFIG.brouillon;
                        const gradient = STATUS_GRADIENT[org.status] ?? STATUS_GRADIENT.brouillon;
                        const hostingKey = org.hosting?.type ?? "cloud";
                        const HostIcon = HOSTING_ICONS[hostingKey] ?? Cloud;
                        const modules = org.quota?.modules ?? [];

                        return (
                            <motion.div
                                key={org._id}
                                variants={fadeUp}
                                className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors cursor-pointer"
                                onClick={() => router.push(`/admin/organizations/${org._id}`)}
                            >
                                {/* Top gradient bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm group-hover:text-blue-300 transition-colors">
                                                {org.name}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {org.sector ? `${org.sector} · ` : ""}
                                                {ORG_TYPE_LABELS[org.type as OrgType] ?? org.type}
                                                {org.ville ? ` · ${org.ville}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/organizations/${org._id}`); }} className="text-xs gap-2">
                                                <Eye className="h-3.5 w-3.5" /> Voir détails
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/organizations/${org._id}`); }} className="text-xs gap-2">
                                                <Settings className="h-3.5 w-3.5" /> Configurer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/users?org=${org._id}`); }} className="text-xs gap-2">
                                                <Users className="h-3.5 w-3.5" /> Gérer membres
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Status + Hosting badges */}
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary" className={`text-[9px] ${statusCfg.bg} ${statusCfg.color} border-0`}>
                                        {statusCfg.label}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-zinc-400 gap-1">
                                        <HostIcon className="h-2.5 w-2.5" />
                                        {HOSTING_LABELS[hostingKey] ?? hostingKey}
                                    </Badge>
                                </div>

                                {/* Module badges */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    {modules.map((mod) => {
                                        const cfg = MODULE_CONFIG[mod];
                                        return cfg ? (
                                            <Badge key={mod} variant="secondary" className={`text-[8px] ${cfg.bg} ${cfg.color} border-0 px-1.5`}>
                                                {cfg.label}
                                            </Badge>
                                        ) : (
                                            <Badge key={mod} variant="secondary" className="text-[8px] bg-white/5 text-zinc-500 border-0 px-1.5">
                                                {mod}
                                            </Badge>
                                        );
                                    })}
                                </div>

                                {/* Config progress bar (only for non-active) */}
                                {org.status !== "active" && org.configProgress && (
                                    <ConfigProgress progress={org.configProgress} />
                                )}

                                {/* Creation date */}
                                <p className="text-[9px] text-zinc-600 mt-3">
                                    Créé le {new Date(org.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {!isLoading && filteredOrgs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Aucune organisation trouvée</p>
                    <Link href="/admin/organizations/new" className="mt-4">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-3.5 w-3.5" /> Créer une organisation
                        </Button>
                    </Link>
                </div>
            )}
        </motion.div>
    );
}
