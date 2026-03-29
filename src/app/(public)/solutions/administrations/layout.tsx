import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Solutions Administrations & Secteur Public — DIGITALIUM.IO",
    description:
        "Ministeres, Directions, Collectivites : modernisez votre gestion documentaire avec une plateforme souveraine, conforme et securisee.",
};

export default function AdministrationsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
