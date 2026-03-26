// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Sensoriel
// 📡 Entrées externes — Webhooks HTTP
// Firebase Auth, Stripe, APIs tierces
// ═══════════════════════════════════════════════

import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { SIGNAL_TYPES } from "./lib/types";

// ─── Firebase Auth Webhook ──────────────────────

/**
 * Webhook appelé par Firebase Auth lors d'événements utilisateur.
 * Déclenche: UTILISATEUR_CONNECTE, UTILISATEUR_DECONNECTE
 *
 * Configurer dans Firebase Console → Authentication → Event Triggers
 * URL: https://<convex-site-url>/sensoriel/firebase-auth
 */
export const firebaseAuthWebhook = httpAction(async (ctx, request) => {
    try {
        const body = await request.json();
        const eventType = body.eventType ?? body.type;

        if (!eventType) {
            return new Response(JSON.stringify({ error: "Missing eventType" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Map Firebase event types to NEOCORTEX signal types
        let signalType: string | null = null;
        const payload: Record<string, unknown> = {
            firebaseEvent: eventType,
            uid: body.uid ?? body.data?.uid,
            email: body.email ?? body.data?.email,
            timestamp: Date.now(),
        };

        switch (eventType) {
            case "providers/firebase.auth/eventTypes/user.create":
            case "user.create":
                signalType = SIGNAL_TYPES.UTILISATEUR_CONNECTE;
                payload.action = "inscription";
                break;
            case "providers/firebase.auth/eventTypes/user.signIn":
            case "user.signIn":
                signalType = SIGNAL_TYPES.UTILISATEUR_CONNECTE;
                payload.action = "connexion";
                break;
            case "providers/firebase.auth/eventTypes/user.delete":
            case "user.delete":
                signalType = SIGNAL_TYPES.UTILISATEUR_DECONNECTE;
                payload.action = "suppression";
                break;
            default:
                signalType = SIGNAL_TYPES.UTILISATEUR_CONNECTE;
                payload.action = "inconnu";
        }

        if (signalType) {
            await ctx.runMutation(internal.limbique.emettreSignal, {
                type: signalType,
                payload,
                emetteurId: payload.uid as string ?? "firebase",
                entiteType: "users",
            });
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        await ctx.runMutation(internal.limbique.emettreSignal, {
            type: SIGNAL_TYPES.ERREUR_SYSTEME,
            payload: {
                source: "sensoriel.firebaseAuthWebhook",
                error: String(error),
            },
        });

        return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});

// ─── Stripe Payment Webhook ─────────────────────

/**
 * Webhook pour les événements de paiement Stripe.
 * URL: https://<convex-site-url>/sensoriel/stripe
 */
export const stripeWebhook = httpAction(async (ctx, request) => {
    try {
        const body = await request.json();
        const eventType = body.type;

        if (!eventType) {
            return new Response(JSON.stringify({ error: "Missing type" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        let signalType: string | null = null;
        const payload: Record<string, unknown> = {
            stripeEvent: eventType,
            data: body.data?.object,
            timestamp: Date.now(),
        };

        switch (eventType) {
            case "checkout.session.completed":
            case "payment_intent.succeeded":
                signalType = SIGNAL_TYPES.PAIEMENT_STATUT_CHANGE;
                payload.statut = "completed";
                break;
            case "payment_intent.payment_failed":
                signalType = SIGNAL_TYPES.PAIEMENT_STATUT_CHANGE;
                payload.statut = "failed";
                break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
                signalType = SIGNAL_TYPES.ABONNEMENT_MODIFIE;
                break;
            case "customer.subscription.deleted":
                signalType = SIGNAL_TYPES.ABONNEMENT_MODIFIE;
                payload.statut = "cancelled";
                break;
            default:
                // Unhandled event — log but don't signal
                break;
        }

        if (signalType) {
            await ctx.runMutation(internal.limbique.emettreSignal, {
                type: signalType,
                payload,
                emetteurId: "stripe",
                entiteType: "payments",
                entiteId: body.data?.object?.id,
            });
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        await ctx.runMutation(internal.limbique.emettreSignal, {
            type: SIGNAL_TYPES.ERREUR_SYSTEME,
            payload: {
                source: "sensoriel.stripeWebhook",
                error: String(error),
            },
        });

        return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});

// ─── Generic External Event ─────────────────────

/**
 * Endpoint générique pour recevoir des événements externes.
 * URL: https://<convex-site-url>/sensoriel/event
 *
 * Body: { type: string, payload: object, source?: string }
 */
export const genericEvent = httpAction(async (ctx, request) => {
    try {
        const body = await request.json();

        if (!body.type) {
            return new Response(JSON.stringify({ error: "Missing type field" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        await ctx.runMutation(internal.limbique.emettreSignal, {
            type: body.type,
            payload: body.payload ?? {},
            emetteurId: body.source ?? "external",
            entiteType: body.entiteType,
            entiteId: body.entiteId,
            organisationId: body.organisationId,
        });

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch {
        return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
