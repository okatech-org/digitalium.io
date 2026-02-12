"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Providers Wrapper
// Wraps app with all client-side providers
// ═══════════════════════════════════════════════

import React from "react";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseAuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </FirebaseAuthProvider>
    );
}
