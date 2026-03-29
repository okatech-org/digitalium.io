import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";

export const getOrgData = internalQuery({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        const archives = await ctx.db
            .query("archives")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        const folders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        const categories = await ctx.db
            .query("archive_categories")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        return { documents, archives, folders, categories };
    },
});

export const getActiveOrgs = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("organizations")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();
    },
});

// Public query for frontend compliance dashboard
export const getLatestReport = query({
    args: {
        organizationId: v.id("organizations"),
        type: v.optional(v.union(v.literal("audit"), v.literal("forecast"))),
    },
    handler: async (ctx, args) => {
        const reports = await ctx.db
            .query("compliance_reports")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .take(10);

        if (args.type) {
            return reports.find((r) => r.type === args.type) ?? null;
        }
        return reports[0] ?? null;
    },
});

export const getReportHistory = query({
    args: {
        organizationId: v.id("organizations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("compliance_reports")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .take(args.limit ?? 20);
    },
});
