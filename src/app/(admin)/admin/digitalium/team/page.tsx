// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Espace DIGITALIUM: Équipe
// Gestion des membres de l'entreprise DIGITALIUM
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    Mail,
    MoreHorizontal,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

interface TeamMember {
    id: string;
    nom: string;
    prenom: string;
    poste: string;
    departement: string;
    role: string;
    statut: "actif" | "en_attente" | "inactif";
    email: string;
    derniereConnexion: string;
    avatar: string;
}

/* ─── Mock Data ──────────────────────────── */

const DEPARTEMENTS = ["Tous", "Direction", "Développement", "Commercial", "Support", "Juridique"];
const ROLES = ["Tous", "Admin système", "Admin", "Manager", "Membre"];
const STATUTS = ["Tous", "Actif", "En attente", "Inactif"];

const TEAM_MEMBERS: TeamMember[] = [
    { id: "1", nom: "Obiang", prenom: "Patrick", poste: "Directeur Général", departement: "Direction", role: "Admin système", statut: "actif", email: "p.obiang@digitalium.ga", derniereConnexion: "Il y a 5 min", avatar: "PO" },
    { id: "2", nom: "Nzé", prenom: "Marie", poste: "CTO", departement: "Développement", role: "Admin système", statut: "actif", email: "m.nze@digitalium.ga", derniereConnexion: "Il y a 20 min", avatar: "MN" },
    { id: "3", nom: "Moussavou", prenom: "Jean", poste: "Lead Développeur", departement: "Développement", role: "Admin", statut: "actif", email: "j.moussavou@digitalium.ga", derniereConnexion: "Il y a 1h", avatar: "JM" },
    { id: "4", nom: "Ndong", prenom: "Alice", poste: "UX Designer", departement: "Développement", role: "Membre", statut: "actif", email: "a.ndong@digitalium.ga", derniereConnexion: "Il y a 2h", avatar: "AN" },
    { id: "5", nom: "Mba", prenom: "François", poste: "Directeur Commercial", departement: "Commercial", role: "Manager", statut: "actif", email: "f.mba@digitalium.ga", derniereConnexion: "Il y a 30 min", avatar: "FM" },
    { id: "6", nom: "Ondo", prenom: "Sylvie", poste: "Chargée de clientèle", departement: "Commercial", role: "Membre", statut: "actif", email: "s.ondo@digitalium.ga", derniereConnexion: "Hier", avatar: "SO" },
    { id: "7", nom: "Essono", prenom: "Théodore", poste: "Support Technique", departement: "Support", role: "Membre", statut: "actif", email: "t.essono@digitalium.ga", derniereConnexion: "Il y a 3h", avatar: "TE" },
    { id: "8", nom: "Biyoghe", prenom: "Nathalie", poste: "Responsable Juridique", departement: "Juridique", role: "Manager", statut: "actif", email: "n.biyoghe@digitalium.ga", derniereConnexion: "Il y a 1j", avatar: "NB" },
    { id: "9", nom: "Ntoutoume", prenom: "Léandre", poste: "Développeur Backend", departement: "Développement", role: "Membre", statut: "en_attente", email: "l.ntoutoume@digitalium.ga", derniereConnexion: "—", avatar: "LN" },
    { id: "10", nom: "Mengue", prenom: "Clara", poste: "Chargée Marketing", departement: "Commercial", role: "Membre", statut: "en_attente", email: "c.mengue@digitalium.ga", derniereConnexion: "—", avatar: "CM" },
    { id: "11", nom: "Ovono", prenom: "Didier", poste: "DevOps Engineer", departement: "Développement", role: "Membre", statut: "en_attente", email: "d.ovono@digitalium.ga", derniereConnexion: "—", avatar: "DO" },
];

/* ─── KPI ─────────────────────────────────── */

const KPI = [
    { label: "Total", value: "35", icon: Users, color: "emerald" },
    { label: "Actifs", value: "32", icon: CheckCircle2, color: "teal" },
    { label: "En attente", value: "3", icon: Clock, color: "amber" },
    { label: "Départements", value: "5", icon: Shield, color: "violet" },
];

const KPI_COLORS: Record<string, { iconBg: string; text: string }> = {
    emerald: { iconBg: "bg-emerald-500/15", text: "text-emerald-400" },
    teal: { iconBg: "bg-teal-500/15", text: "text-teal-400" },
    amber: { iconBg: "bg-amber-500/15", text: "text-amber-400" },
    violet: { iconBg: "bg-violet-500/15", text: "text-violet-400" },
};

