import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: iAsted Configurations
// Conversations Assistant IA
// ═══════════════════════════════════════════════

export const listConversations = query({
    args: {
        userId: v.string(),
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        let convs;
        if (args.organizationId) {
            convs = await ctx.db
                .query("iasted_conversations")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .filter((q) => q.eq(q.field("userId"), args.userId))
                .order("desc")
                .collect();
        } else {
            convs = await ctx.db
                .query("iasted_conversations")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .order("desc")
                .collect();
        }
        return convs;
    },
});

export const getConversation = query({
    args: { id: v.id("iasted_conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const addMessage = mutation({
    args: {
        id: v.optional(v.id("iasted_conversations")),
        userId: v.string(),
        organizationId: v.optional(v.id("organizations")),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        title: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const newMessage = {
            role: args.role,
            content: args.content,
            timestamp: now,
        };

        if (args.id) {
            const conv = await ctx.db.get(args.id);
            if (!conv) throw new Error("Conversation non trouvée");

            const messages = [...conv.messages, newMessage];
            await ctx.db.patch(args.id, {
                messages,
                updatedAt: now,
            });
            return args.id;
        } else {
            const newId = await ctx.db.insert("iasted_conversations", {
                userId: args.userId,
                organizationId: args.organizationId,
                title: args.title || "Nouvelle conversation",
                messages: [newMessage],
                createdAt: now,
                updatedAt: now,
            });
            return newId;
        }
    },
});

export const deleteConversation = mutation({
    args: { id: v.id("iasted_conversations") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
