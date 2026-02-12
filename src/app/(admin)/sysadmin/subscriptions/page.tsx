// DIGITALIUM.IO — SysAdmin: Abonnements
"use client";
import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const PLANS = [
    { name: "Starter", price: "50K XAF/mois", features: ["5 utilisateurs", "5 GB stockage", "Support email"], clients: 2, color: "from-gray-500 to-gray-400" },
    { name: "Pro", price: "200K XAF/mois", features: ["25 utilisateurs", "25 GB stockage", "Support prioritaire", "API access"], clients: 8, color: "from-blue-500 to-cyan-500" },
    { name: "Entreprise", price: "500K XAF/mois", features: ["Illimité", "100 GB stockage", "Support dédié", "API + Webhooks", "SSO"], clients: 4, color: "from-orange-500 to-red-500" },
];

const SUBSCRIPTIONS = [
    { org: "DGDI", plan: "Entreprise", start: "15 jan 2026", renewal: "15 fév 2026", amount: "500K XAF", status: "active" },
    { org: "Min. Intérieur", plan: "Entreprise", start: "20 jan 2026", renewal: "20 fév 2026", amount: "500K XAF", status: "active" },
    { org: "PGL", plan: "Pro", start: "22 jan 2026", renewal: "22 fév 2026", amount: "200K XAF", status: "active" },
    { org: "Gabon Télécom", plan: "Entreprise", start: "1 fév 2026", renewal: "1 mar 2026", amount: "500K XAF", status: "active" },
    { org: "SEEG", plan: "Pro", start: "1 fév 2026", renewal: "1 mar 2026", amount: "200K XAF", status: "active" },
    { org: "Okoumé Capital", plan: "Starter", start: "5 fév 2026", renewal: "5 mar 2026", amount: "50K XAF", status: "trial" },
];

export default function SubscriptionsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Abonnements</h1>
                <p className="text-sm text-muted-foreground mt-1">Plans et souscriptions actives</p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((p) => (
                    <div key={p.name} className="glass-card rounded-xl p-5 space-y-3 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}`} />
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-xl font-bold bg-gradient-to-r ${p.color} bg-clip-text">{p.price}</p>
                        <div className="space-y-1.5">
                            {p.features.map((f) => (<div key={f} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3 w-3 text-emerald-400 shrink-0" />{f}</div>))}
                        </div>
                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{p.clients} clients</Badge>
                    </div>
                ))}
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Organisation</th><th className="text-left py-2 px-2">Plan</th><th className="text-left py-2 px-2 hidden md:table-cell">Début</th><th className="text-left py-2 px-2">Renouvellement</th><th className="text-right py-2 px-2">Montant</th><th className="text-center py-2 px-2">Statut</th></tr></thead>
                    <tbody>
                        {SUBSCRIPTIONS.map((s, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{s.org}</td>
                                <td className="py-2.5 px-2">{s.plan}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{s.start}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{s.renewal}</td>
                                <td className="py-2.5 px-2 text-right font-mono">{s.amount}</td>
                                <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className={`text-[9px] border-0 ${s.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"}`}>{s.status === "active" ? "Actif" : "Essai"}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
