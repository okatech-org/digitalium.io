import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { SIGNAL_TYPES } from "./lib/types";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Organizations
// CRUD + status management for client organizations
// ═══════════════════════════════════════════════

/* ─── Reusable validators ────────────────────── */

const orgType = v.union(
    v.literal("enterprise"),
    v.literal("institution"),
    v.literal("government"),
    v.literal("organism")
);

const orgStatus = v.union(
    v.literal("brouillon"),
    v.literal("prete"),
    v.literal("active"),
    v.literal("trial"),
    v.literal("suspended"),
    v.literal("resiliee")
);

const hostingType = v.union(
    v.literal("cloud"),
    v.literal("datacenter"),
    v.literal("local")
);

const publicPageTemplate = v.union(
    v.literal("corporate"),
    v.literal("startup"),
    v.literal("institution")
);

/* ─── Queries ────────────────────────────────── */

/**
 * List all organizations sorted by creation date (most recent first).
 */
export const list = query({
    args: {
        status: v.optional(orgStatus),
    },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("organizations")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("organizations").order("desc").collect();
    },
});

/**
 * Get a single organization by ID with member count.
 */
export const getById = query({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) return null;

        const members = await ctx.db
            .query("organization_members")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
            .collect();

        return {
            ...org,
            memberCount: members.length,
            members,
        };
    },
});

/**
 * Get a single organization by its display name.
 * Used to resolve org-context names (e.g. "OKA TECH") to Convex _id.
 */
export const getByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const orgs = await ctx.db.query("organizations").collect();
        return orgs.find((o) => o.name.toLowerCase() === args.name.toLowerCase()) ?? null;
    },
});

/**
 * Fallback: find the org a user belongs to by email.
 * Used when getByName doesn't match (dev accounts with display names that differ from Convex org names).
 */
export const getByMemberEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("organization_members")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
        if (!membership) {
            // Fallback: return first active org if only one exists
            const allOrgs = await ctx.db.query("organizations")
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();
            return allOrgs.length === 1 ? allOrgs[0] : null;
        }
        return await ctx.db.get(membership.organizationId);
    },
});

/**
 * Get aggregated KPI stats for the organizations dashboard.
 */
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const allOrgs = await ctx.db.query("organizations").collect();

        const total = allOrgs.length;
        const brouillon = allOrgs.filter((o) => o.status === "brouillon").length;
        const prete = allOrgs.filter((o) => o.status === "prete").length;
        const active = allOrgs.filter((o) => o.status === "active").length;
        const trial = allOrgs.filter((o) => o.status === "trial").length;
        const suspended = allOrgs.filter((o) => o.status === "suspended").length;
        const resiliee = allOrgs.filter((o) => o.status === "resiliee").length;

        // Calculate total storage from quotas
        const totalStorage = allOrgs.reduce((sum, o) => sum + (o.quota?.maxStorage ?? 0), 0);

        // Count modules usage
        const moduleCounts: Record<string, number> = {};
        for (const org of allOrgs) {
            for (const mod of org.quota?.modules ?? []) {
                moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
            }
        }

        return {
            total,
            brouillon,
            prete,
            active,
            trial,
            suspended,
            resiliee,
            totalStorage,
            moduleCounts,
        };
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Create a new organization (full creation, not migration).
 */
