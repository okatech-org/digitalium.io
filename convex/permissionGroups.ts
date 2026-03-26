// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Permission Groups (v7)
// CRUD pour les groupes de permissions ad-hoc
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── Queries ─────────────────────────────────────

/** List active permission groups for an org */
export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const groups = await ctx.db
            .query("permission_groups")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
        return groups
            .filter((g) => g.estActif)
            .sort((a, b) => a.nom.localeCompare(b.nom));
    },
});

/** List ALL permission groups (active + inactive) */
export const listAll = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("permission_groups")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
    },
});

/** Get a permission group by ID */
export const getById = query({
    args: { id: v.id("permission_groups") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ─── Mutations ───────────────────────────────────

/** Create a new permission group */
export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        description: v.optional(v.string()),
        couleur: v.optional(v.string()),
        members: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        // Vérifier l'unicité du nom dans l'org
        const existing = await ctx.db
            .query("permission_groups")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("nom"), args.nom))
            .first();

        if (existing) {
            throw new Error("Un groupe avec ce nom existe déjà dans cette organisation");
        }

        const now = Date.now();
        return await ctx.db.insert("permission_groups", {
            organizationId: args.organizationId,
            nom: args.nom,
            description: args.description,
            couleur: args.couleur,
            members: args.members,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Update a permission group */
export const update = mutation({
    args: {
        id: v.id("permission_groups"),
        nom: v.optional(v.string()),
        description: v.optional(v.string()),
        couleur: v.optional(v.string()),
        members: v.optional(v.array(v.string())),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const cleaned = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    },
});

/** Add a member to the group */
export const addMember = mutation({
    args: {
        id: v.id("permission_groups"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const group = await ctx.db.get(args.id);
        if (!group) throw new Error("Groupe introuvable");

        if (group.members.includes(args.userId)) return; // already a member

        await ctx.db.patch(args.id, {
            members: [...group.members, args.userId],
            updatedAt: Date.now(),
        });
    },
});

/** Remove a member from the group */
export const removeMember = mutation({
    args: {
        id: v.id("permission_groups"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const group = await ctx.db.get(args.id);
        if (!group) throw new Error("Groupe introuvable");

        await ctx.db.patch(args.id, {
            members: group.members.filter((m) => m !== args.userId),
            updatedAt: Date.now(),
        });
    },
});

/** Soft delete a permission group + cleanup references */
export const remove = mutation({
    args: { id: v.id("permission_groups") },
    handler: async (ctx, args) => {
        // Soft delete
        await ctx.db.patch(args.id, {
            estActif: false,
            updatedAt: Date.now(),
        });

        // Remove groupId reference from cell_access_rules
        const rules = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_groupId", (q) => q.eq("groupId", args.id))
            .collect();

        for (const rule of rules) {
            await ctx.db.patch(rule._id, {
                groupId: undefined,
                updatedAt: Date.now(),
            });
        }
    },
});
