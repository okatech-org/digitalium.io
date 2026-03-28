// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: FinderListView
// Vue liste avec dossiers dépliables — Style macOS Finder
// Triangles de dépliage, indentation, ouverture de fichiers
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback } from "react";
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
import { ChevronUp, ChevronDown, ChevronRight, FolderOpen, GripVertical } from "lucide-react";
import DragOverlayCard from "./DragOverlayCard";
import type { FileManagerFolder, FileManagerFile, DragMoveEvent, ListColumn } from "./types";

/* ─── Draggable+Droppable folder row ────── */

function DraggableFolderRow({
    folder,
    children,
    isDragOverTarget,
}: {
    folder: FileManagerFolder;
    children: (isDragOver: boolean) => React.ReactNode;
    isDragOverTarget: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: `folder-${folder.id}`,
        data: { type: "folder", id: folder.id, name: folder.name },
        disabled: folder.isSystem,
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `drop-folder-${folder.id}`,
        data: { type: "folder", id: folder.id },
    });

    const combinedRef = (node: HTMLTableRowElement | null) => {
        setDragRef(node);
        setDropRef(node);
    };

    return (
        <tr
            ref={combinedRef}
            {...attributes}
            {...listeners}
            className={`transition-all ${isDragging ? "opacity-30" : ""} ${
                (isOver || isDragOverTarget) ? "bg-violet-500/5" : ""
            }`}
            style={{ touchAction: "none" }}
        >
            {children(isOver || isDragOverTarget)}
        </tr>
    );
}

/* ─── Draggable file row ────────────────── */

function DraggableFileRow({
    file,
    children,
    onDoubleClick,
}: {
    file: FileManagerFile;
    children: React.ReactNode;
    onDoubleClick?: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
    } = useDraggable({
        id: `file-${file.id}`,
        data: { type: "file", id: file.id, name: file.name },
    });

    return (
        <tr
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onDoubleClick={onDoubleClick}
            className={`transition-opacity cursor-default ${isDragging ? "opacity-30" : "hover:bg-white/[0.02]"}`}
            style={{ touchAction: "none" }}
        >
            {children}
        </tr>
    );
}

/* ─── Recursive folder row with expand/collapse ─── */

