// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Organisation Client
// Profil et configuration de l'organisme connecté
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Building,
    Save,
    Globe,
    Mail,
    Phone,
    MapPin,
    FileText,
    Archive,
    PenTool,
    Users,
    HardDrive,
    Sparkles,
    Crown,
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
import { toast } from "sonner";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Module Colors ──────────────────────── */

const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-400" },
};

const MODULES_ACTIFS = [
    { name: "iDocument", icon: FileText, usage: "1 248 documents", color: "blue", actif: true },
    { name: "iArchive", icon: Archive, usage: "456 archives", color: "amber", actif: true },
    { name: "iSignature", icon: PenTool, usage: "89 signatures", color: "violet", actif: true },
];

/* ═══════════════════════════════════════════ */

export default function OrganizationPage() {
    const [form, setForm] = useState({
        nom: "SEEG",
        secteurActivite: "Énergie & Eau",
        rccm: "GA-LBV-2018-A-56789",
        nif: "20180056789E",
        email: "contact@seeg.ga",
        telephone: "+241 01 76 31 00",
        adresse: "Boulevard Léon Mba, Centre-ville, Libreville, Gabon",
        siteWeb: "https://seeg.ga",
        plan: "enterprise",
        fuseauHoraire: "Africa/Libreville",
        langue: "fr",
    });

    const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

    const handleSave = () => {
        toast.success("Organisation mise à jour", { description: "Les modifications ont été sauvegardées" });
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building className="h-6 w-6 text-violet-400" />
                        Organisation — {form.nom}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Profil et configuration de l&apos;organisme client connecté</p>
                </div>
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Save className="h-3.5 w-3.5" />
                    Enregistrer
                </Button>
            </motion.div>

            {/* Plan + Quotas Strip */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Enterprise</p>
                        <p className="text-[10px] text-muted-foreground">Plan actif</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400 ml-auto">Actif</Badge>
                </div>
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">47 <span className="text-[10px] font-normal text-muted-foreground">/ illimité</span></p>
                        <p className="text-[10px] text-muted-foreground">Membres</p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <HardDrive className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">34.2 GB <span className="text-[10px] font-normal text-muted-foreground">/ 100 GB</span></p>
                        <p className="text-[10px] text-muted-foreground">Stockage</p>
                    </div>
                    <div className="ml-auto w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-[34%] rounded-full bg-amber-400" />
                    </div>
                </div>
            </motion.div>

            {/* Identity Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Building className="h-4 w-4 text-violet-400" />
                    <h2 className="text-sm font-semibold">Identité</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Raison sociale</label>
                        <Input value={form.nom} onChange={(e) => update("nom", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Secteur d&apos;activité</label>
                        <Input value={form.secteurActivite} onChange={(e) => update("secteurActivite", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">RCCM</label>
                        <Input value={form.rccm} onChange={(e) => update("rccm", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">NIF</label>
                        <Input value={form.nif} onChange={(e) => update("nif", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-violet-400" />
                    <h2 className="text-sm font-semibold">Coordonnées</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                            <Mail className="h-3 w-3 inline mr-1" />Email
                        </label>
                        <Input value={form.email} onChange={(e) => update("email", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                            <Phone className="h-3 w-3 inline mr-1" />Téléphone
                        </label>
                        <Input value={form.telephone} onChange={(e) => update("telephone", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />Adresse
                        </label>
                        <Input value={form.adresse} onChange={(e) => update("adresse", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Site web</label>
                        <Input value={form.siteWeb} onChange={(e) => update("siteWeb", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Plan</label>
                        <Select value={form.plan} onValueChange={(v) => update("plan", v)}>
                            <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            {/* Regional Settings */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    <h2 className="text-sm font-semibold">Paramètres régionaux</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Fuseau horaire</label>
                        <Select value={form.fuseauHoraire} onValueChange={(v) => update("fuseauHoraire", v)}>
                            <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Africa/Libreville">Africa/Libreville (GMT+1)</SelectItem>
                                <SelectItem value="Africa/Douala">Africa/Douala (GMT+1)</SelectItem>
                                <SelectItem value="Europe/Paris">Europe/Paris (GMT+1/+2)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Langue</label>
                        <Select value={form.langue} onValueChange={(v) => update("langue", v)}>
                            <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            {/* Active Modules */}
            <motion.div variants={fadeUp}>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3 px-1">Modules activés</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MODULES_ACTIFS.map((mod) => {
                        const Icon = mod.icon;
                        const colors = MODULE_COLORS[mod.color];
                        return (
                            <div key={mod.name} className="glass-card rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`h-9 w-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                        <Icon className={`h-4 w-4 ${colors.text}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{mod.name}</p>
                                        <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400">Actif</Badge>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{mod.usage}</p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
