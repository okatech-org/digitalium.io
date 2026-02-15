// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: iArchive Configuration
// Config CRUD + Archive Category Management
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Default archive categories (OHADA-aligned) ──

const DEFAULT_CATEGORIES: Array<{
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
    retentionYears: number;
    ohadaReference: string;
    countingStartEvent: string;
    activeDurationYears: number;
    semiActiveDurationYears: number | undefined;
    alertBeforeArchiveMonths: number;
    hasSemiActivePhase: boolean;
    isPerpetual: boolean;
    defaultConfidentiality: "public" | "internal" | "confidential" | "secret";
    isFixed: boolean;
    sortOrder: number;
    // Default alerts to seed
    defaultAlerts: {
        preArchive: { value: number; unit: string }[];
        preDeletion: { value: number; unit: string }[];
    };
}> = [
        {
            name: "Fiscal",
            slug: "fiscal",
            description: "Documents comptables et fiscaux — OHADA Art. 24",
            color: "amber",
            icon: "Landmark",
            retentionYears: 10,
            ohadaReference: "OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24",
            countingStartEvent: "date_tag",
            activeDurationYears: 5,
            semiActiveDurationYears: 3,
            alertBeforeArchiveMonths: 12,
            hasSemiActivePhase: true,
            isPerpetual: false,
            defaultConfidentiality: "confidential",
            isFixed: false,
            sortOrder: 0,
            defaultAlerts: {
                preArchive: [
                    { value: 3, unit: "months" },
                    { value: 1, unit: "weeks" },
                    { value: 3, unit: "days" },
                ],
                preDeletion: [
                    { value: 1, unit: "months" },
                    { value: 1, unit: "weeks" },
                    { value: 1, unit: "days" },
                ],
            },
        },
        {
            name: "Social / RH",
            slug: "social",
            description: "Contrats de travail, paie — Code du Travail Art. 178",
            color: "blue",
            icon: "Users",
            retentionYears: 5,
            ohadaReference: "OHADA: 5 ans min. — Code du Travail / Statuts Art. 115",
            countingStartEvent: "date_creation",
            activeDurationYears: 3,
            semiActiveDurationYears: 1,
            alertBeforeArchiveMonths: 6,
            hasSemiActivePhase: true,
            isPerpetual: false,
            defaultConfidentiality: "confidential",
            isFixed: false,
            sortOrder: 1,
            defaultAlerts: {
                preArchive: [
                    { value: 3, unit: "months" },
                    { value: 1, unit: "weeks" },
                ],
                preDeletion: [
                    { value: 1, unit: "months" },
                    { value: 1, unit: "days" },
                ],
            },
        },
        {
            name: "Juridique",
            slug: "juridique",
            description: "Statuts, PV, contrats — OHADA Sociétés Art. 36",
            color: "emerald",
            icon: "Scale",
            retentionYears: 30,
            ohadaReference: "OHADA: 30 ans min. — Acte Uniforme Droit des Sociétés Art. 36",
            countingStartEvent: "date_cloture",
            activeDurationYears: 10,
            semiActiveDurationYears: 10,
            alertBeforeArchiveMonths: 12,
            hasSemiActivePhase: true,
            isPerpetual: false,
            defaultConfidentiality: "confidential",
            isFixed: false,
            sortOrder: 2,
            defaultAlerts: {
                preArchive: [
                    { value: 6, unit: "months" },
                    { value: 1, unit: "months" },
                ],
                preDeletion: [
                    { value: 3, unit: "months" },
                    { value: 1, unit: "months" },
                ],
            },
        },
        {
            name: "Commercial",
            slug: "client",
            description: "Factures, devis, bons de commande — OHADA Commercial Art. 18",
            color: "violet",
            icon: "Briefcase",
            retentionYears: 5,
            ohadaReference: "OHADA: 5 ans min. — Acte Uniforme Droit Commercial Art. 18",
            countingStartEvent: "date_creation",
            activeDurationYears: 3,
            semiActiveDurationYears: 1,
            alertBeforeArchiveMonths: 6,
            hasSemiActivePhase: true,
            isPerpetual: false,
            defaultConfidentiality: "internal",
            isFixed: false,
            sortOrder: 3,
            defaultAlerts: {
                preArchive: [
                    { value: 3, unit: "months" },
                    { value: 1, unit: "weeks" },
                ],
                preDeletion: [
                    { value: 1, unit: "months" },
                    { value: 1, unit: "days" },
                ],
            },
        },
        {
            name: "Coffre-Fort",
            slug: "coffre",
            description: "Titres de propriété, actes notariés — Conservation perpétuelle",
            color: "rose",
            icon: "Lock",
            retentionYears: 99,
            ohadaReference: "OHADA: 99 ans min. — Conservation perpétuelle",
            countingStartEvent: "date_gel",
            activeDurationYears: 50,
            semiActiveDurationYears: 30,
            alertBeforeArchiveMonths: 60,
            hasSemiActivePhase: true,
            isPerpetual: true,
            defaultConfidentiality: "secret",
            isFixed: true,
            sortOrder: 4,
            defaultAlerts: {
                preArchive: [],
                preDeletion: [],
            },
        },
    ];

// ─── Queries ─────────────────────────────────────

/**
 * Get the iArchive config block from the organization.
 */
export const getConfig = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config = (org.config as any) ?? {};
        return config.iArchive ?? null;
    },
});

/**
 * List archive categories for an organization.
 */
export const listCategories = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("archive_categories")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();
    },
});

// ─── Mutations ───────────────────────────────────

