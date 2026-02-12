// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Modules
// 4 modules (iDocument, iArchive, iSignature, iAsted)
// ═══════════════════════════════════════════════

/* ───────────────────────────────────────────────
   Module types
   ─────────────────────────────────────────────── */

export type ModuleId = "idocument" | "iarchive" | "isignature" | "iasted";
export type ModuleStatus = "active" | "beta" | "coming_soon";

export interface ModuleTechStack {
    editor?: string;       // ex: "Yjs + Tiptap"
    realtime?: string;     // ex: "Convex"
    storage?: string;      // ex: "Supabase Storage"
    ai?: string;           // ex: "Google Gemini"
    hashing?: string;      // ex: "SHA-256"
}

export interface ModuleRetention {
    fiscal: number;         // années de rétention fiscale
    social: number;         // années de rétention documents sociaux
    default: number;        // rétention par défaut
}

export interface ModuleConfig {
    id: ModuleId;
    name: string;
    tagline: string;
    description: string;
    icon: string;            // Nom icône Lucide
    color: string;           // Hex
    gradient: string;        // Classes Tailwind
    status: ModuleStatus;
    techStack: ModuleTechStack;
    retention?: ModuleRetention;
    features: ModuleFeature[];
    pricing?: {
        included: boolean;     // true = inclus dans le plan de base
        addonPrice?: number;   // XAF/mois si addon
    };
}

export interface ModuleFeature {
    id: string;
    name: string;
    description: string;
}

/* ───────────────────────────────────────────────
   Module definitions
   ─────────────────────────────────────────────── */

