// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Organisation Client: Workflows
// Configuration des workflows par module pour le client
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Workflow,
    FileText,
    Archive,
    PenTool,
    Plus,
    CheckCircle2,
    ArrowRight,
    Clock,
    Users,
    ToggleLeft,
    ToggleRight,
    Settings,
    X,
    Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────── */

type ModuleTab = "idocument" | "iarchive" | "isignature";

interface WorkflowItem {
    id: string;
    nom: string;
    description: string;
    etapes: string[];
    actif: boolean;
    executions: number;
    derniereExecution: string;
}

/* ─── Module Tabs Config ─────────────────── */

const MODULE_TABS: { id: ModuleTab; label: string; icon: React.ElementType; color: string; activeColor: string }[] = [
    { id: "idocument", label: "iDocument", icon: FileText, color: "text-blue-400", activeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    { id: "iarchive", label: "iArchive", icon: Archive, color: "text-amber-400", activeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    { id: "isignature", label: "iSignature", icon: PenTool, color: "text-violet-400", activeColor: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
];

const TAB_COLORS: Record<ModuleTab, { bg: string; text: string; stepBg: string; gradient: string }> = {
    idocument: { bg: "bg-blue-500/10", text: "text-blue-400", stepBg: "bg-blue-500/15", gradient: "from-blue-600 to-indigo-500" },
    iarchive: { bg: "bg-amber-500/10", text: "text-amber-400", stepBg: "bg-amber-500/15", gradient: "from-amber-600 to-orange-500" },
    isignature: { bg: "bg-violet-500/10", text: "text-violet-400", stepBg: "bg-violet-500/15", gradient: "from-violet-600 to-indigo-500" },
};

/* ─── Mock Workflows ─────────────────────── */

const WORKFLOWS: Record<ModuleTab, WorkflowItem[]> = {
    idocument: [
        { id: "d1", nom: "Validation Document Interne", description: "Circuit d'approbation pour les documents internes", etapes: ["Rédaction", "Relecture", "Validation Chef", "Approbation DG", "Publication"], actif: true, executions: 234, derniereExecution: "Il y a 2h" },
        { id: "d2", nom: "Création Facture", description: "Workflow de création et envoi de factures clients", etapes: ["Saisie", "Vérification Comptable", "Approbation", "Envoi"], actif: true, executions: 156, derniereExecution: "Hier" },
        { id: "d3", nom: "Demande de Congé", description: "Traitement des demandes de congé du personnel", etapes: ["Demande", "Validation Manager", "Approbation RH", "Confirmation"], actif: false, executions: 89, derniereExecution: "Il y a 3j" },
    ],
    iarchive: [
        { id: "a1", nom: "Archivage Automatique", description: "Archivage automatique des documents validés après 30 jours", etapes: ["Détection", "Classification", "Indexation", "Stockage", "Confirmation"], actif: true, executions: 1024, derniereExecution: "Il y a 1h" },
        { id: "a2", nom: "Purge Archives Expirées", description: "Suppression des archives au-delà de la durée de rétention", etapes: ["Scan", "Vérification Rétention", "Notification", "Suppression"], actif: true, executions: 45, derniereExecution: "Il y a 7j" },
    ],
    isignature: [
        { id: "s1", nom: "Signature Contrat", description: "Circuit de signature pour les contrats commerciaux", etapes: ["Préparation", "Signature Commercial", "Signature Client", "Contre-signature DG", "Finalisation"], actif: true, executions: 67, derniereExecution: "Il y a 4h" },
        { id: "s2", nom: "Validation PV Réunion", description: "Approbation et signature des PV de réunion", etapes: ["Rédaction PV", "Relecture", "Signature Participants", "Archivage"], actif: true, executions: 34, derniereExecution: "Hier" },
        { id: "s3", nom: "Attestation de Travail", description: "Génération et signature des attestations", etapes: ["Demande", "Génération", "Signature RH", "Remise"], actif: false, executions: 12, derniereExecution: "Il y a 2 sem" },
    ],
};

/* ═══════════════════════════════════════════ */

export default function OrganizationWorkflowsPage() {
    const [activeTab, setActiveTab] = useState<ModuleTab>("idocument");
    const [showAdd, setShowAdd] = useState(false);
    const [newWf, setNewWf] = useState({ nom: "", description: "" });

    const currentWorkflows = WORKFLOWS[activeTab];
    const colors = TAB_COLORS[activeTab];
    const activeCount = currentWorkflows.filter((w) => w.actif).length;
    const totalExec = currentWorkflows.reduce((a, w) => a + w.executions, 0);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleToggle = (id: string) => {
        toast.success("Workflow mis à jour", { description: "Le statut a été modifié" });
    };

    const handleAdd = () => {
        if (!newWf.nom) return;
        toast.success("Workflow créé", { description: newWf.nom });
        setNewWf({ nom: "", description: "" });
        setShowAdd(false);
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Workflow className="h-6 w-6 text-violet-400" />
                        Workflows — SEEG
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Configuration des workflows par module</p>
                </div>
                <Button
                    onClick={() => setShowAdd(true)}
                    className={`bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 text-xs gap-2`}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau workflow
                </Button>
            </motion.div>

            {/* Module Tabs */}
            <motion.div variants={fadeUp} className="flex items-center gap-2">
                {MODULE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                                isActive
                                    ? tab.activeColor
                                    : "border-transparent text-muted-foreground hover:bg-white/5"
                            }`}
                        >
                            <Icon className={`h-3.5 w-3.5 ${isActive ? tab.color : ""}`} />
                            {tab.label}
                            <Badge variant="secondary" className={`text-[9px] border-0 ml-1 ${
                                isActive ? "bg-white/10" : "bg-white/5"
                            }`}>
                                {WORKFLOWS[tab.id].length}
                            </Badge>
                        </button>
                    );
                })}
            </motion.div>

            {/* Stats Strip */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Workflow className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{currentWorkflows.length}</p>
                        <p className="text-[10px] text-muted-foreground">Workflows total</p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{activeCount}</p>
                        <p className="text-[10px] text-muted-foreground">Actifs</p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{totalExec.toLocaleString("fr-FR")}</p>
                        <p className="text-[10px] text-muted-foreground">Exécutions totales</p>
                    </div>
                </div>
            </motion.div>

            {/* Workflow Cards */}
            <motion.div variants={fadeUp} className="space-y-4">
                {currentWorkflows.map((wf) => (
                    <div key={wf.id} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold">{wf.nom}</p>
                                    <Badge
                                        variant="secondary"
                                        className={`text-[9px] border-0 ${wf.actif ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}
                                    >
                                        {wf.actif ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{wf.description}</p>
                            </div>
                            <button
                                onClick={() => handleToggle(wf.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {wf.actif ? (
                                    <ToggleRight className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6" />
                                )}
                            </button>
                        </div>

                        {/* Steps */}
                        <div className="flex items-center gap-1 flex-wrap mb-4">
                            {wf.etapes.map((etape, i) => (
                                <React.Fragment key={etape}>
                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${colors.stepBg} ${colors.text}`}>
                                        {etape}
                                    </div>
                                    {i < wf.etapes.length - 1 && (
                                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                {wf.executions} exécutions
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {wf.derniereExecution}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {wf.etapes.length} étapes
                            </span>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Add Workflow Dialog */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm flex items-center gap-2">
                            <Plus className={`h-4 w-4 ${colors.text}`} />
                            Nouveau workflow
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Créez un nouveau workflow pour le module {MODULE_TABS.find((t) => t.id === activeTab)?.label}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Nom du workflow</label>
                            <Input
                                value={newWf.nom}
                                onChange={(e) => setNewWf((p) => ({ ...p, nom: e.target.value }))}
                                placeholder="Ex: Validation Document"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Description</label>
                            <Input
                                value={newWf.description}
                                onChange={(e) => setNewWf((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Décrivez le processus..."
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="text-xs gap-1.5">
                                <X className="h-3 w-3" />
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAdd}
                                className={`bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 text-xs gap-1.5`}
                            >
                                <Save className="h-3 w-3" />
                                Créer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
