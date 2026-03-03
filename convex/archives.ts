import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateArchiveCertNumber, generateDestructionCertNumber } from "./lib/certificateNumber";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Archives (iArchive)
// v3: Dynamic categories from DB, double hash, traçabilité source
// ═══════════════════════════════════════════════

// ─── Queries ────────────────────────────────────

export const list = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
        categorySlug: v.optional(v.string()),
        status: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let results;

        if (args.organizationId && args.categorySlug) {
            results = await ctx.db
                .query("archives")
                .withIndex("by_org_category", (q) =>
                    q
                        .eq("organizationId", args.organizationId!)
                        .eq("categorySlug", args.categorySlug!)
                )
                .order("desc")
                .collect();
        } else if (args.organizationId) {
            results = await ctx.db
                .query("archives")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .order("desc")
                .collect();
        } else if (args.categorySlug) {
            results = await ctx.db
                .query("archives")
                .withIndex("by_categorySlug", (q) =>
                    q.eq("categorySlug", args.categorySlug!)
                )
                .order("desc")
                .collect();
        } else {
            results = await ctx.db.query("archives").order("desc").collect();
        }

        // Apply optional filters
        if (args.status) {
            results = results.filter((a) => a.status === args.status);
        }
        if (args.search) {
            const s = args.search.toLowerCase();
            results = results.filter(
                (a) =>
                    a.title.toLowerCase().includes(s) ||
                    a.fileName.toLowerCase().includes(s) ||
                    a.tags?.some((t: string) => t.toLowerCase().includes(s))
            );
        }

        return results;
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

// ─── Stats ──────────────────────────────────────

export const getStats = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const all = await ctx.db
            .query("archives")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const totalSize = all.reduce((sum, a) => sum + a.fileSize, 0);
        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const expiringSoon: typeof all = [];

        const threeMonths = 90 * 24 * 3600 * 1000;
        const now = Date.now();

        for (const a of all) {
            byCategory[a.categorySlug] = (byCategory[a.categorySlug] ?? 0) + 1;
            byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
            if (
                a.retentionExpiresAt &&
                a.retentionExpiresAt - now < threeMonths &&
                a.status !== "destroyed"
            ) {
                expiringSoon.push(a);
            }
        }

        return {
            totalArchives: all.length,
            totalSizeBytes: totalSize,
            byCategory,
            byStatus,
            expiringSoon: expiringSoon.length,
        };
    },
});

// ─── Mutations ──────────────────────────────────

