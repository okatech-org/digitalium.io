// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Monitoring
// 📈 Tableau de bord du système nerveux
// Compteurs, health check, santé globale
// ═══════════════════════════════════════════════

import { internalMutation, query } from "./_generated/server";
import { PRIORITE, CORTEX } from "./lib/types";

// ─── Health Check ───────────────────────────────

/**
 * Vérification de santé du NEOCORTEX.
 * Appelé par le cron toutes les 5 minutes.
 */
export const healthCheck = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const cinqMinutes = 5 * 60 * 1000;
        const depuis = now - cinqMinutes;

        // Count signals in last 5 min
        const signaux = await ctx.db.query("signaux").collect();
        const recents = signaux.filter((s) => s.createdAt >= depuis);
        const nonTraites = recents.filter((s) => !s.traite);
        const critiques = nonTraites.filter((s) => s.priorite >= PRIORITE.CRITIQUE);

        // Record health metric
        await ctx.db.insert("metriques", {
            nom: "neocortex_health",
            valeur: critiques.length > 0 ? 0 : nonTraites.length > 10 ? 1 : 2,
            unite: "score",
            periode: "5min",
            dimensions: {
                signaux_recents: recents.length,
                non_traites: nonTraites.length,
                critiques: critiques.length,
                timestamp: now,
            },
            createdAt: now,
        });

        return {
            status: critiques.length > 0 ? "critical" : nonTraites.length > 10 ? "degraded" : "healthy",
            signaux_recents: recents.length,
            non_traites: nonTraites.length,
            critiques: critiques.length,
        };
    },
});

/**
 * Purger les anciennes métriques (> 7 jours).
 * Appelé par le cron quotidien.
 */
export const purgerMetriques = internalMutation({
    args: {},
    handler: async (ctx) => {
        const seuil = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const anciennes = await ctx.db
            .query("metriques")
            .filter((q) => q.lt(q.field("createdAt"), seuil))
            .collect();

        for (const m of anciennes) {
            await ctx.db.delete(m._id);
        }

        return { purged: anciennes.length };
    },
});

// ─── Dashboard Queries ──────────────────────────

/**
 * Tableau de bord complet du NEOCORTEX.
 */
export const dashboard = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const uneHeure = 60 * 60 * 1000;
        const vingtQuatreHeures = 24 * uneHeure;

        // Signals
        const signaux = await ctx.db.query("signaux").collect();
        const signaux24h = signaux.filter((s) => s.createdAt >= now - vingtQuatreHeures);
        const nonTraites = signaux.filter((s) => !s.traite);
        const critiques = nonTraites.filter((s) => s.priorite >= PRIORITE.CRITIQUE);

        // Count by cortex destination
        const parCortex: Record<string, number> = {};
        for (const s of signaux24h) {
            parCortex[s.destination] = (parCortex[s.destination] || 0) + 1;
        }

        // Actions
        const actions = await ctx.db.query("historiqueActions").collect();
        const actions24h = actions.filter((a) => a.createdAt >= now - vingtQuatreHeures);

        // Count by category
        const parCategorie: Record<string, number> = {};
        for (const a of actions24h) {
            parCategorie[a.categorie] = (parCategorie[a.categorie] || 0) + 1;
        }

        // Recent health metrics
        const healthMetrics = await ctx.db
            .query("metriques")
            .withIndex("by_nom", (q) => q.eq("nom", "neocortex_health"))
            .order("desc")
            .take(12); // Last hour (5min intervals)

        const latestHealth = healthMetrics[0];

        // Config count
        const configs = await ctx.db.query("configSysteme").collect();

        // Poids adaptatifs
        const poids = await ctx.db.query("poidsAdaptatifs").collect();

        return {
            sante: {
                status: latestHealth
                    ? latestHealth.valeur === 2
                        ? "healthy"
                        : latestHealth.valeur === 1
                          ? "degraded"
                          : "critical"
                    : "unknown",
                dernierCheck: latestHealth?.createdAt,
            },
            signaux: {
                total: signaux.length,
                dernieres24h: signaux24h.length,
                nonTraites: nonTraites.length,
                critiques: critiques.length,
                parCortex,
            },
            actions: {
                total: actions.length,
                dernieres24h: actions24h.length,
                parCategorie,
            },
            cortex: Object.values(CORTEX).map((c) => ({
                nom: c,
                signaux: parCortex[c] ?? 0,
            })),
            configs: configs.length,
            poidsAdaptatifs: poids.length,
            healthHistory: healthMetrics.map((m) => ({
                valeur: m.valeur,
                createdAt: m.createdAt,
                dimensions: m.dimensions,
            })),
        };
    },
});

/**
 * Statistiques rapides pour le badge de monitoring.
 */
export const stats = query({
    args: {},
    handler: async (ctx) => {
        const signaux = await ctx.db
            .query("signaux")
            .withIndex("by_traite", (q) => q.eq("traite", false))
            .collect();

        const critiques = signaux.filter((s) => s.priorite >= PRIORITE.CRITIQUE);

        return {
            nonTraites: signaux.length,
            critiques: critiques.length,
        };
    },
});
