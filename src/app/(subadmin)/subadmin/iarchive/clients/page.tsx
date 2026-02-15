"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Archives Clients
// ═══════════════════════════════════════════════

import { Building2, Loader2 } from "lucide-react";
import ArchiveCategoryTable, {
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";
import { useArchiveEntries } from "@/hooks/useArchiveEntries";

const CONFIG: CategoryConfig = {
    key: "clients",
    label: "Archives Clients",
    description: "Dossiers clients, contrats et correspondances",
    icon: Building2,
    gradient: "from-violet-600 to-purple-500",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    retention: "5 ans",
    chartColor: "#8b5cf6",
};

export default function SubAdminArchivesClientsPage() {
    const { entries, isLoading } = useArchiveEntries("client");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement des archives clients…</span>
            </div>
        );
    }

    return <ArchiveCategoryTable config={CONFIG} entries={entries} />;
}
