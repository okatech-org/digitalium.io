// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Generate Demo Firebase Accounts
// Creates Firebase Auth accounts for organization members
// ═══════════════════════════════════════════════

"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

/**
 * Normalize a name to a demo email: "Gueylord Asted PELLEN-LAKOUMA" → "gueylord.pellen-lakouma@digitalium.io"
 */
function generateDemoEmail(nom: string): string {
    const normalized = nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const parts = normalized.trim().split(/\s+/);
    if (parts.length === 0) return "membre@digitalium.io";

    const firstName = parts[0].toLowerCase();
    const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

    const email = lastName ? `${firstName}.${lastName}@digitalium.io` : `${firstName}@digitalium.io`;
    return email.replace(/[^a-z0-9.\-@]/g, "");
}

const DEFAULT_PASSWORD = "demo123456";

/**
 * Create a single Firebase Auth account via REST API.
 * Returns true if created, false if already exists.
 */
async function createFirebaseAccount(
    apiKey: string,
    email: string,
    password: string,
    displayName: string
): Promise<{ created: boolean; error?: string }> {
    try {
        const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    displayName,
                    returnSecureToken: false,
                }),
            }
        );

        if (res.ok) {
            return { created: true };
        }

        const data = await res.json();
        const errorMessage = data?.error?.message ?? "Unknown error";

        if (errorMessage === "EMAIL_EXISTS") {
            return { created: false };
        }

        return { created: false, error: errorMessage };
    } catch (err: unknown) {
        return { created: false, error: String(err) };
    }
}

/**
 * Generate Firebase demo accounts for all members of an organization.
 * Call this after adding members to an organization.
 */

interface DemoAccountResult {
    nom: string;
    email: string;
    created: boolean;
    error?: string;
}

interface GenerateResult {
    organizationName: string;
    total: number;
    created: number;
    existing: number;
    errors: DemoAccountResult[];
    accounts: DemoAccountResult[];
}

export const generateForOrganization = action({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args): Promise<GenerateResult> => {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!apiKey) {
            throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set in Convex environment");
        }

        // Get organization info
        const org = await ctx.runQuery(
            api.organizations.getById,
            { id: args.organizationId }
        );
        if (!org) throw new Error("Organisation introuvable");

        // Get all members
        const members = await ctx.runQuery(
            api.orgMembers.list,
            { organizationId: args.organizationId }
        );

        const results: DemoAccountResult[] = [];

        for (const member of members) {
            const nom = member.nom ?? "Membre";
            const demoEmail = generateDemoEmail(nom);

            const result = await createFirebaseAccount(
                apiKey,
                demoEmail,
                DEFAULT_PASSWORD,
                nom
            );

            results.push({
                nom,
                email: demoEmail,
                created: result.created,
                error: result.error,
            });
        }

        return {
            organizationName: org.name,
            total: results.length,
            created: results.filter((r) => r.created).length,
            existing: results.filter((r) => !r.created && !r.error).length,
            errors: results.filter((r) => r.error),
            accounts: results,
        };
    },
});
