import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Documents (iDocument)
// ═══════════════════════════════════════════════

// ─── File Storage ───────────────────────────────

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

// ─── Import: Create document from uploaded file ──

export const createFromImport = mutation({
    args: {
        title: v.string(),
        organizationId: v.optional(v.id("organizations")),
        createdBy: v.string(),
        tags: v.array(v.string()),
        folderId: v.optional(v.id("folders")),
        parentFolderId: v.optional(v.string()),
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        excerpt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const fileUrl = await ctx.storage.getUrl(args.storageId);

        const docId = await ctx.db.insert("documents", {
            title: args.title,
            content: null, // Imported files have no Tiptap content
            excerpt: args.excerpt ?? `Document importé — ${args.fileName}`,
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            lastEditedBy: args.createdBy,
            collaborators: [args.createdBy],
            status: "draft",
            version: 1,
            tags: args.tags,
            folderId: args.folderId,
            parentFolderId: args.parentFolderId,
            storageId: args.storageId,
            fileUrl: fileUrl ?? undefined,
            fileName: args.fileName,
            fileSize: args.fileSize,
            mimeType: args.mimeType,
            createdAt: now,
            updatedAt: now,
        });

        // Increment fileCount on the target folder
        if (args.folderId) {
            const folder = await ctx.db.get(args.folderId);
            if (folder) {
                await ctx.db.patch(args.folderId, {
                    fileCount: (folder.fileCount ?? 0) + 1,
                    updatedAt: now,
                });
            }
        }

        return docId;
    },
});

// ─── Queries ────────────────────────────────────

export const list = query({
    args: {
        createdBy: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        status: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let docs;
        if (args.createdBy) {
            docs = await ctx.db
                .query("documents")
                .withIndex("by_createdBy", (q) => q.eq("createdBy", args.createdBy!))
                .collect();
        } else if (args.organizationId) {
            if (args.status && args.status !== "trashed") {
                docs = await ctx.db
                    .query("documents")
                    .withIndex("by_org_status", (q) =>
                        q
                            .eq("organizationId", args.organizationId!)
                            .eq("status", args.status as any)
                    )
                    .collect();
            } else {
                docs = await ctx.db
                    .query("documents")
                    .withIndex("by_organizationId", (q) =>
                        q.eq("organizationId", args.organizationId!)
                    )
                    .collect();
            }
        } else {
            docs = await ctx.db.query("documents").collect();
        }
        // Exclude trashed documents from normal listing
        docs = docs.filter((d) => d.status !== "trashed");
        // Optional text search (title + tags)
        if (args.search) {
            const s = args.search.toLowerCase();
            docs = docs.filter((d) =>
                d.title.toLowerCase().includes(s) ||
                d.tags.some((t) => t.toLowerCase().includes(s)) ||
                (d.excerpt && d.excerpt.toLowerCase().includes(s))
            );
        }
        return docs;
    },
});

export const get = query({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        return ctx.db.get(args.id);
    },
});

// ─── Mutations ──────────────────────────────────

export const create = mutation({
    args: {
        title: v.string(),
        content: v.any(),
        organizationId: v.optional(v.id("organizations")),
        createdBy: v.string(),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return ctx.db.insert("documents", {
            title: args.title,
            content: args.content,
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            lastEditedBy: args.createdBy,
            collaborators: [args.createdBy],
            status: "draft",
            tags: args.tags ?? [],
            version: 1,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.any()),
        status: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        lastEditedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Document not found");

        const updates: Record<string, unknown> = { updatedAt: Date.now() };
        if (args.title !== undefined) updates.title = args.title;
        if (args.content !== undefined) {
            updates.content = args.content;
            updates.version = existing.version + 1;
        }
        if (args.status !== undefined) updates.status = args.status;
        if (args.tags !== undefined) updates.tags = args.tags;
        if (args.lastEditedBy !== undefined) updates.lastEditedBy = args.lastEditedBy;

        await ctx.db.patch(args.id, updates);
    },
});

export const remove = mutation({
    args: {
        id: v.id("documents"),
        trashedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        // Soft-delete: move to trash
        await ctx.db.patch(args.id, {
            previousStatus: doc.status,
            status: "trashed",
            trashedAt: Date.now(),
            trashedBy: args.trashedBy ?? doc.createdBy,
            updatedAt: Date.now(),
        });
    },
});

// ─── Auto-save (content only, no version bump) ──

export const saveContent = mutation({
    args: {
        id: v.id("documents"),
        content: v.any(),
        lastEditedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");

        await ctx.db.patch(args.id, {
            content: args.content,
            lastEditedBy: args.lastEditedBy,
            updatedAt: Date.now(),
        });
    },
});

// ─── Version History ────────────────────────────

export const createVersion = mutation({
    args: {
        documentId: v.id("documents"),
        content: v.any(),
        editedBy: v.string(),
        changeDescription: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.documentId);
        if (!doc) throw new Error("Document not found");

        const nextVersion = doc.version + 1;

        // Insert version snapshot
        await ctx.db.insert("document_versions", {
            documentId: args.documentId,
            version: nextVersion,
            content: args.content,
            editedBy: args.editedBy,
            changeDescription: args.changeDescription,
            createdAt: Date.now(),
        });

        // Bump document version
        await ctx.db.patch(args.documentId, {
            version: nextVersion,
            updatedAt: Date.now(),
        });

        return nextVersion;
    },
});

