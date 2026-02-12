// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation: Tutoriel Component
// Tutoriel pas-à-pas avec étapes numérotées
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Tutoriel as TutorielType } from "@/types/formation";

interface FormationTutorielProps {
    tutoriel: TutorielType;
    completed: boolean;
    onToggleComplete: (id: string) => void;
    accentColor?: string;
}

const ACCENT: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
    violet: { gradient: "from-violet-600 to-indigo-500", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
    orange: { gradient: "from-orange-600 to-red-500", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    blue: { gradient: "from-blue-600 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    emerald: { gradient: "from-emerald-600 to-teal-500", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export function FormationTutoriel({ tutoriel, completed, onToggleComplete, accentColor = "violet" }: FormationTutorielProps) {
    const accent = ACCENT[accentColor] || ACCENT.violet;

    return (
        <Card className={`glass border-white/5 overflow-hidden ${completed ? "opacity-80" : ""}`}>
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h4 className="text-sm font-semibold">{tutoriel.titre}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {tutoriel.etapes.length} étapes
                        </p>
                    </div>
                    {completed && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-0 shrink-0">
                            ✓ Terminé
                        </Badge>
                    )}
                </div>

                {/* Étapes */}
                <div className="space-y-3 mb-5">
                    {tutoriel.etapes.map((etape, i) => (
                        <motion.div
                            key={etape.numero}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex gap-3"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${completed
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : `${accent.bg} ${accent.text}`
                                    }`}>
                                    {completed ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        etape.numero
                                    )}
                                </div>
                                {i < tutoriel.etapes.length - 1 && (
                                    <div className="w-px flex-1 bg-white/5 mt-1" />
                                )}
                            </div>
                            <div className="pb-3">
                                <p className="text-xs font-medium">{etape.instruction}</p>
                                {etape.detail && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{etape.detail}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <Link href={tutoriel.routeCible} className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className={`w-full text-xs border-white/10 hover:${accent.border}`}
                        >
                            <ArrowRight className="h-3 w-3 mr-1.5" />
                            Essayer maintenant
                        </Button>
                    </Link>
                    <Button
                        variant={completed ? "ghost" : "default"}
                        size="sm"
                        className={`text-xs ${!completed ? `bg-gradient-to-r ${accent.gradient} hover:opacity-90` : ""}`}
                        onClick={() => onToggleComplete(tutoriel.id)}
                    >
                        {completed ? (
                            <>
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Refaire
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Compris
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
