// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Config Propagation (v7)
// Mutations batch pour propager les changements de configuration
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

// ─── Queries ─────────────────────────────────────

/** Count items impacted by a config change */
export const countImpactedItems = query({
    args: {
        organizationId: v.id("organizations"),
        changeType: v.union(
            v.literal("retention_category"),
            v.literal("filing_cell_access"),
            v.literal("folder_config")
        ),
        targetId: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.changeType === "retention_category") {
            // Count archives and folder_archive_metadata with this category
            const archives = await ctx.db
                .query("archives")
                .withIndex("by_org_category", (q) =>
                    q.eq("organizationId", args.organizationId).eq("categorySlug", args.targetId)
                )
                .collect();
            const activeArchives = archives.filter((a) => a.status !== "destroyed");

            const folderMeta = await ctx.db
                .query("folder_archive_metadata")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId)
                )
                .filter((q) => q.eq(q.field("archiveCategorySlug"), args.targetId))
                .collect();

            return {
                archives: activeArchives.length,
                folders: folderMeta.length,
                total: activeArchives.length + folderMeta.length,
            };
        }

        if (args.changeType === "filing_cell_access") {
            const cellId = args.targetId;
            const rules = await ctx.db
                .query("cell_access_rules")
                .withIndex("by_filingCellId", (q) =>
                    q.eq("filingCellId", cellId as any)
                )
                .collect();

            const folders = await ctx.db
                .query("folders")
                .withIndex("by_filingCellId", (q) =>
                    q.eq("filingCellId", cellId as any)
                )
                .collect();

            return {
                rules: rules.length,
                folders: folders.length,
                total: rules.length + folders.length,
            };
        }

        if (args.changeType === "folder_config") {
            const folderId = args.targetId;
            // Count documents in this folder
            const docs = await ctx.db
                .query("documents")
                .withIndex("by_folderId", (q) =>
                    q.eq("folderId", folderId as any)
                )
                .collect();

            // Count sub-folders
            const subFolders = await ctx.db
                .query("folders")
                .withIndex("by_parentFolderId", (q) =>
                    q.eq("parentFolderId", folderId as any)
                )
                .collect();

            return {
                documents: docs.length,
                subfolders: subFolders.length,
                total: docs.length + subFolders.length,
            };
        }

        return { total: 0 };
    },
});

// ─── Mutations ───────────────────────────────────

/** Propagate a retention category change to existing archives */
export const propagateRetentionChange = mutation({
    args: {
        organizationId: v.id("organizations"),
        categoryId: v.id("archive_categories"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Load the updated category
        const category = await ctx.db.get(args.categoryId);
        if (!category) throw new Error("Catégorie introuvable");

        // Get all archives for this category in the org
        const archives = await ctx.db
            .query("archives")
            .withIndex("by_org_category", (q) =>
                q.eq("organizationId", args.organizationId).eq("categorySlug", category.slug)
            )
            .collect();

        let updatedArchives = 0;
        for (const archive of archives) {
            if (archive.status === "destroyed") continue;

            const countingStart = archive.countingStartDate ?? archive.createdAt;
            const retentionExpiresAt = countingStart + category.retentionYears * MS_PER_YEAR;

            const updates: Record<string, any> = {
                retentionYears: category.retentionYears,
                retentionExpiresAt,
                updatedAt: now,
            };

            // Recalculate phase boundaries
            if (category.activeDurationYears) {
                updates.activeUntil = countingStart + category.activeDurationYears * MS_PER_YEAR;
            }
            if (category.hasSemiActivePhase && category.semiActiveDurationYears) {
                const activeEnd = countingStart + (category.activeDurationYears ?? 0) * MS_PER_YEAR;
                updates.semiActiveUntil = activeEnd + category.semiActiveDurationYears * MS_PER_YEAR;
            }

            await ctx.db.patch(archive._id, updates);
            updatedArchives++;
        }

        // Update folder_archive_metadata
        const folderMeta = await ctx.db
            .query("folder_archive_metadata")
            .withIndex("by_archiveCategoryId", (q) =>
                q.eq("archiveCategoryId", args.categoryId)
            )
            .collect();

        let updatedFolders = 0;
        for (const meta of folderMeta) {
            if (meta.organizationId !== args.organizationId) continue;
            // Recalculate counting start date if needed
            if (meta.countingStartDate) {
                await ctx.db.patch(meta._id, {
                    updatedAt: now,
                } as any);
                updatedFolders++;
            }
        }

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.userId,
            action: "config.retention_propagated",
            resourceType: "archive",
            resourceId: args.categoryId,
            details: {
                categorySlug: category.slug,
                updatedArchives,
                updatedFolders,
                newRetentionYears: category.retentionYears,
            },
            createdAt: now,
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "configPropagation.propagateRetentionChange",
            entiteType: "configSysteme",
            entiteId: "system",
            userId: "system",
        });
        return { updatedArchives, updatedFolders };
    },
});

