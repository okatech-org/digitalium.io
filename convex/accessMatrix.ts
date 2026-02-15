// ═══════════════════════════════════════════════
// ACCESS MATRIX — Matrice d'Accès CRUD
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * List all access matrix entries for an organization.
 */
export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("access_matrix")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

/**
 * Toggle an access entry. If it exists, flip the granted flag.
 * If it doesn't exist, create it as granted=true.
 */
export const toggle = mutation({
    args: {
        organizationId: v.id("organizations"),
        accessKey: v.string(),
        roleKey: v.string(),
    },
    handler: async (ctx, args) => {
        // Find existing entry
        const existing = await ctx.db
            .query("access_matrix")
            .withIndex("by_org_key", (q) =>
                q.eq("organizationId", args.organizationId).eq("accessKey", args.accessKey)
            )
            .filter((q) => q.eq(q.field("roleKey"), args.roleKey))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { granted: !existing.granted });
            return { action: "toggled", granted: !existing.granted };
        } else {
            await ctx.db.insert("access_matrix", {
                organizationId: args.organizationId,
                accessKey: args.accessKey,
                roleKey: args.roleKey,
                granted: true,
            });
            return { action: "created", granted: true };
        }
    },
});

/**
 * Bulk set: overwrite the whole matrix for an org (used for initial setup).
 */
export const bulkSet = mutation({
    args: {
        organizationId: v.id("organizations"),
        entries: v.array(v.object({
            accessKey: v.string(),
            roleKey: v.string(),
            granted: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        // Delete all existing entries for this org
        const existing = await ctx.db
            .query("access_matrix")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        for (const entry of existing) {
            await ctx.db.delete(entry._id);
        }
        // Insert all new entries
        for (const entry of args.entries) {
            await ctx.db.insert("access_matrix", {
                organizationId: args.organizationId,
                ...entry,
            });
        }
        return { count: args.entries.length };
    },
});
