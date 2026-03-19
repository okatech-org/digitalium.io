// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Folders (iDocument — Dossiers)
// CRUD complet pour les dossiers iDocument
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ─────────────────────────────────────

export const listByOrg = query({
    args: {
        organizationId: v.id("organizations"),
        parentFolderId: v.optional(v.id("folders")),
    },
    handler: async (ctx, args) => {
        const q = ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"));

        const folders = await q.collect();

        if (args.parentFolderId !== undefined) {
            return folders.filter((f) => f.parentFolderId === args.parentFolderId);
        }
        return folders;
    },
});

export const getById = query({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ─── Mutations ───────────────────────────────────

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.id("organizations"),
        createdBy: v.string(),
        parentFolderId: v.optional(v.id("folders")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("folders", {
            name: args.name,
            description: args.description ?? "",
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            parentFolderId: args.parentFolderId,
            tags: args.tags ?? [],
            permissions: {
                visibility: "team",
                sharedWith: [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("folders"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        archiveSchedule: v.optional(v.object({
            scheduledDate: v.number(),
            targetCategory: v.string(),
            autoArchive: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const cleaned = Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "trashed",
            updatedAt: Date.now(),
        });
    },
});

export const setArchiveSchedule = mutation({
    args: {
        id: v.id("folders"),
        scheduledDate: v.number(),
        targetCategory: v.string(),
        autoArchive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            archiveSchedule: {
                scheduledDate: args.scheduledDate,
                targetCategory: args.targetCategory,
                autoArchive: args.autoArchive,
            },
            updatedAt: Date.now(),
        });
    },
});

// ─── Import helpers ──────────────────────────────

export const getOrCreateByName = mutation({
    args: {
        name: v.string(),
        organizationId: v.id("organizations"),
        createdBy: v.string(),
        parentFolderId: v.optional(v.id("folders")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        // Try to find existing folder with the same name in the same org + parent
        const existing = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) =>
                q.and(
                    q.eq(q.field("name"), args.name),
                    q.eq(q.field("status"), "active"),
                    args.parentFolderId
                        ? q.eq(q.field("parentFolderId"), args.parentFolderId)
                        : q.eq(q.field("parentFolderId"), undefined)
                )
            )
            .first();

        if (existing) {
            return { id: existing._id, created: false };
        }

        // Create new folder
        const now = Date.now();
        const id = await ctx.db.insert("folders", {
            name: args.name,
            description: "",
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            parentFolderId: args.parentFolderId,
            tags: args.tags ?? [],
            permissions: {
                visibility: "team",
                sharedWith: [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id, created: true };
    },
});

export const listByOrgFlat = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();
    },
});

/**
 * getTreeWithPaths — Returns all active folders with full path strings.
 * Used by AI classification to understand the existing folder hierarchy.
 * Example output: { id: "abc123", name: "SGG", path: "Contrats Clients > SGG", depth: 1 }
 */
export const getTreeWithPaths = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const folders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Build a map for quick parent lookup
        const folderMap = new Map(folders.map((f) => [f._id.toString(), f]));

        // Build full path for each folder
        const buildPath = (folderId: string): string => {
            const folder = folderMap.get(folderId);
            if (!folder) return "";
            if (!folder.parentFolderId) return folder.name;
            const parentPath = buildPath(folder.parentFolderId.toString());
            return parentPath ? `${parentPath} > ${folder.name}` : folder.name;
        };

        const getDepth = (folderId: string): number => {
            const folder = folderMap.get(folderId);
            if (!folder || !folder.parentFolderId) return 0;
            return 1 + getDepth(folder.parentFolderId.toString());
        };

        return folders.map((f) => ({
            id: f._id,
            name: f.name,
            path: buildPath(f._id.toString()),
            depth: getDepth(f._id.toString()),
            parentFolderId: f.parentFolderId ?? null,
            tags: f.tags ?? [],
            description: f.description ?? "",
        }));
    },
});
