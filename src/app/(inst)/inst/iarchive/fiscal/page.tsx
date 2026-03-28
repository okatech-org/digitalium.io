"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Archives Fiscales (Institutional)
// ═══════════════════════════════════════════════

import { Landmark } from "lucide-react";
import ArchiveCategoryTable, {
    type ArchiveEntry,
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";

const CONFIG: CategoryConfig = {
    key: "fiscal",
    label: "Archives Fiscales",
    description: "Documents comptables, déclarations fiscales et bilans",
    icon: Landmark,
    gradient: "from-amber-600 to-orange-500",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    retention: "10 ans",
    chartColor: "#f59e0b",
};

const ENTRIES: ArchiveEntry[] = [
    { id: "f1", title: "Bilan comptable 2025", archivedAt: "15/01/2026", expiresAt: "15/01/2036", size: "2.4 Mo", hash: "5854a1eb44420c6893e0fa79751ee81fe97996fc3b08af43212a831f947d47a5", status: "active", certId: "CERT-2026-07997", archivedBy: "Daniel Nguema" },
    { id: "f2", title: "Déclaration TVA — T4 2025", archivedAt: "10/01/2026", expiresAt: "10/01/2036", size: "1.8 Mo", hash: "a3e8b12c7d5f6e9a0b4c8d1e2f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f01", status: "active", certId: "CERT-2026-07985", archivedBy: "Marie Obame" },
    { id: "f3", title: "Facture SEEG N°2025-0198", archivedAt: "28/12/2025", expiresAt: "28/12/2035", size: "342 Ko", hash: "b4f9c23d8e1a5f6b7c0d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a34", status: "active", certId: "CERT-2025-07911", archivedBy: "Claude Mboumba" },
    { id: "f4", title: "Amortissements immobiliers 2025", archivedAt: "20/12/2025", expiresAt: "20/12/2035", size: "5.1 Mo", hash: "c5a0d34e9f2b6a7c8d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b45", status: "active", certId: "CERT-2025-07899", archivedBy: "Daniel Nguema" },
    { id: "f5", title: "Contrat prestation SOGARA", archivedAt: "12/02/2026", expiresAt: "12/02/2036", size: "890 Ko", hash: "d6b1e45f0a3c7b8d9e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c56", status: "active", certId: "CERT-2026-07997", archivedBy: "Daniel Nguema" },
    { id: "f6", title: "Déclaration IS 2024", archivedAt: "31/03/2025", expiresAt: "31/03/2035", size: "1.2 Mo", hash: "e7c2f56a1b4d8c9e0f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d67", status: "active", certId: "CERT-2025-06540", archivedBy: "Marie Obame" },
    { id: "f7", title: "Contrat SHO — Bail commercial 2016", archivedAt: "15/06/2016", expiresAt: "15/06/2026", size: "480 Ko", hash: "f8d3a67b2c5e9d0f1a4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e78", status: "expiring", certId: "CERT-2016-00234", archivedBy: "Pierre Ndong" },
    { id: "f8", title: "Facture télécom 2015-Q2", archivedAt: "01/07/2015", expiresAt: "01/07/2025", size: "156 Ko", hash: "09e4b78c3d6f0e1a2b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f89", status: "expired", certId: "CERT-2015-02876", archivedBy: "Claude Mboumba" },
    { id: "f9", title: "Rapport audit externe 2025", archivedAt: "— en cours —", expiresAt: "—", size: "—", hash: "en cours de calcul…", status: "pending", certId: "—", archivedBy: "Système" },
];

export default function ArchivesFiscalesPage() {
    return <ArchiveCategoryTable config={CONFIG} entries={ENTRIES} />;
}
