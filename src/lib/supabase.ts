// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Lib: Supabase Client
// ═══════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File
): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false });

    if (error) {
        console.error("Upload error:", error);
        return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
    bucket: string,
    path: string
): Promise<Blob | null> {
    const { data, error } = await supabase.storage.from(bucket).download(path);

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
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
        console.error("Delete error:", error);
        return false;
    }

    return true;
}
