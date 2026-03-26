// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Moteur
// 🏃 Actions sortantes — APIs tierces
// Retry logic, queue d'exécution, adaptateur sync
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { SIGNAL_TYPES, CATEGORIES_ACTION } from "./lib/types";

// ─── Retry Logic for External APIs ──────────────

/**
 * Exécuter une action externe avec retry automatique.
 * Gère les appels HTTP vers des APIs tierces avec backoff exponentiel.
 *
 * Usage: from a mutation → ctx.scheduler.runAfter(0, api.moteur.executerActionExterne, {...})
 */
export const executerActionExterne = action({
    args: {
        url: v.string(),
        method: v.union(
            v.literal("GET"),
            v.literal("POST"),
            v.literal("PUT"),
            v.literal("PATCH"),
            v.literal("DELETE")
        ),
        headers: v.optional(v.any()),
        body: v.optional(v.any()),
        maxRetries: v.optional(v.number()),
        userId: v.optional(v.string()),
        organisationId: v.optional(v.string()),
        contexte: v.optional(v.string()), // description for logging
    },
    handler: async (ctx, args) => {
        const maxRetries = args.maxRetries ?? 3;
        let lastError: string | null = null;
        let attempt = 0;

        while (attempt < maxRetries) {
            attempt++;

            try {
                const fetchOptions: RequestInit = {
                    method: args.method,
                    headers: {
                        "Content-Type": "application/json",
                        ...(args.headers ?? {}),
                    },
                };

                if (args.body && args.method !== "GET") {
                    fetchOptions.body = JSON.stringify(args.body);
                }

                const response = await fetch(args.url, fetchOptions);

                if (response.ok) {
                    const data = await response.json().catch(() => ({}));

                    // Log success
                    await ctx.runMutation(internal.moteur.loguerResultat, {
                        contexte: args.contexte ?? args.url,
                        succes: true,
                        tentative: attempt,
                        userId: args.userId,
                        organisationId: args.organisationId,
                        details: {
                            url: args.url,
                            method: args.method,
                            statusCode: response.status,
                        },
                    });

                    return {
                        success: true,
                        data,
                        attempt,
                        statusCode: response.status,
                    };
                }

                lastError = `HTTP ${response.status}: ${response.statusText}`;
            } catch (error) {
                lastError = String(error);
            }

            // Exponential backoff: 1s, 2s, 4s
            if (attempt < maxRetries) {
                const delayMs = Math.pow(2, attempt - 1) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }

        // All retries exhausted — log failure
        await ctx.runMutation(internal.moteur.loguerResultat, {
            contexte: args.contexte ?? args.url,
            succes: false,
            tentative: attempt,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                url: args.url,
                method: args.method,
                erreur: lastError,
            },
        });

        return {
            success: false,
            error: lastError,
            attempts: attempt,
        };
    },
});

// ─── Log Result ─────────────────────────────────

/**
 * Loguer le résultat d'une action moteur (succès ou échec).
 */
export const loguerResultat = internalMutation({
    args: {
        contexte: v.string(),
        succes: v.boolean(),
        tentative: v.number(),
        userId: v.optional(v.string()),
        organisationId: v.optional(v.string()),
        details: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Log via hippocampe
        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: args.succes ? "moteur.action_reussie" : "moteur.action_echouee",
            categorie: CATEGORIES_ACTION.SYSTEME,
            entiteType: "moteur",
            entiteId: `moteur-${Date.now()}`,
            userId: args.userId ?? "system",
            organisationId: args.organisationId,
            details: {
                description: `${args.contexte} — ${args.succes ? "OK" : "ÉCHEC"} (tentative ${args.tentative})`,
                metadata: args.details,
            },
        });

        // Emit error signal if failed
        if (!args.succes) {
            await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
                type: SIGNAL_TYPES.ERREUR_SYSTEME,
                payload: {
                    source: "moteur",
                    contexte: args.contexte,
                    tentative: args.tentative,
                    details: args.details,
                },
                emetteurId: args.userId ?? "system",
                organisationId: args.organisationId,
            });
        }
    },
});

// ─── Sync Adapter (prep for M4) ─────────────────

/**
 * Placeholder pour la synchronisation vers PostgreSQL (Google Cloud SQL).
 * Sera completé en M4 (Sprint 7).
 */
export const syncVersPostgres = internalMutation({
    args: {
        table: v.string(),
        operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
        data: v.any(),
        organisationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // M4: Implémenter la connexion Google Cloud SQL PostgreSQL ici
        // Pour l'instant: loguer l'intention de sync

        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: "moteur.sync_postgres_preparation",
            categorie: CATEGORIES_ACTION.SYSTEME,
            entiteType: args.table,
            entiteId: `sync-${Date.now()}`,
            userId: "system",
            organisationId: args.organisationId,
            details: {
                description: `[M4 STUB] Sync ${args.operation} → ${args.table}`,
                metadata: { operation: args.operation, dataKeys: Object.keys(args.data ?? {}) },
            },
        });

        return { status: "pending_m4", table: args.table, operation: args.operation };
    },
});

// ─── Query: Execution History ───────────────────

/**
 * Historique des exécutions du cortex moteur.
 */
export const historiqueExecutions = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const maxItems = args.limit ?? 30;

        return await ctx.db
            .query("historiqueActions")
            .withIndex("by_action")
            .filter((q) =>
                q.or(
                    q.eq(q.field("action"), "moteur.action_reussie"),
                    q.eq(q.field("action"), "moteur.action_echouee")
                )
            )
            .order("desc")
            .take(maxItems);
    },
});
