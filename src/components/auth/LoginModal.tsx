"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — LoginModal
// Floating glassmorphism modal for login, triggered from landing page
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Validation schemas ──
const loginSchema = z.object({
    email: z.string().email("Adresse email invalide"),
    password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const resetSchema = z.object({
    email: z.string().email("Adresse email invalide"),
});

// ── Google icon SVG ──
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

interface LoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToRegister: () => void;
}

export default function LoginModal({
    open,
    onOpenChange,
    onSwitchToRegister,
}: LoginModalProps) {
    const router = useRouter();
    const { signIn, signInWithGoogle, resetPassword, loading, error, clearError } =
        useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setFormErrors({});

            const result = loginSchema.safeParse({ email, password });
            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
                });
                setFormErrors(errors);
                return;
            }

            setSubmitting(true);
            try {
                await signIn(email, password);
                toast.success("Connexion réussie !");
                onOpenChange(false);
                router.push("/pro");
            } catch {
                // Error is already set in context
            } finally {
                setSubmitting(false);
            }
        },
        [email, password, signIn, router, onOpenChange]
    );

    const handleGoogleLogin = useCallback(async () => {
        setSubmitting(true);
        try {
            await signInWithGoogle();
            toast.success("Connexion Google réussie !");
            onOpenChange(false);
            router.push("/pro");
        } catch {
            // Error is already set in context
        } finally {
            setSubmitting(false);
        }
    }, [signInWithGoogle, router, onOpenChange]);

    const handleResetPassword = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const result = resetSchema.safeParse({ email: resetEmail });
            if (!result.success) {
                toast.error("Adresse email invalide");
                return;
            }

            try {
                await resetPassword(resetEmail);
                toast.success(
                    "Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."
                );
                setShowReset(false);
                setResetEmail("");
            } catch {
                // Error handled in context
            }
        },
        [resetEmail, resetPassword]
    );

    const handleClose = useCallback(() => {
        onOpenChange(false);
        // Reset form state on close
        setEmail("");
        setPassword("");
        setFormErrors({});
        setShowReset(false);
        setResetEmail("");
    }, [onOpenChange]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative w-full max-w-md"
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
                                    Connectez-vous à votre espace
                                </p>
                            </div>

                            {/* Error display */}
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

                            {/* Login form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="modal-login-email"
                                        className="text-sm text-white/70"
                                    >
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <Input
                                            id="modal-login-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="modal-login-password"
                                            className="text-sm text-white/70"
                                        >
                                            Mot de passe
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => setShowReset(true)}
                                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <Input
                                            id="modal-login-password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-11"
                                            autoComplete="current-password"
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
                                            Connexion…
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Se connecter
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

                            {/* Google button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                disabled={submitting || loading}
                                className="w-full h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                            >
                                <GoogleIcon />
                                Continuer avec Google
                            </Button>

                            {/* Register link */}
                            <p className="text-center text-sm text-white/40 mt-6">
                                Pas encore de compte ?{" "}
                                <button
                                    type="button"
                                    onClick={onSwitchToRegister}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    S&apos;inscrire
                                </button>
                            </p>
                        </div>
                    </motion.div>

                    {/* Password reset sub-modal */}
                    <AnimatePresence>
                        {showReset && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setShowReset(false)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">
                                            Réinitialiser le mot de passe
                                        </h3>
                                        <button
                                            onClick={() => setShowReset(false)}
                                            className="text-white/30 hover:text-white/60"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-white/50 mb-4">
                                        Entrez votre email pour recevoir un lien de
                                        réinitialisation.
                                    </p>
                                    <form
                                        onSubmit={handleResetPassword}
                                        className="space-y-4"
                                    >
                                        <Input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) =>
                                                setResetEmail(e.target.value)
                                            }
                                            placeholder="votre@email.com"
                                            className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-11"
                                            autoComplete="email"
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-11 rounded-xl font-medium"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                                            }}
                                        >
                                            Envoyer le lien
                                        </Button>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