export const listVersions = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return ctx.db
            .query("document_versions")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .order("desc")
            .collect();
    },
});

export const restoreVersion = mutation({
    args: {
        documentId: v.id("documents"),
        versionId: v.id("document_versions"),
        restoredBy: v.string(),
    },
    handler: async (ctx, args) => {
        const version = await ctx.db.get(args.versionId);
        if (!version) throw new Error("Version not found");

        const doc = await ctx.db.get(args.documentId);
        if (!doc) throw new Error("Document not found");

        const nextVersion = doc.version + 1;

        // Restore content from the version snapshot
        await ctx.db.patch(args.documentId, {
            content: version.content,
            version: nextVersion,
            lastEditedBy: args.restoredBy,
            updatedAt: Date.now(),
        });

        // Also create a new version record for the restore action
        await ctx.db.insert("document_versions", {
            documentId: args.documentId,
            version: nextVersion,
            content: version.content,
            editedBy: args.restoredBy,
            changeDescription: `Restauré depuis la version ${version.version}`,
            createdAt: Date.now(),
        });

        return nextVersion;
    },
});

// ─── Comments ───────────────────────────────────

export const addComment = mutation({
    args: {
        documentId: v.id("documents"),
        userId: v.string(),
        userName: v.string(),
        text: v.string(),
        selection: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        return ctx.db.insert("document_comments", {
            documentId: args.documentId,
            userId: args.userId,
            userName: args.userName,
            text: args.text,
            selection: args.selection,
            resolved: false,
            createdAt: Date.now(),
        });
    },
});

export const listComments = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return ctx.db
            .query("document_comments")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .order("desc")
            .collect();
    },
});

export const resolveComment = mutation({
    args: { id: v.id("document_comments") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { resolved: true });
    },
});

// ─── Workflow Transitions ───────────────────────

export const submitForReview = mutation({
    args: {
        id: v.id("documents"),
        userId: v.string(),
        assignee: v.optional(v.string()),
        deadline: v.optional(v.number()),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        if (doc.status !== "draft") throw new Error("Document must be in draft status");

        await ctx.db.patch(args.id, {
            status: "review",
            workflowReason: args.comment,
            workflowAssignee: args.assignee,
            workflowDeadline: args.deadline,
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "document.submit_review",
            resourceType: "document",
            resourceId: args.id,
            details: { comment: args.comment, assignee: args.assignee },
            createdAt: Date.now(),
        });
    },
});

export const approveDocument = mutation({
    args: {
        id: v.id("documents"),
        userId: v.string(),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        if (doc.status !== "review") throw new Error("Document must be in review status");

        await ctx.db.patch(args.id, {
            status: "approved",
            workflowReason: args.comment ?? "Approuvé",
            workflowAssignee: undefined,
            workflowDeadline: undefined,
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "document.approve",
            resourceType: "document",
            resourceId: args.id,
            details: { comment: args.comment },
            createdAt: Date.now(),
        });
    },
});

export const rejectDocument = mutation({
    args: {
        id: v.id("documents"),
        userId: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        if (doc.status !== "review") throw new Error("Document must be in review status");

        await ctx.db.patch(args.id, {
            status: "draft",
            workflowReason: args.reason,
            workflowAssignee: undefined,
            workflowDeadline: undefined,
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "document.reject",
            resourceType: "document",
            resourceId: args.id,
            details: { reason: args.reason },
            createdAt: Date.now(),
        });
    },
});

