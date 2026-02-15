"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Context: Persona
// Supabase-backed persona resolution with dev fallback
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
import { supabase } from "@/lib/supabase";
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

    // ── Fetch persona from Supabase on auth change ──
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setPersonaType(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchPersona() {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Try Supabase
                const { data, error: sbError } = await supabase
                    .from("user_personas")
                    .select("persona_type")
                    .eq("user_id", user!.uid)
                    .maybeSingle();

                if (!cancelled) {
                    if (sbError) throw sbError;

                    if (data?.persona_type) {
                        setPersonaType(data.persona_type as PersonaType);
                    } else {
                        // 2. Fallback: derive from auth user
                        const derived = derivePersona();
                        setPersonaType(derived);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.warn(
                        "[PersonaContext] Supabase unavailable, using fallback",
                        err
                    );
                    // 3. Dev fallback
                    const derived = derivePersona();
                    setPersonaType(derived);
                    if (!isDev()) {
                        setError("Impossible de charger le persona.");
                    }
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        function derivePersona(): PersonaType {
            // Check user's personaType from auth
            if (user!.personaType) return user!.personaType;

            // Dev email mapping
            if (isDev() && user!.email) {
                const mapped = DEV_EMAIL_PERSONAS[user!.email.toLowerCase()];
                if (mapped) return mapped;
            }

            // Default
            return "business";
        }

        fetchPersona();

        return () => {
            cancelled = true;
        };
    }, [user, authLoading]);

    // ── Set persona (upsert to Supabase) ──
    const setPersona = useCallback(
        async (type: PersonaType) => {
            if (!user) return;

            setPersonaType(type);

            try {
                await supabase.from("user_personas").upsert(
                    {
                        user_id: user.uid,
                        persona_type: type,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" }
                );
            } catch (err) {
                console.warn("[PersonaContext] Failed to persist persona", err);
                // State is already updated locally — silent fail
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
