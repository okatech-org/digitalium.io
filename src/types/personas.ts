// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Personas & Pricing
// ═══════════════════════════════════════════════

import type { PlatformRole } from "./auth";

/* ───────────────────────────────────────────────
   Persona types
   ─────────────────────────────────────────────── */

export type PersonaType = "citizen" | "business" | "institutional";

/**
 * @deprecated Use `PersonaType` instead. Kept for PersonaContext consumer compat.
 */
export type PersonaSegment = "citizen" | "enterprise" | "institution";

/* ───────────────────────────────────────────────
   Pricing
   ─────────────────────────────────────────────── */

export type BillingCycle = "monthly" | "annual" | "one_time" | "custom";
export type Currency = "XAF" | "EUR" | "USD";

export interface PricingTier {
    label: string;
    amount: number;        // 0 = gratuit, -1 = sur devis
    currency: Currency;
    cycle: BillingCycle;
    perUser?: boolean;     // true → montant par utilisateur
}

export interface ModuleAddon {
    moduleId: string;
    label: string;
    amount: number;
    currency: Currency;
    cycle: BillingCycle;
}

export interface PricingConfig {
    base: PricingTier;
    premium?: PricingTier;
    addons: ModuleAddon[];
    trialDays: number;
    customQuote: boolean;  // true → prix sur devis
}

/* ───────────────────────────────────────────────
   Feature sets
   ─────────────────────────────────────────────── */

export interface Feature {
    id: string;
    name: string;
    description: string;
    included: boolean;
}

export interface FeatureSet {
    maxUsers: number;         // -1 = illimité
    modules: string[];        // IDs des modules disponibles
    storage: number;          // en bytes, -1 = illimité
    apiAccess: boolean;
    ssoSAML: boolean;
    onPremise: boolean;
    sla?: string;             // ex: "99.9%"
    customWorkflows: boolean;
    features: Feature[];
}

/* ───────────────────────────────────────────────
   Persona configuration
   ─────────────────────────────────────────────── */

export interface PersonaConfig {
    id: PersonaType;
    label: string;
    labelFr: string;
    subtitle: string;
    description: string;
    route: string;             // '/pro', '/institutional', ou URL externe
    isExternal: boolean;       // true pour identite.ga
    icon: string;              // Nom icône Lucide
    gradient: string;          // Classes Tailwind gradient
    color: string;             // Hex color
    pricing: PricingConfig;
    features: FeatureSet;
    rbacLevels: PlatformRole[];
}

/* ───────────────────────────────────────────────
   Module configuration (for usePersona)
   ─────────────────────────────────────────────── */

export interface ModuleConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    route: string;
    isAddon: boolean;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
    {
        id: "idocument",
        name: "iDocument",
        description: "Gestion documentaire collaborative",
        icon: "FileText",
        route: "/idocument",
        isAddon: false,
    },
    {
        id: "iarchive",
        name: "iArchive",
        description: "Archivage légal et coffre-fort numérique",
        icon: "Archive",
        route: "/iarchive",
        isAddon: false,
    },
    {
        id: "isignature",
        name: "iSignature",
        description: "Signature électronique et workflows de validation",
        icon: "PenTool",
        route: "/isignature",
        isAddon: true,
    },
    {
        id: "iasted",
        name: "iAsted",
        description: "Assistant IA — OCR, résumés, analytics",
        icon: "Brain",
        route: "/iasted",
        isAddon: true,
    },
];

/* ───────────────────────────────────────────────
   Business Subscription
   ─────────────────────────────────────────────── */

export type SubscriptionStatus =
    | "active"
    | "trial"
    | "expired"
    | "cancelled"
    | "suspended";

export type SubscriptionPlan =
    | "starter"
    | "professional"
    | "enterprise"
    | "custom";

export interface BusinessSubscription {
    id: string;
    organizationId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;

    // Dates
    startedAt: Date;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date;

    // Limits
    maxUsers: number;
    currentUsers: number;
    modules: string[];           // module IDs actifs
    storageBytes: number;        // -1 = illimité

    // Pricing
    pricing: {
        monthly: number;          // en XAF
        annual: number;           // en XAF
    };

    // Metadata
    currency: Currency;
    autoRenew: boolean;
}

/* ───────────────────────────────────────────────
   Permission Set (for useRBAC)
   ─────────────────────────────────────────────── */

export interface PermissionSet {
    // Administrative
    canManageSystem: boolean;
    canManageOrganizations: boolean;
    canManageUsers: boolean;
    canManageBilling: boolean;

    // Content
    canEditDocuments: boolean;
    canViewDocuments: boolean;
    canEditContent: boolean;

    // Analytics
    canViewAnalytics: boolean;

    // Derived
    isAdmin: boolean;
    isViewOnly: boolean;
}

/* ───────────────────────────────────────────────
   Onboarding
   ─────────────────────────────────────────────── */

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    component: string;
    required: boolean;
    order: number;
}

export interface PersonaOnboarding {
    persona: PersonaType;
    steps: OnboardingStep[];
    completedSteps: string[];
}
