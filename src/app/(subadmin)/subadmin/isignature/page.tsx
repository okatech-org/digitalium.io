"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: iSignature Dashboard
// Root page for /subadmin/isignature
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    PenTool,
    Clock,
    Send,
    CheckCircle2,
    GitBranch,
    ArrowRight,
    FileText,
    ShieldCheck,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── Animations ──────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ─── Quick-link cards ────────────────────────── */

const SECTIONS = [
    {
        label: "À signer",
        description: "Documents en attente de votre signature",
        href: "/subadmin/isignature/pending",
        icon: Clock,
        gradient: "from-amber-600 to-orange-500",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        badge: 3,
    },
    {
        label: "Envoyés",
        description: "Documents envoyés pour signature à d'autres personnes",
        href: "/subadmin/isignature/waiting",
        icon: Send,
        gradient: "from-blue-600 to-cyan-500",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        badge: 5,
    },
    {
        label: "Documents signés",
        description: "Historique des documents signés avec certificats",
        href: "/subadmin/isignature/completed",
        icon: CheckCircle2,
        gradient: "from-emerald-600 to-teal-500",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        badge: 6,
    },
    {
        label: "Workflows",
        description: "Circuits de signature automatisés et modèles",
        href: "/subadmin/isignature/workflows",
        icon: GitBranch,
        gradient: "from-violet-600 to-purple-500",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        badge: 5,
    },
];

/* ─── Recent activity feed (demo) ─────────────── */

const RECENT_ACTIVITY = [
    {
        id: "a1",
        text: "Contrat prestation SOGARA — Q2 2026",
        action: "En attente de votre signature",
        time: "Il y a 2h",
        urgent: true,
        icon: Clock,
        color: "text-amber-400",
    },
    {
        id: "a2",
        text: "Convention partenariat SEEG 2026",
        action: "Marie Obame a signé (1/2)",
        time: "Il y a 4h",
        urgent: false,
        icon: CheckCircle2,
        color: "text-emerald-400",
    },
    {
        id: "a3",
        text: "Contrat annuel SOGARA 2025",
        action: "Document complètement signé",
        time: "Hier",
        urgent: false,
        icon: CheckCircle2,
        color: "text-emerald-400",
    },
    {
        id: "a4",
        text: "Procuration générale — Mission Afrique du Sud",
        action: "En attente de votre signature ⚠️",
        time: "Il y a 1j",
        urgent: true,
        icon: AlertTriangle,
        color: "text-red-400",
    },
    {
        id: "a5",
        text: "Accord de non-divulgation — COMILOG",
        action: "Envoyé à Claude Mboumba",
        time: "Il y a 2j",
        urgent: false,
        icon: Send,
        color: "text-blue-400",
    },
];

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function SubAdminISignaturePage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <PenTool className="h-6 w-6 text-violet-400" />
                    iSignature
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Signature électronique certifiée — Workflow de validation et horodatage
                </p>
            </motion.div>

            {/* Compliance Banner */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 bg-violet-500/5 border border-violet-500/20 rounded-xl px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-violet-400 shrink-0" />
                <p className="text-xs text-violet-300">
                    <span className="font-semibold">Signature conforme eIDAS &amp; OHADA</span> — Horodatage certifié, preuve d&apos;intégrité et piste d&apos;audit complète
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatsCard label="À signer" value={3} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" />
                <StatsCard label="Envoyés" value={5} icon={Send} color="text-blue-400" bg="bg-blue-500/10" />
                <StatsCard label="Signés ce mois" value={6} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" />
                <StatsCard label="Workflows actifs" value={4} icon={GitBranch} color="text-violet-400" bg="bg-violet-500/10" />
            </motion.div>

            {/* Sections Grid */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-400" />
                    Espaces de signature
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <Link key={section.href} href={section.href} className="group">
                                <motion.div
                                    variants={fadeUp}
                                    className={`bg-white/[0.02] border ${section.border} rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300 group-hover:scale-[1.01]`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <Badge variant="secondary" className={`${section.bg} ${section.color} border-0 text-[10px]`}>
                                            {section.badge} {section.badge === 1 ? "élément" : "éléments"}
                                        </Badge>
                                    </div>

                                    <h3 className="text-sm font-semibold">{section.label}</h3>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {section.description}
                                    </p>

                                    <div className="flex items-center justify-end mt-4 pt-3 border-t border-white/5">
                                        <ArrowRight className={`h-3.5 w-3.5 ${section.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-400" />
                    Activité récente
                </h2>
                <div className="space-y-1.5">
                    {RECENT_ACTIVITY.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.id}
                                variants={fadeUp}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.urgent
                                        ? "bg-red-500/5 border border-red-500/10"
                                        : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-lg ${item.urgent ? "bg-red-500/10" : "bg-white/[0.04]"} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.text}</p>
                                    <p className={`text-[11px] ${item.urgent ? "text-red-400" : "text-muted-foreground"}`}>
                                        {item.action}
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground/60 shrink-0">{item.time}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Stats Card ─────────────────────────────── */

function StatsCard({
    label,
    value,
    icon: Icon,
    color,
    bg,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bg: string;
}) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
        </div>
    );
}
