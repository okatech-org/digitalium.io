// DIGITALIUM.IO — SubAdmin: Clients CRM
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  TrendingUp,
  UserPlus,
  Activity,
  Building2,
  ArrowUpRight,
  Pencil,
  Archive,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type ClientStatus = "actif" | "prospect" | "inactif";

interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  secteur: string;
  status: ClientStatus;
  derniereInteraction: string;
}

/* ─── Config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<ClientStatus, { label: string; color: string }> = {
  actif: { label: "Actif", color: "bg-emerald-500/15 text-emerald-400" },
  prospect: { label: "Prospect", color: "bg-amber-500/15 text-amber-400" },
  inactif: { label: "Inactif", color: "bg-red-500/15 text-red-400" },
};

const SECTEURS = ["Énergie", "Mines", "Assurance", "Télécom", "Transport", "Industrie"];

/* ─── Mock Data ──────────────────────────────────── */

const INITIAL_CLIENTS: Client[] = [
  { id: "CL001", nom: "SOGARA", email: "direction@sogara.ga", telephone: "+241 01 55 20 00", secteur: "Énergie", status: "actif", derniereInteraction: "Il y a 2j" },
  { id: "CL002", nom: "SEEG", email: "contact@seeg.ga", telephone: "+241 01 76 15 00", secteur: "Énergie", status: "actif", derniereInteraction: "Hier" },
  { id: "CL003", nom: "SHO", email: "info@sho.ga", telephone: "+241 01 72 00 00", secteur: "Transport", status: "actif", derniereInteraction: "Il y a 5j" },
  { id: "CL004", nom: "Comilog", email: "admin@comilog.ga", telephone: "+241 01 66 30 00", secteur: "Mines", status: "actif", derniereInteraction: "Il y a 1j" },
  { id: "CL005", nom: "Olam Gabon", email: "contact@olam-gabon.ga", telephone: "+241 01 79 50 00", secteur: "Industrie", status: "actif", derniereInteraction: "Il y a 3j" },
  { id: "CL006", nom: "Gabon Telecom", email: "dsi@gabontelecom.ga", telephone: "+241 01 79 00 00", secteur: "Télécom", status: "actif", derniereInteraction: "Il y a 7j" },
  { id: "CL007", nom: "SETRAG", email: "direction@setrag.ga", telephone: "+241 01 70 22 00", secteur: "Transport", status: "prospect", derniereInteraction: "Il y a 14j" },
  { id: "CL008", nom: "Air Service Gabon", email: "contact@airservice.ga", telephone: "+241 01 73 10 00", secteur: "Transport", status: "inactif", derniereInteraction: "Il y a 45j" },
];

const EMPTY_CLIENT = { nom: "", email: "", telephone: "", secteur: "Énergie", notes: "" };

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function SubAdminClientsPage() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_CLIENT);

  const filtered = useMemo(() => {
    if (!search) return clients;
    return clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.secteur.toLowerCase().includes(search.toLowerCase())
    );
  }, [clients, search]);

  const stats = useMemo(() => {
    const actifs = clients.filter((c) => c.status === "actif").length;
    return { total: clients.length, actifs, revenus: "45M XAF", nouveaux: 1 };
  }, [clients]);

  const handleCreate = useCallback(() => {
    if (!form.nom || !form.email) {
      toast.error("Champs requis", { description: "Le nom et l'email sont obligatoires" });
      return;
    }
    const newClient: Client = {
      id: `CL${String(clients.length + 1).padStart(3, "0")}`,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      secteur: form.secteur,
      status: "prospect",
      derniereInteraction: "Maintenant",
    };
    setClients((prev) => [newClient, ...prev]);
    setForm(EMPTY_CLIENT);
    setShowCreate(false);
    toast.success("Client ajouté", { description: `${form.nom} (${form.secteur})` });
  }, [form, clients.length]);

  const handleViewDetails = useCallback((client: Client) => {
    toast.info(`Détails — ${client.nom}`, {
      description: `${client.secteur} · ${client.email} · ${client.telephone}`,
    });
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    toast.info("Modification", { description: `Édition de "${client.nom}" bientôt disponible` });
  }, []);

  const handleArchiveClient = useCallback((client: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, status: "inactif" as ClientStatus } : c))
    );
    toast.success("Client archivé", { description: `${client.nom} a été archivé` });
  }, []);

  const KPI_CARDS = [
    { label: "Total Clients", value: stats.total, icon: Users, color: "from-violet-600 to-indigo-500" },
    { label: "Revenus", value: stats.revenus, icon: TrendingUp, color: "from-emerald-600 to-green-500" },
    { label: "Clients Actifs", value: stats.actifs, icon: Activity, color: "from-cyan-600 to-blue-500" },
    { label: "Nouveaux ce mois", value: stats.nouveaux, icon: UserPlus, color: "from-amber-600 to-orange-500" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-violet-400" />
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} relations commerciales</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter client
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

      {/* Search */}
      <motion.div variants={fadeUp}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white/5 border-white/10"
          />
        </div>
      </motion.div>

      {/* Clients Table */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-muted-foreground">
              <th className="text-left py-2 px-2 font-medium">Client</th>
              <th className="text-left py-2 px-2 font-medium hidden md:table-cell">Contact</th>
              <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Secteur</th>
              <th className="text-center py-2 px-2 font-medium">Statut</th>
              <th className="text-left py-2 px-2 font-medium hidden lg:table-cell">Dernière interaction</th>
              <th className="text-center py-2 px-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => {
              const statusCfg = STATUS_CONFIG[client.status];
              return (
                <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">
                        {client.nom.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-[11px]">{client.nom}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 hidden md:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" /> {client.email}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {client.telephone}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 hidden sm:table-cell">
                    <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                      {client.secteur}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <Badge variant="secondary" className={`text-[9px] border-0 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden lg:table-cell text-[10px]">
                    {client.derniereInteraction}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleViewDetails(client)}>
                          <ArrowUpRight className="h-3.5 w-3.5" /> Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleEditClient(client)}>
                          <Pencil className="h-3.5 w-3.5" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-destructive" onClick={() => handleArchiveClient(client)}>
                          <Archive className="h-3.5 w-3.5" /> Archiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucun client trouvé</p>
          </div>
        )}
      </motion.div>

      {/* Dialog: Ajouter client */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-violet-400" />
              Ajouter un client
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ajouter un nouveau client à votre portefeuille
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nom *</Label>
              <Input
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="SOGARA, SEEG..."
                className="h-9 text-xs bg-white/5 border-white/10"
              />
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
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Secteur</Label>
              <Select value={form.secteur} onValueChange={(v) => setForm((p) => ({ ...p, secteur: v }))}>
                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTEURS.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Notes sur le client..."
                className="text-xs bg-white/5 border-white/10 min-h-[60px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="text-xs">Annuler</Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5"
              >
                <Plus className="h-3 w-3" /> Créer le client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
