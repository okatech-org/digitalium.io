"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: Admin Routes
// Protected: requireAdmin, with level-based access
// /admin → level ≤ 1 | /sysadmin → level ≤ 1 | /subadmin → level ≤ 2
// ═══════════════════════════════════════════════

import React from "react";
import { ProtectedRoute } from "@/components/guards";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute requireAdmin>
            {children}
        </ProtectedRoute>
    );
}


