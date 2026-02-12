"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iAsted: AI Assistant (Placeholder)
// ═══════════════════════════════════════════════

import { Bot } from "lucide-react";

export default function AstedChat() {
    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] glass rounded-lg">
            <Bot className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">iAsted</h2>
            <p className="text-muted-foreground text-center max-w-md">
                L&apos;assistant IA conversationnel sera implémenté prochainement.
            </p>
        </div>
    );
}
