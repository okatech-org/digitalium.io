"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────────────────────

type DocStatus = "draft" | "review" | "approved" | "archived" | "trashed";

interface DocItem {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    authorInitials: string;
    updatedAt: string;
    updatedAtTs: number;
    status: DocStatus;
    tags: string[];
    version: number;
    folderId: string;
    archiveCategorySlug?: string;
    archiveCategoryId?: string;
}

// ─── Params ─────────────────────────────────────────────────────

export interface UseDocumentApprovalParams {
    documents: DocItem[];
    user: { email?: string | null; displayName?: string | null } | null | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submitForReviewMut: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    approveDocumentMut: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rejectDocumentMut: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    moveDocMut: (args: any) => Promise<any>;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useDocumentApproval({
    documents,
    user,
    submitForReviewMut,
    approveDocumentMut,
    rejectDocumentMut,
    moveDocMut,
}: UseDocumentApprovalParams) {
    // ─── State ──────────────────────────────────────────────────
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalDocId, setApprovalDocId] = useState<string | null>(null);
    const [approvalTargetFolderId, setApprovalTargetFolderId] = useState<string>("");

    // ─── Handlers ───────────────────────────────────────────────

    const handleSubmitForReview = useCallback(async (docId: string) => {
        try {
            await submitForReviewMut({
                id: docId as Id<"documents">,
                userId: user?.email || "unknown",
                comment: "Soumis pour révision depuis la liste",
            });
            toast.success("Document soumis pour révision");
        } catch (err) {
            console.error("Submit for review error:", err);
            toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de la soumission"}`);
        }
    }, [submitForReviewMut, user?.email]);

    const handleApproveDocument = useCallback(async (docId: string) => {
        // Ouvrir la dialog de reclassement qui permet de choisir le dossier de destination
        const doc = documents.find((d) => d.id === docId);
        setApprovalDocId(docId);
        // Pré-sélectionner le dossier actuel du document
        setApprovalTargetFolderId(doc?.folderId ?? "");
        setShowApprovalDialog(true);
    }, [documents]);

    const handleConfirmApproval = useCallback(async () => {
        if (!approvalDocId) return;
        try {
            // 1. Approuver le document
            await approveDocumentMut({
                id: approvalDocId as Id<"documents">,
                userId: user?.email || "unknown",
                comment: "Approuvé depuis la liste",
            });

            // 2. Si un dossier de destination est choisi (et différent de l'actuel), déplacer
            const doc = documents.find((d) => d.id === approvalDocId);
            if (approvalTargetFolderId && approvalTargetFolderId !== doc?.folderId) {
                const isSystem = approvalTargetFolderId.startsWith("__");
                if (!isSystem) {
                    await moveDocMut({
                        id: approvalDocId as Id<"documents">,
                        folderId: approvalTargetFolderId as Id<"folders">,
                    });
                }
            }

            toast.success("Document approuvé et classé");
            setShowApprovalDialog(false);
            setApprovalDocId(null);
            setApprovalTargetFolderId("");
        } catch (err) {
            console.error("Approve error:", err);
            toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de l'approbation"}`);
        }
    }, [approvalDocId, approvalTargetFolderId, approveDocumentMut, moveDocMut, documents, user?.email]);

    const handleRejectDocument = useCallback(async (docId: string) => {
        try {
            await rejectDocumentMut({
                id: docId as Id<"documents">,
                userId: user?.email || "unknown",
                reason: "Rejeté depuis la liste — modifications nécessaires",
            });
            toast.success("Document rejeté — retourné en brouillon");
        } catch (err) {
            console.error("Reject error:", err);
            toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec du rejet"}`);
        }
    }, [rejectDocumentMut, user?.email]);

    return {
        // State
        showApprovalDialog,
        setShowApprovalDialog,
        approvalDocId,
        setApprovalDocId,
        approvalTargetFolderId,
        setApprovalTargetFolderId,

        // Handlers
        handleSubmitForReview,
        handleApproveDocument,
        handleConfirmApproval,
        handleRejectDocument,
    };
}
