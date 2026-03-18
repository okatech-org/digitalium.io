// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Organisation (Admin Org)
// 5 onglets éditables : Profil · Structure Org ·
// Classement · Modules · Automatisation
// Réutilise les composants admin/org-detail
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    UserCircle,
    Network,
    FolderTree,
    Package,
    Zap,
    Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
    ProfilTab,
    StructureOrgTab,
    ClassementTab,
    ModulesConfigTab,
    AutomationTab,
} from "@/components/admin/org-detail";

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
];

/* ─── Org Type labels ─── */

const ORG_TYPE_LABELS: Record<string, string> = {
    enterprise: "Entreprise",
    institution: "Institution",
    government: "Administration",
    organism: "Organisme",
    platform: "Plateforme",
    ngo: "ONG",
    education: "Éducation",
    startup: "Startup",
};

/* ═══════════════════════════════════════════════
   INNER COMPONENT
   ═══════════════════════════════════════════════ */

function OrganizationAdminInner() {
    const { orgName, orgType } = useOrganization();
    const { convexOrgId, isLoading: orgIdLoading } = useConvexOrgId();

    const [activeTab, setActiveTab] = useState("profil");

    // ─── Data from Convex ───
    const orgData = useQuery(
        api.organizations.getById,
        convexOrgId ? { id: convexOrgId } : "skip"
    );

    // ─── Mutations ───
    const updateConfig = useMutation(api.organizations.updateConfig);

    // ─── Handlers ───
    const handleSaveConfig = useCallback(async (config: Record<string, unknown>) => {
        if (!convexOrgId) return;
        try {
            await updateConfig({ id: convexOrgId, config });
            toast.success("Configuration sauvegardée");
        } catch (err) {
            toast.error("Erreur lors de la sauvegarde", {
                description: err instanceof Error ? err.message : "Veuillez réessayer.",
            });
        }
    }, [convexOrgId, updateConfig]);

    // ─── Loading state ───
    if (orgIdLoading || orgData === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!convexOrgId || orgData === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Organisation introuvable</p>
            </div>
        );
    }

    const org = orgData;
    const activeModules: string[] = org.quota?.modules ?? [];

    /* ─── RENDER ─── */
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* ─── Header ─── */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Building2 className="h-5.5 w-5.5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        {orgName || org.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">
                            {ORG_TYPE_LABELS[org.type ?? orgType] ?? org.type ?? orgType}
                        </Badge>
                        {org.sector && (
                            <Badge variant="secondary" className="text-[9px] bg-blue-500/15 text-blue-300 border-0">
                                {org.sector}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Configuration de l&apos;organisation
                        </span>
                    </div>
                </div>
            </motion.div>

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
                        <StructureOrgTab orgId={convexOrgId} orgType={org.type ?? "enterprise"} />
                    </TabsContent>

                    {/* ═══ Onglet 3: Structure de Classement ═══ */}
                    <TabsContent value="structure-classement" className="mt-4">
                        <ClassementTab orgId={convexOrgId} orgType={org.type ?? "enterprise"} />
                    </TabsContent>

                    {/* ═══ Onglet 4: Configuration Modules ═══ */}
                    <TabsContent value="modules" className="mt-4">
                        <ModulesConfigTab
                            orgId={convexOrgId}
                            activeModules={activeModules}
                            config={org.config}
                            onSaveConfig={handleSaveConfig}
                        />
                    </TabsContent>

                    {/* ═══ Onglet 5: Automatisation ═══ */}
                    <TabsContent value="automation" className="mt-4">
                        <AutomationTab
                            orgId={convexOrgId}
                            orgType={org.type ?? "enterprise"}
                            config={org.config}
                            onSaveConfig={handleSaveConfig}
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

export default function OrganisationPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
            }
        >
            <OrganizationAdminInner />
        </Suspense>
    );
}
