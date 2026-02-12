// DIGITALIUM.IO — SysAdmin: Database Replicas
"use client";
import React from "react";
import { motion } from "framer-motion";
import { HardDrive, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const REPLICAS = [
    { name: "pg-replica-eu-01", source: "Supabase PG", region: "eu-west-1", lag: "0.3s", status: "synced" },
    { name: "pg-replica-us-01", source: "Supabase PG", region: "us-east-1", lag: "1.2s", status: "synced" },
    { name: "convex-mirror-eu", source: "Convex Primary", region: "eu-west-1", lag: "0.1s", status: "synced" },
    { name: "redis-replica-01", source: "Redis Cache", region: "us-west-2", lag: "0.05s", status: "synced" },
];

export default function ReplicasPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Réplicas</h1>
                <p className="text-sm text-muted-foreground mt-1">Réplication des bases de données</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Nom</th><th className="text-left py-2 px-2">Source</th><th className="text-left py-2 px-2">Région</th><th className="text-right py-2 px-2">Lag</th><th className="text-center py-2 px-2">Statut</th></tr></thead>
                    <tbody>
                        {REPLICAS.map((r) => (
                            <tr key={r.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-mono font-medium">{r.name}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{r.source}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{r.region}</td>
                                <td className="py-2.5 px-2 text-right font-mono">{r.lag}</td>
                                <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">Synchronisé</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
