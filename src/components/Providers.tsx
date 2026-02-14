"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Providers Wrapper
// Wraps app with all client-side providers
// ═══════════════════════════════════════════════

import React from "react";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseAuthProvider>
            <OrganizationProvider>
                <ThemeProvider>{children}</ThemeProvider>
            </OrganizationProvider>
        </FirebaseAuthProvider>
    );
}
