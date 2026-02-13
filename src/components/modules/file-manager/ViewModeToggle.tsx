// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: ViewModeToggle
// Toggle entre les modes grille, liste et colonnes
// ═══════════════════════════════════════════════

"use client";

import React, { useEffect } from "react";
import { LayoutGrid, List, Columns3 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ViewMode } from "./types";

const STORAGE_KEY = "digitalium-view-mode";

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

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored && (stored === "grid" || stored === "list" || stored === "column")) {
                onChange(stored as ViewMode);
            }
        } catch {
            // localStorage not available
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                                    className={`p-1.5 rounded-md transition-all ${
                                        isActive
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
