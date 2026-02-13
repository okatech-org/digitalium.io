// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin Dashboard
// Module overview: iDocument · iArchive · iSignature
// Recent docs, pending signatures, team activity
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Archive,
    PenTool,
    ArrowUpRight,
    Clock,
    Users,
    FolderOpen,
    CheckCircle2,
    AlertCircle,
    Activity,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Module Cards ──────────────────────────────── */

const MODULES = [
    {
        name: "iDocument",
        icon: FileText,
        color: "from-blue-600 to-cyan-500",
        textColor: "text-blue-400",
        bgColor: "bg-blue-500/10",
        stats: [
            { label: "Mes documents", value: "124" },
            { label: "Partagés", value: "47" },
            { label: "Templates", value: "12" },
            { label: "Corbeille", value: "3" },
        ],
        href: "/subadmin/idocument",
    },
    {
        name: "iArchive",
        icon: Archive,
        color: "from-amber-600 to-orange-500",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/10",
        stats: [
            { label: "Fiscales", value: "89" },
            { label: "Sociales", value: "156" },
            { label: "Juridiques", value: "34" },
            { label: "Coffre-Fort", value: "7" },
        ],
        href: "/subadmin/iarchive/fiscal",
    },
    {
        name: "iSignature",
        icon: PenTool,
        color: "from-violet-600 to-purple-500",
        textColor: "text-violet-400",
        bgColor: "bg-violet-500/10",
        stats: [
            { label: "À signer", value: "3" },
            { label: "En attente", value: "5" },
            { label: "Signés ce mois", value: "28" },
            { label: "Workflows actifs", value: "4" },
        ],
        href: "/subadmin/isignature/pending",
    },
];

/* ─── Recent Documents ──────────────────────────── */

const RECENT_DOCS = [
    { name: "Rapport Q4 2025 — Finances.pdf", type: "PDF", size: "2.4 MB", date: "Il y a 2h", module: "iDocument", status: "modifié" },
    { name: "Convention collective 2026.docx", type: "DOCX", size: "890 KB", date: "Il y a 5h", module: "iArchive", status: "archivé" },
    { name: "Contrat prestation — SEEG.pdf", type: "PDF", size: "1.1 MB", date: "Hier", module: "iSignature", status: "signé" },
    { name: "Budget prévisionnel 2026.xlsx", type: "XLSX", size: "3.2 MB", date: "Hier", module: "iDocument", status: "partagé" },
    { name: "PV AG Extraordinaire.pdf", type: "PDF", size: "456 KB", date: "Il y a 3j", module: "iArchive", status: "archivé" },
];

/* ─── Pending Signatures ────────────────────────── */

const PENDING_SIGS = [
    { doc: "Contrat CDI — M. Obiang", requestedBy: "Marie Nzé", date: "Il y a 1h", priority: "haute" as const },
    { doc: "Ordre de mission #242", requestedBy: "Patrick Akogo", date: "Il y a 3h", priority: "normale" as const },
    { doc: "Avenant bail bureau Libreville", requestedBy: "Sylvie Moussavou", date: "Hier", priority: "haute" as const },
];

/* ─── Team Activity ─────────────────────────────── */

const TEAM_ACTIVITY = [
    { user: "Marie Nzé", action: "a partagé", target: "Rapport RH Q4.pdf", time: "Il y a 30 min", avatar: "MN" },
    { user: "Patrick Obiang", action: "a archivé", target: "Facture #2026-089", time: "Il y a 1h", avatar: "PO" },
    { user: "David Mba", action: "a signé", target: "Contrat prestation IT", time: "Il y a 2h", avatar: "DM" },
    { user: "Sylvie Moussavou", action: "a créé", target: "Template — Ordre de mission", time: "Il y a 4h", avatar: "SM" },
    { user: "Chantal Ayo", action: "a commenté", target: "Budget 2026 v3.xlsx", time: "Hier", avatar: "CA" },
];

/* ═══════════════════════════════════════════════ */

export default function SubAdminDashboardPage() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6 max-w-[1400px] mx-auto"
        >
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-violet-400" />
                        Espace DIGITALIUM
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Vue d&apos;ensemble de vos modules · Aujourd&apos;hui, 12 fév 2026
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8 hidden sm:flex">
                    <Activity className="h-3.5 w-3.5" /> Rapport d&apos;activité
                </Button>
            </motion.div>

            {/* Module Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                        <div
                            key={mod.name}
                            className="glass-card rounded-2xl p-5 relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.color}`} />
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`h-9 w-9 rounded-xl ${mod.bgColor} flex items-center justify-center`}>
                                        <Icon className={`h-5 w-5 ${mod.textColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base">{mod.name}</h3>
                                    </div>
                                </div>
                                <a href={mod.href}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground group-hover:text-foreground">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {mod.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-lg font-bold">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Main Grid: Recent Docs + Pending Signatures + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4">
                {/* Left column */}
                <div className="space-y-4">
                    {/* Recent Documents */}
                    <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-sm flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-violet-400" />
                                Documents récents
                            </h2>
                            <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                {RECENT_DOCS.length} éléments
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            {RECENT_DOCS.map((doc, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4 text-violet-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{doc.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {doc.type} · {doc.size} · {doc.module}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <Badge
                                            variant="secondary"
                                            className={`text-[9px] border-0 ${doc.status === "signé"
                                                    ? "bg-emerald-500/15 text-emerald-400"
                                                    : doc.status === "archivé"
                                                        ? "bg-amber-500/15 text-amber-400"
                                                        : "bg-blue-500/15 text-blue-400"
                                                }`}
                                        >
                                            {doc.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground hidden sm:block">{doc.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Pending Signatures */}
                    <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-sm flex items-center gap-2">
                                <PenTool className="h-4 w-4 text-violet-400" />
                                Signatures en attente
                            </h2>
                            <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">
                                {PENDING_SIGS.length} à signer
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            {PENDING_SIGS.map((sig, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between px-3 py-3 rounded-lg bg-white/[0.02] border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${sig.priority === "haute" ? "bg-red-400" : "bg-blue-400"}`} />
                                        <div>
                                            <p className="text-xs font-medium">{sig.doc}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Par {sig.requestedBy} · {sig.date}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                                    >
                                        Signer
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right column: Team Activity */}
                <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                    <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-violet-400" />
                        Activité de l&apos;équipe
                    </h2>
                    <div className="space-y-3">
                        {TEAM_ACTIVITY.map((act, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="h-7 w-7 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[9px] font-bold text-violet-300">{act.avatar}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs">
                                        <span className="font-medium">{act.user}</span>{" "}
                                        <span className="text-muted-foreground">{act.action}</span>{" "}
                                        <span className="font-medium text-violet-300">{act.target}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick stats */}
                    <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                        <div className="text-center">
                            <p className="text-lg font-bold text-violet-400">47</p>
                            <p className="text-[10px] text-muted-foreground">Actions aujourd&apos;hui</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-emerald-400">12</p>
                            <p className="text-[10px] text-muted-foreground">Membres actifs</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
