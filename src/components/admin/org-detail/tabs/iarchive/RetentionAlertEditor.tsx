// ═══════════════════════════════════════════════
// RetentionAlertEditor — Configurable alerts
// Pre-archive + Pre-deletion alert management
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Bell,
    Trash2,
    Plus,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────

interface RetentionAlertEditorProps {
    categoryId: Id<"archive_categories">;
    organizationId: Id<"organizations">;
    categoryName: string;
}

type AlertType = "pre_archive" | "pre_deletion";
type AlertUnit = "months" | "weeks" | "days" | "hours";

// ─── Quick-add presets ────────────────────────

const PRE_ARCHIVE_PRESETS = [
    { label: "+ 1 an", value: 12, unit: "months" as AlertUnit },
    { label: "+ 6 mois", value: 6, unit: "months" as AlertUnit },
    { label: "+ 3 mois", value: 3, unit: "months" as AlertUnit },
    { label: "+ 15 jours", value: 15, unit: "days" as AlertUnit },
    { label: "+ 1 semaine", value: 1, unit: "weeks" as AlertUnit },
    { label: "+ 3 jours", value: 3, unit: "days" as AlertUnit },
    { label: "+ 1 jour", value: 1, unit: "days" as AlertUnit },
    { label: "+ 1 heure", value: 1, unit: "hours" as AlertUnit },
];

const PRE_DELETION_PRESETS = [
    { label: "+ 6 mois", value: 6, unit: "months" as AlertUnit },
    { label: "+ 3 mois", value: 3, unit: "months" as AlertUnit },
    { label: "+ 1 mois", value: 1, unit: "months" as AlertUnit },
    { label: "+ 15 jours", value: 15, unit: "days" as AlertUnit },
    { label: "+ 1 semaine", value: 1, unit: "weeks" as AlertUnit },
    { label: "+ 1 jour", value: 1, unit: "days" as AlertUnit },
    { label: "+ 1 heure", value: 1, unit: "hours" as AlertUnit },
];

const UNIT_OPTIONS: { value: AlertUnit; label: string }[] = [
    { value: "months", label: "Mois" },
    { value: "weeks", label: "Semaine(s)" },
    { value: "days", label: "Jour(s)" },
    { value: "hours", label: "Heure(s)" },
];

// ─── Component ────────────────────────────────

export default function RetentionAlertEditor({
    categoryId,
    organizationId,
    categoryName,
}: RetentionAlertEditorProps) {
    const alerts = useQuery(api.retentionAlerts.listByCategory, { categoryId });
    const createAlert = useMutation(api.retentionAlerts.create);
    const removeAlert = useMutation(api.retentionAlerts.remove);

    const [expandedSection, setExpandedSection] = useState<AlertType | null>(null);
    const [customValue, setCustomValue] = useState<number>(1);
    const [customUnit, setCustomUnit] = useState<AlertUnit>("months");

    const preArchiveAlerts = (alerts ?? []).filter((a) => a.alertType === "pre_archive");
    const preDeletionAlerts = (alerts ?? []).filter((a) => a.alertType === "pre_deletion");

    // ─── Handlers ─────────────────────────────

    const handleAddAlert = async (type: AlertType, value: number, unit: AlertUnit) => {
        try {
            await createAlert({
                categoryId,
                organizationId,
                alertType: type,
                value,
                unit,
            });
            toast.success("Alerte ajoutée");
        } catch {
            toast.error("Erreur lors de l'ajout de l'alerte");
        }
    };

    const handleRemoveAlert = async (id: Id<"retention_alerts">) => {
        try {
            await removeAlert({ id });
            toast.success("Alerte supprimée");
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleAddCustom = (type: AlertType) => {
        if (customValue <= 0) return;
        handleAddAlert(type, customValue, customUnit);
    };

    // ─── Section Renderer ─────────────────────

    function renderSection(
        type: AlertType,
        title: string,
        icon: React.ReactNode,
        alertsList: typeof preArchiveAlerts,
        presets: typeof PRE_ARCHIVE_PRESETS,
        badgeColor: string,
    ) {
        const isOpen = expandedSection === type;

        return (
            <div className="border border-white/10 rounded-xl overflow-hidden">
                {/* Header */}
                <button
                    onClick={() => setExpandedSection(isOpen ? null : type)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {icon}
                        <span className="text-sm font-medium text-white/90">{title}</span>
                        <Badge
                            variant="outline"
                            className={`text-[10px] ${badgeColor}`}
                        >
                            {alertsList.length} alerte{alertsList.length !== 1 ? "s" : ""}
                        </Badge>
                    </div>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                                {/* Quick-add presets */}
                                <div className="pt-3">
                                    <p className="text-xs text-white/40 mb-2">Ajout rapide</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {presets.map((preset) => (
                                            <button
                                                key={`${preset.value}-${preset.unit}`}
                                                onClick={() => handleAddAlert(type, preset.value, preset.unit)}
                                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/60 hover:text-white/80 transition-colors border border-white/5 hover:border-white/15"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom add */}
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={customValue}
                                        onChange={(e) => setCustomValue(Number(e.target.value))}
                                        className="w-20 h-8 text-xs bg-white/5 border-white/10"
                                    />
                                    <Select
                                        value={customUnit}
                                        onValueChange={(v) => setCustomUnit(v as AlertUnit)}
                                    >
                                        <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UNIT_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddCustom(type)}
                                        className="h-8 text-xs gap-1 border-white/10 hover:bg-white/5"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Personnalisée
                                    </Button>
                                </div>

                                {/* Alert list */}
                                {alertsList.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-white/40">Alertes configurées</p>
                                        {alertsList.map((alert) => (
                                            <motion.div
                                                key={alert._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-white/30" />
                                                    <span className="text-xs text-white/70">
                                                        {alert.label}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAlert(alert._id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ─── Render ────────────────────────────────

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white/90">
                    Alertes — {categoryName}
                </h4>
            </div>

            {renderSection(
                "pre_archive",
                "Alertes avant archivage automatique",
                <Bell className="w-4 h-4 text-amber-400" />,
                preArchiveAlerts,
                PRE_ARCHIVE_PRESETS,
                "border-amber-500/30 text-amber-300"
            )}

            {renderSection(
                "pre_deletion",
                "Alertes avant suppression post-archivage",
                <AlertTriangle className="w-4 h-4 text-red-400" />,
                preDeletionAlerts,
                PRE_DELETION_PRESETS,
                "border-red-500/30 text-red-300"
            )}
        </div>
    );
}
