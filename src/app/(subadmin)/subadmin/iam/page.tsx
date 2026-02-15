// DIGITALIUM.IO — SubAdmin: IAM (Identity & Access Management)
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  UserCog,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

type MemberRole = "admin" | "manager" | "membre" | "observateur";
type MemberStatus = "actif" | "suspendu" | "invité";

interface Member {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  derniereActivite: string;
  mfa: boolean;
}

/* ─── Config ─────────────────────────────────────── */

const ROLE_CONFIG: Record<MemberRole, { label: string; level: number; color: string }> = {
  admin: { label: "Administrateur", level: 2, color: "text-red-400 bg-red-500/15" },
  manager: { label: "Manager", level: 3, color: "text-violet-400 bg-violet-500/15" },
  membre: { label: "Membre", level: 4, color: "text-emerald-400 bg-emerald-500/15" },
  observateur: { label: "Observateur", level: 5, color: "text-muted-foreground bg-white/5" },
};

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string }> = {
  actif: { label: "Actif", color: "bg-emerald-500/15 text-emerald-400" },
  suspendu: { label: "Suspendu", color: "bg-red-500/15 text-red-400" },
  "invité": { label: "Invité", color: "bg-blue-500/15 text-blue-400" },
};

/* ─── Mock Data ──────────────────────────────────── */

const INITIAL_MEMBERS: Member[] = [
  { id: "M001", prenom: "Jean-Pierre", nom: "Nguema", email: "jp.nguema@ascoma.ga", role: "admin", status: "actif", derniereActivite: "En ligne", mfa: true },
  { id: "M002", prenom: "Marie-Claire", nom: "Obame", email: "mc.obame@ascoma.ga", role: "manager", status: "actif", derniereActivite: "Il y a 15 min", mfa: true },
  { id: "M003", prenom: "Patrick", nom: "Mboumba", email: "p.mboumba@ascoma.ga", role: "membre", status: "actif", derniereActivite: "Il y a 2h", mfa: true },
  { id: "M004", prenom: "Sylvie", nom: "Ndong", email: "s.ndong@ascoma.ga", role: "membre", status: "actif", derniereActivite: "Hier", mfa: false },
  { id: "M005", prenom: "Robert", nom: "Gondjout", email: "r.gondjout@ascoma.ga", role: "manager", status: "actif", derniereActivite: "Il y a 3h", mfa: true },
  { id: "M006", prenom: "Chantal", nom: "Nguema-Ondo", email: "c.nguema@ascoma.ga", role: "observateur", status: "suspendu", derniereActivite: "Il y a 14j", mfa: false },
  { id: "M007", prenom: "David", nom: "Obame-Nguema", email: "d.obame@ascoma.ga", role: "membre", status: "actif", derniereActivite: "Il y a 1h", mfa: true },
  { id: "M008", prenom: "Alice", nom: "Mboumba-Nze", email: "a.mboumba@ascoma.ga", role: "observateur", status: "invité", derniereActivite: "Jamais", mfa: false },
];

