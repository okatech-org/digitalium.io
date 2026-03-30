"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Admin: Automation Tab (Materialized Workflows)
// Shows real workflow pipelines from org-presets with activation
// toggles, step visualization, and schedule configuration.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from "react";
import {
    Zap,
    Save,
    Loader2,
    Archive,
    Bell,
    ShieldCheck,
    Workflow,
    Sparkles,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Eye,
    Inbox,
    PenTool,
    Clock,
    ArrowRight,
    Settings2,
    Play,
    Plus,
    Trash2,
    X,
    Filter,
    ArrowDown,
    AlertTriangle,
    Mail,
    FileArchive,
    ListChecks,
    Tag,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { getWorkflowPreset } from "@/config/org-presets";
import type { OrgType } from "@/config/org-config";
import type {
    WorkflowConfig,
    WorkflowStepType,
    AutomationConfig as AutomationConfigType,
} from "@/config/workflow-config";
import InfoButton from "../InfoButton";
import { HELP_AUTOMATION } from "@/config/org-config-help";

// ─── Types ────────────────────────────────────

interface AutomationTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orgId: any;
    orgType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSaveConfig: (config: any) => Promise<void>;
}

interface LocalAutomationConfig {
    archivageApresSignature: boolean;
    archivageAutomatique: boolean;
    notificationDocumentsEnAttente: boolean;
    rappelRenouvellementCertificats: boolean;
}

// ─── Step type → visual config ────────────────

