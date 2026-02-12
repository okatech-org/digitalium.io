import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Audit Logs
// ═══════════════════════════════════════════════

export const logAction = mutation({
    args: {
        organizationId: v.optional(v.id("organizations")),
        userId: v.string(),
        action: v.string(),
        resourceType: v.union(
            v.literal("document"),
            v.literal("archive"),
            v.literal("signature"),
            v.literal("organization"),
            v.literal("user")
        ),
        resourceId: v.string(),
        details: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        return ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.userId,
            action: args.action,
            resourceType: args.resourceType,
            resourceId: args.resourceId,
            details: args.details,
            createdAt: Date.now(),
        });
    },
});

export const listByResource = query({
    args: {
        resourceType: v.union(
            v.literal("document"),
            v.literal("archive"),
            v.literal("signature"),
            v.literal("organization"),
            v.literal("user")
        ),
        resourceId: v.string(),
    },
    handler: async (ctx, args) => {
        return ctx.db
            .query("audit_logs")
            .withIndex("by_resourceType", (q) =>
                q
                    .eq("resourceType", args.resourceType)
                    .eq("resourceId", args.resourceId)
            )
            .order("desc")
            .collect();
    },
});

export const listByOrganization = query({
    args: {
        organizationId: v.id("organizations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const q = ctx.db
            .query("audit_logs")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .order("desc");

        if (args.limit) {
            return q.take(args.limit);
        }
        return q.collect();
    },
});
