// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Databases
// Full DB management with KPIs, health metrics,
// backup actions, slow queries, progress bars
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Database,
    HardDrive,
    Activity,
    Download,
    RefreshCw,
    Settings,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Zap,
    MoreHorizontal,
    Play,
    Pause,
    Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ─── Config ─────────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

type DbStatus = "active" | "maintenance" | "error";

interface DbInstance {
    id: string;
    name: string;
    type: string;
    size: string;
    sizeGB: number;
    maxGB: number;
    docs: string;
    status: DbStatus;
    region: string;
    connections: number;
    maxConnections: number;
    latency: string;
    lastBackup: string;
}

const STATUS_CFG: Record<DbStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    maintenance: { label: "Maintenance", color: "text-amber-400", bg: "bg-amber-500/15", icon: Settings },
    error: { label: "Erreur", color: "text-red-400", bg: "bg-red-500/15", icon: AlertTriangle },
};

/* ─── Mock Data ──────────────────────────────────── */

const DBS: DbInstance[] = [
    { id: "db-1", name: "Convex (Primary)", type: "Document Store", size: "1.2 GB", sizeGB: 1.2, maxGB: 5, docs: "245K docs", status: "active", region: "us-east-1", connections: 42, maxConnections: 100, latency: "12ms", lastBackup: "Il y a 2h" },
    { id: "db-2", name: "Supabase PostgreSQL", type: "Relational (PG15)", size: "4.8 GB", sizeGB: 4.8, maxGB: 20, docs: "89 tables", status: "active", region: "eu-west-1", connections: 67, maxConnections: 200, latency: "34ms", lastBackup: "Il y a 1h" },
    { id: "db-3", name: "Redis Cache", type: "Key-Value", size: "256 MB", sizeGB: 0.256, maxGB: 1, docs: "12K keys", status: "active", region: "us-east-1", connections: 128, maxConnections: 500, latency: "2ms", lastBackup: "N/A (in-memory)" },
    { id: "db-4", name: "Firebase Firestore", type: "Document Store", size: "890 MB", sizeGB: 0.89, maxGB: 5, docs: "178K docs", status: "active", region: "global", connections: 23, maxConnections: 100, latency: "45ms", lastBackup: "Il y a 30 min" },
];

const SLOW_QUERIES = [
    { query: "SELECT * FROM audit_logs WHERE created_at > ...", db: "Supabase", duration: "2.4s", count: 47, severity: "high" as const },
    { query: "db.organizations.find({ status: 'active' }).sort(...)", db: "Convex", duration: "890ms", count: 12, severity: "medium" as const },
    { query: "HGETALL session:user:*", db: "Redis", duration: "450ms", count: 8, severity: "low" as const },
];

const KPIS = [
    { label: "Instances", value: DBS.length, icon: Database, color: "from-blue-600 to-cyan-500" },
    { label: "Stockage total", value: "7.1 GB", icon: HardDrive, color: "from-violet-600 to-purple-500" },
    { label: "Connexions actives", value: DBS.reduce((a, d) => a + d.connections, 0), icon: Activity, color: "from-emerald-600 to-green-500" },
    { label: "Latence moy.", value: "23ms", icon: Zap, color: "from-orange-600 to-amber-500" },
];

const severityCfg = {
    high: { color: "text-red-400", bg: "bg-red-500/15", label: "Élevée" },
    medium: { color: "text-amber-400", bg: "bg-amber-500/15", label: "Moyenne" },
    low: { color: "text-blue-400", bg: "bg-blue-500/15", label: "Faible" },
};

/* ═══════════════════════════════════════════════
   DATABASE PAGE
   ═══════════════════════════════════════════════ */

