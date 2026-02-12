"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — ProtectedRoute Guard
// Main route guard: auth + admin/role checks
// ═══════════════════════════════════════════════════════════════

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { PlatformRole } from "@/types/auth";
import { AuthLoader } from "./AuthLoader";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Require admin privilege (level ≤ 2) */
    requireAdmin?: boolean;
    /** Require a specific minimum role */
    requiredRole?: PlatformRole;
    /** Maximum allowed level (lower = more privileged) */
    maxLevel?: number;
    /** Where to redirect on auth failure */
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requireAdmin = false,
    requiredRole,
    maxLevel,
    redirectTo,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, loading, isAuthenticated, isAdmin, hasRole, level } =
        useAuth();

    useEffect(() => {
        if (loading) return;

        // 1. Not authenticated → login
        if (!isAuthenticated) {
            router.replace(redirectTo ?? "/login");
            return;
        }

        // 2. Admin required but user is not admin
        if (requireAdmin && !isAdmin) {
            router.replace(redirectTo ?? "/pro");
            return;
        }

        // 3. Max level check (e.g. maxLevel=1 means only levels 0-1)
        if (maxLevel !== undefined && level !== null && level > maxLevel) {
            router.replace(redirectTo ?? "/pro");
            return;
        }

        // 4. Specific role required
        if (requiredRole && !hasRole(requiredRole)) {
            router.replace(redirectTo ?? "/pro");
            return;
        }
    }, [
        loading,
        isAuthenticated,
        isAdmin,
        requireAdmin,
        requiredRole,
        maxLevel,
        level,
        hasRole,
        redirectTo,
        router,
        user,
    ]);

    // Show loader while checking
    if (loading) {
        return <AuthLoader message="Vérification des accès…" />;
    }

    // Not authenticated or not authorized — don't flash content
    if (!isAuthenticated) return null;
    if (requireAdmin && !isAdmin) return null;
    if (maxLevel !== undefined && level !== null && level > maxLevel)
        return null;
    if (requiredRole && !hasRole(requiredRole)) return null;

    return <>{children}</>;
}
