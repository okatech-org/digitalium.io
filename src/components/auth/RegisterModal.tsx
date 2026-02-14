"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — RegisterModal
// Floating glassmorphism modal for registration (2-step), triggered from landing page
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    ArrowRight,
    ArrowLeft,
    X,
    Building2,
    Landmark,
    Users,
    Check,
    Shield,
    FileText,
    Archive,
    PenTool,
    Scale,
    Server,
    Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Validation ──
const registerSchema = z
    .object({
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        email: z.string().email("Adresse email invalide"),
        password: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(
                /[A-Z]/,
                "Le mot de passe doit contenir au moins une majuscule"
            )
            .regex(
                /[0-9]/,
                "Le mot de passe doit contenir au moins un chiffre"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

// ── Google icon ──
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

// ── Persona cards data ──
const PERSONAS = [
    {
        id: "citizen" as const,
        icon: Users,
        title: "Citoyens",
        subtitle: "identite.ga",
        tagline: "Pour vous et votre famille",
        price: "Gratuit",
        priceDetail: null,
        gradient: "from-emerald-500/20 to-teal-600/20",
        borderColor: "border-emerald-500/30",
        hoverGlow: "hover:shadow-emerald-500/20",
        iconColor: "text-emerald-400",
        accentColor: "#10B981",
        features: [
            { icon: FileText, label: "Scan & numérisation" },
            { icon: Shield, label: "Coffre-fort numérique" },
            { icon: PenTool, label: "Signature électronique" },
        ],
        cta: "Commencer gratuitement",
        redirect: "https://identite.ga",
        external: true,
    },
    {
        id: "business" as const,
        icon: Building2,
        title: "Entreprises",
        subtitle: "PME & Startups",
        tagline: "Optimisez votre gestion documentaire",
        price: "15 000 XAF",
        priceDetail: "/utilisateur/mois",
        gradient: "from-blue-500/20 to-violet-600/20",
        borderColor: "border-blue-500/30",
        hoverGlow: "hover:shadow-blue-500/20",
        iconColor: "text-blue-400",
        accentColor: "#3B82F6",
        features: [
            { icon: FileText, label: "iDocument — GED" },
            { icon: Archive, label: "iArchive — Archivage" },
            { icon: PenTool, label: "iSignature — Signature" },
            { icon: Scale, label: "iAsted — Conformité" },
        ],
        cta: "Démarrer l'essai",
        redirect: "/pro",
        external: false,
    },
    {
        id: "institutional" as const,
        icon: Landmark,
        title: "Institutions",
        subtitle: "Gouvernement & Collectivités",
        tagline: "Infrastructure souveraine",
        price: "Sur devis",
        priceDetail: "Licence perpétuelle",
        gradient: "from-amber-500/20 to-orange-600/20",
        borderColor: "border-amber-500/30",
        hoverGlow: "hover:shadow-amber-500/20",
        iconColor: "text-amber-400",
        accentColor: "#F59E0B",
        features: [
            { icon: Server, label: "On-premise / Cloud privé" },
            { icon: Shield, label: "SLA 99.9%" },
            { icon: Clock, label: "Support dédié 24/7" },
        ],
        cta: "Demander un devis",
        redirect: "/institutional",
        external: false,
    },
] as const;

type PersonaId = (typeof PERSONAS)[number]["id"];

interface RegisterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({
    open,
    onOpenChange,
    onSwitchToLogin,
}: RegisterModalProps) {
    const router = useRouter();
    const {
        signUp,
        signInWithGoogle,
        loading,
        error,
        clearError,
    } = useAuth();

    // ── Form state ──
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(
        null
    );

    // ── Password strength indicator ──
    const passwordStrength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strengthLabel = ["", "Faible", "Moyen", "Bon", "Excellent"];
    const strengthColor = [
        "bg-white/10",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-emerald-500",
    ];

    // ── Step 1: Create account ──
    const handleCreateAccount = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setFormErrors({});

            const result = registerSchema.safeParse({
                name,
                email,
                password,
                confirmPassword,
            });
            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path[0])
                        errors[issue.path[0] as string] = issue.message;
                });
                setFormErrors(errors);
                return;
            }

            setSubmitting(true);
            try {
                await signUp(email, password, name);
                toast.success("Compte créé avec succès !");
                setStep(2);
            } catch {
                // Error handled in context
            } finally {
                setSubmitting(false);
            }
        },
        [name, email, password, confirmPassword, signUp]
    );

    const handleGoogleSignUp = useCallback(async () => {
        setSubmitting(true);
        try {
            await signInWithGoogle();
            toast.success("Inscription Google réussie !");
            setStep(2);
        } catch {
            // Error handled in context
        } finally {
            setSubmitting(false);
        }
    }, [signInWithGoogle]);

    // ── Step 2: Persona selection ──
    const handlePersonaSelect = useCallback(
        (persona: PersonaId) => {
            setSelectedPersona(persona);

            const personaData = PERSONAS.find((p) => p.id === persona);
            if (!personaData) return;

            toast.success(`Bienvenue sur DIGITALIUM ! Persona : ${personaData.title}`);
            onOpenChange(false);

            if (personaData.external) {
                window.location.href = personaData.redirect;
            } else {
                router.push(personaData.redirect);
            }
        },
        [router, onOpenChange]
    );

    const handleClose = useCallback(() => {
        onOpenChange(false);
        // Reset form state on close
        setTimeout(() => {
            setStep(1);
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setFormErrors({});
            setSelectedPersona(null);
        }, 300);
    }, [onOpenChange]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={handleClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal card */}
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            /* ════════════════ STEP 1: Account Creation ════════════════ */
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="relative w-full max-w-md my-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                    onClick={handleClose}
                                    className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={14} />
                                </button>

                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                                    {/* Logo */}
                                    <div className="text-center mb-8">
                                        <h1
                                            className="text-3xl font-bold tracking-wider"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #3B82F6, #8B5CF6, #00D9FF)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            DIGITALIUM
                                        </h1>
                                        <p className="text-sm text-white/50 mt-2">
                                            Créer votre compte
                                        </p>
                                        {/* Steps indicator */}
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <div className="w-8 h-1 rounded-full bg-blue-500" />
                                            <div className="w-8 h-1 rounded-full bg-white/10" />
                                        </div>
                                    </div>

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between"
                                            >
                                                <span>{error}</span>
                                                <button
                                                    onClick={clearError}
                                                    className="ml-2 hover:text-red-300"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <form
                                        onSubmit={handleCreateAccount}
                                        className="space-y-4"
                                    >
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white/70">
                                                Nom complet
                                            </Label>
                                            <div className="relative">
                                                <User
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                                />
                                                <Input
                                                    value={name}
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                    placeholder="Jean Moussavou"
                                                    className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-11"
                                                    autoComplete="name"
                                                />
                                            </div>
                                            {formErrors.name && (
                                                <p className="text-xs text-red-400">
                                                    {formErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white/70">
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <Mail
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                                />
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    placeholder="votre@email.com"
                                                    className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-11"
                                                    autoComplete="email"
                                                />
                                            </div>
                                            {formErrors.email && (
                                                <p className="text-xs text-red-400">
                                                    {formErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white/70">
                                                Mot de passe
                                            </Label>
                                            <div className="relative">
                                                <Lock
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                                />
                                                <Input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(e.target.value)
                                                    }
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-11"
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(!showPassword)
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            {formErrors.password && (
                                                <p className="text-xs text-red-400">
                                                    {formErrors.password}
                                                </p>
                                            )}
                                            {/* Password strength */}
                                            {password.length > 0 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 flex gap-1">
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-full transition-colors ${i <=
                                                                    passwordStrength
                                                                    ? strengthColor[
                                                                    passwordStrength
                                                                    ]
                                                                    : "bg-white/10"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-white/40">
                                                        {
                                                            strengthLabel[
                                                            passwordStrength
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm password */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white/70">
                                                Confirmer le mot de passe
                                            </Label>
                                            <div className="relative">
                                                <Lock
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                                />
                                                <Input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) =>
                                                        setConfirmPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="••••••••"
                                                    className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-11"
                                                    autoComplete="new-password"
                                                />
                                                {confirmPassword.length > 0 &&
                                                    password === confirmPassword && (
                                                        <Check
                                                            size={16}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400"
                                                        />
                                                    )}
                                            </div>
                                            {formErrors.confirmPassword && (
                                                <p className="text-xs text-red-400">
                                                    {formErrors.confirmPassword}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={submitting || loading}
                                            className="w-full h-11 rounded-xl font-medium text-white"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                                            }}
                                        >
                                            {submitting ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Création…
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Créer mon compte
                                                    <ArrowRight size={16} />
                                                </span>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Separator */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="px-3 text-white/30 bg-transparent backdrop-blur-sm">
                                                ou
                                            </span>
                                        </div>
                                    </div>

                                    {/* Google */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGoogleSignUp}
                                        disabled={submitting || loading}
                                        className="w-full h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                                    >
                                        <GoogleIcon />
                                        S&apos;inscrire avec Google
                                    </Button>

                                    {/* Login link */}
                                    <p className="text-center text-sm text-white/40 mt-6">
                                        Déjà un compte ?{" "}
                                        <button
                                            type="button"
                                            onClick={onSwitchToLogin}
                                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                        >
                                            Se connecter
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            /* ════════════════ STEP 2: Persona Selection ════════════════ */
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="relative w-full max-w-4xl my-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                    onClick={handleClose}
                                    className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={14} />
                                </button>

                                <div className="text-center mb-8">
                                    <h1
                                        className="text-3xl font-bold tracking-wider mb-2"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #3B82F6, #8B5CF6, #00D9FF)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        Choisissez votre espace
                                    </h1>
                                    <p className="text-white/50 text-sm">
                                        Sélectionnez le profil qui correspond à votre
                                        usage
                                    </p>
                                    {/* Steps indicator */}
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        <div className="w-8 h-1 rounded-full bg-blue-500/40" />
                                        <div className="w-8 h-1 rounded-full bg-blue-500" />
                                    </div>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="mt-4 text-xs text-white/30 hover:text-white/60 flex items-center gap-1 mx-auto transition-colors"
                                    >
                                        <ArrowLeft size={12} />
                                        Retour
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {PERSONAS.map((persona, index) => {
                                        const Icon = persona.icon;
                                        const isSelected =
                                            selectedPersona === persona.id;

                                        return (
                                            <motion.button
                                                key={persona.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                    duration: 0.4,
                                                }}
                                                whileHover={{
                                                    scale: 1.03,
                                                    y: -4,
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() =>
                                                    handlePersonaSelect(persona.id)
                                                }
                                                className={`relative group text-left rounded-2xl border bg-white/5 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 ${isSelected
                                                    ? persona.borderColor +
                                                    " shadow-lg"
                                                    : "border-white/10 " +
                                                    persona.hoverGlow
                                                    } hover:shadow-lg`}
                                            >
                                                {/* Glow effect */}
                                                <div
                                                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${persona.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                />

                                                <div className="relative z-10">
                                                    {/* Icon */}
                                                    <div
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${persona.iconColor}`}
                                                        style={{
                                                            background: `${persona.accentColor}15`,
                                                            border: `1px solid ${persona.accentColor}30`,
                                                        }}
                                                    >
                                                        <Icon size={24} />
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        {persona.title}
                                                    </h3>
                                                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-2">
                                                        {persona.subtitle}
                                                    </p>
                                                    <p className="text-sm text-white/60 mb-4">
                                                        {persona.tagline}
                                                    </p>

                                                    {/* Price */}
                                                    <div className="mb-4">
                                                        <span
                                                            className="text-2xl font-bold"
                                                            style={{
                                                                color: persona.accentColor,
                                                            }}
                                                        >
                                                            {persona.price}
                                                        </span>
                                                        {persona.priceDetail && (
                                                            <span className="text-xs text-white/40 ml-1">
                                                                {persona.priceDetail}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Features */}
                                                    <ul className="space-y-2 mb-6">
                                                        {persona.features.map(
                                                            (feat) => {
                                                                const FeatIcon =
                                                                    feat.icon;
                                                                return (
                                                                    <li
                                                                        key={
                                                                            feat.label
                                                                        }
                                                                        className="flex items-center gap-2 text-sm text-white/60"
                                                                    >
                                                                        <FeatIcon
                                                                            size={14}
                                                                            className={
                                                                                persona.iconColor
                                                                            }
                                                                        />
                                                                        {feat.label}
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </ul>

                                                    {/* CTA */}
                                                    <div
                                                        className="w-full py-2.5 rounded-xl text-center text-sm font-medium text-white transition-all"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${persona.accentColor}, ${persona.accentColor}CC)`,
                                                        }}
                                                    >
                                                        {persona.cta}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
