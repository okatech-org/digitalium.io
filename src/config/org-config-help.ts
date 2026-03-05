// ═══════════════════════════════════════════════
// Aide contextuelle — Configuration Organisation
// Textes d'aide pour chaque section/fonctionnalité
// ═══════════════════════════════════════════════

export interface HelpEntry {
    title: string;
    description: string;
}

// ─── Progression ─────────────────────────────
export const HELP_PROGRESSION: Record<string, HelpEntry> = {
    banner: {
        title: "Progression de la configuration",
        description:
            "Ce bandeau suit l'avancement de la mise en place de votre organisation.\nChaque étape validée est marquée d'une coche verte.\nUne fois toutes les étapes complétées, l'organisation peut être activée.",
    },
};

// ─── Onglet Profil ───────────────────────────
export const HELP_PROFIL: Record<string, HelpEntry> = {
    identite: {
        title: "Identité de l'organisation",
        description:
            "Informations légales et administratives : raison sociale, secteur d'activité, numéro RCCM et NIF.\nCes données sont utilisées dans les documents officiels et les signatures électroniques.",
    },
    coordonnees: {
        title: "Coordonnées",
        description:
            "Contact principal, email, téléphone et adresse physique de l'organisation.\nCes informations apparaissent sur la page publique et dans les communications officielles.",
    },
    sites: {
        title: "Sites & Implantations",
        description:
            "Gérez les différents sites de l'organisation (siège, filiales, agences, antennes).\nLe site marqué comme « Siège » est utilisé comme adresse principale.\nChaque site peut avoir ses propres coordonnées.",
    },
};

// ─── Onglet Structure Org ────────────────────
export const HELP_STRUCTURE_ORG: Record<string, HelpEntry> = {
    organigramme: {
        title: "Organigramme",
        description:
            "Arborescence hiérarchique de votre organisation : directions, départements, services, unités.\nChaque branche peut contenir des sous-unités.\nUtilisez le bouton « Charger un modèle » pour pré-remplir une structure-type adaptée à votre secteur.",
    },
    roles: {
        title: "Rôles Métier",
        description:
            "Définissez les rôles fonctionnels (Directeur, Chef de service, Comptable, etc.).\nChaque rôle détermine les permissions d'accès aux modules et aux données.\nLes rôles sont liés aux types d'unités organisationnelles pour un contrôle d'accès fin.",
    },
    personnel: {
        title: "Personnel",
        description:
            "Gestion des membres de l'organisation : invitation, affectation à un service et attribution d'un rôle.\nChaque membre peut avoir plusieurs affectations (multi-service).\nLes permissions modules peuvent être surchargées individuellement.",
    },
};

// ─── Onglet Classement ───────────────────────
export const HELP_CLASSEMENT: Record<string, HelpEntry> = {
    arborescence: {
        title: "Arborescence de classement",
        description:
            "Structure de classement documentaire de l'organisation.\nChaque cellule (dossier) a un code unique, un intitulé et un niveau de confidentialité.\nLes dossiers créés ici sont automatiquement synchronisés dans iDocument.",
    },
    matrice: {
        title: "Matrice d'Accès",
        description:
            "Définissez qui peut accéder à quoi : croisez les unités organisationnelles et rôles métier avec les cellules de classement.\nCliquez sur une cellule pour faire défiler les niveaux : Aucun → Lecture → Écriture → Gestion → Admin.\nSauvegardez pour appliquer les droits.",
    },
    habilitations: {
        title: "Habilitations individuelles",
        description:
            "Dérogations individuelles à la matrice d'accès globale.\nPermettez à un membre spécifique d'accéder à un dossier normalement restreint, ou bloquez un accès par exception.\nUtile pour les cas particuliers sans modifier la matrice générale.",
    },
    archivage: {
        title: "Politique d'archivage",
        description:
            "Configurez les règles de conservation documentaire de l'organisation.\n• Durée de rétention globale par défaut\n• Archivage automatique à l'échéance\n• Catégories de rétention (fiscal, social, juridique…) avec durées OHADA\nCes règles s'appliquent à tous les documents classés dans l'arborescence.",
    },
};

