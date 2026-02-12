"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, TrendingUp, Calendar, Clock, Wifi } from "lucide-react";

/* ── Animated Counter ── */
function Counter({
    target,
    suffix = "",
}: {
    target: string;
    suffix?: string;
}) {
    const num = parseFloat(target);
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = num / 120;
        const id = setInterval(() => {
            start += step;
            if (start >= num) {
                setCount(num);
                clearInterval(id);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(id);
    }, [inView, num]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

const stats = [
    {
        value: "253",
        suffix: "%",
        label: "ROI moyen",
        icon: TrendingUp,
        color: "text-emerald-400",
    },
    {
        value: "15",
        suffix: " jours",
        label: "Rentabilité",
        icon: Calendar,
        color: "text-blue-400",
    },
    {
        value: "40",
        suffix: "%",
        label: "Temps économisé",
        icon: Clock,
        color: "text-violet-400",
    },
    {
        value: "99",
        suffix: ".9%",
        label: "Disponibilité",
        icon: Wifi,
        color: "text-amber-400",
    },
];

const testimonials = [
    {
        quote:
            "DIGITALIUM a révolutionné notre gestion documentaire. En 3 mois, nous avons réduit nos pertes de documents de 95%.",
        name: "Jean-Pierre MBOULOU",
        role: "DG — ASCOMA Gabon",
        color: "border-violet-500/30",
    },
    {
        quote:
            "La conformité fiscale n'est plus un cauchemar. Les archives se classent automatiquement avec les bons délais de rétention.",
        name: "Marie NDONG",
        role: "Directrice Financière — Ciments du Gabon",
        color: "border-blue-500/30",
    },
    {
        quote:
            "L'assistant IA iAsted nous a permis de découvrir des anomalies dans nos archives que personne n'avait détectées en 5 ans.",
        name: "Pr. Joseph MOUNANGA",
        role: "Secrétaire Général — Ministère de l'Économie",
        color: "border-amber-500/30",
    },
];

export default function SocialProofSection() {
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
                        Pourquoi les Leaders Gabonais{" "}
                        <span className="text-gradient">Choisissent DIGITALIUM</span>
                    </h2>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {stats.map((s) => (
                        <div key={s.label} className="glass-card p-6 text-center">
                            <s.icon
                                className={`h-5 w-5 mx-auto mb-2 ${s.color} opacity-80`}
                            />
                            <p className="text-3xl md:text-4xl font-extrabold">
                                <Counter target={s.value} suffix={s.suffix} />
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className={`glass-card border-l-2 ${t.color} p-6 flex flex-col`}
                        >
                            <Quote className="h-8 w-8 text-white/10 mb-3 flex-shrink-0" />
                            <p className="text-sm leading-relaxed text-muted-foreground mb-4 flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div>
                                <p className="text-sm font-semibold">{t.name}</p>
                                <p className="text-xs text-muted-foreground">{t.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
