// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useOrgStructure (v2)
// Queries/mutations pour org_sites, org_units, business_roles
// ═══════════════════════════════════════════════

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useOrgSites(organizationId?: Id<"organizations">) {
    const sites = useQuery(
        api.orgSites.list,
        organizationId ? { organizationId } : "skip"
    );
    const siege = useQuery(
        api.orgSites.getSiege,
        organizationId ? { organizationId } : "skip"
    );

    const createSite = useMutation(api.orgSites.create);
    const updateSite = useMutation(api.orgSites.update);
    const removeSite = useMutation(api.orgSites.remove);
    const setSiege = useMutation(api.orgSites.setSiege);

    return {
        sites: sites ?? [],
        siege: siege ?? null,
        isLoading: sites === undefined,
        createSite,
        updateSite,
        removeSite,
        setSiege,
    };
}

export function useOrgUnits(organizationId?: Id<"organizations">) {
    const units = useQuery(
        api.orgUnits.list,
        organizationId ? { organizationId } : "skip"
    );
    const tree = useQuery(
        api.orgUnits.getTree,
        organizationId ? { organizationId } : "skip"
    );

    const createUnit = useMutation(api.orgUnits.create);
    const updateUnit = useMutation(api.orgUnits.update);
    const removeUnit = useMutation(api.orgUnits.remove);
    const moveUnit = useMutation(api.orgUnits.move);
    const bulkCreateUnits = useMutation(api.orgUnits.bulkCreate);

    return {
        units: units ?? [],
        tree: tree ?? [],
        isLoading: units === undefined,
        createUnit,
        updateUnit,
        removeUnit,
        moveUnit,
        bulkCreateUnits,
    };
}

export function useBusinessRoles(organizationId?: Id<"organizations">) {
    const roles = useQuery(
        api.businessRoles.list,
        organizationId ? { organizationId } : "skip"
    );

    const createRole = useMutation(api.businessRoles.create);
    const updateRole = useMutation(api.businessRoles.update);
    const removeRole = useMutation(api.businessRoles.remove);
    const bulkCreateRoles = useMutation(api.businessRoles.bulkCreate);

    return {
        roles: roles ?? [],
        isLoading: roles === undefined,
        createRole,
        updateRole,
        removeRole,
        bulkCreateRoles,
    };
}
