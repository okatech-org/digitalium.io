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
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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

/* ─── Role mapping & config ──────────────────────────── */

const ROLES = [
    { key: "system_admin", label: "System Admin", level: 0, color: "text-red-400 bg-red-500/15" },
    { key: "platform_admin", label: "Platform Admin", level: 1, color: "text-orange-400 bg-orange-500/15" },
    { key: "admin", label: "Admin Org", level: 2, color: "text-violet-400 bg-violet-500/15" },
    { key: "membre", label: "Membre", level: 4, color: "text-emerald-400 bg-emerald-500/15" },
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

    // ─── Fetch real data from Convex ───
    const membersQuery = useQuery(api.orgMembers.listAll);
    const orgsQuery = useQuery(api.organizations.list);

    const members = membersQuery ?? [];
    const orgsList = useMemo(() => {
        if (!orgsQuery) return [];
        return Array.from(new Set(orgsQuery.map((o: any) => o.name))).sort();
    }, [orgsQuery]);

    // Format member data to match the UI expectations
    const usersList = useMemo(() => {
        return members.map((m: any) => ({
            id: m._id,
            name: m.nom || m.email?.split("@")[0] || "Inconnu",
            email: m.email || "—",
            role: m.role || "membre",
            org: m.organisationName || "—",
            status: m.status || "active",
            lastActive: "—", // Would need a presence system to be accurate
            mfa: false, // Would need to fetch from Clerk/auth provider
        }));
    }, [members]);

    const filtered = useMemo(() => {
        return usersList.filter((u: any) => {
            const matchSearch =
                search === "" ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase());
            const matchRole = roleFilter === "all" || u.role === roleFilter;
            const matchOrg = orgFilter === "all" || u.org === orgFilter;
            return matchSearch && matchRole && matchOrg;
        });
    }, [usersList, search, roleFilter, orgFilter]);

    const getRoleBadge = (roleKey: string) => {
        const r = ROLES.find((r) => r.key === roleKey);
        if (!r) return (
            <Badge variant="secondary" className="text-[9px] border-0 bg-white/10 text-white/50">
                {roleKey}
            </Badge>
        );
        return (
            <Badge variant="secondary" className={`text-[9px] border-0 ${r.color}`}>
                L{r.level} · {r.label}
            </Badge>
        );
    };

    const stats = useMemo(() => {
        const byRole: Record<string, number> = {};
        usersList.forEach((u: any) => {
            byRole[u.role] = (byRole[u.role] || 0) + 1;
        });
        return { total: usersList.length, byRole, mfaEnabled: usersList.filter((u: any) => u.mfa).length };
    }, [usersList]);

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
                    <p className="text-2xl font-bold">{stats.mfaEnabled}</p>
                    <p className="text-[10px] text-muted-foreground">MFA activé</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold">{orgsList.length}</p>
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
                        {orgsList.map((org: string) => (
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
                            {membersQuery === undefined ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="py-2.5 px-2"><Skeleton className="h-8 w-40 bg-white/5" /></td>
                                        <td className="py-2.5 px-2"><Skeleton className="h-4 w-24 bg-white/5" /></td>
                                        <td className="py-2.5 px-2"><Skeleton className="h-4 w-20 bg-white/5" /></td>
                                        <td className="py-2.5 px-2"><Skeleton className="h-4 w-16 bg-white/5 mx-auto" /></td>
                                        <td className="py-2.5 px-2 hidden md:table-cell"><Skeleton className="h-4 w-4 bg-white/5 mx-auto" /></td>
                                        <td className="py-2.5 px-2 hidden lg:table-cell"><Skeleton className="h-4 w-16 bg-white/5" /></td>
                                        <td className="py-2.5 px-2"><Skeleton className="h-6 w-6 bg-white/5 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                                        Aucun utilisateur trouvé correspondant à vos critères.
                                    </td>
                                </tr>
                            ) : filtered.map((user: any) => {
                                const st = (statusCfg as any)[user.status] || { label: user.status, color: "bg-white/10 text-white/50" };
                                return (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-2.5 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-600/30 to-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-300">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[11px]">{user.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-2">
                                            <span className="text-[11px] text-white/70">{user.org}</span>
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
