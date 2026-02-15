import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Organization Lifecycle
// Status transitions, checklist validation, config progress
// ═══════════════════════════════════════════════

/* ─── Valid transitions ──────────────────────── */

const VALID_TRANSITIONS: Record<string, string[]> = {
    brouillon: ["prete", "brouillon"], // can stay brouillon (re-save)
    prete: ["active", "brouillon"],    // can go back to brouillon
    active: ["suspended"],
    trial: ["active", "suspended"],
    suspended: ["active", "resiliee"],
    resiliee: [],
};

/* ─── Queries ────────────────────────────────── */

/**
 * Get the full configuration checklist for an organization.
 * Returns which tabs are complete and the overall progression.
 */
export const getChecklist = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) return null;

        // 1. Profil: complete if name + type + at least basic contact
        const profilComplete = !!(org.name && org.type);

        // 2. Structure Org: complete if at least 1 org_unit exists
        const orgUnits = await ctx.db
            .query("org_units")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        const structureOrgComplete = orgUnits.length > 0;

        // 3. Structure Classement: complete if at least 1 filing_cell exists
        const filingStructures = await ctx.db
            .query("filing_structures")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        let structureClassementComplete = false;
        if (filingStructures.length > 0) {
            const cells = await ctx.db
                .query("filing_cells")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
                .collect();
            structureClassementComplete = cells.length > 0;
        }

        // 4. Config Modules: complete if at least 1 module has been configured
        // Note: ModulesConfigTab saves as iDocument, iArchive, iSignature (camelCase)
        const modulesConfigComplete = !!(
            org.config?.iDocument ||
            org.config?.iArchive ||
            org.config?.iSignature
        );

        // 5. Automation: optional — complete if automation config exists
        // Note: AutomationTab saves as config.automation = { ... }
        const automationConfigComplete = !!(org.config?.automation);

        // 6. Deployment: complete if hosting is set
        const deploymentConfigComplete = !!(org.hosting?.type);

        const items = [
            { key: "profil", label: "Profil complet", complete: profilComplete, required: true },
            { key: "structureOrg", label: "Structure organisationnelle (≥1 unité)", complete: structureOrgComplete, required: true },
            { key: "structureClassement", label: "Structure de classement (≥1 dossier)", complete: structureClassementComplete, required: true },
            { key: "modulesConfig", label: "Configuration modules", complete: modulesConfigComplete, required: true },
            { key: "automation", label: "Automatisation", complete: automationConfigComplete, required: false },
            { key: "deployment", label: "Hébergement configuré", complete: deploymentConfigComplete, required: true },
        ];

        const requiredItems = items.filter((i) => i.required);
        const completedRequired = requiredItems.filter((i) => i.complete).length;
        const totalRequired = requiredItems.length;
        const allRequiredComplete = completedRequired === totalRequired;

        const completedAll = items.filter((i) => i.complete).length;
        const progressPercent = Math.round((completedAll / items.length) * 100);

        return {
            items,
            completedRequired,
            totalRequired,
            allRequiredComplete,
            progressPercent,
            canActivate: allRequiredComplete,
            currentStatus: org.status,
        };
    },
});

/* ─── Mutations ──────────────────────────────── */

/**
 * Refresh the configProgress field on the organization.
 * Call this after any configuration tab saves its data.
 */
export const refreshConfigProgress = mutation({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) throw new Error("Organisation introuvable");

        // Recompute each flag
        const profilComplete = !!(org.name && org.type);

        const orgUnits = await ctx.db
            .query("org_units")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        const structureOrgComplete = orgUnits.length > 0;

        const filingStructures = await ctx.db
            .query("filing_structures")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
        let structureClassementComplete = false;
        if (filingStructures.length > 0) {
            const cells = await ctx.db
                .query("filing_cells")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
                .collect();
            structureClassementComplete = cells.length > 0;
        }

        // Note: ModulesConfigTab saves as iDocument, iArchive, iSignature (camelCase)
        const modulesConfigComplete = !!(
            org.config?.iDocument ||
            org.config?.iArchive ||
            org.config?.iSignature
        );

        // Note: AutomationTab saves as config.automation = { ... }
        const automationConfigComplete = !!(org.config?.automation);

        const deploymentConfigComplete = !!(org.hosting?.type);

        await ctx.db.patch(args.organizationId, {
            configProgress: {
                profilComplete,
                structureOrgComplete,
                structureClassementComplete,
                modulesConfigComplete,
                automationConfigComplete,
                deploymentConfigComplete,
            },
            updatedAt: Date.now(),
        });

        // Auto-transition to "prete" if all required items are complete and still brouillon
        const allRequiredComplete = profilComplete && structureOrgComplete &&
            structureClassementComplete && modulesConfigComplete && deploymentConfigComplete;

        if (allRequiredComplete && org.status === "brouillon") {
            await ctx.db.patch(args.organizationId, {
                status: "prete",
                updatedAt: Date.now(),
            });
        }

        return args.organizationId;
    },
});

/**
 * Transition an organization to a new status with guard logic.
 */
export const transitionStatus = mutation({
    args: {
        organizationId: v.id("organizations"),
        targetStatus: v.union(
            v.literal("brouillon"),
            v.literal("prete"),
            v.literal("active"),
            v.literal("trial"),
            v.literal("suspended"),
            v.literal("resiliee")
        ),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) throw new Error("Organisation introuvable");

        const allowed = VALID_TRANSITIONS[org.status] ?? [];
        if (!allowed.includes(args.targetStatus)) {
            throw new Error(
                `Transition invalide : ${org.status} → ${args.targetStatus}. ` +
                `Transitions autorisées : ${allowed.join(", ") || "aucune"}`
            );
        }

        // Guard: brouillon→prete requires all required checklist items
        if (args.targetStatus === "prete") {
            const profilOk = !!(org.name && org.type);
            const deployOk = !!(org.hosting?.type);

            const orgUnits = await ctx.db
                .query("org_units")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
                .collect();

            const filingStructures = await ctx.db
                .query("filing_structures")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
                .collect();

            let classementOk = false;
            if (filingStructures.length > 0) {
                const cells = await ctx.db
                    .query("filing_cells")
                    .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
                    .collect();
                classementOk = cells.length > 0;
            }

            const modulesOk = !!(
                org.config?.iDocument ||
                org.config?.iArchive ||
                org.config?.iSignature
            );

            if (!profilOk || orgUnits.length === 0 || !classementOk || !modulesOk || !deployOk) {
                throw new Error(
                    "Checklist incomplète : tous les éléments requis doivent être configurés avant de passer en statut « Prête »."
                );
            }
        }

        await ctx.db.patch(args.organizationId, {
            status: args.targetStatus,
            updatedAt: Date.now(),
        });

        return args.organizationId;
    },
});
