// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation Config: Organisme (ONG, Associations)
// ═══════════════════════════════════════════════

import type { FormationConfig } from "@/types/formation";

export const ORG_FORMATION: FormationConfig = {
    espaceRole: "org",
    titreBienvenue: "Bienvenue dans votre Espace Organisme",
    descriptionRole: "Votre espace Organisme rassemble tous les outils de centralisation documentaire, de signature de conventions et d'assistance intelligente pour votre ONG ou association. Facilitez la coordination entre vos membres, partenaires et donateurs.",
    responsabilites: [
        "Centraliser les statuts, PV et rapports de votre organisme (iDocument)",
        "Faire signer électroniquement des conventions de partenariat ou d'adhésion (iSignature)",
        "Archiver les dossiers comptables et mémoriels (iArchive)",
        "Interroger votre fonds documentaire via l'IA (iAsted)",
        "Gérer les membres du bureau et les bénévoles",
        "Assurer la conformité et la transparence de l'organisation",
    ],
    fonctionnalites: [
        {
            id: "idocument",
            onglet: "Principal",
            icone: "FileText",
            titre: "Gestion Documentaire (iDocument)",
            description: "Créez et organisez vos rapports, statuts et lettres avec des vues grille/liste et une recherche puissante.",
            importance: "Critique",
            tutorielIds: ["tut-org-doc-1"],
        },
        {
            id: "isignature",
            onglet: "Signatures",
            icone: "PenTool",
            titre: "Signature Électronique (iSignature)",
            description: "Faites signer rapidement des conventions de partenariat et des validations de budget de manière sécurisée.",
            importance: "Haute",
            tutorielIds: ["tut-org-sign-1"],
        },
        {
            id: "iarchive",
            onglet: "Archives",
            icone: "Archive",
            titre: "Archives Numériques (iArchive)",
            description: "Sauvegardez vos bilans annuels et vos délibérations réglementaires dans un coffre-fort hautement sécurisé.",
            importance: "Haute",
            tutorielIds: ["tut-org-archive-1"],
        },
        {
            id: "iasted",
            onglet: "IA",
            icone: "Bot",
            titre: "Assistant IA (iAsted)",
            description: "Analysez et synthétisez d'anciennes résolutions ou des dossiers de subvention grâce à l'intelligence artificielle.",
            importance: "Moyenne",
            tutorielIds: ["tut-org-ia-1"],
        },
        {
            id: "team",
            onglet: "Gestion",
            icone: "Users",
            titre: "Équipe & Bénévoles",
            description: "Gérez les accès de votre bureau central, de vos coordinateurs et de vos bénévoles.",
            importance: "Moyenne",
            tutorielIds: ["tut-org-team-1"],
        },
    ],
    tutoriels: [
        {
            id: "tut-org-doc-1",
            titre: "Publier un rapport officiel",
            fonctionnaliteId: "idocument",
            etapes: [
                { numero: 1, instruction: "Accédez à iDocument depuis le menu latéral" },
                { numero: 2, instruction: "Cliquez sur «Nouveau document»" },
                { numero: 3, instruction: "Sélectionnez le modèle «Rapport d'activité»" },
                { numero: 4, instruction: "Rédigez le contenu ou importez vos données" },
                { numero: 5, instruction: "Ajoutez des tags", detail: "ex: Rapport, Annuel, 2024" },
                { numero: 6, instruction: "Enregistrez pour validation par le conseil" },
            ],
            routeCible: "/org/idocument",
        },
        {
            id: "tut-org-sign-1",
            titre: "Soumettre une convention à signature",
            fonctionnaliteId: "isignature",
            etapes: [
                { numero: 1, instruction: "Accédez à iSignature" },
                { numero: 2, instruction: "Téléchargez la convention de partenariat" },
                { numero: 3, instruction: "Indiquez les adresses email des partenaires" },
                { numero: 4, instruction: "Positionnez les champs de signature" },
                { numero: 5, instruction: "Vérifiez et lancez la demande de signature" },
            ],
            routeCible: "/org/isignature",
        },
        {
            id: "tut-org-archive-1",
            titre: "Archiver les statuts fondateurs",
            fonctionnaliteId: "iarchive",
            etapes: [
                { numero: 1, instruction: "Accédez à iArchive" },
                { numero: 2, instruction: "Sélectionnez la catégorie Juridique" },
                { numero: 3, instruction: "Cliquez sur «Déposer»" },
                { numero: 4, instruction: "Importez vos statuts signés" },
                { numero: 5, instruction: "Validez la mise au coffre" },
            ],
            routeCible: "/org/iarchive",
        },
        {
            id: "tut-org-ia-1",
            titre: "Synthétiser une ancienne AG avec l'IA",
            fonctionnaliteId: "iasted",
            etapes: [
                { numero: 1, instruction: "Ouvrez l'assistant iAsted" },
                { numero: 2, instruction: "Tapez : \"Fais un résumé des engagements pris lors du CA du mois dernier.\"" },
                { numero: 3, instruction: "Observez les sources consultées par l'Assistant" },
                { numero: 4, instruction: "Lisez la synthèse générée" },
            ],
            routeCible: "/org/iasted",
        },
        {
            id: "tut-org-team-1",
            titre: "Ajouter un nouveau trésorier",
            fonctionnaliteId: "team",
            etapes: [
                { numero: 1, instruction: "Accédez à l'onglet Équipe" },
                { numero: 2, instruction: "Cliquez sur «Inviter»" },
                { numero: 3, instruction: "Renseignez l'adresse email du trésorier" },
                { numero: 4, instruction: "Sélectionnez le rôle «Manager»" },
                { numero: 5, instruction: "Envoyez l'invitation d'accès" },
            ],
            routeCible: "/org/team",
        },
    ],
    faq: [
        { question: "Puis-je séparer les accès entre membres du bureau et bénévoles ?", reponse: "Oui, la gestion des permissions permet d'attribuer le rôle «Administrateur» au bureau restreint et le rôle «Membre» ou «Lecteur» aux bénévoles selon le besoin.", categorie: "Équipe" },
        { question: "Où puis-je stocker notre liste de donateurs en sécurité ?", reponse: "Utilisez la section iArchive (catégorie Document Confidentiel) qui garantit l'intégrité et restreint l'accès aux seuls administrateurs habilités.", categorie: "Documents" },
        { question: "La signature électronique a-t-elle une valeur légale pour nos partenariats ?", reponse: "Absolument. La solution incluse dans DIGITALIUM assure une conformité règlementaire avec un scellement garantissant la valeur probante des conventions signées.", categorie: "Signature" },
        { question: "Est-il possible de consulter des documents sur le terrain ?", reponse: "Oui, l'interface iDocument est 100% responsive et permet le repérage de n'importe quelle procédure ou consigne depuis un smartphone en mission.", categorie: "Utilisation" },
    ],
};
