"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Archives Clients
// ═══════════════════════════════════════════════

import { Building2 } from "lucide-react";
import ArchiveCategoryTable, {
    type ArchiveEntry,
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";

const CONFIG: CategoryConfig = {
    key: "client",
    label: "Archives Clients",
    description: "Dossiers clients, factures reçues et correspondances",
    icon: Building2,
    gradient: "from-violet-600 to-purple-500",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    retention: "5 ans",
    chartColor: "#8b5cf6",
};

const ENTRIES: ArchiveEntry[] = [
    { id: "c1", title: "Dossier SOGARA — Contrats 2025", archivedAt: "05/02/2026", expiresAt: "05/02/2031", size: "6.1 Mo", hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", status: "active", certId: "CERT-2026-07988", archivedBy: "Daniel Nguema" },
    { id: "c2", title: "Factures SEEG — Exercice 2025", archivedAt: "31/01/2026", expiresAt: "31/01/2031", size: "2.3 Mo", hash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3", status: "active", certId: "CERT-2026-07970", archivedBy: "Marie Obame" },
    { id: "c3", title: "Correspondance CEEAC — Réf. 2025-045", archivedAt: "20/01/2026", expiresAt: "20/01/2031", size: "789 Ko", hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4", status: "active", certId: "CERT-2026-07955", archivedBy: "Claude Mboumba" },
    { id: "c4", title: "Devis accepté — Aménagement bureaux", archivedAt: "10/11/2025", expiresAt: "10/11/2030", size: "1.1 Mo", hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5", status: "active", certId: "CERT-2025-07234", archivedBy: "Sophie Nzamba" },
    { id: "c5", title: "Réclamation client N°RC-2025-078", archivedAt: "15/09/2025", expiresAt: "15/09/2030", size: "345 Ko", hash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6", status: "active", certId: "CERT-2025-06890", archivedBy: "Aimée Gondjout" },
];

export default function ArchivesClientsPage() {
    return <ArchiveCategoryTable config={CONFIG} entries={ENTRIES} />;
}
