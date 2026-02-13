// ══════════════════════════════════════════════════════════
// MIGRATION SCRIPT: Cloud SQL -> Convex
// ══════════════════════════════════════════════════════════

import { Pool } from "pg";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

import * as path from "path";

// Load environment variables from .env.migration
dotenv.config({ path: path.resolve(process.cwd(), ".env.migration") });

// 1. CONFIGURATION
const PG_CONFIG = {
    host: process.env.PG_HOST || "35.187.174.19", // IP Cloud SQL
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || "digitalium",
    port: 5432,
    ssl: { rejectUnauthorized: false }, // Cloud SQL requires SSL usually
};

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) throw new Error("NEXT_PUBLIC_CONVEX_URL is missing");

const convex = new ConvexHttpClient(CONVEX_URL);
const pool = new Pool(PG_CONFIG);

async function migrateUsers() {
    console.log("🚀 Starting migration: Users...");
    try {
        const { rows } = await pool.query("SELECT * FROM users");
        console.log(`Found ${rows.length} users to migrate.`);

        for (const user of rows) {
            const convexUser = {
                userId: user.uid || user.id,
                email: user.email,
                displayName: user.display_name || user.name,
                avatarUrl: user.photo_url || user.avatar_url,
            };

            await convex.mutation(api.users.migrateUser, convexUser);
            console.log(`✅ Migrated user: ${user.email}`);
        }
    } catch (err) {
        console.error("❌ Error migrating users:", err);
        throw err;
    }
}

async function migrateOrganizations() {
    console.log("🚀 Starting migration: Organizations...");
    try {
        // Supposons que la table s'appelle 'organizations' ou 'orgs'
        // On va essayer d'abord 'organizations'
        const { rows } = await pool.query("SELECT * FROM organizations");
        console.log(`Found ${rows.length} organizations to migrate.`);

        for (const org of rows) {
            const convexOrg = {
                orgId: org.id || org.uid,
                name: org.name,
                domain: org.domain,
                logoUrl: org.logo_url,
            };

            await convex.mutation(api.organizations.migrateOrganization, convexOrg);
            console.log(`✅ Migrated organization: ${org.name}`);
        }
    } catch (err: any) {
        console.warn("⚠️ Error migrating organizations (table might not exist):", err.message);
    }
}

async function main() {
    try {
        await migrateUsers();
        await migrateOrganizations();
        // Add other tables: documents, archives, etc.

        console.log("✅ Migration completed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await pool.end();
    }
}

main();
