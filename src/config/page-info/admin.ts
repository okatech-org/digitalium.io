// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page Info Config: Admin
// ═══════════════════════════════════════════════

import type { PageInfoMap } from "@/types/page-info";
import { injectArchitecture } from "./architecture-data";

export const ADMIN_PAGE_INFO: PageInfoMap = injectArchitecture({

    /* ─── Administration ───────────────────────── */

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
    clients: {
        pageId: "admin-clients",
        titre: "Clients",
        but: "Gérer la relation commerciale avec les organisations clientes.",
        description: "Vue de toutes les organisations clientes avec leur type, contact principal, documents et revenus générés.",
        elements: [
            { nom: "Tableau clients", type: "tableau", description: "Organisations avec type, contact, documents, revenus" },
            { nom: "Bouton Ajouter", type: "bouton", description: "Ajoute un nouveau client" },
        ],
        tachesDisponibles: [
            "Consulter les clients",
            "Ajouter un nouveau client",
            "Suivre les revenus par client",
        ],
        liens: [
            { page: "Organisations", relation: "Détails de chaque organisation", route: "/admin/organizations" },
            { page: "Facturation", relation: "Facturation des clients", route: "/admin/billing" },
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

    /* ─── Espace DIGITALIUM ──────────────────── */

    digitalium: {
        pageId: "digitalium-dashboard",
        titre: "DIGITALIUM — Dashboard",
        but: "Vue d'ensemble de l'entreprise DIGITALIUM.",
        description: "KPIs de l'entreprise : employés, bureaux, modules actifs, clients servis. Accès rapides et activité récente.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Employés, bureaux, modules, clients" },
            { nom: "Accès rapide", type: "carte", description: "Liens vers Profil, Équipe, Bureaux" },
            { nom: "Activité récente", type: "tableau", description: "Dernières actions sur la plateforme" },
        ],
        tachesDisponibles: [
            "Consulter les métriques de l'entreprise",
            "Accéder aux sections DIGITALIUM",
        ],
        liens: [
            { page: "Profil Entreprise", relation: "Informations légales", route: "/admin/digitalium/profile" },
            { page: "Équipe", relation: "Membres DIGITALIUM", route: "/admin/digitalium/team" },
            { page: "Bureaux", relation: "Implantations", route: "/admin/digitalium/offices" },
        ],
    },
    "digitalium/profile": {
        pageId: "digitalium-profile",
        titre: "Profil Entreprise",
        but: "Gérer les informations légales et les coordonnées de DIGITALIUM.",
        description: "Identité (raison sociale, RCCM, NIF), coordonnées (email, téléphone, adresse), paramètres régionaux et modules proposés.",
        elements: [
            { nom: "Formulaire Identité", type: "champ", description: "Raison sociale, secteur, RCCM, NIF" },
            { nom: "Formulaire Coordonnées", type: "champ", description: "Email, téléphone, adresse, site web" },
            { nom: "Paramètres régionaux", type: "champ", description: "Fuseau horaire, devise, langue" },
            { nom: "Modules proposés", type: "carte", description: "iDocument, iArchive, iSignature avec statistiques" },
        ],
        tachesDisponibles: [
            "Modifier les informations légales",
            "Mettre à jour les coordonnées",
            "Configurer les paramètres régionaux",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
        ],
    },
    "digitalium/team": {
        pageId: "digitalium-team",
        titre: "Équipe DIGITALIUM",
        but: "Gérer les membres et les accès de l'entreprise DIGITALIUM.",
        description: "Liste complète de l'équipe avec KPIs, recherche, filtres par département/rôle/statut, et invitation de nouveaux membres.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Total, actifs, en attente, départements" },
            { nom: "Tableau équipe", type: "tableau", description: "Membres avec poste, département, rôle, statut, connexion" },
            { nom: "Recherche et filtres", type: "filtre", description: "Filtrage par département, rôle, statut" },
            { nom: "Bouton Inviter", type: "bouton", description: "Invite un nouveau membre par email" },
        ],
        tachesDisponibles: [
            "Rechercher un membre",
            "Inviter un nouveau membre",
            "Filtrer par département ou rôle",
            "Gérer les statuts des membres",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
            { page: "Bureaux", relation: "Implantations de l'équipe", route: "/admin/digitalium/offices" },
        ],
    },
    "digitalium/offices": {
        pageId: "digitalium-offices",
        titre: "Bureaux & Implantations",
        but: "Gérer les locaux et implantations de DIGITALIUM.",
        description: "Vue des bureaux avec adresse, capacité, taux d'occupation, départements hébergés et statut.",
        elements: [
            { nom: "Cartes résumé", type: "carte", description: "Implantations, employés répartis, villes couvertes" },
            { nom: "Cartes bureaux", type: "carte", description: "Détails de chaque bureau avec occupation" },
            { nom: "Bouton Ajouter", type: "bouton", description: "Ajoute une nouvelle implantation" },
        ],
        tachesDisponibles: [
            "Consulter les bureaux existants",
            "Ajouter un nouveau bureau",
            "Suivre les taux d'occupation",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
            { page: "Équipe", relation: "Membres par bureau", route: "/admin/digitalium/team" },
        ],
    },
    "digitalium/settings": {
        pageId: "digitalium-settings",
        titre: "Paramètres DIGITALIUM",
        but: "Configurer la plateforme DIGITALIUM.",
        description: "Paramètres plateforme (domaine, API, maintenance), sécurité (2FA, session, mot de passe), et notifications (SMTP, alertes).",
        elements: [
            { nom: "Section Plateforme", type: "champ", description: "Domaine, URL API, mode maintenance" },
            { nom: "Section Sécurité", type: "champ", description: "2FA, timeout session, politique mot de passe" },
            { nom: "Section Notifications", type: "champ", description: "Configuration SMTP, alertes, rapports" },
        ],
        tachesDisponibles: [
            "Configurer le domaine et l'API",
            "Gérer la sécurité de la plateforme",
            "Configurer les notifications email",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
        ],
    },

    /* ─── Infrastructure (from SysAdmin) ───────── */

    infrastructure: {
        pageId: "sysadmin-dashboard",
        titre: "Dashboard Système",
        but: "Vue d'ensemble de l'état du système, de l'infrastructure et des métriques clés en temps réel.",
        description: "Ce tableau de bord centralise toutes les informations critiques : statut des serveurs, utilisation CPU/RAM, requêtes par seconde, alertes actives et activité récente.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Métriques système en temps réel (CPU, RAM, stockage, requêtes)" },
            { nom: "Graphique d'activité", type: "graphique", description: "Historique de charge et de requêtes sur 24h/7j" },
            { nom: "Alertes actives", type: "tableau", description: "Liste des alertes système non résolues" },
            { nom: "Activité récente", type: "tableau", description: "Journaux des dernières opérations système" },
        ],
        tachesDisponibles: [
            "Surveiller l'état de l'infrastructure",
            "Répondre aux alertes système",
            "Consulter les métriques de performance",
            "Accéder rapidement aux sections critiques",
        ],
        liens: [
            { page: "Infrastructure", relation: "Détail des serveurs et services", route: "/admin/infrastructure/servers" },
            { page: "Monitoring", relation: "Métriques détaillées et graphiques", route: "/admin/monitoring" },
            { page: "Journaux", relation: "Historique détaillé des événements", route: "/admin/logs" },
        ],
        conseil: "Consultez ce dashboard au début de chaque journée pour identifier rapidement les problèmes potentiels.",
    },
    "infrastructure/servers": {
        pageId: "sysadmin-infrastructure",
        titre: "Infrastructure",
        but: "Gérer les serveurs, services cloud et ressources d'hébergement de la plateforme.",
        description: "Vue détaillée de tous les serveurs (physiques et cloud), leur statut, utilisation des ressources, et actions de maintenance disponibles.",
        elements: [
            { nom: "Liste des serveurs", type: "tableau", description: "Tous les serveurs avec statut, IP, charge" },
            { nom: "Bouton Redémarrer", type: "bouton", description: "Redémarre un serveur sélectionné (nécessite confirmation)" },
            { nom: "Bouton Maintenance", type: "bouton", description: "Active le mode maintenance sur un serveur" },
        ],
        tachesDisponibles: [
            "Vérifier le statut de chaque serveur",
            "Redémarrer un serveur en cas de problème",
            "Activer/désactiver le mode maintenance",
            "Provisionner de nouvelles ressources",
        ],
        liens: [
            { page: "Monitoring", relation: "Métriques détaillées par serveur", route: "/admin/monitoring" },
            { page: "Sécurité", relation: "Règles firewall associées", route: "/admin/security" },
        ],
        conseil: "Avant tout redémarrage, vérifiez qu'aucune opération critique n'est en cours dans Monitoring.",
    },
    monitoring: {
        pageId: "sysadmin-monitoring",
        titre: "Monitoring",
        but: "Suivre les métriques de performance et détecter les anomalies en temps réel.",
        description: "Graphiques de performance (CPU, RAM, réseau, I/O), alertes configurables, et historique des incidents.",
        elements: [
            { nom: "Graphiques temps réel", type: "graphique", description: "CPU, mémoire, réseau, I/O disque" },
            { nom: "Seuils d'alertes", type: "carte", description: "Configuration des seuils de déclenchement" },
            { nom: "Historique incidents", type: "tableau", description: "Chronologie des incidents passés" },
        ],
        tachesDisponibles: [
            "Surveiller les métriques en temps réel",
            "Configurer les seuils d'alertes",
            "Analyser les tendances de performance",
            "Exporter les rapports de performance",
        ],
        liens: [
            { page: "Dashboard", relation: "Vue résumée des métriques", route: "/admin/infrastructure" },
            { page: "Infrastructure", relation: "Actions sur les serveurs", route: "/admin/infrastructure/servers" },
        ],
    },
    databases: {
        pageId: "sysadmin-databases",
        titre: "Bases de Données",
        but: "Gérer les bases de données, réplicas et sauvegardes de la plateforme.",
        description: "Administration centralisée des instances de bases de données : état de santé, réplication, sauvegardes automatiques et manuelles.",
        elements: [
            { nom: "Liste des databases", type: "tableau", description: "Toutes les instances avec taille, connexions, latence" },
            { nom: "Statut réplication", type: "carte", description: "État de synchronisation des réplicas" },
            { nom: "Bouton Sauvegarde manuelle", type: "bouton", description: "Déclenche une sauvegarde immédiate" },
        ],
        tachesDisponibles: [
            "Vérifier l'état de santé des databases",
            "Gérer les réplicas de lecture",
            "Planifier et restaurer des sauvegardes",
            "Optimiser les performances (requêtes lentes)",
        ],
        liens: [
            { page: "Réplicas", relation: "Gestion détaillée des réplicas", route: "/admin/databases/replicas" },
            { page: "Sauvegardes", relation: "Historique et restauration", route: "/admin/databases/backups" },
        ],
    },
    logs: {
        pageId: "sysadmin-logs",
        titre: "Journaux",
        but: "Consulter et analyser les journaux d'événements de toute la plateforme.",
        description: "Vue centralisée de tous les logs système, applicatifs et de sécurité, avec filtrage par niveau (info, warn, error), source et date.",
        elements: [
            { nom: "Tableau des logs", type: "tableau", description: "Liste chronologique des événements" },
            { nom: "Filtres", type: "filtre", description: "Filtrage par niveau, source, date et texte" },
            { nom: "Bouton Exporter", type: "bouton", description: "Exporte les logs filtrés en CSV/JSON" },
        ],
        tachesDisponibles: [
            "Rechercher un événement spécifique",
            "Filtrer par niveau d'erreur",
            "Exporter les logs pour analyse externe",
            "Identifier les patterns d'erreurs récurrents",
        ],
        liens: [
            { page: "Sécurité", relation: "Logs de sécurité détaillés", route: "/admin/security" },
            { page: "Monitoring", relation: "Corrélation avec les métriques", route: "/admin/monitoring" },
        ],
    },
    security: {
        pageId: "sysadmin-security",
        titre: "Sécurité",
        but: "Gérer la sécurité de la plateforme : règles firewall, détection d'intrusions, audit.",
        description: "Configuration des politiques de sécurité, gestion des certificats SSL, surveillance des tentatives d'accès suspectes et audit de conformité.",
        elements: [
            { nom: "Règles firewall", type: "tableau", description: "Liste des règles actives avec actions autorisées/bloquées" },
            { nom: "Certificats SSL", type: "tableau", description: "État et date d'expiration des certificats" },
            { nom: "Logs de sécurité", type: "tableau", description: "Tentatives de connexion suspectes" },
        ],
        tachesDisponibles: [
            "Vérifier les certificats SSL",
            "Configurer les règles firewall",
            "Auditer les accès récents",
            "Bloquer des IP suspectes",
        ],
        liens: [
            { page: "IAM", relation: "Gestion des identités et accès", route: "/admin/iam" },
            { page: "Journaux", relation: "Historique complet des événements", route: "/admin/logs" },
        ],
        conseil: "Vérifiez régulièrement les dates d'expiration des certificats SSL pour éviter les interruptions de service.",
    },
    iam: {
        pageId: "sysadmin-iam",
        titre: "IAM (Identités & Accès)",
        but: "Gérer les rôles, permissions et politiques d'accès de la plateforme.",
        description: "Administration des rôles (system_admin, platform_admin, org_admin...), attribution des permissions, et gestion des politiques d'accès aux ressources.",
        elements: [
            { nom: "Tableau des rôles", type: "tableau", description: "Tous les rôles avec leurs niveaux et permissions" },
            { nom: "Bouton Créer rôle", type: "bouton", description: "Crée un nouveau rôle personnalisé" },
            { nom: "Matrice des permissions", type: "tableau", description: "Vue croisée rôles × permissions" },
        ],
        tachesDisponibles: [
            "Créer et modifier des rôles",
            "Attribuer des permissions à un rôle",
            "Auditer les politiques d'accès",
            "Révoquer des accès",
        ],
        liens: [
            { page: "Utilisateurs", relation: "Utilisateurs associés à chaque rôle", route: "/admin/users" },
            { page: "Sécurité", relation: "Politiques de sécurité liées", route: "/admin/security" },
        ],
    },

    /* ─── Organisation Client ────────────────── */

    organization: {
        pageId: "admin-organization",
        titre: "Organisation Client",
        but: "Configurer le profil de l'organisme client connecté.",
        description: "Identité (nom, secteur, RCCM, NIF), coordonnées, plan actif, quotas (membres, stockage), paramètres régionaux et modules activés.",
        elements: [
            { nom: "Plan & Quotas", type: "carte", description: "Plan actif, nombre de membres, stockage utilisé" },
            { nom: "Formulaire Identité", type: "champ", description: "Raison sociale, secteur, RCCM, NIF" },
            { nom: "Formulaire Coordonnées", type: "champ", description: "Email, téléphone, adresse, site web" },
            { nom: "Modules activés", type: "carte", description: "iDocument, iArchive, iSignature avec usage" },
        ],
        tachesDisponibles: [
            "Modifier les informations de l'organisation",
            "Changer le plan d'abonnement",
            "Consulter les quotas",
        ],
        liens: [
            { page: "Personnel", relation: "Membres de l'organisation", route: "/admin/organization/personnel" },
            { page: "Structure", relation: "Départements et bureaux", route: "/admin/organization/structure" },
            { page: "Workflows", relation: "Configuration des workflows", route: "/admin/organization/workflows" },
            { page: "Thème", relation: "Personnalisation visuelle", route: "/admin/design-theme" },
        ],
    },
    "organization/personnel": {
        pageId: "admin-organization-personnel",
        titre: "Personnel Organisation",
        but: "Gérer les membres de l'organisation cliente.",
        description: "Liste du personnel avec KPIs, recherche, filtres par département/rôle/statut, et invitation de nouveaux membres.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Total, actifs, en attente, départements" },
            { nom: "Tableau personnel", type: "tableau", description: "Membres avec poste, département, rôle, statut" },
            { nom: "Recherche et filtres", type: "filtre", description: "Filtrage par département, rôle, statut" },
            { nom: "Bouton Inviter", type: "bouton", description: "Invite un nouveau membre par email" },
        ],
        tachesDisponibles: [
            "Rechercher un membre",
            "Inviter un nouveau membre",
            "Filtrer par département ou rôle",
        ],
        liens: [
            { page: "Organisation", relation: "Profil de l'organisme", route: "/admin/organization" },
            { page: "Structure", relation: "Départements de l'organisation", route: "/admin/organization/structure" },
        ],
    },
    "organization/structure": {
        pageId: "admin-organization-structure",
        titre: "Structure Organisation",
        but: "Gérer les départements et bureaux de l'organisation cliente.",
        description: "Vue des départements avec responsables, sous-services et effectifs. Liste des bureaux avec adresse, téléphone et effectifs.",
        elements: [
            { nom: "Cartes départements", type: "carte", description: "Départements avec responsable, membres, sous-services" },
            { nom: "Liste bureaux", type: "tableau", description: "Bureaux avec adresse, employés, départements" },
            { nom: "Bouton Ajouter département", type: "bouton", description: "Crée un nouveau département" },
        ],
        tachesDisponibles: [
            "Consulter les départements",
            "Ajouter un département",
            "Voir les bureaux de l'organisation",
        ],
        liens: [
            { page: "Organisation", relation: "Profil de l'organisme", route: "/admin/organization" },
            { page: "Personnel", relation: "Membres par département", route: "/admin/organization/personnel" },
        ],
    },
    "organization/workflows": {
        pageId: "admin-organization-workflows",
        titre: "Workflows Organisation",
        but: "Configurer les workflows par module pour l'organisation cliente.",
        description: "Workflows organisés par onglet module (iDocument, iArchive, iSignature). Chaque workflow a des étapes, un statut actif/inactif, et des statistiques d'exécution.",
        elements: [
            { nom: "Onglets modules", type: "bouton", description: "Navigation entre iDocument, iArchive, iSignature" },
            { nom: "Statistiques", type: "carte", description: "Total workflows, actifs, exécutions" },
            { nom: "Cartes workflows", type: "carte", description: "Workflows avec étapes, statut, exécutions" },
            { nom: "Bouton Nouveau workflow", type: "bouton", description: "Crée un nouveau workflow" },
        ],
        tachesDisponibles: [
            "Consulter les workflows par module",
            "Créer un nouveau workflow",
            "Activer ou désactiver un workflow",
        ],
        liens: [
            { page: "Organisation", relation: "Profil de l'organisme", route: "/admin/organization" },
        ],
    },
    "design-theme": {
        pageId: "sysadmin-design-theme",
        titre: "Thème & Design",
        but: "Personnaliser l'apparence visuelle de la plateforme pour votre organisation.",
        description: "Configuration des couleurs, typographies, logo et éléments visuels de l'interface utilisateur.",
        elements: [
            { nom: "Palette de couleurs", type: "carte", description: "Couleurs primaire, secondaire, accent" },
            { nom: "Logo upload", type: "champ", description: "Upload du logo en format PNG/SVG" },
            { nom: "Preview temps réel", type: "autre", description: "Aperçu des changements avant validation" },
        ],
        tachesDisponibles: [
            "Modifier les couleurs de la plateforme",
            "Uploader un nouveau logo",
            "Prévisualiser les changements",
        ],
        liens: [
            { page: "Organisation", relation: "Informations de l'organisation", route: "/admin/organization" },
        ],
    },
    "workflow-templates": {
        pageId: "admin-workflow-templates",
        titre: "Workflow Templates",
        but: "Redirigé vers Organisation > Workflows.",
        description: "Cette page redirige automatiquement vers la section Workflows de l'organisation.",
        elements: [],
        tachesDisponibles: [],
        liens: [
            { page: "Workflows", relation: "Configuration des workflows", route: "/admin/organization/workflows" },
        ],
    },

    /* ─── Modules (from SubAdmin) ──────────────── */

    modules: {
        pageId: "admin-modules",
        titre: "Dashboard Modules",
        but: "Vue d'ensemble de l'activité de votre organisation et de ses modules.",
        description: "Métriques de votre organisation : dossiers et fichiers importés, archives, signatures en cours, membres actifs et activité récente.",
        elements: [
            { nom: "Cartes modules", type: "carte", description: "iDocument, iArchive, iSignature avec statistiques" },
            { nom: "Dossiers récents", type: "tableau", description: "Derniers dossiers modifiés ou créés" },
            { nom: "Signatures en attente", type: "tableau", description: "Documents à signer avec priorité" },
            { nom: "Activité de l'équipe", type: "tableau", description: "Actions récentes des membres" },
        ],
        tachesDisponibles: ["Surveiller l'activité de l'organisation", "Accéder aux modules rapidement"],
        liens: [
            { page: "iDocument", relation: "Gestion documentaire", route: "/admin/idocument" },
            { page: "iArchive", relation: "Archives de l'organisation", route: "/admin/iarchive" },
        ],
    },

    /* ─── iDocument ────────────────────────────── */

    idocument: {
        pageId: "admin-idocument",
        titre: "Dossiers",
        but: "Gérer les dossiers de votre organisation et importer des fichiers.",
        description: "Création de dossiers avec tags, permissions (privé/partagé/équipe), import de fichiers (PDF, DOCX, images) et archivage automatique programmé.",
        elements: [
            { nom: "Grille de dossiers", type: "carte", description: "Dossiers avec nom, tags, permissions, nb fichiers, date" },
            { nom: "Bouton Nouveau dossier", type: "bouton", description: "Crée un nouveau dossier avec tags et permissions" },
            { nom: "Filtres", type: "filtre", description: "Filtrage par tag, visibilité, recherche textuelle" },
            { nom: "Vue fichiers", type: "tableau", description: "Liste des fichiers importés dans un dossier" },
            { nom: "Zone d'import", type: "autre", description: "Drag & drop pour importer des fichiers (PDF, DOCX, PNG, JPG)" },
        ],
        tachesDisponibles: [
            "Créer un dossier",
            "Importer des fichiers dans un dossier",
            "Définir les permissions (privé, partagé, équipe)",
            "Configurer l'archivage automatique",
            "Filtrer par tag ou visibilité",
        ],
        liens: [
            { page: "Templates", relation: "Modèles de dossiers préconfigurés", route: "/admin/idocument/templates" },
            { page: "Corbeille", relation: "Dossiers et fichiers supprimés", route: "/admin/idocument/trash" },
            { page: "iArchive", relation: "Archives des fichiers taggés", route: "/admin/iarchive" },
        ],
    },
    "idocument/templates": {
        pageId: "admin-idocument-templates",
        titre: "Templates de dossiers",
        but: "Gérer les modèles de dossiers préconfigurés.",
        description: "Bibliothèque de templates avec tags par défaut, permissions, sous-dossiers inclus et archivage automatique. Utilisez un template pour créer rapidement un dossier structuré.",
        elements: [
            { nom: "Grille de templates", type: "carte", description: "Modèles avec tags, sous-dossiers, visibilité par défaut" },
            { nom: "Bouton Utiliser", type: "bouton", description: "Crée un dossier pré-rempli depuis ce template" },
            { nom: "Bouton Nouveau template", type: "bouton", description: "Crée un nouveau modèle de dossier" },
        ],
        tachesDisponibles: [
            "Parcourir les templates existants",
            "Créer un dossier depuis un template",
            "Créer un nouveau template",
            "Modifier un template existant",
        ],
        liens: [
            { page: "Dossiers", relation: "Dossiers créés depuis templates", route: "/admin/idocument" },
        ],
    },
    "idocument/trash": {
        pageId: "admin-idocument-trash",
        titre: "Corbeille",
        but: "Gérer les dossiers et fichiers supprimés.",
        description: "Dossiers et fichiers placés dans la corbeille, récupérables avant la suppression définitive automatique (30 jours).",
        elements: [
            { nom: "Liste corbeille", type: "tableau", description: "Dossiers et fichiers supprimés avec délai d'expiration" },
            { nom: "Bouton Restaurer", type: "bouton", description: "Restaure l'élément dans son dossier d'origine" },
            { nom: "Bouton Vider", type: "bouton", description: "Supprime définitivement tous les éléments" },
        ],
        tachesDisponibles: ["Restaurer un dossier ou fichier", "Vider la corbeille", "Supprimer définitivement"],
        liens: [
            { page: "Dossiers", relation: "Dossiers actifs", route: "/admin/idocument" },
        ],
    },

    /* ─── iArchive ─────────────────────────────── */

    iarchive: {
        pageId: "admin-iarchive",
        titre: "Archives — Vue Globale",
        but: "Consulter tous les fichiers archivés, filtrables par catégorie dynamique.",
        description: "Tableau centralisé de toutes les archives avec KPIs par catégorie, filtres par catégorie et confidentialité, barres de progression de rétention.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Total archives, par catégorie (dynamique), stockage utilisé" },
            { nom: "Tableau filtrable", type: "tableau", description: "Archives avec catégorie, date, rétention, confidentialité" },
            { nom: "Filtres", type: "filtre", description: "Filtrage par catégorie, confidentialité, recherche textuelle" },
        ],
        tachesDisponibles: [
            "Consulter les archives par catégorie",
            "Rechercher un fichier archivé",
            "Filtrer par niveau de confidentialité",
            "Télécharger un document archivé",
        ],
        liens: [
            { page: "Coffre-Fort", relation: "Documents ultra-sécurisés", route: "/admin/iarchive/vault" },
            { page: "Catégories", relation: "Gérer les catégories d'archivage", route: "/admin/iarchive/categories" },
            { page: "Certificats", relation: "Certificats d'archivage", route: "/admin/iarchive/certificates" },
        ],
    },
    "iarchive/vault": {
        pageId: "admin-iarchive-vault",
        titre: "Coffre-Fort Numérique",
        but: "Protéger les documents les plus sensibles avec chiffrement AES-256.",
        description: "Espace ultra-sécurisé avec sous-dossiers, chiffrement renforcé, journalisation des accès. Les fichiers taggés peuvent être archivés dans le coffre-fort même s'il existe un dossier catégoriel dédié.",
        elements: [
            { nom: "Sous-dossiers", type: "carte", description: "Dossiers dans le coffre héritant des propriétés de sécurité" },
            { nom: "Fichiers racine", type: "tableau", description: "Documents protégés à la racine du coffre" },
            { nom: "Bouton Nouveau sous-dossier", type: "bouton", description: "Crée un sous-dossier sécurisé" },
            { nom: "Zone d'import", type: "autre", description: "Import direct de fichiers dans le coffre" },
        ],
        tachesDisponibles: [
            "Créer des sous-dossiers dans le coffre",
            "Déposer des fichiers sécurisés",
            "Renommer ou supprimer un sous-dossier",
            "Consulter les fichiers par dossier",
        ],
        liens: [
            { page: "Vue Globale", relation: "Toutes les archives", route: "/admin/iarchive" },
            { page: "Catégories", relation: "Gestion des catégories", route: "/admin/iarchive/categories" },
        ],
    },
    "iarchive/categories": {
        pageId: "admin-iarchive-categories",
        titre: "Gestion des Catégories",
        but: "Créer, modifier et organiser les catégories d'archivage.",
        description: "CRUD complet des catégories : nom, couleur, icône, rétention par défaut, confidentialité. Le Coffre-Fort est une catégorie fixe non supprimable. Les catégories par défaut (Fiscal, Social, Juridique, Clients) sont modifiables.",
        elements: [
            { nom: "Liste des catégories", type: "tableau", description: "Catégories avec couleur, icône, nb fichiers, statut, rétention" },
            { nom: "Bouton Nouvelle catégorie", type: "bouton", description: "Crée une nouvelle catégorie d'archivage" },
            { nom: "Bouton Modifier", type: "bouton", description: "Modifie une catégorie existante (couleur, icône, rétention)" },
            { nom: "Toggle Activer/Désactiver", type: "bouton", description: "Active ou désactive une catégorie" },
        ],
        tachesDisponibles: [
            "Créer une nouvelle catégorie",
            "Modifier une catégorie existante",
            "Activer ou désactiver une catégorie",
            "Réordonner les catégories",
        ],
        liens: [
            { page: "Vue Globale", relation: "Archives filtrables par catégorie", route: "/admin/iarchive" },
            { page: "Coffre-Fort", relation: "Catégorie fixe du coffre", route: "/admin/iarchive/vault" },
        ],
    },
    "iarchive/certificates": {
        pageId: "admin-iarchive-certificates",
        titre: "Certificats",
        but: "Gérer les certificats et attestations de l'organisation.",
        description: "Certificats de conformité, attestations officielles et documents certifiés avec suivi de validité.",
        elements: [
            { nom: "Liste des certificats", type: "tableau", description: "Certificats avec statut de validité et dates" },
            { nom: "Bouton Générer", type: "bouton", description: "Génère un nouveau certificat" },
            { nom: "Cartes KPI", type: "carte", description: "Valides, expirés, bientôt expirés" },
        ],
        tachesDisponibles: ["Consulter un certificat", "Générer un certificat", "Vérifier la validité"],
        liens: [
            { page: "Vue Globale", relation: "Archives certifiées", route: "/admin/iarchive" },
        ],
    },

    /* ─── iSignature ───────────────────────────── */

    "isignature/pending": {
        pageId: "subadmin-isignature-pending",
        titre: "À Signer",
        but: "Documents en attente de votre signature.",
        description: "Liste des documents qui nécessitent votre signature électronique, classés par urgence.",
        elements: [
            { nom: "Liste à signer", type: "tableau", description: "Documents avec émetteur, date limite, urgence" },
            { nom: "Bouton Signer", type: "bouton", description: "Ouvre le processus de signature" },
        ],
        tachesDisponibles: ["Signer un document", "Refuser une signature", "Déléguer une signature"],
        liens: [
            { page: "En attente", relation: "Documents envoyés", route: "/admin/isignature/waiting" },
            { page: "Signés", relation: "Historique", route: "/admin/isignature/completed" },
        ],
    },
    "isignature/waiting": {
        pageId: "subadmin-isignature-waiting",
        titre: "En Attente de Signature",
        but: "Suivre les documents que vous avez envoyés pour signature.",
        description: "Documents envoyés à d'autres signataires, avec suivi de l'avancement des signatures.",
        elements: [
            { nom: "Liste en attente", type: "tableau", description: "Documents envoyés avec statut signature" },
            { nom: "Bouton Relancer", type: "bouton", description: "Envoie un rappel au signataire" },
        ],
        tachesDisponibles: ["Suivre l'avancement", "Envoyer un rappel", "Annuler une demande"],
        liens: [
            { page: "À Signer", relation: "Vos signatures en attente", route: "/admin/isignature/pending" },
            { page: "Signés", relation: "Historique complet", route: "/admin/isignature/completed" },
        ],
    },
    "isignature/completed": {
        pageId: "subadmin-isignature-completed",
        titre: "Documents Signés",
        but: "Consulter l'historique de tous les documents signés.",
        description: "Archive complète des documents signés avec horodatage, certificats de signature et piste d'audit.",
        elements: [
            { nom: "Historique des signatures", type: "tableau", description: "Documents signés avec dates et certificats" },
            { nom: "Bouton Télécharger", type: "bouton", description: "Télécharge le document signé avec certificat" },
        ],
        tachesDisponibles: ["Consulter les documents signés", "Télécharger un certificat", "Vérifier une signature"],
        liens: [
            { page: "À Signer", relation: "Signatures en attente", route: "/admin/isignature/pending" },
        ],
    },
    "isignature/workflows": {
        pageId: "subadmin-isignature-workflows",
        titre: "Workflows de Signature",
        but: "Configurer des circuits de signature automatisés.",
        description: "Modèles de workflows définissant l'ordre des signataires, les conditions et les délais pour chaque type de document.",
        elements: [
            { nom: "Liste des workflows", type: "tableau", description: "Workflows avec étapes et signataires" },
            { nom: "Bouton Créer workflow", type: "bouton", description: "Crée un nouveau circuit de signature" },
        ],
        tachesDisponibles: ["Créer un workflow", "Modifier un workflow existant", "Activer/désactiver un workflow"],
        liens: [
            { page: "À Signer", relation: "Documents utilisant les workflows", route: "/admin/isignature/pending" },
        ],
    },
});
