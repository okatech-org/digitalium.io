"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { FileManagerFolder } from "@/components/modules/file-manager";

// ─── Types ──────────────────────────────────────────────────────

export type ReorgStep = "mode" | "analyzing" | "preview" | "executing" | "done";
export type ReorgMode = "classify" | "reorganize" | "deep_audit";

export interface ReorgMoveRecommendations {
    suggestedTags?: string[];
    suggestedDocTypeCode?: string;
    suggestedRetentionSlug?: string;
    suggestedConfidentiality?: string;
    suggestedFolderVisibility?: string;
    retentionReasoning?: string;
}

export interface ReorgMove {
    docId: string;
    docTitle: string;
    currentFolderId: string | null;
    currentFolderName: string | null;
    targetFolderId: string;
    targetFolderPath: string;
    newFoldersToCreate: string[];
    parentFolderIdForNew: string | null;
    shouldMove: boolean;
    selected: boolean;
    reasoning: string;
    confidence: number;
    recommendations?: ReorgMoveRecommendations;
}

export interface ReorgFolderRecommendation {
    folderId: string;
    suggestedRetentionSlug?: string;
    suggestedConfidentiality?: string;
    suggestedVisibility?: string;
    suggestedTags?: string[];
    reasoning?: string;
}

export interface ReorgOrganizationAnalysis {
    detectedSector?: string;
    detectedClients?: string[];
    detectedProjects?: string[];
    keyInsights?: string;
}

export interface ReorgPlan {
    moves: ReorgMove[];
    summary: string;
    organizationAnalysis?: ReorgOrganizationAnalysis;
    folderRecommendations?: ReorgFolderRecommendation[];
    stats: {
        totalDocuments: number;
        documentsToMove: number;
        documentsAlreadyCorrect: number;
        newFoldersToCreate: number;
        tagsToApply?: number;
        retentionToSet?: number;
        confidentialityToSet?: number;
    };
}

export interface ReorgResult {
    moved: number;
    foldersCreated: number;
    tagged: number;
    typed: number;
    archived: number;
}

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

