// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Organization Configuration
// Universal org config system — same schema, custom config
// ═══════════════════════════════════════════════

import type { ModuleId } from "./modules";

/* ───────────────────────────────────────────────
   Organization types
   ─────────────────────────────────────────────── */

export type OrgType = "enterprise" | "institution" | "government" | "platform";

/* ───────────────────────────────────────────────
   Branding
   ─────────────────────────────────────────────── */

export interface OrgBranding {
    primaryColor: string;
    gradient: string;
    logoUrl?: string;
    favicon?: string;
}

/* ───────────────────────────────────────────────
   Environment
   ─────────────────────────────────────────────── */

export interface EnvironmentConfig {
    locale: string;           // "fr-GA", "fr-FR", etc.
    timezone: string;         // "Africa/Libreville"
    currency: string;         // "XAF", "EUR"
    dateFormat: string;       // "DD/MM/YYYY"
    features: string[];       // feature flags
}

/* ───────────────────────────────────────────────
   Organization Config — Full
   ─────────────────────────────────────────────── */

export interface OrganizationConfig {
    id: string;
    name: string;
    type: OrgType;
    sector?: string;         // "Assurance", "Pêche", "Technologie"
    branding: OrgBranding;
    modules: ModuleId[];     // modules activés
    environment: EnvironmentConfig;

    // Customizable per-org
    dashboard: DashboardConfig;
    navigation: NavigationConfig;
}

/* ───────────────────────────────────────────────
   Dashboard Config
   ─────────────────────────────────────────────── */

export interface DashboardConfig {
    showActivityChart: boolean;
    showTeamWidget: boolean;
    showQuickActions: boolean;
    showRecentDocs: boolean;
    kpiModules: ModuleId[];    // which modules to show KPIs for
    greeting: string;          // "Bienvenue chez {orgName}"
}

/* ───────────────────────────────────────────────
   Navigation Config
   ─────────────────────────────────────────────── */

export interface NavigationConfig {
    showBilling: boolean;
    showApiIntegrations: boolean;
    showAnalytics: boolean;
    showFormation: boolean;
    customSections?: {
        title: string;
        items: { label: string; href: string; icon: string }[];
    }[];
}

/* ───────────────────────────────────────────────
   Default configs by org type
   ─────────────────────────────────────────────── */

const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
    locale: "fr-GA",
    timezone: "Africa/Libreville",
    currency: "XAF",
    dateFormat: "DD/MM/YYYY",
    features: [],
};

const DEFAULT_DASHBOARD: DashboardConfig = {
    showActivityChart: true,
    showTeamWidget: true,
    showQuickActions: true,
    showRecentDocs: true,
    kpiModules: ["idocument", "iarchive", "isignature", "iasted"],
    greeting: "Bienvenue chez {orgName}",
};

const DEFAULT_NAVIGATION: NavigationConfig = {
    showBilling: true,
    showApiIntegrations: true,
    showAnalytics: true,
    showFormation: false,
};

const DEFAULT_BRANDING: OrgBranding = {
    primaryColor: "#8B5CF6",
    gradient: "from-violet-500 to-purple-500",
};

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

/** Build a full OrganizationConfig from partial data + defaults. */
export function buildOrgConfig(
    partial: Partial<OrganizationConfig> & { id: string; name: string; type: OrgType }
): OrganizationConfig {
    return {
        id: partial.id,
        name: partial.name,
        type: partial.type,
        sector: partial.sector,
        branding: { ...DEFAULT_BRANDING, ...partial.branding },
        modules: partial.modules ?? ["idocument", "iarchive"],
        environment: { ...DEFAULT_ENVIRONMENT, ...partial.environment },
        dashboard: { ...DEFAULT_DASHBOARD, ...partial.dashboard },
        navigation: { ...DEFAULT_NAVIGATION, ...partial.navigation },
    };
}

/** Resolve {orgName} placeholder in strings. */
export function resolveOrgPlaceholder(template: string, orgName: string): string {
    return template.replace(/\{orgName\}/g, orgName);
}

export {
    DEFAULT_ENVIRONMENT,
    DEFAULT_DASHBOARD,
    DEFAULT_NAVIGATION,
    DEFAULT_BRANDING,
};
