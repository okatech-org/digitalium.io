import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Cell Access Rules (v2)
// Matrice d'accès : (OrgUnit × BusinessRole) → FilingCell
// ═══════════════════════════════════════════════

const accessLevel = v.union(
    v.literal("aucun"),
    v.literal("lecture"),
    v.literal("ecriture"),
    v.literal("gestion"),
    v.literal("admin")
);

/* ─── Queries ────────────────────────────────── */

export const getRulesForCell = query({
    args: { filingCellId: v.id("filing_cells") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.filingCellId))
            .collect();
    },
});

export const getRulesForUnit = query({
    args: { orgUnitId: v.id("org_units") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_orgUnitId", (q) => q.eq("orgUnitId", args.orgUnitId))
            .collect();
    },
});

export const getRulesForRole = query({
    args: { businessRoleId: v.id("business_roles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_businessRoleId", (q) => q.eq("businessRoleId", args.businessRoleId))
            .collect();
    },
});

export const getAccessMatrix = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cell_access_rules")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

/**
 * Résout l'accès effectif d'un utilisateur à une cellule.
 * Prend en compte : rôle plateforme, règles d'accès, overrides.
 */
export const resolveUserAccess = query({
    args: {
        userId: v.string(),
        filingCellId: v.id("filing_cells"),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const ACCESS_ORDER: Record<string, number> = {
            aucun: 0,
            lecture: 1,
            ecriture: 2,
            gestion: 3,
            admin: 4,
        };

        const PLATFORM_CAP: Record<string, string> = {
            system_admin: "admin",
            platform_admin: "admin",
            org_admin: "admin",
            org_manager: "gestion",
            org_member: "ecriture",
            org_viewer: "lecture",
        };

        // 1. Trouver le membre
        const member = await ctx.db
            .query("organization_members")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", args.organizationId).eq("userId", args.userId)
            )
            .first();

        if (!member) return { effectiveAccess: "aucun", source: "none" };

        // 2. Bypass pour admin
        if (member.level <= 2) {
            return { effectiveAccess: "admin", source: "bypass" };
        }

        // 3. Chercher un override actif
        const override = await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_cell_user", (q) =>
                q.eq("filingCellId", args.filingCellId).eq("userId", args.userId)
            )
            .filter((q) => q.eq(q.field("estActif"), true))
            .first();

        if (override) {
            // Vérifier expiration
            if (override.dateExpiration && override.dateExpiration < Date.now()) {
                // Override expiré, on ignore
            } else {
                const cap = PLATFORM_CAP[member.role] ?? "lecture";
                const rawAccess = override.acces;
                const effective =
                    ACCESS_ORDER[rawAccess] <= ACCESS_ORDER[cap] ? rawAccess : cap;
                return {
                    effectiveAccess: effective,
                    source: "override",
                    overrideId: override._id,
                    cappedBy: ACCESS_ORDER[rawAccess] > ACCESS_ORDER[cap] ? member.role : undefined,
                };
            }
        }

        // 4. Chercher les règles par (orgUnit, businessRole)
        const rules = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_filingCellId", (q) => q.eq("filingCellId", args.filingCellId))
            .filter((q) => q.eq(q.field("estActif"), true))
            .collect();

        // Trouver la règle la plus spécifique (priorité la plus haute)
        let bestRule = null;
        let bestAccess = "aucun";

        for (const rule of rules) {
            const matchUnit = !rule.orgUnitId || rule.orgUnitId === member.orgUnitId;
            const matchRole = !rule.businessRoleId || rule.businessRoleId === member.businessRoleId;

            if (matchUnit && matchRole) {
                if (!bestRule || rule.priorite > bestRule.priorite) {
                    bestRule = rule;
                    bestAccess = rule.acces;
                }
            }
        }

        if (bestRule) {
            const cap = PLATFORM_CAP[member.role] ?? "lecture";
            const effective =
                ACCESS_ORDER[bestAccess] <= ACCESS_ORDER[cap] ? bestAccess : cap;
            return {
                effectiveAccess: effective,
                source: "rule",
                ruleId: bestRule._id,
                cappedBy: ACCESS_ORDER[bestAccess] > ACCESS_ORDER[cap] ? member.role : undefined,
            };
        }

        return { effectiveAccess: "aucun", source: "default" };
    },
});

/* ─── Mutations ──────────────────────────────── */

export const createRule = mutation({
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
        return await ctx.db.insert("cell_access_rules", {
            organizationId: args.organizationId,
            filingCellId: args.filingCellId,
            orgUnitId: args.orgUnitId,
            businessRoleId: args.businessRoleId,
            acces: args.acces,
            priorite: args.priorite ?? 0,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateRule = mutation({
    args: {
        id: v.id("cell_access_rules"),
        acces: v.optional(accessLevel),
        priorite: v.optional(v.number()),
        estActif: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Règle d'accès introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
        return id;
    },
});

export const removeRule = mutation({
    args: { id: v.id("cell_access_rules") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Règle d'accès introuvable");
        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const bulkCreateRules = mutation({
    args: {
        organizationId: v.id("organizations"),
        rules: v.array(
            v.object({
                filingCellId: v.id("filing_cells"),
                orgUnitId: v.optional(v.id("org_units")),
                businessRoleId: v.optional(v.id("business_roles")),
                acces: accessLevel,
                priorite: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let count = 0;

        for (const rule of args.rules) {
            await ctx.db.insert("cell_access_rules", {
                organizationId: args.organizationId,
                filingCellId: rule.filingCellId,
                orgUnitId: rule.orgUnitId,
                businessRoleId: rule.businessRoleId,
                acces: rule.acces,
                priorite: rule.priorite ?? 0,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });
            count++;
        }

        return { created: count };
    },
});
