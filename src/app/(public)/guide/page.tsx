"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Building2,
    Check,
    ChevronRight,
    Cog,
    FileText,
    FolderKanban,
    Heart,
    Landmark,
    Lock,
    MonitorSmartphone,
    PenTool,
    Rocket,
    Search,
    Shield,
    Sparkles,
    Users,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FooterSection from "@/components/sections/FooterSection";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface GuideStep {
    id: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    color: string;
    content: {
        heading: string;
        description: string;
        features: { icon: LucideIcon; title: string; detail: string }[];
        tip?: string;
        cta?: { label: string; href: string };
    };
}

/* ═══════════════════════════════════════════════
   DATA — 6 étapes du guide
   ═══════════════════════════════════════════════ */

const guideSteps: GuideStep[] = [
    {
        id: "organisation",
        icon: Building2,
        title: "1. Choisir votre type d'organisation",
        subtitle: "Personnalisez votre expérience",
        color: "#3B82F6",
        content: {
            heading: "Sélectionnez votre profil pour une configuration adaptée",
            description:
                "DIGITALIUM s'adapte à votre type d'organisation. Choisissez votre profil et bénéficiez d'une configuration pré-paramétrée avec les workflows, modules et templates adaptés à votre secteur.",
            features: [
                {
                    icon: Landmark,
                    title: "Administration publique",
                    detail:
                        "Ministères, collectivités, directions. Configuration axée souveraineté, conformité réglementaire et déploiement on-premise.",
                },
                {
                    icon: Building2,
                    title: "Entreprise",
                    detail:
                        "PME, startups, grands groupes. Focus productivité, intégration ERP/CRM et collaboration temps réel.",
                },
                {
                    icon: Heart,
                    title: "Organisme / ONG",
                    detail:
                        "Associations, fondations, ONG. Gestion multi-projets, rapports bailleurs et tarifs préférentiels.",
                },
            ],
            tip: "Astuce : Vous pouvez changer de profil à tout moment dans les paramètres de votre tableau de bord.",
        },
    },
    {
        id: "compte",
        icon: Users,
        title: "2. Créer votre compte",
        subtitle: "30 secondes, aucune carte requise",
        color: "#8B5CF6",
        content: {
            heading: "Inscription rapide et sécurisée",
            description:
                "Créez votre espace en quelques clics. Pas de carte bancaire requise pour l'essai gratuit de 14 jours. Invitez vos collaborateurs dès la première minute.",
            features: [
                {
                    icon: Zap,
                    title: "Inscription instantanée",
                    detail:
                        "Email + mot de passe ou connexion SSO (Google, Microsoft). Votre espace est prêt en moins de 30 secondes.",
                },
                {
                    icon: Users,
                    title: "Inviter votre équipe",
                    detail:
                        "Envoyez des invitations par email. Définissez les rôles : admin, éditeur, lecteur. Gestion fine des permissions.",
                },
                {
                    icon: Shield,
                    title: "Sécurité dès le départ",
                    detail:
                        "Authentification multi-facteurs (MFA), chiffrement AES-256 au repos et TLS 1.3 en transit. Vos données sont protégées.",
                },
            ],
            tip: "Essai gratuit : 14 jours sans engagement. Toutes les fonctionnalités sont accessibles pendant la période d'essai.",
            cta: { label: "Créer mon Compte", href: "/register" },
        },
    },
    {
        id: "modules",
        icon: Cog,
        title: "3. Activer vos modules",
        subtitle: "Choisissez vos outils",
        color: "#10B981",
        content: {
            heading: "Activez uniquement ce dont vous avez besoin",
            description:
                "DIGITALIUM est modulaire. Activez les modules dont vous avez besoin et désactivez les autres. Chaque module peut être activé ou retiré à tout moment.",
            features: [
                {
                    icon: FileText,
                    title: "iDocument",
                    detail:
                        "Gestion documentaire collaborative avec co-édition temps réel, templates professionnels et workflows d'approbation multi-niveaux.",
                },
                {
                    icon: FolderKanban,
                    title: "iArchive",
                    detail:
                        "Archivage légal avec intégrité SHA-256, stockage souverain, rétention configurable (1-30 ans) et recherche sémantique IA.",
                },
                {
                    icon: PenTool,
                    title: "iSignature",
                    detail:
                        "Signature électronique légale avec workflows multi-étapes, invitations par email, audit trail complet et certificats horodatés.",
                },
                {
                    icon: Sparkles,
                    title: "iAsted IA",
                    detail:
                        "Assistant IA : OCR automatique, recherche sémantique, résumés intelligents, classification automatique et analytics prédictifs.",
                },
            ],
            tip: "Recommandation : Commencez avec iDocument + iArchive, puis activez iSignature et iAsted IA selon vos besoins.",
        },
    },
    {
        id: "configuration",
        icon: Cog,
        title: "4. Configurer vos espaces",
        subtitle: "Structurez votre organisation",
        color: "#F59E0B",
        content: {
            heading: "Organisez vos documents comme vous le souhaitez",
            description:
                "Créez des espaces par département, projet ou entité. Définissez les permissions, les workflows et les modèles pour chaque espace. Tout est personnalisable.",
            features: [
                {
                    icon: FolderKanban,
                    title: "Espaces de travail",
                    detail:
                        "Créez des espaces dédiés par service, projet ou équipe. Chaque espace a ses propres permissions, workflows et modèles.",
                },
                {
                    icon: Lock,
                    title: "Permissions granulaires",
                    detail:
                        "Admin, éditeur, contributeur, lecteur. Contrôlez qui peut voir, modifier, approuver ou supprimer chaque document. Héritage configurable.",
                },
                {
                    icon: Search,
                    title: "Métadonnées & tags",
                    detail:
                        "Classez vos documents avec des métadonnées personnalisées, des tags de couleur et des catégories. Retrouvez n'importe quel document en secondes.",
                },
            ],
            tip: "Templates : Utilisez les modèles pré-configurés pour votre secteur, ou créez les vôtres depuis zéro.",
        },
    },
    {
        id: "workflows",
        icon: Rocket,
        title: "5. Automatiser vos flux",
        subtitle: "Gagnez du temps au quotidien",
        color: "#EF4444",
        content: {
            heading: "Des workflows sans code pour tous vos processus",
            description:
                "Automatisez vos processus métier avec des workflows visuels. Approbations, notifications, escalades — créez des flux en glissant-déposant des étapes.",
            features: [
                {
                    icon: ChevronRight,
                    title: "Workflows visuels",
                    detail:
                        "Éditeur drag-and-drop intuitif. Créez des chaînes d'approbation, de validation et de signature sans écrire une seule ligne de code.",
                },
                {
                    icon: Zap,
                    title: "Notifications intelligentes",
                    detail:
                        "Alertes par email, push et in-app. Rappels automatiques pour les approbations en attente. Escalade configurable si délai dépassé.",
                },
                {
                    icon: MonitorSmartphone,
                    title: "Mobile & hors-ligne",
                    detail:
                        "Approuvez, signez et consultez vos documents depuis mobile. Mode hors-ligne PWA pour les équipes terrain.",
                },
            ],
            tip: "Exemple : Créez un workflow « Publication officielle » en 3 étapes : rédaction → revue juridique → signature DG → publication.",
        },
    },
    {
        id: "demarrage",
        icon: Rocket,
        title: "6. C'est parti !",
        subtitle: "Vous êtes prêt à digitaliser",
        color: "#06B6D4",
        content: {
            heading: "Votre plateforme est prête — commencez à travailler",
            description:
                "Votre environnement est configuré. Importez vos premiers documents, invitez vos collaborateurs et commencez à transformer vos processus. Notre équipe vous accompagne à chaque étape.",
            features: [
                {
                    icon: FileText,
                    title: "Importer vos documents",
                    detail:
                        "Import bulk depuis Google Drive, OneDrive, SharePoint ou disques locaux. Classification automatique par IA. Conservez vos métadonnées existantes.",
                },
                {
                    icon: Sparkles,
                    title: "Explorer la plateforme",
                    detail:
                        "Tutoriels interactifs intégrés, tooltips contextuels et visite guidée au premier lancement. Prise en main intuitive garantie.",
                },
                {
                    icon: Users,
                    title: "Support & formation",
                    detail:
                        "Équipe support disponible par chat, email et téléphone. Webinaires mensuels, base de connaissances et formations personnalisées sur demande.",
                },
            ],
            cta: { label: "🚀 Commencer Maintenant", href: "/register" },
        },
    },
];

