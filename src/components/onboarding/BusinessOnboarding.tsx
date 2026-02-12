"use client";

// ═══════════════════════════════════════════════════════════════════
// DIGITALIUM.IO — BusinessOnboarding
// 4-step wizard: Org Info → Plan → Team Invites → Payment
// Animated stepper with Framer Motion slide transitions
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
    Building2,
    CreditCard,
    Users,
    Crown,
    ChevronRight,
    ChevronLeft,
    Check,
    Trash2,
    Plus,
    Upload,
    Smartphone,
    Landmark,
    Sparkles,
    Star,
    Zap,
    Shield,
    ArrowRight,
    X,
    PartyPopper,
    Phone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const SECTORS = [
    "Assurance",
    "Banque",
    "Commerce",
    "Énergie",
    "Santé",
    "Tech",
    "Transport",
    "Autre",
] as const;

const SIZES = [
    { value: "1-10", label: "1 – 10 employés" },
    { value: "11-50", label: "11 – 50 employés" },
    { value: "51-200", label: "51 – 200 employés" },
    { value: "200+", label: "200+ employés" },
] as const;

const PLANS = [
    {
        id: "starter" as const,
        name: "Starter",
        pricePerUser: 15_000,
        maxUsers: 5,
        modules: ["iDocument", "iArchive"],
        icon: Star,
        gradient: "from-blue-600 to-cyan-500",
        features: ["5 utilisateurs max", "iDocument + iArchive", "1 Go stockage", "Support email"],
    },
    {
        id: "pro" as const,
        name: "Pro",
        pricePerUser: 15_000,
        maxUsers: 25,
        modules: ["iDocument", "iArchive", "iSignature"],
        icon: Zap,
        gradient: "from-violet-600 to-indigo-500",
        popular: true,
        features: ["25 utilisateurs max", "+ iSignature", "10 Go stockage", "Support prioritaire"],
    },
    {
        id: "enterprise" as const,
        name: "Enterprise",
        pricePerUser: 15_000,
        maxUsers: 50,
        modules: ["iDocument", "iArchive", "iSignature", "iAsted"],
        icon: Shield,
        gradient: "from-amber-600 to-orange-500",
        features: ["50 utilisateurs max", "Tous les modules", "100 Go stockage", "Support dédié + SLA"],
    },
];

const TEAM_ROLES = [
    { value: "org_admin", label: "Admin Organisation", level: 2 },
    { value: "org_manager", label: "Manager", level: 3 },
    { value: "org_member", label: "Membre", level: 4 },
    { value: "org_viewer", label: "Lecteur", level: 5 },
] as const;

const PAYMENT_METHODS = [
    {
        id: "mobile_money",
        label: "Mobile Money",
        subtitle: "MTN, Airtel, Moov — Le plus populaire",
        icon: Smartphone,
        popular: true,
    },
    {
        id: "bank_transfer",
        label: "Virement bancaire",
        subtitle: "BGFI, UGB, Orabank",
        icon: Landmark,
        popular: false,
    },
    {
        id: "card",
        label: "Carte bancaire",
        subtitle: "Visa, Mastercard",
        icon: CreditCard,
        popular: false,
    },
] as const;

const MOBILE_OPERATORS = ["MTN", "Airtel", "Moov"] as const;

const STEPS = [
    { label: "Organisation", icon: Building2 },
    { label: "Plan", icon: Crown },
    { label: "Équipe", icon: Users },
    { label: "Paiement", icon: CreditCard },
];

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface OrgInfo {
    name: string;
    sector: string;
    size: string;
    city: string;
    country: string;
    logoFile: File | null;
}

interface TeamInvite {
    id: string;
    email: string;
    role: string;
}

interface PaymentInfo {
    method: string;
    phone: string;
    operator: string;
    acceptedTerms: boolean;
}

/* ═══════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════ */

const slideVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

/* ═══════════════════════════════════════════════
   CONFETTI EFFECT
   ═══════════════════════════════════════════════ */

