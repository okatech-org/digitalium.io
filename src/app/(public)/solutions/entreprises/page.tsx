"use client";

import SolutionPageTemplate, {
    type SolutionPageData,
} from "@/components/sections/SolutionPageTemplate";
import {
    Building2,
    FileText,
    PenTool,
    Bot,
    TrendingUp,
    DollarSign,
    Plug,
    Scale,
} from "lucide-react";

const data: SolutionPageData = {
    /* Hero */
    heroIcon: Building2,
    heroBadge: "Entreprises & Startups",
    heroTitle: "Boostez la Productivité de",
    heroTitleGradient: "Votre Entreprise",
    heroSubtitle:
        "PME, PMI, Startups et Grands groupes — DIGITALIUM automatise votre gestion documentaire, réduit vos coûts et accélère vos processus métier.",
    heroGradient: "from-blue-500/15 to-violet-500/5",
    heroImage: "/images/sections/digital_tablet_pro.png",

    /* Modules */
    modules: [
        {
            icon: FileText,
            name: "iDocument Collaboration",
            description:
                "Co-édition temps réel avec Yjs. Rédigez, commentez et approuvez vos documents à plusieurs, simultanément. Templates professionnels inclus.",
            color: "#3B82F6",
        },
        {
            icon: PenTool,
            name: "iSignature",
            description:
                "Signature électronique légale avec workflows multi-étapes. Invitez, signez et suivez chaque approbation avec un audit trail complet.",
            color: "#8B5CF6",
        },
        {
            icon: Bot,
            name: "iAsted IA",
            description:
                "Assistant IA 24/7 — OCR, recherche sémantique, résumés automatiques et analytics prédictifs. Votre archiviste qui ne dort jamais.",
            color: "#F59E0B",
        },
    ],

    /* Avantages */
    advantages: [
        {
            icon: TrendingUp,
            title: "Gain de Productivité +23%",
            description:
                "Automatisez les tâches répétitives : classement, indexation, recherche et approbation. Vos équipes se concentrent sur leur cœur de métier.",
        },
        {
            icon: DollarSign,
            title: "Réduction des Coûts",
            description:
                "Éliminez le papier, les impressions et l'archivage physique. ROI positif dès le 3e mois grâce à la dématérialisation complète.",
        },
        {
            icon: Scale,
            title: "Conformité Fiscale",
            description:
                "Archivage légal 10 ans conforme à la réglementation gabonaise. Certificats SHA-256 et horodatage pour chaque document.",
        },
        {
            icon: Plug,
            title: "API & Intégrations",
            description:
                "Connectez DIGITALIUM à votre ERP, CRM et outils comptables via notre API REST et nos SDK. Intégration en quelques heures.",
        },
    ],

    /* Tarifs */
    pricing: [
        {
            name: "Starter",
            subtitle: "Startups & TPE",
            price: "15 000",
            priceAnnual: "12 000",
            unit: "XAF/user/mois · à partir de 5 users",
            features: [
                "iDocument (co-édition)",
                "iArchive (5 Go/user)",
                "Workflows basiques",
                "Support email (< 24h)",
                "Essai gratuit 14 jours",
            ],
            cta: "Commencer Gratuitement",
            ctaHref: "/register",
        },
        {
            name: "Business",
            subtitle: "PME & PMI",
            price: "25 000",
            priceAnnual: "20 000",
            unit: "XAF/user/mois · jusqu'à 50 users",
            popular: true,
            features: [
                "Tous les modules inclus",
                "iAsted IA (OCR, résumés, analytics)",
                "iSignature workflows avancés",
                "API REST + webhooks",
                "SSO Google / Microsoft",
                "Support prioritaire (< 4h)",
                "Stockage 20 Go/user",
            ],
            cta: "Configurer ma Structure",
            ctaHref: "/register",
        },
        {
            name: "Enterprise",
            subtitle: "Grands Groupes",
            price: "Sur devis",
            priceAnnual: "Sur devis",
            unit: "utilisateurs illimités",
            features: [
                "Déploiement dédié ou on-premise",
                "Intégration ERP / CRM / SAP",
                "SSO SAML / OIDC",
                "SLA 99.9% garanti",
                "Account Manager dédié",
                "Formation continue incluse",
            ],
            cta: "Contacter les Ventes",
            ctaHref: "/register",
        },
    ],

    /* Testimonials */
    testimonials: [
        {
            name: "Fabrice Moussavou",
            role: "DG",
            org: "ASCOMA Gabon",
            quote:
                "DIGITALIUM a réduit de 40% le temps passé sur la gestion documentaire. L'assistant IA iAsted nous fait gagner un temps précieux au quotidien.",
        },
        {
            name: "Sylvie Ntsame",
            role: "Directrice Financière",
            org: "StartupVille LBV",
            quote:
                "La conformité fiscale intégrée nous évite tout stress lors des contrôles. L'archivage est automatique et certifié — on ne s'en occupe plus.",
        },
        {
            name: "Henri Mba Nzoghe",
            role: "DSI",
            org: "Groupe Industriel SOGARA",
            quote:
                "L'intégration API avec notre ERP SAP a été fluide. Les workflows de signature iSignature ont accéléré nos processus d'approbation de 60%.",
        },
    ],

    /* FAQ */
    faqs: [
        {
            q: "Combien de temps pour déployer DIGITALIUM dans mon entreprise ?",
            a: "Pour une PME : 30 minutes d'onboarding avec un assistant guidé. Pour un grand groupe : déploiement personnalisé en 1 à 2 semaines avec formation incluse.",
        },
        {
            q: "DIGITALIUM s'intègre-t-il à nos outils existants ?",
            a: "Oui, via notre API REST et nos connecteurs natifs. Compatible ERP (SAP, Sage), CRM (Salesforce, HubSpot), et suites bureautiques (Microsoft 365, Google Workspace).",
        },
        {
            q: "Peut-on commencer avec un petit nombre d'utilisateurs ?",
            a: "Absolument. L'offre Entreprise démarre à partir de 5 utilisateurs. Vous pouvez scaler à votre rythme — de 5 à 5 000 utilisateurs sans migration.",
        },
        {
            q: "Comment fonctionne la facturation ?",
            a: "Tarification par utilisateur/mois. Paiement par Mobile Money, virement bancaire ou carte. Essai gratuit de 14 jours sans engagement ni carte bancaire.",
        },
        {
            q: "Que se passe-t-il si je dépasse mon quota de stockage ?",
            a: "Vous recevez des alertes proactives. Le stockage additionnel est facturé au Go — pas de surprises. Contactez-nous pour un devis volume.",
        },
    ],

    /* CTA */
    ctaTitle: "Prêt à",
    ctaTitleGradient: "Transformer Votre Entreprise ?",
    ctaSubtitle:
        "Essai gratuit 14 jours — Aucune carte bancaire requise. Commencez à digitaliser vos documents dès aujourd'hui.",
    ctaButtonLabel: "🚀 Commencer Gratuitement",
    ctaButtonHref: "/register",
    ctaSecondaryLabel: "Planifier une Démo",
};

export default function EntreprisesPage() {
    return <SolutionPageTemplate data={data} />;
}
