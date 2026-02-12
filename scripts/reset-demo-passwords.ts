#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Reset Demo Account Passwords via Admin SDK
// Resets all demo accounts to password: demo123456
// Requires: GOOGLE_APPLICATION_CREDENTIALS set in env
// Usage: npx tsx scripts/reset-demo-passwords.ts
// ═══════════════════════════════════════════════════════════════

import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";
import * as path from "path";

// Read project ID from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
let projectId = "";
for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_FIREBASE_PROJECT_ID=")) {
        projectId = trimmed.split("=")[1].trim();
    }
}

// Initialize with application default credentials
if (getApps().length === 0) {
    initializeApp({
        credential: applicationDefault(),
        projectId,
    });
}

const auth = getAuth();

const DEMO_EMAILS = [
    "demo-sysadmin@digitalium.ga",
    "demo-admin@digitalium.ga",
    "ornella.doumba@digitalium.ga",
    "dg@ascoma.ga",
    "commercial@ascoma.ga",
    "sinistres@ascoma.ga",
    "agent@ascoma.ga",
    "juridique@ascoma.ga",
    "ministre-peche@digitalium.io",
    "admin-peche@digitalium.io",
    "dgpa@digitalium.io",
    "anpa@digitalium.io",
    "inspecteur-peche@digitalium.io",
];

const NEW_PASSWORD = "demo123456";

async function main() {
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║  DIGITALIUM — Reset Demo Passwords (Firebase Admin)  ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");

    let success = 0;
    let failed = 0;

    for (const email of DEMO_EMAILS) {
        try {
            const userRecord = await auth.getUserByEmail(email);
            await auth.updateUser(userRecord.uid, { password: NEW_PASSWORD });
            console.log(`  ✅ ${email.padEnd(38)} → mot de passe réinitialisé`);
            success++;
        } catch (err: unknown) {
            const code = (err as { code?: string }).code;
            if (code === "auth/user-not-found") {
                console.log(`  ⚠️  ${email.padEnd(38)} → utilisateur non trouvé`);
            } else {
                console.log(`  ❌ ${email.padEnd(38)} → erreur: ${(err as Error).message}`);
            }
            failed++;
        }
    }

    console.log("\n─────────────────────────────────────────────────");
    console.log(`  ✅ Réinitialisés: ${success}  ❌ Erreurs: ${failed}`);
    console.log("─────────────────────────────────────────────────\n");

    if (failed === 0) {
        console.log("🎉 Tous les mots de passe démo ont été mis à jour !");
        console.log(`   Mot de passe: ${NEW_PASSWORD}\n`);
    }
}

main().catch((err) => {
    console.error("Erreur fatale:", err);
    process.exit(1);
});
