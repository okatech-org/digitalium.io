// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Organisation
// Editable form for global platform config
// with save/cancel, dirty state, grouped sections
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Globe,
    Building2,
    Mail,
    MapPin,
    Clock,
    Users,
    Languages,
    Save,
    RotateCcw,
    Shield,
    Server,
    CheckCircle2,
    AlertCircle,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ─── Config ─────────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

interface OrgConfig {
    platformName: string;
    domain: string;
    supportEmail: string;
    adminEmail: string;
    country: string;
    timezone: string;
    language: string;
    currency: string;
    maxUsers: string;
    maxStorage: string;
    maxOrganizations: string;
    maintenanceMode: boolean;
    signupEnabled: boolean;
    mfaRequired: boolean;
}

const DEFAULT_CONFIG: OrgConfig = {
    platformName: "DIGITALIUM.IO",
    domain: "digitalium.io",
    supportEmail: "support@digitalium.io",
    adminEmail: "admin@digitalium.io",
    country: "Gabon",
    timezone: "Africa/Libreville (UTC+1)",
    language: "Français",
    currency: "XAF",
    maxUsers: "10 000",
    maxStorage: "500 GB",
    maxOrganizations: "200",
    maintenanceMode: false,
    signupEnabled: true,
    mfaRequired: true,
};

interface FieldDef {
    key: keyof OrgConfig;
    label: string;
    icon: React.ElementType;
    type: "text" | "toggle";
    hint?: string;
}

const SECTIONS: { title: string; icon: React.ElementType; fields: FieldDef[] }[] = [
    {
        title: "Informations générales",
        icon: Building2,
        fields: [
            { key: "platformName", label: "Nom de la plateforme", icon: Building2, type: "text" },
            { key: "domain", label: "Domaine", icon: Globe, type: "text" },
            { key: "supportEmail", label: "Email support", icon: Mail, type: "text" },
            { key: "adminEmail", label: "Email admin", icon: Mail, type: "text" },
        ],
    },
    {
        title: "Localisation",
        icon: MapPin,
        fields: [
            { key: "country", label: "Pays", icon: MapPin, type: "text" },
            { key: "timezone", label: "Fuseau horaire", icon: Clock, type: "text" },
            { key: "language", label: "Langue par défaut", icon: Languages, type: "text" },
            { key: "currency", label: "Devise", icon: Globe, type: "text", hint: "Code ISO 4217" },
        ],
    },
    {
        title: "Limites de la plateforme",
        icon: Server,
        fields: [
            { key: "maxUsers", label: "Max utilisateurs", icon: Users, type: "text" },
            { key: "maxStorage", label: "Max stockage", icon: Server, type: "text" },
            { key: "maxOrganizations", label: "Max organisations", icon: Building2, type: "text" },
        ],
    },
    {
        title: "Sécurité & accès",
        icon: Shield,
        fields: [
            { key: "maintenanceMode", label: "Mode maintenance", icon: AlertCircle, type: "toggle", hint: "Active la page de maintenance publique" },
            { key: "signupEnabled", label: "Inscription ouverte", icon: Users, type: "toggle", hint: "Permet l'auto-inscription" },
            { key: "mfaRequired", label: "MFA obligatoire", icon: Shield, type: "toggle", hint: "Authentification à deux facteurs" },
        ],
    },
];

/* ═══════════════════════════════════════════════
   ORGANIZATION CONFIG PAGE
   ═══════════════════════════════════════════════ */

export default function OrganizationConfigPage() {
    const [config, setConfig] = useState<OrgConfig>({ ...DEFAULT_CONFIG });
    const [saving, setSaving] = useState(false);

    const isDirty = useMemo(() => {
        return (Object.keys(DEFAULT_CONFIG) as (keyof OrgConfig)[]).some((k) => config[k] !== DEFAULT_CONFIG[k]);
    }, [config]);

    const handleTextChange = useCallback((key: keyof OrgConfig, value: string) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleToggle = useCallback((key: keyof OrgConfig) => {
        setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const handleSave = useCallback(() => {
        setSaving(true);
        toast.loading("Enregistrement de la configuration…");
        setTimeout(() => {
            setSaving(false);
            toast.dismiss();
            toast.success("Configuration mise à jour avec succès");
        }, 1500);
    }, []);

    const handleReset = useCallback(() => {
        setConfig({ ...DEFAULT_CONFIG });
        toast.info("Configuration réinitialisée");
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[900px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configuration</h1>
                    <p className="text-sm text-muted-foreground mt-1">Paramètres globaux de la plateforme</p>
                </div>
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-500/15 text-amber-400 border-0 gap-1 animate-pulse">
                            <AlertCircle className="h-2.5 w-2.5" /> Modifications non sauvegardées
                        </Badge>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5 border-white/10 bg-white/5"
                        onClick={handleReset}
                        disabled={!isDirty || saving}
                    >
                        <RotateCcw className="h-3 w-3" />
                        Annuler
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90"
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                    >
                        {saving ? <Save className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Enregistrer
                    </Button>
                </div>
            </motion.div>

            {/* Logo Upload */}
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Logo de la plateforme</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PNG ou SVG, max 2 MB, 256×256px recommandé</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5" onClick={() => toast.success("Sélection de fichier ouverte")}>
                        <Upload className="h-3 w-3" /> Changer
                    </Button>
                </div>
            </motion.div>

            {/* Sections */}
            {SECTIONS.map((section) => {
                const SIcon = section.icon;
                return (
                    <motion.div key={section.title} variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <SIcon className="h-4 w-4 text-orange-400" />
                            {section.title}
                        </div>
                        <div className="grid gap-4">
                            {section.fields.map((field) => {
                                const FIcon = field.icon;
                                if (field.type === "toggle") {
                                    const val = config[field.key] as boolean;
                                    return (
                                        <div key={field.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <FIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-medium">{field.label}</p>
                                                    {field.hint && <p className="text-[10px] text-muted-foreground">{field.hint}</p>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggle(field.key)}
                                                className={`relative h-5 w-9 rounded-full transition-colors ${val ? "bg-emerald-500" : "bg-white/10"}`}
                                            >
                                                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${val ? "translate-x-4" : "translate-x-0.5"}`} />
                                            </button>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <FIcon className="h-3 w-3" /> {field.label}
                                        </label>
                                        <Input
                                            value={config[field.key] as string}
                                            onChange={(e) => handleTextChange(field.key, e.target.value)}
                                            className="h-8 text-xs bg-white/5 border-white/10"
                                        />
                                        {field.hint && <p className="text-[9px] text-muted-foreground/60">{field.hint}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
