// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Structure de Classement (v2)
// Filing Structures, Cells, Access Rules, Overrides
// ═══════════════════════════════════════════════

import type { Id } from "../../convex/_generated/dataModel";

// ─── Niveaux d'accès ──────────────────────────

export type AccessLevel = "aucun" | "lecture" | "ecriture" | "gestion" | "admin";

export const ACCESS_LEVEL_ORDER: Record<AccessLevel, number> = {
    aucun: 0,
    lecture: 1,
    ecriture: 2,
    gestion: 3,
    admin: 4,
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
    aucun: "Aucun",
    lecture: "Lecture",
    ecriture: "Écriture",
    gestion: "Gestion",
    admin: "Administration",
};

export const ACCESS_LEVEL_ICONS: Record<AccessLevel, string> = {
    aucun: "—",
    lecture: "👁",
    ecriture: "✏️",
    gestion: "⚙️",
    admin: "🔑",
};

// ─── Confidentialité ──────────────────────────

export type ConfidentialityLevel = "public" | "restreint" | "confidentiel";

export const CONFIDENTIALITY_LABELS: Record<ConfidentialityLevel, string> = {
    public: "Public",
    restreint: "Restreint",
    confidentiel: "Confidentiel",
};

// ─── Filing Structure (modèle de classement) ──

export interface FilingStructure {
    _id: Id<"filing_structures">;
    organizationId: Id<"organizations">;
    nom: string;
    description?: string;
    type: "standard" | "custom";
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

// ─── Filing Cell (cellule de classement) ──────

export interface FilingCell {
    _id: Id<"filing_cells">;
    filingStructureId: Id<"filing_structures">;
    organizationId: Id<"organizations">;
    code: string;
    intitule: string;
    parentId?: Id<"filing_cells">;
    niveau: number;
    description?: string;
    accessDefaut: ConfidentialityLevel;
    moduleId?: string;
    icone?: string;
    couleur?: string;
    tags: string[];
    ordre: number;
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface FilingCellNode extends FilingCell {
    children: FilingCellNode[];
}

export interface FilingCellInput {
    code: string;
    intitule: string;
    parentId?: Id<"filing_cells">;
    niveau?: number;
    description?: string;
    accessDefaut?: ConfidentialityLevel;
    moduleId?: string;
    icone?: string;
    couleur?: string;
    tags?: string[];
}

// ─── Cell Access Rules (matrice d'accès) ──────

export interface CellAccessRule {
    _id: Id<"cell_access_rules">;
    organizationId: Id<"organizations">;
    filingCellId: Id<"filing_cells">;
    orgUnitId?: Id<"org_units">;
    businessRoleId?: Id<"business_roles">;
    acces: AccessLevel;
    priorite: number;
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface CellAccessRuleInput {
    filingCellId: Id<"filing_cells">;
    orgUnitId?: Id<"org_units">;
    businessRoleId?: Id<"business_roles">;
    acces: AccessLevel;
    priorite?: number;
}

// ─── Cell Access Overrides (habilitations) ────

export interface CellAccessOverride {
    _id: Id<"cell_access_overrides">;
    organizationId: Id<"organizations">;
    filingCellId: Id<"filing_cells">;
    userId: string;
    acces: AccessLevel;
    motif?: string;
    accordePar: string;
    dateExpiration?: number;
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface CellAccessOverrideInput {
    filingCellId: Id<"filing_cells">;
    userId: string;
    acces: AccessLevel;
    motif?: string;
    dateExpiration?: number;
}

// ─── Résolution d'accès ───────────────────────

export interface AccessResolution {
    effectiveAccess: AccessLevel;
    source: "bypass" | "override" | "rule" | "default" | "none";
    ruleId?: Id<"cell_access_rules">;
    overrideId?: Id<"cell_access_overrides">;
    cappedBy?: string; // platform role that capped the access
}

// Plafond par rôle plateforme
export const PLATFORM_ROLE_CAP: Record<string, AccessLevel> = {
    system_admin: "admin",
    platform_admin: "admin",
    org_admin: "admin",
    org_manager: "gestion",
    org_member: "ecriture",
    org_viewer: "lecture",
};

/**
 * Retourne le minimum entre deux niveaux d'accès.
 */
export function minAccess(a: AccessLevel, b: AccessLevel): AccessLevel {
    return ACCESS_LEVEL_ORDER[a] <= ACCESS_LEVEL_ORDER[b] ? a : b;
}
