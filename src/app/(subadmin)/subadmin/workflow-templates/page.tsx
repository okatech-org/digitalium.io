// DIGITALIUM.IO — SubAdmin: Workflow Templates
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────────────── */

type WorkflowStatus = "actif" | "brouillon";

interface Workflow {
  id: string;
  nom: string;
  description: string;
  etapes: string[];
  status: WorkflowStatus;
  utilisations: number;
}

/* ─── Mock Data ──────────────────────────────────── */

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "WF001",
    nom: "Validation doc standard",
    description: "Circuit de validation pour les documents courants",
    etapes: ["Rédaction", "Révision", "Approbation"],
    status: "actif",
    utilisations: 34,
  },
  {
    id: "WF002",
    nom: "Approbation contrat",
    description: "Validation multi-niveaux pour les contrats importants",
    etapes: ["Rédaction", "Juridique", "Direction", "Signature"],
    status: "actif",
    utilisations: 12,
  },
  {
    id: "WF003",
    nom: "Circuit DG express",
    description: "Circuit rapide avec approbation directe par le DG",
    etapes: ["Soumission", "Approbation DG"],
    status: "actif",
    utilisations: 8,
  },
  {
    id: "WF004",
    nom: "Onboarding collaborateur",
    description: "Intégration d'un nouveau membre dans l'équipe",
    etapes: ["RH", "IT", "Formation", "Manager", "Validation"],
    status: "brouillon",
    utilisations: 0,
  },
  {
    id: "WF005",
    nom: "Validation budget",
    description: "Approbation des demandes budgétaires",
    etapes: ["Demandeur", "Manager", "Finance", "DG"],
    status: "brouillon",
    utilisations: 0,
  },
];

const EMPTY_FORM = { nom: "", description: "", etapes: "" };

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function SubAdminWorkflowTemplatesPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    if (!search) return workflows;
    return workflows.filter(
      (w) =>
        w.nom.toLowerCase().includes(search.toLowerCase()) ||
        w.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [workflows, search]);

  const handleCreate = useCallback(() => {
    if (!form.nom || !form.etapes) {
      toast.error("Champs requis", { description: "Le nom et les étapes sont obligatoires" });
      return;
    }
    const etapes = form.etapes.split(",").map((s) => s.trim()).filter(Boolean);
    if (etapes.length < 2) {
      toast.error("Minimum 2 étapes", { description: "Séparez les étapes par des virgules" });
      return;
    }
    const newWf: Workflow = {
      id: `WF${String(workflows.length + 1).padStart(3, "0")}`,
      nom: form.nom,
      description: form.description,
      etapes,
      status: "brouillon",
      utilisations: 0,
    };
    setWorkflows((prev) => [newWf, ...prev]);
    setForm(EMPTY_FORM);
    setShowCreate(false);
    toast.success("Modèle créé", { description: `${form.nom} (${etapes.length} étapes)` });
  }, [form, workflows.length]);

  const handleDuplicate = useCallback((wf: Workflow) => {
    const clone: Workflow = {
      ...wf,
      id: `WF${String(workflows.length + 1).padStart(3, "0")}`,
      nom: `${wf.nom} (copie)`,
      status: "brouillon",
      utilisations: 0,
    };
    setWorkflows((prev) => [clone, ...prev]);
    toast.success("Modèle dupliqué", { description: clone.nom });
  }, [workflows.length]);

  const handleToggleStatus = useCallback((wf: Workflow) => {
    const next: WorkflowStatus = wf.status === "actif" ? "brouillon" : "actif";
    setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? { ...w, status: next } : w)));
    toast.success(next === "actif" ? "Modèle activé" : "Modèle désactivé", { description: wf.nom });
  }, []);

  const handleDelete = useCallback((wf: Workflow) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== wf.id));
    toast.success("Modèle supprimé", { description: wf.nom });
  }, []);

  const handleEdit = useCallback((wf: Workflow) => {
    toast.info("Édition", { description: `Modification de "${wf.nom}" bientôt disponible` });
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-violet-400" />
            Modèles de workflows
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez les circuits de validation de votre organisation</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Créer modèle
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un workflow..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white/5 border-white/10"
          />
        </div>
      </motion.div>

      {/* Workflows List */}
      <motion.div variants={stagger} className="space-y-3">
        {filtered.map((wf) => (
          <motion.div
            key={wf.id}
            variants={fadeUp}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">{wf.nom}</h3>
                  <Badge
                    variant="secondary"
                    className={`text-[9px] border-0 ${
                      wf.status === "actif"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    {wf.status === "actif" ? "Actif" : "Brouillon"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {wf.utilisations} utilisation{wf.utilisations !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{wf.description}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {wf.etapes.map((etape, i) => (
                    <React.Fragment key={i}>
                      <Badge variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-300 border-0">
                        {etape}
                      </Badge>
                      {i < wf.etapes.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleEdit(wf)}>
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleDuplicate(wf)}>
                    <Copy className="h-3.5 w-3.5" /> Dupliquer
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleToggleStatus(wf)}>
                    {wf.status === "actif" ? (
                      <><ToggleLeft className="h-3.5 w-3.5" /> Désactiver</>
                    ) : (
                      <><ToggleRight className="h-3.5 w-3.5" /> Activer</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-destructive" onClick={() => handleDelete(wf)}>
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucun workflow trouvé</p>
        </motion.div>
      )}

      {/* Dialog: Créer modèle */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-violet-400" />
              Créer un modèle de workflow
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Définissez les étapes du circuit de validation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nom du workflow *</Label>
              <Input
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="Validation doc standard"
                className="h-9 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Circuit de validation pour..."
                className="h-9 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Étapes (séparées par des virgules) *</Label>
              <Input
                value={form.etapes}
                onChange={(e) => setForm((p) => ({ ...p, etapes: e.target.value }))}
                placeholder="Rédaction, Révision, Approbation"
                className="h-9 text-xs bg-white/5 border-white/10"
              />
              {form.etapes && (
                <div className="flex items-center gap-1 flex-wrap mt-2">
                  {form.etapes.split(",").map((s) => s.trim()).filter(Boolean).map((etape, i, arr) => (
                    <React.Fragment key={i}>
                      <Badge variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-300 border-0">
                        {etape}
                      </Badge>
                      {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="text-xs">Annuler</Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5"
              >
                <CheckCircle2 className="h-3 w-3" /> Créer le modèle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
