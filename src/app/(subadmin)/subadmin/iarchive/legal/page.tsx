"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Archives Juridiques
// ═══════════════════════════════════════════════

import { Scale, Loader2 } from "lucide-react";
import ArchiveCategoryTable, {
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";
import { useArchiveEntries } from "@/hooks/useArchiveEntries";

const CONFIG: CategoryConfig = {
    key: "legal",
    label: "Archives Juridiques",
    description: "Statuts, procès-verbaux et actes juridiques",
    icon: Scale,
    gradient: "from-emerald-600 to-teal-500",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    retention: "30 ans",
    chartColor: "#10b981",
};

export default function SubAdminArchivesJuridiquesPage() {
    const { entries, isLoading } = useArchiveEntries("legal");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement des archives juridiques…</span>
            </div>
        );
    }

    return <ArchiveCategoryTable config={CONFIG} entries={entries} />;
}
