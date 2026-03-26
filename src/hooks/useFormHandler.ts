// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useFormHandler
// 8-step mutation handler pattern for forms
// NEXUS-OMEGA M3 Sprint 6 — UX Polish
// ═══════════════════════════════════════════════

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";

export type FormStatus = "idle" | "loading" | "success" | "error";

export interface FormHandlerOptions<TArgs extends Record<string, unknown>> {
    /** The Convex mutation to call */
    mutation: FunctionReference<"mutation", "public", TArgs, any>;
    /** Validation function — return error message or null */
    validate?: (args: TArgs) => string | null;
    /** Success callback */
    onSuccess?: (result: any) => void;
    /** Error callback */
    onError?: (error: string) => void;
    /** Auto-dismiss success after ms (default: 3000) */
    successDismissMs?: number;
}

/**
 * useFormHandler — Implements the NEXUS 8-step handler pattern:
 * 1. Reset error
 * 2. Set loading
 * 3. Validate (front)
 * 4. Call mutation (→ backend signal auto via OMEGA)
 * 5. Update state
 * 6. Success toast/message
 * 7. Auto-dismiss 3s
 * 8. Catch error
 *
 * Usage:
 *   const { submit, status, error, reset } = useFormHandler({
 *       mutation: api.documents.create,
 *       validate: (args) => !args.title ? "Titre requis" : null,
 *       onSuccess: () => toast("Document créé"),
 *   });
 *
 *   await submit({ title: "Mon doc", organizationId: orgId });
 */
export function useFormHandler<TArgs extends Record<string, unknown>>({
    mutation,
    validate,
    onSuccess,
    onError,
    successDismissMs = 3000,
}: FormHandlerOptions<TArgs>) {
    const [status, setStatus] = useState<FormStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const mutate = useMutation(mutation);

    const reset = useCallback(() => {
        setStatus("idle");
        setError(null);
    }, []);

    const submit = useCallback(
        async (args: TArgs) => {
            // Step 1: Reset error
            setError(null);

            // Step 2: Set loading
            setStatus("loading");

            try {
                // Step 3: Validate (front)
                if (validate) {
                    const validationError = validate(args);
                    if (validationError) {
                        setError(validationError);
                        setStatus("error");
                        onError?.(validationError);
                        return null;
                    }
                }

                // Step 4: Call mutation (→ backend signal auto)
                const result = await mutate(args);

                // Step 5-6: Update state + success
                setStatus("success");
                onSuccess?.(result);

                // Step 7: Auto-dismiss
                if (successDismissMs > 0) {
                    setTimeout(() => {
                        setStatus("idle");
                    }, successDismissMs);
                }

                return result;
            } catch (err) {
                // Step 8: Catch error
                const message = err instanceof Error ? err.message : "Erreur inattendue";
                setError(message);
                setStatus("error");
                onError?.(message);
                return null;
            }
        },
        [mutate, validate, onSuccess, onError, successDismissMs]
    );

    return {
        submit,
        status,
        error,
        reset,
        isLoading: status === "loading",
        isSuccess: status === "success",
        isError: status === "error",
        isIdle: status === "idle",
    };
}

/* ─── Field Validation Helpers ─────────────────── */

export const validators = {
    required: (label: string) => (value: unknown) =>
        !value || (typeof value === "string" && value.trim() === "")
            ? `${label} est requis`
            : null,

    minLength: (label: string, min: number) => (value: unknown) =>
        typeof value === "string" && value.length < min
            ? `${label} doit contenir au moins ${min} caractères`
            : null,

    maxLength: (label: string, max: number) => (value: unknown) =>
        typeof value === "string" && value.length > max
            ? `${label} ne doit pas dépasser ${max} caractères`
            : null,

    email: (value: unknown) =>
        typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? "Adresse email invalide"
            : null,

    phone: (value: unknown) =>
        typeof value === "string" && value.length > 0 && !/^[+]?[\d\s\-().]{6,20}$/.test(value)
            ? "Numéro de téléphone invalide"
            : null,

    url: (value: unknown) =>
        typeof value === "string" && value.length > 0 && !/^https?:\/\/.+/.test(value)
            ? "URL invalide (doit commencer par http:// ou https://)"
            : null,

    /** Compose multiple validators for a single field */
    compose: (...fns: ((value: unknown) => string | null)[]) => (value: unknown) => {
        for (const fn of fns) {
            const err = fn(value);
            if (err) return err;
        }
        return null;
    },
};