function ConfettiEffect() {
    const colors = ["#8B5CF6", "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        top: -20,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                    }}
                    initial={{ y: -20, rotate: 0, opacity: 1 }}
                    animate={{
                        y: typeof window !== "undefined" ? window.innerHeight + 20 : 900,
                        rotate: p.rotation + 720,
                        opacity: 0,
                    }}
                    transition={{
                        duration: 2.5 + Math.random(),
                        delay: p.delay,
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   FORMAT HELPERS
   ═══════════════════════════════════════════════ */

function formatXAF(amount: number): string {
    return new Intl.NumberFormat("fr-FR").format(amount) + " XAF";
}

/* ═══════════════════════════════════════════════
   STEP COMPONENTS
   ═══════════════════════════════════════════════ */

/* ─── Step 1: Organisation Info ────────────────── */

function StepOrgInfo({
    data,
    onChange,
}: {
    data: OrgInfo;
    onChange: (d: Partial<OrgInfo>) => void;
}) {
    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-bold">Informations de votre organisation</h2>
                <p className="text-sm text-muted-foreground">
                    Ces informations seront utilisées pour configurer votre espace de travail.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="org-name" className="text-xs font-medium">Nom de l&apos;entreprise *</Label>
                    <Input
                        id="org-name"
                        placeholder="Ex: ASCOMA Gabon"
                        value={data.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        className="bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Secteur d&apos;activité *</Label>
                    <Select value={data.sector} onValueChange={(v: string) => onChange({ sector: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                        <SelectContent>
                            {SECTORS.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Taille de l&apos;entreprise *</Label>
                    <Select value={data.size} onValueChange={(v: string) => onChange({ size: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                        <SelectContent>
                            {SIZES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="org-city" className="text-xs font-medium">Ville</Label>
                    <Input
                        id="org-city"
                        value={data.city}
                        onChange={(e) => onChange({ city: e.target.value })}
                        className="bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="org-country" className="text-xs font-medium">Pays</Label>
                    <Input
                        id="org-country"
                        value={data.country}
                        onChange={(e) => onChange({ country: e.target.value })}
                        className="bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                    />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium">Logo (optionnel)</Label>
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                            {data.logoFile ? (
                                <Check className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <Upload className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="logo-upload" className="cursor-pointer">
                                <span className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                    {data.logoFile ? data.logoFile.name : "Cliquez pour uploader"}
                                </span>
                            </Label>
                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    onChange({ logoFile: e.target.files?.[0] || null })
                                }
                            />
                            <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG · Max 2 Mo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Step 2: Plan Selection ───────────────────── */

function StepPlanSelection({
    selectedPlan,
    billingCycle,
    onSelectPlan,
    onToggleCycle,
}: {
    selectedPlan: string;
    billingCycle: "monthly" | "annual";
    onSelectPlan: (planId: string) => void;
    onToggleCycle: () => void;
}) {
    const isAnnual = billingCycle === "annual";

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-bold">Choisissez votre plan</h2>
                <p className="text-sm text-muted-foreground">
                    Tous les plans incluent un essai gratuit de 14 jours.
                </p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className={`text-sm ${!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    Mensuel
                </span>
                <button
                    onClick={onToggleCycle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-violet-600" : "bg-white/10"}`}
                >
                    <motion.div
                        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white"
                        animate={{ x: isAnnual ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </button>
                <span className={`text-sm ${isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    Annuel
                </span>
                {isAnnual && (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px]">
                        -20%
                    </Badge>
                )}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const monthlyPrice = plan.pricePerUser;
                    const displayPrice = isAnnual
                        ? Math.round(monthlyPrice * 0.8)
                        : monthlyPrice;
                    const isSelected = selectedPlan === plan.id;

                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all duration-300 relative ${isSelected
                                    ? "border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/30"
                                    : "glass border-white/5 hover:border-violet-500/20"
                                    }`}
                                onClick={() => onSelectPlan(plan.id)}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-[10px] border-0 shadow-lg">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Populaire
                                        </Badge>
                                    </div>
                                )}
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-bold text-sm">{plan.name}</span>
                                    </div>

                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-extrabold">
                                                {formatXAF(displayPrice)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            par utilisateur / mois · {plan.maxUsers} users max
                                        </p>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    <ul className="space-y-1.5">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center"
                                        >
                                            <Check className="h-3 w-3 text-white" />
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Total estimate */}
            {selectedPlan && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 text-center"
                >
                    <p className="text-xs text-muted-foreground">Total estimé par mois</p>
                    <p className="text-lg font-bold text-violet-300">
                        {formatXAF(
                            (isAnnual
                                ? Math.round(PLANS.find((p) => p.id === selectedPlan)!.pricePerUser * 0.8)
                                : PLANS.find((p) => p.id === selectedPlan)!.pricePerUser) *
                            PLANS.find((p) => p.id === selectedPlan)!.maxUsers
                        )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {PLANS.find((p) => p.id === selectedPlan)!.maxUsers} utilisateurs ×{" "}
                        {formatXAF(
                            isAnnual
                                ? Math.round(PLANS.find((p) => p.id === selectedPlan)!.pricePerUser * 0.8)
                                : PLANS.find((p) => p.id === selectedPlan)!.pricePerUser
                        )}
                    </p>
                </motion.div>
            )}
        </div>
    );
}

/* ─── Step 3: Team Invites ─────────────────────── */

function StepTeamInvites({
    invites,
    onAdd,
    onRemove,
}: {
    invites: TeamInvite[];
    onAdd: (email: string, role: string) => void;
    onRemove: (id: string) => void;
}) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("org_member");

    const handleAdd = () => {
        if (!email.includes("@")) return;
        onAdd(email, role);
        setEmail("");
    };

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-bold">Invitez votre équipe</h2>
                <p className="text-sm text-muted-foreground">
                    Ajoutez les membres de votre organisation. Vous pourrez en ajouter d&apos;autres plus tard.
                </p>
            </div>

            {/* Add member form */}
            <Card className="glass border-white/5">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            type="email"
                            placeholder="email@entreprise.ga"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="flex-1 bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                        />
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-full sm:w-44 bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TEAM_ROLES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleAdd}
                            disabled={!email.includes("@")}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Invite list */}
            {invites.length > 0 && (
                <Card className="glass border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                            {invites.length} invitation{invites.length > 1 ? "s" : ""}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {invites.map((inv) => (
                            <div key={inv.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-violet-500/15 text-violet-300 text-[10px]">
                                        {inv.email.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{inv.email}</p>
                                </div>
                                <Badge variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-300 border-0">
                                    {TEAM_ROLES.find((r) => r.value === inv.role)?.label}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemove(inv.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {invites.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune invitation pour le moment</p>
                    <p className="text-xs">Vous pourrez inviter des membres après la création</p>
                </div>
            )}
        </div>
    );
}

/* ─── Step 4: Payment ──────────────────────────── */

function StepPayment({
    data,
    onChange,
    selectedPlan,
    billingCycle,
}: {
    data: PaymentInfo;
    onChange: (d: Partial<PaymentInfo>) => void;
    selectedPlan: string;
    billingCycle: "monthly" | "annual";
}) {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    const isAnnual = billingCycle === "annual";
    const pricePerUser = plan
        ? isAnnual
            ? Math.round(plan.pricePerUser * 0.8)
            : plan.pricePerUser
        : 0;

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-bold">Mode de paiement</h2>
                <p className="text-sm text-muted-foreground">
                    Choisissez comment régler votre abonnement après l&apos;essai gratuit.
                </p>
            </div>

            {/* Payment methods */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = data.method === pm.id;
                    return (
                        <Card
                            key={pm.id}
                            className={`cursor-pointer transition-all duration-200 relative ${isSelected
                                ? "border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/30"
                                : "glass border-white/5 hover:border-violet-500/20"
                                }`}
                            onClick={() => onChange({ method: pm.id })}
                        >
                            {pm.popular && (
                                <Badge className="absolute -top-2 right-3 bg-emerald-500/15 text-emerald-400 border-0 text-[9px]">
                                    Populaire
                                </Badge>
                            )}
                            <CardContent className="p-4 text-center space-y-2">
                                <Icon className={`h-6 w-6 mx-auto ${isSelected ? "text-violet-400" : "text-muted-foreground"}`} />
                                <p className="text-xs font-medium">{pm.label}</p>
                                <p className="text-[10px] text-muted-foreground">{pm.subtitle}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Mobile Money details */}
            {data.method === "mobile_money" && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Opérateur</Label>
                            <Select value={data.operator} onValueChange={(v: string) => onChange({ operator: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                                <SelectContent>
                                    {MOBILE_OPERATORS.map((op) => (
                                        <SelectItem key={op} value={op}>{op}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone-number" className="text-xs font-medium">Numéro de téléphone</Label>
                            <div className="relative">
                                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    id="phone-number"
                                    placeholder="+241 07 XX XX XX"
                                    value={data.phone}
                                    onChange={(e) => onChange({ phone: e.target.value })}
                                    className="pl-8 bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Summary */}
            {plan && (
                <Card className="glass border-white/5">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Plan {plan.name}</span>
                            <span>{formatXAF(pricePerUser)}/user/mois</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Utilisateurs max</span>
                            <span>{plan.maxUsers}</span>
                        </div>
                        <Separator className="bg-white/5" />
                        <div className="flex justify-between font-bold">
                            <span>Total estimé</span>
                            <span className="text-violet-300">{formatXAF(pricePerUser * plan.maxUsers)}/mois</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={data.acceptedTerms}
                    onChange={(e) => onChange({ acceptedTerms: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                />
                <span className="text-xs text-muted-foreground">
                    J&apos;accepte les{" "}
                    <span className="text-violet-400 hover:underline">Conditions Générales de Vente</span> et la{" "}
                    <span className="text-violet-400 hover:underline">Politique de Confidentialité</span>{" "}
                    de DIGITALIUM.IO
                </span>
            </label>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN WIZARD COMPONENT
   ═══════════════════════════════════════════════ */

export default function BusinessOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Form state ──
    const [orgInfo, setOrgInfo] = useState<OrgInfo>({
        name: "",
        sector: "",
        size: "",
        city: "Libreville",
        country: "Gabon",
        logoFile: null,
    });

    const [selectedPlan, setSelectedPlan] = useState("pro");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [invites, setInvites] = useState<TeamInvite[]>([]);

    const [payment, setPayment] = useState<PaymentInfo>({
        method: "mobile_money",
        phone: "",
        operator: "MTN",
        acceptedTerms: false,
    });

    // ── Step validation ──
    const canProceed = useMemo(() => {
        switch (step) {
            case 0:
                return orgInfo.name.trim().length > 0 && orgInfo.sector.length > 0 && orgInfo.size.length > 0;
            case 1:
                return selectedPlan.length > 0;
            case 2:
                return true; // can skip
            case 3:
                return payment.method.length > 0 && payment.acceptedTerms;
            default:
                return false;
        }
    }, [step, orgInfo, selectedPlan, payment]);

    // ── Navigation ──
    const goNext = useCallback(() => {
        if (step < 3) {
            setDirection(1);
            setStep((p) => p + 1);
        }
    }, [step]);

    const goPrev = useCallback(() => {
        if (step > 0) {
            setDirection(-1);
            setStep((p) => p - 1);
        }
    }, [step]);

    // ── Submit ──
    const handleSubmit = useCallback(async () => {
        if (!canProceed || isSubmitting) return;
        setIsSubmitting(true);

        try {
            // TODO: Save to Convex (organizations, organization_members)
            // TODO: Save to Supabase (business_subscriptions, user_personas)
            console.log("[BusinessOnboarding] Creating organization:", {
                orgInfo,
                plan: selectedPlan,
                billingCycle,
                invites,
                payment: { method: payment.method, operator: payment.operator },
            });

            // Simulate API delay
            await new Promise((r) => setTimeout(r, 1500));

            // Show confetti
            setShowConfetti(true);

            // Redirect after confetti
            setTimeout(() => {
                router.push("/pro");
            }, 3000);
        } catch (err) {
            console.error("[BusinessOnboarding] Error:", err);
            setIsSubmitting(false);
        }
    }, [canProceed, isSubmitting, orgInfo, selectedPlan, billingCycle, invites, payment, router]);

    // ── Team invite handlers ──
    const addInvite = useCallback((email: string, role: string) => {
        setInvites((prev) => [
            ...prev,
            { id: crypto.randomUUID(), email, role },
        ]);
    }, []);

    const removeInvite = useCallback((id: string) => {
        setInvites((prev) => prev.filter((inv) => inv.id !== id));
    }, []);

    // ── Progress ──
    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            {showConfetti && <ConfettiEffect />}

            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center mx-auto mb-3">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Créer votre espace entreprise</h1>
                    <p className="text-sm text-muted-foreground mt-1">DIGITALIUM.IO · Plateforme documentaire</p>
                </div>

                {/* Stepper */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const isCompleted = i < step;
                            const isCurrent = i === step;

                            return (
                                <React.Fragment key={s.label}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                                ? "bg-violet-600 border-violet-600"
                                                : isCurrent
                                                    ? "border-violet-500 bg-violet-500/10"
                                                    : "border-white/10 bg-white/5"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-4 w-4 text-white" />
                                            ) : (
                                                <Icon
                                                    className={`h-4 w-4 ${isCurrent ? "text-violet-400" : "text-muted-foreground"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                        <span
                                            className={`text-[10px] font-medium ${isCurrent ? "text-violet-400" : "text-muted-foreground"
                                                }`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-violet-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: i < step ? "100%" : "0%" }}
                                                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <Card className="glass border-white/5 overflow-hidden">
                    <CardContent className="p-6">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                {step === 0 && (
                                    <StepOrgInfo
                                        data={orgInfo}
                                        onChange={(d) => setOrgInfo((p) => ({ ...p, ...d }))}
                                    />
                                )}
                                {step === 1 && (
                                    <StepPlanSelection
                                        selectedPlan={selectedPlan}
                                        billingCycle={billingCycle}
                                        onSelectPlan={setSelectedPlan}
                                        onToggleCycle={() =>
                                            setBillingCycle((c) => (c === "monthly" ? "annual" : "monthly"))
                                        }
                                    />
                                )}
                                {step === 2 && (
                                    <StepTeamInvites
                                        invites={invites}
                                        onAdd={addInvite}
                                        onRemove={removeInvite}
                                    />
                                )}
                                {step === 3 && (
                                    <StepPayment
                                        data={payment}
                                        onChange={(d) => setPayment((p) => ({ ...p, ...d }))}
                                        selectedPlan={selectedPlan}
                                        billingCycle={billingCycle}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-4">
                    <Button
                        variant="ghost"
                        onClick={goPrev}
                        disabled={step === 0}
                        className="text-muted-foreground"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Retour
                    </Button>

                    <div className="flex gap-2">
                        {step === 2 && (
                            <Button
                                variant="outline"
                                onClick={goNext}
                                className="text-xs border-white/10"
                            >
                                Passer cette étape
                                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button
                                onClick={goNext}
                                disabled={!canProceed}
                                className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                            >
                                Continuer
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!canProceed || isSubmitting}
                                className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        />
                                        Création en cours…
                                    </>
                                ) : (
                                    <>
                                        <PartyPopper className="h-4 w-4 mr-1.5" />
                                        Commencer l&apos;essai gratuit (14 jours)
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
