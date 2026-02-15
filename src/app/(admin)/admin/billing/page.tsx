// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin > Facturation
// Revenus, factures, relances impayés, MRR/ARR
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Receipt,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Eye,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Wallet,
    Calendar,
    Building2,
    MoreHorizontal,
    FileText,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ─── Types ──────────────────────────────────────── */

type InvoiceStatus = "payée" | "en_attente" | "en_retard" | "annulée";

interface Invoice {
    id: string;
    numero: string;
    organisation: string;
    montant: number;
    status: InvoiceStatus;
    dateEmission: string;
    dateEcheance: string;
    plan: string;
}

/* ─── Config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    payée: { label: "Payée", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    en_attente: { label: "En attente", color: "text-amber-400", bg: "bg-amber-500/15", icon: Clock },
    en_retard: { label: "En retard", color: "text-red-400", bg: "bg-red-500/15", icon: AlertCircle },
    annulée: { label: "Annulée", color: "text-gray-400", bg: "bg-gray-500/15", icon: XCircle },
};

/* ─── Mock Data ──────────────────────────────────── */

const REVENUE_KPIS = [
    { label: "Revenus ce mois", value: "18.4M", suffix: "XAF", trend: +5.2, icon: Wallet, color: "from-emerald-600 to-green-500" },
    { label: "Impayés", value: "2.1M", suffix: "XAF", trend: -12.3, icon: AlertCircle, color: "from-red-600 to-orange-500" },
    { label: "Factures émises", value: "89", suffix: "", trend: +8.6, icon: Receipt, color: "from-blue-600 to-cyan-500" },
    { label: "Taux recouvrement", value: "94.2", suffix: "%", trend: +1.8, icon: TrendingUp, color: "from-violet-600 to-purple-500" },
];

const REVENUE_CHART = Array.from({ length: 12 }, (_, i) => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    return {
        month: months[i],
        revenus: Math.floor(12 + Math.random() * 8 + i * 0.8),
        prévisions: Math.floor(14 + i * 1.1),
    };
});

const INVOICES: Invoice[] = [
    { id: "F001", numero: "DIG-2026-089", organisation: "BGFI Bank", montant: 349000, status: "payée", dateEmission: "01/02/2026", dateEcheance: "28/02/2026", plan: "Enterprise" },
    { id: "F002", numero: "DIG-2026-090", organisation: "SEEG", montant: 349000, status: "payée", dateEmission: "01/02/2026", dateEcheance: "28/02/2026", plan: "Enterprise" },
    { id: "F003", numero: "DIG-2026-091", organisation: "CNAMGS", montant: 450000, status: "en_attente", dateEmission: "05/02/2026", dateEcheance: "05/03/2026", plan: "Institutionnel" },
    { id: "F004", numero: "DIG-2026-092", organisation: "ASCOMA Gabon", montant: 149000, status: "payée", dateEmission: "01/02/2026", dateEcheance: "28/02/2026", plan: "Pro" },
    { id: "F005", numero: "DIG-2026-078", organisation: "Gabon Oil Company", montant: 349000, status: "en_retard", dateEmission: "15/01/2026", dateEcheance: "15/02/2026", plan: "Enterprise" },
    { id: "F006", numero: "DIG-2026-079", organisation: "ANPI-Gabon", montant: 49000, status: "annulée", dateEmission: "15/01/2026", dateEcheance: "15/02/2026", plan: "Starter" },
    { id: "F007", numero: "DIG-2026-093", organisation: "Min. Santé", montant: 450000, status: "en_attente", dateEmission: "08/02/2026", dateEcheance: "08/03/2026", plan: "Institutionnel" },
    { id: "F008", numero: "DIG-2026-094", organisation: "Owendo Terminal", montant: 149000, status: "payée", dateEmission: "01/02/2026", dateEcheance: "28/02/2026", plan: "Pro" },
];

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Tooltip ────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="glass-card rounded-lg p-3 border border-white/10 text-xs shadow-xl">
            <p className="font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="ml-auto font-medium text-foreground">{p.value}M XAF</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   BILLING PAGE
   ═══════════════════════════════════════════════ */

