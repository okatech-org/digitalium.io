// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Page Info (Contextual "i")
// ═══════════════════════════════════════════════

export interface ElementInfo {
    nom: string;
    type: "bouton" | "champ" | "tableau" | "carte" | "graphique" | "filtre" | "autre";
    description: string;
    obligatoire?: boolean;
}

export interface LienInfo {
    page: string;
    relation: string;
    route: string;
}

export interface ArchitectureInfo {
    stack: string[];
    pattern: string;
    dataFlow: string;
    diagram: string;
    keyComponents: string[];
    apiEndpoints?: string[];
    stateManagement?: string;
}

export interface PageInfo {
    pageId: string;
    titre: string;
    but: string;
    description: string;
    elements: ElementInfo[];
    tachesDisponibles: string[];
    liens: LienInfo[];
    conseil?: string;
    architecture?: ArchitectureInfo;
}

export type PageInfoMap = Record<string, PageInfo>;
