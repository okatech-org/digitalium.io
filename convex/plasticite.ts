// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Plasticité
// 🔧 Adaptation & Configuration dynamique
// Config système, poids adaptatifs
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { SIGNAL_TYPES } from "./lib/types";

// ─── Config Système ─────────────────────────────

/**
 * Lire une configuration système par clé.
 */
export const lireConfig = query({
    args: { cle: v.string() },
    handler: async (ctx, args) => {
        const config = await ctx.db
            .query("configSysteme")
            .withIndex("by_cle", (q) => q.eq("cle", args.cle))
            .first();
        return config;
    },
});

/**
 * Lire toutes les configurations système.
 */
export const listerConfigs = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("configSysteme").collect();
    },
});

/**
 * Écrire/mettre à jour une configuration système.
 * Émet un signal CONFIG_MODIFIEE si la valeur change.
 */
export const ecrireConfig = mutation({
    args: {
        cle: v.string(),
        valeur: v.any(),
        description: v.optional(v.string()),
        userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const existing = await ctx.db
            .query("configSysteme")
            .withIndex("by_cle", (q) => q.eq("cle", args.cle))
            .first();

        if (existing) {
            const ancienneValeur = existing.valeur;
            await ctx.db.patch(existing._id, {
                valeur: args.valeur,
                description: args.description ?? existing.description,
                updatedAt: now,
            });

            // Emit signal on value change
            await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
                type: SIGNAL_TYPES.CONFIG_MODIFIEE,
                payload: {
                    cle: args.cle,
                    avant: ancienneValeur,
                    apres: args.valeur,
                },
                emetteurId: args.userId ?? "system",
                entiteId: String(existing._id),
                entiteType: "configSysteme",
            });

            return existing._id;
        } else {
            const id = await ctx.db.insert("configSysteme", {
                cle: args.cle,
                valeur: args.valeur,
                description: args.description,
                updatedAt: now,
            });

            await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
                type: SIGNAL_TYPES.CONFIG_MODIFIEE,
                payload: { cle: args.cle, apres: args.valeur },
                emetteurId: args.userId ?? "system",
                entiteId: String(id),
                entiteType: "configSysteme",
            });

            return id;
        }
    },
});

// ─── Poids Adaptatifs ───────────────────────────

/**
 * Lire les poids adaptatifs pour un signal.
 */
export const lirePoidsAdaptatifs = query({
    args: {
        signal: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.signal) {
            return await ctx.db
                .query("poidsAdaptatifs")
                .withIndex("by_signal", (q) => q.eq("signal", args.signal!))
                .collect();
        }
        return await ctx.db.query("poidsAdaptatifs").collect();
    },
});

/**
 * Ajuster le poids adaptatif d'une règle.
 * Le poids augmente/diminue en fonction du succès d'exécution.
 */
export const ajusterPoids = internalMutation({
    args: {
        signal: v.string(),
        regle: v.string(),
        delta: v.number(), // +/- adjustment
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const existing = await ctx.db
            .query("poidsAdaptatifs")
            .withIndex("by_signal", (q) => q.eq("signal", args.signal))
            .filter((q) => q.eq(q.field("regle"), args.regle))
            .first();

        if (existing) {
            const nouveauPoids = Math.max(0, Math.min(10, existing.poids + args.delta));
            await ctx.db.patch(existing._id, {
                poids: nouveauPoids,
                executions: existing.executions + 1,
                derniereExecution: now,
                updatedAt: now,
            });
            return existing._id;
        } else {
            const poidsInitial = Math.max(0, Math.min(10, 5 + args.delta));
            return await ctx.db.insert("poidsAdaptatifs", {
                signal: args.signal,
                regle: args.regle,
                poids: poidsInitial,
                executions: 1,
                derniereExecution: now,
                updatedAt: now,
            });
        }
    },
});

/**
 * Réinitialiser tous les poids adaptatifs (admin only).
 */
export const reinitialiserPoids = mutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("poidsAdaptatifs").collect();
        const now = Date.now();
        for (const p of all) {
            await ctx.db.patch(p._id, {
                poids: 5,
                executions: 0,
                derniereExecution: undefined,
                updatedAt: now,
            });
        }
        return { reset: all.length };
    },
});
