"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Workflow Templates
// CRUD for predefined signature circuits
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Workflow,
    Plus,
    Search,
    ArrowRight,
    Trash2,
    Copy,
    PenTool,
    Check,
    Eye,
    MoreHorizontal,
    Shield,
    Gavel,
    Users,
    Crown,
    GripVertical,
    X,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────

type StepRole = "signer" | "approver" | "observer";

interface WorkflowStep {
    id: string;
    label: string;
    role: StepRole;
    required: boolean;
}

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    steps: WorkflowStep[];
    isTemplate: boolean;
    usageCount: number;
    createdBy: string;
}

// ─── Predefined templates ──────────────────────

const TEMPLATES: WorkflowTemplate[] = [
    {
        id: "wf-1",
        name: "Validation Manager",
        description: "Signature simple : membre envoie, manager valide.",
        icon: Users,
        color: "from-violet-600 to-indigo-500",
        steps: [
            { id: "s1", label: "Rédacteur", role: "signer", required: true },
            { id: "s2", label: "Manager", role: "approver", required: true },
        ],
        isTemplate: true,
        usageCount: 34,
        createdBy: "Système",
    },
    {
        id: "wf-2",
        name: "Double Approbation",
        description: "Deux niveaux d'approbation avant signature finale.",
        icon: Shield,
        color: "from-emerald-600 to-teal-500",
        steps: [
            { id: "s1", label: "Initiateur", role: "signer", required: true },
            { id: "s2", label: "Manager Direct", role: "approver", required: true },
            { id: "s3", label: "Directeur Département", role: "approver", required: true },
        ],
        isTemplate: true,
        usageCount: 21,
        createdBy: "Système",
    },
    {
        id: "wf-3",
        name: "Circuit DG",
        description: "Circuit complet avec validation Direction Générale.",
        icon: Crown,
        color: "from-amber-600 to-orange-500",
        steps: [
            { id: "s1", label: "Rédacteur", role: "signer", required: true },
            { id: "s2", label: "Chef de Service", role: "approver", required: true },
            { id: "s3", label: "Directeur", role: "approver", required: true },
            { id: "s4", label: "DG / DGA", role: "approver", required: true },
            { id: "s5", label: "Secrétariat", role: "observer", required: false },
        ],
        isTemplate: true,
        usageCount: 12,
        createdBy: "Système",
    },
    {
        id: "wf-4",
        name: "Validation Juridique",
        description: "Passage obligatoire par le service juridique.",
        icon: Gavel,
        color: "from-rose-600 to-pink-500",
        steps: [
            { id: "s1", label: "Demandeur", role: "signer", required: true },
            { id: "s2", label: "Service Juridique", role: "approver", required: true },
            { id: "s3", label: "Direction", role: "approver", required: true },
            { id: "s4", label: "Compliance", role: "observer", required: false },
        ],
        isTemplate: true,
        usageCount: 8,
        createdBy: "Système",
    },
];

const ROLE_CONFIG: Record<StepRole, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    signer: { label: "Signataire", color: "text-violet-400", bg: "bg-violet-500/10", icon: PenTool },
    approver: { label: "Approbateur", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Check },
    observer: { label: "Observateur", color: "text-blue-400", bg: "bg-blue-500/10", icon: Eye },
};

// ─── Component ─────────────────────────────────

