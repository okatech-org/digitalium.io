"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Providers Wrapper
// Wraps app with all client-side providers
// ═══════════════════════════════════════════════

import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConvexProvider client={convex}>
            <FirebaseAuthProvider>
                <OrganizationProvider>
                    <ThemeProvider>
                        <I18nProvider>
                            <ErrorBoundary>{children}</ErrorBoundary>
                        </I18nProvider>
                    </ThemeProvider>
                </OrganizationProvider>
            </FirebaseAuthProvider>
        </ConvexProvider>
    );
}
