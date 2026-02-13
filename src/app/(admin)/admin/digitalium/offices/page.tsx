// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Espace DIGITALIUM: Bureaux
// Implantations et locaux de l'entreprise
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Plus,
    MapPin,
    Phone,
    Users,
    Layers,
    X,
    Save,
    Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────── */

interface Office {
    id: string;
    nom: string;
    type: "siege" | "annexe" | "bureau";
    adresse: string;
    ville: string;
    capacite: number;
    employes: number;
    departements: string[];
    telephone: string;
    statut: "actif" | "en_travaux";
}

/* ─── Mock Data ──────────────────────────── */

const OFFICES: Office[] = [
    {
        id: "1",
        nom: "Siège Social",
        type: "siege",
        adresse: "Blvd Triomphal, Quartier Louis",
        ville: "Libreville",
        capacite: 50,
        employes: 25,
        departements: ["Direction", "Développement", "Commercial", "Juridique"],
        telephone: "+241 77 00 00 00",
        statut: "actif",
    },
    {
        id: "2",
        nom: "Annexe Owendo",
        type: "annexe",
        adresse: "Zone Industrielle, Secteur 3",
        ville: "Owendo",
        capacite: 20,
        employes: 7,
        departements: ["Support", "Logistique"],
        telephone: "+241 77 00 00 01",
        statut: "actif",
    },
    {
        id: "3",
        nom: "Bureau Port-Gentil",
        type: "bureau",
        adresse: "Avenue du Port, Centre-ville",
        ville: "Port-Gentil",
        capacite: 10,
        employes: 3,
        departements: ["Commercial"],
        telephone: "+241 77 00 00 02",
        statut: "en_travaux",
    },
];

const TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
    siege: { label: "Siège", bg: "bg-emerald-500/15", text: "text-emerald-400" },
    annexe: { label: "Annexe", bg: "bg-teal-500/15", text: "text-teal-400" },
    bureau: { label: "Bureau", bg: "bg-blue-500/15", text: "text-blue-400" },
};

const STATUT_MAP: Record<string, { label: string; bg: string; text: string }> = {
    actif: { label: "Opérationnel", bg: "bg-emerald-500/15", text: "text-emerald-400" },
    en_travaux: { label: "En travaux", bg: "bg-amber-500/15", text: "text-amber-400" },
};

/* ═══════════════════════════════════════════ */

export default function DigitaliumOfficesPage() {
    const [showAdd, setShowAdd] = useState(false);
    const [newOffice, setNewOffice] = useState({ nom: "", adresse: "", ville: "", telephone: "" });

    const totalCapacite = OFFICES.reduce((a, o) => a + o.capacite, 0);
    const totalEmployes = OFFICES.reduce((a, o) => a + o.employes, 0);

    const handleAdd = () => {
        if (!newOffice.nom || !newOffice.ville) return;
        toast.success("Bureau ajouté", { description: `${newOffice.nom} à ${newOffice.ville}` });
        setNewOffice({ nom: "", adresse: "", ville: "", telephone: "" });
        setShowAdd(false);
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-emerald-400" />
                        Bureaux &amp; Implantations
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {OFFICES.length} implantations · {totalEmployes}/{totalCapacite} places occupées
                    </p>
                </div>
                <Button
                    onClick={() => setShowAdd(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter un bureau
                </Button>
            </motion.div>

            {/* Summary Strip */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{OFFICES.length}</p>
                        <p className="text-xs text-muted-foreground">Implantations</p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-teal-500/15 flex items-center justify-center">
                        <Users className="h-4 w-4 text-teal-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{totalEmployes}</p>
                        <p className="text-xs text-muted-foreground">Employés répartis</p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{new Set(OFFICES.map((o) => o.ville)).size}</p>
                        <p className="text-xs text-muted-foreground">Villes couvertes</p>
                    </div>
                </div>
            </motion.div>

            {/* Office Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {OFFICES.map((office) => {
                    const typeStyle = TYPE_LABELS[office.type];
                    const statutStyle = STATUT_MAP[office.statut];
                    const occupancy = Math.round((office.employes / office.capacite) * 100);

                    return (
                        <div key={office.id} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-emerald-500/20 transition-colors">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm font-semibold">{office.nom}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${typeStyle.bg} ${typeStyle.text}`}>
                                            {typeStyle.label}
                                        </Badge>
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${statutStyle.bg} ${statutStyle.text}`}>
                                            {statutStyle.label}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-emerald-400" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2.5 mb-4">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                    <p className="text-xs text-muted-foreground">{office.adresse}, {office.ville}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <p className="text-xs text-muted-foreground">{office.telephone}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <p className="text-xs text-muted-foreground">{office.departements.join(", ")}</p>
                                </div>
                            </div>

                            {/* Occupancy */}
                            <div className="pt-3 border-t border-white/5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] text-muted-foreground">Occupation</p>
                                    <p className="text-[10px] font-medium">{office.employes}/{office.capacite} ({occupancy}%)</p>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                                        style={{ width: `${occupancy}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Add Office Dialog */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-emerald-400" />
                            Ajouter un bureau
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Enregistrez une nouvelle implantation DIGITALIUM
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Nom du bureau</label>
                            <Input
                                value={newOffice.nom}
                                onChange={(e) => setNewOffice((p) => ({ ...p, nom: e.target.value }))}
                                placeholder="Ex: Bureau Franceville"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Adresse</label>
                            <Input
                                value={newOffice.adresse}
                                onChange={(e) => setNewOffice((p) => ({ ...p, adresse: e.target.value }))}
                                placeholder="Adresse complète"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Ville</label>
                                <Input
                                    value={newOffice.ville}
                                    onChange={(e) => setNewOffice((p) => ({ ...p, ville: e.target.value }))}
                                    placeholder="Libreville"
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Téléphone</label>
                                <Input
                                    value={newOffice.telephone}
                                    onChange={(e) => setNewOffice((p) => ({ ...p, telephone: e.target.value }))}
                                    placeholder="+241 ..."
                                    className="h-9 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="text-xs gap-1.5">
                                <X className="h-3 w-3" />
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAdd}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-1.5"
                            >
                                <Save className="h-3 w-3" />
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
