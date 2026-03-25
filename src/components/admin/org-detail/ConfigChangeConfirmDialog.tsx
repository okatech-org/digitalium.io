"use client";

// ═══════════════════════════════════════════════════
// DIGITALIUM.IO — ConfigChangeConfirmDialog
// Impact analysis dialog before propagating config changes
// ═══════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    X,
    AlertTriangle,
    Loader2,
    Shield,
    FileText,
    FolderTree,
    Users,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────
interface ConfigChangeConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    changeType: "retention_category" | "access_rule" | "document_type" | "metadata_field";
    changeDescription: string;
    orgId: Id<"organizations">;
    /** Optional: ID of the specific item being changed */
    itemId?: string;
}

interface ImpactItem {
    icon: React.ElementType;
    label: string;
    count: number;
    color: string;
}

// ─── Component ──────────────────────────────────
export default function ConfigChangeConfirmDialog({
    open,
    onClose,
    onConfirm,
    changeType,
    changeDescription,
    orgId,
}: ConfigChangeConfirmDialogProps) {
    const [confirming, setConfirming] = useState(false);

    // Load impact counts from Convex
    const folders = useQuery(
        api.folders.listByOrg,
        open ? { organizationId: orgId } : "skip"
    );
    const accessRules = useQuery(
        api.cellAccessRules.listByOrg,
        open ? { organizationId: orgId } : "skip"
    );

    // Reset state when dialog opens
    useEffect(() => {
        if (open) setConfirming(false);
    }, [open]);

    // Compute impact items
    const impactItems: ImpactItem[] = [];

    if (changeType === "retention_category") {
        impactItems.push({
            icon: FolderTree,
            label: "Dossiers avec politique héritée",
            count: (folders ?? []).length,
            color: "text-amber-400",
        });
    } else if (changeType === "access_rule") {
        impactItems.push({
            icon: Shield,
            label: "Règles d'accès impactées",
            count: (accessRules ?? []).filter((r: { estActif?: boolean }) => r.estActif).length,
            color: "text-violet-400",
        });
        impactItems.push({
            icon: Users,
            label: "Règles d'accès actives",
            count: (accessRules ?? []).length,
            color: "text-emerald-400",
        });
    } else if (changeType === "document_type") {
        impactItems.push({
            icon: FolderTree,
            label: "Dossiers dans cette organisation",
            count: (folders ?? []).length,
            color: "text-blue-400",
        });
    } else if (changeType === "metadata_field") {
        impactItems.push({
            icon: FolderTree,
            label: "Dossiers impactés",
            count: (folders ?? []).length,
            color: "text-cyan-400",
        });
    }

    const totalImpact = impactItems.reduce((sum, item) => sum + item.count, 0);
    const isHighImpact = totalImpact > 50;
    const isLoading = !folders && !accessRules && open;

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await onConfirm();
        } finally {
            setConfirming(false);
            onClose();
        }
    };

    const CHANGE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
        retention_category: { label: "Catégorie de rétention", color: "text-violet-400" },
        access_rule: { label: "Règle d'accès", color: "text-amber-400" },
        document_type: { label: "Type de document", color: "text-blue-400" },
        metadata_field: { label: "Champ métadonnée", color: "text-cyan-400" },
    };

    const typeInfo = CHANGE_TYPE_LABELS[changeType] ?? CHANGE_TYPE_LABELS.retention_category;

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
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isHighImpact ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                                    <AlertTriangle className={`h-4 w-4 ${isHighImpact ? "text-red-400" : "text-amber-400"}`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">Confirmation de propagation</h3>
                                    <p className={`text-[10px] ${typeInfo.color}`}>
                                        {typeInfo.label}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                onClick={onClose}
                                disabled={confirming}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-4">
                            {/* Change description */}
                            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                <p className="text-xs text-white/70 leading-relaxed">
                                    {changeDescription}
                                </p>
                            </div>

                            {/* Impact analysis */}
                            <div>
                                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                                    Analyse d&apos;impact
                                </p>
                                {isLoading ? (
                                    <div className="flex items-center gap-2 py-4 justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                        <span className="text-xs text-zinc-500">Calcul de l&apos;impact...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {impactItems.map((item, i) => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ItemIcon className={`h-3.5 w-3.5 ${item.color}`} />
                                                        <span className="text-xs text-white/70">{item.label}</span>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] border-0 ${
                                                            item.count > 20
                                                                ? "bg-red-500/15 text-red-400"
                                                                : item.count > 0
                                                                    ? "bg-amber-500/15 text-amber-400"
                                                                    : "bg-white/5 text-white/30"
                                                        }`}
                                                    >
                                                        {item.count}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Warning box */}
                            {isHighImpact && (
                                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <p className="text-[11px] text-red-300/80 leading-relaxed">
                                        ⚠️ Impact élevé : cette modification affectera plus de 50 éléments.
                                        Les changements seront propagés de manière asynchrone via batch.
                                    </p>
                                </div>
                            )}

                            {/* Info box */}
                            <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                                <p className="text-[11px] text-violet-300/80 leading-relaxed flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    Les modifications seront appliquées via les mutations batch de
                                    <code className="text-violet-400 text-[10px]">configPropagation</code>.
                                    Un log d&apos;audit sera créé automatiquement.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-zinc-400"
                                onClick={onClose}
                                disabled={confirming}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                className={`h-8 text-xs text-white gap-1.5 ${
                                    isHighImpact
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-amber-600 hover:bg-amber-700"
                                }`}
                                onClick={handleConfirm}
                                disabled={confirming || isLoading}
                            >
                                {confirming ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-3 w-3" />
                                )}
                                {confirming ? "Propagation..." : "Confirmer et propager"}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
