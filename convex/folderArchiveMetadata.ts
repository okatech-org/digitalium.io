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
        manualDate: v.optional(v.number()), // v6: date personnalisée
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // ── 1. Résoudre la date de début de comptage ──
        const folder = await ctx.db.get(args.folderId);
        let countingStartDate: number | undefined;

        switch (args.countingStartEvent) {
            case "date_creation":
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                countingStartDate = (folder as any)?.createdAt ?? now;
                break;
            case "date_tag":
                countingStartDate = now; // Le cycle commence au moment du tagging
                break;
            case "date_manuelle":
                countingStartDate = args.manualDate ?? now;
                break;
            case "date_cloture":
            case "date_gel":
                // Ces événements sont "en attente" — la date sera résolue plus tard
                // quand le document sera approuvé (clôture) ou gelé (gel juridique)
                countingStartDate = undefined;
                break;
            default:
                countingStartDate = now;
        }

        const lifecycleStartedAt = countingStartDate ?? undefined;

        // ── 2. Chercher une metadata existante ──
        const existing = await ctx.db
            .query("folder_archive_metadata")
            .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
            .first();

        const metaFields = {
            archiveCategoryId: args.archiveCategoryId,
            archiveCategorySlug: args.archiveCategorySlug,
            countingStartEvent: args.countingStartEvent,
            confidentiality: args.confidentiality,
            inheritToChildren: args.inheritToChildren,
            inheritToDocuments: args.inheritToDocuments,
            taggedAt: now,
            taggedBy: args.userId,
            manualDate: args.manualDate,
            countingStartDate,
            lifecycleStartedAt,
        };

        let metaId;
        if (existing) {
            await ctx.db.patch(existing._id, metaFields);
            metaId = existing._id;
        } else {
            metaId = await ctx.db.insert("folder_archive_metadata", {
                folderId: args.folderId,
                organizationId: args.organizationId,
                ...metaFields,
            });
        }

        // ── 3. Propager aux documents enfants si héritage activé ──
        if (args.inheritToDocuments && countingStartDate) {
            // Charger la catégorie pour connaître la rétention
            const category = await ctx.db.get(args.archiveCategoryId);
            if (category) {
                // Trouver tous les documents dans ce dossier
                const documents = await ctx.db
                    .query("documents")
                    .filter((q) => q.eq(q.field("folderId"), args.folderId))
                    .collect();

                for (const doc of documents) {
                    // Vérifier si une archive existe déjà pour ce document
                    const existingArchive = await ctx.db
                        .query("archives")
                        .withIndex("by_sourceDocumentId", (q) =>
                            q.eq("sourceDocumentId", doc._id)
                        )
                        .first();

                    if (existingArchive) {
                        // Mettre à jour les dates de lifecycle
                        const activeDuration = category.activeDurationYears ?? category.retentionYears;
                        const activeUntilMs = countingStartDate + activeDuration * 365.25 * 24 * 3600 * 1000;
                        const expiresAt = countingStartDate + category.retentionYears * 365.25 * 24 * 3600 * 1000;

                        await ctx.db.patch(existingArchive._id, {
                            categoryId: args.archiveCategoryId,
                            categorySlug: args.archiveCategorySlug,
                            countingStartDate,
                            triggerEvent: args.countingStartEvent,
                            activeUntil: activeUntilMs,
                            retentionExpiresAt: expiresAt,
                            retentionYears: category.retentionYears,
                            metadata: {
                                ...existingArchive.metadata,
                                confidentiality: args.confidentiality as "public" | "internal" | "confidential" | "secret",
                            },
                            updatedAt: now,
                        });
                    }
                    // Note: on ne crée pas d'archive automatiquement ici —
                    // les archives sont créées via le flux d'upload ou d'archivage explicite.
                    // La propagation met à jour les archives existantes pour refléter la nouvelle politique.
                }
            }
        }

        // ── 4. Audit log ──
        await ctx.db.insert("audit_logs", {
            organizationId: args.organizationId,
            userId: args.userId,
            action: "folder.archive_policy_set",
            resourceType: "folder",
            resourceId: args.folderId,
            details: {
                categorySlug: args.archiveCategorySlug,
                countingStartEvent: args.countingStartEvent,
                countingStartDate,
                inheritToChildren: args.inheritToChildren,
                inheritToDocuments: args.inheritToDocuments,
            },
            createdAt: now,
        });

        return metaId;
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
