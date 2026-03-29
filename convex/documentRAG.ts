// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation J: RAG Documentaire
// Recherche sémantique + réponses contextuelles avec citations
// ═══════════════════════════════════════════════════════════════

import { v } from "convex/values";
import { query } from "./_generated/server";

// ─── Recherche de documents pertinents par mots-clés ──────────
// (Alternative pragmatique aux embeddings — recherche full-text enrichie)

export const searchDocumentsForRAG = query({
    args: {
        organizationId: v.id("organizations"),
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxResults = args.limit ?? 10;
        const searchTerms = args.query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

        const allDocs = await ctx.db
            .query("documents")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        // Scoring par pertinence
        const scored = allDocs
            .filter((d) => d.status !== "trashed" && (d.extractedText || d.excerpt || d.title))
            .map((doc) => {
                const searchable = [
                    doc.title,
                    doc.excerpt ?? "",
                    doc.extractedText ?? "",
                    doc.fileName ?? "",
                    ...(doc.tags ?? []),
                ].join(" ").toLowerCase();

                let score = 0;
                for (const term of searchTerms) {
                    if (searchable.includes(term)) score += 1;
                    if (doc.title?.toLowerCase().includes(term)) score += 3; // titre = bonus
                    if (doc.extractedText?.toLowerCase().includes(term)) score += 2; // contenu extrait = bonus
                }

                // Récence bonus
                const daysSinceUpdate = (Date.now() - doc.updatedAt) / (1000 * 3600 * 24);
                if (daysSinceUpdate < 30) score += 0.5;

                return { doc, score };
            })
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        // Récupérer les noms de dossiers
        const results = [];
        for (const { doc, score } of scored) {
            let folderName: string | undefined;
            if (doc.folderId) {
                const folder = await ctx.db.get(doc.folderId);
                folderName = folder?.name;
            }

            results.push({
                id: String(doc._id),
                title: doc.title,
                excerpt: doc.extractedText?.substring(0, 800) || doc.excerpt || "",
                folderName,
                tags: doc.tags ?? [],
                score,
                fileName: doc.fileName,
                mimeType: doc.mimeType,
            });
        }

        return results;
    },
});

// ─── Derniers rapports de conformité ──────────

export const getLatestComplianceReport = query({
    args: {
        organizationId: v.id("organizations"),
        type: v.optional(v.union(v.literal("audit"), v.literal("forecast"))),
    },
    handler: async (ctx, args) => {
        const reports = await ctx.db
            .query("compliance_reports")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .take(10);

        if (args.type) {
            return reports.find((r) => r.type === args.type) ?? null;
        }

        return reports[0] ?? null;
    },
});

export const getComplianceHistory = query({
    args: {
        organizationId: v.id("organizations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("compliance_reports")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .take(args.limit ?? 20);
    },
});
