"use client";

// ═══════════════════════════════════════════════════════════════════
// DIGITALIUM.IO — InstitutionalContactForm
// Quote request form for government & institutional clients
// Saves lead in Convex (leads table)
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    User,
    Mail,
    Phone,
    Users,
    Send,
    Check,
    Landmark,
    Shield,
    Server,
    Key,
    Archive,
    GraduationCap,
    Lock,
    MessageSquareText,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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

const INSTITUTION_TYPES = [
    "Ministère",
    "Agence gouvernementale",
    "Collectivité",
    "Organisme public",
    "Autre",
] as const;

const SPECIFIC_NEEDS = [
    { id: "on_premise", label: "Déploiement on-premise", icon: Server },
    { id: "sovereign_cloud", label: "Cloud privé souverain", icon: Shield },
    { id: "sso", label: "SSO SAML/OIDC", icon: Key },
    { id: "e2e_encryption", label: "Chiffrement E2E", icon: Lock },
    { id: "archive_migration", label: "Migration d'archives existantes", icon: Archive },
    { id: "onsite_training", label: "Formation sur site", icon: GraduationCap },
] as const;

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface FormData {
    institutionName: string;
    institutionType: string;
    contactName: string;
    email: string;
    phone: string;
    estimatedUsers: string;
    needs: string[];
    message: string;
}

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function InstitutionalContactForm() {
    const [form, setForm] = useState<FormData>({
        institutionName: "",
        institutionType: "",
        contactName: "",
        email: "",
        phone: "",
        estimatedUsers: "",
        needs: [],
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
        setForm((p) => ({ ...p, [field]: value }));
    }, []);

    const toggleNeed = useCallback((needId: string) => {
        setForm((p) => ({
            ...p,
            needs: p.needs.includes(needId)
                ? p.needs.filter((n) => n !== needId)
                : [...p.needs, needId],
        }));
    }, []);

    const isValid =
        form.institutionName.trim().length > 0 &&
        form.institutionType.length > 0 &&
        form.contactName.trim().length > 0 &&
        form.email.includes("@") &&
        form.estimatedUsers.length > 0;

    const handleSubmit = useCallback(async () => {
        if (!isValid || isSubmitting) return;
        setIsSubmitting(true);

        try {
            // TODO: Save lead to Convex (leads table)
            // TODO: Send notification email via Cloud Function
            console.log("[InstitutionalContactForm] Submitting lead:", form);

            // Simulate API delay
            await new Promise((r) => setTimeout(r, 1500));

            setIsSubmitted(true);
        } catch (err) {
            console.error("[InstitutionalContactForm] Error:", err);
            setIsSubmitting(false);
        }
    }, [isValid, isSubmitting, form]);

    /* ─── Success state ─────────────────── */
    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center max-w-md"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center mx-auto mb-4"
                    >
                        <Check className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-bold mb-2">Demande envoyée !</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Nous avons bien reçu votre demande de devis pour{" "}
                        <span className="text-foreground font-medium">{form.institutionName}</span>.
                        Un conseiller DIGITALIUM.IO vous contactera sous 48h.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button
                            variant="outline"
                            className="border-white/10"
                            onClick={() => {
                                setIsSubmitted(false);
                                setIsSubmitting(false);
                                setForm({
                                    institutionName: "",
                                    institutionType: "",
                                    contactName: "",
                                    email: "",
                                    phone: "",
                                    estimatedUsers: "",
                                    needs: [],
                                    message: "",
                                });
                            }}
                        >
                            Nouvelle demande
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-violet-600 to-indigo-500"
                            onClick={() => (window.location.href = "/")}
                        >
                            Retour à l&apos;accueil
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ─── Form ──────────────────────────── */
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center mx-auto mb-3">
                        <Landmark className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Demande de devis — Institutions</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Solution dédiée pour les organisations gouvernementales et institutionnelles
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass border-white/5">
                        <CardContent className="p-6 space-y-6">
                            {/* Section 1: Institution */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-amber-500/15 flex items-center justify-center">
                                        <Building2 className="h-3.5 w-3.5 text-amber-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold">Institution</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="inst-name" className="text-xs font-medium">Nom de l&apos;institution *</Label>
                                        <Input
                                            id="inst-name"
                                            placeholder="Ex: Ministère de l'Économie"
                                            value={form.institutionName}
                                            onChange={(e) => updateField("institutionName", e.target.value)}
                                            className="bg-white/5 border-white/10 focus-visible:ring-amber-500/30"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium">Type d&apos;institution *</Label>
                                        <Select value={form.institutionType} onValueChange={(v: string) => updateField("institutionType", v)}>
                                            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                                            <SelectContent>
                                                {INSTITUTION_TYPES.map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="est-users" className="text-xs font-medium">Nombre estimé d&apos;utilisateurs *</Label>
                                        <Input
                                            id="est-users"
                                            type="number"
                                            placeholder="Ex: 50"
                                            value={form.estimatedUsers}
                                            onChange={(e) => updateField("estimatedUsers", e.target.value)}
                                            className="bg-white/5 border-white/10 focus-visible:ring-amber-500/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Section 2: Contact */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-violet-500/15 flex items-center justify-center">
                                        <User className="h-3.5 w-3.5 text-violet-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold">Contact</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="contact-name" className="text-xs font-medium">Nom complet *</Label>
                                        <div className="relative">
                                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                id="contact-name"
                                                placeholder="Jean Ndong"
                                                value={form.contactName}
                                                onChange={(e) => updateField("contactName", e.target.value)}
                                                className="pl-8 bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="contact-email" className="text-xs font-medium">Email professionnel *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                placeholder="contact@institution.ga"
                                                value={form.email}
                                                onChange={(e) => updateField("email", e.target.value)}
                                                className="pl-8 bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="contact-phone" className="text-xs font-medium">Téléphone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                id="contact-phone"
                                                placeholder="+241 07 XX XX XX"
                                                value={form.phone}
                                                onChange={(e) => updateField("phone", e.target.value)}
                                                className="pl-8 bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Section 3: Specific Needs */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold">Besoins spécifiques</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {SPECIFIC_NEEDS.map((need) => {
                                        const Icon = need.icon;
                                        const isChecked = form.needs.includes(need.id);
                                        return (
                                            <button
                                                key={need.id}
                                                type="button"
                                                onClick={() => toggleNeed(need.id)}
                                                className={`flex items-center gap-2.5 p-3 rounded-lg text-left text-xs transition-all duration-200 ${isChecked
                                                    ? "bg-violet-500/10 border border-violet-500/30 text-foreground"
                                                    : "bg-white/3 border border-white/5 text-muted-foreground hover:border-white/10"
                                                    }`}
                                            >
                                                <div
                                                    className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked
                                                        ? "bg-violet-500 border-violet-500"
                                                        : "border-white/20 bg-transparent"
                                                        }`}
                                                >
                                                    {isChecked && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <Icon className={`h-3.5 w-3.5 shrink-0 ${isChecked ? "text-violet-400" : ""}`} />
                                                <span className="font-medium">{need.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Section 4: Message */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-blue-500/15 flex items-center justify-center">
                                        <MessageSquareText className="h-3.5 w-3.5 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold">Message</h3>
                                </div>

                                <Textarea
                                    placeholder="Décrivez vos besoins, contraintes techniques ou toute information utile…"
                                    value={form.message}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("message", e.target.value)}
                                    rows={4}
                                    className="bg-white/5 border-white/10 focus-visible:ring-violet-500/30 text-sm resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={!isValid || isSubmitting}
                                className="w-full h-11 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-medium"
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        />
                                        Envoi en cours…
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Demander un devis
                                    </>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground">
                                En soumettant ce formulaire, vous acceptez d&apos;être contacté par l&apos;équipe DIGITALIUM.IO
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
