"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — AI Progress Indicator
// Premium, animated progress indicator for all AI operations
// (analyse, import, classement, réorganisation)
// ═══════════════════════════════════════════════

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Loader2,
    Check,
    AlertTriangle,
    FileText,
    Folder,
    Tag,
    Sparkles,
    Clock,
    Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────

export type AIProgressPhase =
    | "initializing"
    | "analyzing"
    | "classifying"
    | "organizing"
    | "applying"
    | "finalizing"
    | "done"
    | "error";

export interface AIProgressFileStatus {
    name: string;
    status: "pending" | "processing" | "done" | "error";
    confidence?: number;
}

export interface AIProgressIndicatorProps {
    /** Current phase of the AI operation */
    phase: AIProgressPhase;
    /** Progress percentage (0-100). If not provided, uses indeterminate mode */
    progress?: number;
    /** Number of total items being processed */
    totalItems?: number;
    /** Number of items already processed */
    processedItems?: number;
    /** Name of the current item being processed */
    currentItemName?: string;
    /** Per-file statuses for granular tracking */
    fileStatuses?: AIProgressFileStatus[];
    /** Operation description */
    operationLabel?: string;
    /** Sub-description */
    operationDescription?: string;
    /** Color theme */
    colorTheme?: "cyan" | "amber" | "violet" | "emerald";
    /** Show elapsed time */
    showTimer?: boolean;
    /** Start time (Date.now()) for timer */
    startTime?: number;
    /** Compact mode (no file list) */
    compact?: boolean;
    /** Cancel handler */
    onCancel?: () => void;
}

// ─── Phase configuration ──────────────────────────

const PHASE_CONFIG: Record<AIProgressPhase, {
    label: string;
    description: string;
    icon: React.ReactNode;
}> = {
    initializing: {
        label: "Initialisation",
        description: "Préparation de l'analyse...",
        icon: <Zap className="h-5 w-5" />,
    },
    analyzing: {
        label: "Analyse IA",
        description: "Gemini analyse le contenu...",
        icon: <Brain className="h-5 w-5" />,
    },
    classifying: {
        label: "Classification",
        description: "Classement intelligent en cours...",
        icon: <Folder className="h-5 w-5" />,
    },
    organizing: {
        label: "Organisation",
        description: "Structuration de l'arborescence...",
        icon: <Tag className="h-5 w-5" />,
    },
    applying: {
        label: "Application",
        description: "Mise à jour des documents...",
        icon: <Sparkles className="h-5 w-5" />,
    },
    finalizing: {
        label: "Finalisation",
        description: "Vérification du résultat...",
        icon: <Check className="h-5 w-5" />,
    },
    done: {
        label: "Terminé",
        description: "Opération réussie !",
        icon: <Check className="h-5 w-5" />,
    },
    error: {
        label: "Erreur",
        description: "Une erreur est survenue.",
        icon: <AlertTriangle className="h-5 w-5" />,
    },
};

const COLOR_THEMES = {
    cyan: {
        bg: "from-cyan-500/20 to-teal-500/20",
        ring: "stroke-cyan-400",
        ringBg: "stroke-white/5",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/20",
        bar: "from-cyan-500 to-teal-400",
        badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
        pulse: "bg-cyan-500",
    },
    amber: {
        bg: "from-amber-500/20 to-orange-500/20",
        ring: "stroke-amber-400",
        ringBg: "stroke-white/5",
        text: "text-amber-400",
        glow: "shadow-amber-500/20",
        bar: "from-amber-500 to-orange-400",
        badge: "bg-amber-500/15 text-amber-300 border-amber-500/20",
        pulse: "bg-amber-500",
    },
    violet: {
        bg: "from-violet-500/20 to-indigo-500/20",
        ring: "stroke-violet-400",
        ringBg: "stroke-white/5",
        text: "text-violet-400",
        glow: "shadow-violet-500/20",
        bar: "from-violet-500 to-indigo-400",
        badge: "bg-violet-500/15 text-violet-300 border-violet-500/20",
        pulse: "bg-violet-500",
    },
    emerald: {
        bg: "from-emerald-500/20 to-green-500/20",
        ring: "stroke-emerald-400",
        ringBg: "stroke-white/5",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/20",
        bar: "from-emerald-500 to-green-400",
        badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        pulse: "bg-emerald-500",
    },
};

