// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: FinderColumnView
// Navigation en colonnes dynamiques — Style macOS Finder
// Nombre de colonnes illimité selon la profondeur de l'arborescence
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronRight, FolderOpen, FileText } from "lucide-react";
import DragOverlayCard from "./DragOverlayCard";
import type { FileManagerFolder, FileManagerFile, DragMoveEvent } from "./types";

/* ─── Types internes ──────────────────────── */

/** Chaque niveau de sélection dans le chemin */
interface PathSegment {
    /** ID du dossier parent dont on affiche le contenu */
    folderId: string;
    /** ID de l'élément sélectionné dans cette colonne (dossier ou fichier) */
    selectedId: string;
    /** Type de l'élément sélectionné */
    selectedType: "file" | "folder";
}

/* ─── Draggable + Droppable column item ───── */

function ColumnFolderItem({
    folder,
    isSelected,
    onClick,
    isDragOverTarget,
    renderIcon,
}: {
    folder: FileManagerFolder;
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    isDragOverTarget: boolean;
    renderIcon?: (folder: FileManagerFolder) => React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: `col-folder-${folder.id}`,
        data: { type: "folder", id: folder.id, name: folder.name },
        disabled: folder.isSystem,
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `col-drop-folder-${folder.id}`,
        data: { type: "folder", id: folder.id },
    });

    const combinedRef = (node: HTMLButtonElement | null) => {
        setDragRef(node);
        setDropRef(node);
    };

    const isHighlighted = isOver || isDragOverTarget;

    return (
        <button
            ref={combinedRef}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                isDragging ? "opacity-30" : ""
            } ${
                isSelected
                    ? "bg-violet-500/10 text-violet-300"
                    : isHighlighted
                        ? "bg-violet-500/5 border-l-2 border-violet-500"
                        : "hover:bg-white/[0.03] text-foreground"
            }`}
            style={{ touchAction: "none" }}
        >
            {renderIcon
                ? renderIcon(folder)
                : <FolderOpen className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            }
            <span className="truncate flex-1 text-left font-medium">{folder.name}</span>
            {folder.isSystem && (
                <span className="text-[10px] text-zinc-500 bg-zinc-500/10 px-1 py-0.5 rounded shrink-0">
                    Sys
                </span>
            )}
            <span className="text-[10px] text-muted-foreground shrink-0">{folder.fileCount}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        </button>
    );
}

function ColumnFileItem({
    file,
    isSelected,
    onClick,
    renderIcon,
}: {
    file: FileManagerFile;
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    renderIcon?: (file: FileManagerFile) => React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
    } = useDraggable({
        id: `col-file-${file.id}`,
        data: { type: "file", id: file.id, name: file.name },
    });

    return (
        <button
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                isDragging ? "opacity-30" : ""
            } ${
                isSelected
                    ? "bg-violet-500/10 text-violet-300"
                    : "hover:bg-white/[0.03] text-foreground"
            }`}
            style={{ touchAction: "none" }}
        >
            {renderIcon
                ? renderIcon(file)
                : <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            }
            <span className="truncate flex-1 text-left">{file.name}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{file.size}</span>
        </button>
    );
}

/* ─── Droppable pane zone (zone de drop par colonne) ─── */

function DroppablePaneZone({
    id,
    children,
    className,
}: {
    id: string;
    children: React.ReactNode;
    className?: string;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `pane-drop-${id}`,
        data: { type: "folder", id },
    });

    return (
        <div
            ref={setNodeRef}
            className={`${className ?? ""} ${isOver ? "bg-violet-500/5 ring-1 ring-inset ring-violet-500/20" : ""}`}
        >
            {children}
        </div>
    );
}

/* ─── Single column component ─────────────── */

function Column({
    title,
    folderId,
    folders,
    files,
    selectedId,
    overFolderId,
    onSelectFolder,
    onSelectFile,
    renderFolderIcon,
    renderFileIcon,
    externalSelectedIds,
}: {
    title: string;
    folderId: string;
    folders: FileManagerFolder[];
    files: FileManagerFile[];
    selectedId: string | null;
    overFolderId: string | null;
    onSelectFolder: (id: string, event: React.MouseEvent) => void;
    onSelectFile: (id: string, event: React.MouseEvent) => void;
    renderFolderIcon?: (folder: FileManagerFolder) => React.ReactNode;
    renderFileIcon?: (file: FileManagerFile) => React.ReactNode;
    externalSelectedIds?: Set<string>;
}) {
    return (
        <DroppablePaneZone
            id={folderId}
            className="w-[260px] min-w-[220px] flex-shrink-0 border-r border-white/5 overflow-y-auto transition-colors"
        >
            <div className="px-3 py-2 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                    {title}
                </span>
            </div>
            <div className="divide-y divide-white/[0.02]">
                {folders.map((folder) => (
                    <ColumnFolderItem
                        key={folder.id}
                        folder={folder}
                        isSelected={(externalSelectedIds?.has(folder.id)) || selectedId === folder.id}
                        onClick={(e) => onSelectFolder(folder.id, e)}
                        isDragOverTarget={overFolderId === folder.id}
                        renderIcon={renderFolderIcon}
                    />
                ))}
                {files.map((file) => (
                    <ColumnFileItem
                        key={file.id}
                        file={file}
                        isSelected={(externalSelectedIds?.has(file.id)) || selectedId === file.id}
                        onClick={(e) => onSelectFile(file.id, e)}
                        renderIcon={renderFileIcon}
                    />
                ))}
                {folders.length === 0 && files.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground/40">
                        <span className="text-xs">Dossier vide</span>
                    </div>
                )}
            </div>
        </DroppablePaneZone>
    );
}

