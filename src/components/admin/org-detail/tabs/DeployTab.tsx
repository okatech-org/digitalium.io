"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Cloud,
    Server,
    HardDrive,
    Globe,
    Save,
    Loader2,
    Palette,
    ExternalLink,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    Building2,
    Rocket,
    Landmark,
    Type,
    MessageSquare,
    Link2,
    Layers,
    Users,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

// ─── Types ────────────────────────────────────

interface DeployTabProps {
    orgId: any;
    hosting?: {
        type: string;
        types?: string[];
        domain?: string;
        pagePublique?: boolean;
    };
    publicPageConfig?: {
        template?: "corporate" | "startup" | "institution";
        heroTitle?: string;
        heroSubtitle?: string;
        description?: string;
        primaryColor?: string;
        accentColor?: string;
        ctaText?: string;
        ctaLink?: string;
        showModules?: boolean;
        showContact?: boolean;
        customCss?: string;
    };
    onSaveHosting: (hosting: any) => Promise<void>;
}

interface HostingState {
    types: string[];
    domain: string;
    pagePublique: boolean;
}

interface PageConfigState {
    template: "corporate" | "startup" | "institution";
    heroTitle: string;
    heroSubtitle: string;
    description: string;
    primaryColor: string;
    accentColor: string;
    ctaText: string;
    ctaLink: string;
    showModules: boolean;
    showContact: boolean;
}

// ─── Constants ────────────────────────────────

const HOSTING_OPTIONS = [
    {
        value: "cloud",
        label: "Cloud Digitalium",
        description: "Hébergement sécurisé sur notre infrastructure cloud souveraine",
        icon: Cloud,
        badge: "Recommandé",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
        value: "datacenter",
        label: "Datacenter dédié",
        description: "Serveur dédié dans un datacenter régional certifié",
        icon: Server,
        badge: null,
        badgeColor: "",
    },
    {
        value: "local",
        label: "On-premise",
        description: "Installation sur votre propre infrastructure locale",
        icon: HardDrive,
        badge: "Avancé",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
] as const;

const TEMPLATE_OPTIONS = [
    {
        value: "corporate" as const,
        label: "Corporate",
        description: "Professionnel et élégant",
        icon: Building2,
        defaultPrimary: "#8B5CF6",
        defaultAccent: "#6366F1",
    },
    {
        value: "startup" as const,
        label: "Startup",
        description: "Audacieux et moderne",
        icon: Rocket,
        defaultPrimary: "#F97316",
        defaultAccent: "#EC4899",
    },
    {
        value: "institution" as const,
        label: "Institution",
        description: "Officiel et structuré",
        icon: Landmark,
        defaultPrimary: "#0EA5E9",
        defaultAccent: "#0369A1",
    },
];

const COLOR_PRESETS = [
    { label: "Violet", primary: "#8B5CF6", accent: "#6366F1" },
    { label: "Bleu", primary: "#3B82F6", accent: "#1D4ED8" },
    { label: "Émeraude", primary: "#10B981", accent: "#047857" },
    { label: "Orange", primary: "#F97316", accent: "#EA580C" },
    { label: "Rose", primary: "#EC4899", accent: "#DB2777" },
    { label: "Cyan", primary: "#0EA5E9", accent: "#0369A1" },
];

// ─── Helpers ──────────────────────────────────

function parseHostingTypes(existing?: DeployTabProps["hosting"]): string[] {
    if (!existing) return ["cloud"];
    if (Array.isArray(existing.types) && existing.types.length > 0) return existing.types;
    if (typeof existing.type === "string") return [existing.type];
    return ["cloud"];
}

function getDefaultHosting(existing?: DeployTabProps["hosting"]): HostingState {
    return {
        types: parseHostingTypes(existing),
        domain: existing?.domain ?? "",
        pagePublique: existing?.pagePublique ?? false,
    };
}

function getDefaultPageConfig(existing?: DeployTabProps["publicPageConfig"]): PageConfigState {
    return {
        template: existing?.template ?? "corporate",
        heroTitle: existing?.heroTitle ?? "",
        heroSubtitle: existing?.heroSubtitle ?? "",
        description: existing?.description ?? "",
        primaryColor: existing?.primaryColor ?? "#8B5CF6",
        accentColor: existing?.accentColor ?? "#6366F1",
        ctaText: existing?.ctaText ?? "",
        ctaLink: existing?.ctaLink ?? "",
        showModules: existing?.showModules ?? true,
        showContact: existing?.showContact ?? true,
    };
}

// ─── Debounce Hook ────────────────────────────

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

// ─── Domain Status Component ──────────────────

function DomainAvailabilityIndicator({
    domain,
    orgId,
}: {
    domain: string;
    orgId: Id<"organizations">;
}) {
    const debouncedDomain = useDebouncedValue(domain, 400);

    const result = useQuery(
        api.organizations.checkDomainAvailability,
        debouncedDomain && debouncedDomain.length >= 2
            ? { domain: debouncedDomain, excludeOrgId: orgId }
            : "skip"
    );

    if (!domain || domain.length < 2) return null;
    if (domain !== debouncedDomain || result === undefined) {
        return (
            <div className="flex items-center gap-1.5 mt-2">
                <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                <span className="text-xs text-white/30">Vérification…</span>
            </div>
        );
    }

    if (result.available) {
        return (
            <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400/80">Disponible</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 mt-2">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400/80">{result.reason}</span>
        </div>
    );
}

// ─── Mini Preview ─────────────────────────────

function MiniPreview({ config, orgName }: { config: PageConfigState; orgName?: string }) {
    return (
        <div className="rounded-lg overflow-hidden border border-white/5 bg-[#0a0a0f] text-[6px]">
            {/* Mini navbar */}
            <div className="px-2 py-1 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <div
                        className="w-2 h-2 rounded-sm"
                        style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}
                    />
                    <span className="text-white/70 font-bold truncate max-w-[60px]">{orgName || "Org"}</span>
                </div>
                {config.ctaText && (
                    <div
                        className="px-1.5 py-0.5 rounded text-white text-[5px]"
                        style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}
                    >
                        {config.ctaText.slice(0, 10)}
                    </div>
                )}
            </div>
            {/* Mini hero */}
            <div className="px-3 py-4 text-center">
                <div
                    className="absolute inset-x-0 top-0 h-8 opacity-10"
                    style={{ background: `radial-gradient(${config.primaryColor}, transparent)` }}
                />
                <p className="text-white/80 font-bold text-[8px] mb-0.5 truncate">
                    {config.heroTitle || orgName || "Titre"}
                </p>
                <p className="text-white/30 text-[5px] truncate">
                    {config.heroSubtitle || "Sous-titre"}
                </p>
            </div>
            {/* Mini modules */}
            {config.showModules && (
                <div className="px-2 pb-1.5 flex gap-1 justify-center">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-4 h-3 rounded-sm bg-white/5 border border-white/5" />
                    ))}
                </div>
            )}
            {/* Mini footer */}
            <div className="px-2 py-1 border-t border-white/5 text-center">
                <span className="text-white/20 text-[4px]">Propulsé par DIGITALIUM.IO</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────

