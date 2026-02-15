// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Database Replicas
// Réplication avec statuts variés, KPIs,
// actions Force Sync par réplica
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { HardDrive, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types & Config ─────────────────────────────── */

type ReplicaStatus = "synced" | "lagging" | "error";

interface Replica {
    name: string;
    source: string;
    region: string;
    lag: string;
    status: ReplicaStatus;
}

const STATUS_CFG: Record<ReplicaStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    synced: { label: "Synchronisé", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    lagging: { label: "En retard", color: "text-amber-400", bg: "bg-amber-500/15", icon: AlertTriangle },
    error: { label: "Erreur", color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

/* ─── Mock Data ──────────────────────────────────── */

const INITIAL_REPLICAS: Replica[] = [
    { name: "pg-replica-eu-01", source: "Supabase PG", region: "eu-west-1", lag: "0.3s", status: "synced" },
    { name: "pg-replica-us-01", source: "Supabase PG", region: "us-east-1", lag: "4.8s", status: "lagging" },
    { name: "convex-mirror-eu", source: "Convex Primary", region: "eu-west-1", lag: "0.1s", status: "synced" },
    { name: "redis-replica-01", source: "Redis Cache", region: "us-west-2", lag: "0.05s", status: "synced" },
    { name: "pg-replica-af-01", source: "Supabase PG", region: "af-south-1", lag: "12.3s", status: "error" },
];

/* ═══════════════════════════════════════════════
   REPLICAS PAGE
   ═══════════════════════════════════════════════ */

export default function ReplicasPage() {
    const [replicas, setReplicas] = useState<Replica[]>(INITIAL_REPLICAS);
    const [syncingNames, setSyncingNames] = useState<Set<string>>(new Set());

    const handleForceSync = useCallback((name: string) => {
        setSyncingNames((prev) => new Set(prev).add(name));
        const toastId = toast.loading(`Synchronisation de ${name}…`);

        setTimeout(() => {
            setReplicas((prev) =>
                prev.map((r) => r.name === name ? { ...r, status: "synced" as ReplicaStatus, lag: "0.1s" } : r)
            );
            setSyncingNames((prev) => {
                const next = new Set(prev);
                next.delete(name);
                return next;
            });
            toast.dismiss(toastId);
            toast.success(`${name} synchronisé`);
        }, 2000);
    }, []);

    // KPIs
    const syncedCount = useMemo(() => replicas.filter((r) => r.status === "synced").length, [replicas]);
    const laggingCount = useMemo(() => replicas.filter((r) => r.status === "lagging").length, [replicas]);
    const errorCount = useMemo(() => replicas.filter((r) => r.status === "error").length, [replicas]);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Réplicas</h1>
                <p className="text-sm text-muted-foreground mt-1">Réplication des bases de données — {replicas.length} réplicas actifs</p>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total réplicas", value: String(replicas.length), icon: HardDrive, color: "from-red-600 to-orange-500" },
                    { label: "Synchronisés", value: String(syncedCount), icon: CheckCircle2, color: "from-emerald-600 to-green-500" },
                    { label: "En retard", value: String(laggingCount), icon: AlertTriangle, color: "from-amber-600 to-orange-500" },
                    { label: "En erreur", value: String(errorCount), icon: XCircle, color: "from-red-600 to-rose-500" },
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

            {/* Replicas Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Nom</th>
                            <th className="text-left py-2 px-2">Source</th>
                            <th className="text-left py-2 px-2 hidden sm:table-cell">Région</th>
                            <th className="text-right py-2 px-2">Lag</th>
                            <th className="text-center py-2 px-2">Statut</th>
                            <th className="text-center py-2 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {replicas.map((r) => {
                            const cfg = STATUS_CFG[r.status];
                            const StatusIcon = cfg.icon;
                            const isSyncing = syncingNames.has(r.name);
                            return (
                                <tr key={r.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-2.5 px-2 font-mono font-medium">{r.name}</td>
                                    <td className="py-2.5 px-2 text-muted-foreground">{r.source}</td>
                                    <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">
                                        <span className="flex items-center gap-1">
                                            <Globe className="h-3 w-3" /> {r.region}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-2 text-right font-mono">{r.lag}</td>
                                    <td className="py-2.5 px-2 text-center">
                                        <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {cfg.label}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] gap-1 px-2"
                                            onClick={() => handleForceSync(r.name)}
                                            disabled={isSyncing || r.status === "synced"}
                                        >
                                            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                                            {isSyncing ? "Sync…" : "Sync"}
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
