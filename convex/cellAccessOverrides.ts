import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Cell Access Overrides (v2)
// Habilitations individuelles par utilisateur
// ═══════════════════════════════════════════════

const accessLevel = v.union(
    v.literal("aucun"),
    v.literal("lecture"),
    v.literal("ecriture"),
    v.literal("gestion"),
    v.literal("admin")
);

/* ─── Queries ────────────────────────────────── */

export const getForCell = query({
    args: { filingCellId: v.id("filing_cells") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.filingCellId))
            .collect();
    },
});

export const getForUser = query({
    args: {
        userId: v.string(),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
            .collect();
    },
});

export const getForCellAndUser = query({
    args: {
        filingCellId: v.id("filing_cells"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_cell_user", (q) =>
                q.eq("filingCellId", args.filingCellId).eq("userId", args.userId)
            )
            .filter((q) => q.eq(q.field("estActif"), true))
            .first();
    },
});

/** Liste toutes les dérogations d'une organisation */
export const listByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

/** Récupérer une dérogation par ID */
export const getById = query({
    args: { id: v.id("cell_access_overrides") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/* ─── Mutations ──────────────────────────────── */

export const createOverride = mutation({
    args: {
        organizationId: v.id("organizations"),
        filingCellId: v.id("filing_cells"),
        userId: v.string(),
        acces: accessLevel,
        motif: v.optional(v.string()),
        accordePar: v.string(),
        dateExpiration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Désactiver les overrides existants pour cet user/cell
        const existing = await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_cell_user", (q) =>
                q.eq("filingCellId", args.filingCellId).eq("userId", args.userId)
            )
            .filter((q) => q.eq(q.field("estActif"), true))
            .collect();

        for (const o of existing) {
            await ctx.db.patch(o._id, { estActif: false, updatedAt: now });
        }

        return await ctx.db.insert("cell_access_overrides", {
            organizationId: args.organizationId,
            filingCellId: args.filingCellId,
            userId: args.userId,
            acces: args.acces,
            motif: args.motif,
            accordePar: args.accordePar,
            dateExpiration: args.dateExpiration,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateOverride = mutation({
    args: {
        id: v.id("cell_access_overrides"),
        acces: v.optional(accessLevel),
        motif: v.optional(v.string()),
        dateExpiration: v.optional(v.number()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Habilitation introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
        return id;
    },
});

export const removeOverride = mutation({
    args: { id: v.id("cell_access_overrides") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Habilitation introuvable");

        // Soft delete
        await ctx.db.patch(args.id, { estActif: false, updatedAt: Date.now() });
        return args.id;
    },
});

/** Supprimer définitivement une dérogation */
export const deleteOverride = mutation({
    args: { id: v.id("cell_access_overrides") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

/** Prolonger la date d'expiration d'une dérogation */
export const extendExpiration = mutation({
    args: {
        id: v.id("cell_access_overrides"),
        dateExpiration: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Habilitation introuvable");

        await ctx.db.patch(args.id, {
            dateExpiration: args.dateExpiration,
            updatedAt: Date.now(),
        });
    },
});
