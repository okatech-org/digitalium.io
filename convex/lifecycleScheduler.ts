// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Lifecycle Scheduler
// Internal functions for automated state transitions
// and retention alert processing
// ═══════════════════════════════════════════════

import { internalMutation } from "./_generated/server";
import { generateDestructionCertNumber } from "./lib/certificateNumber";

// ─── Helpers ──────────────────────────────────

function alertToMs(value: number, unit: string): number {
    switch (unit) {
        case "hours": return value * 3600 * 1000;
        case "days": return value * 24 * 3600 * 1000;
        case "weeks": return value * 7 * 24 * 3600 * 1000;
        case "months": return value * 30 * 24 * 3600 * 1000;
        default: return value * 24 * 3600 * 1000;
    }
}

// ─── Process Lifecycle Transitions ────────────
/**
 * Scans all archives and transitions them through lifecycle states
 * based on their computed dates.
 *
 * Rules:
 * - If now >= activeUntil & hasSemiActive → move to semi_active
 * - If now >= activeUntil & !hasSemiActive → move to archived
 * - If now >= semiActiveUntil → move to archived
 * - Perpetual items (Coffre-Fort) are never destroyed
 */
export const processTransitions = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        let transitioned = 0;

        // Get all active archives that have lifecycle dates
        const activeArchives = await ctx.db
            .query("archives")
            .withIndex("by_lifecycleState", (q) =>
                q.eq("lifecycleState", "active")
            )
            .collect();

        for (const archive of activeArchives) {
            if (!archive.activeUntil) continue;

            if (now >= archive.activeUntil) {
                // Check if category has semi-active phase
                const category = archive.categoryId
                    ? await ctx.db.get(archive.categoryId)
                    : null;

                const hasSemiActive = category?.hasSemiActivePhase ?? false;

                if (hasSemiActive && archive.semiActiveUntil) {
                    // Transition to semi_active
                    await ctx.db.patch(archive._id, {
                        lifecycleState: "semi_active",
                        status: "semi_active",
                        stateChangedAt: now,
                        updatedAt: now,
                    });
                } else {
                    // Skip semi-active, go directly to archived
                    await ctx.db.patch(archive._id, {
                        lifecycleState: "archived",
                        status: "archived",
                        stateChangedAt: now,
                        updatedAt: now,
                    });
                }
                transitioned++;
            }
        }

        // Get all semi-active archives
        const semiActiveArchives = await ctx.db
            .query("archives")
            .withIndex("by_lifecycleState", (q) =>
                q.eq("lifecycleState", "semi_active")
            )
            .collect();

        for (const archive of semiActiveArchives) {
            if (!archive.semiActiveUntil) continue;

            if (now >= archive.semiActiveUntil) {
                await ctx.db.patch(archive._id, {
                    lifecycleState: "archived",
                    status: "archived",
                    stateChangedAt: now,
                    updatedAt: now,
                });
                transitioned++;
            }
        }

        // ── Étape 3 : Détecter les archives expirées ──

        const archivedItems = await ctx.db
            .query("archives")
            .filter((q) => q.eq(q.field("status"), "archived"))
            .collect();

        for (const archive of archivedItems) {
            if (!archive.retentionExpiresAt) continue;
            if (archive.isVault) continue;  // Coffre-Fort = jamais expiré

            if (now >= archive.retentionExpiresAt && archive.status !== "expired" && archive.status !== "destroyed") {
                // Charger la catégorie pour vérifier autoDestroy
                const category = archive.categoryId
                    ? await ctx.db.get(archive.categoryId)
                    : null;

                const autoDestroy = category?.autoDestroy ?? false;

                if (autoDestroy && !category?.isPerpetual) {
                    // ── Destruction automatique ──
                    const certificateNumber = await generateDestructionCertNumber(ctx.db);

                    await ctx.db.insert("destruction_certificates", {
                        certificateNumber,
                        archiveId: archive._id,
                        organizationId: archive.organizationId!,
                        documentTitle: archive.title,
                        documentCategory: category?.name ?? "",
                        documentCategorySlug: archive.categorySlug,
                        originalFileName: archive.fileName,
                        originalFileSize: archive.fileSize,
                        originalMimeType: archive.mimeType,
                        originalSha256Hash: archive.sha256Hash,
                        originalContentHash: archive.contentHash,
                        originalPdfHash: archive.pdfHash,
                        originalCreatedAt: archive.createdAt,
                        originalArchivedAt: archive.stateChangedAt ?? archive.createdAt,
                        retentionYears: archive.retentionYears,
                        retentionExpiresAt: archive.retentionExpiresAt,
                        ohadaReference: category?.ohadaReference,
                        ohadaCompliant: true,
                        destroyedAt: now,
                        destroyedBy: "system",
                        destructionMethod: "legal_expiry",
                        destructionReason: "Destruction automatique après expiration de la rétention légale",
                        status: "valid",
                        issuedAt: now,
                    });

                    await ctx.db.patch(archive._id, {
                        status: "destroyed",
                        lifecycleState: "destroyed",
                        stateChangedAt: now,
                        updatedAt: now,
                    });

                    // Révoquer le certificat d'archivage original
                    if (archive.certificateId) {
                        await ctx.db.patch(archive.certificateId, {
                            status: "revoked",
                        });
                    }

                    await ctx.db.insert("audit_logs", {
                        organizationId: archive.organizationId,
                        userId: "system",
                        action: "archive.auto_destroyed",
                        resourceType: "archive",
                        resourceId: archive._id,
                        details: { certificateNumber, reason: "auto_destroy" },
                        createdAt: now,
                    });
                } else {
                    // ── Marquage "expired" (attente validation manuelle) ──
                    await ctx.db.patch(archive._id, {
                        status: "expired",
                        stateChangedAt: now,
                        updatedAt: now,
                    });

                    await ctx.db.insert("audit_logs", {
                        organizationId: archive.organizationId,
                        userId: "system",
                        action: "archive.expired",
                        resourceType: "archive",
                        resourceId: archive._id,
                        details: { retentionExpiresAt: archive.retentionExpiresAt },
                        createdAt: now,
                    });

                    // TODO (Itération 2) : Créer notification in-app pour l'admin
                }

                transitioned++;
            }
        }

        return { transitioned, processedAt: now };
    },
});

