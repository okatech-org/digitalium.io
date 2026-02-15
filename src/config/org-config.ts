// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Organization Configuration
// Universal org config system — same schema, custom config
// ═══════════════════════════════════════════════

import type { ModuleId } from "./modules";

/* ───────────────────────────────────────────────
   Organization types
   ─────────────────────────────────────────────── */

export type OrgType = "enterprise" | "institution" | "government" | "platform" | "organism";

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

/* ───────────────────────────────────────────────
   Pro Layout Theme — Tailwind class tokens
   (mirrors SPACE_THEMES pattern from AdminUnifiedLayout)
   All classes are written as full static strings so
   Tailwind can detect them at build time.
   ─────────────────────────────────────────────── */

export interface ProLayoutTheme {
    gradient: string;
    activeBg: string;
    activeText: string;
    indicator: string;
    badgeBg: string;
    badgeText: string;
    notifBg: string;
    ringColor: string;
    pageInfoAccent: string;
}

export const ORG_TYPE_THEMES: Record<OrgType, ProLayoutTheme> = {
    enterprise: {
        gradient: "from-violet-600 to-indigo-500",
        activeBg: "bg-violet-500/20",
        activeText: "text-violet-400",
        indicator: "bg-violet-400",
        badgeBg: "bg-violet-500/20",
        badgeText: "text-violet-300",
        notifBg: "bg-violet-500",
        ringColor: "focus-visible:ring-violet-500/30",
        pageInfoAccent: "violet",
    },
    institution: {
        gradient: "from-amber-500 to-orange-500",
        activeBg: "bg-amber-500/20",
        activeText: "text-amber-400",
        indicator: "bg-amber-400",
        badgeBg: "bg-amber-500/20",
        badgeText: "text-amber-300",
        notifBg: "bg-amber-500",
        ringColor: "focus-visible:ring-amber-500/30",
        pageInfoAccent: "orange",
    },
    government: {
        gradient: "from-emerald-500 to-teal-500",
        activeBg: "bg-emerald-500/20",
        activeText: "text-emerald-400",
        indicator: "bg-emerald-400",
        badgeBg: "bg-emerald-500/20",
        badgeText: "text-emerald-300",
        notifBg: "bg-emerald-500",
        ringColor: "focus-visible:ring-emerald-500/30",
        pageInfoAccent: "emerald",
    },
    platform: {
        gradient: "from-red-500 to-orange-500",
        activeBg: "bg-red-500/20",
        activeText: "text-red-400",
        indicator: "bg-red-400",
        badgeBg: "bg-red-500/20",
        badgeText: "text-red-300",
        notifBg: "bg-red-500",
        ringColor: "focus-visible:ring-red-500/30",
        pageInfoAccent: "orange",
    },
    organism: {
        gradient: "from-cyan-500 to-teal-500",
        activeBg: "bg-cyan-500/20",
        activeText: "text-cyan-400",
        indicator: "bg-cyan-400",
        badgeBg: "bg-cyan-500/20",
        badgeText: "text-cyan-300",
        notifBg: "bg-cyan-500",
        ringColor: "focus-visible:ring-cyan-500/30",
        pageInfoAccent: "cyan",
    },
};

/** Resolve the ProLayout theme for a given org type. Falls back to enterprise (violet). */
export function getProLayoutTheme(type: OrgType): ProLayoutTheme {
    return ORG_TYPE_THEMES[type] ?? ORG_TYPE_THEMES.enterprise;
}
