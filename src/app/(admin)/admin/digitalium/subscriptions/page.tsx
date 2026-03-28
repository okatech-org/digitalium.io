// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Espace DIGITALIUM: Abonnements
// Gestion des plans, MRR, abonnés et upgrades
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
    CreditCard,
    TrendingUp,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Zap,
    Star,
    Crown,
    Search,
    Loader2,
    MoreHorizontal,
    ArrowUpCircle,
    XCircle,
    PlayCircle,
    RefreshCw,
    FileText,
    Archive,
    PenTool,
    GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Config ─────────────────────────────────────── */

const PLAN_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; borderColor: string; price: number; features: string[] }> = {
    starter: {
        label: "Starter",
        icon: Zap,
        color: "from-gray-500 to-gray-400",
        borderColor: "border-gray-500/20",
        price: 49000,
        features: ["5 utilisateurs", "1 GB stockage", "iDocument basic", "Support email"],
    },
    pro: {
        label: "Pro",
        icon: Star,
        color: "from-blue-600 to-cyan-500",
        borderColor: "border-blue-500/20",
        price: 149000,
        features: ["25 utilisateurs", "10 GB stockage", "iDocument + iArchive", "iSignature (50/mois)", "Support prioritaire"],
    },
    enterprise: {
        label: "Enterprise",
        icon: Crown,
        color: "from-violet-600 to-purple-500",
        borderColor: "border-violet-500/20",
        price: 349000,
        features: ["Illimité", "100 GB stockage", "Tous les modules", "iSignature illimité", "API access", "Support dédié"],
    },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15" },
    trial: { label: "Essai", color: "text-blue-400", bg: "bg-blue-500/15" },
    past_due: { label: "Impayé", color: "text-amber-400", bg: "bg-amber-500/15" },
    cancelled: { label: "Annulé", color: "text-red-400", bg: "bg-red-500/15" },
};

type StatusFilter = "all" | "active" | "trial" | "past_due" | "cancelled";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "trial", label: "Essai" },
    { value: "past_due", label: "Impayés" },
    { value: "cancelled", label: "Annulés" },
];

const MODULE_ICONS: Record<string, React.ElementType> = {
    iDocument: FileText,
    iArchive: Archive,
    iSignature: PenTool,
    iAsted: GraduationCap,
};

/* ═══════════════════════════════════════════════
   DIGITALIUM SUBSCRIPTIONS PAGE
   ═══════════════════════════════════════════════ */

export default function DigitaliumSubscriptionsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // ─── Convex queries ─────────────────────
    const allSubscriptions = useQuery(api.subscriptions.list, {});
    const organizations = useQuery(api.organizations.list, {});

    // ─── Convex mutations ───────────────────
    const updatePlanMut = useMutation(api.subscriptions.updatePlan);
    const cancelMut = useMutation(api.subscriptions.cancel);
    const reactivateMut = useMutation(api.subscriptions.reactivate);

    // ─── Dialog state ───────────────────────
    const [changePlanDialog, setChangePlanDialog] = useState<{
        open: boolean;
        subId: string;
        orgName: string;
        currentPlan: string;
    }>({ open: false, subId: "", orgName: "", currentPlan: "" });
    const [selectedPlan, setSelectedPlan] = useState("");
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: "cancel" | "reactivate";
        subId: string;
        orgName: string;
    }>({ open: false, type: "cancel", subId: "", orgName: "" });
    const [isProcessing, setIsProcessing] = useState(false);

    // ─── Org lookup map ─────────────────────
    const orgMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const org of organizations ?? []) {
            map.set(org._id, org.name ?? "Organisation inconnue");
        }
        return map;
    }, [organizations]);

    // ─── Enriched & filtered subscriptions ──
    const enrichedSubs = useMemo(() => {
        return (allSubscriptions ?? []).map((sub) => ({
            ...sub,
            orgName: orgMap.get(sub.organizationId) ?? "Organisation inconnue",
        }));
    }, [allSubscriptions, orgMap]);

    const filteredSubs = useMemo(() => {
        let subs = enrichedSubs;
        if (statusFilter !== "all") {
            subs = subs.filter((s) => s.status === statusFilter);
        }
        if (search) {
            const q = search.toLowerCase();
            subs = subs.filter(
                (s) =>
                    s.orgName.toLowerCase().includes(q) ||
                    s.plan.toLowerCase().includes(q)
            );
        }
        return subs;
    }, [enrichedSubs, statusFilter, search]);

    // ─── KPIs computed from real data ───────
    const kpis = useMemo(() => {
        const all = enrichedSubs;
        const active = all.filter((s) => s.status === "active" || s.status === "trial");
        const mrr = active.reduce((acc, s) => {
            const monthly = s.billingCycle === "annual"
                ? (s.pricePerUser * s.activeUsers) / 12
                : s.pricePerUser * s.activeUsers;
            return acc + monthly;
        }, 0);
        const churnCount = all.filter((s) => s.status === "cancelled").length;
        const churnRate = all.length > 0 ? (churnCount / all.length) * 100 : 0;

        return [
            { label: "MRR", value: formatXAF(mrr), suffix: "XAF", icon: TrendingUp, color: "from-emerald-600 to-green-500" },
            { label: "ARR", value: formatXAF(mrr * 12), suffix: "XAF", icon: CreditCard, color: "from-blue-600 to-cyan-500" },
            { label: "Abonnés actifs", value: String(active.length), suffix: "", icon: Users, color: "from-violet-600 to-purple-500" },
            { label: "Taux de churn", value: churnRate.toFixed(1), suffix: "%", icon: AlertCircle, color: "from-amber-600 to-orange-500" },
        ];
    }, [enrichedSubs]);

    // ─── Plan distribution ──────────────────
    const planDistribution = useMemo(() => {
        return Object.keys(PLAN_CONFIG).map((planKey) => {
            const count = enrichedSubs.filter((s) => s.plan === planKey).length;
            return { plan: planKey, count };
        });
    }, [enrichedSubs]);

    // ─── Status counts ──────────────────────
    const statusCounts = useMemo(() => {
        return {
            active: enrichedSubs.filter((s) => s.status === "active").length,
            trial: enrichedSubs.filter((s) => s.status === "trial").length,
            past_due: enrichedSubs.filter((s) => s.status === "past_due").length,
            cancelled: enrichedSubs.filter((s) => s.status === "cancelled").length,
        };
    }, [enrichedSubs]);

    // ─── Handlers ───────────────────────────
    const handleChangePlan = useCallback(async () => {
        if (!selectedPlan || selectedPlan === changePlanDialog.currentPlan) {
            toast.error("Sélectionnez un plan différent");
            return;
        }
        setIsProcessing(true);
        try {
            await updatePlanMut({
                id: changePlanDialog.subId as Id<"subscriptions">,
                plan: selectedPlan as "starter" | "pro" | "enterprise",
            });
            const direction = (PLAN_CONFIG[selectedPlan]?.price ?? 0) > (PLAN_CONFIG[changePlanDialog.currentPlan]?.price ?? 0)
                ? "Upgrade" : "Downgrade";
            toast.success(`${direction} effectué`, {
                description: `${changePlanDialog.orgName} : ${PLAN_CONFIG[changePlanDialog.currentPlan]?.label} → ${PLAN_CONFIG[selectedPlan]?.label}`,
            });
            setChangePlanDialog({ open: false, subId: "", orgName: "", currentPlan: "" });
            setSelectedPlan("");
        } catch (err) {
            toast.error("Erreur", { description: err instanceof Error ? err.message : "Veuillez réessayer" });
        } finally {
            setIsProcessing(false);
        }
    }, [selectedPlan, changePlanDialog, updatePlanMut]);

    const handleConfirmAction = useCallback(async () => {
        setIsProcessing(true);
        try {
            const id = confirmDialog.subId as Id<"subscriptions">;
            if (confirmDialog.type === "cancel") {
                await cancelMut({ id });
                toast.success("Abonnement annulé", { description: confirmDialog.orgName });
            } else {
                await reactivateMut({ id });
                toast.success("Abonnement réactivé", { description: confirmDialog.orgName });
            }
            setConfirmDialog({ open: false, type: "cancel", subId: "", orgName: "" });
        } catch (err) {
            toast.error("Erreur", { description: err instanceof Error ? err.message : "Veuillez réessayer" });
        } finally {
            setIsProcessing(false);
        }
    }, [confirmDialog, cancelMut, reactivateMut]);

    // ─── Loading State ──────────────────────
    if (allSubscriptions === undefined || organizations === undefined) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des abonnements...</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-violet-400" />
                    Abonnements DIGITALIUM
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {enrichedSubs.length} abonnement{enrichedSubs.length > 1 ? "s" : ""} ·{" "}
                    {statusCounts.active} actif{statusCounts.active > 1 ? "s" : ""}
                </p>
            </motion.div>

            {/* Revenue KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-4">
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-2`}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-bold">
                                {kpi.value}
                                <span className="text-xs text-muted-foreground ml-1">{kpi.suffix}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Plans Grid */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3">Plans disponibles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {planDistribution.map(({ plan, count }) => {
                        const conf = PLAN_CONFIG[plan];
                        if (!conf) return null;
                        const Icon = conf.icon;
                        return (
                            <div key={plan} className={`glass-card rounded-2xl p-5 relative overflow-hidden border ${conf.borderColor}`}>
                                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${conf.color} flex items-center justify-center mb-3`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="font-bold text-lg">{conf.label}</h3>
                                <div className="flex items-baseline gap-1 mt-1 mb-4">
                                    <span className="text-2xl font-bold">{conf.price.toLocaleString("fr-FR")}</span>
                                    <span className="text-xs text-muted-foreground">/mois</span>
                                </div>
                                <ul className="space-y-2 mb-4">
                                    {conf.features.map((f) => (
                                        <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Abonnés</span>
                                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                            {count}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Status Tabs + Search */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                statusFilter === tab.value
                                    ? "bg-white/10 text-white"
                                    : "text-muted-foreground hover:text-white/70"
                            }`}
                        >
                            {tab.label}
                            {tab.value !== "all" && (
                                <span className="ml-1 text-[9px] opacity-60">
                                    {statusCounts[tab.value as keyof typeof statusCounts] ?? 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par organisation ou plan..."
                        className="pl-9 h-9 text-xs border-white/10 bg-white/[0.03] focus:border-violet-500/30"
                    />
                </div>
            </motion.div>

            {/* Subscription List */}
            {filteredSubs.length === 0 ? (
                <motion.div variants={fadeUp} className="py-16 text-center">
                    <CreditCard className="h-10 w-10 text-white/10 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                        {search ? "Aucun abonnement trouvé pour cette recherche" : "Aucun abonnement pour ce filtre."}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={stagger} className="space-y-2">
                    {filteredSubs.map((sub) => {
                        const planConf = PLAN_CONFIG[sub.plan] ?? PLAN_CONFIG.starter;
                        const statusConf = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.active;
                        const PlanIcon = planConf.icon;
                        const daysLeft = Math.max(0, Math.ceil((sub.currentPeriodEnd - Date.now()) / (1000 * 60 * 60 * 24)));
                        const monthlyRevenue = sub.billingCycle === "annual"
                            ? (sub.pricePerUser * sub.activeUsers) / 12
                            : sub.pricePerUser * sub.activeUsers;

                        return (
                            <motion.div
                                key={sub._id}
                                variants={fadeUp}
                                className="group glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all"
                            >
                                {/* Plan Icon */}
                                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${planConf.color} flex items-center justify-center shrink-0`}>
                                    <PlanIcon className="h-5 w-5 text-white" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold truncate">{sub.orgName}</span>
                                        <Badge className={`text-[8px] py-0 border-0 ${statusConf.bg} ${statusConf.color}`}>
                                            {statusConf.label}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[8px] py-0 border-0 bg-white/5">
                                            {planConf.label}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[8px] py-0 border-0 bg-white/5">
                                            {sub.billingCycle === "annual" ? "Annuel" : "Mensuel"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-2.5 w-2.5" />
                                            {sub.activeUsers}/{sub.maxUsers} utilisateurs
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CreditCard className="h-2.5 w-2.5" />
                                            {formatXAF(monthlyRevenue)} XAF/mois
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {daysLeft}j restants
                                        </span>
                                        {/* Module badges */}
                                        <span className="flex items-center gap-1">
                                            {Object.entries(sub.modules).map(([mod, enabled]) => {
                                                if (!enabled) return null;
                                                const ModIcon = MODULE_ICONS[mod] ?? FileText;
                                                return (
                                                    <span key={mod} className="inline-flex items-center gap-0.5 bg-white/5 rounded px-1 py-0.5">
                                                        <ModIcon className="h-2 w-2" />
                                                        <span className="text-[8px]">{mod}</span>
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Revenue */}
                                <div className="text-right shrink-0 hidden sm:block">
                                    <p className="text-sm font-bold">{formatXAF(sub.pricePerUser * sub.activeUsers)}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        XAF/{sub.billingCycle === "annual" ? "an" : "mois"}
                                    </p>
                                </div>

                                {/* Actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground group-hover:text-white shrink-0"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        {sub.status !== "cancelled" && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setChangePlanDialog({
                                                            open: true,
                                                            subId: sub._id,
                                                            orgName: sub.orgName,
                                                            currentPlan: sub.plan,
                                                        });
                                                        setSelectedPlan(sub.plan);
                                                    }}
                                                >
                                                    <ArrowUpCircle className="h-3.5 w-3.5 mr-2" /> Changer de plan
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setConfirmDialog({
                                                            open: true,
                                                            type: "cancel",
                                                            subId: sub._id,
                                                            orgName: sub.orgName,
                                                        })
                                                    }
                                                    className="text-red-400 focus:text-red-400"
                                                >
                                                    <XCircle className="h-3.5 w-3.5 mr-2" /> Annuler l&apos;abonnement
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {sub.status === "cancelled" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setConfirmDialog({
                                                        open: true,
                                                        type: "reactivate",
                                                        subId: sub._id,
                                                        orgName: sub.orgName,
                                                    })
                                                }
                                                className="text-emerald-400 focus:text-emerald-400"
                                            >
                                                <PlayCircle className="h-3.5 w-3.5 mr-2" /> Réactiver
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Change Plan Dialog */}
            <Dialog
                open={changePlanDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setChangePlanDialog({ open: false, subId: "", orgName: "", currentPlan: "" });
                        setSelectedPlan("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-md border-white/10 bg-black/95">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <ArrowUpCircle className="h-5 w-5 text-violet-400" />
                            Changer de plan
                        </DialogTitle>
                        <DialogDescription>
                            Modifier le plan pour <strong>{changePlanDialog.orgName}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <p className="text-xs text-white/60 mb-2">Plan actuel : <strong>{PLAN_CONFIG[changePlanDialog.currentPlan]?.label}</strong></p>
                            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm">
                                    <SelectValue placeholder="Sélectionnez un plan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PLAN_CONFIG).map(([key, conf]) => (
                                        <SelectItem key={key} value={key} disabled={key === changePlanDialog.currentPlan}>
                                            {conf.label} — {conf.price.toLocaleString("fr-FR")} XAF/mois
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedPlan && selectedPlan !== changePlanDialog.currentPlan && (
                            <div className={`rounded-lg border p-3 text-xs ${
                                (PLAN_CONFIG[selectedPlan]?.price ?? 0) > (PLAN_CONFIG[changePlanDialog.currentPlan]?.price ?? 0)
                                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                                    : "border-amber-500/20 bg-amber-500/5 text-amber-300"
                            }`}>
                                <p className="font-medium flex items-center gap-1">
                                    {(PLAN_CONFIG[selectedPlan]?.price ?? 0) > (PLAN_CONFIG[changePlanDialog.currentPlan]?.price ?? 0)
                                        ? <><ArrowUpRight className="h-3 w-3" /> Upgrade</>
                                        : <><ArrowDownRight className="h-3 w-3" /> Downgrade</>
                                    }
                                </p>
                                <p className="mt-1 opacity-80">
                                    {PLAN_CONFIG[changePlanDialog.currentPlan]?.label} ({PLAN_CONFIG[changePlanDialog.currentPlan]?.price.toLocaleString("fr-FR")} XAF)
                                    {" → "}
                                    {PLAN_CONFIG[selectedPlan]?.label} ({PLAN_CONFIG[selectedPlan]?.price.toLocaleString("fr-FR")} XAF)
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setChangePlanDialog({ open: false, subId: "", orgName: "", currentPlan: "" });
                                    setSelectedPlan("");
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 gap-1.5"
                                onClick={handleChangePlan}
                                disabled={isProcessing || !selectedPlan || selectedPlan === changePlanDialog.currentPlan}
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                Confirmer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Cancel / Reactivate Dialog */}
            <Dialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) setConfirmDialog({ open: false, type: "cancel", subId: "", orgName: "" });
                }}
            >
                <DialogContent className="sm:max-w-md border-white/10 bg-black/95">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            {confirmDialog.type === "cancel" ? (
                                <>
                                    <XCircle className="h-5 w-5 text-red-400" />
                                    Annuler l&apos;abonnement
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="h-5 w-5 text-emerald-400" />
                                    Réactiver l&apos;abonnement
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmDialog.type === "cancel"
                                ? `Voulez-vous annuler l'abonnement de "${confirmDialog.orgName}" ? L'accès aux modules sera désactivé.`
                                : `Voulez-vous réactiver l'abonnement de "${confirmDialog.orgName}" ? Une nouvelle période de facturation sera créée.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDialog({ open: false, type: "cancel", subId: "", orgName: "" })}
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className={
                                confirmDialog.type === "cancel"
                                    ? "bg-gradient-to-r from-red-600 to-rose-500 text-white border-0 gap-1.5"
                                    : "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-0 gap-1.5"
                            }
                            onClick={handleConfirmAction}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : confirmDialog.type === "cancel" ? (
                                <XCircle className="h-3.5 w-3.5" />
                            ) : (
                                <PlayCircle className="h-3.5 w-3.5" />
                            )}
                            {confirmDialog.type === "cancel" ? "Confirmer l'annulation" : "Réactiver"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

/* ─── Helpers ─────────────────────────────────────── */

function formatXAF(amount: number): string {
    if (amount >= 1_000_000) {
        return (amount / 1_000_000).toFixed(1) + "M";
    }
    if (amount >= 1_000) {
        return Math.round(amount / 1_000) + "K";
    }
    return String(Math.round(amount));
}
