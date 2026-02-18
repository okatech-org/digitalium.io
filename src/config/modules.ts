// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Modules
// Product modules (4) + App modules (15 configurable segments)
// ═══════════════════════════════════════════════

/* ───────────────────────────────────────────────
   Module types
   ─────────────────────────────────────────────── */

export type ModuleId = "idocument" | "iarchive" | "isignature" | "iasted";
export type ProductModuleId = ModuleId;
export type ModuleStatus = "active" | "beta" | "coming_soon";

export interface ModuleTechStack {
    editor?: string;       // ex: "Yjs + Tiptap"
    realtime?: string;     // ex: "Convex"
    storage?: string;      // ex: "Supabase Storage"
    ai?: string;           // ex: "Google Gemini"
    hashing?: string;      // ex: "SHA-256"
}

export interface ModuleRetention {
    fiscal: number;         // années de rétention fiscale
    social: number;         // années de rétention documents sociaux
    default: number;        // rétention par défaut
}

export interface ModuleConfig {
    id: ModuleId;
    name: string;
    tagline: string;
    description: string;
    icon: string;            // Nom icône Lucide
    color: string;           // Hex
    gradient: string;        // Classes Tailwind
    status: ModuleStatus;
    techStack: ModuleTechStack;
    retention?: ModuleRetention;
    features: ModuleFeature[];
    pricing?: {
        included: boolean;     // true = inclus dans le plan de base
        addonPrice?: number;   // XAF/mois si addon
    };
}

export interface ModuleFeature {
    id: string;
    name: string;
    description: string;
}

/* ───────────────────────────────────────────────
   Module definitions
   ─────────────────────────────────────────────── */