export const MODULES: Record<ModuleId, ModuleConfig> = {
    /* ─── iDocument ────────────────────────────── */
    idocument: {
        id: "idocument",
        name: "iDocument",
        tagline: "Google Docs pour le Gabon",
        description:
            "Édition collaborative en temps réel — rédigez, commentez et approuvez vos documents à plusieurs, simultanément.",
        icon: "FileText",
        color: "#3B82F6",
        gradient: "from-blue-500 to-blue-600",
        status: "active",
        techStack: {
            editor: "Yjs + Tiptap",
            realtime: "Convex",
            storage: "Supabase Storage",
        },
        features: [
            {
                id: "collab_editor",
                name: "Éditeur collaboratif temps réel",
                description: "Co-édition multi-curseurs avec suivi de présence",
            },
            {
                id: "templates",
                name: "Templates professionnels",
                description: "Modèles de documents pré-formatés (contrats, rapports, notes)",
            },
            {
                id: "version_history",
                name: "Historique des versions",
                description: "Revenez à n'importe quelle version précédente",
            },
            {
                id: "export",
                name: "Export PDF / Word / XLSX",
                description: "Exportez vos documents dans tous les formats standards",
            },
            {
                id: "comments",
                name: "Commentaires et annotations",
                description: "Discussions contextuelles intégrées au document",
            },
        ],
        pricing: { included: true },
    },

    /* ─── iArchive ─────────────────────────────── */
    iarchive: {
        id: "iarchive",
        name: "iArchive",
        tagline: "Un coffre-fort intelligent",
        description:
            "Archivage légal avec intégrité SHA-256 — chaque document est horodaté, certifié et conforme à la loi gabonaise.",
        icon: "Archive",
        color: "#10B981",
        gradient: "from-emerald-500 to-emerald-600",
        status: "active",
        techStack: {
            hashing: "SHA-256",
            storage: "Supabase Storage",
            realtime: "Convex",
        },
        retention: {
            fiscal: 10,   // 10 ans rétention fiscale
            social: 5,    // 5 ans documents sociaux
            default: 10,
        },
        features: [
            {
                id: "sha256",
                name: "Intégrité cryptographique SHA-256",
                description: "Chaque fichier archivé a une empreinte cryptographique vérifiable",
            },
            {
                id: "certificate",
                name: "Certificat d'archivage horodaté",
                description: "Preuve de dépôt avec horodatage légal",
            },
            {
                id: "retention_fiscal",
                name: "Rétention fiscale 10 ans",
                description: "Conformité avec les obligations de conservation fiscale gabonaises",
            },
            {
                id: "retention_social",
                name: "Rétention sociale 5 ans",
                description: "Archivage des documents sociaux conformément à la loi du travail",
            },
            {
                id: "search",
                name: "Recherche avancée & filtres",
                description: "Retrouvez n'importe quel document en quelques secondes",
            },
            {
                id: "audit_trail",
                name: "Journal d'audit immuable",
                description: "Traçabilité complète de toutes les opérations d'archivage",
            },
        ],
        pricing: { included: true },
    },

    /* ─── iSignature ───────────────────────────── */
    isignature: {
        id: "isignature",
        name: "iSignature",
        tagline: "Signez en un clic",
        description:
            "Validation électronique avec workflows multi-étapes — invitez, signez et suivez chaque approbation.",
        icon: "PenTool",
        color: "#8B5CF6",
        gradient: "from-violet-500 to-violet-600",
        status: "active",
        techStack: {
            realtime: "Convex",
        },
        features: [
            {
                id: "e_signature",
                name: "Signature électronique légale",
                description: "Signatures à valeur probante conformes à la législation gabonaise",
            },
            {
                id: "multi_step",
                name: "Workflows multi-étapes",
                description: "Circuits de validation avec ordonnancement (parallèle ou séquentiel)",
            },
            {
                id: "audit",
                name: "Audit trail complet",
                description: "Historique détaillé de chaque action de signature",
            },
            {
                id: "notifications",
                name: "Notifications automatiques",
                description: "Rappels et alertes pour les signataires en attente",
            },
            {
                id: "templates",
                name: "Modèles de workflows",
                description: "Circuits de validation pré-configurés réutilisables",
            },
        ],
        pricing: { included: false, addonPrice: 5_000 },
    },

    /* ─── iAsted ───────────────────────────────── */
    iasted: {
        id: "iasted",
        name: "iAsted",
        tagline: "Votre archiviste qui ne dort jamais",
        description:
            "Assistant IA 24/7 — OCR, recherche sémantique, résumés automatiques et analytics prédictifs sur vos archives.",
        icon: "Bot",
        color: "#F59E0B",
        gradient: "from-amber-500 to-amber-600",
        status: "beta",
        techStack: {
            ai: "Google Gemini",
            realtime: "Convex",
        },
        features: [
            {
                id: "ocr",
                name: "OCR & extraction intelligente",
                description: "Numérisez et extrayez automatiquement les données de vos documents papier",
            },
            {
                id: "semantic_search",
                name: "Recherche sémantique",
                description: "Trouvez des documents par leur contenu, pas seulement par nom",
            },
            {
                id: "summaries",
                name: "Résumés automatiques",
                description: "Synthèse intelligente de documents longs en quelques secondes",
            },
            {
                id: "predictive",
                name: "Analytics prédictifs",
                description: "Anticipez les besoins d'archivage et les échéances réglementaires",
            },
            {
                id: "chat",
                name: "Chat conversationnel",
                description: "Posez des questions à vos archives en langage naturel",
            },
            {
                id: "classification",
                name: "Classification automatique",
                description: "Catégorisation et étiquetage intelligent des documents",
            },
        ],
        pricing: { included: false, addonPrice: 10_000 },
    },
} as const;

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

export function getModule(id: ModuleId): ModuleConfig {
    return MODULES[id];
}

export function getModulesList(): ModuleConfig[] {
    return Object.values(MODULES);
}

export function getActiveModules(): ModuleConfig[] {
    return Object.values(MODULES).filter((m) => m.status === "active");
}

export function getIncludedModules(): ModuleConfig[] {
    return Object.values(MODULES).filter((m) => m.pricing?.included);
}

export function getAddonModules(): ModuleConfig[] {
    return Object.values(MODULES).filter(
        (m) => m.pricing && !m.pricing.included
    );
}
