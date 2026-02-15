// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Structure Organisationnelle (v2)
// Sites, Unités Org, Rôles Métier, Progression
// ═══════════════════════════════════════════════

import type { Id } from "../../convex/_generated/dataModel";

// ─── Sites physiques ──────────────────────────

export type SiteType = "siege" | "filiale" | "agence" | "bureau_regional" | "antenne";

export interface OrgSite {
    _id: Id<"org_sites">;
    organizationId: Id<"organizations">;
    nom: string;
    type: SiteType;
    adresse: string;
    ville: string;
    pays: string;
    telephone?: string;
    email?: string;
    estSiege: boolean;
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface OrgSiteInput {
    nom: string;
    type: SiteType;
    adresse: string;
    ville: string;
    pays: string;
    telephone?: string;
    email?: string;
    estSiege: boolean;
}

export const SITE_TYPE_LABELS: Record<SiteType, string> = {
    siege: "Siège social",
    filiale: "Filiale",
    agence: "Agence",
    bureau_regional: "Bureau régional",
    antenne: "Antenne",
};

// ─── Unités organisationnelles ────────────────

export type OrgUnitType =
    | "presidence"
    | "direction_generale"
    | "direction"
    | "sous_direction"
    | "departement"
    | "service"
    | "bureau"
    | "unite"
    | "cellule";

export interface OrgUnit {
    _id: Id<"org_units">;
    organizationId: Id<"organizations">;
    siteId?: Id<"org_sites">;
    nom: string;
    type: OrgUnitType;
    parentId?: Id<"org_units">;
    responsable?: string;
    description?: string;
    couleur: string;
    ordre: number;
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface OrgUnitNode extends OrgUnit {
    children: OrgUnitNode[];
}

export interface OrgUnitInput {
    nom: string;
    type: OrgUnitType;
    parentId?: Id<"org_units">;
    siteId?: Id<"org_sites">;
    responsable?: string;
    description?: string;
    couleur?: string;
}

export const ORG_UNIT_TYPE_LABELS: Record<OrgUnitType, string> = {
    presidence: "Présidence",
    direction_generale: "Direction Générale",
    direction: "Direction",
    sous_direction: "Sous-Direction",
    departement: "Département",
    service: "Service",
    bureau: "Bureau",
    unite: "Unité",
    cellule: "Cellule",
};

export const ORG_UNIT_TYPE_COLORS: Record<OrgUnitType, string> = {
    presidence: "#EAB308",
    direction_generale: "#8B5CF6",
    direction: "#3B82F6",
    sous_direction: "#06B6D4",
    departement: "#10B981",
    service: "#F59E0B",
    bureau: "#EF4444",
    unite: "#EC4899",
    cellule: "#6B7280",
};

// Vocabulaire des unités par type d'organisation
export type OrgType = "enterprise" | "institution" | "government" | "organism";

export const ORG_UNIT_VOCABULARY: Record<OrgType, OrgUnitType[]> = {
    enterprise: ["presidence", "direction_generale", "direction", "departement", "service"],
    government: ["presidence", "direction_generale", "direction", "sous_direction", "service", "bureau"],
    institution: ["presidence", "direction_generale", "departement", "service", "unite"],
    organism: ["presidence", "direction_generale", "direction", "departement", "cellule"],
};

// ─── Rôles métier ─────────────────────────────

export interface BusinessRole {
    _id: Id<"business_roles">;
    organizationId: Id<"organizations">;
    orgUnitType?: OrgUnitType;
    nom: string;
    description?: string;
    categorie?: string;
    niveau?: number;
    couleur?: string;
    icone?: string;
    estActif: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface BusinessRoleInput {
    nom: string;
    description?: string;
    categorie?: string;
    niveau?: number;
    couleur?: string;
    icone?: string;
}

// ─── Progression de configuration ─────────────

export interface ConfigProgress {
    profilComplete: boolean;
    structureOrgComplete: boolean;
    structureClassementComplete: boolean;
    modulesConfigComplete: boolean;
    automationConfigComplete: boolean;
    deploymentConfigComplete: boolean;
}

export type OrgStatus = "brouillon" | "prete" | "active" | "trial" | "suspended" | "resiliee";

export const ORG_STATUS_LABELS: Record<OrgStatus, string> = {
    brouillon: "Brouillon",
    prete: "Prête",
    active: "Active",
    trial: "Essai",
    suspended: "Suspendue",
    resiliee: "Résiliée",
};

export const ORG_STATUS_COLORS: Record<OrgStatus, { bg: string; text: string; dot: string }> = {
    brouillon: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-400" },
    prete: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" },
    active: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
    trial: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" },
    suspended: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-400" },
    resiliee: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
};

// ─── Hosting ──────────────────────────────────

export type HostingType = "cloud" | "datacenter" | "local";

export interface HostingConfig {
    type: HostingType;
    domain?: string;
    pagePublique?: boolean;
}

export const HOSTING_LABELS: Record<HostingType, string> = {
    cloud: "Cloud",
    datacenter: "Data Center DIGITALIUM",
    local: "Local (On-Premise)",
};
