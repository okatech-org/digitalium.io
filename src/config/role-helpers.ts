// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Role Helpers
// Shared utilities for role-aware UI rendering
// Generic — no hardcoded org-specific data
// ═══════════════════════════════════════════════

import type { AuthUser } from "@/types/auth";
import { ROLE_LABELS } from "@/config/rbac";

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

/** Get user initials (2 chars) from displayName or email. */
export function getUserInitials(user: AuthUser | null): string {
    if (!user) return "??";
    if (user.displayName) {
        const parts = user.displayName.split(" ");
        return parts
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("");
    }
    return user.email?.slice(0, 2).toUpperCase() ?? "??";
}

/** Get a human-readable display name for the user. */
export function getUserDisplayName(user: AuthUser | null): string {
    if (!user) return "Utilisateur";
    if (user.displayName) return user.displayName;
    return user.email ?? "Utilisateur";
}

/** Get a short first-name style greeting name. */
export function getUserShortName(user: AuthUser | null): string {
    if (!user) return "Utilisateur";
    if (user.displayName) return user.displayName.split(" ")[0];
    return "Utilisateur";
}

/** Get the role label in French. */
export function getRoleLabel(user: AuthUser | null): string {
    if (!user) return "Inconnu";
    return ROLE_LABELS[user.role] ?? "Collaborateur";
}

/* ───────────────────────────────────────────────
   Permission helpers
   ─────────────────────────────────────────────── */

/** Can this user create or edit content? (level ≤ 4 — everyone except viewer) */
export function canCreateContent(level: number | null | undefined): boolean {
    if (level === null || level === undefined) return false;
    return level <= 4;
}

/** Can this user validate / approve? (level ≤ 3 — admin + managers) */
export function canValidate(level: number | null | undefined): boolean {
    if (level === null || level === undefined) return false;
    return level <= 3;
}

/** Can this user manage the team? (level ≤ 3 — admin + managers) */
export function canManageTeam(level: number | null | undefined): boolean {
    if (level === null || level === undefined) return false;
    return level <= 3;
}

/** Is this user read-only? (level === 5 — viewer) */
export function isReadOnly(level: number | null | undefined): boolean {
    return level === 5;
}
