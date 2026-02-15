// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useFilingAccess (v2)
// Résolution d'accès (rôle plateforme × classement)
// ═══════════════════════════════════════════════

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ─── Filing Structures ──────────────────────────

export function useFilingStructures(organizationId?: Id<"organizations">) {
    const structures = useQuery(
        api.filingStructures.list,
        organizationId ? { organizationId } : "skip"
    );
    const activeStructure = useQuery(
        api.filingStructures.getActive,
        organizationId ? { organizationId } : "skip"
    );

    const createStructure = useMutation(api.filingStructures.create);
    const updateStructure = useMutation(api.filingStructures.update);
    const setActiveStructure = useMutation(api.filingStructures.setActive);

    return {
        structures: structures ?? [],
        activeStructure: activeStructure ?? null,
        isLoading: structures === undefined,
        createStructure,
        updateStructure,
        setActiveStructure,
    };
}

// ─── Filing Cells ───────────────────────────────

export function useFilingCells(filingStructureId?: Id<"filing_structures">) {
    const cells = useQuery(
        api.filingCells.list,
        filingStructureId ? { filingStructureId } : "skip"
    );
    const tree = useQuery(
        api.filingCells.getTree,
        filingStructureId ? { filingStructureId } : "skip"
    );

    const createCell = useMutation(api.filingCells.create);
    const updateCell = useMutation(api.filingCells.update);
    const removeCell = useMutation(api.filingCells.remove);
    const bulkCreateCells = useMutation(api.filingCells.bulkCreate);

    return {
        cells: cells ?? [],
        tree: tree ?? [],
        isLoading: cells === undefined,
        createCell,
        updateCell,
        removeCell,
        bulkCreateCells,
    };
}

// ─── Access Rules (Matrice d'accès) ─────────────

export function useAccessRules(organizationId?: Id<"organizations">) {
    const rules = useQuery(
        api.cellAccessRules.listByOrg,
        organizationId ? { organizationId } : "skip"
    );

    const setRule = useMutation(api.cellAccessRules.setRule);
    const removeRule = useMutation(api.cellAccessRules.removeRule);
    const bulkSet = useMutation(api.cellAccessRules.bulkSet);

    return {
        rules: rules ?? [],
        isLoading: rules === undefined,
        setRule,
        removeRule,
        bulkSet,
    };
}

// ─── Access Overrides (Habilitations) ───────────

export function useAccessOverrides(organizationId?: Id<"organizations">) {
    const overrides = useQuery(
        api.cellAccessOverrides.listByOrg,
        organizationId ? { organizationId } : "skip"
    );

    const createOverride = useMutation(api.cellAccessOverrides.createOverride);
    const updateOverride = useMutation(api.cellAccessOverrides.updateOverride);
    const removeOverride = useMutation(api.cellAccessOverrides.removeOverride);
    const deleteOverride = useMutation(api.cellAccessOverrides.deleteOverride);
    const extendExpiration = useMutation(api.cellAccessOverrides.extendExpiration);

    return {
        overrides: overrides ?? [],
        isLoading: overrides === undefined,
        createOverride,
        updateOverride,
        removeOverride,
        deleteOverride,
        extendExpiration,
    };
}

// ─── User Access Resolution ─────────────────────

/**
 * Résout l'accès effectif d'un utilisateur à toutes les cellules.
 * Retourne une map cellId → { effectiveAccess, source }
 */
export function useUserFilingAccess(
    userId?: string,
    organizationId?: Id<"organizations">,
    userEmail?: string,
    displayName?: string,
) {
    const accessList = useQuery(
        api.cellAccessRules.resolveUserAccess,
        userId && organizationId ? { userId, organizationId, userEmail, displayName } : "skip"
    );

    // Construire la map pour lookup rapide
    const accessMap = new Map<
        string,
        {
            cellId: string;
            code: string;
            intitule: string;
            effectiveAccess: string;
            source: string;
            ruleId?: string;
            overrideId?: string;
        }
    >();

    if (accessList) {
        for (const entry of accessList) {
            accessMap.set(entry.cellId, entry);
        }
    }

    return {
        accessList: accessList ?? [],
        accessMap,
        isLoading: accessList === undefined,

        /** Vérifie si l'user a au moins le niveau demandé sur une cellule */
        hasAccess: (cellId: string, minLevel: string = "lecture"): boolean => {
            const entry = accessMap.get(cellId);
            if (!entry) return false;
            const ORDER: Record<string, number> = {
                aucun: 0, lecture: 1, ecriture: 2, gestion: 3, admin: 4,
            };
            return (ORDER[entry.effectiveAccess] ?? 0) >= (ORDER[minLevel] ?? 0);
        },

        /** Filtre les cellules visibles (au moins lecture) */
        visibleCellIds: (accessList ?? [])
            .filter((e) => e.effectiveAccess !== "aucun")
            .map((e) => e.cellId),
    };
}
