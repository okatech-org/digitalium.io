// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Organization Members
// CRUD pour la gestion du personnel
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

const memberRole = v.union(
    v.literal("admin"),
    v.literal("membre")
);

type MemberRole = "admin" | "membre";

/**
 * Dérive le level (0-5) à partir de la catégorie du rôle métier.
 * Le level détermine le plafond de capacités (lecture, écriture, validation, gestion).
 * L'admin plateforme est géré séparément via estAdmin.
 */
async function deriveLevelFromBusinessRole(
    ctx: any,
    businessRoleId?: any,
): Promise<number> {
    if (!businessRoleId) return 5; // Pas de rôle = lecture seule

    const role = await ctx.db.get(businessRoleId);
    if (!role) return 5;

    // La catégorie du rôle métier détermine le plafond de capacité
    switch (role.categorie) {
        case "gouvernance": return 2;  // Accès étendu (Président, PCA...)
        case "direction": return 2;  // Accès étendu (DG, DGA, SG...)
        case "management": return 3;  // Peut valider/approuver (Chef Dept, Responsable...)
        case "opérationnel": return 4;  // Peut éditer (Chef Bureau, Agent...)
        case "support": return 4;  // Peut éditer (Technicien, Assistant...)
        default: return 4;  // Par défaut = peut éditer
    }
}

// ─── List members for an org ──────────────────

export const list = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const members = await ctx.db
            .query("organization_members")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .collect();

        // Enrich with org name
        const org = await ctx.db.get(args.organizationId);
        return members.map((m) => ({
            ...m,
            organisationName: org?.name ?? "—",
        }));
    },
});

// ─── List ALL members (cross-org) ─────────────

export const listAll = query({
    handler: async (ctx) => {
        const members = await ctx.db.query("organization_members").collect();

        // Build org name map
        const orgIds = Array.from(new Set(members.map((m) => m.organizationId)));
        const orgs = await Promise.all(orgIds.map((id) => ctx.db.get(id)));
        const orgMap = new Map<string, string>();
        for (const o of orgs) {
            if (o) orgMap.set(o._id, o.name);
        }

        return members.map((m) => ({
            ...m,
            organisationName: orgMap.get(m.organizationId) ?? "—",
        }));
    },
});

// ─── Stats for KPIs ───────────────────────────

export const getStats = query({
    args: { organizationId: v.optional(v.id("organizations")) },
    handler: async (ctx, args) => {
        const members = args.organizationId
            ? await ctx.db
                .query("organization_members")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId!))
                .collect()
            : await ctx.db.query("organization_members").collect();

        return {
            total: members.length,
            active: members.filter((m) => m.status === "active").length,
            invited: members.filter((m) => m.status === "invited").length,
            suspended: members.filter((m) => m.status === "suspended").length,
        };
    },
});

// ─── Add a single member ─────────────────────

export const add = mutation({
    args: {
        organizationId: v.id("organizations"),
        nom: v.string(),
        userId: v.optional(v.string()),
        email: v.optional(v.string()),
        telephone: v.optional(v.string()),
        poste: v.optional(v.string()),
        orgUnitId: v.optional(v.id("org_units")),
        businessRoleId: v.optional(v.id("business_roles")),
        estAdmin: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const level = await deriveLevelFromBusinessRole(ctx, args.businessRoleId);

        // Si premier membre de l'org → forcer admin
        const firstMember = await ctx.db
            .query("organization_members")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
            .first();
        const forceAdmin = !firstMember;
        const isAdmin = forceAdmin || args.estAdmin === true;


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.add",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return await ctx.db.insert("organization_members", {
            organizationId: args.organizationId,
            userId: args.userId ?? args.email ?? `member_${now}`,
            nom: args.nom,
            email: args.email,
            telephone: args.telephone,
            poste: args.poste,
            orgUnitId: args.orgUnitId,
            businessRoleId: args.businessRoleId,
            role: isAdmin ? "admin" : "membre",
            estAdmin: isAdmin,
            level,
            status: args.email ? "invited" : "active",
            joinedAt: now,
        });
    },
});

// ─── Bulk add members ─────────────────────────

