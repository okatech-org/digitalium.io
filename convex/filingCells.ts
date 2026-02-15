import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Filing Cells (v2)
// CRUD pour les cellules de classement (arborescence)
// ═══════════════════════════════════════════════

const confidentialityLevel = v.union(
    v.literal("public"),
    v.literal("restreint"),
    v.literal("confidentiel")
);

/* ─── Queries ────────────────────────────────── */

export const list = query({
    args: { filingStructureId: v.id("filing_structures") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("filing_cells")
            .withIndex("by_filingStructureId", (q) =>
                q.eq("filingStructureId", args.filingStructureId)
            )
            .collect();
    },
});

export const listByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("filing_cells")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

export const getTree = query({
    args: { filingStructureId: v.id("filing_structures") },
    handler: async (ctx, args) => {
        const allCells = await ctx.db
            .query("filing_cells")
            .withIndex("by_filingStructureId", (q) =>
                q.eq("filingStructureId", args.filingStructureId)
            )
            .collect();

        // Construire l'arbre
        const cellMap = new Map(
            allCells.map((c) => [c._id, { ...c, children: [] as typeof allCells }])
        );
        const roots: (typeof allCells[0] & { children: typeof allCells })[] = [];

        for (const cell of Array.from(cellMap.values())) {
            if (cell.parentId && cellMap.has(cell.parentId)) {
                cellMap.get(cell.parentId)!.children.push(cell);
            } else {
                roots.push(cell);
            }
        }

        // Trier par ordre
        const sortByOrdre = (nodes: typeof roots) => {
            nodes.sort((a, b) => a.ordre - b.ordre);
            for (const n of nodes) sortByOrdre(n.children as typeof roots);
        };
        sortByOrdre(roots);

        return roots;
    },
});

export const getById = query({
    args: { id: v.id("filing_cells") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getChildren = query({
    args: { parentId: v.id("filing_cells") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("filing_cells")
            .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId))
            .collect();
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        filingStructureId: v.id("filing_structures"),
        organizationId: v.id("organizations"),
        code: v.string(),
        intitule: v.string(),
        parentId: v.optional(v.id("filing_cells")),
        niveau: v.optional(v.number()),
        description: v.optional(v.string()),
        accessDefaut: v.optional(confidentialityLevel),
        moduleId: v.optional(v.string()),
        icone: v.optional(v.string()),
        couleur: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        ordre: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Calculer le niveau si non spécifié
        let niveau = args.niveau ?? 0;
        if (args.niveau === undefined && args.parentId) {
            const parent = await ctx.db.get(args.parentId);
            if (parent) niveau = parent.niveau + 1;
        }

        // Calculer l'ordre si non spécifié
        let ordre = args.ordre ?? 0;
        if (args.ordre === undefined) {
            const siblings = args.parentId
                ? await ctx.db
                      .query("filing_cells")
                      .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId!))
                      .collect()
                : await ctx.db
                      .query("filing_cells")
                      .withIndex("by_filingStructureId", (q) =>
                          q.eq("filingStructureId", args.filingStructureId)
                      )
                      .filter((q) => q.eq(q.field("parentId"), undefined))
                      .collect();
            ordre = siblings.length;
        }

        return await ctx.db.insert("filing_cells", {
            filingStructureId: args.filingStructureId,
            organizationId: args.organizationId,
            code: args.code,
            intitule: args.intitule,
            parentId: args.parentId,
            niveau,
            description: args.description,
            accessDefaut: args.accessDefaut ?? "restreint",
            moduleId: args.moduleId,
            icone: args.icone,
            couleur: args.couleur,
            tags: args.tags ?? [],
            ordre,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("filing_cells"),
        code: v.optional(v.string()),
        intitule: v.optional(v.string()),
        description: v.optional(v.string()),
        accessDefaut: v.optional(confidentialityLevel),
        moduleId: v.optional(v.string()),
        icone: v.optional(v.string()),
        couleur: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        ordre: v.optional(v.number()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Cellule de classement introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
        return id;
    },
});

export const remove = mutation({
    args: { id: v.id("filing_cells") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Cellule de classement introuvable");

        // Vérifier pas d'enfants
        const children = await ctx.db
            .query("filing_cells")
            .withIndex("by_parentId", (q) => q.eq("parentId", args.id))
            .collect();

        if (children.length > 0) {
            throw new Error(
                `Impossible de supprimer : ${children.length} sous-cellule(s) rattachée(s)`
            );
        }

        // Supprimer les règles d'accès liées
        const rules = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.id))
            .collect();
        for (const r of rules) await ctx.db.delete(r._id);

        // Supprimer les overrides liés
        const overrides = await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.id))
            .collect();
        for (const o of overrides) await ctx.db.delete(o._id);

        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const bulkCreate = mutation({
    args: {
        filingStructureId: v.id("filing_structures"),
        organizationId: v.id("organizations"),
        cells: v.array(
            v.object({
                tempId: v.string(),
                parentTempId: v.optional(v.string()),
                code: v.string(),
                intitule: v.string(),
                niveau: v.number(),
                description: v.optional(v.string()),
                accessDefaut: v.optional(confidentialityLevel),
                moduleId: v.optional(v.string()),
                icone: v.optional(v.string()),
                couleur: v.optional(v.string()),
                tags: v.optional(v.array(v.string())),
                ordre: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const tempIdMap = new Map<string, Id<"filing_cells">>();

        // Trier par niveau (les parents d'abord)
        const sorted = [...args.cells].sort((a, b) => a.niveau - b.niveau);

        for (const cell of sorted) {
            const parentId = cell.parentTempId
                ? tempIdMap.get(cell.parentTempId) ?? undefined
                : undefined;

            const result = await ctx.db.insert("filing_cells", {
                filingStructureId: args.filingStructureId,
                organizationId: args.organizationId,
                code: cell.code,
                intitule: cell.intitule,
                parentId,
                niveau: cell.niveau,
                description: cell.description,
                accessDefaut: cell.accessDefaut ?? "restreint",
                moduleId: cell.moduleId,
                icone: cell.icone,
                couleur: cell.couleur,
                tags: cell.tags ?? [],
                ordre: cell.ordre,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });

            tempIdMap.set(cell.tempId, result);
        }

        return { created: tempIdMap.size };
    },
});
