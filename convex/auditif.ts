// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NEOCORTEX: Cortex Auditif
// 👂 Notifications & Alertes
// Auto-notification sur signaux critiques,
// extension du système notifications existant
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { PRIORITE, CATEGORIES_ACTION } from "./lib/types";
import { internal } from "./_generated/api";

// ─── Auto-notification on Critical Signals ──────

/**
 * Traiter un signal critique pour créer une notification.
 * Déclenché par le routeur limbique quand priorité >= CRITIQUE
 * et destination = auditif.
 */
export const traiterSignalCritique = internalMutation({
    args: {
        signalId: v.id("signaux"),
    },
    handler: async (ctx, args) => {
        const signal = await ctx.db.get(args.signalId);
        if (!signal) return;

        // Only process critical/high priority signals
        if (signal.priorite < PRIORITE.HAUTE) return;

        // Get all admin users for the org to notify them
        if (signal.organisationId) {
            const members = await ctx.db
                .query("organization_members")
                .withIndex("by_organizationId")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("status"), "active"),
                        q.eq(q.field("estAdmin"), true)
                    )
                )
                .collect();

            // Filter for the specific org
            const orgMembers = members.filter(
                (m) => String(m.organizationId) === signal.organisationId
            );

            // Create a notification entry in historiqueActions as a system alert
            for (const member of orgMembers) {
                await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
                    action: `neocortex.alerte_critique`,
                    categorie: CATEGORIES_ACTION.SECURITE,
                    entiteType: signal.entiteType ?? "signaux",
                    entiteId: signal.entiteId ?? String(signal._id),
                    userId: member.userId ?? "system",
                    organisationId: signal.organisationId,
                    details: {
                        description: `⚠️ Alerte critique: ${signal.type}`,
                        metadata: {
                            signalId: String(signal._id),
                            signalType: signal.type,
                            priorite: signal.priorite,
                            payload: signal.payload,
                        },
                    },
                });
            }
        }
    },
});

// ─── Notification Enrichment ────────────────────

/**
 * Créer une notification enrichie depuis un signal.
 * Utilisé pour les notifications "push" visibles dans l'interface.
 */
export const creerNotificationDepuisSignal = internalMutation({
    args: {
        type: v.string(),
        titre: v.string(),
        description: v.string(),
        userId: v.string(),
        organisationId: v.optional(v.string()),
        entiteType: v.optional(v.string()),
        entiteId: v.optional(v.string()),
        priorite: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Emit notification signal
        await ctx.scheduler.runAfter(0, internal.limbique.emettreSignal, {
            type: "NOTIFICATION_CREEE",
            payload: {
                titre: args.titre,
                description: args.description,
                notificationType: args.type,
            },
            emetteurId: args.userId,
            entiteType: args.entiteType,
            entiteId: args.entiteId,
            organisationId: args.organisationId,
            priorite: args.priorite,
        });

        // Log
        await ctx.scheduler.runAfter(0, internal.hippocampe.loguerAction, {
            action: `notifications.${args.type}`,
            categorie: CATEGORIES_ACTION.UTILISATEUR,
            entiteType: args.entiteType ?? "notifications",
            entiteId: args.entiteId ?? `notif-${Date.now()}`,
            userId: args.userId,
            organisationId: args.organisationId,
            details: {
                description: `${args.titre}: ${args.description}`,
            },
        });
    },
});

// ─── Alert Summary ──────────────────────────────

/**
 * Résumé des alertes critiques récentes pour le dashboard.
 */
export const resumeAlertes = query({
    args: {
        organisationId: v.optional(v.string()),
        heures: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const heures = args.heures ?? 24;
        const depuis = Date.now() - heures * 60 * 60 * 1000;

        let actions;
        if (args.organisationId) {
            actions = await ctx.db
                .query("historiqueActions")
                .withIndex("by_organisationId", (q) =>
                    q.eq("organisationId", args.organisationId!)
                )
                .order("desc")
                .collect();
        } else {
            actions = await ctx.db
                .query("historiqueActions")
                .order("desc")
                .take(500);
        }

        const alertes = actions.filter(
            (a) =>
                a.createdAt >= depuis &&
                a.action.includes("alerte_critique")
        );

        return {
            total: alertes.length,
            alertes: alertes.slice(0, 20),
            depuis: new Date(depuis).toISOString(),
        };
    },
});
