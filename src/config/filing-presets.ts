// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Templates Classement (v2)
// Templates de structures de classement par type d'org
// + Référentiel OHADA
// ═══════════════════════════════════════════════

import type { OrgType } from "@/types/org-structure";
import type { ConfidentialityLevel } from "@/types/filing";

export interface FilingCellTemplate {
    tempId: string;
    parentTempId?: string;
    code: string;
    intitule: string;
    niveau: number;
    accessDefaut: ConfidentialityLevel;
    moduleId?: string;
    icone?: string;
    couleur?: string;
    tags: string[];
    ordre: number;
}

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

export function getEnterpriseFilingTemplate(): FilingCellTemplate[] {
    const f1 = uid(), f2 = uid(), f3 = uid(), f4 = uid(), f5 = uid(), f6 = uid();
    const f1a = uid(), f1b = uid(), f1c = uid();
    const f2a = uid(), f2b = uid(), f2c = uid();
    const f3a = uid(), f3b = uid(), f3c = uid();
    const f4a = uid(), f4b = uid(), f4c = uid();
    const f5a = uid(), f5b = uid(), f5c = uid();
    const f6a = uid(), f6b = uid(), f6c = uid();

    return [
        // Racines
        { tempId: f1, code: "FISC", intitule: "Documents Fiscaux", niveau: 0, accessDefaut: "restreint", moduleId: "iarchive", icone: "Landmark", couleur: "#F59E0B", tags: ["fiscal", "ohada"], ordre: 0 },
        { tempId: f1a, parentTempId: f1, code: "FISC-TVA", intitule: "Déclarations TVA", niveau: 1, accessDefaut: "restreint", tags: ["fiscal"], ordre: 0 },
        { tempId: f1b, parentTempId: f1, code: "FISC-BIL", intitule: "Bilans Annuels", niveau: 1, accessDefaut: "restreint", tags: ["fiscal"], ordre: 1 },
        { tempId: f1c, parentTempId: f1, code: "FISC-LIA", intitule: "Liasses Fiscales", niveau: 1, accessDefaut: "confidentiel", tags: ["fiscal"], ordre: 2 },

        { tempId: f2, code: "RH", intitule: "Documents RH", niveau: 0, accessDefaut: "restreint", moduleId: "idocument", icone: "Users", couleur: "#3B82F6", tags: ["rh", "social"], ordre: 1 },
        { tempId: f2a, parentTempId: f2, code: "RH-CTR", intitule: "Contrats de Travail", niveau: 1, accessDefaut: "confidentiel", tags: ["rh", "contrat"], ordre: 0 },
        { tempId: f2b, parentTempId: f2, code: "RH-PAI", intitule: "Bulletins de Paie", niveau: 1, accessDefaut: "confidentiel", tags: ["rh", "paie"], ordre: 1 },
        { tempId: f2c, parentTempId: f2, code: "RH-CON", intitule: "Congés", niveau: 1, accessDefaut: "restreint", tags: ["rh"], ordre: 2 },

        { tempId: f3, code: "JUR", intitule: "Contrats & Juridique", niveau: 0, accessDefaut: "restreint", moduleId: "isignature", icone: "Scale", couleur: "#10B981", tags: ["juridique", "contrats"], ordre: 2 },
        { tempId: f3a, parentTempId: f3, code: "JUR-FRN", intitule: "Contrats Fournisseurs", niveau: 1, accessDefaut: "restreint", tags: ["juridique"], ordre: 0 },
        { tempId: f3b, parentTempId: f3, code: "JUR-PV", intitule: "PV Assemblée", niveau: 1, accessDefaut: "confidentiel", tags: ["juridique", "pv"], ordre: 1 },
        { tempId: f3c, parentTempId: f3, code: "JUR-STA", intitule: "Statuts", niveau: 1, accessDefaut: "confidentiel", tags: ["juridique"], ordre: 2 },

        { tempId: f4, code: "COM", intitule: "Documents Commerciaux", niveau: 0, accessDefaut: "restreint", moduleId: "idocument", icone: "Briefcase", couleur: "#8B5CF6", tags: ["commercial", "client"], ordre: 3 },
        { tempId: f4a, parentTempId: f4, code: "COM-FAC", intitule: "Factures Clients", niveau: 1, accessDefaut: "restreint", tags: ["commercial"], ordre: 0 },
        { tempId: f4b, parentTempId: f4, code: "COM-DEV", intitule: "Devis", niveau: 1, accessDefaut: "public", tags: ["commercial"], ordre: 1 },
        { tempId: f4c, parentTempId: f4, code: "COM-BDC", intitule: "Bons de Commande", niveau: 1, accessDefaut: "restreint", tags: ["commercial"], ordre: 2 },

        { tempId: f5, code: "TEC", intitule: "Documents Techniques", niveau: 0, accessDefaut: "restreint", moduleId: "idocument", icone: "Wrench", couleur: "#06B6D4", tags: ["technique"], ordre: 4 },
        { tempId: f5a, parentTempId: f5, code: "TEC-PLN", intitule: "Plans", niveau: 1, accessDefaut: "restreint", tags: ["technique"], ordre: 0 },
        { tempId: f5b, parentTempId: f5, code: "TEC-MNT", intitule: "Rapports Maintenance", niveau: 1, accessDefaut: "restreint", tags: ["technique"], ordre: 1 },
        { tempId: f5c, parentTempId: f5, code: "TEC-NRM", intitule: "Normes", niveau: 1, accessDefaut: "public", tags: ["technique"], ordre: 2 },

        { tempId: f6, code: "CFT", intitule: "Coffre-Fort Numérique", niveau: 0, accessDefaut: "confidentiel", moduleId: "iarchive", icone: "Lock", couleur: "#F43F5E", tags: ["coffre-fort", "sécurisé"], ordre: 5 },
        { tempId: f6a, parentTempId: f6, code: "CFT-PRO", intitule: "Titres de Propriété", niveau: 1, accessDefaut: "confidentiel", tags: ["coffre-fort"], ordre: 0 },
        { tempId: f6b, parentTempId: f6, code: "CFT-NOT", intitule: "Actes Notariés", niveau: 1, accessDefaut: "confidentiel", tags: ["coffre-fort"], ordre: 1 },
        { tempId: f6c, parentTempId: f6, code: "CFT-BRV", intitule: "Brevets", niveau: 1, accessDefaut: "confidentiel", tags: ["coffre-fort"], ordre: 2 },
    ];
}

