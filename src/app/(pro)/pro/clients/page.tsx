// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Clients
// Gestion des organisations clientes
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Search,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    MoreHorizontal,
    Pause,
    Play,
    Trash2,
    Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

/* ─── Status config ────────────────────────────── */

type ClientStatus = "all" | "active" | "suspended" | "resiliee";

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: React.ElementType; dotColor: string }
> = {
    active: {
        label: "Actif",
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
        dotColor: "bg-emerald-400",
    },
    suspended: {
        label: "Suspendu",
        color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        icon: AlertTriangle,
        dotColor: "bg-amber-400",
    },
    resiliee: {
        label: "Résilié",
        color: "bg-red-500/15 text-red-400 border-red-500/20",
        icon: XCircle,
        dotColor: "bg-red-400",
    },
    prete: {
        label: "Prête",
        color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        icon: Sparkles,
        dotColor: "bg-blue-400",
    },
};

const TYPE_LABELS: Record<string, string> = {
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

/* ═══════════════════════════════════════════════
   CLIENTS PAGE
   ═══════════════════════════════════════════════ */

export default function ClientsPage() {
    const [statusFilter, setStatusFilter] = useState<ClientStatus>("all");
    const [search, setSearch] = useState("");

    // ── Convex data ────────────────────────────
    const clients = useQuery(api.clients.listClients, {
        statusFilter: statusFilter === "all" ? undefined : statusFilter,
    });
    const stats = useQuery(api.clients.getClientStats);
    const suspendClient = useMutation(api.clients.suspendClient);
    const reactivateClient = useMutation(api.clients.reactivateClient);
    const terminateClient = useMutation(api.clients.terminateClient);

    // ── Filter by search ───────────────────────
    const filtered = useMemo(() => {
        if (!clients) return [];
        if (!search.trim()) return clients;
        const q = search.toLowerCase();
        return clients.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.sector && c.sector.toLowerCase().includes(q)) ||
                (c.type && c.type.toLowerCase().includes(q))
        );
    }, [clients, search]);

    const isLoading = clients === undefined || stats === undefined;

    // ── KPI cards config ───────────────────────
    const kpis = [
        {
            label: "Total Clients",
            value: stats?.total ?? 0,
            icon: Building2,
            gradient: "from-violet-600 to-indigo-500",
            sub: `${stats?.newThisMonth ?? 0} ce mois`,
        },
        {
            label: "Actifs",
            value: stats?.active ?? 0,
            icon: CheckCircle2,
            gradient: "from-emerald-600 to-teal-500",
            sub: `${stats?.activeSubscriptions ?? 0} abonnements`,
        },
        {
            label: "Suspendus",
            value: stats?.suspended ?? 0,
            icon: AlertTriangle,
            gradient: "from-amber-600 to-orange-500",
            sub: "En attente",
        },
        {
            label: "Résiliés",
            value: stats?.resiliee ?? 0,
            icon: XCircle,
            gradient: "from-red-600 to-rose-500",
            sub: `${stats?.prete ?? 0} prêtes`,
        },
    ];

    const statusTabs: { key: ClientStatus; label: string; count?: number }[] = [
        { key: "all", label: "Tous", count: stats?.total },
        { key: "active", label: "Actifs", count: stats?.active },
        { key: "suspended", label: "Suspendus", count: stats?.suspended },
        { key: "resiliee", label: "Résiliés", count: stats?.resiliee },
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
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Clients</h1>
                        <p className="text-xs text-muted-foreground">
                            Gérez vos organisations clientes et leurs abonnements.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── KPI Cards ───────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <Card className="glass border-white/5 hover:border-white/10 transition-all duration-300 group">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div
                                        className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}
                                    >
                                        <kpi.icon className="h-4.5 w-4.5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold tracking-tight">
                                    {isLoading ? "—" : kpi.value}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {kpi.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                    {kpi.sub}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ── Filters + Search ────────────────── */}
            <Card className="glass border-white/5">
                <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Status tabs */}
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
                                    {tab.count !== undefined && (
                                        <span className="ml-1 opacity-60">
                                            {isLoading ? "" : tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un client…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Client List ─────────────────────── */}
            <Card className="glass border-white/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isLoading
                            ? "Chargement…"
                            : `${filtered.length} client${filtered.length > 1 ? "s" : ""}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_100px_100px_80px_60px] gap-2 px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        <span>Organisation</span>
                        <span>Type</span>
                        <span>Secteur</span>
                        <span>Statut</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/3">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[1fr_100px_100px_80px_60px] gap-2 px-4 py-3 animate-pulse"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/5" />
                                        <div className="h-3 w-32 rounded bg-white/5" />
                                    </div>
                                    <div className="h-3 w-16 rounded bg-white/5 self-center" />
                                    <div className="h-3 w-20 rounded bg-white/5 self-center" />
                                    <div className="h-5 w-14 rounded-full bg-white/5 self-center" />
                                    <div />
                                </div>
                            ))
                            : filtered.map((client, i) => {
                                const sc = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.active;
                                return (
                                    <motion.div
                                        key={client._id}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn}
                                        className="grid grid-cols-[1fr_100px_100px_80px_60px] gap-2 px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                    >
                                        {/* Name */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-500/20 flex items-center justify-center shrink-0 border border-white/5">
                                                <Building2 className="h-4 w-4 text-violet-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                                                    {client.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 truncate">
                                                    Créé le{" "}
                                                    {new Date(
                                                        client.createdAt
                                                    ).toLocaleDateString("fr-FR")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Type */}
                                        <div className="flex items-center">
                                            <span className="text-xs text-muted-foreground truncate">
                                                {TYPE_LABELS[client.type] ?? client.type}
                                            </span>
                                        </div>

                                        {/* Sector */}
                                        <div className="flex items-center">
                                            <span className="text-xs text-muted-foreground truncate">
                                                {client.sector ?? "—"}
                                            </span>
                                        </div>

                                        {/* Status badge */}
                                        <div className="flex items-center">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] h-5 border ${sc.color}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${sc.dotColor} mr-1`}
                                                />
                                                {sc.label}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-44 bg-zinc-900 border-white/10"
                                                >
                                                    {client.status === "active" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                suspendClient({
                                                                    id: client._id as Id<"organizations">,
                                                                })
                                                            }
                                                            className="text-xs text-amber-400"
                                                        >
                                                            <Pause className="h-3.5 w-3.5 mr-2" />
                                                            Suspendre
                                                        </DropdownMenuItem>
                                                    )}
                                                    {client.status === "suspended" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                reactivateClient({
                                                                    id: client._id as Id<"organizations">,
                                                                })
                                                            }
                                                            className="text-xs text-emerald-400"
                                                        >
                                                            <Play className="h-3.5 w-3.5 mr-2" />
                                                            Réactiver
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(client.status === "active" ||
                                                        client.status === "suspended") && (
                                                            <>
                                                                <DropdownMenuSeparator className="bg-white/5" />
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        terminateClient({
                                                                            id: client._id as Id<"organizations">,
                                                                        })
                                                                    }
                                                                    className="text-xs text-red-400"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                                    Résilier
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>
                                );
                            })}

                        {/* Empty state */}
                        {!isLoading && filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Building2 className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucun client trouvé</p>
                                <p className="text-xs mt-1 opacity-60">
                                    {search
                                        ? "Essayez une autre recherche"
                                        : "Les clients apparaîtront ici"}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
