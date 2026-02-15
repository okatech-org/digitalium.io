// DIGITALIUM.IO — SubAdmin: Leads Pipeline
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  Search,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Building2,
  ArrowUpRight,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Zap,
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

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────────────── */

type LeadStatus = "nouveau" | "qualifié" | "proposition" | "négociation" | "converti" | "perdu";

interface Lead {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  source: string;
  status: LeadStatus;
  valeur: number;
  derniereInteraction: string;
}

/* ─── Config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  nouveau: { label: "Nouveau", color: "text-blue-400", bg: "bg-blue-500/15", icon: Plus },
  "qualifié": { label: "Qualifié", color: "text-cyan-400", bg: "bg-cyan-500/15", icon: CheckCircle2 },
  proposition: { label: "Proposition", color: "text-amber-400", bg: "bg-amber-500/15", icon: Mail },
  "négociation": { label: "Négociation", color: "text-orange-400", bg: "bg-orange-500/15", icon: Clock },
  converti: { label: "Converti", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
  perdu: { label: "Perdu", color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

const SOURCES = ["Site web", "Recommandation", "Salon", "Appel entrant", "LinkedIn"];
const ALL_STATUSES: (LeadStatus | "tous")[] = ["tous", "nouveau", "qualifié", "proposition", "négociation", "converti", "perdu"];

/* ─── Mock Data ──────────────────────────────────── */

const INITIAL_LEADS: Lead[] = [
  { id: "LD001", nom: "Nguema & Associés", email: "cabinet@nguema-associes.ga", telephone: "+241 01 44 30 00", source: "Site web", status: "nouveau", valeur: 2500000, derniereInteraction: "Il y a 1j" },
  { id: "LD002", nom: "Obame Transport", email: "direction@obame-transport.ga", telephone: "+241 01 72 15 00", source: "Recommandation", status: "qualifié", valeur: 3800000, derniereInteraction: "Il y a 3j" },
  { id: "LD003", nom: "Mboumba Industries", email: "info@mboumba-ind.ga", telephone: "+241 01 55 90 00", source: "Salon", status: "proposition", valeur: 1500000, derniereInteraction: "Hier" },
  { id: "LD004", nom: "Ndong Consulting", email: "contact@ndong-consulting.ga", telephone: "+241 01 76 45 00", source: "LinkedIn", status: "négociation", valeur: 2000000, derniereInteraction: "Il y a 2j" },
  { id: "LD005", nom: "Gondjout Mining", email: "admin@gondjout-mining.ga", telephone: "+241 01 66 88 00", source: "Salon", status: "négociation", valeur: 1200000, derniereInteraction: "Il y a 5j" },
  { id: "LD006", nom: "Société Nguema Bois", email: "commercial@nguema-bois.ga", telephone: "+241 01 60 22 00", source: "Appel entrant", status: "converti", valeur: 900000, derniereInteraction: "Il y a 10j" },
  { id: "LD007", nom: "Obame Sécurité", email: "dg@obame-securite.ga", telephone: "+241 01 79 33 00", source: "Recommandation", status: "perdu", valeur: 600000, derniereInteraction: "Il y a 20j" },
];

