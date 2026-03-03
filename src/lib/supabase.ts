// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Lib: Supabase Client
// Lazy-initialized to avoid build-time crashes
// when env vars are not available during SSR.
// ═══════════════════════════════════════════════

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            // Return a dummy client that won't crash but will log warnings
            console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL or ANON_KEY not set — using placeholder");
            return createClient("https://placeholder.supabase.co", "placeholder-key");
        }
        _supabase = createClient(url, key);
    }
    return _supabase;
}

/** Lazy-loaded Supabase client — access is deferred until first use */
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase();
        const value = (client as unknown as Record<string | symbol, unknown>)[prop];
        return typeof value === "function" ? (value as Function).bind(client) : value;
    },
});

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File
): Promise<string | null> {
    const client = getSupabase();
    const { data, error } = await client.storage
        .from(bucket)
        .upload(path, file, { upsert: false });

    if (error) {
        console.error("Upload error:", error);
        return null;
    }

    const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
    bucket: string,
    path: string
): Promise<Blob | null> {
    const { data, error } = await getSupabase().storage.from(bucket).download(path);

    if (error) {
        console.error("Download error:", error);
        return null;
    }

    return data;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
    bucket: string,
    path: string
): Promise<boolean> {
    const { error } = await getSupabase().storage.from(bucket).remove([path]);

    if (error) {
        console.error("Delete error:", error);
        return false;
    }

    return true;
}