/* ─── File preview panel (dernière colonne quand fichier sélectionné) ─── */

function FilePreviewPane({
    file,
    renderFilePreview,
}: {
    file: FileManagerFile;
    renderFilePreview?: (file: FileManagerFile) => React.ReactNode;
}) {
    if (renderFilePreview) {
        return (
            <div className="w-[300px] min-w-[260px] flex-shrink-0 overflow-y-auto">
                {renderFilePreview(file)}
            </div>
        );
    }

    return (
        <div className="w-[300px] min-w-[260px] flex-shrink-0 overflow-y-auto">
            <div className="p-4 space-y-4">
                <div className="flex flex-col items-center py-8">
                    <div className="h-16 w-16 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                        <FileText className="h-8 w-8 text-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-center">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {file.type.toUpperCase()} · {file.size}
                    </p>
                </div>
                <div className="space-y-2 px-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Type</span>
                        <span>{file.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Taille</span>
                        <span>{file.size}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Date</span>
                        <span>{file.date}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══ MAIN COMPONENT ══════════════════════ */

interface FinderColumnViewProps {
    rootFolders: FileManagerFolder[];
    rootFiles: FileManagerFile[];
    getFolderContents: (folderId: string) => {
        folders: FileManagerFolder[];
        files: FileManagerFile[];
    };
    onMoveItem: (event: DragMoveEvent) => void;
    renderFilePreview?: (file: FileManagerFile) => React.ReactNode;
    renderFolderIcon?: (folder: FileManagerFolder) => React.ReactNode;
    renderFileIcon?: (file: FileManagerFile) => React.ReactNode;
    accentColor?: string;
    /** Callback quand un fichier est cliqué (ex: ouvrir document) */
    onFileOpen?: (fileId: string) => void;
    /** Multi-sélection : callback quand un item est cliqué (avec modificateurs) */
    onItemClick?: (id: string, type: "file" | "folder", event: React.MouseEvent) => void;
    /** Set des IDs sélectionnés */
    selectedIds?: Set<string>;
    /** ID du dossier courant — pour pré-naviguer quand on switch de vue */
    currentFolderId?: string | null;
    /** Map id → parentFolderId pour remonter la hiérarchie */
    folderParentMap?: Map<string, string | null>;
}

export default function FinderColumnView({
    rootFolders,
    rootFiles,
    getFolderContents,
    onMoveItem,
    renderFilePreview,
    renderFolderIcon,
    renderFileIcon,
    onFileOpen,
    onItemClick,
    selectedIds,
    currentFolderId,
    folderParentMap,
}: FinderColumnViewProps) {
    // ─── Path state: tableau de segments de navigation ───
    // Chaque segment représente une sélection dans une colonne
    // path[0] = sélection dans la colonne racine
    // path[1] = sélection dans la 2ème colonne, etc.

    // Construire le path initial depuis currentFolderId en remontant la hiérarchie
    const buildInitialPath = useCallback((): PathSegment[] => {
        if (!currentFolderId) return [];

        // Cas 1 : dossier système racine (ex: __mes-documents, __brouillons, __poubelle)
        // → Simplement le sélectionner dans la première colonne
        if (currentFolderId.startsWith("__")) {
            const isRootFolder = rootFolders.some((f) => f.id === currentFolderId);
            if (isRootFolder) {
                return [{
                    folderId: "__root",
                    selectedId: currentFolderId,
                    selectedType: "folder" as const,
                }];
            }
            return [];
        }

        // Cas 2 : dossier Convex — remonter la chaîne des parents
        if (!folderParentMap) return [];

        const chain: string[] = [];
        let cursor: string | null = currentFolderId;
        while (cursor && !cursor.startsWith("__")) {
            chain.unshift(cursor);
            cursor = folderParentMap.get(cursor) ?? null;
        }

        if (chain.length === 0) return [];

        // Vérifier que le premier élément est bien un dossier racine (parentFolderId === null)
        const firstIsRoot = rootFolders.some((f) => f.id === chain[0]);
        if (!firstIsRoot) return [];

        // Construire les PathSegments
        const segments: PathSegment[] = chain.map((folderId, i) => ({
            folderId: i === 0 ? "__root" : chain[i - 1],
            selectedId: folderId,
            selectedType: "folder" as const,
        }));

        return segments;
    }, [currentFolderId, folderParentMap, rootFolders]);

    const [path, setPath] = useState<PathSegment[]>(() => buildInitialPath());
    const [selectedFile, setSelectedFile] = useState<{ file: FileManagerFile; depth: number } | null>(null);

    // Quand currentFolderId change (ex: switch de vue), recalculer le path
    const prevFolderRef = useRef<string | null | undefined>(currentFolderId);
    useEffect(() => {
        if (currentFolderId !== prevFolderRef.current) {
            prevFolderRef.current = currentFolderId;
            const newPath = buildInitialPath();
            if (newPath.length > 0) {
                setPath(newPath);
                setSelectedFile(null);
            }
        }
    }, [currentFolderId, buildInitialPath]);

    // Drag state
    const [activeItem, setActiveItem] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
    const [overFolderId, setOverFolderId] = useState<string | null>(null);

    // Ref pour le scroll horizontal automatique
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    // ─── Auto-scroll vers la droite quand le path change ───
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            // Petit délai pour laisser le DOM se mettre à jour
            requestAnimationFrame(() => {
                container.scrollTo({
                    left: container.scrollWidth,
                    behavior: "smooth",
                });
            });
        }
    }, [path.length, selectedFile]);

    // ─── Construire les données de chaque colonne ───
    // Colonne 0 = rootFolders + rootFiles
    // Colonne N = contenu du dossier sélectionné dans la colonne N-1
    const columns = React.useMemo(() => {
        const cols: Array<{
            title: string;
            folderId: string; // ID du dossier dont on affiche le contenu (pour le drop)
            folders: FileManagerFolder[];
            files: FileManagerFile[];
            selectedId: string | null;
            depth: number;
        }> = [];

        // Colonne racine
        cols.push({
            title: "Dossiers",
            folderId: "__root",
            folders: rootFolders,
            files: rootFiles,
            selectedId: path.length > 0 ? path[0].selectedId : null,
            depth: 0,
        });

        // Colonnes suivantes selon le path
        for (let i = 0; i < path.length; i++) {
            const segment = path[i];
            // N'ajouter une colonne que si la sélection est un dossier
            if (segment.selectedType === "folder") {
                const contents = getFolderContents(segment.selectedId);
                const folderName = (() => {
                    // Trouver le nom du dossier sélectionné
                    if (i === 0) {
                        return rootFolders.find(f => f.id === segment.selectedId)?.name ?? "Contenu";
                    }
                    const prevContents = getFolderContents(path[i - 1].selectedId);
                    return prevContents.folders.find(f => f.id === segment.selectedId)?.name ?? "Contenu";
                })();

                cols.push({
                    title: folderName,
                    folderId: segment.selectedId,
                    folders: contents.folders,
                    files: contents.files,
                    selectedId: (i + 1 < path.length) ? path[i + 1].selectedId : null,
                    depth: i + 1,
                });
            }
        }

        return cols;
    }, [rootFolders, rootFiles, path, getFolderContents]);

    // ─── Handlers de sélection ───

    const handleSelectFolder = useCallback((depth: number, folderId: string, event?: React.MouseEvent) => {
        // Si Cmd/Ctrl ou Shift → multi-sélection sans naviguer
        if (event && (event.metaKey || event.ctrlKey || event.shiftKey) && onItemClick) {
            onItemClick(folderId, "folder", event);
            return;
        }

        // Sélection simple avec navigation
        if (onItemClick && event) onItemClick(folderId, "folder", event);
        setSelectedFile(null);

        setPath(prev => {
            const newPath = prev.slice(0, depth);
            newPath.push({
                folderId: depth === 0 ? "__root" : prev[depth - 1].selectedId,
                selectedId: folderId,
                selectedType: "folder",
            });
            return newPath;
        });
    }, [onItemClick]);

    const handleSelectFile = useCallback((depth: number, fileId: string, allFiles: FileManagerFile[], event?: React.MouseEvent) => {
        // Si Cmd/Ctrl ou Shift → multi-sélection sans navigation
        if (event && (event.metaKey || event.ctrlKey || event.shiftKey) && onItemClick) {
            onItemClick(fileId, "file", event);
            return;
        }

        if (onItemClick && event) onItemClick(fileId, "file", event);

        // Tronquer le path à ce niveau (pas de sous-colonne pour un fichier)
        setPath(prev => {
            const newPath = prev.slice(0, depth);
            newPath.push({
                folderId: depth === 0 ? "__root" : prev[depth - 1].selectedId,
                selectedId: fileId,
                selectedType: "file",
            });
            return newPath;
        });

        // Trouver le fichier pour le preview
        const file = allFiles.find(f => f.id === fileId);
        if (file) {
            setSelectedFile({ file, depth });
        }
    }, [onItemClick]);

    // ─── Drag & Drop handlers ───

    const handleDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current;
        if (data) {
            setActiveItem({
                id: data.id as string,
                type: data.type as "file" | "folder",
                name: data.name as string,
            });
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const overId = event.over?.data.current?.id as string | undefined;
        const overType = event.over?.data.current?.type as string | undefined;
        if (overType === "folder" && overId) {
            setOverFolderId(overId);
        } else {
            setOverFolderId(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const activeData = event.active.data.current;
        const overData = event.over?.data.current;
        if (activeData && overData && overData.type === "folder") {
            const activeId = activeData.id as string;
            const targetId = overData.id as string;
            if (activeId !== targetId) {
                onMoveItem({
                    itemId: activeId,
                    itemType: activeData.type as "file" | "folder",
                    targetFolderId: targetId,
                });
            }
        }
        setActiveItem(null);
        setOverFolderId(null);
    };

    const handleDragCancel = () => {
        setActiveItem(null);
        setOverFolderId(null);
    };

    // ─── Déterminer si on affiche un preview fichier en dernière position ───
    const showFilePreview = selectedFile && path.length > 0 && path[path.length - 1].selectedType === "file";

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                {/* ─── Breadcrumb / fil d'Ariane ─── */}
                {path.length > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 bg-white/[0.02] overflow-x-auto">
                        <button
                            onClick={() => { setPath([]); setSelectedFile(null); }}
                            className="text-[10px] text-muted-foreground hover:text-violet-400 transition-colors shrink-0"
                        >
                            iDocument
                        </button>
                        {path.map((segment, i) => {
                            // Find the name of the selected item
                            const name = (() => {
                                if (i === 0) {
                                    const f = rootFolders.find(f => f.id === segment.selectedId);
                                    if (f) return f.name;
                                    const file = rootFiles.find(f => f.id === segment.selectedId);
                                    return file?.name ?? segment.selectedId;
                                }
                                const parentContents = getFolderContents(path[i - 1].selectedId);
                                const f = parentContents.folders.find(f => f.id === segment.selectedId);
                                if (f) return f.name;
                                const file = parentContents.files.find(f => f.id === segment.selectedId);
                                return file?.name ?? segment.selectedId;
                            })();

                            return (
                                <React.Fragment key={i}>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                                    <button
                                        onClick={() => {
                                            if (segment.selectedType === "folder") {
                                                setPath(prev => prev.slice(0, i + 1));
                                                setSelectedFile(null);
                                            }
                                        }}
                                        className={`text-[10px] shrink-0 transition-colors ${
                                            i === path.length - 1
                                                ? "text-violet-400 font-medium"
                                                : "text-muted-foreground hover:text-violet-400"
                                        }`}
                                    >
                                        {name}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                {/* ─── Colonnes scrollables ─── */}
                <div
                    ref={scrollContainerRef}
                    className="flex h-[500px] overflow-x-auto overflow-y-hidden scroll-smooth"
                    style={{ scrollbarWidth: "thin" }}
                >
                    {columns.map((col, index) => (
                        <Column
                            key={`${col.folderId}-${index}`}
                            title={col.title}
                            folderId={col.folderId}
                            folders={col.folders}
                            files={col.files}
                            selectedId={col.selectedId}
                            overFolderId={overFolderId}
                            onSelectFolder={(id, e) => handleSelectFolder(col.depth, id, e)}
                            onSelectFile={(id, e) => handleSelectFile(col.depth, id, col.files, e)}
                            renderFolderIcon={renderFolderIcon}
                            renderFileIcon={renderFileIcon}
                            externalSelectedIds={selectedIds}
                        />
                    ))}

                    {/* ─── Preview du fichier sélectionné (dernière colonne) ─── */}
                    {showFilePreview && selectedFile && (
                        <FilePreviewPane
                            file={selectedFile.file}
                            renderFilePreview={renderFilePreview}
                        />
                    )}

                    {/* ─── Placeholder si rien n'est sélectionné (au-delà de la 1ère col) ─── */}
                    {columns.length === 1 && !showFilePreview && (
                        <div className="flex-1 min-w-[240px] flex items-center justify-center text-muted-foreground/30">
                            <div className="text-center">
                                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <span className="text-xs">Sélectionnez un dossier</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={null}>
                {activeItem && (
                    <DragOverlayCard
                        name={activeItem.name}
                        type={activeItem.type}
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
}
