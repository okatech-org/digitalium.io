"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Archive Manager (Placeholder)
// ═══════════════════════════════════════════════

import { Archive } from "lucide-react";

export default function ArchiveManager() {
    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] glass rounded-lg">
            <Archive className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">iArchive</h2>
            <p className="text-muted-foreground text-center max-w-md">
                Le gestionnaire d&apos;archives avec intégrité SHA-256 sera implémenté prochainement.
            </p>
        </div>
    );
}
