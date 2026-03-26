// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Data Rooms
// Secure client-facing document rooms
// Built on top of folders + permissions
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/* ─── Queries ────────────────────────────────── */

/**
 * List all data rooms for an organization.
 * A data room is a folder with tag "data-room".
 */
export const listByOrg = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const folders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        return folders.filter(
            (f) => f.tags?.includes("data-room") && f.status !== "trashed"
        );
    },
});

/**
 * List data rooms shared with a specific client (by email).
 */
export const listByClient = query({
    args: {
        organizationId: v.id("organizations"),
        clientEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const folders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        return folders.filter(
            (f) =>
                f.tags?.includes("data-room") &&
                f.tags?.includes(`client:${args.clientEmail}`) &&
                f.status !== "trashed"
        );
    },
});

/**
 * Get documents inside a data room.
 */
export const getRoomDocuments = query({
    args: {
        folderId: v.id("folders"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("documents")
            .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
            .collect();
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Create a data room (special tagged folder).
 */
export const createDataRoom = mutation({
    args: {
        organizationId: v.id("organizations"),
        name: v.string(),
        description: v.optional(v.string()),
        clientEmail: v.optional(v.string()),
        createdBy: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const tags = ["data-room"];
        if (args.clientEmail) {
            tags.push(`client:${args.clientEmail}`);
        }

        const folderId = await ctx.db.insert("folders", {
            name: args.name,
            description: args.description,
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            tags,
            permissions: {
                visibility: "shared",
                sharedWith: args.clientEmail ? [args.clientEmail] : [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.createdBy,
            action: "dataroom.created",
            resourceType: "folder",
            resourceId: folderId,
            details: {
                name: args.name,
                clientEmail: args.clientEmail,
            },
            createdAt: now,
        });

        return folderId;
    },
});

/**
 * Add a document to a data room.
 */
export const addDocumentToRoom = mutation({
    args: {
        documentId: v.id("documents"),
        folderId: v.id("folders"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const folder = await ctx.db.get(args.folderId);
        if (!folder || !folder.tags?.includes("data-room")) {
            throw new Error("Ce dossier n'est pas une data room");
        }

        await ctx.db.patch(args.documentId, {
            folderId: args.folderId,
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: folder.organizationId,
            userId: args.userId,
            action: "dataroom.document_added",
            resourceType: "document",
            resourceId: args.documentId,
            details: {
                dataRoomId: args.folderId,
                dataRoomName: folder.name,
            },
            createdAt: Date.now(),
        });
    },
});

/**
 * Share a data room with a client (add their email to permissions).
 */
export const shareRoomWithClient = mutation({
    args: {
        folderId: v.id("folders"),
        clientEmail: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const folder = await ctx.db.get(args.folderId);
        if (!folder || !folder.tags?.includes("data-room")) {
            throw new Error("Ce dossier n'est pas une data room");
        }

        // Add client tag
        const tags = [...(folder.tags ?? [])];
        const clientTag = `client:${args.clientEmail}`;
        if (!tags.includes(clientTag)) {
            tags.push(clientTag);
        }

        const sharedWith = [...(folder.permissions?.sharedWith ?? [])];
        if (!sharedWith.includes(args.clientEmail)) {
            sharedWith.push(args.clientEmail);
        }

        await ctx.db.patch(args.folderId, {
            tags,
            permissions: {
                ...folder.permissions,
                visibility: "shared",
                sharedWith,
            },
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: folder.organizationId,
            userId: args.userId,
            action: "dataroom.shared",
            resourceType: "folder",
            resourceId: args.folderId,
            details: {
                clientEmail: args.clientEmail,
                dataRoomName: folder.name,
            },
            createdAt: Date.now(),
        });
    },
});
