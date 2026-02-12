// DIGITALIUM.IO — SubAdmin: Organisation
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Building, Globe, Mail, Phone, MapPin } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CONFIG = [
    { label: "Nom", value: "DIGITALIUM" },
    { label: "Secteur", value: "Technologies & Services numériques" },
    { label: "RCCM", value: "GA-LBV-2024-B-12345" },
    { label: "NIF", value: "20240012345P" },
    { label: "Email", value: "contact@digitalium.ga" },
    { label: "Téléphone", value: "+241 77 00 00 00" },
    { label: "Adresse", value: "Quartier Louis, Libreville, Gabon" },
    { label: "Site web", value: "https://digitalium.io" },
    { label: "Plan actif", value: "Entreprise" },
    { label: "Membres", value: "12 / illimité" },
    { label: "Stockage utilisé", value: "22.5 GB / 100 GB" },
    { label: "Modules actifs", value: "iDocument · iArchive · iSignature" },
];

export default function OrganizationPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Building className="h-6 w-6 text-violet-400" /> Organisation</h1>
                <p className="text-sm text-muted-foreground mt-1">Informations et paramètres de l&apos;organisation</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 divide-y divide-white/5">
                {CONFIG.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <span className="text-xs text-muted-foreground">{c.label}</span>
                        <span className="text-sm font-medium">{c.value}</span>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
