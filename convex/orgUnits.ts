import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Org Units (v2)
// CRUD pour les unités organisationnelles (hiérarchie)
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
            .query("org_units")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

export const getTree = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const allUnits = await ctx.db
            .query("org_units")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        // Construire l'arbre à partir de la liste plate
        const unitMap = new Map(allUnits.map((u) => [u._id, { ...u, children: [] as typeof allUnits }]));
        const roots: (typeof allUnits[0] & { children: typeof allUnits })[] = [];

        for (const unit of Array.from(unitMap.values())) {
            if (unit.parentId && unitMap.has(unit.parentId)) {
                unitMap.get(unit.parentId)!.children.push(unit);
            } else {
                roots.push(unit);
            }
        }

        // Trier par ordre à chaque niveau
        const sortByOrdre = (nodes: typeof roots) => {
            nodes.sort((a, b) => a.ordre - b.ordre);
            for (const n of nodes) sortByOrdre(n.children as typeof roots);
        };
        sortByOrdre(roots);

        return roots;
    },
});

export const getById = query({
    args: { id: v.id("org_units") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getChildren = query({
    args: { parentId: v.id("org_units") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("org_units")
            .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId))
            .collect();
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        siteId: v.optional(v.id("org_sites")),
        nom: v.string(),
        type: orgUnitType,
        parentId: v.optional(v.id("org_units")),
        responsable: v.optional(v.string()),
        description: v.optional(v.string()),
        couleur: v.optional(v.string()),
        ordre: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Si pas d'ordre spécifié, calculer le prochain
        let ordre = args.ordre ?? 0;
        if (args.ordre === undefined) {
            const siblings = args.parentId
                ? await ctx.db
                    .query("org_units")
                    .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId!))
                    .collect()
                : await ctx.db
                    .query("org_units")
                    .withIndex("by_org_parent", (q) =>
                        q.eq("organizationId", args.organizationId)
                    )
                    .filter((q) => q.eq(q.field("parentId"), undefined))
                    .collect();
            ordre = siblings.length;
        }

        return await ctx.db.insert("org_units", {
            organizationId: args.organizationId,
            siteId: args.siteId,
            nom: args.nom,
            type: args.type,
            parentId: args.parentId,
            responsable: args.responsable,
            description: args.description,
            couleur: args.couleur ?? "#3B82F6",
            ordre,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("org_units"),
        nom: v.optional(v.string()),
        type: v.optional(orgUnitType),
        siteId: v.optional(v.id("org_sites")),
        responsable: v.optional(v.string()),
        description: v.optional(v.string()),
        couleur: v.optional(v.string()),
        ordre: v.optional(v.number()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Unité organisationnelle introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
        return id;
    },
});

export const remove = mutation({
    args: { id: v.id("org_units") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Unité organisationnelle introuvable");

        // Collecte récursive de toutes les unités à supprimer (parent + descendants)
        const toDelete: Id<"org_units">[] = [];

        async function collectDescendants(unitId: Id<"org_units">) {
            toDelete.push(unitId);
            const children = await ctx.db
                .query("org_units")
                .withIndex("by_parentId", (q) => q.eq("parentId", unitId))
                .collect();
            for (const child of children) {
                await collectDescendants(child._id);
            }
        }

        await collectDescendants(args.id);

        // Supprimer en ordre inverse (feuilles d'abord) + détacher les membres
        let deletedCount = 0;
        for (const unitId of toDelete.reverse()) {
            // Détacher les membres rattachés à cette unité
            const members = await ctx.db
                .query("organization_members")
                .withIndex("by_orgUnitId", (q) => q.eq("orgUnitId", unitId))
                .collect();
            for (const member of members) {
                await ctx.db.patch(member._id, { orgUnitId: undefined });
            }

            await ctx.db.delete(unitId);
            deletedCount++;
        }

        return { deleted: deletedCount };
    },
});

export const move = mutation({
    args: {
        id: v.id("org_units"),
        newParentId: v.optional(v.id("org_units")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Unité organisationnelle introuvable");

        // Empêcher de se déplacer dans un de ses propres enfants
        if (args.newParentId) {
            let current = await ctx.db.get(args.newParentId);
            while (current) {
                if (current._id === args.id) {
                    throw new Error("Impossible de déplacer une unité dans un de ses descendants");
                }
                current = current.parentId ? await ctx.db.get(current.parentId) : null;
            }
        }

        await ctx.db.patch(args.id, {
            parentId: args.newParentId,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});

export const bulkCreate = mutation({
    args: {
        organizationId: v.id("organizations"),
        units: v.array(
            v.object({
                nom: v.string(),
                type: orgUnitType,
                parentTempId: v.optional(v.string()),
                tempId: v.string(),
                siteId: v.optional(v.id("org_sites")),
                responsable: v.optional(v.string()),
                description: v.optional(v.string()),
                couleur: v.optional(v.string()),
                ordre: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const tempIdMap = new Map<string, Id<"org_units">>();

        // Trier par profondeur (les parents d'abord)
        const sorted = [...args.units].sort((a, b) => {
            const depthA = a.parentTempId ? 1 : 0;
            const depthB = b.parentTempId ? 1 : 0;
            return depthA - depthB;
        });

        for (const unit of sorted) {
            const parentId = unit.parentTempId
                ? tempIdMap.get(unit.parentTempId) ?? undefined
                : undefined;

            const result = await ctx.db.insert("org_units", {
                organizationId: args.organizationId,
                siteId: unit.siteId,
                nom: unit.nom,
                type: unit.type,
                parentId,
                responsable: unit.responsable,
                description: unit.description,
                couleur: unit.couleur ?? "#3B82F6",
                ordre: unit.ordre,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });

            tempIdMap.set(unit.tempId, result);
        }

        return { created: tempIdMap.size };
    },
});
