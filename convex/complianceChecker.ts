"use node";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation I: Compliance Checker Automatique
// Audit IA + détection d'anomalies + scoring de conformité
// ═══════════════════════════════════════════════════════════════

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ═══════════════════════════════════════════════════════════════
// Audit de conformité déclenché manuellement ou par cron
// ═══════════════════════════════════════════════════════════════

export const runComplianceAudit = action({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        // 1. Récupérer les données de l'organisation
        const org = await ctx.runQuery(internal.complianceCheckerQueries.getOrgData, {
            organizationId: args.organizationId,
        });

        if (!org) return { error: "Organisation introuvable" };

        const { documents, archives, folders, categories } = org;

        // 2. Analyse locale (sans IA — rapide)
        const issues: Array<{
            severity: "critical" | "warning" | "info";
            category: string;
            message: string;
            documentId?: string;
            folderId?: string;
            suggestion?: string;
        }> = [];

        const now = Date.now();
        const NINETY_DAYS = 90 * 24 * 3600 * 1000;

        // ── Documents sans catégorie de rétention ──
        const docsWithoutRetention = documents.filter((d: any) => !d.archiveCategorySlug && d.status !== "draft" && d.status !== "trashed");
        if (docsWithoutRetention.length > 0) {
            issues.push({
                severity: "warning",
                category: "retention",
                message: `${docsWithoutRetention.length} document(s) sans catégorie de rétention assignée`,
                suggestion: "Utilisez la réorganisation IA pour assigner automatiquement les catégories de rétention",
            });
        }

        // ── Documents sans dossier ──
        const docsWithoutFolder = documents.filter((d: any) => !d.folderId && d.status !== "trashed");
        if (docsWithoutFolder.length > 0) {
            issues.push({
                severity: "critical",
                category: "classification",
                message: `${docsWithoutFolder.length} document(s) non classé(s) dans un dossier`,
                suggestion: "Lancez l'import IA pour classer automatiquement ces documents",
            });
        }

        // ── Documents avec faible confiance IA ──
        const lowConfidenceDocs = documents.filter((d: any) => d.aiConfidence !== undefined && d.aiConfidence < 0.6);
        if (lowConfidenceDocs.length > 0) {
            issues.push({
                severity: "warning",
                category: "classification",
                message: `${lowConfidenceDocs.length} document(s) classé(s) avec faible confiance IA (<60%)`,
                suggestion: "Vérifiez manuellement le classement de ces documents",
            });
        }

        // ── Archives expirant dans 90 jours ──
        const expiringArchives = archives.filter((a: any) =>
            a.retentionExpiresAt && a.retentionExpiresAt - now < NINETY_DAYS && a.retentionExpiresAt > now
            && a.lifecycleState !== "destroyed"
        );
        if (expiringArchives.length > 0) {
            issues.push({
                severity: "info",
                category: "retention",
                message: `${expiringArchives.length} archive(s) expirant dans les 90 prochains jours`,
                suggestion: "Préparez le processus de destruction ou d'extension de rétention",
            });
        }

        // ── Archives sans certificat ──
        const archivesWithoutCert = archives.filter((a: any) => !a.certificateId && a.lifecycleState !== "destroyed");
        if (archivesWithoutCert.length > 0) {
            issues.push({
                severity: "warning",
                category: "integrity",
                message: `${archivesWithoutCert.length} archive(s) sans certificat d'intégrité`,
                suggestion: "Générez des certificats pour garantir la traçabilité OHADA",
            });
        }

        // ── Documents confidentiels dans dossiers sans protection ──
        const confidentialDocs = documents.filter((d: any) =>
            (d.confidentiality === "confidential" || d.confidentiality === "secret") && d.folderId
        );
        let confidentialInPublic = 0;
        for (const doc of confidentialDocs) {
            const folder = folders.find((f: any) => String(f._id) === String(doc.folderId));
            if (folder && folder.permissions?.visibility === "team") {
                confidentialInPublic++;
                if (confidentialInPublic <= 3) {
                    issues.push({
                        severity: "critical",
                        category: "confidentiality",
                        message: `Document confidentiel "${doc.title}" dans un dossier accessible à toute l'équipe`,
                        documentId: String(doc._id),
                        folderId: String(doc.folderId),
                        suggestion: "Déplacez ce document dans un dossier restreint ou changez la visibilité du dossier",
                    });
                }
            }
        }
        if (confidentialInPublic > 3) {
            issues.push({
                severity: "critical",
                category: "confidentiality",
                message: `${confidentialInPublic - 3} autre(s) document(s) confidentiel(s) dans des dossiers publics`,
                suggestion: "Lancez un audit de confidentialité complet",
            });
        }

        // 3. Calculer le score de conformité
        const totalChecks = 6;
        let passedChecks = totalChecks;
        if (docsWithoutRetention.length > 0) passedChecks--;
        if (docsWithoutFolder.length > 0) passedChecks--;
        if (lowConfidenceDocs.length > 0) passedChecks -= 0.5;
        if (archivesWithoutCert.length > 0) passedChecks -= 0.5;
        if (confidentialInPublic > 0) passedChecks--;
        if (expiringArchives.length > 5) passedChecks -= 0.5;

        const score = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

        // 4. Générer des recommandations
        const recommendations: string[] = [];
        if (score < 50) recommendations.push("Conformité critique — Action immédiate requise sur la classification et la rétention");
        if (docsWithoutFolder.length > 0) recommendations.push("Classez tous les documents orphelins via la réorganisation IA");
        if (docsWithoutRetention.length > 0) recommendations.push("Assignez des catégories de rétention OHADA à tous les documents actifs");
        if (archivesWithoutCert.length > 0) recommendations.push("Générez des certificats d'intégrité pour toutes les archives");
        if (confidentialInPublic > 0) recommendations.push("Revoyez la politique de confidentialité des dossiers");
        if (score >= 80) recommendations.push("Bon niveau de conformité — Maintenez les bonnes pratiques");

        // 5. Sauvegarder le rapport
        const report = {
            organizationId: args.organizationId,
            type: "audit" as const,
            score,
            issues,
            recommendations,
            stats: {
                totalDocuments: documents.length,
                documentsWithCategory: documents.filter((d: any) => d.archiveCategorySlug).length,
                documentsWithCertificate: archives.filter((a: any) => a.certificateId).length,
                confidentialInPublic,
                expiringNext90Days: expiringArchives.length,
            },
            createdAt: now,
        };

        await ctx.runMutation(internal.complianceCheckerMutations.saveReport, report);

        return report;
    },
});

