// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Settings: Universal Settings Page
// 7 tabs: Profil, Apparence, Langue, Notifications,
// Sécurité, Accessibilité, Zone Danger
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Settings, User, Palette, Globe, Bell, Shield, Accessibility, AlertTriangle,
    Sun, Moon, Monitor, Save, CheckCircle2, Type, Eye, Zap, Download,
    Trash2, LogOut, Lock, Smartphone, ChevronRight,
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
import type { UserPreferences, Densite, TailleTexte } from "@/types/settings";
import { DEFAULT_PREFERENCES } from "@/types/settings";

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
                    <TabsTrigger value="appearance" className="text-xs gap-1.5 data-[state=active]:bg-white/10">
                        <Palette className="h-3.5 w-3.5" /><span className="hidden lg:inline">Apparence</span>
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

                    {/* ─── APPARENCE ──────────────────── */}
                    <TabsContent value="appearance" className="mt-0 space-y-4">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Thème</CardTitle>
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

                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Densité</CardTitle>
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
                    </TabsContent>

                    {/* ─── LANGUE ─────────────────────── */}
                    <TabsContent value="language" className="mt-0">
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-base">Langue</CardTitle>
                                <CardDescription className="text-xs">Sélectionnez la langue de l&apos;interface</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { code: "fr", label: "Français", flag: "🇫🇷" },
                                        { code: "en", label: "English", flag: "🇬🇧" },
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
