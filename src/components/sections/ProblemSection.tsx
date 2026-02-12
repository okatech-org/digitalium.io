"use client";

import { motion } from "framer-motion";
import { TrendingDown, AlertTriangle, ShieldOff, ArrowDown } from "lucide-react";

const problems = [
    {
        icon: TrendingDown,
        title: "Perte de Productivité",
        stat: "23%",
        desc: "Les entreprises gabonaises passent 40% de leur temps à chercher des documents. 23% de productivité perdue chaque année.",
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
    },
    {
        icon: AlertTriangle,
        title: "Non-Conformité Légale",
        stat: "10 ans",
        desc: "La loi impose 10 ans de rétention fiscale et 5 ans pour les documents sociaux. Les sanctions pour non-conformité augmentent.",
        color: "text-orange-400",
        borderColor: "border-orange-500/20",
        bgColor: "bg-orange-500/5",
    },
    {
        icon: ShieldOff,
        title: "Données Non Sécurisées",
        stat: "67%",
        desc: "67% des PME gabonaises stockent leurs documents sur des disques durs locaux sans sauvegarde ni chiffrement.",
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
    },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
};

export default function ProblemSection() {
    return (
        <section className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Le Gabon Perd des Milliards en{" "}
                        <span className="text-red-400">Documents Mal Gérés</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Les entreprises gabonaises font face à des défis critiques que
                        DIGITALIUM résout
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {problems.map((p, i) => (
                        <motion.div
                            key={p.title}
                            custom={i}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className={`glass-card ${p.borderColor} border p-8 text-center group hover:scale-[1.02] transition-transform`}
                        >
                            <div
                                className={`h-14 w-14 mx-auto rounded-xl ${p.bgColor} flex items-center justify-center mb-4`}
                            >
                                <p.icon className={`h-7 w-7 ${p.color}`} />
                            </div>
                            <p className={`text-4xl font-extrabold ${p.color} mb-2`}>
                                {p.stat}
                            </p>
                            <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {p.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Transition arrow */}
                <motion.div
                    className="flex flex-col items-center mt-16 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <p className="text-sm font-medium mb-3 text-gradient">
                        DIGITALIUM résout tout cela
                    </p>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <ArrowDown className="h-6 w-6 text-digitalium-blue" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
