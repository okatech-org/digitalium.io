// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Database Backups
// Historique des sauvegardes avec actions manuelles,
// téléchargement, KPIs et loading feedback
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DatabaseBackup, CheckCircle2, Clock, Download, HardDrive, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types & Mock Data ──────────────────────────── */

interface Backup {
    id: string;
    db: string;
    size: string;
    date: string;
    duration: string;
    status: "completed" | "failed" | "in_progress";
}

const INITIAL_BACKUPS: Backup[] = [
    { id: "bk-20260212-001", db: "Supabase PG", size: "4.6 GB", date: "12 fév 2026 — 04:00", duration: "3m 12s", status: "completed" },
    { id: "bk-20260211-001", db: "Supabase PG", size: "4.5 GB", date: "11 fév 2026 — 04:00", duration: "2m 58s", status: "completed" },
    { id: "bk-20260212-f01", db: "Firestore", size: "890 MB", date: "12 fév 2026 — 03:30", duration: "1m 45s", status: "completed" },
    { id: "bk-20260211-f01", db: "Firestore", size: "887 MB", date: "11 fév 2026 — 03:30", duration: "1m 42s", status: "completed" },
    { id: "bk-20260212-c01", db: "Convex", size: "1.1 GB", date: "12 fév 2026 — 05:00", duration: "48s", status: "completed" },
    { id: "bk-20260210-001", db: "Supabase PG", size: "4.4 GB", date: "10 fév 2026 — 04:00", duration: "3m 05s", status: "completed" },
];

const STATUS_CFG = {
    completed: { label: "Complet", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    failed: { label: "Échoué", color: "text-red-400", bg: "bg-red-500/15", icon: DatabaseBackup },
    in_progress: { label: "En cours", color: "text-amber-400", bg: "bg-amber-500/15", icon: Loader2 },
};

/* ═══════════════════════════════════════════════
   BACKUPS PAGE
   ═══════════════════════════════════════════════ */

export default function BackupsPage() {
    const [backups, setBackups] = useState<Backup[]>(INITIAL_BACKUPS);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleManualBackup = useCallback(() => {
        setIsBackingUp(true);
        const toastId = toast.loading("Sauvegarde manuelle en cours…");

        setTimeout(() => {
            const now = new Date();
            const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                + " — " + now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

            const newBackup: Backup = {
                id: `bk-manual-${Date.now()}`,
                db: "All Databases",
                size: "6.5 GB",
                date: dateStr,
                duration: "5m 30s",
                status: "completed",
            };

            setBackups((prev) => [newBackup, ...prev]);
            setIsBackingUp(false);
            toast.dismiss(toastId);
            toast.success("Sauvegarde manuelle terminée", {
                description: "Toutes les bases ont été sauvegardées",
            });
        }, 3000);
    }, []);

    const handleDownload = useCallback((backup: Backup) => {
        toast.info(`Téléchargement de ${backup.id}`, {
            description: `${backup.db} — ${backup.size}`,
        });
    }, []);

    // KPIs
    const totalSize = "16.4 GB";

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sauvegardes</h1>
                    <p className="text-sm text-muted-foreground mt-1">Historique des sauvegardes automatiques</p>
                </div>
                <Button
                    onClick={handleManualBackup}
                    disabled={isBackingUp}
                    className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
                >
                    {isBackingUp ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <DatabaseBackup className="h-3.5 w-3.5" />
                    )}
                    Sauvegarde manuelle
                </Button>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total sauvegardes", value: String(backups.length), icon: DatabaseBackup, color: "from-red-600 to-orange-500" },
                    { label: "Dernière sauvegarde", value: "Il y a 8h", icon: Clock, color: "from-blue-600 to-cyan-500" },
                    { label: "Espace total", value: totalSize, icon: HardDrive, color: "from-emerald-600 to-green-500" },
                ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-2`}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Backups Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">ID</th>
                            <th className="text-left py-2 px-2">Base</th>
                            <th className="text-right py-2 px-2">Taille</th>
                            <th className="text-left py-2 px-2 hidden sm:table-cell">Date</th>
                            <th className="text-right py-2 px-2 hidden md:table-cell">Durée</th>
                            <th className="text-center py-2 px-2">Statut</th>
                            <th className="text-center py-2 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.map((b) => {
                            const cfg = STATUS_CFG[b.status];
                            return (
                                <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-2.5 px-2 font-mono">{b.id}</td>
                                    <td className="py-2.5 px-2 font-medium">{b.db}</td>
                                    <td className="py-2.5 px-2 text-right text-muted-foreground">{b.size}</td>
                                    <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{b.date}</td>
                                    <td className="py-2.5 px-2 text-right text-muted-foreground hidden md:table-cell">{b.duration}</td>
                                    <td className="py-2.5 px-2 text-center">
                                        <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0`}>
                                            {cfg.label}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            onClick={() => handleDownload(b)}
                                        >
                                            <Download className="h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
