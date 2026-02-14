"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    Play,
    Award,
    Shield,
    Server,
    FileCheck,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";


/* ── Security Pillars ── */
const securityPillars = [
    {
        title: "Chiffrement AES-256",
        desc: "End-to-end, at rest et in transit. Vos documents sont illisibles sans vos clés.",
        image: "/images/security/encryption.png",
        icon: Shield,
    },
    {
        title: "Hébergement Souverain",
        desc: "Données stockées au Gabon. Aucune donnée ne quitte le territoire national.",
        image: "/images/security/hosting.png",
        icon: Server,
    },
    {
        title: "Conformité Totale",
        desc: "Rétention fiscale 10 ans, sociale 5 ans. RGPD + loi gabonaise respectées.",
        image: "/images/security/compliance.png",
        icon: FileCheck,
    },
    {
        title: "Audit Immutable",
        desc: "Chaque action est tracée et horodatée. Intégrité SHA-256 inviolable.",
        image: "/images/security/audit.png",
        icon: Eye,
    },
];

const trustLogos = [
    "Ministère de l'Économie",
    "ASCOMA Gabon",
    "Total Energies",
    "Mairie de Libreville",
    "BGFI Bank",
];

export default function HeroSection({
    onOpenDemo,
}: {
    onOpenDemo?: () => void;
}) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/security/sovereignty_main.png"
                    alt="Centre de données sécurisé au Gabon"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradients/Overlays for readability */}
                <div className="absolute inset-0 bg-background/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
            </div>

            {/* Background orbs - subtle flair */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-digitalium-blue/10 blur-2xl animate-float" />
                <div
                    className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-digitalium-violet/10 blur-2xl animate-float"
                    style={{ animationDelay: "1.5s" }}
                />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-digitalium-blue/5 blur-2xl animate-pulse-glow" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-24 pb-16">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-muted-foreground bg-background/50 backdrop-blur-md border border-white/10">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Plateforme souveraine pour le Gabon 🇬🇦
                    </span>
                </motion.div>

                {/* Title — word‑by‑word reveal */}
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 drop-shadow-lg"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.06 } },
                    }}
                >
                    {"Votre Entreprise Perd".split(" ").map((w, i) => (
                        <motion.span
                            key={i}
                            className="inline-block mr-[0.3em]"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            {w}
                        </motion.span>
                    ))}
                    <br />
                    <span className="text-gradient">
                        {"23% de Productivité".split(" ").map((w, i) => (
                            <motion.span
                                key={`g-${i}`}
                                className="inline-block mr-[0.3em]"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                {w}
                            </motion.span>
                        ))}
                    </span>
                    <br />
                    {"Sans Archivage Intelligent".split(" ").map((w, i) => (
                        <motion.span
                            key={`b-${i}`}
                            className="inline-block mr-[0.3em]"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            {w}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                >
                    La loi gabonaise impose la digitalisation.{" "}
                    <span className="text-foreground font-medium">DIGITALIUM</span> est
                    la seule plateforme qui transforme vos archives en intelligence
                    business — de la PME au Ministère.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="relative bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-all text-lg px-8 h-14 shadow-lg shadow-digitalium-blue/20 animate-pulse-glow"
                        >
                            Configurer Mon Écosystème
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 h-14 border-white/10 hover:bg-white/5 bg-background/20 backdrop-blur-sm"
                        onClick={onOpenDemo}
                    >
                        <Play className="mr-2 h-5 w-5" />
                        Explorer la Démo Gratuite
                    </Button>
                </motion.div>

                {/* Trust Band */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs text-muted-foreground/60 mb-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    <span className="text-muted-foreground/40 text-[11px] uppercase tracking-wider">
                        Ils nous font confiance
                    </span>
                    {trustLogos.map((name) => (
                        <span
                            key={name}
                            className="px-3 py-1.5 rounded-md glass text-muted-foreground/50 text-[11px] font-medium uppercase tracking-wide"
                        >
                            {name}
                        </span>
                    ))}
                </motion.div>

                {/* Security Pillars */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Sécurité Souveraine —{" "}
                        <span className="text-gradient">Vos Données Restent au Gabon</span>{" "}
                        🇬🇦
                    </h2>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.7 }}
                >
                    {securityPillars.map((p) => {
                        const Icon = p.icon;
                        return (
                            <div key={p.title} className="glass-card overflow-hidden hover:glow transition-all duration-300 bg-background/40 backdrop-blur-md flex flex-row group">
                                <div className="relative w-2/5 min-h-[200px]">
                                    <Image
                                        src={p.image}
                                        alt={p.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-digitalium-blue/10 text-digitalium-blue shrink-0">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-base font-bold leading-tight">{p.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Trust badge */}
                <motion.div
                    className="glass-card p-5 text-center max-w-3xl mx-auto bg-background/40 backdrop-blur-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                >
                    <Award className="h-7 w-7 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-medium leading-relaxed">
                        🏆 Conforme à la Loi gabonaise sur la Transition Numérique —{" "}
                        <span className="text-gradient font-bold">Archivage à Valeur Probante</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
