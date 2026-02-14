// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Clients
// Relation commerciale avec les organisations
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    UserCircle,
    Plus,
    Search,
    Users,
    TrendingUp,
    CreditCard,
    UserPlus,
    ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────────────── */

type PlanType = "starter" | "pro" | "enterprise" | "institutional";

interface Client {
    name: string;
    orgId: string;
    orgName: string;
    plan: PlanType;
    revenue: string;
    statut: string;
    dateDebut: string;
}

/* ─── Config ─────────────────────────────────────── */

const PLAN_CONFIG: Record<PlanType, { label: string; color: string; bg: string }> = {
    starter: { label: "Starter", color: "text-gray-400", bg: "bg-gray-500/15" },
    pro: { label: "Pro", color: "text-blue-400", bg: "bg-blue-500/15" },
    enterprise: { label: "Enterprise", color: "text-violet-400", bg: "bg-violet-500/15" },
    institutional: { label: "Institutionnel", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

/* ─── Mock Data ──────────────────────────────────── */

const CLIENTS: Client[] = [
    { name: "SEEG", orgId: "ORG001", orgName: "SEEG", plan: "enterprise", revenue: "4.5M XAF", statut: "Actif", dateDebut: "2025-06-15" },
    { name: "BGFI Bank", orgId: "ORG002", orgName: "BGFI Bank", plan: "enterprise", revenue: "8.2M XAF", statut: "Actif", dateDebut: "2025-05-20" },
    { name: "CNAMGS", orgId: "ORG003", orgName: "CNAMGS", plan: "institutional", revenue: "3.8M XAF", statut: "Actif", dateDebut: "2025-07-10" },
    { name: "Gabon Télécom", orgId: "ORG004", orgName: "Gabon Télécom", plan: "pro", revenue: "2.1M XAF", statut: "Actif", dateDebut: "2025-09-05" },
    { name: "Port-Gentil Logistique", orgId: "ORG005", orgName: "Port-Gentil Logistique", plan: "starter", revenue: "1.5M XAF", statut: "Actif", dateDebut: "2025-11-15" },
];

const KPIS = [
    { label: "Total Clients", value: "5", icon: Users, color: "from-blue-600 to-cyan-500" },
    { label: "Revenue mensuel", value: "20.1M XAF", icon: TrendingUp, color: "from-violet-600 to-purple-500" },
    { label: "Abonnements actifs", value: "5", icon: CreditCard, color: "from-emerald-600 to-green-500" },
    { label: "Nouveaux ce mois", value: "1", icon: UserPlus, color: "from-amber-600 to-orange-500" },
];

/* ═══════════════════════════════════════════════
   CLIENTS PAGE
   ═══════════════════════════════════════════════ */

export default function ClientsPage() {
    const [search, setSearch] = useState("");

    const filteredClients = CLIENTS.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.orgName.toLowerCase().includes(search.toLowerCase()) ||
            c.plan.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-blue-400" />
                        Clients
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {CLIENTS.length} relations commerciales
                    </p>
                </div>
                <Link href="/admin/clients/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                        <Plus className="h-3.5 w-3.5" /> Nouveau Client
                    </Button>
                </Link>
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
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
            </motion.div>

            {/* Clients Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Client</th>
                            <th className="text-left py-2 px-2">Organisation</th>
                            <th className="text-left py-2 px-2">Plan</th>
                            <th className="text-right py-2 px-2 hidden sm:table-cell">Revenue mensuel</th>
                            <th className="text-center py-2 px-2 hidden md:table-cell">Statut</th>
                            <th className="text-right py-2 px-2 hidden lg:table-cell">Date début</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map((c, i) => {
                            const planCfg = PLAN_CONFIG[c.plan];
                            return (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2.5 px-2 font-medium">{c.name}</td>
                                    <td className="py-2.5 px-2">
                                        <Link
                                            href={`/admin/organizations/${c.orgId}`}
                                            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                                        >
                                            {c.orgName}
                                            <ArrowUpRight className="h-3 w-3" />
                                        </Link>
                                    </td>
                                    <td className="py-2.5 px-2">
                                        <Badge variant="secondary" className={`text-[9px] ${planCfg.bg} ${planCfg.color} border-0`}>
                                            {planCfg.label}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-right font-mono hidden sm:table-cell">{c.revenue}</td>
                                    <td className="py-2.5 px-2 text-center hidden md:table-cell">
                                        <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">
                                            {c.statut}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-muted-foreground hidden lg:table-cell">{c.dateDebut}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredClients.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <UserCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">Aucun client trouvé</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
