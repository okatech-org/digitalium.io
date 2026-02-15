import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Subscriptions
// SaaS billing management for client organizations
// ═══════════════════════════════════════════════

/* ─── Validators ────────────────────────────────── */

const planType = v.union(
    v.literal("starter"),
    v.literal("pro"),
    v.literal("enterprise")
);

const billingCycle = v.union(v.literal("monthly"), v.literal("annual"));

const paymentMethod = v.union(
    v.literal("mobile_money"),
    v.literal("bank_transfer"),
    v.literal("card")
);

const subscriptionStatus = v.union(
    v.literal("trial"),
    v.literal("active"),
    v.literal("past_due"),
    v.literal("cancelled")
);

/* ─── Plan Pricing ─────────────────────────────── */

const PLAN_PRICING: Record<string, number> = {
    starter: 49000,
    pro: 149000,
    enterprise: 349000,
};

/* ─── Queries ────────────────────────────────── */

/**
 * Get the subscription for a specific organization.
 */
export const getByOrganizationId = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .first();
    },
});

/**
 * List all subscriptions (for admin dashboard).
 */
export const list = query({
    args: {
        status: v.optional(subscriptionStatus),
    },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("subscriptions")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        }
        return await ctx.db.query("subscriptions").collect();
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Create a subscription when activating a client.
 */
export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        plan: planType,
        billingCycle: billingCycle,
        paymentMethod: v.optional(paymentMethod),
        maxUsers: v.optional(v.number()),
        modules: v.optional(
            v.object({
                iDocument: v.boolean(),
                iArchive: v.boolean(),
                iSignature: v.boolean(),
                iAsted: v.boolean(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) throw new Error("Organisation introuvable");

        // Check if subscription already exists
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .first();

        if (existing) {
            throw new Error("Un abonnement existe déjà pour cette organisation");
        }

        const now = Date.now();
        const periodDays = args.billingCycle === "annual" ? 365 : 30;
        const periodEnd = now + periodDays * 24 * 60 * 60 * 1000;

        const pricePerUser = PLAN_PRICING[args.plan] ?? 49000;
        const maxUsers = args.maxUsers ?? org.quota?.maxUsers ?? 25;

        return await ctx.db.insert("subscriptions", {
            organizationId: args.organizationId,
            plan: args.plan,
            pricePerUser,
            activeUsers: 1,
            maxUsers,
            modules: args.modules ?? {
                iDocument: true,
                iArchive: true,
                iSignature: true,
                iAsted: false,
            },
            billingCycle: args.billingCycle,
            paymentMethod: args.paymentMethod ?? "mobile_money",
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        });
    },
});
