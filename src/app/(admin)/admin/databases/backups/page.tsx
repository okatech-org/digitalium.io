// DIGITALIUM.IO — SysAdmin: Database Backups
"use client";
import React from "react";
import { motion } from "framer-motion";
import { DatabaseBackup, CheckCircle2, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const BACKUPS = [
    { id: "bk-20260212-001", db: "Supabase PG", size: "4.6 GB", date: "12 fév 2026 — 04:00", duration: "3m 12s", status: "completed" },
    { id: "bk-20260211-001", db: "Supabase PG", size: "4.5 GB", date: "11 fév 2026 — 04:00", duration: "2m 58s", status: "completed" },
    { id: "bk-20260212-f01", db: "Firestore", size: "890 MB", date: "12 fév 2026 — 03:30", duration: "1m 45s", status: "completed" },
    { id: "bk-20260211-f01", db: "Firestore", size: "887 MB", date: "11 fév 2026 — 03:30", duration: "1m 42s", status: "completed" },
    { id: "bk-20260212-c01", db: "Convex", size: "1.1 GB", date: "12 fév 2026 — 05:00", duration: "48s", status: "completed" },
    { id: "bk-20260210-001", db: "Supabase PG", size: "4.4 GB", date: "10 fév 2026 — 04:00", duration: "3m 05s", status: "completed" },
];

export default function BackupsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sauvegardes</h1>
                    <p className="text-sm text-muted-foreground mt-1">Historique des sauvegardes automatiques</p>
                </div>
                <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                    <DatabaseBackup className="h-3.5 w-3.5" /> Sauvegarde manuelle
                </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">ID</th><th className="text-left py-2 px-2">Base</th><th className="text-right py-2 px-2">Taille</th><th className="text-left py-2 px-2">Date</th><th className="text-right py-2 px-2">Durée</th><th className="text-center py-2 px-2">Statut</th><th className="text-center py-2 px-2"></th></tr></thead>
                    <tbody>
                        {BACKUPS.map((b) => (
                            <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-mono">{b.id}</td>
                                <td className="py-2.5 px-2 font-medium">{b.db}</td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground">{b.size}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{b.date}</td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground">{b.duration}</td>
                                <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">Complet</Badge></td>
                                <td className="py-2.5 px-2 text-center"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Download className="h-3 w-3" /></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
