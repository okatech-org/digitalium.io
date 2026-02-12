// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Workflow Templates
// Full management with KPIs, search, filters,
// visual step timeline, row actions
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    GitBranch,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Play,
    Pause,
    Copy,
    Trash2,
    Eye,
    CheckCircle2,
    Clock,
    FileEdit,
    ArrowRight,
    Zap,
    Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ─── Types & Config ─────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

type WfStatus = "active" | "draft" | "archived";

interface WorkflowStep {
    name: string;
    icon: React.ElementType;
}

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    status: WfStatus;
    steps: WorkflowStep[];
    executions: number;
    created: string;
    lastRun: string;
    author: string;
}

const STATUS_CFG: Record<WfStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    draft: { label: "Brouillon", color: "text-amber-400", bg: "bg-amber-500/15", icon: FileEdit },
    archived: { label: "Archivé", color: "text-gray-400", bg: "bg-gray-500/15", icon: Clock },
};

/* ─── Mock Data ──────────────────────────────────── */

const TEMPLATES: WorkflowTemplate[] = [
    {
        id: "WF001",
        name: "Onboarding Client",
        description: "Processus d'accueil et configuration d'un nouveau client",
        status: "active",
        steps: [
            { name: "Création compte", icon: Users },
            { name: "Configuration", icon: Zap },
            { name: "Formation", icon: GitBranch },
            { name: "Validation", icon: CheckCircle2 },
        ],
        executions: 147,
        created: "15 jan 2026",
        lastRun: "Il y a 2h",
        author: "Marie Nzé",
    },
    {
        id: "WF002",
        name: "Approbation Document",
        description: "Circuit de validation des documents officiels (draft → review → approved)",
        status: "active",
        steps: [
            { name: "Rédaction", icon: FileEdit },
            { name: "Révision", icon: Eye },
            { name: "Approbation", icon: CheckCircle2 },
        ],
        executions: 892,
        created: "15 jan 2026",
        lastRun: "Il y a 30 min",
        author: "Jean-Pierre Ondo",
    },
    {
        id: "WF003",
        name: "Escalade Incident",
        description: "Processus d'escalade automatique des incidents critiques",
        status: "active",
        steps: [
            { name: "Détection", icon: Zap },
            { name: "Notification", icon: Users },
            { name: "Investigation", icon: Eye },
            { name: "Résolution", icon: CheckCircle2 },
            { name: "Post-mortem", icon: FileEdit },
        ],
        executions: 63,
        created: "20 jan 2026",
        lastRun: "Il y a 1j",
        author: "Alice Bekale",
    },
    {
        id: "WF004",
        name: "Déploiement Infra",
        description: "Pipeline de déploiement infrastructure avec validation multi-étapes",
        status: "draft",
        steps: [
            { name: "Build", icon: Zap },
            { name: "Tests", icon: CheckCircle2 },
            { name: "Staging", icon: GitBranch },
            { name: "Prod", icon: Play },
        ],
        executions: 0,
        created: "5 fév 2026",
        lastRun: "Jamais",
        author: "Marie Nzé",
    },
    {
        id: "WF005",
        name: "Offboarding Utilisateur",
        description: "Processus de désactivation et archivage d'un compte utilisateur",
        status: "active",
        steps: [
            { name: "Notification", icon: Users },
            { name: "Backup données", icon: Copy },
            { name: "Désactivation", icon: Pause },
            { name: "Archivage", icon: Clock },
        ],
        executions: 23,
        created: "28 jan 2026",
        lastRun: "Il y a 3j",
        author: "Alice Bekale",
    },
    {
        id: "WF006",
        name: "Audit Sécurité",
        description: "Checklist automatique d'audit de sécurité mensuel",
        status: "draft",
        steps: [
            { name: "Scan", icon: Zap },
            { name: "Analyse", icon: Eye },
            { name: "Rapport", icon: FileEdit },
        ],
        executions: 0,
        created: "10 fév 2026",
        lastRun: "Jamais",
        author: "Jean-Pierre Ondo",
    },
];

/* ═══════════════════════════════════════════════
   WORKFLOW TEMPLATES PAGE
   ═══════════════════════════════════════════════ */

