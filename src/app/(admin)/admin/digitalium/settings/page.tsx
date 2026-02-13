// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Espace DIGITALIUM: Paramètres
// Configuration de la plateforme DIGITALIUM
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    Save,
    Globe,
    Shield,
    Bell,
    Server,
    Lock,
    Clock,
    Key,
    Mail,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Toggle Component ───────────────────── */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                checked ? "bg-emerald-500" : "bg-white/10"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-4" : "translate-x-0"
                }`}
            />
        </button>
    );
}

/* ═══════════════════════════════════════════ */

export default function DigitaliumSettingsPage() {
    const [settings, setSettings] = useState({
        domaine: "digitalium.io",
        urlApi: "https://api.digitalium.io",
        maintenance: false,
        twoFactor: true,
        sessionTimeout: "30",
        passwordPolicy: "strong",
        maxLoginAttempts: "5",
        smtpHost: "smtp.digitalium.ga",
        smtpPort: "587",
        smtpUser: "noreply@digitalium.ga",
        emailNotifs: true,
        alerteSecurite: true,
        rapportHebdo: true,
    });

    const update = (key: string, value: string | boolean) =>
        setSettings((p) => ({ ...p, [key]: value }));

    const handleSave = () => {
        toast.success("Paramètres sauvegardés", { description: "La configuration a été mise à jour" });
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="h-6 w-6 text-emerald-400" />
                        Paramètres
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Configuration de la plateforme DIGITALIUM</p>
                </div>
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Save className="h-3.5 w-3.5" />
                    Enregistrer
                </Button>
            </motion.div>

            {/* Platform Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold">Plateforme</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                            <Server className="h-3 w-3 inline mr-1" />Domaine principal
                        </label>
                        <Input
                            value={settings.domaine}
                            onChange={(e) => update("domaine", e.target.value)}
                            className="h-9 text-xs bg-white/5 border-white/10"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">URL API</label>
                        <Input
                            value={settings.urlApi}
                            onChange={(e) => update("urlApi", e.target.value)}
                            className="h-9 text-xs bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                            <div>
                                <p className="text-xs font-medium">Mode maintenance</p>
                                <p className="text-[10px] text-muted-foreground">Désactive l&apos;accès pour tous sauf les admin système</p>
                            </div>
                        </div>
                        <Toggle checked={settings.maintenance} onChange={(v) => update("maintenance", v)} />
                    </div>
                </div>
            </motion.div>

            {/* Security Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold">Sécurité</h2>
                    <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400 ml-auto">Renforcée</Badge>
                </div>
                <div className="space-y-4">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-emerald-400" />
                            <div>
                                <p className="text-xs font-medium">Authentification 2FA obligatoire</p>
                                <p className="text-[10px] text-muted-foreground">Tous les utilisateurs doivent activer la 2FA</p>
                            </div>
                        </div>
                        <Toggle checked={settings.twoFactor} onChange={(v) => update("twoFactor", v)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />Timeout session (min)
                            </label>
                            <Select value={settings.sessionTimeout} onValueChange={(v) => update("sessionTimeout", v)}>
                                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 heure</SelectItem>
                                    <SelectItem value="120">2 heures</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                <Key className="h-3 w-3 inline mr-1" />Politique mot de passe
                            </label>
                            <Select value={settings.passwordPolicy} onValueChange={(v) => update("passwordPolicy", v)}>
                                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">Basique (8 car.)</SelectItem>
                                    <SelectItem value="medium">Moyen (12 car. + chiffres)</SelectItem>
                                    <SelectItem value="strong">Fort (14 car. + spéciaux)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Tentatives max connexion</label>
                            <Select value={settings.maxLoginAttempts} onValueChange={(v) => update("maxLoginAttempts", v)}>
                                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 tentatives</SelectItem>
                                    <SelectItem value="5">5 tentatives</SelectItem>
                                    <SelectItem value="10">10 tentatives</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold">Notifications &amp; Emails</h2>
                </div>
                <div className="space-y-4">
                    {/* SMTP Config */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                <Mail className="h-3 w-3 inline mr-1" />Serveur SMTP
                            </label>
                            <Input
                                value={settings.smtpHost}
                                onChange={(e) => update("smtpHost", e.target.value)}
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Port</label>
                            <Input
                                value={settings.smtpPort}
                                onChange={(e) => update("smtpPort", e.target.value)}
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Expéditeur</label>
                            <Input
                                value={settings.smtpUser}
                                onChange={(e) => update("smtpUser", e.target.value)}
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-xs font-medium">Notifications email</p>
                                <p className="text-[10px] text-muted-foreground">Envoyer les notifications par email aux utilisateurs</p>
                            </div>
                            <Toggle checked={settings.emailNotifs} onChange={(v) => update("emailNotifs", v)} />
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-xs font-medium">Alertes sécurité</p>
                                <p className="text-[10px] text-muted-foreground">Notifier les admins en cas de tentative suspecte</p>
                            </div>
                            <Toggle checked={settings.alerteSecurite} onChange={(v) => update("alerteSecurite", v)} />
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-xs font-medium">Rapport hebdomadaire</p>
                                <p className="text-[10px] text-muted-foreground">Recevoir un résumé d&apos;activité chaque lundi</p>
                            </div>
                            <Toggle checked={settings.rapportHebdo} onChange={(v) => update("rapportHebdo", v)} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
