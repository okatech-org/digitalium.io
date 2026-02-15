// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Client Detail
// Fiche détail d'un client (organisation active/suspended/resiliee)
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Users,
    CreditCard,
    Mail,
    Phone,
    MapPin,
    Globe,
    CheckCircle2,
    PauseCircle,
    PlayCircle,
    XCircle,
    Loader2,
    ShieldAlert,
    AlertTriangle,
    FileText,
    Package,
    Calendar,
    Hash,
    UserCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; gradient: string; icon: React.ElementType }> = {
    active: { label: "Actif", color: "text-emerald-400", bg: "bg-emerald-500/15", gradient: "from-emerald-600 to-green-500", icon: CheckCircle2 },
    suspended: { label: "Suspendu", color: "text-amber-400", bg: "bg-amber-500/15", gradient: "from-amber-600 to-orange-500", icon: PauseCircle },
    resiliee: { label: "Résilié", color: "text-red-400", bg: "bg-red-500/15", gradient: "from-red-600 to-rose-500", icon: XCircle },
};

const MODULE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    iDocument: { label: "iDocument", color: "text-blue-300", bg: "bg-blue-500/15" },
    iArchive: { label: "iArchive", color: "text-emerald-300", bg: "bg-emerald-500/15" },
    iSignature: { label: "iSignature", color: "text-violet-300", bg: "bg-violet-500/15" },
    iAsted: { label: "iAsted", color: "text-orange-300", bg: "bg-orange-500/15" },
};

const PLAN_LABELS: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
};

const ROLE_LABELS: Record<string, string> = {
    system_admin: "Admin Système",
    platform_admin: "Admin Plateforme",
    org_admin: "Admin Organisation",
    org_manager: "Manager",
    org_member: "Membre",
    org_viewer: "Observateur",
};

