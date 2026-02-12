"use client";

// ═══════════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Firebase Auth Context + RBAC Resolution
// Provides: signIn, signUp, signInWithGoogle, signOut, resetPassword
// Resolves: roles[], organizations[], hasRole()
// ═══════════════════════════════════════════════════════════════════

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
    type User as FirebaseUser,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, googleProvider, functions } from "@/lib/firebase";
import type {
    AuthUser,
    PlatformRole,
    UserRoleInfo,
    Organization,
    PersonaType,
} from "@/types/auth";
import { ROLE_LEVELS } from "@/config/rbac";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AuthContextValue {
    // ── State ──
    user: AuthUser | null;
    loading: boolean;
    error: string | null;

    // ── Convenience ──
    isAuthenticated: boolean;
    isAdmin: boolean;

    // ── Methods ──
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        displayName: string
    ) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    hasRole: (requiredRole: PlatformRole, organizationId?: string) => boolean;
    clearError: () => void;
}

interface AdminRoleResponse {
    isAdmin: boolean;
    role: PlatformRole;
    level: number;
    isSystemAdmin: boolean;
    isPlatformAdmin: boolean;
    isOrgAdmin: boolean;
    isManager: boolean;
    roles: UserRoleInfo[];
    organizations: Organization[];
    personaType?: PersonaType;
}

// ─────────────────────────────────────────────────────────────
// Dev fallback email → role mapping
// ─────────────────────────────────────────────────────────────

const DEV_EMAIL_ROLES: Record<string, { role: PlatformRole; level: number }> = {
    "demo-sysadmin@digitalium.ga": { role: "system_admin", level: 0 },
    "demo-admin@digitalium.ga": { role: "platform_admin", level: 1 },
    "ornella.doumba@digitalium.ga": { role: "platform_admin", level: 1 },
    "dg@ascoma.ga": { role: "org_admin", level: 2 },
    "commercial@ascoma.ga": { role: "org_manager", level: 3 },
    "sinistres@ascoma.ga": { role: "org_manager", level: 3 },
    "agent@ascoma.ga": { role: "org_member", level: 4 },
    "juridique@ascoma.ga": { role: "org_viewer", level: 5 },
};

const DEFAULT_DEV_ROLE: { role: PlatformRole; level: number } = {
    role: "org_member",
    level: 4,
};

// ─────────────────────────────────────────────────────────────
// French error messages
// ─────────────────────────────────────────────────────────────

