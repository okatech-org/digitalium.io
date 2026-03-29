// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Types & Constants
// Central type definitions for the bio-inspired nervous system
// ═══════════════════════════════════════════════

// ─── Cortex Modules ─────────────────────────────
export const CORTEX = {
    LIMBIQUE: "limbique",
    HIPPOCAMPE: "hippocampe",
    PLASTICITE: "plasticite",
    PREFRONTAL: "prefrontal",
    SENSORIEL: "sensoriel",
    VISUEL: "visuel",
    AUDITIF: "auditif",
    MOTEUR: "moteur",
} as const;

export type CortexType = (typeof CORTEX)[keyof typeof CORTEX];

// ─── Signal Types ───────────────────────────────
export const SIGNAL_TYPES = {
    // ── Métier (CRUD entities) ──
    ORGANISATION_CREEE: "ORGANISATION_CREEE",
    ORGANISATION_MODIFIEE: "ORGANISATION_MODIFIEE",
    ORGANISATION_STATUT_CHANGE: "ORGANISATION_STATUT_CHANGE",
    MEMBRE_AJOUTE: "MEMBRE_AJOUTE",
    MEMBRE_MODIFIE: "MEMBRE_MODIFIE",
    MEMBRE_SUPPRIME: "MEMBRE_SUPPRIME",
    DOCUMENT_CREE: "DOCUMENT_CREE",
    DOCUMENT_MODIFIE: "DOCUMENT_MODIFIE",
    DOCUMENT_SUPPRIME: "DOCUMENT_SUPPRIME",
    DOCUMENT_STATUT_CHANGE: "DOCUMENT_STATUT_CHANGE",
    DOSSIER_CREE: "DOSSIER_CREE",
    DOSSIER_MODIFIE: "DOSSIER_MODIFIE",
    DOSSIER_SUPPRIME: "DOSSIER_SUPPRIME",
    ARCHIVE_CREEE: "ARCHIVE_CREEE",
    ARCHIVE_MODIFIEE: "ARCHIVE_MODIFIEE",
    ARCHIVE_STATUT_CHANGE: "ARCHIVE_STATUT_CHANGE",
    ARCHIVE_DETRUITE: "ARCHIVE_DETRUITE",
    ARCHIVE_GEL_JURIDIQUE: "ARCHIVE_GEL_JURIDIQUE",
    SIGNATURE_DEMANDEE: "SIGNATURE_DEMANDEE",
    SIGNATURE_SIGNEE: "SIGNATURE_SIGNEE",
    SIGNATURE_COMPLETEE: "SIGNATURE_COMPLETEE",
    SIGNATURE_ANNULEE: "SIGNATURE_ANNULEE",
    LEAD_CREE: "LEAD_CREE",
    LEAD_MODIFIE: "LEAD_MODIFIE",
    LEAD_CONVERTI: "LEAD_CONVERTI",
    CLIENT_CREE: "CLIENT_CREE",
    CLIENT_MODIFIE: "CLIENT_MODIFIE",
    PAIEMENT_CREE: "PAIEMENT_CREE",
    PAIEMENT_STATUT_CHANGE: "PAIEMENT_STATUT_CHANGE",
    ABONNEMENT_MODIFIE: "ABONNEMENT_MODIFIE",
    CONFIG_MODIFIEE: "CONFIG_MODIFIEE",
    CLASSEMENT_MODIFIE: "CLASSEMENT_MODIFIE",
    ACCES_MODIFIE: "ACCES_MODIFIE",
    ROLE_MODIFIE: "ROLE_MODIFIE",
    PERMISSION_MODIFIEE: "PERMISSION_MODIFIEE",

    // ── Système ──
    SYNC_POSTGRES_DEMANDEE: "SYNC_POSTGRES_DEMANDEE",
    SYNC_POSTGRES_OK: "SYNC_POSTGRES_OK",
    SYNC_POSTGRES_ERREUR: "SYNC_POSTGRES_ERREUR",
    CRON_EXECUTE: "CRON_EXECUTE",
    ERREUR_SYSTEME: "ERREUR_SYSTEME",
    HEALTH_CHECK: "HEALTH_CHECK",

    // ── Utilisateur ──
    UTILISATEUR_CONNECTE: "UTILISATEUR_CONNECTE",
    UTILISATEUR_DECONNECTE: "UTILISATEUR_DECONNECTE",
    NOTIFICATION_CREEE: "NOTIFICATION_CREEE",
    NOTIFICATION_LUE: "NOTIFICATION_LUE",

    // ── AI ──
    AI_IMPORT_DEMANDE: "AI_IMPORT_DEMANDE",
    AI_IMPORT_COMPLETE: "AI_IMPORT_COMPLETE",
    AI_CONVERSATION_CREEE: "AI_CONVERSATION_CREEE",
} as const;

export type SignalType = (typeof SIGNAL_TYPES)[keyof typeof SIGNAL_TYPES];

// ─── Action Categories ──────────────────────────
export const CATEGORIES_ACTION = {
    METIER: "metier",
    SYSTEME: "systeme",
    UTILISATEUR: "utilisateur",
    SECURITE: "securite",
} as const;

