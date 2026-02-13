// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Organisation Client: Structure
// Départements et bureaux de l'organisme connecté
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Network,
    Building2,
    Plus,
    Users,
    MapPin,
    Phone,
    ChevronRight,
    Layers,
    X,
    Save,
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

interface Departement {
    id: string;
    nom: string;
    responsable: string;
    membres: number;
    sousServices: string[];
    couleur: string;
}

interface Bureau {
    id: string;
    nom: string;
    adresse: string;
    ville: string;
    employes: number;
    departements: string[];
    telephone: string;
}

/* ─── Mock Data — Structure SEEG ─────────── */

const DEPARTEMENTS: Departement[] = [
    { id: "1", nom: "Direction Générale", responsable: "Pierre Nguema", membres: 5, sousServices: ["Secrétariat Général", "Communication"], couleur: "violet" },
    { id: "2", nom: "Technique", responsable: "Éric Assoumou", membres: 18, sousServices: ["Production Électrique", "Distribution Eau", "Maintenance", "Réseau"], couleur: "blue" },
    { id: "3", nom: "Commercial", responsable: "Jacques Mouele", membres: 12, sousServices: ["Ventes Entreprises", "Ventes Particuliers", "Recouvrement"], couleur: "emerald" },
    { id: "4", nom: "Administratif", responsable: "Hélène Mboumba", membres: 8, sousServices: ["Ressources Humaines", "Comptabilité", "Logistique"], couleur: "amber" },
    { id: "5", nom: "Juridique", responsable: "Rose Mintsa", membres: 4, sousServices: ["Contentieux", "Conformité"], couleur: "rose" },
];

const BUREAUX: Bureau[] = [
    { id: "1", nom: "Siège Social", adresse: "Boulevard Léon Mba, Centre-ville", ville: "Libreville", employes: 32, departements: ["Direction Générale", "Administratif", "Juridique", "Commercial"], telephone: "+241 01 76 31 00" },
    { id: "2", nom: "Centre Technique", adresse: "Zone Industrielle d'Oloumi", ville: "Libreville", employes: 15, departements: ["Technique"], telephone: "+241 01 76 31 10" },
    { id: "3", nom: "Agence Owendo", adresse: "Avenue principale, Centre", ville: "Owendo", employes: 6, departements: ["Commercial", "Technique"], telephone: "+241 01 76 31 20" },
];

const DEPT_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/15" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/15" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/15" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", iconBg: "bg-rose-500/15" },
};

/* ═══════════════════════════════════════════ */

export default function OrganizationStructurePage() {
    const [showAddDept, setShowAddDept] = useState(false);
    const [newDept, setNewDept] = useState({ nom: "", responsable: "" });

    const totalMembres = DEPARTEMENTS.reduce((a, d) => a + d.membres, 0);

    const handleAddDept = () => {
        if (!newDept.nom) return;
        toast.success("Département ajouté", { description: newDept.nom });
        setNewDept({ nom: "", responsable: "" });
        setShowAddDept(false);
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Network className="h-6 w-6 text-violet-400" />
                        Structure — SEEG
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {DEPARTEMENTS.length} départements · {BUREAUX.length} bureaux · {totalMembres} membres
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddDept(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter un département
                </Button>
            </motion.div>

            {/* ─── Départements ──────────────────────── */}
            <motion.div variants={fadeUp}>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3 px-1">Départements</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEPARTEMENTS.map((dept) => {
                        const colors = DEPT_COLORS[dept.couleur];
                        return (
                            <div key={dept.id} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-violet-500/20 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                                            <Layers className={`h-5 w-5 ${colors.text}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{dept.nom}</p>
                                            <p className="text-[10px] text-muted-foreground">Resp: {dept.responsable}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${colors.bg} ${colors.text}`}>
                                        {dept.membres} membres
                                    </Badge>
                                </div>

                                {/* Sous-services */}
                                <div className="space-y-1 mt-3 pt-3 border-t border-white/5">
                                    {dept.sousServices.map((ss) => (
                                        <div key={ss} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <ChevronRight className="h-2.5 w-2.5 shrink-0" />
                                            <span>{ss}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ─── Bureaux ───────────────────────────── */}
            <motion.div variants={fadeUp}>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3 px-1">Bureaux &amp; Implantations</p>
                <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {BUREAUX.map((bureau) => (
                            <div key={bureau.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <Building2 className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{bureau.nom}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5" />{bureau.adresse}, {bureau.ville}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-2.5 w-2.5" />{bureau.telephone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs font-medium">{bureau.employes} employés</p>
                                        <p className="text-[10px] text-muted-foreground">{bureau.departements.join(", ")}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400 shrink-0">
                                        <Users className="h-2.5 w-2.5 mr-1" />
                                        {bureau.employes}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Add Department Dialog */}
            <Dialog open={showAddDept} onOpenChange={setShowAddDept}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-violet-400" />
                            Ajouter un département
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Créez un nouveau département dans l&apos;organisation SEEG
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Nom du département</label>
                            <Input
                                value={newDept.nom}
                                onChange={(e) => setNewDept((p) => ({ ...p, nom: e.target.value }))}
                                placeholder="Ex: Marketing"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Responsable</label>
                            <Input
                                value={newDept.responsable}
                                onChange={(e) => setNewDept((p) => ({ ...p, responsable: e.target.value }))}
                                placeholder="Nom du responsable"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowAddDept(false)} className="text-xs gap-1.5">
                                <X className="h-3 w-3" />
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAddDept}
                                className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5"
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
