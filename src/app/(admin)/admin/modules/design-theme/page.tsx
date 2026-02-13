// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules: Design Theme
// Personnalisation visuelle de la plateforme
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Palette, Type } from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const COLORS = [
    { name: "Primary", value: "#8B5CF6", label: "Violet 500" },
    { name: "Secondary", value: "#6366F1", label: "Indigo 500" },
    { name: "Accent", value: "#3B82F6", label: "Blue 500" },
    { name: "Destructive", value: "#EF4444", label: "Red 500" },
    { name: "Success", value: "#22C55E", label: "Green 500" },
    { name: "Background", value: "#030712", label: "Gray 950" },
];

export default function ModulesDesignThemePage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Palette className="h-6 w-6 text-violet-400" /> Thème &amp; Design
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Personnalisation visuelle de la plateforme</p>
            </motion.div>
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3">Palette de couleurs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {COLORS.map((c) => (
                        <div key={c.name} className="glass-card rounded-xl p-4 space-y-2">
                            <div className="h-12 rounded-lg" style={{ backgroundColor: c.value }} />
                            <p className="text-xs font-medium">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{c.value} · {c.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Type className="h-4 w-4 text-violet-400" />Typographie
                </h2>
                <div className="glass-card rounded-2xl p-6 space-y-4">
                    <div>
                        <p className="text-2xl font-bold">Inter — Heading Bold</p>
                        <p className="text-xs text-muted-foreground">font-family: Inter, sans-serif</p>
                    </div>
                    <div>
                        <p className="text-base">Inter — Body Regular</p>
                        <p className="text-xs text-muted-foreground">font-size: 14-16px</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
