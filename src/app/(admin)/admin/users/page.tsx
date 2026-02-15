// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Utilisateurs
// Membres d'organisation avec données Convex
// Filtre par ?org={id} pour une org spécifique
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
    Users,
    Search,
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
    Eye,
    Key,
    ArrowLeft,
    Building2,
    Loader2,
    Briefcase,
    Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

/* ─── Types & Config ────────────────────────────── */

type MemberStatus = "active" | "invited" | "suspended";
type MemberRole = "org_admin" | "org_manager" | "org_member" | "org_viewer";

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    invited: { label: "Invité", color: "text-amber-400", bg: "bg-amber-500/15", icon: Clock },
    suspended: { label: "Suspendu", color: "text-red-400", bg: "bg-red-500/15", icon: Ban },
};

const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; bg: string }> = {
    org_admin: { label: "Admin Org", color: "text-violet-400", bg: "bg-violet-500/15" },
    org_manager: { label: "Manager", color: "text-blue-400", bg: "bg-blue-500/15" },
    org_member: { label: "Membre", color: "text-cyan-400", bg: "bg-cyan-500/15" },
    org_viewer: { label: "Lecteur", color: "text-gray-400", bg: "bg-gray-500/15" },
};

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Invite Form ─────────────────────────────── */

const EMPTY_INVITE = { nom: "", email: "", telephone: "", poste: "", role: "org_member" as MemberRole };

/* ═══════════════════════════════════════════════
   Inner component (needs Suspense for useSearchParams)
   ═══════════════════════════════════════════════ */

