// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Limbique
// 💓 CŒUR — Bus de signaux pondérés
// Émet, route et nettoie les signaux du système nerveux
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { CORTEX, PRIORITE } from "./lib/types";
import type { PrioriteSignal } from "./lib/types";
import {
    genererCorrelationId,
    routerVersDestinations,
    calculerTTL,
    determinerPriorite,
} from "./lib/helpers";

// ─── Emit Signal ────────────────────────────────

/**
 * Émettre un signal dans le bus limbique.
 * C'est le point d'entrée principal pour toutes les mutations
 * qui veulent notifier le NEOCORTEX d'un événement.
 *
 * Usage: ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, { ... })
 */
export const emettreSignal = internalMutation({
    args: {
        type: v.string(),
        payload: v.any(),
        emetteurId: v.optional(v.string()),
        entiteId: v.optional(v.string()),
        entiteType: v.optional(v.string()),
        organisationId: v.optional(v.string()),
        priorite: v.optional(v.number()),
        confiance: v.optional(v.number()),
        correlationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const correlationId = args.correlationId ?? genererCorrelationId();
        const priorite = (args.priorite ?? determinerPriorite(args.type)) as PrioriteSignal;
        const confiance = args.confiance ?? 1.0;
        const ttl = calculerTTL(priorite);
        const destinations = routerVersDestinations(args.type);
        const now = Date.now();

        // Insert one signal per destination cortex
        const signalIds = [];
        for (const destination of destinations) {
            const id = await ctx.db.insert("signaux", {
                type: args.type,
                source: CORTEX.LIMBIQUE,
                destination,
                payload: args.payload ?? {},
                confiance,
                priorite,
                correlationId,
                ttl,
                traite: false,
                emetteurId: args.emetteurId,
                entiteId: args.entiteId,
                entiteType: args.entiteType,
                organisationId: args.organisationId,
                createdAt: now,
            });
            signalIds.push(id);
        }

        // Schedule routing for each destination
        for (const signalId of signalIds) {
            await ctx.scheduler.runAfter(0, internal.limbique.routerSignal, {
                signalId: signalId,
            });
        }

        return { correlationId, signalCount: signalIds.length };
    },
});

// ─── Route Signal ───────────────────────────────

/**
 * Route un signal vers son cortex de destination.
 * Marque le signal comme traité après le routage.
 */
export const routerSignal = internalMutation({
    args: {
        signalId: v.id("signaux"),
    },
    handler: async (ctx, args) => {
        const signal = await ctx.db.get(args.signalId);
        if (!signal || signal.traite) return;

        // Check TTL expiry
        if (Date.now() > signal.createdAt + signal.ttl) {
            await ctx.db.patch(args.signalId, { traite: true });
            return;
        }

        // Mark as processed
        await ctx.db.patch(args.signalId, { traite: true });

        // Route to hippocampe for logging (always)
        if (signal.destination === CORTEX.HIPPOCAMPE) {
            await ctx.scheduler.runAfter(0, internal.hippocampe.loguerDepuisSignal, {
                signalId: args.signalId,
            });
        }

        // Route to auditif for critical signals → auto-notification
        if (
            signal.destination === CORTEX.AUDITIF &&
            signal.priorite >= PRIORITE.CRITIQUE
        ) {
            // AUDITIF cortex will be implemented in Sprint 2
            // For now, just mark as routed
        }
    },
});

// ─── Clean Expired Signals ──────────────────────

/**
 * Nettoyer les signaux expirés (TTL dépassé) ou déjà traités.
 * Appelé par le cron quotidien.
 */
export const nettoyerSignaux = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        let deleted = 0;

        // Delete processed signals older than 24h
        const traites = await ctx.db
            .query("signaux")
            .withIndex("by_traite", (q) => q.eq("traite", true))
            .collect();

        for (const signal of traites) {
            if (now > signal.createdAt + signal.ttl) {
                await ctx.db.delete(signal._id);
                deleted++;
            }
        }

        return { deleted };
    },
});

// ─── Queries ────────────────────────────────────

/**
 * Lister les signaux non traités (pour monitoring).
 */
export const listerSignauxNonTraites = query({
    args: {
        limit: v.optional(v.number()),
        destination: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 50;

        if (args.destination) {
            return await ctx.db
                .query("signaux")
                .withIndex("by_destination", (q) =>
                    q.eq("destination", args.destination!)
                )
                .filter((q) => q.eq(q.field("traite"), false))
                .order("desc")
                .take(maxItems);
        }

        return await ctx.db
            .query("signaux")
            .withIndex("by_traite", (q) => q.eq("traite", false))
            .order("desc")
            .take(maxItems);
    },
});

/**
 * Compter les signaux par type (pour dashboard monitoring).
 */
export const compterSignaux = query({
    args: {},
    handler: async (ctx) => {
        const tous = await ctx.db.query("signaux").collect();
        const nonTraites = tous.filter((s) => !s.traite).length;
        const critiques = tous.filter((s) => s.priorite >= PRIORITE.CRITIQUE && !s.traite).length;

        return {
            total: tous.length,
            nonTraites,
            critiques,
            traites: tous.length - nonTraites,
        };
    },
});
