"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
    ArrowRight,
    Play,
    Shield,
    Clock,
    Wifi,
    Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ── Animated Counter ── */
function Counter({
    target,
    suffix = "",
    prefix = "",
    duration = 2,
}: {
    target: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
}) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / (duration * 60);
        const id = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(id);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(id);
    }, [inView, target, duration]);

    return (
        <span ref={ref}>
            {prefix}
            {count}
            {suffix}
        </span>
    );
}

/* ── Stats data ── */
const stats = [
    {
        value: 100,
        suffix: "%",
        label: "Marché Vierge",
        icon: Shield,
        color: "text-emerald-400",
    },
    {
        value: 10,
        suffix: " ans",
        label: "Rétention Fiscale Légale",
        icon: Clock,
        color: "text-blue-400",
    },
    {
        value: 99.9,
        suffix: "%",
        label: "Disponibilité SLA",
        icon: Wifi,
        color: "text-violet-400",
    },
    {
        prefix: "< ",
        value: 4,
        suffix: "h",
        label: "Support Prioritaire",
        icon: Headphones,
        color: "text-amber-400",
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
        <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-digitalium-blue/10 blur-3xl animate-float" />
                <div
                    className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-digitalium-violet/10 blur-3xl animate-float"
                    style={{ animationDelay: "1.5s" }}
                />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-digitalium-blue/5 blur-3xl animate-pulse-glow" />
            </div>
            {/* Grid overlay */}
            <div className="absolute inset-0 cortex-grid opacity-40 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-24 pb-16">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Plateforme souveraine pour le Gabon 🇬🇦
                    </span>
                </motion.div>

                {/* Title — word‑by‑word reveal */}
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6"
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
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
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
                        className="text-lg px-8 h-14 border-white/10 hover:bg-white/5"
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

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.7 }}
                >
                    {stats.map((s) => (
                        <div key={s.label} className="glass-card p-4 text-center group">
                            <s.icon
                                className={`h-5 w-5 mx-auto mb-2 ${s.color} opacity-80`}
                            />
                            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                <Counter
                                    target={s.value}
                                    suffix={s.suffix}
                                    prefix={s.prefix || ""}
                                />
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
