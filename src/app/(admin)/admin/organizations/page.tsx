// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Organisations
// Grille/liste des organisations clientes
// avec plan, membres, modules actifs, actions
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Search,
    Plus,
    MoreHorizontal,
    Users,
    CreditCard,
    FileText,
    Archive,
    PenTool,
    Eye,
    Settings,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    Calendar,
    Globe,
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

type PlanType = "starter" | "pro" | "enterprise" | "institutional";

interface Organisation {
    id: string;
    nom: string;
    secteur: string;
    plan: PlanType;
    membres: number;
    documents: number;
    archives: number;
    signatures: number;
    dateCreation: string;
    actif: boolean;
    ville: string;
}

/* ─── Config ─────────────────────────────────────── */

const PLAN_CONFIG: Record<PlanType, { label: string; color: string; bg: string }> = {
    starter: { label: "Starter", color: "text-gray-400", bg: "bg-gray-500/15" },
    pro: { label: "Pro", color: "text-blue-400", bg: "bg-blue-500/15" },
    enterprise: { label: "Enterprise", color: "text-violet-400", bg: "bg-violet-500/15" },
    institutional: { label: "Institutionnel", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

/* ─── Mock Data ──────────────────────────────────── */

const ORGANISATIONS: Organisation[] = [
    { id: "ORG001", nom: "SEEG", secteur: "Énergie & Eau", plan: "enterprise", membres: 45, documents: 1240, archives: 560, signatures: 89, dateCreation: "2025-06-15", actif: true, ville: "Libreville" },
    { id: "ORG002", nom: "BGFI Bank", secteur: "Banque", plan: "enterprise", membres: 128, documents: 3450, archives: 1800, signatures: 412, dateCreation: "2025-05-20", actif: true, ville: "Libreville" },
    { id: "ORG003", nom: "CNAMGS", secteur: "Santé publique", plan: "institutional", membres: 67, documents: 890, archives: 420, signatures: 156, dateCreation: "2025-07-10", actif: true, ville: "Libreville" },
    { id: "ORG004", nom: "ASCOMA Gabon", secteur: "Assurance", plan: "pro", membres: 23, documents: 345, archives: 120, signatures: 67, dateCreation: "2025-09-05", actif: true, ville: "Libreville" },
    { id: "ORG005", nom: "Gabon Oil Company", secteur: "Pétrole", plan: "enterprise", membres: 56, documents: 2100, archives: 980, signatures: 234, dateCreation: "2025-08-22", actif: true, ville: "Port-Gentil" },
    { id: "ORG006", nom: "Min. Santé", secteur: "Gouvernement", plan: "institutional", membres: 34, documents: 780, archives: 340, signatures: 45, dateCreation: "2025-10-01", actif: true, ville: "Libreville" },
    { id: "ORG007", nom: "ANPI-Gabon", secteur: "Agence publique", plan: "starter", membres: 8, documents: 120, archives: 45, signatures: 12, dateCreation: "2025-12-10", actif: false, ville: "Libreville" },
    { id: "ORG008", nom: "Owendo Terminal", secteur: "Transport", plan: "pro", membres: 18, documents: 560, archives: 230, signatures: 78, dateCreation: "2025-11-15", actif: true, ville: "Owendo" },
];

const KPIS = [
    { label: "Organisations", value: "156", icon: Building2, color: "from-violet-600 to-purple-500" },
    { label: "Membres totaux", value: "2 847", icon: Users, color: "from-blue-600 to-cyan-500" },
    { label: "Plans Enterprise", value: "34", icon: CreditCard, color: "from-amber-600 to-orange-500" },
    { label: "Docs ce mois", value: "12.4k", icon: FileText, color: "from-emerald-600 to-green-500" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ═══════════════════════════════════════════════
   ORGANISATIONS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminOrganizationsPage() {
    const [search, setSearch] = useState("");

    const filteredOrgs = ORGANISATIONS.filter((org) =>
        org.nom.toLowerCase().includes(search.toLowerCase()) ||
        org.secteur.toLowerCase().includes(search.toLowerCase()) ||
        org.ville.toLowerCase().includes(search.toLowerCase())
    );

    const handleAction = useCallback((action: string, orgName: string) => {
        console.log(`Action: ${action} on ${orgName}`);
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-violet-400" />
                        Organisations
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {ORGANISATIONS.length} organisations enregistrées
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8 hidden sm:flex">
                    <Plus className="h-3.5 w-3.5" /> Nouvelle Organisation
                </Button>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {KPIS.map((kpi) => {
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

            {/* Search */}
            <motion.div variants={fadeUp}>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une organisation…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
            </motion.div>

            {/* Organisations Grid */}
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrgs.map((org, i) => {
                    const planCfg = PLAN_CONFIG[org.plan];
                    return (
                        <motion.div
                            key={org.id}
                            variants={fadeUp}
                            className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors"
                        >
                            {/* Top gradient bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${org.plan === "enterprise" ? "from-violet-500 to-purple-500" :
                                    org.plan === "institutional" ? "from-emerald-500 to-green-500" :
                                        org.plan === "pro" ? "from-blue-500 to-cyan-500" :
                                            "from-gray-500 to-gray-400"
                                }`} />

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{org.nom}</h3>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Globe className="h-3 w-3" /> {org.secteur} · {org.ville}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onClick={() => handleAction("view", org.nom)} className="text-xs gap-2">
                                            <Eye className="h-3.5 w-3.5" /> Voir détails
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAction("edit", org.nom)} className="text-xs gap-2">
                                            <Settings className="h-3.5 w-3.5" /> Modifier plan
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAction("members", org.nom)} className="text-xs gap-2">
                                            <Users className="h-3.5 w-3.5" /> Gérer membres
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Plan + Status */}
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="secondary" className={`text-[9px] ${planCfg.bg} ${planCfg.color} border-0`}>
                                    {planCfg.label}
                                </Badge>
                                <Badge variant="secondary" className={`text-[9px] border-0 ${org.actif ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                    {org.actif ? "Actif" : "Inactif"}
                                </Badge>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <Users className="h-3.5 w-3.5 mx-auto text-blue-400 mb-1" />
                                    <p className="text-sm font-bold">{org.membres}</p>
                                    <p className="text-[8px] text-muted-foreground">Membres</p>
                                </div>
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <FileText className="h-3.5 w-3.5 mx-auto text-cyan-400 mb-1" />
                                    <p className="text-sm font-bold">{org.documents > 999 ? `${(org.documents / 1000).toFixed(1)}k` : org.documents}</p>
                                    <p className="text-[8px] text-muted-foreground">Docs</p>
                                </div>
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <Archive className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                                    <p className="text-sm font-bold">{org.archives}</p>
                                    <p className="text-[8px] text-muted-foreground">Archives</p>
                                </div>
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <PenTool className="h-3.5 w-3.5 mx-auto text-violet-400 mb-1" />
                                    <p className="text-sm font-bold">{org.signatures}</p>
                                    <p className="text-[8px] text-muted-foreground">Signatures</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {filteredOrgs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Aucune organisation trouvée</p>
                </div>
            )}
        </motion.div>
    );
}
