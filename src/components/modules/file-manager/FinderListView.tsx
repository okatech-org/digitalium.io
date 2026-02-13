// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: FinderListView
// Tableau triable avec DnD — Vue Liste Finder
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
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
import { ChevronUp, ChevronDown, FolderOpen, GripVertical } from "lucide-react";
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
}: {
    file: FileManagerFile;
    children: React.ReactNode;
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
            className={`transition-opacity ${isDragging ? "opacity-30" : ""}`}
            style={{ touchAction: "none" }}
        >
            {children}
        </tr>
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
}: FinderListViewProps) {
    const [activeItem, setActiveItem] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
    const [overFolderId, setOverFolderId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

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
                        {/* Folders (always first) */}
                        {folders.map((folder) => (
                            <DraggableFolderRow
                                key={folder.id}
                                folder={folder}
                                isDragOverTarget={overFolderId === folder.id}
                            >
                                {(isDragOver) => (
                                    <>
                                        <td className="py-2.5 px-1">
                                            {!folder.isSystem && (
                                                <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                                            )}
                                        </td>
                                        {columns.map((col, ci) => (
                                            <td
                                                key={col.key}
                                                className={`py-2.5 px-2 ${
                                                    isDragOver && ci === 0
                                                        ? "border-l-2 border-violet-500"
                                                        : ""
                                                }`}
                                            >
                                                {ci === 0 ? (
                                                    <button
                                                        onClick={() => onOpenFolder(folder.id)}
                                                        className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                                                    >
                                                        {renderFolderIcon
                                                            ? renderFolderIcon(folder)
                                                            : <FolderOpen className="h-4 w-4 text-violet-400" />
                                                        }
                                                        <span className="font-medium">{folder.name}</span>
                                                        {folder.isSystem && (
                                                            <span className="text-[9px] text-zinc-500 bg-zinc-500/10 px-1.5 py-0.5 rounded">
                                                                Système
                                                            </span>
                                                        )}
                                                    </button>
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
                        ))}

                        {/* Separator */}
                        {hasFolders && hasFiles && (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-1">
                                    <div className="border-b border-white/5" />
                                </td>
                            </tr>
                        )}

                        {/* Files */}
                        {files.map((file) => (
                            <DraggableFileRow key={file.id} file={file}>
                                <td className="py-2.5 px-1">
                                    <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                                </td>
                                {columns.map((col, ci) => (
                                    <td key={col.key} className="py-2.5 px-2">
                                        {ci === 0 ? (
                                            <div className="flex items-center gap-2">
                                                {renderFileIcon
                                                    ? renderFileIcon(file)
                                                    : <span className="text-muted-foreground">📄</span>
                                                }
                                                <span className="font-medium">{file.name}</span>
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