export function getGovernmentFilingTemplate(): FilingCellTemplate[] {
    const a = uid(), b = uid(), c = uid(), d = uid();
    const a1 = uid(), a2 = uid(), b1 = uid(), c1 = uid();
    return [
        { tempId: a, code: "ADM", intitule: "Actes Administratifs", niveau: 0, accessDefaut: "restreint", icone: "FileText", couleur: "#3B82F6", tags: ["administratif"], ordre: 0 },
        { tempId: a1, parentTempId: a, code: "ADM-ARR", intitule: "Arrêtés", niveau: 1, accessDefaut: "public", tags: ["administratif"], ordre: 0 },
        { tempId: a2, parentTempId: a, code: "ADM-CIR", intitule: "Circulaires", niveau: 1, accessDefaut: "public", tags: ["administratif"], ordre: 1 },
        { tempId: b, code: "FIN", intitule: "Finances Publiques", niveau: 0, accessDefaut: "restreint", icone: "Landmark", couleur: "#F59E0B", tags: ["finances", "budget"], ordre: 1 },
        { tempId: b1, parentTempId: b, code: "FIN-BDG", intitule: "Budget", niveau: 1, accessDefaut: "confidentiel", tags: ["budget"], ordre: 0 },
        { tempId: c, code: "RH", intitule: "Fonction Publique", niveau: 0, accessDefaut: "restreint", icone: "Users", couleur: "#10B981", tags: ["rh", "fonction-publique"], ordre: 2 },
        { tempId: c1, parentTempId: c, code: "RH-AGT", intitule: "Dossiers Agents", niveau: 1, accessDefaut: "confidentiel", tags: ["rh"], ordre: 0 },
        { tempId: d, code: "CFT", intitule: "Archives Sécurisées", niveau: 0, accessDefaut: "confidentiel", icone: "Lock", couleur: "#F43F5E", tags: ["coffre-fort"], ordre: 3 },
    ];
}

