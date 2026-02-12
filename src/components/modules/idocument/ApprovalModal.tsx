"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Approval Modal
// Submit for review / Approve with assignee, comment, deadline
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Send,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Calendar,
    MessageSquare,
    UserCheck,
    Bell,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

export type ApprovalAction =
    | "submit_review"
    | "approve"
    | "reject"
    | "request_changes";

interface ApprovalModalProps {
    open: boolean;
    action: ApprovalAction;
    onClose: () => void;
    onConfirm: (data: {
        assignee?: string;
        comment: string;
        deadline?: number;
    }) => void;
}

// ─── Demo approvers ─────────────────────────────

const DEMO_APPROVERS = [
    { id: "u-1", name: "Daniel Nguema", role: "Directeur Technique" },
    { id: "u-2", name: "Aimée Gondjout", role: "Responsable Juridique" },
    { id: "u-3", name: "Claude Mboumba", role: "DAF" },
    { id: "u-4", name: "Marie Obame", role: "Directeur Général" },
];

// ─── Config per action ──────────────────────────

const ACTION_CONFIG: Record<
    ApprovalAction,
    {
        title: string;
        icon: React.ElementType;
        iconCls: string;
        btnLabel: string;
        btnCls: string;
        showAssignee: boolean;
        showDeadline: boolean;
        commentPlaceholder: string;
        commentRequired: boolean;
    }
> = {
    submit_review: {
        title: "Soumettre pour révision",
        icon: Send,
        iconCls: "text-blue-400",
        btnLabel: "Soumettre",
        btnCls: "bg-blue-600 hover:bg-blue-700",
        showAssignee: true,
        showDeadline: true,
        commentPlaceholder: "Note pour le réviseur (optionnel)…",
        commentRequired: false,
    },
    approve: {
        title: "Approuver le document",
        icon: ThumbsUp,
        iconCls: "text-emerald-400",
        btnLabel: "Approuver",
        btnCls: "bg-emerald-600 hover:bg-emerald-700",
        showAssignee: false,
        showDeadline: false,
        commentPlaceholder: "Commentaire d'approbation (optionnel)…",
        commentRequired: false,
    },
    reject: {
        title: "Rejeter le document",
        icon: ThumbsDown,
        iconCls: "text-red-400",
        btnLabel: "Rejeter",
        btnCls: "bg-red-600 hover:bg-red-700",
        showAssignee: false,
        showDeadline: false,
        commentPlaceholder: "Motif du rejet (obligatoire)…",
        commentRequired: true,
    },
    request_changes: {
        title: "Demander des modifications",
        icon: RotateCcw,
        iconCls: "text-amber-400",
        btnLabel: "Demander les modifications",
        btnCls: "bg-amber-600 hover:bg-amber-700",
        showAssignee: false,
        showDeadline: true,
        commentPlaceholder: "Modifications demandées (obligatoire)…",
        commentRequired: true,
    },
};

export default function ApprovalModal({
    open,
    action,
    onClose,
    onConfirm,
}: ApprovalModalProps) {
    const [assignee, setAssignee] = useState("");
    const [comment, setComment] = useState("");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState(true);

    const cfg = ACTION_CONFIG[action];
    const ActionIcon = cfg.icon;

    const canSubmit =
        !cfg.commentRequired || comment.trim().length > 0;

    const handleConfirm = async () => {
        if (!canSubmit) return;
        setLoading(true);
        // Simulate processing
        await new Promise((r) => setTimeout(r, 800));
        onConfirm({
            assignee: assignee || undefined,
            comment: comment.trim(),
            deadline: deadline
                ? new Date(deadline).getTime()
                : undefined,
        });
        setLoading(false);
        setComment("");
        setAssignee("");
        setDeadline("");
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center`}>
                                    <ActionIcon className={`h-4 w-4 ${cfg.iconCls}`} />
                                </div>
                                <h3 className="text-sm font-semibold">{cfg.title}</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-4">
                            {/* Assignee selector */}
                            {cfg.showAssignee && (
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                        <UserCheck className="h-3 w-3" />
                                        Approbateur / Signataire
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DEMO_APPROVERS.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => setAssignee(a.id)}
                                                className={`text-left p-2.5 rounded-lg border transition-all text-xs ${assignee === a.id
                                                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                                                        : "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10"
                                                    }`}
                                            >
                                                <p className="font-medium text-[11px]">{a.name}</p>
                                                <p className="text-[10px] opacity-60">{a.role}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comment */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                    <MessageSquare className="h-3 w-3" />
                                    Commentaire
                                    {cfg.commentRequired && (
                                        <Badge
                                            variant="outline"
                                            className="text-[8px] h-4 border-amber-500/20 text-amber-400"
                                        >
                                            Obligatoire
                                        </Badge>
                                    )}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={cfg.commentPlaceholder}
                                    rows={3}
                                    className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-violet-500/30 placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Deadline */}
                            {cfg.showDeadline && (
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                        <Calendar className="h-3 w-3" />
                                        Deadline
                                    </label>
                                    <Input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="h-8 text-xs bg-white/5 border-white/10"
                                    />
                                </div>
                            )}

                            {/* Notify email toggle */}
                            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-xs text-zinc-400">
                                        Notifier par email
                                    </span>
                                </div>
                                <button
                                    onClick={() => setNotifyEmail(!notifyEmail)}
                                    className={`h-5 w-9 rounded-full transition-colors relative ${notifyEmail
                                            ? "bg-violet-600"
                                            : "bg-zinc-700"
                                        }`}
                                >
                                    <motion.div
                                        animate={{
                                            x: notifyEmail ? 16 : 2,
                                        }}
                                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                                    />
                                </button>
                            </div>

                            {/* Warning for reject */}
                            {action === "reject" && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-300/80 leading-relaxed">
                                        Le document sera renvoyé au statut brouillon.
                                        L&apos;auteur sera notifié du rejet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-zinc-400"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                className={`h-8 text-xs text-white gap-1.5 ${cfg.btnCls}`}
                                onClick={handleConfirm}
                                disabled={!canSubmit || loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                )}
                                {cfg.btnLabel}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
