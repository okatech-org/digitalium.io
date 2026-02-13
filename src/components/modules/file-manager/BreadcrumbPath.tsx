// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: BreadcrumbPath
// Navigation par chemin de dossier style Finder
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { ChevronRight, FolderOpen } from "lucide-react";

interface BreadcrumbPathProps {
    path: { id: string; name: string }[];
    onNavigate: (folderId: string | null) => void;
    rootLabel?: string;
    rootIcon?: React.ElementType;
}

export default function BreadcrumbPath({
    path,
    onNavigate,
    rootLabel = "Dossiers",
    rootIcon: RootIcon = FolderOpen,
}: BreadcrumbPathProps) {
    if (path.length === 0) return null;

    return (
        <div className="flex items-center gap-1 min-h-[32px] px-1">
            {/* Root */}
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
            >
                <RootIcon className="h-3.5 w-3.5" />
                {rootLabel}
            </button>

            {/* Path segments */}
            {path.map((segment, i) => {
                const isLast = i === path.length - 1;
                return (
                    <React.Fragment key={segment.id}>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        {isLast ? (
                            <span className="text-xs font-medium text-foreground px-1.5 py-0.5">
                                {segment.name}
                            </span>
                        ) : (
                            <button
                                onClick={() => onNavigate(segment.id)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
                            >
                                {segment.name}
                            </button>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