const EMPTY_INVITE = { prenom: "", nom: "", email: "", role: "membre" as MemberRole };

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function SubAdminIAMPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  const [showEditRole, setShowEditRole] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<MemberRole>("membre");

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        search === "" ||
        `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [members, search, roleFilter]);

  const stats = useMemo(() => {
    const activeRoles = new Set(members.map((m) => m.role)).size;
    const mfaPercent = Math.round((members.filter((m) => m.mfa).length / members.length) * 100);
    const invitations = members.filter((m) => m.status === "invité").length;
    return { total: members.length, activeRoles, mfaPercent, invitations };
  }, [members]);

  const handleInvite = useCallback(() => {
    if (!inviteForm.prenom || !inviteForm.nom || !inviteForm.email) {
      toast.error("Champs requis", { description: "Tous les champs sont obligatoires" });
      return;
    }
    const newMember: Member = {
      id: `M${String(members.length + 1).padStart(3, "0")}`,
      prenom: inviteForm.prenom,
      nom: inviteForm.nom,
      email: inviteForm.email,
      role: inviteForm.role,
      status: "invité",
      derniereActivite: "Jamais",
      mfa: false,
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteForm(EMPTY_INVITE);
    setShowInvite(false);
    toast.success("Invitation envoyée", { description: `${inviteForm.prenom} ${inviteForm.nom} (${ROLE_CONFIG[inviteForm.role].label})` });
  }, [inviteForm, members.length]);

  const handleChangeRole = useCallback(() => {
    if (!editingMember) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? { ...m, role: newRole } : m))
    );
    toast.success("Rôle modifié", { description: `${editingMember.prenom} ${editingMember.nom} est maintenant ${ROLE_CONFIG[newRole].label}` });
    setShowEditRole(false);
    setEditingMember(null);
  }, [editingMember, newRole]);

  const handleResetPassword = useCallback((member: Member) => {
    toast.info("Lien de réinitialisation envoyé", { description: `Un email a été envoyé à ${member.email}` });
  }, []);

  const handleToggleSuspend = useCallback((member: Member) => {
    const nextStatus: MemberStatus = member.status === "suspendu" ? "actif" : "suspendu";
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
    );
    if (nextStatus === "suspendu") {
      toast.warning(`${member.prenom} ${member.nom} suspendu`, { description: "Le compte a été désactivé" });
    } else {
      toast.success(`${member.prenom} ${member.nom} réactivé`, { description: "Le compte est de nouveau actif" });
    }
  }, []);

  const openEditRole = useCallback((member: Member) => {
    setEditingMember(member);
    setNewRole(member.role);
    setShowEditRole(true);
  }, []);

  const KPI_CARDS = [
    { label: "Total Membres", value: stats.total, icon: Users, color: "from-violet-600 to-indigo-500" },
    { label: "Rôles actifs", value: stats.activeRoles, icon: Shield, color: "from-emerald-600 to-teal-500" },
    { label: "MFA activé", value: `${stats.mfaPercent}%`, icon: ShieldCheck, color: "from-cyan-600 to-blue-500" },
    { label: "Invitations", value: stats.invitations, icon: Mail, color: "from-amber-600 to-orange-500" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-violet-400" />
            IAM — Gestion des accès
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Membres, rôles & permissions de l&apos;organisation</p>
        </div>
        <Button
          onClick={() => setShowInvite(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Inviter un membre
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

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-white/5 border-white/10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-8 w-[180px] text-xs bg-white/5 border-white/10">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tous les rôles</SelectItem>
            <SelectItem value="admin" className="text-xs">Administrateur</SelectItem>
            <SelectItem value="manager" className="text-xs">Manager</SelectItem>
            <SelectItem value="membre" className="text-xs">Membre</SelectItem>
            <SelectItem value="observateur" className="text-xs">Observateur</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} résultat(s)</span>
      </motion.div>

      {/* Members Table */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-muted-foreground">
              <th className="text-left py-2 px-2 font-medium">Membre</th>
              <th className="text-left py-2 px-2 font-medium hidden md:table-cell">Email</th>
              <th className="text-left py-2 px-2 font-medium">Rôle</th>
              <th className="text-center py-2 px-2 font-medium">Statut</th>
              <th className="text-left py-2 px-2 font-medium hidden lg:table-cell">Dernière activité</th>
              <th className="text-center py-2 px-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => {
              const roleCfg = ROLE_CONFIG[member.role];
              const statusCfg = STATUS_CONFIG[member.status];
              const initials = `${member.prenom[0]}${member.nom[0]}`;
              return (
                <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">
                        {initials}
                      </div>
                      <span className="font-medium text-[11px]">{member.prenom} {member.nom}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{member.email}</td>
                  <td className="py-2.5 px-2">
                    <Badge variant="secondary" className={`text-[9px] border-0 ${roleCfg.color}`}>
                      L{roleCfg.level} · {roleCfg.label}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <Badge variant="secondary" className={`text-[9px] border-0 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden lg:table-cell text-[10px]">
                    {member.derniereActivite}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px]">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => openEditRole(member)}>
                          <UserCog className="h-3 w-3" /> Modifier rôle
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleResetPassword(member)}>
                          <Lock className="h-3 w-3" /> Réinitialiser MDP
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={`text-xs gap-2 cursor-pointer ${member.status === "suspendu" ? "text-emerald-400" : "text-destructive"}`}
                          onClick={() => handleToggleSuspend(member)}
                        >
                          {member.status === "suspendu" ? (
                            <><CheckCircle2 className="h-3 w-3" /> Réactiver</>
                          ) : (
                            <><Ban className="h-3 w-3" /> Suspendre</>
                          )}
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
            <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucun membre trouvé</p>
          </div>
        )}
      </motion.div>

      {/* Dialog: Inviter un membre */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-violet-400" />
              Inviter un membre
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Envoyer une invitation par email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Prénom *</Label>
                <Input
                  value={inviteForm.prenom}
                  onChange={(e) => setInviteForm((p) => ({ ...p, prenom: e.target.value }))}
                  placeholder="Jean-Pierre"
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nom *</Label>
                <Input
                  value={inviteForm.nom}
                  onChange={(e) => setInviteForm((p) => ({ ...p, nom: e.target.value }))}
                  placeholder="Nguema"
                  className="h-9 text-xs bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="prenom.nom@ascoma.ga"
                className="h-9 text-xs bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rôle</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((p) => ({ ...p, role: v as MemberRole }))}>
                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_CONFIG) as MemberRole[]).map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">{ROLE_CONFIG[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)} className="text-xs">Annuler</Button>
              <Button size="sm" onClick={handleInvite} className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5">
                <Mail className="h-3 w-3" /> Envoyer l&apos;invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Modifier rôle */}
      <Dialog open={showEditRole} onOpenChange={setShowEditRole}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <UserCog className="h-4 w-4 text-violet-400" />
              Modifier le rôle
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingMember ? `${editingMember.prenom} ${editingMember.nom}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nouveau rôle</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as MemberRole)}>
                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_CONFIG) as MemberRole[]).map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">{ROLE_CONFIG[r].label} (L{ROLE_CONFIG[r].level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowEditRole(false)} className="text-xs">Annuler</Button>
              <Button size="sm" onClick={handleChangeRole} className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs">
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
