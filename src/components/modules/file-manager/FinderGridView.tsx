// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: FinderGridView
// Grille DnD style macOS Finder — Vue Icônes
// Multi-sélection avec Cmd/Ctrl+Click et Shift+Click
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
import { motion } from "framer-motion";
import DragOverlayCard from "./DragOverlayCard";
import type { FileManagerFolder, FileManagerFile, DragMoveEvent } from "./types";

/* ─── Animation variants ────────────────── */

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Draggable+Droppable Folder Wrapper ── */

function DraggableFolderCard({
    folder,
    children,
    isDragOverTarget,
    disabled,
}: {
    folder: FileManagerFolder;
    children: (isDragOver: boolean) => React.ReactNode;
    isDragOverTarget: boolean;
    disabled?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: `folder-${folder.id}`,
        data: { type: "folder", id: folder.id, name: folder.name },
        disabled: disabled || folder.isSystem,
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `drop-folder-${folder.id}`,
        data: { type: "folder", id: folder.id },
    });

    const combinedRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            setDragRef(node);
            setDropRef(node);
        },
        [setDragRef, setDropRef]
    );

    const isDragOver = isOver || isDragOverTarget;
    const content = React.useMemo(() => children(isDragOver), [children, isDragOver]);

    return (
        <div
            ref={combinedRef}
            {...attributes}
            {...listeners}
            className={`transition-opacity ${isDragging ? "opacity-30" : ""}`}
            style={{ touchAction: "none" }}
        >
            {content}
        </div>
    );
}

/* ─── Draggable File Card Wrapper ────────── */

function DraggableFileCard({
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
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`transition-opacity ${isDragging ? "opacity-30" : ""}`}
            style={{ touchAction: "none" }}
        >
            {children}
        </div>
    );
}

/* ═══ MAIN COMPONENT ══════════════════════ */

interface FinderGridViewProps {
    folders: FileManagerFolder[];
    files: FileManagerFile[];
    onOpenFolder: (folderId: string) => void;
    onMoveItem: (event: DragMoveEvent) => void;
    renderFolderCard: (folder: FileManagerFolder, isDragOver: boolean) => React.ReactNode;
    renderFileCard: (file: FileManagerFile) => React.ReactNode;
    emptyState?: React.ReactNode;
    columns?: 2 | 3 | 4 | 5;
    /** Multi-sélection : callback quand un item est cliqué (avec modificateurs) */
    onItemClick?: (id: string, type: "file" | "folder", event: React.MouseEvent) => void;
    /** Set des IDs sélectionnés */
    selectedIds?: Set<string>;
    /** Double-clic sur un fichier : ouvrir */
    onOpenFile?: (fileId: string) => void;
}

export default function FinderGridView({
    folders,
    files,
    onOpenFolder,
    onMoveItem,
    renderFolderCard,
    renderFileCard,
    emptyState,
    columns = 3,
    onItemClick,
    selectedIds,
    onOpenFile,
}: FinderGridViewProps) {
    const [activeItem, setActiveItem] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
    const [overFolderId, setOverFolderId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    // Nombre d'items sélectionnés pour l'overlay drag multi
    const dragCount = selectedIds && activeItem && selectedIds.has(activeItem.id)
        ? selectedIds.size
        : 1;

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

            // Multi-sélection drag : déplacer tous les items sélectionnés
            if (selectedIds && selectedIds.has(activeId) && selectedIds.size > 1) {
                for (const itemId of Array.from(selectedIds)) {
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

    // ─── Clic simple = sélection · Double-clic = ouvrir ──────
    const handleFolderClick = (e: React.MouseEvent, folder: FileManagerFolder) => {
        e.stopPropagation();
        if (onItemClick) {
            onItemClick(folder.id, "folder", e);
        }
    };

    const handleFolderDoubleClick = (folder: FileManagerFolder) => {
        onOpenFolder(folder.id);
    };

    const handleFileClick = (e: React.MouseEvent, file: FileManagerFile) => {
        e.stopPropagation();
        if (onItemClick) {
            onItemClick(file.id, "file", e);
        }
    };

    const gridCols = columns === 2
        ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
        : columns === 5
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3";

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
            {/* Folders */}
            {hasFolders && (
                <motion.div
                    className={gridCols}
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                >
                    {folders.map((folder) => (
                        <DraggableFolderCard
                            key={folder.id}
                            folder={folder}
                            isDragOverTarget={overFolderId === folder.id}
                        >
                            {(isDragOver) => (
                                <motion.div
                                    variants={fadeUp}
                                    onClick={(e) => handleFolderClick(e, folder)}
                                    onDoubleClick={() => handleFolderDoubleClick(folder)}
                                    className="cursor-pointer"
                                >
                                    {renderFolderCard(folder, isDragOver)}
                                </motion.div>
                            )}
                        </DraggableFolderCard>
                    ))}
                </motion.div>
            )}

            {/* Files */}
            {hasFiles && (
                <>
                    {hasFolders && (
                        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mt-6 mb-3 px-1">
                            Fichiers
                        </p>
                    )}
                    <motion.div
                        className={gridCols}
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                    >
                        {files.map((file) => (
                            <DraggableFileCard key={file.id} file={file}>
                                <motion.div
                                    variants={fadeUp}
                                    onClick={(e) => handleFileClick(e, file)}
                                    onDoubleClick={() => onOpenFile?.(file.id)}
                                    className="cursor-pointer"
                                >
                                    {renderFileCard(file)}
                                </motion.div>
                            </DraggableFileCard>
                        ))}
                    </motion.div>
                </>
            )}

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
