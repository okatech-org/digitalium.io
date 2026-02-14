"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Utilisateurs Institutionnel
// Gestion des membres de l'institution
// ═══════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
    Users, UserPlus, Shield, Search, Mail,
    CheckCircle2, Clock, MoreHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import { canManageTeam } from "@/config/role-helpers";

const members = [
    { name: "Ministre de la Pêche", email: "ministre-peche@digitalium.io", role: "Administrateur", level: 2, status: "active", initials: "MN" },
    { name: "Admin Pêche", email: "admin-peche@digitalium.io", role: "Co-administrateur", level: 2, status: "active", initials: "AP" },
    { name: "DGPA", email: "dgpa@digitalium.io", role: "Direction Générale", level: 3, status: "active", initials: "DG" },
    { name: "ANPA", email: "anpa@digitalium.io", role: "Agence Nationale", level: 3, status: "active", initials: "AN" },
    { name: "Inspecteur Terrain", email: "inspecteur-peche@digitalium.io", role: "Agent", level: 4, status: "active", initials: "IP" },
];

const LEVEL_COLORS: Record<number, string> = {
    2: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    3: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    4: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    5: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const LEVEL_LABELS: Record<number, string> = {
    2: "Admin",
    3: "Manager",
    4: "Membre",
    5: "Lecteur",
};

export default function InstitutionalUsersPage() {
    const { user } = useAuth();
    const { orgName } = useOrganization();
    const userLevel = user?.level ?? 4;
    const canManage = canManageTeam(userLevel);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-400" />
                        Utilisateurs
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Membres de l&apos;institution — {orgName}
                    </p>
                </div>
                {canManage && (
                    <Button size="sm" className="text-xs h-8 bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Inviter un membre
                    </Button>
                )}
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Membres actifs", value: "5", color: "text-emerald-400" },
                    { label: "Administrateurs", value: "2", color: "text-violet-400" },
                    { label: "Dernière activité", value: "2 min", color: "text-cyan-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="bg-white/[0.02] border-white/5">
                        <CardContent className="p-3 text-center">
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un membre…" className="pl-9 h-9 text-sm bg-white/5 border-white/10" />
            </div>

            {/* Members List */}
            <Card className="bg-white/[0.02] border-white/5">
                <CardContent className="p-0">
                    {members.map((member, i) => (
                        <motion.div
                            key={member.email}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors ${i < members.length - 1 ? "border-b border-white/5" : ""
                                }`}
                        >
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                                    {member.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">{member.name}</p>
                                    <Badge variant="outline" className={`text-[9px] h-4 ${LEVEL_COLORS[member.level]}`}>
                                        {LEVEL_LABELS[member.level]}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {member.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="text-[9px] h-5 bg-emerald-500/15 text-emerald-400 border-0 gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Actif
                                </Badge>
                                {canManage && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
