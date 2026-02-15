// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Clients
// Organisation activée = Client (pas de duplication)
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    UserCircle,
    Search,
    Users,
    TrendingUp,
    CreditCard,
    UserPlus,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Sparkles,
    Loader2,
    Plus,
    MoreHorizontal,
    Eye,
    PauseCircle,
    PlayCircle,
    XCircle,
    ShieldAlert,
    AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    enterprise: { label: "Entreprise", color: "text-blue-400", bg: "bg-blue-500/15" },
    institution: { label: "Institution", color: "text-emerald-400", bg: "bg-emerald-500/15" },
    government: { label: "Administration", color: "text-violet-400", bg: "bg-violet-500/15" },
    organism: { label: "Organisme", color: "text-amber-400", bg: "bg-amber-500/15" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
    suspended: { label: "Suspendu", color: "text-amber-400", bg: "bg-amber-500/15", icon: PauseCircle },
    resiliee: { label: "Résilié", color: "text-red-400", bg: "bg-red-500/15", icon: XCircle },
};

type StatusFilter = "all" | "active" | "suspended" | "resiliee";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "suspended", label: "Suspendus" },
    { value: "resiliee", label: "Résiliés" },
];

/* ═══════════════════════════════════════════════
   CLIENTS PAGE  
   Clients = Organizations with status "active"/"suspended"/"resiliee" 
   ═══════════════════════════════════════════════ */

