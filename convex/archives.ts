import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Archives (iArchive)
// ═══════════════════════════════════════════════

const archiveCategory = v.union(
    v.literal("fiscal"),
    v.literal("social"),
    v.literal("legal"),
    v.literal("client"),
    v.literal("vault")
);

// ─── Retention mapping (years) ──────────────────
// fiscal: 10 years, social: 5, legal: 30, client: 5, vault: perpetual (99)
const RETENTION_MAP: Record<string, number> = {
    fiscal: 10,
    social: 5,
    legal: 30,
    client: 5,
    vault: 99,
};

// ─── Queries ────────────────────────────────────

export const list = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
        category: v.optional(archiveCategory),
    },
    handler: async (ctx, args) => {
        if (args.organizationId && args.category) {
            return ctx.db
                .query("archives")
                .withIndex("by_org_category", (q) =>
                    q
                        .eq("organizationId", args.organizationId!)
                        .eq("category", args.category!)
                )
                .order("desc")
                .collect();
        }
        if (args.organizationId) {
            return ctx.db
                .query("archives")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .order("desc")
                .collect();
        }
        if (args.category) {
            return ctx.db
                .query("archives")
                .withIndex("by_category", (q) =>
                    q.eq("category", args.category!)
                )
                .order("desc")
                .collect();
        }
        return ctx.db.query("archives").order("desc").collect();
    },
});

export const get = query({
    args: { id: v.id("archives") },
    handler: async (ctx, args) => {
        return ctx.db.get(args.id);
    },
});

export const getCertificate = query({
    args: { archiveId: v.id("archives") },
    handler: async (ctx, args) => {
        return ctx.db
            .query("archive_certificates")
            .withIndex("by_archiveId", (q) => q.eq("archiveId", args.archiveId))
            .first();
    },
});

// ─── Mutations ──────────────────────────────────

export const createArchiveEntry = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        category: archiveCategory,
        organizationId: v.optional(v.id("organizations")),
        uploadedBy: v.string(),
        fileUrl: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        sha256Hash: v.string(),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const categoryStr = args.category as string;
        const retentionYears = RETENTION_MAP[categoryStr] ?? 10;
        const now = Date.now();
        const retentionMs = retentionYears * 365.25 * 24 * 3600 * 1000;

        const archiveId = await ctx.db.insert("archives", {
            title: args.title,
            description: args.description,
            category: args.category,
            organizationId: args.organizationId,
            uploadedBy: args.uploadedBy,
            fileUrl: args.fileUrl,
            fileName: args.fileName,
            fileSize: args.fileSize,
            mimeType: args.mimeType,
            sha256Hash: args.sha256Hash,
            retentionYears,
            retentionExpiresAt: now + retentionMs,
            status: "active",
            metadata: {
                confidentiality: "internal",
            },
            createdAt: now,
            updatedAt: now,
        });

        return archiveId;
    },
});

export const createCertificate = mutation({
    args: {
        archiveId: v.id("archives"),
        sha256Hash: v.string(),
        issuedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const year = new Date(now).getFullYear();
        const seq = Math.floor(Math.random() * 99999)
            .toString()
            .padStart(5, "0");
        const certificateNumber = `CERT-${year}-${seq}`;

        // Valid for same as archive retention
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive not found");

        const validUntilMs =
            archive.retentionYears * 365.25 * 24 * 3600 * 1000;

        const certId = await ctx.db.insert("archive_certificates", {
            archiveId: args.archiveId,
            certificateNumber,
            sha256Hash: args.sha256Hash,
            issuedAt: now,
            issuedBy: args.issuedBy,
            validUntil: now + validUntilMs,
            status: "valid",
        });

        // Link certificate back to archive
        await ctx.db.patch(args.archiveId, { certificateId: certId });

        return { certId, certificateNumber };
    },
});
