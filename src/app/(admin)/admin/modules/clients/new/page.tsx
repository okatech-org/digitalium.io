// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules: Nouveau Client (Wizard)
// Stepper 5 étapes: Profil → Modules → Workflows → Hébergement → Page publique
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Building,
    Package,
    Workflow,
    Server,
    Globe,
    FileText,
    Archive,
    PenTool,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Cloud,
    HardDrive,
    Eye,
    Palette,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Steps Config ─────────────────────── */

const STEPS = [
    { id: 1, label: "Profil", icon: Building },
    { id: 2, label: "Modules", icon: Package },
    { id: 3, label: "Workflows", icon: Workflow },
    { id: 4, label: "Hébergement", icon: Server },
    { id: 5, label: "Page publique", icon: Globe },
];

/* ─── Workflow Templates ─────────────────── */

const WORKFLOW_TEMPLATES: Record<string, { id: string; nom: string; etapes: string[] }[]> = {
    idocument: [
        { id: "wt1", nom: "Validation Document Interne", etapes: ["Rédaction", "Relecture", "Validation Chef", "Publication"] },
        { id: "wt2", nom: "Création Facture", etapes: ["Saisie", "Vérification", "Approbation", "Envoi"] },
        { id: "wt3", nom: "Demande de Congé", etapes: ["Demande", "Validation Manager", "Approbation RH"] },
    ],
    iarchive: [
        { id: "wt4", nom: "Archivage Automatique", etapes: ["Détection", "Classification", "Stockage", "Confirmation"] },
        { id: "wt5", nom: "Purge Archives Expirées", etapes: ["Scan", "Vérification", "Notification", "Suppression"] },
    ],
    isignature: [
        { id: "wt6", nom: "Signature Contrat", etapes: ["Préparation", "Signature", "Contre-signature", "Finalisation"] },
        { id: "wt7", nom: "Validation PV Réunion", etapes: ["Rédaction", "Relecture", "Signature", "Archivage"] },
    ],
};

/* ═══════════════════════════════════════════ */

