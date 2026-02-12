// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation: Progress Component
// Barre de progression basée sur tutoriels terminés
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, BookOpen } from "lucide-react";

interface FormationProgressProps {
    totalTutoriels: number;
    completedIds: string[];
    accentColor?: string;
}

const ACCENT_GRADIENT: Record<string, { from: string; to: string; text: string }> = {
    violet: { from: "from-violet-600", to: "to-indigo-500", text: "text-violet-400" },
    orange: { from: "from-orange-600", to: "to-red-500", text: "text-orange-400" },
    blue: { from: "from-blue-600", to: "to-cyan-500", text: "text-blue-400" },
    emerald: { from: "from-emerald-600", to: "to-teal-500", text: "text-emerald-400" },
};

export function FormationProgress({ totalTutoriels, completedIds, accentColor = "violet" }: FormationProgressProps) {
    const completed = completedIds.length;
    const pct = totalTutoriels > 0 ? Math.round((completed / totalTutoriels) * 100) : 0;
    const accent = ACCENT_GRADIENT[accentColor] || ACCENT_GRADIENT.violet;

    return (
        <div className="rounded-xl border border-white/5 glass-section p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BookOpen className={`h-4 w-4 ${accent.text}`} />
                    <span className="text-sm font-medium">Progression Formation</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-muted-foreground">
                        {completed}/{totalTutoriels} tutoriels
                    </span>
                </div>
            </div>

            <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${accent.from} ${accent.to}`}
                />
            </div>

            <p className="text-[11px] text-muted-foreground mt-2">
                {pct === 100
                    ? "🎉 Félicitations ! Vous avez terminé toute la formation."
                    : pct > 50
                        ? `Encore ${totalTutoriels - completed} tutoriel(s) pour terminer. Vous êtes sur la bonne voie !`
                        : `${pct}% complété. Continuez pour maîtriser votre espace.`}
            </p>
        </div>
    );
}
