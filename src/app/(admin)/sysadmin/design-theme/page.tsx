// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Design Theme
// Interactive theme editor with color swatches,
// mode toggle, typography preview, save/cancel
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Palette,
    Moon,
    Sun,
    Monitor,
    Type,
    Eye,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Paintbrush,
    Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Config ─────────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

interface ThemeConfig {
    mode: "light" | "dark" | "auto";
    primaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
    radius: string;
}

const DEFAULT_THEME: ThemeConfig = {
    mode: "dark",
    primaryColor: "#E53935",
    accentColor: "#F97316",
    fontHeading: "Inter",
    fontBody: "Inter",
    radius: "0.75rem",
};

const THEME_MODES = [
    { id: "light" as const, label: "Clair", icon: Sun, description: "Thème lumineux" },
    { id: "dark" as const, label: "Sombre", icon: Moon, description: "Thème sombre" },
    { id: "auto" as const, label: "Auto", icon: Monitor, description: "Suit le système" },
];

const COLOR_PRESETS = [
    { name: "Rouge DIGITALIUM", value: "#E53935" },
    { name: "Orange Accent", value: "#F97316" },
    { name: "Bleu Royal", value: "#2563EB" },
    { name: "Violet Abyss", value: "#7C3AED" },
    { name: "Émeraude", value: "#10B981" },
    { name: "Rose", value: "#EC4899" },
    { name: "Cyan", value: "#06B6D4" },
    { name: "Ambre", value: "#F59E0B" },
];

const FONT_OPTIONS = ["Inter", "Roboto", "Outfit", "Manrope", "DM Sans", "Plus Jakarta Sans", "Poppins", "Geist"];

const RADIUS_OPTIONS = [
    { label: "Aucun", value: "0" },
    { label: "Petit", value: "0.375rem" },
    { label: "Moyen", value: "0.75rem" },
    { label: "Grand", value: "1rem" },
    { label: "Complet", value: "9999px" },
];

/* ═══════════════════════════════════════════════
   DESIGN THEME PAGE
   ═══════════════════════════════════════════════ */

