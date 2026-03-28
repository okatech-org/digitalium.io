// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Folders (iDocument — Dossiers)
// CRUD complet pour les dossiers iDocument
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── Queries ─────────────────────────────────────

export const listByOrg = query({
    args: {
        organizationId: v.id("organizations"),
        parentFolderId: v.optional(v.id("folders")),
    },
    handler: async (ctx, args) => {
        const q = ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"));

        const folders = await q.collect();

        if (args.parentFolderId !== undefined) {
            return folders.filter((f) => f.parentFolderId === args.parentFolderId);
        }
        return folders;
    },
});

export const getById = query({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ─── Mutations ───────────────────────────────────

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.id("organizations"),
        createdBy: v.string(),
        parentFolderId: v.optional(v.id("folders")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // ── Validation : classement obligatoire ──
        // Un dossier DOIT avoir soit un parentFolderId (sous-dossier), soit être créé
        // quand aucune structure de classement n'est active
        if (args.parentFolderId) {
            const parent = await ctx.db.get(args.parentFolderId);
            if (!parent) throw new Error("Dossier parent introuvable");
        } else {
            // Dossier racine : vérifier qu'une structure de classement est active
            const activeStructure = await ctx.db
                .query("filing_structures")
                .withIndex("by_org_actif", (q) =>
                    q.eq("organizationId", args.organizationId).eq("estActif", true)
                )
                .first();

            if (activeStructure) {
                throw new Error(
                    "Un plan de classement est actif. Vous devez créer le dossier via le plan de classement ou comme sous-dossier d'un dossier existant."
                );
            }
        }

        return await ctx.db.insert("folders", {
            name: args.name,
            description: args.description ?? "",
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            parentFolderId: args.parentFolderId,
            tags: args.tags ?? [],
            permissions: {
                visibility: "team",
                sharedWith: [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("folders"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        parentFolderId: v.optional(v.union(v.id("folders"), v.null())),
        archiveSchedule: v.optional(v.object({
            scheduledDate: v.number(),
            targetCategory: v.string(),
            autoArchive: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const patchObj: Record<string, any> = { updatedAt: Date.now() };

        if (updates.name !== undefined) patchObj.name = updates.name;
        if (updates.description !== undefined) patchObj.description = updates.description;
        if (updates.tags !== undefined) patchObj.tags = updates.tags;
        if (updates.archiveSchedule !== undefined) patchObj.archiveSchedule = updates.archiveSchedule;
        if (updates.parentFolderId !== undefined) {
            patchObj.parentFolderId = updates.parentFolderId === null ? undefined : updates.parentFolderId;
        }

        await ctx.db.patch(id, patchObj);
    },
});

export const remove = mutation({
    args: {
        id: v.id("folders"),
        trashedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const folder = await ctx.db.get(args.id);
        if (!folder) throw new Error("Dossier introuvable");

        const now = Date.now();

        // Soft-delete the folder itself
        await ctx.db.patch(args.id, {
            status: "trashed",
            updatedAt: now,
        });

        // Also soft-delete all child folders recursively
        const trashChildren = async (parentId: typeof args.id) => {
            const children = await ctx.db
                .query("folders")
                .withIndex("by_parentFolderId", (q) => q.eq("parentFolderId", parentId))
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();
            for (const child of children) {
                await ctx.db.patch(child._id, { status: "trashed", updatedAt: now });
                await trashChildren(child._id);
            }
        };
        await trashChildren(args.id);

        // Also trash documents inside this folder
        const docs = await ctx.db
            .query("documents")
            .filter((q) =>
                q.and(
                    q.or(
                        q.eq(q.field("folderId"), args.id),
                        q.eq(q.field("parentFolderId"), args.id)
                    ),
                    q.neq(q.field("status"), "trashed")
                )
            )
            .collect();
        for (const doc of docs) {
            await ctx.db.patch(doc._id, {
                previousStatus: doc.status,
                status: "trashed",
                trashedAt: now,
                trashedBy: args.trashedBy ?? doc.createdBy,
                updatedAt: now,
            });
        }
    },
});

// ─── Trash: list trashed folders ────────────────

export const listTrashed = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        if (args.organizationId) {
            return ctx.db
                .query("folders")
                .withIndex("by_org_status", (q) =>
                    q.eq("organizationId", args.organizationId!).eq("status", "trashed")
                )
                .collect();
        }
        return ctx.db
            .query("folders")
            .withIndex("by_status", (q) => q.eq("status", "trashed"))
            .collect();
    },
});

// ─── Trash: restore folder ─────────────────────

export const restore = mutation({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        const folder = await ctx.db.get(args.id);
        if (!folder) throw new Error("Dossier introuvable");
        if (folder.status !== "trashed") throw new Error("Le dossier n'est pas dans la corbeille");

        // If the parent folder is also trashed, move to root instead
        let newParentFolderId = folder.parentFolderId;
        if (newParentFolderId) {
            const parent = await ctx.db.get(newParentFolderId);
            if (!parent || parent.status === "trashed") {
                newParentFolderId = undefined;
            }
        }

        await ctx.db.patch(args.id, {
            status: "active",
            parentFolderId: newParentFolderId,
            updatedAt: Date.now(),
        });
    },
});

// ─── Trash: permanent delete folder ─────────────

export const permanentDelete = mutation({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        const folder = await ctx.db.get(args.id);
        if (!folder) {
            // Dossier déjà supprimé (ex: suppression en masse) → rien à faire
            return;
        }

        // Recursively delete child folders
        const deleteChildren = async (parentId: typeof args.id) => {
            const children = await ctx.db
                .query("folders")
                .withIndex("by_parentFolderId", (q) => q.eq("parentFolderId", parentId))
                .collect();
            for (const child of children) {
                await deleteChildren(child._id);
                await ctx.db.delete(child._id);
            }
        };
        await deleteChildren(args.id);

        // Delete folder archive metadata
        const metas = await ctx.db
            .query("folder_archive_metadata")
            .filter((q) => q.eq(q.field("folderId"), args.id))
            .collect();
        for (const m of metas) {
            await ctx.db.delete(m._id);
        }

        // Delete the folder itself
        await ctx.db.delete(args.id);
    },
});

export const setArchiveSchedule = mutation({
    args: {
        id: v.id("folders"),
        scheduledDate: v.number(),
        targetCategory: v.string(),
        autoArchive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            archiveSchedule: {
                scheduledDate: args.scheduledDate,
                targetCategory: args.targetCategory,
                autoArchive: args.autoArchive,
            },
            updatedAt: Date.now(),
        });
    },
});

// ─── Import helpers ──────────────────────────────

export const getOrCreateByName = mutation({
    args: {
        name: v.string(),
        organizationId: v.id("organizations"),
        createdBy: v.string(),
        parentFolderId: v.optional(v.id("folders")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        // Try to find existing folder with the same name in the same org + parent
        const existing = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) =>
                q.and(
                    q.eq(q.field("name"), args.name),
                    q.eq(q.field("status"), "active"),
                    args.parentFolderId
                        ? q.eq(q.field("parentFolderId"), args.parentFolderId)
                        : q.eq(q.field("parentFolderId"), undefined)
                )
            )
            .first();

        if (existing) {
            return { id: existing._id, created: false };
        }

        // Create new folder
        const now = Date.now();
        const id = await ctx.db.insert("folders", {
            name: args.name,
            description: "",
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            parentFolderId: args.parentFolderId,
            tags: args.tags ?? [],
            permissions: {
                visibility: "team",
                sharedWith: [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id, created: true };
    },
});

export const listByOrgFlat = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();
    },
});

