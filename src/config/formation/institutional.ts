// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation Config: Institutional
// ═══════════════════════════════════════════════

import type { FormationConfig } from "@/types/formation";

export const INSTITUTIONAL_FORMATION: FormationConfig = {
    espaceRole: "institutional",
    titreBienvenue: "Bienvenue dans la Formation Institutionnelle",
    descriptionRole:
        "En tant qu'administrateur institutionnel, vous êtes responsable de la gestion documentaire souveraine, de l'archivage légal et des circuits de signature électronique de votre administration.",
    responsabilites: [
        "Gérer les documents officiels et administratifs de votre institution",
        "Archiver les actes légaux, fiscaux et sociaux en toute conformité",
        "Piloter les circuits de signature électronique avec traçabilité complète",
        "Administrer les utilisateurs et les politiques de sécurité",
        "Assurer la conformité réglementaire et le respect des normes souveraines",
    ],
    fonctionnalites: [
        {
            id: "inst-idocument",
            onglet: "Documents",
            icone: "FileText",
            titre: "iDocument — Gestion Documentaire",
            description: "Créez, partagez et gérez les documents administratifs avec versionnage et contrôle d'accès.",
            importance: "Haute",
            tutorielIds: ["inst-tuto-create-doc", "inst-tuto-share-doc"],
        },
        {
            id: "inst-iarchive",
            onglet: "Archives",
            icone: "Archive",
            titre: "iArchive — Archivage Souverain",
            description: "Archivez les documents officiels dans un coffre-fort numérique certifié avec durées de conservation légales.",
            importance: "Haute",
            tutorielIds: ["inst-tuto-archive-legal"],
        },
        {
            id: "inst-isignature",
            onglet: "Signature",
            icone: "PenTool",
            titre: "iSignature — Signature Électronique",
            description: "Signez électroniquement les actes officiels avec valeur juridique et workflows de validation.",
            importance: "Haute",
            tutorielIds: ["inst-tuto-sign-doc"],
        },
        {
            id: "inst-security",
            onglet: "Sécurité",
            icone: "Shield",
            titre: "Sécurité & Conformité",
            description: "Gérez les politiques de sécurité, la conformité RGPD et les audits de traçabilité.",
            importance: "Moyenne",
            tutorielIds: ["inst-tuto-compliance"],
        },
        {
            id: "inst-users",
            onglet: "Administration",
            icone: "Users",
            titre: "Gestion des Utilisateurs",
            description: "Administrez les comptes utilisateurs, les rôles et les habilitations de votre institution.",
            importance: "Moyenne",
            tutorielIds: [],
        },
    ],
    tutoriels: [
        {
            id: "inst-tuto-create-doc",
            titre: "Créer un document officiel",
            fonctionnaliteId: "inst-idocument",
            routeCible: "/institutional/idocument",
            etapes: [
                { numero: 1, instruction: "Accédez à iDocument depuis le menu latéral", detail: "Cliquez sur « Mes Documents » dans la section iDocument." },
                { numero: 2, instruction: "Cliquez sur « Nouveau Document »", detail: "Un éditeur collaboratif s'ouvrira avec les modèles institutionnels." },
                { numero: 3, instruction: "Sélectionnez un template officiel", detail: "Choisissez parmi les modèles pré-configurés (arrêté, note, courrier…)." },
                { numero: 4, instruction: "Rédigez et sauvegardez", detail: "Le document est automatiquement versionné et horodaté." },
            ],
        },
        {
            id: "inst-tuto-share-doc",
            titre: "Partager un document en interne",
            fonctionnaliteId: "inst-idocument",
            routeCible: "/institutional/idocument/shared",
            etapes: [
                { numero: 1, instruction: "Ouvrez le document à partager" },
                { numero: 2, instruction: "Cliquez sur l'icône de partage en haut", detail: "Sélectionnez les destinataires de votre institution." },
                { numero: 3, instruction: "Définissez les permissions", detail: "Lecture seule, modification, ou commentaire." },
                { numero: 4, instruction: "Envoyez la notification", detail: "Les destinataires recevront un lien sécurisé." },
            ],
        },
        {
            id: "inst-tuto-archive-legal",
            titre: "Archiver un acte légal",
            fonctionnaliteId: "inst-iarchive",
            routeCible: "/institutional/iarchive/legal",
            etapes: [
                { numero: 1, instruction: "Naviguez vers iArchive > Archives Légales" },
                { numero: 2, instruction: "Cliquez sur « Archiver un document »", detail: "Sélectionnez le document finalisé à archiver." },
                { numero: 3, instruction: "Classifiez le document", detail: "Date d'effet, catégorie, durée de conservation légale, niveau de confidentialité." },
                { numero: 4, instruction: "Validez l'archivage", detail: "Le document est scellé avec horodatage certifié et empreinte cryptographique." },
            ],
        },
        {
            id: "inst-tuto-sign-doc",
            titre: "Lancer un circuit de signature",
            fonctionnaliteId: "inst-isignature",
            routeCible: "/institutional/isignature/pending",
            etapes: [
                { numero: 1, instruction: "Allez dans iSignature > À signer" },
                { numero: 2, instruction: "Cliquez sur « Nouvelle Signature »", detail: "Sélectionnez le document à soumettre." },
                { numero: 3, instruction: "Ajoutez les signataires", detail: "Définissez l'ordre de signature si nécessaire (séquentiel ou parallèle)." },
                { numero: 4, instruction: "Lancez le circuit", detail: "Les signataires reçoivent une notification avec le document à signer." },
            ],
        },
        {
            id: "inst-tuto-compliance",
            titre: "Vérifier la conformité réglementaire",
            fonctionnaliteId: "inst-security",
            routeCible: "/institutional/compliance",
            etapes: [
                { numero: 1, instruction: "Accédez à Sécurité & Conformité" },
                { numero: 2, instruction: "Consultez le tableau de bord de conformité", detail: "Vérifiez les indicateurs RGPD et les alertes de sécurité." },
                { numero: 3, instruction: "Lancez un audit de traçabilité", detail: "Générez un rapport détaillé des accès et modifications." },
            ],
        },
    ],
    faq: [
        { question: "Quelle est la durée de conservation des archives légales ?", reponse: "Les durées de conservation suivent la réglementation en vigueur au Gabon. Par défaut : 10 ans pour les actes administratifs, 30 ans pour les actes juridiques. Vous pouvez personnaliser ces durées dans les paramètres.", categorie: "Archivage" },
        { question: "La signature électronique a-t-elle valeur juridique ?", reponse: "Oui. iSignature utilise un certificat de signature qualifié conforme eIDAS et à la législation gabonaise. Les documents signés ont la même valeur juridique qu'une signature manuscrite.", categorie: "Signature" },
        { question: "Comment ajouter un nouvel utilisateur ?", reponse: "Depuis Administration > Utilisateurs, cliquez sur « Inviter ». Entrez l'email institutionnel, assignez un rôle et validez. L'utilisateur recevra un lien d'activation sécurisé.", categorie: "Administration" },
        { question: "Mes données sont-elles souveraines ?", reponse: "Absolument. DIGITALIUM.IO garantit l'hébergement de toutes les données institutionnelles sur des serveurs souverains. Aucune donnée ne transite par des serveurs tiers non certifiés.", categorie: "Sécurité" },
        { question: "Puis-je exporter un rapport de conformité ?", reponse: "Oui. Depuis Sécurité & Conformité, vous pouvez générer et télécharger des rapports PDF d'audit couvrant les accès, modifications et signatures sur une période donnée.", categorie: "Sécurité" },
    ],
};
