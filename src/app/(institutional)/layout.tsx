"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: Institutional Routes
// Protected: institutional license required
// Uses full InstitutionalLayout with sidebar
// ═══════════════════════════════════════════════

import React from "react";
import { InstitutionalProtectedRoute } from "@/components/guards";
import InstitutionalLayout from "@/components/layout/InstitutionalLayout";

export default function InstitutionalRouteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <InstitutionalProtectedRoute>
            <InstitutionalLayout>
                {children}
            </InstitutionalLayout>
        </InstitutionalProtectedRoute>
    );
}
