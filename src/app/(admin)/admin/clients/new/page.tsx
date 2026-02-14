// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Nouveau Client
// Wizard 3 étapes pour créer un client commercial
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Building2,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Search,
    Globe,
    Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────────────── */

type PlanType = "starter" | "pro" | "enterprise" | "institutional";
type CycleType = "mensuel" | "annuel";

interface Organisation {
    id: string;
    nom: string;
    secteur: string;
    ville: string;
}

interface PlanOption {
    id: PlanType;
    label: string;
    price: string;
    color: string;
    bg: string;
    border: string;
}

/* ─── Data ───────────────────────────────────────── */

const ORGANISATIONS: Organisation[] = [
    { id: "ORG001", nom: "SEEG", secteur: "Énergie & Eau", ville: "Libreville" },
    { id: "ORG002", nom: "BGFI Bank", secteur: "Banque", ville: "Libreville" },
    { id: "ORG003", nom: "CNAMGS", secteur: "Santé publique", ville: "Libreville" },
    { id: "ORG004", nom: "ASCOMA Gabon", secteur: "Assurance", ville: "Libreville" },
    { id: "ORG005", nom: "Gabon Oil Company", secteur: "Pétrole", ville: "Port-Gentil" },
    { id: "ORG006", nom: "Min. Santé", secteur: "Gouvernement", ville: "Libreville" },
    { id: "ORG007", nom: "ANPI-Gabon", secteur: "Agence publique", ville: "Libreville" },
    { id: "ORG008", nom: "Owendo Terminal", secteur: "Transport", ville: "Owendo" },
];

