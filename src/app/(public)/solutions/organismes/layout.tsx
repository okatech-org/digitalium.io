import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Solutions ONG, Associations & Fondations — DIGITALIUM.IO",
    description:
        "Gerez vos projets avec transparence et efficacite : gestion multi-projets, rapports bailleurs et tarifs preferentiels pour les organismes a but non lucratif.",
};

export default function OrganismesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
