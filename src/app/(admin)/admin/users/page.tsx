// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Utilisateurs
// Tableau des utilisateurs avec recherche,
// filtres par rôle/statut, actions de gestion
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Plus,
    MoreHorizontal,
    Shield,
    Mail,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    UserPlus,
    Ban,
    Key,
    Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Types ──────────────────────────────────────── */

type UserStatus = "actif" | "inactif" | "suspendu" | "en_attente";
type UserRole = "admin" | "org_admin" | "manager" | "membre" | "lecteur";

interface UserData {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    role: UserRole;
    organisation: string;
    status: UserStatus;
    derniereConnexion: string;
    dateCreation: string;
}

/* ─── Config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    actif: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    inactif: { label: "Inactif", color: "text-gray-400", bg: "bg-gray-500/15", icon: Clock },
    suspendu: { label: "Suspendu", color: "text-red-400", bg: "bg-red-500/15", icon: Ban },
    en_attente: { label: "En attente", color: "text-amber-400", bg: "bg-amber-500/15", icon: AlertCircle },
};

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
    admin: { label: "Admin", color: "text-red-400", bg: "bg-red-500/15" },
    org_admin: { label: "Org Admin", color: "text-violet-400", bg: "bg-violet-500/15" },
    manager: { label: "Manager", color: "text-blue-400", bg: "bg-blue-500/15" },
    membre: { label: "Membre", color: "text-cyan-400", bg: "bg-cyan-500/15" },
    lecteur: { label: "Lecteur", color: "text-gray-400", bg: "bg-gray-500/15" },
};

/* ─── Mock Data ──────────────────────────────────── */

const USERS_DATA: UserData[] = [
    { id: "U001", prenom: "Ornella", nom: "DOUMBA", email: "ornella@digitalium.ga", role: "admin", organisation: "DIGITALIUM", status: "actif", derniereConnexion: "Il y a 5 min", dateCreation: "2025-06-15" },
    { id: "U002", prenom: "Jean-Paul", nom: "MBOUMBA", email: "jp.mboumba@seeg.ga", role: "org_admin", organisation: "SEEG", status: "actif", derniereConnexion: "Il y a 2h", dateCreation: "2025-08-20" },
    { id: "U003", prenom: "Marie", nom: "NDONG", email: "marie.ndong@cnamgs.ga", role: "manager", organisation: "CNAMGS", status: "actif", derniereConnexion: "Hier", dateCreation: "2025-09-10" },
    { id: "U004", prenom: "Patrick", nom: "OBIANG", email: "p.obiang@ascoma.ga", role: "membre", organisation: "ASCOMA Gabon", status: "actif", derniereConnexion: "Il y a 3j", dateCreation: "2025-10-05" },
    { id: "U005", prenom: "Claire", nom: "MOUSSAVOU", email: "claire.m@bgfi.com", role: "org_admin", organisation: "BGFI Bank", status: "en_attente", derniereConnexion: "Jamais", dateCreation: "2026-02-10" },
    { id: "U006", prenom: "David", nom: "AKOGO", email: "d.akogo@gabonoil.ga", role: "manager", organisation: "Gabon Oil", status: "suspendu", derniereConnexion: "Il y a 15j", dateCreation: "2025-07-22" },
    { id: "U007", prenom: "Sylvie", nom: "NZE", email: "s.nze@sante.gouv.ga", role: "lecteur", organisation: "Min. Santé", status: "inactif", derniereConnexion: "Il y a 45j", dateCreation: "2025-11-18" },
    { id: "U008", prenom: "Fabrice", nom: "ONDO", email: "f.ondo@peches.gouv.ga", role: "membre", organisation: "Min. Pêches", status: "actif", derniereConnexion: "Il y a 1h", dateCreation: "2025-12-01" },
];

const KPIS = [
    { label: "Total utilisateurs", value: "2 847", icon: Users, color: "from-blue-600 to-cyan-500" },
    { label: "Actifs ce mois", value: "1 924", icon: CheckCircle2, color: "from-emerald-600 to-green-500" },
    { label: "En attente", value: "23", icon: Clock, color: "from-amber-600 to-orange-500" },
    { label: "Invitations envoyées", value: "14", icon: UserPlus, color: "from-violet-600 to-purple-500" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ═══════════════════════════════════════════════
   USERS PAGE
   ═══════════════════════════════════════════════ */

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<UserRole | "all">("all");

    const filteredUsers = USERS_DATA.filter((user) => {
        const matchSearch =
            `${user.prenom} ${user.nom}`.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.organisation.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === "all" || user.role === filterRole;
        return matchSearch && matchRole;
    });

    const handleAction = useCallback((action: string, userName: string) => {
        console.log(`Action: ${action} on ${userName}`);
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-400" />
                        Utilisateurs
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestion des comptes utilisateurs de la plateforme
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-digitalium-violet text-white border-0 hover:opacity-90 gap-2 text-xs h-8 hidden sm:flex">
                    <UserPlus className="h-3.5 w-3.5" /> Inviter
                </Button>
            </motion.div>

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

            {/* Search & Filters */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, email, organisation…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={filterRole === "all" ? "default" : "outline"}
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => setFilterRole("all")}
                    >
                        Tous
                    </Button>
                    {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => (
                        <Button
                            key={role}
                            variant={filterRole === role ? "default" : "outline"}
                            size="sm"
                            className={`h-9 text-xs ${filterRole === role ? "" : `${ROLE_CONFIG[role].color} border-white/10`}`}
                            onClick={() => setFilterRole(role)}
                        >
                            {ROLE_CONFIG[role].label}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Users Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 font-semibold text-muted-foreground">Utilisateur</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Organisation</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Rôle</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Statut</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Dernière connexion</th>
                                <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, i) => {
                                const statusCfg = STATUS_CONFIG[user.status];
                                const roleCfg = ROLE_CONFIG[user.role];
                                const initials = `${user.prenom[0]}${user.nom[0]}`;
                                return (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.04 }}
                                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.prenom} {user.nom}</p>
                                                    <p className="text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                                            {user.organisation}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className={`text-[9px] ${roleCfg.bg} ${roleCfg.color} border-0`}>
                                                {roleCfg.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            <Badge variant="secondary" className={`text-[9px] ${statusCfg.bg} ${statusCfg.color} border-0 gap-1`}>
                                                {statusCfg.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell text-muted-foreground">
                                            {user.derniereConnexion}
                                        </td>
                                        <td className="p-4 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleAction("view", `${user.prenom} ${user.nom}`)} className="text-xs gap-2">
                                                        <Eye className="h-3.5 w-3.5" /> Voir le profil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction("role", `${user.prenom} ${user.nom}`)} className="text-xs gap-2">
                                                        <Shield className="h-3.5 w-3.5" /> Modifier le rôle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction("reset", `${user.prenom} ${user.nom}`)} className="text-xs gap-2">
                                                        <Key className="h-3.5 w-3.5" /> Réinitialiser mot de passe
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {user.status === "suspendu" ? (
                                                        <DropdownMenuItem onClick={() => handleAction("activate", `${user.prenom} ${user.nom}`)} className="text-xs gap-2 text-emerald-400">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Réactiver
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleAction("suspend", `${user.prenom} ${user.nom}`)} className="text-xs gap-2 text-red-400">
                                                            <Ban className="h-3.5 w-3.5" /> Suspendre
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Ajustez vos filtres ou invitez un nouvel utilisateur</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
