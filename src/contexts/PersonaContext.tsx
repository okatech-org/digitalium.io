"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Context: Persona
// Convex-backed persona resolution with dev fallback
// Exposes: personaType, personaConfig, isLoading, error
// Methods: setPersona(), getRedirectUrl()
// ═══════════════════════════════════════════════════════════

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import type { PersonaType, PersonaConfig } from "@/types/personas";
import { PERSONAS } from "@/config/personas";
import { useAuthContext } from "@/contexts/FirebaseAuthContext";

/* ─── Dev fallback: email → persona mapping ──────────── */

const DEV_EMAIL_PERSONAS: Record<string, PersonaType> = {
    // System/Platform admins → no persona (they use admin spaces)
    "demo-sysadmin@digitalium.ga": "business",
    "demo-admin@digitalium.ga": "business",
    "ornella.doumba@digitalium.ga": "institutional",
    "rodrigues.ntoutoum@digitalium.ga": "business",
    // Business users
    "dg@ascoma.ga": "business",
    "commercial@ascoma.ga": "business",
    "sinistres@ascoma.ga": "business",
    "agent@ascoma.ga": "business",
    "juridique@ascoma.ga": "business",
};

function isDev(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    );
}

/* ─── Context type ──────────────────────────────────────── */

interface PersonaContextType {
    // State
    personaType: PersonaType | null;
    personaConfig: PersonaConfig | null;
    isLoading: boolean;
    error: string | null;

    // Methods
    setPersona: (type: PersonaType) => Promise<void>;
    getRedirectUrl: () => string;

    // Legacy compat
    activePersona: PersonaType | null;
    setActivePersona: (persona: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

/* ─── Provider ──────────────────────────────────────────── */

export function PersonaProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuthContext();

    const [personaType, setPersonaType] = useState<PersonaType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Resolve persona from user profile or dev fallback ──
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setPersonaType(null);
            setIsLoading(false);
            return;
        }

        // Derive persona from user profile or dev mapping
        const derived = derivePersona();
        setPersonaType(derived);
        setIsLoading(false);

        function derivePersona(): PersonaType {
            // Check user's personaType from auth profile
            if (user!.personaType) return user!.personaType;

            // Dev email mapping
            if (isDev() && user!.email) {
                const mapped = DEV_EMAIL_PERSONAS[user!.email.toLowerCase()];
                if (mapped) return mapped;
            }

            // Default
            return "business";
        }
    }, [user, authLoading]);

    // ── Set persona (persisted in local state, will be synced to Convex users table in production) ──
    const setPersona = useCallback(
        async (type: PersonaType) => {
            if (!user) return;

            setPersonaType(type);

            // In production, this would call a Convex mutation to persist:
            // await updatePersonaTypeMutation({ userId: user.uid, personaType: type });
            // For now, persona is derived from user profile + dev fallback.
            try {
                if (typeof window !== "undefined") {
                    localStorage.setItem(`digitalium_persona_${user.uid}`, type);
                }
            } catch (err) {
                console.warn("[PersonaContext] Failed to persist persona", err);
            }
        },
        [user]
    );

    // ── Get redirect URL for current persona ──
    const getRedirectUrl = useCallback((): string => {
        if (!personaType) return "/onboarding";
        const config = PERSONAS[personaType];
        if (!config) return "/onboarding";
        return config.route;
    }, [personaType]);

    // ── Derived config ──
    const personaConfig = useMemo(
        () => (personaType ? PERSONAS[personaType] ?? null : null),
        [personaType]
    );

    // ── Legacy compat ──
    const setActivePersona = useCallback(
        (persona: PersonaType) => {
            setPersona(persona);
        },
        [setPersona]
    );

    const value = useMemo<PersonaContextType>(
        () => ({
            personaType,
            personaConfig,
            isLoading: authLoading || isLoading,
            error,
            setPersona,
            getRedirectUrl,
            // Legacy
            activePersona: personaType,
            setActivePersona,
        }),
        [
            personaType,
            personaConfig,
            authLoading,
            isLoading,
            error,
            setPersona,
            getRedirectUrl,
            setActivePersona,
        ]
    );

    return (
        <PersonaContext.Provider value={value}>
            {children}
        </PersonaContext.Provider>
    );
}

/* ─── Consumer hook ────────────────────────────────────── */

export function usePersonaContext() {
    const context = useContext(PersonaContext);
    if (!context) {
        throw new Error("usePersonaContext must be used within PersonaProvider");
    }
    return context;
}

export default PersonaContext;
