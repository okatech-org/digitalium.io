"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Check,
    Users,
    Building2,
    Landmark,
    ArrowRight,
    Star,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const personas = [
    {
        id: "citizen",
        icon: Users,
        segment: "CITOYENS",
        subtitle: "Pour vous et votre famille",
        monthlyPrice: "Gratuit → 5 000",
        annualPrice: "Gratuit → 4 000",
        currency: "XAF/mois",
        popular: false,
        gradient: "from-cyan-500/10 to-teal-500/5",
        borderColor: "border-cyan-500/20",
        accentColor: "text-cyan-400",
        features: [
            "Scan mobile intelligent",
            "Coffre-fort 10 Go",
            "Rappels d'expiration",
            "Partage familial",
            "Mode hors-ligne",
        ],
        cta: "Créer mon compte",
        ctaHref: "https://identite.ga",
        ctaExternal: true,
        ctaNote: "→ identite.ga",
    },
    {
        id: "enterprise",
        icon: Building2,
        segment: "ENTREPRISES",
        subtitle: "PME & Startups — Grands groupes",
        monthlyPrice: "15 000",
        annualPrice: "12 000",
        currency: "XAF/user/mois",
        popular: true,
        gradient: "from-digitalium-blue/15 to-digitalium-violet/10",
        borderColor: "border-digitalium-blue/30",
        accentColor: "text-digitalium-blue",
        features: [
            "iDocument (co-édition temps réel)",
            "iArchive (conformité légale)",
            "iSignature (validation électronique)",
            "iAsted (assistant IA)",
            "Multi-utilisateurs (50+)",
            "API & intégrations",
            "Support prioritaire (< 4h)",
        ],
        cta: "Configurer mon écosystème",
        ctaHref: "/register",
        ctaExternal: false,
        ctaNote: null,
    },
    {
        id: "institution",
        icon: Landmark,
        segment: "INSTITUTIONS",
        subtitle: "Gouvernement & Collectivités",
        monthlyPrice: "Sur devis",
        annualPrice: "Sur devis",
        currency: "licence perpétuelle",
        popular: false,
        gradient: "from-amber-500/10 to-orange-500/5",
        borderColor: "border-amber-500/20",
        accentColor: "text-amber-400",
        features: [
            "Tous les modules inclus",
            "Déploiement souverain",
            "On-premise / cloud privé",
            "SSO SAML / OIDC",
            "Chiffrement E2E",
            "SLA 99.9% + support 24/7",
            "Formation sur site incluse",
        ],
        cta: "Demander un devis",
        ctaHref: "/register",
        ctaExternal: false,
        ctaNote: "→ formulaire contact",
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6 },
    }),
};

export default function PersonaSection() {
    const [annual, setAnnual] = useState(false);

    return (
        <section id="pricing" className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Une Solution Taillée{" "}
                        <span className="text-gradient">Pour Votre Échelle</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Du citoyen individuel aux grandes institutions — DIGITALIUM
                        s&apos;adapte.
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
                            –20% · Économisez 36 000 XAF/an
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {personas.map((p, i) => (
                        <motion.div
                            key={p.id}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className={`relative glass-card border ${p.borderColor} bg-gradient-to-br ${p.gradient} p-8 rounded-xl ${p.popular ? "md:-mt-4 md:pb-10 ring-1 ring-digitalium-blue/30 glow" : ""
                                }`}
                        >
                            {p.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-digitalium-blue to-digitalium-violet text-white text-[11px] px-3 py-1">
                                    <Star className="h-3 w-3 mr-1" />
                                    Le plus populaire
                                </Badge>
                            )}

                            <div className="text-center mb-6">
                                <p.icon
                                    className={`h-10 w-10 mx-auto mb-3 ${p.accentColor}`}
                                />
                                <h3 className="text-xl font-bold">{p.segment}</h3>
                                <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-3xl font-extrabold">
                                    {annual ? p.annualPrice : p.monthlyPrice}
                                </p>
                                <p className="text-xs text-muted-foreground">{p.currency}</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {p.features.map((f) => (
                                    <li
                                        key={f}
                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                        <Check
                                            className={`h-4 w-4 mt-0.5 flex-shrink-0 ${p.accentColor}`}
                                        />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {p.ctaExternal ? (
                                <a
                                    href={p.ctaHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        className="w-full"
                                        variant={p.popular ? "default" : "outline"}
                                        size="lg"
                                    >
                                        {p.cta}
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </a>
                            ) : (
                                <Link href={p.ctaHref}>
                                    <Button
                                        className={`w-full ${p.popular
                                                ? "bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90"
                                                : ""
                                            }`}
                                        variant={p.popular ? "default" : "outline"}
                                        size="lg"
                                    >
                                        {p.cta}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            )}

                            {p.ctaNote && (
                                <p className="text-[11px] text-muted-foreground text-center mt-2">
                                    {p.ctaNote}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
