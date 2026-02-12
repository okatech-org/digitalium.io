// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation: FeatureList Component
// Liste cliquable des fonctionnalités avec tutoriels
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Settings, FileText, Shield, BarChart3, Users, Archive, PenTool, Bot, Globe, Database, Wallet, MonitorDot, Lock, Cog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Fonctionnalite } from "@/types/formation";

const ICON_MAP: Record<string, React.ElementType> = {
    BookOpen, Settings, FileText, Shield, BarChart3, Users, Archive,
    PenTool, Bot, Globe, Database, Wallet, MonitorDot, Lock, Cog,
};

interface FormationFeatureListProps {
    fonctionnalites: Fonctionnalite[];
    onSelectFeature?: (id: string) => void;
    accentColor?: string;
}

const ACCENT: Record<string, { bg: string; text: string; badge: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", badge: "bg-violet-500/15 text-violet-300" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500/15 text-blue-300" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-300" },
};

export function FormationFeatureList({ fonctionnalites, onSelectFeature, accentColor = "violet" }: FormationFeatureListProps) {
    const accent = ACCENT[accentColor] || ACCENT.violet;

    return (
        <div className="space-y-2">
            {fonctionnalites.map((feat, i) => {
                const Icon = ICON_MAP[feat.icone] || Settings;
                return (
                    <motion.div
                        key={feat.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                    >
                        <Card
                            className="glass border-white/5 cursor-pointer hover:bg-white/3 transition-colors group"
                            onClick={() => onSelectFeature?.(feat.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={`h-9 w-9 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`h-4.5 w-4.5 ${accent.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="text-sm font-semibold group-hover:text-foreground transition-colors">{feat.titre}</h4>
                                            <Badge variant="secondary" className={`text-[9px] h-4 px-1.5 border-0 ${accent.badge}`}>
                                                {feat.onglet}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{feat.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-muted-foreground/60">
                                                {feat.tutorielIds.length} tutoriel{feat.tutorielIds.length > 1 ? "s" : ""}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/40">•</span>
                                            <span className="text-[10px] text-muted-foreground/60">{feat.importance}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 mt-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
