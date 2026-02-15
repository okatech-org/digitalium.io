// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin: Sécurité
// Security alerts, failed logins, firewall rules
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    ShieldCheck,
    Lock,
    Unlock,
    Globe,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    Ban,
    Eye,
    User,
    Clock,
    MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Types ──────────────────────────────────────── */

type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertStatus = "active" | "investigated" | "resolved";

interface SecurityAlert {
    severity: AlertSeverity;
    title: string;
    desc: string;
    time: string;
    status: AlertStatus;
}

/* ─── Mock data ──────────────────────────────────── */

const SECURITY_SCORE = 87;

const SECURITY_ALERTS: SecurityAlert[] = [
    { severity: "critical", title: "Tentative de brute-force détectée", desc: "IP 41.158.22.115 — 47 tentatives en 5 min sur /api/auth/login", time: "Il y a 3 min", status: "active" },
    { severity: "high", title: "Token JWT expiré réutilisé", desc: "User ID cmous-7891 — tentative de replay d'un token expiré", time: "Il y a 15 min", status: "investigated" },
    { severity: "medium", title: "Accès API depuis IP non-whitelist", desc: "IP 92.45.12.78 — appel vers /api/admin/users", time: "Il y a 45 min", status: "resolved" },
    { severity: "low", title: "Certificat SSL en approche d'expiration", desc: "*.digitalium.io expire dans 30 jours", time: "Il y a 2h", status: "active" },
    { severity: "high", title: "Escalade de privilèges bloquée", desc: "org_member → org_admin sans autorisation — User obian-2341", time: "Il y a 3h", status: "resolved" },
    { severity: "medium", title: "Rate limiting déclenché", desc: "Client API key dk-12345 — 500 req/10sec", time: "Il y a 4h", status: "resolved" },
];

const FAILED_LOGINS = [
    { email: "admin@test.com", ip: "41.158.22.115", location: "Libreville, GA", attempts: 47, lastAttempt: "Il y a 3 min", blocked: true },
    { email: "root@digitalium.ga", ip: "185.220.101.34", location: "Tor Network", attempts: 23, lastAttempt: "Il y a 12 min", blocked: true },
    { email: "p.obiang@gov.ga", ip: "196.28.45.12", location: "Port-Gentil, GA", attempts: 5, lastAttempt: "Il y a 1h", blocked: false },
    { email: "unknown@hacker.ru", ip: "92.45.12.78", location: "Moscou, RU", attempts: 89, lastAttempt: "Il y a 2h", blocked: true },
    { email: "test@test.test", ip: "127.0.0.1", location: "localhost", attempts: 3, lastAttempt: "Il y a 5h", blocked: false },
];

const FIREWALL_RULES = [
    { name: "Block Tor Exit Nodes", type: "DENY" as const, target: "Tor Network IPs", status: "active" as const, hits: 2341 },
    { name: "Allow Gabon IPs", type: "ALLOW" as const, target: "196.0.0.0/8, 41.0.0.0/8", status: "active" as const, hits: 145670 },
    { name: "Rate Limit API", type: "LIMIT" as const, target: "/api/* — 100 req/min", status: "active" as const, hits: 8923 },
    { name: "Block SQL Injection", type: "DENY" as const, target: "Pattern: SELECT.*UNION.*", status: "active" as const, hits: 567 },
    { name: "Geo-Block Russia/China", type: "DENY" as const, target: "RU, CN IP Ranges", status: "active" as const, hits: 12890 },
    { name: "Admin IP Whitelist", type: "ALLOW" as const, target: "41.158.0.0/16, VPN", status: "active" as const, hits: 4521 },
    { name: "Block Known Scanners", type: "DENY" as const, target: "Shodan, Censys, ZMap", status: "inactive" as const, hits: 0 },
];

const severityCfg = {
    critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", badge: "bg-red-500 text-white" },
    high: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", badge: "bg-orange-500 text-white" },
    medium: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", badge: "bg-amber-500/20 text-amber-300" },
    low: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", badge: "bg-blue-500/20 text-blue-300" },
};

const statusCfg = {
    active: { label: "Actif", color: "bg-red-500/20 text-red-300" },
    investigated: { label: "En cours", color: "bg-amber-500/20 text-amber-300" },
    resolved: { label: "Résolu", color: "bg-emerald-500/20 text-emerald-300" },
};

