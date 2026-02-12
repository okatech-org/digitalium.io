// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Services: Subscription Service
// ═══════════════════════════════════════════════

import { SUBSCRIPTION_PLANS } from "@/config/constants";

type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export interface Subscription {
    userId: string;
    planId: PlanId;
    status: "active" | "cancelled" | "expired" | "trial";
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
}

export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
    // TODO: Fetch from Convex or Supabase
    return null;
}

export async function createSubscription(
    userId: string,
    planId: PlanId
): Promise<Subscription> {
    // TODO: Create subscription via payment provider
    const now = new Date();
    return {
        userId,
        planId,
        status: "active",
        startDate: now,
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
        autoRenew: true,
    };
}

export async function cancelSubscription(userId: string): Promise<void> {
    // TODO: Cancel subscription
    console.log("Cancelling subscription for:", userId);
}

export function getPlanLimits(planId: PlanId) {
    return SUBSCRIPTION_PLANS[planId];
}
