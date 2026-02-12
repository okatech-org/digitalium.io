// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useRBAC
// Enriched RBAC with level-based methods + PermissionSet
// ═══════════════════════════════════════════════

"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import type { AdminPermissions, PlatformRole } from "@/types/auth";
import type { PermissionSet } from "@/types/personas";
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from "@/config/rbac";

export function useRBAC() {
    const { user, isAdmin, role, level, hasRole } = useAuth();

    // ── Granular permission check (config-based) ──
    const checkPermission = useCallback(
        (permission: keyof AdminPermissions): boolean => {
            if (!role) return false;
            return hasPermission(role, permission);
        },
        [role]
    );

    // ── Level-based convenience methods (as requested) ──

    /** Can manage users: level ≤ 3 (org_admin, platform_admin, system_admin, org_manager) */
    const canManageUsers = useCallback((): boolean => {
        if (level === null || level === undefined) return false;
        return level <= 3;
    }, [level]);

    /** Can edit documents: level ≤ 4 (all except org_viewer) */
    const canEditDocuments = useCallback((): boolean => {
        if (level === null || level === undefined) return false;
        return level <= 4;
    }, [level]);

    /** View-only: level === 5 (org_viewer) */
    const canViewOnly = useCallback((): boolean => {
        return level === 5;
    }, [level]);

    // ── Full permission set ──
    const getPermissions = useCallback((): PermissionSet => {
        const userLevel = level ?? 6; // 6 = no access fallback

        return {
            // Administrative
            canManageSystem: userLevel <= 1,
            canManageOrganizations: userLevel <= 1,
            canManageUsers: userLevel <= 3,
            canManageBilling: userLevel <= 2,

            // Content
            canEditDocuments: userLevel <= 4,
            canViewDocuments: userLevel <= 5,
            canEditContent: userLevel <= 4,

            // Analytics
            canViewAnalytics: userLevel <= 3,

            // Derived
            isAdmin: userLevel <= 2,
            isViewOnly: userLevel === 5,
        };
    }, [level]);

    // ── Role display info ──
    const roleLabel = role ? ROLE_LABELS[role] : null;
    const roleColor = role ? ROLE_COLORS[role] : null;

    return useMemo(
        () => ({
            // ── Role info ──
            role,
            level,
            roleLabel,
            roleColor,
            isAdmin,

            // ── Legacy ──
            adminRole: role as PlatformRole | undefined,

            // ── Config-based permission checks ──
            checkPermission,
            hasRole,

            // ── Level-based convenience (P11 requested) ──
            canManageUsers: canManageUsers(),
            canEditDocuments: canEditDocuments(),
            canViewOnly: canViewOnly(),
            getPermissions,

            // ── Config-based convenience (existing) ──
            canManageOrganizations: checkPermission("canManageOrganizations"),
            canManageSystem: checkPermission("canManageSystem"),
            canViewAnalytics: checkPermission("canViewAnalytics"),
            canManageBilling: checkPermission("canManageBilling"),
            canEditContent: checkPermission("canEditContent"),

            // ── User RBAC data ──
            roles: user?.roles ?? [],
            organizations: user?.organizations ?? [],
        }),
        [
            role,
            level,
            roleLabel,
            roleColor,
            isAdmin,
            checkPermission,
            hasRole,
            canManageUsers,
            canEditDocuments,
            canViewOnly,
            getPermissions,
            user,
        ]
    );
}