const STEP_TYPE_CONFIG: Record<
    WorkflowStepType,
    { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
    approval: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Approbation" },
    review: { icon: Eye, color: "text-blue-400", bg: "bg-blue-500/15", label: "Revue" },
    notification: { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/15", label: "Notification" },
    auto_archive: { icon: Archive, color: "text-cyan-400", bg: "bg-cyan-500/15", label: "Archivage auto" },
    auto_sign: { icon: PenTool, color: "text-violet-400", bg: "bg-violet-500/15", label: "Signature auto" },
    webhook: { icon: Inbox, color: "text-rose-400", bg: "bg-rose-500/15", label: "Webhook" },
    delay: { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-500/15", label: "Délai" },
};

const TRIGGER_LABELS: Record<string, string> = {
    "document.created": "Création de document",
    "document.submitted": "Soumission de document",
    "document.approved": "Approbation de document",
    "archive.uploaded": "Upload d'archive",
    "archive.expiring": "Archive en expiration",
    "signature.requested": "Demande de signature",
    "signature.completed": "Signature complétée",
    "member.joined": "Nouveau membre",
    manual: "Déclenchement manuel",
    schedule: "Planifié (CRON)",
    event: "Événement",
    threshold: "Seuil",
};

// ─── Automation toggle items ──────────────────

const AUTOMATION_ITEMS = [
    {
        key: "archivageApresSignature" as const,
        label: "Archivage automatique à signature",
        description:
            "Archiver automatiquement un document dès que toutes les signatures sont collectées",
        icon: Archive,
    },
    {
        key: "archivageAutomatique" as const,
        label: "Archivage automatique global",
        description:
            "Activer l'archivage automatique des documents selon les règles de catégorie et les planifications",
        icon: FileArchive,
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
            "Alerter avant l'expiration des certificats de signature électronique",
        icon: ShieldCheck,
    },
];

// ─── Helpers ──────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDefaultAutomationConfig(existing?: any): LocalAutomationConfig {
    return {
        archivageApresSignature: existing?.archivageApresSignature ?? false,
        archivageAutomatique: existing?.archivageAutomatique ?? false,
        notificationDocumentsEnAttente:
            existing?.notificationDocumentsEnAttente ?? true,
        rappelRenouvellementCertificats:
            existing?.rappelRenouvellementCertificats ?? true,
    };
}

// ─── Custom Rule Types ────────────────────────

interface CustomRule {
    id: string;
    name: string;
    trigger: string;
    conditions: { field: string; operator: string; value: string }[];
    actions: { type: string; params?: Record<string, string> }[];
    isActive: boolean;
}

const RULE_TRIGGER_OPTIONS = [
    { value: "document.created", label: "Document créé", icon: FileArchive },
    { value: "document.submitted", label: "Document soumis", icon: ArrowRight },
    { value: "document.approved", label: "Document approuvé", icon: CheckCircle2 },
    { value: "signature.completed", label: "Signature complétée", icon: PenTool },
    { value: "archive.expiring", label: "Archive en expiration", icon: AlertTriangle },
    { value: "member.joined", label: "Nouveau membre", icon: Inbox },
];

const RULE_CONDITION_FIELDS = [
    { value: "document.tags", label: "Tags du document" },
    { value: "document.status", label: "Statut du document" },
    { value: "document.folder", label: "Dossier du document" },
    { value: "document.author", label: "Auteur du document" },
    { value: "archive.category", label: "Catégorie d'archive" },
];

const RULE_CONDITION_OPERATORS = [
    { value: "equals", label: "égal à" },
    { value: "not_equals", label: "différent de" },
    { value: "contains", label: "contient" },
    { value: "not_contains", label: "ne contient pas" },
];

const RULE_ACTION_OPTIONS = [
    { value: "send_notification", label: "Envoyer une notification", icon: Bell, color: "text-amber-400" },
    { value: "require_approval", label: "Exiger une approbation", icon: CheckCircle2, color: "text-emerald-400" },
    { value: "auto_archive", label: "Archiver automatiquement", icon: Archive, color: "text-cyan-400" },
    { value: "add_tag", label: "Ajouter un tag", icon: Tag, color: "text-violet-400" },
    { value: "send_email", label: "Envoyer un email", icon: Mail, color: "text-blue-400" },
    { value: "flag_compliance", label: "Signaler pour conformité", icon: ShieldCheck, color: "text-rose-400" },
];

// ─── Workflow Step Pipeline ───────────────────

function WorkflowStepPipeline({ steps }: { steps: WorkflowConfig["steps"] }) {
    const sorted = [...steps].sort((a, b) => a.order - b.order);

    return (
        <div className="flex items-center gap-1 overflow-x-auto py-2 px-1">
            {sorted.map((step, idx) => {
                const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.notification;
                const Icon = cfg.icon;
                return (
                    <React.Fragment key={step.id}>
                        {idx > 0 && (
                            <ArrowRight className="h-3 w-3 text-white/15 shrink-0" />
                        )}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 shrink-0">
                            <div className={`h-5 w-5 rounded flex items-center justify-center ${cfg.bg}`}>
                                <Icon className={`h-3 w-3 ${cfg.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-white/70 truncate max-w-[120px]">
                                    {step.label}
                                </p>
                                {step.assignTo && (
                                    <p className="text-[9px] text-white/50">
                                        {step.assignTo.type}: {step.assignTo.value}
                                    </p>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Single Workflow Card ─────────────────────

function WorkflowCard({
    workflow,
    isActive,
    onToggle,
}: {
    workflow: WorkflowConfig;
    isActive: boolean;
    onToggle: (id: string, on: boolean) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`rounded-xl border transition-all ${isActive
                ? "border-violet-500/20 bg-violet-500/[0.03]"
                : "border-white/5 bg-white/[0.02]"
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-0.5 text-white/50 hover:text-white/60 transition-colors"
                >
                    {expanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white/80">
                            {workflow.name}
                        </p>
                        {isActive && (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 h-4">
                                Actif
                            </Badge>
                        )}
                    </div>
                    {workflow.description && (
                        <p className="text-xs text-white/35 mt-0.5">
                            {workflow.description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                        <Badge className="bg-white/[0.04] text-white/40 border-white/10 text-[9px] px-1.5 py-0 h-4">
                            <Play className="h-2.5 w-2.5 mr-0.5" />
                            {TRIGGER_LABELS[workflow.trigger] || workflow.trigger}
                        </Badge>
                        <span className="text-[9px] text-white/25">
                            {workflow.steps.length} étape{workflow.steps.length > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Switch
                    checked={isActive}
                    onCheckedChange={(val) => onToggle(workflow.id, val)}
                />
            </div>

            {/* Expanded: Step Pipeline */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5">
                    <p className="text-[10px] text-white/50 font-medium mt-3 mb-1 flex items-center gap-1">
                        <Settings2 className="h-3 w-3" />
                        Pipeline des étapes
                    </p>
                    <WorkflowStepPipeline steps={workflow.steps} />
                </div>
            )}
        </div>
    );
}

// ─── Automation Schedule Card ─────────────────

function AutomationScheduleCard({
    automation,
    isActive,
    onToggle,
}: {
    automation: AutomationConfigType;
    isActive: boolean;
    onToggle: (id: string, on: boolean) => void;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 py-3 px-4 rounded-lg border transition-all ${isActive
                ? "border-cyan-500/20 bg-cyan-500/[0.03]"
                : "border-white/5 bg-white/[0.02]"
                }`}
        >
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-0.5 p-1.5 rounded-md ${isActive ? "bg-cyan-500/15" : "bg-white/[0.04]"}`}>
                    <Clock className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-white/40"}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white/80">
                            {automation.name}
                        </p>
                        {isActive && (
                            <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/20 text-[10px] px-1.5 py-0 h-4">
                                Actif
                            </Badge>
                        )}
                    </div>
                    {automation.description && (
                        <p className="text-xs text-white/35 mt-0.5">
                            {automation.description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                        <Badge className="bg-white/[0.04] text-white/40 border-white/10 text-[9px] px-1.5 py-0 h-4">
                            {TRIGGER_LABELS[automation.trigger] || automation.trigger}
                        </Badge>
                        {automation.schedule && (
                            <span className="text-[9px] text-white/25 font-mono">
                                {automation.schedule}
                            </span>
                        )}
                        <span className="text-[9px] text-white/25">
                            {automation.actions.length} action{automation.actions.length > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>
            <Switch
                checked={isActive}
                onCheckedChange={(val) => onToggle(automation.id, val)}
            />
        </div>
    );
}

// ─── Custom Rule Card ─────────────────────────

function CustomRuleCard({
    rule,
    onToggle,
    onDelete,
}: {
    rule: CustomRule;
    onToggle: (id: string, on: boolean) => void;
    onDelete: (id: string) => void;
}) {
    const triggerOpt = RULE_TRIGGER_OPTIONS.find((t) => t.value === rule.trigger);
    const TriggerIcon = triggerOpt?.icon || Sparkles;

    return (
        <div
            className={`rounded-xl border transition-all ${rule.isActive
                ? "border-violet-500/20 bg-violet-500/[0.03]"
                : "border-white/5 bg-white/[0.02]"
                }`}
        >
            <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 p-1.5 rounded-md ${rule.isActive ? "bg-violet-500/15" : "bg-white/[0.04]"
                    }`}>
                    <TriggerIcon className={`w-4 h-4 ${rule.isActive ? "text-violet-400" : "text-white/40"
                        }`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white/80">
                            {rule.name}
                        </p>
                        {rule.isActive && (
                            <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/20 text-[10px] px-1.5 py-0 h-4">
                                Actif
                            </Badge>
                        )}
                    </div>

                    {/* Trigger */}
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider">Quand</span>
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px] px-1.5 py-0 h-4">
                            {triggerOpt?.label || rule.trigger}
                        </Badge>
                    </div>

                    {/* Conditions */}
                    {rule.conditions.length > 0 && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                            <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wider mt-0.5">Si</span>
                            <div className="flex flex-wrap gap-1">
                                {rule.conditions.map((cond, i) => {
                                    const fieldLabel = RULE_CONDITION_FIELDS.find((f) => f.value === cond.field)?.label || cond.field;
                                    const opLabel = RULE_CONDITION_OPERATORS.find((o) => o.value === cond.operator)?.label || cond.operator;
                                    return (
                                        <Badge
                                            key={i}
                                            className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[10px] px-1.5 py-0 h-4"
                                        >
                                            {fieldLabel} {opLabel} &quot;{cond.value}&quot;
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-start gap-1.5 mt-1.5">
                        <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">Alors</span>
                        <div className="flex flex-wrap gap-1">
                            {rule.actions.map((act, i) => {
                                const actOpt = RULE_ACTION_OPTIONS.find((a) => a.value === act.type);
                                const ActIcon = actOpt?.icon || Sparkles;
                                return (
                                    <Badge
                                        key={i}
                                        className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] px-1.5 py-0 h-4 gap-1"
                                    >
                                        <ActIcon className="h-2.5 w-2.5" />
                                        {actOpt?.label || act.type}
                                        {act.params?.value && (
                                            <span className="text-white/40 ml-0.5">
                                                ({act.params.value})
                                            </span>
                                        )}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => onDelete(rule.id)}
                        title="Supprimer la règle"
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Switch
                        checked={rule.isActive}
                        onCheckedChange={(val) => onToggle(rule.id, val)}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────

export default function AutomationTab({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orgId,
    orgType,
    config,
    onSaveConfig,
}: AutomationTabProps) {
    // ── Automation toggles state ──
    const [local, setLocal] = useState<LocalAutomationConfig>(
        getDefaultAutomationConfig(config?.automation)
    );
    const [saving, setSaving] = useState(false);

    // ── Workflow activation state ──
    // Stores which workflow/automation IDs are active
    const [activeWorkflowIds, setActiveWorkflowIds] = useState<string[]>(
        config?.activeWorkflows ?? []
    );
    const [activeAutomationIds, setActiveAutomationIds] = useState<string[]>(
        config?.activeAutomations ?? []
    );

    // ── Custom rules state ──
    const [customRules, setCustomRules] = useState<CustomRule[]>(
        config?.customRules ?? []
    );
    const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);

    // New rule builder state
    const [newRuleName, setNewRuleName] = useState("");
    const [newRuleTrigger, setNewRuleTrigger] = useState("");
    const [newRuleConditions, setNewRuleConditions] = useState<
        { field: string; operator: string; value: string }[]
    >([]);
    const [newRuleActions, setNewRuleActions] = useState<
        { type: string; params?: Record<string, string> }[]
    >([]);

    useEffect(() => {
        setLocal(getDefaultAutomationConfig(config?.automation));
        setActiveWorkflowIds(config?.activeWorkflows ?? []);
        setActiveAutomationIds(config?.activeAutomations ?? []);
        setCustomRules(config?.customRules ?? []);
    }, [config]);

    // ── Get real workflow configs from org-presets ──
    const preset = useMemo(
        () => getWorkflowPreset(orgType as OrgType),
        [orgType]
    );

    const handleToggleWorkflow = (id: string, on: boolean) => {
        setActiveWorkflowIds((prev) =>
            on ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)
        );
    };

    const handleToggleAutomation = (id: string, on: boolean) => {
        setActiveAutomationIds((prev) =>
            on ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)
        );
    };

    // ── Custom rule handlers ──
    const handleToggleCustomRule = (id: string, on: boolean) => {
        setCustomRules((prev) =>
            prev.map((r) => r.id === id ? { ...r, isActive: on } : r)
        );
    };

    const handleDeleteCustomRule = (id: string) => {
        setCustomRules((prev) => prev.filter((r) => r.id !== id));
    };

    const handleAddCondition = () => {
        setNewRuleConditions((prev) => [
            ...prev,
            { field: "document.tags", operator: "contains", value: "" },
        ]);
    };

    const handleRemoveCondition = (idx: number) => {
        setNewRuleConditions((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateCondition = (
        idx: number,
        key: "field" | "operator" | "value",
        val: string
    ) => {
        setNewRuleConditions((prev) =>
            prev.map((c, i) => i === idx ? { ...c, [key]: val } : c)
        );
    };

    const handleToggleAction = (actionType: string) => {
        setNewRuleActions((prev) => {
            const exists = prev.find((a) => a.type === actionType);
            if (exists) return prev.filter((a) => a.type !== actionType);
            return [...prev, { type: actionType }];
        });
    };

    const handleCreateCustomRule = () => {
        if (!newRuleName.trim() || !newRuleTrigger || newRuleActions.length === 0) return;

        const rule: CustomRule = {
            id: `rule-${Date.now()}`,
            name: newRuleName.trim(),
            trigger: newRuleTrigger,
            conditions: newRuleConditions.filter((c) => c.value.trim()),
            actions: newRuleActions,
            isActive: true,
        };

        setCustomRules((prev) => [...prev, rule]);
        setNewRuleName("");
        setNewRuleTrigger("");
        setNewRuleConditions([]);
        setNewRuleActions([]);
        setShowNewRuleDialog(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSaveConfig({
                ...config,
                automation: local,
                // Sync archivageAutomatique into iArchive config
                // so automationEngine.ts reads it correctly
                iArchive: {
                    ...(config?.iArchive ?? {}),
                    archivageAutomatique: local.archivageAutomatique,
                },
                activeWorkflows: activeWorkflowIds,
                activeAutomations: activeAutomationIds,
                customRules,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    Automatisation
                    <InfoButton {...HELP_AUTOMATION.automations} side="bottom" />
                </h2>
                <p className="text-sm text-white/40 mt-1">
                    Configurez les workflows et automatisations pour
                    l&apos;organisation
                </p>
            </div>

            {/* ── Workflow Pipelines ───────────────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white/70">
                            Workflows
                        </h3>
                        <InfoButton {...HELP_AUTOMATION.workflows} />
                    </div>
                    <Badge className="bg-white/[0.06] text-white/40 border-white/10 hover:bg-white/[0.08] text-xs">
                        {preset.workflows.length} disponible{preset.workflows.length > 1 ? "s" : ""}
                    </Badge>
                </div>
                <div className="space-y-3">
                    {preset.workflows.map((wf) => (
                        <WorkflowCard
                            key={wf.id}
                            workflow={wf}
                            isActive={activeWorkflowIds.includes(wf.id)}
                            onToggle={handleToggleWorkflow}
                        />
                    ))}
                    {preset.workflows.length === 0 && (
                        <p className="text-xs text-white/50 text-center py-6">
                            Aucun workflow disponible pour ce type d&apos;organisation.
                        </p>
                    )}
                </div>
            </div>

            {/* ── Scheduled Automations ────────────────── */}
            {preset.automations.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-semibold text-white/70">
                                Automatisations planifiées
                            </h3>
                            <InfoButton {...HELP_AUTOMATION.schedules} />
                        </div>
                        <Badge className="bg-white/[0.06] text-white/40 border-white/10 hover:bg-white/[0.08] text-xs">
                            {preset.automations.length} disponible{preset.automations.length > 1 ? "s" : ""}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        {preset.automations.map((auto) => (
                            <AutomationScheduleCard
                                key={auto.id}
                                automation={auto}
                                isActive={activeAutomationIds.includes(auto.id)}
                                onToggle={handleToggleAutomation}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Automation toggles ───────────────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white/70">
                        Règles d&apos;automatisation
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

            {/* ── Custom Rules ────────────────────────── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white/70">
                            Règles personnalisées
                        </h3>
                        <InfoButton {...HELP_AUTOMATION.customRules} />
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowNewRuleDialog(true)}
                        className="h-7 text-xs gap-1.5 bg-violet-500/15 text-violet-300 border border-violet-500/20 hover:bg-violet-500/25"
                    >
                        <Plus className="h-3 w-3" />
                        Nouvelle règle
                    </Button>
                </div>

                {customRules.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                            <ListChecks className="h-6 w-6 text-violet-400/50" />
                        </div>
                        <p className="text-sm font-medium text-white/40">Aucune règle personnalisée</p>
                        <p className="text-xs text-white/25 mt-1 max-w-xs">
                            Créez des règles du type &quot;Quand un document est soumis, si le tag contient &apos;contrat&apos;, alors exiger une approbation&quot;
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {customRules.map((rule) => (
                            <CustomRuleCard
                                key={rule.id}
                                rule={rule}
                                onToggle={handleToggleCustomRule}
                                onDelete={handleDeleteCustomRule}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ═══ New Rule Dialog ═══════════════════════ */}
            <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                            Nouvelle règle personnalisée
                        </DialogTitle>
                        <DialogDescription>
                            Définissez un déclencheur, des conditions et des actions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label className="text-xs">Nom de la règle *</Label>
                            <Input
                                placeholder="Ex: Approbation obligatoire pour les contrats"
                                value={newRuleName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRuleName(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        {/* Trigger */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <Zap className="h-3 w-3 text-amber-400" />
                                Quand ? (Déclencheur) *
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {RULE_TRIGGER_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const selected = newRuleTrigger === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setNewRuleTrigger(opt.value)}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${selected
                                                ? "border-amber-500/40 bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-300"
                                                : "border-white/5 bg-white/[0.02] text-white/60 hover:border-white/10"
                                                }`}
                                        >
                                            <Icon className="h-3.5 w-3.5 shrink-0" />
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold flex items-center gap-1.5">
                                    <Filter className="h-3 w-3 text-blue-400" />
                                    Si ? (Conditions)
                                </Label>
                                <button
                                    onClick={handleAddCondition}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                    Ajouter
                                </button>
                            </div>
                            {newRuleConditions.length === 0 && (
                                <p className="text-[10px] text-white/25 italic">
                                    Aucune condition — la règle s&apos;appliquera à chaque déclenchement.
                                </p>
                            )}
                            {newRuleConditions.map((cond, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <select
                                        value={cond.field}
                                        onChange={(e) => handleUpdateCondition(idx, "field", e.target.value)}
                                        title="Champ de la condition"
                                        className="h-7 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/70 px-1.5 flex-1"
                                    >
                                        {RULE_CONDITION_FIELDS.map((f) => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={cond.operator}
                                        onChange={(e) => handleUpdateCondition(idx, "operator", e.target.value)}
                                        title="Opérateur de la condition"
                                        className="h-7 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/70 px-1.5 w-[110px]"
                                    >
                                        {RULE_CONDITION_OPERATORS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <Input
                                        value={cond.value}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateCondition(idx, "value", e.target.value)}
                                        placeholder="valeur"
                                        className="h-7 text-[11px] bg-white/5 border-white/10 flex-1"
                                    />
                                    <button
                                        onClick={() => handleRemoveCondition(idx)}
                                        title="Supprimer la condition"
                                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors shrink-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <ArrowDown className="h-3 w-3 text-emerald-400" />
                                Alors ? (Actions) *
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {RULE_ACTION_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const selected = newRuleActions.some((a) => a.type === opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleToggleAction(opt.value)}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${selected
                                                ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                                                : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                                }`}
                                        >
                                            <Icon className={`h-3.5 w-3.5 shrink-0 ${selected ? opt.color : "text-white/40"}`} />
                                            <span className={selected ? "text-emerald-300" : "text-white/60"}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowNewRuleDialog(false)}
                            className="border-white/10"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateCustomRule}
                            disabled={!newRuleName.trim() || !newRuleTrigger || newRuleActions.length === 0}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Créer la règle
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