const PLANS: PlanOption[] = [
    { id: "starter", label: "Starter", price: "500K XAF/mois", color: "text-gray-400", bg: "bg-gray-500/15", border: "border-gray-500/30" },
    { id: "pro", label: "Pro", price: "1.5M XAF/mois", color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
    { id: "enterprise", label: "Enterprise", price: "3.5M XAF/mois", color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30" },
    { id: "institutional", label: "Institutionnel", price: "5M XAF/mois", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
];

const STEPS = [
    { label: "Sélection Organisation", icon: Building2 },
    { label: "Abonnement", icon: CreditCard },
    { label: "Confirmation", icon: CheckCircle2 },
];

/* ═══════════════════════════════════════════════
   NEW CLIENT WIZARD
   ═══════════════════════════════════════════════ */

export default function NewClientPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    // Step 1 state
    const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
    const [orgSearch, setOrgSearch] = useState("");

    // Step 2 state
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
    const [cycle, setCycle] = useState<CycleType>("mensuel");
    const [contactCommercial, setContactCommercial] = useState("");

    /* ─── Helpers ─────────────────────────────────── */

    const selectedOrgData = ORGANISATIONS.find((o) => o.id === selectedOrg);
    const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

    const filteredOrgs = ORGANISATIONS.filter(
        (o) =>
            o.nom.toLowerCase().includes(orgSearch.toLowerCase()) ||
            o.secteur.toLowerCase().includes(orgSearch.toLowerCase()) ||
            o.ville.toLowerCase().includes(orgSearch.toLowerCase())
    );

    const canNext = () => {
        if (step === 0) return selectedOrg !== null;
        if (step === 1) return selectedPlan !== null;
        return true;
    };

    const handleSubmit = () => {
        toast.success("Client créé avec succès");
        router.push("/admin/clients");
    };

    /* ─── Render ──────────────────────────────────── */

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[900px] mx-auto">
            {/* Back + Title */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
                <Link href="/admin/clients">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nouveau Client</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Créer une relation commerciale</p>
                </div>
            </motion.div>

            {/* Stepper */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = i === step;
                        const isDone = i < step;
                        return (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                                            isDone
                                                ? "bg-blue-500/20 text-blue-400"
                                                : isActive
                                                ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
                                                : "bg-white/5 text-muted-foreground"
                                        }`}
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Icon className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs font-medium hidden sm:block ${
                                            isActive ? "text-blue-400" : isDone ? "text-blue-400/70" : "text-muted-foreground"
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-px mx-3 ${isDone ? "bg-blue-500/30" : "bg-white/5"}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </motion.div>

            {/* Step Content */}
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* ─── Step 1: Organisation Selection ─── */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une organisation..."
                                value={orgSearch}
                                onChange={(e) => setOrgSearch(e.target.value)}
                                className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredOrgs.map((org) => {
                                const isSelected = selectedOrg === org.id;
                                return (
                                    <button
                                        key={org.id}
                                        onClick={() => setSelectedOrg(org.id)}
                                        className={`glass-card rounded-2xl p-5 text-left transition-all ${
                                            isSelected
                                                ? "ring-1 ring-blue-500/40 bg-blue-500/[0.04]"
                                                : "hover:bg-white/[0.03]"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    isSelected ? "bg-blue-500/15" : "bg-white/5"
                                                }`}
                                            >
                                                <Building2 className={`h-5 w-5 ${isSelected ? "text-blue-400" : "text-muted-foreground"}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm">{org.nom}</h3>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Globe className="h-3 w-3" /> {org.secteur} · {org.ville}
                                                </p>
                                            </div>
                                            <div
                                                className={`h-5 w-5 rounded-full border-2 shrink-0 ml-auto mt-0.5 flex items-center justify-center transition-all ${
                                                    isSelected ? "border-blue-400 bg-blue-500" : "border-white/20"
                                                }`}
                                            >
                                                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {filteredOrgs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">Aucune organisation trouvée</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Step 2: Abonnement ─── */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Plan Selection */}
                        <div>
                            <h2 className="text-sm font-semibold mb-3">Plan</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {PLANS.map((plan) => {
                                    const isSelected = selectedPlan === plan.id;
                                    return (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={`glass-card rounded-2xl p-4 text-center transition-all ${
                                                isSelected
                                                    ? `ring-1 ${plan.border} bg-white/[0.04]`
                                                    : "hover:bg-white/[0.03]"
                                            }`}
                                        >
                                            <div
                                                className={`h-10 w-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${
                                                    isSelected ? plan.bg : "bg-white/5"
                                                }`}
                                            >
                                                <CreditCard className={`h-5 w-5 ${isSelected ? plan.color : "text-muted-foreground"}`} />
                                            </div>
                                            <p className={`text-sm font-bold ${isSelected ? plan.color : ""}`}>{plan.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{plan.price}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Billing Cycle */}
                        <div>
                            <h2 className="text-sm font-semibold mb-3">Cycle de facturation</h2>
                            <div className="flex gap-2">
                                {(["mensuel", "annuel"] as CycleType[]).map((c) => {
                                    const isSelected = cycle === c;
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => setCycle(c)}
                                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                                                isSelected
                                                    ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
                                                    : "bg-white/5 text-muted-foreground hover:bg-white/[0.08]"
                                            }`}
                                        >
                                            {c === "mensuel" ? "Mensuel" : "Annuel"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contact commercial */}
                        <div>
                            <h2 className="text-sm font-semibold mb-3">Contact commercial</h2>
                            <Input
                                placeholder="Nom du contact commercial..."
                                value={contactCommercial}
                                onChange={(e) => setContactCommercial(e.target.value)}
                                className="max-w-md h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Confirmation ─── */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="glass-card rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-5 w-5 text-blue-400" />
                                <h2 className="text-sm font-bold">Résumé du nouveau client</h2>
                            </div>

                            {/* Organisation */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Organisation</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{selectedOrgData?.nom ?? "—"}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {selectedOrgData?.secteur} · {selectedOrgData?.ville}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Plan + Cycle */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
                                    <Badge
                                        variant="secondary"
                                        className={`text-[10px] ${selectedPlanData?.bg ?? "bg-white/5"} ${selectedPlanData?.color ?? ""} border-0`}
                                    >
                                        {selectedPlanData?.label ?? "—"}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground mt-1">{selectedPlanData?.price ?? ""}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cycle</p>
                                    <p className="text-sm font-medium">{cycle === "mensuel" ? "Mensuel" : "Annuel"}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Contact commercial</p>
                                    <p className="text-sm font-medium">{contactCommercial || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Navigation */}
            <motion.div variants={fadeUp} className="flex items-center justify-between pt-2">
                <Button
                    variant="ghost"
                    className="text-xs gap-2 h-8"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Précédent
                </Button>

                {step < 2 ? (
                    <Button
                        className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
                        onClick={() => setStep((s) => Math.min(2, s + 1))}
                        disabled={!canNext()}
                    >
                        Suivant <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                ) : (
                    <Button
                        className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
                        onClick={handleSubmit}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Créer le client
                    </Button>
                )}
            </motion.div>
        </motion.div>
    );
}
