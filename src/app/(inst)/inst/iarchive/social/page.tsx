"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Archives Sociales (Institutional)
// ═══════════════════════════════════════════════

import { Users2 } from "lucide-react";
import ArchiveCategoryTable, {
    type ArchiveEntry,
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";

const CONFIG: CategoryConfig = {
    key: "social",
    label: "Archives Sociales",
    description: "Contrats de travail, bulletins de paie et documents RH",
    icon: Users2,
    gradient: "from-blue-600 to-cyan-500",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    retention: "5 ans",
    chartColor: "#3b82f6",
};

const ENTRIES: ArchiveEntry[] = [
    { id: "s1", title: "Convention collective 2026", archivedAt: "08/02/2026", expiresAt: "08/02/2031", size: "3.2 Mo", hash: "a3e8b12c7d5f6e9a0b4c8d1e2f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f01", status: "active", certId: "CERT-2026-07996", archivedBy: "Aimée Gondjout" },
    { id: "s2", title: "Bulletins de paie — Janvier 2026", archivedAt: "05/02/2026", expiresAt: "05/02/2031", size: "1.5 Mo", hash: "b4c9d23e8f1a5b6c7d0e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b34", status: "active", certId: "CERT-2026-07980", archivedBy: "Sophie Nzamba" },
    { id: "s3", title: "Contrat CDI — M. Essono Patrick", archivedAt: "15/01/2026", expiresAt: "15/01/2031", size: "890 Ko", hash: "c5d0e34f9a2b6c7d8e1f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c45", status: "active", certId: "CERT-2026-07945", archivedBy: "Daniel Nguema" },
    { id: "s4", title: "Attestation CNSS — Décembre 2025", archivedAt: "10/01/2026", expiresAt: "10/01/2031", size: "456 Ko", hash: "d6e1f45a0b3c7d8e9f2a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d56", status: "active", certId: "CERT-2026-07930", archivedBy: "Marie Obame" },
    { id: "s5", title: "Convention syndicale 2021", archivedAt: "20/03/2021", expiresAt: "20/03/2026", size: "2.1 Mo", hash: "e7f2a56b1c4d8e9f0a3b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e67", status: "expiring", certId: "CERT-2021-03112", archivedBy: "Pierre Ndong" },
    { id: "s6", title: "Registre du personnel 2020", archivedAt: "31/12/2020", expiresAt: "31/12/2025", size: "4.7 Mo", hash: "f8a3b67c2d5e9f0a1b4c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f78", status: "expired", certId: "CERT-2020-08901", archivedBy: "Claude Mboumba" },
];

export default function ArchivesSocialesPage() {
    return <ArchiveCategoryTable config={CONFIG} entries={ENTRIES} />;
}
