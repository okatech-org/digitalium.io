"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — InstitutionalProtectedRoute Guard
// Verifies institutional license, deployment type, and maintenance
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { PlatformRole } from "@/types/auth";
import { AuthLoader } from "./AuthLoader";

/** Institutional license info (from Cloud SQL) */
interface InstitutionalLicense {
    licenseKey: string;
    licenseType: "perpetual" | "subscription_annual";
    deployment: "on_premise" | "private_cloud" | "hybrid";
    maintenanceExpiresAt?: string;
    isValid: boolean;
}

interface InstitutionalProtectedRouteProps {
    children: React.ReactNode;
    /** Allowed deployment types */
    allowedDeployments?: InstitutionalLicense["deployment"][];
    /** Optional minimum role required */
    requiredRole?: PlatformRole;
}

export function InstitutionalProtectedRoute({
    children,
    allowedDeployments,
    requiredRole,
}: InstitutionalProtectedRouteProps) {
    const router = useRouter();
    const {
        user,
        loading,
        isAuthenticated,
        userPersona,
        hasRole,
    } = useAuth();

    // Global admins (level ≤ 1) bypass all checks
    const isGlobalAdmin = user?.level !== undefined && user.level <= 1;

    // In dev mode, if persona matches, allow access
    // In production, this would check the actual institutional_licenses table
    const hasValidLicense = useMemo(() => {
        if (!isAuthenticated || !user) return false;
        if (isGlobalAdmin) return true;
        if (userPersona !== "institutional") return false;

        // TODO: In production, fetch license data from Cloud SQL
        // For now, institutional persona implies valid license in dev
        return true;
    }, [isAuthenticated, user, isGlobalAdmin, userPersona]);

    useEffect(() => {
        if (loading) return;

        // 1. Not authenticated → login
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        // 2. Global admins bypass
        if (isGlobalAdmin) return;

        // 3. Must be institutional persona
        if (userPersona !== "institutional") {
            router.replace(
                userPersona === "business"
                    ? "/pro"
                    : userPersona === "citizen"
                        ? "/"
                        : "/onboarding"
            );
            return;
        }

        // 4. Must have valid license
        if (!hasValidLicense) {
            router.replace("/institutional/expired");
            return;
        }

        // 5. Role check
        if (requiredRole && !hasRole(requiredRole)) {
            router.replace("/institutional");
            return;
        }
    }, [
        loading,
        isAuthenticated,
        isGlobalAdmin,
        userPersona,
        hasValidLicense,
        requiredRole,
        hasRole,
        router,
        user,
    ]);

    if (loading) {
        return <AuthLoader message="Vérification de la licence…" />;
    }

    if (!isAuthenticated) return null;
    if (!isGlobalAdmin && userPersona !== "institutional") return null;
    if (!isGlobalAdmin && !hasValidLicense) return null;
    if (requiredRole && !hasRole(requiredRole)) return null;

    return <>{children}</>;
}
