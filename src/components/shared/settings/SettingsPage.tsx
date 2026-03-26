// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Settings: Universal Settings Page
// 8 tabs: Profil, Design System, Langue, Notifications,
// Sécurité, Accessibilité, Intégrations API, Zone Danger
// Persisted via Convex + localStorage fallback
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, User, Palette, Globe, Bell, Shield, Accessibility, AlertTriangle,
    Sun, Moon, Monitor, Save, CheckCircle2, Type, Eye, Zap, Download,
    Trash2, LogOut, Lock, Smartphone, ChevronRight, Image, SquareIcon,
    RectangleHorizontal, Circle, Pipette, RotateCcw, Webhook, Key, Plus,
    Loader2,
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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/FirebaseAuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import type {
    UserPreferences, Densite, TailleTexte,
    FontFamilyPreset, BorderRadiusPreset, BrandColor,
} from "@/types/settings";
import { DEFAULT_PREFERENCES, DEFAULT_BRAND_COLORS } from "@/types/settings";

/* ─── localStorage fallback ──────────────────── */

const PREFS_KEY = "digitalium-user-prefs";

function loadLocalPrefs(): UserPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
        const stored = localStorage.getItem(PREFS_KEY);
        if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_PREFERENCES;
}

function saveLocalPrefs(prefs: UserPreferences) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

