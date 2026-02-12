// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Utilisateurs
// Full-featured user management with KPIs,
// search, filters, role badges, and row actions
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    Search,
    Shield,
    CheckCircle2,
    AlertTriangle,
    Clock,
    MoreHorizontal,
    Eye,
    Pencil,
    Ban,
    Trash2,
    ShieldCheck,
    Mail,
    Filter,
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

/* ─── Types ──────────────────────────────────────── */

type UserStatus = "active" | "suspended" | "invited";
type UserRole = "system_admin" | "platform_admin" | "org_admin" | "manager" | "member" | "viewer";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    org: string;
    status: UserStatus;
    created: string;
    lastActive: string;
    mfa: boolean;
}

/* ─── Config ─────────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const ROLE_CFG: Record<UserRole, { label: string; color: string; bg: string }> = {
    system_admin: { label: "System Admin", color: "text-red-400", bg: "bg-red-500/15" },
    platform_admin: { label: "Platform Admin", color: "text-orange-400", bg: "bg-orange-500/15" },
    org_admin: { label: "Org Admin", color: "text-blue-400", bg: "bg-blue-500/15" },
    manager: { label: "Manager", color: "text-violet-400", bg: "bg-violet-500/15" },
    member: { label: "Membre", color: "text-emerald-400", bg: "bg-emerald-500/15" },
    viewer: { label: "Lecteur", color: "text-gray-400", bg: "bg-gray-500/15" },
};

const STATUS_CFG: Record<UserStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    suspended: { label: "Suspendu", color: "text-red-400", bg: "bg-red-500/15", icon: Ban },
    invited: { label: "Invité", color: "text-blue-400", bg: "bg-blue-500/15", icon: Clock },
};

/* ─── Mock Data ──────────────────────────────────── */

const USERS_DATA: UserData[] = [
    { id: "U001", name: "Jean-Pierre Ondo", email: "jp.ondo@dgdi.ga", role: "system_admin", org: "DGDI", status: "active", created: "15 jan 2026", lastActive: "En ligne", mfa: true },
    { id: "U002", name: "Marie Nzé", email: "m.nze@dgdi.ga", role: "platform_admin", org: "DGDI", status: "active", created: "15 jan 2026", lastActive: "Il y a 10 min", mfa: true },
    { id: "U003", name: "Patrick Obiang", email: "p.obiang@minterieur.ga", role: "org_admin", org: "Min. Intérieur", status: "active", created: "20 jan 2026", lastActive: "Il y a 2h", mfa: true },
    { id: "U004", name: "Sylvie Moussavou", email: "s.moussavou@pgl.ga", role: "manager", org: "PGL", status: "active", created: "22 jan 2026", lastActive: "Il y a 1h", mfa: false },
    { id: "U005", name: "David Mba", email: "d.mba@gabtelecom.ga", role: "member", org: "Gabon Télécom", status: "active", created: "1 fév 2026", lastActive: "Il y a 30 min", mfa: true },
    { id: "U006", name: "Robert Ndong", email: "r.ndong@okcapital.ga", role: "manager", org: "Okoumé Capital", status: "suspended", created: "5 fév 2026", lastActive: "Il y a 7j", mfa: false },
    { id: "U007", name: "Alice Bekale", email: "a.bekale@dgdi.ga", role: "member", org: "DGDI", status: "active", created: "8 fév 2026", lastActive: "Il y a 4h", mfa: true },
    { id: "U008", name: "François Engonga", email: "f.engonga@minterieur.ga", role: "viewer", org: "Min. Intérieur", status: "invited", created: "10 fév 2026", lastActive: "Jamais", mfa: false },
    { id: "U009", name: "Isabelle Mounanga", email: "i.mounanga@pgl.ga", role: "member", org: "PGL", status: "active", created: "11 fév 2026", lastActive: "Il y a 3h", mfa: true },
    { id: "U010", name: "Marc Essono", email: "m.essono@seeg.ga", role: "org_admin", org: "SEEG", status: "active", created: "12 fév 2026", lastActive: "Il y a 15 min", mfa: true },
];

const KPIS = [
    { label: "Total utilisateurs", value: USERS_DATA.length, icon: Users, color: "from-blue-600 to-cyan-500" },
    { label: "Actifs", value: USERS_DATA.filter((u) => u.status === "active").length, icon: CheckCircle2, color: "from-emerald-600 to-green-500" },
    { label: "Suspendus", value: USERS_DATA.filter((u) => u.status === "suspended").length, icon: AlertTriangle, color: "from-red-600 to-orange-500" },
    { label: "Invités", value: USERS_DATA.filter((u) => u.status === "invited").length, icon: Clock, color: "from-violet-600 to-purple-500" },
];

