// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Rôles Métier par Type d'Unité (v3)
// Postes réalistes basés sur sociétés, administrations, organismes
// ═══════════════════════════════════════════════

import type { OrgUnitType } from "@/types/org-structure";

export interface BusinessRolePreset {
    nom: string;
    description: string;
    categorie: string;
    orgUnitType: OrgUnitType;
    niveau: number;
    couleur: string;
    icone: string;
}

// ─── Rôles par type d'unité (universels) ─────────────────

const PRESIDENCE_ROLES: BusinessRolePreset[] = [
    { nom: "Président(e)", description: "Président de l'organisation", categorie: "gouvernance", orgUnitType: "presidence", niveau: 1, couleur: "#EAB308", icone: "Crown" },
    { nom: "Président(e) Directeur(rice) Général(e)", description: "PDG — Président et directeur général", categorie: "gouvernance", orgUnitType: "presidence", niveau: 1, couleur: "#EAB308", icone: "Crown" },
    { nom: "Vice-Président(e)", description: "Vice-président de l'organisation", categorie: "gouvernance", orgUnitType: "presidence", niveau: 2, couleur: "#CA8A04", icone: "Shield" },
    { nom: "Président(e) du Conseil d'Administration", description: "PCA — Président du conseil d'administration", categorie: "gouvernance", orgUnitType: "presidence", niveau: 1, couleur: "#EAB308", icone: "Landmark" },
];

const DIRECTION_GENERALE_ROLES: BusinessRolePreset[] = [
    { nom: "Directeur(rice) Général(e)", description: "DG — Chef de la direction générale", categorie: "direction", orgUnitType: "direction_generale", niveau: 1, couleur: "#8B5CF6", icone: "Building2" },
    { nom: "Directeur(rice) Général(e) Adjoint(e)", description: "DGA — Adjoint au directeur général", categorie: "direction", orgUnitType: "direction_generale", niveau: 2, couleur: "#7C3AED", icone: "Building2" },
    { nom: "Secrétaire Général(e)", description: "SG — Coordination administrative générale", categorie: "direction", orgUnitType: "direction_generale", niveau: 2, couleur: "#6D28D9", icone: "FileText" },
];

const DIRECTION_ROLES: BusinessRolePreset[] = [
    { nom: "Directeur(rice)", description: "Responsable d'une direction", categorie: "direction", orgUnitType: "direction", niveau: 1, couleur: "#3B82F6", icone: "UserCog" },
    { nom: "Directeur(rice) Adjoint(e)", description: "Adjoint au directeur", categorie: "direction", orgUnitType: "direction", niveau: 2, couleur: "#2563EB", icone: "UserCog" },
];

const SOUS_DIRECTION_ROLES: BusinessRolePreset[] = [
    { nom: "Sous-Directeur(rice)", description: "Responsable de la sous-direction", categorie: "management", orgUnitType: "sous_direction", niveau: 1, couleur: "#06B6D4", icone: "UserCog" },
    { nom: "Chef de Division", description: "Responsable d'une division", categorie: "management", orgUnitType: "sous_direction", niveau: 2, couleur: "#0891B2", icone: "Users" },
];

const DEPARTEMENT_ROLES: BusinessRolePreset[] = [
    { nom: "Chef de Département", description: "Responsable du département", categorie: "management", orgUnitType: "departement", niveau: 1, couleur: "#10B981", icone: "Briefcase" },
    { nom: "Responsable", description: "Responsable de section", categorie: "management", orgUnitType: "departement", niveau: 2, couleur: "#059669", icone: "UserCog" },
    { nom: "Adjoint(e)", description: "Adjoint au responsable", categorie: "management", orgUnitType: "departement", niveau: 3, couleur: "#047857", icone: "Users" },
];

const SERVICE_ROLES: BusinessRolePreset[] = [
    { nom: "Chef de Service", description: "Responsable du service", categorie: "management", orgUnitType: "service", niveau: 1, couleur: "#F59E0B", icone: "ClipboardList" },
    { nom: "Responsable", description: "Responsable de section", categorie: "opérationnel", orgUnitType: "service", niveau: 2, couleur: "#D97706", icone: "UserCog" },
    { nom: "Conseiller", description: "Conseiller technique ou juridique", categorie: "expertise", orgUnitType: "service", niveau: 3, couleur: "#B45309", icone: "GraduationCap" },
    { nom: "Agent", description: "Agent d'exécution", categorie: "opérationnel", orgUnitType: "service", niveau: 4, couleur: "#92400E", icone: "User" },
];

