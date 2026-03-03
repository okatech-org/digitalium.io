// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Automation Engine
// Exécution runtime des workflows et triggers
// d'archivage automatique.
// ═══════════════════════════════════════════════

import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * CRON — processScheduledArchives
 * Scans folders with archiveSchedule.scheduledDate <= now && autoArchive === true,
 * then flags approved documents for archiving (actual PDF = client-side).
 */
export const processScheduledArchives = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        let flagged = 0;

        // 1. Get all folders that have an archiveSchedule
        const allFolders = await ctx.db.query("folders").collect();
        const scheduledFolders = allFolders.filter((f) => {
            const sched = f.archiveSchedule as
                | { scheduledDate: number; targetCategory: string; autoArchive: boolean }
                | undefined;
            return sched && sched.autoArchive && sched.scheduledDate <= now;
        });

        for (const folder of scheduledFolders) {
            const sched = folder.archiveSchedule as {
                scheduledDate: number;
                targetCategory: string;
                autoArchive: boolean;
            };

            // 2. List approved documents in this folder
            const docs = await ctx.db
                .query("documents")
                .withIndex("by_organizationId", (q) =>
                    folder.organizationId
                        ? q.eq("organizationId", folder.organizationId)
                        : q
                )
                .collect();

            const approvedDocs = docs.filter(
                (d) =>
                    d.parentFolderId === folder._id.toString() &&
                    d.status === "approved"
            );

            if (approvedDocs.length === 0) continue;

            // 3. Log archive intent per document (PDF generation is client-side)
            for (const doc of approvedDocs) {
                // Mark doc for pending auto-archive
                await ctx.db.patch(doc._id, {
                    workflowReason: `Auto-archivage programmé — Catégorie: ${sched.targetCategory}`,
                    archiveCategorySlug: sched.targetCategory,
                    updatedAt: now,
                });

                await ctx.db.insert("audit_logs", {
                    organizationId: folder.organizationId,
                    userId: "system",
                    action: "document.auto_archive_flagged",
                    resourceType: "document",
                    resourceId: doc._id,
                    details: {
                        folderId: folder._id,
                        categorySlug: sched.targetCategory,
                        scheduledDate: sched.scheduledDate,
                        trigger: "folder.schedule",
                    },
                    createdAt: now,
                });

                flagged++;
            }

            // 4. Clear the schedule (one-shot) to prevent re-processing
            await ctx.db.patch(folder._id, {
                archiveSchedule: undefined,
            });

            // 5. Audit log for the folder
            await ctx.db.insert("audit_logs", {
                organizationId: folder.organizationId,
                userId: "system",
                action: "folder.scheduled_archive_processed",
                resourceType: "document",
                resourceId: folder._id,
                details: {
                    documentCount: approvedDocs.length,
                    categorySlug: sched.targetCategory,
                },
                createdAt: now,
            });
        }

        return { flagged, processedAt: now };
    },
});

/**
 * archiveFromAutomation — Point d'entrée unifié pour archivages automatiques
 * Détermine la catégorie depuis les tags du document / folder parent,
 * puis marque le document pour archivage (PDF = client-side).
 */
export const archiveFromAutomation = mutation({
    args: {
        documentId: v.id("documents"),
        triggeredBy: v.union(
            v.literal("system"),
            v.literal("workflow"),
            v.literal("schedule"),
            v.literal("signature")
        ),
        workflowId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const doc = await ctx.db.get(args.documentId);
        if (!doc) throw new Error("Document introuvable");
        if (!doc.organizationId) throw new Error("Document sans organisation");

        // ── Check automation config — skip if disabled ──
        const org = await ctx.db.get(doc.organizationId);
        const automationConfig = (org?.config as any)?.automation;
        const iArchiveConfig = (org?.config as any)?.iArchive;

        // Signature-triggered archive requires explicit toggle
        if (args.triggeredBy === "signature" && automationConfig?.archivageApresSignature === false) {
            return { skipped: true, reason: "archivageApresSignature disabled", documentId: args.documentId };
        }

        // Schedule/system triggers require global auto-archive toggle (from iArchive config)
        if (
            (args.triggeredBy === "schedule" || args.triggeredBy === "system") &&
            iArchiveConfig?.archivageAutomatique === false
        ) {
            return { skipped: true, reason: "archivageAutomatique disabled", documentId: args.documentId };
        }

        // 1. Resolve category — from doc's existing tag, folder metadata, or default
        let categorySlug = doc.archiveCategorySlug;

        if (!categorySlug && doc.parentFolderId) {
            // Try folder_archive_metadata
            const folderMeta = await ctx.db
                .query("folder_archive_metadata")
                .withIndex("by_folderId", (q) =>
                    q.eq("folderId", doc.parentFolderId as any)
                )
                .first();

            if (folderMeta && folderMeta.inheritToDocuments) {
                categorySlug = folderMeta.archiveCategorySlug;
            }
        }

        if (!categorySlug) {
            // Default to "fiscal" if nothing configured
            categorySlug = "fiscal";
        }

        // 2. Flag the document for auto-archive
        await ctx.db.patch(args.documentId, {
            archiveCategorySlug: categorySlug,
            workflowReason: `Auto-archivage (${args.triggeredBy}) — Catégorie: ${categorySlug}`,
            updatedAt: now,
        });

        // 3. Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: "system",
            action: "document.auto_archive_triggered",
            resourceType: "document",
            resourceId: args.documentId,
            details: {
                triggeredBy: args.triggeredBy,
                workflowId: args.workflowId,
                categorySlug,
                sourceType: "auto_archive",
            },
            createdAt: now,
        });

        return { documentId: args.documentId, categorySlug, triggeredBy: args.triggeredBy };
    },
});
