// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Abonnements
// Plans, MRR, abonnements actifs, upgrades
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    TrendingUp,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Zap,
    Star,
    Building2,
    Crown,
    Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Mock Data ──────────────────────────────────── */

const PLANS = [
    {
        name: "Starter",
        price: "49 000",
        period: "/mois",
        color: "from-gray-500 to-gray-400",
        borderColor: "border-gray-500/20",
        icon: Zap,
        features: ["5 utilisateurs", "1 GB stockage", "iDocument basic", "Support email"],
        subscribers: 34,
    },
    {
        name: "Pro",
        price: "149 000",
        period: "/mois",
        color: "from-blue-600 to-cyan-500",
        borderColor: "border-blue-500/20",
        icon: Star,
        features: ["25 utilisateurs", "10 GB stockage", "iDocument + iArchive", "iSignature (50/mois)", "Support prioritaire"],
        subscribers: 89,
        popular: true,
    },
    {
        name: "Enterprise",
        price: "349 000",
        period: "/mois",
        color: "from-violet-600 to-purple-500",
        borderColor: "border-violet-500/20",
        icon: Crown,
        features: ["Illimité", "100 GB stockage", "Tous les modules", "iSignature illimité", "API access", "Support dédié"],
        subscribers: 23,
    },
    {
        name: "Institutionnel",
        price: "Sur devis",
        period: "",
        color: "from-emerald-600 to-green-500",
        borderColor: "border-emerald-500/20",
        icon: Shield,
        features: ["Déploiement dédié", "Stockage illimité", "Conformité RGPD+", "SLA 99.99%", "Intégrations custom", "Support 24/7"],
        subscribers: 10,
    },
];

const REVENUE_KPIS = [
    { label: "MRR", value: "18.4M", suffix: "XAF", trend: +5.2, icon: TrendingUp, color: "from-emerald-600 to-green-500" },
    { label: "ARR", value: "220.8M", suffix: "XAF", trend: +12.1, icon: CreditCard, color: "from-blue-600 to-cyan-500" },
    { label: "Abonnés actifs", value: "156", suffix: "", trend: +8.3, icon: Users, color: "from-violet-600 to-purple-500" },
    { label: "Churn rate", value: "2.1", suffix: "%", trend: -0.4, icon: AlertCircle, color: "from-amber-600 to-orange-500" },
];

const RECENT_CHANGES = [
    { org: "BGFI Bank", action: "Upgrade", from: "Pro", to: "Enterprise", date: "Il y a 2j", revenue: "+200 000 XAF" },
    { org: "Min. Santé", action: "Nouvel abonnement", from: "", to: "Institutionnel", date: "Il y a 5j", revenue: "+450 000 XAF" },
    { org: "ASCOMA Gabon", action: "Renouvellement", from: "Pro", to: "Pro", date: "Il y a 7j", revenue: "149 000 XAF" },
    { org: "ANPI-Gabon", action: "Downgrade", from: "Pro", to: "Starter", date: "Il y a 10j", revenue: "-100 000 XAF" },
    { org: "Gabon Oil Company", action: "Nouvel abonnement", from: "", to: "Enterprise", date: "Il y a 12j", revenue: "+349 000 XAF" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ═══════════════════════════════════════════════
   SUBSCRIPTIONS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminSubscriptionsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-violet-400" />
                    Abonnements
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Plans, revenus récurrents et gestion des abonnés
                </p>
            </motion.div>

            {/* Revenue KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {REVENUE_KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    const trendUp = kpi.trend > 0;
                    const trendLabel = kpi.label === "Churn rate" ? !trendUp : trendUp;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <Badge variant="secondary" className={`text-[9px] border-0 ${trendLabel ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(kpi.trend)}%
                                </Badge>
                            </div>
                            <p className="text-xl font-bold">
                                {kpi.value}<span className="text-xs text-muted-foreground ml-1">{kpi.suffix}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Plans Grid */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3">Plans disponibles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.name}
                                className={`glass-card rounded-2xl p-5 relative overflow-hidden border ${plan.borderColor} ${plan.popular ? "ring-1 ring-blue-500/30" : ""}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg">
                                        POPULAIRE
                                    </div>
                                )}

                                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>

                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-1 mb-4">
                                    <span className="text-2xl font-bold">{plan.price}</span>
                                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                                </div>

                                <ul className="space-y-2 mb-4">
                                    {plan.features.map((f) => (
                                        <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Abonnés</span>
                                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                            {plan.subscribers}
                                        </Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs mt-3 border-white/10 hover:bg-white/5"
                                        onClick={() => toast.info(`Plan ${plan.name}`, { description: `${plan.subscribers} abonnés · ${plan.price} XAF${plan.period}` })}
                                    >
                                        Gérer le plan
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Subscription Changes */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-400" />
                    Changements récents
                </h2>
                <div className="space-y-1">
                    {RECENT_CHANGES.map((change, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.06 }}
                            className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                    <Building2 className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-xs">
                                        <span className="font-semibold">{change.org}</span>
                                        <span className="text-muted-foreground"> — {change.action}</span>
                                    </p>
                                    {change.from && (
                                        <p className="text-[10px] text-muted-foreground">
                                            {change.from} → {change.to}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                                <p className={`text-xs font-semibold ${change.revenue.startsWith("+") ? "text-emerald-400" : change.revenue.startsWith("-") ? "text-red-400" : ""}`}>
                                    {change.revenue}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{change.date}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