/* ═══════════════════════════════════════════════
   CLIENT DETAIL PAGE
   ═══════════════════════════════════════════════ */

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    // ─── Convex queries ─────────────────────
    const client = useQuery(api.clients.getClientById, {
        id: clientId as Id<"organizations">,
    });

    const suspendClientMut = useMutation(api.clients.suspendClient);
    const reactivateClientMut = useMutation(api.clients.reactivateClient);
    const terminateClientMut = useMutation(api.clients.terminateClient);

    // ─── Dialog state ───────────────────────
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: "suspend" | "terminate" | "reactivate";
    }>({ open: false, type: "suspend" });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirmAction = useCallback(async () => {
        if (!client) return;
        setIsProcessing(true);
        try {
            const id = client._id;
            switch (confirmDialog.type) {
                case "suspend":
                    await suspendClientMut({ id });
                    toast.success("Client suspendu", { description: `${client.name} a été suspendu` });
                    break;
                case "reactivate":
                    await reactivateClientMut({ id });
                    toast.success("Client réactivé", { description: `${client.name} est de nouveau actif` });
                    break;
                case "terminate":
                    await terminateClientMut({ id });
                    toast.success("Client résilié", { description: `${client.name} a été résilié` });
                    break;
            }
            setConfirmDialog({ open: false, type: "suspend" });
        } catch (err) {
            toast.error("Erreur", {
                description: err instanceof Error ? err.message : "Veuillez réessayer",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [client, confirmDialog, suspendClientMut, reactivateClientMut, terminateClientMut]);

    // ─── Loading State ──────────────────────
    if (client === undefined) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement du client…</span>
            </div>
        );
    }

    if (client === null) {
        return (
            <div className="py-16 text-center">
                <Building2 className="h-10 w-10 text-white/10 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Client introuvable</p>
                <Link href="/admin/clients">
                    <Button variant="ghost" size="sm" className="mt-4">
                        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Retour aux clients
                    </Button>
                </Link>
            </div>
        );
    }

    const statusConf = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.active;
    const typeConf = TYPE_CONFIG[client.type ?? "enterprise"] ?? TYPE_CONFIG.enterprise;
    const StatusIcon = statusConf.icon;
    const modules = client.quota?.modules ?? [];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Back + Header */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
                <Link href="/admin/clients">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div
                            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${statusConf.gradient} flex items-center justify-center`}
                        >
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{client.name}</h1>
                                <Badge className={`text-[9px] py-0 border-0 ${typeConf.bg} ${typeConf.color}`}>
                                    {typeConf.label}
                                </Badge>
                                <Badge className={`text-[9px] py-0 border-0 ${statusConf.bg} ${statusConf.color}`}>
                                    <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                    {statusConf.label}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Client depuis le {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                                {client.sector && ` · ${client.sector}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    {client.status === "active" && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            onClick={() => setConfirmDialog({ open: true, type: "suspend" })}
                        >
                            <PauseCircle className="h-3.5 w-3.5 mr-1.5" /> Suspendre
                        </Button>
                    )}
                    {client.status === "suspended" && (
                        <Button
                            size="sm"
                            className="text-xs h-8 bg-gradient-to-r from-emerald-600 to-green-500 text-white border-0"
                            onClick={() => setConfirmDialog({ open: true, type: "reactivate" })}
                        >
                            <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Réactiver
                        </Button>
                    )}
                    {(client.status === "active" || client.status === "suspended") && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => setConfirmDialog({ open: true, type: "terminate" })}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Résilier
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Informations */}
                <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
                    {/* Contact Info Card */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-400" />
                            Informations
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {client.contact && (
                                <InfoItem icon={UserCircle} label="Contact" value={client.contact} />
                            )}
                            {client.email && (
                                <InfoItem icon={Mail} label="Email" value={client.email} />
                            )}
                            {client.telephone && (
                                <InfoItem icon={Phone} label="Téléphone" value={client.telephone} />
                            )}
                            {client.adresse && (
                                <InfoItem icon={MapPin} label="Adresse" value={client.adresse} />
                            )}
                            {client.ville && (
                                <InfoItem icon={Globe} label="Ville / Pays" value={`${client.ville}${client.pays ? `, ${client.pays}` : ""}`} />
                            )}
                            {client.rccm && (
                                <InfoItem icon={Hash} label="RCCM" value={client.rccm} />
                            )}
                            {client.nif && (
                                <InfoItem icon={FileText} label="NIF" value={client.nif} />
                            )}
                            {client.description && (
                                <div className="sm:col-span-2">
                                    <InfoItem icon={FileText} label="Description" value={client.description} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Members Card */}
                    <div className="glass-card rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-violet-400" />
                                Membres
                            </h2>
                            <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                                {client.memberCount} membre{client.memberCount > 1 ? "s" : ""}
                            </Badge>
                        </div>

                        {client.members.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">Aucun membre</p>
                        ) : (
                            <div className="space-y-2">
                                {client.members.map((member) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {(member.nom ?? member.email ?? "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate">
                                                {member.nom ?? member.email ?? member.userId}
                                            </p>
                                            {member.poste && (
                                                <p className="text-[10px] text-muted-foreground">{member.poste}</p>
                                            )}
                                        </div>
                                        <Badge className="text-[8px] py-0 border-0 bg-white/5 text-muted-foreground">
                                            {ROLE_LABELS[member.role] ?? member.role}
                                        </Badge>
                                        <Badge
                                            className={`text-[8px] py-0 border-0 ${member.status === "active"
                                                    ? "bg-emerald-500/15 text-emerald-400"
                                                    : member.status === "invited"
                                                        ? "bg-blue-500/15 text-blue-400"
                                                        : "bg-red-500/15 text-red-400"
                                                }`}
                                        >
                                            {member.status === "active" ? "Actif" : member.status === "invited" ? "Invité" : "Suspendu"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right sidebar */}
                <motion.div variants={fadeUp} className="space-y-4">
                    {/* Modules Card */}
                    <div className="glass-card rounded-xl p-5">
                        <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <Package className="h-4 w-4 text-emerald-400" />
                            Modules activés
                        </h2>
                        <div className="space-y-2">
                            {modules.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Aucun module</p>
                            ) : (
                                modules.map((mod) => {
                                    const modConf = MODULE_CONFIG[mod];
                                    return (
                                        <div
                                            key={mod}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                                        >
                                            <div className={`h-7 w-7 rounded-md ${modConf?.bg ?? "bg-white/5"} flex items-center justify-center`}>
                                                <Package className={`h-3.5 w-3.5 ${modConf?.color ?? "text-muted-foreground"}`} />
                                            </div>
                                            <span className="text-xs font-medium">{modConf?.label ?? mod}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Subscription Card */}
                    <div className="glass-card rounded-xl p-5">
                        <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <CreditCard className="h-4 w-4 text-blue-400" />
                            Abonnement
                        </h2>
                        {client.subscription ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Plan</span>
                                    <Badge className="text-[9px] py-0 border-0 bg-blue-500/15 text-blue-400">
                                        {PLAN_LABELS[client.subscription.plan] ?? client.subscription.plan}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Cycle</span>
                                    <span className="text-xs font-medium">
                                        {client.subscription.billingCycle === "monthly" ? "Mensuel" : "Annuel"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Statut</span>
                                    <Badge
                                        className={`text-[9px] py-0 border-0 ${client.subscription.status === "active"
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : client.subscription.status === "trial"
                                                    ? "bg-blue-500/15 text-blue-400"
                                                    : "bg-red-500/15 text-red-400"
                                            }`}
                                    >
                                        {client.subscription.status === "active" ? "Actif" : client.subscription.status === "trial" ? "Essai" : client.subscription.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Utilisateurs</span>
                                    <span className="text-xs font-medium">
                                        {client.subscription.activeUsers} / {client.subscription.maxUsers}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Fin période</span>
                                    <span className="text-xs font-medium">
                                        {new Date(client.subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground py-2">Aucun abonnement actif</p>
                        )}
                    </div>

                    {/* Quota Card */}
                    <div className="glass-card rounded-xl p-5">
                        <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-amber-400" />
                            Quotas
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Max utilisateurs</span>
                                <span className="text-xs font-medium">{client.quota?.maxUsers ?? "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Stockage max</span>
                                <span className="text-xs font-medium">
                                    {client.quota?.maxStorage
                                        ? `${(client.quota.maxStorage / (1024 * 1024 * 1024)).toFixed(0)} Go`
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Confirm Action Dialog */}
            <Dialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) setConfirmDialog({ open: false, type: "suspend" });
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
                                `Voulez-vous suspendre "${client.name}" ? L'accès aux modules sera désactivé.`}
                            {confirmDialog.type === "reactivate" &&
                                `Voulez-vous réactiver "${client.name}" ? L'accès aux modules sera restauré.`}
                            {confirmDialog.type === "terminate" &&
                                `Voulez-vous résilier "${client.name}" ? Cette action est irréversible.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-2 mt-4">
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDialog({ open: false, type: "suspend" })}>
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

/* ─── Helper Components ───────────────────────── */

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-md bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-xs font-medium">{value}</p>
            </div>
        </div>
    );
}
