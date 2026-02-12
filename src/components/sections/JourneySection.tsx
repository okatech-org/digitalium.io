"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Users, Archive, Brain } from "lucide-react";

const steps = [
    {
        num: "01",
        title: "CRÉER",
        module: "iDocument",
        desc: "Rédigez à plusieurs en temps réel. Éditeur collaboratif avec historique complet.",
        icon: FileText,
        color: "#3B82F6",
    },
    {
        num: "02",
        title: "COLLABORER",
        module: "iDocument + iSignature",
        desc: "Éditez à plusieurs simultanément. Validez et signez en un clic.",
        icon: Users,
        color: "#8B5CF6",
    },
    {
        num: "03",
        title: "ARCHIVER",
        module: "iArchive",
        desc: "Archivez avec intégrité SHA‑256. Certificat légal automatique.",
        icon: Archive,
        color: "#10B981",
    },
    {
        num: "04",
        title: "ANALYSER",
        module: "iAsted",
        desc: "L'IA analyse vos archives et génère des insights business.",
        icon: Brain,
        color: "#F59E0B",
    },
];

export default function JourneySection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <section className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-6xl mx-auto" ref={ref}>
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Du Document Brut à{" "}
                        <span className="text-gradient">l&apos;Intelligence Business</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        en 4 étapes
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Progress line — desktop only */}
                    <div className="hidden md:block absolute top-[52px] left-0 right-0 h-0.5 bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500"
                            initial={{ scaleX: 0 }}
                            animate={inView ? { scaleX: 1 } : {}}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{ transformOrigin: "left" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: i * 0.2 + 0.3, duration: 0.6 }}
                                className="text-center relative"
                            >
                                {/* Circle node */}
                                <div className="flex justify-center mb-6">
                                    <motion.div
                                        className="h-[104px] w-[104px] rounded-full flex items-center justify-center relative"
                                        style={{ backgroundColor: `${step.color}10` }}
                                        initial={{ scale: 0 }}
                                        animate={inView ? { scale: 1 } : {}}
                                        transition={{ delay: i * 0.2 + 0.4, type: "spring" }}
                                    >
                                        <div
                                            className="absolute inset-0 rounded-full animate-pulse-glow opacity-30"
                                            style={{
                                                boxShadow: `0 0 20px ${step.color}40`,
                                            }}
                                        />
                                        <step.icon
                                            className="h-10 w-10"
                                            style={{ color: step.color }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Step number */}
                                <p
                                    className="text-xs font-mono font-bold mb-1 tracking-wider"
                                    style={{ color: step.color }}
                                >
                                    ÉTAPE {step.num}
                                </p>
                                <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                                <p
                                    className="text-[11px] font-medium mb-2"
                                    style={{ color: step.color }}
                                >
                                    {step.module}
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
