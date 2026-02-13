// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: FinderGridView
// Grille DnD style macOS Finder — Vue Icônes
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

    const combinedRef = (node: HTMLDivElement | null) => {
        setDragRef(node);
        setDropRef(node);
    };

    return (
        <div
            ref={combinedRef}
            {...attributes}
            {...listeners}
            className={`transition-opacity ${isDragging ? "opacity-30" : ""}`}
            style={{ touchAction: "none" }}
        >
            {children(isOver || isDragOverTarget)}
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
    columns?: 2 | 3;
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
}: FinderGridViewProps) {
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
            // Don't drop on self
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

    const gridCols = columns === 2
        ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";

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
                <div className={gridCols}>
                    {folders.map((folder) => (
                        <DraggableFolderCard
                            key={folder.id}
                            folder={folder}
                            isDragOverTarget={overFolderId === folder.id}
                        >
                            {(isDragOver) => (
                                <motion.div
                                    variants={fadeUp}
                                    onClick={() => onOpenFolder(folder.id)}
                                    className="cursor-pointer"
                                >
                                    {renderFolderCard(folder, isDragOver)}
                                </motion.div>
                            )}
                        </DraggableFolderCard>
                    ))}
                </div>
            )}

            {/* Files */}
            {hasFiles && (
                <>
                    {hasFolders && (
                        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mt-6 mb-3 px-1">
                            Fichiers
                        </p>
                    )}
                    <div className={gridCols}>
                        {files.map((file) => (
                            <DraggableFileCard key={file.id} file={file}>
                                <motion.div variants={fadeUp}>
                                    {renderFileCard(file)}
                                </motion.div>
                            </DraggableFileCard>
                        ))}
                    </div>
                </>
            )}

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
