"use client";

import SolutionPageTemplate, {
    type SolutionPageData,
} from "@/components/sections/SolutionPageTemplate";
import {
    Landmark,
    Shield,
    FileText,
    Archive,
    KeyRound,
    Server,
    Scale,
    Clock,
    Lock,
    Wifi,
} from "lucide-react";

const data: SolutionPageData = {
    /* Hero */
    heroIcon: Landmark,
    heroBadge: "Secteur Public & Gouvernement",
    heroTitle: "La Plateforme Souveraine pour",
    heroTitleGradient: "Vos Institutions",
    heroSubtitle:
        "Ministères, Directions, Collectivités — DIGITALIUM offre une solution conforme, sécurisée et déployable on-premise pour moderniser votre gestion documentaire.",
    heroGradient: "from-amber-500/15 to-orange-500/5",
    heroImage: "/images/sections/ministry_office.png",

    /* Modules */
    modules: [
        {
            icon: Archive,
            name: "iArchive Souverain",
            description:
                "Archivage légal avec intégrité SHA-256. Hébergement 100% souverain — aucune donnée ne quitte le territoire gabonais. Rétention légale 10 ans incluse.",
            color: "#10B981",
        },
        {
            icon: FileText,
            name: "iDocument Conformité",
            description:
                "Gestion documentaire conforme aux normes réglementaires gabonaises. Templates officiels, workflows d'approbation multi-niveaux et traçabilité complète.",
            color: "#3B82F6",
        },
        {
            icon: KeyRound,
            name: "SSO SAML / OIDC",
            description:
                "Authentification unique intégrée à votre annuaire existant. Compatible Active Directory, LDAP et fournisseurs d'identité nationaux.",
            color: "#8B5CF6",
        },
    ],

    /* Avantages */
    advantages: [
        {
            icon: Shield,
            title: "Souveraineté des Données",
            description:
                "Vos données restent au Gabon. Hébergement souverain avec chiffrement de bout en bout et conformité totale RGPD.",
        },
        {
            icon: Scale,
            title: "Conformité Légale Garantie",
            description:
                "Respect des obligations d'archivage fiscal (10 ans), certification SHA-256 et horodatage légal de chaque document.",
        },
        {
            icon: Server,
            title: "Déploiement On-Premise",
            description:
                "Installation sur vos propres serveurs ou cloud privé. Contrôle total de l'infrastructure avec mises à jour gérées.",
        },
        {
            icon: Wifi,
            title: "SLA 99.9% & Support 24/7",
            description:
                "Disponibilité garantie contractuellement. Équipe de support dédiée avec temps de réponse inférieur à 4 heures.",
        },
    ],

    /* Tarifs */
    pricing: [
        {
            name: "Essentiel",
            subtitle: "Collectivités & Mairies",
            price: "250 000",
            priceAnnual: "200 000",
            unit: "XAF/mois · jusqu'à 25 users",
            features: [
                "iDocument + iArchive",
                "Workflows d'approbation",
                "Hébergement souverain Gabon",
                "Support email (< 24h)",
                "Formation initiale incluse",
            ],
            cta: "Demander un Devis",
            ctaHref: "/register",
        },
        {
            name: "Souverain",
            subtitle: "Ministères & Directions",
            price: "750 000",
            priceAnnual: "600 000",
            unit: "XAF/mois · utilisateurs illimités",
            popular: true,
            features: [
                "Tous les modules inclus",
                "Déploiement on-premise / cloud privé",
                "SSO SAML / OIDC",
                "Chiffrement E2E (AES-256)",
                "SLA 99.9% + support 24/7",
                "Chef de projet dédié",
                "Formation sur site illimitée",
            ],
            cta: "Contacter l'Équipe",
            ctaHref: "/register",
        },
        {
            name: "Sur Mesure",
            subtitle: "Institutions Nationales",
            price: "Sur devis",
            priceAnnual: "Sur devis",
            unit: "licence perpétuelle disponible",
            features: [
                "Architecture multi-sites",
                "Intégration SI existant",
                "Audit sécurité annuel inclus",
                "Data center souverain dédié",
                "SLA personnalisé",
                "Comité de pilotage mensuel",
            ],
            cta: "Planifier un RDV",
            ctaHref: "/register",
        },
    ],

    /* Testimonials */
    testimonials: [
        {
            name: "Jean-Marc Ndong",
            role: "Directeur SI",
            org: "Ministère de l'Économie",
            quote:
                "DIGITALIUM a transformé notre gestion documentaire. La conformité légale intégrée et l'archivage souverain nous ont permis de moderniser nos processus en toute sérénité.",
        },
        {
            name: "Marie-Claire Obame",
            role: "Secrétaire Général",
            org: "Mairie de Libreville",
            quote:
                "Le déploiement on-premise nous garantit un contrôle total sur nos données sensibles. Le support 24/7 est réactif et compétent.",
        },
        {
            name: "Patrick Essono",
            role: "Chef de Division Archives",
            org: "Direction Générale des Impôts",
            quote:
                "L'intégration avec nos systèmes existants via SSO SAML a été transparente. Nos agents ont adopté la solution en moins d'une semaine.",
        },
    ],

    /* FAQ */
    faqs: [
        {
            q: "DIGITALIUM peut-il être déployé sur nos serveurs internes ?",
            a: "Oui, nous proposons un déploiement on-premise complet sur vos serveurs ou sur un cloud privé souverain. Notre équipe d'ingénieurs assure l'installation, la configuration et la maintenance.",
        },
        {
            q: "Comment est assurée la conformité légale ?",
            a: "Intégrité cryptographique SHA-256, horodatage certifié, rétention légale de 10 ans pour l'archivage fiscal, et audit trail complet. Chaque action est tracée et certifiée.",
        },
        {
            q: "Quelles certifications de sécurité possédez-vous ?",
            a: "Chiffrement AES-256 au repos, TLS 1.3 en transit, authentification multi-facteurs, et conformité RGPD. Audits de sécurité annuels par des tiers indépendants.",
        },
        {
            q: "Comment s'intègre DIGITALIUM à nos systèmes existants ?",
            a: "Via SSO SAML/OIDC pour l'authentification, API REST complète pour l'intégration métier, et connecteurs natifs pour les suites bureautiques. Compatible Active Directory et LDAP.",
        },
        {
            q: "Quel est le processus de déploiement ?",
            a: "Audit initial (1 semaine), déploiement et configuration (2-3 semaines), formation sur site (1 semaine), puis accompagnement continu. Un chef de projet dédié vous est assigné.",
        },
    ],

    /* CTA */
    ctaTitle: "Modernisez Votre",
    ctaTitleGradient: "Infrastructure Documentaire",
    ctaSubtitle:
        "Rejoignez les institutions gabonaises qui ont choisi la transformation digitale souveraine. Devis personnalisé sous 48h.",
    ctaButtonLabel: "Demander un Devis",
    ctaButtonHref: "/register",
    ctaSecondaryLabel: "Planifier une Démo",
};

export default function AdministrationsPage() {
    return <SolutionPageTemplate data={data} />;
}