export function getInstitutionFilingTemplate(): FilingCellTemplate[] {
    const a = uid(), b = uid(), c = uid(), d = uid(), e = uid(), f = uid(), g = uid();
    const a1 = uid(), a2 = uid(), a3 = uid();
    const b1 = uid(), b2 = uid();
    const c1 = uid(), c2 = uid(), c3 = uid();
    const d1 = uid(), d2 = uid();
    const e1 = uid(), e2 = uid();
    const f1 = uid(), f2 = uid(), f3 = uid();

    return [
        // ── Gouvernance & Direction ──
        { tempId: a, code: "GOV", intitule: "Gouvernance & Direction", niveau: 0, accessDefaut: "confidentiel", icone: "Building2", couleur: "#6366F1", tags: ["gouvernance", "direction"], ordre: 0 },
        { tempId: a1, parentTempId: a, code: "GOV-PV", intitule: "Procès-Verbaux CA / AG", niveau: 1, accessDefaut: "confidentiel", tags: ["gouvernance", "pv"], ordre: 0 },
        { tempId: a2, parentTempId: a, code: "GOV-DEL", intitule: "Délibérations", niveau: 1, accessDefaut: "confidentiel", tags: ["gouvernance"], ordre: 1 },
        { tempId: a3, parentTempId: a, code: "GOV-RAP", intitule: "Rapports d'Activité", niveau: 1, accessDefaut: "restreint", tags: ["gouvernance", "rapport"], ordre: 2 },

        // ── Affaires Académiques ──
        { tempId: b, code: "ACA", intitule: "Affaires Académiques", niveau: 0, accessDefaut: "restreint", moduleId: "idocument", icone: "GraduationCap", couleur: "#3B82F6", tags: ["académique", "enseignement"], ordre: 1 },
        { tempId: b1, parentTempId: b, code: "ACA-PRG", intitule: "Programmes & Curricula", niveau: 1, accessDefaut: "public", tags: ["académique"], ordre: 0 },
        { tempId: b2, parentTempId: b, code: "ACA-DIP", intitule: "Diplômes & Attestations", niveau: 1, accessDefaut: "confidentiel", tags: ["académique", "diplôme"], ordre: 1 },

        // ── Finances & Comptabilité ──
        { tempId: c, code: "FIN", intitule: "Finances & Comptabilité", niveau: 0, accessDefaut: "restreint", moduleId: "iarchive", icone: "Landmark", couleur: "#F59E0B", tags: ["finances", "comptabilité"], ordre: 2 },
        { tempId: c1, parentTempId: c, code: "FIN-BDG", intitule: "Budget Institutionnel", niveau: 1, accessDefaut: "confidentiel", tags: ["budget"], ordre: 0 },
        { tempId: c2, parentTempId: c, code: "FIN-SUB", intitule: "Subventions & Dotations", niveau: 1, accessDefaut: "restreint", tags: ["subvention"], ordre: 1 },
        { tempId: c3, parentTempId: c, code: "FIN-CPT", intitule: "Comptes Annuels", niveau: 1, accessDefaut: "confidentiel", tags: ["comptabilité"], ordre: 2 },

        // ── Ressources Humaines ──
        { tempId: d, code: "RH", intitule: "Ressources Humaines", niveau: 0, accessDefaut: "restreint", icone: "Users", couleur: "#10B981", tags: ["rh"], ordre: 3 },
        { tempId: d1, parentTempId: d, code: "RH-PER", intitule: "Dossiers du Personnel", niveau: 1, accessDefaut: "confidentiel", tags: ["rh", "personnel"], ordre: 0 },
        { tempId: d2, parentTempId: d, code: "RH-FRM", intitule: "Formations & Perfectionnement", niveau: 1, accessDefaut: "restreint", tags: ["rh", "formation"], ordre: 1 },

        // ── Recherche & Patrimoine ──
        { tempId: e, code: "REC", intitule: "Recherche & Publications", niveau: 0, accessDefaut: "public", icone: "BookOpen", couleur: "#8B5CF6", tags: ["recherche", "publication"], ordre: 4 },
        { tempId: e1, parentTempId: e, code: "REC-PUB", intitule: "Publications Scientifiques", niveau: 1, accessDefaut: "public", tags: ["recherche"], ordre: 0 },
        { tempId: e2, parentTempId: e, code: "REC-PRJ", intitule: "Projets de Recherche", niveau: 1, accessDefaut: "restreint", tags: ["recherche", "projet"], ordre: 1 },

        // ── Partenariats & Coopération ──
        { tempId: f, code: "PAR", intitule: "Partenariats & Coopération", niveau: 0, accessDefaut: "restreint", moduleId: "isignature", icone: "Handshake", couleur: "#06B6D4", tags: ["partenariat", "coopération"], ordre: 5 },
        { tempId: f1, parentTempId: f, code: "PAR-CVN", intitule: "Conventions", niveau: 1, accessDefaut: "restreint", tags: ["partenariat", "convention"], ordre: 0 },
        { tempId: f2, parentTempId: f, code: "PAR-ACC", intitule: "Accords-Cadres", niveau: 1, accessDefaut: "restreint", tags: ["partenariat"], ordre: 1 },
        { tempId: f3, parentTempId: f, code: "PAR-INT", intitule: "Accords Internationaux", niveau: 1, accessDefaut: "confidentiel", tags: ["partenariat", "international"], ordre: 2 },

        // ── Archives Sécurisées ──
        { tempId: g, code: "CFT", intitule: "Coffre-Fort Institutionnel", niveau: 0, accessDefaut: "confidentiel", moduleId: "iarchive", icone: "Lock", couleur: "#F43F5E", tags: ["coffre-fort", "sécurisé"], ordre: 6 },
    ];
}

