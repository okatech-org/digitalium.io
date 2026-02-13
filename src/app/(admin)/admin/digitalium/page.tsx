// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Espace DIGITALIUM: Dashboard
// Vue d'ensemble de l'entreprise DIGITALIUM
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Building,
    Users,
    Building2,
    Sparkles,
    UserCircle,
    ArrowUpRight,
    FolderOpen,
    FileText,
    PenTool,
    Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── KPI Data ───────────────────────────── */

const KPI_CARDS = [
    { label: "Employés", value: "35", icon: Users, color: "emerald", change: "+3 ce mois" },
    { label: "Bureaux", value: "3", icon: Building2, color: "teal", change: "Libreville, Owendo, PG" },
    { label: "Modules actifs", value: "3", icon: Sparkles, color: "violet", change: "iDoc, iArch, iSign" },
    { label: "Clients servis", value: "156", icon: UserCircle, color: "blue", change: "+12 ce trimestre" },
];

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    teal: { bg: "bg-teal-500/10", text: "text-teal-400", iconBg: "bg-teal-500/15" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/15" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/15" },
};

/* ─── Quick Links ────────────────────────── */

const QUICK_LINKS = [
    { label: "Profil Entreprise", href: "/admin/digitalium/profile", icon: Building, desc: "Informations légales et coordonnées" },
    { label: "Équipe", href: "/admin/digitalium/team", icon: Users, desc: "Gestion des membres DIGITALIUM" },
    { label: "Bureaux", href: "/admin/digitalium/offices", icon: Building2, desc: "Locaux et implantations" },
];

/* ─── Recent Activity ────────────────────── */

const RECENT = [
    { action: "Nouveau client ajouté", detail: "CNAMGS — Plan Enterprise", time: "Il y a 2h", icon: UserCircle },
    { action: "Module iSignature activé", detail: "Pour BGFI Bank", time: "Il y a 5h", icon: PenTool },
    { action: "Document archivé", detail: "Contrat SEEG #2024-089", time: "Hier", icon: FileText },
    { action: "Nouveau dossier créé", detail: "Dossier Fiscal Q1 2026", time: "Hier", icon: FolderOpen },
];

/* ═══════════════════════════════════════════ */

export default function DigitaliumDashboardPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Building className="h-6 w-6 text-emerald-400" />
                    DIGITALIUM
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Vue d&apos;ensemble de l&apos;entreprise · Technologies &amp; Services numériques
                </p>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_CARDS.map((kpi) => {
                    const colors = COLOR_MAP[kpi.color];
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="glass-card rounded-xl p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`h-9 w-9 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                                    <Icon className={`h-4 w-4 ${colors.text}`} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">{kpi.change}</span>
                            </div>
                            <p className="text-2xl font-bold">{kpi.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </motion.div>

            {/* Quick Links + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Quick Links */}
                <motion.div variants={fadeUp} className="lg:col-span-1 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest px-1">Accès rapide</p>
                    {QUICK_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href}>
                                <div className="glass-card rounded-xl p-4 border border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Icon className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{link.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={fadeUp} className="lg:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3 px-1">Activité récente</p>
                    <div className="glass-card rounded-2xl p-5 border border-white/5">
                        <div className="space-y-1">
                            {RECENT.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.02] group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Icon className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium">{item.action}</p>
                                                <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Platform Status */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-xs font-medium text-emerald-400">Plateforme opérationnelle</p>
                    <p className="text-[10px] text-muted-foreground">Tous les services sont actifs · Uptime 99.98% · Dernière mise à jour il y a 3j</p>
                </div>
                <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400">
                    v2.4.1
                </Badge>
            </motion.div>
        </motion.div>
    );
}
