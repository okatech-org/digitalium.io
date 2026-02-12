// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Lib: Admin Service (Firebase Cloud Functions)
// ═══════════════════════════════════════════════

import { AdminRole } from "@/types/auth";

/**
 * Admin service — calls Firebase Cloud Functions for admin operations.
 * Placeholder until Firebase is fully configured.
 */

export async function setAdminRole(uid: string, role: AdminRole): Promise<void> {
    // TODO: Call Firebase Cloud Function to set custom claims
    console.log(`Setting admin role ${role} for user ${uid}`);
}

export async function removeAdminRole(uid: string): Promise<void> {
    // TODO: Call Firebase Cloud Function to remove custom claims
    console.log(`Removing admin role for user ${uid}`);
}

export async function listAdminUsers(): Promise<{ uid: string; role: AdminRole }[]> {
    // TODO: Call Firebase Cloud Function to list admins
    return [];
}

export async function inviteUser(email: string, role: AdminRole): Promise<void> {
    // TODO: Send invite email via Cloud Function
    console.log(`Inviting ${email} with role ${role}`);
}