export default function WorkflowTemplatesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<WfStatus | "all">("all");

    const filtered = useMemo(() => {
        return TEMPLATES.filter((t) => {
            if (statusFilter !== "all" && t.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
            }
            return true;
        });
    }, [search, statusFilter]);

    const handleAction = useCallback((action: string, wf: WorkflowTemplate) => {
        switch (action) {
            case "view":
                toast.success(`Ouverture du workflow « ${wf.name} »`);
                break;
            case "activate":
                toast.success(`${wf.name} activé`);
                break;
            case "deactivate":
                toast.warning(`${wf.name} désactivé`);
                break;
            case "duplicate":
                toast.success(`${wf.name} dupliqué`);
                break;
            case "delete":
                toast.error(`${wf.name} supprimé`);
                break;
        }
    }, []);

    const handleCreate = useCallback(() => {
        toast.success("Éditeur de workflow ouvert");
    }, []);

    const activeCount = TEMPLATES.filter((t) => t.status === "active").length;
    const draftCount = TEMPLATES.filter((t) => t.status === "draft").length;
    const totalExec = TEMPLATES.reduce((a, t) => a + t.executions, 0);

    const KPIS = [
        { label: "Total templates", value: TEMPLATES.length, icon: GitBranch, color: "from-blue-600 to-cyan-500" },
        { label: "Actifs", value: activeCount, icon: CheckCircle2, color: "from-emerald-600 to-green-500" },
        { label: "Brouillons", value: draftCount, icon: FileEdit, color: "from-amber-600 to-yellow-500" },
        { label: "Exécutions totales", value: totalExec.toLocaleString(), icon: Zap, color: "from-violet-600 to-purple-500" },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Workflow Templates</h1>
                    <p className="text-sm text-muted-foreground mt-1">Modèles de processus automatisés</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau template
                </Button>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="glass-card rounded-xl p-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.color}`} />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                                </div>
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center opacity-80`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Search + Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Rechercher un template…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5">
                            <Filter className="h-3 w-3" />
                            {statusFilter === "all" ? "Tous les statuts" : STATUS_CFG[statusFilter].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")} className="text-xs">Tous les statuts</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.entries(STATUS_CFG) as [WfStatus, typeof STATUS_CFG[WfStatus]][]).map(([key, cfg]) => {
                            const SIcon = cfg.icon;
                            return (
                                <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)} className="text-xs gap-2">
                                    <SIcon className={`h-3 w-3 ${cfg.color}`} /> {cfg.label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} template{filtered.length > 1 ? "s" : ""}</span>
            </motion.div>

            {/* Template Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((wf) => {
                    const st = STATUS_CFG[wf.status];
                    const StIcon = st.icon;
                    return (
                        <motion.div key={wf.id} variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${wf.status === "active" ? "from-red-600 to-orange-500" : wf.status === "draft" ? "from-amber-500 to-yellow-400" : "from-gray-500 to-gray-400"}`} />

                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <GitBranch className="h-4 w-4 text-orange-400 shrink-0" />
                                    <span className="font-semibold text-sm truncate">{wf.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="secondary" className={`text-[9px] border-0 gap-1 ${st.bg} ${st.color}`}>
                                        <StIcon className="h-2.5 w-2.5" /> {st.label}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => handleAction("view", wf)} className="text-xs gap-2 cursor-pointer">
                                                <Eye className="h-3.5 w-3.5" /> Voir / Éditer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction("duplicate", wf)} className="text-xs gap-2 cursor-pointer">
                                                <Copy className="h-3.5 w-3.5" /> Dupliquer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {wf.status === "active" ? (
                                                <DropdownMenuItem onClick={() => handleAction("deactivate", wf)} className="text-xs gap-2 cursor-pointer text-amber-400">
                                                    <Pause className="h-3.5 w-3.5" /> Désactiver
                                                </DropdownMenuItem>
                                            ) : wf.status === "draft" ? (
                                                <DropdownMenuItem onClick={() => handleAction("activate", wf)} className="text-xs gap-2 cursor-pointer text-emerald-400">
                                                    <Play className="h-3.5 w-3.5" /> Activer
                                                </DropdownMenuItem>
                                            ) : null}
                                            <DropdownMenuItem onClick={() => handleAction("delete", wf)} className="text-xs gap-2 cursor-pointer text-destructive">
                                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[11px] text-muted-foreground">{wf.description}</p>

                            {/* Steps Timeline */}
                            <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
                                {wf.steps.map((step, i) => {
                                    const SIcon = step.icon;
                                    return (
                                        <React.Fragment key={i}>
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 shrink-0">
                                                <SIcon className="h-3 w-3 text-orange-400" />
                                                <span className="text-[9px] font-medium">{step.name}</span>
                                            </div>
                                            {i < wf.steps.length - 1 && (
                                                <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Footer Meta */}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> {wf.executions} exécutions</span>
                                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {wf.lastRun}</span>
                                </div>
                                <span>{wf.author}</span>
                            </div>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full glass-card rounded-xl p-12 text-center text-muted-foreground">
                        <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Aucun template trouvé</p>
                        <p className="text-[11px] mt-1">Modifiez vos filtres ou votre recherche</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