/* ─── Password strength helper ───────────────── */

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string; percent: number } {
    if (!pw) return { level: 0, label: "", color: "", percent: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Faible", color: "bg-red-500", percent: 33 };
    if (score <= 2) return { level: 2, label: "Moyen", color: "bg-amber-500", percent: 66 };
    return { level: 3, label: "Fort", color: "bg-emerald-500", percent: 100 };
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
    const { user, signOut } = useAuthContext();

    // ── Convex persistence ──
    const convexPrefs = useQuery(
        api.userPreferences.getByUserId,
        user?.uid ? { userId: user.uid } : "skip"
    );
    const saveConvexPrefs = useMutation(api.userPreferences.save);

    // ── Security state ──
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);

    // ── Danger zone state ──
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const accent = ACCENT[accentColor] || ACCENT.violet;

    // Load prefs from Convex first, then localStorage fallback
    useEffect(() => {
        if (convexPrefs) {
            setPrefs((prev) => ({
                ...prev,
                prenom: convexPrefs.prenom ?? prev.prenom,
                nom: convexPrefs.nom ?? prev.nom,
                telephone: convexPrefs.telephone ?? prev.telephone,
                bio: convexPrefs.bio ?? prev.bio,
                theme: (convexPrefs.theme as UserPreferences["theme"]) ?? prev.theme,
                densite: (convexPrefs.densite as UserPreferences["densite"]) ?? prev.densite,
                fontFamily: (convexPrefs.fontFamily as UserPreferences["fontFamily"]) ?? prev.fontFamily,
                borderRadius: (convexPrefs.borderRadius as UserPreferences["borderRadius"]) ?? prev.borderRadius,
                brandName: convexPrefs.brandName ?? prev.brandName,
                brandColors: convexPrefs.brandColors ?? prev.brandColors,
                langue: convexPrefs.langue ?? prev.langue,
                notifications: convexPrefs.notifications ?? prev.notifications,
                tailleTexte: (convexPrefs.tailleTexte as UserPreferences["tailleTexte"]) ?? prev.tailleTexte,
                contrasteEleve: convexPrefs.contrasteEleve ?? prev.contrasteEleve,
                animationsReduites: convexPrefs.animationsReduites ?? prev.animationsReduites,
            }));
        } else if (convexPrefs === null) {
            // No Convex data — load from localStorage
            setPrefs(loadLocalPrefs());
        }
    }, [convexPrefs]);

    // Pre-fill profile from auth user
    useEffect(() => {
        if (user && !convexPrefs && !prefs.prenom) {
            const parts = user.displayName?.split(" ") ?? [];
            setPrefs((p) => ({
                ...p,
                prenom: parts[0] || p.prenom,
                nom: parts.slice(1).join(" ") || p.nom,
            }));
        }
    }, [user, convexPrefs, prefs.prenom]);

    const updatePref = useCallback(<K extends keyof UserPreferences>(key: K, val: UserPreferences[K]) => {
        setPrefs((p) => ({ ...p, [key]: val }));
        setDirty(true);
    }, []);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            // Save to localStorage always (for visual prefs)
            saveLocalPrefs(prefs);

            // Save to Convex if user is authenticated
            if (user?.uid) {
                await saveConvexPrefs({
                    userId: user.uid,
                    prenom: prefs.prenom,
                    nom: prefs.nom,
                    telephone: prefs.telephone,
                    bio: prefs.bio,
                    theme: prefs.theme,
                    densite: prefs.densite,
                    fontFamily: prefs.fontFamily,
                    borderRadius: prefs.borderRadius,
                    brandName: prefs.brandName,
                    brandColors: prefs.brandColors,
                    langue: prefs.langue,
                    notifications: prefs.notifications,
                    tailleTexte: prefs.tailleTexte,
                    contrasteEleve: prefs.contrasteEleve,
                    animationsReduites: prefs.animationsReduites,
                });
            }

            setDirty(false);
            toast.success("Préférences enregistrées");
        } catch {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    }, [prefs, user, saveConvexPrefs]);

    // ── Export data handler ──
    const handleExportData = useCallback(async () => {
        setIsExporting(true);
        try {
            const exportData = {
                profile: { prenom: prefs.prenom, nom: prefs.nom, telephone: prefs.telephone, bio: prefs.bio },
                preferences: { theme: prefs.theme, densite: prefs.densite, langue: prefs.langue },
                notifications: prefs.notifications,
                accessibility: { tailleTexte: prefs.tailleTexte, contrasteEleve: prefs.contrasteEleve, animationsReduites: prefs.animationsReduites },
                exportedAt: new Date().toISOString(),
                email: user?.email ?? "inconnu",
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `digitalium-export-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Données exportées avec succès");
        } catch {
            toast.error("Erreur lors de l'export");
        } finally {
            setIsExporting(false);
        }
    }, [prefs, user]);

    // ── Change password handler ──
    const handleChangePassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) { toast.error("Le mot de passe doit contenir au moins 8 caractères"); return; }
        if (newPassword !== confirmPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }
        setPasswordSaving(true);
        try {
            // In demo mode, simulate the change
            await new Promise((r) => setTimeout(r, 800));
            toast.success("Mot de passe modifié avec succès");
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch {
            toast.error("Erreur lors du changement de mot de passe");
        } finally {
            setPasswordSaving(false);
        }
    }, [newPassword, confirmPassword]);

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

    const passwordStrength = getPasswordStrength(newPassword);

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
                        <Palette className="h-3.5 w-3.5" /><span className="hidden lg:inline">Thème & Design</span>
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
                    <TabsTrigger value="api" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Webhook className="h-3.5 w-3.5" /><span className="hidden lg:inline">Intégrations API</span>
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
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Mot de passe actuel</Label>
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-9 text-xs bg-white/5 border-white/10"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nouveau mot de passe</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 8 caractères"
                                            className="h-9 text-xs bg-white/5 border-white/10"
                                            autoComplete="new-password"
                                        />
                                        {newPassword && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                                                            style={{ width: `${passwordStrength.percent}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-medium ${
                                                        passwordStrength.level === 1 ? "text-red-400" :
                                                        passwordStrength.level === 2 ? "text-amber-400" : "text-emerald-400"
                                                    }`}>
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-9 text-xs bg-white/5 border-white/10"
                                            autoComplete="new-password"
                                        />
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="text-[10px] text-red-400">Les mots de passe ne correspondent pas</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="text-xs"
                                        disabled={passwordSaving || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8}
                                    >
                                        {passwordSaving ? (
                                            <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Modification…</>
                                        ) : (
                                            <><Lock className="h-3 w-3 mr-1.5" />Changer le mot de passe</>
                                        )}
                                    </Button>
                                </form>
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
                                        { device: "MacBook Pro — Chrome", location: "Libreville, GA", current: true, lastActive: "Maintenant" },
                                        { device: "iPhone 15 — Safari", location: "Libreville, GA", current: false, lastActive: "Il y a 2h" },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-medium">{s.device}</p>
                                                    <p className="text-[10px] text-muted-foreground">{s.location} · {s.lastActive}</p>
                                                </div>
                                            </div>
                                            {s.current ? (
                                                <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">Session actuelle</Badge>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] text-red-400 hover:text-red-300 h-6"
                                                    onClick={() => toast.success("Session révoquée avec succès")}
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

                    {/* ─── API ────────────────────────── */}
                    <TabsContent value="api" className="mt-0 space-y-4">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Clés API</CardTitle>
                                <CardDescription className="text-xs">Gérez les clés d&apos;accès à l&apos;API DIGITALIUM</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-violet-500/20 flex items-center justify-center">
                                            <Key className="h-4 w-4 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Clé de production</p>
                                            <p className="text-[10px] font-mono text-muted-foreground">pk_live_...9f8a</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.success("Clé copiée")}>
                                        Copier
                                    </Button>
                                </div>
                                <Button size="sm" variant="outline" className="w-full sm:w-auto h-8 text-xs gap-1.5" onClick={() => toast.info("Génération de clé")}>
                                    <Plus className="h-3.5 w-3.5" /> Générer une nouvelle clé
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Webhooks</CardTitle>
                                <CardDescription className="text-xs">Notifications d&apos;événements en temps réel</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                        <Webhook className="h-6 w-6 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Aucun webhook configuré</p>
                                    <p className="text-[10px] mb-4 text-center max-w-[200px]">
                                        Recevez des notifications HTTP pour les événements comme `document.signed` ou `invoice.paid`.
                                    </p>
                                    <Button size="sm" className="h-8 text-xs bg-white/10 hover:bg-white/20 text-foreground border-0" onClick={() => toast.info("Ajout de webhook")}>
                                        Ajouter un endpoint
                                    </Button>
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
                                    description="Téléchargez une copie de toutes vos données au format JSON"
                                    buttonLabel={isExporting ? "Export…" : "Exporter"}
                                    onAction={handleExportData}
                                />
                                <Separator className="bg-red-500/10" />
                                <DangerAction
                                    icon={LogOut}
                                    title="Déconnecter toutes les sessions"
                                    description="Vous serez déconnecté de tous les appareils"
                                    buttonLabel="Déconnecter"
                                    onAction={() => setShowLogoutDialog(true)}
                                />
                                <Separator className="bg-red-500/10" />
                                <DangerAction
                                    icon={Trash2}
                                    title="Supprimer mon compte"
                                    description="Cette action est irréversible. Toutes vos données seront supprimées."
                                    buttonLabel="Supprimer"
                                    destructive
                                    onAction={() => setShowDeleteDialog(true)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

            {/* ─── Logout Confirmation Dialog ──── */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <div className="h-8 w-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                                <LogOut className="h-4 w-4 text-orange-400" />
                            </div>
                            Déconnecter toutes les sessions
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Vous serez déconnecté de tous les appareils, y compris celui-ci. Vous devrez vous reconnecter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowLogoutDialog(false)}>Annuler</Button>
                        <Button
                            size="sm"
                            className="text-xs bg-orange-600 hover:bg-orange-700"
                            onClick={async () => {
                                setShowLogoutDialog(false);
                                await signOut();
                                toast.success("Toutes les sessions ont été fermées");
                            }}
                        >
                            <LogOut className="h-3 w-3 mr-1.5" /> Confirmer la déconnexion
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Account Confirmation Dialog ──── */}
            <Dialog open={showDeleteDialog} onOpenChange={(v) => { setShowDeleteDialog(v); if (!v) setDeleteConfirmText(""); }}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-red-500/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base text-red-400">
                            <div className="h-8 w-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-red-400" />
                            </div>
                            Supprimer définitivement le compte
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Cette action est <span className="text-red-400 font-medium">irréversible</span>. Toutes vos données, documents, archives et signatures seront définitivement supprimés.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Tapez <span className="font-mono text-red-400">SUPPRIMER</span> pour confirmer</Label>
                            <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="SUPPRIMER"
                                className="h-9 text-xs bg-white/5 border-red-500/20 focus-visible:ring-red-500/30"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(""); }}>Annuler</Button>
                            <Button
                                size="sm"
                                className="text-xs bg-red-600 hover:bg-red-700"
                                disabled={deleteConfirmText !== "SUPPRIMER"}
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setDeleteConfirmText("");
                                    toast.error("Demande de suppression enregistrée. L'administrateur sera notifié.");
                                }}
                            >
                                <Trash2 className="h-3 w-3 mr-1.5" /> Supprimer définitivement
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