export default function WorkflowTemplatesPage() {
    const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(TEMPLATES);
    const [search, setSearch] = useState("");
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create modal state
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newSteps, setNewSteps] = useState<WorkflowStep[]>([
        { id: `step-${Date.now()}`, label: "", role: "signer", required: true },
    ]);

    const filtered = workflows.filter(
        (w) =>
            w.name.toLowerCase().includes(search.toLowerCase()) ||
            w.description.toLowerCase().includes(search.toLowerCase())
    );

    const addStep = () => {
        setNewSteps([
            ...newSteps,
            { id: `step-${Date.now()}-${Math.random()}`, label: "", role: "approver", required: true },
        ]);
    };

    const removeStep = (id: string) => {
        if (newSteps.length <= 1) return;
        setNewSteps(newSteps.filter((s) => s.id !== id));
    };

    const updateStep = (id: string, field: keyof WorkflowStep, value: string | boolean) => {
        setNewSteps(newSteps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleCreate = () => {
        if (!newName.trim()) return;
        const newWorkflow: WorkflowTemplate = {
            id: `wf-${Date.now()}`,
            name: newName,
            description: newDescription,
            icon: Workflow,
            color: "from-violet-600 to-indigo-500",
            steps: newSteps.filter((s) => s.label.trim()),
            isTemplate: false,
            usageCount: 0,
            createdBy: "Vous",
        };
        setWorkflows([newWorkflow, ...workflows]);
        setShowCreateModal(false);
        setNewName("");
        setNewDescription("");
        setNewSteps([{ id: `step-${Date.now()}`, label: "", role: "signer", required: true }]);
        toast.success("Circuit créé avec succès");
    };

    const duplicateWorkflow = (wf: WorkflowTemplate) => {
        const copy: WorkflowTemplate = {
            ...wf,
            id: `wf-${Date.now()}`,
            name: `${wf.name} (copie)`,
            isTemplate: false,
            usageCount: 0,
            createdBy: "Vous",
            steps: wf.steps.map((s) => ({ ...s, id: `step-${Date.now()}-${Math.random()}` })),
        };
        setWorkflows([copy, ...workflows]);
        toast.success("Circuit dupliqué");
    };

    const deleteWorkflow = (id: string) => {
        setWorkflows(workflows.filter((w) => w.id !== id));
        toast.success("Circuit supprimé");
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <Link href="/pro/isignature">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Workflow className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Circuits de Validation</h1>
                        <p className="text-xs text-muted-foreground">
                            {workflows.length} circuit{workflows.length > 1 ? "s" : ""} configuré{workflows.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Nouveau circuit
                </Button>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un circuit…"
                    className="h-9 pl-9 text-xs bg-white/[0.02] border-white/5 focus-visible:ring-violet-500/30"
                />
            </motion.div>

            {/* Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((wf, i) => {
                    const Icon = wf.icon;
                    return (
                        <motion.div
                            key={wf.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group p-4 rounded-xl border bg-white/[0.02] border-white/5 hover:border-white/10 transition-all cursor-pointer"
                            onClick={() => setSelectedWorkflow(wf)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${wf.color} flex items-center justify-center shrink-0`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold group-hover:text-violet-300 transition-colors">
                                            {wf.name}
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">{wf.description}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            className="text-xs gap-2"
                                            onClick={(e) => { e.stopPropagation(); duplicateWorkflow(wf); }}
                                        >
                                            <Copy className="h-3.5 w-3.5" /> Dupliquer
                                        </DropdownMenuItem>
                                        {!wf.isTemplate && (
                                            <DropdownMenuItem
                                                className="text-xs gap-2 text-red-400"
                                                onClick={(e) => { e.stopPropagation(); deleteWorkflow(wf.id); }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Workflow Steps Visualization */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {wf.steps.map((step, si) => {
                                    const roleCfg = ROLE_CONFIG[step.role];
                                    const RoleIcon = roleCfg.icon;
                                    return (
                                        <React.Fragment key={step.id}>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${roleCfg.bg} border border-white/5`}>
                                                <RoleIcon className={`h-2.5 w-2.5 ${roleCfg.color}`} />
                                                <span className="text-[10px] font-medium">{step.label}</span>
                                                {!step.required && (
                                                    <span className="text-[8px] text-zinc-500">(opt)</span>
                                                )}
                                            </div>
                                            {si < wf.steps.length - 1 && (
                                                <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-zinc-500">
                                        {wf.steps.length} étape{wf.steps.length > 1 ? "s" : ""}
                                    </span>
                                    <span className="text-[10px] text-zinc-600">·</span>
                                    <span className="text-[10px] text-zinc-500">
                                        Utilisé {wf.usageCount} fois
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {wf.isTemplate && (
                                        <Badge variant="secondary" className="text-[8px] h-4 bg-amber-500/10 text-amber-400 border-0">
                                            Système
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-[8px] h-4 bg-white/5 text-zinc-400 border-0">
                                        Par {wf.createdBy}
                                    </Badge>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <Workflow className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">Aucun circuit trouvé</p>
                </div>
            )}

            {/* ─── Detail Modal ─────────────────────────── */}
            <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 p-0">
                    {selectedWorkflow && (
                        <>
                            <DialogHeader className="p-5 pb-3 border-b border-white/5">
                                <DialogTitle className="flex items-center gap-2 text-base">
                                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${selectedWorkflow.color} flex items-center justify-center`}>
                                        <selectedWorkflow.icon className="h-4 w-4 text-white" />
                                    </div>
                                    {selectedWorkflow.name}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="p-5 space-y-4">
                                <p className="text-xs text-zinc-400">{selectedWorkflow.description}</p>

                                <div className="space-y-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                        Étapes du circuit
                                    </span>
                                    {selectedWorkflow.steps.map((step, i) => {
                                        const roleCfg = ROLE_CONFIG[step.role];
                                        const RoleIcon = roleCfg.icon;
                                        return (
                                            <div key={step.id} className="flex items-center gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={`h-8 w-8 rounded-full ${roleCfg.bg} flex items-center justify-center`}>
                                                        <span className="text-xs font-bold text-zinc-300">{i + 1}</span>
                                                    </div>
                                                    {i < selectedWorkflow.steps.length - 1 && (
                                                        <div className="w-px h-4 bg-white/10" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{step.label}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Badge variant="outline" className={`text-[8px] h-4 ${roleCfg.bg} ${roleCfg.color} border-white/5`}>
                                                            <RoleIcon className="h-2 w-2 mr-0.5" />
                                                            {roleCfg.label}
                                                        </Badge>
                                                        {!step.required && (
                                                            <span className="text-[9px] text-zinc-500">Optionnel</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <span className="text-[10px] text-zinc-500">
                                        Utilisé {selectedWorkflow.usageCount} fois
                                    </span>
                                    <Button
                                        size="sm"
                                        className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                                        onClick={() => {
                                            toast.success(`Circuit "${selectedWorkflow.name}" sélectionné`);
                                            setSelectedWorkflow(null);
                                        }}
                                    >
                                        <PenTool className="h-3 w-3 mr-1" />
                                        Utiliser ce circuit
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Create Modal ─────────────────────────── */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-lg bg-zinc-950 border-white/10 p-0 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="p-5 pb-3 border-b border-white/5">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                                <Plus className="h-4 w-4 text-white" />
                            </div>
                            Nouveau circuit de validation
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                Nom du circuit *
                            </label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ex: Validation achats > 1M XAF"
                                className="h-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                Description
                            </label>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Décrivez le circuit de validation…"
                                rows={2}
                                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500/30 resize-none"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                    Étapes du circuit
                                </label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] text-violet-400 hover:text-violet-300"
                                    onClick={addStep}
                                >
                                    <Plus className="h-3 w-3 mr-0.5" />
                                    Ajouter
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {newSteps.map((step, i) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                                    >
                                        <GripVertical className="h-3.5 w-3.5 text-zinc-600 shrink-0 cursor-grab" />
                                        <span className="text-[10px] text-zinc-500 font-mono w-4">{i + 1}</span>
                                        <Input
                                            value={step.label}
                                            onChange={(e) => updateStep(step.id, "label", e.target.value)}
                                            placeholder="Nom du rôle…"
                                            className="h-7 text-[11px] bg-white/5 border-white/5 flex-1"
                                        />
                                        <div className="flex items-center gap-0.5">
                                            {(["signer", "approver", "observer"] as StepRole[]).map((role) => {
                                                const cfg = ROLE_CONFIG[role];
                                                const RIcon = cfg.icon;
                                                return (
                                                    <button
                                                        key={role}
                                                        onClick={() => updateStep(step.id, "role", role)}
                                                        className={`h-7 w-7 rounded flex items-center justify-center transition-all ${
                                                            step.role === role
                                                                ? `${cfg.bg} ${cfg.color} border border-white/10`
                                                                : "bg-white/5 text-zinc-600 hover:bg-white/10"
                                                        }`}
                                                        title={cfg.label}
                                                    >
                                                        <RIcon className="h-3 w-3" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => removeStep(step.id)}
                                            className="h-6 w-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowCreateModal(false)}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                            disabled={!newName.trim() || newSteps.filter((s) => s.label.trim()).length === 0}
                            onClick={handleCreate}
                        >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Créer le circuit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
