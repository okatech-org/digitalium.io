"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Archives Sociales
// ═══════════════════════════════════════════════

import { Briefcase, Loader2 } from "lucide-react";
import ArchiveCategoryTable, {
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";
import { useArchiveEntries } from "@/hooks/useArchiveEntries";

const CONFIG: CategoryConfig = {
    key: "social",
    label: "Archives Sociales",
    description: "Contrats de travail, fiches de paie et documents RH",
    icon: Briefcase,
    gradient: "from-blue-600 to-cyan-500",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    retention: "5 ans",
    chartColor: "#3b82f6",
};

export default function SubAdminArchivesSocialesPage() {
    const { entries, isLoading } = useArchiveEntries("social");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement des archives sociales…</span>
            </div>
        );
    }

    return <ArchiveCategoryTable config={CONFIG} entries={entries} />;
}
