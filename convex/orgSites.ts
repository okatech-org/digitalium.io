import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Org Sites (v2)
// CRUD pour les sites physiques d'une organisation
// ═══════════════════════════════════════════════

const siteType = v.union(
    v.literal("siege"),
    v.literal("filiale"),
    v.literal("agence"),
    v.literal("bureau_regional"),
    v.literal("antenne")
);

/* ─── Queries ────────────────────────────────── */

export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("org_sites")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("org_sites") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getSiege = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const sites = await ctx.db
            .query("org_sites")
            .withIndex("by_org_siege", (q) =>
                q.eq("organizationId", args.organizationId).eq("estSiege", true)
            )
            .collect();
        return sites[0] ?? null;
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        type: siteType,
        adresse: v.string(),
        ville: v.string(),
        pays: v.string(),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        estSiege: v.boolean(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Si ce site est le siège, retirer le flag des autres sites
        if (args.estSiege) {
            const existingSieges = await ctx.db
                .query("org_sites")
                .withIndex("by_org_siege", (q) =>
                    q.eq("organizationId", args.organizationId).eq("estSiege", true)
                )
                .collect();
            for (const s of existingSieges) {
                await ctx.db.patch(s._id, { estSiege: false, updatedAt: now });
            }
        }

        return await ctx.db.insert("org_sites", {
            ...args,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("org_sites"),
        nom: v.optional(v.string()),
        type: v.optional(siteType),
        adresse: v.optional(v.string()),
        ville: v.optional(v.string()),
        pays: v.optional(v.string()),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        estSiege: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Site introuvable");

        const now = Date.now();

        // Si on marque ce site comme siège, retirer le flag des autres
        if (updates.estSiege) {
            const existingSieges = await ctx.db
                .query("org_sites")
                .withIndex("by_org_siege", (q) =>
                    q.eq("organizationId", existing.organizationId).eq("estSiege", true)
                )
                .collect();
            for (const s of existingSieges) {
                if (s._id !== id) {
                    await ctx.db.patch(s._id, { estSiege: false, updatedAt: now });
                }
            }
        }

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: now });
        return id;
    },
});

export const remove = mutation({
    args: { id: v.id("org_sites") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Site introuvable");

        // Vérifier qu'aucune org_unit ne référence ce site
        const linkedUnits = await ctx.db
            .query("org_units")
            .withIndex("by_siteId", (q) => q.eq("siteId", args.id))
            .collect();

        if (linkedUnits.length > 0) {
            throw new Error(
                `Impossible de supprimer : ${linkedUnits.length} unité(s) liée(s) à ce site`
            );
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const setSiege = mutation({
    args: {
        id: v.id("org_sites"),
    },
    handler: async (ctx, args) => {
        const site = await ctx.db.get(args.id);
        if (!site) throw new Error("Site introuvable");

        const now = Date.now();

        // Retirer le flag siège de tous les sites de cette org
        const allSites = await ctx.db
            .query("org_sites")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", site.organizationId)
            )
            .collect();

        for (const s of allSites) {
            if (s.estSiege && s._id !== args.id) {
                await ctx.db.patch(s._id, { estSiege: false, updatedAt: now });
            }
        }

        await ctx.db.patch(args.id, { estSiege: true, updatedAt: now });
        return args.id;
    },
});
