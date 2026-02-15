// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Leads & Contacts
// Pipeline commercial : tableau de leads avec
// filtres, actions qualifier/convertir, KPIs
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
    Target,
    Search,
    Plus,
    ArrowUpRight,
    Phone,
    Mail,
    Building2,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Users,
    XCircle,
    Loader2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/* ─── Status config (display layer) ─────────────── */

type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "converted" | "lost";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    new: { label: "Nouveau", color: "text-blue-400", bg: "bg-blue-500/15", icon: Plus },
    contacted: { label: "Contacté", color: "text-sky-400", bg: "bg-sky-500/15", icon: Phone },
    qualified: { label: "Qualifié", color: "text-cyan-400", bg: "bg-cyan-500/15", icon: CheckCircle2 },
    proposal: { label: "Proposition", color: "text-amber-400", bg: "bg-amber-500/15", icon: Mail },
    negotiation: { label: "Négociation", color: "text-orange-400", bg: "bg-orange-500/15", icon: Clock },
    converted: { label: "Converti", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    lost: { label: "Perdu", color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

const SOURCE_MAP: Record<string, string> = {
    website: "Site web",
    referral: "Recommandation",
    event: "Événement",
    linkedin: "LinkedIn",
    salon: "Salon",
    other: "Autre",
};

const SOURCE_REVERSE: Record<string, string> = {
    "Site web": "website",
    "Recommandation": "referral",
    "Événement": "event",
    "LinkedIn": "linkedin",
    "Salon": "salon",
    "Autre": "other",
};

const SOURCES = Object.keys(SOURCE_REVERSE);

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── New Lead Form defaults ─────────────────────── */

const EMPTY_LEAD_FORM = { nom: "", organisation: "", email: "", telephone: "", source: "Site web", valeur: "" };

/* ─── Time ago helper ────────────────────────────── */

function timeAgo(ts?: number): string {
    if (!ts) return "—";
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Maintenant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hier";
    return `Il y a ${days}j`;
}

/* ═══════════════════════════════════════════════
   LEADS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminLeadsPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");

    // Dialog state
    const [showNewLead, setShowNewLead] = useState(false);
    const [newLeadForm, setNewLeadForm] = useState(EMPTY_LEAD_FORM);
    const [isCreating, setIsCreating] = useState(false);

    // ─── Convex queries ────────────────────────
    const leads = useQuery(api.leads.list, filterStatus === "all" ? {} : { status: filterStatus });
    const stats = useQuery(api.leads.getStats);

    // ─── Convex mutations ──────────────────────
    const createLead = useMutation(api.leads.create);
    const updateLeadStatus = useMutation(api.leads.updateStatus);

    // ─── Derived data ──────────────────────────
    const filteredLeads = (leads ?? []).filter((lead) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            lead.name.toLowerCase().includes(q) ||
            (lead.company ?? "").toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q)
        );
    });

    const isLoading = leads === undefined;

    // ─── KPI data from stats ───────────────────
    const kpiData = [
        {
            label: "Total Leads",
            value: stats?.total ?? "—",
            trend: stats ? `+${stats.byStatus["new"] ?? 0}` : "",
            icon: Target,
            color: "from-blue-600 to-cyan-500",
        },
        {
            label: "Taux conversion",
            value: stats ? `${stats.conversionRate}%` : "—",
            trend: "",
            icon: TrendingUp,
            color: "from-emerald-600 to-green-500",
        },
        {
            label: "En négociation",
            value: stats?.negotiationCount ?? "—",
            trend: "",
            icon: Clock,
            color: "from-amber-600 to-orange-500",
        },
        {
            label: "Valeur pipeline",
            value: stats ? `${(stats.totalValue / 1000000).toFixed(1)}M` : "—",
            trend: "",
            icon: Building2,
            color: "from-violet-600 to-purple-500",
        },
    ];

    // ─── Handlers ──────────────────────────────
    const handleAction = useCallback(
        async (action: string, lead: { _id: Id<"leads">; name: string; email: string; phone?: string }) => {
            switch (action) {
                case "view":
                    toast.info(`Détail — ${lead.name}`, {
                        description: lead.email,
                    });
                    break;
                case "qualify":
                    try {
                        await updateLeadStatus({ id: lead._id, status: "qualified" });
                        toast.success(`${lead.name} qualifié`, {
                            description: "Le statut du lead a été mis à jour",
                        });
                    } catch {
                        toast.error("Erreur lors de la qualification");
                    }
                    break;
                case "call":
                    if (lead.phone) window.open(`tel:${lead.phone}`);
                    toast.info(`Appel vers ${lead.phone ?? "—"}`);
                    break;
                case "email":
                    window.open(`mailto:${lead.email}`);
                    toast.info(`Email vers ${lead.email}`);
                    break;
                case "convert":
                    try {
                        await updateLeadStatus({ id: lead._id, status: "converted" });
                        toast.success(`${lead.name} converti en client`, {
                            description: "Le lead a été ajouté aux clients",
                        });
                    } catch {
                        toast.error("Erreur lors de la conversion");
                    }
                    break;
                case "lost":
                    try {
                        await updateLeadStatus({ id: lead._id, status: "lost" });
                        toast.warning(`${lead.name} marqué comme perdu`);
                    } catch {
                        toast.error("Erreur lors du changement de statut");
                    }
                    break;
            }
        },
        [updateLeadStatus]
    );

    const handleCreateLead = useCallback(async () => {
        if (!newLeadForm.nom || !newLeadForm.email) {
            toast.error("Champs requis", { description: "Nom et email sont obligatoires" });
            return;
        }
        setIsCreating(true);
        try {
            await createLead({
                name: newLeadForm.nom,
                email: newLeadForm.email,
                phone: newLeadForm.telephone || undefined,
                company: newLeadForm.organisation || undefined,
                source: (SOURCE_REVERSE[newLeadForm.source] ?? "other") as "website" | "referral" | "event" | "linkedin" | "salon" | "other",
                value: Number(newLeadForm.valeur) || undefined,
            });
            setNewLeadForm(EMPTY_LEAD_FORM);
            setShowNewLead(false);
            toast.success("Lead créé", { description: newLeadForm.nom });
        } catch {
            toast.error("Erreur lors de la création du lead");
        } finally {
            setIsCreating(false);
        }
    }, [newLeadForm, createLead]);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="h-6 w-6 text-red-400" />
                        Leads & Contacts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pipeline commercial — {stats?.total ?? "…"} leads actifs
                    </p>
                </div>
                <Button
                    onClick={() => setShowNewLead(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8 hidden sm:flex"
                >
                    <Plus className="h-3.5 w-3.5" /> Nouveau Lead
                </Button>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {kpiData.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                {kpi.trend && (
                                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">
                                        {kpi.trend}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Search & Filters */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un lead…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => setFilterStatus("all")}
                    >
                        Tous
                    </Button>
                    {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "outline"}
                            size="sm"
                            className={`h-9 text-xs ${filterStatus === status ? "" : `${STATUS_CONFIG[status].color} border-white/10`}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {STATUS_CONFIG[status].label}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Leads Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 font-semibold text-muted-foreground">Lead</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Contact</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Source</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground hidden sm:table-cell">Valeur</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground hidden lg:table-cell">Dernier contact</th>
                                <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                // Loading skeleton rows
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skeleton-${i}`} className="border-b border-white/[0.03]">
                                        <td className="p-4">
                                            <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
                                            <div className="h-3 w-24 bg-white/5 rounded animate-pulse mt-2" />
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" />
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="h-3 w-20 bg-white/5 rounded animate-pulse ml-auto" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-7 w-7 bg-white/5 rounded animate-pulse mx-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredLeads.map((lead, i) => {
                                    const cfg = STATUS_CONFIG[lead.status as LeadStatus];
                                    if (!cfg) return null;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <motion.tr
                                            key={lead._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.04 }}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4">
                                                <p className="font-semibold text-foreground">{lead.name}</p>
                                                <p className="text-muted-foreground mt-0.5">{lead.company ?? "—"}</p>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Mail className="h-3 w-3" /> {lead.email}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {lead.phone ?? "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden lg:table-cell">
                                                <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                                    {SOURCE_MAP[lead.source] ?? lead.source}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {cfg.label}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right hidden sm:table-cell">
                                                {lead.value ? (
                                                    <>
                                                        <span className="font-semibold">{(lead.value / 1000000).toFixed(1)}M</span>
                                                        <span className="text-muted-foreground ml-1">XAF</span>
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right hidden lg:table-cell text-muted-foreground">
                                                {timeAgo(lead.lastContactedAt)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleAction("view", lead)} className="text-xs gap-2">
                                                            <ArrowUpRight className="h-3.5 w-3.5" /> Voir le détail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction("qualify", lead)} className="text-xs gap-2">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Qualifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction("call", lead)} className="text-xs gap-2">
                                                            <Phone className="h-3.5 w-3.5" /> Appeler
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction("email", lead)} className="text-xs gap-2">
                                                            <Mail className="h-3.5 w-3.5" /> Envoyer email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAction("convert", lead)} className="text-xs gap-2 text-emerald-400">
                                                            <Users className="h-3.5 w-3.5" /> Convertir en client
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction("lost", lead)} className="text-xs gap-2 text-red-400">
                                                            <XCircle className="h-3.5 w-3.5" /> Marquer comme perdu
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">Aucun lead trouvé</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Ajustez vos filtres ou créez un nouveau lead</p>
                    </div>
                )}
            </motion.div>

            {/* ── Dialog: Nouveau Lead ── */}
            <Dialog open={showNewLead} onOpenChange={setShowNewLead}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-blue-400" />
                            Nouveau Lead
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Ajouter un nouveau lead au pipeline commercial
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Nom / Organisation *</Label>
                                <Input
                                    value={newLeadForm.nom}
                                    onChange={(e) => setNewLeadForm((p) => ({ ...p, nom: e.target.value }))}
                                    placeholder="Ministère de…"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Secteur</Label>
                                <Input
                                    value={newLeadForm.organisation}
                                    onChange={(e) => setNewLeadForm((p) => ({ ...p, organisation: e.target.value }))}
                                    placeholder="Gouvernement, Privé…"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Email *</Label>
                                <Input
                                    type="email"
                                    value={newLeadForm.email}
                                    onChange={(e) => setNewLeadForm((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="contact@exemple.ga"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Téléphone</Label>
                                <Input
                                    value={newLeadForm.telephone}
                                    onChange={(e) => setNewLeadForm((p) => ({ ...p, telephone: e.target.value }))}
                                    placeholder="+241 01 XX XX XX"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Source</Label>
                                <Select
                                    value={newLeadForm.source}
                                    onValueChange={(v) => setNewLeadForm((p) => ({ ...p, source: v }))}
                                >
                                    <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOURCES.map((s) => (
                                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Valeur estimée (XAF)</Label>
                                <Input
                                    type="number"
                                    value={newLeadForm.valeur}
                                    onChange={(e) => setNewLeadForm((p) => ({ ...p, valeur: e.target.value }))}
                                    placeholder="5 000 000"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowNewLead(false)} className="text-xs">
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateLead}
                                disabled={isCreating}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 text-xs gap-1.5"
                            >
                                {isCreating ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Plus className="h-3 w-3" />
                                )}
                                Créer le lead
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