export const createArchiveEntry = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        categorySlug: v.string(),                         // Slug dynamique (remplace l'ancien union)
        organizationId: v.optional(v.id("organizations")),
        uploadedBy: v.string(),
        fileUrl: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        sha256Hash: v.string(),
        tags: v.optional(v.array(v.string())),
        confidentiality: v.optional(v.string()),
        countingStartDate: v.optional(v.number()),
        // Double hash (optionnel, pour les archives de type document_archive)
        frozenContent: v.optional(v.any()),
        contentHash: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        pdfHash: v.optional(v.string()),
        sourceDocumentId: v.optional(v.id("documents")),
        sourceFolderId: v.optional(v.id("folders")),
        sourceType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Charger la catégorie depuis la DB (plus de hardcode)
        const category = await ctx.db
            .query("archive_categories")
            .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
            .filter((q) =>
                args.organizationId
                    ? q.eq(q.field("organizationId"), args.organizationId)
                    : true
            )
            .first();

        if (!category) {
            throw new Error(`Catégorie "${args.categorySlug}" introuvable pour cette organisation`);
        }

        // 2. Calculer les dates de lifecycle
        const T0 = args.countingStartDate ?? now;
        const msPerYear = 365.25 * 24 * 3600 * 1000;

        const activeDuration = (category.activeDurationYears ?? category.retentionYears) * msPerYear;
        const semiActiveDuration = (category.semiActiveDurationYears ?? 0) * msPerYear;
        const totalRetention = category.retentionYears * msPerYear;

        const activeUntil = T0 + activeDuration;
        const semiActiveUntil = category.hasSemiActivePhase
            ? T0 + activeDuration + semiActiveDuration
            : undefined;
        const retentionExpiresAt = T0 + totalRetention;

        // 3. Créer l'archive avec tous les champs
        const archiveId = await ctx.db.insert("archives", {
            title: args.title,
            description: args.description,
            categoryId: category._id,                    // ✅ Maintenant peuplé
            categorySlug: args.categorySlug,
            organizationId: args.organizationId,
            uploadedBy: args.uploadedBy,
            archivedBy: args.uploadedBy,
            fileUrl: args.fileUrl,
            fileName: args.fileName,
            fileSize: args.fileSize,
            mimeType: args.mimeType,
            sha256Hash: args.sha256Hash,
            tags: args.tags ?? [],
            // Double hash
            frozenContent: args.frozenContent,
            contentHash: args.contentHash,
            pdfUrl: args.pdfUrl,
            pdfHash: args.pdfHash,
            // Traçabilité
            sourceDocumentId: args.sourceDocumentId,
            sourceFolderId: args.sourceFolderId,
            sourceType: (args.sourceType as "manual_upload" | "document_archive" | "folder_archive" | "auto_archive") ?? "manual_upload",
            // Lifecycle
            retentionYears: category.retentionYears,
            retentionExpiresAt,
            status: "active",
            lifecycleState: "active",
            countingStartDate: T0,
            triggerEvent: category.countingStartEvent,
            activeUntil,
            semiActiveUntil,
            stateChangedAt: now,
            // Métadonnées
            metadata: {
                confidentiality: (args.confidentiality as "public" | "internal" | "confidential" | "secret") ?? category.defaultConfidentiality ?? "internal",
            },
            isVault: category.isPerpetual ?? false,
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
        // 1. Check archive certificates
        const archiveCert = await ctx.db
            .query("archive_certificates")
            .withIndex("by_certificateNumber", (q) =>
                q.eq("certificateNumber", args.certificateNumber)
            )
            .first();

        if (archiveCert) {
            const archive = await ctx.db.get(archiveCert.archiveId);
            if (!archive) return null;

            let orgName = "Organisation Inconnue";
            if (archive.organizationId) {
                const org = await ctx.db.get(archive.organizationId);
                if (org && 'name' in org) {
                    orgName = org.name as string;
                }
            }

            return {
                type: "archive" as const,
                cert: archiveCert,
                archive,
                orgName
            };
        }

        // 2. Check destruction certificates
        const destructionCert = await ctx.db
            .query("destruction_certificates")
            .withIndex("by_certificateNumber", (q) =>
                q.eq("certificateNumber", args.certificateNumber)
            )
            .first();

        if (destructionCert) {
            const archive = await ctx.db.get(destructionCert.archiveId);
            if (!archive) return null;

            let orgName = "Organisation Inconnue";
            if (archive.organizationId) {
                const org = await ctx.db.get(archive.organizationId);
                if (org && 'name' in org) {
                    orgName = org.name as string;
                }
            }

            return {
                type: "destruction" as const,
                cert: destructionCert,
                orgName
            };
        }

        // 3. Not found
        return null;
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
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive not found");

        const msPerYear = 365.25 * 24 * 3600 * 1000;
        const extension = args.additionalYears * msPerYear;
        const newExpiry = archive.retentionExpiresAt + extension;
        const newRetention = archive.retentionYears + args.additionalYears;

        // Si l'archive était "expired", la repasser en "archived"
        const statusUpdate: Record<string, unknown> = {
            retentionExpiresAt: newExpiry,
            retentionYears: newRetention,
            updatedAt: Date.now(),
        };
        if (archive.status === "expired") {
            statusUpdate.status = "archived";
            statusUpdate.stateChangedAt = Date.now();
        }

        await ctx.db.patch(args.archiveId, statusUpdate);

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
                reason: args.reason ?? "Non spécifié",
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
        categorySlug: v.optional(v.string()),
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
        if (args.organizationId && args.categorySlug) {
            archives = await ctx.db
                .query("archives")
                .withIndex("by_org_category", (q) =>
                    q
                        .eq("organizationId", args.organizationId!)
                        .eq("categorySlug", args.categorySlug!)
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
        const certificateNumber = await generateArchiveCertNumber(ctx.db);

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

// ═══════════════════════════════════════════════
// Phase 3 — Destruction légale & Cycle de fin de vie
// ═══════════════════════════════════════════════

// ─── Destruction manuelle (demandée par un admin) ───────────

export const requestDestruction = mutation({
    args: {
        archiveId: v.id("archives"),
        userId: v.string(),
        reason: v.string(),
        method: v.union(
            v.literal("legal_expiry"),
            v.literal("manual_request"),
            v.literal("compliance")
        ),
        legalBasis: v.optional(v.string()),
        approvedBy: v.optional(v.string()),
        witnesses: v.optional(v.array(v.object({
            userId: v.string(),
            name: v.string(),
            role: v.string(),
        }))),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Charger l'archive
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive introuvable");

        // 2. Vérifier l'état (doit être "archived" ou "expired")
        if (!["archived", "expired"].includes(archive.status)) {
            throw new Error("Seule une archive en état 'archived' ou 'expired' peut être détruite");
        }

        // 3. Charger la catégorie pour la référence OHADA
        const category = archive.categoryId
            ? await ctx.db.get(archive.categoryId)
            : null;

        // 4. Vérifier que le Coffre-Fort ne peut pas être détruit
        if (archive.isVault || category?.isPerpetual) {
            throw new Error("Les archives du Coffre-Fort (perpétuelles) ne peuvent pas être détruites");
        }

        // 5. Déterminer la conformité OHADA
        const ohadaCompliant = archive.retentionExpiresAt
            ? now >= archive.retentionExpiresAt
            : false;

        // 6. Générer le numéro de certificat séquentiel
        const certificateNumber = await generateDestructionCertNumber(ctx.db);

        // 7. Créer le certificat de destruction
        const certId = await ctx.db.insert("destruction_certificates", {
            certificateNumber,
            archiveId: args.archiveId,
            organizationId: archive.organizationId!,
            // Document détruit
            documentTitle: archive.title,
            documentCategory: category?.name ?? "Inconnue",
            documentCategorySlug: archive.categorySlug,
            originalFileName: archive.fileName,
            originalFileSize: archive.fileSize,
            originalMimeType: archive.mimeType,
            originalSha256Hash: archive.sha256Hash,
            originalContentHash: archive.contentHash,
            originalPdfHash: archive.pdfHash,
            originalCreatedAt: archive.createdAt,
            originalArchivedAt: archive.stateChangedAt ?? archive.createdAt,
            // Rétention
            retentionYears: archive.retentionYears,
            retentionExpiresAt: archive.retentionExpiresAt,
            ohadaReference: category?.ohadaReference,
            ohadaCompliant,
            // Destruction
            destroyedAt: now,
            destroyedBy: args.userId,
            destructionMethod: args.method,
            destructionReason: args.reason,
            approvedBy: args.approvedBy,
            approvedAt: args.approvedBy ? now : undefined,
            // Témoins
            witnesses: args.witnesses?.map((w) => ({
                ...w,
                acknowledgedAt: now,
            })),
            // Certificat
            status: "valid",
            issuedAt: now,
        });

        // 8. Marquer l'archive comme détruite
        await ctx.db.patch(args.archiveId, {
            status: "destroyed",
            lifecycleState: "destroyed",
            stateChangedAt: now,
            updatedAt: now,
        });

        // 9. Révoquer le certificat d'archivage original (s'il existe)
        if (archive.certificateId) {
            await ctx.db.patch(archive.certificateId, {
                status: "revoked",
            });
        }

        // 10. Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: archive.organizationId,
            userId: args.userId,
            action: "archive.destroyed",
            resourceType: "archive",
            resourceId: args.archiveId,
            details: {
                certificateNumber,
                method: args.method,
                reason: args.reason,
                ohadaCompliant,
            },
            createdAt: now,
        });

        return { certificateNumber, certId, ohadaCompliant };
    },
});

// ─── Query : Certificat de destruction ──────────────

export const getDestructionCertificate = query({
    args: { archiveId: v.id("archives") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("destruction_certificates")
            .withIndex("by_archiveId", (q) => q.eq("archiveId", args.archiveId))
            .first();
    },
});