export default function NewClientWizardPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Step 1: Profile
    const [profil, setProfil] = useState({
        nom: "",
        secteur: "",
        type: "Entreprise",
        rccm: "",
        nif: "",
        contact: "",
        email: "",
        telephone: "",
    });

    // Step 2: Modules
    const [modules, setModules] = useState({
        idocument: true,
        iarchive: false,
        isignature: false,
    });

    // Step 3: Workflows
    const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

    // Step 4: Hébergement
    const [hebergement, setHebergement] = useState<"Local" | "Data Center" | "Cloud">("Cloud");

    // Step 5: Page publique
    const [pagePublique, setPagePublique] = useState(false);
    const [domaine, setDomaine] = useState("");

    const toggleWorkflow = (id: string) => {
        setSelectedWorkflows((prev) =>
            prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (!profil.nom) {
            toast.error("Nom requis", { description: "Veuillez renseigner la raison sociale" });
            setStep(1);
            return;
        }
        toast.success("Client créé avec succès", { description: profil.nom });
        router.push("/admin/modules/clients");
    };

    const canNext = () => {
        if (step === 1) return profil.nom.length > 0;
        return true;
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[900px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Plus className="h-6 w-6 text-violet-400" />
                    Nouveau client
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Configuration complète en {STEPS.length} étapes</p>
            </motion.div>

            {/* Stepper */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                {STEPS.map((s, i) => {
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => isDone && setStep(s.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    isActive
                                        ? "bg-violet-500/15 text-violet-400"
                                        : isDone
                                        ? "text-emerald-400 cursor-pointer hover:bg-emerald-500/10"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isActive ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground"
                                    }`}>
                                        {s.id}
                                    </div>
                                )}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-2 ${step > s.id ? "bg-emerald-500/30" : "bg-white/5"}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </motion.div>

            {/* Step Content */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 border border-white/5">
                {/* Step 1: Profil */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <Building className="h-4 w-4 text-violet-400" />
                            Profil de l&apos;organisation
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Raison sociale *</label>
                                <Input value={profil.nom} onChange={(e) => setProfil((p) => ({ ...p, nom: e.target.value }))} placeholder="Ex: SEEG" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Secteur d&apos;activité</label>
                                <Input value={profil.secteur} onChange={(e) => setProfil((p) => ({ ...p, secteur: e.target.value }))} placeholder="Ex: Énergie & Eau" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Type d&apos;organisation</label>
                                <div className="flex gap-2">
                                    {["Entreprise", "Gouvernement", "Établissement public", "ONG"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setProfil((p) => ({ ...p, type: t }))}
                                            className={`px-3 py-1.5 rounded-md text-[10px] font-medium border transition-all ${
                                                profil.type === t ? "bg-violet-500/15 text-violet-400 border-violet-500/30" : "border-white/10 text-muted-foreground hover:bg-white/5"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">RCCM</label>
                                <Input value={profil.rccm} onChange={(e) => setProfil((p) => ({ ...p, rccm: e.target.value }))} placeholder="GA-LBV-2003-B-44521" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">NIF</label>
                                <Input value={profil.nif} onChange={(e) => setProfil((p) => ({ ...p, nif: e.target.value }))} placeholder="20031234567A" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Contact principal</label>
                                <Input value={profil.contact} onChange={(e) => setProfil((p) => ({ ...p, contact: e.target.value }))} placeholder="M. / Mme Nom" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Email</label>
                                <Input value={profil.email} onChange={(e) => setProfil((p) => ({ ...p, email: e.target.value }))} placeholder="contact@organisation.ga" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Téléphone</label>
                                <Input value={profil.telephone} onChange={(e) => setProfil((p) => ({ ...p, telephone: e.target.value }))} placeholder="+241 01 XX XX XX" className="h-9 text-xs bg-white/5 border-white/10" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Modules */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <Package className="h-4 w-4 text-violet-400" />
                            Modules à activer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: "idocument" as const, label: "iDocument", desc: "Gestion documentaire, dossiers, templates, partage", icon: FileText, color: "blue" },
                                { id: "iarchive" as const, label: "iArchive", desc: "Archivage légal, coffre-fort, certificats, rétention", icon: Archive, color: "amber" },
                                { id: "isignature" as const, label: "iSignature", desc: "Signature électronique, multi-signataires, audit trail", icon: PenTool, color: "violet" },
                            ].map((mod) => {
                                const Icon = mod.icon;
                                const isActive = modules[mod.id];
                                return (
                                    <button
                                        key={mod.id}
                                        onClick={() => setModules((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
                                        className={`glass-card rounded-xl p-5 border text-left transition-all ${
                                            isActive ? `border-${mod.color}-500/30 bg-${mod.color}-500/5` : "border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`h-10 w-10 rounded-lg bg-${mod.color}-500/15 flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 text-${mod.color}-400`} />
                                            </div>
                                            {isActive ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border border-white/10" />
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold">{mod.label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{mod.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Workflows */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <Workflow className="h-4 w-4 text-violet-400" />
                            Templates de workflows
                        </h2>
                        <p className="text-xs text-muted-foreground">Sélectionnez les workflows pré-configurés pour les modules activés</p>
                        {(["idocument", "iarchive", "isignature"] as const).map((mod) => {
                            if (!modules[mod]) return null;
                            const templates = WORKFLOW_TEMPLATES[mod];
                            const Icon = mod === "idocument" ? FileText : mod === "iarchive" ? Archive : PenTool;
                            const color = mod === "idocument" ? "blue" : mod === "iarchive" ? "amber" : "violet";
                            return (
                                <div key={mod} className="space-y-2">
                                    <p className={`text-xs font-medium text-${color}-400 flex items-center gap-1.5`}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {mod === "idocument" ? "iDocument" : mod === "iarchive" ? "iArchive" : "iSignature"}
                                    </p>
                                    {templates.map((wt) => {
                                        const isSelected = selectedWorkflows.includes(wt.id);
                                        return (
                                            <button
                                                key={wt.id}
                                                onClick={() => toggleWorkflow(wt.id)}
                                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                                    isSelected ? "border-violet-500/30 bg-violet-500/5" : "border-white/5 hover:border-white/10"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium">{wt.nom}</span>
                                                    {isSelected ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border border-white/10" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {wt.etapes.join(" → ")}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                        {!modules.idocument && !modules.iarchive && !modules.isignature && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                Activez au moins un module pour configurer des workflows
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Hébergement */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <Server className="h-4 w-4 text-violet-400" />
                            Modèle d&apos;hébergement
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: "Local" as const, icon: Server, desc: "Serveur sur site client. Contrôle total, maintenance interne.", color: "blue" },
                                { id: "Data Center" as const, icon: HardDrive, desc: "Hébergement en data center DIGITALIUM. Haute disponibilité.", color: "violet" },
                                { id: "Cloud" as const, icon: Cloud, desc: "Infrastructure cloud (AWS/Azure). Scalabilité maximale.", color: "emerald" },
                            ].map((h) => {
                                const Icon = h.icon;
                                const isActive = hebergement === h.id;
                                return (
                                    <button
                                        key={h.id}
                                        onClick={() => setHebergement(h.id)}
                                        className={`glass-card rounded-xl p-5 border text-left transition-all ${
                                            isActive ? "border-violet-500/30 bg-violet-500/5" : "border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`h-10 w-10 rounded-lg bg-${h.color}-500/15 flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 text-${h.color}-400`} />
                                            </div>
                                            {isActive ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border border-white/10" />
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold">{h.id}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{h.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 5: Page publique */}
                {step === 5 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-violet-400" />
                            Page publique
                        </h2>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-xs font-medium">Activer la page publique</p>
                                <p className="text-[10px] text-muted-foreground">Portail accessible aux visiteurs avec annuaire</p>
                            </div>
                            <button onClick={() => setPagePublique(!pagePublique)}>
                                {pagePublique ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <div className="h-6 w-6 rounded-full border-2 border-white/10" />
                                )}
                            </button>
                        </div>

                        {pagePublique && (
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Sous-domaine</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={domaine}
                                            onChange={(e) => setDomaine(e.target.value)}
                                            placeholder="mon-organisation"
                                            className="h-9 text-xs bg-white/5 border-white/10 flex-1"
                                        />
                                        <span className="text-xs text-muted-foreground">.digitalium.io</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Thème</label>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                            <Palette className="h-3.5 w-3.5 text-violet-400" />
                                            <span className="text-xs">Défaut — Violet</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Annuaire</label>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                            <span className="text-xs">Public</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Navigation */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="text-xs gap-1.5"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Précédent
                </Button>
                <div className="flex items-center gap-1.5">
                    {STEPS.map((s) => (
                        <div
                            key={s.id}
                            className={`h-1.5 rounded-full transition-all ${
                                s.id === step ? "w-6 bg-violet-500" : s.id < step ? "w-1.5 bg-emerald-500/50" : "w-1.5 bg-white/10"
                            }`}
                        />
                    ))}
                </div>
                {step < 5 ? (
                    <Button
                        size="sm"
                        onClick={() => setStep(step + 1)}
                        disabled={!canNext()}
                        className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-1.5"
                    >
                        Suivant
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-1.5"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Créer le client
                    </Button>
                )}
            </motion.div>
        </motion.div>
    );
}
