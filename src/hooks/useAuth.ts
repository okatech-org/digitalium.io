// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useAuth
// Exposes full auth context with RBAC data
// ═══════════════════════════════════════════════

import { useAuthContext } from "@/contexts/FirebaseAuthContext";

export function useAuth() {
    const ctx = useAuthContext();

    return {
        // ── State ──
        user: ctx.user,
        loading: ctx.loading,
        error: ctx.error,
        isAuthenticated: ctx.isAuthenticated,
        isAdmin: ctx.isAdmin,

        // ── RBAC fields ──
        role: ctx.user?.role ?? null,
        level: ctx.user?.level ?? null,
        isSystemAdmin: ctx.user?.isSystemAdmin ?? false,
        isPlatformAdmin: ctx.user?.isPlatformAdmin ?? false,
        isOrgAdmin: ctx.user?.isOrgAdmin ?? false,
        isManager: ctx.user?.isManager ?? false,
        roles: ctx.user?.roles ?? [],
        organizations: ctx.user?.organizations ?? [],
        userPersona: ctx.user?.personaType ?? null,

        // ── Methods ──
        signIn: ctx.signIn,
        signUp: ctx.signUp,
        signInWithGoogle: ctx.signInWithGoogle,
        signOut: ctx.signOut,
        resetPassword: ctx.resetPassword,
        hasRole: ctx.hasRole,
        clearError: ctx.clearError,
    };
}
