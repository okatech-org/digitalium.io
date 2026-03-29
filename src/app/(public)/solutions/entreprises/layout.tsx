import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Solutions Entreprises & Startups — DIGITALIUM.IO",
    description:
        "PME, PMI, Startups et Grands groupes : automatisez votre gestion documentaire, archivage certifie et signature electronique avec DIGITALIUM.",
};

export default function EntreprisesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
