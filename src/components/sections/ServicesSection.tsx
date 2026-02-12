"use client";

import { motion } from "framer-motion";
import {
    FileText,
    Archive,
    PenTool,
    Bot,
    Check,
    ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const modules = [
    {
        id: "idocument",
        name: "iDocument",
        tagline: "Google Docs pour le Gabon",
        desc: "Co‑édition temps réel avec Yjs — rédigez, commentez et approuvez vos documents à plusieurs, simultanément.",
        icon: FileText,
        color: "#3B82F6",
        gradient: "from-blue-500/20 to-blue-600/5",
        borderColor: "border-blue-500/20",
        badge: "Inclus",
        badgeVariant: "default" as const,
        features: [
            "Éditeur collaboratif temps réel",
            "Templates professionnels",
            "Export PDF / Word / XLSX",
        ],
    },
    {
        id: "iarchive",
        name: "iArchive",
        tagline: "Un coffre-fort intelligent",
        desc: "Archivage légal avec intégrité SHA‑256 — chaque document est horodaté, certifié et conforme à la loi gabonaise.",
        icon: Archive,
        color: "#10B981",
        gradient: "from-emerald-500/20 to-emerald-600/5",
        borderColor: "border-emerald-500/20",
        badge: "Inclus",
        badgeVariant: "default" as const,
        features: [
            "Intégrité cryptographique SHA‑256",
            "Certificat d'archivage horodaté",
            "Rétention légale 10 ans fiscale",
        ],
    },
    {
        id: "isignature",
        name: "iSignature",
        tagline: "Signez en un clic",
        desc: "Validation électronique avec workflows multi‑étapes — invitez, signez et suivez chaque approbation.",
        icon: PenTool,
        color: "#8B5CF6",
        gradient: "from-violet-500/20 to-violet-600/5",
        borderColor: "border-violet-500/20",
        badge: "Inclus",
        badgeVariant: "default" as const,
        features: [
            "Signature électronique légale",
            "Workflows multi‑étapes",
            "Audit trail complet",
        ],
    },
    {
        id: "iasted",
        name: "iAsted",
        tagline: "Votre archiviste qui ne dort jamais",
        desc: "Assistant IA 24/7 — OCR, recherche sémantique, résumés automatiques et analytics prédictifs sur vos archives.",
        icon: Bot,
        color: "#F59E0B",
        gradient: "from-amber-500/20 to-amber-600/5",
        borderColor: "border-amber-500/20",
        badge: "+ 5 000 XAF",
        badgeVariant: "secondary" as const,
        features: [
            "OCR & extraction intelligente",
            "Recherche sémantique IA",
            "Analytics prédictifs",
        ],
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.6 },
    }),
};

export default function ServicesSection() {
    return (
        <section id="modules" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Un Écosystème Complet en{" "}
                        <span className="text-gradient">4 Modules Intelligents</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Chaque module se connecte aux autres pour créer un flux documentaire
                        sans couture.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.map((mod, i) => (
                        <motion.div
                            key={mod.id}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className={`group relative rounded-xl border ${mod.borderColor} bg-gradient-to-br ${mod.gradient} p-8 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}
                        >
                            {/* Badge */}
                            <Badge
                                variant={mod.badgeVariant}
                                className="absolute top-4 right-4 text-[10px]"
                            >
                                {mod.badge}
                            </Badge>

                            <div className="flex items-start gap-5">
                                <div
                                    className="flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${mod.color}20` }}
                                >
                                    <mod.icon
                                        className="h-7 w-7"
                                        style={{ color: mod.color }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold mb-0.5 flex items-center gap-2">
                                        {mod.name}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </h3>
                                    <p
                                        className="text-xs font-medium mb-3 italic"
                                        style={{ color: mod.color }}
                                    >
                                        &ldquo;{mod.tagline}&rdquo;
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                        {mod.desc}
                                    </p>
                                    <ul className="space-y-1.5">
                                        {mod.features.map((f) => (
                                            <li
                                                key={f}
                                                className="text-sm text-muted-foreground flex items-center gap-2"
                                            >
                                                <Check
                                                    className="h-3.5 w-3.5 flex-shrink-0"
                                                    style={{ color: mod.color }}
                                                />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Glow on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                                style={{
                                    boxShadow: `inset 0 0 60px ${mod.color}10`,
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
