// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Archive Bridge
// Pont iDocument → iArchive avec double hash SHA-256
// ═══════════════════════════════════════════════

import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { generateArchiveCertNumber } from "./lib/certificateNumber";

// ─── Mutation principale : Archiver un document ──────────────

export const archiveDocument = mutation({
    args: {
        documentId: v.id("documents"),
        userId: v.string(),
        categorySlug: v.string(),
        tags: v.optional(v.array(v.string())),
        confidentiality: v.optional(v.string()),
        countingStartDate: v.optional(v.number()),
        // Double hash (calculés côté client)
        frozenContent: v.any(),              // JSON TipTap gelé
        contentHash: v.string(),             // SHA-256 du JSON gelé
        pdfUrl: v.string(),                  // URL du PDF sur Supabase Storage
        pdfHash: v.string(),                 // SHA-256 du PDF généré
        pdfFileName: v.string(),             // Nom du fichier PDF
        pdfFileSize: v.number(),             // Taille du PDF en bytes
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // ── 1. Valider le document ──
        const doc = await ctx.db.get(args.documentId);
        if (!doc) throw new Error("Document introuvable");
        if (doc.status !== "approved") {
            throw new Error("Seul un document approuvé peut être archivé");
        }
        if (!doc.organizationId) {
            throw new Error("Le document doit appartenir à une organisation");
        }

        // ── 2. Charger la catégorie ──
        const category = await ctx.db
            .query("archive_categories")
            .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
            .filter((q) => q.eq(q.field("organizationId"), doc.organizationId))
            .first();

        if (!category) {
            throw new Error(`Catégorie "${args.categorySlug}" introuvable`);
        }

        // ── 3. Calculer les dates de lifecycle ──
        const T0 = args.countingStartDate ?? now;
        const msPerYear = 365.25 * 24 * 3600 * 1000;

        const activeUntil = T0 + (category.activeDurationYears ?? category.retentionYears) * msPerYear;
        const semiActiveUntil = category.hasSemiActivePhase
            ? T0 + ((category.activeDurationYears ?? 0) + (category.semiActiveDurationYears ?? 0)) * msPerYear
            : undefined;
        const retentionExpiresAt = T0 + category.retentionYears * msPerYear;

        // ── 4. Créer l'entrée dans archives ──
        const archiveId = await ctx.db.insert("archives", {
            title: doc.title,
            description: doc.excerpt ?? "",
            categoryId: category._id,
            categorySlug: args.categorySlug,
            organizationId: doc.organizationId,
            uploadedBy: args.userId,
            archivedBy: args.userId,
            // Fichier = PDF généré
            fileUrl: args.pdfUrl,
            fileName: args.pdfFileName,
            fileSize: args.pdfFileSize,
            mimeType: "application/pdf",
            sha256Hash: args.pdfHash,          // Hash principal = hash PDF
            // Double hash
            frozenContent: args.frozenContent,
            contentHash: args.contentHash,
            pdfUrl: args.pdfUrl,
            pdfHash: args.pdfHash,
            // Traçabilité
            sourceDocumentId: args.documentId,
            sourceType: "document_archive",
            tags: args.tags ?? [],
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

        // ── 5. Générer le certificat d'archivage ──
        const certificateNumber = await generateArchiveCertNumber(ctx.db);

        const certId = await ctx.db.insert("archive_certificates", {
            archiveId,
            certificateNumber,
            sha256Hash: args.pdfHash,          // Le certificat référence le hash PDF
            issuedAt: now,
            issuedBy: args.userId,
            validUntil: retentionExpiresAt,
            status: "valid",
        });

        // Lier le certificat à l'archive
        await ctx.db.patch(archiveId, { certificateId: certId });

        // ── 6. Mettre à jour le document dans iDocument ──
        await ctx.db.patch(args.documentId, {
            status: "archived",
            archiveId: archiveId,
            archivedAt: now,
            archiveCategorySlug: args.categorySlug,
            workflowReason: `Archivé dans iArchive — Catégorie: ${category.name}`,
            updatedAt: now,
        });

        // ── 7. Audit logs ──
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "document.archive",
            resourceType: "document",
            resourceId: args.documentId,
            details: {
                archiveId,
                categorySlug: args.categorySlug,
                certificateNumber,
                contentHash: args.contentHash,
                pdfHash: args.pdfHash,
            },
            createdAt: now,
        });

        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "archive.created",
            resourceType: "archive",
            resourceId: archiveId,
            details: {
                sourceDocumentId: args.documentId,
                sourceType: "document_archive",
                certificateNumber,
            },
            createdAt: now,
        });

        // ── 8. Retour ──
        return {
            archiveId,
            certificateNumber,
            contentHash: args.contentHash,
            pdfHash: args.pdfHash,
            retentionExpiresAt,
            activeUntil,
            semiActiveUntil,
        };
    },
});

// ─── Archivage en masse d'un dossier ────────────────

export const archiveFolder = mutation({
    args: {
        folderId: v.id("folders"),
        categorySlug: v.string(),
        tags: v.optional(v.array(v.string())),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Charger le dossier
        const folder = await ctx.db.get(args.folderId);
        if (!folder) throw new Error("Dossier introuvable");

        // 2. Lister les documents approved du dossier
        // Note: parentFolderId est un string, pas un Id — on filtre manuellement
        const allDocs = await ctx.db
            .query("documents")
            .withIndex("by_organizationId", (q) =>
                folder.organizationId
                    ? q.eq("organizationId", folder.organizationId)
                    : q
            )
            .collect();

        const docs = allDocs.filter(
            (d) =>
                d.parentFolderId === args.folderId.toString() &&
                d.status === "approved"
        );

        if (docs.length === 0) {
            throw new Error("Aucun document approuvé dans ce dossier");
        }

        // 3. Note: Archivage individuel doit être initié côté client
        // car chaque document nécessite un PDF (généré client-side).
        // Cette mutation sert d'orchestrateur pour valider et logger l'intention.

        // 4. Audit log bulk
        await ctx.db.insert("audit_logs", {
            organizationId: folder.organizationId,
            userId: args.userId,
            action: "folder.archive_initiated",
            resourceType: "document",
            resourceId: args.folderId,
            details: {
                documentCount: docs.length,
                categorySlug: args.categorySlug,
                documentIds: docs.map((d) => d._id),
            },
            createdAt: Date.now(),
        });

        return { documentCount: docs.length, documentIds: docs.map((d) => d._id) };
    },
});