// ─── Process Retention Alerts ─────────────────
/**
 * For each archive, compute alert thresholds and send
 * notifications when thresholds are reached.
 * Deduplicates using alert_logs.
 */
export const processAlerts = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        let alertsSent = 0;

        // Get all active/semi_active archives with lifecycle dates
        const archives = await ctx.db
            .query("archives")
            .collect();

        const activeArchives = archives.filter(
            (a) =>
                a.lifecycleState === "active" ||
                a.lifecycleState === "semi_active"
        );

        for (const archive of activeArchives) {
            if (!archive.categoryId || !archive.organizationId) continue;

            // Get alerts configured for this category
            const categoryAlerts = await ctx.db
                .query("retention_alerts")
                .withIndex("by_categoryId", (q) =>
                    q.eq("categoryId", archive.categoryId!)
                )
                .collect();

            for (const alert of categoryAlerts) {
                // Compute when this alert should fire
                let targetDate: number | undefined;

                if (alert.alertType === "pre_archive" && archive.activeUntil) {
                    // Fire X time before activeUntil
                    targetDate = archive.activeUntil - alertToMs(alert.value, alert.unit);
                } else if (alert.alertType === "pre_deletion" && archive.retentionExpiresAt) {
                    // Fire X time before retentionExpiresAt
                    targetDate = archive.retentionExpiresAt - alertToMs(alert.value, alert.unit);
                }

                if (!targetDate || now < targetDate) continue;

                // Check if already sent (dedup via alert_logs)
                const existingLog = await ctx.db
                    .query("alert_logs")
                    .withIndex("by_archive_alert", (q) =>
                        q.eq("archiveId", archive._id).eq("alertId", alert._id)
                    )
                    .first();

                if (existingLog) continue; // Already sent

                // Create alert log (notification record)
                await ctx.db.insert("alert_logs", {
                    archiveId: archive._id,
                    alertId: alert._id,
                    organizationId: archive.organizationId,
                    sentAt: now,
                    notificationType: "in_app",
                    recipientId: archive.uploadedBy, // notify the uploader
                    status: "sent",
                });

                alertsSent++;
            }
        }

        return { alertsSent, processedAt: now };
    },
});
