// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: usePersona
// Full persona access with module checks & routing
// ═══════════════════════════════════════════════

"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePersonaContext } from "@/contexts/PersonaContext";
import type { PersonaConfig, ModuleConfig } from "@/types/personas";
import { AVAILABLE_MODULES } from "@/types/personas";

export function usePersona() {
    const ctx = usePersonaContext();
    const router = useRouter();

    // ── Full persona config ──
    const persona: PersonaConfig | null = ctx.personaConfig;

    // ── Check if the current persona grants access to a module ──
    const canAccessModule = useCallback(
        (moduleName: string): boolean => {
            if (!persona) return false;
            return persona.features.modules.includes(moduleName);
        },
        [persona]
    );

    // ── Get all modules available to the current persona ──
    const getAvailableModules = useCallback((): ModuleConfig[] => {
        if (!persona) return [];
        return AVAILABLE_MODULES.filter((m) =>
            persona.features.modules.includes(m.id)
        );
    }, [persona]);

    // ── Navigate to the persona's home route ──
    const redirectToPersonaHome = useCallback(() => {
        const url = ctx.getRedirectUrl();
        if (url.startsWith("http")) {
            window.location.href = url;
        } else {
            router.push(url);
        }
    }, [ctx, router]);

    // ── Convenience booleans ──
    const isCitizen = ctx.personaType === "citizen";
    const isEnterprise = ctx.personaType === "business";
    const isInstitution = ctx.personaType === "institutional";

    return useMemo(
        () => ({
            // State
            persona,
            personaType: ctx.personaType,
            isLoading: ctx.isLoading,
            error: ctx.error,

            // Methods
            setPersona: ctx.setPersona,
            canAccessModule,
            getAvailableModules,
            redirectToPersonaHome,
            getRedirectUrl: ctx.getRedirectUrl,

            // Convenience
            isCitizen,
            isEnterprise,
            isInstitution,

            // Legacy compat
            activePersona: ctx.activePersona,
            personaConfig: ctx.personaConfig,
            setActivePersona: ctx.setActivePersona,
        }),
        [
            persona,
            ctx,
            canAccessModule,
            getAvailableModules,
            redirectToPersonaHome,
            isCitizen,
            isEnterprise,
            isInstitution,
        ]
    );
}
