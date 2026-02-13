"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Billing & Subscription
// XAF pricing, Mobile Money, invoices
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CreditCard,
    Smartphone,
    Building2,
    Check,
    Crown,
    Zap,
    Star,
    Users,
    FileText,
    Archive,
    PenTool,
    Bot,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    Sparkles,
    Shield,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────

type PaymentMethod = "mobile_money" | "bank_transfer" | "card";
type MobileOperator = "mtn" | "airtel" | "moov";

interface PlanFeature {
    label: string;
    starter: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
}

// ─── Pricing Data ──────────────────────────────

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: 49000,
        pricePerUser: 15000,
        icon: Star,
        color: "from-blue-600 to-cyan-500",
        description: "Pour les petites équipes",
        maxUsers: 5,
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: 149000,
        pricePerUser: 15000,
        icon: Zap,
        color: "from-violet-600 to-indigo-500",
        description: "Pour les entreprises en croissance",
        maxUsers: 25,
        popular: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 349000,
        pricePerUser: 12000,
        icon: Crown,
        color: "from-amber-600 to-orange-500",
        description: "Pour les grandes organisations",
        maxUsers: 100,
        popular: false,
    },
];

const FEATURES: PlanFeature[] = [
    { label: "Utilisateurs inclus", starter: "5", pro: "25", enterprise: "100" },
    { label: "iDocument", starter: true, pro: true, enterprise: true },
    { label: "iArchive", starter: "5 Go", pro: "50 Go", enterprise: "500 Go" },
    { label: "iSignature", starter: "10/mois", pro: "100/mois", enterprise: "Illimité" },
    { label: "iAsted (IA)", starter: false, pro: true, enterprise: true },
    { label: "Certificats d'archivage", starter: false, pro: true, enterprise: true },
    { label: "Workflows personnalisés", starter: false, pro: "5", enterprise: "Illimité" },
    { label: "API Access", starter: false, pro: false, enterprise: true },
    { label: "Support prioritaire", starter: false, pro: true, enterprise: true },
    { label: "SLA garanti", starter: false, pro: false, enterprise: "99.9%" },
];

const INVOICES = [
    { id: "INV-001", number: "DIG-2026-089", amount: 149000, status: "paid" as const, date: "01/02/2026", method: "Mobile Money" },
    { id: "INV-002", number: "DIG-2026-078", amount: 149000, status: "paid" as const, date: "01/01/2026", method: "Mobile Money" },
    { id: "INV-003", number: "DIG-2026-067", amount: 149000, status: "paid" as const, date: "01/12/2025", method: "Virement" },
    { id: "INV-004", number: "DIG-2026-056", amount: 149000, status: "paid" as const, date: "01/11/2025", method: "Mobile Money" },
];

const MOBILE_OPERATORS: { id: MobileOperator; name: string; color: string; prefix: string }[] = [
    { id: "mtn", name: "MTN MoMo", color: "from-yellow-500 to-yellow-600", prefix: "077 / 066" },
    { id: "airtel", name: "Airtel Money", color: "from-red-500 to-red-600", prefix: "074 / 077" },
    { id: "moov", name: "Moov Money", color: "from-blue-500 to-blue-600", prefix: "062 / 060" },
];

