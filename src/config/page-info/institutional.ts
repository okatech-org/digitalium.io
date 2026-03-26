// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page Info Config: Institutional
// Keys are route segments (same pattern as other spaces)
// ═══════════════════════════════════════════════

import type { PageInfoMap } from "@/types/page-info";
import { injectArchitecture } from "./architecture-data";

export const INSTITUTIONAL_PAGE_INFO: PageInfoMap = injectArchitecture({
    institutional: {
        pageId: "inst-dashboard",
        titre: "Dashboard Institutionnel",
        but: "Vue d'ensemble de l'activité documentaire, des archives et des circuits de signature de votre institution.",
        description:
            "Le tableau de bord centralise les indicateurs clés : documents récents, signatures en attente, archives à traiter, et alertes de conformité.",
        elements: [
            { nom: "Activité récente", type: "tableau", description: "Derniers documents créés, modifiés ou archivés" },
            { nom: "Signatures en attente", type: "carte", description: "Nombre de documents en attente de signature" },
            { nom: "Conformité", type: "graphique", description: "Score de conformité réglementaire global" },
        ],
        tachesDisponibles: [
            "Consulter l'activité documentaire récente",
            "Voir les signatures en attente",
            "Vérifier les alertes de conformité",
        ],
        liens: [
            { page: "iDocument", route: "/institutional/idocument", relation: "Gestion des documents" },
            { page: "iSignature", route: "/institutional/isignature/pending", relation: "Signatures en attente" },
            { page: "Conformité", route: "/institutional/compliance", relation: "Sécurité & Conformité" },
        ],
        conseil: "Consultez votre dashboard chaque matin pour gérer les priorités : signatures urgentes, documents à valider et alertes de conformité.",
    },
    idocument: {
        pageId: "inst-idocument",
        titre: "Mes Documents",
        but: "Gérer l'ensemble de vos documents administratifs et officiels.",
        description:
            "Créez, modifiez et organisez vos documents avec un éditeur collaboratif, le versionnage automatique et le contrôle d'accès granulaire.",
        elements: [
            { nom: "Liste des documents", type: "tableau", description: "Tous vos documents avec statut, date et actions" },
            { nom: "Nouveau Document", type: "bouton", description: "Créer un document à partir d'un template" },
            { nom: "Filtres", type: "filtre", description: "Rechercher par type, date, statut" },
        ],
        tachesDisponibles: [
            "Créer un nouveau document officiel",
            "Rechercher un document existant",
            "Partager un document avec des collaborateurs",
            "Archiver un document finalisé",
        ],
        liens: [
            { page: "Documents Partagés", route: "/institutional/idocument/shared", relation: "Documents reçus" },
            { page: "Templates", route: "/institutional/idocument/templates", relation: "Modèles disponibles" },
        ],
        conseil: "Utilisez les templates institutionnels pour standardiser vos documents et gagner du temps.",
    },
    "iarchive/legal": {
        pageId: "inst-iarchive-legal",
        titre: "Archives Légales",
        but: "Archiver et consulter les actes juridiques avec conformité garantie.",
        description:
            "Coffre-fort numérique certifié pour vos actes légaux. Chaque document est scellé avec horodatage certifié et empreinte cryptographique.",
        elements: [
            { nom: "Liste des archives", type: "tableau", description: "Actes archivés triés par date et catégorie" },
            { nom: "Archiver", type: "bouton", description: "Ajouter un nouveau document aux archives légales" },
        ],
        tachesDisponibles: [
            "Archiver un acte juridique",
            "Consulter un document archivé",
            "Vérifier l'intégrité d'une archive",
            "Générer un certificat de conformité",
        ],
        liens: [
            { page: "Archives Fiscales", route: "/institutional/iarchive/fiscal", relation: "Autre type d'archive" },
            { page: "Coffre-Fort", route: "/institutional/iarchive/vault", relation: "Stockage sécurisé" },
        ],
        conseil: "Les archives légales sont scellées et immuables. Vérifiez toujours le document avant archivage car il ne peut plus être modifié.",
    },
    "isignature/pending": {
        pageId: "inst-isignature-pending",
        titre: "Documents à Signer",
        but: "Consulter et signer les documents en attente de votre signature.",
        description:
            "Liste des documents nécessitant votre signature électronique. Chaque signature est juridiquement contraignante et horodatée.",
        elements: [
            { nom: "Documents en attente", type: "tableau", description: "Documents nécessitant votre action" },
            { nom: "Signer", type: "bouton", description: "Apposer votre signature électronique" },
            { nom: "Refuser", type: "bouton", description: "Rejeter un document avec commentaire" },
        ],
        tachesDisponibles: [
            "Examiner un document avant signature",
            "Signer un document en attente",
            "Refuser un document avec justification",
            "Déléguer une signature",
        ],
        liens: [
            { page: "En attente", route: "/institutional/isignature/waiting", relation: "Signatures envoyées" },
            { page: "Signés", route: "/institutional/isignature/completed", relation: "Documents signés" },
        ],
    },
    compliance: {
        pageId: "inst-compliance",
        titre: "Sécurité & Conformité",
        but: "Surveiller la conformité réglementaire et la sécurité de votre espace institutionnel.",
        description:
            "Tableau de bord de conformité RGPD, audit de traçabilité, alertes de sécurité et rapports exportables.",
        elements: [
            { nom: "Score de conformité", type: "graphique", description: "Indicateur global de conformité" },
            { nom: "Alertes", type: "carte", description: "Alertes de sécurité actives" },
            { nom: "Rapport d'audit", type: "bouton", description: "Générer un rapport PDF" },
        ],
        tachesDisponibles: [
            "Consulter le score de conformité",
            "Traiter les alertes de sécurité",
            "Générer un rapport d'audit",
            "Configurer les politiques de rétention",
        ],
        liens: [
            { page: "Utilisateurs", route: "/institutional/users", relation: "Gestion des accès" },
            { page: "Paramètres", route: "/institutional/parametres", relation: "Configuration" },
        ],
    },
    formation: {
        pageId: "inst-formation",
        titre: "Formation",
        but: "Découvrir et maîtriser les outils DIGITALIUM.IO pour votre administration.",
        description:
            "Parcours de formation interactif avec tutoriels pas-à-pas, fonctionnalités clés et FAQ pour une prise en main optimale.",
        elements: [],
        tachesDisponibles: [
            "Suivre un tutoriel interactif",
            "Consulter la FAQ",
            "Marquer un tutoriel comme terminé",
        ],
        liens: [
            { page: "Dashboard", route: "/institutional", relation: "Retour au tableau de bord" },
        ],
    },
    parametres: {
        pageId: "inst-parametres",
        titre: "Paramètres",
        but: "Personnaliser votre expérience DIGITALIUM.IO et gérer vos préférences.",
        description:
            "Configurez votre profil, l'apparence de l'interface, les notifications et les options de sécurité.",
        elements: [
            { nom: "Profil", type: "champ", description: "Vos informations personnelles" },
            { nom: "Apparence", type: "bouton", description: "Thème clair/sombre/auto" },
            { nom: "Sécurité", type: "champ", description: "Mot de passe et sessions" },
        ],
        tachesDisponibles: [
            "Modifier votre profil",
            "Changer le thème de l'interface",
            "Configurer les notifications",
            "Changer votre mot de passe",
        ],
        liens: [
            { page: "Dashboard", route: "/institutional", relation: "Retour au tableau de bord" },
        ],
    },
    iarchive: {
        pageId: "inst-iarchive",
        titre: "Archives Institutionnelles",
        but: "Gérer l'archivage numérique sécurisé de votre institution.",
        description: "Hub central d'archivage avec classification par catégorie (fiscal, social, juridique), coffre-fort numérique et certificats d'intégrité.",
        elements: [
            { nom: "Catégories d'archives", type: "carte", description: "Fiscal, Social, Juridique, Coffre-Fort, Clients" },
            { nom: "Recherche globale", type: "filtre", description: "Recherche dans toutes les catégories d'archives" },
            { nom: "Archiver un document", type: "bouton", description: "Déposer un document dans l'archive sécurisée" },
        ],
        tachesDisponibles: [
            "Consulter les archives par catégorie",
            "Archiver un nouveau document",
            "Vérifier l'intégrité des archives",
            "Générer un certificat de conformité",
        ],
        liens: [
            { page: "Archives Légales", route: "/institutional/iarchive/legal", relation: "Documents juridiques" },
            { page: "Fiscal", route: "/institutional/iarchive/fiscal", relation: "Documents fiscaux" },
            { page: "Coffre-Fort", route: "/institutional/iarchive/vault", relation: "Stockage sécurisé" },
            { page: "Certificats", route: "/institutional/iarchive/certificates", relation: "Certificats d'intégrité" },
        ],
        conseil: "Utilisez le coffre-fort numérique pour les documents les plus sensibles. Chaque archive est scellée avec une empreinte cryptographique.",
    },
    isignature: {
        pageId: "inst-isignature",
        titre: "Signature Électronique",
        but: "Signer et faire signer des documents officiels avec valeur juridique.",
        description: "Signature électronique qualifiée pour vos actes administratifs. Suivi des circuits de validation, historique complet et preuves de signature.",
        elements: [
            { nom: "Documents à signer", type: "tableau", description: "Documents en attente de votre signature" },
            { nom: "Envoyés", type: "tableau", description: "Documents envoyés pour signature à des tiers" },
            { nom: "Signer", type: "bouton", description: "Apposer votre signature électronique" },
            { nom: "Envoyer à signer", type: "bouton", description: "Initier un circuit de signature" },
        ],
        tachesDisponibles: [
            "Signer un document en attente",
            "Envoyer un document à signer",
            "Consulter l'historique des signatures",
            "Configurer un workflow de signature",
        ],
        liens: [
            { page: "En attente", route: "/institutional/isignature/pending", relation: "Documents à signer" },
            { page: "Workflows", route: "/institutional/isignature/workflows", relation: "Circuits de validation" },
            { page: "Analytics", route: "/institutional/isignature/analytics", relation: "Statistiques" },
        ],
    },
    iasted: {
        pageId: "inst-iasted",
        titre: "iAsted — Assistant IA",
        but: "Utiliser l'intelligence artificielle pour traiter vos documents institutionnels.",
        description: "Assistant IA spécialisé pour l'analyse de documents administratifs, l'extraction de données, la classification automatique et la synthèse de dossiers.",
        elements: [
            { nom: "Interface conversationnelle", type: "autre", description: "Chat avec l'IA pour vos requêtes documentaires" },
            { nom: "Historique", type: "tableau", description: "Conversations et analyses précédentes" },
            { nom: "Nouvelle analyse", type: "bouton", description: "Lancer une nouvelle analyse IA" },
        ],
        tachesDisponibles: [
            "Analyser un document administratif",
            "Extraire des données d'un formulaire",
            "Générer une synthèse de dossier",
            "Classifier automatiquement des documents",
        ],
        liens: [
            { page: "Analytics IA", route: "/institutional/iasted/analytics", relation: "Statistiques d'utilisation" },
            { page: "iDocument", route: "/institutional/idocument", relation: "Documents à analyser" },
        ],
        conseil: "L'IA peut analyser vos documents PDF, DOCX et images. Pour de meilleurs résultats, utilisez des documents bien structurés.",
    },
    users: {
        pageId: "inst-users",
        titre: "Gestion des Utilisateurs",
        but: "Gérer les accès et les rôles des utilisateurs de votre institution.",
        description: "Inviter des utilisateurs, attribuer des rôles, gérer les permissions et surveiller l'activité des comptes.",
        elements: [
            { nom: "Liste des utilisateurs", type: "tableau", description: "Membres avec rôle, statut et dernière connexion" },
            { nom: "Inviter", type: "bouton", description: "Inviter un nouvel utilisateur par email" },
            { nom: "Modifier le rôle", type: "bouton", description: "Changer les permissions d'un utilisateur" },
            { nom: "Filtres", type: "filtre", description: "Filtrer par rôle, statut, département" },
        ],
        tachesDisponibles: [
            "Inviter un nouvel utilisateur",
            "Modifier les permissions d'un utilisateur",
            "Désactiver un compte",
            "Consulter l'historique de connexion",
        ],
        liens: [
            { page: "Conformité", route: "/institutional/compliance", relation: "Politiques de sécurité" },
            { page: "Paramètres", route: "/institutional/parametres", relation: "Configuration" },
        ],
    },
});
