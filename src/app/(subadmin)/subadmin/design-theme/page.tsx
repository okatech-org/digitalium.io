// DIGITALIUM.IO — SubAdmin: Theme & Design
"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Upload,
  Save,
  Building2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Config ─────────────────────────────────────── */

type ThemeMode = "light" | "dark" | "auto";

interface ThemeOption {
  key: ThemeMode;
  label: string;
  description: string;
  icon: React.ElementType;
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: "light", label: "Clair", description: "Interface lumineuse", icon: Sun },
  { key: "dark", label: "Sombre", description: "Interface sombre (par défaut)", icon: Moon },
  { key: "auto", label: "Auto", description: "Suit le système", icon: Monitor },
];

interface AccentColor {
  key: string;
  label: string;
  bg: string;
  ring: string;
}

const ACCENT_COLORS: AccentColor[] = [
  { key: "violet", label: "Violet", bg: "bg-violet-500", ring: "ring-violet-400" },
  { key: "indigo", label: "Indigo", bg: "bg-indigo-500", ring: "ring-indigo-400" },
  { key: "blue", label: "Bleu", bg: "bg-blue-500", ring: "ring-blue-400" },
  { key: "cyan", label: "Cyan", bg: "bg-cyan-500", ring: "ring-cyan-400" },
  { key: "emerald", label: "Émeraude", bg: "bg-emerald-500", ring: "ring-emerald-400" },
  { key: "amber", label: "Ambre", bg: "bg-amber-500", ring: "ring-amber-400" },
  { key: "rose", label: "Rose", bg: "bg-rose-500", ring: "ring-rose-400" },
  { key: "zinc", label: "Zinc", bg: "bg-zinc-500", ring: "ring-zinc-400" },
];

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function SubAdminDesignThemePage() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState("violet");

  const handleSave = useCallback(() => {
    const themeLabel = THEME_OPTIONS.find((t) => t.key === theme)?.label;
    const accentLabel = ACCENT_COLORS.find((c) => c.key === accent)?.label;
    toast.success("Thème sauvegardé", {
      description: `Thème : ${themeLabel} · Couleur : ${accentLabel}`,
    });
  }, [theme, accent]);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-violet-400" />
          Thème & Design
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Personnalisez l&apos;apparence de votre espace</p>
      </motion.div>

      {/* Theme Selection */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-4">Thème</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${
                  isActive ? "bg-violet-500/20" : "bg-white/5"
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? "text-violet-400" : "text-muted-foreground"}`} />
                </div>
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{option.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Accent Color */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-4">Couleur d&apos;accent</h2>
        <div className="flex flex-wrap gap-4">
          {ACCENT_COLORS.map((color) => {
            const isActive = accent === color.key;
            return (
              <button
                key={color.key}
                onClick={() => setAccent(color.key)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`h-10 w-10 rounded-full ${color.bg} transition-all ${
                    isActive ? `ring-2 ring-offset-2 ring-offset-zinc-900 ${color.ring} scale-110` : "opacity-70 group-hover:opacity-100"
                  }`}
                />
                <span className={`text-[10px] ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {color.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Logo Upload */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-4">Logo de l&apos;organisation</h2>
        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center hover:border-violet-500/30 transition-colors cursor-pointer"
          onClick={() => toast.info("Upload de logo", { description: "Fonctionnalité bientôt disponible" })}
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-500/20 flex items-center justify-center mb-3">
            <Building2 className="h-8 w-8 text-violet-400" />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Cliquez pour télécharger
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, SVG ou JPG (max 2 MB)</p>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={fadeUp} className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-9"
        >
          <Save className="h-3.5 w-3.5" />
          Sauvegarder les préférences
        </Button>
      </motion.div>
    </motion.div>
  );
}
