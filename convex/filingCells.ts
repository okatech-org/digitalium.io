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

        // ── Validation du code (v7) ──
        const codeRegex = /^[A-Za-z0-9.\-]{1,9}$/;
        if (!codeRegex.test(args.code)) {
            throw new Error(
                "Le code doit contenir entre 1 et 9 caractères alphanumériques, points ou tirets uniquement."
            );
        }

        // ── Unicité globale du code dans la structure ──
        const existingWithCode = await ctx.db
            .query("filing_cells")
            .withIndex("by_filingStructureId", (q) =>
                q.eq("filingStructureId", args.filingStructureId)
            )
            .filter((q) => q.eq(q.field("code"), args.code))
            .first();

        if (existingWithCode) {
            throw new Error(
                `Le code "${args.code}" est déjà utilisé dans cette structure de classement (par "${existingWithCode.intitule}"). Chaque code doit être unique à travers tous les niveaux.`
            );
        }

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

        const cellId = await ctx.db.insert("filing_cells", {
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

        // Sync: Auto-create corresponding folder in iDocument
        let parentFolderId = undefined;
        if (args.parentId) {
            const parentFolder = await ctx.db
                .query("folders")
                .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.parentId!))
                .first();
            if (parentFolder) {
                parentFolderId = parentFolder._id;
            }
        }

        // We use "system" as dummy createdBy since it's an auto-generated systemic folder
        await ctx.db.insert("folders", {
            name: args.intitule,
            description: args.description ?? "",
            organizationId: args.organizationId,
            createdBy: "system",
            parentFolderId,
            filingCellId: cellId,
            isSystem: true,
            tags: args.tags ?? [],
            permissions: {
                visibility: args.accessDefaut === "public" ? "team" : "private",
                sharedWith: [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });

        // Phase 12: Auto-seed default access rules for this new cell
        // Fetch all business_roles for this org
        const businessRoles = await ctx.db
            .query("business_roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        const GOVERNANCE_TYPES = ["presidence", "direction_generale", "direction"];

        for (const role of businessRoles) {
            if (!role.estActif) continue;
            // Gouvernance / direction → admin, others → aucun (no rule created)
            const isGov = role.orgUnitType && GOVERNANCE_TYPES.includes(role.orgUnitType);
            if (isGov) {
                await ctx.db.insert("cell_access_rules", {
                    organizationId: args.organizationId,
                    filingCellId: cellId,
                    businessRoleId: role._id,
                    acces: "admin",
                    priorite: 5, // role-level priority
                    estActif: true,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        return cellId;
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

        // ── Validation du code si modifié (v7) ──
        if (args.code !== undefined) {
            const codeRegex = /^[A-Za-z0-9.\-]{1,9}$/;
            if (!codeRegex.test(args.code)) {
                throw new Error(
                    "Le code doit contenir entre 1 et 9 caractères alphanumériques, points ou tirets uniquement."
                );
            }
            if (args.code !== existing.code) {
                const duplicate = await ctx.db
                    .query("filing_cells")
                    .withIndex("by_filingStructureId", (q) =>
                        q.eq("filingStructureId", existing.filingStructureId)
                    )
                    .filter((q) => q.eq(q.field("code"), args.code!))
                    .first();
                if (duplicate && duplicate._id !== id) {
                    throw new Error(
                        `Le code "${args.code}" est déjà utilisé dans cette structure de classement (par "${duplicate.intitule}").`
                    );
                }
            }
        }

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });

        // Sync: Update corresponding folder if name, description, or tags changed
        if (args.intitule !== undefined || args.description !== undefined || args.tags !== undefined) {
            const folder = await ctx.db
                .query("folders")
                .withIndex("by_filingCellId", (q) => q.eq("filingCellId", id))
                .first();

            if (folder) {
                const folderUpdates: any = { updatedAt: Date.now() };
                if (args.intitule !== undefined) folderUpdates.name = args.intitule;
                if (args.description !== undefined) folderUpdates.description = args.description;
                if (args.tags !== undefined) folderUpdates.tags = args.tags;
                await ctx.db.patch(folder._id, folderUpdates);
            }
        }

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

        // Sync: Mark corresponding folder as trashed
        const folder = await ctx.db
            .query("folders")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.id))
            .first();
        if (folder) {
            await ctx.db.patch(folder._id, { status: "trashed", updatedAt: Date.now() });
        }

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

        // Phase 12: Pre-load business_roles for auto-seed access rules
        const businessRoles = await ctx.db
            .query("business_roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        const GOVERNANCE_TYPES = ["presidence", "direction_generale", "direction"];

        // Trier par niveau (les parents d'abord)
        const sorted = [...args.cells].sort((a, b) => a.niveau - b.niveau);

        for (const cell of sorted) {
            // ── Validation du code (v7) ──
            const codeRegex = /^[A-Za-z0-9.\-]{1,9}$/;
            if (!codeRegex.test(cell.code)) {
                throw new Error(
                    `Code "${cell.code}" invalide pour "${cell.intitule}". Max 9 car. : lettres, chiffres, points, tirets.`
                );
            }
            // Check uniqueness against existing DB codes
            const dbDuplicate = await ctx.db
                .query("filing_cells")
                .withIndex("by_filingStructureId", (q) =>
                    q.eq("filingStructureId", args.filingStructureId)
                )
                .filter((q) => q.eq(q.field("code"), cell.code))
                .first();
            if (dbDuplicate) {
                throw new Error(
                    `Le code "${cell.code}" est déjà utilisé dans cette structure (par "${dbDuplicate.intitule}").`
                );
            }
            // Check uniqueness within the batch (earlier items)
            const batchDuplicate = sorted
                .slice(0, sorted.indexOf(cell))
                .find((c) => c.code === cell.code);
            if (batchDuplicate) {
                throw new Error(
                    `Code "${cell.code}" dupliqué dans le lot (utilisé par "${batchDuplicate.intitule}" et "${cell.intitule}").`
                );
            }

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

            // Sync: create corresponding folder
            let parentFolderId = undefined;
            if (parentId) {
                const parentFolder = await ctx.db
                    .query("folders")
                    .withIndex("by_filingCellId", (q) => q.eq("filingCellId", parentId))
                    .first();
                if (parentFolder) {
                    parentFolderId = parentFolder._id;
                }
            }

            await ctx.db.insert("folders", {
                name: cell.intitule,
                description: cell.description ?? "",
                organizationId: args.organizationId,
                createdBy: "system",
                parentFolderId,
                filingCellId: result,
                isSystem: true,
                tags: cell.tags ?? [],
                permissions: {
                    visibility: cell.accessDefaut === "public" ? "team" : "private",
                    sharedWith: [],
                    teamIds: [],
                },
                isTemplate: false,
                status: "active",
                fileCount: 0,
                createdAt: now,
                updatedAt: now,
            });

            // Phase 12: Auto-seed default access rules for this new cell
            for (const role of businessRoles) {
                if (!role.estActif) continue;
                const isGov = role.orgUnitType && GOVERNANCE_TYPES.includes(role.orgUnitType);
                if (isGov) {
                    await ctx.db.insert("cell_access_rules", {
                        organizationId: args.organizationId,
                        filingCellId: result,
                        businessRoleId: role._id,
                        acces: "admin",
                        priorite: 5,
                        estActif: true,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
        }

        return { created: tempIdMap.size };
    },
});

/**
 * syncFoldersFromCells — Backfill missing folders for existing filing_cells.
 * This handles orgs whose cells were created before folder sync logic was added.
 * Safe to run multiple times (idempotent).
 */
export const syncFoldersFromCells = mutation({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Get all active filing_cells for this org
        const cells = await ctx.db
            .query("filing_cells")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.eq(q.field("estActif"), true))
            .collect();

        // 2. Get all existing folders with filingCellId for this org
        const existingFolders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        const cellIdsWithFolders = new Set(
            existingFolders
                .filter((f) => f.filingCellId)
                .map((f) => f.filingCellId!.toString())
        );

        // 3. Find cells without corresponding folders
        const missingCells = cells.filter((c) => !cellIdsWithFolders.has(c._id.toString()));

        if (missingCells.length === 0) {
            return { synced: 0, message: "All cells already have folders" };
        }

        // 4. Sort by niveau (parents first) to ensure parent folders exist before children
        missingCells.sort((a, b) => a.niveau - b.niveau);

        let synced = 0;
        for (const cell of missingCells) {
            // Resolve parent folder
            let parentFolderId = undefined;
            if (cell.parentId) {
                const parentFolder = await ctx.db
                    .query("folders")
                    .withIndex("by_filingCellId", (q) => q.eq("filingCellId", cell.parentId!))
                    .first();
                if (parentFolder) {
                    parentFolderId = parentFolder._id;
                }
            }

            await ctx.db.insert("folders", {
                name: cell.intitule,
                description: cell.description ?? "",
                organizationId: args.organizationId,
                createdBy: "system",
                parentFolderId,
                filingCellId: cell._id,
                isSystem: true,
                tags: cell.tags ?? [],
                permissions: {
                    visibility: cell.accessDefaut === "public" ? "team" : "private",
                    sharedWith: [],
                    teamIds: [],
                },
                isTemplate: false,
                status: "active",
                fileCount: 0,
                createdAt: now,
                updatedAt: now,
            });
            synced++;
        }

        return { synced, total: cells.length };
    },
});