export default function ClientsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // ─── Convex queries ─────────────────────
    const clients = useQuery(api.clients.listClients, { statusFilter });
    const stats = useQuery(api.clients.getClientStats);
    const preteOrgs = useQuery(api.organizations.list, { status: "prete" });
    const activateOrg = useMutation(api.organizations.activate);
    const suspendClientMut = useMutation(api.clients.suspendClient);
    const terminateClientMut = useMutation(api.clients.terminateClient);
    const reactivateClientMut = useMutation(api.clients.reactivateClient);

    // ─── Dialog state ───────────────────────
    const [showActivateDialog, setShowActivateDialog] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");
    const [isActivating, setIsActivating] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: "suspend" | "terminate" | "reactivate";
        orgId: string;
        orgName: string;
    }>({ open: false, type: "suspend", orgId: "", orgName: "" });
    const [isProcessing, setIsProcessing] = useState(false);

    // ─── Derived data ───────────────────────
    const loading = clients === undefined;
    const clientList = clients ?? [];

    const filteredClients = clientList.filter(
        (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.type?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.sector?.toLowerCase().includes(search.toLowerCase())
    );

    // ─── Dynamic KPIs ───────────────────────
    const KPIS = [
        { label: "Total Clients", value: String(stats?.total ?? 0), icon: Users, color: "from-blue-600 to-cyan-500" },
        { label: "Prêts à activer", value: String(stats?.prete ?? 0), icon: TrendingUp, color: "from-violet-600 to-purple-500" },
        { label: "Actifs", value: String(stats?.active ?? 0), icon: CreditCard, color: "from-emerald-600 to-green-500" },
        { label: "Nouveaux ce mois", value: String(stats?.newThisMonth ?? 0), icon: UserPlus, color: "from-amber-600 to-orange-500" },
    ];

    // ─── Handlers ───────────────────────────
    const handleActivate = useCallback(async () => {
        if (!selectedOrgId) {
            toast.error("Sélectionnez une organisation");
            return;
        }
        setIsActivating(true);
        try {
            await activateOrg({ id: selectedOrgId as Id<"organizations"> });
            toast.success("Client activé", { description: "L'organisation est maintenant un client actif" });
            setSelectedOrgId("");
            setShowActivateDialog(false);
        } catch (err) {
            toast.error("Erreur lors de l'activation", {
                description: err instanceof Error ? err.message : "Veuillez réessayer",
            });
        } finally {
            setIsActivating(false);
        }
    }, [selectedOrgId, activateOrg]);

    const handleConfirmAction = useCallback(async () => {
        setIsProcessing(true);
        try {
            const id = confirmDialog.orgId as Id<"organizations">;
            switch (confirmDialog.type) {
                case "suspend":
                    await suspendClientMut({ id });
                    toast.success("Client suspendu", { description: `${confirmDialog.orgName} a été suspendu` });
                    break;
                case "reactivate":
                    await reactivateClientMut({ id });
                    toast.success("Client réactivé", { description: `${confirmDialog.orgName} est de nouveau actif` });
                    break;
                case "terminate":
                    await terminateClientMut({ id });
                    toast.success("Client résilié", { description: `${confirmDialog.orgName} a été résilié` });
                    break;
            }
            setConfirmDialog({ open: false, type: "suspend", orgId: "", orgName: "" });
        } catch (err) {
            toast.error("Erreur", {
                description: err instanceof Error ? err.message : "Veuillez réessayer",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [confirmDialog, suspendClientMut, reactivateClientMut, terminateClientMut]);

    // ─── Loading State ──────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des clients…</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-blue-400" />
                        Clients
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {stats?.total ?? 0} client{(stats?.total ?? 0) > 1 ? "s" : ""} · {stats?.active ?? 0} actif{(stats?.active ?? 0) > 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-white/10 hover:bg-white/5"
                        onClick={() => router.push("/admin/clients/new")}
                    >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Nouveau Client
                    </Button>
                    <Button
                        onClick={() => setShowActivateDialog(true)}
                        disabled={!preteOrgs || preteOrgs.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"
                    >
                        <Plus className="h-3.5 w-3.5" /> Activer un Client
                    </Button>
                </div>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {KPIS.map((kpi) => {
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

            {/* Status Tabs + Search */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Status filter tabs */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${statusFilter === tab.value
                                    ? "bg-white/10 text-white"
                                    : "text-muted-foreground hover:text-white/70"
                                }`}
                        >
                            {tab.label}
                            {tab.value !== "all" && stats && (
                                <span className="ml-1 text-[9px] opacity-60">
                                    {tab.value === "active" ? stats.active : tab.value === "suspended" ? stats.suspended : stats.resiliee}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un client…"
                        className="pl-9 h-9 text-xs border-white/10 bg-white/[0.03] focus:border-violet-500/30"
                    />
                </div>
            </motion.div>

            {/* Client List */}
            {filteredClients.length === 0 ? (
                <motion.div variants={fadeUp} className="py-16 text-center">
                    <Building2 className="h-10 w-10 text-white/10 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                        {search ? "Aucun client trouvé pour cette recherche" : "Aucun client pour ce filtre. Activez une organisation prête pour qu'elle devienne client."}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={stagger} className="space-y-2">
                    {filteredClients.map((org) => {
                        const typeConf = TYPE_CONFIG[org.type ?? "enterprise"] ?? TYPE_CONFIG.enterprise;
                        const statusConf = STATUS_CONFIG[org.status] ?? STATUS_CONFIG.active;
                        const StatusIcon = statusConf.icon;
                        return (
                            <motion.div
                                key={org._id}
                                variants={fadeUp}
                                className="group glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all"
                            >
                                {/* Avatar */}
                                <div
                                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${org.status === "active"
                                            ? "from-blue-600 to-violet-500"
                                            : org.status === "suspended"
                                                ? "from-amber-600 to-orange-500"
                                                : "from-red-600 to-rose-500"
                                        } flex items-center justify-center shrink-0`}
                                >
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/admin/clients/${org._id}`)}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold truncate">{org.name}</span>
                                        <Badge className={`text-[8px] py-0 border-0 ${typeConf.bg} ${typeConf.color}`}>
                                            {typeConf.label}
                                        </Badge>
                                        <Badge className={`text-[8px] py-0 border-0 ${statusConf.bg} ${statusConf.color}`}>
                                            <StatusIcon className="h-2 w-2 mr-0.5" />
                                            {statusConf.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                        {org.email && (
                                            <span className="flex items-center gap-1">
                                                <Sparkles className="h-2.5 w-2.5" />
                                                {org.email}
                                            </span>
                                        )}
                                        {org.sector && (
                                            <span>{org.sector}</span>
                                        )}
                                        {org.ville && (
                                            <span>{org.ville}</span>
                                        )}
                                        {org.createdAt && (
                                            <span>Depuis le {new Date(org.createdAt).toLocaleDateString("fr-FR")}</span>
                                        )}
                                    </div>
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
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/clients/${org._id}`)}>
                                            <Eye className="h-3.5 w-3.5 mr-2" /> Voir le détail
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {org.status === "active" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setConfirmDialog({
                                                        open: true,
                                                        type: "suspend",
                                                        orgId: org._id,
                                                        orgName: org.name,
                                                    })
                                                }
                                                className="text-amber-400 focus:text-amber-400"
                                            >
                                                <PauseCircle className="h-3.5 w-3.5 mr-2" /> Suspendre
                                            </DropdownMenuItem>
                                        )}
                                        {org.status === "suspended" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setConfirmDialog({
                                                        open: true,
                                                        type: "reactivate",
                                                        orgId: org._id,
                                                        orgName: org.name,
                                                    })
                                                }
                                                className="text-emerald-400 focus:text-emerald-400"
                                            >
                                                <PlayCircle className="h-3.5 w-3.5 mr-2" /> Réactiver
                                            </DropdownMenuItem>
                                        )}
                                        {(org.status === "active" || org.status === "suspended") && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setConfirmDialog({
                                                        open: true,
                                                        type: "terminate",
                                                        orgId: org._id,
                                                        orgName: org.name,
                                                    })
                                                }
                                                className="text-red-400 focus:text-red-400"
                                            >
                                                <XCircle className="h-3.5 w-3.5 mr-2" /> Résilier
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Activate Dialog */}
            <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
                <DialogContent className="sm:max-w-md border-white/10 bg-black/95">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            Activer un Client
                        </DialogTitle>
                        <DialogDescription>
                            Sélectionnez une organisation prête et activez-la pour qu&apos;elle devienne un client.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="text-xs text-white/60">Organisation prête</Label>
                            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                                <SelectTrigger className="mt-1 border-white/10 bg-white/[0.03] text-sm">
                                    <SelectValue placeholder="Sélectionner une organisation…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(preteOrgs ?? []).map((org) => (
                                        <SelectItem key={org._id} value={org._id}>
                                            {org.name ?? "Sans nom"} ({org.type ?? "—"})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrgId && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                                <p className="font-medium">Cette action va :</p>
                                <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-emerald-300/70">
                                    <li>Passer le statut de l&apos;organisation à &quot;active&quot;</li>
                                    <li>L&apos;organisation apparaîtra comme client actif</li>
                                    <li>Les modules configurés seront déployés</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowActivateDialog(false)}>
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-emerald-600 to-green-500 text-white border-0 gap-1.5"
                                onClick={handleActivate}
                                disabled={isActivating || !selectedOrgId}
                            >
                                {isActivating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Activer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) setConfirmDialog({ open: false, type: "suspend", orgId: "", orgName: "" });
                }}
            >
                <DialogContent className="sm:max-w-md border-white/10 bg-black/95">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            {confirmDialog.type === "suspend" && (
                                <>
                                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                                    Suspendre le client
                                </>
                            )}
                            {confirmDialog.type === "reactivate" && (
                                <>
                                    <PlayCircle className="h-5 w-5 text-emerald-400" />
                                    Réactiver le client
                                </>
                            )}
                            {confirmDialog.type === "terminate" && (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                    Résilier le client
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmDialog.type === "suspend" &&
                                `Voulez-vous suspendre "${confirmDialog.orgName}" ? L'accès aux modules sera désactivé.`}
                            {confirmDialog.type === "reactivate" &&
                                `Voulez-vous réactiver "${confirmDialog.orgName}" ? L'accès aux modules sera restauré.`}
                            {confirmDialog.type === "terminate" &&
                                `Voulez-vous résilier "${confirmDialog.orgName}" ? Cette action est irréversible.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDialog({ open: false, type: "suspend", orgId: "", orgName: "" })}
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className={
                                confirmDialog.type === "suspend"
                                    ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white border-0 gap-1.5"
                                    : confirmDialog.type === "reactivate"
                                        ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-0 gap-1.5"
                                        : "bg-gradient-to-r from-red-600 to-rose-500 text-white border-0 gap-1.5"
                            }
                            onClick={handleConfirmAction}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : confirmDialog.type === "suspend" ? (
                                <PauseCircle className="h-3.5 w-3.5" />
                            ) : confirmDialog.type === "reactivate" ? (
                                <PlayCircle className="h-3.5 w-3.5" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5" />
                            )}
                            {confirmDialog.type === "suspend" ? "Suspendre" : confirmDialog.type === "reactivate" ? "Réactiver" : "Résilier"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
