// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Leads (Prospects)
// Pipeline commercial avec KPIs et gestion
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    Search,
    Plus,
    TrendingUp,
    DollarSign,
    Users,
    Zap,
    MoreHorizontal,
    ArrowRight,
    Mail,
    Phone,
    Building2,
    Globe,
    Linkedin,
    CalendarDays,
    X,
    Send,
    Eye,
    ThumbsUp,
    FileText,
    Handshake,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

/* ─── Status pipeline config ───────────────────── */

type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "converted"
    | "lost";

const STATUS_PIPELINE: {
    key: LeadStatus;
    label: string;
    color: string;
    dotColor: string;
    icon: React.ElementType;
}[] = [
        { key: "new", label: "Nouveau", color: "bg-blue-500/15 text-blue-400 border-blue-500/20", dotColor: "bg-blue-400", icon: Zap },
        { key: "contacted", label: "Contacté", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20", dotColor: "bg-cyan-400", icon: Send },
        { key: "qualified", label: "Qualifié", color: "bg-violet-500/15 text-violet-400 border-violet-500/20", dotColor: "bg-violet-400", icon: ThumbsUp },
        { key: "proposal", label: "Proposition", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", dotColor: "bg-amber-400", icon: FileText },
        { key: "negotiation", label: "Négociation", color: "bg-orange-500/15 text-orange-400 border-orange-500/20", dotColor: "bg-orange-400", icon: Handshake },
        { key: "converted", label: "Converti", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dotColor: "bg-emerald-400", icon: CheckCircle2 },
        { key: "lost", label: "Perdu", color: "bg-red-500/15 text-red-400 border-red-500/20", dotColor: "bg-red-400", icon: XCircle },
    ];

const statusMap = Object.fromEntries(STATUS_PIPELINE.map((s) => [s.key, s]));

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    website: { label: "Site web", icon: Globe, color: "text-blue-400" },
    referral: { label: "Recommandation", icon: Users, color: "text-violet-400" },
    event: { label: "Événement", icon: CalendarDays, color: "text-amber-400" },
    linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-cyan-400" },
    salon: { label: "Salon", icon: Building2, color: "text-emerald-400" },
    other: { label: "Autre", icon: Target, color: "text-zinc-400" },
};

/* ─── Format XAF ───────────────────────────────── */

function formatXAF(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toLocaleString("fr-FR");
}

function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
    return `Il y a ${Math.floor(days / 30)} mois`;
}

/* ─── Animation ────────────────────────────────── */

const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
};

/* ═══════════════════════════════════════════════
   LEADS PAGE
   ═══════════════════════════════════════════════ */

