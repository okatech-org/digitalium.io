// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Archives (iArchive v2)
// Lifecycle management + OHADA compliance
// ═══════════════════════════════════════════════

import { Id } from "../../convex/_generated/dataModel";

// ─── Lifecycle states ─────────────────────────
export type LifecycleState = "active" | "semi_active" | "archived";
export type ArchiveStatus = "active" | "semi_active" | "archived" | "expired" | "on_hold" | "destroyed";
export type IntegrityStatus = "valid" | "tampered" | "unchecked";
export type CountingStartEvent = "date_tag" | "date_gel" | "date_creation" | "date_cloture";
export type AlertType = "pre_archive" | "pre_deletion";
export type AlertUnit = "months" | "weeks" | "days" | "hours";
export type ConfidentialityLevel = "public" | "internal" | "confidential" | "secret";

// ─── Archive Category (Retention Policy) ──────
export interface ArchiveCategory {
    _id: Id<"archive_categories">;
    name: string;
    slug: string;
    description?: string;
    organizationId?: Id<"organizations">;
    color: string;
    icon: string;
    retentionYears: number;
    // Lifecycle phases (v2)
    ohadaReference?: string;
    countingStartEvent?: CountingStartEvent;
    activeDurationYears?: number;
    semiActiveDurationYears?: number;
    alertBeforeArchiveMonths?: number;
    hasSemiActivePhase?: boolean;
    isPerpetual?: boolean;
    defaultConfidentiality: ConfidentialityLevel;
    isFixed: boolean;
    isActive: boolean;
    sortOrder: number;
    createdAt: number;
    updatedAt: number;
}

// ─── Archive (Document / Dossier archivé) ─────
export interface Archive {
    _id: Id<"archives">;
    title: string;
    description?: string;
    categoryId?: Id<"archive_categories">;
    categorySlug: string;
    category?: string; // legacy
    organizationId?: Id<"organizations">;
    uploadedBy: string;
    folderId?: Id<"folders">;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    sha256Hash: string;
    retentionYears: number;
    retentionExpiresAt: number;
    status: ArchiveStatus;
    // Lifecycle tracking (v2)
    lifecycleState?: LifecycleState;
    countingStartDate?: number;
    triggerEvent?: string;
    activeUntil?: number;
    semiActiveUntil?: number;
    stateChangedAt?: number;
    metadata: {
        ocrText?: string;
        extractedData?: unknown;
        confidentiality?: ConfidentialityLevel;
    };
    isVault: boolean;
    vaultFolderId?: Id<"folders">;
    certificateId?: Id<"archive_certificates">;
    createdAt: number;
    updatedAt: number;
}

// ─── Retention Alert ──────────────────────────
export interface RetentionAlert {
    _id: Id<"retention_alerts">;
    categoryId: Id<"archive_categories">;
    organizationId: Id<"organizations">;
    alertType: AlertType;
    value: number;
    unit: AlertUnit;
    label: string;
    createdAt: number;
}

// ─── Alert Log ────────────────────────────────
export interface AlertLog {
    _id: Id<"alert_logs">;
    archiveId: Id<"archives">;
    alertId: Id<"retention_alerts">;
    organizationId: Id<"organizations">;
    sentAt: number;
    notificationType: "email" | "in_app" | "both";
    recipientId: string;
    status: "sent" | "read" | "acknowledged";
}

// ─── Archive Verification ─────────────────────
export interface ArchiveVerification {
    archiveId: string;
    verifiedAt: number;
    verifiedBy: string;
    isValid: boolean;
    hashMatch: boolean;
    reportUrl?: string;
}

// ─── Lifecycle Helpers ────────────────────────

/** Compute phase transition dates from a category policy */
export function computeLifecycleDates(
    countingStartDate: number,
    category: Pick<ArchiveCategory, "activeDurationYears" | "semiActiveDurationYears" | "hasSemiActivePhase" | "retentionYears">
) {
    const msPerYear = 365.25 * 24 * 3600 * 1000;

    const activeDuration = (category.activeDurationYears ?? category.retentionYears) * msPerYear;
    const activeUntil = countingStartDate + activeDuration;

    let semiActiveUntil: number | undefined;
    if (category.hasSemiActivePhase && category.semiActiveDurationYears) {
        semiActiveUntil = activeUntil + category.semiActiveDurationYears * msPerYear;
    }

    const retentionExpiresAt = countingStartDate + category.retentionYears * msPerYear;

    return { activeUntil, semiActiveUntil, retentionExpiresAt };
}

/** Convert alert value+unit to milliseconds */
export function alertToMs(value: number, unit: AlertUnit): number {
    switch (unit) {
        case "hours": return value * 3600 * 1000;
        case "days": return value * 24 * 3600 * 1000;
        case "weeks": return value * 7 * 24 * 3600 * 1000;
        case "months": return value * 30 * 24 * 3600 * 1000;
    }
}