export function getOrganismFilingTemplate(): FilingCellTemplate[] {
    const a = uid(), b = uid(), c = uid(), d = uid(), e = uid(), f = uid();
    const a1 = uid(), a2 = uid();
    const b1 = uid(), b2 = uid(), b3 = uid();
    const c1 = uid(), c2 = uid(), c3 = uid();
    const d1 = uid(), d2 = uid();
    const e1 = uid(), e2 = uid(), e3 = uid();

    return [
        // ── Administration Générale ──
        { tempId: a, code: "ADM", intitule: "Administration Générale", niveau: 0, accessDefaut: "restreint", icone: "FolderKanban", couleur: "#3B82F6", tags: ["administration"], ordre: 0 },
        { tempId: a1, parentTempId: a, code: "ADM-REG", intitule: "Règlements Intérieurs", niveau: 1, accessDefaut: "public", tags: ["administration", "règlement"], ordre: 0 },
        { tempId: a2, parentTempId: a, code: "ADM-CR", intitule: "Comptes-Rendus de Réunion", niveau: 1, accessDefaut: "restreint", tags: ["administration", "réunion"], ordre: 1 },

        // ── Projets & Programmes ──
        { tempId: b, code: "PRJ", intitule: "Projets & Programmes", niveau: 0, accessDefaut: "restreint", moduleId: "idocument", icone: "Target", couleur: "#8B5CF6", tags: ["projet", "programme"], ordre: 1 },
        { tempId: b1, parentTempId: b, code: "PRJ-FIC", intitule: "Fiches Projet", niveau: 1, accessDefaut: "restreint", tags: ["projet"], ordre: 0 },
        { tempId: b2, parentTempId: b, code: "PRJ-RAP", intitule: "Rapports d'Exécution", niveau: 1, accessDefaut: "restreint", tags: ["projet", "rapport"], ordre: 1 },
        { tempId: b3, parentTempId: b, code: "PRJ-EVL", intitule: "Évaluations", niveau: 1, accessDefaut: "confidentiel", tags: ["projet", "évaluation"], ordre: 2 },

        // ── Finances & Subventions ──
        { tempId: c, code: "FIN", intitule: "Finances & Subventions", niveau: 0, accessDefaut: "restreint", moduleId: "iarchive", icone: "Landmark", couleur: "#F59E0B", tags: ["finances", "subvention"], ordre: 2 },
        { tempId: c1, parentTempId: c, code: "FIN-BDG", intitule: "Budget Prévisionnel", niveau: 1, accessDefaut: "confidentiel", tags: ["budget"], ordre: 0 },
        { tempId: c2, parentTempId: c, code: "FIN-BAI", intitule: "Bailleurs de Fonds", niveau: 1, accessDefaut: "restreint", tags: ["bailleur", "subvention"], ordre: 1 },
        { tempId: c3, parentTempId: c, code: "FIN-AUD", intitule: "Rapports d'Audit", niveau: 1, accessDefaut: "confidentiel", tags: ["audit"], ordre: 2 },

        // ── Ressources Humaines ──
        { tempId: d, code: "RH", intitule: "Ressources Humaines", niveau: 0, accessDefaut: "restreint", icone: "Users", couleur: "#10B981", tags: ["rh"], ordre: 3 },
        { tempId: d1, parentTempId: d, code: "RH-VOL", intitule: "Dossiers Bénévoles / CDD", niveau: 1, accessDefaut: "confidentiel", tags: ["rh", "bénévole"], ordre: 0 },
        { tempId: d2, parentTempId: d, code: "RH-PER", intitule: "Personnel Permanent", niveau: 1, accessDefaut: "confidentiel", tags: ["rh", "personnel"], ordre: 1 },

        // ── Communication & Relations ──
        { tempId: e, code: "COM", intitule: "Communication & Relations", niveau: 0, accessDefaut: "public", moduleId: "idocument", icone: "Globe", couleur: "#06B6D4", tags: ["communication", "média"], ordre: 4 },
        { tempId: e1, parentTempId: e, code: "COM-PRS", intitule: "Communiqués de Presse", niveau: 1, accessDefaut: "public", tags: ["communication", "presse"], ordre: 0 },
        { tempId: e2, parentTempId: e, code: "COM-EVT", intitule: "Événements", niveau: 1, accessDefaut: "public", tags: ["communication", "événement"], ordre: 1 },
        { tempId: e3, parentTempId: e, code: "COM-PAR", intitule: "Partenariats", niveau: 1, accessDefaut: "restreint", tags: ["partenariat"], ordre: 2 },

        // ── Archives Sécurisées ──
        { tempId: f, code: "CFT", intitule: "Coffre-Fort Numérique", niveau: 0, accessDefaut: "confidentiel", moduleId: "iarchive", icone: "Lock", couleur: "#F43F5E", tags: ["coffre-fort", "sécurisé"], ordre: 5 },
    ];
}