export const create = mutation({
    args: {
        name: v.string(),
        type: orgType,
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
        ownerId: v.string(),
        logoUrl: v.optional(v.string()),
        maxUsers: v.optional(v.number()),
        modules: v.optional(v.array(v.string())),
        // ── New v2 fields (Wizard 3-step) ──
        rccm: v.optional(v.string()),
        nif: v.optional(v.string()),
        contact: v.optional(v.string()),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        adresse: v.optional(v.string()),
        ville: v.optional(v.string()),
        pays: v.optional(v.string()),
        hosting: v.optional(v.object({
            type: hostingType,
            domain: v.optional(v.string()),
            pagePublique: v.optional(v.boolean()),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const modules = args.modules ?? ["iDocument", "iArchive", "iSignature"];

        const orgId = await ctx.db.insert("organizations", {
            name: args.name,
            subdomain: args.hosting?.domain || undefined,
            type: args.type,
            sector: args.sector,
            description: args.description,
            logoUrl: args.logoUrl,
            ownerId: args.ownerId,
            // ── v2 identity fields ──
            rccm: args.rccm,
            nif: args.nif,
            contact: args.contact,
            telephone: args.telephone,
            email: args.email,
            adresse: args.adresse,
            ville: args.ville,
            pays: args.pays,
            quota: {
                maxUsers: args.maxUsers ?? 25,
                maxStorage: 10 * 1024 * 1024 * 1024, // 10GB default
                modules,
            },
            settings: {
                locale: "fr-GA",
                currency: "XAF",
            },
            hosting: args.hosting,
            configProgress: {
                profilComplete: true,
                structureOrgComplete: false,
                structureClassementComplete: false,
                modulesConfigComplete: false,
                automationConfigComplete: false,
                deploymentConfigComplete: !!(args.hosting?.type),
            },
            status: "brouillon",
            createdAt: now,
            updatedAt: now,
        });

        // Auto-créer le contact admin obligatoire
        await ctx.db.insert("organization_members", {
            organizationId: orgId,
            userId: args.ownerId,
            role: "admin",
            estAdmin: true,
            level: 2,
            nom: args.contact,
            email: args.email,
            telephone: args.telephone,
            status: "active",
            joinedAt: now,
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_CREEE,
            action: "organizations.create",
            entiteType: "organizations",
            entiteId: String(orgId),
            userId: args.ownerId,
            nom: args.name,
            description: `Organisation créée: ${args.name}`,
        });

        return orgId;
    },
});

/**
 * Update organization status (activate, suspend, etc.).
 */
export const updateStatus = mutation({
    args: {
        id: v.id("organizations"),
        status: orgStatus,
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Organisation introuvable");

        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_STATUT_CHANGE,
            action: "organizations.updateStatus",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: existing.name,
            description: `Statut: ${existing.status} → ${args.status}`,
        });

        return args.id;
    },
});

/**
 * Update organization details (extended v2 fields).
 */
export const update = mutation({
    args: {
        id: v.id("organizations"),
        name: v.optional(v.string()),
        type: v.optional(orgType),
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        rccm: v.optional(v.string()),
        nif: v.optional(v.string()),
        contact: v.optional(v.string()),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        adresse: v.optional(v.string()),
        ville: v.optional(v.string()),
        pays: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Organisation introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, {
            ...clean,
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_MODIFIEE,
            action: "organizations.update",
            entiteType: "organizations",
            entiteId: String(id),
            userId: "admin",
            nom: existing.name,
        });

        return id;
    },
});

/**
 * Migrate / upsert an organization (keep existing for backward compat).
 */
export const migrateOrganization = mutation({
    args: {
        name: v.string(),
        type: v.union(v.literal("enterprise"), v.literal("institution"), v.literal("government")),
        ownerId: v.string(),
        logoUrl: v.optional(v.string()),
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
            .filter((q) => q.eq(q.field("name"), args.name))
            .unique();

        const now = Date.now();
        const data = {
            ...args,
            quota: {
                maxUsers: 50,
                maxStorage: 10 * 1024 * 1024 * 1024,
                modules: ["iDocument", "iArchive", "iSignature"],
            },
            settings: {
                locale: "fr-GA",
                currency: "XAF",
            },
            status: "active" as const,
            updatedAt: now,
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        }

        return await ctx.db.insert("organizations", {
            ...data,
            createdAt: now,
        });
    },
});

/* ─── v2: Lifecycle Mutations ────────────────── */

/**
 * Create a draft organization from the 3-step wizard (INSCRIRE).
 * Persists immediately with status "brouillon".
 */
