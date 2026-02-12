"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Signature Panel (Placeholder)
// ═══════════════════════════════════════════════

import { PenTool } from "lucide-react";

export default function SignaturePanel() {
    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] glass rounded-lg">
            <PenTool className="h-16 w-16 text-digitalium-violet mb-4" />
            <h2 className="text-xl font-semibold mb-2">iSignature</h2>
            <p className="text-muted-foreground text-center max-w-md">
                Le module de signature électronique sera implémenté prochainement.
            </p>
        </div>
    );
}
