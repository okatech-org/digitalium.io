// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Client-side SHA-256 helper
// Uses Web Crypto API (crypto.subtle)
// ═══════════════════════════════════════════════

/**
 * Compute SHA-256 hash of a string or ArrayBuffer.
 * Returns the hash as a lowercase hex string.
 */
export async function sha256(data: string | ArrayBuffer): Promise<string> {
    const buffer = typeof data === "string"
        ? new TextEncoder().encode(data)
        : data;
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
