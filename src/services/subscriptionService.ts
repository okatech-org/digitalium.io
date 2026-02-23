// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Services: Subscription Service
// Connecté à Convex via les API queries/mutations
//
// Usage dans un composant React:
//   const sub = useQuery(api.subscriptions.getByOrganizationId, { organizationId });
//   const createSub = useMutation(api.subscriptions.create);
//
// Ce service fournit des helpers pour les contextes non-React.
// ═══════════════════════════════════════════════

import { SUBSCRIPTION_PLANS } from "@/config/constants";

// ─── Types ──────────────────────────────────────

type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";
export type PaymentMethodType = "mobile_money" | "bank_transfer" | "card" | "check" | "simulation";

export interface Subscription {
    _id: string;
    organizationId: string;
    plan: PlanId;
    pricePerUser: number;
    activeUsers: number;
    maxUsers: number;
    modules: {
        iDocument: boolean;
        iArchive: boolean;
        iSignature: boolean;
        iAsted: boolean;
    };
    billingCycle: BillingCycle;
    paymentMethod: PaymentMethodType;
    status: SubscriptionStatus;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    trialEndsAt?: number;
}

// ─── Price Computation ──────────────────────────

const PLAN_PRICING: Record<string, number> = {
    starter: 49000,
    pro: 149000,
    enterprise: 349000,
};

const ANNUAL_DISCOUNT = 0.85; // 15% discount for annual

/**
 * Compute the total subscription cost.
 */
export function computeSubscriptionCost(
    plan: PlanId,
    userCount: number,
    cycle: BillingCycle
): { perUser: number; total: number; period: string } {
    const base = PLAN_PRICING[plan] ?? 49000;
    const multiplier = cycle === "annual" ? ANNUAL_DISCOUNT * 12 : 1;
    const perUser = base;
    const total = Math.round(perUser * userCount * multiplier);
    const period = cycle === "annual" ? "an" : "mois";

    return { perUser, total, period };
}

/**
 * Check if a subscription is still active.
 */
export function isSubscriptionActive(sub: Subscription): boolean {
    if (sub.status === "cancelled") return false;
    if (sub.status === "trial" && sub.trialEndsAt && sub.trialEndsAt < Date.now()) return false;
    if (sub.currentPeriodEnd < Date.now() && sub.status !== "active") return false;
    return true;
}

/**
 * Compute days remaining in the current billing period.
 */
export function daysRemaining(sub: Subscription): number {
    const msRemaining = sub.currentPeriodEnd - Date.now();
    return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}

/**
 * Get plan display info.
 */
export function getPlanInfo(planId: PlanId) {
    return {
        ...SUBSCRIPTION_PLANS[planId],
        pricePerUser: PLAN_PRICING[planId] ?? 49000,
    };
}

/**
 * Get all available plan IDs with labels.
 */
export function getAvailablePlans(): { id: PlanId; label: string; price: number }[] {
    return Object.entries(PLAN_PRICING).map(([id, price]) => ({
        id: id as PlanId,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        price,
    }));
}
