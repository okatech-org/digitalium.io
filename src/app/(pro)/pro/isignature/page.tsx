"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Main Page
// 3 tabs: À signer, En attente, Signés
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    PenTool,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    User,
    Calendar,
    ChevronRight,
    Loader2,
    Send,
    Inbox,
    Filter,
    Eye,
} from "lucide-react";
import SignatureRequestModal from "@/components/modules/isignature/SignatureRequestModal";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────

type TabKey = "to_sign" | "sent" | "completed";

interface SignatureRequest {
    id: string;
    title: string;
    requester: { name: string; avatar: string };
    requestedAt: number;
    deadline?: number;
    signers: { name: string; email: string; status: "pending" | "signed" | "declined" }[];
    status: "pending" | "in_progress" | "completed" | "cancelled";
}

// ─── Mock data ──────────────────────────────────

const MOCK_TO_SIGN: SignatureRequest[] = [
    {
        id: "sig-1",
        title: "Contrat prestation SOGARA — Q2 2026",
        requester: { name: "Daniel Nguema", avatar: "DN" },
        requestedAt: Date.now() - 2 * 3600 * 1000,
        deadline: Date.now() + 3 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "pending" },
            { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", status: "signed" },
        ],
        status: "in_progress",
    },
    {
        id: "sig-2",
        title: "Avenant bail Immeuble Triomphal 2026",
        requester: { name: "Marie Obame", avatar: "MO" },
        requestedAt: Date.now() - 24 * 3600 * 1000,
        deadline: Date.now() + 7 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "pending" },
        ],
        status: "pending",
    },
    {
        id: "sig-3",
        title: "Procuration générale — Mission Afrique du Sud",
        requester: { name: "Aimée Gondjout", avatar: "AG" },
        requestedAt: Date.now() - 3 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "pending" },
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "pending" },
        ],
        status: "pending",
    },
];

const MOCK_SENT: SignatureRequest[] = [
    {
        id: "sig-4",
        title: "NDA — Partenariat COMILOG",
        requester: { name: "Ornella Doumba", avatar: "OD" },
        requestedAt: Date.now() - 4 * 3600 * 1000,
        deadline: Date.now() + 5 * 24 * 3600 * 1000,
        signers: [
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "signed" },
            { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", status: "pending" },
        ],
        status: "in_progress",
    },
    {
        id: "sig-5",
        title: "Attestation de conformité — Audit 2025",
        requester: { name: "Ornella Doumba", avatar: "OD" },
        requestedAt: Date.now() - 2 * 24 * 3600 * 1000,
        signers: [
            { name: "Marie Obame", email: "m.obame@digitalium.io", status: "pending" },
            { name: "Aimée Gondjout", email: "a.gondjout@digitalium.io", status: "pending" },
        ],
        status: "pending",
    },
];

const MOCK_COMPLETED: SignatureRequest[] = [
    {
        id: "sig-6",
        title: "Contrat CDI — Recrutement IT Senior",
        requester: { name: "Daniel Nguema", avatar: "DN" },
        requestedAt: Date.now() - 10 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "signed" },
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "signed" },
        ],
        status: "completed",
    },
    {
        id: "sig-7",
        title: "Convention de stage — 2026-S1",
        requester: { name: "Marie Obame", avatar: "MO" },
        requestedAt: Date.now() - 15 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "signed" },
            { name: "Marie Obame", email: "m.obame@digitalium.io", status: "signed" },
            { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", status: "signed" },
        ],
        status: "completed",
    },
    {
        id: "sig-8",
        title: "Devis accepté — Infrastructure Cloud",
        requester: { name: "Aimée Gondjout", avatar: "AG" },
        requestedAt: Date.now() - 20 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "signed" },
        ],
        status: "completed",
    },
];

// ─── Helpers ────────────────────────────────────

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Il y a moins d'1h";
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}

function daysUntil(ts: number): string {
    const days = Math.ceil((ts - Date.now()) / (24 * 3600 * 1000));
    if (days <= 0) return "Expiré";
    if (days === 1) return "Demain";
    return `${days} jours`;
}

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "to_sign", label: "À signer", icon: PenTool },
    { key: "sent", label: "En attente", icon: Send },
    { key: "completed", label: "Signés", icon: CheckCircle2 },
];

// ─── Signer Status Icons ────────────────────────

function SignerStatusIcon({ status }: { status: string }) {
    switch (status) {
        case "signed":
            return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
        case "declined":
            return <XCircle className="h-3 w-3 text-red-400" />;
        default:
            return <Clock className="h-3 w-3 text-amber-400" />;
    }
}

// ─── Component ──────────────────────────────────

