"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Utilisateurs Institutionnel
// Gestion interne — Connectée à Convex
// ═══════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, UserPlus, Search, Mail,
    CheckCircle2, Clock, MoreHorizontal,
    ShieldAlert, Key, Ban, UserCheck, Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import { canManageTeam } from "@/config/role-helpers";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

const LEVEL_COLORS: Record<number, string> = {
    1: "bg-red-500/15 text-red-400 border-red-500/20",
    2: "bg-amber-500/15 text-amber-500 border-amber-500/20",
    3: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    4: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    5: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

const LEVEL_LABELS: Record<number, string> = {
    1: "Super Admin",
    2: "Admin",
    3: "Manager",
    4: "Membre",
    5: "Invité/Lecteur",
};

export default function InstitutionalUsersPage() {
    const { user } = useAuth();
    const { orgName, orgId: currentOrgId } = useOrganization();
    
    // Auth configuration
    const userRole = "admin";
    const userLevel = user?.level ?? 4;
    const isOwner = false;
    const isAdmin = isOwner || userRole === "admin" || userLevel <= 2;
    const canManage = canManageTeam(userLevel);

    // Context & State
    const [searchQuery, setSearchQuery] = useState("");

    // ─── Data fetching ───────────────────────────
    
    // Fetch organization members
    const members = useQuery(
        api.orgMembers.list,
        currentOrgId ? { organizationId: currentOrgId as Id<"organizations"> } : "skip"
    );

    // Fetch member statistics
    const stats = useQuery(
        api.orgMembers.getStats,
        currentOrgId ? { organizationId: currentOrgId as Id<"organizations"> } : "skip"
    );

    // ─── Filtering & Memoization ─────────────────

    const filteredMembers = useMemo(() => {
        if (!members) return [];
        return members.filter((m) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                m.email?.toLowerCase().includes(q) ||
                (m.userId && m.userId.toLowerCase().includes(q))
            );
        });
    }, [members, searchQuery]);

    // ─── Handlers ────────────────────────────────

    const handleInvite = () => {
        toast.info("L'envoi d'invitations est en cours de développement. (Bientôt disponible)");
    };

    const handleAction = (action: string) => {
        switch (action) {
            case "revoke":
                toast.error("Révocation de l'accès...");
                break;
            case "resend":
                toast.success("Invitation renvoyée !");
                break;
            case "role":
                toast.info("Modification du rôle...");
                break;
            default:
                break;
        }
    };

    // ─── Render ──────────────────────────────────

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-amber-500" />
                        Utilisateurs
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gérez les accès et les permissions de l&apos;institution — {orgName}
                    </p>
                </div>
                {canManage && (
                    <Button 
                        size="sm" 
                        onClick={handleInvite}
                        className="text-xs h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm transition-all"
                    >
                        <UserPlus className="h-4 w-4 mr-1.5" /> 
                        Inviter un collaborateur
                    </Button>
                )}
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total des membres", value: stats?.total ?? 0, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Membres actifs", value: stats?.active ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Invitations en attente", value: stats?.invited ?? 0, icon: Mail, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Comptes suspendus", value: stats?.suspended ?? 0, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="glass border-white/5 h-full">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold font-mono">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Search and Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Rechercher par adresse email…" 
                                    className="pl-9 h-9 text-sm bg-white/5 border-white/10 focus-visible:ring-amber-500/30" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Members List */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass border-white/5 overflow-hidden">
                    {filteredMembers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchQuery ? "Aucun utilisateur trouvé pour cette recherche." : "Aucun utilisateur dans cette organisation."}
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredMembers.map((member) => (
                                    <motion.div
                                        key={member._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        {/* Avatar */}
                                        <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                            <AvatarFallback className="bg-amber-500/10 text-amber-500 text-sm font-semibold">
                                                {member.email?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold truncate">
                                                    {member.userId ? "Utilisateur enregistré" : "Invitation en attente"}
                                                </p>
                                                {member.role === "org_admin" && (
                                                    <Badge className="h-4 px-1.5 text-[9px] bg-amber-500/20 text-amber-500 hover:bg-amber-500/20 border-0">
                                                        Propriétaire
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {member.email}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Role / Level */}
                                        <div className="hidden md:flex flex-col items-end gap-1 shrink-0 w-32">
                                            <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[member.level]}`}>
                                                <ShieldAlert className="h-3 w-3 mr-1" />
                                                {LEVEL_LABELS[member.level]}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground capitalize">
                                                Rôle métier: {member.businessRoleId ? "Assilié" : "Non défini"}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className="hidden sm:flex items-center justify-end shrink-0 w-28">
                                            {member.status === "active" && (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0 flex gap-1 items-center h-6">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Actif
                                                </Badge>
                                            )}
                                            {member.status === "invited" && (
                                                <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0 flex gap-1 items-center h-6">
                                                    <Clock className="h-3.5 w-3.5" /> Invité
                                                </Badge>
                                            )}
                                            {member.status === "suspended" && (
                                                <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0 flex gap-1 items-center h-6">
                                                    <Ban className="h-3.5 w-3.5" /> Suspendu
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {canManage && (
                                            <div className="shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 glass border-white/10">
                                                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem onClick={() => handleAction("role")} className="text-xs cursor-pointer hover:bg-white/10">
                                                            <Key className="h-4 w-4 mr-2" /> Modifier le rôle
                                                        </DropdownMenuItem>
                                                        
                                                        {member.status === "invited" && (
                                                            <DropdownMenuItem onClick={() => handleAction("resend")} className="text-xs cursor-pointer hover:bg-white/10">
                                                                <Mail className="h-4 w-4 mr-2" /> Renvoyer l&apos;invitation
                                                            </DropdownMenuItem>
                                                        )}
                                                        
                                                        {(isAdmin || !["owner", "admin"].includes(member.role)) && (
                                                            <>
                                                                <DropdownMenuSeparator className="bg-white/10" />
                                                                {member.status === "active" ? (
                                                                    <DropdownMenuItem onClick={() => handleAction("revoke")} className="text-xs cursor-pointer text-amber-500 hover:text-amber-400 hover:bg-white/10">
                                                                        <Ban className="h-4 w-4 mr-2" /> Suspendre l&apos;accès
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem onClick={() => handleAction("revoke")} className="text-xs cursor-pointer text-emerald-500 hover:text-emerald-400 hover:bg-white/10">
                                                                        <UserCheck className="h-4 w-4 mr-2" /> Réactiver l&apos;accès
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleAction("revoke")} className="text-xs cursor-pointer text-red-500 hover:text-red-400 hover:bg-white/10 mt-1">
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Retirer de l&apos;organisation
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
