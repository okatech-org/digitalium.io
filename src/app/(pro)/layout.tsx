"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: Pro (Business) Routes
// Protected: persona = business, subscription required
// ═══════════════════════════════════════════════

import React from "react";
import { PersonaProtectedRoute } from "@/components/guards";

export default function ProLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PersonaProtectedRoute
            allowedPersonas={["business"]}
            requireSubscription
        >
            {children}
        </PersonaProtectedRoute>
    );
}
