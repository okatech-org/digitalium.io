"use client";

import React, { useState, useEffect } from "react";
import {
    Cloud,
    Server,
    HardDrive,
    Globe,
    Save,
    Loader2,
    Palette,
    ExternalLink,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────

interface DeployTabProps {
    orgId: any;
    hosting?: {
        type: string;
        types?: string[];
        domain?: string;
        pagePublique?: boolean;
    };
    onSaveHosting: (hosting: any) => Promise<void>;
}

interface HostingState {
    types: string[];
    domain: string;
    pagePublique: boolean;
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

// ─── Helpers ──────────────────────────────────

function parseHostingTypes(existing?: DeployTabProps["hosting"]): string[] {
    if (!existing) return ["cloud"];
    // Prioritize the multi-select array if available
    if (Array.isArray(existing.types) && existing.types.length > 0) return existing.types;
    // Fallback to legacy single string type
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

// ─── Main Component ───────────────────────────

export default function DeployTab({
    orgId,
    hosting,
    onSaveHosting,
}: DeployTabProps) {
    const [local, setLocal] = useState<HostingState>(getDefaultHosting(hosting));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocal(getDefaultHosting(hosting));
    }, [hosting]);

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

    const toggleHosting = (value: string) => {
        setLocal((prev) => {
            const has = prev.types.includes(value);
            // Prevent deselecting the last one
            if (has && prev.types.length === 1) return prev;
            return {
                ...prev,
                types: has
                    ? prev.types.filter((t) => t !== value)
                    : [...prev.types, value],
            };
        });
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
                                {/* Checkbox indicator */}
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
                        Domaine personnalise
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
                        {local.domain && (
                            <div className="flex items-center gap-1.5 mt-2">
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

            {/* ── Branding placeholder ─────────────────── */}
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04]">
                        <Palette className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white/50">
                                Personnalisation visuelle
                            </p>
                            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/15 text-[10px] px-1.5 py-0">
                                Bientot disponible
                            </Badge>
                        </div>
                        <p className="text-xs text-white/30 mt-0.5">
                            Personnalisez les couleurs, le logo et l&apos;apparence de
                            votre espace Digitalium
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Save button ─────────────────────────── */}
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
                    Sauvegarder
                </Button>
            </div>
        </div>
    );
}