const typeCfg = {
    ALLOW: { color: "text-emerald-400", icon: CheckCircle2 },
    DENY: { color: "text-red-400", icon: Ban },
    LIMIT: { color: "text-amber-400", icon: Clock },
};

export default function SecurityPage() {
    const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
    const [alerts, setAlerts] = useState(SECURITY_ALERTS);
    const [logins, setLogins] = useState(FAILED_LOGINS);

    const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sécurité</h1>
                    <p className="text-sm text-muted-foreground mt-1">Alertes, connexions échouées & pare-feu</p>
                </div>
                <div className="glass-card rounded-xl px-5 py-3 text-center">
                    <p className="text-3xl font-bold text-orange-400">{SECURITY_SCORE}</p>
                    <p className="text-[10px] text-muted-foreground">Score sécurité</p>
                </div>
            </motion.div>

            {/* Security Alerts */}
            <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-orange-400" />
                        Alertes de sécurité
                    </h2>
                    <div className="flex gap-1">
                        {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? "secondary" : "ghost"}
                                size="sm"
                                className={`h-6 text-[10px] px-2 ${filter === f ? "bg-white/10" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === "all" ? "Tout" : f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 space-y-1.5">
                    {filtered.map((alert, i) => {
                        const sev = severityCfg[alert.severity];
                        const st = statusCfg[alert.status];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${sev.bg}`}
                            >
                                <Badge className={`text-[9px] mt-0.5 ${sev.badge} border-0 shrink-0`}>
                                    {alert.severity.toUpperCase()}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{alert.desc}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${st.color}`}>
                                        {st.label}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground/60">{alert.time}</span>
                                    {alert.status !== "resolved" && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 text-[10px] px-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 mt-0.5"
                                            onClick={() => {
                                                setAlerts((prev) =>
                                                    prev.map((a, j) => j === i ? { ...a, status: "resolved" as const } : a)
                                                );
                                                toast.success("Alerte résolue", { description: alert.title });
                                            }}
                                        >
                                            Résoudre
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Failed Logins + Firewall */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Failed Logins */}
                <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-red-400" />
                        Tentatives de connexion échouées
                    </h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="text-left py-2 px-2 font-medium">Email</th>
                                <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">IP</th>
                                <th className="text-right py-2 px-2 font-medium">Tentatives</th>
                                <th className="text-center py-2 px-2 font-medium">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {FAILED_LOGINS.map((fl, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-2 px-2">
                                        <p className="font-mono text-[11px]">{fl.email}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-2.5 w-2.5" />{fl.location}
                                        </p>
                                    </td>
                                    <td className="py-2 px-2 font-mono text-muted-foreground hidden sm:table-cell">{fl.ip}</td>
                                    <td className={`py-2 px-2 text-right font-bold ${fl.attempts > 20 ? "text-red-400" : fl.attempts > 5 ? "text-amber-400" : "text-muted-foreground"}`}>
                                        {fl.attempts}
                                    </td>
                                    <td className="py-2 px-2 text-center">
                                        {fl.blocked ? (
                                            <Badge className="text-[9px] bg-red-500/20 text-red-300 border-0">Bloqué</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-5 text-[10px] px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => {
                                                    setLogins((prev) =>
                                                        prev.map((l, j) => j === i ? { ...l, blocked: true } : l)
                                                    );
                                                    toast.warning(`IP ${fl.ip} bloquée`, { description: fl.email });
                                                }}
                                            >
                                                Bloquer
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Firewall Rules */}
                <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Règles pare-feu actives
                    </h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="text-left py-2 px-2 font-medium">Règle</th>
                                <th className="text-center py-2 px-2 font-medium">Type</th>
                                <th className="text-right py-2 px-2 font-medium">Hits</th>
                                <th className="text-center py-2 px-2 font-medium">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {FIREWALL_RULES.map((rule, i) => {
                                const tcfg = typeCfg[rule.type];
                                const TypeIcon = tcfg.icon;
                                return (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2">
                                            <p className="font-medium">{rule.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{rule.target}</p>
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <Badge variant="secondary" className={`text-[9px] ${tcfg.color} bg-white/5 border-0`}>
                                                {rule.type}
                                            </Badge>
                                        </td>
                                        <td className="py-2 px-2 text-right font-mono">{rule.hits.toLocaleString("fr")}</td>
                                        <td className="py-2 px-2 text-center">
                                            <span className={`inline-block h-2 w-2 rounded-full ${rule.status === "active" ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