export default function ISignaturePage() {
    const [activeTab, setActiveTab] = useState<TabKey>("to_sign");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const tabData: Record<TabKey, SignatureRequest[]> = {
        to_sign: MOCK_TO_SIGN,
        sent: MOCK_SENT,
        completed: MOCK_COMPLETED,
    };

    const items = tabData[activeTab].filter(
        (item) =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.requester.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">iSignature</h1>
                        <p className="text-xs text-muted-foreground">
                            Validation électronique avec traçabilité complète
                        </p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                    onClick={() => setShowModal(true)}
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Demander une signature
                </Button>
            </motion.div>

            {/* ═══ STATS ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="grid grid-cols-3 gap-3"
            >
                {[
                    { label: "À signer", value: MOCK_TO_SIGN.length, icon: Inbox, color: "text-amber-400" },
                    { label: "En attente", value: MOCK_SENT.length, icon: Send, color: "text-blue-400" },
                    { label: "Complétés", value: MOCK_COMPLETED.length, icon: CheckCircle2, color: "text-emerald-400" },
                ].map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <StatIcon className={`h-3.5 w-3.5 ${stat.color}`} />
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-lg font-bold">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ═══ TABS ═══ */}
            <div className="flex items-center gap-1 border-b border-white/5 pb-0">
                {TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const count = tabData[tab.key].length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
                                activeTab === tab.key
                                    ? "border-violet-500 text-violet-300"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            <TabIcon className="h-3.5 w-3.5" />
                            {tab.label}
                            {count > 0 && (
                                <Badge
                                    variant="secondary"
                                    className={`text-[9px] h-4 px-1.5 ${
                                        activeTab === tab.key
                                            ? "bg-violet-500/20 text-violet-300"
                                            : "bg-white/5 text-zinc-500"
                                    } border-0`}
                                >
                                    {count}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ═══ SEARCH ═══ */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par titre ou demandeur…"
                    className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                />
            </div>

            {/* ═══ LIST ═══ */}
            <div className="space-y-2">
                <AnimatePresence mode="wait">
                    {items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12 text-center"
                        >
                            <PenTool className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500">Aucune demande de signature.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {items.map((item, i) => {
                                const signedCount = item.signers.filter((s) => s.status === "signed").length;
                                const totalSigners = item.signers.length;

                                return (
                                    <Link key={item.id} href={`/pro/isignature/${item.id}`}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                                        >
                                            {/* Avatar */}
                                            <div className="h-9 w-9 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] text-violet-300 font-bold">
                                                    {item.requester.avatar}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate group-hover:text-violet-300 transition-colors">
                                                    {item.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-zinc-500">
                                                        {item.requester.name}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600">·</span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {timeAgo(item.requestedAt)}
                                                    </span>
                                                    {item.deadline && (
                                                        <>
                                                            <span className="text-[10px] text-zinc-600">·</span>
                                                            <span className={`text-[10px] ${
                                                                item.deadline - Date.now() < 2 * 24 * 3600 * 1000
                                                                    ? "text-red-400"
                                                                    : "text-zinc-500"
                                                            }`}>
                                                                <Calendar className="h-2.5 w-2.5 inline mr-0.5" />
                                                                {daysUntil(item.deadline)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Signer avatars */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {item.signers.slice(0, 3).map((signer, si) => (
                                                    <div
                                                        key={si}
                                                        className="relative"
                                                        title={`${signer.name} — ${signer.status}`}
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                                                            <span className="text-[8px] text-zinc-400 font-bold">
                                                                {signer.name.split(" ").map((n) => n[0]).join("")}
                                                            </span>
                                                        </div>
                                                        <div className="absolute -bottom-0.5 -right-0.5">
                                                            <SignerStatusIcon status={signer.status} />
                                                        </div>
                                                    </div>
                                                ))}
                                                {item.signers.length > 3 && (
                                                    <span className="text-[9px] text-zinc-500 ml-0.5">
                                                        +{item.signers.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Progress */}
                                            <div className="shrink-0 text-right">
                                                <span className="text-[10px] text-zinc-400 font-mono">
                                                    {signedCount}/{totalSigners}
                                                </span>
                                                <div className="h-1 w-12 rounded-full bg-white/5 mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            signedCount === totalSigners
                                                                ? "bg-emerald-500"
                                                                : "bg-violet-500"
                                                        }`}
                                                        style={{ width: `${(signedCount / totalSigners) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="shrink-0">
                                                {activeTab === "to_sign" ? (
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-[10px] bg-gradient-to-r from-violet-600 to-indigo-500"
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <PenTool className="h-3 w-3 mr-1" />
                                                        Signer
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-[10px] text-zinc-400"
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        Voir
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ MODAL ═══ */}
            <SignatureRequestModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={(data) => {
                    toast.success(`Demande envoyée à ${data.signers.length} signataire(s)`);
                }}
                documents={[
                    { id: "d1", title: "Contrat prestation SOGARA — Q2 2026" },
                    { id: "d2", title: "Convention collective 2026" },
                    { id: "d3", title: "NDA — Partenariat COMILOG" },
                    { id: "d4", title: "Bail commercial — Immeuble Triomphal" },
                ]}
            />
        </div>
    );
}
