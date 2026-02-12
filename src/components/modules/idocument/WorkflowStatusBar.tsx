"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Workflow Status Bar
// Visual progress + role-based actions
// ═══════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    PenTool,
    Eye,
    CheckCircle2,
    Archive,
    ChevronRight,
    Send,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    ArrowRightToLine,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

export type DocStatus = "draft" | "review" | "approved" | "archived";
export type UserRole = "org_member" | "org_manager" | "org_admin" | "org_viewer";

interface WorkflowStatusBarProps {
    status: DocStatus;
    userRole: UserRole;
    onSubmitForReview?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onRequestChanges?: () => void;
    onArchive?: () => void;
}

// ─── Step definitions ───────────────────────────

const STEPS = [
    { key: "draft" as const, label: "Brouillon", icon: PenTool, color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/20", activeColor: "text-amber-400", activeBg: "bg-amber-500/15", activeBorder: "border-amber-500/30" },
    { key: "review" as const, label: "En révision", icon: Eye, color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/20", activeColor: "text-blue-400", activeBg: "bg-blue-500/15", activeBorder: "border-blue-500/30" },
    { key: "approved" as const, label: "Approuvé", icon: CheckCircle2, color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/20", activeColor: "text-emerald-400", activeBg: "bg-emerald-500/15", activeBorder: "border-emerald-500/30" },
    { key: "archived" as const, label: "Archivé", icon: Archive, color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/20", activeColor: "text-violet-400", activeBg: "bg-violet-500/15", activeBorder: "border-violet-500/30" },
];

const STATUS_ORDER: DocStatus[] = ["draft", "review", "approved", "archived"];

export default function WorkflowStatusBar({
    status,
    userRole,
    onSubmitForReview,
    onApprove,
    onReject,
    onRequestChanges,
    onArchive,
}: WorkflowStatusBarProps) {
    const currentIdx = STATUS_ORDER.indexOf(status);

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="px-4 py-3 bg-zinc-900/40 border-b border-white/5 shrink-0"
        >
            {/* ─── Progress Steps ─── */}
            <div className="flex items-center justify-center gap-1 mb-3">
                {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = step.key === status;
                    const isPast = i < currentIdx;
                    const isFuture = i > currentIdx;

                    return (
                        <React.Fragment key={step.key}>
                            {i > 0 && (
                                <div className="flex items-center mx-1">
                                    <ChevronRight
                                        className={`h-3 w-3 ${isPast
                                                ? "text-emerald-500/50"
                                                : "text-zinc-700"
                                            }`}
                                    />
                                </div>
                            )}
                            <motion.div
                                animate={
                                    isActive
                                        ? { scale: [1, 1.04, 1] }
                                        : {}
                                }
                                transition={
                                    isActive
                                        ? {
                                            repeat: Infinity,
                                            duration: 2,
                                            ease: "easeInOut",
                                        }
                                        : {}
                                }
                            >
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] h-6 px-2.5 gap-1.5 border transition-all ${isActive
                                            ? `${step.activeBg} ${step.activeColor} ${step.activeBorder} shadow-sm`
                                            : isPast
                                                ? "bg-emerald-500/10 text-emerald-400/60 border-emerald-500/15"
                                                : isFuture
                                                    ? "bg-zinc-800/40 text-zinc-600 border-zinc-700/30"
                                                    : `${step.bg} ${step.color} ${step.border}`
                                        }`}
                                >
                                    {isPast ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                        <StepIcon className="h-3 w-3" />
                                    )}
                                    {step.label}
                                </Badge>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ─── Action Buttons ─── */}
            <div className="flex items-center justify-center gap-2">
                {/* DRAFT → Submit for review (org_member, org_manager, org_admin) */}
                {status === "draft" && userRole !== "org_viewer" && (
                    <Button
                        size="sm"
                        className="h-7 text-[11px] gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={onSubmitForReview}
                    >
                        <Send className="h-3 w-3" />
                        Soumettre pour révision
                    </Button>
                )}

                {/* REVIEW → Approve (org_manager, org_admin) */}
                {status === "review" &&
                    (userRole === "org_manager" || userRole === "org_admin") && (
                        <Button
                            size="sm"
                            className="h-7 text-[11px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={onApprove}
                        >
                            <ThumbsUp className="h-3 w-3" />
                            Approuver
                        </Button>
                    )}

                {/* REVIEW → Request changes (org_manager, org_admin) */}
                {status === "review" &&
                    (userRole === "org_manager" || userRole === "org_admin") && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            onClick={onRequestChanges}
                        >
                            <RotateCcw className="h-3 w-3" />
                            Demander des modifications
                        </Button>
                    )}

                {/* REVIEW → Reject (org_admin only) */}
                {status === "review" && userRole === "org_admin" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={onReject}
                    >
                        <ThumbsDown className="h-3 w-3" />
                        Rejeter
                    </Button>
                )}

                {/* APPROVED → Archive (org_admin only) */}
                {status === "approved" && userRole === "org_admin" && (
                    <Button
                        size="sm"
                        className="h-7 text-[11px] gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={onArchive}
                    >
                        <ArrowRightToLine className="h-3 w-3" />
                        Archiver dans iArchive
                    </Button>
                )}

                {/* ARCHIVED → Info */}
                {status === "archived" && (
                    <Badge
                        variant="outline"
                        className="text-[10px] h-6 border-violet-500/20 text-violet-400 bg-violet-500/10"
                    >
                        <Archive className="h-3 w-3 mr-1" />
                        Document archivé — Lecture seule
                    </Badge>
                )}
            </div>
        </motion.div>
    );
}
