"use client";

import { motion } from "framer-motion";
import { Lock, Flag, ScrollText, ShieldCheck, Award } from "lucide-react";

const pillars = [
    {
        icon: Lock,
        title: "Chiffrement AES-256",
        desc: "End-to-end, at rest et in transit. Vos documents sont illisibles sans vos clés.",
        color: "#3B82F6",
    },
    {
        icon: Flag,
        title: "Hébergement Souverain",
        desc: "Données stockées au Gabon. Aucune donnée ne quitte le territoire national.",
        color: "#10B981",
    },
    {
        icon: ScrollText,
        title: "Conformité Totale",
        desc: "Rétention fiscale 10 ans, sociale 5 ans. RGPD + loi gabonaise respectées.",
        color: "#8B5CF6",
    },
    {
        icon: ShieldCheck,
        title: "Audit Immutable",
        desc: "Chaque action est tracée et horodatée. Intégrité SHA-256 inviolable.",
        color: "#F59E0B",
    },
];

export default function SecuritySection() {
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
                        Sécurité Souveraine —{" "}
                        <span className="text-gradient">
                            Vos Données Restent au Gabon
                        </span>{" "}
                        🇬🇦
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {pillars.map((p, i) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="glass-card p-6 text-center hover:glow transition-all duration-300"
                        >
                            <div
                                className="h-14 w-14 mx-auto rounded-xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${p.color}15` }}
                            >
                                <p.icon className="h-7 w-7" style={{ color: p.color }} />
                            </div>
                            <h3 className="text-base font-bold mb-2">{p.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {p.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Trust badge */}
                <motion.div
                    className="glass-card p-6 text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <Award className="h-8 w-8 mx-auto mb-3 text-amber-400" />
                    <p className="text-sm font-medium leading-relaxed">
                        🏆 Conforme à la Loi gabonaise sur la Transition Numérique —{" "}
                        <span className="text-gradient font-bold">
                            Archivage à Valeur Probante
                        </span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
