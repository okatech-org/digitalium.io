// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation G: Import Progress Tracking
// Mutations for tracking progressive import status
// ═══════════════════════════════════════════════════════════════

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const updateProgress = internalMutation({
    args: {
        sessionId: v.string(),
        organizationId: v.id("organizations"),
        totalFiles: v.optional(v.number()),
        processedFiles: v.optional(v.number()),
        currentFileName: v.optional(v.string()),
        result: v.optional(v.object({
            fileName: v.string(),
            status: v.union(v.literal("pending"), v.literal("processing"), v.literal("done"), v.literal("error")),
            suggestedFolderId: v.optional(v.string()),
            suggestedFolderName: v.optional(v.string()),
            suggestedTags: v.optional(v.array(v.string())),
            confidence: v.optional(v.number()),
            reasoning: v.optional(v.string()),
            error: v.optional(v.string()),
        })),
        finalStatus: v.optional(v.union(v.literal("running"), v.literal("completed"), v.literal("error"))),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const existing = await ctx.db
            .query("import_progress")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();

        if (existing) {
            const updates: Record<string, unknown> = { updatedAt: now };
            if (args.processedFiles !== undefined) updates.processedFiles = args.processedFiles;
            if (args.currentFileName !== undefined) updates.currentFileName = args.currentFileName;
            if (args.finalStatus) updates.status = args.finalStatus;
            if (args.result) {
                const results = [...existing.results];
                const idx = results.findIndex((r) => r.fileName === args.result!.fileName);
                if (idx >= 0) results[idx] = args.result;
                else results.push(args.result);
                updates.results = results;
            }
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("import_progress", {
                sessionId: args.sessionId,
                organizationId: args.organizationId,
                totalFiles: args.totalFiles ?? 0,
                processedFiles: args.processedFiles ?? 0,
                currentFileName: args.currentFileName,
                results: args.result ? [args.result] : [],
                status: "running",
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

export const getProgress = query({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("import_progress")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .first();
    },
});
