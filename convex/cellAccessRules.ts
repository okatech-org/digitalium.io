// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Cell Access Rules (v2)
// Matrice d'accès : Service × Rôle Métier → Cellule
// + Algorithme de résolution d'accès
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { generateDemoEmail } from "./demoAccounts";

const accessLevel = v.union(
    v.literal("aucun"),
    v.literal("lecture"),
    v.literal("ecriture"),
    v.literal("gestion"),
    v.literal("admin")
);

type AccessLevel = "aucun" | "lecture" | "ecriture" | "gestion" | "admin";

const ACCESS_ORDER: Record<AccessLevel, number> = {
    aucun: 0,
    lecture: 1,
    ecriture: 2,
    gestion: 3,
    admin: 4,
};

/** Plafond d'accès par rôle plateforme — le level est désormais dérivé du rôle métier */
const PLATFORM_CAP: Record<number, AccessLevel> = {
    1: "admin",   // platform_admin
    2: "admin",   // gouvernance / direction
    3: "gestion", // management
    4: "ecriture",// opérationnel / support
    5: "lecture",  // sans rôle métier
};

function minAccess(a: AccessLevel, b: AccessLevel): AccessLevel {
    return ACCESS_ORDER[a] <= ACCESS_ORDER[b] ? a : b;
}

function maxAccess(a: AccessLevel, b: AccessLevel): AccessLevel {
    return ACCESS_ORDER[a] >= ACCESS_ORDER[b] ? a : b;
}

// ─── Queries ────────────────────────────────────

/** Liste toutes les règles d'une organisation */
export const listByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

/** Liste les règles pour une cellule spécifique */
export const listByCell = query({
    args: { filingCellId: v.id("filing_cells") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.filingCellId))
            .collect();
    },
});

/** Liste les règles pour une unité organisationnelle */
export const listByUnit = query({
    args: { orgUnitId: v.id("org_units") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_orgUnitId", (q) => q.eq("orgUnitId", args.orgUnitId))
            .collect();
    },
});

/** Liste les règles pour un rôle métier */
export const listByRole = query({
    args: { businessRoleId: v.id("business_roles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_businessRoleId", (q) => q.eq("businessRoleId", args.businessRoleId))
            .collect();
    },
});

// ─── Mutations ──────────────────────────────────

/**
 * Créer ou mettre à jour une règle d'accès.
 * Si une règle existe déjà pour (cell, unit, role), on la met à jour.
 */
