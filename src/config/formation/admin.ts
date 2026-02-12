// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation Config: Admin
// ═══════════════════════════════════════════════

import type { FormationConfig } from "@/types/formation";

export const ADMIN_FORMATION: FormationConfig = {
    espaceRole: "admin",
    titreBienvenue: "Bienvenue, Administrateur Plateforme",
    descriptionRole: "En tant qu'administrateur plateforme, vous supervisez l'ensemble de l'activité de DIGITALIUM.IO : gestion des organisations, suivi commercial, analytics et facturation. Votre rôle est crucial pour la croissance et stabilité de la plateforme.",
    responsabilites: [
        "Gérer les organisations clientes et leurs abonnements",
        "Suivre le pipeline commercial (leads et conversions)",
        "Administrer les comptes utilisateurs",
        "Analyser les métriques business et d'utilisation",
        "Gérer la facturation et les revenus",
        "Configurer les paramètres de la plateforme",
    ],
    fonctionnalites: [
        {
            id: "leads",
            onglet: "Gestion",
            icone: "Users",
            titre: "Gestion des Leads",
            description: "Suivez le pipeline commercial, de la prospection à la conversion en client.",
            importance: "Haute",
            tutorielIds: ["tut-lead-1"],
        },
        {
            id: "orgs",
            onglet: "Gestion",
            icone: "Globe",
            titre: "Organisations",
            description: "Créez, configurez et gérez les organisations clientes de la plateforme.",
            importance: "Haute",
            tutorielIds: ["tut-org-1"],
        },
        {
            id: "users",
            onglet: "Gestion",
            icone: "Users",
            titre: "Utilisateurs",
            description: "Administrez les comptes, rôles et accès de tous les utilisateurs.",
            importance: "Haute",
            tutorielIds: ["tut-users-1"],
        },
        {
            id: "analytics",
            onglet: "Analytics",
            icone: "BarChart3",
            titre: "Analytics & Rapports",
            description: "Analysez l'utilisation de la plateforme et les tendances de croissance.",
            importance: "Moyenne",
            tutorielIds: ["tut-analytics-1"],
        },
        {
            id: "billing",
            onglet: "Finance",
            icone: "Wallet",
            titre: "Facturation",
            description: "Suivez les revenus, factures et paiements de la plateforme.",
            importance: "Moyenne",
            tutorielIds: ["tut-billing-1"],
        },
    ],
    tutoriels: [
        {
            id: "tut-lead-1",
            titre: "Ajouter et qualifier un lead",
            fonctionnaliteId: "leads",
            etapes: [
                { numero: 1, instruction: "Accédez à la section Leads" },
                { numero: 2, instruction: "Cliquez sur «Ajouter un lead»" },
                { numero: 3, instruction: "Renseignez les informations du contact", detail: "Nom, email, organisation, source" },
                { numero: 4, instruction: "Définissez le statut initial", detail: "Contact → Qualification → Proposition → Conversion" },
                { numero: 5, instruction: "Enregistrez le lead" },
            ],
            routeCible: "/admin/leads",
        },
        {
            id: "tut-org-1",
            titre: "Créer une organisation cliente",
            fonctionnaliteId: "orgs",
            etapes: [
                { numero: 1, instruction: "Accédez à Organisations" },
                { numero: 2, instruction: "Cliquez sur «Créer une organisation»" },
                { numero: 3, instruction: "Renseignez les détails", detail: "Nom, secteur, taille, adresse" },
                { numero: 4, instruction: "Choisissez le plan d'abonnement" },
                { numero: 5, instruction: "Invitez l'administrateur de l'organisation", detail: "Un email d'invitation sera envoyé" },
            ],
            routeCible: "/admin/organizations",
        },
        {
            id: "tut-users-1",
            titre: "Modifier le rôle d'un utilisateur",
            fonctionnaliteId: "users",
            etapes: [
                { numero: 1, instruction: "Accédez à Utilisateurs" },
                { numero: 2, instruction: "Recherchez l'utilisateur par nom ou email" },
                { numero: 3, instruction: "Cliquez sur «Modifier» dans les actions" },
                { numero: 4, instruction: "Sélectionnez le nouveau rôle", detail: "Respectez la hiérarchie : vous ne pouvez pas attribuer un rôle supérieur au vôtre" },
                { numero: 5, instruction: "Enregistrez les modifications" },
            ],
            routeCible: "/admin/users",
        },
        {
            id: "tut-analytics-1",
            titre: "Consulter les analytics de la plateforme",
            fonctionnaliteId: "analytics",
            etapes: [
                { numero: 1, instruction: "Accédez à Analytics" },
                { numero: 2, instruction: "Sélectionnez la période d'analyse", detail: "7 jours, 30 jours, 90 jours ou personnalisé" },
                { numero: 3, instruction: "Consultez les graphiques d'utilisation" },
                { numero: 4, instruction: "Exportez les données si nécessaire", detail: "Format CSV ou PDF disponible" },
            ],
            routeCible: "/admin/analytics",
        },
        {
            id: "tut-billing-1",
            titre: "Consulter les revenus et factures",
            fonctionnaliteId: "billing",
            etapes: [
                { numero: 1, instruction: "Accédez à Facturation" },
                { numero: 2, instruction: "Consultez le résumé des revenus", detail: "MRR, ARR et impayés en un coup d'œil" },
                { numero: 3, instruction: "Parcourez l'historique des factures" },
                { numero: 4, instruction: "Envoyez une relance si nécessaire" },
            ],
            routeCible: "/admin/billing",
        },
    ],
    faq: [
        { question: "Comment convertir un lead en client ?", reponse: "Dans la section Leads, sélectionnez le lead qualifié, cliquez sur «Convertir en client». Cela créera automatiquement l'organisation et enverra une invitation à l'administrateur désigné.", categorie: "Commercial" },
        { question: "Puis-je modifier le plan d'une organisation existante ?", reponse: "Oui, accédez à Organisations, sélectionnez l'organisation, puis cliquez sur «Modifier le plan». Les changements prennent effet immédiatement pour les upgrades, ou à la prochaine période de facturation pour les downgrades.", categorie: "Organisations" },
        { question: "Comment voir qui se connecte à la plateforme ?", reponse: "Dans la section Utilisateurs, consultez la colonne «Dernière connexion». Pour un historique détaillé, utilisez les logs d'activité dans Analytics.", categorie: "Utilisateurs" },
        { question: "Comment exporter les données de facturation ?", reponse: "Accédez à Facturation, sélectionnez la période souhaitée, puis cliquez sur «Exporter» en haut à droite. Vous pouvez choisir le format CSV ou PDF.", categorie: "Facturation" },
    ],
};
