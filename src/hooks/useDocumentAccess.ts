"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useDocumentAccess
// Résolution d'accès au niveau document/dossier
// Consomme la matrice 5 niveaux via useUserFilingAccess
// + modulePermissions du rôle métier
// + moduleOverrides du membre
// ═══════════════════════════════════════════════

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./useAuth";
import { useConvexOrgId } from "./useConvexOrgId";
import { useUserFilingAccess } from "./useFilingAccess";

// ─── Types ──────────────────────────────────────

export type AccessLevel = "aucun" | "lecture" | "ecriture" | "gestion" | "admin";

const ACCESS_ORDER: Record<AccessLevel, number> = {
    aucun: 0,
    lecture: 1,
    ecriture: 2,
    gestion: 3,
    admin: 4,
};

export interface DocumentAccessResult {
    /** Niveau d'accès effectif résolu */
    effectiveAccess: AccessLevel;
    /** L'utilisateur peut au moins lire */
    canRead: boolean;
    /** L'utilisateur peut écrire/modifier */
    canWrite: boolean;
    /** L'utilisateur peut supprimer */
    canDelete: boolean;
    /** L'utilisateur peut gérer (permissions, partage) */
    canManage: boolean;
    /** L'utilisateur est admin sur cette cellule */
    isAdmin: boolean;
    /** Le module spécifique est-il accessible ? */
    moduleEnabled: boolean;
    /** Données en cours de chargement */
    isLoading: boolean;
    /** Source de la résolution (bypass, rule, override, none) */
    source: string;
}

// ─── Hook principal ─────────────────────────────

/**
 * Résout l'accès d'un utilisateur à un document ou dossier,
 * en combinant :
 * 1. La cellule de classement (filing cell) du dossier parent
 * 2. Les modulePermissions du rôle métier
 * 3. Les moduleOverrides du membre
 *
 * @param module - Le module concerné ('idocument' | 'iarchive' | 'isignature')
 * @param filingCellId - L'ID de la cellule de classement (optionnel)
 */
export function useDocumentAccess(
    module: "idocument" | "iarchive" | "isignature" | "dashboard",
    filingCellId?: Id<"filing_cells"> | string,
): DocumentAccessResult {
    const { user } = useAuth();
    const userId = user?.uid;
    const { convexOrgId, isLoading: orgLoading } = useConvexOrgId();

    // 1. Résoudre l'accès aux cellules de classement
    const { accessMap, isLoading: accessLoading } = useUserFilingAccess(
        userId,
        convexOrgId,
    );

    // 2. Charger le membre pour moduleOverrides + businessRole
    const members = useQuery(
        api.orgMembers.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    const isLoading = orgLoading || accessLoading || members === undefined;

    // Par défaut : aucun accès
    const DEFAULT_RESULT: DocumentAccessResult = {
        effectiveAccess: "aucun",
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManage: false,
        isAdmin: false,
        moduleEnabled: false,
        isLoading,
        source: "none",
    };

    if (isLoading || !userId || !convexOrgId) {
        return { ...DEFAULT_RESULT, isLoading };
    }

    // Trouver le membre courant
    const currentMember = (members ?? []).find(
        (m) => m.userId === userId || m.email === userId
    );

    if (!currentMember) {
        return DEFAULT_RESULT;
    }

    // 3. Vérifier l'accès au module
    const memberOverrides = currentMember.moduleOverrides as Record<string, boolean | undefined> | undefined;
    const hasModuleOverride = memberOverrides?.[module];

    // Si override explicite sur le membre
    let moduleEnabled = true;
    if (hasModuleOverride !== undefined) {
        moduleEnabled = hasModuleOverride;
    }
    // Sinon, si pas d'override, on ne bloque pas (le module est accessible par défaut)

    if (!moduleEnabled) {
        return {
            ...DEFAULT_RESULT,
            moduleEnabled: false,
            source: "module_disabled",
        };
    }

    // 4. Admins — bypass complet
    const isAdmin = currentMember.estAdmin === true
        || ["system_admin", "platform_admin"].includes(currentMember.role);

    if (isAdmin) {
        return {
            effectiveAccess: "admin",
            canRead: true,
            canWrite: true,
            canDelete: true,
            canManage: true,
            isAdmin: true,
            moduleEnabled: true,
            isLoading: false,
            source: "bypass",
        };
    }

    // 5. Si pas de cellule de classement spécifique, accorder lecture par défaut
    if (!filingCellId) {
        return {
            effectiveAccess: "lecture",
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManage: false,
            isAdmin: false,
            moduleEnabled: true,
            isLoading: false,
            source: "default",
        };
    }

    // 6. Résoudre via la matrice d'accès
    const cellAccess = accessMap.get(filingCellId as string);
    const effectiveAccess = (cellAccess?.effectiveAccess ?? "aucun") as AccessLevel;
    const level = ACCESS_ORDER[effectiveAccess] ?? 0;

    return {
        effectiveAccess,
        canRead: level >= ACCESS_ORDER.lecture,
        canWrite: level >= ACCESS_ORDER.ecriture,
        canDelete: level >= ACCESS_ORDER.gestion,
        canManage: level >= ACCESS_ORDER.gestion,
        isAdmin: level >= ACCESS_ORDER.admin,
        moduleEnabled: true,
        isLoading: false,
        source: cellAccess?.source ?? "none",
    };
}
