import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Payments
// Transactions de paiement multi-fournisseur
// Providers: Airtel Money, Stripe, Virement, Chèque, Simulation
// ═══════════════════════════════════════════════

/* ─── Validators ────────────────────────────────── */

const paymentMethod = v.union(
    v.literal("mobile_money"),
    v.literal("bank_transfer"),
    v.literal("card"),
    v.literal("check"),
    v.literal("simulation")
);

const paymentProvider = v.union(
    v.literal("airtel_money"),
    v.literal("stripe"),
    v.literal("bank_transfer"),
    v.literal("check"),
    v.literal("simulation")
);

const paymentStatus = v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("refunded"),
    v.literal("cancelled")
);

/* ─── Queries ────────────────────────────────── */

export const list = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
        status: v.optional(paymentStatus),
        provider: v.optional(paymentProvider),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let results;

        if (args.organizationId && args.status) {
            results = await ctx.db
                .query("payments")
                .withIndex("by_org_status", (idx) =>
                    idx.eq("organizationId", args.organizationId!).eq("status", args.status!)
                )
                .order("desc")
                .collect();
        } else if (args.organizationId) {
            results = await ctx.db
                .query("payments")
                .withIndex("by_organizationId", (idx) =>
                    idx.eq("organizationId", args.organizationId!)
                )
                .order("desc")
                .collect();
        } else if (args.status) {
            results = await ctx.db
                .query("payments")
                .withIndex("by_status", (idx) => idx.eq("status", args.status!))
                .order("desc")
                .collect();
        } else if (args.provider) {
            results = await ctx.db
                .query("payments")
                .withIndex("by_provider", (idx) => idx.eq("provider", args.provider!))
                .order("desc")
                .collect();
        } else {
            results = await ctx.db.query("payments").order("desc").collect();
        }

        return args.limit ? results.slice(0, args.limit) : results;
    },
});

export const getById = query({
    args: { id: v.id("payments") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByExternalId = query({
    args: { externalId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("payments")
            .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
            .first();
    },
});

export const getStats = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const payments = await ctx.db
            .query("payments")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        const completed = payments.filter((p) => p.status === "completed");
        const pending = payments.filter((p) => p.status === "pending" || p.status === "processing");
        const failed = payments.filter((p) => p.status === "failed");

        return {
            total: payments.length,
            totalAmount: completed.reduce((sum, p) => sum + p.amount, 0),
            completedCount: completed.length,
            pendingCount: pending.length,
            failedCount: failed.length,
            pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
            byMethod: Object.entries(
                completed.reduce<Record<string, number>>((acc, p) => {
                    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
                    return acc;
                }, {})
            ).map(([method, amount]) => ({ method, amount })),
        };
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        subscriptionId: v.optional(v.id("subscriptions")),
        invoiceId: v.optional(v.id("invoices")),
        amount: v.number(),
        currency: v.optional(v.string()),
        method: paymentMethod,
        provider: paymentProvider,
        description: v.optional(v.string()),
        metadata: v.optional(v.any()),
        phoneNumber: v.optional(v.string()),
        cardLast4: v.optional(v.string()),
        cardBrand: v.optional(v.string()),
        checkNumber: v.optional(v.string()),
        bankName: v.optional(v.string()),
        transferReference: v.optional(v.string()),
        initiatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("payments", {
            ...args,
            currency: args.currency ?? "XAF",
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("payments"),
        status: paymentStatus,
        externalId: v.optional(v.string()),
        externalStatus: v.optional(v.string()),
        failedReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Paiement introuvable");

        const now = Date.now();
        const updates: Record<string, unknown> = {
            status: args.status,
            updatedAt: now,
        };

        if (args.externalId) updates.externalId = args.externalId;
        if (args.externalStatus) updates.externalStatus = args.externalStatus;
        if (args.failedReason) updates.failedReason = args.failedReason;
        if (args.status === "completed") updates.completedAt = now;

        await ctx.db.patch(args.id, updates);
        return args.id;
    },
});

/**
 * Simulation: auto-complete a payment (for dev/demo mode).
 */
export const simulateComplete = mutation({
    args: { id: v.id("payments") },
    handler: async (ctx, args) => {
        const payment = await ctx.db.get(args.id);
        if (!payment) throw new Error("Paiement introuvable");
        if (payment.provider !== "simulation") {
            throw new Error("simulateComplete n'est disponible que pour le fournisseur simulation");
        }

        const now = Date.now();
        await ctx.db.patch(args.id, {
            status: "completed",
            externalId: `SIM-${now}`,
            externalStatus: "approved",
            completedAt: now,
            updatedAt: now,
        });
        return args.id;
    },
});