// ─── Elapsed time formatter ──────────────────────

function formatElapsed(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toString().padStart(2, "0")}s`;
}

// ─── SVG Circular Progress ──────────────────────

function CircularProgress({
    progress,
    theme,
    isIndeterminate,
}: {
    progress: number;
    theme: typeof COLOR_THEMES.cyan;
    isIndeterminate: boolean;
}) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative h-24 w-24">
            <svg
                className={`h-24 w-24 -rotate-90 ${isIndeterminate ? "animate-spin" : ""}`}
                style={isIndeterminate ? { animationDuration: "3s" } : undefined}
                viewBox="0 0 96 96"
            >
                {/* Background ring */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    className={theme.ringBg}
                    strokeWidth="4"
                />
                {/* Progress ring */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    className={theme.ring}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={isIndeterminate ? circumference * 0.75 : offset}
                    style={{
                        transition: isIndeterminate ? "none" : "stroke-dashoffset 0.5s ease-out",
                    }}
                />
            </svg>
            {/* Center icon / percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
                {isIndeterminate ? (
                    <Brain className={`h-8 w-8 ${theme.text} animate-pulse`} />
                ) : (
                    <span className={`text-lg font-bold ${theme.text}`}>
                        {Math.round(progress)}%
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Component ──────────────────────────────────

export default function AIProgressIndicator({
    phase,
    progress,
    totalItems,
    processedItems,
    currentItemName,
    fileStatuses,
    operationLabel,
    operationDescription,
    colorTheme = "cyan",
    showTimer = true,
    startTime,
    compact = false,
    onCancel,
}: AIProgressIndicatorProps) {
    const [elapsed, setElapsed] = useState(0);
    const [effectiveStartTime] = useState(() => startTime ?? Date.now());
    const theme = COLOR_THEMES[colorTheme];
    const phaseConfig = PHASE_CONFIG[phase];

    // Simulated progress for indeterminate states
    const [simulatedProgress, setSimulatedProgress] = useState(0);
    const isIndeterminate = progress === undefined && phase !== "done" && phase !== "error";

    // Timer
    useEffect(() => {
        if (phase === "done" || phase === "error") return;
        const interval = setInterval(() => {
            setElapsed(Date.now() - effectiveStartTime);
        }, 1000);
        return () => clearInterval(interval);
    }, [effectiveStartTime, phase]);

    // Simulate progress for indeterminate operations
    useEffect(() => {
        if (!isIndeterminate) return;
        const interval = setInterval(() => {
            setSimulatedProgress((prev) => {
                // Logarithmic slowdown: fast at start, slow near end
                const maxProgress = 92;
                if (prev >= maxProgress) return maxProgress;
                const increment = Math.max(0.3, (maxProgress - prev) * 0.04);
                return Math.min(maxProgress, prev + increment);
            });
        }, 500);
        return () => clearInterval(interval);
    }, [isIndeterminate]);

    // Reset simulated progress when phase changes
    useEffect(() => {
        if (phase === "analyzing" || phase === "initializing") {
            setSimulatedProgress(0);
        } else if (phase === "done") {
            setSimulatedProgress(100);
        }
    }, [phase]);

    // Effective progress
    const effectiveProgress = useMemo(() => {
        if (phase === "done") return 100;
        if (phase === "error") return 0;
        if (progress !== undefined) return progress;
        if (totalItems && processedItems !== undefined) {
            return Math.round((processedItems / totalItems) * 100);
        }
        return simulatedProgress;
    }, [phase, progress, totalItems, processedItems, simulatedProgress]);

    // ─── Phases Steps ────────────────────────────

    const steps = useMemo(() => {
        const allPhases: AIProgressPhase[] = [
            "initializing",
            "analyzing",
            "classifying",
            "applying",
            "done",
        ];
        const currentIdx = allPhases.indexOf(phase);
        return allPhases.slice(0, -1).map((p, idx) => ({
            ...PHASE_CONFIG[p],
            key: p,
            isActive: idx === currentIdx,
            isComplete: idx < currentIdx || phase === "done",
        }));
    }, [phase]);

    return (
        <div className="space-y-5">
            {/* ── Circular progress + label ── */}
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative"
                >
                    <CircularProgress
                        progress={effectiveProgress}
                        theme={theme}
                        isIndeterminate={isIndeterminate && effectiveProgress < 5}
                    />
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-full blur-xl opacity-20 bg-gradient-to-br ${theme.bg}`} />
                    {/* Spinning ring for active state */}
                    {phase !== "done" && phase !== "error" && (
                        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                            <Loader2 className={`h-3.5 w-3.5 ${theme.text} animate-spin`} />
                        </div>
                    )}
                </motion.div>

                {/* Labels */}
                <div className="text-center space-y-1.5">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={operationLabel ?? phaseConfig.label}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm font-semibold"
                        >
                            {operationLabel ?? phaseConfig.label}
                        </motion.p>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={operationDescription ?? phaseConfig.description}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[11px] text-muted-foreground"
                        >
                            {operationDescription ?? phaseConfig.description}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Linear progress bar ── */}
            <div className="space-y-2 px-2">
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.bar} relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${effectiveProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                </div>

                {/* Stats line */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        {totalItems !== undefined && processedItems !== undefined && (
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {processedItems}/{totalItems}
                            </span>
                        )}
                        {currentItemName && (
                            <span className="truncate max-w-[200px] flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {currentItemName}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`font-medium ${theme.text}`}>
                            {Math.round(effectiveProgress)}%
                        </span>
                        {showTimer && elapsed > 0 && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatElapsed(elapsed)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Phase steps (mini pipeline) ── */}
            {!compact && (
                <div className="flex items-center justify-center gap-1 px-2">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.key}>
                            <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-all ${
                                    step.isActive
                                        ? `${theme.badge} border ring-1 ring-current/20`
                                        : step.isComplete
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                            : "bg-white/[0.03] text-white/20 border border-white/5"
                                }`}
                            >
                                {step.isComplete && !step.isActive ? (
                                    <Check className="h-2.5 w-2.5" />
                                ) : step.isActive ? (
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                ) : (
                                    <span className="h-2.5 w-2.5 rounded-full bg-current opacity-30" />
                                )}
                                {step.label}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`w-4 h-px ${step.isComplete ? "bg-emerald-500/30" : "bg-white/5"}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* ── File status list ── */}
            {!compact && fileStatuses && fileStatuses.length > 0 && (
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto px-1">
                    {fileStatuses.map((file, idx) => (
                        <motion.div
                            key={`${file.name}-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5"
                        >
                            <div className="h-6 w-6 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                                <FileText className="h-3 w-3 text-white/30" />
                            </div>
                            <p className="text-xs flex-1 truncate text-white/70">{file.name}</p>
                            {file.status === "done" ? (
                                <div className="flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    {file.confidence !== undefined && (
                                        <span className="text-[10px] font-medium text-emerald-400">
                                            {Math.round(file.confidence)}%
                                        </span>
                                    )}
                                </div>
                            ) : file.status === "processing" ? (
                                <div className="flex items-center gap-1.5">
                                    <Loader2 className={`h-3.5 w-3.5 ${theme.text} animate-spin`} />
                                    <span className={`text-[10px] font-medium ${theme.text}`}>
                                        En cours
                                    </span>
                                </div>
                            ) : file.status === "error" ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                            ) : (
                                <div className="h-3.5 w-3.5 rounded-full border border-white/10" />
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── Cancel button ── */}
            {onCancel && phase !== "done" && phase !== "error" && (
                <div className="flex justify-center">
                    <button
                        onClick={onCancel}
                        className="text-[11px] text-muted-foreground hover:text-white/60 transition-colors px-4 py-1.5 rounded-md hover:bg-white/5"
                    >
                        Annuler
                    </button>
                </div>
            )}
        </div>
    );
}