function ExpandableFolderSection({
    folder,
    depth,
    columns,
    expandedFolders,
    selectedId,
    isItemSelected: isItemSelectedFn,
    overFolderId,
    onToggleExpand,
    onOpenFolder,
    onOpenFile,
    onSelect,
    getFolderContents,
    renderFolderIcon,
    renderFileIcon,
}: {
    folder: FileManagerFolder;
    depth: number;
    columns: ListColumn[];
    expandedFolders: Set<string>;
    selectedId: string | null;
    isItemSelected?: (id: string) => boolean;
    overFolderId: string | null;
    onToggleExpand: (folderId: string) => void;
    onOpenFolder: (folderId: string) => void;
    onOpenFile?: (fileId: string) => void;
    onSelect: (id: string, type?: "file" | "folder", event?: React.MouseEvent) => void;
    getFolderContents?: (folderId: string) => {
        folders: FileManagerFolder[];
        files: FileManagerFile[];
    };
    renderFolderIcon?: (folder: FileManagerFolder) => React.ReactNode;
    renderFileIcon?: (file: FileManagerFile) => React.ReactNode;
}) {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = isItemSelectedFn ? isItemSelectedFn(folder.id) : selectedId === folder.id;
    const contents = isExpanded && getFolderContents
        ? getFolderContents(folder.id)
        : { folders: [], files: [] };

    const hasChildren = getFolderContents
        ? (() => {
            const c = getFolderContents(folder.id);
            return c.folders.length > 0 || c.files.length > 0;
        })()
        : folder.fileCount > 0;

    return (
        <>
            {/* ─── Folder row ─── */}
            <DraggableFolderRow
                folder={folder}
                isDragOverTarget={overFolderId === folder.id}
            >
                {(isDragOver) => (
                    <>
                        <td className="py-2 px-1 w-8">
                            {!folder.isSystem && (
                                <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                            )}
                        </td>
                        {columns.map((col, ci) => (
                            <td
                                key={col.key}
                                className={`py-2 px-2 ${
                                    isDragOver && ci === 0
                                        ? "border-l-2 border-violet-500"
                                        : ""
                                } ${isSelected && ci === 0 ? "bg-violet-500/10 rounded-l" : ""}`}
                            >
                                {ci === 0 ? (
                                    <div
                                        className="flex items-center gap-1.5"
                                        style={{ paddingLeft: `${depth * 20}px` }}
                                    >
                                        {/* Triangle de dépliage macOS */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (hasChildren) onToggleExpand(folder.id);
                                            }}
                                            className={`shrink-0 p-0.5 rounded transition-all ${
                                                hasChildren
                                                    ? "hover:bg-white/10 text-muted-foreground"
                                                    : "text-transparent pointer-events-none"
                                            }`}
                                        >
                                            <ChevronRight
                                                className={`h-3 w-3 transition-transform duration-200 ${
                                                    isExpanded ? "rotate-90" : ""
                                                }`}
                                            />
                                        </button>

                                        {/* Icône + nom (clic = sélection, double-clic = navigation) */}
                                        <button
                                            onClick={(e) => onSelect(folder.id, "folder", e)}
                                            onDoubleClick={() => onOpenFolder(folder.id)}
                                            className="flex items-center gap-2 hover:text-violet-400 transition-colors min-w-0"
                                        >
                                            {renderFolderIcon
                                                ? renderFolderIcon(folder)
                                                : <FolderOpen className="h-4 w-4 text-violet-400 shrink-0" />
                                            }
                                            <span className="font-medium truncate">{folder.name}</span>
                                            {folder.isSystem && (
                                                <span className="text-[9px] text-zinc-500 bg-zinc-500/10 px-1.5 py-0.5 rounded shrink-0">
                                                    Système
                                                </span>
                                            )}
                                        </button>

                                        {/* Compteur d'éléments */}
                                        {hasChildren && (
                                            <span className="text-[10px] text-muted-foreground/50 shrink-0 ml-auto">
                                                {folder.fileCount}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    col.render
                                        ? col.render(folder)
                                        : <span className="text-muted-foreground">—</span>
                                )}
                            </td>
                        ))}
                    </>
                )}
            </DraggableFolderRow>

            {/* ─── Expanded children (récursif) ─── */}
            {isExpanded && (
                <>
                    {/* Sous-dossiers */}
                    {contents.folders.map((subFolder) => (
                        <ExpandableFolderSection
                            key={subFolder.id}
                            folder={subFolder}
                            depth={depth + 1}
                            columns={columns}
                            expandedFolders={expandedFolders}
                            selectedId={selectedId}
                            isItemSelected={isItemSelectedFn}
                            overFolderId={overFolderId}
                            onToggleExpand={onToggleExpand}
                            onOpenFolder={onOpenFolder}
                            onOpenFile={onOpenFile}
                            onSelect={onSelect}
                            getFolderContents={getFolderContents}
                            renderFolderIcon={renderFolderIcon}
                            renderFileIcon={renderFileIcon}
                        />
                    ))}

                    {/* Fichiers dans le dossier déplié */}
                    {contents.files.map((file) => {
                        const fileIsSelected = isItemSelectedFn ? isItemSelectedFn(file.id) : selectedId === file.id;
                        return (
                            <DraggableFileRow
                                key={file.id}
                                file={file}
                                onDoubleClick={() => onOpenFile?.(file.id)}
                            >
                                <td className="py-2 px-1 w-8">
                                    <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                                </td>
                                {columns.map((col, ci) => (
                                    <td
                                        key={col.key}
                                        className={`py-2 px-2 ${
                                            fileIsSelected && ci === 0
                                                ? "bg-violet-500/10 rounded-l"
                                                : ""
                                        }`}
                                    >
                                        {ci === 0 ? (
                                            <div
                                                className="flex items-center gap-2"
                                                style={{ paddingLeft: `${(depth + 1) * 20 + 18}px` }}
                                            >
                                                <button
                                                    onClick={(e) => onSelect(file.id, "file", e)}
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenFile?.(file.id);
                                                    }}
                                                    className="flex items-center gap-2 hover:text-violet-400 transition-colors min-w-0"
                                                >
                                                    {renderFileIcon
                                                        ? renderFileIcon(file)
                                                        : <span className="text-muted-foreground">📄</span>
                                                    }
                                                    <span className="font-medium truncate">{file.name}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            col.render
                                                ? col.render(file)
                                                : <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                ))}
                            </DraggableFileRow>
                        );
                    })}

                    {/* Dossier vide quand déplié */}
                    {contents.folders.length === 0 && contents.files.length === 0 && (
                        <tr>
                            <td className="py-1.5 px-1 w-8" />
                            <td
                                colSpan={columns.length}
                                className="py-1.5 px-2"
                            >
                                <span
                                    className="text-[10px] text-muted-foreground/40 italic"
                                    style={{ paddingLeft: `${(depth + 1) * 20 + 18}px` }}
                                >
                                    Dossier vide
                                </span>
                            </td>
                        </tr>
                    )}
                </>
            )}
        </>
    );
}

/* ═══ MAIN COMPONENT ══════════════════════ */

interface FinderListViewProps {
    folders: FileManagerFolder[];
    files: FileManagerFile[];
    columns: ListColumn[];
    onOpenFolder: (folderId: string) => void;
    onMoveItem: (event: DragMoveEvent) => void;
    sortBy: string;
    sortDir: "asc" | "desc";
    onSort: (column: string) => void;
    renderFolderIcon?: (folder: FileManagerFolder) => React.ReactNode;
    renderFileIcon?: (file: FileManagerFile) => React.ReactNode;
    emptyState?: React.ReactNode;
    /** Callback pour ouvrir un fichier (double-clic ou clic) */
    onOpenFile?: (fileId: string) => void;
    /** Fournir le contenu d'un dossier pour le dépliage inline */
    getFolderContents?: (folderId: string) => {
        folders: FileManagerFolder[];
        files: FileManagerFile[];
    };
    /** Multi-sélection : callback quand un item est cliqué (avec modificateurs) */
    onItemClick?: (id: string, type: "file" | "folder", event: React.MouseEvent) => void;
    /** Set des IDs sélectionnés (externe) — prioritaire sur la sélection interne */
    selectedIds?: Set<string>;
}

export default function FinderListView({
    folders,
    files,
    columns,
    onOpenFolder,
    onMoveItem,
    sortBy,
    sortDir,
    onSort,
    renderFolderIcon,
    renderFileIcon,
    emptyState,
    onOpenFile,
    getFolderContents,
    onItemClick,
    selectedIds: externalSelectedIds,
}: FinderListViewProps) {
    const [activeItem, setActiveItem] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
    const [overFolderId, setOverFolderId] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

    // Si la multi-sélection externe est fournie, l'utiliser; sinon fallback interne
    const isItemSelected = useCallback((id: string) => {
        if (externalSelectedIds) return externalSelectedIds.has(id);
        return internalSelectedId === id;
    }, [externalSelectedIds, internalSelectedId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const handleToggleExpand = useCallback((folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    }, []);

    const handleSelect = useCallback((id: string, type: "file" | "folder" = "file", event?: React.MouseEvent) => {
        if (onItemClick && event) {
            onItemClick(id, type, event);
        } else if (!externalSelectedIds) {
            setInternalSelectedId(prev => prev === id ? null : id);
        }
    }, [onItemClick, externalSelectedIds]);

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

    const dragCount = externalSelectedIds && activeItem && externalSelectedIds.has(activeItem.id)
        ? externalSelectedIds.size
        : 1;

    const handleDragEnd = (event: DragEndEvent) => {
        const activeData = event.active.data.current;
        const overData = event.over?.data.current;
        if (activeData && overData && overData.type === "folder") {
            const activeId = activeData.id as string;
            const targetId = overData.id as string;

            // Multi-sélection drag
            if (externalSelectedIds && externalSelectedIds.has(activeId) && externalSelectedIds.size > 1) {
                for (const itemId of Array.from(externalSelectedIds)) {
                    if (itemId !== targetId) {
                        const isFolder = folders.some(f => f.id === itemId);
                        onMoveItem({
                            itemId,
                            itemType: isFolder ? "folder" : "file",
                            targetFolderId: targetId,
                        });
                    }
                }
            } else if (activeId !== targetId) {
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

    const hasFolders = folders.length > 0;
    const hasFiles = files.length > 0;

    if (!hasFolders && !hasFiles && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="glass-card rounded-2xl p-5 overflow-x-auto border border-white/5">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="w-8 py-2 px-1" />
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`text-left py-2 px-2 ${col.sortable ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && onSort(col.key)}
                                >
                                    <span className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortBy === col.key && (
                                            sortDir === "asc"
                                                ? <ChevronUp className="h-3 w-3" />
                                                : <ChevronDown className="h-3 w-3" />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* ─── Dossiers avec dépliage récursif ─── */}
                        {folders.map((folder) => (
                            <ExpandableFolderSection
                                key={folder.id}
                                folder={folder}
                                depth={0}
                                columns={columns}
                                expandedFolders={expandedFolders}
                                selectedId={null}
                                isItemSelected={isItemSelected}
                                overFolderId={overFolderId}
                                onToggleExpand={handleToggleExpand}
                                onOpenFolder={onOpenFolder}
                                onOpenFile={onOpenFile}
                                onSelect={handleSelect}
                                getFolderContents={getFolderContents}
                                renderFolderIcon={renderFolderIcon}
                                renderFileIcon={renderFileIcon}
                            />
                        ))}

                        {/* ─── Séparateur ─── */}
                        {hasFolders && hasFiles && (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-1">
                                    <div className="border-b border-white/5" />
                                </td>
                            </tr>
                        )}

                        {/* ─── Fichiers racine (cliquables pour ouvrir) ─── */}
                        {files.map((file) => (
                            <DraggableFileRow
                                key={file.id}
                                file={file}
                                onDoubleClick={() => onOpenFile?.(file.id)}
                            >
                                <td className="py-2.5 px-1 w-8">
                                    <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                                </td>
                                {columns.map((col, ci) => (
                                    <td
                                        key={col.key}
                                        className={`py-2.5 px-2 ${
                                            isItemSelected(file.id) && ci === 0
                                                ? "bg-violet-500/10 rounded-l"
                                                : ""
                                        }`}
                                    >
                                        {ci === 0 ? (
                                            <div className="flex items-center gap-2" style={{ paddingLeft: "18px" }}>
                                                <button
                                                    onClick={(e) => handleSelect(file.id, "file", e)}
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenFile?.(file.id);
                                                    }}
                                                    className="flex items-center gap-2 hover:text-violet-400 transition-colors min-w-0"
                                                >
                                                    {renderFileIcon
                                                        ? renderFileIcon(file)
                                                        : <span className="text-muted-foreground">📄</span>
                                                    }
                                                    <span className="font-medium truncate">{file.name}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            col.render
                                                ? col.render(file)
                                                : <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                ))}
                            </DraggableFileRow>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Drag Overlay — affiche le nombre si multi-sélection */}
            <DragOverlay dropAnimation={null}>
                {activeItem && (
                    <div className="relative">
                        <DragOverlayCard
                            name={dragCount > 1 ? `${dragCount} éléments` : activeItem.name}
                            type={activeItem.type}
                        />
                        {dragCount > 1 && (
                            <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                                {dragCount}
                            </div>
                        )}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
