// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Signature Workflows
// CRUD for signature workflow templates
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/* ─── Queries ────────────────────────────────── */

/**
 * List all workflow templates for an organization.
 */
export const listByOrg = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        if (!args.organizationId) {
            return await ctx.db.query("signature_workflows").order("desc").collect();
        }
        return await ctx.db
            .query("signature_workflows")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId!)
            )
            .order("desc")
            .collect();
    },
});

/**
 * Get a single workflow by ID.
 */
export const getById = query({
    args: { id: v.id("signature_workflows") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Create a new signature workflow template.
 */
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        steps: v.array(
            v.object({
                order: v.number(),
                signerId: v.optional(v.string()),
                role: v.optional(v.string()),
                required: v.boolean(),
            })
        ),
        createdBy: v.string(),
        isTemplate: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("signature_workflows", {
            name: args.name,
            description: args.description,
            organizationId: args.organizationId,
            steps: args.steps,
            createdBy: args.createdBy,
            isTemplate: args.isTemplate,
        });
    },
});

/**
 * Update a workflow template.
 */
export const update = mutation({
    args: {
        id: v.id("signature_workflows"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        steps: v.optional(
            v.array(
                v.object({
                    order: v.number(),
                    signerId: v.optional(v.string()),
                    role: v.optional(v.string()),
                    required: v.boolean(),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Workflow introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, clean);
        return id;
    },
});

/**
 * Delete a workflow template.
 */
export const remove = mutation({
    args: { id: v.id("signature_workflows") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Workflow introuvable");
        await ctx.db.delete(args.id);
    },
});

/**
 * Duplicate a workflow template.
 */
export const duplicate = mutation({
    args: {
        id: v.id("signature_workflows"),
        newName: v.string(),
        createdBy: v.string(),
    },
    handler: async (ctx, args) => {
        const original = await ctx.db.get(args.id);
        if (!original) throw new Error("Workflow introuvable");

        return await ctx.db.insert("signature_workflows", {
            name: args.newName,
            description: original.description,
            organizationId: original.organizationId,
            steps: original.steps,
            createdBy: args.createdBy,
            isTemplate: true,
        });
    },
});