export const bulkAdd = mutation({
    args: {
        organizationId: v.id("organizations"),
        members: v.array(v.object({
            nom: v.string(),
            email: v.optional(v.string()),
            telephone: v.optional(v.string()),
            poste: v.optional(v.string()),
            orgUnitId: v.optional(v.id("org_units")),
            businessRoleId: v.optional(v.id("business_roles")),
            estAdmin: v.optional(v.boolean()),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let count = 0;
        for (const m of args.members) {
            const level = await deriveLevelFromBusinessRole(ctx, m.businessRoleId);
            await ctx.db.insert("organization_members", {
                organizationId: args.organizationId,
                userId: m.email ?? `member_${now}_${count}`,
                nom: m.nom,
                email: m.email,
                telephone: m.telephone,
                poste: m.poste,
                orgUnitId: m.orgUnitId,
                businessRoleId: m.businessRoleId,
                role: m.estAdmin ? "admin" : "membre",
                estAdmin: m.estAdmin ?? false,
                level,
                status: m.email ? "invited" : "active",
                joinedAt: now,
            });
            count++;
        }

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.bulkAdd",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return { created: count };
    },
});

// ─── Update a member ─────────────────────────

export const update = mutation({
    args: {
        id: v.id("organization_members"),
        nom: v.optional(v.string()),
        poste: v.optional(v.string()),
        email: v.optional(v.string()),
        telephone: v.optional(v.string()),
        orgUnitId: v.optional(v.id("org_units")),
        businessRoleId: v.optional(v.id("business_roles")),
        estAdmin: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Membre introuvable");

        const patch: Record<string, unknown> = {};
        if (args.nom !== undefined) patch.nom = args.nom;
        if (args.poste !== undefined) patch.poste = args.poste;
        if (args.email !== undefined) patch.email = args.email;
        if (args.telephone !== undefined) patch.telephone = args.telephone;
        if (args.orgUnitId !== undefined) patch.orgUnitId = args.orgUnitId;
        if (args.businessRoleId !== undefined) {
            patch.businessRoleId = args.businessRoleId;
            // Auto-recalcul du level
            patch.level = await deriveLevelFromBusinessRole(ctx, args.businessRoleId);
        }
        if (args.estAdmin !== undefined) {
            // Guard: empêcher la désactivation du dernier admin
            if (args.estAdmin === false && existing.estAdmin === true) {
                const admins = await ctx.db
                    .query("organization_members")
                    .withIndex("by_organizationId", (q) => q.eq("organizationId", existing.organizationId))
                    .collect();
                const adminCount = admins.filter((m) => m.estAdmin === true).length;
                if (adminCount <= 1) {
                    throw new Error("Impossible : au moins un administrateur doit exister. Activez un autre admin d'abord.");
                }
            }
            patch.estAdmin = args.estAdmin;
            patch.role = args.estAdmin ? "admin" : "membre";
        }

        await ctx.db.patch(args.id, patch);

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.update",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return args.id;
    },
});

// ─── Remove a member ─────────────────────────

export const remove = mutation({
    args: { id: v.id("organization_members") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Membre introuvable");

        // Guard: empêcher la suppression du dernier admin
        if (existing.estAdmin === true) {
            const admins = await ctx.db
                .query("organization_members")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", existing.organizationId))
                .collect();
            const adminCount = admins.filter((m) => m.estAdmin === true).length;
            if (adminCount <= 1) {
                throw new Error("Impossible : le dernier administrateur ne peut pas être supprimé.");
            }
        }

        await ctx.db.delete(args.id);

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.remove",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return args.id;
    },
});

// ─── Depart a member (soft-delete with archival) ─────

export const depart = mutation({
    args: {
        id: v.id("organization_members"),
        reason: v.optional(v.string()),
        replacedById: v.optional(v.id("organization_members")),
    },
    handler: async (ctx, args) => {
        const member = await ctx.db.get(args.id);
        if (!member) throw new Error("Membre introuvable");

        // Guard: empêcher le départ du dernier admin
        if (member.estAdmin === true) {
            const admins = await ctx.db
                .query("organization_members")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", member.organizationId))
                .collect();
            const adminCount = admins.filter((m) => m.estAdmin === true).length;
            if (adminCount <= 1) {
                throw new Error("Impossible : le dernier administrateur ne peut pas partir. Désignez un autre admin d'abord.");
            }
        }

        const now = Date.now();

        // 1. Soft-delete: marquer comme parti
        await ctx.db.patch(args.id, {
            status: "departed",
            departedAt: now,
            departureReason: args.reason,
            replacedById: args.replacedById,
            estAdmin: false,
            role: "membre" as const,
            moduleOverrides: undefined,
        });

        // 2. Si un remplaçant est désigné → transférer orgUnit + businessRole
        if (args.replacedById) {
            const replacement = await ctx.db.get(args.replacedById);
            if (replacement) {
                const patch: Record<string, unknown> = {};
                if (member.orgUnitId && !replacement.orgUnitId) {
                    patch.orgUnitId = member.orgUnitId;
                }
                if (member.businessRoleId && !replacement.businessRoleId) {
                    patch.businessRoleId = member.businessRoleId;
                    // Auto-recalcul du level
                    patch.level = await deriveLevelFromBusinessRole(ctx, member.businessRoleId);
                }
                if (member.poste && !replacement.poste) {
                    patch.poste = member.poste;
                }
                if (Object.keys(patch).length > 0) {
                    await ctx.db.patch(args.replacedById, patch);
                }
            }
        }

        // 3. Désactiver les overrides d'accès du membre partant
        const overrides = await ctx.db
            .query("cell_access_overrides")
            .withIndex("by_userId", (q) => q.eq("userId", member.userId))
            .collect();
        for (const o of overrides) {
            if (o.organizationId === member.organizationId && o.estActif) {
                await ctx.db.patch(o._id, { estActif: false, updatedAt: now });
            }
        }

        // 4. Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: member.organizationId,
            userId: member.userId,
            action: "member_departed",
            resourceType: "organization",
            resourceId: member.organizationId,
            details: {
                memberName: member.nom,
                reason: args.reason,
                replacedById: args.replacedById,
            },
            createdAt: now,
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.depart",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return args.id;
    },
});

// ─── Bulk assign role/unit to N members ──────

export const bulkAssignRole = mutation({
    args: {
        memberIds: v.array(v.id("organization_members")),
        orgUnitId: v.optional(v.id("org_units")),
        businessRoleId: v.optional(v.id("business_roles")),
    },
    handler: async (ctx, args) => {
        let updated = 0;
        for (const id of args.memberIds) {
            const existing = await ctx.db.get(id);
            if (!existing) continue;

            const patch: Record<string, unknown> = {};
            if (args.orgUnitId !== undefined) patch.orgUnitId = args.orgUnitId;
            if (args.businessRoleId !== undefined) patch.businessRoleId = args.businessRoleId;

            await ctx.db.patch(id, patch);
            updated++;
        }

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.bulkAssignRole",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return { updated };
    },
});

// ─── Set module overrides for a member ───────

const moduleOverridesValidator = v.object({
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
});

export const setModuleOverrides = mutation({
    args: {
        id: v.id("organization_members"),
        overrides: v.optional(moduleOverridesValidator),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Membre introuvable");

        // Pass overrides=undefined to reset all overrides
        await ctx.db.patch(args.id, {
            moduleOverrides: args.overrides,
        });

        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.setModuleOverrides",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return args.id;
    },
});

// ═══════════════════════════════════════════════
// Phase 13: Multi-postes & Affectations
// ═══════════════════════════════════════════════

/** Ajouter une affectation supplémentaire à un membre */
export const addAssignment = mutation({
    args: {
        id: v.id("organization_members"),
        businessRoleId: v.id("business_roles"),
        orgUnitId: v.id("org_units"),
        isPrimary: v.optional(v.boolean()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const member = await ctx.db.get(args.id);
        if (!member) throw new Error("Membre introuvable");

        const now = Date.now();
        const assignments = (member as any).assignments ?? [];

        // Vérifier pas de doublon actif (même role + même unit)
        const duplicate = assignments.find(
            (a: any) =>
                a.businessRoleId === args.businessRoleId &&
                a.orgUnitId === args.orgUnitId &&
                (!a.endDate || a.endDate > now)
        );
        if (duplicate) {
            throw new Error("Cette affectation existe déjà pour ce membre");
        }

        // Si isPrimary, dé-flagguer les autres
        const newAssignments = args.isPrimary
            ? assignments.map((a: any) => ({ ...a, isPrimary: false }))
            : [...assignments];

        newAssignments.push({
            businessRoleId: args.businessRoleId,
            orgUnitId: args.orgUnitId,
            isPrimary: args.isPrimary ?? false,
            startDate: args.startDate ?? now,
            endDate: args.endDate,
        });

        // Recalculer le level = meilleur parmi les affectations actives
        let bestLevel = 5;
        for (const a of newAssignments) {
            if (a.endDate && a.endDate <= now) continue;
            const lvl = await deriveLevelFromBusinessRole(ctx, a.businessRoleId);
            if (lvl < bestLevel) bestLevel = lvl;
        }

        await ctx.db.patch(args.id, {
            assignments: newAssignments,
            level: bestLevel,
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.addAssignment",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return args.id;
    },
});

/** Modifier une affectation existante (dates, isPrimary) */
export const updateAssignment = mutation({
    args: {
        id: v.id("organization_members"),
        index: v.number(), // index de l'affectation dans le tableau
        isPrimary: v.optional(v.boolean()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const member = await ctx.db.get(args.id);
        if (!member) throw new Error("Membre introuvable");

        const assignments = [...((member as any).assignments ?? [])];
        if (args.index < 0 || args.index >= assignments.length) {
            throw new Error("Index d'affectation invalide");
        }

        // Si isPrimary, dé-flagguer les autres
        if (args.isPrimary) {
            for (let i = 0; i < assignments.length; i++) {
                assignments[i] = { ...assignments[i], isPrimary: false };
            }
        }

        const updated = { ...assignments[args.index] };
        if (args.isPrimary !== undefined) updated.isPrimary = args.isPrimary;
        if (args.startDate !== undefined) updated.startDate = args.startDate;
        if (args.endDate !== undefined) updated.endDate = args.endDate;
        assignments[args.index] = updated;

        // Recalculer le level
        const now = Date.now();
        let bestLevel = 5;
        for (const a of assignments) {
            if (a.endDate && a.endDate <= now) continue;
            const lvl = await deriveLevelFromBusinessRole(ctx, a.businessRoleId);
            if (lvl < bestLevel) bestLevel = lvl;
        }

        await ctx.db.patch(args.id, {
            assignments,
            level: bestLevel,
        });


        // NEOCORTEX: signal
        await ctx.scheduler.runAfter(0, internal.visuel.signalEntite, {
            signalType: "CONFIG_MODIFIEE",
            action: "orgMembers.updateAssignment",
            entiteType: "organization_members",
            entiteId: "system",
            userId: "system",
        });
        return args.id;
    },
});

/** Retirer une affectation (par index) */
export const removeAssignment = mutation({
    args: {
        id: v.id("organization_members"),
        index: v.number(),
    },
    handler: async (ctx, args) => {
        const member = await ctx.db.get(args.id);
        if (!member) throw new Error("Membre introuvable");

        const assignments = [...((member as any).assignments ?? [])];
        if (args.index < 0 || args.index >= assignments.length) {
            throw new Error("Index d'affectation invalide");
        }

        assignments.splice(args.index, 1);

        // Recalculer le level
        const now = Date.now();
        let bestLevel = 5;
        for (const a of assignments) {
            if (a.endDate && a.endDate <= now) continue;
            const lvl = await deriveLevelFromBusinessRole(ctx, a.businessRoleId);
            if (lvl < bestLevel) bestLevel = lvl;
        }
        // Inclure aussi le legacy role si présent
        if (member.businessRoleId) {
            const legacyLevel = await deriveLevelFromBusinessRole(ctx, member.businessRoleId);
            if (legacyLevel < bestLevel) bestLevel = legacyLevel;
        }

        await ctx.db.patch(args.id, {
            assignments,
            level: bestLevel,
        });

        return args.id;
    },
});

/** Lister toutes les affectations actives d'un membre */
export const listAssignments = query({
    args: { id: v.id("organization_members") },
    handler: async (ctx, args) => {
        const member = await ctx.db.get(args.id);
        if (!member) return [];

        const now = Date.now();
        const assignments = (member as any).assignments ?? [];

        // Enrichir chaque affectation avec les détails du rôle et de l'unité
        const enriched = [];
        for (const a of assignments) {
            const role = a.businessRoleId
                ? await ctx.db.get(a.businessRoleId) as any
                : null;
            const unit = a.orgUnitId
                ? await ctx.db.get(a.orgUnitId) as any
                : null;
            enriched.push({
                ...a,
                roleName: role?.intitule ?? "—",
                roleCategorie: role?.categorie ?? "—",
                unitName: unit?.nom ?? "—",
                isActive: !a.endDate || a.endDate > now,
            });
        }


        return enriched;
    },
});
