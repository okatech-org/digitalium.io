// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Leads
// Pipeline commercial avec KPIs, recherche,
// filtres statut, cards contact, actions CTA
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Flame,
    TrendingUp,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Phone,
    Mail,
    UserPlus,
    ArrowRightCircle,
    Thermometer,
    Building2,
    Calendar,
    DollarSign,
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

type LeadTemp = "hot" | "warm" | "cold";
type LeadSource = "Site web" | "Salon" | "Partenaire" | "Recommandation" | "Appel entrant";

interface LeadData {
    id: string;
    company: string;
    contact: string;
    email: string;
    phone: string;
    temp: LeadTemp;
    source: LeadSource;
    value: string;
    created: string;
    lastContact: string;
    notes: string;
}

const TEMP_CFG: Record<LeadTemp, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    hot: { label: "Chaud", color: "text-red-400", bg: "bg-red-500/15", icon: Flame },
    warm: { label: "Tiède", color: "text-amber-400", bg: "bg-amber-500/15", icon: Thermometer },
    cold: { label: "Froid", color: "text-blue-400", bg: "bg-blue-500/15", icon: Target },
};

/* ─── Mock Data ──────────────────────────────────── */

const LEADS: LeadData[] = [
    { id: "L001", company: "Comilog", contact: "Henri Bongo", email: "h.bongo@comilog.ga", phone: "+241 01 76 XX XX", temp: "hot", source: "Salon", value: "12M XAF", created: "5 fév 2026", lastContact: "Hier", notes: "Intéressé par le module iGOP" },
    { id: "L002", company: "Setrag", contact: "Marie Ndong", email: "m.ndong@setrag.ga", phone: "+241 07 45 XX XX", temp: "hot", source: "Recommandation", value: "8M XAF", created: "3 fév 2026", lastContact: "Il y a 2j", notes: "Demo planifiée jeudi" },
    { id: "L003", company: "Air Service Gabon", contact: "Paul Ondo", email: "p.ondo@airservice.ga", phone: "+241 06 89 XX XX", temp: "warm", source: "Site web", value: "5M XAF", created: "28 jan 2026", lastContact: "Il y a 4j", notes: "En attente de devis" },
    { id: "L004", company: "Olam Gabon", contact: "Sophie Mba", email: "s.mba@olam.ga", phone: "+241 04 32 XX XX", temp: "warm", source: "Partenaire", value: "15M XAF", created: "20 jan 2026", lastContact: "Il y a 1 sem", notes: "Budget validé Q2" },
    { id: "L005", company: "Maurel & Prom", contact: "Jean Ekang", email: "j.ekang@maurelprom.ga", phone: "+241 07 11 XX XX", temp: "cold", source: "Appel entrant", value: "3M XAF", created: "15 jan 2026", lastContact: "Il y a 2 sem", notes: "Premier contact" },
    { id: "L006", company: "Perenco Oil", contact: "Ana Mounguengui", email: "a.moung@perenco.ga", phone: "+241 06 55 XX XX", temp: "warm", source: "Salon", value: "20M XAF", created: "10 fév 2026", lastContact: "Aujourd'hui", notes: "Très intéressé, meeting CEO" },
    { id: "L007", company: "Eramet Comilog", contact: "Yves Ntoutoume", email: "y.ntoutoume@eramet.ga", phone: "+241 01 98 XX XX", temp: "cold", source: "Site web", value: "2M XAF", created: "1 fév 2026", lastContact: "Il y a 10j", notes: "Relance planifiée" },
];

/* ═══════════════════════════════════════════════
   LEADS PAGE
   ═══════════════════════════════════════════════ */

