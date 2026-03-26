// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: User Preferences
// CRUD for persisting settings page preferences
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get user preferences by Firebase UID.
 */
export const getByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("user_preferences")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});

/**
 * Upsert user preferences — create or update.
 */
export const save = mutation({
    args: {
        userId: v.string(),
        prenom: v.optional(v.string()),
        nom: v.optional(v.string()),
        telephone: v.optional(v.string()),
        bio: v.optional(v.string()),
        theme: v.optional(v.string()),
        densite: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        borderRadius: v.optional(v.string()),
        brandName: v.optional(v.string()),
        brandColors: v.optional(v.any()),
        langue: v.optional(v.string()),
        notifications: v.optional(v.any()),
        tailleTexte: v.optional(v.string()),
        contrasteEleve: v.optional(v.boolean()),
        animationsReduites: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { userId, ...prefs } = args;
        const now = Date.now();

        const existing = await ctx.db
            .query("user_preferences")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...prefs,
                updatedAt: now,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("user_preferences", {
                userId,
                ...prefs,
                updatedAt: now,
            });
        }
    },
});
