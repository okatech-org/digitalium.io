// ═══════════════════════════════════════════════
// InfoButton — Contextual help tooltip for org config
// Displays an "ⓘ" button with rich tooltip content
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoButtonProps {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
}

export default function InfoButton({
    title,
    description,
    side = "right",
    className = "",
}: InfoButtonProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={`inline-flex items-center justify-center h-5 w-5 rounded-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 transition-all duration-200 shrink-0 ${className}`}
                        aria-label={`Info: ${title}`}
                    >
                        <Info className="h-3 w-3" />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    className="max-w-xs bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 rounded-xl px-4 py-3 z-[100]"
                >
                    <p className="text-xs font-semibold text-violet-300 mb-1">
                        {title}
                    </p>
                    <p className="text-[11px] text-white/60 leading-relaxed whitespace-pre-line">
                        {description}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