/**
 * getTreeWithPaths — Returns all active folders with full path strings.
 * Used by AI classification to understand the existing folder hierarchy.
 * Example output: { id: "abc123", name: "SGG", path: "Contrats Clients > SGG", depth: 1 }
 */
export const getTreeWithPaths = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const folders = await ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Build a map for quick parent lookup
        const folderMap = new Map(folders.map((f) => [f._id.toString(), f]));

        // Build full path for each folder
        const buildPath = (folderId: string): string => {
            const folder = folderMap.get(folderId);
            if (!folder) return "";
            if (!folder.parentFolderId) return folder.name;
            const parentPath = buildPath(folder.parentFolderId.toString());
            return parentPath ? `${parentPath} > ${folder.name}` : folder.name;
        };

        const getDepth = (folderId: string): number => {
            const folder = folderMap.get(folderId);
            if (!folder || !folder.parentFolderId) return 0;
            return 1 + getDepth(folder.parentFolderId.toString());
        };


        return folders.map((f) => ({
            id: f._id,
            name: f.name,
            path: buildPath(f._id.toString()),
            depth: getDepth(f._id.toString()),
            parentFolderId: f.parentFolderId ?? null,
            tags: f.tags ?? [],
            description: f.description ?? "",
        }));
    },
});
/** Partager un dossier (mise à jour des permissions partagées) */
export const shareFolder = mutation({
    args: {
        id: v.id("folders"),
        sharedWith: v.array(v.string()), // user IDs
        visibility: v.union(
            v.literal("private"),
            v.literal("shared"),
            v.literal("team")
        ),
    },
    handler: async (ctx, args) => {
        const folder = await ctx.db.get(args.id);
        if (!folder) throw new Error("Dossier introuvable");

        const permissions = folder.permissions || {
            visibility: "team",
            sharedWith: [],
            teamIds: [],
        };

        const updatedPermissions = {
            ...permissions,
            visibility: args.visibility,
            sharedWith: args.sharedWith,
        };

        await ctx.db.patch(args.id, {
            permissions: updatedPermissions,
            updatedAt: Date.now(),
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "DOSSIER_MODIFIE",
            action: "folders.shareFolder",
            entiteType: "folders",
            entiteId: "system",
            userId: "system",
        });
        return { success: true };
    },
});
