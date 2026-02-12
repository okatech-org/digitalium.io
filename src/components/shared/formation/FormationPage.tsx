// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation: Main Page Component
// Orchestrateur de la page Formation avec tabs
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { GraduationCap, LayoutGrid, Layers, BookOpen, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormationOverview } from "./FormationOverview";
import { FormationFeatureList } from "./FormationFeatureList";
import { FormationTutoriel } from "./FormationTutoriel";
import { FormationFAQ } from "./FormationFAQ";
import { FormationProgress } from "./FormationProgress";
import type { FormationConfig, Tutoriel } from "@/types/formation";

/* ─── localStorage helpers ──────────────────── */

const STORAGE_KEY = "digitalium-formation-progress";

function loadCompletedIds(espaceRole: string): string[] {
    if (typeof window === "undefined") return [];
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return data[espaceRole] || [];
    } catch {
        return [];
    }
}

function saveCompletedIds(espaceRole: string, ids: string[]) {
    if (typeof window === "undefined") return;
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        data[espaceRole] = ids;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // silently fail
    }
}

/* ─── Main Component ────────────────────────── */

interface FormationPageProps {
    config: FormationConfig;
    accentColor?: string;
}

export function FormationPage({ config, accentColor = "violet" }: FormationPageProps) {
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

    // Load progress from localStorage
    useEffect(() => {
        setCompletedIds(loadCompletedIds(config.espaceRole));
    }, [config.espaceRole]);

    const handleToggleComplete = useCallback(
        (tutorielId: string) => {
            setCompletedIds((prev) => {
                const next = prev.includes(tutorielId)
                    ? prev.filter((id) => id !== tutorielId)
                    : [...prev, tutorielId];
                saveCompletedIds(config.espaceRole, next);
                return next;
            });
        },
        [config.espaceRole]
    );

    const handleSelectFeature = useCallback((id: string) => {
        setSelectedFeatureId(id);
        setActiveTab("tutoriels");
    }, []);

    // Filter tutoriels if a feature is selected
    const visibleTutoriels: Tutoriel[] = useMemo(() => {
        if (!selectedFeatureId) return config.tutoriels;
        const feat = config.fonctionnalites.find((f) => f.id === selectedFeatureId);
        if (!feat) return config.tutoriels;
        return config.tutoriels.filter((t) => feat.tutorielIds.includes(t.id));
    }, [selectedFeatureId, config]);

    const accentGradient: Record<string, string> = {
        violet: "from-violet-600 to-indigo-500",
        orange: "from-orange-600 to-red-500",
        blue: "from-blue-600 to-cyan-500",
        emerald: "from-emerald-600 to-teal-500",
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${accentGradient[accentColor] || accentGradient.violet} flex items-center justify-center`}>
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Formation</h1>
                        <p className="text-xs text-muted-foreground">Apprenez à maîtriser votre espace et ses fonctionnalités</p>
                    </div>
                </div>
            </motion.div>

            {/* Progress */}
            <FormationProgress
                totalTutoriels={config.tutoriels.length}
                completedIds={completedIds}
                accentColor={accentColor}
            />

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => {
                    setActiveTab(v);
                    if (v !== "tutoriels") setSelectedFeatureId(null);
                }}
            >
                <TabsList className="glass border border-white/5 h-9">
                    <TabsTrigger value="overview" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Vue d&apos;ensemble</span>
                    </TabsTrigger>
                    <TabsTrigger value="fonctionnalites" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Layers className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Fonctionnalités</span>
                    </TabsTrigger>
                    <TabsTrigger value="tutoriels" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Tutoriels</span>
                    </TabsTrigger>
                    <TabsTrigger value="faq" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">FAQ</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="overview" className="mt-0">
                        <FormationOverview config={config} accentColor={accentColor} />
                    </TabsContent>

                    <TabsContent value="fonctionnalites" className="mt-0">
                        <FormationFeatureList
                            fonctionnalites={config.fonctionnalites}
                            onSelectFeature={handleSelectFeature}
                            accentColor={accentColor}
                        />
                    </TabsContent>

                    <TabsContent value="tutoriels" className="mt-0">
                        {selectedFeatureId && (
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    Filtré par : {config.fonctionnalites.find((f) => f.id === selectedFeatureId)?.titre}
                                </span>
                                <button
                                    onClick={() => setSelectedFeatureId(null)}
                                    className="text-[10px] text-muted-foreground underline hover:text-foreground"
                                >
                                    Tout afficher
                                </button>
                            </div>
                        )}
                        <div className="space-y-3">
                            {visibleTutoriels.map((tut) => (
                                <FormationTutoriel
                                    key={tut.id}
                                    tutoriel={tut}
                                    completed={completedIds.includes(tut.id)}
                                    onToggleComplete={handleToggleComplete}
                                    accentColor={accentColor}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="faq" className="mt-0">
                        <FormationFAQ items={config.faq} accentColor={accentColor} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
