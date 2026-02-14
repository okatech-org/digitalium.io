"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    Check,
    ChevronDown,
    Phone,
    Quote,
    Zap,
    Star,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FooterSection from "@/components/sections/FooterSection";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export interface SolutionModule {
    icon: LucideIcon;
    name: string;
    description: string;
    color: string;
}

export interface SolutionAdvantage {
    icon: LucideIcon;
    title: string;
    description: string;
}

export interface SolutionTestimonial {
    name: string;
    role: string;
    org: string;
    quote: string;
    avatar?: string;
}

export interface SolutionFAQ {
    q: string;
    a: string;
}

export interface SolutionPricingPlan {
    name: string;
    subtitle: string;
    price: string;
    priceAnnual: string;
    unit: string;
    popular?: boolean;
    features: string[];
    cta: string;
    ctaHref: string;
}

export interface SolutionPageData {
    /* Hero */
    heroIcon: LucideIcon;
    heroBadge: string;
    heroTitle: string;
    heroTitleGradient: string;
    heroSubtitle: string;
    heroGradient: string; // e.g. "from-amber-500/15 to-orange-500/5"
    heroImage?: string;

    /* Modules */
    modules: SolutionModule[];

    /* Avantages */
    advantages: SolutionAdvantage[];

    /* Tarifs */
    pricing: SolutionPricingPlan[];

    /* Testimonials */
    testimonials: SolutionTestimonial[];

    /* FAQ */
    faqs: SolutionFAQ[];

    /* CTA */
    ctaTitle: string;
    ctaTitleGradient: string;
    ctaSubtitle: string;
    ctaButtonLabel: string;
    ctaButtonHref: string;
    ctaButtonExternal?: boolean;
    ctaSecondaryLabel?: string;
}

/* ═══════════════════════════════════════════════
   NAVBAR (flat links per audience + local anchors)
   ═══════════════════════════════════════════════ */

function SolutionNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo_digitalium.png" alt="DIGITALIUM.IO" width={32} height={32} className="h-8 w-8 rounded-lg" />
                    <span className="font-bold text-lg text-gradient">
                        DIGITALIUM.IO
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <Link
                        href="/"
                        className="hover:text-foreground transition-colors"
                    >
                        Accueil
                    </Link>
                    <Link
                        href="/solutions/administrations"
                        className="hover:text-foreground transition-colors"
                    >
                        Administrations
                    </Link>
                    <Link
                        href="/solutions/entreprises"
                        className="hover:text-foreground transition-colors"
                    >
                        Entreprises
                    </Link>
                    <Link
                        href="/solutions/organismes"
                        className="hover:text-foreground transition-colors"
                    >
                        Organismes
                    </Link>
                    <a
                        href="https://identite.ga/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        Particuliers
                    </a>
                    <Link
                        href="/guide"
                        className="hover:text-foreground transition-colors"
                    >
                        Guide d&apos;utilisation
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1 mr-2">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                    <Link href="/login">
                        <Button variant="ghost" size="sm">Connexion</Button>
                    </Link>
                    <Link href="/register">
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity"
                        >
                            Commencer
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: HERO
   ═══════════════════════════════════════════════ */

