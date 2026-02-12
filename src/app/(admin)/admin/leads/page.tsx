// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Leads & Contacts
// Pipeline commercial : tableau de leads avec
// filtres, actions qualifier/convertir, KPIs
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Search,
    Filter,
    Plus,
    ArrowUpRight,
    Phone,
    Mail,
    Building2,
    Calendar,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Users,
    XCircle,
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

/* ─── Types ──────────────────────────────────────── */

type LeadStatus = "nouveau" | "qualifié" | "proposition" | "négociation" | "converti" | "perdu";

interface Lead {
    id: string;
    nom: string;
    organisation: string;
    email: string;
    telephone: string;
    source: string;
    status: LeadStatus;
    valeur: number;
    dateCreation: string;
    dernierContact: string;
}

/* ─── Mock Data ──────────────────────────────────── */

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    nouveau: { label: "Nouveau", color: "text-blue-400", bg: "bg-blue-500/15", icon: Plus },
    qualifié: { label: "Qualifié", color: "text-cyan-400", bg: "bg-cyan-500/15", icon: CheckCircle2 },
    proposition: { label: "Proposition", color: "text-amber-400", bg: "bg-amber-500/15", icon: Mail },
    négociation: { label: "Négociation", color: "text-orange-400", bg: "bg-orange-500/15", icon: Clock },
    converti: { label: "Converti", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    perdu: { label: "Perdu", color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

const LEADS_DATA: Lead[] = [
    { id: "L001", nom: "Ministère de la Santé", organisation: "Gouvernement", email: "contact@sante.gouv.ga", telephone: "+241 01 76 00 00", source: "Référence", status: "qualifié", valeur: 15000000, dateCreation: "2026-01-15", dernierContact: "Il y a 2j" },
    { id: "L002", nom: "CNAMGS", organisation: "Organisme public", email: "direction@cnamgs.ga", telephone: "+241 01 44 25 00", source: "Salon", status: "proposition", valeur: 8500000, dateCreation: "2026-01-20", dernierContact: "Il y a 5j" },
    { id: "L003", nom: "SEEG", organisation: "Entreprise publique", email: "dsi@seeg.ga", telephone: "+241 01 76 15 00", source: "Site web", status: "négociation", valeur: 22000000, dateCreation: "2025-12-10", dernierContact: "Hier" },
    { id: "L004", nom: "Ministère des Pêches", organisation: "Gouvernement", email: "sg@peches.gouv.ga", telephone: "+241 01 72 19 00", source: "Recommandation", status: "nouveau", valeur: 5000000, dateCreation: "2026-02-08", dernierContact: "Il y a 4j" },
    { id: "L005", nom: "Banque BGFI", organisation: "Secteur privé", email: "it@bgfi.com", telephone: "+241 01 79 32 00", source: "LinkedIn", status: "qualifié", valeur: 35000000, dateCreation: "2026-01-05", dernierContact: "Il y a 1j" },
    { id: "L006", nom: "Gabon Oil Company", organisation: "Entreprise publique", email: "digital@gabonoil.ga", telephone: "+241 01 76 88 00", source: "Salon", status: "converti", valeur: 18000000, dateCreation: "2025-11-20", dernierContact: "Il y a 10j" },
    { id: "L007", nom: "ANPI-Gabon", organisation: "Agence publique", email: "info@anpi.ga", telephone: "+241 01 79 64 00", source: "Site web", status: "perdu", valeur: 6000000, dateCreation: "2025-12-15", dernierContact: "Il y a 30j" },
];

const KPI = [
    { label: "Total Leads", value: 47, trend: "+12", icon: Target, color: "from-blue-600 to-cyan-500" },
    { label: "Taux conversion", value: "23%", trend: "+3.2%", icon: TrendingUp, color: "from-emerald-600 to-green-500" },
    { label: "En négociation", value: 8, trend: "+2", icon: Clock, color: "from-amber-600 to-orange-500" },
    { label: "Valeur pipeline", value: "109.5M", trend: "+18M", icon: Building2, color: "from-violet-600 to-purple-500" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ═══════════════════════════════════════════════
   LEADS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminLeadsPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");

    const filteredLeads = LEADS_DATA.filter((lead) => {
        const matchSearch = lead.nom.toLowerCase().includes(search.toLowerCase()) ||
            lead.organisation.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || lead.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleAction = useCallback((action: string, leadName: string) => {
        // Pattern 8 étapes — placeholder toast
        console.log(`Action: ${action} on ${leadName}`);
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="h-6 w-6 text-red-400" />
                        Leads & Contacts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pipeline commercial — {LEADS_DATA.length} leads actifs
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8 hidden sm:flex">
                    <Plus className="h-3.5 w-3.5" /> Nouveau Lead
                </Button>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {KPI.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">
                                    {kpi.trend}
                                </Badge>
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Search & Filters */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un lead…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => setFilterStatus("all")}
                    >
                        Tous
                    </Button>
                    {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "outline"}
                            size="sm"
                            className={`h-9 text-xs ${filterStatus === status ? "" : `${STATUS_CONFIG[status].color} border-white/10`}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {STATUS_CONFIG[status].label}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Leads Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 font-semibold text-muted-foreground">Lead</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Contact</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Source</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground hidden sm:table-cell">Valeur</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground hidden lg:table-cell">Dernier contact</th>
                                <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead, i) => {
                                const cfg = STATUS_CONFIG[lead.status];
                                const StatusIcon = cfg.icon;
                                return (
                                    <motion.tr
                                        key={lead.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.04 }}
                                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="p-4">
                                            <p className="font-semibold text-foreground">{lead.nom}</p>
                                            <p className="text-muted-foreground mt-0.5">{lead.organisation}</p>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Mail className="h-3 w-3" /> {lead.email}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Phone className="h-3 w-3" /> {lead.telephone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                                {lead.source}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {cfg.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right hidden sm:table-cell">
                                            <span className="font-semibold">{(lead.valeur / 1000000).toFixed(1)}M</span>
                                            <span className="text-muted-foreground ml-1">XAF</span>
                                        </td>
                                        <td className="p-4 text-right hidden lg:table-cell text-muted-foreground">
                                            {lead.dernierContact}
                                        </td>
                                        <td className="p-4 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleAction("view", lead.nom)} className="text-xs gap-2">
                                                        <ArrowUpRight className="h-3.5 w-3.5" /> Voir le détail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction("qualify", lead.nom)} className="text-xs gap-2">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Qualifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction("call", lead.nom)} className="text-xs gap-2">
                                                        <Phone className="h-3.5 w-3.5" /> Appeler
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction("email", lead.nom)} className="text-xs gap-2">
                                                        <Mail className="h-3.5 w-3.5" /> Envoyer email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleAction("convert", lead.nom)} className="text-xs gap-2 text-emerald-400">
                                                        <Users className="h-3.5 w-3.5" /> Convertir en client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction("lost", lead.nom)} className="text-xs gap-2 text-red-400">
                                                        <XCircle className="h-3.5 w-3.5" /> Marquer comme perdu
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">Aucun lead trouvé</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Ajustez vos filtres ou créez un nouveau lead</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
