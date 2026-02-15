// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Workflows de Signature
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GitBranch, Plus, MoreVertical, Play, Pause, Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: number;
    active: boolean;
    usageCount: number;
}

const INITIAL_WORKFLOWS: Workflow[] = [
    { id: "wf1", name: "Validation document standard", description: "Auteur → Manager → DG", steps: 3, active: true, usageCount: 45 },
    { id: "wf2", name: "Approbation contrat fournisseur", description: "Juridique → Finance → DG", steps: 3, active: true, usageCount: 28 },
    { id: "wf3", name: "Circuit signature DG", description: "Assistante → DG", steps: 2, active: true, usageCount: 67 },
    { id: "wf4", name: "Validation RH — Embauche", description: "RH → Manager → DRH → DG", steps: 4, active: false, usageCount: 12 },
    { id: "wf5", name: "Approbation dépense > 5M XAF", description: "Demandeur → Finance → DAF → DG", steps: 4, active: true, usageCount: 8 },
];

export default function SubAdminSignatureWorkflowsPage() {
    const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newSteps, setNewSteps] = useState("");

    const handleCreate = useCallback(() => {
        if (!newName.trim()) { toast.error("Le nom est requis"); return; }
        const wf: Workflow = {
            id: `wf-${Date.now()}`,
            name: newName,
            description: newDesc || "Nouveau workflow",
            steps: parseInt(newSteps) || 2,
            active: false,
            usageCount: 0,
        };
        setWorkflows((prev) => [wf, ...prev]);
        setShowCreate(false);
        setNewName("");
        setNewDesc("");
        setNewSteps("");
        toast.success(`Workflow "${wf.name}" créé`);
    }, [newName, newDesc, newSteps]);

    const handleToggle = useCallback((id: string) => {
        setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, active: !w.active } : w));
        toast.info("Statut mis à jour");
    }, []);

    const handleDuplicate = useCallback((wf: Workflow) => {
        const copy: Workflow = { ...wf, id: `wf-${Date.now()}`, name: `${wf.name} (copie)`, usageCount: 0 };
        setWorkflows((prev) => [copy, ...prev]);
        toast.success("Workflow dupliqué");
    }, []);

    const handleDelete = useCallback((id: string) => {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
        toast.warning("Workflow supprimé");
    }, []);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Workflows de signature</h1>
                        <p className="text-xs text-muted-foreground">{workflows.length} workflow{workflows.length > 1 ? "s" : ""}</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-xs"
                    onClick={() => setShowCreate(true)}
                >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Nouveau
                </Button>
            </motion.div>

            {/* List */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                {workflows.map((wf) => (
                    <motion.div
                        key={wf.id}
                        variants={fadeUp}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                    >
                        <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <GitBranch className="h-4 w-4 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{wf.name}</p>
                                <Badge variant="outline" className={`text-[10px] ${wf.active ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"}`}>
                                    {wf.active ? "Actif" : "Brouillon"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-zinc-500">{wf.description}</span>
                                <span className="text-[11px] text-zinc-600">·</span>
                                <span className="text-[11px] text-zinc-500">{wf.steps} étapes</span>
                                <span className="text-[11px] text-zinc-600">·</span>
                                <span className="text-[11px] text-zinc-500">{wf.usageCount} utilisations</span>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleToggle(wf.id)}>
                                    {wf.active ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                    {wf.active ? "Désactiver" : "Activer"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(wf)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(wf.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </motion.div>
                ))}
            </motion.div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle>Nouveau workflow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input placeholder="Nom du workflow" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-white/5 border-white/10" />
                        <Input placeholder="Description (ex: Auteur → Manager → DG)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-white/5 border-white/10" />
                        <Input type="number" placeholder="Nombre d'étapes" value={newSteps} onChange={(e) => setNewSteps(e.target.value)} className="bg-white/5 border-white/10" min={2} max={10} />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
                        <Button className="bg-gradient-to-r from-violet-600 to-indigo-500" onClick={handleCreate}>Créer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
