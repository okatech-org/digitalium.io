// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page Info Config: SubAdmin
// Couvre les 25 pages de l'espace SubAdmin
// Keys = pathname.replace("/subadmin/", "") avec
// slashes remplacés par "-" pour les sous-routes
// ═══════════════════════════════════════════════

import type { PageInfoMap } from "@/types/page-info";

export const SUBADMIN_PAGE_INFO: PageInfoMap = {

    /* ─── Dashboard ──────────────────────────── */

    dashboard: {
        pageId: "subadmin-dashboard",
        titre: "Dashboard SubAdmin",
        but: "Vue d'ensemble de l'activité de votre organisation et de ses modules.",
        description: "Métriques de votre organisation : documents créés, archives, signatures en cours, membres actifs et activité récente.",
        elements: [
            { nom: "Cartes modules", type: "carte", description: "iDocument, iArchive, iSignature avec statistiques" },
            { nom: "Documents récents", type: "tableau", description: "Derniers documents modifiés ou créés" },
            { nom: "Signatures en attente", type: "tableau", description: "Documents à signer avec priorité" },
            { nom: "Activité de l'équipe", type: "tableau", description: "Actions récentes des membres" },
        ],
        tachesDisponibles: ["Surveiller l'activité de l'organisation", "Accéder aux modules rapidement"],
        liens: [
            { page: "iDocument", relation: "Gestion documentaire", route: "/subadmin/idocument" },
            { page: "iArchive", relation: "Archives de l'organisation", route: "/subadmin/iarchive/fiscal" },
        ],
    },

    /* ─── iDocument ──────────────────────────── */

    idocument: {
        pageId: "subadmin-idocument",
        titre: "Mes Documents",
        but: "Gérer les documents de votre organisation.",
        description: "Création, édition, partage et gestion du cycle de vie de tous vos documents professionnels.",
        elements: [
            { nom: "Liste des documents", type: "tableau", description: "Documents avec statut, auteur, date" },
            { nom: "Bouton Créer", type: "bouton", description: "Crée un nouveau document" },
            { nom: "Recherche", type: "filtre", description: "Recherche par titre, type, auteur" },
            { nom: "Actions", type: "bouton", description: "Ouvrir, partager, archiver, supprimer" },
        ],
        tachesDisponibles: ["Créer un document", "Partager un document", "Archiver un document", "Rechercher un document"],
        liens: [
            { page: "Documents Partagés", relation: "Documents partagés avec vous", route: "/subadmin/idocument/shared" },
            { page: "Templates", relation: "Modèles de documents", route: "/subadmin/idocument/templates" },
        ],
    },
    "idocument/shared": {
        pageId: "subadmin-idocument-shared",
        titre: "Documents Partagés",
        but: "Consulter les documents partagés avec vous par d'autres membres.",
        description: "Documents reçus en partage avec permissions de lecture ou modification.",
        elements: [
            { nom: "Liste partagés", type: "tableau", description: "Documents partagés avec permissions" },
        ],
        tachesDisponibles: ["Consulter les documents partagés", "Accepter ou refuser un partage"],
        liens: [
            { page: "Mes Documents", relation: "Vos propres documents", route: "/subadmin/idocument" },
        ],
    },
    "idocument/team": {
        pageId: "subadmin-idocument-team",
        titre: "Documents Équipe",
        but: "Visualiser les documents créés par les membres de votre équipe.",
        description: "Vue centralisée de tous les documents créés par votre organisation, avec filtrage par auteur.",
        elements: [
            { nom: "Tableau documents équipe", type: "tableau", description: "Documents par membre avec statut" },
            { nom: "Filtre par auteur", type: "filtre", description: "Filtrer par membre de l'équipe" },
        ],
        tachesDisponibles: ["Consulter les documents de l'équipe", "Filtrer par collaborateur"],
        liens: [
            { page: "Mes Documents", relation: "Vos propres documents", route: "/subadmin/idocument" },
        ],
    },
    "idocument/templates": {
        pageId: "subadmin-idocument-templates",
        titre: "Templates",
        but: "Utiliser et gérer les modèles de documents réutilisables.",
        description: "Bibliothèque de modèles prédéfinis pour accélérer la création de documents standardisés.",
        elements: [
            { nom: "Grille de templates", type: "carte", description: "Modèles avec preview et catégorie" },
            { nom: "Bouton Utiliser", type: "bouton", description: "Crée un document à partir du template" },
        ],
        tachesDisponibles: ["Parcourir les templates", "Créer un document depuis un template"],
        liens: [
            { page: "Mes Documents", relation: "Documents créés depuis templates", route: "/subadmin/idocument" },
        ],
    },
    "idocument/trash": {
        pageId: "subadmin-idocument-trash",
        titre: "Corbeille",
        but: "Gérer les documents supprimés.",
        description: "Documents placés dans la corbeille, récupérables ou supprimables définitivement.",
        elements: [
            { nom: "Liste corbeille", type: "tableau", description: "Documents supprimés avec date d'expiration" },
            { nom: "Bouton Restaurer", type: "bouton", description: "Restaure le document dans sa liste" },
        ],
        tachesDisponibles: ["Restaurer un document", "Vider la corbeille", "Supprimer définitivement"],
        liens: [
            { page: "Mes Documents", relation: "Documents actifs", route: "/subadmin/idocument" },
        ],
    },

    /* ─── iArchive ───────────────────────────── */

    "iarchive/fiscal": {
        pageId: "subadmin-iarchive-fiscal",
        titre: "Archives Fiscales",
        but: "Stocker et gérer les documents fiscaux de l'organisation.",
        description: "Conservation réglementaire des déclarations fiscales, bilans et justificatifs comptables.",
        elements: [
            { nom: "Tableau des archives", type: "tableau", description: "Documents fiscaux classés par année" },
            { nom: "Bouton Déposer", type: "bouton", description: "Archive un nouveau document fiscal" },
        ],
        tachesDisponibles: ["Déposer un document fiscal", "Rechercher dans les archives", "Exporter des documents"],
        liens: [
            { page: "Archives Sociales", relation: "Dossiers sociaux", route: "/subadmin/iarchive/social" },
            { page: "Coffre-Fort", relation: "Documents confidentiels", route: "/subadmin/iarchive/vault" },
        ],
    },
    "iarchive/social": {
        pageId: "subadmin-iarchive-social",
        titre: "Archives Sociales",
        but: "Archiver les documents sociaux et RH de l'organisation.",
        description: "Contrats de travail, fiches de paie, déclarations sociales et documents RH archivés.",
        elements: [
            { nom: "Tableau archives sociales", type: "tableau", description: "Documents classés par type et année" },
            { nom: "Bouton Déposer", type: "bouton", description: "Archive un nouveau document social" },
        ],
        tachesDisponibles: ["Déposer un document RH", "Rechercher un contrat", "Consulter les archives"],
        liens: [
            { page: "Archives Fiscales", relation: "Documents comptables", route: "/subadmin/iarchive/fiscal" },
            { page: "Archives Juridiques", relation: "Documents légaux", route: "/subadmin/iarchive/legal" },
        ],
    },
    "iarchive/legal": {
        pageId: "subadmin-iarchive-legal",
        titre: "Archives Juridiques",
        but: "Conserver les documents juridiques et contrats.",
        description: "Statuts, procès-verbaux, contrats commerciaux et documents juridiques archivés de façon sécurisée.",
        elements: [
            { nom: "Tableau archives juridiques", type: "tableau", description: "Documents légaux par catégorie" },
            { nom: "Bouton Déposer", type: "bouton", description: "Archive un nouveau document juridique" },
        ],
        tachesDisponibles: ["Archiver un document légal", "Rechercher un contrat", "Exporter un PDF certifié"],
        liens: [
            { page: "Archives Fiscales", relation: "Documents fiscaux", route: "/subadmin/iarchive/fiscal" },
            { page: "Coffre-Fort", relation: "Documents sensibles", route: "/subadmin/iarchive/vault" },
        ],
    },
    "iarchive/vault": {
        pageId: "subadmin-iarchive-vault",
        titre: "Coffre-Fort Numérique",
        but: "Protéger les documents les plus sensibles de l'organisation.",
        description: "Espace ultra-sécurisé avec chiffrement renforcé pour les documents confidentiels et stratégiques.",
        elements: [
            { nom: "Documents protégés", type: "tableau", description: "Documents avec niveau de sécurité" },
            { nom: "Bouton Déposer", type: "bouton", description: "Ajoute un document au coffre-fort" },
        ],
        tachesDisponibles: ["Déposer un document confidentiel", "Gérer les accès", "Télécharger un document"],
        liens: [
            { page: "Archives Juridiques", relation: "Contrats et actes", route: "/subadmin/iarchive/legal" },
        ],
    },
    "iarchive/certificates": {
        pageId: "subadmin-iarchive-certificates",
        titre: "Certificats",
        but: "Gérer les certificats et attestations de l'organisation.",
        description: "Certificats de conformité, attestations officielles et documents certifiés par l'organisation.",
        elements: [
            { nom: "Liste des certificats", type: "tableau", description: "Certificats avec statut de validité" },
            { nom: "Bouton Générer", type: "bouton", description: "Génère un nouveau certificat" },
        ],
        tachesDisponibles: ["Consulter un certificat", "Générer un certificat", "Vérifier la validité"],
        liens: [
            { page: "Archives Fiscales", relation: "Attestations fiscales", route: "/subadmin/iarchive/fiscal" },
        ],
    },
    "iarchive/clients": {
        pageId: "subadmin-iarchive-clients",
        titre: "Archives Clients",
        but: "Archiver les documents relatifs aux clients.",
        description: "Dossiers clients complets incluant contrats, correspondances et documents commerciaux.",
        elements: [
            { nom: "Dossiers clients", type: "tableau", description: "Archives classées par client" },
            { nom: "Recherche client", type: "filtre", description: "Recherche par nom de client" },
        ],
        tachesDisponibles: ["Consulter un dossier client", "Archiver un document client", "Rechercher un client"],
        liens: [
            { page: "Archives Juridiques", relation: "Contrats clients", route: "/subadmin/iarchive/legal" },
        ],
    },

    /* ─── iSignature ─────────────────────────── */

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
            { page: "En attente", relation: "Documents envoyés", route: "/subadmin/isignature/waiting" },
            { page: "Signés", relation: "Historique", route: "/subadmin/isignature/completed" },
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
            { page: "À Signer", relation: "Vos signatures en attente", route: "/subadmin/isignature/pending" },
            { page: "Signés", relation: "Historique complet", route: "/subadmin/isignature/completed" },
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
            { page: "À Signer", relation: "Signatures en attente", route: "/subadmin/isignature/pending" },
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
            { page: "À Signer", relation: "Documents utilisant les workflows", route: "/subadmin/isignature/pending" },
        ],
    },

    /* ─── Administration ─────────────────────── */

    clients: {
        pageId: "subadmin-clients",
        titre: "Clients",
        but: "Gérer les clients de votre organisation.",
        description: "Répertoire des clients avec informations de contact, historique des interactions et documents associés.",
        elements: [
            { nom: "Tableau clients", type: "tableau", description: "Clients avec contact, statut, dernière interaction" },
            { nom: "Bouton Ajouter", type: "bouton", description: "Ajoute un nouveau client" },
        ],
        tachesDisponibles: ["Ajouter un client", "Consulter un dossier client", "Exporter la liste"],
        liens: [
            { page: "Archives Clients", relation: "Documents archivés", route: "/subadmin/iarchive/clients" },
        ],
    },
    leads: {
        pageId: "subadmin-leads",
        titre: "Leads & Prospects",
        but: "Suivre les prospects de votre organisation.",
        description: "Pipeline de prospects avec suivi de conversion, sources et historique des contacts.",
        elements: [
            { nom: "Pipeline leads", type: "tableau", description: "Prospects par étape de conversion" },
            { nom: "Bouton Ajouter lead", type: "bouton", description: "Crée un nouveau prospect" },
        ],
        tachesDisponibles: ["Ajouter un prospect", "Qualifier un lead", "Suivre le pipeline"],
        liens: [
            { page: "Clients", relation: "Leads convertis en clients", route: "/subadmin/clients" },
        ],
    },
    subscriptions: {
        pageId: "subadmin-subscriptions",
        titre: "Abonnement",
        but: "Consulter et gérer l'abonnement de votre organisation.",
        description: "Détails du plan actif, historique des factures, utilisation des modules et options d'upgrade.",
        elements: [
            { nom: "Plan actuel", type: "carte", description: "Détails du plan avec modules inclus" },
            { nom: "Historique factures", type: "tableau", description: "Factures passées avec statut" },
        ],
        tachesDisponibles: ["Consulter votre plan", "Télécharger une facture", "Demander un upgrade"],
        liens: [],
    },
    organization: {
        pageId: "subadmin-organization",
        titre: "Mon Organisation",
        but: "Gérer les informations de votre organisation.",
        description: "Paramètres de l'organisation : nom, logo, adresse, secteur d'activité et informations légales.",
        elements: [
            { nom: "Informations générales", type: "carte", description: "Nom, logo, adresse, secteur" },
            { nom: "Bouton Modifier", type: "bouton", description: "Modifie les informations de l'organisation" },
        ],
        tachesDisponibles: ["Modifier les informations", "Mettre à jour le logo", "Gérer les paramètres"],
        liens: [
            { page: "IAM", relation: "Gestion des rôles", route: "/subadmin/iam" },
        ],
    },
    iam: {
        pageId: "subadmin-iam",
        titre: "Gestion des Accès (IAM)",
        but: "Administrer les rôles et permissions des membres.",
        description: "Configuration des rôles, permissions et niveaux d'accès pour chaque membre de l'organisation.",
        elements: [
            { nom: "Tableau des rôles", type: "tableau", description: "Rôles avec permissions associées" },
            { nom: "Membres", type: "tableau", description: "Membres avec rôle et dernier accès" },
        ],
        tachesDisponibles: ["Créer un rôle", "Attribuer un rôle", "Modifier les permissions", "Inviter un membre"],
        liens: [
            { page: "Organisation", relation: "Paramètres organisationnels", route: "/subadmin/organization" },
        ],
    },
    "design-theme": {
        pageId: "subadmin-design-theme",
        titre: "Thème & Design",
        but: "Personnaliser l'apparence de votre espace.",
        description: "Couleurs, logo, thème sombre/clair et personnalisation visuelle de l'interface de votre organisation.",
        elements: [
            { nom: "Sélecteur de thème", type: "bouton", description: "Choix du thème sombre ou clair" },
            { nom: "Palette de couleurs", type: "carte", description: "Couleur d'accent de l'organisation" },
        ],
        tachesDisponibles: ["Changer le thème", "Personnaliser les couleurs", "Uploader un logo"],
        liens: [],
    },
    "workflow-templates": {
        pageId: "subadmin-workflow-templates",
        titre: "Modèles de Workflows",
        but: "Gérer les modèles de workflows réutilisables.",
        description: "Bibliothèque de modèles de workflows pour automatiser les processus métier de l'organisation.",
        elements: [
            { nom: "Liste des modèles", type: "tableau", description: "Modèles avec description et étapes" },
            { nom: "Bouton Créer", type: "bouton", description: "Crée un nouveau modèle de workflow" },
        ],
        tachesDisponibles: ["Créer un modèle", "Modifier un modèle", "Appliquer un modèle"],
        liens: [
            { page: "Workflows Signature", relation: "Circuits de signature", route: "/subadmin/isignature/workflows" },
        ],
    },

    /* ─── Universel ──────────────────────────── */

    formation: {
        pageId: "subadmin-formation",
        titre: "Formation",
        but: "Module de formation pour l'administrateur d'organisation.",
        description: "Guide interactif pour maîtriser la gestion documentaire, les archives et les signatures.",
        elements: [],
        tachesDisponibles: ["Suivre la formation", "Consulter la FAQ"],
        liens: [],
    },
    parametres: {
        pageId: "subadmin-parametres",
        titre: "Paramètres",
        but: "Personnaliser votre espace et vos préférences.",
        description: "Profil, thème, langue, notifications, sécurité et accessibilité.",
        elements: [],
        tachesDisponibles: ["Modifier votre profil", "Changer le thème"],
        liens: [],
    },
};

