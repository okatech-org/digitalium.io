// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Hippocampe
// 📚 Mémoire & Audit trail
// Logging, métriques, recherche historique
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { CATEGORIES_ACTION } from "./lib/types";
import type { CategorieAction } from "./lib/types";

// ─── Log Action ─────────────────────────────────

/**
 * Loguer une action dans l'historique.
 * Appelé directement par les mutations : ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {...})
 */
export const loguerAction = internalMutation({
    args: {
        action: v.string(),
        categorie: v.union(
            v.literal("metier"),
            v.literal("systeme"),
            v.literal("utilisateur"),
            v.literal("securite")
        ),
        entiteType: v.string(),
        entiteId: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        details: v.optional(v.object({
            avant: v.optional(v.any()),
            apres: v.optional(v.any()),
            description: v.optional(v.string()),
            metadata: v.optional(v.any()),
        })),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("historiqueActions", {
            action: args.action,
            categorie: args.categorie,
            entiteType: args.entiteType,
            entiteId: args.entiteId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: args.details ?? { description: args.action },
            createdAt: Date.now(),
        });
    },
});

/**
 * Loguer depuis un signal limbique (appelé par le routeur).
 */
export const loguerDepuisSignal = internalMutation({
    args: {
        signalId: v.id("signaux"),
    },
    handler: async (ctx, args) => {
        const signal = await ctx.db.get(args.signalId);
        if (!signal) return;

        // Determine category from signal type
        let categorie: CategorieAction = CATEGORIES_ACTION.METIER;
        if (signal.type.startsWith("SYNC_") || signal.type.startsWith("CRON_") || signal.type === "HEALTH_CHECK" || signal.type === "ERREUR_SYSTEME") {
            categorie = CATEGORIES_ACTION.SYSTEME;
        } else if (signal.type.startsWith("UTILISATEUR_") || signal.type.startsWith("NOTIFICATION_")) {
            categorie = CATEGORIES_ACTION.UTILISATEUR;
        } else if (signal.type.includes("SECURITE") || signal.type.includes("GEL_JURIDIQUE")) {
            categorie = CATEGORIES_ACTION.SECURITE;
        }

        await ctx.db.insert("historiqueActions", {
            action: signal.type,
            categorie,
            entiteType: signal.entiteType ?? "signaux",
            entiteId: signal.entiteId ?? String(signal._id),
            userId: signal.emetteurId ?? "system",
            organisationId: signal.organisationId,
            details: {
                description: `Signal ${signal.type} traité`,
                metadata: {
                    correlationId: signal.correlationId,
                    source: signal.source,
                    destination: signal.destination,
                    priorite: signal.priorite,
                    confiance: signal.confiance,
                },
            },
            createdAt: Date.now(),
        });
    },
});

// ─── Métriques Aggregation ──────────────────────

/**
 * Calculer et enregistrer des métriques agrégées.
 * Appelé par le cron horaire.
 */
export const calculerMetriques = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const uneHeure = 60 * 60 * 1000;
        const depuisUneHeure = now - uneHeure;

        // Count signals in last hour
        const signaux = await ctx.db.query("signaux").collect();
        const signauxRecents = signaux.filter((s) => s.createdAt >= depuisUneHeure);

        await ctx.db.insert("metriques", {
            nom: "signaux_emis",
            valeur: signauxRecents.length,
            unite: "count",
            periode: "1h",
            dimensions: {
                timestamp: now,
            },
            createdAt: now,
        });

        // Count actions in last hour
        const actions = await ctx.db.query("historiqueActions").collect();
        const actionsRecentes = actions.filter((a) => a.createdAt >= depuisUneHeure);

        await ctx.db.insert("metriques", {
            nom: "actions_loguees",
            valeur: actionsRecentes.length,
            unite: "count",
            periode: "1h",
            dimensions: {
                timestamp: now,
            },
            createdAt: now,
        });

        // Count by category
        const parCategorie: Record<string, number> = {};
        for (const a of actionsRecentes) {
            parCategorie[a.categorie] = (parCategorie[a.categorie] || 0) + 1;
        }

        for (const [categorie, count] of Object.entries(parCategorie)) {
            await ctx.db.insert("metriques", {
                nom: `actions_${categorie}`,
                valeur: count,
                unite: "count",
                periode: "1h",
                dimensions: { timestamp: now, categorie },
                createdAt: now,
            });
        }

        return {
            signaux: signauxRecents.length,
            actions: actionsRecentes.length,
            parCategorie,
        };
    },
});

// ─── Queries ────────────────────────────────────

/**
 * Lister l'historique des actions, filtré par entité/user/période.
 */
export const listerHistorique = query({
    args: {
        entiteType: v.optional(v.string()),
        entiteId: v.optional(v.string()),
        userId: v.optional(v.string()),
        organisationId: v.optional(v.string()),
        categorie: v.optional(v.union(
            v.literal("metier"),
            v.literal("systeme"),
            v.literal("utilisateur"),
            v.literal("securite")
        )),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 50;

        // Use best available index
        let results;
        if (args.entiteId) {
            results = await ctx.db
                .query("historiqueActions")
                .withIndex("by_entiteId", (q) => q.eq("entiteId", args.entiteId!))
                .order("desc")
                .take(maxItems);
        } else if (args.userId) {
            results = await ctx.db
                .query("historiqueActions")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
                .order("desc")
                .take(maxItems);
        } else if (args.organisationId) {
            results = await ctx.db
                .query("historiqueActions")
                .withIndex("by_organisationId", (q) => q.eq("organisationId", args.organisationId!))
                .order("desc")
                .take(maxItems);
        } else if (args.categorie) {
            results = await ctx.db
                .query("historiqueActions")
                .withIndex("by_categorie", (q) => q.eq("categorie", args.categorie!))
                .order("desc")
                .take(maxItems);
        } else {
            results = await ctx.db
                .query("historiqueActions")
                .order("desc")
                .take(maxItems);
        }

        // Apply additional filters
        if (args.entiteType) {
            results = results.filter((r) => r.entiteType === args.entiteType);
        }

        return results;
    },
});

/**
 * Rechercher des actions par texte libre (action name ou description).
 */
export const rechercherActions = query({
    args: {
        terme: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 30;
        const termeLower = args.terme.toLowerCase();

        const actions = await ctx.db
            .query("historiqueActions")
            .order("desc")
            .take(200); // Scan recent window

        return actions
            .filter((a) => {
                const actionMatch = a.action.toLowerCase().includes(termeLower);
                const descMatch = a.details?.description?.toLowerCase().includes(termeLower) ?? false;
                return actionMatch || descMatch;
            })
            .slice(0, maxItems);
    },
});

/**
 * Obtenir les métriques récentes pour le dashboard monitoring.
 */
export const obtenirMetriques = query({
    args: {
        nom: v.optional(v.string()),
        periode: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 24;

        if (args.nom) {
            return await ctx.db
                .query("metriques")
                .withIndex("by_nom", (q) => q.eq("nom", args.nom!))
                .order("desc")
                .take(maxItems);
        }

        if (args.periode) {
            return await ctx.db
                .query("metriques")
                .withIndex("by_periode", (q) => q.eq("periode", args.periode!))
                .order("desc")
                .take(maxItems);
        }

        return await ctx.db
            .query("metriques")
            .order("desc")
            .take(maxItems);
    },
});