const BUREAU_ROLES: BusinessRolePreset[] = [
    { nom: "Chef de Bureau", description: "Responsable du bureau", categorie: "management", orgUnitType: "bureau", niveau: 1, couleur: "#EF4444", icone: "ClipboardList" },
    { nom: "Agent", description: "Agent administratif", categorie: "opérationnel", orgUnitType: "bureau", niveau: 2, couleur: "#DC2626", icone: "User" },
    { nom: "Assistant(e)", description: "Assistant administratif", categorie: "support", orgUnitType: "bureau", niveau: 3, couleur: "#B91C1C", icone: "HeadphonesIcon" },
];

const UNITE_ROLES: BusinessRolePreset[] = [
    { nom: "Chef d'Unité", description: "Responsable de l'unité", categorie: "management", orgUnitType: "unite", niveau: 1, couleur: "#EC4899", icone: "UserCog" },
    { nom: "Technicien", description: "Technicien spécialisé", categorie: "opérationnel", orgUnitType: "unite", niveau: 2, couleur: "#DB2777", icone: "Wrench" },
    { nom: "Agent", description: "Agent d'exécution", categorie: "opérationnel", orgUnitType: "unite", niveau: 3, couleur: "#BE185D", icone: "User" },
];

const CELLULE_ROLES: BusinessRolePreset[] = [
    { nom: "Chef de Cellule", description: "Responsable de la cellule", categorie: "management", orgUnitType: "cellule", niveau: 1, couleur: "#6B7280", icone: "UserCog" },
    { nom: "Conseiller", description: "Conseiller spécialisé", categorie: "expertise", orgUnitType: "cellule", niveau: 2, couleur: "#4B5563", icone: "GraduationCap" },
    { nom: "Agent", description: "Agent de la cellule", categorie: "opérationnel", orgUnitType: "cellule", niveau: 3, couleur: "#374151", icone: "User" },
];

// ─── Mapping type d'unité → rôles ─────────────────

export const ROLES_BY_UNIT_TYPE: Record<OrgUnitType, BusinessRolePreset[]> = {
    presidence: PRESIDENCE_ROLES,
    direction_generale: DIRECTION_GENERALE_ROLES,
    direction: DIRECTION_ROLES,
    sous_direction: SOUS_DIRECTION_ROLES,
    departement: DEPARTEMENT_ROLES,
    service: SERVICE_ROLES,
    bureau: BUREAU_ROLES,
    unite: UNITE_ROLES,
    cellule: CELLULE_ROLES,
};

/**
 * Get all role presets for a given unit type.
 */
export function getRolesForUnitType(unitType: OrgUnitType): BusinessRolePreset[] {
    return ROLES_BY_UNIT_TYPE[unitType] ?? [];
}

/**
 * Get all role presets across all unit types (flat list).
 * Used for bulk loading all presets at once.
 */
export function getAllRolePresets(): BusinessRolePreset[] {
    return Object.values(ROLES_BY_UNIT_TYPE).flat();
}

/**
 * Get all role presets for unit types available in a given org type.
 */
export function getRolePresetsForOrgType(orgType: string, vocabulary: OrgUnitType[]): BusinessRolePreset[] {
    return vocabulary.flatMap((unitType) => ROLES_BY_UNIT_TYPE[unitType] ?? []);
}

// ─── Catégories de rôles ─────────────────

export const ROLE_CATEGORIES = [
    { id: "gouvernance", label: "Gouvernance", couleur: "#EAB308" },
    { id: "direction", label: "Direction", couleur: "#8B5CF6" },
    { id: "management", label: "Management", couleur: "#3B82F6" },
    { id: "expertise", label: "Expertise", couleur: "#10B981" },
    { id: "opérationnel", label: "Opérationnel", couleur: "#F59E0B" },
    { id: "support", label: "Support", couleur: "#6B7280" },
    { id: "politique", label: "Politique", couleur: "#EF4444" },
] as const;
