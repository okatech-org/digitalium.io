import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

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


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "SIGNATURE_SIGNEE",
            action: "signatures.signDocument",
            entiteType: "signatures",
            entiteId: "system",
            userId: "system",
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
            (s) => s.status === "signed" || (s as Record<string, unknown>).role === "observer"
        );
        const overallStatus = allSigned ? ("completed" as const) : ("in_progress" as const);

        await ctx.db.patch(args.id, {
            signers: updatedSigners,
            status: overallStatus,
            completedAt: allSigned ? now : undefined,
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

        // ── Phase 16 : Trigger auto-archive on signature completion ──
        if (overallStatus === "completed" && sig.documentId) {
            const doc = await ctx.db.get(sig.documentId);
            if (doc && doc.parentFolderId) {
                // Check if folder has archive metadata with inheritToDocuments
                const folderMeta = await ctx.db
                    .query("folder_archive_metadata")
                    .withIndex("by_folderId", (q) =>
                        q.eq("folderId", doc.parentFolderId as Id<"folders">)
                    )
                    .first();

                if (folderMeta && folderMeta.inheritToDocuments) {
                    // Flag document for auto-archive
                    await ctx.db.patch(sig.documentId, {
                        archiveCategorySlug: folderMeta.archiveCategorySlug,
                        workflowReason: `Auto-archivage post-signature — Catégorie: ${folderMeta.archiveCategorySlug}`,
                        updatedAt: now,
                    });

                    await ctx.db.insert("audit_logs", {
                        organizationId: sig.organizationId,
                        userId: "system",
                        action: "document.auto_archive_triggered",
                        resourceType: "document",
                        resourceId: sig.documentId,
                        details: {
                            triggeredBy: "signature",
                            signatureId: args.id,
                            categorySlug: folderMeta.archiveCategorySlug,
                        },
                        createdAt: now,
                    });
                }
            }
        }

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

// ─── Advanced Mutations ─────────────────────────

export const sendReminder = mutation({
    args: {
        signatureId: v.id("signatures"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const sig = await ctx.db.get(args.signatureId);
        if (!sig) throw new Error("Signature introuvable");

        // Update lastReminderSentAt
        await ctx.db.patch(args.signatureId, {
            lastReminderSentAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: sig.organizationId,
            userId: args.userId,
            action: "signature.reminder_sent",
            resourceType: "signature" as const,
            resourceId: String(args.signatureId),
            details: { signers: sig.signers?.length ?? 0 },
            createdAt: Date.now(),
        });

        return { sent: true };
    },
});

export const batchSign = mutation({
    args: {
        signatureIds: v.array(v.id("signatures")),
        signerId: v.string(),
        signatureData: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let signed = 0;
        for (const sigId of args.signatureIds) {
            const sig = await ctx.db.get(sigId);
            if (!sig) continue;

            const signers = sig.signers ?? [];
            const updated = signers.map((s) =>
                String(s.userId) === args.signerId
                    ? { ...s, status: "signed" as const, signedAt: Date.now() }
                    : s
            );

            const allSigned = updated.every((s) => s.status === "signed");

            await ctx.db.patch(sigId, {
                signers: updated,
                status: allSigned ? "completed" : sig.status,
                completedAt: allSigned ? Date.now() : undefined,
                updatedAt: Date.now(),
            });
            signed++;
        }
        return { signed };
    },
});

// ─── Advanced Queries ───────────────────────────

export const getSignatureAnalytics = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const sigs = await ctx.db
            .query("signatures")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const total = sigs.length;
        const completed = sigs.filter((s) => s.status === "completed").length;
        const pending = sigs.filter(
            (s) => s.status === "pending" || s.status === "in_progress"
        ).length;
        const expired = sigs.filter(
            (s) => s.dueDate && s.dueDate < Date.now() && s.status !== "completed"
        ).length;

        // Average completion time (for completed signatures)
        const completedSigs = sigs.filter(
            (s) => s.status === "completed" && s.completedAt && s.createdAt
        );
        const avgTimeMs =
            completedSigs.length > 0
                ? completedSigs.reduce(
                      (sum, s) => sum + ((s.completedAt as number) - s.createdAt),
                      0
                  ) / completedSigs.length
                : 0;
        const avgTimeDays =
            Math.round((avgTimeMs / (1000 * 3600 * 24)) * 10) / 10;

        // By month (last 6 months)
        const sixMonthsAgo = Date.now() - 180 * 24 * 3600 * 1000;
        const recentSigs = sigs.filter((s) => s.createdAt > sixMonthsAgo);
        const byMonth: Record<string, { created: number; completed: number }> = {};
        for (const sig of recentSigs) {
            const month = new Date(sig.createdAt).toISOString().substring(0, 7);
            if (!byMonth[month]) byMonth[month] = { created: 0, completed: 0 };
            byMonth[month].created++;
            if (sig.status === "completed") byMonth[month].completed++;
        }

        const completionRate =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            pending,
            expired,
            completionRate,
            avgTimeDays,
            byMonth,
        };
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
