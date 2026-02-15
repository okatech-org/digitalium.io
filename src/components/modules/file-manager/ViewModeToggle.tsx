// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: ViewModeToggle
// Toggle entre les modes grille, liste et colonnes
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { LayoutGrid, List, Columns3 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ViewMode } from "./types";

const STORAGE_KEY = "digitalium-view-mode";

/** Read the saved view mode synchronously — call in useState initializer to avoid flash */
export function getInitialViewMode(storageKey?: string): ViewMode {
    if (typeof window === "undefined") return "grid";
    try {
        const stored = localStorage.getItem(storageKey || STORAGE_KEY);
        if (stored === "grid" || stored === "list" || stored === "column") return stored;
    } catch { /* SSR or localStorage unavailable */ }
    return "grid";
}

const VIEW_MODES: { value: ViewMode; icon: React.ElementType; label: string }[] = [
    { value: "grid", icon: LayoutGrid, label: "Grille" },
    { value: "list", icon: List, label: "Liste" },
    { value: "column", icon: Columns3, label: "Colonnes" },
];

interface ViewModeToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
    storageKey?: string;
}

export default function ViewModeToggle({ value, onChange, storageKey }: ViewModeToggleProps) {
    const key = storageKey || STORAGE_KEY;

    const handleChange = (mode: ViewMode) => {
        onChange(mode);
        try {
            localStorage.setItem(key, mode);
        } catch {
            // localStorage not available
        }
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.02] border border-white/5">
                {VIEW_MODES.map(({ value: mode, icon: Icon, label }) => {
                    const isActive = value === mode;
                    return (
                        <Tooltip key={mode}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => handleChange(mode)}
                                    className={`p-1.5 rounded-md transition-all ${isActive
                                            ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                            : "text-muted-foreground hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px]">
                                {label}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