export default function AdminBillingPage() {
    const [tab, setTab] = useState<"all" | InvoiceStatus>("all");

    const filteredInvoices = tab === "all" ? INVOICES : INVOICES.filter((inv) => inv.status === tab);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-emerald-400" />
                    Facturation
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Revenus, factures et suivi des paiements
                </p>
            </motion.div>

            {/* Revenue KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {REVENUE_KPIS.map((kpi) => {
                    const Icon = kpi.icon;
                    const trendUp = kpi.trend > 0;
                    const trendGood = kpi.label === "Impayés" ? !trendUp : trendUp;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <Badge variant="secondary" className={`text-[9px] border-0 ${trendGood ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(kpi.trend)}%
                                </Badge>
                            </div>
                            <p className="text-xl font-bold">
                                {kpi.value}<span className="text-xs text-muted-foreground ml-1">{kpi.suffix}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Revenue Chart */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold">Évolution des revenus</h2>
                        <p className="text-xs text-muted-foreground">Revenus vs prévisions — 12 mois (en millions XAF)</p>
                    </div>
                </div>
                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_CHART} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="prévisions" stroke="#8b5cf6" fill="url(#gForecast)" strokeWidth={1.5} strokeDasharray="6 3" name="Prévisions" />
                            <Area type="monotone" dataKey="revenus" stroke="#10b981" fill="url(#gRevenue)" strokeWidth={2} name="Revenus" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Invoices Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
                {/* Tab Filters */}
                <div className="flex gap-2 p-4 border-b border-white/5 flex-wrap">
                    <Button
                        variant={tab === "all" ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setTab("all")}
                    >
                        Toutes ({INVOICES.length})
                    </Button>
                    {(Object.keys(STATUS_CONFIG) as InvoiceStatus[]).map((status) => {
                        const count = INVOICES.filter((i) => i.status === status).length;
                        return (
                            <Button
                                key={status}
                                variant={tab === status ? "default" : "outline"}
                                size="sm"
                                className={`h-8 text-xs ${tab === status ? "" : `${STATUS_CONFIG[status].color} border-white/10`}`}
                                onClick={() => setTab(status)}
                            >
                                {STATUS_CONFIG[status].label} ({count})
                            </Button>
                        );
                    })}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 font-semibold text-muted-foreground">N° Facture</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Organisation</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Plan</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground">Montant</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground hidden sm:table-cell">Échéance</th>
                                <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv, i) => {
                                const cfg = STATUS_CONFIG[inv.status];
                                return (
                                    <motion.tr
                                        key={inv.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.04 }}
                                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{inv.numero}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                {inv.organisation}
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                                {inv.plan}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className={`text-[9px] ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                                                {cfg.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-semibold">
                                            {(inv.montant / 1000).toFixed(0)}k<span className="text-muted-foreground ml-1">XAF</span>
                                        </td>
                                        <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">
                                            {inv.dateEcheance}
                                        </td>
                                        <td className="p-4 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => toast.info(`Facture ${inv.numero}`, { description: `${inv.organisation} · ${inv.plan} · ${(inv.montant / 1000).toFixed(0)}k XAF` })} className="text-xs gap-2">
                                                        <Eye className="h-3.5 w-3.5" /> Voir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toast.success(`PDF téléchargé`, { description: `${inv.numero} — ${inv.organisation}` })} className="text-xs gap-2">
                                                        <Download className="h-3.5 w-3.5" /> Télécharger PDF
                                                    </DropdownMenuItem>
                                                    {inv.status === "en_retard" && (
                                                        <DropdownMenuItem onClick={() => toast.warning(`Relance envoyée`, { description: `${inv.organisation} — Échéance : ${inv.dateEcheance}` })} className="text-xs gap-2 text-amber-400">
                                                            <Send className="h-3.5 w-3.5" /> Envoyer relance
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
