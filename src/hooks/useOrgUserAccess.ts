// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useOrgUserAccess
// Combines auth + org context for access control
// ═══════════════════════════════════════════════

import { useAuth } from "./useAuth";
import { useConvexOrgId } from "./useConvexOrgId";

export function useOrgUserAccess() {
    const auth = useAuth();
    const { convexOrgId, isLoading: orgLoading } = useConvexOrgId();

    const canManage = auth.level !== undefined && auth.level !== null && auth.level <= 2;
    const canEdit = auth.level !== undefined && auth.level !== null && auth.level <= 4;
    const canView = auth.isAuthenticated;

    return {
        user: auth.user,
        userId: auth.user?.email ?? auth.user?.uid,
        orgId: convexOrgId,
        role: auth.role,
        level: auth.level,
        isAdmin: auth.isAdmin,
        canManage,
        canEdit,
        canView,
        loading: auth.loading || orgLoading,
    };
}
