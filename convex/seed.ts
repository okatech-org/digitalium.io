import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedData = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // 1. Create Demo User
        const demoUserId = "demo-sysadmin-uid";
        let demoUser = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", demoUserId))
            .unique();

        if (!demoUser) {
            const id = await ctx.db.insert("users", {
                userId: demoUserId,
                email: "demo-sysadmin@digitalium.ga",
                displayName: "Super Admin",
                onboardingCompleted: true,
                createdAt: now,
                updatedAt: now,
            });
            demoUser = await ctx.db.get(id);
        }

        // 2. Create Demo Org
        let demoOrg = await ctx.db
            .query("organizations")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", demoUserId))
            .first();

        if (!demoOrg) {
            const id = await ctx.db.insert("organizations", {
                name: "Digitalium Corp",
                type: "enterprise",
                ownerId: demoUserId,
                status: "active",
                quota: {
                    maxUsers: 100,
                    maxStorage: 100 * 1024 * 1024 * 1024,
                    modules: ["iDocument", "iArchive", "iSignature"],
                },
                settings: {
                    locale: "fr-GA",
                    currency: "XAF",
                },
                createdAt: now,
                updatedAt: now,
            });
            demoOrg = await ctx.db.get(id);
        }

        // 3. Create Demo Fiscal Archives
        const fiscalEntries = [
            { title: "Bilan comptable 2025", hash: "5854a1eb44420c6893e0fa79751ee81fe97996fc3b08af43212a831f947d47a5", size: 2400000, archivedBy: "Daniel Nguema" },
            { title: "Déclaration TVA — T4 2025", hash: "a3e8b12c7d5f6e9a0b4c8d1e2f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f01", size: 1800000, archivedBy: "Marie Obame" },
        ];

        for (const entry of fiscalEntries) {
            const existing = await ctx.db
                .query("archives")
                .withIndex("by_sha256Hash", q => q.eq("sha256Hash", entry.hash))
                .unique();

            if (!existing) {
                await ctx.db.insert("archives", {
                    title: entry.title,
                    categorySlug: "fiscal",
                    organizationId: demoOrg?._id,
                    uploadedBy: demoUserId,
                    sha256Hash: entry.hash,
                    fileName: `${entry.title.toLowerCase().replace(/ /g, "_")}.pdf`,
                    fileUrl: "https://example.com/demo.pdf",
                    fileSize: entry.size,
                    mimeType: "application/pdf",
                    retentionYears: 10,
                    retentionExpiresAt: now + (10 * 365 * 24 * 60 * 60 * 1000),
                    status: "active",
                    isVault: false,
                    metadata: { confidentiality: "internal" },
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        console.log("✅ Seed completed.");
    },
});
