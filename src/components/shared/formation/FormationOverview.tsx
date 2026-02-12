// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation: Overview Component
// Bienvenue + description du rôle + responsabilités
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FormationConfig } from "@/types/formation";

interface FormationOverviewProps {
    config: FormationConfig;
    accentColor?: string;
}

const ACCENT: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
    violet: { gradient: "from-violet-600 to-indigo-500", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
    orange: { gradient: "from-orange-600 to-red-500", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    blue: { gradient: "from-blue-600 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    emerald: { gradient: "from-emerald-600 to-teal-500", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export function FormationOverview({ config, accentColor = "violet" }: FormationOverviewProps) {
    const accent = ACCENT[accentColor] || ACCENT.violet;

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border ${accent.border} bg-gradient-to-br ${accent.gradient}/5 p-6`}
            >
                <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shrink-0`}>
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-1">{config.titreBienvenue}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{config.descriptionRole}</p>
                    </div>
                </div>
            </motion.div>

            {/* Responsabilités */}
            <Card className="glass border-white/5">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className={`h-4 w-4 ${accent.text}`} />
                        <h3 className="text-sm font-semibold">Vos Responsabilités</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {config.responsabilites.map((resp, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
                            >
                                <span className={`h-6 w-6 rounded-lg ${accent.bg} flex items-center justify-center shrink-0 text-xs font-bold ${accent.text}`}>
                                    {i + 1}
                                </span>
                                <span className="text-xs text-muted-foreground">{resp}</span>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Fonctionnalités" value={config.fonctionnalites.length} accent={accent} />
                <StatCard label="Tutoriels" value={config.tutoriels.length} accent={accent} />
                <StatCard label="FAQ" value={config.faq.length} accent={accent} />
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: number;
    accent: { bg: string; text: string };
}) {
    return (
        <Card className="glass border-white/5">
            <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${accent.text}`}>{value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
        </Card>
    );
}
