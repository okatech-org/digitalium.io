// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: Types partagés
// Types pour le système de gestion de fichiers Finder-like
// ═══════════════════════════════════════════════

import React from "react";

/* ─── View modes ────────────────────────── */

export type ViewMode = "grid" | "list" | "column";

/* ─── Folder type ───────────────────────── */

export interface FileManagerFolder {
    id: string;
    name: string;
    description?: string;
    parentFolderId: string | null;
    tags: string[];
    fileCount: number;
    subfolderCount?: number;
    updatedAt: string;
    createdBy: string;
    isSystem?: boolean;
    metadata?: Record<string, unknown>;
}

/* ─── File type ─────────────────────────── */

export interface FileManagerFile {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    folderId: string;
    metadata?: Record<string, unknown>;
}

/* ─── Drag events ───────────────────────── */

export interface DragMoveEvent {
    itemId: string;
    itemType: "file" | "folder";
    targetFolderId: string;
}

/* ─── Multi-selection ─────────────────── */

export interface SelectedItem {
    id: string;
    type: "file" | "folder";
    name: string;
}

/* ─── Batch drag event (multi-sélection) ─ */

export interface DragBatchMoveEvent {
    items: Array<{ itemId: string; itemType: "file" | "folder" }>;
    targetFolderId: string;
}

/* ─── List view columns ────────────────── */

export interface ListColumn {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (item: FileManagerFile | FileManagerFolder) => React.ReactNode;
}
