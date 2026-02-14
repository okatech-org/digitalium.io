// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Organisations
// Grille des organisations avec modules, plans, actions
// + Section Brouillons (drafts localStorage)
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Building2,
    Search,
    Plus,
    MoreHorizontal,
    Users,
    CreditCard,
    FileText,
    Archive,
    PenTool,
    Eye,
    Settings,
    AlertCircle,
    Globe,
    Cloud,
    Server,
    HardDrive,
    Sparkles,
    Clock,
    Trash2,
    ArrowRight,
    Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ─── Draft helpers ──────────────────────────────── */

const DRAFT_PREFIX = "digitalium-org-draft-";
const STEP_LABELS: Record<number, string> = { 1: "Profil", 2: "Modules", 3: "Écosystème", 4: "Personnel", 5: "Dossiers", 6: "Configuration", 7: "Automatisation", 8: "Déploiement" };

interface DraftSummary {
    id: string;
    nom: string;
    step: number;
    visitedSteps: number[];
    updatedAt: number;
}

function getDrafts(): DraftSummary[] {
    if (typeof window === "undefined") return [];
    const drafts: DraftSummary[] = [];
    for (const key of Object.keys(localStorage)) {
        if (!key.startsWith(DRAFT_PREFIX)) continue;
        try {
            const d = JSON.parse(localStorage.getItem(key) || "{}");
            drafts.push({
                id: key.replace(DRAFT_PREFIX, ""),
                nom: d.profil?.nom || "",
                step: d.step || 1,
                visitedSteps: d.visitedSteps || [1],
                updatedAt: d.updatedAt || 0,
            });
        } catch { /* skip corrupt */ }
    }
    return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
}

function formatTimeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
}

/* ─── Types ──────────────────────────────────────── */

type PlanType = "starter" | "pro" | "enterprise" | "institutional";
type HostingType = "Cloud" | "Data Center" | "Local";

interface Organisation {
    id: string;
    nom: string;
    secteur: string;
    plan: PlanType;
    membres: number;
    documents: number;
    archives: number;
    signatures: number;
    dateCreation: string;
    actif: boolean;
    ville: string;
    modules: string[];
    hebergement: HostingType;
}

/* ─── Config ─────────────────────────────────────── */

