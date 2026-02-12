// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Authentication & RBAC
// 6-level hierarchical role system
// ═══════════════════════════════════════════════

/* ───────────────────────────────────────────────
   RBAC Roles (6 niveaux)
   ─────────────────────────────────────────────── */

/**
 * Platform roles ordered by privilege level (0 = highest).
 *
 * | Level | Role            | Scope           |
 * |-------|-----------------|-----------------|
 * | 0     | system_admin    | Infrastructure  |
 * | 1     | platform_admin  | Plateforme      |
 * | 2     | org_admin       | Organisation    |
 * | 3     | org_manager     | Service/Dept    |
 * | 4     | org_member      | Collaborateur   |
 * | 5     | org_viewer      | Lecture seule   |
 */
export type PlatformRole =
    | "system_admin"
    | "platform_admin"
    | "org_admin"
    | "org_manager"
    | "org_member"
    | "org_viewer";

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

export type OrganizationType = "enterprise" | "institution" | "government";

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
    isAdmin: boolean;           // level ≤ 2
    isSystemAdmin: boolean;     // level === 0
    isPlatformAdmin: boolean;   // level === 1
    isOrgAdmin: boolean;        // level === 2
    isManager: boolean;         // level === 3

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
    | "/institutional";

export interface RouteAccessConfig {
    path: ProtectedRoute;
    allowedLevels: number[];
    label: string;
}
