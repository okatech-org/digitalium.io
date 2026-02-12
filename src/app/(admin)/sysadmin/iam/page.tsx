// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: IAM (Identity & Access Management)
// Users/roles table, assign/revoke, filter by org & role
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    KeyRound,
    Shield,
    Users,
    UserPlus,
    Search,
    ChevronDown,
    MoreHorizontal,
    Mail,
    Building2,
    Check,
    X,
    Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Mock data ──────────────────────────────────── */

const ROLES = [
    { key: "system_admin", label: "System Admin", level: 0, color: "text-red-400 bg-red-500/15" },
    { key: "platform_admin", label: "Platform Admin", level: 1, color: "text-orange-400 bg-orange-500/15" },
    { key: "org_admin", label: "Org Admin", level: 2, color: "text-blue-400 bg-blue-500/15" },
    { key: "org_manager", label: "Manager", level: 3, color: "text-violet-400 bg-violet-500/15" },
    { key: "org_member", label: "Membre", level: 4, color: "text-emerald-400 bg-emerald-500/15" },
    { key: "viewer", label: "Lecteur", level: 5, color: "text-muted-foreground bg-white/5" },
];

const ORGANIZATIONS = [
    "DGDI", "Port-Gentil Logistique", "Ministère de l'Intérieur", "Gabon Télécom", "SEEG", "Okoumé Capital",
];

const MOCK_USERS = [
    { id: "1", name: "Jean-Pierre Ondo", email: "jp.ondo@dgdi.ga", role: "system_admin", org: "DGDI", status: "active" as const, lastActive: "En ligne", mfa: true },
    { id: "2", name: "Marie Nzé", email: "m.nze@dgdi.ga", role: "platform_admin", org: "DGDI", status: "active" as const, lastActive: "Il y a 5 min", mfa: true },
    { id: "3", name: "Patrick Obiang", email: "p.obiang@minterieur.ga", role: "org_admin", org: "Ministère de l'Intérieur", status: "active" as const, lastActive: "Il y a 1h", mfa: true },
    { id: "4", name: "Sylvie Moussavou", email: "s.moussavou@pgl.ga", role: "org_manager", org: "Port-Gentil Logistique", status: "active" as const, lastActive: "Il y a 3h", mfa: false },
    { id: "5", name: "David Mba", email: "d.mba@gabtelecom.ga", role: "org_member", org: "Gabon Télécom", status: "active" as const, lastActive: "Hier", mfa: true },
    { id: "6", name: "Chantal Ayo", email: "c.ayo@seeg.ga", role: "org_admin", org: "SEEG", status: "active" as const, lastActive: "Il y a 2h", mfa: true },
    { id: "7", name: "Robert Ndong", email: "r.ndong@okcapital.ga", role: "org_manager", org: "Okoumé Capital", status: "suspended" as const, lastActive: "Il y a 7j", mfa: false },
    { id: "8", name: "Alice Bekale", email: "a.bekale@dgdi.ga", role: "org_member", org: "DGDI", status: "active" as const, lastActive: "Il y a 30 min", mfa: true },
    { id: "9", name: "François Engonga", email: "f.engonga@minterieur.ga", role: "viewer", org: "Ministère de l'Intérieur", status: "invited" as const, lastActive: "Jamais", mfa: false },
    { id: "10", name: "Isabelle Mounanga", email: "i.mounanga@pgl.ga", role: "org_member", org: "Port-Gentil Logistique", status: "active" as const, lastActive: "Il y a 4h", mfa: true },
];

