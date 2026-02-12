"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Archives Juridiques
// ═══════════════════════════════════════════════

import { Scale } from "lucide-react";
import ArchiveCategoryTable, {
    type ArchiveEntry,
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";

const CONFIG: CategoryConfig = {
    key: "legal",
    label: "Archives Juridiques",
    description: "Contrats, actes notariés, litiges et documents légaux",
    icon: Scale,
    gradient: "from-emerald-600 to-teal-500",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    retention: "10 ans",
    chartColor: "#10b981",
};

const ENTRIES: ArchiveEntry[] = [
    { id: "l1", title: "Bail commercial — Immeuble Triomphal", archivedAt: "10/02/2026", expiresAt: "10/02/2036", size: "1.3 Mo", hash: "7c6f2d8e5b43a1e9f0d2c3b4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4", status: "active", certId: "CERT-2026-07995", archivedBy: "Claude Mboumba" },
    { id: "l2", title: "Statuts de la société — Mise à jour 2025", archivedAt: "20/12/2025", expiresAt: "20/12/2035", size: "2.8 Mo", hash: "8d7a3e9f6c54b2f0a1e3d4c5b6a7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5", status: "active", certId: "CERT-2025-07890", archivedBy: "Daniel Nguema" },
    { id: "l3", title: "PV Assemblée Générale 2025", archivedAt: "15/06/2025", expiresAt: "15/06/2035", size: "4.2 Mo", hash: "9e8b4f0a7d65c3a1b2f4e5d6c7b8a9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6", status: "active", certId: "CERT-2025-05678", archivedBy: "Aimée Gondjout" },
    { id: "l4", title: "Contrat de licence SaaS — Partenaire CEEAC", archivedAt: "01/03/2025", expiresAt: "01/03/2035", size: "678 Ko", hash: "0f9c5a1b8e76d4b2c3a5f6e7d8c9b0a1e2f3d4c5b6a7e8f9a0b1c2d3e4f5a6b7", status: "active", certId: "CERT-2025-04123", archivedBy: "Marie Obame" },
    { id: "l5", title: "PV Assemblée Générale 2024", archivedAt: "20/06/2024", expiresAt: "20/06/2034", size: "3.9 Mo", hash: "1a0d6b2c9f87e5c3d4b6a7f8e9d0c1b2a3f4e5d6c7b8a9e0f1a2b3c4d5e6f7a8", status: "active", certId: "CERT-2024-03456", archivedBy: "Daniel Nguema" },
    { id: "l6", title: "Accord de confidentialité — Projet Alpha", archivedAt: "05/09/2024", expiresAt: "05/09/2034", size: "245 Ko", hash: "2b1e7c3d0a98f6d4e5c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1e2f3d4c5b6a7e8f9", status: "active", certId: "CERT-2024-06789", archivedBy: "Sophie Nzamba" },
];

export default function ArchivesJuridiquesPage() {
    return <ArchiveCategoryTable config={CONFIG} entries={ENTRIES} />;
}
