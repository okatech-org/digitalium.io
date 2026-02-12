// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Personas
// 3 segments (Citoyens, Entreprises, Institutions)
// ═══════════════════════════════════════════════

import type { PersonaConfig, PersonaType } from "@/types/personas";

/* ───────────────────────────────────────────────
   Persona definitions
   ─────────────────────────────────────────────── */

export const PERSONAS: Record<PersonaType, PersonaConfig> = {
    /* ─── CITOYENS ─────────────────────────────── */
    citizen: {
        id: "citizen",
        label: "Citizens",
        labelFr: "Citoyens",
        subtitle: "Mon identité numérique",
        description:
            "Espace personnel pour la gestion de vos documents et archives — scan, coffre-fort numérique, profil familial.",
        route: "https://identite.ga",
        isExternal: true,
        icon: "User",
        gradient: "from-blue-500 to-cyan-400",
        color: "#3B82F6",
        pricing: {
            base: {
                label: "Gratuit",
                amount: 0,
                currency: "XAF",
                cycle: "monthly",
            },
            premium: {
                label: "Premium",
                amount: 5_000,
                currency: "XAF",
                cycle: "monthly",
            },
            addons: [],
            trialDays: 0,
            customQuote: false,
        },
        features: {
            maxUsers: 5, // profil familial max 5
            modules: ["idocument"],
            storage: 1 * 1024 * 1024 * 1024, // 1 GB
            apiAccess: false,
            ssoSAML: false,
            onPremise: false,
            customWorkflows: false,
            features: [
                {
                    id: "scan",
                    name: "Scan de documents",
                    description: "Numérisez vos documents en haute qualité",
                    included: true,
                },
                {
                    id: "vault",
                    name: "Coffre-fort numérique",
                    description: "Stockage sécurisé et chiffré de vos documents personnels",
                    included: true,
                },
                {
                    id: "profile",
                    name: "Profil simple",
                    description: "Gestion de votre identité numérique",
                    included: true,
                },
                {
                    id: "family",
                    name: "Profil familial (max 5)",
                    description: "Partagez l'espace avec votre famille",
                    included: true,
                },
            ],
        },
        rbacLevels: [], // pas de RBAC pour citoyens
    },

    /* ─── ENTREPRISES ──────────────────────────── */
    business: {
        id: "business",
        label: "Enterprises",
        labelFr: "Entreprises",
        subtitle: "Accélérez votre productivité",
        description:
            "Gestion documentaire professionnelle avec multi-utilisateurs, workflows et API.",
        route: "/pro",
        isExternal: false,
        icon: "Building2",
        gradient: "from-violet-500 to-purple-400",
        color: "#8B5CF6",
        pricing: {
            base: {
                label: "Par utilisateur",
                amount: 15_000,
                currency: "XAF",
                cycle: "monthly",
                perUser: true,
            },
            addons: [
                {
                    moduleId: "isignature",
                    label: "iSignature",
                    amount: 5_000,
                    currency: "XAF",
                    cycle: "monthly",
                },
                {
                    moduleId: "iasted",
                    label: "iAsted — Assistant IA",
                    amount: 10_000,
                    currency: "XAF",
                    cycle: "monthly",
                },
            ],
            trialDays: 14,
            customQuote: false,
        },
        features: {
            maxUsers: 50,
            modules: ["idocument", "iarchive", "isignature", "iasted"],
            storage: 50 * 1024 * 1024 * 1024, // 50 GB
            apiAccess: true,
            ssoSAML: false,
            onPremise: false,
            customWorkflows: true,
            features: [
                {
                    id: "multi_users",
                    name: "Multi-utilisateurs (max 50)",
                    description: "Invitez votre équipe et gérez les permissions",
                    included: true,
                },
                {
                    id: "idocument",
                    name: "iDocument",
                    description: "Éditeur collaboratif temps réel",
                    included: true,
                },
                {
                    id: "iarchive",
                    name: "iArchive",
                    description: "Archivage légal avec SHA-256",
                    included: true,
                },
                {
                    id: "isignature",
                    name: "iSignature",
                    description: "Workflows de validation multi-étapes",
                    included: true,
                },
                {
                    id: "iasted",
                    name: "iAsted",
                    description: "Assistant IA — OCR, résumés, analytics",
                    included: true,
                },
                {
                    id: "api",
                    name: "Accès API",
                    description: "Intégrez DIGITALIUM dans vos outils existants",
                    included: true,
                },
                {
                    id: "workflows",
                    name: "Workflows personnalisés",
                    description: "Créez des circuits de validation sur mesure",
                    included: true,
                },
            ],
        },
        rbacLevels: ["org_admin", "org_manager", "org_member", "org_viewer"],
    },

    /* ─── INSTITUTIONS ─────────────────────────── */
    institutional: {
        id: "institutional",
        label: "Institutions",
        labelFr: "Institutions",
        subtitle: "Souveraineté numérique",
        description:
            "Solution souveraine pour les administrations publiques — tous modules, conformité, on-premise, SLA 99.9%.",
        route: "/institutional",
        isExternal: false,
        icon: "Landmark",
        gradient: "from-emerald-500 to-teal-400",
        color: "#10B981",
        pricing: {
            base: {
                label: "Sur devis",
                amount: -1, // sur devis
                currency: "XAF",
                cycle: "custom",
            },
            addons: [],
            trialDays: 0,
            customQuote: true,
        },
        features: {
            maxUsers: -1, // illimité
            modules: ["idocument", "iarchive", "isignature", "iasted"],
            storage: -1, // illimité
            apiAccess: true,
            ssoSAML: true,
            onPremise: true,
            sla: "99.9%",
            customWorkflows: true,
            features: [
                {
                    id: "all_modules",
                    name: "Tous les modules inclus",
                    description: "iDocument, iArchive, iSignature, iAsted",
                    included: true,
                },
                {
                    id: "compliance",
                    name: "Conformité légale",
                    description: "Conformité aux normes d'archivage public gabonaises",
                    included: true,
                },
                {
                    id: "on_premise",
                    name: "On-premise / Cloud privé",
                    description: "Déploiement sur infrastructure souveraine",
                    included: true,
                },
                {
                    id: "sso_saml",
                    name: "SSO SAML",
                    description: "Authentification unique via votre annuaire existant",
                    included: true,
                },
                {
                    id: "sla",
                    name: "SLA 99.9%",
                    description: "Disponibilité garantie avec support prioritaire",
                    included: true,
                },
                {
                    id: "unlimited_users",
                    name: "Utilisateurs illimités",
                    description: "Aucune limite sur le nombre de collaborateurs",
                    included: true,
                },
                {
                    id: "hierarchy",
                    name: "Hiérarchie multi-niveaux",
                    description: "Structure organisationnelle avec départements et services",
                    included: true,
                },
            ],
        },
        rbacLevels: ["org_admin", "org_manager", "org_member", "org_viewer"],
    },
} as const;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

export function getPersonaConfig(
    id: PersonaType
): PersonaConfig {
    return PERSONAS[id];
}

export function getPersonaByRoute(route: string): PersonaConfig | undefined {
    return Object.values(PERSONAS).find((p) => p.route === route);
}

export function isExternalPersona(id: PersonaType): boolean {
    return PERSONAS[id].isExternal;
}
