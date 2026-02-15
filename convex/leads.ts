import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Leads (Prospects)
// CRUD + status transitions for the sales pipeline
// ═══════════════════════════════════════════════

/* ─── Source & Status validators (reused) ────── */

const leadSource = v.union(
    v.literal("website"),
    v.literal("referral"),
    v.literal("event"),
    v.literal("linkedin"),
    v.literal("salon"),
    v.literal("other")
);

const leadStatus = v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("qualified"),
    v.literal("proposal"),
    v.literal("negotiation"),
    v.literal("converted"),
    v.literal("lost")
);

/* ─── Queries ────────────────────────────────── */

/**
 * List all leads, optionally filtered by status.
 * Returns leads sorted by creation date (most recent first).
 */
export const list = query({
    args: {
        status: v.optional(leadStatus),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("leads").order("desc");

        if (args.status) {
            q = ctx.db
                .query("leads")
                .withIndex("by_status", (idx) => idx.eq("status", args.status!))
                .order("desc");
        }

        return await q.collect();
    },
});

/**
 * Get a single lead by ID.
 */
export const getById = query({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/**
 * Get aggregated KPI stats for the leads dashboard.
 */
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const allLeads = await ctx.db.query("leads").collect();

        const total = allLeads.length;
        const byStatus: Record<string, number> = {};
        let totalValue = 0;
        let convertedCount = 0;
        let negotiationCount = 0;

        for (const lead of allLeads) {
            byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
            totalValue += lead.value ?? 0;
            if (lead.status === "converted") convertedCount++;
            if (lead.status === "negotiation" || lead.status === "proposal") negotiationCount++;
        }

        const conversionRate = total > 0
            ? Math.round((convertedCount / total) * 100)
            : 0;

        return {
            total,
            byStatus,
            totalValue,
            conversionRate,
            negotiationCount,
        };
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Create a new lead.
 */
export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        sector: v.optional(v.string()),
        source: leadSource,
        value: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("leads", {
            ...args,
            status: "new",
            lastContactedAt: now,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/**
 * Update a lead's status (qualify, convert, mark as lost, etc.).
 */
export const updateStatus = mutation({
    args: {
        id: v.id("leads"),
        status: leadStatus,
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Lead introuvable");

        await ctx.db.patch(args.id, {
            status: args.status,
            lastContactedAt: Date.now(),
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

/**
 * Update lead details (name, email, value, etc.).
 */
export const update = mutation({
    args: {
        id: v.id("leads"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        sector: v.optional(v.string()),
        source: v.optional(leadSource),
        value: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Lead introuvable");

        // Remove undefined values
        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, {
            ...clean,
            updatedAt: Date.now(),
        });

        return id;
    },
});

/**
 * Delete a lead permanently.
 */
export const remove = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Lead introuvable");
        await ctx.db.delete(args.id);
    },
});