export type CategorieAction = (typeof CATEGORIES_ACTION)[keyof typeof CATEGORIES_ACTION];

// ─── Signal Priority ────────────────────────────
export const PRIORITE = {
    BASSE: 0,
    NORMALE: 1,
    HAUTE: 2,
    CRITIQUE: 3,
} as const;

export type PrioriteSignal = (typeof PRIORITE)[keyof typeof PRIORITE];

// ─── Interfaces ─────────────────────────────────

export interface SignalPondere {
    type: SignalType;
    source: CortexType | string;
    destination: CortexType | string;
    payload: Record<string, unknown>;
    confiance: number; // 0.0 - 1.0
    priorite: PrioriteSignal;
    correlationId: string;
    ttl: number; // ms before expiry
    traite: boolean;
    emetteurId?: string; // userId who triggered
    entiteId?: string; // entity ID involved
    entiteType?: string; // entity table name
    organisationId?: string; // org context
}

export interface ActionHistorique {
    action: string;
    categorie: CategorieAction;
    entiteType: string;
    entiteId: string;
    userId: string;
    organisationId?: string;
    details: {
        avant?: Record<string, unknown>;
        apres?: Record<string, unknown>;
        description?: string;
        metadata?: Record<string, unknown>;
    };
}

// ─── Signal → Cortex Routing Map ────────────────
export const SIGNAL_ROUTING: Record<string, CortexType[]> = {
    // Documents → visuel + hippocampe
    DOCUMENT_CREE: [CORTEX.VISUEL, CORTEX.HIPPOCAMPE],
    DOCUMENT_MODIFIE: [CORTEX.VISUEL, CORTEX.HIPPOCAMPE],
    DOCUMENT_SUPPRIME: [CORTEX.HIPPOCAMPE],
    DOCUMENT_STATUT_CHANGE: [CORTEX.PREFRONTAL, CORTEX.HIPPOCAMPE],

    // Archives → hippocampe + prefrontal
    ARCHIVE_CREEE: [CORTEX.HIPPOCAMPE, CORTEX.PREFRONTAL],
    ARCHIVE_MODIFIEE: [CORTEX.HIPPOCAMPE],
    ARCHIVE_STATUT_CHANGE: [CORTEX.PREFRONTAL, CORTEX.HIPPOCAMPE],
    ARCHIVE_DETRUITE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF],
    ARCHIVE_GEL_JURIDIQUE: [CORTEX.PREFRONTAL, CORTEX.AUDITIF],

    // Signatures → prefrontal + auditif
    SIGNATURE_DEMANDEE: [CORTEX.PREFRONTAL, CORTEX.AUDITIF],
    SIGNATURE_SIGNEE: [CORTEX.PREFRONTAL, CORTEX.HIPPOCAMPE],
    SIGNATURE_COMPLETEE: [CORTEX.PREFRONTAL, CORTEX.AUDITIF, CORTEX.HIPPOCAMPE],
    SIGNATURE_ANNULEE: [CORTEX.HIPPOCAMPE],

    // Organisation → hippocampe + plasticité
    ORGANISATION_CREEE: [CORTEX.HIPPOCAMPE, CORTEX.PLASTICITE],
    ORGANISATION_MODIFIEE: [CORTEX.HIPPOCAMPE, CORTEX.PLASTICITE],
    ORGANISATION_STATUT_CHANGE: [CORTEX.HIPPOCAMPE, CORTEX.PREFRONTAL],

    // Système → moteur + monitoring
    SYNC_POSTGRES_DEMANDEE: [CORTEX.MOTEUR],
    SYNC_POSTGRES_OK: [CORTEX.HIPPOCAMPE],
    SYNC_POSTGRES_ERREUR: [CORTEX.AUDITIF],
    ERREUR_SYSTEME: [CORTEX.AUDITIF],
    HEALTH_CHECK: [CORTEX.HIPPOCAMPE],
    CRON_EXECUTE: [CORTEX.HIPPOCAMPE],

    // Notifications → auditif
    NOTIFICATION_CREEE: [CORTEX.AUDITIF],

    // Default: everything goes to hippocampe for logging
};

// ─── Default TTL Values (ms) ────────────────────
export const TTL = {
    STANDARD: 24 * 60 * 60 * 1000,      // 24h
    COURT: 1 * 60 * 60 * 1000,          // 1h
    LONG: 7 * 24 * 60 * 60 * 1000,      // 7 jours
    CRITIQUE: 30 * 24 * 60 * 60 * 1000,  // 30 jours
} as const;

// ─── OrgConfig ─────────────────────────────────
// Type runtime pour organizations.config (stocké en v.any() dans le schéma Convex).
// Utilisé pour caster org.config de manière typée sans modifier le schéma.
export interface OrgConfig {
    classement?: {
        maxDepth?: number;
        depthStrategy?: "synthetique" | "intelligente";
    };
    iArchive?: {
        yearAlignmentMode?: string;
        fiscalYearEndMonth?: number;
        archivageAutomatique?: boolean;
    };
    automation?: {
        archivageApresSignature?: boolean;
    };
    iDocument?: boolean;
    iSignature?: boolean;
    [key: string]: unknown; // Allow extra fields for forward compat
}
