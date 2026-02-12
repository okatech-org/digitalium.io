// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Archives (iArchive)
// ═══════════════════════════════════════════════

import { Id } from "../../convex/_generated/dataModel";

export type ArchiveStatus = "active" | "sealed" | "expired" | "disputed";
export type IntegrityStatus = "valid" | "tampered" | "unchecked";

export interface Archive {
    _id: Id<"archives">;
    title: string;
    description?: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    sha256Hash: string;
    ownerId: string;
    organizationId?: string;
    status: ArchiveStatus;
    integrityStatus: IntegrityStatus;
    sealedAt?: number;
    sealedBy?: string;
    retentionYears: number;
    tags: string[];
    metadata: Record<string, string>;
    createdAt: number;
    updatedAt: number;
}

export interface ArchiveVerification {
    archiveId: string;
    verifiedAt: number;
    verifiedBy: string;
    isValid: boolean;
    hashMatch: boolean;
    reportUrl?: string;
}
