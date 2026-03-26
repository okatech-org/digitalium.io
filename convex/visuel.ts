// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Visuel
// 👁️ Perception — Documents & Folders
// Adapters pour intégrer les signaux NEOCORTEX
// dans les opérations documents/dossiers
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { SIGNAL_TYPES, CATEGORIES_ACTION } from "./lib/types";

// ─── Document Signal Adapters ───────────────────

/**
 * Adapter pour émettre des signaux après une opération document.
 * Appelé via ctx.scheduler.runAfter(0, internal.visuel.signalDocument, {...})
 */
export const signalDocument = internalMutation({
    args: {
        action: v.union(
            v.literal("cree"),
            v.literal("modifie"),
            v.literal("supprime"),
            v.literal("statut_change")
        ),
        documentId: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        titre: v.optional(v.string()),
        avant: v.optional(v.any()),
        apres: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Map action to signal type
        const signalMap: Record<string, string> = {
            cree: SIGNAL_TYPES.DOCUMENT_CREE,
            modifie: SIGNAL_TYPES.DOCUMENT_MODIFIE,
            supprime: SIGNAL_TYPES.DOCUMENT_SUPPRIME,
            statut_change: SIGNAL_TYPES.DOCUMENT_STATUT_CHANGE,
        };

        const signalType = signalMap[args.action];

        // Emit signal
        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: signalType,
            payload: {
                titre: args.titre,
                action: args.action,
            },
            emetteurId: args.userId,
            entiteId: args.documentId,
            entiteType: "documents",
            organisationId: args.organisationId,
        });

        // Log action
        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `documents.${args.action}`,
            categorie: CATEGORIES_ACTION.METIER,
            entiteType: "documents",
            entiteId: args.documentId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                avant: args.avant,
                apres: args.apres,
                description: `Document ${args.action}: ${args.titre ?? args.documentId}`,
            },
        });
    },
});

// ─── Folder Signal Adapters ─────────────────────

/**
 * Adapter pour émettre des signaux après une opération dossier.
 */
export const signalDossier = internalMutation({
    args: {
        action: v.union(
            v.literal("cree"),
            v.literal("modifie"),
            v.literal("supprime")
        ),
        dossierId: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        nom: v.optional(v.string()),
        avant: v.optional(v.any()),
        apres: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const signalMap: Record<string, string> = {
            cree: SIGNAL_TYPES.DOSSIER_CREE,
            modifie: SIGNAL_TYPES.DOSSIER_MODIFIE,
            supprime: SIGNAL_TYPES.DOSSIER_SUPPRIME,
        };

        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: signalMap[args.action],
            payload: {
                nom: args.nom,
                action: args.action,
            },
            emetteurId: args.userId,
            entiteId: args.dossierId,
            entiteType: "folders",
            organisationId: args.organisationId,
        });

        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `folders.${args.action}`,
            categorie: CATEGORIES_ACTION.METIER,
            entiteType: "folders",
            entiteId: args.dossierId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                avant: args.avant,
                apres: args.apres,
                description: `Dossier ${args.action}: ${args.nom ?? args.dossierId}`,
            },
        });
    },
});

// ─── Archive Signal Adapters ────────────────────

/**
 * Adapter pour émettre des signaux après une opération archive.
 */
export const signalArchive = internalMutation({
    args: {
        action: v.union(
            v.literal("creee"),
            v.literal("modifiee"),
            v.literal("statut_change"),
            v.literal("detruite"),
            v.literal("gel_juridique")
        ),
        archiveId: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        titre: v.optional(v.string()),
        avant: v.optional(v.any()),
        apres: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const signalMap: Record<string, string> = {
            creee: SIGNAL_TYPES.ARCHIVE_CREEE,
            modifiee: SIGNAL_TYPES.ARCHIVE_MODIFIEE,
            statut_change: SIGNAL_TYPES.ARCHIVE_STATUT_CHANGE,
            detruite: SIGNAL_TYPES.ARCHIVE_DETRUITE,
            gel_juridique: SIGNAL_TYPES.ARCHIVE_GEL_JURIDIQUE,
        };

        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: signalMap[args.action],
            payload: {
                titre: args.titre,
                action: args.action,
            },
            emetteurId: args.userId,
            entiteId: args.archiveId,
            entiteType: "archives",
            organisationId: args.organisationId,
        });

        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `archives.${args.action}`,
            categorie: args.action === "gel_juridique"
                ? CATEGORIES_ACTION.SECURITE
                : CATEGORIES_ACTION.METIER,
            entiteType: "archives",
            entiteId: args.archiveId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                avant: args.avant,
                apres: args.apres,
                description: `Archive ${args.action}: ${args.titre ?? args.archiveId}`,
            },
        });
    },
});

