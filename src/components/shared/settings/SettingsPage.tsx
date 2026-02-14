// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Settings: Universal Settings Page
// 7 tabs: Profil, Design System, Langue, Notifications,
// Sécurité, Accessibilité, Zone Danger
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, User, Palette, Globe, Bell, Shield, Accessibility, AlertTriangle,
    Sun, Moon, Monitor, Save, CheckCircle2, Type, Eye, Zap, Download,
    Trash2, LogOut, Lock, Smartphone, ChevronRight, Image, SquareIcon,
    RectangleHorizontal, Circle, Pipette, RotateCcw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useThemeContext } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import type {
    UserPreferences, Densite, TailleTexte,
    FontFamilyPreset, BorderRadiusPreset, BrandColor,
} from "@/types/settings";
import { DEFAULT_PREFERENCES, DEFAULT_BRAND_COLORS } from "@/types/settings";

/* ─── localStorage helpers ────────────────────── */

const PREFS_KEY = "digitalium-user-prefs";

function loadPrefs(): UserPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
        const stored = localStorage.getItem(PREFS_KEY);
        if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_PREFERENCES;
}

function savePrefs(prefs: UserPreferences) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

/* ─── Accent Colors ───────────────────────────── */

const ACCENT: Record<string, { gradient: string; text: string; bg: string; border: string }> = {
    violet: { gradient: "from-violet-600 to-indigo-500", text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    orange: { gradient: "from-orange-600 to-red-500", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    blue: { gradient: "from-blue-600 to-cyan-500", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    emerald: { gradient: "from-emerald-600 to-teal-500", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

/* ─── Design System data ──────────────────────── */

const FONT_OPTIONS: { id: FontFamilyPreset; name: string; stack: string }[] = [
    { id: "inter", name: "Inter", stack: "'Inter', sans-serif" },
    { id: "roboto", name: "Roboto", stack: "'Roboto', sans-serif" },
    { id: "outfit", name: "Outfit", stack: "'Outfit', sans-serif" },
    { id: "dm-sans", name: "DM Sans", stack: "'DM Sans', sans-serif" },
    { id: "space-grotesk", name: "Space Grotesk", stack: "'Space Grotesk', sans-serif" },
];

const RADIUS_OPTIONS: { id: BorderRadiusPreset; label: string; icon: React.ElementType; preview: string }[] = [
    { id: "sharp", label: "Sharp", icon: SquareIcon, preview: "rounded-none" },
    { id: "rounded", label: "Arrondi", icon: RectangleHorizontal, preview: "rounded-lg" },
    { id: "pill", label: "Pill", icon: Circle, preview: "rounded-full" },
];

const COLOR_PRESETS: { name: string; colors: BrandColor[] }[] = [
    {
        name: "Violet (Défaut)",
        colors: DEFAULT_BRAND_COLORS,
    },
    {
        name: "Ocean",
        colors: [
            { name: "Primary", value: "#0EA5E9", label: "Sky 500" },
            { name: "Secondary", value: "#06B6D4", label: "Cyan 500" },
            { name: "Accent", value: "#14B8A6", label: "Teal 500" },
            { name: "Destructive", value: "#F43F5E", label: "Rose 500" },
            { name: "Success", value: "#10B981", label: "Emerald 500" },
            { name: "Background", value: "#0C1222", label: "Slate 950" },
        ],
    },
    {
        name: "Sunset",
        colors: [
            { name: "Primary", value: "#F97316", label: "Orange 500" },
            { name: "Secondary", value: "#EF4444", label: "Red 500" },
            { name: "Accent", value: "#F59E0B", label: "Amber 500" },
            { name: "Destructive", value: "#DC2626", label: "Red 600" },
            { name: "Success", value: "#84CC16", label: "Lime 500" },
            { name: "Background", value: "#1C1007", label: "Warm 950" },
        ],
    },
    {
        name: "Émeraude",
        colors: [
            { name: "Primary", value: "#10B981", label: "Emerald 500" },
            { name: "Secondary", value: "#059669", label: "Emerald 600" },
            { name: "Accent", value: "#14B8A6", label: "Teal 500" },
            { name: "Destructive", value: "#EF4444", label: "Red 500" },
            { name: "Success", value: "#22C55E", label: "Green 500" },
            { name: "Background", value: "#022C22", label: "Emerald 950" },
        ],
    },
];

/* ═══════════════════════════════════════════════ */
/*  MAIN COMPONENT                                */
/* ═══════════════════════════════════════════════ */

interface SettingsPageProps {
    accentColor?: string;
}

export function SettingsPage({ accentColor = "violet" }: SettingsPageProps) {
    const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);
    const { theme, setTheme } = useThemeContext();

    const accent = ACCENT[accentColor] || ACCENT.violet;

    useEffect(() => {
        setPrefs(loadPrefs());
    }, []);

    const updatePref = useCallback(<K extends keyof UserPreferences>(key: K, val: UserPreferences[K]) => {
        setPrefs((p) => ({ ...p, [key]: val }));
        setDirty(true);
    }, []);

    const handleSave = useCallback(() => {
        setSaving(true);
        setTimeout(() => {
            savePrefs(prefs);
            setDirty(false);
            setSaving(false);
            toast.success("Préférences enregistrées");
        }, 400);
    }, [prefs]);

    const updateBrandColor = useCallback((index: number, newValue: string) => {
        setPrefs((p) => {
            const updated = [...p.brandColors];
            updated[index] = { ...updated[index], value: newValue, label: newValue };
            return { ...p, brandColors: updated };
        });
        setDirty(true);
    }, []);

    const applyColorPreset = useCallback((colors: BrandColor[]) => {
        updatePref("brandColors", [...colors]);
        toast.success("Palette appliquée");
    }, [updatePref]);

    const resetColors = useCallback(() => {
        updatePref("brandColors", [...DEFAULT_BRAND_COLORS]);
        toast.info("Palette réinitialisée");
    }, [updatePref]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center`}>
                        <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Paramètres</h1>
                        <p className="text-xs text-muted-foreground">Personnalisez votre expérience DIGITALIUM</p>
                    </div>
                </div>
                {dirty && (
                    <Button
                        size="sm"
                        className={`text-xs bg-gradient-to-r ${accent.gradient}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                        {saving ? "Enregistrement…" : "Enregistrer"}
                    </Button>
                )}
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="glass border border-white/5 h-9 flex-wrap gap-0.5">
                    <TabsTrigger value="profile" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <User className="h-3.5 w-3.5" /><span className="hidden lg:inline">Profil</span>
                    </TabsTrigger>
                    <TabsTrigger value="design" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Palette className="h-3.5 w-3.5" /><span className="hidden lg:inline">Design System</span>
                    </TabsTrigger>
                    <TabsTrigger value="language" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Globe className="h-3.5 w-3.5" /><span className="hidden lg:inline">Langue</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Bell className="h-3.5 w-3.5" /><span className="hidden lg:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Shield className="h-3.5 w-3.5" /><span className="hidden lg:inline">Sécurité</span>
                    </TabsTrigger>
                    <TabsTrigger value="accessibility" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Accessibility className="h-3.5 w-3.5" /><span className="hidden lg:inline">Accessibilité</span>
                    </TabsTrigger>
                    <TabsTrigger value="danger" className="text-xs gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" /><span className="hidden lg:inline">Danger</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    {/* ─── PROFIL ─────────────────────── */}
                    <TabsContent value="profile" className="mt-0">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Profil</CardTitle>
                                <CardDescription className="text-xs">Vos informations personnelles</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Prénom</Label>
                                        <Input
                                            value={prefs.prenom}
                                            onChange={(e) => updatePref("prenom", e.target.value)}
                                            placeholder="Votre prénom"
                                            className="h-9 text-xs bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nom</Label>
                                        <Input
                                            value={prefs.nom}
                                            onChange={(e) => updatePref("nom", e.target.value)}
                                            placeholder="Votre nom"
                                            className="h-9 text-xs bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Téléphone</Label>
                                    <Input
                                        value={prefs.telephone}
                                        onChange={(e) => updatePref("telephone", e.target.value)}
                                        placeholder="+241 XX XX XX XX"
                                        className="h-9 text-xs bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Bio</Label>
                                    <Textarea
                                        value={prefs.bio}
                                        onChange={(e) => updatePref("bio", e.target.value)}
                                        placeholder="Décrivez-vous en quelques mots…"
                                        className="text-xs bg-white/5 border-white/10 min-h-[80px] resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── DESIGN SYSTEM ──────────────── */}
                    <TabsContent value="design" className="mt-0 space-y-4">
                        {/* Thème */}
                        <Card className="glass border-white/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sun className="h-4 w-4" /> Thème
                                </CardTitle>
                                <CardDescription className="text-xs">Choisissez l&apos;apparence de l&apos;interface</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    <ThemeCard
                                        label="Clair"
                                        icon={Sun}
                                        active={theme === "light"}
                                        onClick={() => { setTheme("light"); updatePref("theme", "light"); }}
                                        accent={accent}
                                    />
                                    <ThemeCard
                                        label="Sombre"
                                        icon={Moon}
                                        active={theme === "dark"}
                                        onClick={() => { setTheme("dark"); updatePref("theme", "dark"); }}
                                        accent={accent}
                                    />
                                    <ThemeCard
                                        label="Auto"
                                        icon={Monitor}
                                        active={prefs.theme === "auto"}
                                        onClick={() => updatePref("theme", "auto")}
                                        accent={accent}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Densité */}
                        <Card className="glass border-white/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <RectangleHorizontal className="h-4 w-4" /> Densité
                                </CardTitle>
                                <CardDescription className="text-xs">Espacement des éléments de l&apos;interface</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["compact", "normal", "confort"] as Densite[]).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => updatePref("densite", d)}
                                            className={`p-3 rounded-lg border text-center transition-all ${prefs.densite === d
                                                ? `${accent.border} ${accent.bg}`
                                                : "border-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <span className={`text-xs font-medium ${prefs.densite === d ? accent.text : ""}`}>
                                                {d === "compact" ? "Compact" : d === "normal" ? "Normal" : "Confort"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Palette de couleurs */}
                        <Card className="glass border-white/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Palette className="h-4 w-4" /> Palette de couleurs
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            Couleurs de votre marque — cliquez pour modifier
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                        onClick={resetColors}
                                    >
                                        <RotateCcw className="h-3 w-3 mr-1" /> Réinitialiser
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Color swatches */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {prefs.brandColors.map((c, i) => (
                                        <motion.div
                                            key={c.name}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group glass-card rounded-xl p-4 space-y-2 cursor-pointer border border-white/5 hover:border-white/15 transition-colors relative"
                                            onClick={() => setEditingColorIdx(editingColorIdx === i ? null : i)}
                                        >
                                            <div
                                                className="h-12 rounded-lg transition-all relative overflow-hidden"
                                                style={{ backgroundColor: c.value }}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                    <Pipette className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium">{c.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{c.value}</p>
                                            <AnimatePresence>
                                                {editingColorIdx === i && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <input
                                                            type="color"
                                                            value={c.value}
                                                            onChange={(e) => updateBrandColor(i, e.target.value)}
                                                            className="w-full h-8 rounded cursor-pointer border-0 bg-transparent"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>

                                <Separator className="bg-white/5" />

                                {/* Palette presets */}
                                <div>
                                    <p className="text-xs font-medium mb-2 text-muted-foreground">Palettes prédéfinies</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() => applyColorPreset(preset.colors)}
                                                className="p-2 rounded-lg border border-white/5 hover:border-white/15 transition-all group"
                                            >
                                                <div className="flex gap-0.5 mb-1.5">
                                                    {preset.colors.slice(0, 4).map((c) => (
                                                        <div
                                                            key={c.name}
                                                            className="h-4 flex-1 rounded-sm first:rounded-l-md last:rounded-r-md"
                                                            style={{ backgroundColor: c.value }}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{preset.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Typographie */}
                        <Card className="glass border-white/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Type className="h-4 w-4" /> Typographie
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Police de caractères de la plateforme
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {FONT_OPTIONS.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => updatePref("fontFamily", font.id)}
                                            className={`p-3 rounded-lg border text-center transition-all ${prefs.fontFamily === font.id
                                                ? `${accent.border} ${accent.bg}`
                                                : "border-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <p
                                                className={`text-lg font-bold mb-1 ${prefs.fontFamily === font.id ? accent.text : ""}`}
                                                style={{ fontFamily: font.stack }}
                                            >
                                                Aa
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{font.name}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Typography preview */}
                                <div className="glass-card rounded-xl p-5 space-y-3 border border-white/5">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Aperçu</p>
                                    <p className="text-2xl font-bold" style={{ fontFamily: FONT_OPTIONS.find(f => f.id === prefs.fontFamily)?.stack }}>
                                        {prefs.fontFamily === "inter" ? "Inter" : FONT_OPTIONS.find(f => f.id === prefs.fontFamily)?.name} — Heading Bold
                                    </p>
                                    <p className="text-base" style={{ fontFamily: FONT_OPTIONS.find(f => f.id === prefs.fontFamily)?.stack }}>
                                        Corps de texte normal — La digitalisation au service de l&apos;excellence.
                                    </p>
                                    <p className="text-xs text-muted-foreground" style={{ fontFamily: FONT_OPTIONS.find(f => f.id === prefs.fontFamily)?.stack }}>
                                        Texte secondaire — font-size: 12px • line-height: 1.5
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bordures & Radius */}
                        <Card className="glass border-white/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <SquareIcon className="h-4 w-4" /> Bordures & Coins
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Style des coins de l&apos;interface
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {RADIUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => updatePref("borderRadius", opt.id)}
                                            className={`p-4 rounded-lg border text-center transition-all ${prefs.borderRadius === opt.id
                                                ? `${accent.border} ${accent.bg}`
                                                : "border-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <div className="flex justify-center mb-2">
                                                <div
                                                    className={`h-10 w-16 border-2 ${prefs.borderRadius === opt.id ? "border-violet-400" : "border-white/20"} ${opt.preview}`}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${prefs.borderRadius === opt.id ? accent.text : ""}`}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logo & Marque */}
                        <Card className="glass border-white/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Image className="h-4 w-4" /> Logo & Marque
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Identité visuelle de votre organisation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nom de la marque</Label>
                                    <Input
                                        value={prefs.brandName}
                                        onChange={(e) => updatePref("brandName", e.target.value)}
                                        placeholder="DIGITALIUM"
                                        className="h-9 text-xs bg-white/5 border-white/10 max-w-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Logo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center">
                                            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                                {prefs.brandName?.charAt(0) || "D"}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs border-white/10 hover:bg-white/5"
                                                onClick={() => toast.info("Upload de logo — fonctionnalité à venir")}
                                            >
                                                <Image className="h-3 w-3 mr-1.5" /> Changer le logo
                                            </Button>
                                            <p className="text-[10px] text-muted-foreground">PNG, SVG ou WebP • Max 2 Mo</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Live preview */}
                                <Separator className="bg-white/5" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Aperçu de l&apos;identité</p>
                                    <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-white/5">
                                        <div
                                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                                            style={{ background: `linear-gradient(135deg, ${prefs.brandColors[0]?.value || "#8B5CF6"}, ${prefs.brandColors[1]?.value || "#6366F1"})` }}
                                        >
                                            <span className="text-sm font-bold text-white">
                                                {prefs.brandName?.charAt(0) || "D"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ fontFamily: FONT_OPTIONS.find(f => f.id === prefs.fontFamily)?.stack }}>
                                                {prefs.brandName || "DIGITALIUM"}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Plateforme de gestion digitale</p>
                                        </div>
                                        <Badge
                                            className="ml-auto text-[9px] border-0"
                                            style={{
                                                backgroundColor: `${prefs.brandColors[4]?.value || "#22C55E"}20`,
                                                color: prefs.brandColors[4]?.value || "#22C55E",
                                            }}
                                        >
                                            Active
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── LANGUE ─────────────────────── */}
                    <TabsContent value="language" className="mt-0">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Langue</CardTitle>
                                <CardDescription className="text-xs">Sélectionnez la langue de l&apos;interface</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { code: "fr", label: "Français", flag: "🇫🇷" },
                                        { code: "en", label: "English", flag: "🇬🇧" },
                                        { code: "es", label: "Español", flag: "🇪🇸" },
                                        { code: "zh", label: "中文", flag: "🇨🇳" },
                                        { code: "ar", label: "العربية", flag: "🇸🇦" },
                                        { code: "pt", label: "Português", flag: "🇧🇷" },
                                        { code: "de", label: "Deutsch", flag: "🇩🇪" },
                                        { code: "ru", label: "Русский", flag: "🇷🇺" },
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => updatePref("langue", lang.code)}
                                            className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${prefs.langue === lang.code
                                                ? `${accent.border} ${accent.bg}`
                                                : "border-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <span className="text-2xl">{lang.flag}</span>
                                            <div className="text-left">
                                                <p className={`text-sm font-medium ${prefs.langue === lang.code ? accent.text : ""}`}>{lang.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{lang.code === "fr" ? "Langue par défaut" : "Coming soon"}</p>
                                            </div>
                                            {prefs.langue === lang.code && (
                                                <CheckCircle2 className={`h-4 w-4 ml-auto ${accent.text}`} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── NOTIFICATIONS ──────────────── */}
                    <TabsContent value="notifications" className="mt-0">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Notifications</CardTitle>
                                <CardDescription className="text-xs">Configurez vos préférences de notification par canal</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {/* Header */}
                                    <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 px-2 py-1">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">App</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">Email</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">SMS</span>
                                    </div>
                                    <Separator className="bg-white/5" />
                                    {Object.entries(prefs.notifications).map(([key, channels]) => (
                                        <div key={key} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 items-center px-2 py-2 rounded-lg hover:bg-white/3">
                                            <span className="text-xs capitalize">{key.replace(/-/g, " ")}</span>
                                            {(["inApp", "email", "sms"] as const).map((ch) => (
                                                <div key={ch} className="flex justify-center">
                                                    <Switch
                                                        checked={channels[ch]}
                                                        onCheckedChange={(checked: boolean) => {
                                                            const newNotifs = { ...prefs.notifications };
                                                            newNotifs[key] = { ...newNotifs[key], [ch]: checked };
                                                            updatePref("notifications", newNotifs);
                                                        }}
                                                        className="scale-75"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── SÉCURITÉ ───────────────────── */}
                    <TabsContent value="security" className="mt-0 space-y-4">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Mot de Passe</CardTitle>
                                <CardDescription className="text-xs">Modifiez votre mot de passe</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Mot de passe actuel</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 text-xs bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nouveau mot de passe</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 text-xs bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 text-xs bg-white/5 border-white/10" />
                                </div>
                                <Button size="sm" className="text-xs" onClick={() => toast.info("Fonctionnalité à venir — connexion Convex requise")}>
                                    <Lock className="h-3 w-3 mr-1.5" />
                                    Changer le mot de passe
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Sessions Actives</CardTitle>
                                <CardDescription className="text-xs">Appareils connectés à votre compte</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[
                                        { device: "MacBook Pro — Chrome", location: "Libreville, GA", current: true },
                                        { device: "iPhone 15 — Safari", location: "Libreville, GA", current: false },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-medium">{s.device}</p>
                                                    <p className="text-[10px] text-muted-foreground">{s.location}</p>
                                                </div>
                                            </div>
                                            {s.current ? (
                                                <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">Session actuelle</Badge>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] text-red-400 hover:text-red-300 h-6"
                                                    onClick={() => toast.info("Session révoquée")}
                                                >
                                                    Révoquer
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── ACCESSIBILITÉ ──────────────── */}
                    <TabsContent value="accessibility" className="mt-0">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Accessibilité</CardTitle>
                                <CardDescription className="text-xs">Adaptez l&apos;interface à vos besoins</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Taille texte */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Type className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-xs font-medium">Taille du texte</Label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(["normal", "grand", "tres-grand"] as TailleTexte[]).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => updatePref("tailleTexte", t)}
                                                className={`p-3 rounded-lg border text-center transition-all ${prefs.tailleTexte === t
                                                    ? `${accent.border} ${accent.bg}`
                                                    : "border-white/5 hover:border-white/10"
                                                    }`}
                                            >
                                                <span className={`font-medium ${prefs.tailleTexte === t ? accent.text : ""} ${t === "normal" ? "text-xs" : t === "grand" ? "text-sm" : "text-base"}`}>
                                                    {t === "normal" ? "Normal" : t === "grand" ? "Grand" : "Très Grand"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                {/* Toggles */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-medium">Contraste élevé</p>
                                                <p className="text-[10px] text-muted-foreground">Améliore la lisibilité des textes et bordures</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={prefs.contrasteEleve}
                                            onCheckedChange={(v: boolean) => updatePref("contrasteEleve", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-medium">Réduire les animations</p>
                                                <p className="text-[10px] text-muted-foreground">Désactive les transitions et animations non essentielles</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={prefs.animationsReduites}
                                            onCheckedChange={(v: boolean) => updatePref("animationsReduites", v)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── ZONE DANGER ────────────────── */}
                    <TabsContent value="danger" className="mt-0">
                        <Card className="glass border-red-500/10">
                            <CardHeader>
                                <CardTitle className="text-base text-red-400">Zone Danger</CardTitle>
                                <CardDescription className="text-xs">Actions irréversibles sur votre compte</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <DangerAction
                                    icon={Download}
                                    title="Exporter mes données"
                                    description="Téléchargez une copie de toutes vos données"
                                    buttonLabel="Exporter"
                                    onAction={() => toast.info("Export en cours… (fonctionnalité à venir)")}
                                />
                                <Separator className="bg-red-500/10" />
                                <DangerAction
                                    icon={LogOut}
                                    title="Déconnecter toutes les sessions"
                                    description="Vous serez déconnecté de tous les appareils"
                                    buttonLabel="Déconnecter"
                                    onAction={() => toast.info("Toutes les sessions ont été fermées")}
                                />
                                <Separator className="bg-red-500/10" />
                                <DangerAction
                                    icon={Trash2}
                                    title="Supprimer mon compte"
                                    description="Cette action est irréversible. Toutes vos données seront supprimées."
                                    buttonLabel="Supprimer"
                                    destructive
                                    onAction={() => toast.error("Fonctionnalité à venir — contactez l'administrateur")}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

/* ─── Sub-components ──────────────────────────── */

function ThemeCard({
    label,
    icon: Icon,
    active,
    onClick,
    accent,
}: {
    label: string;
    icon: React.ElementType;
    active: boolean;
    onClick: () => void;
    accent: { border: string; bg: string; text: string };
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${active ? `${accent.border} ${accent.bg}` : "border-white/5 hover:border-white/10"}`}
        >
            <Icon className={`h-5 w-5 ${active ? accent.text : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium ${active ? accent.text : ""}`}>{label}</span>
        </button>
    );
}

function DangerAction({
    icon: Icon,
    title,
    description,
    buttonLabel,
    destructive,
    onAction,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    buttonLabel: string;
    destructive?: boolean;
    onAction: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg ${destructive ? "bg-red-500/15" : "bg-orange-500/15"} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${destructive ? "text-red-400" : "text-orange-400"}`} />
                </div>
                <div>
                    <p className="text-xs font-medium">{title}</p>
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                className={`text-xs shrink-0 ${destructive ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"}`}
                onClick={onAction}
            >
                {buttonLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
        </div>
    );
}