export default function DatabasesPage() {
    const [loadingBackup, setLoadingBackup] = useState<string | null>(null);

    const handleBackup = useCallback((db: DbInstance) => {
        setLoadingBackup(db.id);
        toast.loading(`Sauvegarde de ${db.name} en cours…`);
        setTimeout(() => {
            setLoadingBackup(null);
            toast.dismiss();
            toast.success(`Sauvegarde de ${db.name} terminée`);
        }, 2000);
    }, []);

    const handleAction = useCallback((action: string, db: DbInstance) => {
        switch (action) {
            case "restart":
                toast.success(`${db.name} redémarré avec succès`);
                break;
            case "maintenance":
                toast.warning(`${db.name} mis en mode maintenance`);
                break;
            case "optimize":
                toast.success(`Optimisation de ${db.name} lancée`);
                break;
            case "export":
                toast.success(`Export de ${db.name} en cours…`);
                break;
        }
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Bases de Données</h1>
                <p className="text-sm text-muted-foreground mt-1">Gestion des instances, réplicas & sauvegardes</p>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="glass-card rounded-xl p-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.color}`} />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                                </div>
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center opacity-80`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Database Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DBS.map((db) => {
                    const st = STATUS_CFG[db.status];
                    const StIcon = st.icon;
                    const storagePercent = Math.round((db.sizeGB / db.maxGB) * 100);
                    const connPercent = Math.round((db.connections / db.maxConnections) * 100);
                    return (
                        <motion.div key={db.id} variants={fadeUp} className="glass-card rounded-xl p-5 space-y-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 ${db.status === "active" ? "bg-gradient-to-r from-red-600 to-orange-500" : db.status === "maintenance" ? "bg-amber-500" : "bg-red-500"}`} />
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-orange-400" />
                                    <span className="font-semibold text-sm">{db.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${st.bg} ${st.color}`}>
                                        <StIcon className="h-2.5 w-2.5 mr-1" />
                                        {st.label}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => handleAction("restart", db)} className="text-xs gap-2 cursor-pointer">
                                                <RefreshCw className="h-3.5 w-3.5" /> Redémarrer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction("maintenance", db)} className="text-xs gap-2 cursor-pointer">
                                                <Pause className="h-3.5 w-3.5" /> Mode maintenance
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction("optimize", db)} className="text-xs gap-2 cursor-pointer">
                                                <Zap className="h-3.5 w-3.5" /> Optimiser
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction("export", db)} className="text-xs gap-2 cursor-pointer">
                                                <Download className="h-3.5 w-3.5" /> Exporter
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><span className="text-muted-foreground">Type</span><p className="font-medium">{db.type}</p></div>
                                <div><span className="text-muted-foreground">Région</span><p className="font-medium">{db.region}</p></div>
                                <div><span className="text-muted-foreground">Contenu</span><p className="font-medium">{db.docs}</p></div>
                                <div><span className="text-muted-foreground">Latence</span><p className="font-medium">{db.latency}</p></div>
                            </div>

                            {/* Storage Progress */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">Stockage</span>
                                    <span className="font-mono">{db.size} / {db.maxGB} GB</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${storagePercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Connections Progress */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">Connexions</span>
                                    <span className="font-mono">{db.connections} / {db.maxConnections}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${connPercent > 80 ? "bg-red-500" : connPercent > 50 ? "bg-amber-500" : "bg-blue-500"}`}
                                        style={{ width: `${connPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" /> Backup : {db.lastBackup}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2 border-white/10 bg-white/5 gap-1"
                                    onClick={() => handleBackup(db)}
                                    disabled={loadingBackup === db.id}
                                >
                                    {loadingBackup === db.id ? (
                                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                    ) : (
                                        <Download className="h-2.5 w-2.5" />
                                    )}
                                    Backup
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Slow Queries */}
            <motion.div variants={fadeUp} className="space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Requêtes lentes
                </h2>
                <div className="glass-card rounded-2xl p-4 space-y-2">
                    {SLOW_QUERIES.map((q, i) => {
                        const sev = severityCfg[q.severity];
                        return (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                                <Badge variant="secondary" className={`text-[9px] border-0 shrink-0 ${sev.bg} ${sev.color}`}>
                                    {sev.label}
                                </Badge>
                                <code className="text-[11px] text-foreground/80 font-mono truncate flex-1">{q.query}</code>
                                <span className="text-[10px] text-muted-foreground shrink-0">{q.db}</span>
                                <span className="text-[10px] font-mono text-orange-400 shrink-0">{q.duration}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{q.count}x</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
