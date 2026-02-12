// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Clients
// Full client management with KPIs, search,
// plan/status filters, and row actions
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Briefcase,
    Building2,
    Users,
    CreditCard,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Pencil,
    TrendingUp,
    Ban,
    CheckCircle2,
    UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ─── Types & Config ─────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

type ClientStatus = "active" | "trial" | "suspended";
type PlanType = "Starter" | "Pro" | "Entreprise";

interface ClientData {
    id: string;
    name: string;
    type: string;
    users: number;
    plan: PlanType;
    revenue: string;
    status: ClientStatus;
    since: string;
    contact: string;
}

const PLAN_CFG: Record<PlanType, { color: string; bg: string }> = {
    Starter: { color: "text-gray-400", bg: "bg-gray-500/15" },
    Pro: { color: "text-blue-400", bg: "bg-blue-500/15" },
    Entreprise: { color: "text-orange-400", bg: "bg-orange-500/15" },
};

const STATUS_CFG: Record<ClientStatus, { label: string; color: string; bg: string }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15" },
    trial: { label: "Essai", color: "text-blue-400", bg: "bg-blue-500/15" },
    suspended: { label: "Suspendu", color: "text-red-400", bg: "bg-red-500/15" },
};

/* ─── Mock Data ──────────────────────────────────── */

const CLIENTS: ClientData[] = [
    { id: "C001", name: "DGDI", type: "Gouvernement", users: 45, plan: "Entreprise", revenue: "4.5M XAF", status: "active", since: "15 jan 2026", contact: "Jean-Pierre Ondo" },
    { id: "C002", name: "Ministère de l'Intérieur", type: "Gouvernement", users: 120, plan: "Entreprise", revenue: "8.2M XAF", status: "active", since: "20 jan 2026", contact: "Patrick Obiang" },
    { id: "C003", name: "Port-Gentil Logistique", type: "Entreprise", users: 28, plan: "Pro", revenue: "1.8M XAF", status: "active", since: "22 jan 2026", contact: "Sylvie Moussavou" },
    { id: "C004", name: "Gabon Télécom", type: "Entreprise", users: 67, plan: "Entreprise", revenue: "3.5M XAF", status: "active", since: "1 fév 2026", contact: "David Mba" },
    { id: "C005", name: "SEEG", type: "Établissement public", users: 34, plan: "Pro", revenue: "2.1M XAF", status: "active", since: "1 fév 2026", contact: "Marc Essono" },
    { id: "C006", name: "Okoumé Capital", type: "Entreprise", users: 12, plan: "Starter", revenue: "0.6M XAF", status: "trial", since: "5 fév 2026", contact: "Robert Ndong" },
    { id: "C007", name: "Assala Energy", type: "Entreprise", users: 52, plan: "Entreprise", revenue: "5.0M XAF", status: "active", since: "8 fév 2026", contact: "Michel Bongo" },
    { id: "C008", name: "CNAMGS", type: "Établissement public", users: 89, plan: "Pro", revenue: "3.2M XAF", status: "active", since: "10 fév 2026", contact: "Anne Nyangui" },
];

/* ═══════════════════════════════════════════════
   CLIENTS PAGE
   ═══════════════════════════════════════════════ */

