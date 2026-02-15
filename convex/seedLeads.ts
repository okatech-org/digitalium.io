import { mutation } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Seed: Leads Pipeline Data
// Populates the leads table with demo prospects
// ═══════════════════════════════════════════════

export const seedLeads = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        // Check if leads already exist
        const existing = await ctx.db.query("leads").first();
        if (existing) {
            console.log("⏭️  Leads already seeded, skipping.");
            return;
        }

        const leads = [
            {
                name: "Ministère de la Santé",
                email: "contact@sante.gouv.ga",
                phone: "+241 01 76 00 00",
                company: "Gouvernement",
                sector: "Gouvernement",
                source: "referral" as const,
                status: "qualified" as const,
                value: 15000000,
                lastContactedAt: now - 2 * DAY,
            },
            {
                name: "CNAMGS",
                email: "direction@cnamgs.ga",
                phone: "+241 01 44 25 00",
                company: "Organisme public",
                sector: "Organisme public",
                source: "salon" as const,
                status: "proposal" as const,
                value: 8500000,
                lastContactedAt: now - 5 * DAY,
            },
            {
                name: "SEEG",
                email: "dsi@seeg.ga",
                phone: "+241 01 76 15 00",
                company: "Entreprise publique",
                sector: "Entreprise publique",
                source: "website" as const,
                status: "negotiation" as const,
                value: 22000000,
                lastContactedAt: now - 1 * DAY,
            },
            {
                name: "Ministère des Pêches",
                email: "sg@peches.gouv.ga",
                phone: "+241 01 72 19 00",
                company: "Gouvernement",
                sector: "Gouvernement",
                source: "referral" as const,
                status: "new" as const,
                value: 5000000,
                lastContactedAt: now - 4 * DAY,
            },
            {
                name: "Banque BGFI",
                email: "it@bgfi.com",
                phone: "+241 01 79 32 00",
                company: "Secteur privé",
                sector: "Secteur privé",
                source: "linkedin" as const,
                status: "qualified" as const,
                value: 35000000,
                lastContactedAt: now - 1 * DAY,
            },
            {
                name: "Gabon Oil Company",
                email: "digital@gabonoil.ga",
                phone: "+241 01 76 88 00",
                company: "Entreprise publique",
                sector: "Entreprise publique",
                source: "salon" as const,
                status: "converted" as const,
                value: 18000000,
                lastContactedAt: now - 10 * DAY,
            },
            {
                name: "ANPI-Gabon",
                email: "info@anpi.ga",
                phone: "+241 01 79 64 00",
                company: "Agence publique",
                sector: "Agence publique",
                source: "website" as const,
                status: "lost" as const,
                value: 6000000,
                lastContactedAt: now - 30 * DAY,
            },
            {
                name: "SOGARA",
                email: "services@sogara.ga",
                phone: "+241 01 55 01 00",
                company: "Entreprise publique",
                sector: "Énergie",
                source: "event" as const,
                status: "contacted" as const,
                value: 12000000,
                lastContactedAt: now - 3 * DAY,
            },
            {
                name: "Comilog (ERAMET)",
                email: "it.gabon@eramet.com",
                phone: "+241 01 66 20 00",
                company: "Secteur privé",
                sector: "Mines",
                source: "referral" as const,
                status: "proposal" as const,
                value: 42000000,
                lastContactedAt: now - 7 * DAY,
            },
            {
                name: "Université Omar Bongo",
                email: "rectorat@uob.ga",
                phone: "+241 01 73 20 54",
                company: "Éducation",
                sector: "Éducation",
                source: "event" as const,
                status: "new" as const,
                value: 3500000,
                lastContactedAt: now - 6 * DAY,
            },
        ];

        for (const lead of leads) {
            await ctx.db.insert("leads", {
                ...lead,
                createdAt: now - Math.floor(Math.random() * 60) * DAY,
                updatedAt: now,
            });
        }

        console.log(`✅ Seeded ${leads.length} leads.`);
    },
});
