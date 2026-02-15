"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConfigProgress } from "@/types/org-structure";

// ─── Types ────────────────────────────────────

interface ProgressItem {
    key: string;
    label: string;
    onglet: string;
}

interface ProgressBannerProps {
    progress: ConfigProgress | undefined;
    status: string;
    isReadyForActivation: boolean;
    progressPercent: number;
    requiredItems: ProgressItem[];
    optionalItems: ProgressItem[];
    onMarkAsReady: () => void;
    onTabChange: (tab: string) => void;
}

// ─── Helpers ──────────────────────────────────

type IndicatorStatus = "complete" | "partial" | "empty";

/**
 * Determine per-onglet (tab) status by checking which items belong to it.
 * - "complete" : every item for that tab is true in progress
 * - "partial"  : at least one item is true but not all
 * - "empty"    : none are true (or progress is undefined)
 */
function getOngletStatus(
    onglet: string,
    allItems: ProgressItem[],
    progress: ConfigProgress | undefined
): IndicatorStatus {
    const itemsForOnglet = allItems.filter((i) => i.onglet === onglet);
    if (!progress || itemsForOnglet.length === 0) return "empty";

    const completedCount = itemsForOnglet.filter(
        (i) => progress[i.key as keyof ConfigProgress]
    ).length;

    if (completedCount === itemsForOnglet.length) return "complete";
    if (completedCount > 0) return "partial";
    return "empty";
}

/**
 * Collect unique onglets (tabs) in order, preserving insertion order
 * from required then optional items.
 */
function getUniqueOnglets(required: ProgressItem[], optional: ProgressItem[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of [...required, ...optional]) {
        if (!seen.has(item.onglet)) {
            seen.add(item.onglet);
            result.push(item.onglet);
        }
    }
    return result;
}

/**
 * Human-readable label for an onglet key.
 */
const ONGLET_LABELS: Record<string, string> = {
    profil: "Profil",
    "structure-org": "Structure Org",
    "structure-classement": "Classement",
    modules: "Modules",
    deployment: "Déploiement",
    automation: "Automatisation",
};

function getOngletLabel(onglet: string): string {
    return ONGLET_LABELS[onglet] ?? onglet;
}

// ─── Sub-components ───────────────────────────

function StepIndicator({
    status,
    label,
    onClick,
}: {
    status: IndicatorStatus;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
            title={label}
        >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-violet-500/50">
                {status === "complete" && (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                )}
                {status === "partial" && (
                    <div className="relative w-8 h-8">
                        <Circle className="w-8 h-8 text-white/20 absolute inset-0" />
                        <svg
                            viewBox="0 0 24 24"
                            className="w-8 h-8 absolute inset-0"
                            fill="none"
                        >
                            <path
                                d="M12 2a10 10 0 0 1 0 20"
                                stroke="url(#half-gradient)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <defs>
                                <linearGradient
                                    id="half-gradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#6366F1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                )}
                {status === "empty" && (
                    <Circle className="w-8 h-8 text-white/15" />
                )}
            </div>
            <span className="text-[11px] font-medium text-white/50 group-hover:text-white/70 transition-colors truncate max-w-[72px]">
                {label}
            </span>
        </button>
    );
}

// ─── Main Component ───────────────────────────

export default function ProgressBanner({
    progress,
    status,
    isReadyForActivation,
    progressPercent,
    requiredItems,
    optionalItems,
    onMarkAsReady,
    onTabChange,
}: ProgressBannerProps) {
    // Only render for draft or ready statuses
    if (status !== "brouillon" && status !== "prete") return null;

    const allItems = [...requiredItems, ...optionalItems];
    const onglets = getUniqueOnglets(requiredItems, optionalItems);
    const completedCount = allItems.filter(
        (i) => progress?.[i.key as keyof ConfigProgress]
    ).length;
    const totalCount = allItems.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5"
        >
            {/* ── Header row ─────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-semibold text-white/80">
                        Progression de la configuration
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Percentage & count */}
                    <span className="text-xs font-medium text-white/40">
                        {completedCount}/{totalCount} etapes
                    </span>
                    <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        {progressPercent}%
                    </span>

                    {/* Action area */}
                    {status === "prete" && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                            Prete a activer
                        </Badge>
                    )}
                    {status === "brouillon" && isReadyForActivation && (
                        <Button
                            size="sm"
                            onClick={onMarkAsReady}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white border-0 shadow-lg shadow-violet-500/20"
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            Marquer comme Prete
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Progress bar ────────────────────────── */}
            <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden mb-5">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600/40 to-indigo-500/40 blur-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
            </div>

            {/* ── Step indicators ─────────────────────── */}
            <div className="flex items-center justify-between gap-2">
                {onglets.map((onglet, idx) => {
                    const indicatorStatus = getOngletStatus(onglet, allItems, progress);
                    return (
                        <React.Fragment key={onglet}>
                            {idx > 0 && (
                                <div className="flex-1 h-px bg-white/[0.06]" />
                            )}
                            <StepIndicator
                                status={indicatorStatus}
                                label={getOngletLabel(onglet)}
                                onClick={() => onTabChange(onglet)}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
        </motion.div>
    );
}
