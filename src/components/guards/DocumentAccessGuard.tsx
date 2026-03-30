"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Guard: DocumentAccessGuard
// Wrapper component enforcing document-level permissions
// Uses the 5-level access matrix from cellAccessRules
// ═══════════════════════════════════════════════

import React from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useDocumentAccess, type AccessLevel } from "@/hooks/useDocumentAccess";
import type { Id } from "../../../convex/_generated/dataModel";

interface DocumentAccessGuardProps {
    children: React.ReactNode;
    /** Module à vérifier */
    module: "idocument" | "iarchive" | "isignature" | "dashboard";
    /** Cellule de classement du dossier/document (optionnel si pas de filing cell) */
    filingCellId?: Id<"filing_cells"> | string;
    /** Niveau d'accès minimum requis */
    requiredAccess?: AccessLevel;
    /** Message personnalisé en cas de refus */
    deniedMessage?: string;
    /** Composant de fallback quand accès refusé (au lieu du défaut) */
    fallback?: React.ReactNode;
    /** Si true, affiche juste rien au lieu d'un message d'erreur */
    hideOnDenied?: boolean;
}

export function DocumentAccessGuard({
    children,
    module,
    filingCellId,
    requiredAccess = "lecture",
    deniedMessage,
    fallback,
    hideOnDenied = false,
}: DocumentAccessGuardProps) {
    const access = useDocumentAccess(module, filingCellId);

    // Chargement en cours
    if (access.isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                <span className="ml-2 text-sm text-white/40">
                    Vérification des accès…
                </span>
            </div>
        );
    }

    // Vérifier le module
    if (!access.moduleEnabled) {
        if (hideOnDenied) return null;
        if (fallback) return <>{fallback}</>;
        return <AccessDeniedView message="Ce module n'est pas activé pour votre profil." />;
    }

    // Vérifier le niveau d'accès
    const ACCESS_ORDER: Record<AccessLevel, number> = {
        aucun: 0,
        lecture: 1,
        ecriture: 2,
        gestion: 3,
        admin: 4,
    };

    const currentLevel = ACCESS_ORDER[access.effectiveAccess] ?? 0;
    const requiredLevel = ACCESS_ORDER[requiredAccess] ?? 0;

    if (currentLevel < requiredLevel) {
        if (hideOnDenied) return null;
        if (fallback) return <>{fallback}</>;

        const defaultMessage = requiredAccess === "ecriture"
            ? "Vous n'avez pas les droits de modification sur cet élément."
            : requiredAccess === "gestion"
                ? "Vous n'avez pas les droits de gestion sur cet élément."
                : "Vous n'avez pas accès à cet élément.";

        return <AccessDeniedView message={deniedMessage ?? defaultMessage} />;
    }

    return <>{children}</>;
}

// ─── Access Denied View ─────────────────────────

function AccessDeniedView({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <ShieldAlert className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-white/80 mb-1">
                Accès restreint
            </h3>
            <p className="text-sm text-white/40 text-center max-w-sm">
                {message}
            </p>
        </div>
    );
}
