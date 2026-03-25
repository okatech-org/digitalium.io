// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Document Types (v7)
// CRUD pour les types de documents préconfigurés
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ─────────────────────────────────────

/** List active document types for an org (sorted by nom) */
export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const types = await ctx.db
            .query("document_types")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
        return types
            .filter((t) => t.estActif)
            .sort((a, b) => a.nom.localeCompare(b.nom));
    },
});

/** List ALL document types (active + inactive) */
export const listAll = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("document_types")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
    },
});

/** Get a document type by ID */
export const getById = query({
    args: { id: v.id("document_types") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ─── Mutations ───────────────────────────────────

/** Create a new document type */
export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        code: v.string(),
        description: v.optional(v.string()),
        icone: v.optional(v.string()),
        couleur: v.optional(v.string()),
        retentionCategorySlug: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // Vérifier l'unicité du code dans l'org
        const existing = await ctx.db
            .query("document_types")
            .withIndex("by_org_code", (q) =>
                q.eq("organizationId", args.organizationId).eq("code", args.code)
            )
            .first();

        if (existing) {
            throw new Error("Ce code de type existe déjà dans cette organisation");
        }

        const now = Date.now();
        return await ctx.db.insert("document_types", {
            organizationId: args.organizationId,
            nom: args.nom,
            code: args.code,
            description: args.description,
            icone: args.icone,
            couleur: args.couleur,
            retentionCategorySlug: args.retentionCategorySlug,
            isDefault: args.isDefault ?? false,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Update a document type */
export const update = mutation({
    args: {
        id: v.id("document_types"),
        nom: v.optional(v.string()),
        code: v.optional(v.string()),
        description: v.optional(v.string()),
        icone: v.optional(v.string()),
        couleur: v.optional(v.string()),
        retentionCategorySlug: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Type de document introuvable");

        // Si code modifié, vérifier unicité
        if (args.code && args.code !== existing.code) {
            const duplicate = await ctx.db
                .query("document_types")
                .withIndex("by_org_code", (q) =>
                    q.eq("organizationId", existing.organizationId).eq("code", args.code!)
                )
                .first();
            if (duplicate && duplicate._id !== args.id) {
                throw new Error("Ce code de type existe déjà dans cette organisation");
            }
        }

        const { id, ...updates } = args;
        const cleaned = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    },
});

/** Soft delete a document type */
export const remove = mutation({
    args: { id: v.id("document_types") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            estActif: false,
            updatedAt: Date.now(),
        });
    },
});

/** Seed default document types for an organization */
export const seedDefaults = mutation({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        // Vérifier qu'aucun type n'existe pour cette org
        const existing = await ctx.db
            .query("document_types")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .first();

        if (existing) {
            throw new Error("Des types de documents existent déjà pour cette organisation");
        }

        const now = Date.now();
        const defaults = [
            { code: "CORR", nom: "Correspondance", icone: "Mail", couleur: "#3B82F6" },
            { code: "RAPP", nom: "Rapport", icone: "FileText", couleur: "#8B5CF6" },
            { code: "PV", nom: "Procès-verbal", icone: "ScrollText", couleur: "#EAB308" },
            { code: "NOTE", nom: "Note de service", icone: "StickyNote", couleur: "#F97316" },
            { code: "CONT", nom: "Contrat", icone: "FileSignature", couleur: "#10B981" },
            { code: "FACT", nom: "Facture", icone: "Receipt", couleur: "#EC4899" },
            { code: "DECIS", nom: "Décision", icone: "Gavel", couleur: "#6366F1" },
            { code: "AUTRE", nom: "Autre", icone: "File", couleur: "#6B7280", isDefault: true },
        ];

        const ids = [];
        for (const dt of defaults) {
            const id = await ctx.db.insert("document_types", {
                organizationId: args.organizationId,
                nom: dt.nom,
                code: dt.code,
                icone: dt.icone,
                couleur: dt.couleur,
                isDefault: (dt as any).isDefault ?? false,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });
            ids.push(id);
        }
        return ids;
    },
});
