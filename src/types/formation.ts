// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Formation Module
// ═══════════════════════════════════════════════

export interface EtapeTutoriel {
    numero: number;
    instruction: string;
    detail?: string;
}

export interface Tutoriel {
    id: string;
    titre: string;
    fonctionnaliteId: string;
    etapes: EtapeTutoriel[];
    routeCible: string;
}

export interface Fonctionnalite {
    id: string;
    onglet: string;
    icone: string;
    titre: string;
    description: string;
    importance: string;
    tutorielIds: string[];
}

export interface FAQItem {
    question: string;
    reponse: string;
    categorie: string;
}

export interface FormationConfig {
    espaceRole: string;
    titreBienvenue: string;
    descriptionRole: string;
    responsabilites: string[];
    fonctionnalites: Fonctionnalite[];
    tutoriels: Tutoriel[];
    faq: FAQItem[];
}
