import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Filing Structures (v2)
// CRUD pour les modèles de classement
// ═══════════════════════════════════════════════

/* ─── Queries ────────────────────────────────── */

export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("filing_structures")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

export const getActive = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const structures = await ctx.db
            .query("filing_structures")
            .withIndex("by_org_actif", (q) =>
                q.eq("organizationId", args.organizationId).eq("estActif", true)
            )
            .collect();
        return structures[0] ?? null;
    },
});

export const getById = query({
    args: { id: v.id("filing_structures") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        description: v.optional(v.string()),
        type: v.union(v.literal("standard"), v.literal("custom")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("filing_structures", {
            ...args,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("filing_structures"),
        nom: v.optional(v.string()),
        description: v.optional(v.string()),
        type: v.optional(v.union(v.literal("standard"), v.literal("custom"))),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Structure de classement introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
        return id;
    },
});

export const setActive = mutation({
    args: {
        id: v.id("filing_structures"),
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const structure = await ctx.db.get(args.id);
        if (!structure) throw new Error("Structure de classement introuvable");

        const now = Date.now();

        // Désactiver toutes les autres structures de cette org
        const allStructures = await ctx.db
            .query("filing_structures")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", structure.organizationId)
            )
            .collect();

        for (const s of allStructures) {
            if (s._id !== args.id && s.estActif) {
                await ctx.db.patch(s._id, { estActif: false, updatedAt: now });
            }
        }

        await ctx.db.patch(args.id, { estActif: true, updatedAt: now });
        return args.id;
    },
});
