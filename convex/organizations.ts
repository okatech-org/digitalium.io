import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const migrateOrganization = mutation({
    args: {
        name: v.string(),
        type: v.union(v.literal("enterprise"), v.literal("institution"), v.literal("government")),
        ownerId: v.string(),
        logoUrl: v.optional(v.string()),
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // We search by ownerId + name as a proxy for org uniqueness
        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
            .filter((q) => q.eq(q.field("name"), args.name))
            .unique();

        const now = Date.now();
        const data = {
            ...args,
            quota: {
                maxUsers: 50,
                maxStorage: 10 * 1024 * 1024 * 1024, // 10GB
                modules: ["iDocument", "iArchive", "iSignature"],
            },
            settings: {
                locale: "fr-GA",
                currency: "XAF",
            },
            status: "active" as const,
            updatedAt: now,
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        }

        return await ctx.db.insert("organizations", {
            ...data,
            createdAt: now,
        });
    },
});
