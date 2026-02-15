// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Lifecycle Scheduler
// Internal functions for automated state transitions
// and retention alert processing
// ═══════════════════════════════════════════════

import { internalMutation } from "./_generated/server";

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
