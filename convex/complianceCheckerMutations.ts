import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const saveReport = internalMutation({
    args: {
        organizationId: v.id("organizations"),
        type: v.union(v.literal("audit"), v.literal("forecast")),
        score: v.number(),
        issues: v.array(v.object({
            severity: v.union(v.literal("critical"), v.literal("warning"), v.literal("info")),
            category: v.string(),
            message: v.string(),
            documentId: v.optional(v.string()),
            folderId: v.optional(v.string()),
            suggestion: v.optional(v.string()),
        })),
        recommendations: v.array(v.string()),
        stats: v.optional(v.object({
            totalDocuments: v.number(),
            documentsWithCategory: v.number(),
            documentsWithCertificate: v.number(),
            confidentialInPublic: v.number(),
            expiringNext90Days: v.number(),
            expiringByQuarter: v.optional(v.object({
                q1: v.number(), q2: v.number(), q3: v.number(), q4: v.number(),
            })),
            storageToFreeBytes: v.optional(v.number()),
            healthScore: v.optional(v.number()),
        })),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("compliance_reports", args);
    },
});

// ─── Cron wrapper: audit toutes les organisations actives ──────────

export const runScheduledAudits = internalAction({
    args: {},
    handler: async (ctx) => {
        // Récupérer toutes les orgs actives
        const orgs = await ctx.runQuery(internal.complianceCheckerQueries.getActiveOrgs, {});
        let audited = 0;

        for (const org of orgs) {
            try {
                await ctx.runAction(internal.complianceChecker.runComplianceAudit, {
                    organizationId: org._id,
                });
                audited++;
            } catch {
                // Log silencieux — ne pas bloquer les autres orgs
            }
        }

        return { audited };
    },
});
