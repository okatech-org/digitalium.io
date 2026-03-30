// ═══════════════════════════════════════════════
// RetentionCalendar — Gantt horizontal timeline
// Shows retention durations by category with
// active / semi-active / archived phases
// ═══════════════════════════════════════════════

"use client";

import React, { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────

interface ArchiveCategory {
    _id: string;
    name: string;
    slug: string;
    color: string;
    retentionYears: number;
    activeDurationYears?: number;
    semiActiveDurationYears?: number;
    hasSemiActivePhase?: boolean;
    isPerpetual?: boolean;
    ohadaReference?: string;
    isActive: boolean;
}

interface RetentionCalendarProps {
    categories: ArchiveCategory[];
}

// ─── Color mapping ────────────────────────────

const COLOR_MAP: Record<string, { active: string; semi: string; archived: string; text: string }> = {
    amber:   { active: "bg-amber-500",   semi: "bg-amber-500/40",   archived: "bg-amber-500/15", text: "text-amber-300" },
    blue:    { active: "bg-blue-500",    semi: "bg-blue-500/40",    archived: "bg-blue-500/15",  text: "text-blue-300" },
    emerald: { active: "bg-emerald-500", semi: "bg-emerald-500/40", archived: "bg-emerald-500/15", text: "text-emerald-300" },
    violet:  { active: "bg-violet-500",  semi: "bg-violet-500/40",  archived: "bg-violet-500/15", text: "text-violet-300" },
    rose:    { active: "bg-rose-500",    semi: "bg-rose-500/40",    archived: "bg-rose-500/15",  text: "text-rose-300" },
    cyan:    { active: "bg-cyan-500",    semi: "bg-cyan-500/40",    archived: "bg-cyan-500/15",  text: "text-cyan-300" },
    orange:  { active: "bg-orange-500",  semi: "bg-orange-500/40",  archived: "bg-orange-500/15", text: "text-orange-300" },
};

const DEFAULT_COLORS = { active: "bg-zinc-500", semi: "bg-zinc-500/40", archived: "bg-zinc-500/15", text: "text-zinc-300" };

// ─── Component ────────────────────────────────

export default function RetentionCalendar({ categories }: RetentionCalendarProps) {
    const currentYear = new Date().getFullYear();

    const activeCategories = useMemo(
        () => categories.filter((c) => c.isActive && !c.isPerpetual).sort((a, b) => b.retentionYears - a.retentionYears),
        [categories]
    );

    const perpetualCategories = useMemo(
        () => categories.filter((c) => c.isActive && c.isPerpetual),
        [categories]
    );

    const maxYears = useMemo(
        () => Math.max(10, ...activeCategories.map((c) => c.retentionYears)),
        [activeCategories]
    );

    // Timeline markers
    const markers = useMemo(() => {
        const m: number[] = [];
        for (let y = 0; y <= maxYears; y += 5) m.push(y);
        if (!m.includes(maxYears)) m.push(maxYears);
        return m;
    }, [maxYears]);

    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-sm text-white/50">Aucune catégorie de rétention configurée</p>
                <p className="text-xs text-white/20 mt-1">Créez des catégories dans l&apos;onglet Rétention &amp; OHADA</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white/70">
                    Calendrier des échéances de conservation
                </h3>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-2 rounded-sm bg-violet-500" />
                    <span>Phase active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-2 rounded-sm bg-violet-500/40" />
                    <span>Phase semi-active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-2 rounded-sm bg-violet-500/15 border border-violet-500/20" />
                    <span>Phase archivée</span>
                </div>
            </div>

            {/* Timeline header */}
            <div className="relative">
                <div className="flex items-end mb-1 ml-[140px]">
                    {markers.map((y) => (
                        <div
                            key={y}
                            className="text-[9px] text-white/25 font-mono"
                            style={{
                                position: "absolute",
                                left: `calc(140px + ${(y / maxYears) * 100}% * (1 - 140 / 100%))`,
                                transform: "translateX(-50%)",
                            }}
                        >
                            {y === 0 ? currentYear : `+${y}a`}
                        </div>
                    ))}
                </div>

                {/* Category rows */}
                <div className="space-y-2 mt-5">
                    {activeCategories.map((cat) => {
                        const colors = COLOR_MAP[cat.color] ?? DEFAULT_COLORS;
                        const totalWidth = (cat.retentionYears / maxYears) * 100;
                        const activeYears = cat.activeDurationYears ?? cat.retentionYears;
                        const semiYears = cat.hasSemiActivePhase ? (cat.semiActiveDurationYears ?? 0) : 0;
                        const archivedYears = Math.max(0, cat.retentionYears - activeYears - semiYears);

                        const activeWidth = (activeYears / cat.retentionYears) * totalWidth;
                        const semiWidth = (semiYears / cat.retentionYears) * totalWidth;
                        const archivedWidth = (archivedYears / cat.retentionYears) * totalWidth;

                        return (
                            <div key={cat._id} className="flex items-center gap-3">
                                {/* Label */}
                                <div className="w-[130px] shrink-0 text-right pr-2">
                                    <p className={`text-xs font-medium truncate ${colors.text}`}>{cat.name}</p>
                                    <p className="text-[9px] text-white/25">{cat.retentionYears} ans</p>
                                </div>

                                {/* Bar */}
                                <div className="flex-1 relative h-6">
                                    {/* Grid markers */}
                                    {markers.map((y) => (
                                        <div
                                            key={y}
                                            className="absolute top-0 bottom-0 w-px bg-white/5"
                                            style={{ left: `${(y / maxYears) * 100}%` }}
                                        />
                                    ))}

                                    {/* Phases */}
                                    <div className="flex h-full rounded-md overflow-hidden" style={{ width: `${totalWidth}%` }}>
                                        {activeWidth > 0 && (
                                            <div
                                                className={`${colors.active} h-full relative group`}
                                                style={{ width: `${(activeYears / cat.retentionYears) * 100}%` }}
                                                title={`Active: ${activeYears} ans`}
                                            >
                                                {activeYears >= 2 && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 font-medium">
                                                        {activeYears}a
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {semiWidth > 0 && (
                                            <div
                                                className={`${colors.semi} h-full relative`}
                                                style={{ width: `${(semiYears / cat.retentionYears) * 100}%` }}
                                                title={`Semi-active: ${semiYears} ans`}
                                            >
                                                {semiYears >= 2 && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/50 font-medium">
                                                        {semiYears}a
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {archivedWidth > 0 && (
                                            <div
                                                className={`${colors.archived} h-full relative border-r border-white/10`}
                                                style={{ width: `${(archivedYears / cat.retentionYears) * 100}%` }}
                                                title={`Archivée: ${archivedYears} ans`}
                                            >
                                                {archivedYears >= 2 && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/50 font-medium">
                                                        {archivedYears}a
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Perpetual categories */}
                    {perpetualCategories.map((cat) => {
                        const colors = COLOR_MAP[cat.color] ?? DEFAULT_COLORS;
                        return (
                            <div key={cat._id} className="flex items-center gap-3">
                                <div className="w-[130px] shrink-0 text-right pr-2">
                                    <p className={`text-xs font-medium truncate ${colors.text}`}>{cat.name}</p>
                                    <p className="text-[9px] text-white/25">Perpétuel</p>
                                </div>
                                <div className="flex-1 relative h-6">
                                    <div className={`h-full rounded-md ${colors.active} flex items-center px-2`} style={{ width: "100%" }}>
                                        <span className="text-[9px] text-white/70 font-medium">∞ Conservation perpétuelle</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                <Badge className="bg-white/[0.04] text-white/40 border-white/10 text-[10px]">
                    {activeCategories.length + perpetualCategories.length} catégorie{(activeCategories.length + perpetualCategories.length) > 1 ? "s" : ""}
                </Badge>
                {activeCategories.length > 0 && (
                    <span className="text-[10px] text-white/25">
                        Durée max: {Math.max(...activeCategories.map((c) => c.retentionYears))} ans
                    </span>
                )}
                {perpetualCategories.length > 0 && (
                    <Badge className="bg-rose-500/10 text-rose-300 border-rose-500/20 text-[10px]">
                        {perpetualCategories.length} perpétuel{perpetualCategories.length > 1 ? "les" : "le"}
                    </Badge>
                )}
            </div>
        </div>
    );
}
