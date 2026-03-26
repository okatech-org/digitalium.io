"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Component: ConfirmDialog
// Reusable confirmation dialog for destructive actions
// NEXUS-OMEGA M3 Sprint 6 — UX Polish
// ═══════════════════════════════════════════════

import React from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
    trigger: React.ReactNode;
    title?: string;
    description?: string;
    variant?: "danger" | "warning" | "default";
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
}

/**
 * ConfirmDialog — Double confirmation for destructive actions.
 * Follows the NEXUS pattern: no silent destructive action.
 *
 * Usage:
 *   <ConfirmDialog
 *       trigger={<Button variant="destructive">Supprimer</Button>}
 *       title="Supprimer ce document ?"
 *       description="Cette action est irréversible."
 *       variant="danger"
 *       onConfirm={handleDelete}
 *   />
 */
export function ConfirmDialog({
    trigger,
    title = "Confirmer l\u0027action",
    description = "Êtes-vous sûr de vouloir continuer ? Cette action ne peut pas être annulée.",
    variant = "default",
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    isLoading = false,
    onConfirm,
}: ConfirmDialogProps) {
    const variantStyles: Record<string, { iconColor: string; actionClass: string }> = {
        danger: {
            iconColor: "text-red-400",
            actionClass: "bg-red-600 hover:bg-red-700 text-white border-0",
        },
        warning: {
            iconColor: "text-amber-400",
            actionClass: "bg-amber-600 hover:bg-amber-700 text-white border-0",
        },
        default: {
            iconColor: "text-violet-400",
            actionClass: "bg-violet-600 hover:bg-violet-700 text-white border-0",
        },
    };

    const styles = variantStyles[variant];

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent className="glass border-white/10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {variant !== "default" && (
                            <AlertTriangle className={`h-5 w-5 ${styles.iconColor}`} />
                        )}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={`text-xs ${styles.actionClass}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
