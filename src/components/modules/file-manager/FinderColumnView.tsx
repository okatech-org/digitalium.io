// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: FinderColumnView
// Navigation en colonnes 3 panneaux — Vue Colonnes Finder
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
import { ChevronRight, FolderOpen, FileText } from "lucide-react";
import DragOverlayCard from "./DragOverlayCard";
import type { FileManagerFolder, FileManagerFile, DragMoveEvent } from "./types";

/* ─── Draggable+Droppable column item ────── */

function ColumnFolderItem({
    folder,
    isSelected,
    onClick,
    isDragOverTarget,
    renderIcon,
}: {
    folder: FileManagerFolder;
    isSelected: boolean;
    onClick: () => void;
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
                <span className="text-[8px] text-zinc-500 bg-zinc-500/10 px-1 py-0.5 rounded shrink-0">
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
    onClick: () => void;
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
}

export default function FinderColumnView({
    rootFolders,
    rootFiles,
    getFolderContents,
    onMoveItem,
    renderFilePreview,
    renderFolderIcon,
    renderFileIcon,
}: FinderColumnViewProps) {
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedMiddle, setSelectedMiddle] = useState<{ id: string; type: "file" | "folder" } | null>(null);
    const [activeItem, setActiveItem] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
    const [overFolderId, setOverFolderId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    // Get contents for middle pane
    const middleContents = selectedLeft ? getFolderContents(selectedLeft) : { folders: [], files: [] };

    // Get contents for right pane (if a sub-folder is selected in middle)
    const rightContents = selectedMiddle?.type === "folder"
        ? getFolderContents(selectedMiddle.id)
        : { folders: [], files: [] };

    // Selected file for preview
    const selectedFile = selectedMiddle?.type === "file"
        ? [...middleContents.files, ...rootFiles].find(f => f.id === selectedMiddle.id)
        : null;

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
                <div className="flex h-[500px] overflow-x-auto">
                    {/* ─── Left pane: Root folders ─── */}
                    <div className="w-[280px] min-w-[200px] border-r border-white/5 overflow-y-auto">
                        <div className="px-3 py-2 border-b border-white/5">
                            <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                                Dossiers
                            </span>
                        </div>
                        <div className="divide-y divide-white/[0.02]">
                            {rootFolders.map((folder) => (
                                <ColumnFolderItem
                                    key={folder.id}
                                    folder={folder}
                                    isSelected={selectedLeft === folder.id}
                                    onClick={() => {
                                        setSelectedLeft(folder.id);
                                        setSelectedMiddle(null);
                                    }}
                                    isDragOverTarget={overFolderId === folder.id}
                                    renderIcon={renderFolderIcon}
                                />
                            ))}
                            {rootFiles.map((file) => (
                                <ColumnFileItem
                                    key={file.id}
                                    file={file}
                                    isSelected={false}
                                    onClick={() => {}}
                                    renderIcon={renderFileIcon}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ─── Middle pane: Selected folder contents ─── */}
                    <div className="w-[280px] min-w-[200px] border-r border-white/5 overflow-y-auto">
                        {selectedLeft ? (
                            <>
                                <div className="px-3 py-2 border-b border-white/5">
                                    <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                                        Contenu
                                    </span>
                                </div>
                                <div className="divide-y divide-white/[0.02]">
                                    {middleContents.folders.map((folder) => (
                                        <ColumnFolderItem
                                            key={folder.id}
                                            folder={folder}
                                            isSelected={selectedMiddle?.id === folder.id}
                                            onClick={() => setSelectedMiddle({ id: folder.id, type: "folder" })}
                                            isDragOverTarget={overFolderId === folder.id}
                                            renderIcon={renderFolderIcon}
                                        />
                                    ))}
                                    {middleContents.files.map((file) => (
                                        <ColumnFileItem
                                            key={file.id}
                                            file={file}
                                            isSelected={selectedMiddle?.id === file.id}
                                            onClick={() => setSelectedMiddle({ id: file.id, type: "file" })}
                                            renderIcon={renderFileIcon}
                                        />
                                    ))}
                                    {middleContents.folders.length === 0 && middleContents.files.length === 0 && (
                                        <div className="flex items-center justify-center py-12 text-muted-foreground/40">
                                            <span className="text-xs">Dossier vide</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground/30">
                                <div className="text-center">
                                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    <span className="text-xs">Sélectionnez un dossier</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Right pane: Preview or sub-contents ─── */}
                    <div className="flex-1 min-w-[240px] overflow-y-auto">
                        {selectedMiddle?.type === "file" && selectedFile ? (
                            renderFilePreview ? (
                                renderFilePreview(selectedFile)
                            ) : (
                                <div className="p-4 space-y-4">
                                    <div className="flex flex-col items-center py-8">
                                        <div className="h-16 w-16 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                                            <FileText className="h-8 w-8 text-violet-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-center">{selectedFile.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{selectedFile.type.toUpperCase()} · {selectedFile.size}</p>
                                    </div>
                                    <div className="space-y-2 px-4">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Type</span>
                                            <span>{selectedFile.type.toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Taille</span>
                                            <span>{selectedFile.size}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Date</span>
                                            <span>{selectedFile.date}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : selectedMiddle?.type === "folder" ? (
                            <>
                                <div className="px-3 py-2 border-b border-white/5">
                                    <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                                        Sous-contenu
                                    </span>
                                </div>
                                <div className="divide-y divide-white/[0.02]">
                                    {rightContents.folders.map((folder) => (
                                        <ColumnFolderItem
                                            key={folder.id}
                                            folder={folder}
                                            isSelected={false}
                                            onClick={() => {}}
                                            isDragOverTarget={overFolderId === folder.id}
                                            renderIcon={renderFolderIcon}
                                        />
                                    ))}
                                    {rightContents.files.map((file) => (
                                        <ColumnFileItem
                                            key={file.id}
                                            file={file}
                                            isSelected={false}
                                            onClick={() => {}}
                                            renderIcon={renderFileIcon}
                                        />
                                    ))}
                                    {rightContents.folders.length === 0 && rightContents.files.length === 0 && (
                                        <div className="flex items-center justify-center py-12 text-muted-foreground/40">
                                            <span className="text-xs">Dossier vide</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground/30">
                                <div className="text-center">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    <span className="text-xs">Sélectionnez un élément</span>
                                </div>
                            </div>
                        )}
                    </div>
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