const STATUT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    actif: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Actif" },
    en_attente: { bg: "bg-amber-500/15", text: "text-amber-400", label: "En attente" },
    inactif: { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "Inactif" },
};

/* ═══════════════════════════════════════════ */

export default function DigitaliumTeamPage() {
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("Tous");
    const [filterRole, setFilterRole] = useState("Tous");
    const [filterStatut, setFilterStatut] = useState("Tous");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Membre");

    const filtered = TEAM_MEMBERS.filter((m) => {
        const q = search.toLowerCase();
        const matchSearch = !q || `${m.prenom} ${m.nom} ${m.poste} ${m.email}`.toLowerCase().includes(q);
        const matchDept = filterDept === "Tous" || m.departement === filterDept;
        const matchRole = filterRole === "Tous" || m.role === filterRole;
        const matchStatut = filterStatut === "Tous" ||
            (filterStatut === "Actif" && m.statut === "actif") ||
            (filterStatut === "En attente" && m.statut === "en_attente") ||
            (filterStatut === "Inactif" && m.statut === "inactif");
        return matchSearch && matchDept && matchRole && matchStatut;
    });

    const handleInvite = () => {
        if (!inviteEmail) return;
        toast.success("Invitation envoyée", { description: `Un email a été envoyé à ${inviteEmail}` });
        setInviteEmail("");
        setShowInvite(false);
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-emerald-400" />
                        Équipe DIGITALIUM
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestion des membres et des accès de l&apos;entreprise</p>
                </div>
                <Button
                    onClick={() => setShowInvite(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <UserPlus className="h-3.5 w-3.5" />
                    Inviter
                </Button>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI.map((kpi) => {
                    const Icon = kpi.icon;
                    const colors = KPI_COLORS[kpi.color];
                    return (
                        <div key={kpi.label} className="glass-card rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                                    <Icon className={`h-4 w-4 ${colors.text}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un membre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 text-xs bg-white/5 border-white/10 pl-9"
                    />
                </div>
                <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger className="h-9 w-[150px] text-xs bg-white/5 border-white/10">
                        <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {DEPARTEMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-9 w-[140px] text-xs bg-white/5 border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="h-9 w-[130px] text-xs bg-white/5 border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Team Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_140px_120px_100px_100px_110px_40px] gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Membre</span>
                    <span>Poste</span>
                    <span>Département</span>
                    <span>Rôle</span>
                    <span>Statut</span>
                    <span>Connexion</span>
                    <span></span>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/5">
                    {filtered.map((member) => {
                        const statut = STATUT_BADGE[member.statut];
                        return (
                            <div
                                key={member.id}
                                className="grid grid-cols-[1fr_140px_120px_100px_100px_110px_40px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] group"
                            >
                                {/* Name + Email */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                                        {member.avatar}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate">{member.prenom} {member.nom}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                                    </div>
                                </div>

                                {/* Poste */}
                                <p className="text-xs text-muted-foreground truncate">{member.poste}</p>

                                {/* Département */}
                                <p className="text-xs text-muted-foreground">{member.departement}</p>

                                {/* Rôle */}
                                <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-muted-foreground w-fit">
                                    {member.role}
                                </Badge>

                                {/* Statut */}
                                <Badge variant="secondary" className={`text-[9px] border-0 ${statut.bg} ${statut.text} w-fit`}>
                                    {statut.label}
                                </Badge>

                                {/* Dernière connexion */}
                                <p className="text-[10px] text-muted-foreground">{member.derniereConnexion}</p>

                                {/* Actions */}
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Aucun membre trouvé</p>
                    </div>
                )}
            </motion.div>

            {/* Results count */}
            <motion.div variants={fadeUp}>
                <p className="text-[10px] text-muted-foreground text-right">
                    {filtered.length} membre{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
                </p>
            </motion.div>

            {/* Invite Dialog */}
            <Dialog open={showInvite} onOpenChange={setShowInvite}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-emerald-400" />
                            Inviter un membre
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Envoyez une invitation par email pour rejoindre DIGITALIUM
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                <Mail className="h-3 w-3 inline mr-1" />Adresse email
                            </label>
                            <Input
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="nom@digitalium.ga"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Rôle</label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Membre">Membre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)} className="text-xs gap-1.5">
                                <X className="h-3 w-3" />
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleInvite}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-1.5"
                            >
                                <Mail className="h-3 w-3" />
                                Envoyer l&apos;invitation
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
