// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules Config: iSignature
// Configuration globale du module iSignature
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    PenTool,
    ToggleLeft,
    ToggleRight,
    Save,
    Shield,
    Zap,
    Users,
    Award,
    CheckCircle2,
    Workflow,
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
    { id: "module", label: "Module iSignature", description: "Activer/désactiver le module globalement pour tous les clients", enabled: true },
    { id: "signature-avancee", label: "Signature avancée eIDAS", description: "Niveau de signature conforme au règlement eIDAS", enabled: false },
    { id: "multi-signataires", label: "Multi-signataires", description: "Permettre les circuits de signature avec plusieurs parties", enabled: true },
    { id: "delegation", label: "Délégation de signature", description: "Permettre à un signataire de déléguer à un tiers", enabled: false },
    { id: "horodatage", label: "Horodatage certifié", description: "Horodatage qualifié pour prouver l'antériorité", enabled: true },
    { id: "audit-trail", label: "Audit trail complet", description: "Journalisation complète de toutes les actions de signature", enabled: true },
];

/* ─── Providers ─────────────────────── */

const PROVIDERS = [
    { nom: "DIGITALIUM Signer", type: "Intégré", statut: "Actif", certifie: true, niveau: "Avancé" },
    { nom: "DocuSign", type: "API externe", statut: "Disponible", certifie: true, niveau: "Qualifié" },
    { nom: "Yousign", type: "API externe", statut: "Disponible", certifie: true, niveau: "Avancé" },
];

/* ─── Compliance ─────────────────────── */

const COMPLIANCE_CONFIG = [
    { label: "Niveau de certification", value: "Avancé (eIDAS)", editable: false },
    { label: "Vérification d'identité", value: "Email + SMS OTP", editable: true },
    { label: "Algorithme de signature", value: "RSA-SHA256", editable: false },
    { label: "Durée de validité", value: "10 ans", editable: true },
    { label: "Format de signature", value: "PAdES (PDF)", editable: false },
];

/* ─── Default Workflows ─────────────────── */

const DEFAULT_WORKFLOWS = [
    { nom: "Signature simple", etapes: ["Envoi", "Signature", "Confirmation"], signataires: 1 },
    { nom: "Signature double", etapes: ["Envoi", "Signature A", "Signature B", "Confirmation"], signataires: 2 },
    { nom: "Circuit complet", etapes: ["Rédaction", "Validation", "Signature", "Contre-signature", "Archivage"], signataires: 3 },
];

/* ═══════════════════════════════════════════ */

export default function ConfigIsignaturePage() {
    const [flags, setFlags] = useState(INITIAL_FLAGS);

    const toggleFlag = (id: string) => {
        setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
    };

    const handleSave = () => {
        toast.success("Configuration iSignature sauvegardée");
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PenTool className="h-6 w-6 text-violet-400" />
                        Configuration iSignature
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Paramètres globaux du module de signature électronique</p>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:opacity-90 text-xs gap-2">
                    <Save className="h-3.5 w-3.5" /> Enregistrer
                </Button>
            </motion.div>

            {/* Feature Flags */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-violet-400" />
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
                                    <ToggleRight className="h-6 w-6 text-violet-400" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Providers */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-violet-400" />
                    Fournisseurs de signature
                </h2>
                <div className="space-y-3">
                    {PROVIDERS.map((p) => (
                        <div key={p.nom} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                                    <PenTool className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">{p.nom}</p>
                                    <p className="text-[10px] text-muted-foreground">{p.type} · Niveau: {p.niveau}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {p.certifie && (
                                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">
                                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Certifié
                                    </Badge>
                                )}
                                <Badge variant="secondary" className={`text-[9px] border-0 ${p.statut === "Actif" ? "bg-violet-500/15 text-violet-400" : "bg-white/5 text-muted-foreground"}`}>
                                    {p.statut}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Compliance */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-violet-400" />
                    Conformité & Sécurité
                </h2>
                <div className="space-y-3">
                    {COMPLIANCE_CONFIG.map((c) => (
                        <div key={c.label} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-xs text-muted-foreground">{c.label}</span>
                            <span className="text-xs font-medium">{c.value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Default Workflows */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Workflow className="h-4 w-4 text-violet-400" />
                    Workflows par défaut
                </h2>
                <div className="space-y-3">
                    {DEFAULT_WORKFLOWS.map((wf) => (
                        <div key={wf.nom} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">{wf.nom}</span>
                                <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">
                                    {wf.signataires} signataire{wf.signataires > 1 ? "s" : ""}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {wf.etapes.join(" → ")}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quotas */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-violet-400" />
                    Quotas par plan
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { plan: "Starter", signatures: "50/mois", workflows: 2, signataires: 3 },
                        { plan: "Pro", signatures: "500/mois", workflows: 10, signataires: 20 },
                        { plan: "Enterprise", signatures: "Illimité", workflows: "Illimité", signataires: "Illimité" },
                    ].map((q) => (
                        <div key={q.plan} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                            <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0 mb-3">{q.plan}</Badge>
                            <div className="space-y-2 text-[10px]">
                                <div className="flex justify-between"><span className="text-muted-foreground">Signatures</span><span className="font-mono">{q.signatures}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Workflows</span><span className="font-mono">{q.workflows}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Signataires</span><span className="font-mono">{q.signataires}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
