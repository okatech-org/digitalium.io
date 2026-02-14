"use client";

import SolutionPageTemplate, {
    type SolutionPageData,
} from "@/components/sections/SolutionPageTemplate";
import {
    Heart,
    FileText,
    Archive,
    Users,
    FolderKanban,
    Eye,
    BarChart3,
    BadgePercent,
} from "lucide-react";

const data: SolutionPageData = {
    /* Hero */
    heroIcon: Heart,
    heroBadge: "ONG, Associations & Fondations",
    heroTitle: "Gérez Vos Projets avec",
    heroTitleGradient: "Transparence & Efficacité",
    heroSubtitle:
        "Digitalium accompagne les organisations à but non lucratif avec des outils adaptés : gestion multi-projets, rapports bailleurs et tarifs préférentiels.",
    heroGradient: "from-emerald-500/15 to-teal-500/5",
    heroImage: "/images/sections/team_collaboration_meeting.png",

    /* Modules */
    modules: [
        {
            icon: FileText,
            name: "iDocument Gestion Projets",
            description:
                "Centralisation documentaire par projet. Templates de rapports bailleurs, workflows d'approbation terrain et co-édition collaborative en temps réel.",
            color: "#3B82F6",
        },
        {
            icon: Archive,
            name: "iArchive Rapports Terrain",
            description:
                "Archivage structuré de vos rapports d'activités, photos terrain, justificatifs financiers. Recherche instantanée et export audit-ready.",
            color: "#10B981",
        },
        {
            icon: Users,
            name: "Collaboration Multi-équipes",
            description:
                "Travail simultané entre siège et antennes terrain. Partage sécurisé, commentaires en contexte et suivi des contributions par membre.",
            color: "#8B5CF6",
        },
    ],

    /* Avantages */
    advantages: [
        {
            icon: BadgePercent,
            title: "Tarifs Préférentiels ONG",
            description:
                "Remise significative pour les organisations à but non lucratif. Programme dédié avec onboarding gratuit et support prioritaire.",
        },
        {
            icon: FolderKanban,
            title: "Gestion Multi-Projets",
            description:
                "Organisez vos documents par projet, zone géographique et bailleur. Vue consolidée de tous vos programmes en un clic.",
        },
        {
            icon: Eye,
            title: "Transparence Totale",
            description:
                "Audit trail complet pour chaque document. Partagez un accès lecture seule avec vos bailleurs pour une transparence maximale.",
        },
        {
            icon: BarChart3,
            title: "Rapports Bailleurs",
            description:
                "Générez des rapports conformes aux exigences de vos bailleurs (UE, USAID, AFD, BAD). Export PDF certifié et horodaté.",
        },
    ],

    /* Tarifs */
    pricing: [
        {
            name: "Associatif",
            subtitle: "Petites Associations",
            price: "8 000",
            priceAnnual: "6 500",
            unit: "XAF/user/mois · jusqu'à 10 users",
            features: [
                "iDocument + iArchive",
                "Gestion de 3 projets max",
                "Templates rapports bailleurs",
                "Mode hors-ligne PWA",
                "Support email (< 24h)",
                "Onboarding gratuit",
            ],
            cta: "Commencer",
            ctaHref: "/register",
        },
        {
            name: "Programmes",
            subtitle: "ONG Multi-Projets",
            price: "15 000",
            priceAnnual: "12 000",
            unit: "XAF/user/mois · projets illimités",
            popular: true,
            features: [
                "Tous les modules inclus",
                "Projets & zones illimités",
                "Rapports bailleurs (UE, USAID, AFD)",
                "Accès lecture seule bailleurs",
                "Collaboration siège-terrain",
                "Audit trail complet",
                "Support prioritaire (< 4h)",
            ],
            cta: "Contacter Notre Équipe",
            ctaHref: "/register",
        },
        {
            name: "Institutionnel",
            subtitle: "Grandes ONG & Fondations",
            price: "Sur devis",
            priceAnnual: "Sur devis",
            unit: "organisations multi-pays",
            features: [
                "Architecture multi-pays",
                "Déploiement dédié",
                "Intégration ERP ONG",
                "Dashboard consolidé",
                "Formation continue incluse",
                "Comité de pilotage dédié",
            ],
            cta: "Demander un Devis",
            ctaHref: "/register",
        },
    ],

    /* Testimonials */
    testimonials: [
        {
            name: "Aude Mintsa",
            role: "Directrice Exécutive",
            org: "Fondation Gabon Vert",
            quote:
                "DIGITALIUM nous a permis de centraliser 5 ans de rapports terrain éparpillés. Nos bailleurs apprécient la transparence des accès en lecture seule.",
        },
        {
            name: "Serge Biyoghe",
            role: "Coordinateur Programmes",
            org: "ONG Éducation pour Tous",
            quote:
                "La gestion multi-projets est un game-changer. On passe d'Excel et WhatsApp à une vraie plateforme structurée — et les tarifs ONG sont très accessibles.",
        },
        {
            name: "Claire Meyo",
            role: "Responsable M&E",
            org: "Croix-Rouge Gabonaise",
            quote:
                "L'archivage certifié nous a fait gagner des semaines lors du dernier audit. La recherche sémantique retrouve n'importe quel document en secondes.",
        },
    ],

    /* FAQ */
    faqs: [
        {
            q: "Quels sont les tarifs pour les ONG et associations ?",
            a: "Nous proposons des réductions significatives pour les organisations à but non lucratif. Contactez notre équipe pour un devis personnalisé. L'onboarding et la formation sont offerts.",
        },
        {
            q: "Peut-on donner un accès limité à nos bailleurs ?",
            a: "Oui, créez des accès en lecture seule par projet. Vos bailleurs consultent les documents et rapports sans pouvoir les modifier. Contrôle total sur les permissions.",
        },
        {
            q: "Comment gérer des équipes terrain sans connexion stable ?",
            a: "DIGITALIUM fonctionne en mode hors-ligne (PWA). Les documents se synchronisent automatiquement dès le retour de la connexion. Idéal pour les zones rurales.",
        },
        {
            q: "Existe-t-il des templates adaptés aux rapports bailleurs ?",
            a: "Oui, nous incluons des templates pour les rapports narratifs et financiers UE, USAID, AFD, BAD et Banque Mondiale. Personnalisables selon vos besoins.",
        },
        {
            q: "Comment migrer nos documents existants ?",
            a: "Notre équipe vous accompagne dans la migration. Import bulk depuis Google Drive, Dropbox, SharePoint ou disques durs. Classification automatique par IA.",
        },
    ],

    /* CTA */
    ctaTitle: "Rejoignez les Organisations qui",
    ctaTitleGradient: "Font la Différence",
    ctaSubtitle:
        "Tarifs préférentiels, onboarding gratuit et support dédié pour les ONG. Contactez notre équipe pour démarrer.",
    ctaButtonLabel: "Contacter Notre Équipe",
    ctaButtonHref: "/register",
    ctaSecondaryLabel: "Planifier une Démo",
};

export default function OrganismesPage() {
    return <SolutionPageTemplate data={data} />;
}