const STATUS_CONFIG = {
    paid: { label: "Payée", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    pending: { label: "En attente", color: "text-amber-400", bg: "bg-amber-500/15", icon: Clock },
    failed: { label: "Échouée", color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

// ─── Component ─────────────────────────────────

export default function BillingPage() {
    const [selectedPlan, setSelectedPlan] = useState("pro");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile_money");
    const [mobileOperator, setMobileOperator] = useState<MobileOperator>("mtn");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [paymentStep, setPaymentStep] = useState<"method" | "details" | "otp" | "success">("method");
    const [isProcessing, setIsProcessing] = useState(false);

    const currentPlan = PLANS.find((p) => p.id === selectedPlan)!;
    const discount = billingCycle === "annual" ? 0.15 : 0;
    const monthlyPrice = currentPlan.price;
    const annualPrice = Math.round(monthlyPrice * 12 * (1 - discount));
    const displayPrice = billingCycle === "annual" ? Math.round(annualPrice / 12) : monthlyPrice;

    const handlePayment = async () => {
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 2000));
        setPaymentStep("success");
        setIsProcessing(false);
        toast.success("Paiement effectué avec succès !");
    };

    const formatXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Abonnement et Facturation</h1>
                        <p className="text-xs text-muted-foreground">
                            Plan actuel : <span className="text-violet-400 font-medium">Pro</span> · Prochain paiement : 01/03/2026
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Current Plan Banner */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-indigo-500/10 border border-violet-500/20"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">Plan Pro</span>
                                <Badge className="text-[8px] bg-emerald-500/15 text-emerald-400 border-0">Actif</Badge>
                            </div>
                            <p className="text-[11px] text-zinc-400">8 utilisateurs · 47 Go utilisés / 50 Go · Mensuel</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">{formatXAF(149000)}<span className="text-xs text-zinc-500 font-normal">/mois</span></p>
                        <p className="text-[10px] text-zinc-500">Prochain renouvellement : 01/03/2026</p>
                    </div>
                </div>
            </motion.div>

            {/* Billing Cycle Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-3"
            >
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                            billingCycle === "monthly" ? "bg-violet-500/20 text-violet-300" : "text-zinc-500"
                        }`}
                    >
                        Mensuel
                    </button>
                    <button
                        onClick={() => setBillingCycle("annual")}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                            billingCycle === "annual" ? "bg-violet-500/20 text-violet-300" : "text-zinc-500"
                        }`}
                    >
                        Annuel
                        <Badge className="text-[8px] bg-emerald-500/15 text-emerald-400 border-0">-15%</Badge>
                    </button>
                </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan, i) => {
                    const Icon = plan.icon;
                    const price = billingCycle === "annual" ? Math.round(plan.price * 0.85) : plan.price;
                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            className={`relative p-5 rounded-xl border transition-all ${
                                plan.popular
                                    ? "bg-violet-500/5 border-violet-500/20 shadow-lg shadow-violet-500/5"
                                    : "bg-white/[0.02] border-white/5"
                            }`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-gradient-to-r from-violet-600 to-indigo-500 border-0">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Populaire
                                </Badge>
                            )}

                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-base font-bold">{plan.name}</h3>
                            <p className="text-[11px] text-zinc-500 mb-3">{plan.description}</p>

                            <div className="mb-4">
                                <span className="text-2xl font-bold">{formatXAF(price)}</span>
                                <span className="text-xs text-zinc-500">/mois</span>
                                {billingCycle === "annual" && (
                                    <p className="text-[10px] text-zinc-500 mt-0.5">
                                        {formatXAF(price * 12)}/an · Économie de {formatXAF(Math.round(plan.price * 12 * 0.15))}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <Users className="h-3 w-3 text-violet-400" />
                                    <span>Jusqu&apos;à {plan.maxUsers} utilisateurs</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <FileText className="h-3 w-3 text-blue-400" />
                                    <span>iDocument inclus</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <Archive className="h-3 w-3 text-amber-400" />
                                    <span>iArchive {plan.id === "starter" ? "5 Go" : plan.id === "pro" ? "50 Go" : "500 Go"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <PenTool className="h-3 w-3 text-emerald-400" />
                                    <span>iSignature {plan.id === "starter" ? "10/mois" : plan.id === "pro" ? "100/mois" : "Illimité"}</span>
                                </div>
                                {plan.id !== "starter" && (
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                        <Bot className="h-3 w-3 text-violet-400" />
                                        <span>iAsted IA</span>
                                    </div>
                                )}
                            </div>

                            <Button
                                size="sm"
                                className={`w-full text-xs ${
                                    plan.id === selectedPlan
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-500"
                                        : "bg-white/5 hover:bg-white/10"
                                }`}
                                onClick={() => {
                                    setSelectedPlan(plan.id);
                                    setShowPayment(true);
                                    setPaymentStep("method");
                                }}
                            >
                                {plan.id === "pro" ? "Plan actuel" : "Choisir ce plan"}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Feature Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 overflow-x-auto"
            >
                <h3 className="text-sm font-semibold mb-3">Comparaison des plans</h3>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="text-left py-2 px-3 text-zinc-500 font-medium">Fonctionnalité</th>
                            <th className="text-center py-2 px-3 text-zinc-500 font-medium">Starter</th>
                            <th className="text-center py-2 px-3 text-violet-400 font-medium">Pro</th>
                            <th className="text-center py-2 px-3 text-zinc-500 font-medium">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody>
                        {FEATURES.map((f) => (
                            <tr key={f.label} className="border-b border-white/[0.03]">
                                <td className="py-2 px-3 text-zinc-300">{f.label}</td>
                                {[f.starter, f.pro, f.enterprise].map((val, i) => (
                                    <td key={i} className="py-2 px-3 text-center">
                                        {typeof val === "boolean" ? (
                                            val ? <Check className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <span className="text-zinc-600">—</span>
                                        ) : (
                                            <span className="text-zinc-300 font-medium">{val}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Invoice History */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
                <h3 className="text-sm font-semibold mb-3">Historique des factures</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-2 px-3 text-zinc-500">N° Facture</th>
                                <th className="text-left py-2 px-3 text-zinc-500">Date</th>
                                <th className="text-left py-2 px-3 text-zinc-500">Moyen</th>
                                <th className="text-left py-2 px-3 text-zinc-500">Statut</th>
                                <th className="text-right py-2 px-3 text-zinc-500">Montant</th>
                                <th className="text-center py-2 px-3 text-zinc-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {INVOICES.map((inv) => {
                                const cfg = STATUS_CONFIG[inv.status];
                                const StatusIcon = cfg.icon;
                                return (
                                    <tr key={inv.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                        <td className="py-2.5 px-3 font-medium">{inv.number}</td>
                                        <td className="py-2.5 px-3 text-zinc-400">{inv.date}</td>
                                        <td className="py-2.5 px-3">
                                            <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{inv.method}</Badge>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {cfg.label}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-medium">{formatXAF(inv.amount)}</td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Download className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ─── Payment Modal ─────────────────────────── */}
            <Dialog open={showPayment} onOpenChange={(v) => { if (!v) { setShowPayment(false); setPaymentStep("method"); } }}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 p-0 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="p-5 pb-3 border-b border-white/5">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${currentPlan.color} flex items-center justify-center`}>
                                <currentPlan.icon className="h-4 w-4 text-white" />
                            </div>
                            {paymentStep === "success" ? "Paiement confirmé" : `Payer — Plan ${currentPlan.name}`}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-5 space-y-4">
                        {paymentStep === "method" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-400">Montant à payer</span>
                                        <span className="text-lg font-bold">{formatXAF(displayPrice)}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500">Plan {currentPlan.name} · {billingCycle === "annual" ? "Annuel" : "Mensuel"}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Mode de paiement</span>
                                    <div className="space-y-2">
                                        {[
                                            { id: "mobile_money" as const, label: "Mobile Money", desc: "MTN, Airtel, Moov", icon: Smartphone, color: "from-yellow-600 to-amber-500" },
                                            { id: "bank_transfer" as const, label: "Virement bancaire", desc: "Compte BGFI / UGB", icon: Building2, color: "from-blue-600 to-cyan-500" },
                                            { id: "card" as const, label: "Carte bancaire", desc: "Visa / Mastercard", icon: CreditCard, color: "from-violet-600 to-indigo-500" },
                                        ].map((m) => {
                                            const MIcon = m.icon;
                                            return (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setPaymentMethod(m.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                                                        paymentMethod === m.id
                                                            ? "bg-violet-500/10 border border-violet-500/30"
                                                            : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                                                    }`}
                                                >
                                                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0`}>
                                                        <MIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-medium">{m.label}</p>
                                                        <p className="text-[10px] text-zinc-500">{m.desc}</p>
                                                    </div>
                                                    {paymentMethod === m.id && (
                                                        <Check className="h-4 w-4 text-violet-400 ml-auto" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentStep === "details" && paymentMethod === "mobile_money" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Opérateur</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {MOBILE_OPERATORS.map((op) => (
                                            <button
                                                key={op.id}
                                                onClick={() => setMobileOperator(op.id)}
                                                className={`p-3 rounded-lg text-center transition-all ${
                                                    mobileOperator === op.id
                                                        ? "bg-violet-500/10 border border-violet-500/30"
                                                        : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                                                }`}
                                            >
                                                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${op.color} flex items-center justify-center mx-auto mb-1.5`}>
                                                    <Smartphone className="h-4 w-4 text-white" />
                                                </div>
                                                <p className="text-[11px] font-medium">{op.name}</p>
                                                <p className="text-[9px] text-zinc-500">{op.prefix}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                        Numéro de téléphone
                                    </label>
                                    <Input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Ex: 077 12 34 56"
                                        className="h-9 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {paymentStep === "details" && paymentMethod === "bank_transfer" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Coordonnées bancaires</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-zinc-400">Banque</span>
                                            <span className="text-[11px] font-medium">BGFI Bank Gabon</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-zinc-400">IBAN</span>
                                            <span className="text-[11px] font-mono">GA21 0001 0001 xxxx xxxx</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-zinc-400">Référence</span>
                                            <span className="text-[11px] font-mono text-violet-400">DIG-2026-PRO</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center">
                                    <Building2 className="h-6 w-6 text-zinc-500 mx-auto mb-1.5" />
                                    <p className="text-[11px]">Joindre le justificatif de virement</p>
                                    <p className="text-[9px] text-zinc-500">PDF, JPG · Max 5 Mo</p>
                                </div>
                            </motion.div>
                        )}

                        {paymentStep === "details" && paymentMethod === "card" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Numéro de carte</label>
                                    <Input placeholder="4242 4242 4242 4242" className="h-9 text-xs bg-white/5 border-white/10" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Expiration</label>
                                        <Input placeholder="MM/AA" className="h-9 text-xs bg-white/5 border-white/10" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">CVC</label>
                                        <Input placeholder="123" className="h-9 text-xs bg-white/5 border-white/10" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                    <Shield className="h-3 w-3" />
                                    Paiement sécurisé par chiffrement SSL
                                </div>
                            </motion.div>
                        )}

                        {paymentStep === "otp" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
                                <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                                    <Smartphone className="h-7 w-7 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Code de confirmation</p>
                                    <p className="text-[11px] text-zinc-400 mt-1">
                                        Un code a été envoyé au {phoneNumber || "077 XX XX XX"}
                                    </p>
                                </div>
                                <Input
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="_ _ _ _ _ _"
                                    className="h-12 text-center text-lg font-mono tracking-[0.5em] bg-white/5 border-white/10"
                                    maxLength={6}
                                />
                                <p className="text-[10px] text-zinc-500">
                                    Le code expire dans 5 minutes
                                </p>
                            </motion.div>
                        )}

                        {paymentStep === "success" && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                </div>
                                <h3 className="text-base font-bold mb-1">Paiement réussi !</h3>
                                <p className="text-xs text-zinc-400 mb-4">
                                    Votre abonnement {currentPlan.name} est maintenant actif.
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                    Facture {formatXAF(displayPrice)} · Réf. DIG-2026-{Math.random().toString(36).slice(2, 5).toUpperCase()}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    {paymentStep !== "success" && (
                        <div className="p-4 border-t border-white/5 flex items-center justify-between">
                            {paymentStep !== "method" ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setPaymentStep(paymentStep === "otp" ? "details" : "method")}
                                >
                                    Retour
                                </Button>
                            ) : (
                                <div />
                            )}
                            <Button
                                size="sm"
                                className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                                disabled={
                                    isProcessing ||
                                    (paymentStep === "details" && paymentMethod === "mobile_money" && phoneNumber.length < 8) ||
                                    (paymentStep === "otp" && otpCode.length < 4)
                                }
                                onClick={() => {
                                    if (paymentStep === "method") setPaymentStep("details");
                                    else if (paymentStep === "details") {
                                        if (paymentMethod === "mobile_money") setPaymentStep("otp");
                                        else handlePayment();
                                    }
                                    else if (paymentStep === "otp") handlePayment();
                                }}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Traitement…</>
                                ) : paymentStep === "method" ? (
                                    <>Continuer<ArrowRight className="h-3.5 w-3.5 ml-1" /></>
                                ) : paymentStep === "otp" ? (
                                    <>Confirmer le paiement</>
                                ) : (
                                    <>{paymentMethod === "mobile_money" ? "Envoyer le code" : `Payer ${formatXAF(displayPrice)}`}</>
                                )}
                            </Button>
                        </div>
                    )}

                    {paymentStep === "success" && (
                        <div className="p-4 border-t border-white/5">
                            <Button
                                size="sm"
                                className="w-full text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                                onClick={() => { setShowPayment(false); setPaymentStep("method"); }}
                            >
                                Fermer
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
