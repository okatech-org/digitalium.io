"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: SubAdmin Routes
// Protected: org_admin (level ≤ 2) required
// ═══════════════════════════════════════════════

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoader } from "@/components/guards/AuthLoader";

export default function SubAdminRouteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <AuthLoader message="Vérification des droits d'administration…" />;
    }

    if (!isAuthenticated || !user) {
        router.replace("/");
        return null;
    }

    // Only level ≤ 2 (org_admin and above) can access subadmin
    if (user.level !== undefined && user.level > 2) {
        const redirect = user.personaType === "institutional" ? "/institutional" : "/pro";
        router.replace(redirect);
        return null;
    }

    return <>{children}</>;
}