export default function LeadsPage() {
    const [search, setSearch] = useState("");
    const [tempFilter, setTempFilter] = useState<LeadTemp | "all">("all");

    const filtered = useMemo(() => {
        return LEADS.filter((l) => {
            if (tempFilter !== "all" && l.temp !== tempFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return l.company.toLowerCase().includes(q) || l.contact.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
            }
            return true;
        });
    }, [search, tempFilter]);

    const handleAction = useCallback((action: string, lead: LeadData) => {
        switch (action) {
            case "view":
                toast.success(`Ouverture du dossier ${lead.company}`);
                break;
            case "call":
                toast.success(`Appel ${lead.phone} — ${lead.contact}`);
                break;
            case "email":
                toast.success(`Email envoyé à ${lead.email}`);
                break;
            case "qualify":
                toast.success(`${lead.company} qualifié comme lead chaud`);
                break;
            case "convert":
                toast.success(`${lead.company} converti en client !`);
                break;
        }
    }, []);

    const handleAddLead = useCallback(() => {
        toast.success("Formulaire de création lead ouvert");
    }, []);

    const hotCount = LEADS.filter((l) => l.temp === "hot").length;
    const totalValue = LEADS.reduce((acc, l) => acc + parseInt(l.value), 0);

    const KPIS = [
        { label: "Total leads", value: LEADS.length, icon: Target, color: "from-blue-600 to-cyan-500" },
        { label: "Leads chauds", value: hotCount, icon: Flame, color: "from-red-600 to-orange-500" },
        { label: "Valeur pipeline", value: `${totalValue}M`, icon: DollarSign, color: "from-emerald-600 to-green-500" },
        { label: "Taux conversion", value: "23%", icon: TrendingUp, color: "from-violet-600 to-purple-500" },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-sm text-muted-foreground mt-1">Pipeline commercial et prospection</p>
                </div>
                <Button onClick={handleAddLead} className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                    <UserPlus className="h-3.5 w-3.5" />
                    Nouveau lead
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
                    <Input placeholder="Rechercher entreprise, contact…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5">
                            <Filter className="h-3 w-3" />
                            {tempFilter === "all" ? "Tous les statuts" : TEMP_CFG[tempFilter].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setTempFilter("all")} className="text-xs">Tous les statuts</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.entries(TEMP_CFG) as [LeadTemp, typeof TEMP_CFG[LeadTemp]][]).map(([key, cfg]) => {
                            const TIcon = cfg.icon;
                            return (
                                <DropdownMenuItem key={key} onClick={() => setTempFilter(key)} className="text-xs gap-2">
                                    <TIcon className={`h-3 w-3 ${cfg.color}`} /> {cfg.label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} lead{filtered.length > 1 ? "s" : ""}</span>
            </motion.div>

            {/* Lead Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((lead) => {
                    const temp = TEMP_CFG[lead.temp];
                    const TIcon = temp.icon;
                    return (
                        <motion.div key={lead.id} variants={fadeUp} className="glass-card rounded-xl p-5 space-y-3 relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${lead.temp === "hot" ? "from-red-600 to-orange-500" : lead.temp === "warm" ? "from-amber-500 to-yellow-400" : "from-blue-600 to-cyan-500"}`} />

                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-orange-400" />
                                    <span className="font-semibold text-sm">{lead.company}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={`text-[9px] border-0 gap-1 ${temp.bg} ${temp.color}`}>
                                        <TIcon className="h-2.5 w-2.5" /> {temp.label}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => handleAction("view", lead)} className="text-xs gap-2 cursor-pointer">
                                                <Eye className="h-3.5 w-3.5" /> Voir le dossier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction("call", lead)} className="text-xs gap-2 cursor-pointer">
                                                <Phone className="h-3.5 w-3.5" /> Appeler
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction("email", lead)} className="text-xs gap-2 cursor-pointer">
                                                <Mail className="h-3.5 w-3.5" /> Envoyer email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction("qualify", lead)} className="text-xs gap-2 cursor-pointer text-amber-400">
                                                <Flame className="h-3.5 w-3.5" /> Qualifier (chaud)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction("convert", lead)} className="text-xs gap-2 cursor-pointer text-emerald-400">
                                                <ArrowRightCircle className="h-3.5 w-3.5" /> Convertir en client
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <UserPlus className="h-3 w-3" /> <span>{lead.contact}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <DollarSign className="h-3 w-3" /> <span className="font-mono text-foreground">{lead.value}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Mail className="h-3 w-3" /> <span className="truncate">{lead.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="h-3 w-3" /> <span>{lead.lastContact}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground italic">{lead.notes}</p>
                                <span className="text-[10px] text-muted-foreground/70">{lead.source}</span>
                            </div>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full glass-card rounded-xl p-12 text-center text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Aucun lead trouvé</p>
                        <p className="text-[11px] mt-1">Modifiez vos filtres ou votre recherche</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
