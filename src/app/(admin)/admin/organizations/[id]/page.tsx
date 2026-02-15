// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Fiche Organisation (v2)
// 6 onglets indépendants + bandeau progression
// Données réelles Convex (pas de mock)
// ═══════════════════════════════════════════════

"use client";

import React, { useState, Suspense } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

/* ═══════════════════════════════════════════════
   INNER COMPONENT
   ═══════════════════════════════════════════════ */

function OrganizationDetailInner() {
    const params = useParams();
    const rawId = params.id as string;
    const orgId = rawId as Id<"organizations">;

    const [activeTab, setActiveTab] = useState("profil");

    // ─── Data from Convex ───
    const orgData = useQuery(api.organizations.getById, { id: orgId });

    // ─── Lifecycle hook ───
    const lifecycle = useOrgLifecycle(orgId);

    // ─── Mutations ───
    const updateConfig = useMutation(api.organizations.updateConfig);
    const updateHosting = useMutation(api.organizations.updateHosting);

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

    // Active modules from quota
    const activeModules: string[] = org.quota?.modules ?? [];

    // ─── Handlers ───
    const handleMarkAsReady = async () => {
        try {
            await lifecycle.markAsReady();
            toast.success("Organisation marquée comme prête", {
                description: "Elle peut maintenant être activée via le volet Clients.",
            });
        } catch (err) {
            toast.error("Impossible de marquer comme prête", {
                description: err instanceof Error ? err.message : "Veuillez réessayer.",
            });
        }
    };

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
                            <Badge
                                variant="secondary"
                                className={`text-[9px] border-0 ${statusColors.bg} ${statusColors.text}`}
                            >
                                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${statusColors.dot}`} />
                                {statusLabel}
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Progress Banner ─── */}
            <ProgressBanner
                progress={lifecycle.progress}
                status={status}
                isReadyForActivation={lifecycle.isReadyForActivation}
                progressPercent={lifecycle.progressPercent}
                requiredItems={lifecycle.requiredItems}
                optionalItems={lifecycle.optionalItems}
                onMarkAsReady={handleMarkAsReady}
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