function HeroBlock({ data }: { data: SolutionPageData }) {
    const Icon = data.heroIcon;

    return (
        <section className="relative min-h-[70vh] flex items-center justify-center gradient-bg overflow-hidden">
            {/* Background Image if present */}
            {data.heroImage && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={data.heroImage}
                        alt={data.heroTitle}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
                </div>
            )}

            {/* Background orbs */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${data.heroImage ? 'z-0 opacity-50' : ''}`}>
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-digitalium-blue/10 blur-3xl animate-float" />
                <div
                    className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-digitalium-violet/10 blur-3xl animate-float"
                    style={{ animationDelay: "1.5s" }}
                />
            </div>
            <div className="absolute inset-0 cortex-grid opacity-40 pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <Badge className="px-4 py-1.5 text-xs glass border border-white/10">
                        <Icon className="h-3.5 w-3.5 mr-1.5" />
                        {data.heroBadge}
                    </Badge>
                </motion.div>

                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                >
                    {data.heroTitle}{" "}
                    <span className="text-gradient">{data.heroTitleGradient}</span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {data.heroSubtitle}
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                >
                    {data.ctaButtonExternal ? (
                        <a href={data.ctaButtonHref} target="_blank" rel="noopener noreferrer">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-all text-lg px-8 h-14 shadow-lg shadow-digitalium-blue/20"
                            >
                                {data.ctaButtonLabel}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </a>
                    ) : (
                        <Link href={data.ctaButtonHref}>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-all text-lg px-8 h-14 shadow-lg shadow-digitalium-blue/20"
                            >
                                {data.ctaButtonLabel}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    <a href="#tarifs">
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 h-14 border-white/10 hover:bg-white/5"
                        >
                            Voir les Tarifs
                        </Button>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: MODULES
   ═══════════════════════════════════════════════ */

function ModulesBlock({ modules }: { modules: SolutionModule[] }) {
    return (
        <section id="modules" className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Modules <span className="text-gradient">Mis en Avant</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Les outils clés adaptés à vos besoins spécifiques.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((mod, i) => {
                        const ModIcon = mod.icon;
                        return (
                            <motion.div
                                key={mod.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group glass-card p-8 rounded-xl hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
                            >
                                <div
                                    className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
                                    style={{
                                        background: `linear-gradient(135deg, ${mod.color}10 0%, ${mod.color}30 100%)`,
                                        boxShadow: `inset 0 0 0 1px ${mod.color}40, 0 4px 20px ${mod.color}20`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                                    <ModIcon className="h-8 w-8 relative z-10 drop-shadow-md" style={{ color: mod.color }} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{mod.name}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mod.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: AVANTAGES
   ═══════════════════════════════════════════════ */

function AdvantagesBlock({ advantages }: { advantages: SolutionAdvantage[] }) {
    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Pourquoi <span className="text-gradient">Nous Choisir</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {advantages.map((adv, i) => {
                        const AdvIcon = adv.icon;
                        return (
                            <motion.div
                                key={adv.title}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="glass-card p-8 rounded-xl flex gap-5"
                            >
                                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-digitalium-blue/20 to-digitalium-violet/10 flex items-center justify-center">
                                    <AdvIcon className="h-6 w-6 text-digitalium-blue" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{adv.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {adv.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: TARIFS
   ═══════════════════════════════════════════════ */

function TarifsBlock({ plans }: { plans: SolutionPricingPlan[] }) {
    const [annual, setAnnual] = useState(false);

    return (
        <section id="tarifs" className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Tarifs <span className="text-gradient">& Formules</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Des offres transparentes adaptées à votre organisation.
                    </p>
                </motion.div>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-3 mb-14">
                    <span
                        className={`text-sm cursor-pointer transition-colors ${!annual ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        onClick={() => setAnnual(false)}
                    >
                        Mensuel
                    </span>
                    <button
                        onClick={() => setAnnual(!annual)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-digitalium-blue" : "bg-white/10"}`}
                        aria-label="Basculer entre tarif mensuel et annuel"
                    >
                        <div
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-6" : "translate-x-0.5"}`}
                        />
                    </button>
                    <span
                        className={`text-sm cursor-pointer transition-colors ${annual ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        onClick={() => setAnnual(true)}
                    >
                        Annuel
                    </span>
                    {annual && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                            –20% d&apos;économie
                        </Badge>
                    )}
                </div>

                <div className={`grid grid-cols-1 gap-6 items-start ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                            className={`relative glass-card p-8 rounded-xl border ${plan.popular
                                ? "border-digitalium-blue/30 ring-1 ring-digitalium-blue/30 glow md:-mt-4 md:pb-10"
                                : "border-white/5"
                                }`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-digitalium-blue to-digitalium-violet text-white text-[11px] px-3 py-1">
                                    <Star className="h-3 w-3 mr-1" />
                                    Recommandé
                                </Badge>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-3xl font-extrabold">
                                    {annual ? plan.priceAnnual : plan.price}
                                </p>
                                <p className="text-xs text-muted-foreground">{plan.unit}</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((f) => (
                                    <li
                                        key={f}
                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-digitalium-blue" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link href={plan.ctaHref}>
                                <Button
                                    className={`w-full ${plan.popular
                                        ? "bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90"
                                        : ""
                                        }`}
                                    variant={plan.popular ? "default" : "outline"}
                                    size="lg"
                                >
                                    {plan.cta}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: TESTIMONIALS
   ═══════════════════════════════════════════════ */

function TestimonialsBlock({ testimonials }: { testimonials: SolutionTestimonial[] }) {
    return (
        <section className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Ce Qu&apos;ils <span className="text-gradient">En Disent</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.5 }}
                            className="glass-card p-8 rounded-xl relative"
                        >
                            <Quote className="h-8 w-8 text-digitalium-blue/20 absolute top-6 right-6" />
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-digitalium-blue to-digitalium-violet flex items-center justify-center text-white font-bold text-sm">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t.role} · {t.org}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: FAQ
   ═══════════════════════════════════════════════ */

function FAQItem({ faq, index }: { faq: SolutionFAQ; index: number }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="glass-card overflow-hidden"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={open}
            >
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                            {faq.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function FAQBlock({ faqs }: { faqs: SolutionFAQ[] }) {
    return (
        <section id="faq" className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Questions <span className="text-gradient">Fréquentes</span>
                    </h2>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} faq={faq} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   SECTION: FINAL CTA
   ═══════════════════════════════════════════════ */

function FinalCTABlock({ data }: { data: SolutionPageData }) {
    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card rounded-2xl p-12 md:p-16 relative overflow-hidden text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-digitalium-blue/15 via-digitalium-violet/10 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <motion.h2
                            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            {data.ctaTitle}{" "}
                            <span className="text-gradient">{data.ctaTitleGradient}</span>
                        </motion.h2>

                        <motion.p
                            className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            {data.ctaSubtitle}
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            {data.ctaButtonExternal ? (
                                <a href={data.ctaButtonHref} target="_blank" rel="noopener noreferrer">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity text-lg px-10 h-14 shadow-lg shadow-digitalium-blue/20"
                                    >
                                        {data.ctaButtonLabel}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </a>
                            ) : (
                                <Link href={data.ctaButtonHref}>
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity text-lg px-10 h-14 shadow-lg shadow-digitalium-blue/20"
                                    >
                                        {data.ctaButtonLabel}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {data.ctaSecondaryLabel && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-10 h-14 border-white/10"
                                >
                                    <Phone className="mr-2 h-5 w-5" />
                                    {data.ctaSecondaryLabel}
                                </Button>
                            )}
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                Mise en place rapide
                            </span>
                            <span className="flex items-center gap-1">
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                Support dédié
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   MAIN TEMPLATE
   ═══════════════════════════════════════════════ */

export default function SolutionPageTemplate({ data }: { data: SolutionPageData }) {
    return (
        <div className="min-h-screen">
            <SolutionNavbar />
            <HeroBlock data={data} />
            <ModulesBlock modules={data.modules} />
            <AdvantagesBlock advantages={data.advantages} />
            <TarifsBlock plans={data.pricing} />
            <FAQBlock faqs={data.faqs} />
            <FinalCTABlock data={data} />
            <FooterSection />
        </div>
    );
}
