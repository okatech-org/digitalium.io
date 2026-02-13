import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Signatures (iSignature)
// ═══════════════════════════════════════════════

const signerRole = v.union(
    v.literal("signer"),
    v.literal("approver"),
    v.literal("observer")
);

const signerStatus = v.union(
    v.literal("pending"),
    v.literal("signed"),
    v.literal("declined")
);

// ─── Queries ─────────────────────────────────────

export const listByDocument = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return ctx.db
            .query("signatures")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();
    },
});

export const listByOrganization = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return ctx.db
            .query("signatures")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
    },
});

export const listByRequester = query({
    args: { requestedBy: v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query("signatures")
            .withIndex("by_requestedBy", (q) =>
                q.eq("requestedBy", args.requestedBy)
            )
            .collect();
    },
});

export const listPendingForUser = query({
    args: { userEmail: v.string() },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("signatures").collect();
        return all.filter(
            (sig) =>
                sig.status !== "cancelled" &&
                sig.status !== "completed" &&
                sig.signers.some(
                    (s) =>
                        s.email === args.userEmail && s.status === "pending"
                )
        );
    },
});

export const listCompleted = query({
    args: { userEmail: v.string() },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("signatures").collect();
        return all.filter(
            (sig) =>
                sig.status === "completed" &&
                (sig.requestedBy === args.userEmail ||
                    sig.signers.some((s) => s.email === args.userEmail))
        );
    },
});

export const get = query({
    args: { id: v.id("signatures") },
    handler: async (ctx, args) => {
        return ctx.db.get(args.id);
    },
});

export const getEnriched = query({
    args: { id: v.id("signatures") },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.id);
        if (!sig) return null;

        let document = null;
        let archive = null;
        if (sig.documentId) document = await ctx.db.get(sig.documentId);
        if (sig.archiveId) archive = await ctx.db.get(sig.archiveId);

        return { ...sig, document, archive };
    },
});

// ─── Mutations ───────────────────────────────────

export const create = mutation({
    args: {
        documentId: v.optional(v.id("documents")),
        archiveId: v.optional(v.id("archives")),
        organizationId: v.optional(v.id("organizations")),
        requestedBy: v.string(),
        title: v.optional(v.string()),
        message: v.optional(v.string()),
        sequential: v.optional(v.boolean()),
        signers: v.array(
            v.object({
                userId: v.optional(v.string()),
                email: v.string(),
                name: v.optional(v.string()),
                role: v.optional(signerRole),
                order: v.optional(v.number()),
                status: v.literal("pending"),
                signedAt: v.optional(v.number()),
            })
        ),
        workflowId: v.optional(v.id("signature_workflows")),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const id = await ctx.db.insert("signatures", {
            documentId: args.documentId,
            archiveId: args.archiveId,
            organizationId: args.organizationId,
            requestedBy: args.requestedBy,
            signers: args.signers,
            workflowId: args.workflowId,
            status: "pending",
            dueDate: args.dueDate,
            createdAt: now,
            updatedAt: now,
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.requestedBy,
            action: "signature.request_created",
            resourceType: "signature",
            resourceId: id,
            details: {
                title: args.title,
                signersCount: args.signers.length,
                sequential: args.sequential ?? false,
                dueDate: args.dueDate,
            },
            createdAt: now,
        });

        return id;
    },
});

export const signDocument = mutation({
    args: {
        id: v.id("signatures"),
        signerEmail: v.string(),
        signatureData: v.optional(v.string()),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.id);
        if (!sig) throw new Error("Signature request not found");

        const now = Date.now();
        const updatedSigners = sig.signers.map((s) =>
            s.email === args.signerEmail
                ? { ...s, status: "signed" as const, signedAt: now }
                : s
        );

        const allSigned = updatedSigners.every(
            (s) => s.status === "signed" || (s as any).role === "observer"
        );
        const overallStatus = allSigned ? ("completed" as const) : ("in_progress" as const);

        await ctx.db.patch(args.id, {
            signers: updatedSigners,
            status: overallStatus,
            updatedAt: now,
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: sig.organizationId,
            userId: args.userId,
            action: "signature.signed",
            resourceType: "signature",
            resourceId: args.id,
            details: { signerEmail: args.signerEmail },
            createdAt: now,
        });

        return { status: overallStatus };
    },
});

export const declineSignature = mutation({
    args: {
        id: v.id("signatures"),
        signerEmail: v.string(),
        reason: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.id);
        if (!sig) throw new Error("Signature request not found");

        const now = Date.now();
        const updatedSigners = sig.signers.map((s) =>
            s.email === args.signerEmail
                ? { ...s, status: "declined" as const, signedAt: now }
                : s
        );

        await ctx.db.patch(args.id, {
            signers: updatedSigners,
            status: "cancelled",
            updatedAt: now,
        });

        await ctx.db.insert("audit_logs", {
            organizationId: sig.organizationId,
            userId: args.userId,
            action: "signature.declined",
            resourceType: "signature",
            resourceId: args.id,
            details: { signerEmail: args.signerEmail, reason: args.reason },
            createdAt: now,
        });
    },
});

export const delegateSignature = mutation({
    args: {
        id: v.id("signatures"),
        fromEmail: v.string(),
        toEmail: v.string(),
        toName: v.optional(v.string()),
        toUserId: v.optional(v.string()),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.id);
        if (!sig) throw new Error("Signature request not found");

        const now = Date.now();
        const updatedSigners = sig.signers.map((s) =>
            s.email === args.fromEmail
                ? {
                      ...s,
                      email: args.toEmail,
                      name: args.toName,
                      userId: args.toUserId,
                  }
                : s
        );

        await ctx.db.patch(args.id, {
            signers: updatedSigners,
            updatedAt: now,
        });

        await ctx.db.insert("audit_logs", {
            organizationId: sig.organizationId,
            userId: args.userId,
            action: "signature.delegated",
            resourceType: "signature",
            resourceId: args.id,
            details: {
                fromEmail: args.fromEmail,
                toEmail: args.toEmail,
            },
            createdAt: now,
        });
    },
});

export const updateSignerStatus = mutation({
    args: {
        id: v.id("signatures"),
        signerEmail: v.string(),
        status: v.union(
            v.literal("signed"),
            v.literal("declined")
        ),
    },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.id);
        if (!sig) throw new Error("Signature request not found");

        const updatedSigners = sig.signers.map((s) =>
            s.email === args.signerEmail
                ? { ...s, status: args.status, signedAt: Date.now() }
                : s
        );

        const allSigned = updatedSigners.every((s) => s.status === "signed");
        const anyDeclined = updatedSigners.some((s) => s.status === "declined");
        const overallStatus = anyDeclined
            ? "cancelled" as const
            : allSigned
                ? "completed" as const
                : "in_progress" as const;

        await ctx.db.patch(args.id, {
            signers: updatedSigners,
            status: overallStatus,
            updatedAt: Date.now(),
        });
    },
});

export const cancel = mutation({
    args: { id: v.id("signatures") },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.id);
        if (!sig) throw new Error("Signature request not found");
        if (sig.status === "completed") {
            throw new Error("Cannot cancel a completed signature");
        }

        await ctx.db.patch(args.id, {
            status: "cancelled",
            updatedAt: Date.now(),
        });
    },
});
