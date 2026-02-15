// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Retention Alerts
// CRUD for configurable per-category alerts
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Alert type & unit validators ─────────────

const alertType = v.union(
    v.literal("pre_archive"),
    v.literal("pre_deletion")
);

const alertUnit = v.union(
    v.literal("months"),
    v.literal("weeks"),
    v.literal("days"),
    v.literal("hours")
);

// ─── Unit labels for auto-generated labels ────

const UNIT_LABELS: Record<string, string> = {
    months: "mois",
    weeks: "semaine(s)",
    days: "jour(s)",
    hours: "heure(s)",
};

const TYPE_LABELS: Record<string, string> = {
    pre_archive: "avant archivage",
    pre_deletion: "avant suppression",
};

function generateLabel(value: number, unit: string, type: string): string {
    return `${value} ${UNIT_LABELS[unit] ?? unit} ${TYPE_LABELS[type] ?? type}`;
}

// ─── Queries ──────────────────────────────────

/**
 * List all alerts for a specific category.
 */
export const listByCategory = query({
    args: { categoryId: v.id("archive_categories") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("retention_alerts")
            .withIndex("by_categoryId", (q) =>
                q.eq("categoryId", args.categoryId)
            )
            .collect();
    },
});

/**
 * List all alerts for an organization.
 */
export const listByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("retention_alerts")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
    },
});

/**
 * List alerts by category and type.
 */
export const listByCategoryAndType = query({
    args: {
        categoryId: v.id("archive_categories"),
        alertType,
    },
    handler: async (ctx, args) => {
        const all = await ctx.db
            .query("retention_alerts")
            .withIndex("by_categoryId", (q) =>
                q.eq("categoryId", args.categoryId)
            )
            .collect();
        return all.filter((a) => a.alertType === args.alertType);
    },
});

// ─── Mutations ────────────────────────────────

/**
 * Create a new retention alert.
 */
export const create = mutation({
    args: {
        categoryId: v.id("archive_categories"),
        organizationId: v.id("organizations"),
        alertType,
        value: v.number(),
        unit: alertUnit,
        label: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const label = args.label || generateLabel(args.value, args.unit, args.alertType);

        return await ctx.db.insert("retention_alerts", {
            categoryId: args.categoryId,
            organizationId: args.organizationId,
            alertType: args.alertType,
            value: args.value,
            unit: args.unit,
            label,
            createdAt: Date.now(),
        });
    },
});

/**
 * Remove a retention alert.
 */
export const remove = mutation({
    args: { id: v.id("retention_alerts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

/**
 * Bulk create default alerts for a category.
 * Used during seedDefaultCategories.
 */
export const seedDefaults = mutation({
    args: {
        categoryId: v.id("archive_categories"),
        organizationId: v.id("organizations"),
        alertType,
        alerts: v.array(
            v.object({
                value: v.number(),
                unit: alertUnit,
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let count = 0;

        for (const alert of args.alerts) {
            const label = generateLabel(alert.value, alert.unit, args.alertType);
            await ctx.db.insert("retention_alerts", {
                categoryId: args.categoryId,
                organizationId: args.organizationId,
                alertType: args.alertType,
                value: alert.value,
                unit: alert.unit,
                label,
                createdAt: now,
            });
            count++;
        }

        return { count };
    },
});

/**
 * Remove all alerts for a category (used when deleting a category).
 */
export const removeAllForCategory = mutation({
    args: { categoryId: v.id("archive_categories") },
    handler: async (ctx, args) => {
        const alerts = await ctx.db
            .query("retention_alerts")
            .withIndex("by_categoryId", (q) =>
                q.eq("categoryId", args.categoryId)
            )
            .collect();

        for (const alert of alerts) {
            await ctx.db.delete(alert._id);
        }

        return { deleted: alerts.length };
    },
});
