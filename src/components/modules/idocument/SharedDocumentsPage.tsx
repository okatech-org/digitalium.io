"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Documents Partagés — Connecté Convex
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Share2, Search, FileText, Clock, Eye, Edit3,
    ChevronRight, Users, Loader2, MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// ─── Types ──────────────────────────────────────────────────────

type Permission = "read" | "edit" | "comment";

// ─── Status config ──────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; class: string; dot: string }> = {
    draft: { label: "Brouillon", class: "bg-zinc-500/15 text-zinc-400", dot: "bg-zinc-400" },
    review: { label: "En révision", class: "bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
    approved: { label: "Approuvé", class: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
    archived: { label: "Archivé", class: "bg-violet-500/15 text-violet-400", dot: "bg-violet-400" },
};

const PERMISSION_CFG: Record<Permission, { label: string; icon: React.ElementType; class: string }> = {
    read: { label: "Lecture", icon: Eye, class: "bg-zinc-500/15 text-zinc-400" },
    edit: { label: "Édition", icon: Edit3, class: "bg-amber-500/15 text-amber-400" },
    comment: { label: "Commentaire", icon: MessageSquare, class: "bg-blue-500/15 text-blue-400" },
};

// ─── Helpers ────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatTimeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SharedDocumentsPage() {
    const router = useRouter();
    // NOTE: Replace hardcoded user with useAuth() hook
    const currentUserId = "Daniel Nguema";

    const sharedDocs = useQuery(api.documents.listSharedWith, {
        userId: currentUserId,
    });

    const [search, setSearch] = useState("");
    const [permFilter, setPermFilter] = useState<Permission | "all">("all");

    const filtered = useMemo(() => {
        let list = sharedDocs ?? [];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (d) =>
                    d.title.toLowerCase().includes(q) ||
                    d.createdBy.toLowerCase().includes(q)
            );
        }
        if (permFilter !== "all") {
            list = list.filter((d) => {
                const shared = d.sharedWith?.find((s) => s.userId === currentUserId);
                return shared?.permission === permFilter;
            });
        }
        return list;
    }, [sharedDocs, search, permFilter, currentUserId]);

    // ─── Loading state ────────────────────────
    if (sharedDocs === undefined) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des documents partagés…</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Share2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Documents Partagés</h1>
                        <p className="text-sm text-muted-foreground">
                            {filtered.length} document{filtered.length > 1 ? "s" : ""} partagé{filtered.length > 1 ? "s" : ""} avec vous
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Toolbar */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher dans les documents partagés…"
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />
                            {/* Permission filter */}
                            {(["all", "read", "edit", "comment"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPermFilter(p)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${permFilter === p
                                        ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30"
                                        : "text-muted-foreground hover:bg-white/5"
                                        }`}
                                >
                                    {p === "all" ? "Tous" : p === "read" ? "Lecture seule" : p === "edit" ? "Éditable" : "Commentaire"}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Documents list */}
            <div className="space-y-3">
                {filtered.map((doc) => {
                    const st = STATUS_CFG[doc.status] ?? STATUS_CFG.draft;
                    const shared = doc.sharedWith?.find((s) => s.userId === currentUserId);
                    const permission: Permission = (shared?.permission as Permission) ?? "read";
                    const perm = PERMISSION_CFG[permission];
                    const PermIcon = perm.icon;
                    const sharedByName = shared?.sharedBy ?? doc.createdBy;

                    return (
                        <motion.div key={doc._id} variants={fadeUp}>
                            <Card
                                className="glass border-white/5 hover:border-cyan-500/20 transition-colors group cursor-pointer"
                                onClick={() => router.push(`/pro/idocument/edit/${doc._id}`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <FileText className="h-5 w-5 text-cyan-400" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-sm font-semibold group-hover:text-cyan-300 transition-colors line-clamp-1">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                                        {doc.excerpt || "Aucun extrait disponible"}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-cyan-400 transition-colors" />
                                            </div>

                                            {/* Meta row */}
                                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                                                {/* Shared by */}
                                                <span className="flex items-center gap-1">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarFallback className="bg-cyan-500/15 text-cyan-300 text-[7px]">
                                                            {getInitials(sharedByName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    Partagé par {sharedByName}
                                                </span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" /> {shared?.sharedAt ? formatTimeAgo(shared.sharedAt) : "—"}
                                                </span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-2.5 w-2.5" /> {doc.collaborators.length} collaborateur{doc.collaborators.length > 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge className={`text-[9px] h-5 border-0 ${perm.class}`}>
                                                <PermIcon className="h-2.5 w-2.5 mr-1" />
                                                {perm.label}
                                            </Badge>
                                            <Badge className={`text-[9px] h-5 border-0 ${st.class}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1`} />
                                                {st.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <motion.div variants={fadeUp} className="flex flex-col items-center py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
                        <Share2 className="h-8 w-8 text-cyan-400/60" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Aucun document partagé</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Les documents partagés avec vous apparaîtront ici.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
