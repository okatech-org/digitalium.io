// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Certificate Number Generator
// Generates sequential certificate numbers: CERT-YYYY-00001 / DEST-YYYY-00001
// ═══════════════════════════════════════════════

import type { GenericDatabaseReader } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

/**
 * Generate a sequential certificate number for archiving.
 * Format: CERT-{year}-{00001}
 * Counts existing certificates for the current year to determine the sequence.
 */
export async function generateArchiveCertNumber(
    db: GenericDatabaseReader<DataModel>
): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CERT-${year}-`;

    // Count all archive certificates
    const allCerts = await db.query("archive_certificates").collect();
    const yearCerts = allCerts.filter(
        (c) => c.certificateNumber && c.certificateNumber.startsWith(prefix)
    );

    const seq = (yearCerts.length + 1).toString().padStart(5, "0");
    return `${prefix}${seq}`;
}

/**
 * Generate a sequential certificate number for destruction.
 * Format: DEST-{year}-{00001}
 * Counts existing destruction certificates for the current year.
 */
export async function generateDestructionCertNumber(
    db: GenericDatabaseReader<DataModel>
): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DEST-${year}-`;

    // Count all destruction certificates
    const allCerts = await db.query("destruction_certificates").collect();
    const yearCerts = allCerts.filter(
        (c) => c.certificateNumber && c.certificateNumber.startsWith(prefix)
    );

    const seq = (yearCerts.length + 1).toString().padStart(5, "0");
    return `${prefix}${seq}`;
}
