// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Lib: Admin Service
// Opérations d'administration via Convex
//
// Usage dans un composant React:
//   const update = useMutation(api.orgMembers.update);
//   const list = useQuery(api.orgMembers.list, { organizationId });
//
// Ce service fournit des helpers pour les contextes non-React
// et des types réutilisables.
// ═══════════════════════════════════════════════

import type { AdminRole } from "@/types/auth";

// ─── Types ──────────────────────────────────────

export interface AdminUser {
    uid: string;
    email?: string;
    displayName?: string;
    role: AdminRole;
    isAdmin: boolean;
    joinedAt?: number;
}

export interface InvitePayload {
    email: string;
    role: AdminRole;
    organizationId: string;
    invitedBy: string;
}

// ─── Role Display Helpers ───────────────────────

export const ADMIN_ROLE_LABELS: Record<string, string> = {
    system_admin: "Administrateur Système",
    platform_admin: "Administrateur Plateforme",
    org_admin: "Administrateur Organisation",
    org_manager: "Gestionnaire",
    org_member: "Membre",
    admin: "Administrateur",
    membre: "Membre",
    viewer: "Lecteur",
};

export const ADMIN_ROLE_COLORS: Record<string, string> = {
    system_admin: "text-red-400 bg-red-500/10",
    platform_admin: "text-orange-400 bg-orange-500/10",
    org_admin: "text-blue-400 bg-blue-500/10",
    org_manager: "text-emerald-400 bg-emerald-500/10",
    org_member: "text-zinc-400 bg-zinc-500/10",
    admin: "text-blue-400 bg-blue-500/10",
    membre: "text-zinc-400 bg-zinc-500/10",
    viewer: "text-zinc-500 bg-zinc-500/5",
};

// ─── Validation ─────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
    system_admin: 0,
    platform_admin: 1,
    org_admin: 2,
    admin: 2,
    org_manager: 3,
    org_member: 4,
    membre: 4,
    viewer: 5,
};

/**
 * Check if the actor's role can manage the target role.
 * A user can only manage roles at a lower level than their own.
 */
export function canManageRole(actorRole: AdminRole, targetRole: AdminRole): boolean {
    const actorLevel = ROLE_HIERARCHY[actorRole] ?? 5;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 5;
    return actorLevel < targetLevel;
}

/**
 * Get a list of roles that the given role can assign.
 */
export function getAssignableRoles(actorRole: AdminRole): { role: AdminRole; label: string }[] {
    const actorLevel = ROLE_HIERARCHY[actorRole] ?? 5;
    return Object.entries(ROLE_HIERARCHY)
        .filter(([, level]) => level > actorLevel)
        .map(([role]) => ({
            role: role as AdminRole,
            label: ADMIN_ROLE_LABELS[role] ?? role,
        }));
}

/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Build invite arguments for the Convex mutation.
 *
 * Usage:
 *   const args = buildInviteArgs({ email, role, organizationId, invitedBy });
 *   await convexMutation(api.orgMembers.add, args);
 */
export function buildInviteArgs(payload: InvitePayload) {
    return {
        organizationId: payload.organizationId,
        userId: payload.email, // placeholder until Firebase UID is resolved
        email: payload.email,
        role: payload.role,
        level: ROLE_HIERARCHY[payload.role] ?? 4,
        status: "invited" as const,
        invitedBy: payload.invitedBy,
    };
}

/**
 * Build role update arguments for the Convex mutation.
 *
 * Usage:
 *   const args = buildRoleUpdateArgs(memberId, newRole);
 *   await convexMutation(api.orgMembers.update, args);
 */
export function buildRoleUpdateArgs(memberId: string, newRole: AdminRole) {
    return {
        id: memberId,
        role: newRole,
        level: ROLE_HIERARCHY[newRole] ?? 4,
        estAdmin: (ROLE_HIERARCHY[newRole] ?? 5) <= 2,
    };
}