/* ═══════════════════════════════════════════════
   USERS PAGE
   ═══════════════════════════════════════════════ */

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

    const filtered = useMemo(() => {
        return USERS_DATA.filter((u) => {
            if (roleFilter !== "all" && u.role !== roleFilter) return false;
            if (statusFilter !== "all" && u.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.org.toLowerCase().includes(q);
            }
            return true;
        });
    }, [search, roleFilter, statusFilter]);

    const handleAction = useCallback((action: string, user: UserData) => {
        switch (action) {
            case "view":
                toast.success(`Ouverture du profil de ${user.name}`);
                break;
            case "edit":
                toast.success(`Édition du rôle de ${user.name}`);
                break;
            case "suspend":
                toast.warning(`${user.name} a été suspendu`);
                break;
            case "reactivate":
                toast.success(`${user.name} a été réactivé`);
                break;
            case "delete":
                toast.error(`${user.name} a été supprimé`);
                break;
            case "resend":
                toast.success(`Invitation renvoyée à ${user.email}`);
                break;
        }
    }, []);

    const handleAddUser = useCallback(() => {
        toast.success("Formulaire d'invitation ouvert");
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Utilisateurs</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestion des comptes utilisateurs de la plateforme</p>
                </div>
                <Button
                    onClick={handleAddUser}
                    className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
                >
                    <UserPlus className="h-3.5 w-3.5" />
                    Inviter
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
                    <Input
                        placeholder="Rechercher par nom, email, org…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5">
                            <Shield className="h-3 w-3" />
                            {roleFilter === "all" ? "Tous les rôles" : ROLE_CFG[roleFilter].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setRoleFilter("all")} className="text-xs">Tous les rôles</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.entries(ROLE_CFG) as [UserRole, typeof ROLE_CFG[UserRole]][]).map(([key, cfg]) => (
                            <DropdownMenuItem key={key} onClick={() => setRoleFilter(key)} className="text-xs gap-2">
                                <span className={`h-2 w-2 rounded-full ${cfg.bg}`} />
                                {cfg.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 bg-white/5">
                            <Filter className="h-3 w-3" />
                            {statusFilter === "all" ? "Tous les statuts" : STATUS_CFG[statusFilter].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")} className="text-xs">Tous les statuts</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.entries(STATUS_CFG) as [UserStatus, typeof STATUS_CFG[UserStatus]][]).map(([key, cfg]) => (
                            <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)} className="text-xs gap-2">
                                <span className={`h-2 w-2 rounded-full ${cfg.bg}`} />
                                {cfg.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}</span>
            </motion.div>

            {/* Users Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Utilisateur</th>
                            <th className="text-left py-2 px-2">Rôle</th>
                            <th className="text-left py-2 px-2">Organisation</th>
                            <th className="text-left py-2 px-2 hidden md:table-cell">Dernière activité</th>
                            <th className="text-center py-2 px-2 hidden lg:table-cell">MFA</th>
                            <th className="text-center py-2 px-2">Statut</th>
                            <th className="text-center py-2 px-2 w-10">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => {
                            const role = ROLE_CFG[u.role];
                            const status = STATUS_CFG[u.status];
                            const initials = u.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                            return (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2.5 px-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-600/60 to-orange-500/60 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-white">{initials}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-2">
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${role.bg} ${role.color}`}>
                                            {role.label}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-muted-foreground">{u.org}</td>
                                    <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{u.lastActive}</td>
                                    <td className="py-2.5 px-2 text-center hidden lg:table-cell">
                                        {u.mfa ? (
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground/50">—</span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onClick={() => handleAction("view", u)} className="text-xs gap-2 cursor-pointer">
                                                    <Eye className="h-3.5 w-3.5" /> Voir le profil
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction("edit", u)} className="text-xs gap-2 cursor-pointer">
                                                    <Pencil className="h-3.5 w-3.5" /> Modifier le rôle
                                                </DropdownMenuItem>
                                                {u.status === "invited" && (
                                                    <DropdownMenuItem onClick={() => handleAction("resend", u)} className="text-xs gap-2 cursor-pointer">
                                                        <Mail className="h-3.5 w-3.5" /> Renvoyer l&apos;invitation
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {u.status === "active" ? (
                                                    <DropdownMenuItem onClick={() => handleAction("suspend", u)} className="text-xs gap-2 cursor-pointer text-amber-400">
                                                        <Ban className="h-3.5 w-3.5" /> Suspendre
                                                    </DropdownMenuItem>
                                                ) : u.status === "suspended" ? (
                                                    <DropdownMenuItem onClick={() => handleAction("reactivate", u)} className="text-xs gap-2 cursor-pointer text-emerald-400">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Réactiver
                                                    </DropdownMenuItem>
                                                ) : null}
                                                <DropdownMenuItem onClick={() => handleAction("delete", u)} className="text-xs gap-2 cursor-pointer text-destructive">
                                                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
                                    <p className="text-[11px] mt-1">Modifiez vos filtres ou votre recherche</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
