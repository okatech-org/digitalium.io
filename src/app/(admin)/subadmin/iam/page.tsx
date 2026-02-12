// DIGITALIUM.IO — SubAdmin: IAM
"use client";
import React from "react";
import { motion } from "framer-motion";
import { KeyRound, UserPlus, Search, Shield, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const USERS = [
    { name: "Jean-Pierre Ondo", email: "jp.ondo@digitalium.ga", role: "Administrateur", modules: ["iDocument", "iArchive", "iSignature"], mfa: true, status: "active" },
    { name: "Marie Nzé", email: "m.nze@digitalium.ga", role: "Manager", modules: ["iDocument", "iArchive", "iSignature"], mfa: true, status: "active" },
    { name: "Patrick Obiang", email: "p.obiang@digitalium.ga", role: "Manager", modules: ["iDocument", "iSignature"], mfa: true, status: "active" },
    { name: "Sylvie Moussavou", email: "s.moussavou@digitalium.ga", role: "Membre", modules: ["iDocument", "iArchive"], mfa: false, status: "active" },
    { name: "David Mba", email: "d.mba@digitalium.ga", role: "Membre", modules: ["iDocument"], mfa: true, status: "active" },
    { name: "Chantal Ayo", email: "c.ayo@digitalium.ga", role: "Membre", modules: ["iDocument", "iSignature"], mfa: true, status: "active" },
    { name: "Robert Ndong", email: "r.ndong@digitalium.ga", role: "Lecteur", modules: ["iDocument"], mfa: false, status: "suspended" },
];

export default function SubAdminIAMPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><KeyRound className="h-6 w-6 text-violet-400" /> IAM</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestion des accès & permissions DIGITALIUM</p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"><UserPlus className="h-3.5 w-3.5" /> Inviter</Button>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold">{USERS.length}</p><p className="text-[10px] text-muted-foreground">Membres</p></div>
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold text-violet-400">{USERS.filter(u => u.role === "Manager" || u.role === "Administrateur").length}</p><p className="text-[10px] text-muted-foreground">Admins/Managers</p></div>
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold text-emerald-400">{USERS.filter(u => u.mfa).length}</p><p className="text-[10px] text-muted-foreground">MFA activé</p></div>
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold text-red-400">{USERS.filter(u => u.status === "suspended").length}</p><p className="text-[10px] text-muted-foreground">Suspendus</p></div>
            </motion.div>
            <motion.div variants={fadeUp} className="relative max-w-[320px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher…" className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Membre</th><th className="text-left py-2 px-2">Rôle</th><th className="text-left py-2 px-2 hidden md:table-cell">Modules</th><th className="text-center py-2 px-2">MFA</th><th className="text-center py-2 px-2">Statut</th></tr></thead>
                    <tbody>
                        {USERS.map((u, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2"><p className="font-medium">{u.name}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></td>
                                <td className="py-2.5 px-2"><Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">{u.role}</Badge></td>
                                <td className="py-2.5 px-2 hidden md:table-cell"><div className="flex gap-1 flex-wrap">{u.modules.map(m => <Badge key={m} variant="secondary" className="text-[9px] bg-white/5 border-0">{m}</Badge>)}</div></td>
                                <td className="py-2.5 px-2 text-center">{u.mfa ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                                <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className={`text-[9px] border-0 ${u.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>{u.status === "active" ? "Actif" : "Suspendu"}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
