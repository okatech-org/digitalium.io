// DIGITALIUM.IO — SubAdmin: Abonnements
"use client";
import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CURRENT = {
    plan: "Entreprise",
    price: "500K XAF/mois",
    renewal: "12 mars 2026",
    features: ["Utilisateurs illimités", "100 GB stockage", "iDocument · iArchive · iSignature", "Support dédié", "API + Webhooks", "SSO"],
};

const INVOICES = [
    { id: "INV-2026-002", date: "1 fév 2026", amount: "500 000 XAF", status: "payé" },
    { id: "INV-2026-001", date: "1 jan 2026", amount: "500 000 XAF", status: "payé" },
    { id: "INV-2025-012", date: "1 déc 2025", amount: "500 000 XAF", status: "payé" },
    { id: "INV-2025-011", date: "1 nov 2025", amount: "500 000 XAF", status: "payé" },
];

export default function SubscriptionsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-violet-400" /> Abonnement</h1>
                <p className="text-sm text-muted-foreground mt-1">Plan actif et historique de facturation</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-500" />
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                    <h2 className="font-bold text-lg">{CURRENT.plan}</h2>
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">Actif</Badge>
                </div>
                <p className="text-xl font-bold mb-4">{CURRENT.price}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {CURRENT.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-emerald-400 shrink-0" />{f}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground">Prochain renouvellement : {CURRENT.renewal}</p>
            </motion.div>
            <motion.div variants={fadeUp}>
                <h2 className="font-semibold text-sm mb-3">Historique de facturation</h2>
                <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Facture</th><th className="text-left py-2 px-2">Date</th><th className="text-right py-2 px-2">Montant</th><th className="text-center py-2 px-2">Statut</th></tr></thead>
                        <tbody>
                            {INVOICES.map((inv, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-2.5 px-2 font-mono">{inv.id}</td>
                                    <td className="py-2.5 px-2 text-muted-foreground">{inv.date}</td>
                                    <td className="py-2.5 px-2 text-right font-mono">{inv.amount}</td>
                                    <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">{inv.status}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
