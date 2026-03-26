// ═══════════════════════════════════════════════
// PolicyChangelogPanel — History of archive policy changes
// Shows a chronological list of changes to categories and config
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { History, Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// ─── Types ────────────────────────────────────

interface PolicyChangelogPanelProps {
    orgId: Id<"organizations">;
}

const CHANGE_TYPE_CONFIG: Record<string, {
    icon: React.ElementType;
    label: string;
    color: string;
    bg: string;
    border: string;
}> = {
    category_created: {
        icon: Plus,
        label: "Création",
        color: "text-emerald-400",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/20",
    },
    category_updated: {
        icon: Pencil,
        label: "Modification",
        color: "text-blue-400",
        bg: "bg-blue-500/15",
        border: "border-blue-500/20",
    },
    category_deleted: {
        icon: Trash2,
        label: "Suppression",
        color: "text-red-400",
        bg: "bg-red-500/15",
        border: "border-red-500/20",
    },
    config_updated: {
        icon: Settings2,
        label: "Configuration",
        color: "text-violet-400",
        bg: "bg-violet-500/15",
        border: "border-violet-500/20",
    },
};

// ─── Change detail renderer ───────────────────

function ChangeDetails({ changes, changeType }: { changes: unknown; changeType: string }) {
    if (!changes || typeof changes !== "object") return null;

    // Config updates: show summary only
    if (changeType === "config_updated") {
        return (
            <span className="text-[10px] text-white/25 ml-1">
                Paramètres globaux mis à jour
            </span>
        );
    }

    // Category changes: show field diffs
    const entries = Object.entries(changes as Record<string, unknown>);
    if (entries.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
            {entries.map(([field, value]) => {
                // For creates: simple value display
                if (typeof value !== "object" || value === null || !("old" in value)) {
                    return (
                        <Badge key={field} className="bg-white/[0.04] text-white/30 border-white/10 text-[9px] px-1.5 py-0 h-4">
                            {field}: {String(value)}
                        </Badge>
                    );
                }

                // For updates: old → new
                const diff = value as { old: unknown; new: unknown };
                return (
                    <Badge key={field} className="bg-white/[0.04] text-white/30 border-white/10 text-[9px] px-1.5 py-0 h-4 gap-1">
                        {field}: <span className="text-red-300/60 line-through">{String(diff.old ?? "—")}</span>
                        <span className="text-white/15">→</span>
                        <span className="text-emerald-300/80">{String(diff.new ?? "—")}</span>
                    </Badge>
                );
            })}
        </div>
    );
}

// ─── Format date ──────────────────────────────

function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function formatRelative(ts: number): string {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return formatDate(ts);
}

// ─── Main Component ───────────────────────────

export default function PolicyChangelogPanel({ orgId }: PolicyChangelogPanelProps) {
    const changelog = useQuery(api.archiveConfig.getChangelog, { organizationId: orgId });

    if (changelog === undefined) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (changelog.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                    <History className="h-6 w-6 text-violet-400/50" />
                </div>
                <p className="text-sm font-medium text-white/40">Aucun historique</p>
                <p className="text-xs text-white/25 mt-1 max-w-xs">
                    Les modifications de catégories et de configuration seront tracées ici automatiquement
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white/70">
                    Historique des politiques d&apos;archivage
                </h3>
                <Badge className="bg-white/[0.04] text-white/30 border-white/10 text-[10px] px-1.5 py-0 h-4">
                    {changelog.length} entrée{changelog.length > 1 ? "s" : ""}
                </Badge>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5" />

                <div className="space-y-3">
                    {changelog.map((entry) => {
                        const cfg = CHANGE_TYPE_CONFIG[entry.changeType] ?? CHANGE_TYPE_CONFIG.config_updated;
                        const Icon = cfg.icon;

                        return (
                            <div key={entry._id} className="flex items-start gap-3 relative">
                                {/* Timeline dot */}
                                <div className={`w-[30px] h-[30px] rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 z-10 border ${cfg.border}`}>
                                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} text-[10px] px-1.5 py-0 h-4`}>
                                            {cfg.label}
                                        </Badge>
                                        {entry.entityName && (
                                            <span className="text-xs text-white/70 font-medium">
                                                {entry.entityName}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-white/20 ml-auto shrink-0">
                                            {formatRelative(entry.changedAt)}
                                        </span>
                                    </div>
                                    <ChangeDetails changes={entry.changes} changeType={entry.changeType} />
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-white/15">
                                            par {entry.changedBy === "system" ? "Système" : entry.changedBy}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