export default function DeployTab({
    orgId,
    hosting,
    publicPageConfig,
    onSaveHosting,
}: DeployTabProps) {
    const [local, setLocal] = useState<HostingState>(getDefaultHosting(hosting));
    const [pageConfig, setPageConfig] = useState<PageConfigState>(getDefaultPageConfig(publicPageConfig));
    const [saving, setSaving] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);

    const updatePublicPageConfig = useMutation(api.organizations.updatePublicPageConfig);

    useEffect(() => {
        setLocal(getDefaultHosting(hosting));
    }, [hosting]);

    useEffect(() => {
        setPageConfig(getDefaultPageConfig(publicPageConfig));
    }, [publicPageConfig]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSaveHosting({
                type: local.types[0] ?? "cloud",
                types: local.types,
                domain: local.domain,
                pagePublique: local.pagePublique,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePageConfig = async () => {
        setSavingConfig(true);
        try {
            await updatePublicPageConfig({
                id: orgId as Id<"organizations">,
                config: pageConfig,
            });
        } finally {
            setSavingConfig(false);
        }
    };

    const toggleHosting = (value: string) => {
        setLocal((prev) => {
            const has = prev.types.includes(value);
            if (has && prev.types.length === 1) return prev;
            return {
                ...prev,
                types: has
                    ? prev.types.filter((t) => t !== value)
                    : [...prev.types, value],
            };
        });
    };

    const applyTemplate = (tpl: typeof TEMPLATE_OPTIONS[number]) => {
        setPageConfig((prev) => ({
            ...prev,
            template: tpl.value,
            primaryColor: tpl.defaultPrimary,
            accentColor: tpl.defaultAccent,
        }));
    };

    const fullDomain = local.domain
        ? `${local.domain}.digitalium.io`
        : "votre-org.digitalium.io";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white/90">
                    Déploiement
                </h2>
                <p className="text-sm text-white/40 mt-1">
                    Configurez l&apos;hébergement, le domaine et la visibilité de
                    l&apos;organisation
                </p>
            </div>

            {/* ── Hosting choice (multi-select) ──────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-1">
                    <Server className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white/70">
                        Type d&apos;hébergement
                    </h3>
                </div>
                <p className="text-xs text-white/35 mb-4">
                    Sélectionnez un ou plusieurs types d&apos;hébergement
                </p>
                <div className="grid gap-3">
                    {HOSTING_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = local.types.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleHosting(option.value)}
                                className={`
                                    relative flex items-start gap-4 p-4 rounded-lg border text-left transition-all duration-200
                                    ${isSelected
                                        ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.08)]"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                                        ${isSelected
                                            ? "border-violet-500 bg-violet-500"
                                            : "border-white/20 bg-transparent"
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            className={`w-4 h-4 ${isSelected
                                                ? "text-violet-400"
                                                : "text-white/40"
                                                }`}
                                        />
                                        <span
                                            className={`text-sm font-medium ${isSelected
                                                ? "text-white/90"
                                                : "text-white/70"
                                                }`}
                                        >
                                            {option.label}
                                        </span>
                                        {option.badge && (
                                            <Badge
                                                className={`${option.badgeColor} hover:opacity-80 text-[10px] px-1.5 py-0`}
                                            >
                                                {option.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/35 mt-1">
                                        {option.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-white/30 mt-3">
                    {local.types.length} type{local.types.length > 1 ? "s" : ""} sélectionné{local.types.length > 1 ? "s" : ""}
                </p>
            </div>

            {/* ── Domain customization ─────────────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white/70">
                        Domaine personnalisé
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-white/80">
                            Sous-domaine
                        </Label>
                        <p className="text-xs text-white/40 mt-0.5 mb-2">
                            Choisissez un identifiant unique pour votre organisation
                        </p>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={local.domain}
                                onChange={(e) =>
                                    setLocal((prev) => ({
                                        ...prev,
                                        domain: e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, ""),
                                    }))
                                }
                                className="flex-1 bg-white/[0.04] border-white/10 text-white/90"
                                placeholder="votre-org"
                            />
                            <span className="text-sm text-white/30 whitespace-nowrap">
                                .digitalium.io
                            </span>
                        </div>
                        {/* Real-time availability check */}
                        <DomainAvailabilityIndicator
                            domain={local.domain}
                            orgId={orgId as Id<"organizations">}
                        />
                        {local.domain && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <ExternalLink className="w-3 h-3 text-white/25" />
                                <span className="text-xs text-white/30">
                                    {fullDomain}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Page publique toggle */}
                    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/80">
                                Page publique
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">
                                Activer une page d&apos;accueil publique accessible sur
                                votre domaine
                            </p>
                        </div>
                        <Switch
                            checked={local.pagePublique}
                            onCheckedChange={(val) =>
                                setLocal((prev) => ({
                                    ...prev,
                                    pagePublique: val,
                                }))
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ── Save hosting button ──────────────────── */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white border-0 shadow-lg shadow-violet-500/20"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Sauvegarder hébergement
                </Button>
            </div>

            {/* ══════════════════════════════════════════
               VISUAL CUSTOMIZATION (when public page is ON)
               ══════════════════════════════════════════ */}
            {local.pagePublique && (
                <>
                    <div className="border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Palette className="w-4 h-4 text-violet-400" />
                            <h3 className="text-lg font-semibold text-white/90">
                                Personnalisation visuelle
                            </h3>
                        </div>
                        <p className="text-sm text-white/40 mb-6">
                            Personnalisez l&apos;apparence de votre page publique
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Left: Configuration ── */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Template selector */}
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers className="w-4 h-4 text-indigo-400" />
                                    <h4 className="text-sm font-semibold text-white/70">Template</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {TEMPLATE_OPTIONS.map((tpl) => {
                                        const Icon = tpl.icon;
                                        const isActive = pageConfig.template === tpl.value;
                                        return (
                                            <button
                                                key={tpl.value}
                                                type="button"
                                                onClick={() => applyTemplate(tpl)}
                                                className={`
                                                    relative p-4 rounded-lg border text-center transition-all duration-200
                                                    ${isActive
                                                        ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.08)]"
                                                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                                    }
                                                `}
                                            >
                                                <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? "text-violet-400" : "text-white/30"}`} />
                                                <p className={`text-xs font-medium ${isActive ? "text-white/90" : "text-white/60"}`}>
                                                    {tpl.label}
                                                </p>
                                                <p className="text-[10px] text-white/30 mt-0.5">{tpl.description}</p>
                                                {isActive && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Palette className="w-4 h-4 text-pink-400" />
                                    <h4 className="text-sm font-semibold text-white/70">Couleurs</h4>
                                </div>
                                {/* Presets */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {COLOR_PRESETS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => setPageConfig(p => ({ ...p, primaryColor: preset.primary, accentColor: preset.accent }))}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all text-xs"
                                        >
                                            <div className="flex -space-x-1">
                                                <div className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: preset.primary }} />
                                                <div className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: preset.accent }} />
                                            </div>
                                            <span className="text-white/50">{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Custom pickers */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Couleur primaire</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={pageConfig.primaryColor}
                                                onChange={(e) => setPageConfig(p => ({ ...p, primaryColor: e.target.value }))}
                                                className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                                            />
                                            <Input
                                                value={pageConfig.primaryColor}
                                                onChange={(e) => setPageConfig(p => ({ ...p, primaryColor: e.target.value }))}
                                                className="flex-1 bg-white/[0.04] border-white/10 text-white/80 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Couleur d&apos;accent</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={pageConfig.accentColor}
                                                onChange={(e) => setPageConfig(p => ({ ...p, accentColor: e.target.value }))}
                                                className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                                            />
                                            <Input
                                                value={pageConfig.accentColor}
                                                onChange={(e) => setPageConfig(p => ({ ...p, accentColor: e.target.value }))}
                                                className="flex-1 bg-white/[0.04] border-white/10 text-white/80 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Type className="w-4 h-4 text-emerald-400" />
                                    <h4 className="text-sm font-semibold text-white/70">Contenu</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Titre principal (Hero)</Label>
                                        <Input
                                            value={pageConfig.heroTitle}
                                            onChange={(e) => setPageConfig(p => ({ ...p, heroTitle: e.target.value }))}
                                            className="bg-white/[0.04] border-white/10 text-white/90"
                                            placeholder="Bienvenue chez Votre Organisation"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Sous-titre</Label>
                                        <Input
                                            value={pageConfig.heroSubtitle}
                                            onChange={(e) => setPageConfig(p => ({ ...p, heroSubtitle: e.target.value }))}
                                            className="bg-white/[0.04] border-white/10 text-white/90"
                                            placeholder="Décrivez votre mission en une phrase"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Description</Label>
                                        <textarea
                                            value={pageConfig.description}
                                            onChange={(e) => setPageConfig(p => ({ ...p, description: e.target.value }))}
                                            className="w-full min-h-[80px] rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm p-3 resize-y focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                            placeholder="Parlez de votre organisation…"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CTA & Toggles */}
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-4 h-4 text-amber-400" />
                                    <h4 className="text-sm font-semibold text-white/70">Appel à l&apos;action</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Texte du bouton CTA</Label>
                                        <Input
                                            value={pageConfig.ctaText}
                                            onChange={(e) => setPageConfig(p => ({ ...p, ctaText: e.target.value }))}
                                            className="bg-white/[0.04] border-white/10 text-white/90"
                                            placeholder="Nous contacter"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-white/50 mb-1 block">Lien CTA</Label>
                                        <Input
                                            value={pageConfig.ctaLink}
                                            onChange={(e) => setPageConfig(p => ({ ...p, ctaLink: e.target.value }))}
                                            className="bg-white/[0.04] border-white/10 text-white/90"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-white/30" />
                                            <span className="text-sm text-white/70">Afficher les modules</span>
                                        </div>
                                        <Switch
                                            checked={pageConfig.showModules}
                                            onCheckedChange={(val) => setPageConfig(p => ({ ...p, showModules: val }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-white/30" />
                                            <span className="text-sm text-white/70">Afficher le contact</span>
                                        </div>
                                        <Switch
                                            checked={pageConfig.showContact}
                                            onCheckedChange={(val) => setPageConfig(p => ({ ...p, showContact: val }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Preview ── */}
                        <div className="space-y-4">
                            <div className="sticky top-24">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="w-4 h-4 text-white/40" />
                                    <h4 className="text-sm font-semibold text-white/50">Aperçu</h4>
                                </div>
                                <MiniPreview config={pageConfig} orgName={undefined} />

                                {local.domain && (
                                    <a
                                        href={`/org/${local.domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-all w-full"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Voir la page complète
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save page config */}
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSavePageConfig}
                            disabled={savingConfig}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white border-0 shadow-lg shadow-violet-500/20"
                        >
                            {savingConfig ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Sauvegarder la personnalisation
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
