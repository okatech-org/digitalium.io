// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Préfrontal
// 🎯 Décisions & Workflows
// Scoring pondéré, machine à états, transitions
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { SIGNAL_TYPES, CATEGORIES_ACTION } from "./lib/types";
import { calculerScorePondere } from "./lib/helpers";

// ─── Decision Evaluation ────────────────────────

/**
 * Évaluer une décision basée sur un scoring pondéré.
 * Utilisé pour les workflows d'approbation, les escalades, etc.
 *
 * Exemple: évaluer si un document doit être auto-approuvé
 * en fonction de la confiance, du rôle, et de l'historique.
 */
export const evaluerDecision = mutation({
    args: {
        type: v.string(), // "auto_approbation", "escalade", etc.
        facteurs: v.array(v.object({
            nom: v.string(),
            valeur: v.number(), // 0-1
            poids: v.number(), // weight
        })),
        seuil: v.number(), // threshold (0-1) to trigger positive decision
        entiteId: v.optional(v.string()),
        entiteType: v.optional(v.string()),
        organisationId: v.optional(v.string()),
        userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const score = calculerScorePondere(
            args.facteurs.map((f) => ({ valeur: f.valeur, poids: f.poids }))
        );

        const decision = score >= args.seuil;

        // Log the decision via hippocampe
        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `prefrontal.decision.${args.type}`,
            categorie: CATEGORIES_ACTION.SYSTEME,
            entiteType: args.entiteType ?? "decision",
            entiteId: args.entiteId ?? `decision-${Date.now()}`,
            userId: args.userId ?? "system",
            organisationId: args.organisationId,
            details: {
                description: `Décision ${args.type}: ${decision ? "APPROUVÉE" : "REJETÉE"} (score: ${score.toFixed(3)}, seuil: ${args.seuil})`,
                metadata: {
                    type: args.type,
                    score,
                    seuil: args.seuil,
                    decision,
                    facteurs: args.facteurs,
                },
            },
        });

        return {
            decision,
            score,
            seuil: args.seuil,
            facteurs: args.facteurs,
        };
    },
});

// ─── Workflow Execution ─────────────────────────

/**
 * Exécuter un workflow à étapes (machine à états).
 * Gère les transitions d'état avec validation.
 *
 * Exemple: document draft → review → approved → archived
 */
export const executerWorkflow = mutation({
    args: {
        entiteType: v.string(), // "documents", "organizations", etc.
        entiteId: v.string(),
        etatActuel: v.string(),
        etatCible: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Validate transition is allowed
        const transitionKey = `${args.entiteType}.${args.etatActuel}.${args.etatCible}`;
        const estValide = validerTransitionInterne(
            args.entiteType,
            args.etatActuel,
            args.etatCible
        );

        if (!estValide) {
            throw new Error(
                `Transition non autorisée: ${args.etatActuel} → ${args.etatCible} pour ${args.entiteType}`
            );
        }

        // Log the transition
        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `workflow.transition`,
            categorie: CATEGORIES_ACTION.METIER,
            entiteType: args.entiteType,
            entiteId: args.entiteId,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                description: `${args.entiteType}: ${args.etatActuel} → ${args.etatCible}`,
                metadata: {
                    etatActuel: args.etatActuel,
                    etatCible: args.etatCible,
                    transitionKey,
                    ...args.metadata,
                },
            },
        });

        // Emit signal for the transition
        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: SIGNAL_TYPES.DOCUMENT_STATUT_CHANGE,
            payload: {
                etatActuel: args.etatActuel,
                etatCible: args.etatCible,
                entiteType: args.entiteType,
            },
            emetteurId: args.userId,
            entiteId: args.entiteId,
            entiteType: args.entiteType,
            organisationId: args.organisationId,
        });

        return {
            success: true,
            transition: `${args.etatActuel} → ${args.etatCible}`,
        };
    },
});

// ─── Transition Validation ──────────────────────

/**
 * Vérifier si une transition d'état est autorisée.
 */
export const validerTransition = query({
    args: {
        entiteType: v.string(),
        etatActuel: v.string(),
        etatCible: v.string(),
    },
    handler: async (_ctx, args) => {
        return {
            valide: validerTransitionInterne(
                args.entiteType,
                args.etatActuel,
                args.etatCible
            ),
        };
    },
});

/**
 * Lister les transitions possibles depuis un état donné.
 */
export const listerTransitionsPossibles = query({
    args: {
        entiteType: v.string(),
        etatActuel: v.string(),
    },
    handler: async (_ctx, args) => {
        const transitions = TRANSITIONS_AUTORISEES[args.entiteType];
        if (!transitions) return [];
        return transitions[args.etatActuel] ?? [];
    },
});

// ─── Internal Helpers ───────────────────────────

/**
 * Map of allowed state transitions per entity type.
 */
const TRANSITIONS_AUTORISEES: Record<string, Record<string, string[]>> = {
    documents: {
        draft: ["review", "trashed"],
        review: ["approved", "draft"],
        approved: ["archived", "review"],
        archived: [],
        trashed: ["draft"],
    },
    organizations: {
        brouillon: ["prete", "trial"],
        prete: ["active", "trial"],
        trial: ["active", "suspended"],
        active: ["suspended", "resiliee"],
        suspended: ["active", "resiliee"],
        resiliee: [],
    },
    archives: {
        active: ["semi_active", "on_hold"],
        semi_active: ["archived", "on_hold"],
        archived: ["destroyed"],
        on_hold: ["active", "semi_active"],
        destroyed: [],
    },
    signatures: {
        pending: ["in_progress", "cancelled"],
        in_progress: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
    },
};

function validerTransitionInterne(
    entiteType: string,
    etatActuel: string,
    etatCible: string
): boolean {
    const transitions = TRANSITIONS_AUTORISEES[entiteType];
    if (!transitions) return true; // Unknown entity types are permissive
    const allowed = transitions[etatActuel];
    if (!allowed) return false;
    return allowed.includes(etatCible);
}
