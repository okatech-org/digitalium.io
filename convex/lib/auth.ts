// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Auth Helpers
// Server-side identity verification for mutations
// Keeps demo mode working while adding guardrails
// ═══════════════════════════════════════════════

import { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Verify that a callerUserId exists in the `users` table.
 * In demo mode, this validates the userId isn't fabricated.
 * In production, this would use ctx.auth.getUserIdentity().
 *
 * @throws ConvexError if the userId doesn't exist
 */
export async function requireAuth(
    ctx: MutationCtx | QueryCtx,
    callerUserId: string
): Promise<{
    userId: Id<"users">;
    email: string;
    personaType: string;
}> {
    // In production: const identity = await ctx.auth.getUserIdentity();
    // For now (demo mode), we validate the userId exists in the users table

    // Try to find user by email (callerUserId is typically the user's email in demo mode)
    const users = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), callerUserId))
        .collect();

    if (users.length > 0) {
        const user = users[0];
        return {
            userId: user._id,
            email: user.email,
            personaType: user.personaType ?? "business",
        };
    }

    // Try by _id if it's a valid Convex ID
    try {
        const user = await ctx.db.get(callerUserId as Id<"users">);
        if (user) {
            return {
                userId: user._id,
                email: user.email,
                personaType: user.personaType ?? "business",
            };
        }
    } catch {
        // callerUserId is not a valid Convex ID — that's fine
    }

    throw new Error(
        `[AUTH] Utilisateur non authentifié ou inconnu: ${callerUserId.slice(0, 20)}…`
    );
}

/**
 * Verify that the caller is a member of the specified organization.
 * Checks the `organization_members` table for a matching record.
 */
export async function requireOrgMember(
    ctx: MutationCtx | QueryCtx,
    callerUserId: string,
    organizationId: Id<"organizations">
): Promise<{
    userId: Id<"users">;
    email: string;
    personaType: string;
    orgRole: string;
}> {
    const auth = await requireAuth(ctx, callerUserId);

    // Check membership
    const membership = await ctx.db
        .query("organization_members")
        .filter((q) =>
            q.and(
                q.eq(q.field("organizationId"), organizationId),
                q.eq(q.field("email"), auth.email)
            )
        )
        .first();

    if (!membership) {
        // In demo mode, check if email matches known admin patterns
        const adminEmails = ["demo-sysadmin@digitalium.ga", "demo-admin@digitalium.ga"];
        if (adminEmails.includes(auth.email.toLowerCase())) {
            return { ...auth, orgRole: "admin" };
        }
        throw new Error(
            `[AUTH] L'utilisateur ${auth.email} n'est pas membre de cette organisation`
        );
    }

    return {
        ...auth,
        orgRole: membership.role ?? "member",
    };
}

/**
 * Optional auth check — returns null instead of throwing if user is not found.
 * Useful for queries that should work for anonymous users but provide enhanced
 * results for authenticated users.
 */
export async function optionalAuth(
    ctx: QueryCtx,
    callerUserId?: string
): Promise<{
    userId: Id<"users">;
    email: string;
    personaType: string;
} | null> {
    if (!callerUserId) return null;
    try {
        return await requireAuth(ctx, callerUserId);
    } catch {
        return null;
    }
}
