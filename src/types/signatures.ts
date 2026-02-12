// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Signatures (iSignature)
// ═══════════════════════════════════════════════

import { Id } from "../../convex/_generated/dataModel";

export type SignatureStatus = "pending" | "signed" | "rejected" | "expired";
export type SignatureType = "approval" | "validation" | "certification";

export interface Signature {
    _id: Id<"signatures">;
    documentId: string;
    signerId: string;
    signerName: string;
    signerEmail: string;
    type: SignatureType;
    status: SignatureStatus;
    signedAt?: number;
    rejectedAt?: number;
    rejectionReason?: string;
    signatureData?: string;
    ipAddress?: string;
    createdAt: number;
    expiresAt?: number;
}

export interface SignatureWorkflow {
    id: string;
    documentId: string;
    title: string;
    initiatorId: string;
    steps: SignatureStep[];
    currentStep: number;
    status: "active" | "completed" | "cancelled";
    createdAt: number;
}

export interface SignatureStep {
    order: number;
    signerId: string;
    signerName: string;
    required: boolean;
    status: SignatureStatus;
    signedAt?: number;
}
