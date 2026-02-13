// DIGITALIUM.IO — SysAdmin: Journaux (Logs)
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Filter, Search, Terminal, AlertTriangle, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const LOGS = [
    { ts: "12:35:42.123", level: "INFO" as const, service: "auth", message: "User login successful — jp.ondo@dgdi.ga" },
    { ts: "12:35:41.890", level: "WARN" as const, service: "storage", message: "High latency on bucket 'documents' — 245ms" },
    { ts: "12:35:40.456", level: "INFO" as const, service: "api", message: "POST /api/documents/archive — 200 OK (89ms)" },
    { ts: "12:35:39.012", level: "ERROR" as const, service: "redis", message: "Connection timeout — retry 3/5" },
    { ts: "12:35:38.567", level: "INFO" as const, service: "convex", message: "Mutation organizations:create completed — 12ms" },
    { ts: "12:35:37.234", level: "INFO" as const, service: "auth", message: "Token refreshed — user cmous-7891" },
    { ts: "12:35:36.890", level: "WARN" as const, service: "api", message: "Rate limit approaching — client dk-12345 (85/100 req/min)" },
    { ts: "12:35:35.111", level: "INFO" as const, service: "cron", message: "Archive cleanup completed — 47 files removed" },
    { ts: "12:35:34.678", level: "ERROR" as const, service: "email", message: "SMTP send failed — template 'welcome' — timeout" },
    { ts: "12:35:33.234", level: "INFO" as const, service: "convex", message: "Query users:list completed — 8ms — 156 results" },
    { ts: "12:35:32.890", level: "INFO" as const, service: "api", message: "GET /api/admin/metrics — 200 OK (23ms)" },
    { ts: "12:35:31.456", level: "WARN" as const, service: "security", message: "Failed login attempt — admin@test.com from 41.158.22.115" },
];

const levelCfg = {
    INFO: { color: "text-blue-400", bg: "bg-blue-500/15", icon: Info },
    WARN: { color: "text-amber-400", bg: "bg-amber-500/15", icon: AlertTriangle },
    ERROR: { color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

export default function LogsPage() {
    const [filter, setFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
    const [search, setSearch] = useState("");

    const filtered = LOGS.filter((l) => {
        if (filter !== "ALL" && l.level !== filter) return false;
        if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.service.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold">Journaux</h1>
                <p className="text-sm text-muted-foreground mt-1">Logs système en temps réel</p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Filtrer les logs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
                </div>
                {(["ALL", "INFO", "WARN", "ERROR"] as const).map((f) => (
                    <Button key={f} variant={filter === f ? "secondary" : "ghost"} size="sm" className={`h-7 text-[10px] px-2.5 ${filter === f ? "bg-white/10" : ""}`} onClick={() => setFilter(f)}>
                        {f}
                    </Button>
                ))}
                <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} entrées</span>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 font-mono text-[11px] space-y-0.5 max-h-[600px] overflow-y-auto">
                {filtered.map((log, i) => {
                    const cfg = levelCfg[log.level];
                    return (
                        <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-white/[0.02]">
                            <span className="text-muted-foreground/50 shrink-0 w-[90px]">{log.ts}</span>
                            <Badge variant="secondary" className={`text-[9px] border-0 ${cfg.bg} ${cfg.color} shrink-0 w-[45px] justify-center`}>{log.level}</Badge>
                            <span className="text-orange-400/70 shrink-0 w-[70px]">[{log.service}]</span>
                            <span className="text-foreground/80">{log.message}</span>
                        </div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
