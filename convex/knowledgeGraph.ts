// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation H: Knowledge Graph
// Extraction d'entités + détection de relations entre documents
// ═══════════════════════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ─── Mutations ───────────────────────────────────

export const saveEntities = mutation({
    args: {
        documentId: v.id("documents"),
        organizationId: v.id("organizations"),
        entities: v.array(v.object({
            entityType: v.string(),
            entityValue: v.string(),
            confidence: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Supprimer les anciennes entités du document
        const existing = await ctx.db
            .query("document_entities")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();
        for (const e of existing) {
            await ctx.db.delete(e._id);
        }

        // Insérer les nouvelles
        for (const entity of args.entities) {
            await ctx.db.insert("document_entities", {
                documentId: args.documentId,
                organizationId: args.organizationId,
                entityType: entity.entityType,
                entityValue: entity.entityValue,
                normalizedValue: entity.entityValue.toLowerCase().trim(),
                confidence: entity.confidence,
                createdAt: now,
            });
        }

        return { saved: args.entities.length };
    },
});

export const detectAndSaveRelations = mutation({
    args: {
        documentId: v.id("documents"),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Récupérer les entités du document
        const docEntities = await ctx.db
            .query("document_entities")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();

        if (docEntities.length === 0) return { relationsFound: 0 };

        // Chercher des documents avec des entités similaires
        const relationsFound: Array<{ targetDocId: string; relationType: string; confidence: number }> = [];

        for (const entity of docEntities) {
            if (!entity.normalizedValue || entity.confidence < 0.7) continue;

            // Trouver d'autres documents avec la même entité normalisée
            const matches = await ctx.db
                .query("document_entities")
                .withIndex("by_org_value", (q) =>
                    q.eq("organizationId", args.organizationId).eq("normalizedValue", entity.normalizedValue!)
                )
                .collect();

            for (const match of matches) {
                if (String(match.documentId) === String(args.documentId)) continue;

                // Éviter les doublons de relations
                const existingRelation = await ctx.db
                    .query("document_relations")
                    .withIndex("by_sourceDocId", (q) => q.eq("sourceDocId", args.documentId))
                    .first();
                if (existingRelation && String(existingRelation.targetDocId) === String(match.documentId)) continue;

                const relationType = entity.entityType === "client" ? "related"
                    : entity.entityType === "reference" ? "response_to"
                    : entity.entityType === "project" ? "related"
                    : "related";

                const confidence = Math.min(entity.confidence, match.confidence) * 0.9;

                await ctx.db.insert("document_relations", {
                    organizationId: args.organizationId,
                    sourceDocId: args.documentId,
                    targetDocId: match.documentId,
                    relationType,
                    confidence,
                    reasoning: `Entité commune: ${entity.entityType} "${entity.entityValue}"`,
                    createdAt: now,
                });

                relationsFound.push({
                    targetDocId: String(match.documentId),
                    relationType,
                    confidence,
                });
            }
        }

        return { relationsFound: relationsFound.length };
    },
});

// ─── Queries ───────────────────────────────────

export const getDocumentEntities = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("document_entities")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();
    },
});

export const getDocumentRelations = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        const asSource = await ctx.db
            .query("document_relations")
            .withIndex("by_sourceDocId", (q) => q.eq("sourceDocId", args.documentId))
            .collect();

        const asTarget = await ctx.db
            .query("document_relations")
            .withIndex("by_targetDocId", (q) => q.eq("targetDocId", args.documentId))
            .collect();

        // Enrichir avec les titres des documents liés
        const relations = [];
        for (const rel of [...asSource, ...asTarget]) {
            const linkedDocId = String(rel.sourceDocId) === String(args.documentId)
                ? rel.targetDocId
                : rel.sourceDocId;
            const linkedDoc = await ctx.db.get(linkedDocId);
            relations.push({
                ...rel,
                linkedDocId: String(linkedDocId),
                linkedDocTitle: linkedDoc?.title ?? "Document inconnu",
                direction: String(rel.sourceDocId) === String(args.documentId) ? "outgoing" : "incoming",
            });
        }

        return relations;
    },
});

export const getOrgEntityStats = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const entities = await ctx.db
            .query("document_entities")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        // Grouper par type
        const byType: Record<string, number> = {};
        const topValues: Record<string, { value: string; count: number }[]> = {};

        for (const e of entities) {
            byType[e.entityType] = (byType[e.entityType] ?? 0) + 1;
            if (!topValues[e.entityType]) topValues[e.entityType] = [];
            const existing = topValues[e.entityType].find((v) => v.value === e.normalizedValue);
            if (existing) existing.count++;
            else topValues[e.entityType].push({ value: e.entityValue, count: 1 });
        }

        // Trier les top values
        for (const type of Object.keys(topValues)) {
            topValues[type] = topValues[type].sort((a, b) => b.count - a.count).slice(0, 10);
        }

        return { totalEntities: entities.length, byType, topValues };
    },
});