export const setRule = mutation({
    args: {
        organizationId: v.id("organizations"),
        filingCellId: v.id("filing_cells"),
        orgUnitId: v.optional(v.id("org_units")),
        businessRoleId: v.optional(v.id("business_roles")),
        acces: accessLevel,
        priorite: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Chercher une règle existante pour cette combinaison
        const existing = await findExistingRule(ctx, args.filingCellId, args.orgUnitId, args.businessRoleId);

        if (existing) {
            // Si accès = aucun, on désactive la règle
            if (args.acces === "aucun") {
                await ctx.db.patch(existing._id, { estActif: false, updatedAt: now });
            } else {
                await ctx.db.patch(existing._id, {
                    acces: args.acces,
                    priorite: args.priorite ?? existing.priorite,
                    estActif: true,
                    updatedAt: now,
                });
            }
            return existing._id;
        }

        // Créer une nouvelle règle
        if (args.acces === "aucun") return null; // Pas besoin de créer une règle "aucun"

        return await ctx.db.insert("cell_access_rules", {
            organizationId: args.organizationId,
            filingCellId: args.filingCellId,
            orgUnitId: args.orgUnitId,
            businessRoleId: args.businessRoleId,
            acces: args.acces,
            priorite: args.priorite ?? computePriority(args.orgUnitId, args.businessRoleId),
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Supprimer une règle */
export const removeRule = mutation({
    args: { id: v.id("cell_access_rules") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

/**
 * Mise à jour en masse : remplacer toutes les règles d'une org.
 * Utilisé quand on sauvegarde toute la matrice d'un coup.
 */
export const bulkSet = mutation({
    args: {
        organizationId: v.id("organizations"),
        rules: v.array(v.object({
            filingCellId: v.id("filing_cells"),
            orgUnitId: v.optional(v.id("org_units")),
            businessRoleId: v.optional(v.id("business_roles")),
            acces: accessLevel,
            priorite: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Supprimer les règles existantes de cette org
        const existing = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        for (const rule of existing) {
            await ctx.db.delete(rule._id);
        }

        // Insérer les nouvelles règles (ignorer "aucun")
        let count = 0;
        for (const rule of args.rules) {
            if (rule.acces === "aucun") continue;
            await ctx.db.insert("cell_access_rules", {
                organizationId: args.organizationId,
                filingCellId: rule.filingCellId,
                orgUnitId: rule.orgUnitId,
                businessRoleId: rule.businessRoleId,
                acces: rule.acces,
                priorite: rule.priorite ?? computePriority(rule.orgUnitId, rule.businessRoleId),
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });
            count++;
        }

        return { count };
    },
});

/**
 * Diff-based bulk upsert – only insert/update/delete changes.
 * Used by the Matrix UI "Sauvegarder" button.
 */
export const bulkUpsert = mutation({
    args: {
        organizationId: v.id("organizations"),
        upserts: v.array(v.object({
            filingCellId: v.id("filing_cells"),
            orgUnitId: v.optional(v.id("org_units")),
            businessRoleId: v.optional(v.id("business_roles")),
            acces: accessLevel,
        })),
        removals: v.array(v.id("cell_access_rules")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Delete removed rules
        for (const id of args.removals) {
            await ctx.db.delete(id);
        }

        // 2. Upsert changes (find existing → patch or insert)
        for (const rule of args.upserts) {
            if (rule.acces === "aucun") continue; // skip "aucun" – no need to store
            const existing = await findExistingRule(
                ctx, rule.filingCellId, rule.orgUnitId, rule.businessRoleId
            );
            if (existing) {
                await ctx.db.patch(existing._id, {
                    acces: rule.acces,
                    priorite: computePriority(rule.orgUnitId, rule.businessRoleId),
                    estActif: true,
                    updatedAt: now,
                });
            } else {
                await ctx.db.insert("cell_access_rules", {
                    organizationId: args.organizationId,
                    filingCellId: rule.filingCellId,
                    orgUnitId: rule.orgUnitId,
                    businessRoleId: rule.businessRoleId,
                    acces: rule.acces,
                    priorite: computePriority(rule.orgUnitId, rule.businessRoleId),
                    estActif: true,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        return { upserted: args.upserts.length, removed: args.removals.length };
    },
});

// ─── Résolution d'accès ─────────────────────────

/**
 * Résoudre l'accès effectif d'un utilisateur à toutes les cellules d'une org.
 * Retourne un tableau de { cellId, effectiveAccess, source }.
 *
 * Algorithme :
 * 1. Récupérer le membre → orgUnitId, businessRoleId, platformRole
 *    (essaye userId, puis email, puis demoEmail généré à partir du nom)
 * 2. Si estAdmin / platform_admin / system_admin → bypass (admin sur tout)
 * 3. Chercher les règles cell_access_rules correspondantes
 * 4. Chercher les overrides cell_access_overrides pour cet utilisateur
 * 5. Override > règle > aucun
 * 6. Plafonner par le rôle plateforme
 */

export const resolveUserAccess = query({
    args: {
        userId: v.string(),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        // 1. Trouver le membre — 3 stratégies de match :
        //    a) userId direct (cas standard)
        //    b) email field match
        //    c) demoEmail match (comptes démo: nom → email généré)
        const allMembers = await ctx.db
            .query("organization_members")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const member = allMembers.find((m) => m.userId === args.userId)
            ?? allMembers.find((m) => m.email === args.userId)
            ?? allMembers.find((m) => m.nom && generateDemoEmail(m.nom) === args.userId)
            ?? null;

        if (!member) return [];

        // 2. Bypass admin — estAdmin ou rôle plateforme global
        const isAdmin = member.estAdmin === true || ["system_admin", "platform_admin"].includes(member.role);

        // Récupérer toutes les cellules actives de l'org
        const cells = await ctx.db
            .query("filing_cells")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.eq(q.field("estActif"), true))
            .collect();

        if (isAdmin) {
            // Admin → accès total à tout
            return cells.map((cell) => ({
                cellId: cell._id,
                code: cell.code,
                intitule: cell.intitule,
                effectiveAccess: "admin" as AccessLevel,
                source: "bypass" as const,
            }));
        }

        // 3. Récupérer les règles applicables
        const allRules = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.eq(q.field("estActif"), true))
            .collect();

        // Filtrer les règles applicables à ce membre.
        // IMPORTANT : seules les règles avec un businessRoleId explicite sont
        // considérées. Les règles sans businessRoleId sont des « globales orphelines »
        // qui ne figurent pas dans la Matrice d'Accès et ne doivent accorder d'accès
        // à personne individuellement.
        const memberRules = allRules.filter((rule) => {
            // Exiger un businessRoleId correspondant
            if (!rule.businessRoleId || rule.businessRoleId !== member.businessRoleId) return false;
            // orgUnitId : match si (a) règle sans orgUnitId (globale),
            //   (b) orgUnitId identique, ou (c) membre sans orgUnitId (accepter toute règle pour son rôle)
            const unitMatch = !rule.orgUnitId
                || rule.orgUnitId === member.orgUnitId
                || !member.orgUnitId;
            return unitMatch;
        });

        // 4. Récupérer les overrides
        const overrides = await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("organizationId"), args.organizationId),
                    q.eq(q.field("estActif"), true)
                )
            )
            .collect();

        // Filtrer les overrides expirés
        const now = Date.now();
        const validOverrides = overrides.filter(
            (o) => !o.dateExpiration || o.dateExpiration > now
        );

        // 5. Construire la map d'accès
        const cap = PLATFORM_CAP[member.level] ?? "lecture";

        return cells.map((cell) => {
            // Chercher un override pour cette cellule
            const override = validOverrides.find((o) => o.filingCellId === cell._id);

            if (override) {
                return {
                    cellId: cell._id,
                    code: cell.code,
                    intitule: cell.intitule,
                    effectiveAccess: minAccess(override.acces, cap),
                    source: "override" as const,
                    overrideId: override._id,
                };
            }

            // Chercher les règles pour cette cellule — prendre le max
            const cellRules = memberRules.filter((r) => r.filingCellId === cell._id);

            if (cellRules.length > 0) {
                // Prendre le plus haut niveau d'accès parmi les règles
                let best: AccessLevel = "aucun";
                let bestRuleId: Id<"cell_access_rules"> | undefined;
                for (const rule of cellRules) {
                    if (ACCESS_ORDER[rule.acces] > ACCESS_ORDER[best]) {
                        best = rule.acces;
                        bestRuleId = rule._id;
                    }
                }

                return {
                    cellId: cell._id,
                    code: cell.code,
                    intitule: cell.intitule,
                    effectiveAccess: minAccess(best, cap),
                    source: "rule" as const,
                    ruleId: bestRuleId,
                };
            }

            // Aucun accès
            return {
                cellId: cell._id,
                code: cell.code,
                intitule: cell.intitule,
                effectiveAccess: "aucun" as AccessLevel,
                source: "none" as const,
            };
        });
    },
});

// ─── Helpers ────────────────────────────────────

/**
 * Calcule la priorité d'une règle :
 * - Unit + Role = 10 (le plus spécifique)
 * - Role seul = 5
 * - Unit seul = 3
 * - Ni l'un ni l'autre = 1
 */
function computePriority(
    orgUnitId?: Id<"org_units">,
    businessRoleId?: Id<"business_roles">
): number {
    if (orgUnitId && businessRoleId) return 10;
    if (businessRoleId) return 5;
    if (orgUnitId) return 3;
    return 1;
}

/**
 * Cherche une règle existante pour la combinaison (cell, unit, role)
 */
async function findExistingRule(
    ctx: any,
    filingCellId: Id<"filing_cells">,
    orgUnitId?: Id<"org_units">,
    businessRoleId?: Id<"business_roles">
): Promise<Doc<"cell_access_rules"> | null> {
    // Chercher par cellule + unité
    const candidates = await ctx.db
        .query("cell_access_rules")
        .withIndex("by_filingCellId", (q: any) => q.eq("filingCellId", filingCellId))
        .collect();

    return candidates.find((r: Doc<"cell_access_rules">) =>
        (r.orgUnitId ?? null) === (orgUnitId ?? null)
        && (r.businessRoleId ?? null) === (businessRoleId ?? null)
    ) ?? null;
}