const PLAN_CONFIG: Record<PlanType, { label: string; color: string; bg: string }> = {
    starter: { label: "Starter", color: "text-gray-400", bg: "bg-gray-500/15" },
    pro: { label: "Pro", color: "text-blue-400", bg: "bg-blue-500/15" },
    enterprise: { label: "Enterprise", color: "text-violet-400", bg: "bg-violet-500/15" },
    institutional: { label: "Institutionnel", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

const MODULE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    idocument: { label: "iDocument", color: "text-blue-300", bg: "bg-blue-500/15" },
    iarchive: { label: "iArchive", color: "text-amber-300", bg: "bg-amber-500/15" },
    isignature: { label: "iSignature", color: "text-violet-300", bg: "bg-violet-500/15" },
};

const HOSTING_ICON: Record<HostingType, React.ElementType> = {
    Cloud: Cloud,
    "Data Center": HardDrive,
    Local: Server,
};

/* ─── Mock Data ──────────────────────────────────── */

const ORGANISATIONS: Organisation[] = [
    { id: "ORG001", nom: "SEEG", secteur: "Énergie & Eau", plan: "enterprise", membres: 45, documents: 1240, archives: 560, signatures: 89, dateCreation: "2025-06-15", actif: true, ville: "Libreville", modules: ["idocument", "iarchive", "isignature"], hebergement: "Data Center" },
    { id: "ORG002", nom: "BGFI Bank", secteur: "Banque", plan: "enterprise", membres: 128, documents: 3450, archives: 1800, signatures: 412, dateCreation: "2025-05-20", actif: true, ville: "Libreville", modules: ["idocument", "iarchive", "isignature"], hebergement: "Cloud" },
    { id: "ORG003", nom: "CNAMGS", secteur: "Santé publique", plan: "institutional", membres: 67, documents: 890, archives: 420, signatures: 156, dateCreation: "2025-07-10", actif: true, ville: "Libreville", modules: ["idocument", "iarchive", "isignature"], hebergement: "Data Center" },
    { id: "ORG004", nom: "ASCOMA Gabon", secteur: "Assurance", plan: "pro", membres: 23, documents: 345, archives: 120, signatures: 67, dateCreation: "2025-09-05", actif: true, ville: "Libreville", modules: ["idocument", "isignature"], hebergement: "Cloud" },
    { id: "ORG005", nom: "Gabon Oil Company", secteur: "Pétrole", plan: "enterprise", membres: 56, documents: 2100, archives: 980, signatures: 234, dateCreation: "2025-08-22", actif: true, ville: "Port-Gentil", modules: ["idocument", "iarchive", "isignature"], hebergement: "Cloud" },
    { id: "ORG006", nom: "Min. Santé", secteur: "Gouvernement", plan: "institutional", membres: 34, documents: 780, archives: 340, signatures: 45, dateCreation: "2025-10-01", actif: true, ville: "Libreville", modules: ["idocument", "iarchive"], hebergement: "Local" },
    { id: "ORG007", nom: "ANPI-Gabon", secteur: "Agence publique", plan: "starter", membres: 8, documents: 120, archives: 45, signatures: 12, dateCreation: "2025-12-10", actif: false, ville: "Libreville", modules: ["idocument"], hebergement: "Cloud" },
    { id: "ORG008", nom: "Owendo Terminal", secteur: "Transport", plan: "pro", membres: 18, documents: 560, archives: 230, signatures: 78, dateCreation: "2025-11-15", actif: true, ville: "Owendo", modules: ["idocument", "iarchive"], hebergement: "Cloud" },
];

const TOTAL_MODULES = ORGANISATIONS.reduce((s, o) => s + o.modules.length, 0);

const KPIS = [
    { label: "Organisations", value: "156", icon: Building2, color: "from-blue-600 to-violet-500" },
    { label: "Membres totaux", value: "2 847", icon: Users, color: "from-blue-600 to-cyan-500" },
    { label: "Modules actifs", value: TOTAL_MODULES.toString(), icon: Sparkles, color: "from-violet-600 to-purple-500" },
    { label: "Docs ce mois", value: "12.4k", icon: FileText, color: "from-emerald-600 to-green-500" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ═══════════════════════════════════════════════
   ORGANISATIONS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminOrganizationsPage() {
    const [search, setSearch] = useState("");
    const [drafts, setDrafts] = useState<DraftSummary[]>([]);
    const router = useRouter();

    useEffect(() => {
        setDrafts(getDrafts());
    }, []);

    const deleteDraft = (draftId: string) => {
        localStorage.removeItem(DRAFT_PREFIX + draftId);
        setDrafts(getDrafts());
        toast.info("Brouillon supprimé");
    };

    const filteredOrgs = ORGANISATIONS.filter((org) =>
        org.nom.toLowerCase().includes(search.toLowerCase()) ||
        org.secteur.toLowerCase().includes(search.toLowerCase()) ||
        org.ville.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        Organisations
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {ORGANISATIONS.length} organisations enregistrées
                    </p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8 hidden sm:flex">
                        <Plus className="h-3.5 w-3.5" /> Nouvelle Organisation
                    </Button>
                </Link>
            </motion.div>

            {/* Drafts Section */}
            {drafts.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2">
                    <h2 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Brouillons ({drafts.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {drafts.map((draft) => {
                            const progress = Math.round((draft.visitedSteps.length / 8) * 100);
                            return (
                                <div key={draft.id} className="glass-card rounded-xl p-4 border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-semibold">{draft.nom || "Sans nom"}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" /> {formatTimeAgo(draft.updatedAt)} · Étape {draft.step} — {STEP_LABELS[draft.step] || "?"}
                                            </p>
                                        </div>
                                        <Badge className="text-[8px] bg-amber-500/10 text-amber-400 border-amber-500/20">{progress}%</Badge>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-1 rounded-full bg-white/5 mb-3">
                                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-violet-500 text-white text-[10px] h-7 gap-1" onClick={() => router.push(`/admin/organizations/new?draft=${draft.id}`)}>
                                            <ArrowRight className="h-3 w-3" /> Reprendre
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-[10px] h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1" onClick={() => deleteDraft(draft.id)}>
                                            <Trash2 className="h-3 w-3" /> Supprimer
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-2`}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeUp}>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une organisation…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
            </motion.div>

            {/* Organisations Grid */}
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrgs.map((org) => {
                    const planCfg = PLAN_CONFIG[org.plan];
                    const HostIcon = HOSTING_ICON[org.hebergement];
                    return (
                        <motion.div
                            key={org.id}
                            variants={fadeUp}
                            className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/organizations/${org.id}`)}
                        >
                            {/* Top gradient bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${org.plan === "enterprise" ? "from-violet-500 to-purple-500" :
                                org.plan === "institutional" ? "from-emerald-500 to-green-500" :
                                    org.plan === "pro" ? "from-blue-500 to-cyan-500" :
                                        "from-gray-500 to-gray-400"
                                }`} />

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm group-hover:text-blue-300 transition-colors">{org.nom}</h3>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Globe className="h-3 w-3" /> {org.secteur} · {org.ville}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/organizations/${org.id}`); }} className="text-xs gap-2">
                                            <Eye className="h-3.5 w-3.5" /> Voir détails
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-xs gap-2">
                                            <Settings className="h-3.5 w-3.5" /> Modifier plan
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-xs gap-2">
                                            <Users className="h-3.5 w-3.5" /> Gérer membres
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Plan + Status + Hosting */}
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className={`text-[9px] ${planCfg.bg} ${planCfg.color} border-0`}>
                                    {planCfg.label}
                                </Badge>
                                <Badge variant="secondary" className={`text-[9px] border-0 ${org.actif ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                    {org.actif ? "Actif" : "Inactif"}
                                </Badge>
                                <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-zinc-400 gap-1">
                                    <HostIcon className="h-2.5 w-2.5" />
                                    {org.hebergement}
                                </Badge>
                            </div>

                            {/* Module badges */}
                            <div className="flex items-center gap-1.5 mb-4">
                                {org.modules.map((mod) => {
                                    const cfg = MODULE_CONFIG[mod];
                                    return cfg ? (
                                        <Badge key={mod} variant="secondary" className={`text-[8px] ${cfg.bg} ${cfg.color} border-0 px-1.5`}>
                                            {cfg.label}
                                        </Badge>
                                    ) : null;
                                })}
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <Users className="h-3.5 w-3.5 mx-auto text-blue-400 mb-1" />
                                    <p className="text-sm font-bold">{org.membres}</p>
                                    <p className="text-[8px] text-muted-foreground">Membres</p>
                                </div>
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <FileText className="h-3.5 w-3.5 mx-auto text-cyan-400 mb-1" />
                                    <p className="text-sm font-bold">{org.documents > 999 ? `${(org.documents / 1000).toFixed(1)}k` : org.documents}</p>
                                    <p className="text-[8px] text-muted-foreground">Docs</p>
                                </div>
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <Archive className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                                    <p className="text-sm font-bold">{org.archives}</p>
                                    <p className="text-[8px] text-muted-foreground">Archives</p>
                                </div>
                                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                    <PenTool className="h-3.5 w-3.5 mx-auto text-violet-400 mb-1" />
                                    <p className="text-sm font-bold">{org.signatures}</p>
                                    <p className="text-[8px] text-muted-foreground">Signatures</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {filteredOrgs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Aucune organisation trouvée</p>
                </div>
            )}
        </motion.div>
    );
}
