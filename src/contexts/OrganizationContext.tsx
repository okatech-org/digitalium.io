"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Context: Organization
// Provides active organization config to the component tree
// Resolves: orgName, orgConfig, orgWorkflows, orgType
// ═══════════════════════════════════════════════════════════

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    buildOrgConfig,
    resolveOrgPlaceholder,
    type OrganizationConfig,
    type OrgType,
} from "@/config/org-config";
import {
    buildOrgFromPreset,
    getWorkflowPreset,
} from "@/config/org-presets";
import type { OrgWorkflowBundle } from "@/config/workflow-config";

/* ───────────────────────────────────────────────
   Context types
   ─────────────────────────────────────────────── */

interface OrganizationContextValue {
    /** Active organization name */
    orgName: string;

    /** Active organization ID */
    orgId: string;

    /** Active organization type */
    orgType: OrgType;

    /** Full organization config (dashboard, navigation, modules, branding, env) */
    orgConfig: OrganizationConfig;

    /** Workflow/process/automation bundle for this org */
    orgWorkflows: OrgWorkflowBundle;

    /** Active module IDs for this org */
    orgModules: string[];

    /** Whether the org context has been resolved */
    isResolved: boolean;

    /** Resolve a template placeholder like {orgName} */
    resolveTemplate: (template: string) => string;
}

/* ───────────────────────────────────────────────
   Dev email → org mapping
   ─────────────────────────────────────────────── */

interface DevOrgMapping {
    id: string;
    name: string;
    type: OrgType;
    sector?: string;
}

const DEV_EMAIL_ORG_MAP: Record<string, DevOrgMapping> = {
    // ASCOMA demo accounts → Enterprise
    "dg@ascoma.ga": { id: "ascoma", name: "ASCOMA Gabon", type: "enterprise", sector: "Assurance" },
    "commercial@ascoma.ga": { id: "ascoma", name: "ASCOMA Gabon", type: "enterprise", sector: "Assurance" },
    "sinistres@ascoma.ga": { id: "ascoma", name: "ASCOMA Gabon", type: "enterprise", sector: "Assurance" },
    "agent@ascoma.ga": { id: "ascoma", name: "ASCOMA Gabon", type: "enterprise", sector: "Assurance" },
    "juridique@ascoma.ga": { id: "ascoma", name: "ASCOMA Gabon", type: "enterprise", sector: "Assurance" },

    // Ministère demo accounts → Government
    "ministre-peche@digitalium.io": { id: "minpeche", name: "Ministère de la Pêche", type: "government", sector: "Agriculture & Pêche" },
    "admin-peche@digitalium.io": { id: "minpeche", name: "Ministère de la Pêche", type: "government", sector: "Agriculture & Pêche" },
    "dgpa@digitalium.io": { id: "minpeche", name: "Ministère de la Pêche", type: "government", sector: "Agriculture & Pêche" },
    "anpa@digitalium.io": { id: "minpeche", name: "Ministère de la Pêche", type: "government", sector: "Agriculture & Pêche" },
    "inspecteur-peche@digitalium.io": { id: "minpeche", name: "Ministère de la Pêche", type: "government", sector: "Agriculture & Pêche" },

    // Platform admin accounts → Platform
    "demo-sysadmin@digitalium.ga": { id: "digitalium", name: "DIGITALIUM", type: "platform", sector: "Technologie" },
    "demo-admin@digitalium.ga": { id: "digitalium", name: "DIGITALIUM", type: "platform", sector: "Technologie" },
    "ornella.doumba@digitalium.ga": { id: "digitalium", name: "DIGITALIUM", type: "platform", sector: "Technologie" },
};

/* ───────────────────────────────────────────────
   Resolve org from auth user
   ─────────────────────────────────────────────── */

function resolveOrgFromUser(
    email: string | null | undefined,
    organizations?: { id: string; name: string; type: string }[]
): DevOrgMapping {
    // 1. Check dev email → org map
    if (email) {
        const devOrg = DEV_EMAIL_ORG_MAP[email.toLowerCase()];
        if (devOrg) return devOrg;
    }

    // 2. Use first organization from auth user
    if (organizations && organizations.length > 0) {
        const org = organizations[0];
        return {
            id: org.id,
            name: org.name,
            type: (org.type as OrgType) || "enterprise",
        };
    }

    // 3. Fallback: generic enterprise
    return {
        id: "default",
        name: "Mon Organisation",
        type: "enterprise",
    };
}

/* ───────────────────────────────────────────────
   Context
   ─────────────────────────────────────────────── */

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

/* ───────────────────────────────────────────────
   Hook
   ─────────────────────────────────────────────── */

export function useOrganization(): OrganizationContextValue {
    const ctx = useContext(OrganizationContext);
    if (!ctx) {
        throw new Error(
            "useOrganization doit être utilisé à l'intérieur de <OrganizationProvider>"
        );
    }
    return ctx;
}

/* ───────────────────────────────────────────────
   Provider
   ─────────────────────────────────────────────── */

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const { user, organizations } = useAuth();

    const value = useMemo<OrganizationContextValue>(() => {
        const orgMapping = resolveOrgFromUser(
            user?.email,
            organizations as { id: string; name: string; type: string }[]
        );

        // Build full config from preset + org-specific overrides
        const orgConfig = buildOrgFromPreset(
            orgMapping.id,
            orgMapping.name,
            orgMapping.type,
            { sector: orgMapping.sector }
        );

        // Get workflow bundle for this org type
        const orgWorkflows = getWorkflowPreset(orgMapping.type);

        return {
            orgName: orgMapping.name,
            orgId: orgMapping.id,
            orgType: orgMapping.type,
            orgConfig,
            orgWorkflows,
            orgModules: orgConfig.modules,
            isResolved: !!user,
            resolveTemplate: (template: string) =>
                resolveOrgPlaceholder(template, orgMapping.name),
        };
    }, [user, organizations]);

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}