export const createDraft = mutation({
    args: {
        name: v.string(),
        type: orgType,
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
        ownerId: v.string(),
        logoUrl: v.optional(v.string()),
        // Identité étendue
        rccm: v.optional(v.string()),
        nif: v.optional(v.string()),
        contact: v.optional(v.string()),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        adresse: v.optional(v.string()),
        ville: v.optional(v.string()),
        pays: v.optional(v.string()),
        // Modules
        modules: v.optional(v.array(v.string())),
        // Hébergement
        hosting: v.optional(v.object({
            type: hostingType,
            domain: v.optional(v.string()),
            pagePublique: v.optional(v.boolean()),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const { modules, hosting, ...rest } = args;

        const orgId = await ctx.db.insert("organizations", {
            ...rest,
            subdomain: hosting?.domain || undefined,
            quota: {
                maxUsers: 25,
                maxStorage: 10 * 1024 * 1024 * 1024,
                modules: modules ?? ["iDocument", "iArchive", "iSignature"],
            },
            settings: {
                locale: "fr-GA",
                currency: "XAF",
            },
            hosting,
            configProgress: {
                profilComplete: !!(args.name && args.type),
                structureOrgComplete: false,
                structureClassementComplete: false,
                modulesConfigComplete: false,
                automationConfigComplete: false,
                deploymentConfigComplete: !!hosting,
            },
            status: "brouillon",
            createdAt: now,
            updatedAt: now,
        });

        // Auto-créer le contact admin obligatoire
        await ctx.db.insert("organization_members", {
            organizationId: orgId,
            userId: args.ownerId,
            role: "admin",
            estAdmin: true,
            level: 2,
            nom: args.contact,
            email: args.email,
            telephone: args.telephone,
            status: "active",
            joinedAt: now,
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_CREEE,
            action: "organizations.createDraft",
            entiteType: "organizations",
            entiteId: String(orgId),
            userId: args.ownerId,
            nom: args.name,
            description: `Brouillon créé: ${args.name}`,
        });

        return orgId;
    },
});

/**
 * Update the configuration progress for an organization.
 * Auto-transitions to "prete" when all required items are complete.
 */
export const updateConfigProgress = mutation({
    args: {
        id: v.id("organizations"),
        progress: v.object({
            profilComplete: v.optional(v.boolean()),
            structureOrgComplete: v.optional(v.boolean()),
            structureClassementComplete: v.optional(v.boolean()),
            modulesConfigComplete: v.optional(v.boolean()),
            automationConfigComplete: v.optional(v.boolean()),
            deploymentConfigComplete: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");

        const currentProgress = org.configProgress ?? {
            profilComplete: false,
            structureOrgComplete: false,
            structureClassementComplete: false,
            modulesConfigComplete: false,
            automationConfigComplete: false,
            deploymentConfigComplete: false,
        };

        const newProgress = {
            ...currentProgress,
            ...Object.fromEntries(
                Object.entries(args.progress).filter(([, v]) => v !== undefined)
            ),
        };

        await ctx.db.patch(args.id, {
            configProgress: newProgress,
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

/**
 * Mark organization as ready for activation.
 * Validates the checklist from actual data, then transitions "brouillon" → "prete".
 */
export const markAsReady = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");
        if (org.status !== "brouillon") {
            throw new Error(`Transition invalide : statut actuel "${org.status}", attendu "brouillon"`);
        }

        // ─── Compute checks from actual data (same logic as getChecklist) ───

        const profilComplete = !!(org.name && org.type);

        const orgUnits = await ctx.db
            .query("org_units")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
            .collect();
        const structureOrgComplete = orgUnits.length > 0;

        const filingStructures = await ctx.db
            .query("filing_structures")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
            .collect();
        let structureClassementComplete = false;
        if (filingStructures.length > 0) {
            const cells = await ctx.db
                .query("filing_cells")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
                .collect();
            structureClassementComplete = cells.length > 0;
        }

        const modulesConfigComplete = !!(
            org.config?.iDocument ||
            org.config?.iArchive ||
            org.config?.iSignature
        );

        const deploymentConfigComplete = !!(org.hosting?.type);

        // ─── Check required items ───

        const required = [
            { complete: profilComplete, label: "Profil" },
            { complete: structureOrgComplete, label: "Structure Organisationnelle" },
            { complete: structureClassementComplete, label: "Structure de Classement" },
            { complete: modulesConfigComplete, label: "Configuration Modules" },
            { complete: deploymentConfigComplete, label: "Déploiement" },
        ];

        const missing = required.filter((r) => !r.complete);

        if (missing.length > 0) {
            throw new Error(
                `Configuration incomplète : ${missing.map((m) => m.label).join(", ")}`
            );
        }

        await ctx.db.patch(args.id, {
            status: "prete",
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_STATUT_CHANGE,
            action: "organizations.markAsReady",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
            description: `Organisation prête: ${org.name}`,
        });

        return args.id;
    },
});

/**
 * Activate an organization (transition "prete" → "active").
 * Seeds all default structures on first activation.
 */
export const activate = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");
        if (org.status !== "prete" && org.status !== "trial") {
            throw new Error(`Transition invalide : statut actuel "${org.status}", attendu "prete" ou "trial"`);
        }

        const now = Date.now();

        await ctx.db.patch(args.id, {
            status: "active",
            updatedAt: now,
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_STATUT_CHANGE,
            action: "organizations.activate",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
            description: `Organisation activée: ${org.name}`,
        });

        // ── Phase 14: Seed defaults on first activation ──

        // 1. Seed archive categories (OHADA) if none exist
        const existingCategories = await ctx.db
            .query("archive_categories")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
            .first();

        if (!existingCategories) {
            const DEFAULT_CATS = [
                { name: "Fiscal", slug: "fiscal", description: "Documents comptables et fiscaux — OHADA Art. 24", color: "amber", icon: "Landmark", retentionYears: 10, ohadaReference: "OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24", countingStartEvent: "date_tag", activeDurationYears: 5, semiActiveDurationYears: 3, alertBeforeArchiveMonths: 12, hasSemiActivePhase: true, isPerpetual: false, autoDestroy: false, defaultConfidentiality: "confidential" as const, isFixed: false, sortOrder: 1 },
                { name: "Social / RH", slug: "social", description: "Contrats de travail, bulletins, déclarations sociales", color: "blue", icon: "Users", retentionYears: 5, ohadaReference: "OHADA: 5 ans — Code du Travail", countingStartEvent: "date_creation", activeDurationYears: 3, semiActiveDurationYears: undefined, alertBeforeArchiveMonths: 6, hasSemiActivePhase: false, isPerpetual: false, autoDestroy: false, defaultConfidentiality: "confidential" as const, isFixed: false, sortOrder: 2 },
                { name: "Juridique", slug: "juridique", description: "Actes constitutifs, PV AG, contrats majeurs", color: "emerald", icon: "Scale", retentionYears: 30, ohadaReference: "OHADA: 30 ans — Acte Uniforme Sociétés Art. 157", countingStartEvent: "date_creation", activeDurationYears: 10, semiActiveDurationYears: 10, alertBeforeArchiveMonths: 24, hasSemiActivePhase: true, isPerpetual: false, autoDestroy: false, defaultConfidentiality: "confidential" as const, isFixed: false, sortOrder: 3 },
                { name: "Commercial", slug: "client", description: "Factures, bons de commande, contrats clients", color: "violet", icon: "Briefcase", retentionYears: 5, ohadaReference: "OHADA: 5 ans — Acte Uniforme Commercial Art. 18", countingStartEvent: "date_tag", activeDurationYears: 3, semiActiveDurationYears: undefined, alertBeforeArchiveMonths: 6, hasSemiActivePhase: false, isPerpetual: false, autoDestroy: false, defaultConfidentiality: "internal" as const, isFixed: false, sortOrder: 4 },
                { name: "Coffre-Fort", slug: "coffre", description: "Conservation perpétuelle — documents stratégiques", color: "rose", icon: "Shield", retentionYears: 99, ohadaReference: "Conservation perpétuelle — décision interne", countingStartEvent: "date_gel", activeDurationYears: 99, semiActiveDurationYears: undefined, alertBeforeArchiveMonths: 0, hasSemiActivePhase: false, isPerpetual: true, autoDestroy: false, defaultConfidentiality: "secret" as const, isFixed: true, sortOrder: 5 },
            ];

            for (const cat of DEFAULT_CATS) {
                await ctx.db.insert("archive_categories", {
                    ...cat,
                    organizationId: args.id,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        // 2. Seed default filing structure if none exists
        const existingStructures = await ctx.db
            .query("filing_structures")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
            .first();

        if (!existingStructures) {
            await ctx.db.insert("filing_structures", {
                organizationId: args.id,
                nom: "Structure de classement par défaut",
                description: "Structure générée automatiquement à l'activation",
                type: "standard",
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });
        }

        // 3. Seed default retention alerts for each category
        const existingAlerts = await ctx.db
            .query("retention_alerts")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
            .first();

        if (!existingAlerts) {
            // Get all categories we just seeded
            const categories = await ctx.db
                .query("archive_categories")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.id))
                .collect();

            for (const cat of categories) {
                if (cat.isPerpetual) continue; // No alerts for perpetual

                // Pre-archive alerts
                for (const alert of [
                    { value: 3, unit: "months" as const, label: `3 mois avant fin phase active — ${cat.name}` },
                    { value: 1, unit: "weeks" as const, label: `1 semaine avant fin phase active — ${cat.name}` },
                ]) {
                    await ctx.db.insert("retention_alerts", {
                        categoryId: cat._id,
                        organizationId: args.id,
                        alertType: "pre_archive",
                        value: alert.value,
                        unit: alert.unit,
                        label: alert.label,
                        createdAt: now,
                    });
                }

                // Pre-deletion alerts
                for (const alert of [
                    { value: 6, unit: "months" as const, label: `6 mois avant expiration rétention — ${cat.name}` },
                    { value: 1, unit: "months" as const, label: `1 mois avant expiration rétention — ${cat.name}` },
                ]) {
                    await ctx.db.insert("retention_alerts", {
                        categoryId: cat._id,
                        organizationId: args.id,
                        alertType: "pre_deletion",
                        value: alert.value,
                        unit: alert.unit,
                        label: alert.label,
                        createdAt: now,
                    });
                }
            }
        }

        return args.id;
    },
});

/**
 * Suspend an organization (transition "active" → "suspended").
 */
export const suspend = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");
        if (org.status !== "active" && org.status !== "trial") {
            throw new Error(`Transition invalide : statut actuel "${org.status}", attendu "active" ou "trial"`);
        }

        await ctx.db.patch(args.id, {
            status: "suspended",
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_STATUT_CHANGE,
            action: "organizations.suspend",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
            description: `Organisation suspendue: ${org.name}`,
        });

        return args.id;
    },
});

/**
 * Start a trial period for an organization.
 * Accepts transitions from: brouillon, prete, active.
 */
export const startTrial = mutation({
    args: {
        id: v.id("organizations"),
        durationDays: v.optional(v.number()), // default 14
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");

        const allowed = ["brouillon", "prete", "active"];
        if (!allowed.includes(org.status)) {
            throw new Error(`Transition invalide : statut "${org.status}" → "trial" non autorisé`);
        }

        const days = args.durationDays ?? 14;
        const now = Date.now();
        const trialEndsAt = now + days * 24 * 60 * 60 * 1000;

        await ctx.db.patch(args.id, {
            status: "trial",
            trialDuration: days,
            trialEndsAt,
            updatedAt: now,
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_STATUT_CHANGE,
            action: "organizations.startTrial",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
            description: `Essai démarré (${days}j): ${org.name}`,
        });

        return args.id;
    },
});

/**
 * Terminate an organization (transition → "resiliee").
 */
export const terminate = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");

        await ctx.db.patch(args.id, {
            status: "resiliee",
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.ORGANISATION_STATUT_CHANGE,
            action: "organizations.terminate",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
            description: `Organisation résiliée: ${org.name}`,
        });

        return args.id;
    },
});

