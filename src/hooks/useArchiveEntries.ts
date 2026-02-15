"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Shared hook for dynamic archive data
// Maps Convex archive records → ArchiveEntry[] for ArchiveCategoryTable
// ═══════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { ArchiveEntry } from "@/components/modules/iarchive/ArchiveCategoryTable";

type ArchiveCategory = "fiscal" | "social" | "legal" | "client" | "vault";

/**
 * Fetches archives for the current organization, filtered by category slug.
 * Maps the Convex records to the ArchiveEntry shape expected by ArchiveCategoryTable.
 */
export function useArchiveEntries(categorySlug: ArchiveCategory): {
    entries: ArchiveEntry[];
    isLoading: boolean;
} {
    const { orgId } = useOrganization();
    const isConvexId = orgId.length > 10;
    const convexOrgId = isConvexId ? (orgId as Id<"organizations">) : undefined;

    const rawArchives = useQuery(
        api.archives.list,
        convexOrgId
            ? { organizationId: convexOrgId, category: categorySlug }
            : "skip"
    );

    const entries = useMemo<ArchiveEntry[]>(() => {
        if (!rawArchives) return [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawArchives.map((a: any) => ({
            id: a._id,
            title: a.title,
            archivedAt: formatDate(a.createdAt),
            expiresAt: a.retentionExpiresAt
                ? a.retentionExpiresAt > 4102444800000 // year 2100 — treat as perpetual
                    ? "∞ Illimité"
                    : formatDate(a.retentionExpiresAt)
                : "—",
            size: formatSize(a.fileSize),
            hash: a.sha256Hash,
            status: mapStatus(a.status, a.retentionExpiresAt),
            certId: a.certificateId ?? "—",
            archivedBy: a.uploadedBy,
        }));
    }, [rawArchives]);

    return {
        entries,
        isLoading: isConvexId && rawArchives === undefined,
    };
}

/* ─── Helpers ────────────────────────────────── */

function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

function mapStatus(
    status: string,
    expiresAt?: number
): "active" | "expiring" | "expired" | "pending" | "destroyed" {
    if (status === "expired") return "expired";
    if (status === "destroyed") return "destroyed";
    if (status === "on_hold") return "pending";
    // Check if close to expiration (within 90 days)
    if (expiresAt) {
        const daysLeft = (expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysLeft <= 0) return "expired";
        if (daysLeft <= 90) return "expiring";
    }
    return "active";
}