export default function ClientsPage() {
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState<PlanType | "all">("all");
    const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");

    const filtered = useMemo(() => {
        return CLIENTS.filter((c) => {
            if (planFilter !== "all" && c.plan !== planFilter) return false;
            if (statusFilter !== "all" && c.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
            }
            return true;
        });
    }, [search, planFilter, statusFilter]);

    const totalUsers = CLIENTS.reduce((a, c) => a + c.users, 0);

    const handleAction = useCallback((action: string, client: ClientData) => {
        switch (action) {
            case "view":
                toast.success(`Ouverture des détails de ${client.name}`);
                break;
            case "edit":
                toast.success(`Modification du plan de ${client.name}`);
                break;
            case "upgrade":
                toast.success(`Upgrade du plan de ${client.name} demandé`);
                break;
            case "suspend":
                toast.warning(`${client.name} suspendu`);
                break;
            case "reactivate":
                toast.success(`${client.name} réactivé`);
                break;
        }
    }, []);

    const handleAddClient = useCallback(() => {
        toast.success("Formulaire de création client ouvert");
    }, []);

    const KPIS = [
        { label: "Total clients", value: CLIENTS.length, icon: Building2, color: "from-blue-600 to-cyan-500" },
        { label: "Total utilisateurs", value: totalUsers, icon: Users, color: "from-orange-600 to-amber-500" },
        { label: "Revenue mensuel", value: "29.0M", icon: TrendingUp, color: "from-emerald-600 to-green-500" },
        { label: "En essai", value: CLIENTS.filter((c) => c.status === "trial").length, icon: CreditCard, color: "from-violet-600 to-purple-500" },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Clients</h1>
                    <p className="text-sm text-muted-foreground mt-1">Organisations clientes de la plateforme</p>
                </div>
                <Button onClick={handleAddClient} className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                    <UserPlus className="h-3.5 w-3.5" />
                    Nouveau client
                </Button>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="glass-card rounded-xl p-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.color}`} />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                                </div>
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center opacity-80`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Search + Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Rechercher client, contact…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5">
                            <CreditCard className="h-3 w-3" />
                            {planFilter === "all" ? "Tous les plans" : planFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setPlanFilter("all")} className="text-xs">Tous les plans</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(["Starter", "Pro", "Entreprise"] as PlanType[]).map((p) => (
                            <DropdownMenuItem key={p} onClick={() => setPlanFilter(p)} className="text-xs gap-2">
                                <span className={`h-2 w-2 rounded-full ${PLAN_CFG[p].bg}`} />
                                {p}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5">
                            <Filter className="h-3 w-3" />
                            {statusFilter === "all" ? "Tous les statuts" : STATUS_CFG[statusFilter].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")} className="text-xs">Tous les statuts</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.entries(STATUS_CFG) as [ClientStatus, typeof STATUS_CFG[ClientStatus]][]).map(([key, cfg]) => (
                            <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)} className="text-xs gap-2">
                                <span className={`h-2 w-2 rounded-full ${cfg.bg}`} />
                                {cfg.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} client{filtered.length > 1 ? "s" : ""}</span>
            </motion.div>

            {/* Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Client</th>
                            <th className="text-left py-2 px-2">Type</th>
                            <th className="text-right py-2 px-2">Users</th>
                            <th className="text-left py-2 px-2">Plan</th>
                            <th className="text-right py-2 px-2">Revenue</th>
                            <th className="text-left py-2 px-2 hidden md:table-cell">Contact</th>
                            <th className="text-center py-2 px-2">Statut</th>
                            <th className="text-center py-2 px-2 w-10">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((c) => {
                            const plan = PLAN_CFG[c.plan];
                            const status = STATUS_CFG[c.status];
                            return (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2.5 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                <Building2 className="h-3.5 w-3.5 text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-[10px] text-muted-foreground">Depuis {c.since}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-2 text-muted-foreground">{c.type}</td>
                                    <td className="py-2.5 px-2 text-right font-mono">{c.users}</td>
                                    <td className="py-2.5 px-2">
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${plan.bg} ${plan.color}`}>{c.plan}</Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-right font-mono">{c.revenue}</td>
                                    <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{c.contact}</td>
                                    <td className="py-2.5 px-2 text-center">
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${status.bg} ${status.color}`}>{status.label}</Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onClick={() => handleAction("view", c)} className="text-xs gap-2 cursor-pointer">
                                                    <Eye className="h-3.5 w-3.5" /> Voir les détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction("edit", c)} className="text-xs gap-2 cursor-pointer">
                                                    <Pencil className="h-3.5 w-3.5" /> Modifier le plan
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction("upgrade", c)} className="text-xs gap-2 cursor-pointer">
                                                    <TrendingUp className="h-3.5 w-3.5" /> Proposer upgrade
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {c.status === "active" || c.status === "trial" ? (
                                                    <DropdownMenuItem onClick={() => handleAction("suspend", c)} className="text-xs gap-2 cursor-pointer text-amber-400">
                                                        <Ban className="h-3.5 w-3.5" /> Suspendre
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleAction("reactivate", c)} className="text-xs gap-2 cursor-pointer text-emerald-400">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Réactiver
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm font-medium">Aucun client trouvé</p>
                                    <p className="text-[11px] mt-1">Modifiez vos filtres ou votre recherche</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
