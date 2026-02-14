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
        but: "Gérer les organisations inscrites sur la plateforme avec leur configuration technique.",
        description: "Grille de toutes les organisations avec leur plan, modules actifs (iDocument, iArchive, iSignature), hébergement, membres et statistiques d'utilisation.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Organisations, membres totaux, modules actifs, docs ce mois" },
            { nom: "Grille organisations", type: "carte", description: "Cartes organisations avec badges modules, hébergement, stats" },
            { nom: "Recherche", type: "filtre", description: "Recherche par nom, secteur ou ville" },
            { nom: "Bouton Nouvelle Organisation", type: "bouton", description: "Wizard de création en 5 étapes" },
        ],
        tachesDisponibles: [
            "Voir les détails d'une organisation",
            "Créer une organisation (wizard 5 étapes)",
            "Gérer les modules actifs",
            "Configurer l'hébergement",
        ],
        liens: [
            { page: "Nouvelle Organisation", relation: "Wizard de création", route: "/admin/organizations/new" },
            { page: "Clients", relation: "Relations commerciales", route: "/admin/clients" },
            { page: "Utilisateurs", relation: "Membres de chaque organisation", route: "/admin/users" },
        ],
    },
    "organizations/new": {
        pageId: "admin-organizations-new",
        titre: "Nouvelle Organisation",
        but: "Créer une nouvelle organisation avec configuration complète en 8 étapes modulables.",
        description: "Wizard guidé : 1. Profil → 2. Modules → 3. Écosystème (bureaux, départements) → 4. Personnel (rôles RBAC) → 5. Dossiers par défaut (templates métier) → 6. Configuration modules (rétention OHADA, chaînes signature, classement) → 7. Automatisation (workflows triggers/actions) → 8. Déploiement (hébergement + portail). Les étapes 6-7 n'apparaissent que si au moins un module est activé.",
        elements: [
            { nom: "Stepper dynamique", type: "autre", description: "Navigation 8 étapes, adaptatif selon les modules activés" },
            { nom: "Formulaire Profil", type: "champ", description: "Raison sociale, secteur, type, RCCM, NIF, contact, email, téléphone, adresse, ville" },
            { nom: "Sélection Modules", type: "carte", description: "3 cartes toggle pour iDocument, iArchive, iSignature" },
            { nom: "Écosystème", type: "autre", description: "Bureaux (liste) + Départements (grille avec sous-services)" },
            { nom: "Personnel", type: "tableau", description: "Membres avec rôles RBAC et affectation départementale" },
            { nom: "Dossiers par défaut", type: "carte", description: "Templates métier (Entreprise/Gouvernement/ONG) avec arborescence personnalisable" },
            { nom: "Configuration modules", type: "autre", description: "Sub-tabs par module : rétention OHADA, cycle de vie archives (8 statuts), chaînes de signature, règles de classement" },
            { nom: "Automatisation", type: "autre", description: "Règles QUAND/ALORS groupées par module, templates pré-configurés activables en 1 clic" },
            { nom: "Déploiement", type: "carte", description: "Hébergement (Local/DC/Cloud) + Page publique (domaine, thème, annuaire)" },
        ],
        tachesDisponibles: [
            "Renseigner le profil de l'organisation",
            "Choisir les modules à activer",
            "Configurer l'écosystème (bureaux, départements)",
            "Définir le personnel et les rôles",
            "Sélectionner et personnaliser les dossiers par défaut",
            "Configurer les politiques de rétention OHADA",
            "Définir les chaînes de signature",
            "Créer les règles d'automatisation",
            "Choisir le modèle de déploiement",
        ],
        liens: [
            { page: "Organisations", relation: "Liste des organisations", route: "/admin/organizations" },
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
        but: "Gérer les relations commerciales avec les organisations clientes.",
        description: "KPIs (total clients, revenue mensuel, abonnements actifs), tableau enrichi avec organisation liée, plan, revenue mensuel, statut et date de début.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Total clients, revenue mensuel, abonnements actifs, nouveaux ce mois" },
            { nom: "Tableau clients", type: "tableau", description: "Clients avec organisation, plan, revenue, statut" },
            { nom: "Recherche", type: "filtre", description: "Recherche par nom, organisation ou plan" },
            { nom: "Bouton Nouveau Client", type: "bouton", description: "Wizard de création en 3 étapes" },
        ],
        tachesDisponibles: [
            "Consulter les clients",
            "Créer un nouveau client (wizard 3 étapes)",
            "Suivre les revenus par client",
            "Voir l'organisation associée",
        ],
        liens: [
            { page: "Nouveau Client", relation: "Wizard de création", route: "/admin/clients/new" },
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
            { page: "iDocument", relation: "Gestion documentaire", route: "/admin/digitalium/idocument" },
            { page: "iArchive", relation: "Archivage légal", route: "/admin/digitalium/iarchive" },
            { page: "iSignature", relation: "Signature électronique", route: "/admin/digitalium/isignature" },
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
    "digitalium/idocument": {
        pageId: "digitalium-idocument",
        titre: "iDocument — DIGITALIUM",
        but: "Gestion documentaire interne de DIGITALIUM.",
        description: "Accès au gestionnaire de documents interne : création, édition, organisation en dossiers, recherche et filtres.",
        elements: [
            { nom: "Gestionnaire de fichiers", type: "autre", description: "Vue grille/liste avec dossiers et documents" },
            { nom: "Recherche et filtres", type: "filtre", description: "Recherche par nom, auteur, tags, statut" },
            { nom: "Bouton Nouveau", type: "bouton", description: "Crée un nouveau document" },
        ],
        tachesDisponibles: [
            "Créer un document",
            "Rechercher et filtrer les documents",
            "Organiser les dossiers",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
            { page: "iArchive", relation: "Archivage légal", route: "/admin/digitalium/iarchive" },
            { page: "iSignature", relation: "Signature électronique", route: "/admin/digitalium/isignature" },
        ],
    },
    "digitalium/iarchive": {
        pageId: "digitalium-iarchive",
        titre: "iArchive — DIGITALIUM",
        but: "Archivage légal interne de DIGITALIUM.",
        description: "Dashboard d'archivage avec catégories (Fiscal, Social, Juridique, Clients, Coffre-Fort), graphiques de répartition, timeline d'activité et alertes d'expiration.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "Total archives, stockage, certificats, alertes" },
            { nom: "Cartes catégories", type: "carte", description: "5 catégories avec compteurs et barres de progression" },
            { nom: "Graphiques", type: "graphique", description: "Répartition par catégorie et archivages mensuels" },
            { nom: "Timeline", type: "tableau", description: "Activité récente avec hash et certificats" },
            { nom: "Alertes", type: "carte", description: "Alertes d'expiration et de vérification d'intégrité" },
        ],
        tachesDisponibles: [
            "Consulter les archives par catégorie",
            "Vérifier les alertes d'expiration",
            "Analyser la répartition des archives",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
            { page: "iDocument", relation: "Gestion documentaire", route: "/admin/digitalium/idocument" },
            { page: "iSignature", relation: "Signature électronique", route: "/admin/digitalium/isignature" },
        ],
    },
    "digitalium/isignature": {
        pageId: "digitalium-isignature",
        titre: "iSignature — DIGITALIUM",
        but: "Signature électronique interne de DIGITALIUM.",
        description: "Gestion des demandes de signature avec 3 onglets (À signer, En attente, Signés), recherche, détails des signataires avec progression.",
        elements: [
            { nom: "Cartes KPI", type: "carte", description: "À signer, en attente, complétés" },
            { nom: "Onglets", type: "autre", description: "3 onglets : À signer, En attente, Signés" },
            { nom: "Liste de demandes", type: "tableau", description: "Demandes avec signataires, progression et actions" },
            { nom: "Bouton Nouvelle demande", type: "bouton", description: "Ouvre le modal de demande de signature" },
        ],
        tachesDisponibles: [
            "Signer un document en attente",
            "Créer une nouvelle demande de signature",
            "Suivre les signatures en cours",
        ],
        liens: [
            { page: "Dashboard DIGITALIUM", relation: "Vue d'ensemble", route: "/admin/digitalium" },
            { page: "iDocument", relation: "Gestion documentaire", route: "/admin/digitalium/idocument" },
            { page: "iArchive", relation: "Archivage légal", route: "/admin/digitalium/iarchive" },
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

    /* ─── Outils Business ─────────────────────── */

    "design-theme": {
        pageId: "admin-design-theme",
        titre: "Design System",
        but: "Personnaliser l'apparence visuelle de la plateforme.",
        description: "Configuration des couleurs (primary, secondary, accent, destructive, success, background), typographies et éléments visuels.",
        elements: [
            { nom: "Palette de couleurs", type: "carte", description: "Couleurs primaire, secondaire, accent" },
            { nom: "Typographie", type: "carte", description: "Police Inter, tailles heading et body" },
        ],
        tachesDisponibles: [
            "Modifier les couleurs de la plateforme",
            "Consulter la typographie",
        ],
        liens: [
            { page: "Dashboard", relation: "Vue d'ensemble", route: "/admin" },
        ],
    },
});
