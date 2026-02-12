"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — PersonaProtectedRoute Guard
// Guards routes by persona type + optional subscription check
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { PlatformRole, PersonaType } from "@/types/auth";
import { AuthLoader } from "./AuthLoader";

interface PersonaProtectedRouteProps {
    children: React.ReactNode;
    /** List of allowed persona types */
    allowedPersonas: PersonaType[];
    /** Optional minimum role required */
    requiredRole?: PlatformRole;
    /** Require an active subscription (business only) */
    requireSubscription?: boolean;
}

/** Get redirect path for a persona type */
function getPersonaRedirect(persona: PersonaType | null | undefined): string {
    switch (persona) {
        case "citizen":
            return "/";
        case "business":
            return "/pro";
        case "institutional":
            return "/institutional";
        default:
            return "/onboarding";
    }
}

export function PersonaProtectedRoute({
    children,
    allowedPersonas,
    requiredRole,
    requireSubscription = false,
}: PersonaProtectedRouteProps) {
    const router = useRouter();
    const {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        userPersona,
        hasRole,
    } = useAuth();

    // Global admins (level ≤ 1) bypass persona checks
    const isGlobalAdmin = user?.level !== undefined && user.level <= 1;

    const isAllowed = useMemo(() => {
        if (!isAuthenticated || !user) return false;

        // Global admins bypass all persona checks
        if (isGlobalAdmin) return true;

        // Persona must be in allowedPersonas
        if (!userPersona || !allowedPersonas.includes(userPersona)) {
            return false;
        }

        // Role check
        if (requiredRole && !hasRole(requiredRole)) {
            return false;
        }

        return true;
    }, [
        isAuthenticated,
        user,
        isGlobalAdmin,
        userPersona,
        allowedPersonas,
        requiredRole,
        hasRole,
    ]);

    useEffect(() => {
        if (loading) return;

        // 1. Not authenticated → login
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        // 2. Global admins bypass
        if (isGlobalAdmin) return;

        // 3. Wrong persona → redirect to their correct space
        if (!userPersona || !allowedPersonas.includes(userPersona)) {
            router.replace(getPersonaRedirect(userPersona));
            return;
        }

        // 4. Subscription check for business
        if (
            requireSubscription &&
            userPersona === "business" &&
            user?.organizations?.length === 0
        ) {
            router.replace("/pro/billing");
            return;
        }

        // 5. Role check
        if (requiredRole && !hasRole(requiredRole)) {
            router.replace(getPersonaRedirect(userPersona));
            return;
        }
    }, [
        loading,
        isAuthenticated,
        isGlobalAdmin,
        userPersona,
        allowedPersonas,
        requireSubscription,
        requiredRole,
        hasRole,
        router,
        user,
    ]);

    if (loading) {
        return <AuthLoader message="Vérification du persona…" />;
    }

    if (!isAllowed) return null;

    return <>{children}</>;
}