/**
 * Update organization config (module-specific settings, branding, etc.)
 */
export const updateConfig = mutation({
    args: {
        id: v.id("organizations"),
        config: v.any(),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");

        const mergedConfig = {
            ...(org.config ?? {}),
            ...args.config,
        };

        await ctx.db.patch(args.id, {
            config: mergedConfig,
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.CONFIG_MODIFIEE,
            action: "organizations.updateConfig",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
        });

        return args.id;
    },
});

/**
 * Update organization hosting settings.
 */
export const updateHosting = mutation({
    args: {
        id: v.id("organizations"),
        hosting: v.object({
            type: hostingType,
            types: v.optional(v.array(hostingType)),
            domain: v.optional(v.string()),
            pagePublique: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");

        await ctx.db.patch(args.id, {
            hosting: args.hosting,
            subdomain: args.hosting.domain || undefined,
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.CONFIG_MODIFIEE,
            action: "organizations.updateHosting",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
        });

        return args.id;
    },
});

/* ─── Public page queries ──────────────────── */

/**
 * Resolve a subdomain to an organization (public page).
 */
export const getByDomain = query({
    args: { domain: v.string() },
    handler: async (ctx, args) => {
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_subdomain", (q) => q.eq("subdomain", args.domain))
            .unique();

        if (!org) return null;

        // Only return public-safe info
        return {
            _id: org._id,
            name: org.name,
            subdomain: org.subdomain,
            type: org.type,
            description: org.description,
            logoUrl: org.logoUrl,
            email: org.email,
            telephone: org.telephone,
            adresse: org.adresse,
            ville: org.ville,
            pays: org.pays,
            sector: org.sector,
            hosting: org.hosting,
            publicPageConfig: org.publicPageConfig,
            modules: org.quota?.modules,
            status: org.status,
        };
    },
});

/**
 * Check if a subdomain is available (real-time, debounced on client).
 */
export const checkDomainAvailability = query({
    args: { domain: v.string(), excludeOrgId: v.optional(v.id("organizations")) },
    handler: async (ctx, args) => {
        if (!args.domain || args.domain.length < 2) {
            return { available: false, reason: "Le sous-domaine doit contenir au moins 2 caractères" };
        }

        // Validate format
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(args.domain)) {
            return { available: false, reason: "Format invalide (lettres minuscules, chiffres et tirets uniquement)" };
        }

        // Reserved subdomains
        const reserved = ["www", "admin", "api", "app", "mail", "ftp", "staging", "dev", "test", "demo", "support", "help", "docs", "blog"];
        if (reserved.includes(args.domain)) {
            return { available: false, reason: "Ce sous-domaine est réservé" };
        }

        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_subdomain", (q) => q.eq("subdomain", args.domain))
            .unique();

        if (existing && (!args.excludeOrgId || existing._id !== args.excludeOrgId)) {
            return { available: false, reason: "Ce sous-domaine est déjà pris" };
        }

        return { available: true, reason: null };
    },
});

/**
 * Update the public page configuration for an organization.
 */
export const updatePublicPageConfig = mutation({
    args: {
        id: v.id("organizations"),
        config: v.object({
            template: v.optional(publicPageTemplate),
            heroTitle: v.optional(v.string()),
            heroSubtitle: v.optional(v.string()),
            description: v.optional(v.string()),
            primaryColor: v.optional(v.string()),
            accentColor: v.optional(v.string()),
            ctaText: v.optional(v.string()),
            ctaLink: v.optional(v.string()),
            showModules: v.optional(v.boolean()),
            showContact: v.optional(v.boolean()),
            customCss: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (!org) throw new Error("Organisation introuvable");

        const mergedConfig = {
            ...(org.publicPageConfig ?? {}),
            ...Object.fromEntries(
                Object.entries(args.config).filter(([, val]) => val !== undefined)
            ),
        };

        await ctx.db.patch(args.id, {
            publicPageConfig: mergedConfig,
            updatedAt: Date.now(),
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: SIGNAL_TYPES.CONFIG_MODIFIEE,
            action: "organizations.updatePublicPageConfig",
            entiteType: "organizations",
            entiteId: String(args.id),
            userId: "admin",
            nom: org.name,
        });

        return args.id;
    },
});
