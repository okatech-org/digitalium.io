// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules Config: iDocument
// Configuration globale du module iDocument
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    ToggleLeft,
    ToggleRight,
    Save,
    FileStack,
    HardDrive,
    Shield,
    Zap,
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
    { id: "module", label: "Module iDocument", description: "Activer/désactiver le module globalement pour tous les clients", enabled: true },
    { id: "templates", label: "Templates de documents", description: "Permettre la création et l'utilisation de templates préconfigurés", enabled: true },
    { id: "archivage-auto", label: "Archivage automatique", description: "Archiver automatiquement les documents après validation", enabled: true },
    { id: "import-masse", label: "Import en masse", description: "Permettre l'import de fichiers multiples via drag & drop", enabled: true },
    { id: "versionnage", label: "Versionnage", description: "Activer le suivi des versions de documents", enabled: false },
    { id: "collaboration", label: "Collaboration temps réel", description: "Édition collaborative sur les documents", enabled: false },
];

/* ─── Templates ─────────────────────── */

const DEFAULT_TEMPLATES = [
    { nom: "Facture commerciale", categorie: "Finance", champs: 12, clients: 4 },
    { nom: "Contrat de prestation", categorie: "Juridique", champs: 18, clients: 3 },
    { nom: "Ordre de mission", categorie: "RH", champs: 8, clients: 5 },
    { nom: "PV de réunion", categorie: "Administration", champs: 6, clients: 3 },
    { nom: "Bon de commande", categorie: "Achats", champs: 14, clients: 2 },
];

/* ─── Quotas ─────────────────────── */

const PLAN_QUOTAS = [
    { plan: "Starter", stockage: "10 GB", fichiers: "1 000", templates: 5, users: 10 },
    { plan: "Pro", stockage: "50 GB", fichiers: "10 000", templates: 20, users: 50 },
    { plan: "Enterprise", stockage: "500 GB", fichiers: "Illimité", templates: "Illimité", users: "Illimité" },
];

/* ═══════════════════════════════════════════ */

export default function ConfigIdocumentPage() {
    const [flags, setFlags] = useState(INITIAL_FLAGS);

    const toggleFlag = (id: string) => {
        setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
    };

    const handleSave = () => {
        toast.success("Configuration iDocument sauvegardée");
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-400" />
                        Configuration iDocument
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Paramètres globaux du module de gestion documentaire</p>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 text-xs gap-2">
                    <Save className="h-3.5 w-3.5" /> Enregistrer
                </Button>
            </motion.div>

            {/* Feature Flags */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-blue-400" />
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
                                    <ToggleRight className="h-6 w-6 text-blue-400" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Default Templates */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <FileStack className="h-4 w-4 text-blue-400" />
                    Templates par défaut
                </h2>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Template</th>
                            <th className="text-left py-2 px-2">Catégorie</th>
                            <th className="text-right py-2 px-2">Champs</th>
                            <th className="text-right py-2 px-2">Clients</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DEFAULT_TEMPLATES.map((t) => (
                            <tr key={t.nom} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{t.nom}</td>
                                <td className="py-2.5 px-2">
                                    <Badge variant="secondary" className="text-[9px] bg-blue-500/15 text-blue-400 border-0">{t.categorie}</Badge>
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-muted-foreground">{t.champs}</td>
                                <td className="py-2.5 px-2 text-right font-mono text-muted-foreground">{t.clients}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Storage Policies */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <HardDrive className="h-4 w-4 text-blue-400" />
                    Politiques de stockage
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Taille max par fichier", value: "50 MB" },
                        { label: "Types autorisés", value: "PDF, DOCX, XLSX, PNG, JPG" },
                        { label: "Rétention corbeille", value: "30 jours" },
                    ].map((p) => (
                        <div key={p.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-muted-foreground">{p.label}</p>
                            <p className="text-xs font-medium mt-1">{p.value}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Plan Quotas */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Quotas par plan
                </h2>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Plan</th>
                            <th className="text-right py-2 px-2">Stockage</th>
                            <th className="text-right py-2 px-2">Fichiers</th>
                            <th className="text-right py-2 px-2">Templates</th>
                            <th className="text-right py-2 px-2">Utilisateurs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PLAN_QUOTAS.map((q) => (
                            <tr key={q.plan} className="border-b border-white/5">
                                <td className="py-2.5 px-2">
                                    <Badge variant="secondary" className="text-[9px] bg-blue-500/15 text-blue-400 border-0">{q.plan}</Badge>
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono">{q.stockage}</td>
                                <td className="py-2.5 px-2 text-right font-mono">{q.fichiers}</td>
                                <td className="py-2.5 px-2 text-right font-mono">{q.templates}</td>
                                <td className="py-2.5 px-2 text-right font-mono">{q.users}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
