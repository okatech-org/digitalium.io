import { mutation } from "./_generated/server";

// ═══════════════════════════════════════════════
// Fix: Patch broken archive seed data
// Adds missing categorySlug and isVault fields
// ═══════════════════════════════════════════════

export const fixArchiveData = mutation({
    args: {},
    handler: async (ctx) => {
        // Get all archives and fix any that have the old 'category' field
        // but are missing 'categorySlug' or 'isVault'
        const allArchives = await ctx.db.query("archives").collect();
        let fixed = 0;

        for (const archive of allArchives) {
            const raw = archive as Record<string, unknown>;
            const needsFix = !raw.categorySlug || raw.isVault === undefined;

            if (needsFix) {
                await ctx.db.patch(archive._id, {
                    categorySlug: (raw.category as string) ?? (raw.categorySlug as string) ?? "fiscal",
                    isVault: (raw.isVault as boolean) ?? false,
                });
                fixed++;
            }
        }

        console.log(`✅ Fixed ${fixed} archive documents.`);
    },
});
