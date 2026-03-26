// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Notifications
// Reads alert_logs + audit_logs for in-app notifications
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/* ─── Queries ────────────────────────────────── */

/**
 * List notifications for a user within an organization.
 * Pulls from alert_logs (retention alerts) and recent audit_logs
 * that are relevant to the user.
 */
export const listForUser = query({
    args: {
        userId: v.string(),
        organizationId: v.id("organizations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 50;

        // 1. Get alert_logs addressed to this user
        const alertLogs = await ctx.db
            .query("alert_logs")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .order("desc")
            .collect();

        const userAlerts = alertLogs
            .filter((a) => a.recipientId === args.userId)
            .slice(0, maxItems);

        // 2. Enrich with retention alert details
        const enrichedAlerts = await Promise.all(
            userAlerts.map(async (log) => {
                const alert = await ctx.db.get(log.alertId);
                const archive = await ctx.db.get(log.archiveId);
                return {
                    id: log._id,
                    type: "retention_alert" as const,
                    title: alert
                        ? `Alerte: ${alert.label}`
                        : "Alerte de rétention",
                    description: archive
                        ? `Archive "${archive.title}" — ${alert?.label ?? "alerte de rétention"}`
                        : "Alerte d'archivage",
                    status: log.status,
                    sentAt: log.sentAt,
                    archiveId: log.archiveId,
                };
            })
        );

        // 3. Get recent audit_logs relevant to this user (last 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentAudits = await ctx.db
            .query("audit_logs")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .order("desc")
            .collect();

        const relevantActions = [
            "document.submitted",
            "document.approved",
            "document.rejected",
            "archive.created",
            "archive.legal_hold_applied",
            "archive.destroyed",
            "signature.requested",
            "signature.completed",
            "lead.converted",
        ];

        const ACTION_LABELS: Record<string, string> = {
            "document.submitted": "Document soumis pour revue",
            "document.approved": "Document approuvé",
            "document.rejected": "Document rejeté",
            "archive.created": "Archive créée",
            "archive.legal_hold_applied": "Gel juridique appliqué",
            "archive.destroyed": "Archive détruite",
            "signature.requested": "Signature demandée",
            "signature.completed": "Signature complétée",
            "lead.converted": "Lead converti en organisation",
        };

        const auditNotifications = recentAudits
            .filter(
                (a) =>
                    a.createdAt >= sevenDaysAgo &&
                    relevantActions.includes(a.action) &&
                    a.userId !== args.userId // Don't notify user of own actions
            )
            .slice(0, 20)
            .map((a) => ({
                id: a._id,
                type: "audit" as const,
                title: ACTION_LABELS[a.action] ?? a.action,
                description: `Par ${a.userId === "system" ? "le système" : "un collaborateur"}`,
                status: "sent" as const,
                sentAt: a.createdAt,
                resourceType: a.resourceType,
                resourceId: a.resourceId,
            }));

        // 4. Merge and sort
        const all = [...enrichedAlerts, ...auditNotifications]
            .sort((a, b) => b.sentAt - a.sentAt)
            .slice(0, maxItems);

        return all;
    },
});

/**
 * Count unread notifications for a user.
 */
export const countUnread = query({
    args: {
        userId: v.string(),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const alertLogs = await ctx.db
            .query("alert_logs")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const unread = alertLogs.filter(
            (a) => a.recipientId === args.userId && a.status === "sent"
        );

        return { count: unread.length };
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Mark a notification as read.
 */
export const markAsRead = mutation({
    args: { alertLogId: v.id("alert_logs") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.alertLogId);
        if (!existing) throw new Error("Notification introuvable");
        if (existing.status === "sent") {
            await ctx.db.patch(args.alertLogId, { status: "read" });
        }
    },
});

/**
 * Mark a notification as acknowledged.
 */
export const markAsAcknowledged = mutation({
    args: { alertLogId: v.id("alert_logs") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.alertLogId);
        if (!existing) throw new Error("Notification introuvable");
        await ctx.db.patch(args.alertLogId, { status: "acknowledged" });
    },
});

/**
 * Mark all notifications as read for a user in an org.
 */
export const markAllAsRead = mutation({
    args: {
        userId: v.string(),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const alertLogs = await ctx.db
            .query("alert_logs")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const unread = alertLogs.filter(
            (a) => a.recipientId === args.userId && a.status === "sent"
        );

        for (const log of unread) {
            await ctx.db.patch(log._id, { status: "read" });
        }


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "notifications.markAllAsRead",
            entiteType: "alert_logs",
            entiteId: "system",
            userId: "system",
        });
        return { updated: unread.length };
    },
});
