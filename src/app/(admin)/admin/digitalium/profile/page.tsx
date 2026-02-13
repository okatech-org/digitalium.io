// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Espace DIGITALIUM: Profil Entreprise
// Informations légales et paramètres DIGITALIUM
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
    Sparkles,
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

/* ─── Modules Info ───────────────────────── */

const MODULES = [
    { name: "iDocument", icon: FileText, count: 2847, label: "documents", color: "blue" },
    { name: "iArchive", icon: Archive, count: 1234, label: "archives", color: "amber" },
    { name: "iSignature", icon: PenTool, count: 567, label: "signatures", color: "violet" },
];

const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-400" },
};

/* ═══════════════════════════════════════════ */

export default function DigitaliumProfilePage() {
    const [form, setForm] = useState({
        nom: "DIGITALIUM SARL",
        secteur: "Technologies & Services numériques",
        rccm: "GA-LBV-2024-B-12345",
        nif: "20240012345P",
        email: "contact@digitalium.ga",
        telephone: "+241 77 00 00 00",
        adresse: "Blvd Triomphal, Quartier Louis, Libreville, Gabon",
        siteWeb: "https://digitalium.io",
        fuseauHoraire: "Africa/Libreville",
        devise: "XAF",
        langue: "fr",
    });

    const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

    const handleSave = () => {
        toast.success("Profil enregistré", { description: "Les modifications ont été sauvegardées" });
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building className="h-6 w-6 text-emerald-400" />
                        Profil Entreprise
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Informations légales et coordonnées de DIGITALIUM</p>
                </div>
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Save className="h-3.5 w-3.5" />
                    Enregistrer
                </Button>
            </motion.div>

            {/* Identity Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Building className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold">Identité</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Raison sociale</label>
                        <Input value={form.nom} onChange={(e) => update("nom", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Secteur d&apos;activité</label>
                        <Input value={form.secteur} onChange={(e) => update("secteur", e.target.value)} className="h-9 text-xs bg-white/5 border-white/10" />
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
                    <Globe className="h-4 w-4 text-emerald-400" />
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
                </div>
            </motion.div>

            {/* Settings Section */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold">Paramètres régionaux</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Devise</label>
                        <Select value={form.devise} onValueChange={(v) => update("devise", v)}>
                            <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="XAF">XAF — Franc CFA (CEMAC)</SelectItem>
                                <SelectItem value="EUR">EUR — Euro</SelectItem>
                                <SelectItem value="USD">USD — Dollar US</SelectItem>
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
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3 px-1">Modules proposés</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MODULES.map((mod) => {
                        const Icon = mod.icon;
                        const colors = MODULE_COLORS[mod.color];
                        return (
                            <div key={mod.name} className="glass-card rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`h-9 w-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                        <Icon className={`h-4 w-4 ${colors.text}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{mod.name}</p>
                                        <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400">Actif</Badge>
                                    </div>
                                </div>
                                <p className="text-lg font-bold">{mod.count.toLocaleString("fr-FR")}</p>
                                <p className="text-[10px] text-muted-foreground">{mod.label} sur la plateforme</p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
