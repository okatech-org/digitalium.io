// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page Info Config: SysAdmin
// ═══════════════════════════════════════════════

import type { PageInfoMap } from "@/types/page-info";
import { injectArchitecture } from "./architecture-data";

export const SYSADMIN_PAGE_INFO: PageInfoMap = injectArchitecture({
    dashboard: {
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
            { page: "Infrastructure", relation: "Détail des serveurs et services", route: "/sysadmin/infrastructure" },
            { page: "Monitoring", relation: "Métriques détaillées et graphiques", route: "/sysadmin/monitoring" },
            { page: "Journaux", relation: "Historique détaillé des événements", route: "/sysadmin/logs" },
        ],
        conseil: "Consultez ce dashboard au début de chaque journée pour identifier rapidement les problèmes potentiels.",
    },
    infrastructure: {
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
            { page: "Monitoring", relation: "Métriques détaillées par serveur", route: "/sysadmin/monitoring" },
            { page: "Sécurité", relation: "Règles firewall associées", route: "/sysadmin/security" },
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
            { page: "Dashboard", relation: "Vue résumée des métriques", route: "/sysadmin" },
            { page: "Infrastructure", relation: "Actions sur les serveurs", route: "/sysadmin/infrastructure" },
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
            { page: "Réplicas", relation: "Gestion détaillée des réplicas", route: "/sysadmin/databases/replicas" },
            { page: "Sauvegardes", relation: "Historique et restauration", route: "/sysadmin/databases/backups" },
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
            { page: "Sécurité", relation: "Logs de sécurité détaillés", route: "/sysadmin/security" },
            { page: "Monitoring", relation: "Corrélation avec les métriques", route: "/sysadmin/monitoring" },
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
            { page: "IAM", relation: "Gestion des identités et accès", route: "/sysadmin/iam" },
            { page: "Journaux", relation: "Historique complet des événements", route: "/sysadmin/logs" },
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
            { page: "Utilisateurs", relation: "Utilisateurs associés à chaque rôle", route: "/sysadmin/users" },
            { page: "Sécurité", relation: "Politiques de sécurité liées", route: "/sysadmin/security" },
        ],
    },
    organization: {
        pageId: "sysadmin-organization",
        titre: "Configuration Organisation",
        but: "Configurer les paramètres globaux de l'organisation propriétaire de la plateforme.",
        description: "Nom de l'organisation, logo, coordonnées, fuseau horaire, et paramètres de personnalisation de la plateforme.",
        elements: [
            { nom: "Formulaire Organisation", type: "champ", description: "Nom, logo, adresse, contact" },
            { nom: "Bouton Sauvegarder", type: "bouton", description: "Enregistre les modifications" },
        ],
        tachesDisponibles: [
            "Modifier les informations de l'organisation",
            "Mettre à jour le logo",
            "Configurer le fuseau horaire par défaut",
        ],
        liens: [
            { page: "Thème", relation: "Personnalisation visuelle", route: "/sysadmin/design-theme" },
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
            { page: "Organisation", relation: "Informations de l'organisation", route: "/sysadmin/organization" },
        ],
    },
    users: {
        pageId: "sysadmin-users",
        titre: "Utilisateurs",
        but: "Gérer tous les utilisateurs inscrits sur la plateforme.",
        description: "Liste complète des utilisateurs avec leurs rôles, organisations, statut et dernière connexion. Actions de gestion disponibles.",
        elements: [
            { nom: "Tableau utilisateurs", type: "tableau", description: "Tous les utilisateurs avec rôle, statut, dernière connexion" },
            { nom: "Bouton Inviter", type: "bouton", description: "Invite un nouvel utilisateur par email" },
            { nom: "Recherche", type: "filtre", description: "Recherche par nom, email, rôle" },
            { nom: "Actions par ligne", type: "bouton", description: "Modifier, suspendre, supprimer un utilisateur" },
        ],
        tachesDisponibles: [
            "Rechercher un utilisateur",
            "Inviter de nouveaux utilisateurs",
            "Modifier les rôles et permissions",
            "Suspendre ou supprimer un compte",
        ],
        liens: [
            { page: "IAM", relation: "Gestion des rôles et permissions", route: "/sysadmin/iam" },
            { page: "Clients", relation: "Organisations clientes", route: "/sysadmin/clients" },
        ],
    },
    clients: {
        pageId: "sysadmin-clients",
        titre: "Clients",
        but: "Gérer les organisations clientes de la plateforme.",
        description: "Vue de toutes les organisations inscrites, leur plan d'abonnement, nombre d'utilisateurs et état du compte.",
        elements: [
            { nom: "Tableau clients", type: "tableau", description: "Organisations avec plan, utilisateurs, statut" },
            { nom: "Bouton Créer client", type: "bouton", description: "Crée une nouvelle organisation cliente" },
            { nom: "Filtres", type: "filtre", description: "Filtrage par plan, statut, date" },
        ],
        tachesDisponibles: [
            "Créer une nouvelle organisation",
            "Modifier le plan d'un client",
            "Voir les détails d'utilisation",
            "Suspendre ou activer un compte",
        ],
        liens: [
            { page: "Abonnements", relation: "Plans et facturation", route: "/sysadmin/subscriptions" },
            { page: "Utilisateurs", relation: "Membres de chaque organisation", route: "/sysadmin/users" },
        ],
    },
    subscriptions: {
        pageId: "sysadmin-subscriptions",
        titre: "Abonnements",
        but: "Gérer les plans d'abonnement et la facturation de la plateforme.",
        description: "Configuration des plans (gratuit, premium, enterprise), gestion des abonnements actifs, et suivi des paiements.",
        elements: [
            { nom: "Plans disponibles", type: "carte", description: "Cartes des plans avec tarifs et fonctionnalités" },
            { nom: "Abonnements actifs", type: "tableau", description: "Liste des abonnements en cours" },
            { nom: "Bouton Modifier plan", type: "bouton", description: "Modifie les caractéristiques d'un plan" },
        ],
        tachesDisponibles: [
            "Créer ou modifier un plan d'abonnement",
            "Voir les abonnements actifs",
            "Gérer les upgrades/downgrades",
            "Consulter l'historique de facturation",
        ],
        liens: [
            { page: "Clients", relation: "Organisations abonnées", route: "/sysadmin/clients" },
            { page: "Leads", relation: "Prospects intéressés", route: "/sysadmin/leads" },
        ],
    },
    leads: {
        pageId: "sysadmin-leads",
        titre: "Leads",
        but: "Suivre les prospects et contacts commerciaux intéressés par la plateforme.",
        description: "Pipeline de contacts : de la première prise de contact à la conversion en client. Suivi des interactions et relances.",
        elements: [
            { nom: "Pipeline leads", type: "tableau", description: "Leads par étape (contact, qualification, proposition, conversion)" },
            { nom: "Bouton Ajouter lead", type: "bouton", description: "Ajoute un nouveau contact prospect" },
            { nom: "Filtres statut", type: "filtre", description: "Filtrage par étape du pipeline" },
        ],
        tachesDisponibles: [
            "Ajouter un nouveau lead",
            "Qualifier un prospect",
            "Envoyer une proposition",
            "Convertir un lead en client",
        ],
        liens: [
            { page: "Clients", relation: "Leads convertis en clients", route: "/sysadmin/clients" },
            { page: "Abonnements", relation: "Plans proposés aux leads", route: "/sysadmin/subscriptions" },
        ],
    },
    "workflow-templates": {
        pageId: "sysadmin-workflow-templates",
        titre: "Workflow Templates",
        but: "Gérer les modèles de workflows réutilisables pour toute la plateforme.",
        description: "Bibliothèque de workflows prédéfinis (validation de documents, circuits de signature, approbations) que les organisations peuvent utiliser.",
        elements: [
            { nom: "Liste des templates", type: "tableau", description: "Modèles avec nom, étapes, organisations utilisatrices" },
            { nom: "Bouton Créer template", type: "bouton", description: "Crée un nouveau modèle de workflow" },
            { nom: "Éditeur visuel", type: "autre", description: "Éditeur drag-and-drop des étapes du workflow" },
        ],
        tachesDisponibles: [
            "Créer un nouveau template de workflow",
            "Modifier les étapes d'un workflow existant",
            "Publier ou archiver un template",
            "Voir l'utilisation par les organisations",
        ],
        liens: [
            { page: "Clients", relation: "Organisations utilisant ces templates", route: "/sysadmin/clients" },
        ],
    },
    formation: {
        pageId: "sysadmin-formation",
        titre: "Formation",
        but: "Module de formation interactif pour les administrateurs système.",
        description: "Parcours pédagogique qui vous guide à travers toutes les fonctionnalités de l'espace SysAdmin.",
        elements: [],
        tachesDisponibles: [
            "Consulter la vue d'ensemble de votre rôle",
            "Suivre les tutoriels pas-à-pas",
            "Valider vos acquis",
            "Consulter la FAQ",
        ],
        liens: [],
        conseil: "Suivez les tutoriels dans l'ordre pour une prise en main progressive de toutes vos responsabilités.",
    },
    parametres: {
        pageId: "sysadmin-parametres",
        titre: "Paramètres",
        but: "Personnaliser votre expérience utilisateur et vos préférences.",
        description: "Configuration du profil, thème visuel, langue, notifications, sécurité et accessibilité.",
        elements: [
            { nom: "Onglet Profil", type: "champ", description: "Modifier vos informations personnelles" },
            { nom: "Onglet Apparence", type: "carte", description: "Choix du thème clair/sombre" },
            { nom: "Onglet Notifications", type: "autre", description: "Gestion des préférences de notification" },
            { nom: "Zone danger", type: "bouton", description: "Actions irréversibles sur le compte" },
        ],
        tachesDisponibles: [
            "Modifier votre profil",
            "Changer le thème de l'interface",
            "Configurer vos notifications",
            "Gérer la sécurité de votre compte",
        ],
        liens: [],
    },
});