// ═══════════════════════════════════════════════════════════════
// Innovation K — Prédiction lifecycle
// ═══════════════════════════════════════════════════════════════

export const generateForecast = action({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const org = await ctx.runQuery(internal.complianceCheckerQueries.getOrgData, {
            organizationId: args.organizationId,
        });

        if (!org) return { error: "Organisation introuvable" };

        const { archives } = org;
        const now = Date.now();
        const currentYear = new Date(now).getFullYear();

        // Calculer les expirations par trimestre
        const quarters = { q1: 0, q2: 0, q3: 0, q4: 0 };
        let storageToFree = 0;

        for (const archive of archives) {
            if (!archive.retentionExpiresAt || archive.lifecycleState === "destroyed") continue;
            const expiryDate = new Date(archive.retentionExpiresAt);
            if (expiryDate.getFullYear() !== currentYear) continue;

            const month = expiryDate.getMonth();
            if (month < 3) quarters.q1++;
            else if (month < 6) quarters.q2++;
            else if (month < 9) quarters.q3++;
            else quarters.q4++;

            storageToFree += ((archive as Record<string, unknown>).fileSize as number) ?? 0;
        }

        // Score de santé du patrimoine
        const totalArchives = archives.filter((a: Record<string, unknown>) => a.lifecycleState !== "destroyed").length;
        const withCert = archives.filter((a: Record<string, unknown>) => a.certificateId).length;
        const withCategory = archives.filter((a: Record<string, unknown>) => a.categorySlug).length;
        const healthScore = totalArchives > 0
            ? Math.round(((withCert + withCategory) / (totalArchives * 2)) * 100)
            : 100;

        const report = {
            organizationId: args.organizationId,
            type: "forecast" as const,
            score: healthScore,
            issues: [] as string[],
            recommendations: [
                `${quarters.q1 + quarters.q2 + quarters.q3 + quarters.q4} archives expireront cette année`,
                `~${Math.round(storageToFree / (1024 * 1024))} MB de stockage seront libérés`,
            ],
            stats: {
                totalDocuments: 0,
                documentsWithCategory: 0,
                documentsWithCertificate: withCert,
                confidentialInPublic: 0,
                expiringNext90Days: 0,
                expiringByQuarter: quarters,
                storageToFreeBytes: storageToFree,
                healthScore,
            },
            createdAt: Date.now(),
        };

        await ctx.runMutation(internal.complianceCheckerMutations.saveReport, report);

        return report;
    },
});
