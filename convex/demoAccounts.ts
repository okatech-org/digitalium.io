// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Demo Accounts Query
// Returns organizations with members for the DemoAccountSwitcher
// ═══════════════════════════════════════════════

import { query } from "./_generated/server";

/**
 * Normalize a name to a demo email: "Gueylord Asted PELLEN-LAKOUMA" → "gueylord.pellen-lakouma@digitalium.io"
 */
function generateDemoEmail(nom: string): string {
    // Remove accents
    const normalized = nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Split into parts
    const parts = normalized.trim().split(/\s+/);
    if (parts.length === 0) return "membre@digitalium.io";

    // Use first name + last name (skip middle names)
    const firstName = parts[0].toLowerCase();
    const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

    const email = lastName ? `${firstName}.${lastName}@digitalium.io` : `${firstName}@digitalium.io`;
    // Remove any non-email-safe characters except . - @
    return email.replace(/[^a-z0-9.\-@]/g, "");
}

/**
 * Get all organizations with their members, enriched for demo purposes.
 * Used by the DemoAccountSwitcher to dynamically display org accounts.
 */
export const listDemoOrganizations = query({
    handler: async (ctx) => {
        // Get all non-draft organizations
        const organizations = await ctx.db.query("organizations").order("desc").collect();

        const result = [];

        for (const org of organizations) {
            const members = await ctx.db
                .query("organization_members")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", org._id))
                .collect();

            // Skip orgs with no members
            if (members.length === 0) continue;

            // Enrich members with business role names and demo emails
            const enrichedMembers = [];
            for (const m of members) {
                let businessRoleName: string | null = null;
                if (m.businessRoleId) {
                    const role = await ctx.db.get(m.businessRoleId);
                    businessRoleName = role?.nom ?? null;
                }

                let orgUnitName: string | null = null;
                if (m.orgUnitId) {
                    const unit = await ctx.db.get(m.orgUnitId);
                    orgUnitName = unit?.nom ?? null;
                }

                const demoEmail = generateDemoEmail(m.nom ?? "membre");

                enrichedMembers.push({
                    _id: m._id,
                    nom: m.nom ?? "Sans nom",
                    email: m.email,
                    demoEmail,
                    poste: m.poste,
                    role: m.role,
                    businessRoleName,
                    orgUnitName,
                    status: m.status,
                });
            }

            result.push({
                _id: org._id,
                name: org.name,
                type: org.type,
                sector: org.sector,
                description: org.description,
                status: org.status,
                members: enrichedMembers,
            });
        }

        return result;
    },
});
