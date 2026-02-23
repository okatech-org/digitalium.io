"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useConvexOrgId
// Resolves the display name from OrganizationContext
// into a real Convex document Id<"organizations">.
// ═══════════════════════════════════════════════

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useOrganization } from "@/contexts/OrganizationContext";

/**
 * Returns the real Convex `_id` for the current organization.
 *
 * The OrganizationContext provides a display name / slug (e.g. "OKA TECH",
 * "ASCOMA Gabon"). This hook resolves that to the Convex document ID so
 * that filing, archive, and access queries can work correctly.
 */
export function useConvexOrgId(): {
    convexOrgId: Id<"organizations"> | undefined;
    isLoading: boolean;
} {
    const { orgName } = useOrganization();

    const org = useQuery(
        api.organizations.getByName,
        orgName ? { name: orgName } : "skip"
    );

    return {
        convexOrgId: (org?._id as Id<"organizations">) ?? undefined,
        isLoading: orgName !== "" && org === undefined,
    };
}
