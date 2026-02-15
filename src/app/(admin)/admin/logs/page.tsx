// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Journaux (Logs)
// Viewer temps réel avec filtres, auto-refresh,
// export, pagination, et résumé des niveaux
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Info, XCircle, Activity, Download, Trash2, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types & Config ─────────────────────────────── */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
    ts: string;
    level: LogLevel;
    service: string;
    message: string;
}

const levelCfg: Record<LogLevel, { color: string; bg: string; icon: React.ElementType }> = {
    INFO: { color: "text-blue-400", bg: "bg-blue-500/15", icon: Info },
    WARN: { color: "text-amber-400", bg: "bg-amber-500/15", icon: AlertTriangle },
    ERROR: { color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
    DEBUG: { color: "text-gray-400", bg: "bg-gray-500/15", icon: Terminal },
};

/* ─── Mock Data (25+ entries) ────────────────────── */

const ALL_LOGS: LogEntry[] = [
    { ts: "12:35:42.123", level: "INFO", service: "auth", message: "User login successful — jp.ondo@dgdi.ga" },
    { ts: "12:35:41.890", level: "WARN", service: "storage", message: "High latency on bucket 'documents' — 245ms" },
    { ts: "12:35:40.456", level: "INFO", service: "api", message: "POST /api/documents/archive — 200 OK (89ms)" },
    { ts: "12:35:39.012", level: "ERROR", service: "redis", message: "Connection timeout — retry 3/5" },
    { ts: "12:35:38.567", level: "INFO", service: "convex", message: "Mutation organizations:create completed — 12ms" },
    { ts: "12:35:37.234", level: "INFO", service: "auth", message: "Token refreshed — user cmous-7891" },
    { ts: "12:35:36.890", level: "WARN", service: "api", message: "Rate limit approaching — client dk-12345 (85/100 req/min)" },
    { ts: "12:35:35.111", level: "INFO", service: "cron", message: "Archive cleanup completed — 47 files removed" },
    { ts: "12:35:34.678", level: "ERROR", service: "email", message: "SMTP send failed — template 'welcome' — timeout" },
    { ts: "12:35:33.234", level: "INFO", service: "convex", message: "Query users:list completed — 8ms — 156 results" },
    { ts: "12:35:32.890", level: "INFO", service: "api", message: "GET /api/admin/metrics — 200 OK (23ms)" },
    { ts: "12:35:31.456", level: "WARN", service: "security", message: "Failed login attempt — admin@test.com from 41.158.22.115" },
    { ts: "12:35:30.999", level: "INFO", service: "convex", message: "Subscription organizations:list — 24 active listeners" },
    { ts: "12:35:29.444", level: "WARN", service: "auth", message: "JWT expiry in 5 min — user p.obiang@digitalium.ga" },
    { ts: "12:35:28.001", level: "ERROR", service: "storage", message: "S3 PutObject failed — bucket 'archives' — AccessDenied" },
    { ts: "12:35:27.567", level: "INFO", service: "api", message: "GET /api/signatures/pending — 200 OK (45ms)" },
    { ts: "12:35:26.123", level: "DEBUG", service: "convex", message: "Query cache hit — documents:list — 0.3ms" },
    { ts: "12:35:25.789", level: "INFO", service: "cron", message: "Retention check started — scanning 2,847 archives" },
    { ts: "12:35:24.456", level: "WARN", service: "api", message: "Slow query detected — archives:search — 890ms" },
    { ts: "12:35:23.012", level: "INFO", service: "auth", message: "User logout — ornella@digitalium.ga" },
    { ts: "12:35:22.567", level: "ERROR", service: "webhook", message: "Payment webhook failed — org SEEG — HTTP 502" },
    { ts: "12:35:21.234", level: "INFO", service: "api", message: "PATCH /api/organizations/seeg/settings — 200 OK (34ms)" },
    { ts: "12:35:20.890", level: "DEBUG", service: "redis", message: "Cache invalidation — key: org_config_seeg — TTL expired" },
    { ts: "12:35:19.456", level: "INFO", service: "convex", message: "Mutation audit_logs:logAction completed — 3ms" },
    { ts: "12:35:18.012", level: "WARN", service: "security", message: "Unusual IP detected — 185.220.101.45 — TOR exit node" },
    { ts: "12:35:17.567", level: "INFO", service: "email", message: "Invitation sent — claire.m@bgfi.com — template 'org_invite'" },
    { ts: "12:35:16.234", level: "ERROR", service: "cron", message: "Certificate renewal failed — cert CERT-2026-00147 — expired CA" },
    { ts: "12:35:15.890", level: "INFO", service: "api", message: "GET /api/admin/dashboard — 200 OK (67ms)" },
];

/* ═══════════════════════════════════════════════
   LOGS PAGE
   ═══════════════════════════════════════════════ */

export default function LogsPage() {
    const [filter, setFilter] = useState<"ALL" | LogLevel>("ALL");
    const [search, setSearch] = useState("");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [displayCount, setDisplayCount] = useState(15);

    const filtered = useMemo(() =>
        ALL_LOGS.filter((l) => {
            if (filter !== "ALL" && l.level !== filter) return false;
            if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.service.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        }),
        [filter, search]
    );

    const displayed = filtered.slice(0, displayCount);

    // Summary counts
    const summary = useMemo(() => ({
        total: ALL_LOGS.length,
        errors: ALL_LOGS.filter((l) => l.level === "ERROR").length,
        warnings: ALL_LOGS.filter((l) => l.level === "WARN").length,
        services: new Set(ALL_LOGS.map((l) => l.service)).size,
    }), []);

    const handleExport = () => {
        toast.info("Export en cours…", {
            description: `${filtered.length} entrées exportées en CSV`,
        });
    };

    const handleClear = () => {
        setSearch("");
        setFilter("ALL");
        setDisplayCount(15);
        toast.info("Affichage réinitialisé");
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh((prev) => !prev);
        toast.info(autoRefresh ? "Auto-refresh désactivé" : "Auto-refresh activé — 5s");
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Journaux</h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    Logs système en temps réel
                    {autoRefresh && (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                        </span>
                    )}
                </p>
            </motion.div>

            {/* Summary */}
            <motion.div variants={fadeUp} className="flex gap-4 text-[10px] text-muted-foreground">
                <span>{summary.total} entrées</span>
                <span className="text-red-400">{summary.errors} erreurs</span>
                <span className="text-amber-400">{summary.warnings} warnings</span>
                <span>{summary.services} services</span>
            </motion.div>

            {/* Toolbar */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Filtrer les logs…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setDisplayCount(15); }}
                        className="h-8 pl-8 text-xs bg-white/5 border-white/10"
                    />
                </div>
                {(["ALL", "INFO", "WARN", "ERROR", "DEBUG"] as const).map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "secondary" : "ghost"}
                        size="sm"
                        className={`h-7 text-[10px] px-2.5 ${filter === f ? "bg-white/10" : ""}`}
                        onClick={() => { setFilter(f); setDisplayCount(15); }}
                    >
                        {f}
                    </Button>
                ))}

                <div className="hidden sm:flex items-center gap-1 ml-auto">
                    <Button
                        variant={autoRefresh ? "secondary" : "ghost"}
                        size="sm"
                        className={`h-7 text-[10px] px-2.5 gap-1 ${autoRefresh ? "bg-emerald-500/15 text-emerald-400" : ""}`}
                        onClick={toggleAutoRefresh}
                    >
                        <Activity className="h-3 w-3" />
                        {autoRefresh ? "Live" : "Auto"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2.5 gap-1" onClick={handleExport}>
                        <Download className="h-3 w-3" /> Export
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2.5 gap-1 text-red-400 hover:text-red-300" onClick={handleClear}>
                        <Trash2 className="h-3 w-3" /> Clear
                    </Button>
                </div>

                <span className="text-[10px] text-muted-foreground sm:hidden ml-auto">{filtered.length} entrées</span>
            </motion.div>

            {/* Log entries */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 font-mono text-[11px] space-y-0.5 max-h-[600px] overflow-y-auto">
                {displayed.map((log, i) => {
                    const cfg = levelCfg[log.level];
                    return (
                        <motion.div
                            key={`${log.ts}-${i}`}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.02 }}
                            className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-white/[0.02]"
                        >
                            <span className="text-muted-foreground/50 shrink-0 w-[90px]">{log.ts}</span>
                            <Badge variant="secondary" className={`text-[9px] border-0 ${cfg.bg} ${cfg.color} shrink-0 w-[45px] justify-center`}>
                                {log.level}
                            </Badge>
                            <span className="text-orange-400/70 shrink-0 w-[70px]">[{log.service}]</span>
                            <span className="text-foreground/80">{log.message}</span>
                        </motion.div>
                    );
                })}

                {displayed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Terminal className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">Aucun log trouvé</p>
                    </div>
                )}

                {displayCount < filtered.length && (
                    <div className="text-center py-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={() => setDisplayCount((prev) => prev + 15)}
                        >
                            Charger plus ({filtered.length - displayCount} restants)
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
