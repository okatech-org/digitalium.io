// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Fiche Organisation (v2)
// 6 onglets indépendants + bandeau progression
// Données réelles Convex (pas de mock)
// ═══════════════════════════════════════════════

"use client";

import React, { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
    Building,
    ArrowLeft,
    UserCircle,
    Network,
    FolderTree,
    Package,
    Zap,
    Server,
    Loader2,
    ChevronDown,
    Play,
    Pause,
    Clock,
    XCircle,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { useOrgLifecycle } from "@/hooks/useOrgLifecycle";
import {
    ProgressBanner,
    ProfilTab,
    StructureOrgTab,
    ClassementTab,
    ModulesConfigTab,
    AutomationTab,
    DeployTab,
} from "@/components/admin/org-detail";

import {
    ORG_STATUS_LABELS,
    ORG_STATUS_COLORS,
} from "@/types/org-structure";
import type { OrgStatus } from "@/types/org-structure";

/* ─── Animations ─── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Tab config ─── */

const TABS = [
    { value: "profil", label: "Profil", icon: UserCircle },
    { value: "structure-org", label: "Structure Org", icon: Network },
    { value: "structure-classement", label: "Classement", icon: FolderTree },
    { value: "modules", label: "Modules", icon: Package },
    { value: "automation", label: "Automatisation", icon: Zap },
    { value: "deployment", label: "Déploiement", icon: Server },
];

/* ─── Status transitions config ─── */

type StatusTransition = {
    target: OrgStatus;
    label: string;
    icon: React.ElementType;
    color: string;
    destructive?: boolean;
    needsConfirm?: boolean;
};

const STATUS_TRANSITIONS: Record<OrgStatus, StatusTransition[]> = {
    brouillon: [
        { target: "prete", label: "Marquer Prête", icon: CheckCircle2, color: "text-blue-400" },
        { target: "trial", label: "Démarrer un essai", icon: Clock, color: "text-amber-400" },
    ],
    prete: [
        { target: "active", label: "Activer", icon: Play, color: "text-emerald-400" },
        { target: "trial", label: "Démarrer un essai", icon: Clock, color: "text-amber-400" },
    ],
    active: [
        { target: "trial", label: "Passer en essai", icon: Clock, color: "text-amber-400" },
        { target: "suspended", label: "Suspendre", icon: Pause, color: "text-orange-400", destructive: true, needsConfirm: true },
    ],
    trial: [
        { target: "active", label: "Activer (fin d'essai)", icon: Play, color: "text-emerald-400" },
        { target: "suspended", label: "Suspendre", icon: Pause, color: "text-orange-400", destructive: true, needsConfirm: true },
    ],
    suspended: [
        { target: "active", label: "Réactiver", icon: Play, color: "text-emerald-400" },
        { target: "resiliee", label: "Résilier", icon: XCircle, color: "text-red-400", destructive: true, needsConfirm: true },
    ],
    resiliee: [],
};

/* ═══════════════════════════════════════════════
   INNER COMPONENT
   ═══════════════════════════════════════════════ */

function OrganizationDetailInner() {
    const params = useParams();
    const rawId = params.id as string;
    const orgId = rawId as Id<"organizations">;

    const [activeTab, setActiveTab] = useState("profil");
    const [confirmAction, setConfirmAction] = useState<StatusTransition | null>(null);

    // ─── Data from Convex ───
    const orgData = useQuery(api.organizations.getById, { id: orgId });

    // ─── Lifecycle hook ───
    const lifecycle = useOrgLifecycle(orgId);

    // ─── Mutations ───
    const updateConfig = useMutation(api.organizations.updateConfig);
    const updateHosting = useMutation(api.organizations.updateHosting);
    const updateStatusMut = useMutation(api.organizations.updateStatus);

    // ─── Status transition handler ───
    const handleStatusTransition = useCallback(async (transition: StatusTransition) => {
        try {
            if (transition.target === "trial") {
                await lifecycle.startTrial(14);
                toast.success("Essai démarré", {
                    description: "L'organisation est en période d'essai de 14 jours.",
                });
            } else if (transition.target === "active") {
                const currentStatus = (orgData?.status ?? "active") as OrgStatus;
                if (currentStatus === "suspended") {
                    await updateStatusMut({ id: orgId, status: "active" });
                } else {
                    await lifecycle.activate();
                }
                toast.success("Organisation activée");
            } else if (transition.target === "prete") {
                await lifecycle.markAsReady();
                toast.success("Organisation marquée comme prête", {
                    description: "Elle peut maintenant être activée.",
                });
            } else if (transition.target === "suspended") {
                await lifecycle.suspend();
                toast.success("Organisation suspendue");
            } else if (transition.target === "resiliee") {
                await lifecycle.terminate();
                toast.success("Organisation résiliée", {
                    description: "L'accès est définitivement coupé.",
                });
            }
        } catch (err) {
            toast.error("Échec de la transition", {
                description: err instanceof Error ? err.message : "Veuillez réessayer.",
            });
        }
    }, [lifecycle, orgData?.status, orgId, updateStatusMut]);

    // ─── Loading state ───
    if (orgData === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (orgData === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-sm text-muted-foreground">Organisation introuvable</p>
                <Link href="/admin/organizations">
                    <Button variant="ghost" className="gap-2 text-xs">
                        <ArrowLeft className="h-4 w-4" /> Retour
                    </Button>
                </Link>
            </div>
        );
    }

    const org = orgData;
    const status = (org.status ?? "active") as OrgStatus;
    const statusColors = ORG_STATUS_COLORS[status] ?? ORG_STATUS_COLORS.active;
    const statusLabel = ORG_STATUS_LABELS[status] ?? status;
    const transitions = STATUS_TRANSITIONS[status] ?? [];

    // Trial info
    const trialEndsAt = (org as any).trialEndsAt as number | undefined;
    const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    // Active modules from quota
    const activeModules: string[] = org.quota?.modules ?? [];

    // ─── Handlers ───
    const handleSaveConfig = async (config: Record<string, unknown>) => {
        try {
            await updateConfig({ id: orgId, config });
            toast.success("Configuration sauvegardée");
        } catch (err) {
            toast.error("Erreur lors de la sauvegarde", {
                description: err instanceof Error ? err.message : "Veuillez réessayer.",
            });
        }
    };

    const handleSaveHosting = async (hosting: { type: string; types?: string[]; domain?: string; pagePublique?: boolean }) => {
        try {
            await updateHosting({
                id: orgId,
                hosting: {
                    type: hosting.type as "cloud" | "datacenter" | "local",
                    types: (hosting.types ?? [hosting.type]) as ("cloud" | "datacenter" | "local")[],
                    domain: hosting.domain,
                    pagePublique: hosting.pagePublique,
                },
            });
            toast.success("Hébergement mis à jour");
        } catch (err) {
            toast.error("Erreur lors de la sauvegarde", {
                description: err instanceof Error ? err.message : "Veuillez réessayer.",
            });
        }
    };

    /* ─── RENDER ─── */
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* ─── Header ─── */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/organizations">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Building className="h-6 w-6 text-violet-400" />
                            {org.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {org.type && (
                                <Badge variant="secondary" className="text-[9px] bg-white/5 border-0 capitalize">
                                    {org.type}
                                </Badge>
                            )}
                            {org.sector && (
                                <Badge variant="secondary" className="text-[9px] bg-blue-500/15 text-blue-300 border-0">
                                    {org.sector}
                                </Badge>
                            )}

                            {/* ─── Status Dropdown ─── */}
                            {transitions.length > 0 ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium cursor-pointer transition-all hover:ring-1 hover:ring-white/20 ${statusColors.bg} ${statusColors.text}`}>
                                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                                            {statusLabel}
                                            {status === "trial" && trialDaysLeft !== null && (
                                                <span className="ml-0.5 opacity-70">({trialDaysLeft}j)</span>
                                            )}
                                            <ChevronDown className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="bg-zinc-900 border-white/10 min-w-[200px]">
                                        <div className="px-3 py-1.5 text-[10px] text-white/40 font-medium uppercase tracking-wide">
                                            Changer le statut
                                        </div>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        {transitions.map((t) => {
                                            const Icon = t.icon;
                                            return (
                                                <DropdownMenuItem
                                                    key={t.target}
                                                    className={`gap-2 text-xs cursor-pointer ${t.destructive ? "text-red-400 focus:text-red-300" : ""}`}
                                                    onClick={() => {
                                                        if (t.needsConfirm) {
                                                            setConfirmAction(t);
                                                        } else {
                                                            handleStatusTransition(t);
                                                        }
                                                    }}
                                                >
                                                    <Icon className={`h-3.5 w-3.5 ${t.color}`} />
                                                    {t.label}
                                                    {t.target === "trial" && (
                                                        <span className="ml-auto text-[10px] text-white/30">14 jours</span>
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Badge
                                    variant="secondary"
                                    className={`text-[9px] border-0 ${statusColors.bg} ${statusColors.text}`}
                                >
                                    <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${statusColors.dot}`} />
                                    {statusLabel}
                                </Badge>
                            )}

                            {/* Trial countdown badge */}
                            {status === "trial" && trialDaysLeft !== null && (
                                <Badge variant="secondary" className={`text-[9px] border-0 ${trialDaysLeft <= 3 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                                    <Clock className="h-2.5 w-2.5 mr-1" />
                                    {trialDaysLeft > 0 ? `${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""} restant${trialDaysLeft > 1 ? "s" : ""}` : "Essai expiré"}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Confirmation Dialog ─── */}
            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent className="bg-zinc-900 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                            Confirmer le changement de statut
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            {confirmAction?.target === "suspended" && (
                                <>Suspendre l&apos;organisation <strong>{org.name}</strong> coupera l&apos;accès à tous les membres. Cette action est réversible.</>
                            )}
                            {confirmAction?.target === "resiliee" && (
                                <>Résilier l&apos;organisation <strong>{org.name}</strong> est une action <strong>définitive</strong>. L&apos;accès sera coupé et les données archivées.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 text-white/60 hover:bg-white/5">Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className={confirmAction?.target === "resiliee" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}
                            onClick={() => {
                                if (confirmAction) handleStatusTransition(confirmAction);
                                setConfirmAction(null);
                            }}
                        >
                            {confirmAction?.label}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ─── Progress Banner ─── */}
            <ProgressBanner
                progress={lifecycle.progress}
                status={status}
                isReadyForActivation={lifecycle.isReadyForActivation}
                progressPercent={lifecycle.progressPercent}
                allItems={lifecycle.allItems}
                onMarkAsReady={() => handleStatusTransition({ target: "prete", label: "Marquer Prête", icon: CheckCircle2, color: "text-blue-400" })}
                onTabChange={setActiveTab}
            />

            {/* ─── Tabs ─── */}
            <motion.div variants={fadeUp}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-lg h-auto flex flex-wrap gap-0.5">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="text-xs gap-1.5 data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-300"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {/* ═══ Onglet 1: Profil ═══ */}
                    <TabsContent value="profil" className="mt-4">
                        <ProfilTab org={org} />
                    </TabsContent>

                    {/* ═══ Onglet 2: Structure Organisationnelle ═══ */}
                    <TabsContent value="structure-org" className="mt-4">
                        <StructureOrgTab orgId={orgId} orgType={org.type ?? "enterprise"} />
                    </TabsContent>

                    {/* ═══ Onglet 3: Structure de Classement ═══ */}
                    <TabsContent value="structure-classement" className="mt-4">
                        <ClassementTab orgId={orgId} orgType={org.type ?? "enterprise"} />
                    </TabsContent>

                    {/* ═══ Onglet 4: Configuration Modules ═══ */}
                    <TabsContent value="modules" className="mt-4">
                        <ModulesConfigTab
                            orgId={orgId}
                            activeModules={activeModules}
                            config={org.config}
                            onSaveConfig={handleSaveConfig}
                        />
                    </TabsContent>

                    {/* ═══ Onglet 5: Automatisation ═══ */}
                    <TabsContent value="automation" className="mt-4">
                        <AutomationTab
                            orgId={orgId}
                            orgType={org.type ?? "enterprise"}
                            config={org.config}
                            onSaveConfig={handleSaveConfig}
                        />
                    </TabsContent>

                    {/* ═══ Onglet 6: Déploiement ═══ */}
                    <TabsContent value="deployment" className="mt-4">
                        <DeployTab
                            orgId={orgId}
                            hosting={org.hosting as { type: string; domain?: string; pagePublique?: boolean } | undefined}
                            publicPageConfig={(org as any).publicPageConfig}
                            onSaveHosting={handleSaveHosting}
                        />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════ */

export default function OrganizationDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
            }
        >
            <OrganizationDetailInner />
        </Suspense>
    );
}
