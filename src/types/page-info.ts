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

export interface PageInfo {
    pageId: string;
    titre: string;
    but: string;
    description: string;
    elements: ElementInfo[];
    tachesDisponibles: string[];
    liens: LienInfo[];
    conseil?: string;
}

export type PageInfoMap = Record<string, PageInfo>;