// ─── Signature Signal Adapters ──────────────────

/**
 * Adapter pour émettre des signaux après une opération signature.
 */
export const signalSignature = internalMutation({
    args: {
        action: v.union(
            v.literal("demandee"),
            v.literal("signee"),
            v.literal("completee"),
            v.literal("annulee")
        ),
        signatureId: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        titre: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const signalMap: Record<string, string> = {
            demandee: SIGNAL_TYPES.SIGNATURE_DEMANDEE,
            signee: SIGNAL_TYPES.SIGNATURE_SIGNEE,
            completee: SIGNAL_TYPES.SIGNATURE_COMPLETEE,
            annulee: SIGNAL_TYPES.SIGNATURE_ANNULEE,
        };

        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: signalMap[args.action],
            payload: {
                titre: args.titre,
                action: args.action,
            },
            emetteurId: args.userId,
            entiteId: args.signatureId,
            entiteType: "signatures",
            organisationId: args.organisationId,
        });

        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `signatures.${args.action}`,
            categorie: CATEGORIES_ACTION.METIER,
            entiteType: "signatures",
            entiteId: args.signatureId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                description: `Signature ${args.action}: ${args.titre ?? args.signatureId}`,
            },
        });
    },
});

// ─── Query: Recent Visual Events ────────────────

/**
 * Récupérer les événements visuels récents pour le monitoring.
 */
export const evenementsRecents = query({
    args: {
        organisationId: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 20;
        const docTypes = ["DOCUMENT_CREE", "DOCUMENT_MODIFIE", "DOSSIER_CREE", "ARCHIVE_CREEE", "SIGNATURE_DEMANDEE"];

        let results;
        if (args.organisationId) {
            results = await ctx.db
                .query("signaux")
                .withIndex("by_organisationId", (q) =>
                    q.eq("organisationId", args.organisationId!)
                )
                .order("desc")
                .take(200);
        } else {
            results = await ctx.db
                .query("signaux")
                .order("desc")
                .take(200);
        }

        return results
            .filter((s) => docTypes.includes(s.type))
            .slice(0, maxItems);
    },
});

// ─── Generic Entity Signal Adapter ──────────────

/**
 * Adapter générique pour émettre un signal NEOCORTEX pour n'importe quelle entité.
 * Utilisé par toutes les mutations qui n'ont pas d'adapter spécialisé.
 *
 * Usage: ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
 *     signalType: "ORGANISATION_CREEE",
 *     action: "organizations.create",
 *     entiteType: "organizations",
 *     entiteId: String(id),
 *     userId: args.ownerId,
 *     ...
 * })
 */
export const signalEntite = internalMutation({
    args: {
        signalType: v.string(),
        action: v.string(),
        entiteType: v.string(),
        entiteId: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        nom: v.optional(v.string()),
        categorie: v.optional(v.union(
            v.literal("metier"),
            v.literal("systeme"),
            v.literal("utilisateur"),
            v.literal("securite")
        )),
        avant: v.optional(v.any()),
        apres: v.optional(v.any()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Emit signal
        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: args.signalType,
            payload: {
                nom: args.nom,
                action: args.action,
            },
            emetteurId: args.userId,
            entiteId: args.entiteId,
            entiteType: args.entiteType,
            organisationId: args.organisationId,
        });

        // Log action
        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: args.action,
            categorie: args.categorie ?? CATEGORIES_ACTION.METIER,
            entiteType: args.entiteType,
            entiteId: args.entiteId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                avant: args.avant,
                apres: args.apres,
                description: args.description ?? `${args.entiteType}.${args.action}: ${args.nom ?? args.entiteId}`,
            },
        });
    },
});
