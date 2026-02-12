// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page Info Config: Admin
// ═══════════════════════════════════════════════

import type { PageInfoMap } from "@/types/page-info";

export const ADMIN_PAGE_INFO: PageInfoMap = {
    dashboard: {
        pageId: "admin-dashboard",
        titre: "Dashboard Administration",
        but: "Vue d'ensemble de l'activité de la plateforme et des métriques business.",
        description: "Suivi des KPIs : utilisateurs actifs, organisations, revenus, taux de conversion des leads, et activité globale de la plateforme.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Utilisateurs, organisations, revenus, leads actifs" },
            { nom: "Graphique croissance", type: "graphique", description: "Évolution mensuelle des inscriptions et revenus" },
            { nom: "Activité récente", type: "tableau", description: "Dernières actions sur la plateforme" },
        ],
        tachesDisponibles: [
            "Surveiller les métriques business",
            "Identifier les tendances de croissance",
            "Accéder rapidement aux sections critiques",
        ],
        liens: [
            { page: "Leads", relation: "Pipeline commercial", route: "/admin/leads" },
            { page: "Analytics", relation: "Analyses détaillées", route: "/admin/analytics" },
        ],
    },
    leads: {
        pageId: "admin-leads",
        titre: "Leads & Contacts",
        but: "Gérer le pipeline commercial de la plateforme.",
        description: "Suivi des prospects depuis le premier contact jusqu'à la conversion en client payant.",
        elements: [
            { nom: "Pipeline visuel", type: "tableau", description: "Leads organisés par étape de conversion" },
            { nom: "Bouton Ajouter lead", type: "bouton", description: "Crée un nouveau prospect" },
            { nom: "Filtres avancés", type: "filtre", description: "Filtrage par statut, source, date" },
        ],
        tachesDisponibles: [
            "Ajouter et qualifier des leads",
            "Suivre le pipeline de conversion",
            "Envoyer des propositions commerciales",
            "Analyser le taux de conversion",
        ],
        liens: [
            { page: "Organisations", relation: "Leads convertis", route: "/admin/organizations" },
            { page: "Abonnements", relation: "Plans proposés", route: "/admin/subscriptions" },
        ],
    },
    users: {
        pageId: "admin-users",
        titre: "Utilisateurs",
        but: "Administrer les comptes utilisateurs de toute la plateforme.",
        description: "Liste de tous les utilisateurs avec gestion des rôles, statuts et accès.",
        elements: [
            { nom: "Tableau utilisateurs", type: "tableau", description: "Liste avec nom, email, rôle, dernière connexion" },
            { nom: "Recherche", type: "filtre", description: "Recherche par nom, email, organisation" },
            { nom: "Actions", type: "bouton", description: "Modifier, suspendre, supprimer un compte" },
        ],
        tachesDisponibles: [
            "Rechercher un utilisateur",
            "Modifier les rôles",
            "Suspendre un compte",
            "Inviter de nouveaux utilisateurs",
        ],
        liens: [
            { page: "Organisations", relation: "Organisation de chaque utilisateur", route: "/admin/organizations" },
        ],
    },
    organizations: {
        pageId: "admin-organizations",
        titre: "Organisations",
        but: "Gérer les organisations clientes inscrites sur la plateforme.",
        description: "Vue de toutes les organisations avec leur plan, nombre de membres, et utilisation des modules.",
        elements: [
            { nom: "Tableau organisations", type: "tableau", description: "Organisations avec plan, membres, modules actifs" },
            { nom: "Bouton Créer", type: "bouton", description: "Crée une nouvelle organisation" },
        ],
        tachesDisponibles: [
            "Voir les détails d'une organisation",
            "Créer une organisation",
            "Modifier le plan d'abonnement",
            "Gérer les modules actifs",
        ],
        liens: [
            { page: "Utilisateurs", relation: "Membres de chaque organisation", route: "/admin/users" },
            { page: "Abonnements", relation: "Plans et facturation", route: "/admin/subscriptions" },
        ],
    },
    subscriptions: {
        pageId: "admin-subscriptions",
        titre: "Abonnements",
        but: "Gérer les plans d'abonnement et suivre les revenus.",
        description: "Vue des abonnements actifs, revenus mensuels récurrents, et gestion des plans.",
        elements: [
            { nom: "Plans", type: "carte", description: "Plans disponibles avec tarifs" },
            { nom: "Abonnements actifs", type: "tableau", description: "Liste des abonnements en cours" },
        ],
        tachesDisponibles: [
            "Voir les abonnements actifs",
            "Gérer les upgrades/downgrades",
            "Suivre le MRR",
        ],
        liens: [
            { page: "Facturation", relation: "Détails de paiement", route: "/admin/billing" },
            { page: "Organisations", relation: "Organisations abonnées", route: "/admin/organizations" },
        ],
    },
    analytics: {
        pageId: "admin-analytics",
        titre: "Analytics",
        but: "Analyser les données d'utilisation et de performance de la plateforme.",
        description: "Tableaux de bord analytiques : engagement utilisateurs, utilisation des modules, tendances de croissance.",
        elements: [
            { nom: "Graphiques d'utilisation", type: "graphique", description: "Utilisation par module et par période" },
            { nom: "Métriques d'engagement", type: "carte", description: "Temps moyen, sessions, rétention" },
        ],
        tachesDisponibles: [
            "Analyser les tendances d'utilisation",
            "Identifier les modules les plus utilisés",
            "Exporter les rapports",
        ],
        liens: [
            { page: "Dashboard", relation: "KPIs résumés", route: "/admin" },
        ],
    },
    billing: {
        pageId: "admin-billing",
        titre: "Facturation",
        but: "Gérer la facturation et les paiements de la plateforme.",
        description: "Suivi des paiements, factures émises, relances impayés et revenus récurrents.",
        elements: [
            { nom: "Résumé revenus", type: "carte", description: "MRR, ARR, impayés" },
            { nom: "Factures", type: "tableau", description: "Historique des factures émises" },
        ],
        tachesDisponibles: [
            "Consulter les factures",
            "Envoyer des relances",
            "Exporter les données financières",
        ],
        liens: [
            { page: "Abonnements", relation: "Plans associés", route: "/admin/subscriptions" },
        ],
    },
    formation: {
        pageId: "admin-formation",
        titre: "Formation",
        but: "Module de formation pour les administrateurs de la plateforme.",
        description: "Guide interactif pour maîtriser toutes les fonctionnalités d'administration.",
        elements: [],
        tachesDisponibles: ["Suivre la formation", "Consulter la FAQ"],
        liens: [],
    },
    parametres: {
        pageId: "admin-parametres",
        titre: "Paramètres",
        but: "Personnaliser votre expérience utilisateur.",
        description: "Profil, thème, langue, notifications, sécurité et accessibilité.",
        elements: [],
        tachesDisponibles: ["Modifier votre profil", "Changer le thème", "Configurer vos notifications"],
        liens: [],
    },
};
