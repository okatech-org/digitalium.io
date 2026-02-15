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
                        .eq("categorySlug", args.category!)
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
                .withIndex("by_categorySlug", (q) =>
                    q.eq("categorySlug", args.category!)
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
            categorySlug: categoryStr,
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
            lifecycleState: "active",
            countingStartDate: now,
            activeUntil: now + retentionMs,
            stateChangedAt: now,
            metadata: {
                confidentiality: "internal",
            },
            isVault: categoryStr === "vault",
            createdAt: now,
            updatedAt: now,
        });

        return archiveId;
    },
});

// ─── List Certificates ───────────────────────────

export const listCertificates = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const certs = await ctx.db
            .query("archive_certificates")
            .order("desc")
            .collect();

        // Enrich with archive data
        const enriched = await Promise.all(
            certs.map(async (cert) => {
                const archive = await ctx.db.get(cert.archiveId);
                if (
                    args.organizationId &&
                    archive?.organizationId !== args.organizationId
                ) {
                    return null;
                }
                return { ...cert, archive };
            })
        );

        return enriched.filter(Boolean);
    },
});

export const getCertificateByNumber = query({
    args: { certificateNumber: v.string() },
    handler: async (ctx, args) => {
        const cert = await ctx.db
            .query("archive_certificates")
            .withIndex("by_certificateNumber", (q) =>
                q.eq("certificateNumber", args.certificateNumber)
            )
            .first();
        if (!cert) return null;

        const archive = await ctx.db.get(cert.archiveId);
        return { ...cert, archive };
    },
});

// ─── Verify Integrity ────────────────────────────

export const verifyIntegrity = mutation({
    args: {
        archiveId: v.id("archives"),
        currentHash: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive not found");

        const isValid = archive.sha256Hash === args.currentHash;
        const now = Date.now();

        // Log in audit
        await ctx.db.insert("audit_logs", {
            organizationId: archive.organizationId,
            userId: args.userId,
            action: isValid
                ? "archive.integrity_verified"
                : "archive.integrity_failed",
            resourceType: "archive",
            resourceId: args.archiveId,
            details: {
                originalHash: archive.sha256Hash,
                currentHash: args.currentHash,
                isValid,
            },
            createdAt: now,
        });

        return {
            isValid,
            originalHash: archive.sha256Hash,
            currentHash: args.currentHash,
            verifiedAt: now,
        };
    },
});

// ─── Expiration Alerts ───────────────────────────

export const getExpiringArchives = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
        daysThreshold: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const threshold = args.daysThreshold ?? 30;
        const now = Date.now();
        const cutoff = now + threshold * 24 * 3600 * 1000;

        let archives;
        if (args.organizationId) {
            archives = await ctx.db
                .query("archives")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .collect();
        } else {
            archives = await ctx.db.query("archives").collect();
        }

        return archives.filter(
            (a) =>
                a.status === "active" &&
                a.retentionExpiresAt <= cutoff &&
                a.retentionExpiresAt > now
        );
    },
});

// ─── Extend Retention ────────────────────────────

export const extendRetention = mutation({
    args: {
        archiveId: v.id("archives"),
        additionalYears: v.number(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive not found");

        const extraMs = args.additionalYears * 365.25 * 24 * 3600 * 1000;
        const newExpiry = archive.retentionExpiresAt + extraMs;
        const newRetention = archive.retentionYears + args.additionalYears;

        await ctx.db.patch(args.archiveId, {
            retentionExpiresAt: newExpiry,
            retentionYears: newRetention,
            updatedAt: Date.now(),
        });

        // Also update certificate validity if exists
        if (archive.certificateId) {
            await ctx.db.patch(archive.certificateId, {
                validUntil: newExpiry,
            });
        }

        // Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: archive.organizationId,
            userId: args.userId,
            action: "archive.retention_extended",
            resourceType: "archive",
            resourceId: args.archiveId,
            details: {
                additionalYears: args.additionalYears,
                newRetentionYears: newRetention,
                newExpiresAt: newExpiry,
            },
            createdAt: Date.now(),
        });
    },
});

// ─── Revoke Certificate ──────────────────────────

export const revokeCertificate = mutation({
    args: {
        certificateId: v.id("archive_certificates"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const cert = await ctx.db.get(args.certificateId);
        if (!cert) throw new Error("Certificate not found");

        await ctx.db.patch(args.certificateId, { status: "revoked" });

        const archive = await ctx.db.get(cert.archiveId);

        await ctx.db.insert("audit_logs", {
            organizationId: archive?.organizationId,
            userId: args.userId,
            action: "archive.certificate_revoked",
            resourceType: "archive",
            resourceId: cert.archiveId,
            details: { certificateNumber: cert.certificateNumber },
            createdAt: Date.now(),
        });
    },
});

// ─── Update Archive Metadata (OCR, etc) ──────────

export const updateMetadata = mutation({
    args: {
        archiveId: v.id("archives"),
        ocrText: v.optional(v.string()),
        extractedData: v.optional(v.any()),
        confidentiality: v.optional(
            v.union(
                v.literal("public"),
                v.literal("internal"),
                v.literal("confidential"),
                v.literal("secret")
            )
        ),
    },
    handler: async (ctx, args) => {
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive not found");

        const metadata = { ...archive.metadata };
        if (args.ocrText !== undefined) metadata.ocrText = args.ocrText;
        if (args.extractedData !== undefined)
            metadata.extractedData = args.extractedData;
        if (args.confidentiality !== undefined)
            metadata.confidentiality = args.confidentiality;

        await ctx.db.patch(args.archiveId, {
            metadata,
            updatedAt: Date.now(),
        });
    },
});

// ─── Search Archives ─────────────────────────────

export const search = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
        query: v.string(),
        category: v.optional(archiveCategory),
        status: v.optional(
            v.union(
                v.literal("active"),
                v.literal("semi_active"),
                v.literal("archived"),
                v.literal("expired"),
                v.literal("on_hold"),
                v.literal("destroyed")
            )
        ),
        mimeType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let archives;
        if (args.organizationId && args.category) {
            archives = await ctx.db
                .query("archives")
                .withIndex("by_org_category", (q) =>
                    q
                        .eq("organizationId", args.organizationId!)
                        .eq("categorySlug", args.category!)
                )
                .collect();
        } else if (args.organizationId) {
            archives = await ctx.db
                .query("archives")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .collect();
        } else {
            archives = await ctx.db.query("archives").collect();
        }

        const q = args.query.toLowerCase();

        return archives.filter((a) => {
            if (args.status && a.status !== args.status) return false;
            if (args.mimeType && !a.mimeType.includes(args.mimeType))
                return false;

            const matchTitle = a.title.toLowerCase().includes(q);
            const matchDesc =
                a.description?.toLowerCase().includes(q) ?? false;
            const matchOcr =
                a.metadata?.ocrText?.toLowerCase().includes(q) ?? false;
            const matchHash = a.sha256Hash.toLowerCase().includes(q);
            const matchFile = a.fileName.toLowerCase().includes(q);

            return matchTitle || matchDesc || matchOcr || matchHash || matchFile;
        });
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
