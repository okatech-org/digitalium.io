// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Services: Institutional License
// Helpers pour les licences institutionnelles
//
// Usage dans un composant React:
//   const sub = useQuery(api.subscriptions.getByOrganizationId, { organizationId });
//   // Les licences institutionnelles sont des subscriptions de type "enterprise"
//   // avec orgType === "institution" | "government"
// ═══════════════════════════════════════════════

// ─── Types ──────────────────────────────────────

export type LicenseType = "standard" | "premium" | "sovereign";

export interface InstitutionalLicense {
    organizationId: string;
    organizationName: string;
    licenseType: LicenseType;
    userCap: number;
    modules: string[];
    startDate: number;
    endDate: number;
    status: "active" | "expired" | "suspended";
}

// ─── License Tier Config ────────────────────────

export const LICENSE_TIERS: Record<LicenseType, {
    label: string;
    maxUsers: number;
    modules: string[];
    features: string[];
    priceAnnual: number; // XAF / an
}> = {
    standard: {
        label: "Standard Institutionnel",
        maxUsers: 50,
        modules: ["iDocument", "iArchive"],
        features: [
            "Gestion documentaire",
            "Archivage légal OHADA",
            "Support email",
        ],
        priceAnnual: 2_400_000, // 2.4M XAF / an
    },
    premium: {
        label: "Premium Institutionnel",
        maxUsers: 200,
        modules: ["iDocument", "iArchive", "iSignature"],
        features: [
            "Tout Standard +",
            "Signature électronique",
            "Workflows d'approbation",
            "Support prioritaire",
        ],
        priceAnnual: 6_000_000, // 6M XAF / an
    },
    sovereign: {
        label: "Souverain (Gouvernement)",
        maxUsers: 1000,
        modules: ["iDocument", "iArchive", "iSignature", "iAsted"],
        features: [
            "Tout Premium +",
            "iAsted (IA Juridique)",
            "Hébergement datacenter local",
            "Audit de conformité",
            "SLA 99.9%",
            "Support dédié 24/7",
        ],
        priceAnnual: 18_000_000, // 18M XAF / an
    },
};

// ─── Helpers ────────────────────────────────────

/**
 * Get the license tier info for a given type.
 */
export function getLicenseTier(type: LicenseType) {
    return LICENSE_TIERS[type];
}

/**
 * Check if a license is still active.
 */
export function isLicenseActive(license: InstitutionalLicense): boolean {
    if (license.status === "suspended") return false;
    if (license.endDate < Date.now()) return false;
    return true;
}

/**
 * Compute days remaining on a license.
 */
export function licenseDaysRemaining(license: InstitutionalLicense): number {
    const msRemaining = license.endDate - Date.now();
    return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}

/**
 * Map a subscription to an InstitutionalLicense.
 * In DIGITALIUM.IO, institutional licenses are enterprise subscriptions
 * for organizations of type "institution" or "government".
 */
export function subscriptionToLicense(
    sub: { plan: string; maxUsers: number; currentPeriodStart: number; currentPeriodEnd: number; status: string; modules: Record<string, boolean> },
    orgName: string,
    orgId: string,
): InstitutionalLicense {
    const licenseType: LicenseType =
        sub.plan === "enterprise" ? "sovereign" :
            sub.plan === "pro" ? "premium" : "standard";

    return {
        organizationId: orgId,
        organizationName: orgName,
        licenseType,
        userCap: sub.maxUsers,
        modules: Object.entries(sub.modules)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key),
        startDate: sub.currentPeriodStart,
        endDate: sub.currentPeriodEnd,
        status: sub.status === "active" ? "active" :
            sub.status === "suspended" ? "suspended" : "expired",
    };
}

/**
 * Get all license types for display.
 */
export function getAvailableLicenseTypes(): { type: LicenseType; label: string; price: number }[] {
    return Object.entries(LICENSE_TIERS).map(([type, tier]) => ({
        type: type as LicenseType,
        label: tier.label,
        price: tier.priceAnnual,
    }));
}
