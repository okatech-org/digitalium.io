"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: SubAdmin Console
// Organization administration for org_admin (level ≤ 2)
// ═══════════════════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    Settings, Users, Shield, Database, Activity,
    Building2, CreditCard, BarChart3, ArrowLeft,
    UserPlus, Lock, FileCheck, TrendingUp,
    Server, HardDrive, Key, Bell,
    ChevronRight, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import { getUserDisplayName, getRoleLabel } from "@/config/role-helpers";

/* ─── Animation ─── */
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

/* ─── Admin Modules ─── */
const adminModules = [
    {
        title: "Utilisateurs & Rôles",
        description: "Gérer les membres, invitations et permissions",
        icon: Users,
        gradient: "from-violet-600 to-purple-500",
        stats: [
            { label: "Membres", value: "5" },
            { label: "Invitations", value: "0" },
        ],
        href: "#users",
    },
    {
        title: "Sécurité & IAM",
        description: "Contrôle d'accès, audit trail, 2FA",
        icon: Shield,
        gradient: "from-emerald-600 to-teal-500",
        stats: [
            { label: "Score", value: "94%" },
            { label: "Alertes", value: "2" },
        ],
        href: "#security",
    },
    {
        title: "Configuration",
        description: "Paramètres de l'organisation, branding, modules",
        icon: Settings,
        gradient: "from-cyan-600 to-blue-500",
        stats: [
            { label: "Modules", value: "5" },
            { label: "Actifs", value: "5" },
        ],
        href: "#config",
    },
    {
        title: "Données & Stockage",
        description: "Archives, stockage, migration, sauvegarde",
        icon: Database,
        gradient: "from-amber-600 to-orange-500",
        stats: [
            { label: "Stockage", value: "2.4 GB" },
            { label: "Quota", value: "10 GB" },
        ],
        href: "#data",
    },
    {
        title: "Facturation",
        description: "Plan, factures, paiements et historique",
        icon: CreditCard,
        gradient: "from-pink-600 to-rose-500",
        stats: [
            { label: "Plan", value: "Pro" },
            { label: "Prochaine", value: "15 mars" },
        ],
        href: "#billing",
    },
    {
        title: "Analytics",
        description: "Utilisation, engagement et rapports",
        icon: BarChart3,
        gradient: "from-indigo-600 to-violet-500",
        stats: [
            { label: "Utilisateurs actifs", value: "5/5" },
            { label: "Actions/jour", value: "47" },
        ],
        href: "#analytics",
    },
];

/* ─── Recent Admin Actions ─── */
const recentActions = [
    { action: "Membre invité", detail: "inspecteur-peche@digitalium.io", time: "Il y a 2 jours", type: "success" },
    { action: "Rôle modifié", detail: "DGPA passé en niveau Manager", time: "Il y a 3 jours", type: "info" },
    { action: "Module activé", detail: "iAsted — Assistant IA", time: "Il y a 5 jours", type: "success" },
    { action: "Alerte sécurité", detail: "Tentative de connexion suspecte", time: "Il y a 7 jours", type: "warning" },
    { action: "Plan mis à jour", detail: "Passage au plan Professional", time: "Il y a 10 jours", type: "info" },
];

export default function SubAdminPage() {
    const { user } = useAuth();
    const { orgName } = useOrganization();
    const displayName = getUserDisplayName(user);
    const roleLabel = getRoleLabel(user);
    const isInstitutional = user?.personaType === "institutional";
    const backHref = isInstitutional ? "/institutional" : "/pro";
    const backLabel = isInstitutional ? "Espace Institutionnel" : "Espace Pro";

    return (
        <div className="min-h-screen bg-background">
            {/* Header Bar */}
            <header className="border-b border-white/5 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={backHref}>
                            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1.5">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                {backLabel}
                            </Button>
                        </Link>
                        <Separator orientation="vertical" className="h-6 bg-white/10" />
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{orgName}</p>
                                <p className="text-[10px] text-muted-foreground">Console d&apos;administration</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                            {roleLabel}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-xl font-bold">
                        Administration de <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{orgName}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configurez et gérez votre organisation, vos membres et vos paramètres de sécurité.
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Membres", value: "5", icon: Users, color: "text-violet-400" },
                        { label: "Score sécurité", value: "94%", icon: Shield, color: "text-emerald-400" },
                        { label: "Stockage", value: "24%", icon: HardDrive, color: "text-cyan-400" },
                        { label: "Uptime", value: "99.9%", icon: Activity, color: "text-green-400" },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
                                <Card className="bg-white/[0.02] border-white/5">
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                            <Icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Admin Module Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminModules.map((mod, i) => {
                        const Icon = mod.icon;
                        return (
                            <motion.div key={mod.title} custom={i + 4} initial="hidden" animate="visible" variants={fadeInUp}>
                                <Card className="bg-white/[0.02] border-white/5 hover:border-violet-500/20 transition-all cursor-pointer group h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <CardTitle className="text-sm font-semibold mt-2">{mod.title}</CardTitle>
                                        <CardDescription className="text-[11px]">{mod.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            {mod.stats.map((s) => (
                                                <div key={s.label}>
                                                    <p className="text-lg font-bold">{s.value}</p>
                                                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Recent Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="bg-white/[0.02] border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-violet-400" />
                                Actions d&apos;administration récentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                            {recentActions.map((entry, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className={`h-2 w-2 rounded-full shrink-0 ${entry.type === "success" ? "bg-emerald-400" :
                                            entry.type === "warning" ? "bg-amber-400" : "bg-gray-400"
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium">{entry.action}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{entry.detail}</p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{entry.time}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
