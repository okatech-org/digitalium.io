// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Migration Script
// One-shot migration to patch existing data with
// lifecycle fields (v2)
// ═══════════════════════════════════════════════

import { mutation } from "./_generated/server";

// ─── Default lifecycle values by category slug ──

const LIFECYCLE_DEFAULTS: Record<
    string,
    {
        ohadaReference: string;
        countingStartEvent: string;
        activeDurationYears: number;
        semiActiveDurationYears: number;
        alertBeforeArchiveMonths: number;
        hasSemiActivePhase: boolean;
        isPerpetual: boolean;
    }
> = {
    fiscal: {
        ohadaReference: "OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24",
        countingStartEvent: "date_tag",
        activeDurationYears: 5,
        semiActiveDurationYears: 3,
        alertBeforeArchiveMonths: 12,
        hasSemiActivePhase: true,
        isPerpetual: false,
    },
    social: {
        ohadaReference: "OHADA: 5 ans min. — Code du Travail / Statuts Art. 115",
        countingStartEvent: "date_creation",
        activeDurationYears: 3,
        semiActiveDurationYears: 1,
        alertBeforeArchiveMonths: 6,
        hasSemiActivePhase: true,
        isPerpetual: false,
    },
    juridique: {
        ohadaReference: "OHADA: 30 ans min. — Acte Uniforme Droit des Sociétés Art. 36",
        countingStartEvent: "date_cloture",
        activeDurationYears: 10,
        semiActiveDurationYears: 10,
        alertBeforeArchiveMonths: 12,
        hasSemiActivePhase: true,
        isPerpetual: false,
    },
    client: {
        ohadaReference: "OHADA: 5 ans min. — Acte Uniforme Droit Commercial Art. 18",
        countingStartEvent: "date_creation",
        activeDurationYears: 3,
        semiActiveDurationYears: 1,
        alertBeforeArchiveMonths: 6,
        hasSemiActivePhase: true,
        isPerpetual: false,
    },
    coffre: {
        ohadaReference: "OHADA: 99 ans min. — Conservation perpétuelle",
        countingStartEvent: "date_gel",
        activeDurationYears: 50,
        semiActiveDurationYears: 30,
        alertBeforeArchiveMonths: 60,
        hasSemiActivePhase: true,
        isPerpetual: true,
    },
};

// ─── Migration: Patch archive_categories ──────

export const migrateCategories = mutation({
    args: {},
    handler: async (ctx) => {
        const categories = await ctx.db
            .query("archive_categories")
            .collect();

        let patched = 0;
        for (const cat of categories) {
            // Only patch if lifecycle fields are missing
            if (cat.ohadaReference) continue;

            const defaults = LIFECYCLE_DEFAULTS[cat.slug];
            if (defaults) {
                await ctx.db.patch(cat._id, {
                    ...defaults,
                    updatedAt: Date.now(),
                });
                patched++;
            }
        }

        return { patched, total: categories.length };
    },
});

// ─── Migration: Patch archives ────────────────

export const migrateArchives = mutation({
    args: {},
    handler: async (ctx) => {
        const archives = await ctx.db
            .query("archives")
            .collect();

        const now = Date.now();
        const msPerYear = 365.25 * 24 * 3600 * 1000;
        let patched = 0;

        for (const archive of archives) {
            // Only patch if lifecycle fields are missing
            if (archive.lifecycleState) continue;

            const updates: Record<string, unknown> = {
                lifecycleState: "active" as const,
                countingStartDate: archive.createdAt,
                stateChangedAt: archive.createdAt,
                updatedAt: now,
            };

            // Compute activeUntil from retentionYears
            updates.activeUntil =
                archive.createdAt + archive.retentionYears * msPerYear;

            // Migrate status: "expired" → "archived"
            if (archive.status === "expired") {
                updates.status = "archived";
                updates.lifecycleState = "archived";
                updates.stateChangedAt = now;
            }

            // Add categorySlug if missing
            if (!archive.categorySlug && archive.category) {
                updates.categorySlug = archive.category;
            }

            await ctx.db.patch(archive._id, updates);
            patched++;
        }

        return { patched, total: archives.length };
    },
});
