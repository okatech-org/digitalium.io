"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award } from "lucide-react";

const pillars = [
    {
        title: "Chiffrement AES-256",
        desc: "End-to-end, at rest et in transit. Vos documents sont illisibles sans vos clés.",
        image: "/images/security/encryption.png",
    },
    {
        title: "Hébergement Souverain",
        desc: "Données stockées au Gabon. Aucune donnée ne quitte le territoire national.",
        image: "/images/security/hosting.png",
    },
    {
        title: "Conformité Totale",
        desc: "Rétention fiscale 10 ans, sociale 5 ans. RGPD + loi gabonaise respectées.",
        image: "/images/security/compliance.png",
    },
    {
        title: "Audit Immutable",
        desc: "Chaque action est tracée et horodatée. Intégrité SHA-256 inviolable.",
        image: "/images/security/audit.png",
    },
];

export default function SecuritySection() {
    return (
        <section className="relative py-24 px-6 border-t border-white/5 overflow-hidden">
            {/* Main Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/security/sovereignty_main.png"
                    alt="Centre de données sécurisé au Gabon"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-20"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/90" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
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
                            className="glass-card overflow-hidden hover:glow transition-all duration-300 flex flex-col"
                        >
                            <div className="relative h-48 w-full">
                                <Image
                                    src={p.image}
                                    alt={p.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                            <div className="p-6 text-center flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold mb-2">{p.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {p.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust badge */}
                <motion.div
                    className="glass-card p-6 text-center max-w-3xl mx-auto backdrop-blur-md bg-background/40"
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
