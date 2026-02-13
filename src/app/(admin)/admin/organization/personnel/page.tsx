// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Organisation Client: Personnel
// Gestion du personnel de l'organisme connecté
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    Mail,
    MoreHorizontal,
    X,
    Building,
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

interface PersonnelMember {
    id: string;
    nom: string;
    prenom: string;
    poste: string;
    departement: string;
    role: string;
    statut: "actif" | "en_attente" | "suspendu";
    email: string;
    derniereConnexion: string;
    avatar: string;
}

/* ─── Mock Data — Personnel SEEG ─────────── */

const DEPARTEMENTS = ["Tous", "Direction Générale", "Technique", "Commercial", "Administratif", "Juridique"];
const ROLES = ["Tous", "Admin", "Manager", "Opérateur", "Lecteur"];
const STATUTS = ["Tous", "Actif", "En attente", "Suspendu"];

const PERSONNEL: PersonnelMember[] = [
    { id: "1", nom: "Nguema", prenom: "Pierre", poste: "Directeur Général", departement: "Direction Générale", role: "Admin", statut: "actif", email: "p.nguema@seeg.ga", derniereConnexion: "Il y a 10 min", avatar: "PN" },
    { id: "2", nom: "Mboumba", prenom: "Hélène", poste: "Directrice Administrative", departement: "Administratif", role: "Admin", statut: "actif", email: "h.mboumba@seeg.ga", derniereConnexion: "Il y a 45 min", avatar: "HM" },
    { id: "3", nom: "Assoumou", prenom: "Éric", poste: "Chef de Service Technique", departement: "Technique", role: "Manager", statut: "actif", email: "e.assoumou@seeg.ga", derniereConnexion: "Il y a 2h", avatar: "EA" },
    { id: "4", nom: "Ella", prenom: "Sandrine", poste: "Ingénieure Réseau", departement: "Technique", role: "Opérateur", statut: "actif", email: "s.ella@seeg.ga", derniereConnexion: "Il y a 1h", avatar: "SE" },
    { id: "5", nom: "Mouele", prenom: "Jacques", poste: "Responsable Commercial", departement: "Commercial", role: "Manager", statut: "actif", email: "j.mouele@seeg.ga", derniereConnexion: "Hier", avatar: "JM" },
    { id: "6", nom: "Edzang", prenom: "Christelle", poste: "Chargée de clientèle", departement: "Commercial", role: "Opérateur", statut: "actif", email: "c.edzang@seeg.ga", derniereConnexion: "Il y a 3h", avatar: "CE" },
    { id: "7", nom: "Bouanga", prenom: "Michel", poste: "Technicien terrain", departement: "Technique", role: "Opérateur", statut: "actif", email: "m.bouanga@seeg.ga", derniereConnexion: "Il y a 5h", avatar: "MB" },
    { id: "8", nom: "Mintsa", prenom: "Rose", poste: "Juriste", departement: "Juridique", role: "Opérateur", statut: "actif", email: "r.mintsa@seeg.ga", derniereConnexion: "Il y a 1j", avatar: "RM" },
    { id: "9", nom: "Nzamba", prenom: "Aubin", poste: "Comptable", departement: "Administratif", role: "Opérateur", statut: "en_attente", email: "a.nzamba@seeg.ga", derniereConnexion: "—", avatar: "AN" },
    { id: "10", nom: "Mabiala", prenom: "Diane", poste: "Assistante RH", departement: "Administratif", role: "Lecteur", statut: "en_attente", email: "d.mabiala@seeg.ga", derniereConnexion: "—", avatar: "DM" },
];

/* ─── KPI ─────────────────────────────────── */

const KPI = [
    { label: "Total membres", value: "47", icon: Users, color: "violet" },
    { label: "Actifs", value: "42", icon: CheckCircle2, color: "emerald" },
    { label: "En attente", value: "5", icon: Clock, color: "amber" },
    { label: "Départements", value: "5", icon: Building, color: "blue" },
];

const KPI_COLORS: Record<string, { iconBg: string; text: string }> = {
    violet: { iconBg: "bg-violet-500/15", text: "text-violet-400" },
    emerald: { iconBg: "bg-emerald-500/15", text: "text-emerald-400" },
    amber: { iconBg: "bg-amber-500/15", text: "text-amber-400" },
    blue: { iconBg: "bg-blue-500/15", text: "text-blue-400" },
};

const STATUT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    actif: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Actif" },
    en_attente: { bg: "bg-amber-500/15", text: "text-amber-400", label: "En attente" },
    suspendu: { bg: "bg-red-500/15", text: "text-red-400", label: "Suspendu" },
};

/* ═══════════════════════════════════════════ */

export default function OrganizationPersonnelPage() {
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("Tous");
    const [filterRole, setFilterRole] = useState("Tous");
    const [filterStatut, setFilterStatut] = useState("Tous");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Opérateur");

    const filtered = PERSONNEL.filter((m) => {
        const q = search.toLowerCase();
        const matchSearch = !q || `${m.prenom} ${m.nom} ${m.poste} ${m.email}`.toLowerCase().includes(q);
        const matchDept = filterDept === "Tous" || m.departement === filterDept;
        const matchRole = filterRole === "Tous" || m.role === filterRole;
        const matchStatut = filterStatut === "Tous" ||
            (filterStatut === "Actif" && m.statut === "actif") ||
            (filterStatut === "En attente" && m.statut === "en_attente") ||
            (filterStatut === "Suspendu" && m.statut === "suspendu");
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
                        <Users className="h-6 w-6 text-violet-400" />
                        Personnel — SEEG
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestion des membres de l&apos;organisation cliente</p>
                </div>
                <Button
                    onClick={() => setShowInvite(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <UserPlus className="h-3.5 w-3.5" />
                    Inviter
                </Button>
            </motion.div>

            {/* KPI */}
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
                    <SelectTrigger className="h-9 w-[170px] text-xs bg-white/5 border-white/10">
                        <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {DEPARTEMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-9 w-[130px] text-xs bg-white/5 border-white/10">
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

            {/* Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-[1fr_150px_140px_100px_90px_110px_40px] gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Membre</span>
                    <span>Poste</span>
                    <span>Département</span>
                    <span>Rôle</span>
                    <span>Statut</span>
                    <span>Connexion</span>
                    <span></span>
                </div>
                <div className="divide-y divide-white/5">
                    {filtered.map((member) => {
                        const statut = STATUT_BADGE[member.statut];
                        return (
                            <div
                                key={member.id}
                                className="grid grid-cols-[1fr_150px_140px_100px_90px_110px_40px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-400 shrink-0">
                                        {member.avatar}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate">{member.prenom} {member.nom}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{member.poste}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.departement}</p>
                                <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-muted-foreground w-fit">
                                    {member.role}
                                </Badge>
                                <Badge variant="secondary" className={`text-[9px] border-0 ${statut.bg} ${statut.text} w-fit`}>
                                    {statut.label}
                                </Badge>
                                <p className="text-[10px] text-muted-foreground">{member.derniereConnexion}</p>
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
                            <UserPlus className="h-4 w-4 text-violet-400" />
                            Inviter un membre
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Envoyez une invitation pour rejoindre SEEG sur la plateforme
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
                                placeholder="nom@seeg.ga"
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
                                    <SelectItem value="Opérateur">Opérateur</SelectItem>
                                    <SelectItem value="Lecteur">Lecteur</SelectItem>
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
                                className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5"
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
