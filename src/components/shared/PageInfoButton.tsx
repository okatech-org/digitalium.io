// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Component: PageInfoButton + Drawer
// Contextual "i" button + right-side info drawer
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { Info, X, ExternalLink, Lightbulb, ListChecks, Link2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import type { PageInfo } from "@/types/page-info";
import Link from "next/link";

/* ─── Element type icons ──────────────────────── */

const ELEMENT_ICONS: Record<string, React.ElementType> = {
    bouton: ListChecks,
    champ: Layers,
    tableau: Layers,
    carte: Layers,
    graphique: Layers,
    filtre: Layers,
    autre: Layers,
};

const ELEMENT_COLORS: Record<string, string> = {
    bouton: "bg-blue-500/15 text-blue-400",
    champ: "bg-emerald-500/15 text-emerald-400",
    tableau: "bg-violet-500/15 text-violet-400",
    carte: "bg-orange-500/15 text-orange-400",
    graphique: "bg-pink-500/15 text-pink-400",
    filtre: "bg-yellow-500/15 text-yellow-400",
    autre: "bg-gray-500/15 text-gray-400",
};

/* ─── PageInfoButton ──────────────────────────── */

interface PageInfoButtonProps {
    info: PageInfo;
    accentColor?: string;
}

export function PageInfoButton({ info, accentColor = "violet" }: PageInfoButtonProps) {
    const [open, setOpen] = useState(false);

    const accentClasses: Record<string, { ring: string; bg: string; text: string }> = {
        violet: { ring: "focus-visible:ring-violet-500/30", bg: "bg-violet-500/15", text: "text-violet-400" },
        orange: { ring: "focus-visible:ring-orange-500/30", bg: "bg-orange-500/15", text: "text-orange-400" },
        blue: { ring: "focus-visible:ring-blue-500/30", bg: "bg-blue-500/15", text: "text-blue-400" },
        emerald: { ring: "focus-visible:ring-emerald-500/30", bg: "bg-emerald-500/15", text: "text-emerald-400" },
    };

    const accent = accentClasses[accentColor] || accentClasses.violet;

    return (
        <>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 md:h-8 md:w-8 min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0 rounded-full text-muted-foreground hover:${accent.text} ${accent.ring}`}
                        onClick={() => setOpen(true)}
                        aria-label="Aide sur cette page"
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Aide sur cette page</TooltipContent>
            </Tooltip>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-[400px] max-w-full p-0 glass-section border-l border-white/5"
                >
                    <SheetTitle className="sr-only">Info : {info.titre}</SheetTitle>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg ${accent.bg} flex items-center justify-center`}>
                                <Info className={`h-4 w-4 ${accent.text}`} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold">{info.titre}</h2>
                                <p className="text-[10px] text-muted-foreground">Information contextuelle</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto max-h-[calc(100vh-80px)] px-5 py-4 space-y-5">
                        {/* But */}
                        <InfoSection title="But de cette page" icon={Lightbulb}>
                            <p className="text-xs text-muted-foreground leading-relaxed">{info.but}</p>
                        </InfoSection>

                        {/* Description */}
                        <InfoSection title="Description" icon={Info}>
                            <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
                        </InfoSection>

                        {/* Éléments */}
                        {info.elements.length > 0 && (
                            <InfoSection title="Éléments de la page" icon={Layers}>
                                <div className="space-y-1.5">
                                    {info.elements.map((el, i) => {
                                        const ElIcon = ELEMENT_ICONS[el.type] || Layers;
                                        const color = ELEMENT_COLORS[el.type] || ELEMENT_COLORS.autre;
                                        return (
                                            <div key={i} className="flex gap-2 items-start">
                                                <div className={`h-6 w-6 rounded shrink-0 flex items-center justify-center ${color}`}>
                                                    <ElIcon className="h-3 w-3" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium">
                                                        {el.nom}
                                                        {el.obligatoire && (
                                                            <Badge variant="secondary" className="ml-1.5 h-4 text-[8px] px-1 bg-red-500/15 text-red-400 border-0">
                                                                Requis
                                                            </Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">{el.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </InfoSection>
                        )}

                        {/* Tâches */}
                        {info.tachesDisponibles.length > 0 && (
                            <InfoSection title="Tâches disponibles" icon={ListChecks}>
                                <ul className="space-y-1">
                                    {info.tachesDisponibles.map((t, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </InfoSection>
                        )}

                        {/* Liens */}
                        {info.liens.length > 0 && (
                            <InfoSection title="Pages en relation" icon={Link2}>
                                <div className="space-y-1">
                                    {info.liens.map((l, i) => (
                                        <Link
                                            key={i}
                                            href={l.route}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-white/5 transition-colors group"
                                        >
                                            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium group-hover:text-foreground transition-colors">{l.page}</p>
                                                <p className="text-[10px] text-muted-foreground">{l.relation}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </InfoSection>
                        )}

                        {/* Conseil */}
                        {info.conseil && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                                    <span className="text-xs font-semibold text-emerald-400">Conseil</span>
                                </div>
                                <p className="text-xs text-emerald-300/80 leading-relaxed">{info.conseil}</p>
                            </motion.div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

/* ─── Info Section (reusable) ─────────────────── */

function InfoSection({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</h3>
            </div>
            {children}
        </div>
    );
}
