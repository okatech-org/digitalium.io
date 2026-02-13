// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Component: PageArchitectButton + Drawer
// Contextual "Architec" button + right-side technical drawer
// Shows architecture, data flow diagrams and stack info
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import {
    Cpu,
    X,
    Layers,
    ArrowRightLeft,
    Code2,
    Database,
    Workflow,
    Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import type { PageInfo } from "@/types/page-info";

/* ─── Stack color mapping ─────────────────────── */

function getStackColor(tech: string): string {
    const t = tech.toLowerCase();
    if (t.includes("next")) return "bg-white/15 text-white border-white/20";
    if (t.includes("react")) return "bg-cyan-500/15 text-cyan-400 border-cyan-500/20";
    if (t.includes("convex")) return "bg-red-500/15 text-red-400 border-red-500/20";
    if (t.includes("firebase")) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    if (t.includes("supabase")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    if (t.includes("tailwind")) return "bg-sky-500/15 text-sky-400 border-sky-500/20";
    if (t.includes("framer")) return "bg-purple-500/15 text-purple-400 border-purple-500/20";
    if (t.includes("lucide")) return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    if (t.includes("shadcn") || t.includes("radix")) return "bg-violet-500/15 text-violet-400 border-violet-500/20";
    if (t.includes("typescript") || t.includes("ts")) return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    if (t.includes("api") || t.includes("rest")) return "bg-green-500/15 text-green-400 border-green-500/20";
    if (t.includes("jwt") || t.includes("auth")) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    return "bg-teal-500/15 text-teal-400 border-teal-500/20";
}

/* ─── PageArchitectButton ─────────────────────── */

interface PageArchitectButtonProps {
    info: PageInfo;
    accentColor?: string;
}

export function PageArchitectButton({ info, accentColor = "violet" }: PageArchitectButtonProps) {
    const [open, setOpen] = useState(false);

    const arch = info.architecture;

    const accentClasses: Record<string, { ring: string; bg: string; text: string; border: string }> = {
        violet: { ring: "focus-visible:ring-violet-500/30", bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/20" },
        orange: { ring: "focus-visible:ring-orange-500/30", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20" },
        blue: { ring: "focus-visible:ring-blue-500/30", bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/20" },
        emerald: { ring: "focus-visible:ring-emerald-500/30", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20" },
        cyan: { ring: "focus-visible:ring-cyan-500/30", bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/20" },
    };

    const accent = accentClasses[accentColor] || accentClasses.cyan;

    if (!arch) return null;

    return (
        <>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 md:h-8 md:w-8 min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0 rounded-full text-muted-foreground hover:text-cyan-400 ${accent.ring}`}
                        onClick={() => setOpen(true)}
                        aria-label="Architecture technique"
                    >
                        <Cpu className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Architecture technique</TooltipContent>
            </Tooltip>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-[440px] max-w-full p-0 glass-section border-l border-white/5"
                >
                    <SheetTitle className="sr-only">Architecture : {info.titre}</SheetTitle>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                                <Cpu className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold">{info.titre}</h2>
                                <p className="text-[10px] text-muted-foreground font-mono">Architecture technique</p>
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
                        {/* Stack */}
                        <ArchSection title="Stack Technique" icon={Layers}>
                            <div className="flex flex-wrap gap-1.5">
                                {arch.stack.map((tech, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className={`text-[10px] font-mono px-2 py-0.5 ${getStackColor(tech)}`}
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </ArchSection>

                        {/* Pattern */}
                        <ArchSection title="Pattern d'Architecture" icon={Workflow}>
                            <p className="text-xs text-muted-foreground leading-relaxed">{arch.pattern}</p>
                        </ArchSection>

                        {/* Data Flow */}
                        <ArchSection title="Flux de Données" icon={ArrowRightLeft}>
                            <p className="text-xs text-muted-foreground leading-relaxed">{arch.dataFlow}</p>
                        </ArchSection>

                        {/* Diagram */}
                        <ArchSection title="Schéma d'Architecture" icon={Server}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-lg border border-cyan-500/20 bg-[#0a1628] p-4 overflow-x-auto"
                            >
                                <pre className="text-[10px] leading-[1.6] font-mono text-cyan-300/90 whitespace-pre">
                                    {arch.diagram}
                                </pre>
                            </motion.div>
                        </ArchSection>

                        {/* Key Components */}
                        <ArchSection title="Composants Clés" icon={Code2}>
                            <div className="space-y-1">
                                {arch.keyComponents.map((comp, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                                        <code className="font-mono text-[11px] text-cyan-300/80">{comp}</code>
                                    </div>
                                ))}
                            </div>
                        </ArchSection>

                        {/* API Endpoints */}
                        {arch.apiEndpoints && arch.apiEndpoints.length > 0 && (
                            <ArchSection title="Endpoints API" icon={Database}>
                                <div className="space-y-1">
                                    {arch.apiEndpoints.map((ep, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <code className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                {ep}
                                            </code>
                                        </div>
                                    ))}
                                </div>
                            </ArchSection>
                        )}

                        {/* State Management */}
                        {arch.stateManagement && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-lg border border-teal-500/20 bg-teal-500/5 px-4 py-3"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Database className="h-3.5 w-3.5 text-teal-400" />
                                    <span className="text-xs font-semibold text-teal-400 font-mono">State Management</span>
                                </div>
                                <p className="text-xs text-teal-300/80 leading-relaxed">{arch.stateManagement}</p>
                            </motion.div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

/* ─── Architecture Section (reusable) ─────────── */

function ArchSection({
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
                <Icon className="h-3.5 w-3.5 text-cyan-400/70" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono">{title}</h3>
            </div>
            {children}
        </div>
    );
}
