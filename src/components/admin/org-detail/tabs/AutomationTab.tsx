"use client";

import React, { useState, useEffect } from "react";
import {
    Zap,
    Save,
    Loader2,
    Archive,
    Bell,
    ShieldCheck,
    Workflow,
    Sparkles,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────

interface AutomationTabProps {
    orgId: any;
    orgType: string;
    config?: any;
    onSaveConfig: (config: any) => Promise<void>;
}

interface AutomationConfig {
    archivageApresSignature: boolean;
    notificationDocumentsEnAttente: boolean;
    rappelRenouvellementCertificats: boolean;
}

// ─── Constants ────────────────────────────────

const WORKFLOW_TEMPLATES: Record<
    string,
    { name: string; description: string }[]
> = {
    cabinet_comptable: [
        {
            name: "Circuit de validation comptable",
            description:
                "Validation automatique des ecritures par le chef de mission puis l'expert-comptable",
        },
        {
            name: "Collecte documents clients",
            description:
                "Workflow de collecte et relance automatique des pieces justificatives",
        },
        {
            name: "Cloture mensuelle",
            description:
                "Automatisation des etapes de cloture : lettrage, rapprochement, declaration",
        },
    ],
    entreprise_privee: [
        {
            name: "Circuit d'approbation achats",
            description:
                "Validation des bons de commande selon les seuils de depenses",
        },
        {
            name: "Onboarding employe",
            description:
                "Creation automatique des documents RH et workflow de signature",
        },
    ],
    administration_publique: [
        {
            name: "Circuit de parapheur",
            description:
                "Validation hierarchique des documents administratifs",
        },
        {
            name: "Archivage reglementaire",
            description:
                "Archivage automatique selon les regles de conservation du service public",
        },
    ],
    default: [
        {
            name: "Workflow de validation standard",
            description:
                "Circuit d'approbation a deux niveaux pour les documents importants",
        },
        {
            name: "Archivage periodique",
            description:
                "Archivage automatique des documents selon un calendrier defini",
        },
    ],
};

const AUTOMATION_ITEMS = [
    {
        key: "archivageApresSignature" as const,
        label: "Archivage automatique a signature",
        description:
            "Archiver automatiquement un document des que toutes les signatures sont collectees",
        icon: Archive,
    },
    {
        key: "notificationDocumentsEnAttente" as const,
        label: "Notification de documents en attente",
        description:
            "Envoyer des rappels pour les documents en attente de traitement depuis plus de 48h",
        icon: Bell,
    },
    {
        key: "rappelRenouvellementCertificats" as const,
        label: "Rappel de renouvellement certificats",
        description:
            "Alerter avant l'expiration des certificats de signature electronique",
        icon: ShieldCheck,
    },
];

// ─── Helpers ──────────────────────────────────

function getDefaultAutomationConfig(existing?: any): AutomationConfig {
    return {
        archivageApresSignature: existing?.archivageApresSignature ?? false,
        notificationDocumentsEnAttente:
            existing?.notificationDocumentsEnAttente ?? true,
        rappelRenouvellementCertificats:
            existing?.rappelRenouvellementCertificats ?? true,
    };
}

function getWorkflowTemplates(orgType: string) {
    return WORKFLOW_TEMPLATES[orgType] ?? WORKFLOW_TEMPLATES.default;
}

// ─── Main Component ───────────────────────────

export default function AutomationTab({
    orgId,
    orgType,
    config,
    onSaveConfig,
}: AutomationTabProps) {
    const [local, setLocal] = useState<AutomationConfig>(
        getDefaultAutomationConfig(config?.automation)
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocal(getDefaultAutomationConfig(config?.automation));
    }, [config]);

    const templates = getWorkflowTemplates(orgType);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSaveConfig({
                ...config,
                automation: local,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white/90">
                    Automatisation
                </h2>
                <p className="text-sm text-white/40 mt-1">
                    Configurez les automatisations pour simplifier les processus
                    recurrents de l&apos;organisation
                </p>
            </div>

            {/* ── Automation toggles ───────────────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white/70">
                        Regles d&apos;automatisation
                    </h3>
                </div>
                <div className="space-y-3">
                    {AUTOMATION_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="mt-0.5 p-1.5 rounded-md bg-white/[0.04]">
                                        <Icon className="w-4 h-4 text-white/40" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white/80">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-white/40 mt-0.5">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={local[item.key]}
                                    onCheckedChange={(val) =>
                                        setLocal((prev) => ({
                                            ...prev,
                                            [item.key]: val,
                                        }))
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Workflow templates ───────────────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white/70">
                            Modeles de workflows
                        </h3>
                    </div>
                    <Badge className="bg-white/[0.06] text-white/40 border-white/10 hover:bg-white/[0.08] text-xs">
                        Selon le type d&apos;organisation
                    </Badge>
                </div>
                <div className="space-y-2">
                    {templates.map((tpl, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5"
                        >
                            <div className="mt-0.5 w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-violet-400">
                                    {idx + 1}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white/70">
                                    {tpl.name}
                                </p>
                                <p className="text-xs text-white/35 mt-0.5">
                                    {tpl.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Custom rules — coming soon ──────────── */}
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04]">
                        <Sparkles className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white/50">
                                Regles personnalisees
                            </p>
                            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/15 text-[10px] px-1.5 py-0">
                                Coming soon
                            </Badge>
                        </div>
                        <p className="text-xs text-white/30 mt-0.5">
                            Creez vos propres regles d&apos;automatisation avec des
                            conditions et actions personnalisees
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
