// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Document Metadata Fields (v7)
// CRUD pour les champs de métadonnées personnalisables
// ═══════════════════════════════════════════════

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ─────────────────────────────────────

/** List active metadata fields for an org (sorted by ordre) */
export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const fields = await ctx.db
            .query("document_metadata_fields")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
        return fields
            .filter((f) => f.estActif)
            .sort((a, b) => a.ordre - b.ordre);
    },
});

// ─── Mutations ───────────────────────────────────

/** Create a new metadata field */
export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        fieldName: v.string(),
        fieldLabel: v.string(),
        fieldType: v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("date"),
            v.literal("select"),
            v.literal("boolean")
        ),
        options: v.optional(v.array(v.string())),
        isRequired: v.boolean(),
        defaultValue: v.optional(v.string()),
        ordre: v.number(),
    },
    handler: async (ctx, args) => {
        // Vérifier l'unicité de fieldName dans l'org
        const existing = await ctx.db
            .query("document_metadata_fields")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("fieldName"), args.fieldName))
            .first();

        if (existing) {
            throw new Error(`Un champ avec le nom "${args.fieldName}" existe déjà`);
        }

        const now = Date.now();
        return await ctx.db.insert("document_metadata_fields", {
            organizationId: args.organizationId,
            fieldName: args.fieldName,
            fieldLabel: args.fieldLabel,
            fieldType: args.fieldType,
            options: args.options,
            isRequired: args.isRequired,
            defaultValue: args.defaultValue,
            ordre: args.ordre,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Update a metadata field */
export const update = mutation({
    args: {
        id: v.id("document_metadata_fields"),
        fieldLabel: v.optional(v.string()),
        fieldType: v.optional(v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("date"),
            v.literal("select"),
            v.literal("boolean")
        )),
        options: v.optional(v.array(v.string())),
        isRequired: v.optional(v.boolean()),
        defaultValue: v.optional(v.string()),
        ordre: v.optional(v.number()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const cleaned = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    },
});

/** Soft delete a metadata field */
export const remove = mutation({
    args: { id: v.id("document_metadata_fields") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            estActif: false,
            updatedAt: Date.now(),
        });
    },
});
