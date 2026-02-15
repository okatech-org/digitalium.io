// ═══════════════════════════════════════════════
// LifecyclePipeline — Visual lifecycle pipeline
// Shows the 8-state archive lifecycle
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { LIFECYCLE_NODES } from "@/config/filing-presets";

const COLOR_MAP: Record<string, string> = {
    zinc: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    violet: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    orange: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    red: "bg-red-500/20 text-red-300 border-red-500/40",
};

const DOT_MAP: Record<string, string> = {
    zinc: "bg-zinc-400",
    emerald: "bg-emerald-400",
    blue: "bg-blue-400",
    violet: "bg-violet-400",
    amber: "bg-amber-400",
    orange: "bg-orange-400",
    red: "bg-red-400",
};

export default function LifecyclePipeline() {
    // Separate the "Gel juridique" node (index 4) from the main flow
    const mainNodes = LIFECYCLE_NODES.filter((_, i) => i !== 4);
    const gelNode = LIFECYCLE_NODES[4];

    return (
        <div className="space-y-4">
            {/* Main pipeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {mainNodes.map((node, i) => (
                    <React.Fragment key={node.label}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.07, duration: 0.3 }}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium
                                whitespace-nowrap shrink-0
                                ${COLOR_MAP[node.color] ?? COLOR_MAP.zinc}
                            `}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${DOT_MAP[node.color] ?? DOT_MAP.zinc}`}
                            />
                            {node.label}
                        </motion.div>
                        {i < mainNodes.length - 1 && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.07 + 0.05 }}
                                className="text-white/20 shrink-0 text-sm"
                            >
                                →
                            </motion.span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Gel juridique — side branch */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex items-center gap-2 ml-8"
            >
                <span className="text-white/20 text-xs">↕ branche</span>
                <div
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium
                        ${COLOR_MAP[gelNode.color]}
                    `}
                >
                    <span className={`w-2 h-2 rounded-full ${DOT_MAP[gelNode.color]}`} />
                    {gelNode.label}
                </div>
                <span className="text-xs text-white/30">
                    (suspension temporaire — tout état)
                </span>
            </motion.div>
        </div>
    );
}