/** Propagate an access change on a filing cell to linked folders */
export const propagateAccessChange = mutation({
    args: {
        organizationId: v.id("organizations"),
        filingCellId: v.id("filing_cells"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Load the cell
        const cell = await ctx.db.get(args.filingCellId);
        if (!cell) throw new Error("Cellule de classement introuvable");

        // Determine visibility from accessDefaut
        const visibility = cell.accessDefaut === "public" ? "team" : "private";

        // Find linked folder
        const folder = await ctx.db
            .query("folders")
            .withIndex("by_filingCellId", (q) =>
                q.eq("filingCellId", args.filingCellId)
            )
            .first();

        let updatedFolders = 0;

        if (folder) {
            await ctx.db.patch(folder._id, {
                permissions: {
                    ...folder.permissions,
                    visibility,
                },
                updatedAt: now,
            });
            updatedFolders++;

            // Propagate to child folders (recursive via parentFolderId)
            const propagateToChildren = async (parentId: typeof folder._id) => {
                const children = await ctx.db
                    .query("folders")
                    .withIndex("by_parentFolderId", (q) =>
                        q.eq("parentFolderId", parentId)
                    )
                    .filter((q) => q.eq(q.field("status"), "active"))
                    .collect();

                for (const child of children) {
                    await ctx.db.patch(child._id, {
                        permissions: {
                            ...child.permissions,
                            visibility,
                        },
                        updatedAt: now,
                    });
                    updatedFolders++;
                    await propagateToChildren(child._id);
                }
            };

            await propagateToChildren(folder._id);
        }

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.userId,
            action: "config.access_propagated",
            resourceType: "folder",
            resourceId: args.filingCellId,
            details: {
                cellCode: cell.code,
                newAccessDefaut: cell.accessDefaut,
                updatedFolders,
            },
            createdAt: now,
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "configPropagation.propagateAccessChange",
            entiteType: "configSysteme",
            entiteId: "system",
            userId: "system",
        });
        return { updatedFolders };
    },
});

/** Propagate folder configuration changes (tags, metadata, archive category) to sub-folders and documents */
export const propagateFolderConfigChange = mutation({
    args: {
        organizationId: v.id("organizations"),
        folderId: v.id("folders"),
        userId: v.string(),
        changes: v.object({
            addTags: v.optional(v.array(v.string())),
            removeTags: v.optional(v.array(v.string())),
            archiveCategorySlug: v.optional(v.string()),
            confidentiality: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const folder = await ctx.db.get(args.folderId);
        if (!folder) throw new Error("Dossier introuvable");

        let updatedFolders = 0;
        let updatedDocuments = 0;

        // ── Helper: apply changes to a single folder ──
        const applyToFolder = async (fId: typeof args.folderId) => {
            const f = await ctx.db.get(fId);
            if (!f) return;

            const patch: Record<string, unknown> = { updatedAt: now };

            // Tag management
            if (args.changes.addTags || args.changes.removeTags) {
                let currentTags = (f as { tags?: string[] }).tags ?? [];
                if (args.changes.removeTags) {
                    currentTags = currentTags.filter(
                        (t: string) => !args.changes.removeTags!.includes(t)
                    );
                }
                if (args.changes.addTags) {
                    const newTags = args.changes.addTags.filter(
                        (t: string) => !currentTags.includes(t)
                    );
                    currentTags = [...currentTags, ...newTags];
                }
                patch.tags = currentTags;
            }

            await ctx.db.patch(fId, patch);
            updatedFolders++;
        };

        // ── Helper: apply changes to documents in a folder ──
        const applyToDocs = async (fId: typeof args.folderId) => {
            const docs = await ctx.db
                .query("documents")
                .withIndex("by_folderId", (q) => q.eq("folderId", fId))
                .collect();

            for (const doc of docs) {
                const patch: Record<string, unknown> = { updatedAt: now };

                if (args.changes.addTags || args.changes.removeTags) {
                    let currentTags = doc.tags ?? [];
                    if (args.changes.removeTags) {
                        currentTags = currentTags.filter(
                            (t: string) => !args.changes.removeTags!.includes(t)
                        );
                    }
                    if (args.changes.addTags) {
                        const newTags = args.changes.addTags.filter(
                            (t: string) => !currentTags.includes(t)
                        );
                        currentTags = [...currentTags, ...newTags];
                    }
                    patch.tags = currentTags;
                }

                if (args.changes.archiveCategorySlug) {
                    patch.archiveCategorySlug = args.changes.archiveCategorySlug;
                }

                await ctx.db.patch(doc._id, patch);
                updatedDocuments++;
            }
        };

        // ── Apply to root folder ──
        await applyToFolder(args.folderId);
        await applyToDocs(args.folderId);

        // ── Recursive propagation to sub-folders ──
        const propagateToChildren = async (parentId: typeof args.folderId) => {
            const children = await ctx.db
                .query("folders")
                .withIndex("by_parentFolderId", (q) =>
                    q.eq("parentFolderId", parentId)
                )
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();

            for (const child of children) {
                await applyToFolder(child._id);
                await applyToDocs(child._id);
                await propagateToChildren(child._id);
            }
        };

        await propagateToChildren(args.folderId);

        // ── Audit log ──
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.userId,
            action: "config.folder_propagated",
            resourceType: "folder",
            resourceId: args.folderId,
            details: {
                changes: args.changes,
                updatedFolders,
                updatedDocuments,
            },
            createdAt: now,
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "configPropagation.propagateFolderConfigChange",
            entiteType: "configSysteme",
            entiteId: "system",
            userId: "system",
        });
        return { updatedFolders, updatedDocuments };
    },
});
