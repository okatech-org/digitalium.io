"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iAsted: Settings Page
// AI assistant preferences (tone, modules, language)
// ═══════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Bot,
    Save,
    Check,
    Globe,
    MessageSquare,
    FileText,
    Archive,
    PenTool,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface IAstedPreferences {
    tone: "professional" | "casual";
    modules: string[];
    language: "fr" | "en";
}

const DEFAULT_PREFERENCES: IAstedPreferences = {
    tone: "professional",
    modules: ["iDocument", "iArchive", "iSignature"],
    language: "fr",
};

const MODULE_OPTIONS = [
    { key: "iDocument", label: "iDocument", description: "Documents, modeles, workflows", icon: FileText },
    { key: "iArchive", label: "iArchive", description: "Archives, certificats, conformite", icon: Archive },
    { key: "iSignature", label: "iSignature", description: "Signatures electroniques", icon: PenTool },
];

// ─── Component ─────────────────────────────────

export default function IAstedSettingsPage() {
    const [preferences, setPreferences] = useState<IAstedPreferences>(DEFAULT_PREFERENCES);
    const [saved, setSaved] = useState(false);

    // Load preferences from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("iasted_preferences");
            if (stored) {
                setPreferences(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    const savePreferences = () => {
        localStorage.setItem("iasted_preferences", JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleModule = (moduleKey: string) => {
        setPreferences((prev) => ({
            ...prev,
            modules: prev.modules.includes(moduleKey)
                ? prev.modules.filter((m) => m !== moduleKey)
                : [...prev.modules, moduleKey],
        }));
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link href="/pro/iasted">
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-400 mb-4">
                        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                        Retour a iAsted
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Parametres iAsted</h1>
                        <p className="text-xs text-zinc-400">Configurez le comportement de votre assistant IA</p>
                    </div>
                </div>
            </motion.div>

            <div className="space-y-6">
                {/* Tone Setting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-4 w-4 text-violet-400" />
                        <h2 className="text-sm font-semibold">Ton des reponses</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setPreferences((p) => ({ ...p, tone: "professional" }))}
                            className={`p-4 rounded-xl border transition-all text-left ${
                                preferences.tone === "professional"
                                    ? "border-violet-500/40 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {preferences.tone === "professional" && (
                                    <Check className="h-3.5 w-3.5 text-violet-400" />
                                )}
                                <span className="text-sm font-medium">Professionnel</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                                Reponses formelles et structurees
                            </p>
                        </button>
                        <button
                            onClick={() => setPreferences((p) => ({ ...p, tone: "casual" }))}
                            className={`p-4 rounded-xl border transition-all text-left ${
                                preferences.tone === "casual"
                                    ? "border-violet-500/40 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {preferences.tone === "casual" && (
                                    <Check className="h-3.5 w-3.5 text-violet-400" />
                                )}
                                <span className="text-sm font-medium">Decontracte</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                                Reponses amicales et accessibles
                            </p>
                        </button>
                    </div>
                </motion.div>

                {/* Modules Setting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-violet-400" />
                        <h2 className="text-sm font-semibold">Modules a inclure dans le contexte</h2>
                    </div>
                    <p className="text-[10px] text-zinc-500 mb-3">
                        Selectionnez les modules dont les donnees seront utilisees par l&apos;IA pour repondre a vos questions.
                    </p>
                    <div className="space-y-2">
                        {MODULE_OPTIONS.map((mod) => {
                            const Icon = mod.icon;
                            const isActive = preferences.modules.includes(mod.key);
                            return (
                                <button
                                    key={mod.key}
                                    onClick={() => toggleModule(mod.key)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                        isActive
                                            ? "border-violet-500/40 bg-violet-500/10"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                    }`}
                                >
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                        isActive ? "bg-violet-500/20" : "bg-white/[0.03]"
                                    }`}>
                                        <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium">{mod.label}</span>
                                        <p className="text-[10px] text-zinc-500">{mod.description}</p>
                                    </div>
                                    <div className={`h-5 w-9 rounded-full transition-colors flex items-center ${
                                        isActive ? "bg-violet-500 justify-end" : "bg-zinc-700 justify-start"
                                    }`}>
                                        <div className="h-4 w-4 rounded-full bg-white mx-0.5" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Language Setting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-4 w-4 text-violet-400" />
                        <h2 className="text-sm font-semibold">Langue de reponse</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setPreferences((p) => ({ ...p, language: "fr" }))}
                            className={`p-4 rounded-xl border transition-all text-left ${
                                preferences.language === "fr"
                                    ? "border-violet-500/40 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {preferences.language === "fr" && (
                                    <Check className="h-3.5 w-3.5 text-violet-400" />
                                )}
                                <span className="text-sm font-medium">Francais</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">Reponses en francais</p>
                        </button>
                        <button
                            onClick={() => setPreferences((p) => ({ ...p, language: "en" }))}
                            className={`p-4 rounded-xl border transition-all text-left ${
                                preferences.language === "en"
                                    ? "border-violet-500/40 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {preferences.language === "en" && (
                                    <Check className="h-3.5 w-3.5 text-violet-400" />
                                )}
                                <span className="text-sm font-medium">English</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">Answers in English</p>
                        </button>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        onClick={savePreferences}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400"
                    >
                        {saved ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Preferences enregistrees
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Enregistrer les preferences
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
