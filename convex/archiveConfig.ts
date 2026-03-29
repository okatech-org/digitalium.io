// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: iArchive Configuration
// Config CRUD + Archive Category Management
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { OrgConfig } from "./lib/types";

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
    autoDestroy: boolean;
    // v5: Déclassement scope
    declassificationScope: "document" | "folder" | "hybrid";
    phasePermissions: {
        active: { read: string; write: string; delete: string };
        semiActive: { read: string; write: string; delete: string };
        archived: { read: string; write: string; delete: string };
    };
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
            autoDestroy: false,
            declassificationScope: "folder",           // Exercice fiscal = dossier annuel
            phasePermissions: {
                active: { read: "all", write: "org_member+", delete: "org_manager+" },
                semiActive: { read: "all", write: "none", delete: "org_admin" },
                archived: { read: "org_manager+", write: "none", delete: "system_admin" },
            },
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
            autoDestroy: false,
            declassificationScope: "document",          // Chaque contrat/bulletin indépendant
            phasePermissions: {
                active: { read: "all", write: "org_member+", delete: "org_manager+" },
                semiActive: { read: "all", write: "none", delete: "org_admin" },
                archived: { read: "org_manager+", write: "none", delete: "system_admin" },
            },
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
            autoDestroy: false,
            declassificationScope: "hybrid",            // Pièces de dates différentes dans un dossier
            phasePermissions: {
                active: { read: "all", write: "org_member+", delete: "org_manager+" },
                semiActive: { read: "all", write: "none", delete: "org_admin" },
                archived: { read: "org_manager+", write: "none", delete: "system_admin" },
            },
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
            autoDestroy: false,
            declassificationScope: "document",          // Chaque facture/devis autonome
            phasePermissions: {
                active: { read: "all", write: "org_member+", delete: "org_manager+" },
                semiActive: { read: "all", write: "none", delete: "org_admin" },
                archived: { read: "org_manager+", write: "none", delete: "system_admin" },
            },
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
            autoDestroy: false,
            declassificationScope: "document",          // Chaque pièce indépendante
            phasePermissions: {
                active: { read: "org_manager+", write: "org_admin", delete: "system_admin" },
                semiActive: { read: "org_manager+", write: "none", delete: "system_admin" },
                archived: { read: "org_admin", write: "none", delete: "system_admin" },
            },
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
        const config = (org.config as OrgConfig) ?? {};
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
        changedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) throw new Error("Organisation introuvable");

        const currentConfig = (org.config as OrgConfig) ?? {};
        const oldIArchive = currentConfig.iArchive ?? {};
        const updatedConfig = {
            ...currentConfig,
            iArchive: args.iArchiveConfig,
        };

        await ctx.db.patch(args.organizationId, {
            config: updatedConfig,
            updatedAt: Date.now(),
        });

        // Log changelog
        await ctx.db.insert("archive_policy_changelog", {
            organizationId: args.organizationId,
            changeType: "config_updated",
            entityName: "Configuration iArchive",
            changes: { old: oldIArchive, new: args.iArchiveConfig },
            changedBy: args.changedBy ?? "system",
            changedAt: Date.now(),
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "archiveConfig.saveConfig",
            entiteType: "archive_categories",
            entiteId: "system",
            userId: "system",
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
        // v5: Déclassement scope & permissions par phase
        declassificationScope: v.optional(v.union(
            v.literal("document"),
            v.literal("folder"),
            v.literal("hybrid")
        )),
        phasePermissions: v.optional(v.object({
            active: v.object({ read: v.string(), write: v.string(), delete: v.string() }),
            semiActive: v.object({ read: v.string(), write: v.string(), delete: v.string() }),
            archived: v.object({ read: v.string(), write: v.string(), delete: v.string() }),
        })),
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
            // v5
            declassificationScope: args.declassificationScope,
            phasePermissions: args.phasePermissions,
        };

        if (args.id) {
            // Update existing
            const existing = await ctx.db.get(args.id);
            if (!existing) throw new Error("Catégorie introuvable");

            const changes: Record<string, { old: unknown; new: unknown }> = {};
            if (existing.retentionYears !== args.retentionYears) changes.retentionYears = { old: existing.retentionYears, new: args.retentionYears };
            if (existing.name !== args.name) changes.name = { old: existing.name, new: args.name };
            if (existing.ohadaReference !== args.ohadaReference) changes.ohadaReference = { old: existing.ohadaReference, new: args.ohadaReference };
            if (existing.activeDurationYears !== args.activeDurationYears) changes.activeDurationYears = { old: existing.activeDurationYears, new: args.activeDurationYears };
            if (existing.semiActiveDurationYears !== args.semiActiveDurationYears) changes.semiActiveDurationYears = { old: existing.semiActiveDurationYears, new: args.semiActiveDurationYears };

            if (existing.isFixed) {
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

            // Log changelog
            if (Object.keys(changes).length > 0) {
                await ctx.db.insert("archive_policy_changelog", {
                    organizationId: args.organizationId,
                    changeType: "category_updated",
                    entityId: args.id,
                    entityName: args.name,
                    changes,
                    changedBy: "system",
                    changedAt: now,
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

            const newId = await ctx.db.insert("archive_categories", {
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

            // Log changelog
            await ctx.db.insert("archive_policy_changelog", {
                organizationId: args.organizationId,
                changeType: "category_created",
                entityId: newId,
                entityName: args.name,
                changes: { retentionYears: args.retentionYears, slug: args.slug },
                changedBy: "system",
                changedAt: now,
            });

            return newId;
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

        // Log changelog before deletion
        if (cat.organizationId) {
            await ctx.db.insert("archive_policy_changelog", {
                organizationId: cat.organizationId,
                changeType: "category_deleted",
                entityId: args.id,
                entityName: cat.name,
                changes: { retentionYears: cat.retentionYears, slug: cat.slug },
                changedBy: "system",
                changedAt: Date.now(),
            });
        }

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

// ─── Compliance Stats ────────────────────────────

/**
 * Get compliance statistics for export report.
 */
export const getComplianceStats = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const categories = await ctx.db
            .query("archive_categories")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const archives = await ctx.db
            .query("archives")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const now = Date.now();
        const byCategorySlug: Record<string, { total: number; active: number; expired: number; onHold: number }> = {};

        for (const cat of categories) {
            byCategorySlug[cat.slug] = { total: 0, active: 0, expired: 0, onHold: 0 };
        }

        let totalArchives = 0;
        let totalExpired = 0;
        let totalOnHold = 0;
        let totalDestroyed = 0;

        for (const arc of archives) {
            totalArchives++;
            const isExpired = arc.retentionExpiresAt < now;
            const isOnHold = arc.status === "on_hold";
            const isDestroyed = arc.status === "destroyed";

            if (isExpired) totalExpired++;
            if (isOnHold) totalOnHold++;
            if (isDestroyed) totalDestroyed++;

            if (byCategorySlug[arc.categorySlug]) {
                byCategorySlug[arc.categorySlug].total++;
                if (arc.status === "active" || arc.status === "semi_active") byCategorySlug[arc.categorySlug].active++;
                if (isExpired) byCategorySlug[arc.categorySlug].expired++;
                if (isOnHold) byCategorySlug[arc.categorySlug].onHold++;
            }
        }

        const destructionCerts = await ctx.db
            .query("destruction_certificates")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        return {
            categories: categories.length,
            totalArchives,
            totalExpired,
            totalOnHold,
            totalDestroyed,
            destructionCertificates: destructionCerts.length,
            byCategorySlug,
        };
    },
});

// ─── Changelog ───────────────────────────────────

/**
 * List policy changelog entries for an organization.
 */
export const getChangelog = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const entries = await ctx.db
            .query("archive_policy_changelog")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .order("desc")
            .take(100);

        return entries;
    },
});

// ─── OCR ─────────────────────────────────────────

/**
 * Update OCR text for an archive.
 */
export const updateArchiveOcrText = mutation({
    args: {
        archiveId: v.id("archives"),
        ocrText: v.string(),
    },
    handler: async (ctx, args) => {
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive introuvable");

        await ctx.db.patch(args.archiveId, {
            metadata: {
                ...archive.metadata,
                ocrText: args.ocrText,
            },
            updatedAt: Date.now(),
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "archiveConfig.updateArchiveOcrText",
            entiteType: "archive_categories",
            entiteId: "system",
            userId: "system",
        });
        return args.archiveId;
    },
});
