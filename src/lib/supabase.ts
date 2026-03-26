// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Lib: Supabase Client (DEPRECATED)
// Replaced by Convex File Storage — this file exists
// only as a compatibility bridge during migration.
// 
// NEOCORTEX OMEGA M4 — Google + Convex Only
// ═══════════════════════════════════════════════

/**
 * @deprecated Supabase has been removed. Use Convex File Storage instead.
 * See convex/documents.ts upload mutations for Convex storage.
 *
 * This file provides no-op stubs to prevent build errors in
 * components that still reference these functions.
 * Components should be migrated to use Convex `useMutation`
 * with `ctx.storage.store()` directly.
 */

// ── Stub client ──
export const supabase = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
        console.warn(`[supabase-bridge] supabase.${prop} called — Supabase is deprecated. Use Convex File Storage.`);
        if (prop === "storage") {
            return {
                from: () => ({
                    upload: async () => ({ data: null, error: { message: "Supabase removed — use Convex" } }),
                    download: async () => ({ data: null, error: { message: "Supabase removed — use Convex" } }),
                    remove: async () => ({ error: { message: "Supabase removed — use Convex" } }),
                    getPublicUrl: () => ({ data: { publicUrl: "" } }),
                }),
            };
        }
        return () => {
            console.warn(`[supabase-bridge] Method ${prop} not available`);
        };
    },
});

/**
 * @deprecated Use Convex File Storage mutations instead.
 */
export async function uploadFile(
    _bucket: string,
    _path: string,
    _file: File
): Promise<string | null> {
    console.warn("[supabase-bridge] uploadFile() called — Supabase removed. Use Convex File Storage.");
    return null;
}

/**
 * @deprecated Use Convex File Storage queries instead.
 */
export async function downloadFile(
    _bucket: string,
    _path: string
): Promise<Blob | null> {
    console.warn("[supabase-bridge] downloadFile() called — Supabase removed. Use Convex File Storage.");
    return null;
}

/**
 * @deprecated Use Convex File Storage mutations instead.
 */
export async function deleteFile(
    _bucket: string,
    _path: string
): Promise<boolean> {
    console.warn("[supabase-bridge] deleteFile() called — Supabase removed. Use Convex File Storage.");
    return false;
}
