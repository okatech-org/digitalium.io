// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Helpers
// Shared utilities for correlation, scoring, formatting
// ═══════════════════════════════════════════════

import { PRIORITE, TTL, SIGNAL_ROUTING, CORTEX } from "./types";
import type { CortexType, PrioriteSignal } from "./types";

// ─── Correlation ID ─────────────────────────────

let _counter = 0;

/**
 * Generate a unique correlation ID for signal tracing.
 * Format: COR-{timestamp}-{counter}-{random}
 */
export function genererCorrelationId(): string {
    _counter = (_counter + 1) % 100000;
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 6);
    return `COR-${ts}-${_counter.toString().padStart(5, "0")}-${rnd}`;
}

// ─── Signal Helpers ─────────────────────────────

/**
 * Determine which cortex modules should receive a given signal type.
 * Falls back to [hippocampe] for unrouted signals.
 */
export function routerVersDestinations(signalType: string): CortexType[] {
    return SIGNAL_ROUTING[signalType] ?? [CORTEX.HIPPOCAMPE];
}

/**
 * Determine the TTL for a signal based on its priority.
 */
export function calculerTTL(priorite: PrioriteSignal): number {
    switch (priorite) {
        case PRIORITE.CRITIQUE:
            return TTL.CRITIQUE;
        case PRIORITE.HAUTE:
            return TTL.LONG;
        case PRIORITE.NORMALE:
            return TTL.STANDARD;
        case PRIORITE.BASSE:
            return TTL.COURT;
        default:
            return TTL.STANDARD;
    }
}

// ─── Scoring ────────────────────────────────────

/**
 * Calculate a weighted score from multiple factors.
 * Each factor has a value (0-1) and a weight.
 * Returns normalized score between 0 and 1.
 */
export function calculerScorePondere(
    facteurs: Array<{ valeur: number; poids: number }>
): number {
    if (facteurs.length === 0) return 0;

    let totalPoids = 0;
    let totalScore = 0;

    for (const f of facteurs) {
        const valeurNormalisee = Math.max(0, Math.min(1, f.valeur));
        totalScore += valeurNormalisee * f.poids;
        totalPoids += f.poids;
    }

    return totalPoids > 0 ? totalScore / totalPoids : 0;
}

/**
 * Determine signal priority from a human-readable action name.
 */
export function determinerPriorite(action: string): PrioriteSignal {
    const critiques = ["DETRUITE", "GEL_JURIDIQUE", "ERREUR_SYSTEME", "SUPPRIME"];
    const hautes = ["STATUT_CHANGE", "COMPLETEE", "CONVERTI", "SIGNEE"];
    const basses = ["HEALTH_CHECK", "CRON_EXECUTE", "LUE"];

    if (critiques.some((k) => action.includes(k))) return PRIORITE.CRITIQUE;
    if (hautes.some((k) => action.includes(k))) return PRIORITE.HAUTE;
    if (basses.some((k) => action.includes(k))) return PRIORITE.BASSE;
    return PRIORITE.NORMALE;
}

// ─── Formatting ─────────────────────────────────

/**
 * Format a timestamp to a human-readable French date string.
 */
export function formaterDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Truncate a string to maxLength, adding "..." if truncated.
 */
export function tronquer(texte: string, maxLength: number = 100): string {
    if (texte.length <= maxLength) return texte;
    return texte.slice(0, maxLength - 3) + "...";
}

/**
 * Create a safe snapshot of an entity for before/after comparison.
 * Strips internal Convex fields (_id, _creationTime).
 */
export function captureAvant(entity: Record<string, unknown> | null): Record<string, unknown> | undefined {
    if (!entity) return undefined;
    const snapshot = { ...entity };
    delete snapshot._id;
    delete snapshot._creationTime;
    return snapshot;
}
