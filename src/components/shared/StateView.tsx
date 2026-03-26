"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Component: StateView
// Reusable loading, empty, and error states
// NEXUS-OMEGA M3 Sprint 6 — UX Polish
// ═══════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
    Loader2,
    AlertCircle,
    FileText,
    Inbox,
    RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Loading State ────────────────────────────── */

export function LoadingState({
    message = "Chargement…",
    className = "",
}: {
    message?: string;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col items-center justify-center py-16 ${className}`}
        >
            <Loader2 className="h-8 w-8 animate-spin text-violet-400 mb-3" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </motion.div>
    );
}

/* ─── Skeleton Rows ────────────────────────────── */

export function SkeletonRows({
    count = 4,
    variant = "list",
}: {
    count?: number;
    variant?: "list" | "card" | "table";
}) {
    if (variant === "card") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border border-white/5 animate-pulse space-y-3">
                        <div className="h-4 w-3/4 rounded bg-white/5" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                        <div className="h-8 w-full rounded bg-white/5" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "table") {
        return (
            <div className="space-y-2">
                <div className="flex gap-4 py-2 px-4 border-b border-white/5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-3 flex-1 rounded bg-white/5 animate-pulse" />
                    ))}
                </div>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex gap-4 py-3 px-4 animate-pulse">
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="h-3 flex-1 rounded bg-white/5" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                    <div className="h-10 w-10 rounded-lg bg-white/5" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-48 rounded bg-white/5" />
                        <div className="h-2 w-32 rounded bg-white/5" />
                    </div>
                    <div className="h-5 w-16 rounded-full bg-white/5" />
                </div>
            ))}
        </div>
    );
}

/* ─── Empty State ──────────────────────────────── */

export function EmptyState({
    title = "Aucun élément",
    description = "Commencez en créant un premier élément.",
    icon: IconComponent = Inbox,
    actionLabel,
    onAction,
    actionHref,
    className = "",
}: {
    title?: string;
    description?: string;
    icon?: React.ElementType;
    actionLabel?: string;
    onAction?: () => void;
    actionHref?: string;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center py-16 ${className}`}
        >
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <IconComponent className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center">
                {description}
            </p>
            {actionLabel && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-xs border-white/10 hover:border-violet-500/30"
                    onClick={onAction}
                    {...(actionHref ? { asChild: true } : {})}
                >
                    {actionHref ? (
                        <a href={actionHref}>{actionLabel}</a>
                    ) : (
                        actionLabel
                    )}
                </Button>
            )}
        </motion.div>
    );
}

/* ─── Error State ──────────────────────────────── */

export function ErrorState({
    title = "Erreur de chargement",
    description = "Impossible de charger les données. Veuillez réessayer.",
    onRetry,
    className = "",
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center py-16 ${className}`}
        >
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-7 w-7 text-red-400/60" />
            </div>
            <p className="text-sm font-medium text-red-300">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center">
                {description}
            </p>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-xs border-red-500/20 hover:border-red-500/40 text-red-300"
                    onClick={onRetry}
                >
                    <RefreshCcw className="h-3 w-3 mr-1.5" />
                    Réessayer
                </Button>
            )}
        </motion.div>
    );
}

/* ─── QueryStateView ───────────────────────────── */

/**
 * All-in-one wrapper for Convex query results.
 * Handles loading, empty, and error states automatically.
 *
 * Usage:
 *   const data = useQuery(api.documents.list, { orgId });
 *   <QueryStateView data={data} emptyTitle="Aucun document">
 *       {(items) => <DocumentList items={items} />}
 *   </QueryStateView>
 */
export function QueryStateView<T>({
    data,
    error,
    children,
    loadingMessage,
    emptyTitle,
    emptyDescription,
    emptyIcon,
    emptyActionLabel,
    onEmptyAction,
    skeletonVariant = "list",
    skeletonCount = 4,
}: {
    data: T[] | undefined | null;
    error?: string | null;
    children: (data: T[]) => React.ReactNode;
    loadingMessage?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: React.ElementType;
    emptyActionLabel?: string;
    onEmptyAction?: () => void;
    skeletonVariant?: "list" | "card" | "table";
    skeletonCount?: number;
}) {
    if (error) {
        return <ErrorState description={error} />;
    }

    if (data === undefined || data === null) {
        return <SkeletonRows count={skeletonCount} variant={skeletonVariant} />;
    }

    if (Array.isArray(data) && data.length === 0) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={emptyIcon}
                actionLabel={emptyActionLabel}
                onAction={onEmptyAction}
            />
        );
    }

    return <>{children(data)}</>;
}