// ─── Onglet Modules ─────────────────────────
export const HELP_MODULES: Record<string, HelpEntry> = {
    general: {
        title: "Configuration des modules",
        description:
            "Paramétrez individuellement chaque module actif de l'organisation.\nLes réglages ici déterminent le comportement global du module pour tous les utilisateurs.",
    },
    iDocument: {
        title: "iDocument — Gestion documentaire",
        description:
            "Gestion électronique de documents (GED) : création, import, versionnage.\n• Versionnage automatique : conserve l'historique des modifications\n• Classification IA : suggestion automatique de dossier et tags à l'import\n• Formats autorisés : contrôlez les types de fichiers acceptés\n• Taille maximale : limite par fichier (documents et vidéos)",
    },
    iArchive: {
        title: "iArchive — Archivage conforme",
        description:
            "Archivage légal conforme aux normes OHADA.\n• Rétention par catégorie : fiscal (10 ans), social (5 ans), etc.\n• Cycle de vie : phases Active → Semi-active → Archive\n• Alertes : notifications avant expiration des délais\n• Coffre-Fort numérique : protection renforcée avec chiffrement",
    },
    iSignature: {
        title: "iSignature — Signature électronique",
        description:
            "Signature électronique à valeur légale.\n• Nombre max de signataires par document\n• Délégation : autoriser la signature au nom d'un tiers\n• Horodatage : certification de la date et heure de signature\nConforme au cadre juridique CEMAC.",
    },
    iAsted: {
        title: "iAsted — Assistant IA",
        description:
            "Assistant intelligent intégré à la plateforme.\nAnalyse automatique des documents, suggestions de classement, détection d'anomalies.\nL'IA s'adapte progressivement aux habitudes de votre organisation.",
    },
};

// ─── Onglet Automatisation ───────────────────
export const HELP_AUTOMATION: Record<string, HelpEntry> = {
    workflows: {
        title: "Workflows prédéfinis",
        description:
            "Circuits de validation et d'approbation automatiques.\nChaque workflow définit une séquence d'étapes (approbation, notification, webhook…) déclenchée par un événement.\nActivez/désactivez les workflows selon vos besoins.",
    },
    automations: {
        title: "Automatisations",
        description:
            "Actions automatiques déclenchées par des événements métier.\n• Archivage après signature : archive automatiquement le document signé\n• Notifications : alerte les utilisateurs des documents en attente\n• Renouvellement : rappel avant expiration des certificats",
    },
    schedules: {
        title: "Planifications",
        description:
            "Tâches automatiques planifiées (CRON).\nExécution périodique de nettoyage, synchronisation ou rapports.\nConfigurez la fréquence et les conditions d'exécution.",
    },
    customRules: {
        title: "Règles personnalisées",
        description:
            "Créez vos propres règles d'automatisation sur mesure.\nDéfinissez un déclencheur (ex: document créé), des conditions (ex: tag = 'urgent') et des actions (ex: notifier le directeur).\nPermet d'adapter la plateforme à vos processus métier spécifiques.",
    },
};

// ─── Onglet Déploiement ──────────────────────
export const HELP_DEPLOY: Record<string, HelpEntry> = {
    hosting: {
        title: "Hébergement",
        description:
            "Choisissez le mode d'hébergement de votre instance.\n• Cloud Digitalium : hébergement géré, haute disponibilité\n• Hybride : données sensibles on-premise, services dans le cloud\n• On-premise : installation complète sur votre infrastructure\nPlusieurs options peuvent être combinées.",
    },
    domain: {
        title: "Domaine personnalisé",
        description:
            "Configurez un sous-domaine personnalisé pour votre organisation (ex: monentreprise.digitalium.io).\nLe système vérifie automatiquement la disponibilité.\nLe domaine sera utilisé pour la page publique et l'accès à la plateforme.",
    },
    publicPage: {
        title: "Page publique",
        description:
            "Activez et personnalisez la vitrine web de votre organisation.\n• Choisissez un template (Corporate, Startup, Institution)\n• Personnalisez les couleurs, textes et sections affichées\n• Prévisualisez le résultat en temps réel\nLa page est accessible publiquement sur votre domaine.",
    },
};
