// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Authentication & RBAC
// Simplified: 4 platform roles + estAdmin flag
// ═══════════════════════════════════════════════

/* ───────────────────────────────────────────────
   RBAC Roles (simplifié)
   ─────────────────────────────────────────────── */

/**
 * Platform roles (simplifié).
 * Le level numérique est désormais dérivé de la catégorie du rôle métier.
 *
 * | Level | Role            | Scope           |
 * |-------|-----------------|-----------------|
 * | 0     | system_admin    | Infrastructure  |
 * | 1     | platform_admin  | Plateforme      |
 * | 2     | admin           | Organisation    |
 * | 3-5   | membre          | Collaborateur   |
 */
export type PlatformRole =
    | "system_admin"
    | "platform_admin"
    | "admin"
    | "membre";

/**
 * @deprecated Use `PlatformRole` instead. Kept for backwards compatibility.
 */
export type AdminRole = PlatformRole;

/* ───────────────────────────────────────────────
   Role metadata
   ─────────────────────────────────────────────── */

/** Information about one role assignment for a user. */
export interface UserRoleInfo {
    role: PlatformRole;
    level: number;
    organizationId?: string;
    organizationName?: string;
}

/* ───────────────────────────────────────────────
   Organization
   ─────────────────────────────────────────────── */

export type OrganizationType = "enterprise" | "institution" | "government" | "organism";

export interface Organization {
    id: string;
    name: string;
    type: OrganizationType;
    slug: string;
    logoURL?: string;
    plan: "starter" | "professional" | "enterprise" | "custom";
    maxUsers: number;
    createdAt: Date;
}

/* ───────────────────────────────────────────────
   Authenticated User
   ─────────────────────────────────────────────── */

/** Full user profile after authentication + RBAC resolution. */
export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;

    // ── Primary role (highest privilege across all orgs)
    role: PlatformRole;
    level: number;

    // ── Convenience booleans
    isAdmin: boolean;           // estAdmin === true OR level ≤ 2
    isSystemAdmin: boolean;     // level === 0
    isPlatformAdmin: boolean;   // level === 1

    // ── Multi-org support
    roles: UserRoleInfo[];
    organizations: Organization[];

    // ── Persona type for landing routing
    personaType?: PersonaType;
}

/**
 * @deprecated Use `AuthUser` instead. Kept for backwards compatibility
 * with FirebaseAuthContext consumers.
 */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
    adminRole?: PlatformRole;
    personaType?: PersonaType;
    organizationId?: string;
    createdAt: Date;
    updatedAt: Date;
}

/* ───────────────────────────────────────────────
   Auth State
   ─────────────────────────────────────────────── */

export interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
}

/* ───────────────────────────────────────────────
   Permissions (granular capability flags)
   ─────────────────────────────────────────────── */

export interface AdminPermissions {
    canManageUsers: boolean;
    canManageOrganizations: boolean;
    canManageSystem: boolean;
    canViewAnalytics: boolean;
    canManageBilling: boolean;
    canEditContent: boolean;
    // ── Organisation v2 permissions
    canManageOrgStructure: boolean;
    canManageFilingStructure: boolean;
    canManageModuleConfig: boolean;
}

/* ───────────────────────────────────────────────
   Persona type (used for routing & landing)
   ─────────────────────────────────────────────── */

export type PersonaType = "citizen" | "business" | "institutional";

/* ───────────────────────────────────────────────
   Route-level access control
   ─────────────────────────────────────────────── */

export type ProtectedRoute =
    | "/admin"
    | "/sysadmin"
    | "/subadmin"
    | "/pro"
    | "/inst";

export interface RouteAccessConfig {
    path: ProtectedRoute;
    allowedLevels: number[];
    label: string;
}