export default function LeadsPage() {
    const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    // ── Convex data ────────────────────────────
    const leads = useQuery(api.leads.list, {
        status: statusFilter === "all" ? undefined : statusFilter,
    });
    const stats = useQuery(api.leads.getStats);
    const updateStatus = useMutation(api.leads.updateStatus);
    const createLead = useMutation(api.leads.create);

    // ── Filter by search ───────────────────────
    const filtered = useMemo(() => {
        if (!leads) return [];
        if (!search.trim()) return leads;
        const q = search.toLowerCase();
        return leads.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                (l.company && l.company.toLowerCase().includes(q)) ||
                l.email.toLowerCase().includes(q)
        );
    }, [leads, search]);

    const isLoading = leads === undefined || stats === undefined;

    // ── KPIs ──────────────────────────────────
    const kpis = [
        {
            label: "Total Leads",
            value: stats?.total ?? 0,
            icon: Target,
            gradient: "from-violet-600 to-indigo-500",
            sub: `${stats?.byStatus?.new ?? 0} nouveaux`,
        },
        {
            label: "Pipeline",
            value: stats ? `${formatXAF(stats.totalValue)} XAF` : "—",
            icon: DollarSign,
            gradient: "from-emerald-600 to-teal-500",
            sub: "Valeur totale",
        },
        {
            label: "Taux Conversion",
            value: stats ? `${stats.conversionRate}%` : "—",
            icon: TrendingUp,
            gradient: "from-amber-600 to-orange-500",
            sub: `${stats?.byStatus?.converted ?? 0} convertis`,
        },
        {
            label: "En Négociation",
            value: stats?.negotiationCount ?? 0,
            icon: Handshake,
            gradient: "from-cyan-600 to-blue-500",
            sub: "Proposition + Négo",
        },
    ];

    // ── Create handler ────────────────────────
    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        await createLead({
            name: form.get("name") as string,
            email: form.get("email") as string,
            phone: (form.get("phone") as string) || undefined,
            company: (form.get("company") as string) || undefined,
            sector: (form.get("sector") as string) || undefined,
            source: (form.get("source") as "website" | "referral" | "event" | "linkedin" | "salon" | "other") || "other",
            value: form.get("value") ? Number(form.get("value")) : undefined,
        });
        setShowCreate(false);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ── Header ──────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Leads & Prospects</h1>
                        <p className="text-xs text-muted-foreground">
                            Suivez votre pipeline commercial et convertissez vos prospects.
                        </p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className="text-xs bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
                    onClick={() => setShowCreate(true)}
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Nouveau Lead
                </Button>
            </motion.div>

            {/* ── KPI Cards ───────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} custom={i} initial="hidden" animate="visible" variants={fadeIn}>
                        <Card className="glass border-white/5 hover:border-white/10 transition-all duration-300">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                                        <kpi.icon className="h-4.5 w-4.5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold tracking-tight">
                                    {isLoading ? "—" : kpi.value}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">{kpi.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ── Status Filter Pills ─────────────── */}
            <Card className="glass border-white/5">
                <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === "all"
                                    ? "bg-violet-600 text-white shadow-md"
                                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8"
                                    }`}
                            >
                                Tous {!isLoading && <span className="ml-1 opacity-60">{stats?.total}</span>}
                            </button>
                            {STATUS_PIPELINE.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setStatusFilter(s.key)}
                                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${statusFilter === s.key
                                        ? "bg-violet-600 text-white shadow-md"
                                        : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8"
                                        }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${s.dotColor}`} />
                                    {s.label}
                                    {!isLoading && (
                                        <span className="opacity-50">{stats?.byStatus?.[s.key] ?? 0}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un lead…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-amber-500/30"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Leads Table ─────────────────────── */}
            <Card className="glass border-white/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isLoading
                            ? "Chargement…"
                            : `${filtered.length} lead${filtered.length > 1 ? "s" : ""}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_120px_100px_100px_90px_50px] gap-2 px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        <span>Lead</span>
                        <span>Source</span>
                        <span>Statut</span>
                        <span>Valeur</span>
                        <span>Contact</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/3">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[1fr_120px_100px_100px_90px_50px] gap-2 px-4 py-3 animate-pulse"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/5" />
                                        <div className="h-3 w-28 rounded bg-white/5" />
                                    </div>
                                    <div className="h-3 w-16 rounded bg-white/5 self-center" />
                                    <div className="h-5 w-16 rounded-full bg-white/5 self-center" />
                                    <div className="h-3 w-12 rounded bg-white/5 self-center" />
                                    <div className="h-3 w-14 rounded bg-white/5 self-center" />
                                    <div />
                                </div>
                            ))
                            : filtered.map((lead, i) => {
                                const sc = statusMap[lead.status];
                                const src = SOURCE_CONFIG[lead.source] ?? SOURCE_CONFIG.other;
                                return (
                                    <motion.div
                                        key={lead._id}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn}
                                        className="grid grid-cols-[1fr_120px_100px_100px_90px_50px] gap-2 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        {/* Name + Company */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600/20 to-orange-500/20 flex items-center justify-center shrink-0 border border-white/5">
                                                <Target className="h-4 w-4 text-amber-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate group-hover:text-amber-300 transition-colors">
                                                    {lead.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 truncate">
                                                    {lead.company ?? lead.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Source */}
                                        <div className="flex items-center gap-1.5">
                                            <src.icon className={`h-3 w-3 ${src.color}`} />
                                            <span className="text-xs text-muted-foreground truncate">
                                                {src.label}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center">
                                            <Badge variant="outline" className={`text-[10px] h-5 border ${sc?.color}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${sc?.dotColor} mr-1`} />
                                                {sc?.label}
                                            </Badge>
                                        </div>

                                        {/* Value */}
                                        <div className="flex items-center">
                                            <span className="text-xs font-medium text-emerald-400">
                                                {lead.value ? `${formatXAF(lead.value)} XAF` : "—"}
                                            </span>
                                        </div>

                                        {/* Last contact */}
                                        <div className="flex items-center">
                                            <span className="text-[10px] text-muted-foreground">
                                                {lead.lastContactedAt ? timeAgo(lead.lastContactedAt) : "—"}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10">
                                                    {STATUS_PIPELINE.filter(
                                                        (s) => s.key !== lead.status
                                                    ).map((s) => (
                                                        <DropdownMenuItem
                                                            key={s.key}
                                                            onClick={() =>
                                                                updateStatus({
                                                                    id: lead._id as Id<"leads">,
                                                                    status: s.key,
                                                                })
                                                            }
                                                            className="text-xs"
                                                        >
                                                            <ArrowRight className="h-3 w-3 mr-2" />
                                                            → {s.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>
                                );
                            })}

                        {!isLoading && filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Target className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucun lead trouvé</p>
                                <p className="text-xs mt-1 opacity-60">
                                    {search ? "Essayez une autre recherche" : "Cliquez sur \"Nouveau Lead\" pour commencer"}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Create Lead Dialog ──────────────── */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base">Nouveau Lead</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Ajoutez un nouveau prospect au pipeline.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Nom *</Label>
                                <Input name="name" required className="h-8 text-xs bg-white/5 border-white/10" placeholder="Nom ou entreprise" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Email *</Label>
                                <Input name="email" type="email" required className="h-8 text-xs bg-white/5 border-white/10" placeholder="contact@..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Téléphone</Label>
                                <Input name="phone" className="h-8 text-xs bg-white/5 border-white/10" placeholder="+241..." />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Entreprise</Label>
                                <Input name="company" className="h-8 text-xs bg-white/5 border-white/10" placeholder="Nom entreprise" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Secteur</Label>
                                <Input name="sector" className="h-8 text-xs bg-white/5 border-white/10" placeholder="Ex: Gouvernement" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Source</Label>
                                <select
                                    name="source"
                                    defaultValue="website"
                                    className="h-8 w-full text-xs bg-white/5 border border-white/10 rounded-md px-2 text-foreground"
                                >
                                    <option value="website">Site web</option>
                                    <option value="referral">Recommandation</option>
                                    <option value="event">Événement</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="salon">Salon</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Valeur estimée (XAF)</Label>
                            <Input name="value" type="number" className="h-8 text-xs bg-white/5 border-white/10" placeholder="Ex: 5000000" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" size="sm" className="text-xs flex-1 border-white/10" onClick={() => setShowCreate(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" size="sm" className="text-xs flex-1 bg-gradient-to-r from-amber-600 to-orange-500">
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Créer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