/**
 * Save the full iArchive config object into organizations.config.iArchive.
 */
export const saveConfig = mutation({
    args: {
        organizationId: v.id("organizations"),
        iArchiveConfig: v.any(),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) throw new Error("Organisation introuvable");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentConfig = (org.config as any) ?? {};
        const updatedConfig = {
            ...currentConfig,
            iArchive: args.iArchiveConfig,
        };

        await ctx.db.patch(args.organizationId, {
            config: updatedConfig,
            updatedAt: Date.now(),
        });

        return args.organizationId;
    },
});

/**
 * Create or update an archive category.
 */
export const upsertCategory = mutation({
    args: {
        id: v.optional(v.id("archive_categories")),
        organizationId: v.id("organizations"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        icon: v.string(),
        retentionYears: v.number(),
        // Lifecycle fields (v2)
        ohadaReference: v.optional(v.string()),
        countingStartEvent: v.optional(v.string()),
        activeDurationYears: v.optional(v.number()),
        semiActiveDurationYears: v.optional(v.number()),
        alertBeforeArchiveMonths: v.optional(v.number()),
        hasSemiActivePhase: v.optional(v.boolean()),
        isPerpetual: v.optional(v.boolean()),
        defaultConfidentiality: v.union(
            v.literal("public"),
            v.literal("internal"),
            v.literal("confidential"),
            v.literal("secret")
        ),
        isFixed: v.optional(v.boolean()),
        sortOrder: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const lifecycleFields = {
            ohadaReference: args.ohadaReference,
            countingStartEvent: args.countingStartEvent,
            activeDurationYears: args.activeDurationYears,
            semiActiveDurationYears: args.semiActiveDurationYears,
            alertBeforeArchiveMonths: args.alertBeforeArchiveMonths,
            hasSemiActivePhase: args.hasSemiActivePhase,
            isPerpetual: args.isPerpetual,
        };

        if (args.id) {
            // Update existing
            const existing = await ctx.db.get(args.id);
            if (!existing) throw new Error("Catégorie introuvable");
            if (existing.isFixed) {
                // Only allow retentionYears + lifecycle updates on fixed categories
                await ctx.db.patch(args.id, {
                    retentionYears: args.retentionYears,
                    ...lifecycleFields,
                    updatedAt: now,
                });
            } else {
                await ctx.db.patch(args.id, {
                    name: args.name,
                    slug: args.slug,
                    description: args.description,
                    color: args.color,
                    icon: args.icon,
                    retentionYears: args.retentionYears,
                    ...lifecycleFields,
                    defaultConfidentiality: args.defaultConfidentiality,
                    sortOrder: args.sortOrder ?? existing.sortOrder,
                    updatedAt: now,
                });
            }
            return args.id;
        } else {
            // Create new
            const allCategories = await ctx.db
                .query("archive_categories")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId)
                )
                .collect();

            return await ctx.db.insert("archive_categories", {
                name: args.name,
                slug: args.slug,
                description: args.description,
                color: args.color,
                icon: args.icon,
                retentionYears: args.retentionYears,
                ...lifecycleFields,
                defaultConfidentiality: args.defaultConfidentiality,
                isFixed: args.isFixed ?? false,
                isActive: true,
                sortOrder: args.sortOrder ?? allCategories.length,
                organizationId: args.organizationId,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

/**
 * Delete a non-fixed archive category.
 */
export const deleteCategory = mutation({
    args: { id: v.id("archive_categories") },
    handler: async (ctx, args) => {
        const cat = await ctx.db.get(args.id);
        if (!cat) throw new Error("Catégorie introuvable");
        if (cat.isFixed) throw new Error("Impossible de supprimer une catégorie fixe (Coffre-Fort)");
        await ctx.db.delete(args.id);
    },
});

/**
 * Seed default OHADA categories for an organization (if none exist).
 */
export const seedDefaultCategories = mutation({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("archive_categories")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        if (existing.length > 0) {
            return { seeded: false, count: existing.length };
        }

        const now = Date.now();
        let count = 0;
        for (const cat of DEFAULT_CATEGORIES) {
            // Destructure defaultAlerts (not a DB field)
            const { defaultAlerts, ...catData } = cat;

            const categoryId = await ctx.db.insert("archive_categories", {
                ...catData,
                organizationId: args.organizationId,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            // Seed default alerts for this category
            for (const alert of defaultAlerts.preArchive) {
                const unitLabels: Record<string, string> = {
                    months: "mois", weeks: "semaine(s)", days: "jour(s)", hours: "heure(s)",
                };
                await ctx.db.insert("retention_alerts", {
                    categoryId,
                    organizationId: args.organizationId,
                    alertType: "pre_archive" as const,
                    value: alert.value,
                    unit: alert.unit as "months" | "weeks" | "days" | "hours",
                    label: `${alert.value} ${unitLabels[alert.unit] ?? alert.unit} avant archivage`,
                    createdAt: now,
                });
            }
            for (const alert of defaultAlerts.preDeletion) {
                const unitLabels: Record<string, string> = {
                    months: "mois", weeks: "semaine(s)", days: "jour(s)", hours: "heure(s)",
                };
                await ctx.db.insert("retention_alerts", {
                    categoryId,
                    organizationId: args.organizationId,
                    alertType: "pre_deletion" as const,
                    value: alert.value,
                    unit: alert.unit as "months" | "weeks" | "days" | "hours",
                    label: `${alert.value} ${unitLabels[alert.unit] ?? alert.unit} avant suppression`,
                    createdAt: now,
                });
            }

            count++;
        }

        return { seeded: true, count };
    },
});
