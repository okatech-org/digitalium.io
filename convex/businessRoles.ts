import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Business Roles (v2)
// CRUD pour les rôles métier d'une organisation
// Scopés par type d'unité organisationnelle
// ═══════════════════════════════════════════════

const orgUnitType = v.union(
    v.literal("presidence"),
    v.literal("direction_generale"),
    v.literal("direction"),
    v.literal("sous_direction"),
    v.literal("departement"),
    v.literal("service"),
    v.literal("bureau"),
    v.literal("unite"),
    v.literal("cellule")
);

const modulePermissionsValidator = v.optional(v.object({
    dashboard: v.optional(v.boolean()),
    idocument: v.optional(v.boolean()),
    iarchive: v.optional(v.boolean()),
    isignature: v.optional(v.boolean()),
    formation: v.optional(v.boolean()),
    clients: v.optional(v.boolean()),
    leads: v.optional(v.boolean()),
    organisation: v.optional(v.boolean()),
    equipe: v.optional(v.boolean()),
    abonnements: v.optional(v.boolean()),
    parametres: v.optional(v.boolean()),
}));

/* ─── Queries ────────────────────────────────── */

export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("business_roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("business_roles") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByCategorie = query({
    args: {
        organizationId: v.id("organizations"),
        categorie: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("business_roles")
            .withIndex("by_org_categorie", (q) =>
                q.eq("organizationId", args.organizationId).eq("categorie", args.categorie)
            )
            .collect();
    },
});

export const listByUnitType = query({
    args: {
        organizationId: v.id("organizations"),
        orgUnitType: orgUnitType,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("business_roles")
            .withIndex("by_org_unitType", (q) =>
                q.eq("organizationId", args.organizationId).eq("orgUnitType", args.orgUnitType)
            )
            .collect();
    },
});

/* ─── Mutations ──────────────────────────────── */

export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        description: v.optional(v.string()),
        categorie: v.optional(v.string()),
        orgUnitType: v.optional(orgUnitType),
        niveau: v.optional(v.number()),
        couleur: v.optional(v.string()),
        icone: v.optional(v.string()),
        modulePermissions: modulePermissionsValidator,
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("business_roles", {
            ...args,
            estActif: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("business_roles"),
        nom: v.optional(v.string()),
        description: v.optional(v.string()),
        categorie: v.optional(v.string()),
        niveau: v.optional(v.number()),
        couleur: v.optional(v.string()),
        icone: v.optional(v.string()),
        estActif: v.optional(v.boolean()),
        modulePermissions: modulePermissionsValidator,
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Rôle métier introuvable");

        const clean = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "businessRoles.remove",
            entiteType: "business_roles",
            entiteId: "system",
            userId: "system",
        });
        return id;
    },
});

export const remove = mutation({
    args: {
        id: v.id("business_roles"),
        force: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Rôle métier introuvable");

        // Membres rattachés
        const members = await ctx.db
            .query("organization_members")
            .withIndex("by_businessRoleId", (q) => q.eq("businessRoleId", args.id))
            .collect();

        // Règles d'accès rattachées
        const rules = await ctx.db
            .query("cell_access_rules")
            .withIndex("by_businessRoleId", (q) => q.eq("businessRoleId", args.id))
            .collect();

        if (args.force) {
            // Force: détacher les membres et supprimer les règles
            for (const m of members) {
                await ctx.db.patch(m._id, { businessRoleId: undefined });
            }
            for (const r of rules) {
                await ctx.db.delete(r._id);
            }
        } else {
            if (members.length > 0) {
                throw new Error(
                    `Impossible de supprimer : ${members.length} membre(s) avec ce rôle`
                );
            }
            if (rules.length > 0) {
                throw new Error(
                    `Impossible de supprimer : ${rules.length} règle(s) d'accès liée(s)`
                );
            }
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const bulkCreate = mutation({
    args: {
        organizationId: v.id("organizations"),
        roles: v.array(
            v.object({
                nom: v.string(),
                description: v.optional(v.string()),
                categorie: v.optional(v.string()),
                orgUnitType: v.optional(orgUnitType),
                niveau: v.optional(v.number()),
                couleur: v.optional(v.string()),
                icone: v.optional(v.string()),
                modulePermissions: modulePermissionsValidator,
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const ids = [];

        for (const role of args.roles) {
            const id = await ctx.db.insert("business_roles", {
                organizationId: args.organizationId,
                ...role,
                estActif: true,
                createdAt: now,
                updatedAt: now,
            });
            ids.push(id);
        }

        return { created: ids.length };
    },
});

// ═══════════════════════════════════════════════
// MODULE ACCESS RESOLVER
// Détermine l'accès aux modules pour un collaborateur
// ═══════════════════════════════════════════════

// Defaults: modules métier = true, tout le reste = false
const MODULE_DEFAULTS: Record<string, boolean> = {
    dashboard: true,
    idocument: true,
    iarchive: true,
    isignature: true,
    formation: true,
    clients: false,
    leads: false,
    organisation: false,
    equipe: false,
    abonnements: false,
    parametres: false,
};

export const resolveModuleAccess = query({
    args: {
        userId: v.string(),
        organizationId: v.string(), // Accepts both Convex IDs and slugs
    },
    handler: async (ctx, args) => {
        // 1. Trouver le membre — query by userId, then filter
        const members = await ctx.db
            .query("organization_members")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        // Match by organizationId (could be Convex ID or partial match)
        const member = members.find((m) => m.organizationId === args.organizationId)
            ?? members[0]; // Fallback: first membership

        if (!member) return null;

        // 2. Admin bypass → tout autorisé
        if (member.estAdmin === true || ["system_admin", "platform_admin"].includes(member.role)) {
            const all: Record<string, boolean> = {};
            for (const key of Object.keys(MODULE_DEFAULTS)) {
                all[key] = true;
            }
            return { permissions: all, source: "admin" as const };
        }

        // 3. Charger le rôle métier
        let rolePerms: Record<string, boolean | undefined> = {};
        if (member.businessRoleId) {
            const role = await ctx.db.get(member.businessRoleId);
            if (role?.modulePermissions) {
                rolePerms = role.modulePermissions as Record<string, boolean | undefined>;
            }
        }

        // 4. Construire les permissions effectives
        // Priorité: override individuel > rôle métier > défaut
        const memberOverrides: Record<string, boolean | undefined> =
            ((member as Record<string, unknown>).moduleOverrides ?? {}) as Record<string, boolean | undefined>;
        const effective: Record<string, boolean> = {};
        for (const [key, defaultVal] of Object.entries(MODULE_DEFAULTS)) {
            const overrideVal = memberOverrides[key];
            if (overrideVal !== undefined) {
                effective[key] = overrideVal; // Override individuel
            } else {
                const roleVal = rolePerms[key];
                effective[key] = roleVal !== undefined ? roleVal : defaultVal;
            }
        }


        return {
            permissions: effective,
            source: "role" as const,
            roleId: member.businessRoleId,
            hasOverrides: Object.keys(memberOverrides).length > 0,
        };
    },
});
