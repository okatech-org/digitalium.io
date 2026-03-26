// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useSubscription
// Business subscription management via Convex + dev fallback
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/contexts/FirebaseAuthContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { BusinessSubscription } from "@/types/personas";

/* ─── Dev fallback subscription ─────────────────────────── */

function buildDevSubscription(orgId: string): BusinessSubscription {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return {
        id: "sub_dev_001",
        organizationId: orgId,
        plan: "enterprise",
        status: "active",

        startedAt: new Date("2025-01-01"),
        trialEndsAt: null,
        currentPeriodEnd: periodEnd,

        maxUsers: 50,
        currentUsers: 12,
        modules: ["idocument", "iarchive", "isignature", "iasted"],
        storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB

        pricing: {
            monthly: 500_000, // 500,000 XAF/mois
            annual: 5_000_000, // 5,000,000 XAF/an
        },

        currency: "XAF",
        autoRenew: true,
    };
}

function isDev(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    );
}

/* ─── Hook ──────────────────────────────────────────────── */

export function useSubscription(organizationId?: string) {
    const { user } = useAuthContext();

    const [subscription, setSubscription] =
        useState<BusinessSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resolve orgId from param or first org in user profile
    const orgId = organizationId ?? user?.organizations?.[0]?.id ?? null;

    // Query Convex subscriptions table — skip if no orgId
    const convexSub = useQuery(
        api.subscriptions.getByOrganizationId,
        orgId ? { organizationId: orgId as Id<"organizations"> } : "skip"
    );

    // ── Sync Convex data → local state ──
    useEffect(() => {
        if (!user || !orgId) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        // convexSub is undefined while loading, null if no result
        if (convexSub === undefined) {
            setLoading(true);
            return;
        }

        if (convexSub) {
            // Map Convex row to BusinessSubscription shape
            setSubscription({
                id: convexSub._id,
                organizationId: convexSub.organizationId,
                plan: convexSub.plan,
                status: convexSub.status === "past_due" ? "active" : convexSub.status,

                startedAt: new Date(convexSub.currentPeriodStart),
                trialEndsAt: convexSub.trialEndsAt
                    ? new Date(convexSub.trialEndsAt)
                    : null,
                currentPeriodEnd: new Date(convexSub.currentPeriodEnd),

                maxUsers: convexSub.maxUsers,
                currentUsers: convexSub.activeUsers ?? 0,
                modules: Object.entries(convexSub.modules ?? {})
                    .filter(([, enabled]) => enabled)
                    .map(([name]) => name),
                storageBytes: -1,

                pricing: {
                    monthly: convexSub.pricePerUser ?? 0,
                    annual: (convexSub.pricePerUser ?? 0) * 12 * 0.85,
                },

                currency: "XAF",
                autoRenew: true,
            });
            setError(null);
        } else {
            // No subscription in Convex → use dev fallback
            if (isDev()) {
                setSubscription(buildDevSubscription(orgId));
            } else {
                setSubscription(null);
            }
        }

        setLoading(false);
    }, [user, orgId, convexSub]);

    // ── Derived state ──
    const isActive = subscription?.status === "active";
    const isTrial = subscription?.status === "trial";
    const isExpired = subscription?.status === "expired";
    const isCancelled = subscription?.status === "cancelled";

    const daysRemaining = useMemo(() => {
        if (!subscription) return 0;

        const endDate =
            subscription.status === "trial" && subscription.trialEndsAt
                ? subscription.trialEndsAt
                : subscription.currentPeriodEnd;

        const diff = endDate.getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [subscription]);

    // ── Methods ──
    const canAddUsers = useCallback(
        (count: number): boolean => {
            if (!subscription) return false;
            if (subscription.maxUsers === -1) return true; // unlimited
            return subscription.currentUsers + count <= subscription.maxUsers;
        },
        [subscription]
    );

    const hasModule = useCallback(
        (moduleName: string): boolean => {
            if (!subscription) return false;
            return subscription.modules.includes(moduleName);
        },
        [subscription]
    );

    const getPrice = useCallback((): {
        monthly: number;
        annual: number;
    } => {
        if (!subscription) return { monthly: 0, annual: 0 };
        return subscription.pricing;
    }, [subscription]);

    return useMemo(
        () => ({
            subscription,
            loading,
            error,

            // Status
            isActive,
            isTrial,
            isExpired,
            isCancelled,
            daysRemaining,

            // Methods
            canAddUsers,
            hasModule,
            getPrice,
        }),
        [
            subscription,
            loading,
            error,
            isActive,
            isTrial,
            isExpired,
            isCancelled,
            daysRemaining,
            canAddUsers,
            hasModule,
            getPrice,
        ]
    );
}
