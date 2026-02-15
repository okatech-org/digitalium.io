import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Business Roles (v2)
// CRUD pour les rôles métier d'une organisation
// Scopés par type d'unité organisationnelle
// ═══════════════════════════════════════════════

const orgUnitType = v.union(
    v.literal("presidence"),
    v.literal("direction_generale"),
    v.literal("direction"),
    v.literal("sous_direction"),
    v.literal("departement"),
    v.literal("service"),
    v.literal("bureau"),
    v.literal("unite"),
    v.literal("cellule")
);

/* ─── Queries ────────────────────────────────── */

export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("business_roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("business_roles") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByCategorie = query({
    args: {
        organizationId: v.id("organizations"),
        categorie: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("business_roles")
            .withIndex("by_org_categorie", (q) =>
                q.eq("organizationId", args.organizationId).eq("categorie", args.categorie)
            )
            .collect();
    },
});

export const listByUnitType = query({
    args: {
        organizationId: v.id("organizations"),
        orgUnitType: orgUnitType,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("business_roles")
            .withIndex("by_org_unitType", (q) =>
                q.eq("organizationId", args.organizationId).eq("orgUnitType", args.orgUnitType)
            )
            .collect();
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        description: v.optional(v.string()),
        categorie: v.optional(v.string()),
        orgUnitType: v.optional(orgUnitType),
        niveau: v.optional(v.number()),
        couleur: v.optional(v.string()),
        icone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("business_roles", {
            ...args,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("business_roles"),
        nom: v.optional(v.string()),
        description: v.optional(v.string()),
        categorie: v.optional(v.string()),
        niveau: v.optional(v.number()),
        couleur: v.optional(v.string()),
        icone: v.optional(v.string()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Rôle métier introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
        return id;
    },
});

export const remove = mutation({
    args: {
        id: v.id("business_roles"),
        force: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Rôle métier introuvable");

        // Membres rattachés
        const members = await ctx.db
            .query("organization_members")
            .withIndex("by_businessRoleId", (q) => q.eq("businessRoleId", args.id))
            .collect();

        // Règles d'accès rattachées
        const rules = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_businessRoleId", (q) => q.eq("businessRoleId", args.id))
            .collect();

        if (args.force) {
            // Force: détacher les membres et supprimer les règles
            for (const m of members) {
                await ctx.db.patch(m._id, { businessRoleId: undefined });
            }
            for (const r of rules) {
                await ctx.db.delete(r._id);
            }
        } else {
            if (members.length > 0) {
                throw new Error(
                    `Impossible de supprimer : ${members.length} membre(s) avec ce rôle`
                );
            }
            if (rules.length > 0) {
                throw new Error(
                    `Impossible de supprimer : ${rules.length} règle(s) d'accès liée(s)`
                );
            }
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const bulkCreate = mutation({
    args: {
        organizationId: v.id("organizations"),
        roles: v.array(
            v.object({
                nom: v.string(),
                description: v.optional(v.string()),
                categorie: v.optional(v.string()),
                orgUnitType: v.optional(orgUnitType),
                niveau: v.optional(v.number()),
                couleur: v.optional(v.string()),
                icone: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const ids = [];

        for (const role of args.roles) {
            const id = await ctx.db.insert("business_roles", {
                organizationId: args.organizationId,
                ...role,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });
            ids.push(id);
        }

        return { created: ids.length };
    },
});
