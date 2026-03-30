import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
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
        retentionCategoryId: v.optional(v.id("archive_categories")),
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

        // ── Validation : profondeur maximale (config org) ──
        const org = await ctx.db.get(args.organizationId);
        const { getDepthConfig } = await import("./lib/depthConfig");
        const { maxDepth } = getDepthConfig(org);
        if (niveau >= maxDepth) {
            throw new Error(
                `Profondeur maximale atteinte (${maxDepth} niveaux). Modifiez la configuration de classement de l'organisation pour augmenter la limite.`
            );
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
            retentionCategoryId: args.retentionCategoryId,
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


        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: "system",
            action: "filing_cell.create",
            resourceType: "filing_cell" as const,
            resourceId: String(cellId),
            details: { code: args.code, intitule: args.intitule, niveau },
            createdAt: now,
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "filingCells.update",
            entiteType: "filing_cells",
            entiteId: "system",
            userId: "system",
        });
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
        retentionCategoryId: v.optional(v.id("archive_categories")),
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


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "filingCells.remove",
            entiteType: "filing_cells",
            entiteId: "system",
            userId: "system",
        });
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

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: cell.organizationId,
            userId: "system",
            action: "filing_cell.delete",
            resourceType: "filing_cell" as const,
            resourceId: String(args.id),
            details: { code: cell.code, intitule: cell.intitule },
            createdAt: Date.now(),
        });

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
                retentionCategoryId: v.optional(v.string()),
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
                retentionCategoryId: cell.retentionCategoryId
                    ? (cell.retentionCategoryId as Id<"archive_categories">)
                    : undefined,
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


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "filingCells.bulkCreate",
            entiteType: "filing_cells",
            entiteId: "system",
            userId: "system",
        });
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


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "filingCells.syncFoldersFromCells",
            entiteType: "filing_cells",
            entiteId: "system",
            userId: "system",
        });
        return { synced, total: cells.length };
    },
});

// ─── Sync: reconstruire les filing_cells depuis l'arborescence de dossiers ──

export const syncFromFolders = mutation({
    args: {
        filingStructureId: v.id("filing_structures"),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let cellsCreated = 0;
        let cellsRemoved = 0;

        // 1. Récupérer toutes les filing_cells de cette structure
        const existingCells = await ctx.db
            .query("filing_cells")
            .withIndex("by_filingStructureId", (q) => q.eq("filingStructureId", args.filingStructureId))
            .collect();

        // 2. Récupérer tous les dossiers actifs de l'org
        const allFolders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        const activeFolders = allFolders.filter((f) => f.status === "active");

        // 3. Supprimer les cells dont le dossier lié est trashed ou inexistant
        for (const cell of existingCells) {
            if (!cell.estActif) continue;

            // Trouver le dossier lié via filingCellId (reverse lookup)
            const linkedFolder = activeFolders.find(
                (f) => f.filingCellId && String(f.filingCellId) === String(cell._id)
            );

            if (!linkedFolder) {
                // Le dossier n'existe plus ou est trashed → désactiver la cell
                await ctx.db.patch(cell._id, {
                    estActif: false,
                    updatedAt: now,
                });
                cellsRemoved++;
            }
        }

        // 4. Créer des cells pour les dossiers actifs sans cell liée
        // Trier par profondeur (parents d'abord)
        const folderDepths = new Map<string, number>();
        for (const folder of activeFolders) {
            let depth = 0;
            let current = folder;
            while (current.parentFolderId) {
                depth++;
                const parent = activeFolders.find((f) => String(f._id) === String(current.parentFolderId));
                if (!parent) break;
                current = parent;
                if (depth > 20) break;
            }
            folderDepths.set(String(folder._id), depth);
        }

        const sortedFolders = [...activeFolders].sort(
            (a, b) => (folderDepths.get(String(a._id)) ?? 0) - (folderDepths.get(String(b._id)) ?? 0)
        );

        // Map de folder._id → cell._id pour résolution des parents
        const folderToCellMap = new Map<string, Id<"filing_cells">>();
        for (const cell of existingCells) {
            if (!cell.estActif) continue;
            const linkedFolder = activeFolders.find(
                (f) => f.filingCellId && String(f.filingCellId) === String(cell._id)
            );
            if (linkedFolder) {
                folderToCellMap.set(String(linkedFolder._id), cell._id);
            }
        }

        for (const folder of sortedFolders) {
            // Vérifier si une cell existe déjà pour ce dossier
            const hasCell = folderToCellMap.has(String(folder._id));
            if (hasCell) continue;

            // Vérifier si le dossier a un filingCellId qui pointe vers une cell active
            if (folder.filingCellId) {
                const existingCell = existingCells.find(
                    (c) => String(c._id) === String(folder.filingCellId) && c.estActif
                );
                if (existingCell) {
                    folderToCellMap.set(String(folder._id), existingCell._id);
                    continue;
                }
            }

            // Générer un code automatique depuis le nom du dossier
            const rawCode = folder.name
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer accents
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .substring(0, 6);
            let code = rawCode || "DOC";

            // S'assurer de l'unicité du code
            const existingCodes = new Set(existingCells.map((c) => c.code));
            let suffix = 1;
            while (existingCodes.has(code)) {
                code = `${rawCode.substring(0, 5)}${suffix}`;
                suffix++;
            }
            existingCodes.add(code);

            // Résoudre le parent cell depuis le parent folder
            let parentCellId: Id<"filing_cells"> | undefined;
            if (folder.parentFolderId) {
                parentCellId = folderToCellMap.get(String(folder.parentFolderId));
            }

            const depth = folderDepths.get(String(folder._id)) ?? 0;

            // Créer la filing_cell
            const cellId = await ctx.db.insert("filing_cells", {
                filingStructureId: args.filingStructureId,
                organizationId: args.organizationId,
                code,
                intitule: folder.name,
                parentId: parentCellId,
                niveau: depth,
                description: folder.description ?? "",
                accessDefaut: "restreint",
                tags: folder.tags ?? [],
                ordre: cellsCreated,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });

            // Lier le dossier à la nouvelle cell
            await ctx.db.patch(folder._id, {
                filingCellId: cellId,
                isSystem: true, // Marquer comme géré par le classement
                updatedAt: now,
            });

            folderToCellMap.set(String(folder._id), cellId);
            cellsCreated++;
        }

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: "system",
            action: "filing_structure.sync_from_folders",
            resourceType: "filing_structure" as const,
            resourceId: String(args.filingStructureId),
            details: { cellsCreated, cellsRemoved },
            createdAt: now,
        });

        return { cellsCreated, cellsRemoved };
    },
});
