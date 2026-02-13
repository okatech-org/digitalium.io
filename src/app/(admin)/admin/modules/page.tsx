// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules: Dashboard Client-Centric
// Vue d'ensemble des clients et de leurs modules
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Sparkles,
    UserCircle,
    Package,
    Settings,
    HardDrive,
    Plus,
    ArrowUpRight,
    FileText,
    Archive,
    PenTool,
    CheckCircle2,
    Clock,
    Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Mock Data ─────────────────────────── */

const KPIS = [
    { label: "Total clients", value: "5", icon: UserCircle, color: "text-violet-400", bg: "bg-violet-500/15" },
    { label: "Modules actifs", value: "12", icon: Package, color: "text-blue-400", bg: "bg-blue-500/15" },
    { label: "Configs en cours", value: "2", icon: Settings, color: "text-amber-400", bg: "bg-amber-500/15" },
    { label: "Stockage", value: "128 GB", sub: "/ 500 GB", icon: HardDrive, color: "text-emerald-400", bg: "bg-emerald-500/15" },
];

const CLIENTS_SUMMARY = [
    { id: "seeg", name: "SEEG", type: "Établissement public", modules: ["iDocument", "iArchive", "iSignature"], hebergement: "Data Center", statut: "Actif", stockage: "45 GB" },
    { id: "dgdi", name: "DGDI", type: "Gouvernement", modules: ["iDocument", "iArchive"], hebergement: "Cloud", statut: "Actif", stockage: "32 GB" },
    { id: "minterieur", name: "Min. Intérieur", type: "Gouvernement", modules: ["iDocument", "iArchive", "iSignature"], hebergement: "Local", statut: "Actif", stockage: "28 GB" },
    { id: "gabtelecom", name: "Gabon Télécom", type: "Entreprise", modules: ["iDocument", "iSignature"], hebergement: "Cloud", statut: "Config", stockage: "15 GB" },
    { id: "pgl", name: "Port-Gentil Logistique", type: "Entreprise", modules: ["iDocument"], hebergement: "Cloud", statut: "Config", stockage: "8 GB" },
];

const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
    iDocument: { bg: "bg-blue-500/15", text: "text-blue-400" },
    iArchive: { bg: "bg-amber-500/15", text: "text-amber-400" },
    iSignature: { bg: "bg-violet-500/15", text: "text-violet-400" },
};

const RECENT_CONFIGS = [
    { action: "Activation iSignature", client: "SEEG", date: "Il y a 2h", icon: PenTool, color: "text-violet-400" },
    { action: "Workflow ajouté", client: "DGDI", date: "Il y a 5h", icon: Activity, color: "text-blue-400" },
    { action: "Hébergement migré", client: "Min. Intérieur", date: "Hier", icon: HardDrive, color: "text-emerald-400" },
    { action: "Archivage configuré", client: "SEEG", date: "Hier", icon: Archive, color: "text-amber-400" },
    { action: "Templates importés", client: "Gabon Télécom", date: "Il y a 3j", icon: FileText, color: "text-blue-400" },
];

/* ═══════════════════════════════════════════ */

export default function ModulesDashboardPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-violet-400" />
                        Espace Modules
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestion et configuration des modules pour vos clients
                    </p>
                </div>
                <Link href="/admin/modules/clients/new">
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                        <Plus className="h-3.5 w-3.5" /> Nouveau client
                    </Button>
                </Link>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`h-5 w-5 ${kpi.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold">
                                    {kpi.value}
                                    {kpi.sub && <span className="text-xs text-muted-foreground font-normal ml-1">{kpi.sub}</span>}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4">
                {/* Left: Client Table */}
                <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-sm flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-violet-400" />
                            Clients & Modules
                        </h2>
                        <Link href="/admin/modules/clients">
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1">
                                Voir tout <ArrowUpRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5 text-muted-foreground">
                                    <th className="text-left py-2 px-2">Client</th>
                                    <th className="text-left py-2 px-2 hidden md:table-cell">Type</th>
                                    <th className="text-left py-2 px-2">Modules</th>
                                    <th className="text-left py-2 px-2 hidden sm:table-cell">Hébergement</th>
                                    <th className="text-center py-2 px-2">Statut</th>
                                    <th className="text-right py-2 px-2 hidden lg:table-cell">Stockage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CLIENTS_SUMMARY.map((c) => (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer group">
                                        <td className="py-2.5 px-2">
                                            <Link href={`/admin/modules/clients/${c.id}`} className="font-medium hover:text-violet-300 transition-colors">
                                                {c.name}
                                            </Link>
                                        </td>
                                        <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{c.type}</td>
                                        <td className="py-2.5 px-2">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {c.modules.map((m) => (
                                                    <Badge key={m} variant="secondary" className={`text-[8px] border-0 px-1.5 ${MODULE_COLORS[m]?.bg} ${MODULE_COLORS[m]?.text}`}>
                                                        {m}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{c.hebergement}</td>
                                        <td className="py-2.5 px-2 text-center">
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${c.statut === "Actif" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                                                {c.statut === "Actif" ? <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> : <Clock className="h-2.5 w-2.5 mr-1" />}
                                                {c.statut}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-2 text-right font-mono text-muted-foreground hidden lg:table-cell">{c.stockage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Right: Recent Configs + Quick Actions */}
                <div className="space-y-4">
                    {/* Recent Configs */}
                    <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                        <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
                            <Activity className="h-4 w-4 text-violet-400" />
                            Configurations récentes
                        </h2>
                        <div className="space-y-3">
                            {RECENT_CONFIGS.map((cfg, i) => {
                                const Icon = cfg.icon;
                                return (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs">
                                                <span className="font-medium">{cfg.action}</span>
                                                <span className="text-muted-foreground"> — </span>
                                                <span className="text-violet-300">{cfg.client}</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.date}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                        <h2 className="font-semibold text-sm mb-3">Actions rapides</h2>
                        <div className="space-y-2">
                            <Link href="/admin/modules/clients/new">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300">
                                    <Plus className="h-3.5 w-3.5" /> Nouveau client
                                </Button>
                            </Link>
                            <Link href="/admin/modules/clients">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300 mt-2">
                                    <UserCircle className="h-3.5 w-3.5" /> Liste des clients
                                </Button>
                            </Link>
                            <Link href="/admin/modules/design-theme">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300 mt-2">
                                    <Sparkles className="h-3.5 w-3.5" /> Design System
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
