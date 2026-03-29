"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { FileManagerFolder } from "@/components/modules/file-manager";

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

interface AutoTagResult {
    tags: string[];
    confidence: number;
    reasoning: string;
    forId: string;
}

// ─── Params ─────────────────────────────────────────────────────

export interface UseDocumentTagsParams {
    documents: DocItem[];
    folders: FileManagerFolder[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convexDocuments: any[] | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convexFolders: any[] | undefined;
    setDocuments: React.Dispatch<React.SetStateAction<DocItem[]>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTagDocumentAction: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTagFolderAction: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDocumentMut: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFolderMut: (args: any) => Promise<any>;
}

// ─── Tag Suggestions by archive category ────────────────────────

const TAG_SUGGESTIONS: Record<string, string[]> = {
    fiscal: ["Bilan", "Déclaration", "TVA", "Impôt", "Comptabilité", "Facture"],
    social: ["Contrat", "RH", "Paie", "Convention", "Stage", "Formation"],
    legal: ["PV", "Délibération", "Statuts", "Juridique", "Conformité"],
    client: ["Devis", "Proposition", "Commande", "Livraison", "Commercial"],
    general: ["Rapport", "Note", "Stratégie", "Direction", "Technique", "Cloud", "Audit"],
};

// ─── Hook ───────────────────────────────────────────────────────

export function useDocumentTags({
    documents,
    folders,
    convexDocuments,
    convexFolders,
    setDocuments,
    autoTagDocumentAction,
    autoTagFolderAction,
    updateDocumentMut,
    updateFolderMut,
}: UseDocumentTagsParams) {
    // ─── State ──────────────────────────────────────────────────
    const [showTagDialog, setShowTagDialog] = useState(false);
    const [tagEditDocId, setTagEditDocId] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [autoTaggingId, setAutoTaggingId] = useState<string | null>(null);
    const [autoTagResult, setAutoTagResult] = useState<AutoTagResult | null>(null);

    // ─── Derived ────────────────────────────────────────────────
    const tagEditDoc = useMemo(() => documents.find((d) => d.id === tagEditDocId), [documents, tagEditDocId]);

    const tagSuggestions = useMemo(() => {
        if (!tagEditDoc) return TAG_SUGGESTIONS.general;
        // Determine category from folder
        const folder = folders.find((f) => f.id === tagEditDoc.folderId);
        const slug = folder?.metadata?.code?.toString()?.toLowerCase() || "";
        return TAG_SUGGESTIONS[slug] || TAG_SUGGESTIONS.general;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagEditDoc, folders]);

    // ─── Handlers ───────────────────────────────────────────────

    const handleOpenTagDialog = useCallback((docId: string) => {
        setTagEditDocId(docId);
        setTagInput("");
        setShowTagDialog(true);
    }, []);

    const handleAddTag = useCallback((tag: string) => {
        if (!tagEditDocId || !tag.trim()) return;
        setDocuments((prev) =>
            prev.map((d) =>
                d.id === tagEditDocId && !d.tags.includes(tag.trim())
                    ? { ...d, tags: [...d.tags, tag.trim()] }
                    : d
            )
        );
        setTagInput("");
    }, [tagEditDocId, setDocuments]);

    const handleRemoveTag = useCallback((tag: string) => {
        if (!tagEditDocId) return;
        setDocuments((prev) =>
            prev.map((d) =>
                d.id === tagEditDocId
                    ? { ...d, tags: d.tags.filter((t) => t !== tag) }
                    : d
            )
        );
    }, [tagEditDocId, setDocuments]);

    const handleAutoTag = useCallback(async (id: string, itemType: "folder" | "document") => {
        setAutoTaggingId(id);
        setAutoTagResult(null);
        try {
            let result;
            if (itemType === "document") {
                result = await autoTagDocumentAction({
                    documentId: id as Id<"documents">,
                });
            } else {
                result = await autoTagFolderAction({
                    folderId: id as Id<"folders">,
                });
            }

            if (result.error) {
                toast.error(result.error);
                setAutoTaggingId(null);
                return;
            }

            if (result.tags.length === 0) {
                toast.info("L'IA n'a pas pu générer de tags pour cet élément");
                setAutoTaggingId(null);
                return;
            }

            // Stocker le résultat pour affichage dans le dialog
            setAutoTagResult({
                tags: result.tags,
                confidence: result.confidence,
                reasoning: result.reasoning,
                forId: id,
            });

            // Appliquer automatiquement les tags au document/dossier
            if (itemType === "document") {
                // Fusionner avec tags existants
                const existingDoc = convexDocuments?.find((d) => d._id === id);
                const existingTags = existingDoc?.tags || [];
                const mergedTags = Array.from(new Set([...existingTags, ...result.tags]));
                await updateDocumentMut({
                    id: id as Id<"documents">,
                    tags: mergedTags,
                });
            } else {
                // Pour les dossiers, utiliser updateFolderMut
                const existingFolder = convexFolders?.find((f) => f._id === id);
                const existingTags = existingFolder?.tags || [];
                const mergedTags = Array.from(new Set([...existingTags, ...result.tags]));
                await updateFolderMut({
                    id: id as Id<"folders">,
                    tags: mergedTags,
                });
            }

            toast.success(`${result.tags.length} tags générés par l'IA et appliqués`);
        } catch (err) {
            console.error("[AutoTag] Erreur:", err);
            toast.error("Erreur lors de l'auto-tagging IA");
        } finally {
            setAutoTaggingId(null);
        }
    }, [autoTagDocumentAction, autoTagFolderAction, convexDocuments, convexFolders, updateDocumentMut, updateFolderMut]);

    return {
        // State
        showTagDialog,
        setShowTagDialog,
        tagEditDocId,
        setTagEditDocId,
        tagInput,
        setTagInput,
        autoTaggingId,
        autoTagResult,

        // Derived
        tagEditDoc,
        tagSuggestions,

        // Handlers
        handleOpenTagDialog,
        handleAddTag,
        handleRemoveTag,
        handleAutoTag,
    };
}
