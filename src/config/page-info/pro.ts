// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page Info Config: Pro (Business)
// ═══════════════════════════════════════════════

import type { PageInfoMap } from "@/types/page-info";
import { injectArchitecture } from "./architecture-data";

export const PRO_PAGE_INFO: PageInfoMap = injectArchitecture({
    dashboard: {
        pageId: "pro-dashboard",
        titre: "Dashboard",
        but: "Vue d'ensemble de votre espace professionnel et de l'activité de votre organisation.",
        description: "KPIs métier : documents en cours, signatures en attente, archives récentes, tâches de l'équipe et raccourcis vers les actions fréquentes.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Documents, signatures, archives, tâches" },
            { nom: "Raccourcis", type: "bouton", description: "Accès rapide aux actions fréquentes" },
            { nom: "Activité récente", type: "tableau", description: "Dernières actions de votre équipe" },
        ],
        tachesDisponibles: ["Consulter les KPIs", "Accéder rapidement aux modules", "Voir l'activité de l'équipe"],
        liens: [
            { page: "iDocument", relation: "Gestion documentaire", route: "/pro/idocument" },
            { page: "iSignature", relation: "Signatures électroniques", route: "/pro/isignature" },
        ],
    },
    idocument: {
        pageId: "pro-idocument",
        titre: "iDocument",
        but: "Gérer tout le cycle de vie de vos documents professionnels.",
        description: "Création, édition, partage, validation et archivage de documents. Interface en grille ou liste avec recherche avancée.",
        elements: [
            { nom: "Vue grille/liste", type: "autre", description: "Basculer entre affichage grille et liste" },
            { nom: "Recherche avancée", type: "filtre", description: "Filtrage par statut, auteur, type, tags" },
            { nom: "Bouton Créer", type: "bouton", description: "Crée un nouveau document" },
            { nom: "Sélection multiple", type: "autre", description: "Sélection pour actions en masse" },
        ],
        tachesDisponibles: ["Créer un document", "Rechercher et filtrer", "Partager des documents", "Archiver en masse"],
        liens: [
            { page: "Éditeur", relation: "Éditer un document", route: "/pro/idocument/edit" },
            { page: "Templates", relation: "Créer depuis un modèle", route: "/pro/idocument/templates" },
            { page: "Partagés", relation: "Documents reçus en partage", route: "/pro/idocument/shared" },
        ],
        conseil: "Utilisez les tags pour organiser vos documents et faciliter les recherches futures.",
    },
    iarchive: {
        pageId: "pro-iarchive",
        titre: "iArchive",
        but: "Archiver et conserver vos documents selon les obligations légales.",
        description: "Archive numérique sécurisée avec classification par catégorie (fiscal, social, juridique) et coffre-fort numérique.",
        elements: [
            { nom: "Catégories d'archives", type: "carte", description: "Fiscal, Social, Juridique, Coffre-Fort" },
            { nom: "Recherche", type: "filtre", description: "Recherche dans toutes les archives" },
        ],
        tachesDisponibles: ["Déposer un document en archive", "Rechercher dans les archives", "Consulter le coffre-fort"],
        liens: [
            { page: "Fiscal", relation: "Documents fiscaux", route: "/pro/iarchive/fiscal" },
            { page: "Juridique", relation: "Documents juridiques", route: "/pro/iarchive/legal" },
            { page: "Coffre-Fort", relation: "Documents confidentiels", route: "/pro/iarchive/vault" },
        ],
    },
    isignature: {
        pageId: "pro-isignature",
        titre: "iSignature",
        but: "Signer et faire signer des documents électroniquement.",
        description: "Signature électronique qualifiée, suivi des circuits de validation, et historique des signatures.",
        elements: [
            { nom: "Documents à signer", type: "tableau", description: "Documents en attente de votre signature" },
            { nom: "Bouton Signer", type: "bouton", description: "Lance le processus de signature" },
            { nom: "Workflows", type: "carte", description: "Circuits de validation configurés" },
        ],
        tachesDisponibles: ["Signer un document", "Envoyer un document à signer", "Créer un circuit de validation"],
        liens: [
            { page: "En attente", relation: "Documents envoyés à signer", route: "/pro/isignature/pending" },
            { page: "Workflows", relation: "Circuits de signature", route: "/pro/isignature/workflows" },
        ],
    },
    iasted: {
        pageId: "pro-iasted",
        titre: "iAsted (IA)",
        but: "Utiliser l'intelligence artificielle pour analyser et traiter vos documents.",
        description: "Assistant IA pour la classification automatique, l'extraction de données, la synthèse de documents et l'analyse de contrats.",
        elements: [
            { nom: "Assistant IA", type: "autre", description: "Interface conversationnelle pour vos requêtes IA" },
            { nom: "Analyses récentes", type: "tableau", description: "Historique des analyses effectuées" },
        ],
        tachesDisponibles: ["Analyser un document", "Extraire des données", "Générer une synthèse", "Classifier automatiquement"],
        liens: [
            { page: "Analytics IA", relation: "Statistiques d'utilisation IA", route: "/pro/iasted/analytics" },
        ],
    },
    team: {
        pageId: "pro-team",
        titre: "Équipe",
        but: "Gérer les membres de votre organisation.",
        description: "Inviter, gérer les rôles et suivre l'activité des membres de votre équipe.",
        elements: [
            { nom: "Liste des membres", type: "tableau", description: "Membres avec rôle, statut, activité" },
            { nom: "Bouton Inviter", type: "bouton", description: "Invite un nouveau membre par email" },
        ],
        tachesDisponibles: ["Inviter un membre", "Modifier les rôles", "Voir l'activité des membres"],
        liens: [
            { page: "Paramètres", relation: "Configuration de l'organisation", route: "/pro/settings" },
        ],
    },
    settings: {
        pageId: "pro-settings",
        titre: "Paramètres",
        but: "Personnaliser votre expérience et configurer votre organisation.",
        description: "Profil personnel, apparence, langue, notifications, sécurité et accessibilité.",
        elements: [],
        tachesDisponibles: ["Modifier votre profil", "Changer le thème", "Configurer vos notifications"],
        liens: [],
    },
    formation: {
        pageId: "pro-formation",
        titre: "Formation",
        but: "Module de formation pour les utilisateurs professionnels.",
        description: "Guide interactif pour maîtriser tous les modules de votre espace professionnel.",
        elements: [],
        tachesDisponibles: ["Suivre la formation", "Consulter la FAQ"],
        liens: [],
    },
    billing: {
        pageId: "pro-billing",
        titre: "Facturation",
        but: "Gérer votre abonnement et consulter vos factures.",
        description: "Plan actuel, factures, méthodes de paiement et historique des transactions.",
        elements: [
            { nom: "Plan actuel", type: "carte", description: "Détails de votre abonnement" },
            { nom: "Factures", type: "tableau", description: "Historique des factures" },
        ],
        tachesDisponibles: ["Consulter votre plan", "Télécharger une facture", "Upgrader votre plan"],
        liens: [
            { page: "Paramètres", relation: "Configuration de l'organisation", route: "/pro/settings" },
        ],
    },
    analytics: {
        pageId: "pro-analytics",
        titre: "Analytics",
        but: "Analyser l'utilisation de votre organisation.",
        description: "Statistiques d'utilisation des modules, activité des membres et tendances.",
        elements: [
            { nom: "Graphiques d'utilisation", type: "graphique", description: "Utilisation par module" },
        ],
        tachesDisponibles: ["Consulter les statistiques", "Exporter des rapports"],
        liens: [
            { page: "Dashboard", relation: "KPIs résumés", route: "/pro" },
        ],
    },
});
