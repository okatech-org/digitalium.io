"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Archives Fiscales
// ═══════════════════════════════════════════════

import { Landmark } from "lucide-react";
import { Loader2 } from "lucide-react";
import ArchiveCategoryTable, {
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";
import { useArchiveEntries } from "@/hooks/useArchiveEntries";

const CONFIG: CategoryConfig = {
    key: "fiscal",
    label: "Archives Fiscales",
    description: "Déclarations fiscales, bilans et documents comptables",
    icon: Landmark,
    gradient: "from-amber-600 to-orange-500",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    retention: "10 ans",
    chartColor: "#f59e0b",
};

export default function SubAdminArchivesFiscalesPage() {
    const { entries, isLoading } = useArchiveEntries("fiscal");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement des archives fiscales…</span>
            </div>
        );
    }

    return <ArchiveCategoryTable config={CONFIG} entries={entries} />;
}
