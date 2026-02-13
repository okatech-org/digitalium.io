import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const migrateUser = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        displayName: v.string(),
        avatarUrl: v.optional(v.string()),
        personaType: v.optional(v.union(v.literal("citizen"), v.literal("business"), v.literal("institutional"))),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        const now = Date.now();
        const data = {
            ...args,
            onboardingCompleted: true,
            updatedAt: now,
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        }

        return await ctx.db.insert("users", {
            ...data,
            createdAt: now,
        });
    },
});

export const getByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});
