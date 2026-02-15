// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Organization Members
// CRUD pour la gestion du personnel
// ═══════════════════════════════════════════════

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const memberRole = v.union(
    v.literal("org_admin"),
    v.literal("org_manager"),
    v.literal("org_member"),
    v.literal("org_viewer")
);

type MemberRole = "org_admin" | "org_manager" | "org_member" | "org_viewer";

/** Map system role to numeric level (lower = more privileged) */
function roleToLevel(role: MemberRole): number {
    switch (role) {
        case "org_admin": return 2;
        case "org_manager": return 3;
        case "org_member": return 4;
        case "org_viewer": return 5;
        default: return 4;
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
        role: v.optional(memberRole),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const role: MemberRole = args.role ?? "org_member";
        return await ctx.db.insert("organization_members", {
            organizationId: args.organizationId,
            userId: args.userId ?? args.email ?? `member_${now}`,
            nom: args.nom,
            email: args.email,
            telephone: args.telephone,
            poste: args.poste,
            orgUnitId: args.orgUnitId,
            businessRoleId: args.businessRoleId,
            role,
            level: roleToLevel(role),
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
            role: v.optional(memberRole),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let count = 0;
        for (const m of args.members) {
            const role: MemberRole = m.role ?? "org_member";
            await ctx.db.insert("organization_members", {
                organizationId: args.organizationId,
                userId: m.email ?? `member_${now}_${count}`,
                nom: m.nom,
                email: m.email,
                telephone: m.telephone,
                poste: m.poste,
                orgUnitId: m.orgUnitId,
                businessRoleId: m.businessRoleId,
                role,
                level: roleToLevel(role),
                status: m.email ? "invited" : "active",
                joinedAt: now,
            });
            count++;
        }
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
        role: v.optional(memberRole),
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
        if (args.businessRoleId !== undefined) patch.businessRoleId = args.businessRoleId;
        if (args.role !== undefined) {
            patch.role = args.role;
            patch.level = roleToLevel(args.role as MemberRole);
        }

        await ctx.db.patch(args.id, patch);
        return args.id;
    },
});

// ─── Remove a member ─────────────────────────

export const remove = mutation({
    args: { id: v.id("organization_members") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Membre introuvable");
        await ctx.db.delete(args.id);
        return args.id;
    },
});