// ⚠️ DEPRECATED — Utiliser archiveBridge.archiveDocument pour le flux complet
// Cette mutation ne crée PAS d'entrée dans la table archives.
// Conservée uniquement comme fallback/compatibilité.
export const archiveDocument = mutation({
    args: {
        id: v.id("documents"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        if (doc.status !== "approved") throw new Error("Document must be approved before archiving");

        await ctx.db.patch(args.id, {
            status: "archived",
            workflowReason: "Archivé dans iArchive",
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "document.archive",
            resourceType: "document",
            resourceId: args.id,
            details: { archivedAt: Date.now() },
            createdAt: Date.now(),
        });
    },
});

// ─── Trash: list trashed documents ──────────────

export const listTrashed = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        if (args.organizationId) {
            return ctx.db
                .query("documents")
                .withIndex("by_org_status", (q) =>
                    q.eq("organizationId", args.organizationId!).eq("status", "trashed")
                )
                .collect();
        }
        return ctx.db
            .query("documents")
            .withIndex("by_status", (q) => q.eq("status", "trashed"))
            .collect();
    },
});

// ─── Trash: restore ─────────────────────────────

export const restore = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        if (doc.status !== "trashed") throw new Error("Document is not in trash");
        await ctx.db.patch(args.id, {
            status: (doc.previousStatus as any) || "draft",
            trashedAt: undefined,
            trashedBy: undefined,
            previousStatus: undefined,
            updatedAt: Date.now(),
        });
    },
});

// ─── Trash: permanent delete ────────────────────

export const permanentDelete = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        // Delete associated versions
        const versions = await ctx.db
            .query("document_versions")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.id))
            .collect();
        for (const v of versions) {
            await ctx.db.delete(v._id);
        }
        // Delete associated comments
        const comments = await ctx.db
            .query("document_comments")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.id))
            .collect();
        for (const c of comments) {
            await ctx.db.delete(c._id);
        }
        // Delete stored file if any
        if (doc.storageId) {
            await ctx.storage.delete(doc.storageId);
        }
        await ctx.db.delete(args.id);
    },
});

// ─── Sharing ────────────────────────────────────

export const listSharedWith = query({
    args: {
        userId: v.string(),
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        // Get all non-trashed docs in the org, then filter to those shared with user
        let docs;
        if (args.organizationId) {
            docs = await ctx.db
                .query("documents")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .collect();
        } else {
            docs = await ctx.db.query("documents").collect();
        }
        return docs.filter(
            (d) =>
                d.status !== "trashed" &&
                d.sharedWith &&
                d.sharedWith.some((s) => s.userId === args.userId)
        );
    },
});

export const shareDocument = mutation({
    args: {
        id: v.id("documents"),
        userId: v.string(),
        permission: v.union(v.literal("read"), v.literal("edit"), v.literal("comment")),
        sharedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        const existing = doc.sharedWith ?? [];
        // Don't add duplicate
        if (existing.some((s) => s.userId === args.userId)) {
            // Update permission
            const updated = existing.map((s) =>
                s.userId === args.userId
                    ? { ...s, permission: args.permission }
                    : s
            );
            await ctx.db.patch(args.id, { sharedWith: updated, updatedAt: Date.now() });
        } else {
            await ctx.db.patch(args.id, {
                sharedWith: [
                    ...existing,
                    {
                        userId: args.userId,
                        permission: args.permission,
                        sharedAt: Date.now(),
                        sharedBy: args.sharedBy,
                    },
                ],
                updatedAt: Date.now(),
            });
        }
    },
});

export const unshareDocument = mutation({
    args: {
        id: v.id("documents"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id);
        if (!doc) throw new Error("Document not found");
        const updated = (doc.sharedWith ?? []).filter((s) => s.userId !== args.userId);
        await ctx.db.patch(args.id, { sharedWith: updated, updatedAt: Date.now() });
    },
});

// ─── Templates ──────────────────────────────────

export const createFromTemplate = mutation({
    args: {
        title: v.string(),
        content: v.any(),
        organizationId: v.optional(v.id("organizations")),
        createdBy: v.string(),
        tags: v.optional(v.array(v.string())),
        templateId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("documents", {
            title: args.title,
            content: args.content,
            excerpt: "",
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            collaborators: [args.createdBy],
            status: "draft",
            version: 1,
            tags: args.tags ?? [],
            createdAt: now,
            updatedAt: now,
        });
    },
});

// ─── Move to folder ─────────────────────────────

export const moveToFolder = mutation({
    args: {
        id: v.id("documents"),
        parentFolderId: v.optional(v.string()),
        folderId: v.optional(v.id("folders")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            parentFolderId: args.parentFolderId,
            folderId: args.folderId,
            updatedAt: Date.now(),
        });
    },
});
