import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Clients
// Client = Organization with status active/suspended/resiliee
// ═══════════════════════════════════════════════

/* ─── Validators ────────────────────────────────── */

const clientStatusFilter = v.union(
    v.literal("all"),
    v.literal("active"),
    v.literal("suspended"),
    v.literal("resiliee")
);

/* ─── Queries ────────────────────────────────── */

/**
 * List all client organizations (active, suspended, resiliee).
 * Optionally filter by status.
 */
export const listClients = query({
    args: {
        statusFilter: v.optional(clientStatusFilter),
    },
    handler: async (ctx, args) => {
        const filter = args.statusFilter ?? "all";

        // Clients are organizations that have been activated at some point
        const clientStatuses = ["active", "suspended", "resiliee"] as const;

        if (filter !== "all") {
            return await ctx.db
                .query("organizations")
                .withIndex("by_status", (q) => q.eq("status", filter))
                .order("desc")
                .collect();
        }

        // For "all", we need to fetch multiple statuses and merge
        const results = await Promise.all(
            clientStatuses.map((status) =>
                ctx.db
                    .query("organizations")
                    .withIndex("by_status", (q) => q.eq("status", status))
                    .order("desc")
                    .collect()
            )
        );

        // Flatten and sort by createdAt desc
        return results.flat().sort((a, b) => b.createdAt - a.createdAt);
    },
});

/**
 * Get aggregated KPI stats for the clients dashboard.
 */
export const getClientStats = query({
    args: {},
    handler: async (ctx) => {
        const allOrgs = await ctx.db.query("organizations").collect();

        const clients = allOrgs.filter((o) =>
            ["active", "suspended", "resiliee"].includes(o.status)
        );

        const active = clients.filter((o) => o.status === "active").length;
        const suspended = clients.filter((o) => o.status === "suspended").length;
        const resiliee = clients.filter((o) => o.status === "resiliee").length;
        const total = clients.length;

        // Pretes (ready to activate)
        const prete = allOrgs.filter((o) => o.status === "prete").length;

        // New this month
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const newThisMonth = clients.filter((c) => {
            const d = new Date(c.createdAt);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

        // Count subscriptions for MRR estimation
        const subscriptions = await ctx.db.query("subscriptions").collect();
        const activeSubscriptions = subscriptions.filter(
            (s) => s.status === "active" || s.status === "trial"
        );

        return {
            total,
            active,
            suspended,
            resiliee,
            prete,
            newThisMonth,
            activeSubscriptions: activeSubscriptions.length,
        };
    },
});

/**
 * Get a single client by ID with members and subscription.
 */
export const getClientById = query({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) return null;

        // Only return if it's a client (active/suspended/resiliee)
        if (!["active", "suspended", "resiliee"].includes(org.status)) {
            return null;
        }

        // Get members
        const members = await ctx.db
            .query("organization_members")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.id)
            )
            .collect();

        // Get subscription
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.id)
            )
            .first();

        return {
            ...org,
            memberCount: members.length,
            members,
            subscription,
        };
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Suspend a client (active → suspended).
 */
export const suspendClient = mutation({
    args: {
        id: v.id("organizations"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");
        if (org.status !== "active") {
            throw new Error(
                `Transition invalide : statut actuel "${org.status}", attendu "active"`
            );
        }

        await ctx.db.patch(args.id, {
            status: "suspended",
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

/**
 * Reactivate a suspended client (suspended → active).
 */
export const reactivateClient = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");
        if (org.status !== "suspended") {
            throw new Error(
                `Transition invalide : statut actuel "${org.status}", attendu "suspended"`
            );
        }

        await ctx.db.patch(args.id, {
            status: "active",
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

/**
 * Terminate a client (→ resiliee). Works from active or suspended.
 */
export const terminateClient = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");
        if (!["active", "suspended"].includes(org.status)) {
            throw new Error(
                `Transition invalide : statut actuel "${org.status}", attendu "active" ou "suspended"`
            );
        }

        await ctx.db.patch(args.id, {
            status: "resiliee",
            updatedAt: Date.now(),
        });

        return args.id;
    },
});