const EMPTY_LEAD = { nom: "", secteur: "", email: "", telephone: "", source: "Site web", valeur: "" };

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function SubAdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "tous">("tous");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_LEAD);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        search === "" ||
        lead.nom.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "tous" || lead.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  const stats = useMemo(() => {
    const convertis = leads.filter((l) => l.status === "converti").length;
    const total = leads.length;
    const enNego = leads.filter((l) => l.status === "négociation").length;
    const pipeline = leads
      .filter((l) => l.status !== "converti" && l.status !== "perdu")
      .reduce((sum, l) => sum + l.valeur, 0);
    return {
      total,
      tauxConversion: total > 0 ? Math.round((convertis / total) * 100) : 0,
      enNego,
      pipeline,
    };
  }, [leads]);

  const handleCreate = useCallback(() => {
    if (!form.nom || !form.email) {
      toast.error("Champs requis", { description: "Le nom et l'email sont obligatoires" });
      return;
    }
    const newLead: Lead = {
      id: `LD${String(leads.length + 1).padStart(3, "0")}`,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      source: form.source,
      status: "nouveau",
      valeur: Number(form.valeur) || 0,
      derniereInteraction: "Maintenant",
    };
    setLeads((prev) => [newLead, ...prev]);
    setForm(EMPTY_LEAD);
    setShowCreate(false);
    toast.success("Lead créé", { description: newLead.nom });
  }, [form, leads.length]);

  const handleAction = useCallback((action: string, lead: Lead) => {
    switch (action) {
      case "view":
        toast.info(`Détail — ${lead.nom}`, { description: `${lead.email} · ${lead.telephone}` });
        break;
      case "qualify":
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: "qualifié" as LeadStatus } : l))
        );
        toast.success(`${lead.nom} qualifié`, { description: "Statut mis à jour" });
        break;
      case "call":
        window.open(`tel:${lead.telephone}`);
        toast.info(`Appel vers ${lead.telephone}`);
        break;
      case "email":
        window.open(`mailto:${lead.email}`);
        toast.info(`Email vers ${lead.email}`);
        break;
      case "convert":
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: "converti" as LeadStatus } : l))
        );
        toast.success(`${lead.nom} converti en client`, { description: "Le lead a été ajouté aux clients" });
        break;
      case "lost":
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: "perdu" as LeadStatus } : l))
        );
        toast.warning(`${lead.nom} marqué comme perdu`);
        break;
    }
  }, []);

  const formatXAF = (v: number): string => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return String(v);
  };

  const KPI_CARDS = [
    { label: "Total Leads", value: stats.total, icon: Target, color: "from-violet-600 to-indigo-500" },
    { label: "Taux conversion", value: `${stats.tauxConversion}%`, icon: TrendingUp, color: "from-emerald-600 to-green-500" },
    { label: "En négociation", value: stats.enNego, icon: Clock, color: "from-amber-600 to-orange-500" },
    { label: "Valeur pipeline", value: `${formatXAF(stats.pipeline)} XAF`, icon: Building2, color: "from-cyan-600 to-blue-500" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-violet-400" />
            Leads & Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Pipeline commercial — {leads.length} leads</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Nouveau Lead
        </Button>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-2`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white/5 border-white/10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              className={`h-9 text-xs ${
                filterStatus === status
                  ? ""
                  : status !== "tous"
                    ? `${STATUS_CONFIG[status as LeadStatus].color} border-white/10`
                    : "border-white/10"
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status === "tous" ? "Tous" : STATUS_CONFIG[status as LeadStatus].label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 font-semibold text-muted-foreground">Lead</th>
                <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Contact</th>
                <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Source</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
                <th className="text-right p-4 font-semibold text-muted-foreground hidden sm:table-cell">Valeur</th>
                <th className="text-right p-4 font-semibold text-muted-foreground hidden lg:table-cell">Dernière interaction</th>
                <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const cfg = STATUS_CONFIG[lead.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{lead.nom}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" /> {lead.telephone}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                        {lead.source}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      <span className="font-semibold">{formatXAF(lead.valeur)}</span>
                      <span className="text-muted-foreground ml-1">XAF</span>
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell text-muted-foreground">
                      {lead.derniereInteraction}
                    </td>
                    <td className="p-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleAction("view", lead)} className="text-xs gap-2 cursor-pointer">
                            <ArrowUpRight className="h-3.5 w-3.5" /> Voir le détail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("qualify", lead)} className="text-xs gap-2 cursor-pointer">
                            <Zap className="h-3.5 w-3.5" /> Qualifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("call", lead)} className="text-xs gap-2 cursor-pointer">
                            <Phone className="h-3.5 w-3.5" /> Appeler
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("email", lead)} className="text-xs gap-2 cursor-pointer">
                            <Mail className="h-3.5 w-3.5" /> Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction("convert", lead)} className="text-xs gap-2 cursor-pointer text-emerald-400">
                            <Users className="h-3.5 w-3.5" /> Convertir en client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("lost", lead)} className="text-xs gap-2 cursor-pointer text-red-400">
                            <XCircle className="h-3.5 w-3.5" /> Marquer comme perdu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucun lead trouvé</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Ajustez vos filtres ou créez un nouveau lead</p>
          </div>
        )}
      </motion.div>

      {/* Dialog: Nouveau Lead */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-violet-400" />
              Nouveau Lead
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ajouter un nouveau lead au pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nom / Organisation *</Label>
                <Input
                  value={form.nom}
                  onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                  placeholder="Nguema & Associés"
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Secteur</Label>
                <Input
                  value={form.secteur}
                  onChange={(e) => setForm((p) => ({ ...p, secteur: e.target.value }))}
                  placeholder="Énergie, Mines..."
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contact@exemple.ga"
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Téléphone</Label>
                <Input
                  value={form.telephone}
                  onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
                  placeholder="+241 01 XX XX XX"
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm((p) => ({ ...p, source: v }))}>
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
                  value={form.valeur}
                  onChange={(e) => setForm((p) => ({ ...p, valeur: e.target.value }))}
                  placeholder="2 500 000"
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="text-xs">Annuler</Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5"
              >
                <Plus className="h-3 w-3" /> Créer le lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
