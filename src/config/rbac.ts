// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: RBAC (simplifié)
// Centralised role-based access control constants
// ═══════════════════════════════════════════════

import type {
    PlatformRole,
    AdminPermissions,
    ProtectedRoute,
    RouteAccessConfig,
} from "@/types/auth";

// Re-export for consumers that import AdminRole from here
export type { PlatformRole, AdminPermissions };

/* ───────────────────────────────────────────────
   Role → Level mapping
   ─────────────────────────────────────────────── */

export const ROLE_LEVELS: Record<PlatformRole, number> = {
    system_admin: 0,
    platform_admin: 1,
    admin: 2,
    membre: 4,
} as const;

/* ───────────────────────────────────────────────
   Level → Role reverse lookup
   ─────────────────────────────────────────────── */

export const LEVEL_TO_ROLE: Record<number, PlatformRole> = {
    0: "system_admin",
    1: "platform_admin",
    2: "admin",
    3: "membre",
    4: "membre",
    5: "membre",
} as const;

/* ───────────────────────────────────────────────
   Admin roles (isAdmin = true → level ≤ 2)
   ─────────────────────────────────────────────── */

export const ADMIN_ROLES: PlatformRole[] = [
    "system_admin",
    "platform_admin",
    "admin",
] as const;

export const ALL_ROLES: PlatformRole[] = [
    "system_admin",
    "platform_admin",
    "admin",
    "membre",
] as const;

/* ───────────────────────────────────────────────
   Human-readable labels (FR)
   ─────────────────────────────────────────────── */

export const ROLE_LABELS: Record<PlatformRole, string> = {
    system_admin: "Administrateur Système",
    platform_admin: "Administrateur Plateforme",
    admin: "Administrateur Organisation",
    membre: "Membre",
} as const;

export const ROLE_DESCRIPTIONS: Record<PlatformRole, string> = {
    system_admin: "Accès total à l'infrastructure et à la plateforme",
    platform_admin: "Administration de la plateforme, organisations et utilisateurs",
    admin: "Administration complète d'une organisation",
    membre: "Collaborateur — accès déterminé par le rôle métier",
} as const;

/* ───────────────────────────────────────────────
   Role color indicators
   ─────────────────────────────────────────────── */

export const ROLE_COLORS: Record<PlatformRole, string> = {
    system_admin: "#EF4444",   // red
    platform_admin: "#F97316", // orange
    admin: "#8B5CF6",          // violet
    membre: "#10B981",         // emerald
} as const;

/* ───────────────────────────────────────────────
   Granular permissions per role
   ─────────────────────────────────────────────── */

export const ROLE_PERMISSIONS: Record<PlatformRole, AdminPermissions> = {
    system_admin: {
        canManageUsers: true,
        canManageOrganizations: true,
        canManageSystem: true,
        canViewAnalytics: true,
        canManageBilling: true,
        canEditContent: true,
        canManageOrgStructure: true,
        canManageFilingStructure: true,
        canManageModuleConfig: true,
    },
    platform_admin: {
        canManageUsers: true,
        canManageOrganizations: true,
        canManageSystem: false,
        canViewAnalytics: true,
        canManageBilling: true,
        canEditContent: true,
        canManageOrgStructure: true,
        canManageFilingStructure: true,
        canManageModuleConfig: true,
    },
    admin: {
        canManageUsers: true,
        canManageOrganizations: false,
        canManageSystem: false,
        canViewAnalytics: true,
        canManageBilling: true,
        canEditContent: true,
        canManageOrgStructure: true,
        canManageFilingStructure: true,
        canManageModuleConfig: true,
    },
    membre: {
        canManageUsers: false,
        canManageOrganizations: false,
        canManageSystem: false,
        canViewAnalytics: false,
        canManageBilling: false,
        canEditContent: true,
        canManageOrgStructure: false,
        canManageFilingStructure: false,
        canManageModuleConfig: false,
    },
} as const;

/* ───────────────────────────────────────────────
   Route access control
   ─────────────────────────────────────────────── */

export const ROUTE_ACCESS: Record<ProtectedRoute, RouteAccessConfig> = {
    "/admin": {
        path: "/admin",
        allowedLevels: [0, 1],
        label: "Administration Globale",
    },
    "/sysadmin": {
        path: "/sysadmin",
        allowedLevels: [0, 1],
        label: "Administration Système",
    },
    "/subadmin": {
        path: "/subadmin",
        allowedLevels: [0, 1, 2],
        label: "Sous-Administration",
    },
    "/pro": {
        path: "/pro",
        allowedLevels: [2, 3, 4, 5],
        label: "Espace Entreprise",
    },
    "/inst": {
        path: "/inst",
        allowedLevels: [2, 3, 4, 5],
        label: "Espace Institutionnel",
    },
} as const;

/* ───────────────────────────────────────────────
   Helper functions
   ─────────────────────────────────────────────── */

/**
 * Check whether a user at `userLevel` is authorised for `requiredRole`.
 *
 * - Levels 0-1 (global admins) → access everywhere.
 * - Otherwise compare levels; if org-scoped, `organizationId` must match.
 */
export function hasRole(
    userLevel: number,
    requiredRole: PlatformRole,
    organizationId?: string,
    userOrgId?: string
): boolean {
    // Global admins bypass all checks
    if (userLevel <= 1) return true;

    const requiredLevel = ROLE_LEVELS[requiredRole];

    // User must have equal or higher privilege (lower number)
    if (userLevel > requiredLevel) return false;

    // Org-scoped check: if the route/resource requires a specific org,
    // the user must belong to that org (unless they're global admins — handled above)
    if (organizationId && userOrgId && organizationId !== userOrgId) {
        return false;
    }

    return true;
}

/**
 * Check if a user level grants admin privileges (level ≤ 2).
 */
export function isAdmin(level: number): boolean {
    return level <= 2;
}

/**
 * Check whether `role` has a specific granular permission.
 */
export function hasPermission(
    role: PlatformRole,
    permission: keyof AdminPermissions
): boolean {
    return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Check if `roleA` outranks `roleB` (lower level = higher privilege).
 */
export function isRoleAbove(
    roleA: PlatformRole,
    roleB: PlatformRole
): boolean {
    return ROLE_LEVELS[roleA] < ROLE_LEVELS[roleB];
}

/**
 * Check if a user level is authorised for a given protected route.
 */
export function canAccessRoute(
    userLevel: number,
    route: ProtectedRoute
): boolean {
    const config = ROUTE_ACCESS[route];
    if (!config) return false;
    return config.allowedLevels.includes(userLevel);
}

/**
 * Return the appropriate admin route for a given role.
 */
export function getAdminRoute(role: PlatformRole): string {
    const level = ROLE_LEVELS[role];
    if (level === 0) return "/sysadmin";
    if (level === 1) return "/admin";
    if (level === 2) return "/subadmin";
    return "/pro";
}