export function getFilingTemplate(orgType: OrgType): FilingCellTemplate[] {
    switch (orgType) {
        case "enterprise": return getEnterpriseFilingTemplate();
        case "government": return getGovernmentFilingTemplate();
        case "institution": return getInstitutionFilingTemplate();
        case "organism": return getOrganismFilingTemplate();
        default: return getEnterpriseFilingTemplate();
    }
}

// ─── Suggestions de cellules par nom de service ─

/**
 * Suggère des sous-dossiers pertinents en fonction du nom d'un service.
 * Utile pour pré-remplir l'arborescence quand l'admin crée un nouveau service.
 */
export function suggestCellsForService(serviceName: string): FilingCellTemplate[] {
    const name = serviceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const suggestions: FilingCellTemplate[] = [];
    const prefix = serviceName.slice(0, 3).toUpperCase();

    const PATTERNS: { keywords: string[]; cells: { code: string; intitule: string; access: ConfidentialityLevel; tags: string[] }[] }[] = [
        {
            keywords: ["finance", "compta", "comptab", "tresor", "budget"],
            cells: [
                { code: `${prefix}-BDG`, intitule: "Budget", access: "confidentiel", tags: ["budget"] },
                { code: `${prefix}-CPT`, intitule: "Comptes", access: "confidentiel", tags: ["comptabilité"] },
                { code: `${prefix}-FAC`, intitule: "Factures", access: "restreint", tags: ["facture"] },
                { code: `${prefix}-BNQ`, intitule: "Relevés Bancaires", access: "confidentiel", tags: ["banque"] },
            ],
        },
        {
            keywords: ["ressource", "humain", "rh", "personnel", "paie"],
            cells: [
                { code: `${prefix}-CTR`, intitule: "Contrats", access: "confidentiel", tags: ["contrat", "rh"] },
                { code: `${prefix}-PAI`, intitule: "Fiches de Paie", access: "confidentiel", tags: ["paie", "rh"] },
                { code: `${prefix}-CON`, intitule: "Congés & Absences", access: "restreint", tags: ["congé", "rh"] },
                { code: `${prefix}-FRM`, intitule: "Formations", access: "restreint", tags: ["formation", "rh"] },
            ],
        },
        {
            keywords: ["juridique", "legal", "droit", "contentieux"],
            cells: [
                { code: `${prefix}-CTR`, intitule: "Contrats", access: "confidentiel", tags: ["contrat", "juridique"] },
                { code: `${prefix}-LIT`, intitule: "Contentieux", access: "confidentiel", tags: ["contentieux"] },
                { code: `${prefix}-REG`, intitule: "Réglementation", access: "public", tags: ["réglementation"] },
            ],
        },
        {
            keywords: ["commerc", "vente", "market", "client"],
            cells: [
                { code: `${prefix}-DEV`, intitule: "Devis", access: "restreint", tags: ["commercial"] },
                { code: `${prefix}-FAC`, intitule: "Factures Clients", access: "restreint", tags: ["facture"] },
                { code: `${prefix}-PRO`, intitule: "Propositions", access: "restreint", tags: ["commercial"] },
            ],
        },
        {
            keywords: ["technique", "info", "systeme", "it", "dsi"],
            cells: [
                { code: `${prefix}-DOC`, intitule: "Documentation Technique", access: "restreint", tags: ["technique"] },
                { code: `${prefix}-LIC`, intitule: "Licences", access: "confidentiel", tags: ["licence"] },
                { code: `${prefix}-INC`, intitule: "Rapports d'Incidents", access: "restreint", tags: ["incident"] },
            ],
        },
        {
            keywords: ["communic", "presse", "media", "relation"],
            cells: [
                { code: `${prefix}-PRS`, intitule: "Communiqués", access: "public", tags: ["presse"] },
                { code: `${prefix}-EVT`, intitule: "Événements", access: "public", tags: ["événement"] },
                { code: `${prefix}-MED`, intitule: "Revue de Presse", access: "restreint", tags: ["média"] },
            ],
        },
    ];

    for (const pattern of PATTERNS) {
        if (pattern.keywords.some((kw) => name.includes(kw))) {
            for (let i = 0; i < pattern.cells.length; i++) {
                const cell = pattern.cells[i];
                suggestions.push({
                    tempId: uid(),
                    code: cell.code,
                    intitule: cell.intitule,
                    niveau: 1,
                    accessDefaut: cell.access,
                    tags: cell.tags,
                    ordre: i,
                });
            }
            break; // Use the first matching pattern
        }
    }

    return suggestions;
}

