#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Seed Demo Accounts in Firebase Auth
// Creates all demo users using the Firebase REST Auth API
// Usage: npx tsx scripts/seed-demo-accounts.ts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
}

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!API_KEY) {
    console.error("❌ NEXT_PUBLIC_FIREBASE_API_KEY non trouvée dans .env.local");
    process.exit(1);
}

const SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

interface DemoAccount {
    email: string;
    password: string;
    displayName: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
    // ── DIGITALIUM Platform ──
    {
        email: "demo-sysadmin@digitalium.ga",
        password: "demo123456",
        displayName: "System Admin (Démo)",
    },
    {
        email: "demo-admin@digitalium.ga",
        password: "demo123456",
        displayName: "Platform Admin (Démo)",
    },
    {
        email: "ornella.doumba@digitalium.ga",
        password: "demo123456",
        displayName: "Ornella Doumba",
    },

    // ── ASCOMA GABON ──
    {
        email: "dg@ascoma.ga",
        password: "demo123456",
        displayName: "Directeur Général ASCOMA",
    },
    {
        email: "commercial@ascoma.ga",
        password: "demo123456",
        displayName: "Resp. Commercial ASCOMA",
    },
    {
        email: "sinistres@ascoma.ga",
        password: "demo123456",
        displayName: "Resp. Sinistres ASCOMA",
    },
    {
        email: "agent@ascoma.ga",
        password: "demo123456",
        displayName: "Agent ASCOMA",
    },
    {
        email: "juridique@ascoma.ga",
        password: "demo123456",
        displayName: "Juridique ASCOMA",
    },

    // ── MINISTÈRE DE LA PÊCHE ──
    {
        email: "ministre-peche@digitalium.io",
        password: "demo123456",
        displayName: "Ministre de la Pêche",
    },
    {
        email: "admin-peche@digitalium.io",
        password: "demo123456",
        displayName: "Admin Pêche (Co-admin)",
    },
    {
        email: "dgpa@digitalium.io",
        password: "demo123456",
        displayName: "DGPA — Direction Générale",
    },
    {
        email: "anpa@digitalium.io",
        password: "demo123456",
        displayName: "ANPA — Agence Nationale",
    },
    {
        email: "inspecteur-peche@digitalium.io",
        password: "demo123456",
        displayName: "Inspecteur de terrain",
    },
];

async function createAccount(account: DemoAccount): Promise<string> {
    const res = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: account.email,
            password: account.password,
            displayName: account.displayName,
            returnSecureToken: true,
        }),
    });

    if (res.ok) {
        const data = await res.json();
        // Update displayName via update profile endpoint
        const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`;
        await fetch(updateUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idToken: data.idToken,
                displayName: account.displayName,
                returnSecureToken: false,
            }),
        });
        return "✅ créé";
    }

    const error = await res.json();
    const errorMessage = error?.error?.message ?? "UNKNOWN";

    if (errorMessage === "EMAIL_EXISTS") {
        return "⏭️  existe déjà";
    }

    return `❌ erreur: ${errorMessage}`;
}

async function main() {
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║  DIGITALIUM — Seed Demo Accounts (Firebase Auth) ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log(`\nAPI Key: ${API_KEY!.slice(0, 10)}…`);
    console.log(`Comptes à créer: ${DEMO_ACCOUNTS.length}\n`);

    let created = 0;
    let existed = 0;
    let failed = 0;

    for (const account of DEMO_ACCOUNTS) {
        const status = await createAccount(account);

        if (status.includes("créé")) created++;
        else if (status.includes("existe")) existed++;
        else failed++;

        const padded = account.email.padEnd(38);
        console.log(`  ${padded} ${status}`);
    }

    console.log("\n─────────────────────────────────────────────────");
    console.log(`  ✅ Créés: ${created}  ⏭️  Existants: ${existed}  ❌ Erreurs: ${failed}`);
    console.log("─────────────────────────────────────────────────\n");

    if (failed > 0) {
        console.log("⚠️  Certains comptes n'ont pas pu être créés.");
        console.log("   Vérifiez que le provider Email/Password est activé dans");
        console.log("   Firebase Console → Authentication → Sign-in method\n");
        process.exit(1);
    }

    console.log("🎉 Tous les comptes démo sont prêts !");
    console.log("   Utilisez le DemoAccountSwitcher pour vous connecter.\n");
}

main().catch((err) => {
    console.error("Erreur fatale:", err);
    process.exit(1);
});