/* ═══════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════ */

function GuideNavbar() {
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
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Accueil
                    </Link>
                    <Link href="/solutions/administrations" className="hover:text-foreground transition-colors">
                        Administrations
                    </Link>
                    <Link href="/solutions/entreprises" className="hover:text-foreground transition-colors">
                        Entreprises
                    </Link>
                    <Link href="/solutions/organismes" className="hover:text-foreground transition-colors">
                        Organismes
                    </Link>
                    <a href="https://identite.ga/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                        Particuliers
                    </a>
                    <Link href="/guide" className="text-foreground font-medium transition-colors">
                        Guide d&apos;utilisation
                    </Link>
                </div>

                <div className="flex items-center gap-3">
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
   STEP SIDEBAR ITEM
   ═══════════════════════════════════════════════ */

function StepIndicator({
    step,
    index,
    active,
    completed,
    onClick,
}: {
    step: GuideStep;
    index: number;
    active: boolean;
    completed: boolean;
    onClick: () => void;
}) {
    const Icon = step.icon;

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${active
                ? "glass-card border border-white/10 shadow-lg"
                : completed
                    ? "hover:bg-white/[0.03]"
                    : "hover:bg-white/[0.03] opacity-60"
                }`}
        >
            <div
                className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${active
                    ? "shadow-lg"
                    : completed
                        ? "bg-emerald-500/20"
                        : "bg-white/5"
                    }`}
                style={active ? { backgroundColor: `${step.color}20` } : {}}
            >
                {completed && !active ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                ) : (
                    <Icon
                        className="h-5 w-5 transition-colors"
                        style={active ? { color: step.color } : {}}
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-medium truncate ${active ? "text-foreground" : "text-muted-foreground"
                        }`}
                >
                    {step.title}
                </p>
                <p className="text-xs text-muted-foreground/60 truncate hidden lg:block">
                    {step.subtitle}
                </p>
            </div>
        </button>
    );
}

/* ═══════════════════════════════════════════════
   STEP CONTENT PANEL
   ═══════════════════════════════════════════════ */

function StepContent({ step }: { step: GuideStep }) {
    const { content } = step;

    return (
        <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            {/* Heading */}
            <div className="mb-8">
                <Badge
                    className="mb-4 px-3 py-1 text-xs"
                    style={{
                        backgroundColor: `${step.color}15`,
                        color: step.color,
                        borderColor: `${step.color}30`,
                    }}
                >
                    {step.subtitle}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{content.heading}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                    {content.description}
                </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-4 mb-8">
                {content.features.map((feat, i) => {
                    const FeatIcon = feat.icon;
                    return (
                        <motion.div
                            key={feat.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                            className="glass-card p-6 rounded-xl flex gap-4 hover:bg-white/[0.03] transition-colors group"
                        >
                            <div
                                className="flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${step.color}15` }}
                            >
                                <FeatIcon className="h-5 w-5" style={{ color: step.color }} />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors">
                                    {feat.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feat.detail}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Tip */}
            {content.tip && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                    <Sparkles className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200/80 leading-relaxed">{content.tip}</p>
                </motion.div>
            )}

            {/* CTA */}
            {content.cta && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                >
                    <Link href={content.cta.href}>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity text-lg px-8 h-14 shadow-lg shadow-digitalium-blue/20"
                        >
                            {content.cta.label}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </motion.div>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   MOBILE STEP DOTS
   ═══════════════════════════════════════════════ */

function MobileStepDots({
    total,
    current,
    onSelect,
}: {
    total: number;
    current: number;
    onSelect: (i: number) => void;
}) {
    return (
        <div className="flex items-center justify-center gap-2 md:hidden mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === current
                        ? "w-8 bg-digitalium-blue"
                        : i < current
                            ? "w-2 bg-emerald-400/50"
                            : "w-2 bg-white/10"
                        }`}
                    aria-label={`Étape ${i + 1}`}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function GuidePage() {
    const [activeStep, setActiveStep] = useState(0);
    const currentStep = guideSteps[activeStep];

    const goNext = () => {
        if (activeStep < guideSteps.length - 1) setActiveStep(activeStep + 1);
    };
    const goPrev = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1);
    };

    return (
        <div className="min-h-screen">
            <GuideNavbar />

            {/* HERO */}
            <section className="relative gradient-bg overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-digitalium-blue/10 blur-3xl animate-float" />
                    <div
                        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-digitalium-violet/10 blur-3xl animate-float"
                        style={{ animationDelay: "1.5s" }}
                    />
                </div>
                <div className="absolute inset-0 cortex-grid opacity-40 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6"
                    >
                        <Badge className="px-4 py-1.5 text-xs glass border border-white/10">
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                            Guide Interactif
                        </Badge>
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                    >
                        Guide d&apos;
                        <span className="text-gradient">Utilisation</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Configurez votre plateforme DIGITALIUM en 6 étapes simples.
                        Intuitif, interactif et adaptable à tous les profils.
                    </motion.p>
                </div>
            </section>

            {/* GUIDE INTERACTIVE */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Progress bar */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>Progression</span>
                            <span>
                                Étape {activeStep + 1}/{guideSteps.length}
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-digitalium-blue to-digitalium-violet rounded-full"
                                animate={{
                                    width: `${((activeStep + 1) / guideSteps.length) * 100}%`,
                                }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Mobile dots */}
                    <MobileStepDots
                        total={guideSteps.length}
                        current={activeStep}
                        onSelect={setActiveStep}
                    />

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar — step list */}
                        <div className="hidden md:block w-80 flex-shrink-0 space-y-1">
                            {guideSteps.map((step, i) => (
                                <StepIndicator
                                    key={step.id}
                                    step={step}
                                    index={i}
                                    active={i === activeStep}
                                    completed={i < activeStep}
                                    onClick={() => setActiveStep(i)}
                                />
                            ))}
                        </div>

                        {/* Content panel */}
                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                <StepContent step={currentStep} />
                            </AnimatePresence>

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                                <Button
                                    variant="ghost"
                                    onClick={goPrev}
                                    disabled={activeStep === 0}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Précédent
                                </Button>

                                {activeStep < guideSteps.length - 1 ? (
                                    <Button
                                        onClick={goNext}
                                        className="gap-2 bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity"
                                    >
                                        Suivant
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Link href="/register">
                                        <Button className="gap-2 bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity">
                                            Commencer Maintenant
                                            <Rocket className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <FooterSection />
        </div>
    );
}
