// ═══════════════════════════════════════════════
// HABILITATIONS — Dérogations individuelles CRUD
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const habType = v.union(
    v.literal("accorde"),
    v.literal("retire"),
    v.literal("temporaire")
);

/**
 * List all habilitations for an organization.
 */
export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("habilitations")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .collect();
    },
});

/**
 * Add a new habilitation.
 */
export const add = mutation({
    args: {
        organizationId: v.id("organizations"),
        memberId: v.id("organization_members"),
        memberName: v.string(),
        accessLabel: v.string(),
        accessCellId: v.optional(v.string()),
        type: habType,
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("habilitations", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

/**
 * Remove a habilitation by ID.
 */
export const remove = mutation({
    args: { id: v.id("habilitations") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
