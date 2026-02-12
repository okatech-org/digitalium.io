// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Constants
// ═══════════════════════════════════════════════

export const APP_NAME = "DIGITALIUM.IO";
export const APP_DESCRIPTION =
    "Plateforme d'archivage intelligent et de gestion documentaire pour le Gabon";
export const APP_VERSION = "1.0.0";

export const COMPANY = {
    name: "DIGITALIUM",
    country: "Gabon",
    city: "Libreville",
    website: "https://digitalium.io",
    email: "contact@digitalium.io",
};

export const THEME = {
    primary: "#3B82F6",
    accent: "#8B5CF6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
};

export const LIMITS = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxDocumentTitle: 200,
    maxArchiveRetentionYears: 99,
    maxCollaborators: 50,
    maxSignatureSteps: 10,
};

export const SUBSCRIPTION_PLANS = {
    free: {
        id: "free",
        name: "Gratuit",
        price: 0,
        currency: "XAF",
        documents: 10,
        archives: 5,
        storage: 100 * 1024 * 1024, // 100MB
    },
    starter: {
        id: "starter",
        name: "Starter",
        price: 5000,
        currency: "XAF",
        documents: 100,
        archives: 50,
        storage: 1024 * 1024 * 1024, // 1GB
    },
    professional: {
        id: "professional",
        name: "Professionnel",
        price: 15000,
        currency: "XAF",
        documents: -1, // unlimited
        archives: -1,
        storage: 10 * 1024 * 1024 * 1024, // 10GB
    },
    enterprise: {
        id: "enterprise",
        name: "Entreprise",
        price: 50000,
        currency: "XAF",
        documents: -1,
        archives: -1,
        storage: 100 * 1024 * 1024 * 1024, // 100GB
    },
};
