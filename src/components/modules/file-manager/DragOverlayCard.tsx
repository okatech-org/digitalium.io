// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: DragOverlayCard
// Carte fantôme affichée pendant le drag
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { FolderOpen, FileText } from "lucide-react";

interface DragOverlayCardProps {
    name: string;
    type: "file" | "folder";
    icon?: React.ReactNode;
}

export default function DragOverlayCard({ name, type, icon }: DragOverlayCardProps) {
    const defaultIcon = type === "folder"
        ? <FolderOpen className="h-4 w-4 text-violet-400" />
        : <FileText className="h-4 w-4 text-zinc-400" />;

    return (
        <div
            className="flex items-center gap-2.5 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2 shadow-xl"
            style={{ transform: "rotate(2deg) scale(1.05)" }}
        >
            {icon || defaultIcon}
            <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                {name}
            </span>
        </div>
    );
}