// ─── Référentiel OHADA ────────────────────────

export const OHADA_REFERENCES: Record<string, {
    dureeAns: number;
    article: string;
    description: string;
}> = {
    fiscal: {
        dureeAns: 10,
        article: "Acte Uniforme Comptable Art. 24",
        description: "10 ans à compter de la clôture de l'exercice fiscal",
    },
    social: {
        dureeAns: 5,
        article: "Code du Travail Gabonais Art. 178",
        description: "5 ans après la fin du contrat de travail",
    },
    juridique: {
        dureeAns: 30,
        article: "Acte Uniforme Droit des Sociétés Art. 36",
        description: "30 ans à compter du dépôt au greffe",
    },
    client: {
        dureeAns: 5,
        article: "Acte Uniforme Droit Commercial Art. 18",
        description: "5 ans après la dernière opération",
    },
    coffre: {
        dureeAns: 99,
        article: "Conservation perpétuelle",
        description: "Titres de propriété, actes notariés — conservation illimitée",
    },
};

// ─── Cycle de vie des archives ────────────────

export const LIFECYCLE_NODES = [
    { label: "Création", color: "zinc" },
    { label: "Actif", color: "emerald" },
    { label: "Semi-actif", color: "blue" },
    { label: "Archivé", color: "violet" },
    { label: "Gel juridique", color: "amber" },
    { label: "Expiration proche", color: "orange" },
    { label: "Expiré", color: "red" },
    { label: "Détruit", color: "zinc" },
] as const;