export default function DesignThemePage() {
    const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME });
    const [saving, setSaving] = useState(false);

    const isDirty = useMemo(() => {
        return (Object.keys(DEFAULT_THEME) as (keyof ThemeConfig)[]).some((k) => theme[k] !== DEFAULT_THEME[k]);
    }, [theme]);

    const handleSave = useCallback(() => {
        setSaving(true);
        toast.loading("Application du thème…");
        setTimeout(() => {
            setSaving(false);
            toast.dismiss();
            toast.success("Thème mis à jour avec succès");
        }, 1500);
    }, []);

    const handleReset = useCallback(() => {
        setTheme({ ...DEFAULT_THEME });
        toast.info("Thème réinitialisé aux valeurs par défaut");
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Thème & Design</h1>
                    <p className="text-sm text-muted-foreground mt-1">Personnalisation visuelle de la plateforme</p>
                </div>
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-500/15 text-amber-400 border-0 gap-1 animate-pulse">
                            <AlertCircle className="h-2.5 w-2.5" /> Non sauvegardé
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5" onClick={handleReset} disabled={!isDirty || saving}>
                        <RotateCcw className="h-3 w-3" /> Réinitialiser
                    </Button>
                    <Button size="sm" className="h-8 text-xs gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90" onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? <Save className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Appliquer
                    </Button>
                </div>
            </motion.div>

            {/* Theme Mode */}
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Moon className="h-4 w-4 text-orange-400" />
                    Mode d&apos;affichage
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {THEME_MODES.map((m) => {
                        const Icon = m.icon;
                        const active = theme.mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setTheme((p) => ({ ...p, mode: m.id }))}
                                className={`p-4 rounded-xl border transition-all text-left ${active
                                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 mb-2 ${active ? "text-orange-400" : "text-muted-foreground"}`} />
                                <p className="text-xs font-medium">{m.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{m.description}</p>
                                {active && <CheckCircle2 className="h-3 w-3 text-orange-400 mt-2" />}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Colors */}
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Palette className="h-4 w-4 text-orange-400" />
                    Couleurs
                </div>

                {/* Primary */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Couleur primaire</p>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setTheme((p) => ({ ...p, primaryColor: c.value }))}
                                className={`group relative h-9 w-9 rounded-lg transition-all ${theme.primaryColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                                    }`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            >
                                {theme.primaryColor === c.value && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Couleur d&apos;accent</p>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setTheme((p) => ({ ...p, accentColor: c.value }))}
                                className={`group relative h-9 w-9 rounded-lg transition-all ${theme.accentColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                                    }`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            >
                                {theme.accentColor === c.value && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview bar */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="h-4 flex-1 rounded-full overflow-hidden flex">
                        <div className="flex-1" style={{ backgroundColor: theme.primaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: theme.accentColor }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{theme.primaryColor} → {theme.accentColor}</span>
                </div>
            </motion.div>

            {/* Typography */}
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Type className="h-4 w-4 text-orange-400" />
                    Typographie
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Police des titres</p>
                        <div className="flex flex-wrap gap-1.5">
                            {FONT_OPTIONS.map((f) => (
                                <button
                                    key={`h-${f}`}
                                    onClick={() => setTheme((p) => ({ ...p, fontHeading: f }))}
                                    className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${theme.fontHeading === f
                                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                            : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                                        }`}
                                    style={{ fontFamily: f }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Police du corps</p>
                        <div className="flex flex-wrap gap-1.5">
                            {FONT_OPTIONS.map((f) => (
                                <button
                                    key={`b-${f}`}
                                    onClick={() => setTheme((p) => ({ ...p, fontBody: f }))}
                                    className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${theme.fontBody === f
                                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                            : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                                        }`}
                                    style={{ fontFamily: f }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Typography Preview */}
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Eye className="h-2.5 w-2.5" /> Aperçu</p>
                    <h3 className="text-lg font-bold" style={{ fontFamily: theme.fontHeading }}>Titre en {theme.fontHeading}</h3>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: theme.fontBody }}>Corps de texte en {theme.fontBody}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </motion.div>

            {/* Border Radius */}
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Layers className="h-4 w-4 text-orange-400" />
                    Arrondis
                </div>
                <div className="flex flex-wrap gap-3">
                    {RADIUS_OPTIONS.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setTheme((p) => ({ ...p, radius: r.value }))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${theme.radius === r.value
                                    ? "border-orange-500 bg-orange-500/10"
                                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                                }`}
                        >
                            <div
                                className="h-10 w-14 border-2 border-current"
                                style={{ borderRadius: r.value, borderColor: theme.radius === r.value ? theme.primaryColor : "rgba(255,255,255,0.15)" }}
                            />
                            <span className="text-[10px]">{r.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Component Preview */}
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Paintbrush className="h-4 w-4 text-orange-400" />
                    Aperçu des composants
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Button preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground">Boutons</p>
                        <div className="flex flex-col gap-1.5">
                            <button className="h-8 px-3 text-xs text-white font-medium" style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius, fontFamily: theme.fontBody }}>
                                Primaire
                            </button>
                            <button className="h-8 px-3 text-xs font-medium border" style={{ borderColor: theme.accentColor, color: theme.accentColor, borderRadius: theme.radius, fontFamily: theme.fontBody }}>
                                Secondaire
                            </button>
                        </div>
                    </div>
                    {/* Badge preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground">Badges</p>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] text-white" style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius, fontFamily: theme.fontBody }}>Actif</span>
                            <span className="px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor, borderRadius: theme.radius, fontFamily: theme.fontBody }}>En cours</span>
                        </div>
                    </div>
                    {/* Card preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground">Carte</p>
                        <div className="p-3 border border-white/10 bg-white/[0.02] space-y-1" style={{ borderRadius: theme.radius }}>
                            <div className="h-1" style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius }} />
                            <p className="text-[10px] font-medium" style={{ fontFamily: theme.fontHeading }}>Titre</p>
                            <p className="text-[9px] text-muted-foreground" style={{ fontFamily: theme.fontBody }}>Description…</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
