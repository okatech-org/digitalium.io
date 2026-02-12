import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Signatures (iSignature)
// ═══════════════════════════════════════════════

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

export const get = query({
    args: { id: v.id("signatures") },
    handler: async (ctx, args) => {
        return ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        documentId: v.optional(v.id("documents")),
        archiveId: v.optional(v.id("archives")),
        organizationId: v.optional(v.id("organizations")),
        requestedBy: v.string(),
        signers: v.array(
            v.object({
                userId: v.optional(v.string()),
                email: v.string(),
                status: v.literal("pending"),
                signedAt: v.optional(v.number()),
            })
        ),
        workflowId: v.optional(v.id("signature_workflows")),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return ctx.db.insert("signatures", {
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

        // Determine overall status
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
