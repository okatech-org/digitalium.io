// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Folder Archive Metadata (Phase 15)
// Tagging avancé : politique d'archivage sur dossier avec héritage
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ─────────────────────────────────────

/** Récupérer la metadata d'archivage d'un dossier */
export const getByFolder = query({
    args: { folderId: v.id("folders") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("folder_archive_metadata")
            .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
            .first();
    },
});

/** Lister toutes les métadonnées d'une organisation */
export const listByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("folder_archive_metadata")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

/**
 * Résoudre la politique d'archivage effective pour un dossier.
 * Remonte la hiérarchie (parentFolderId) pour trouver un tag hérité.
 */
export const resolveForFolder = query({
    args: { folderId: v.id("folders") },
    handler: async (ctx, args) => {
        let currentId: typeof args.folderId | undefined = args.folderId;
        const visited = new Set<string>();

        while (currentId) {
            if (visited.has(currentId)) break; // Protection anti-boucle
            visited.add(currentId);

            const meta = await ctx.db
                .query("folder_archive_metadata")
                .withIndex("by_folderId", (q) => q.eq("folderId", currentId!))
                .first();

            if (meta) {
                const isDirectTag = currentId === args.folderId;
                return {
                    ...meta,
                    inherited: !isDirectTag,
                    sourceFolderId: currentId,
                };
            }

            // Remonter au parent
            const folder = await ctx.db.get(currentId) as any;
            if (!folder || !folder.parentFolderId) break;

            // Vérifier que le parent a inheritToChildren
            const parentMeta = await ctx.db
                .query("folder_archive_metadata")
                .withIndex("by_folderId", (q) => q.eq("folderId", folder.parentFolderId))
                .first();

            if (parentMeta && parentMeta.inheritToChildren) {
                return {
                    ...parentMeta,
                    inherited: true,
                    sourceFolderId: folder.parentFolderId,
                };
            }

            currentId = folder.parentFolderId;
        }

        return null;
    },
});

// ─── Mutations ───────────────────────────────────

/** Définir/mettre à jour la politique d'archivage d'un dossier */
export const setMetadata = mutation({
    args: {
        folderId: v.id("folders"),
        organizationId: v.id("organizations"),
        archiveCategoryId: v.id("archive_categories"),
        archiveCategorySlug: v.string(),
        countingStartEvent: v.string(),
        confidentiality: v.string(),
        inheritToChildren: v.boolean(),
        inheritToDocuments: v.boolean(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Chercher une metadata existante
        const existing = await ctx.db
            .query("folder_archive_metadata")
            .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                archiveCategoryId: args.archiveCategoryId,
                archiveCategorySlug: args.archiveCategorySlug,
                countingStartEvent: args.countingStartEvent,
                confidentiality: args.confidentiality,
                inheritToChildren: args.inheritToChildren,
                inheritToDocuments: args.inheritToDocuments,
                taggedAt: now,
                taggedBy: args.userId,
            });
            return existing._id;
        }

        return await ctx.db.insert("folder_archive_metadata", {
            folderId: args.folderId,
            organizationId: args.organizationId,
            archiveCategoryId: args.archiveCategoryId,
            archiveCategorySlug: args.archiveCategorySlug,
            countingStartEvent: args.countingStartEvent,
            confidentiality: args.confidentiality,
            inheritToChildren: args.inheritToChildren,
            inheritToDocuments: args.inheritToDocuments,
            taggedAt: now,
            taggedBy: args.userId,
        });
    },
});

/** Supprimer la politique d'archivage d'un dossier */
export const removeMetadata = mutation({
    args: { folderId: v.id("folders") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("folder_archive_metadata")
            .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
