import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Documents (iDocument)
// ═══════════════════════════════════════════════

// ─── Queries ────────────────────────────────────

export const list = query({
    args: {
        createdBy: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.createdBy) {
            return ctx.db
                .query("documents")
                .withIndex("by_createdBy", (q) => q.eq("createdBy", args.createdBy!))
                .collect();
        }
        if (args.organizationId) {
            if (args.status) {
                return ctx.db
                    .query("documents")
                    .withIndex("by_org_status", (q) =>
                        q
                            .eq("organizationId", args.organizationId!)
                            .eq("status", args.status as any)
                    )
                    .collect();
            }
            return ctx.db
                .query("documents")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .collect();
        }
        return ctx.db.query("documents").collect();
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
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
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
