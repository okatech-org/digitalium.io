// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Cell Access Rules (v2)
// Matrice d'accès : Service × Rôle Métier → Cellule
// + Algorithme de résolution d'accès
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";

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

/** Plafond d'accès par rôle plateforme */
const PLATFORM_CAP: Record<string, AccessLevel> = {
    system_admin: "admin",
    platform_admin: "admin",
    org_admin: "admin",
    org_manager: "gestion",
    org_member: "ecriture",
    org_viewer: "lecture",
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

// ─── Résolution d'accès ─────────────────────────

/**
 * Résoudre l'accès effectif d'un utilisateur à toutes les cellules d'une org.
 * Retourne un tableau de { cellId, effectiveAccess, source }.
 *
 * Algorithme :
 * 1. Récupérer le membre → orgUnitId, businessRoleId, platformRole
 * 2. Si org_admin / platform_admin / system_admin → bypass (admin sur tout)
 * 3. Chercher les règles cell_access_rules correspondantes
 * 4. Chercher les overrides cell_access_overrides pour cet utilisateur
 * 5. Override > règle > aucun
 * 6. Plafonner par le rôle plateforme
 */

export const resolveUserAccess = query({
    args: {
        userId: v.string(),
        userEmail: v.optional(v.string()),
        displayName: v.optional(v.string()),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        // 1. Trouver le membre — par userId (Firebase UID) d'abord
        let member = await ctx.db
            .query("organization_members")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", args.organizationId).eq("userId", args.userId)
            )
            .first();

        // 2. Fallback: chercher parmi tous les membres de l'org
        if (!member) {
            const allMembers = await ctx.db
                .query("organization_members")
                .withIndex("by_organizationId", (q) =>
                    q.eq("organizationId", args.organizationId)
                )
                .collect();

            /** Strip "(role)" or "· Label" suffix from displayName and match against member.nom */
            const matchByName = (name: string) => {
                const cleanName = name
                    .replace(/\s*\(.*\)\s*$/, "")      // strip "(Role)" suffix
                    .replace(/\s*[·–—]\s+.*$/, "")     // strip "· Label" / "– Label" suffix
                    .trim().toLowerCase();
                if (!cleanName) return null;
                return allMembers.find(
                    (m) => m.nom?.trim().toLowerCase() === cleanName
                ) ?? null;
            };

            // a) Par email (direct match ou pattern demo firstname.lastname@digitalium.io)
            if (args.userEmail) {
                member = allMembers.find((m) => {
                    // Direct match
                    if (m.email === args.userEmail || m.userId === args.userEmail) return true;
                    // Match demo email pattern: firstname.lastname@digitalium.io
                    if (args.userEmail?.endsWith("@digitalium.io") && m.nom) {
                        const parts = m.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .trim().split(/\s+/);
                        if (parts.length >= 2) {
                            const expected = `${parts[0].toLowerCase()}.${parts[parts.length - 1].toLowerCase()}@digitalium.io`
                                .replace(/[^a-z0-9.\-@]/g, "");
                            return args.userEmail === expected;
                        }
                    }
                    return false;
                }) ?? null;
            }

            // b) Par displayName fourni par le frontend
            if (!member && args.displayName) {
                member = matchByName(args.displayName);
            }

            // c) Lookup interne: chercher dans la table users par Firebase UID → displayName → nom
            if (!member) {
                const convexUser = await ctx.db
                    .query("users")
                    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                    .first();
                if (convexUser?.displayName) {
                    member = matchByName(convexUser.displayName);
                }
            }
        }

        if (!member) return [];

        // 2. Bypass admin
        const isAdmin = ["system_admin", "platform_admin", "org_admin"].includes(member.role);

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

        // Filtrer les règles applicables à ce membre
        const memberRules = allRules.filter((rule) => {
            const unitMatch = !rule.orgUnitId || rule.orgUnitId === member.orgUnitId;
            const roleMatch = !rule.businessRoleId || rule.businessRoleId === member.businessRoleId;
            return unitMatch && roleMatch;
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
        const cap = PLATFORM_CAP[member.role] ?? "lecture";

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