function translateFirebaseError(code: string): string {
    const messages: Record<string, string> = {
        "auth/invalid-email": "L'adresse email est invalide.",
        "auth/user-disabled": "Ce compte a été désactivé.",
        "auth/user-not-found": "Aucun compte trouvé avec cet email.",
        "auth/wrong-password": "Mot de passe incorrect.",
        "auth/invalid-credential":
            "Identifiants invalides. Vérifiez votre email et mot de passe.",
        "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
        "auth/weak-password":
            "Le mot de passe doit contenir au moins 6 caractères.",
        "auth/too-many-requests":
            "Trop de tentatives. Veuillez réessayer plus tard.",
        "auth/network-request-failed":
            "Erreur réseau. Vérifiez votre connexion internet.",
        "auth/popup-closed-by-user":
            "La fenêtre de connexion a été fermée. Veuillez réessayer.",
        "auth/popup-blocked":
            "La fenêtre de connexion a été bloquée. Autorisez les pop-ups et réessayez.",
        "auth/operation-not-allowed":
            "Ce mode de connexion n'est pas activé.",
        "auth/requires-recent-login":
            "Veuillez vous reconnecter pour cette opération.",
    };
    return (
        messages[code] ?? "Une erreur est survenue. Veuillez réessayer."
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function isDev(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    );
}

function buildDevFallback(
    email: string
): Omit<AdminRoleResponse, "organizations"> {
    const mapping =
        DEV_EMAIL_ROLES[email.toLowerCase()] ?? DEFAULT_DEV_ROLE;
    return {
        isAdmin: mapping.level <= 2,
        role: mapping.role,
        level: mapping.level,
        isSystemAdmin: mapping.level === 0,
        isPlatformAdmin: mapping.level === 1,
        isOrgAdmin: mapping.level === 2,
        isManager: mapping.level === 3,
        roles: [{ role: mapping.role, level: mapping.level }],
        personaType: mapping.level <= 2 ? undefined : "business",
    };
}

function buildAuthUser(
    firebaseUser: FirebaseUser,
    rbac: AdminRoleResponse
): AuthUser {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        displayName: firebaseUser.displayName ?? undefined,
        photoURL: firebaseUser.photoURL ?? undefined,

        role: rbac.role,
        level: rbac.level,

        isAdmin: rbac.isAdmin,
        isSystemAdmin: rbac.isSystemAdmin,
        isPlatformAdmin: rbac.isPlatformAdmin,
        isOrgAdmin: rbac.isOrgAdmin,
        isManager: rbac.isManager,

        roles: rbac.roles,
        organizations: rbac.organizations,

        personaType: rbac.personaType,

        // Legacy compatibility
        adminRole: rbac.role,
    } as AuthUser & { adminRole: PlatformRole };
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
            "useAuthContext doit être utilisé à l'intérieur de <FirebaseAuthProvider>"
        );
    }
    return ctx;
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function FirebaseAuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Resolve RBAC roles after Firebase auth ──
    const resolveRoles = useCallback(
        async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
            try {
                // 1. Try Cloud Function
                const checkAdminRole = httpsCallable<
                    unknown,
                    AdminRoleResponse
                >(functions, "checkAdminRole");
                const result = await checkAdminRole();
                return buildAuthUser(firebaseUser, result.data);
            } catch (cfError) {
                // 2. Dev fallback
                if (isDev()) {
                    console.warn(
                        "[Auth] Cloud Function indisponible — fallback dev activé",
                        cfError
                    );
                    const fallback = buildDevFallback(
                        firebaseUser.email ?? ""
                    );
                    return buildAuthUser(firebaseUser, {
                        ...fallback,
                        organizations: [],
                    });
                }

                // 3. Production fallback: minimal role
                console.error(
                    "[Auth] Erreur résolution des rôles",
                    cfError
                );
                return buildAuthUser(firebaseUser, {
                    isAdmin: false,
                    role: "org_viewer",
                    level: 5,
                    isSystemAdmin: false,
                    isPlatformAdmin: false,
                    isOrgAdmin: false,
                    isManager: false,
                    roles: [{ role: "org_viewer", level: 5 }],
                    organizations: [],
                });
            }
        },
        []
    );

    // ── Listen to auth state changes ──
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            setError(null);

            if (firebaseUser) {
                try {
                    const authUser = await resolveRoles(firebaseUser);
                    setUser(authUser);
                } catch {
                    setUser(null);
                    setError(
                        "Erreur lors de la résolution des permissions."
                    );
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [resolveRoles]);

    // ── signIn ──
    const signIn = useCallback(
        async (email: string, password: string) => {
            setLoading(true);
            setError(null);
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (err: unknown) {
                const code =
                    (err as { code?: string }).code ?? "unknown";
                setError(translateFirebaseError(code));
                setLoading(false);
                throw err;
            }
        },
        []
    );

    // ── signInWithGoogle ──
    const signInWithGoogleFn = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? "unknown";
            setError(translateFirebaseError(code));
            setLoading(false);
            throw err;
        }
    }, []);

    // ── signUp ──
    const signUp = useCallback(
        async (
            email: string,
            password: string,
            displayName: string
        ) => {
            setLoading(true);
            setError(null);
            try {
                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );
                await updateProfile(credential.user, { displayName });
            } catch (err: unknown) {
                const code =
                    (err as { code?: string }).code ?? "unknown";
                setError(translateFirebaseError(code));
                setLoading(false);
                throw err;
            }
        },
        []
    );

    // ── signOut ──
    const signOutFn = useCallback(async () => {
        setError(null);
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? "unknown";
            setError(translateFirebaseError(code));
            throw err;
        }
    }, []);

    // ── resetPassword ──
    const resetPasswordFn = useCallback(async (email: string) => {
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? "unknown";
            setError(translateFirebaseError(code));
            throw err;
        }
    }, []);

    // ── hasRole ──
    const hasRoleFn = useCallback(
        (requiredRole: PlatformRole, organizationId?: string): boolean => {
            if (!user) return false;

            // Global admins bypass all checks
            if (user.level <= 1) return true;

            const requiredLevel = ROLE_LEVELS[requiredRole];

            // User must have equal or higher privilege
            if (user.level > requiredLevel) return false;

            // Org-scoped check
            if (organizationId) {
                const orgRole = user.roles.find(
                    (r) => r.organizationId === organizationId
                );
                if (!orgRole) return false;
                return orgRole.level <= requiredLevel;
            }

            return true;
        },
        [user]
    );

    // ── clearError ──
    const clearError = useCallback(() => setError(null), []);

    // ── Memoize context value ──
    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            error,
            isAuthenticated: !!user,
            isAdmin: user?.isAdmin ?? false,
            signIn,
            signUp,
            signInWithGoogle: signInWithGoogleFn,
            signOut: signOutFn,
            resetPassword: resetPasswordFn,
            hasRole: hasRoleFn,
            clearError,
        }),
        [
            user,
            loading,
            error,
            signIn,
            signUp,
            signInWithGoogleFn,
            signOutFn,
            resetPasswordFn,
            hasRoleFn,
            clearError,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
