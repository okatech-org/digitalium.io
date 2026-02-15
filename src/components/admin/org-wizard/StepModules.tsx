"use client";

import React from "react";
import { FileText, Archive, PenTool, Bot } from "lucide-react";

// ─── Types ────────────────────────────────────

export interface ModulesData {
    iDocument: boolean;
    iArchive: boolean;
    iSignature: boolean;
    iAsted: boolean;
}

const MODULE_OPTIONS: {
    key: keyof ModulesData;
    label: string;
    description: string;
    details: string[];
    icon: React.ReactNode;
    gradient: string;
}[] = [
    {
        key: "iDocument",
        label: "iDocument",
        description: "Édition collaborative",
        details: ["Dossiers partagés", "Versionnage", "Workflows"],
        icon: <FileText className="h-5 w-5 text-white" />,
        gradient: "from-violet-600 to-indigo-500",
    },
    {
        key: "iArchive",
        label: "iArchive",
        description: "Archivage légal",
        details: ["Coffre-fort numérique", "Rétention OHADA", "Certificats"],
        icon: <Archive className="h-5 w-5 text-white" />,
        gradient: "from-amber-600 to-orange-500",
    },
    {
        key: "iSignature",
        label: "iSignature",
        description: "Signature électronique",
        details: ["Circuits validation", "Parapheur", "Horodatage"],
        icon: <PenTool className="h-5 w-5 text-white" />,
        gradient: "from-violet-600 to-pink-500",
    },
    {
        key: "iAsted",
        label: "iAsted",
        description: "Assistant IA",
        details: ["Analyse documents", "Suggestions", "Automatisation"],
        icon: <Bot className="h-5 w-5 text-white" />,
        gradient: "from-emerald-600 to-teal-500",
    },
];

// ─── Component ────────────────────────────────

interface StepModulesProps {
    data: ModulesData;
    onChange: (data: ModulesData) => void;
    errors: Record<string, string>;
}

export default function StepModules({ data, onChange, errors }: StepModulesProps) {
    const toggle = (key: keyof ModulesData) => {
        onChange({ ...data, [key]: !data[key] });
    };

    const activeCount = Object.values(data).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
                Sélectionnez les modules à activer. Vous pourrez modifier ces choix plus tard.
            </p>

            <div className="grid grid-cols-2 gap-3">
                {MODULE_OPTIONS.map((mod) => {
                    const isActive = data[mod.key];
                    return (
                        <button
                            key={mod.key}
                            type="button"
                            onClick={() => toggle(mod.key)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                                isActive
                                    ? "border-violet-500/50 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-2`}>
                                {mod.icon}
                            </div>
                            <p className="text-xs font-medium">{mod.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{mod.description}</p>
                            <div className="mt-2 space-y-0.5">
                                {mod.details.map((d) => (
                                    <p key={d} className="text-[9px] text-muted-foreground">• {d}</p>
                                ))}
                            </div>
                            <div className="mt-3">
                                <span
                                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                        isActive
                                            ? "bg-emerald-500/15 text-emerald-400"
                                            : "bg-white/5 text-muted-foreground"
                                    }`}
                                >
                                    {isActive ? "✓ Activé" : "Désactivé"}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {errors.modules && (
                <p className="text-[10px] text-red-400">{errors.modules}</p>
            )}

            <p className="text-[10px] text-muted-foreground">
                {activeCount} module{activeCount > 1 ? "s" : ""} activé{activeCount > 1 ? "s" : ""}.
                Les modules conditionnent les options de configuration disponibles dans la fiche organisation.
            </p>
        </div>
    );
}