export const MODULES: Record<ModuleId, ModuleConfig> = {
    /* ─── iDocument ────────────────────────────── */
    idocument: {
        id: "idocument",
        name: "iDocument",
        tagline: "Google Docs pour le Gabon",
        description:
            "Édition collaborative en temps réel — rédigez, commentez et approuvez vos documents à plusieurs, simultanément.",
        icon: "FileText",
        color: "#3B82F6",
        gradient: "from-blue-500 to-blue-600",
        status: "active",
        techStack: {
            editor: "Yjs + Tiptap",
            realtime: "Convex",
            storage: "Supabase Storage",
        },
        features: [
            {
                id: "collab_editor",
                name: "Éditeur collaboratif temps réel",
                description: "Co-édition multi-curseurs avec suivi de présence",
            },
            {
                id: "templates",
                name: "Templates professionnels",
                description: "Modèles de documents pré-formatés (contrats, rapports, notes)",
            },
            {
                id: "version_history",
                name: "Historique des versions",
                description: "Revenez à n'importe quelle version précédente",
            },
            {
                id: "export",
                name: "Export PDF / Word / XLSX",
                description: "Exportez vos documents dans tous les formats standards",
            },
            {
                id: "comments",
                name: "Commentaires et annotations",
                description: "Discussions contextuelles intégrées au document",
            },
        ],
        pricing: { included: true },
    },

    /* ─── iArchive ─────────────────────────────── */
    iarchive: {
        id: "iarchive",
        name: "iArchive",
        tagline: "Un coffre-fort intelligent",
        description:
            "Archivage légal avec intégrité SHA-256 — chaque document est horodaté, certifié et conforme à la loi gabonaise.",
        icon: "Archive",
        color: "#10B981",
        gradient: "from-emerald-500 to-emerald-600",
        status: "active",
        techStack: {
            hashing: "SHA-256",
            storage: "Supabase Storage",
            realtime: "Convex",
        },
        retention: {
            fiscal: 10,   // 10 ans rétention fiscale
            social: 5,    // 5 ans documents sociaux
            default: 10,
        },
        features: [
            {
                id: "sha256",
                name: "Intégrité cryptographique SHA-256",
                description: "Chaque fichier archivé a une empreinte cryptographique vérifiable",
            },
            {
                id: "certificate",
                name: "Certificat d'archivage horodaté",
                description: "Preuve de dépôt avec horodatage légal",
            },
            {
                id: "retention_fiscal",
                name: "Rétention fiscale 10 ans",
                description: "Conformité avec les obligations de conservation fiscale gabonaises",
            },
            {
                id: "retention_social",
                name: "Rétention sociale 5 ans",
                description: "Archivage des documents sociaux conformément à la loi du travail",
            },
            {
                id: "search",
                name: "Recherche avancée & filtres",
                description: "Retrouvez n'importe quel document en quelques secondes",
            },
            {
                id: "audit_trail",
                name: "Journal d'audit immuable",
                description: "Traçabilité complète de toutes les opérations d'archivage",
            },
        ],
        pricing: { included: true },
    },

    /* ─── iSignature ───────────────────────────── */
    isignature: {
        id: "isignature",
        name: "iSignature",
        tagline: "Signez en un clic",
        description:
            "Validation électronique avec workflows multi-étapes — invitez, signez et suivez chaque approbation.",
        icon: "PenTool",
        color: "#8B5CF6",
        gradient: "from-violet-500 to-violet-600",
        status: "active",
        techStack: {
            realtime: "Convex",
        },
        features: [
            {
                id: "e_signature",
                name: "Signature électronique légale",
                description: "Signatures à valeur probante conformes à la législation gabonaise",
            },
            {
                id: "multi_step",
                name: "Workflows multi-étapes",
                description: "Circuits de validation avec ordonnancement (parallèle ou séquentiel)",
            },
            {
                id: "audit",
                name: "Audit trail complet",
                description: "Historique détaillé de chaque action de signature",
            },
            {
                id: "notifications",
                name: "Notifications automatiques",
                description: "Rappels et alertes pour les signataires en attente",
            },
            {
                id: "templates",
                name: "Modèles de workflows",
                description: "Circuits de validation pré-configurés réutilisables",
            },
        ],
        pricing: { included: false, addonPrice: 5_000 },
    },

    /* ─── iAsted ───────────────────────────────── */
    iasted: {
        id: "iasted",
        name: "iAsted",
        tagline: "Votre archiviste qui ne dort jamais",
        description:
            "Assistant IA 24/7 — OCR, recherche sémantique, résumés automatiques et analytics prédictifs sur vos archives.",
        icon: "Bot",
        color: "#F59E0B",
        gradient: "from-amber-500 to-amber-600",
        status: "beta",
        techStack: {
            ai: "Google Gemini",
            realtime: "Convex",
        },
        features: [
            {
                id: "ocr",
                name: "OCR & extraction intelligente",
                description: "Numérisez et extrayez automatiquement les données de vos documents papier",
            },
            {
                id: "semantic_search",
                name: "Recherche sémantique",
                description: "Trouvez des documents par leur contenu, pas seulement par nom",
            },
            {
                id: "summaries",
                name: "Résumés automatiques",
                description: "Synthèse intelligente de documents longs en quelques secondes",
            },
            {
                id: "predictive",
                name: "Analytics prédictifs",
                description: "Anticipez les besoins d'archivage et les échéances réglementaires",
            },
            {
                id: "chat",
                name: "Chat conversationnel",
                description: "Posez des questions à vos archives en langage naturel",
            },
            {
                id: "classification",
                name: "Classification automatique",
                description: "Catégorisation et étiquetage intelligent des documents",
            },
        ],
        pricing: { included: false, addonPrice: 10_000 },
    },
} as const;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

export function getModule(id: ModuleId): ModuleConfig {
    return MODULES[id];
}

export function getModulesList(): ModuleConfig[] {
    return Object.values(MODULES);
}

export function getActiveModules(): ModuleConfig[] {
    return Object.values(MODULES).filter((m) => m.status === "active");
}

export function getIncludedModules(): ModuleConfig[] {
    return Object.values(MODULES).filter((m) => m.pricing?.included);
}

export function getAddonModules(): ModuleConfig[] {
    return Object.values(MODULES).filter(
        (m) => m.pricing && !m.pricing.included
    );
}

/* ───────────────────────────────────────────────
   App Module System (configurable menu segments)
   Source unique de vérité pour tous les modules
   de navigation, configuration et accès.
   ─────────────────────────────────────────────── */

export type AppModuleId =
    | "dashboard"           // Cœur — toujours actif
    | ProductModuleId       // Produit — 4 modules SaaS
    | "crm_clients"         // Commercial
    | "crm_leads"           // Commercial
    | "org_structure"       // Organisation
    | "org_team"            // Organisation
    | "billing"             // Administration
    | "theming"             // Administration
    | "workflow_templates"  // Administration
    | "api_integrations"    // Administration
    | "org_onboarding"      // Administration (Formation UI)
    | "settings";           // Administration

