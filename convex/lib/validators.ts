// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Validators
// Reusable Convex v.* validators for NEOCORTEX tables
// ═══════════════════════════════════════════════

import { v } from "convex/values";

// ─── Signal Validators ──────────────────────────

export const vSignalType = v.string(); // validated at runtime via SIGNAL_TYPES

export const vCortexType = v.union(
    v.literal("limbique"),
    v.literal("hippocampe"),
    v.literal("plasticite"),
    v.literal("prefrontal"),
    v.literal("sensoriel"),
    v.literal("visuel"),
    v.literal("auditif"),
    v.literal("moteur")
);

export const vPriorite = v.union(
    v.literal(0), // BASSE
    v.literal(1), // NORMALE
    v.literal(2), // HAUTE
    v.literal(3)  // CRITIQUE
);

export const vCategorieAction = v.union(
    v.literal("metier"),
    v.literal("systeme"),
    v.literal("utilisateur"),
    v.literal("securite")
);

// ─── Signal Table Validators ────────────────────

export const vSignalArgs = {
    type: vSignalType,
    source: v.string(),
    destination: v.string(),
    payload: v.any(),
    confiance: v.number(),
    priorite: vPriorite,
    correlationId: v.string(),
    ttl: v.number(),
    traite: v.boolean(),
    emetteurId: v.optional(v.string()),
    entiteId: v.optional(v.string()),
    entiteType: v.optional(v.string()),
    organisationId: v.optional(v.string()),
    createdAt: v.number(),
};

// ─── Historique Action Validators ───────────────

export const vHistoriqueActionArgs = {
    action: v.string(),
    categorie: vCategorieAction,
    entiteType: v.string(),
    entiteId: v.string(),
    userId: v.string(),
    organisationId: v.optional(v.string()),
    details: v.object({
        avant: v.optional(v.any()),
        apres: v.optional(v.any()),
        description: v.optional(v.string()),
        metadata: v.optional(v.any()),
    }),
    createdAt: v.number(),
};

// ─── Config Système Validators ──────────────────

export const vConfigSystemeArgs = {
    cle: v.string(),
    valeur: v.any(),
    description: v.optional(v.string()),
    updatedAt: v.number(),
};

// ─── Métriques Validators ───────────────────────

export const vMetriqueArgs = {
    nom: v.string(),
    valeur: v.number(),
    unite: v.string(),
    periode: v.string(),
    dimensions: v.optional(v.any()),
    createdAt: v.number(),
};

// ─── Poids Adaptatifs Validators ────────────────

export const vPoidsAdaptatifsArgs = {
    signal: v.string(),
    regle: v.string(),
    poids: v.number(),
    executions: v.number(),
    derniereExecution: v.optional(v.number()),
    updatedAt: v.number(),
};