const statusCfg = {
    active: { label: "Actif", color: "bg-emerald-500/15 text-emerald-400" },
    suspended: { label: "Suspendu", color: "bg-red-500/15 text-red-400" },
    invited: { label: "Invité", color: "bg-blue-500/15 text-blue-400" },
};

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function IAMPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [orgFilter, setOrgFilter] = useState<string>("all");

    const filtered = useMemo(() => {
        return MOCK_USERS.filter((u) => {
            const matchSearch =
                search === "" ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase());
            const matchRole = roleFilter === "all" || u.role === roleFilter;
            const matchOrg = orgFilter === "all" || u.org === orgFilter;
            return matchSearch && matchRole && matchOrg;
        });
    }, [search, roleFilter, orgFilter]);

    const getRoleBadge = (roleKey: string) => {
        const r = ROLES.find((r) => r.key === roleKey);
        if (!r) return null;
        return (
            <Badge variant="secondary" className={`text-[9px] border-0 ${r.color}`}>
                L{r.level} · {r.label}
            </Badge>
        );
    };

    const stats = useMemo(() => {
        const byRole: Record<string, number> = {};
        MOCK_USERS.forEach((u) => {
            byRole[u.role] = (byRole[u.role] || 0) + 1;
        });
        return { total: MOCK_USERS.length, byRole, mfaEnabled: MOCK_USERS.filter((u) => u.mfa).length };
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">IAM — Gestion des accès</h1>
                    <p className="text-sm text-muted-foreground mt-1">Utilisateurs, rôles & permissions</p>
                </div>
                <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                    <UserPlus className="h-3.5 w-3.5" />
                    Inviter un utilisateur
                </Button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-[10px] text-muted-foreground">Total utilisateurs</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold text-orange-400">
                        {(stats.byRole["system_admin"] || 0) + (stats.byRole["platform_admin"] || 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Administrateurs</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">{stats.mfaEnabled}</p>
                    <p className="text-[10px] text-muted-foreground">MFA activé</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold">{ORGANIZATIONS.length}</p>
                    <p className="text-[10px] text-muted-foreground">Organisations</p>
                </div>
            </motion.div>

            {/* Role distribution */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-400" />
                    Distribution des rôles
                </h2>
                <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                        <div key={r.key} className="glass-card rounded-lg px-3 py-2 flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[9px] border-0 ${r.color}`}>
                                L{r.level}
                            </Badge>
                            <span className="text-xs font-medium">{r.label}</span>
                            <span className="text-xs text-muted-foreground ml-1">{stats.byRole[r.key] || 0}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom ou email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white/5 border-white/10"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10">
                            <Filter className="h-3 w-3" />
                            {roleFilter === "all" ? "Tous les rôles" : ROLES.find((r) => r.key === roleFilter)?.label}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuItem className="text-xs" onClick={() => setRoleFilter("all")}>
                            Tous les rôles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ROLES.map((r) => (
                            <DropdownMenuItem key={r.key} className="text-xs" onClick={() => setRoleFilter(r.key)}>
                                <span className={`mr-1.5 h-2 w-2 rounded-full inline-block ${r.color.split(" ")[1]}`} />
                                {r.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10">
                            <Building2 className="h-3 w-3" />
                            {orgFilter === "all" ? "Toutes les orgs" : orgFilter}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                        <DropdownMenuItem className="text-xs" onClick={() => setOrgFilter("all")}>
                            Toutes les organisations
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ORGANIZATIONS.map((org) => (
                            <DropdownMenuItem key={org} className="text-xs" onClick={() => setOrgFilter(org)}>
                                {org}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-xs text-muted-foreground ml-auto">{filtered.length} résultat(s)</span>
            </motion.div>

            {/* Users Table */}
            <motion.div variants={fadeUp}>
                <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="text-left py-2 px-2 font-medium">Utilisateur</th>
                                <th className="text-left py-2 px-2 font-medium">Organisation</th>
                                <th className="text-left py-2 px-2 font-medium">Rôle</th>
                                <th className="text-center py-2 px-2 font-medium">Statut</th>
                                <th className="text-center py-2 px-2 font-medium hidden md:table-cell">MFA</th>
                                <th className="text-left py-2 px-2 font-medium hidden lg:table-cell">Dernière activité</th>
                                <th className="text-center py-2 px-2 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user) => {
                                const st = statusCfg[user.status];
                                return (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-2.5 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-600/30 to-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-300">
                                                    {user.name.split(" ").map((n) => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[11px]">{user.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-2">
                                            <span className="text-[11px]">{user.org}</span>
                                        </td>
                                        <td className="py-2.5 px-2">{getRoleBadge(user.role)}</td>
                                        <td className="py-2.5 px-2 text-center">
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${st.color}`}>
                                                {st.label}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-2 text-center hidden md:table-cell">
                                            {user.mfa ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-2.5 px-2 text-muted-foreground hidden lg:table-cell text-[10px]">
                                            {user.lastActive}
                                        </td>
                                        <td className="py-2.5 px-2 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuLabel className="text-[10px]">Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                                        <Shield className="h-3 w-3" /> Modifier le rôle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                                        <Mail className="h-3 w-3" /> Envoyer une invitation
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-xs gap-2 text-destructive cursor-pointer">
                                                        <X className="h-3 w-3" /> Révoquer l&apos;accès
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