export type ModuleCategory = "core" | "product" | "commercial" | "organization" | "admin";

export interface AppModuleConfig {
    id: AppModuleId;
    category: ModuleCategory;
    name: string;              // Label FR pour la sidebar
    description: string;       // Pour les interfaces de configuration (admin)
    icon: string;              // Nom d'icône Lucide
    color: string;             // Hex
    isAlwaysOn: boolean;       // true = ne peut pas être désactivé (dashboard, settings)
    minRoleLevel: number;      // RBAC minimum pour voir ce module (0=sysadmin, 5=viewer)
    defaultEnabled: boolean;   // Activé par défaut pour les nouveaux orgs
}

/** Catégories de modules pour la sidebar */
export const MODULE_CATEGORIES: { id: ModuleCategory; label: string }[] = [
    { id: "core", label: "Cœur" },
    { id: "product", label: "Modules Métier" },
    { id: "commercial", label: "Commercial" },
    { id: "organization", label: "Organisation" },
    { id: "admin", label: "Administration" },
] as const;

/** Registre complet de tous les modules applicatifs */
export const APP_MODULES: Record<AppModuleId, AppModuleConfig> = {
    /* ─── Cœur ────────────────────────────────── */
    dashboard: {
        id: "dashboard",
        category: "core",
        name: "Dashboard",
        description: "Tableau de bord principal avec KPIs et activité",
        icon: "LayoutDashboard",
        color: "#6366F1",
        isAlwaysOn: true,
        minRoleLevel: 5,
        defaultEnabled: true,
    },

    /* ─── Produit ─────────────────────────────── */
    idocument: {
        id: "idocument",
        category: "product",
        name: "iDocument",
        description: "Édition collaborative de documents en temps réel",
        icon: "FileText",
        color: "#3B82F6",
        isAlwaysOn: false,
        minRoleLevel: 5,
        defaultEnabled: true,
    },
    iarchive: {
        id: "iarchive",
        category: "product",
        name: "iArchive",
        description: "Archivage légal avec intégrité cryptographique",
        icon: "Archive",
        color: "#10B981",
        isAlwaysOn: false,
        minRoleLevel: 5,
        defaultEnabled: true,
    },
    isignature: {
        id: "isignature",
        category: "product",
        name: "iSignature",
        description: "Signature électronique avec workflows multi-étapes",
        icon: "PenTool",
        color: "#8B5CF6",
        isAlwaysOn: false,
        minRoleLevel: 5,
        defaultEnabled: true,
    },
    iasted: {
        id: "iasted",
        category: "product",
        name: "iAsted",
        description: "Assistant IA — OCR, recherche sémantique, analytics",
        icon: "Bot",
        color: "#F59E0B",
        isAlwaysOn: false,
        minRoleLevel: 5,
        defaultEnabled: true,
    },

    /* ─── Commercial ──────────────────────────── */
    crm_clients: {
        id: "crm_clients",
        category: "commercial",
        name: "Clients",
        description: "Gestion du portefeuille clients",
        icon: "UserCircle",
        color: "#0EA5E9",
        isAlwaysOn: false,
        minRoleLevel: 3,
        defaultEnabled: true,
    },
    crm_leads: {
        id: "crm_leads",
        category: "commercial",
        name: "Leads",
        description: "Suivi des prospects et pipeline commercial",
        icon: "Target",
        color: "#F97316",
        isAlwaysOn: false,
        minRoleLevel: 3,
        defaultEnabled: true,
    },

    /* ─── Organisation ────────────────────────── */
    org_structure: {
        id: "org_structure",
        category: "organization",
        name: "Organisation",
        description: "Organigramme et structure des unités organisationnelles",
        icon: "Building2",
        color: "#8B5CF6",
        isAlwaysOn: false,
        minRoleLevel: 2,
        defaultEnabled: true,
    },
    org_team: {
        id: "org_team",
        category: "organization",
        name: "Équipe",
        description: "Gestion des membres, rôles et permissions",
        icon: "Users",
        color: "#10B981",
        isAlwaysOn: false,
        minRoleLevel: 2,
        defaultEnabled: true,
    },

    /* ─── Administration ──────────────────────── */
    billing: {
        id: "billing",
        category: "admin",
        name: "Abonnements",
        description: "Gestion de l'abonnement et de la facturation",
        icon: "CreditCard",
        color: "#EF4444",
        isAlwaysOn: false,
        minRoleLevel: 2,
        defaultEnabled: true,
    },
    theming: {
        id: "theming",
        category: "admin",
        name: "Thème & Design",
        description: "Personnalisation de l'identité visuelle de l'espace",
        icon: "Palette",
        color: "#EC4899",
        isAlwaysOn: false,
        minRoleLevel: 2,
        defaultEnabled: true,
    },
    workflow_templates: {
        id: "workflow_templates",
        category: "admin",
        name: "Modèles de Workflows",
        description: "Configuration des circuits de validation et approbation",
        icon: "Settings",
        color: "#6366F1",
        isAlwaysOn: false,
        minRoleLevel: 2,
        defaultEnabled: true,
    },
    api_integrations: {
        id: "api_integrations",
        category: "admin",
        name: "Intégrations API",
        description: "Connexion avec outils tiers (ERP, comptabilité, etc.)",
        icon: "Plug",
        color: "#14B8A6",
        isAlwaysOn: false,
        minRoleLevel: 2,
        defaultEnabled: true,
    },
    org_onboarding: {
        id: "org_onboarding",
        category: "admin",
        name: "Formation",
        description: "Guide d'utilisation de l'interface et onboarding collaborateurs",
        icon: "GraduationCap",
        color: "#A855F7",
        isAlwaysOn: false,
        minRoleLevel: 4,
        defaultEnabled: false,
    },
    settings: {
        id: "settings",
        category: "admin",
        name: "Paramètres",
        description: "Configuration générale de l'espace organisation",
        icon: "Settings",
        color: "#6B7280",
        isAlwaysOn: true,
        minRoleLevel: 2,
        defaultEnabled: true,
    },
} as const;

