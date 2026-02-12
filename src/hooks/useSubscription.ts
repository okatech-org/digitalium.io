// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useSubscription
// Business subscription management with Supabase + dev fallback
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/contexts/FirebaseAuthContext";
import { supabase } from "@/lib/supabase";
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

    // ── Fetch subscription ──
    useEffect(() => {
        if (!user || !orgId) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchSubscription() {
            setLoading(true);
            setError(null);

            try {
                const { data, error: sbError } = await supabase
                    .from("org_subscriptions")
                    .select("*")
                    .eq("organization_id", orgId!)
                    .maybeSingle();

                if (!cancelled) {
                    if (sbError) throw sbError;

                    if (data) {
                        setSubscription({
                            id: data.id,
                            organizationId: data.organization_id,
                            plan: data.plan,
                            status: data.status,
                            startedAt: new Date(data.started_at),
                            trialEndsAt: data.trial_ends_at
                                ? new Date(data.trial_ends_at)
                                : null,
                            currentPeriodEnd: new Date(data.current_period_end),
                            maxUsers: data.max_users,
                            currentUsers: data.current_users ?? 0,
                            modules: data.modules ?? [],
                            storageBytes: data.storage_bytes ?? -1,
                            pricing: {
                                monthly: data.price_monthly ?? 0,
                                annual: data.price_annual ?? 0,
                            },
                            currency: data.currency ?? "XAF",
                            autoRenew: data.auto_renew ?? true,
                        });
                    } else {
                        // No subscription row → use dev fallback
                        if (isDev()) {
                            setSubscription(buildDevSubscription(orgId!));
                        } else {
                            setSubscription(null);
                        }
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.warn(
                        "[useSubscription] Supabase unavailable, using fallback",
                        err
                    );
                    if (isDev()) {
                        setSubscription(buildDevSubscription(orgId!));
                    } else {
                        setError("Impossible de charger l'abonnement.");
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchSubscription();

        return () => {
            cancelled = true;
        };
    }, [user, orgId]);

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
