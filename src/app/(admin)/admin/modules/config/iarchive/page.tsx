// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules Config: iArchive
// Configuration globale du module iArchive
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Archive,
    ToggleLeft,
    ToggleRight,
    Save,
    FolderOpen,
    Clock,
    Award,
    Zap,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Feature Flags ─────────────────────── */

interface FeatureFlag {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
}

const INITIAL_FLAGS: FeatureFlag[] = [
    { id: "module", label: "Module iArchive", description: "Activer/désactiver le module globalement pour tous les clients", enabled: true },
    { id: "coffre-fort", label: "Coffre-fort numérique", description: "Espace ultra-sécurisé avec chiffrement AES-256", enabled: true },
    { id: "certificats", label: "Certificats d'archivage", description: "Génération de certificats de conformité et d'intégrité", enabled: true },
    { id: "retention-auto", label: "Rétention automatique", description: "Suppression automatique des archives expirées", enabled: true },
    { id: "ocr", label: "OCR / Recherche plein texte", description: "Extraction de texte automatique pour recherche dans les documents", enabled: false },
    { id: "categories-dynamiques", label: "Catégories dynamiques", description: "Permettre aux clients de créer leurs propres catégories", enabled: true },
];

/* ─── Default Categories ─────────────────── */

const DEFAULT_CATEGORIES = [
    { nom: "Fiscal", couleur: "amber", fichiers: 234, retention: "10 ans" },
    { nom: "Social", couleur: "blue", fichiers: 156, retention: "5 ans" },
    { nom: "Juridique", couleur: "emerald", fichiers: 89, retention: "30 ans" },
    { nom: "Clients", couleur: "violet", fichiers: 312, retention: "5 ans" },
    { nom: "Coffre-Fort", couleur: "rose", fichiers: 45, retention: "Permanent" },
];

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
    amber: { bg: "bg-amber-500/15", text: "text-amber-400" },
    blue: { bg: "bg-blue-500/15", text: "text-blue-400" },
    emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    violet: { bg: "bg-violet-500/15", text: "text-violet-400" },
    rose: { bg: "bg-rose-500/15", text: "text-rose-400" },
};

/* ─── Certificate Templates ─────────────── */

const CERTIFICATE_TEMPLATES = [
    { nom: "Attestation d'archivage", type: "Standard", validite: "1 an" },
    { nom: "Certificat de conformité", type: "Avancé", validite: "2 ans" },
    { nom: "Certificat d'intégrité", type: "Standard", validite: "Permanent" },
];

/* ─── Retention Policies ─────────────────── */

const RETENTION_POLICIES = [
    { categorie: "Fiscal", duree: "10 ans", action: "Archiver puis supprimer", rappel: "6 mois avant" },
    { categorie: "Social", duree: "5 ans", action: "Archiver puis supprimer", rappel: "3 mois avant" },
    { categorie: "Juridique", duree: "30 ans", action: "Conserver", rappel: "1 an avant" },
    { categorie: "Clients", duree: "5 ans", action: "Archiver puis supprimer", rappel: "3 mois avant" },
    { categorie: "Coffre-Fort", duree: "Permanent", action: "Conserver", rappel: "—" },
];

/* ═══════════════════════════════════════════ */

export default function ConfigIarchivePage() {
    const [flags, setFlags] = useState(INITIAL_FLAGS);

    const toggleFlag = (id: string) => {
        setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
    };

    const handleSave = () => {
        toast.success("Configuration iArchive sauvegardée");
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Archive className="h-6 w-6 text-amber-400" />
                        Configuration iArchive
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Paramètres globaux du module d&apos;archivage légal</p>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:opacity-90 text-xs gap-2">
                    <Save className="h-3.5 w-3.5" /> Enregistrer
                </Button>
            </motion.div>

            {/* Feature Flags */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Fonctionnalités
                </h2>
                <div className="space-y-3">
                    {flags.map((flag) => (
                        <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-xs font-medium">{flag.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{flag.description}</p>
                            </div>
                            <button onClick={() => toggleFlag(flag.id)} className="shrink-0 ml-4">
                                {flag.enabled ? (
                                    <ToggleRight className="h-6 w-6 text-amber-400" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Default Categories */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <FolderOpen className="h-4 w-4 text-amber-400" />
                    Catégories par défaut
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {DEFAULT_CATEGORIES.map((cat) => {
                        const colors = CAT_COLORS[cat.couleur] || CAT_COLORS.amber;
                        return (
                            <div key={cat.nom} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                                <Badge variant="secondary" className={`text-[9px] border-0 ${colors.bg} ${colors.text} mb-2`}>{cat.nom}</Badge>
                                <p className="text-lg font-bold">{cat.fichiers}</p>
                                <p className="text-[10px] text-muted-foreground">fichiers</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Rétention: {cat.retention}</p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Certificate Templates */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-amber-400" />
                    Templates de certificats
                </h2>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Certificat</th>
                            <th className="text-left py-2 px-2">Type</th>
                            <th className="text-right py-2 px-2">Validité</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CERTIFICATE_TEMPLATES.map((ct) => (
                            <tr key={ct.nom} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{ct.nom}</td>
                                <td className="py-2.5 px-2">
                                    <Badge variant="secondary" className="text-[9px] bg-amber-500/15 text-amber-400 border-0">{ct.type}</Badge>
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-muted-foreground">{ct.validite}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Retention Policies */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Politiques de rétention
                </h2>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Catégorie</th>
                            <th className="text-left py-2 px-2">Durée</th>
                            <th className="text-left py-2 px-2 hidden sm:table-cell">Action</th>
                            <th className="text-right py-2 px-2 hidden md:table-cell">Rappel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RETENTION_POLICIES.map((rp) => (
                            <tr key={rp.categorie} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{rp.categorie}</td>
                                <td className="py-2.5 px-2 font-mono">{rp.duree}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{rp.action}</td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground hidden md:table-cell">{rp.rappel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Quotas */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-amber-400" />
                    Quotas par plan
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { plan: "Starter", stockage: "5 GB", categories: 5, certificats: "10/mois" },
                        { plan: "Pro", stockage: "50 GB", categories: 15, certificats: "100/mois" },
                        { plan: "Enterprise", stockage: "500 GB", categories: "Illimité", certificats: "Illimité" },
                    ].map((q) => (
                        <div key={q.plan} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                            <Badge variant="secondary" className="text-[9px] bg-amber-500/15 text-amber-400 border-0 mb-3">{q.plan}</Badge>
                            <div className="space-y-2 text-[10px]">
                                <div className="flex justify-between"><span className="text-muted-foreground">Stockage</span><span className="font-mono">{q.stockage}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Catégories</span><span className="font-mono">{q.categories}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Certificats</span><span className="font-mono">{q.certificats}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