/* ─── App Module Helpers ────────────────────────── */

/** Get all app modules as a flat list. */
export function getAppModulesList(): AppModuleConfig[] {
    return Object.values(APP_MODULES);
}

/** Get app modules by category. */
export function getAppModulesByCategory(category: ModuleCategory): AppModuleConfig[] {
    return Object.values(APP_MODULES).filter((m) => m.category === category);
}

/** Get all AppModuleIds. */
export function getAllAppModuleIds(): AppModuleId[] {
    return Object.keys(APP_MODULES) as AppModuleId[];
}

/** Get AppModuleIds that are always on (cannot be disabled). */
export function getAlwaysOnModuleIds(): AppModuleId[] {
    return Object.values(APP_MODULES)
        .filter((m) => m.isAlwaysOn)
        .map((m) => m.id);
}

/** Get default enabled AppModuleIds for a standard org. */
export function getDefaultEnabledModuleIds(): AppModuleId[] {
    return Object.values(APP_MODULES)
        .filter((m) => m.defaultEnabled)
        .map((m) => m.id);
}

import type { OrgType } from "./org-config";

/** Get default enabled modules for a specific org type. */
export function getDefaultModulesForOrgType(orgType: OrgType): AppModuleId[] {
    const always = getAlwaysOnModuleIds();

    const ORG_TYPE_MODULES: Record<OrgType, AppModuleId[]> = {
        enterprise: [
            ...always,
            "idocument", "iarchive", "isignature", "iasted",
            "crm_clients", "crm_leads",
            "org_structure", "org_team",
            "billing", "theming", "workflow_templates", "api_integrations", "org_onboarding",
        ],
        government: [
            ...always,
            "idocument", "iarchive", "isignature", "iasted",
            "org_structure", "org_team",
            "theming", "workflow_templates", "org_onboarding",
        ],
        institution: [
            ...always,
            "idocument", "iarchive", "isignature", "iasted",
            "org_structure", "org_team",
            "theming", "workflow_templates", "org_onboarding",
        ],
        organism: [
            ...always,
            "idocument", "iarchive", "isignature", "iasted",
            "org_structure", "org_team",
            "theming", "workflow_templates", "org_onboarding",
        ],
        platform: [
            ...always,
            "idocument", "iarchive", "isignature", "iasted",
            "crm_clients", "crm_leads",
            "org_structure", "org_team",
            "billing", "theming", "workflow_templates", "api_integrations", "org_onboarding",
        ],
    };

    // Deduplicate (always-on modules may overlap)
    return Array.from(new Set(ORG_TYPE_MODULES[orgType] ?? ORG_TYPE_MODULES.enterprise));
}
