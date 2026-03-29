"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { FileManagerFolder } from "@/components/modules/file-manager";

// ─── Types ──────────────────────────────────────────────────────

export type ImportStep = "select" | "analyzing" | "review" | "done";

export interface ImportFileItem {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    suggestedTags: string[];
    suggestedFolderId: string;
    suggestedFolderName: string;
    suggestedPath: string;
    newFoldersToCreate: string[];
    parentFolderIdForNew: string | null;
    reasoning: string;
    confidence: number;
    analyzed: boolean;
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

// ─── Params ─────────────────────────────────────────────────────

interface FolderTreeItem {
    id: string | Id<"folders">;
    name: string;
    path: string;
    depth: number;
    parentFolderId: string | Id<"folders"> | null;
    tags: string[];
    description?: string;
}

interface ConvexOrgDoc {
    config?: {
        classement?: {
            maxDepth?: number;
            depthStrategy?: string;
        };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface UseDocumentImportParams {
    folders: FileManagerFolder[];
    folderTreeWithPaths: FolderTreeItem[] | undefined;
    convexOrgId: Id<"organizations"> | null | undefined;
    convexOrgDoc: ConvexOrgDoc | null | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    classifyDocumentsAction: (args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createFromImportMut: (args: any) => Promise<any>;
    generateUploadUrlMut: () => Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOrCreateFolderMut: (args: any) => Promise<{ id: Id<"folders">; created: boolean }>;
    user: { email?: string | null; displayName?: string | null } | null | undefined;
    setDocuments: React.Dispatch<React.SetStateAction<DocItem[]>>;
}

// ─── Constants ──────────────────────────────────────────────────

const MAX_IMPORT_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 2000 * 1024 * 1024; // 2 Go for videos

// ─── Hook ───────────────────────────────────────────────────────

export function useDocumentImport({
    folders,
    folderTreeWithPaths,
    convexOrgId,
    convexOrgDoc,
    classifyDocumentsAction,
    createFromImportMut,
    generateUploadUrlMut,
    getOrCreateFolderMut,
    user,
    setDocuments,
}: UseDocumentImportParams) {
    // ─── State ──────────────────────────────────────────────────
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [importFiles, setImportFiles] = useState<ImportFileItem[]>([]);
    const [importStep, setImportStep] = useState<ImportStep>("select");
    const [importLoading, setImportLoading] = useState(false);

    // ─── Handlers ───────────────────────────────────────────────

    const handleImportFilesSelected = useCallback((fileList: FileList | null) => {
        if (!fileList) return;
        const newFiles: ImportFileItem[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const maxSize = file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMPORT_SIZE;
            if (file.size > maxSize) {
                toast.error(`"${file.name}" dépasse la taille maximum (${file.type.startsWith("video/") ? "2 Go" : "50 Mo"})`);
                continue;
            }
            newFiles.push({
                id: `import-${Date.now()}-${i}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                suggestedTags: [],
                suggestedFolderId: null as unknown as string,
                suggestedFolderName: "",
                suggestedPath: "",
                newFoldersToCreate: [],
                parentFolderIdForNew: null,
                reasoning: "",
                confidence: 0,
                analyzed: false,
            });
        }
        setImportFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleImportFolderSelected = useCallback(async (items: DataTransferItemList) => {
        const collectFiles = async (
            entry: FileSystemEntry,
            path: string = ""
        ): Promise<{ file: File; path: string }[]> => {
            if (entry.isFile) {
                return new Promise((resolve) => {
                    (entry as FileSystemFileEntry).file((file) => {
                        resolve([{ file, path }]);
                    });
                });
            }
            if (entry.isDirectory) {
                const dirReader = (entry as FileSystemDirectoryEntry).createReader();
                return new Promise((resolve) => {
                    dirReader.readEntries(async (entries) => {
                        const allFiles: { file: File; path: string }[] = [];
                        for (const child of entries) {
                            const subPath = path ? `${path}/${entry.name}` : entry.name;
                            const childFiles = await collectFiles(child, subPath);
                            allFiles.push(...childFiles);
                        }
                        resolve(allFiles);
                    });
                });
            }
            return [];
        };

        const allFiles: { file: File; path: string }[] = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry?.();
            if (entry) {
                const files = await collectFiles(entry);
                allFiles.push(...files);
            }
        }

        const newFiles: ImportFileItem[] = allFiles
            .filter((f) => {
                const maxSize = f.file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMPORT_SIZE;
                return f.file.size <= maxSize;
            })
            .map((f, i) => ({
                id: `import-${Date.now()}-${i}`,
                file: f.file,
                name: f.path ? `${f.path}/${f.file.name}` : f.file.name,
                size: f.file.size,
                type: f.file.type || "application/octet-stream",
                suggestedTags: [],
                suggestedFolderId: null as unknown as string,
                suggestedFolderName: "",
                suggestedPath: "",
                newFoldersToCreate: [],
                parentFolderIdForNew: null,
                reasoning: "",
                confidence: 0,
                analyzed: false,
            }));

        if (newFiles.length === 0) {
            toast.error("Aucun fichier trouvé dans le dossier (ou tous dépassent 50 Mo)");
            return;
        }

        setImportFiles((prev) => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} fichier${newFiles.length > 1 ? "s" : ""} trouvé${newFiles.length > 1 ? "s" : ""} dans le dossier`);
    }, []);

    const handleRemoveImportFile = useCallback((fileId: string) => {
        setImportFiles((prev) => prev.filter((f) => f.id !== fileId));
    }, []);

    const handleAnalyzeWithAI = useCallback(async () => {
        setImportStep("analyzing");

        try {
            // Build folder tree context for AI
            const treeData = (folderTreeWithPaths ?? []).map((f) => ({
                id: String(f.id),
                name: f.name,
                path: f.path,
                depth: f.depth,
                parentFolderId: f.parentFolderId ? String(f.parentFolderId) : null,
                tags: f.tags,
                description: f.description,
            }));

            const fileNames = importFiles.map((f) => f.name);

            // Call Gemini for intelligent, folder-aware classification
            const depthConfig = convexOrgDoc?.config?.classement
                ? { maxDepth: convexOrgDoc.config.classement.maxDepth ?? 3, depthStrategy: convexOrgDoc.config.classement.depthStrategy ?? "intelligente" }
                : undefined;

            const result = await classifyDocumentsAction({
                fileNames,
                folderTree: treeData,
                depthConfig,
            });

            if (result.error) {
                console.warn("[iDocument AI] Classification error:", result.error);
                toast.error("L'IA n'a pas pu analyser les fichiers. Classement par défaut appliqué.");
                // Fallback: mark all as analyzed with defaults
                setImportFiles((prev) =>
                    prev.map((f) => ({ ...f, analyzed: true, confidence: 50 }))
                );
            } else if (result.classifications?.length > 0) {
                // Map AI results back to import files
                setImportFiles((prev) =>
                    prev.map((f, idx) => {
                        const classification = result.classifications[idx];
                        if (!classification) return { ...f, analyzed: true };

                        // Resolve the suggested folder name from tree
                        const suggestedFolder = treeData.find((td) => td.id === classification.suggestedFolderId);

                        return {
                            ...f,
                            suggestedTags: classification.suggestedTags ?? ["Document", "Import"],
                            suggestedFolderId: classification.suggestedFolderId ?? null,
                            suggestedFolderName: suggestedFolder?.name ?? "",
                            suggestedPath: classification.suggestedPath ?? "",
                            newFoldersToCreate: classification.newFoldersToCreate ?? [],
                            parentFolderIdForNew: classification.parentFolderIdForNew ?? null,
                            reasoning: classification.reasoning ?? "",
                            confidence: Math.round((classification.confidence ?? 0.7) * 100),
                            analyzed: true,
                        };
                    })
                );
                toast.success(`🤖 ${result.classifications.length} fichier(s) classé(s) par l'IA Gemini`);
            }
        } catch (err) {
            console.error("[iDocument AI] Classification call failed:", err);
            toast.error("Erreur lors de l'analyse IA. Classement par défaut appliqué.");
            setImportFiles((prev) =>
                prev.map((f) => ({ ...f, analyzed: true, confidence: 50 }))
            );
        }

        setImportStep("review");
    }, [importFiles, folderTreeWithPaths, classifyDocumentsAction, convexOrgDoc]);

    const handleUpdateImportTag = useCallback((fileId: string, tagIndex: number, newTag: string) => {
        setImportFiles((prev) =>
            prev.map((f) => {
                if (f.id === fileId) {
                    const newTags = [...f.suggestedTags];
                    if (newTag) newTags[tagIndex] = newTag;
                    else newTags.splice(tagIndex, 1);
                    return { ...f, suggestedTags: newTags };
                }
                return f;
            })
        );
    }, []);

    const handleUpdateImportFolder = useCallback((fileId: string, folderId: string) => {
        const folder = folders.find((f) => f.id === folderId);
        setImportFiles((prev) =>
            prev.map((f) => f.id === fileId ? { ...f, suggestedFolderId: folderId, suggestedFolderName: folder?.name || "" } : f)
        );
    }, [folders]);

    const handleRemoveImportTag = useCallback((fileId: string, tagIndex: number) => {
        handleUpdateImportTag(fileId, tagIndex, "");
    }, [handleUpdateImportTag]);

    const handleConfirmImport = useCallback(async () => {
        if (!convexOrgId || !user) {
            // Fallback local-only (pas de Convex)
            const newDocs: DocItem[] = importFiles.map((f) => ({
                id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: f.name.replace(/\.[^.]+$/, ""),
                excerpt: `Document importé — Classé automatiquement par l'IA avec ${f.confidence}% de confiance.`,
                author: "Vous",
                authorInitials: "V",
                updatedAt: "À l'instant",
                updatedAtTs: Date.now(),
                status: "draft" as DocStatus,
                tags: f.suggestedTags,
                version: 1,
                folderId: f.suggestedFolderId,
            }));
            setDocuments((prev) => [...newDocs, ...prev]);
            toast.success(`${importFiles.length} document${importFiles.length > 1 ? "s" : ""} importé${importFiles.length > 1 ? "s" : ""} (local)`);
            setImportFiles([]);
            setImportStep("select");
            setShowImportDialog(false);
            return;
        }

        setImportLoading(true);
        const createdBy = user.email || "import";
        let successCount = 0;
        let foldersCreated = 0;

        try {
            for (const importFile of importFiles) {
                // 1. Resolve destination folder (AI-powered)
                let targetFolderId: Id<"folders"> | undefined;
                const suggestedId = importFile.suggestedFolderId;

                // Determine if the suggestedId is a real Convex ID or a system pseudo-ID
                const isConvexId = suggestedId && !suggestedId.startsWith("__");

                if (isConvexId) {
                    // Start with the AI-suggested existing folder
                    targetFolderId = suggestedId as Id<"folders">;
                }

                // 1b. Create sub-folders suggested by AI (cascade creation)
                if (importFile.newFoldersToCreate && importFile.newFoldersToCreate.length > 0) {
                    // Determine the parent for new folders: AI suggestion or existing target
                    let parentId: Id<"folders"> | undefined =
                        importFile.parentFolderIdForNew && !importFile.parentFolderIdForNew.startsWith("__")
                            ? (importFile.parentFolderIdForNew as Id<"folders">)
                            : targetFolderId;

                    for (const folderName of importFile.newFoldersToCreate) {
                        try {
                            const folderResult = await getOrCreateFolderMut({
                                name: folderName,
                                organizationId: convexOrgId,
                                createdBy,
                                parentFolderId: parentId,
                            });
                            parentId = folderResult.id;
                            if (folderResult.created) foldersCreated++;
                        } catch (folderErr) {
                            console.warn(`[iDocument] Failed to create sub-folder "${folderName}":`, folderErr);
                        }
                    }
                    // The final created folder is the actual destination
                    targetFolderId = parentId;
                } else if (!isConvexId) {
                    // No real folder assigned — check for folder paths in filename
                    const pathParts = importFile.name.split("/");
                    if (pathParts.length > 1) {
                        // Has folder path — create each level
                        let parentId: Id<"folders"> | undefined;
                        for (let i = 0; i < pathParts.length - 1; i++) {
                            const folderResult = await getOrCreateFolderMut({
                                name: pathParts[i],
                                organizationId: convexOrgId,
                                createdBy,
                                parentFolderId: parentId,
                            });
                            parentId = folderResult.id;
                            if (folderResult.created) foldersCreated++;
                        }
                        targetFolderId = parentId;
                    }
                }

                // 2. Upload file to Convex Storage
                const uploadUrl = await generateUploadUrlMut();
                const uploadResult = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": importFile.file.type || "application/octet-stream" },
                    body: importFile.file,
                });

                if (!uploadResult.ok) {
                    toast.error(`Erreur lors de l'upload de "${importFile.name.split("/").pop()}"`);
                    continue;
                }

                const { storageId } = await uploadResult.json();

                // 3. Create document record in Convex
                const fileName = importFile.name.split("/").pop() || importFile.name;
                await createFromImportMut({
                    title: fileName.replace(/\.[^.]+$/, ""),
                    organizationId: convexOrgId,
                    createdBy,
                    tags: importFile.suggestedTags,
                    folderId: targetFolderId,
                    parentFolderId: targetFolderId ? undefined : undefined,
                    storageId: storageId as Id<"_storage">,
                    fileName,
                    fileSize: importFile.size,
                    mimeType: importFile.type || "application/octet-stream",
                    excerpt: `Document importé — Classé automatiquement par l'IA avec ${importFile.confidence}% de confiance.`,
                });

                successCount++;
            }

            const parts = [`${successCount} document${successCount > 1 ? "s" : ""} importé${successCount > 1 ? "s" : ""} avec succès`];
            if (foldersCreated > 0) parts.push(`${foldersCreated} dossier${foldersCreated > 1 ? "s" : ""} créé${foldersCreated > 1 ? "s" : ""}`);

            toast.success(parts.join(" · "), {
                description: "Les fichiers sont persistés et synchronisés dans l'arborescence.",
            });
        } catch (err) {
            console.error("[iDocument] Import error:", err);
            toast.error("Erreur lors de l'import", {
                description: `${successCount} fichier${successCount > 1 ? "s" : ""} importé${successCount > 1 ? "s" : ""} avant l'erreur.`,
            });
        } finally {
            setImportLoading(false);
            setImportFiles([]);
            setImportStep("select");
            setShowImportDialog(false);
        }
    }, [importFiles, convexOrgId, user, generateUploadUrlMut, createFromImportMut, getOrCreateFolderMut, setDocuments]);

    const handleCloseImport = useCallback(() => {
        setImportFiles([]);
        setImportStep("select");
        setShowImportDialog(false);
    }, []);

    return {
        // State
        showImportDialog,
        setShowImportDialog,
        importFiles,
        setImportFiles,
        importStep,
        setImportStep,
        importLoading,

        // Handlers
        handleImportFilesSelected,
        handleImportFolderSelected,
        handleRemoveImportFile,
        handleAnalyzeWithAI,
        handleUpdateImportTag,
        handleUpdateImportFolder,
        handleRemoveImportTag,
        handleConfirmImport,
        handleCloseImport,
    };
}
