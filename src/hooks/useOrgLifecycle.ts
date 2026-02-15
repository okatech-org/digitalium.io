// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useOrgLifecycle (v3)
// Gestion du statut + progression checklist réactive
// Utilise getChecklist (org_lifecycle) pour un calcul en temps réel
// ═══════════════════════════════════════════════

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { ConfigProgress } from "@/types/org-structure";

export function useOrgLifecycle(organizationId?: Id<"organizations">) {
    const org = useQuery(
        api.organizations.getById,
        organizationId ? { id: organizationId } : "skip"
    );

    // ─── Reactive checklist from org_lifecycle ───
    // This query recomputes progress from actual data (org_units, filing_cells, config, hosting)
    // and Convex reactivity ensures it updates whenever those tables change.
    const checklist = useQuery(
        api.org_lifecycle.getChecklist,
        organizationId ? { organizationId } : "skip"
    );

    const updateConfigProgress = useMutation(api.organizations.updateConfigProgress);
    const markAsReady = useMutation(api.organizations.markAsReady);
    const activate = useMutation(api.organizations.activate);
    const suspend = useMutation(api.organizations.suspend);
    const terminate = useMutation(api.organizations.terminate);
    const updateConfig = useMutation(api.organizations.updateConfig);
    const updateHosting = useMutation(api.organizations.updateHosting);

    // ─── Build progress object from reactive checklist ───
    // Map getChecklist items back to the ConfigProgress shape expected by ProgressBanner
    const progress: ConfigProgress | undefined = checklist
        ? {
            profilComplete: checklist.items.find((i) => i.key === "profil")?.complete ?? false,
            structureOrgComplete: checklist.items.find((i) => i.key === "structureOrg")?.complete ?? false,
            structureClassementComplete: checklist.items.find((i) => i.key === "structureClassement")?.complete ?? false,
            modulesConfigComplete: checklist.items.find((i) => i.key === "modulesConfig")?.complete ?? false,
            automationConfigComplete: checklist.items.find((i) => i.key === "automation")?.complete ?? false,
            deploymentConfigComplete: checklist.items.find((i) => i.key === "deployment")?.complete ?? false,
        }
        : (org?.configProgress as ConfigProgress | undefined);

    const requiredItems = [
        { key: "profilComplete" as const, label: "Profil", onglet: "profil" },
        { key: "structureOrgComplete" as const, label: "Structure Organisationnelle", onglet: "structure-org" },
        { key: "structureClassementComplete" as const, label: "Structure de Classement", onglet: "structure-classement" },
        { key: "modulesConfigComplete" as const, label: "Configuration Modules", onglet: "modules" },
        { key: "deploymentConfigComplete" as const, label: "Déploiement", onglet: "deployment" },
    ];

    const optionalItems = [
        { key: "automationConfigComplete" as const, label: "Automatisation", onglet: "automation" },
    ];

    const allItems = [...requiredItems, ...optionalItems];

    const completedRequired = requiredItems.filter(
        (item) => progress?.[item.key] === true
    ).length;

    const completedTotal = allItems.filter(
        (item) => progress?.[item.key] === true
    ).length;

    const isReadyForActivation = completedRequired === requiredItems.length;
    const progressPercent = Math.round((completedTotal / allItems.length) * 100);

    return {
        org,
        progress,
        isLoading: org === undefined,
        // Checklist
        requiredItems,
        optionalItems,
        allItems,
        completedRequired,
        completedTotal,
        isReadyForActivation,
        progressPercent,
        // Mutations
        updateConfigProgress: (updates: Partial<ConfigProgress>) =>
            organizationId
                ? updateConfigProgress({ id: organizationId, progress: updates })
                : Promise.reject("No org ID"),
        markAsReady: () =>
            organizationId
                ? markAsReady({ id: organizationId })
                : Promise.reject("No org ID"),
        activate: () =>
            organizationId
                ? activate({ id: organizationId })
                : Promise.reject("No org ID"),
        suspend: () =>
            organizationId
                ? suspend({ id: organizationId })
                : Promise.reject("No org ID"),
        terminate: () =>
            organizationId
                ? terminate({ id: organizationId })
                : Promise.reject("No org ID"),
        updateConfig,
        updateHosting,
    };
}
