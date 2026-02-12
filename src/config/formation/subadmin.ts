// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation Config: SubAdmin
// ═══════════════════════════════════════════════

import type { FormationConfig } from "@/types/formation";

export const SUBADMIN_FORMATION: FormationConfig = {
    espaceRole: "subadmin",
    titreBienvenue: "Bienvenue, Administrateur d'Organisation",
    descriptionRole: "En tant qu'administrateur de votre organisation, vous gérez les documents, archives et signatures électroniques de votre équipe. Vous êtes le point central pour la gestion documentaire et la conformité de votre structure.",
    responsabilites: [
        "Gérer le cycle de vie des documents (création, partage, archivage)",
        "Organiser les archives par catégorie (fiscal, social, juridique)",
        "Superviser les circuits de signature électronique",
        "Administrer les membres et leurs droits d'accès",
        "Assurer la conformité documentaire de l'organisation",
        "Utiliser les modèles de documents pour standardiser les processus",
    ],
    fonctionnalites: [
        {
            id: "idocument",
            onglet: "iDocument",
            icone: "FileText",
            titre: "Gestion Documentaire (iDocument)",
            description: "Créez, éditez, partagez et gérez tous les documents de votre organisation.",
            importance: "Critique",
            tutorielIds: ["tut-doc-1", "tut-doc-2"],
        },
        {
            id: "iarchive",
            onglet: "iArchive",
            icone: "Archive",
            titre: "Archives Numériques (iArchive)",
            description: "Archivez vos documents selon les obligations légales avec classification automatique.",
            importance: "Haute",
            tutorielIds: ["tut-archive-1"],
        },
        {
            id: "isignature",
            onglet: "iSignature",
            icone: "PenTool",
            titre: "Signature Électronique (iSignature)",
            description: "Signez et faites signer des documents électroniquement avec valeur légale.",
            importance: "Haute",
            tutorielIds: ["tut-sign-1"],
        },
        {
            id: "team",
            onglet: "Gestion",
            icone: "Users",
            titre: "Gestion d'Équipe",
            description: "Invitez des membres, attribuez des rôles et suivez l'activité de votre équipe.",
            importance: "Moyenne",
            tutorielIds: ["tut-team-1"],
        },
    ],
    tutoriels: [
        {
            id: "tut-doc-1",
            titre: "Créer et partager un document",
            fonctionnaliteId: "idocument",
            etapes: [
                { numero: 1, instruction: "Accédez à iDocument (Mes Documents)" },
                { numero: 2, instruction: "Cliquez sur «Créer un document»" },
                { numero: 3, instruction: "Choisissez un template ou partez de zéro" },
                { numero: 4, instruction: "Rédigez votre document" },
                { numero: 5, instruction: "Cliquez sur «Partager» pour envoyer à un collègue", detail: "Choisissez entre «Lecture seule» ou «Modification»" },
            ],
            routeCible: "/subadmin/idocument",
        },
        {
            id: "tut-doc-2",
            titre: "Utiliser un template de document",
            fonctionnaliteId: "idocument",
            etapes: [
                { numero: 1, instruction: "Accédez à iDocument → Templates" },
                { numero: 2, instruction: "Parcourez les modèles disponibles" },
                { numero: 3, instruction: "Cliquez sur «Utiliser» pour créer un document depuis le modèle" },
                { numero: 4, instruction: "Personnalisez les champs pré-remplis" },
                { numero: 5, instruction: "Enregistrez votre document" },
            ],
            routeCible: "/subadmin/idocument/templates",
        },
        {
            id: "tut-archive-1",
            titre: "Archiver un document fiscal",
            fonctionnaliteId: "iarchive",
            etapes: [
                { numero: 1, instruction: "Accédez à iArchive → Fiscal" },
                { numero: 2, instruction: "Cliquez sur «Déposer un document»" },
                { numero: 3, instruction: "Sélectionnez le fichier à archiver" },
                { numero: 4, instruction: "Renseignez les métadonnées", detail: "Exercice fiscal, type de document, date d'émission" },
                { numero: 5, instruction: "Validez l'archivage", detail: "Le document sera conservé selon les obligations légales" },
            ],
            routeCible: "/subadmin/iarchive/fiscal",
        },
        {
            id: "tut-sign-1",
            titre: "Envoyer un document à signer",
            fonctionnaliteId: "isignature",
            etapes: [
                { numero: 1, instruction: "Accédez à iSignature" },
                { numero: 2, instruction: "Cliquez sur «Nouvelle demande de signature»" },
                { numero: 3, instruction: "Sélectionnez le document à signer" },
                { numero: 4, instruction: "Ajoutez les signataires", detail: "Par email ou depuis votre équipe" },
                { numero: 5, instruction: "Définissez l'ordre de signature si nécessaire" },
                { numero: 6, instruction: "Envoyez la demande", detail: "Les signataires recevront une notification par email" },
            ],
            routeCible: "/subadmin/isignature/pending",
        },
        {
            id: "tut-team-1",
            titre: "Inviter un nouveau membre",
            fonctionnaliteId: "team",
            etapes: [
                { numero: 1, instruction: "Accédez à Gestion → Équipe" },
                { numero: 2, instruction: "Cliquez sur «Inviter»" },
                { numero: 3, instruction: "Saisissez l'email du nouveau membre" },
                { numero: 4, instruction: "Sélectionnez le rôle", detail: "Manager, Membre ou Lecteur" },
                { numero: 5, instruction: "Envoyez l'invitation" },
            ],
            routeCible: "/subadmin/team",
        },
    ],
    faq: [
        { question: "Quelle est la différence entre partager et archiver ?", reponse: "Partager rend le document accessible en temps réel aux destinataires. Archiver le conserve de manière sécurisée et immuable pour conformité légale. Un document archivé ne peut plus être modifié.", categorie: "Documents" },
        { question: "Ma signature électronique a-t-elle une valeur légale ?", reponse: "Oui, la signature via iSignature utilise un processus de signature électronique qualifiée, conforme aux réglementations en vigueur (eIDAS). Chaque signature est horodatée et certifiée.", categorie: "Signature" },
        { question: "Combien de temps sont conservées les archives ?", reponse: "Les archives sont conservées selon les durées légales : 10 ans pour les documents fiscaux, 5 ans pour les documents sociaux, et indéfiniment pour le coffre-fort numérique.", categorie: "Archives" },
        { question: "Comment révoquer l'accès d'un membre ?", reponse: "Accédez à Gestion → Équipe, sélectionnez le membre et cliquez sur «Révoquer l'accès». Son accès sera immédiatement supprimé.", categorie: "Équipe" },
    ],
};