function UsersPageInner() {
    const searchParams = useSearchParams();
    const orgParam = searchParams.get("org");
    const organizationId = orgParam ? (orgParam as Id<"organizations">) : undefined;

    // ─── Convex queries ──────────────────────────
    const membersByOrg = useQuery(
        api.orgMembers.list,
        organizationId ? { organizationId } : "skip"
    );
    const allMembers = useQuery(
        api.orgMembers.listAll,
        organizationId ? "skip" : {}
    );
    const stats = useQuery(api.orgMembers.getStats, organizationId ? { organizationId } : {});
    const org = useQuery(
        api.organizations.getById,
        organizationId ? { id: organizationId } : "skip"
    );

    const addMember = useMutation(api.orgMembers.add);
    const removeMember = useMutation(api.orgMembers.remove);

    // Merged member list
    const members = organizationId ? membersByOrg : allMembers;
    const isLoading = members === undefined;

    // ─── Local state ─────────────────────────────
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<MemberRole | "all">("all");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);

    // ─── Filtered list ───────────────────────────
    const filteredMembers = (members ?? []).filter((m) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (m.nom?.toLowerCase().includes(q)) ||
            (m.email?.toLowerCase().includes(q)) ||
            (m.poste?.toLowerCase().includes(q)) ||
            ((m as { organisationName?: string }).organisationName?.toLowerCase().includes(q));
        const matchRole = filterRole === "all" || m.role === filterRole;
        return matchSearch && matchRole;
    });

    // ─── KPIs ────────────────────────────────────
    const kpis = [
        { label: "Total membres", value: stats?.total ?? "—", icon: Users, color: "from-blue-600 to-cyan-500" },
        { label: "Actifs", value: stats?.active ?? "—", icon: CheckCircle2, color: "from-emerald-600 to-green-500" },
        { label: "Invités", value: stats?.invited ?? "—", icon: Clock, color: "from-amber-600 to-orange-500" },
        { label: "Suspendus", value: stats?.suspended ?? "—", icon: Ban, color: "from-red-600 to-pink-500" },
    ];

    // ─── Handlers ────────────────────────────────
    const handleAction = useCallback(async (action: string, member: typeof filteredMembers[0]) => {
        const memberName = member.nom ?? "Membre";
        switch (action) {
            case "view":
                toast.info(`Profil — ${memberName}`, {
                    description: `${member.email ?? "—"} · ${member.poste ?? "—"} · ${ROLE_CONFIG[member.role as MemberRole]?.label ?? member.role}`,
                });
                break;
            case "suspend":
                toast.warning(`${memberName} suspendu`);
                break;
            case "activate":
                toast.success(`${memberName} réactivé`);
                break;
            case "remove":
                try {
                    await removeMember({ id: member._id });
                    toast.success(`${memberName} retiré de l'organisation`);
                } catch {
                    toast.error("Erreur lors de la suppression");
                }
                break;
        }
    }, [removeMember]);

    const handleInvite = useCallback(async () => {
        if (!inviteForm.nom) {
            toast.error("Champs requis", { description: "Le nom est obligatoire" });
            return;
        }
        if (!organizationId) {
            toast.error("Organisation requise", { description: "Sélectionnez une organisation via la page Organisations" });
            return;
        }
        try {
            await addMember({
                organizationId,
                nom: inviteForm.nom,
                email: inviteForm.email || undefined,
                telephone: inviteForm.telephone || undefined,
                poste: inviteForm.poste || undefined,
                role: inviteForm.role,
            });
            setInviteForm(EMPTY_INVITE);
            setShowInvite(false);
            toast.success("Membre ajouté", { description: `${inviteForm.nom}${inviteForm.email ? ` — ${inviteForm.email}` : ""}` });
        } catch {
            toast.error("Erreur lors de l'ajout");
        }
    }, [inviteForm, organizationId, addMember]);

    // Helper to get initials
    const getInitials = (nom: string | undefined) => {
        if (!nom) return "??";
        const parts = nom.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return nom.substring(0, 2).toUpperCase();
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        {organizationId && (
                            <Link href="/admin/organizations">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-400" />
                            {organizationId ? `Membres — ${org?.name ?? "…"}` : "Utilisateurs"}
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {organizationId
                            ? `${stats?.total ?? "—"} membres dans cette organisation`
                            : `${stats?.total ?? "—"} membres sur la plateforme`}
                    </p>
                </div>
                {organizationId && (
                    <Button
                        onClick={() => setShowInvite(true)}
                        className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Ajouter un membre</span>
                    </Button>
                )}
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {kpis.map((kpi) => {
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
                        placeholder="Rechercher par nom, email, poste…"
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
                    {(Object.keys(ROLE_CONFIG) as MemberRole[]).map((role) => (
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

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
            )}

            {/* Desktop Table */}
            {!isLoading && (
                <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden hidden sm:block">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left p-4 font-semibold text-muted-foreground">Membre</th>
                                    {!organizationId && (
                                        <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Organisation</th>
                                    )}
                                    <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Poste</th>
                                    <th className="text-left p-4 font-semibold text-muted-foreground">Rôle</th>
                                    <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
                                    <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Contact</th>
                                    <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member, i) => {
                                    const statusCfg = STATUS_CONFIG[member.status as MemberStatus] ?? STATUS_CONFIG.active;
                                    const roleCfg = ROLE_CONFIG[member.role as MemberRole] ?? ROLE_CONFIG.org_member;
                                    const initials = getInitials(member.nom);
                                    return (
                                        <motion.tr
                                            key={member._id}
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
                                                        <p className="font-semibold">{member.nom ?? "—"}</p>
                                                        <p className="text-muted-foreground">{member.email ?? "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {!organizationId && (
                                                <td className="p-4 hidden md:table-cell text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3" />
                                                        {(member as { organisationName?: string }).organisationName ?? "—"}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-4 hidden md:table-cell">
                                                {member.poste ? (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Briefcase className="h-3 w-3" />
                                                        {member.poste}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className={`text-[9px] ${roleCfg.bg} ${roleCfg.color} border-0`}>
                                                    {roleCfg.label}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className={`text-[9px] ${statusCfg.bg} ${statusCfg.color} border-0 gap-1`}>
                                                    {statusCfg.label}
                                                </Badge>
                                            </td>
                                            <td className="p-4 hidden lg:table-cell">
                                                {member.telephone ? (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {member.telephone}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleAction("view", member)} className="text-xs gap-2">
                                                            <Eye className="h-3.5 w-3.5" /> Voir le profil
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAction("remove", member)} className="text-xs gap-2 text-red-400">
                                                            <XCircle className="h-3.5 w-3.5" /> Retirer
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

                    {filteredMembers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">Aucun membre trouvé</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                {organizationId
                                    ? "Ajoutez des membres via le bouton ci-dessus"
                                    : "Ajustez vos filtres de recherche"}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Mobile Cards */}
            {!isLoading && (
                <motion.div variants={stagger} className="space-y-3 sm:hidden">
                    {filteredMembers.map((member, i) => {
                        const statusCfg = STATUS_CONFIG[member.status as MemberStatus] ?? STATUS_CONFIG.active;
                        const roleCfg = ROLE_CONFIG[member.role as MemberRole] ?? ROLE_CONFIG.org_member;
                        const StatusIcon = statusCfg.icon;
                        const initials = getInitials(member.nom);
                        return (
                            <motion.div
                                key={member._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                className="glass-card rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold">{member.nom ?? "—"}</p>
                                            <p className="text-[11px] text-muted-foreground">{member.email ?? "—"}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleAction("view", member)} className="text-xs gap-2">
                                                <Eye className="h-3.5 w-3.5" /> Voir le profil
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction("remove", member)} className="text-xs gap-2 text-red-400">
                                                <XCircle className="h-3.5 w-3.5" /> Retirer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary" className={`text-[9px] ${roleCfg.bg} ${roleCfg.color} border-0`}>
                                        <Shield className="h-3 w-3 mr-1" />
                                        {roleCfg.label}
                                    </Badge>
                                    <Badge variant="secondary" className={`text-[9px] ${statusCfg.bg} ${statusCfg.color} border-0 gap-1`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {statusCfg.label}
                                    </Badge>
                                    {member.poste && (
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                            {member.poste}
                                        </span>
                                    )}
                                </div>
                                {member.telephone && (
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        {member.telephone}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                    {filteredMembers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">Aucun membre trouvé</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── Dialog: Ajouter un membre ── */}
            <Dialog open={showInvite} onOpenChange={setShowInvite}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-blue-400" />
                            Ajouter un membre
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {org?.name ? `Ajouter un membre à ${org.name}` : "Ajouter un nouveau membre"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Nom complet *</Label>
                                <Input
                                    value={inviteForm.nom}
                                    onChange={(e) => setInviteForm((p) => ({ ...p, nom: e.target.value }))}
                                    placeholder="Marie NDONG"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Poste</Label>
                                <Input
                                    value={inviteForm.poste}
                                    onChange={(e) => setInviteForm((p) => ({ ...p, poste: e.target.value }))}
                                    placeholder="Directeur Commercial"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <Input
                                    type="email"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="m.ndong@exemple.ga"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Téléphone</Label>
                                <Input
                                    value={inviteForm.telephone}
                                    onChange={(e) => setInviteForm((p) => ({ ...p, telephone: e.target.value }))}
                                    placeholder="+241 06 00 00 00"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Rôle</Label>
                            <Select
                                value={inviteForm.role}
                                onValueChange={(v) => setInviteForm((p) => ({ ...p, role: v as MemberRole }))}
                            >
                                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(ROLE_CONFIG) as MemberRole[]).map((role) => (
                                        <SelectItem key={role} value={role} className="text-xs">
                                            {ROLE_CONFIG[role].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)} className="text-xs">
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleInvite}
                                className="bg-gradient-to-r from-blue-600 to-violet-500 text-white hover:opacity-90 text-xs gap-1.5"
                            >
                                <UserPlus className="h-3 w-3" />
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   EXPORT with Suspense (required for useSearchParams)
   ═══════════════════════════════════════════════ */

export default function AdminUsersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        }>
            <UsersPageInner />
        </Suspense>
    );
}
