// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Templates Organigrammes (v2)
// Templates d'unités organisationnelles par type d'organisation
// ═══════════════════════════════════════════════

import type { OrgType, OrgUnitType } from "@/types/org-structure";

export interface OrgUnitTemplate {
    tempId: string;
    nom: string;
    type: OrgUnitType;
    parentTempId?: string;
    couleur: string;
    description?: string;
    ordre: number;
}

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

export function getEnterpriseTemplate(): OrgUnitTemplate[] {
    const dg = uid(), daf = uid(), dt = uid(), dj = uid();
    const compta = uid(), rh = uid(), prod = uid(), comm = uid();
    return [
        { tempId: dg, nom: "Direction Générale", type: "direction_generale", couleur: "#3B82F6", ordre: 0 },
        { tempId: daf, nom: "Direction Administrative et Financière", type: "direction", parentTempId: dg, couleur: "#8B5CF6", ordre: 1 },
        { tempId: compta, nom: "Service Comptabilité", type: "service", parentTempId: daf, couleur: "#06B6D4", ordre: 2 },
        { tempId: rh, nom: "Service Ressources Humaines", type: "service", parentTempId: daf, couleur: "#10B981", ordre: 3 },
        { tempId: dt, nom: "Direction Technique", type: "direction", parentTempId: dg, couleur: "#6366F1", ordre: 4 },
        { tempId: prod, nom: "Service Production", type: "service", parentTempId: dt, couleur: "#F59E0B", ordre: 5 },
        { tempId: comm, nom: "Service Commercial", type: "service", parentTempId: dt, couleur: "#EC4899", ordre: 6 },
        { tempId: dj, nom: "Direction Juridique", type: "direction", parentTempId: dg, couleur: "#10B981", ordre: 7 },
    ];
}

export function getGovernmentTemplate(): OrgUnitTemplate[] {
    const cab = uid(), sg = uid(), dgs = uid(), da = uid();
    const pers = uid(), budg = uid(), dtec = uid();
    return [
        { tempId: cab, nom: "Cabinet", type: "direction_generale", couleur: "#3B82F6", ordre: 0 },
        { tempId: sg, nom: "Secrétariat Général", type: "direction", parentTempId: cab, couleur: "#8B5CF6", ordre: 1 },
        { tempId: dgs, nom: "Direction Générale des Services", type: "direction", parentTempId: cab, couleur: "#6366F1", ordre: 2 },
        { tempId: da, nom: "Direction Administrative", type: "sous_direction", parentTempId: dgs, couleur: "#10B981", ordre: 3 },
        { tempId: pers, nom: "Service du Personnel", type: "service", parentTempId: da, couleur: "#06B6D4", ordre: 4 },
        { tempId: budg, nom: "Service Budget", type: "service", parentTempId: da, couleur: "#F59E0B", ordre: 5 },
        { tempId: dtec, nom: "Direction Technique", type: "direction", parentTempId: cab, couleur: "#EC4899", ordre: 6 },
    ];
}

export function getInstitutionTemplate(): OrgUnitTemplate[] {
    const dir = uid(), dep1 = uid(), dep2 = uid(), svc = uid();
    return [
        { tempId: dir, nom: "Direction", type: "direction_generale", couleur: "#3B82F6", ordre: 0 },
        { tempId: dep1, nom: "Département Académique", type: "departement", parentTempId: dir, couleur: "#8B5CF6", ordre: 1 },
        { tempId: svc, nom: "Service Scolarité", type: "service", parentTempId: dep1, couleur: "#06B6D4", ordre: 2 },
        { tempId: dep2, nom: "Département Administratif", type: "departement", parentTempId: dir, couleur: "#10B981", ordre: 3 },
    ];
}

export function getOrganismTemplate(): OrgUnitTemplate[] {
    const dg = uid(), dir1 = uid(), dir2 = uid(), cell = uid();
    return [
        { tempId: dg, nom: "Direction Générale", type: "direction_generale", couleur: "#3B82F6", ordre: 0 },
        { tempId: dir1, nom: "Direction des Prestations", type: "direction", parentTempId: dg, couleur: "#8B5CF6", ordre: 1 },
        { tempId: cell, nom: "Cellule Contrôle", type: "cellule", parentTempId: dir1, couleur: "#06B6D4", ordre: 2 },
        { tempId: dir2, nom: "Direction Administrative", type: "direction", parentTempId: dg, couleur: "#10B981", ordre: 3 },
    ];
}

export function getOrgUnitTemplate(orgType: OrgType): OrgUnitTemplate[] {
    switch (orgType) {
        case "enterprise": return getEnterpriseTemplate();
        case "government": return getGovernmentTemplate();
        case "institution": return getInstitutionTemplate();
        case "organism": return getOrganismTemplate();
        default: return getEnterpriseTemplate();
    }
}

export const ALLOWED_CHILDREN: Record<OrgUnitType, OrgUnitType[]> = {
    presidence: ["direction_generale", "direction", "sous_direction", "departement", "service", "cellule"],
    direction_generale: ["direction", "sous_direction", "departement", "service", "cellule"],
    direction: ["sous_direction", "departement", "service", "bureau", "cellule"],
    sous_direction: ["service", "bureau", "unite", "cellule"],
    departement: ["service", "bureau", "unite", "cellule"],
    service: ["bureau", "unite", "cellule"],
    bureau: ["unite", "cellule"],
    unite: ["cellule"],
    cellule: [],
};