interface FolderTreeItem {
    id: string | Id<"folders">;
    name: string;
    path: string;
    depth: number;
    parentFolderId: string | Id<"folders"> | null;
    tags: string[];
    description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConvexOrgDoc = Record<string, any> | null | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArchiveCategoryRecord = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DocumentTypeRecord = Record<string, any>;

// ─── Params ─────────────────────────────────────────────────────

export interface UseDocumentReorgParams {
    documents: DocItem[];
    folders: FileManagerFolder[];
    folderTreeForReorg: FolderTreeItem[] | undefined;
    convexOrgId: Id<"organizations"> | null | undefined;
    convexOrgDoc: ConvexOrgDoc;
    archiveCategories: ArchiveCategoryRecord[] | undefined;
    documentTypes: DocumentTypeRecord[] | undefined;
    user: { email?: string | null; displayName?: string | null } | null | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reorganizeDocumentsAction: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deepReorganizeAction: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOrCreateFolderMut: (args: any) => Promise<{ id: Id<"folders">; created: boolean }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    batchApplyAIMut: (args: any) => Promise<{ moved: number; tagged: number; typed: number; archived: number }>;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useDocumentReorg({
    documents,
    folders,
    folderTreeForReorg,
    convexOrgId,
    convexOrgDoc,
    archiveCategories,
    documentTypes,
    user,
    reorganizeDocumentsAction,
    deepReorganizeAction,
    getOrCreateFolderMut,
    batchApplyAIMut,
}: UseDocumentReorgParams) {
    // ─── State ──────────────────────────────────────────────────
    const [showReorgDialog, setShowReorgDialog] = useState(false);
    const [reorgStep, setReorgStep] = useState<ReorgStep>("mode");
    const [reorgMode, setReorgMode] = useState<ReorgMode>("classify");
    const [reorgPlan, setReorgPlan] = useState<ReorgPlan | null>(null);
    const [reorgLoading, setReorgLoading] = useState(false);
    const [reorgProgress, setReorgProgress] = useState(0);
    const [reorgResult, setReorgResult] = useState<ReorgResult | null>(null);

    // ─── Open dialog (resets state) ─────────────────────────────
    const handleOpenReorgDialog = useCallback(() => {
        setShowReorgDialog(true);
        setReorgStep("mode");
        setReorgMode("classify");
        setReorgPlan(null);
        setReorgResult(null);
        setReorgProgress(0);
    }, []);

    // ─── Analyze ────────────────────────────────────────────────
    const handleAnalyzeReorg = useCallback(async () => {
        setReorgStep("analyzing");
        try {
            const treeData = (folderTreeForReorg ?? []).map((f) => ({
                id: String(f.id),
                name: f.name,
                path: f.path,
                depth: f.depth,
                parentFolderId: f.parentFolderId ? String(f.parentFolderId) : null,
                tags: f.tags,
                description: f.description,
            }));

            const docsData = documents.map((d) => {
                const folder = folders.find((fl) => fl.id === d.folderId);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const docType = documentTypes?.find((dt: any) => dt._id === (d as unknown as Record<string, unknown>).documentTypeId);
                return {
                    id: d.id,
                    title: d.title,
                    fileName: undefined as string | undefined,
                    excerpt: d.excerpt || undefined,
                    tags: d.tags,
                    currentFolderId: d.folderId ?? null,
                    currentFolderName: folder?.name ?? null,
                    status: d.status,
                    documentTypeCode: docType?.code as string | undefined,
                    archiveCategorySlug: d.archiveCategorySlug,
                };
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let result: { plan?: unknown; error?: string; rawResponse?: string };

            if (reorgMode === "deep_audit" || reorgMode === "reorganize" || reorgMode === "classify") {
                // Build archive categories list
                const archiveCats = (archiveCategories ?? []).map((c: Record<string, unknown>) => ({
                    slug: String(c.slug ?? ""),
                    name: String(c.name ?? ""),
                    retentionYears: Number(c.retentionYears ?? 5),
                    scope: String(c.scope ?? "document"),
                }));
                // Build document types list
                const docTypes = (documentTypes ?? []).map((dt: Record<string, unknown>) => ({
                    id: String(dt._id ?? ""),
                    code: String(dt.code ?? ""),
                    nom: String(dt.nom ?? ""),
                    retentionCategorySlug: dt.retentionCategorySlug as string | undefined,
                }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reorgDepthConfig = convexOrgDoc?.config?.classement
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? { maxDepth: (convexOrgDoc.config as any).classement.maxDepth ?? 3, depthStrategy: (convexOrgDoc.config as any).classement.depthStrategy ?? "intelligente" }
                    : undefined;

                result = await deepReorganizeAction({
                    documents: docsData,
                    folderTree: treeData,
                    archiveCategories: archiveCats,
                    documentTypes: docTypes,
                    orgContext: {
                        name: convexOrgDoc?.nom as string ?? "Organisation",
                        sector: convexOrgDoc?.sector as string | undefined,
                        country: convexOrgDoc?.country as string | undefined,
                        totalDocuments: documents.length,
                        totalFolders: folders.length,
                    },
                    mode: reorgMode,
                    depthConfig: reorgDepthConfig,
                });
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reorgDepthConfig = convexOrgDoc?.config?.classement
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? { maxDepth: (convexOrgDoc.config as any).classement.maxDepth ?? 3, depthStrategy: (convexOrgDoc.config as any).classement.depthStrategy ?? "intelligente" }
                    : undefined;

                result = await reorganizeDocumentsAction({
                    documents: docsData.map(d => ({
                        id: d.id, title: d.title, fileName: undefined,
                        tags: d.tags, currentFolderId: d.currentFolderId, currentFolderName: d.currentFolderName,
                    })),
                    folderTree: treeData,
                    mode: reorgMode as "classify" | "reorganize",
                    depthConfig: reorgDepthConfig,
                });
            }

            if (result.error || !result.plan) {
                toast.error("L'IA n'a pas pu analyser les documents.");
                setReorgStep("mode");
            } else {
                const plan = result.plan as ReorgPlan;

                // Remap AI-generated placeholder docIds back to real Convex IDs
                const docByTitle = new Map<string, string>();
                const docByIndex = new Map<string, string>();
                docsData.forEach((d, idx) => {
                    docByTitle.set(d.title.toLowerCase(), d.id);
                    docByIndex.set(`doc_${idx + 1}`, d.id);
                    docByIndex.set(String(idx + 1), d.id);
                });

                plan.moves = plan.moves.map((m: ReorgMove) => {
                    let resolvedDocId = m.docId;
                    if (!docsData.some(d => d.id === m.docId)) {
                        if (docByIndex.has(m.docId)) {
                            resolvedDocId = docByIndex.get(m.docId)!;
                        } else if (m.docTitle && docByTitle.has(m.docTitle.toLowerCase())) {
                            resolvedDocId = docByTitle.get(m.docTitle.toLowerCase())!;
                        }
                    }

                    // Infer missing sub-folders from targetFolderPath
                    let newFolders = m.newFoldersToCreate ?? [];
                    let parentForNew = m.parentFolderIdForNew ?? m.targetFolderId;
                    if (newFolders.length === 0 && m.targetFolderPath && m.targetFolderPath.includes(">")) {
                        const pathSegments = m.targetFolderPath.split(/\s*>\s*/).filter(Boolean);
                        const childrenMap = new Map<string, Map<string, string>>();
                        treeData.forEach(f => {
                            const parentKey = f.parentFolderId ?? "root";
                            if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, new Map());
                            childrenMap.get(parentKey)!.set(f.name.toLowerCase(), f.id);
                        });
                        let currentParentId: string = "root";
                        let missingStartIdx = 0;
                        for (let si = 0; si < pathSegments.length; si++) {
                            const segName = pathSegments[si].trim().toLowerCase();
                            const children = childrenMap.get(currentParentId);
                            if (children && children.has(segName)) {
                                currentParentId = children.get(segName)!;
                                missingStartIdx = si + 1;
                            } else break;
                        }
                        if (missingStartIdx < pathSegments.length) {
                            newFolders = pathSegments.slice(missingStartIdx);
                            if (currentParentId !== "root") parentForNew = currentParentId;
                        }
                    }

                    // In deep mode, mark as selected if there's any recommendation (even if not moving)
                    const hasRecommendation = !!(m.recommendations?.suggestedTags?.length
                        || m.recommendations?.suggestedDocTypeCode
                        || m.recommendations?.suggestedRetentionSlug);

                    return {
                        ...m,
                        docId: resolvedDocId,
                        newFoldersToCreate: newFolders,
                        parentFolderIdForNew: parentForNew,
                        selected: m.shouldMove || hasRecommendation,
                    };
                });

                setReorgPlan(plan);
                setReorgStep("preview");
                toast.success(reorgMode === "deep_audit"
                    ? `Plan d'audit profond généré`
                    : `Plan de réorganisation généré`);
            }
        } catch (err) {
            console.error("[Reorg] AI error:", err);
            toast.error("Erreur lors de l'analyse IA.");
            setReorgStep("mode");
        }
    }, [documents, folders, folderTreeForReorg, convexOrgDoc, archiveCategories, documentTypes, reorgMode, reorganizeDocumentsAction, deepReorganizeAction]);

    // ─── Execute plan ───────────────────────────────────────────
    const handleExecuteReorg = useCallback(async () => {
        if (!reorgPlan) return;

        setReorgStep("executing");
        setReorgLoading(true);
        const selectedMoves = reorgPlan.moves.filter((m) => m.selected);
        let foldersCreated = 0;

        try {
            if (!convexOrgId) {
                toast.error("Organisation non trouvée. Rechargez la page.");
                setReorgStep("preview");
                setReorgLoading(false);
                return;
            }

            const realFolderIds = new Set(folders.map((f) => f.id));
            const isRealFolderId = (id: string | null | undefined): boolean =>
                !!id && !id.startsWith("__") && !id.startsWith("new_") && realFolderIds.has(id);

            // 1. Create new folders
            const createdFolderMap = new Map<string, string>();
            const movesWithFolders = selectedMoves.filter(m => m.shouldMove);
            for (let i = 0; i < movesWithFolders.length; i++) {
                const move = movesWithFolders[i];
                setReorgProgress(((i + 1) / (movesWithFolders.length + selectedMoves.length)) * 50);

                if (move.newFoldersToCreate.length > 0) {
                    let parentId: Id<"folders"> | undefined = undefined;
                    if (isRealFolderId(move.parentFolderIdForNew)) parentId = move.parentFolderIdForNew as Id<"folders">;
                    else if (isRealFolderId(move.targetFolderId)) parentId = move.targetFolderId as Id<"folders">;
                    if (!parentId && move.parentFolderIdForNew && createdFolderMap.has(move.parentFolderIdForNew))
                        parentId = createdFolderMap.get(move.parentFolderIdForNew) as Id<"folders">;

                    for (const folderName of move.newFoldersToCreate) {
                        const cacheKey = `${parentId ?? "root"}_${folderName}`;
                        if (createdFolderMap.has(cacheKey)) {
                            parentId = createdFolderMap.get(cacheKey) as Id<"folders">;
                            continue;
                        }
                        try {
                            const folderResult = await getOrCreateFolderMut({
                                name: folderName,
                                organizationId: convexOrgId!,
                                createdBy: user?.email || "system",
                                parentFolderId: parentId,
                            });
                            createdFolderMap.set(cacheKey, folderResult.id as string);
                            parentId = folderResult.id;
                            if (folderResult.created) foldersCreated++;
                        } catch (e) {
                            console.warn(`[Reorg] Failed to create folder "${folderName}":`, e);
                        }
                    }
                }
            }

            // 2. Build batch recommendations
            setReorgProgress(55);
            const docIds = new Set(documents.map((d) => d.id));
            const docTypeByCode = new Map(
                (documentTypes ?? []).map((dt: Record<string, unknown>) => [String(dt.code), String(dt._id)])
            );

            const recommendations = selectedMoves
                .filter(m => docIds.has(m.docId))
                .map(m => {
                    // Resolve target folder
                    let targetFolderId: string | undefined = undefined;
                    if (m.shouldMove) {
                        if (m.newFoldersToCreate.length > 0) {
                            let parentId = m.parentFolderIdForNew ?? m.targetFolderId;
                            for (const fn of m.newFoldersToCreate) {
                                const key = `${parentId ?? "root"}_${fn}`;
                                if (createdFolderMap.has(key)) parentId = createdFolderMap.get(key)!;
                            }
                            if (parentId && !parentId.startsWith("__")) targetFolderId = parentId;
                        } else if (isRealFolderId(m.targetFolderId)) {
                            targetFolderId = m.targetFolderId;
                        } else if (createdFolderMap.has(m.targetFolderId)) {
                            targetFolderId = createdFolderMap.get(m.targetFolderId);
                        }
                    }

                    // Resolve document type ID from code
                    const docTypeId = m.recommendations?.suggestedDocTypeCode
                        ? docTypeByCode.get(m.recommendations.suggestedDocTypeCode) ?? undefined
                        : undefined;

                    return {
                        docId: m.docId,
                        targetFolderId,
                        tags: m.recommendations?.suggestedTags,
                        documentTypeId: docTypeId,
                        archiveCategorySlug: m.recommendations?.suggestedRetentionSlug,
                    };
                });

            setReorgProgress(70);

            // 3. Apply all recommendations in one batch
            const applyResult = await batchApplyAIMut({
                recommendations,
                userId: user?.email || "system",
            });

            setReorgProgress(100);
            setReorgResult({
                moved: applyResult.moved,
                foldersCreated,
                tagged: applyResult.tagged,
                typed: applyResult.typed,
                archived: applyResult.archived,
            });
            setReorgStep("done");
            const parts = [`${applyResult.moved} déplacé(s)`];
            if (foldersCreated > 0) parts.push(`${foldersCreated} dossier(s) créé(s)`);
            if (applyResult.tagged > 0) parts.push(`${applyResult.tagged} tagué(s)`);
            if (applyResult.typed > 0) parts.push(`${applyResult.typed} typé(s)`);
            if (applyResult.archived > 0) parts.push(`${applyResult.archived} rétention(s) appliquée(s)`);
            toast.success(`Réorganisation terminée : ${parts.join(", ")}`);
        } catch (err) {
            console.error("[Reorg] Execution error:", err);
            toast.error("Erreur lors de la réorganisation.");
            setReorgStep("preview");
        }
        setReorgLoading(false);
    }, [reorgPlan, convexOrgId, folders, documents, documentTypes, user, getOrCreateFolderMut, batchApplyAIMut]);

    // ─── Toggle move selection ──────────────────────────────────
    const handleToggleMoveSelection = useCallback((index: number) => {
        setReorgPlan((prev) => {
            if (!prev) return prev;
            const newMoves = [...prev.moves];
            newMoves[index] = { ...newMoves[index], selected: !newMoves[index].selected };
            return { ...prev, moves: newMoves };
        });
    }, []);

    return {
        // State
        showReorgDialog,
        setShowReorgDialog,
        reorgStep,
        setReorgStep,
        reorgMode,
        setReorgMode,
        reorgPlan,
        setReorgPlan,
        reorgLoading,
        reorgProgress,
        reorgResult,

        // Handlers
        handleOpenReorgDialog,
        handleAnalyzeReorg,
        handleExecuteReorg,
        handleToggleMoveSelection,
    };
}
