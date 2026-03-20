"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SignatureWorkflowManager
// CRUD interface for signature workflow templates
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import {
    PenTool,
    Plus,
    Trash2,
    Copy,
    ChevronDown,
    ChevronRight,
    Loader2,
    Save,
    Users,
    ArrowRight,
    X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// ─── Types ──────────────────────────────────────

interface WorkflowStep {
    order: number;
    signerId?: string;
    role?: string;
    required: boolean;
}

// ─── Component ──────────────────────────────────

export default function SignatureWorkflowManager() {
    const { user } = useAuth();
    const { convexOrgId } = useConvexOrgId();
    const [showCreate, setShowCreate] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Queries
    const workflows = useQuery(
        api.signatureWorkflows.listByOrg,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // Mutations
    const createWorkflow = useMutation(api.signatureWorkflows.create);
    const removeWorkflow = useMutation(api.signatureWorkflows.remove);
    const duplicateWorkflow = useMutation(api.signatureWorkflows.duplicate);

    // New workflow form state
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newSteps, setNewSteps] = useState<WorkflowStep[]>([
        { order: 1, role: "", required: true },
    ]);
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!newName.trim() || !convexOrgId || !user) return;
        setSaving(true);
        try {
            await createWorkflow({
                name: newName.trim(),
                description: newDescription.trim() || undefined,
                organizationId: convexOrgId,
                steps: newSteps.filter((s) => s.role?.trim()),
                createdBy: user.uid,
                isTemplate: true,
            });
            setNewName("");
            setNewDescription("");
            setNewSteps([{ order: 1, role: "", required: true }]);
            setShowCreate(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicate = async (id: Id<"signature_workflows">, name: string) => {
        if (!user) return;
        await duplicateWorkflow({
            id,
            newName: `${name} (copie)`,
            createdBy: user.uid,
        });
    };

    const handleDelete = async (id: Id<"signature_workflows">) => {
        if (confirm("Supprimer ce template de workflow ?")) {
            await removeWorkflow({ id });
        }
    };

    const addStep = () => {
        setNewSteps((prev) => [
            ...prev,
            { order: prev.length + 1, role: "", required: true },
        ]);
    };

    const removeStep = (idx: number) => {
        setNewSteps((prev) =>
            prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }))
        );
    };

    const updateStep = (idx: number, field: string, value: string | boolean) => {
        setNewSteps((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
        );
    };

    if (workflows === undefined) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white/80">
                        Templates de Workflow
                    </h3>
                    <Badge className="bg-white/[0.06] text-white/40 border-white/10 text-xs">
                        {workflows.length}
                    </Badge>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowCreate(true)}
                    className="h-7 text-xs gap-1.5 bg-violet-500/15 text-violet-300 border border-violet-500/20 hover:bg-violet-500/25"
                >
                    <Plus className="h-3 w-3" />
                    Nouveau template
                </Button>
            </div>

            {/* List */}
            {workflows.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                        <PenTool className="h-6 w-6 text-violet-400/50" />
                    </div>
                    <p className="text-sm text-white/40">
                        Aucun template de workflow
                    </p>
                    <p className="text-xs text-white/25 mt-1 max-w-xs">
                        Créez des templates réutilisables pour accélérer vos demandes de
                        signature.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {workflows.map((wf) => {
                        const isExpanded = expandedId === wf._id;
                        return (
                            <div
                                key={wf._id}
                                className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
                            >
                                {/* Header row */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <button
                                        onClick={() =>
                                            setExpandedId(isExpanded ? null : wf._id)
                                        }
                                        className="text-white/30 hover:text-white/60"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white/80">
                                            {wf.name}
                                        </p>
                                        {wf.description && (
                                            <p className="text-xs text-white/35 mt-0.5 truncate">
                                                {wf.description}
                                            </p>
                                        )}
                                    </div>
                                    <Badge className="bg-white/[0.04] text-white/40 border-white/10 text-[10px]">
                                        {wf.steps.length} étape
                                        {wf.steps.length > 1 ? "s" : ""}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() =>
                                                handleDuplicate(wf._id, wf.name)
                                            }
                                            className="h-7 w-7 rounded flex items-center justify-center hover:bg-white/[0.06] text-white/25 hover:text-white/60 transition-colors"
                                            title="Dupliquer"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(wf._id)}
                                            className="h-7 w-7 rounded flex items-center justify-center hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded: Steps */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">
                                            Étapes du workflow
                                        </p>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {wf.steps
                                                .sort((a, b) => a.order - b.order)
                                                .map((step, idx) => (
                                                    <React.Fragment key={idx}>
                                                        {idx > 0 && (
                                                            <ArrowRight className="h-3 w-3 text-white/15" />
                                                        )}
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                                            <Users className="h-3.5 w-3.5 text-violet-400/60" />
                                                            <span className="text-xs text-white/60">
                                                                {step.role || step.signerId || `Étape ${step.order}`}
                                                            </span>
                                                            {step.required && (
                                                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] px-1 py-0 h-3.5">
                                                                    Requis
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </React.Fragment>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-violet-400" />
                            Nouveau template de workflow
                        </DialogTitle>
                        <DialogDescription>
                            Définissez les étapes de signature réutilisables.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50">
                                Nom du template *
                            </label>
                            <Input
                                placeholder="Ex: Approbation Direction Générale"
                                value={newName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setNewName(e.target.value)
                                }
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50">
                                Description
                            </label>
                            <Input
                                placeholder="Description optionnelle"
                                value={newDescription}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setNewDescription(e.target.value)
                                }
                            />
                        </div>

                        {/* Steps */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-white/50">
                                    Étapes de signature
                                </label>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={addStep}
                                    className="h-6 text-[11px] gap-1 text-violet-400"
                                >
                                    <Plus className="h-3 w-3" />
                                    Ajouter
                                </Button>
                            </div>
                            {newSteps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                                >
                                    <span className="text-[10px] text-white/30 font-mono w-4">
                                        {step.order}
                                    </span>
                                    <Input
                                        placeholder="Rôle (ex: Directeur Financier)"
                                        value={step.role ?? ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            updateStep(idx, "role", e.target.value)
                                        }
                                        className="flex-1 h-8 text-xs"
                                    />
                                    <label className="flex items-center gap-1 text-[10px] text-white/40 shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={step.required}
                                            onChange={(e) =>
                                                updateStep(idx, "required", e.target.checked)
                                            }
                                            className="accent-violet-500"
                                        />
                                        Requis
                                    </label>
                                    {newSteps.length > 1 && (
                                        <button
                                            onClick={() => removeStep(idx)}
                                            title="Supprimer l'étape"
                                            className="h-6 w-6 rounded flex items-center justify-center hover:bg-red-500/10 text-white/20 hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowCreate(false)}
                            className="text-white/50"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={saving || !newName.trim()}
                            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Save className="h-4 w-4" />
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
