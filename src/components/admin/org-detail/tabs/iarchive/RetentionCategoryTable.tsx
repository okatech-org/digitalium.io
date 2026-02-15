// ═══════════════════════════════════════════════
// RetentionCategoryTable — Per-category retention
// Inline-editable table with OHADA references
// + Lifecycle phases & alert integration
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { Pencil, Trash2, Save, X, Plus, BookOpen, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { OHADA_REFERENCES } from "@/config/filing-presets";
import { toast } from "sonner";
import RetentionAlertEditor from "./RetentionAlertEditor";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// ─── Types ────────────────────────────────────

interface ArchiveCategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon: string;
    retentionYears: number;
    // Lifecycle fields (v2)
    ohadaReference?: string;
    countingStartEvent?: string;
    activeDurationYears?: number;
    semiActiveDurationYears?: number;
    alertBeforeArchiveMonths?: number;
    hasSemiActivePhase?: boolean;
    isPerpetual?: boolean;
    defaultConfidentiality: "public" | "internal" | "confidential" | "secret";
    isFixed: boolean;
    isActive: boolean;
    sortOrder: number;
}

interface RetentionCategoryTableProps {
    categories: ArchiveCategory[];
    onUpsert: (data: {
        id?: string;
        name: string;
        slug: string;
        description?: string;
        color: string;
        icon: string;
        retentionYears: number;
        defaultConfidentiality: "public" | "internal" | "confidential" | "secret";
        sortOrder?: number;
    }) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onSeedDefaults: () => Promise<void>;
}

// ─── Color constants ──────────────────────────

const COLOR_BADGE_MAP: Record<string, string> = {
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    orange: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

const CONF_BADGE: Record<string, { label: string; class: string }> = {
    public: { label: "Public", class: "bg-green-500/15 text-green-300 border-green-500/30" },
    internal: { label: "Interne", class: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    confidential: { label: "Confidentiel", class: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    secret: { label: "Secret", class: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const AVAILABLE_COLORS = ["amber", "blue", "emerald", "violet", "rose", "cyan", "orange"];

// ─── Component ────────────────────────────────

export default function RetentionCategoryTable({
    categories,
    onUpsert,
    onDelete,
    onSeedDefaults,
    organizationId,
}: RetentionCategoryTableProps & { organizationId?: Id<"organizations"> }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<ArchiveCategory>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [alertCatId, setAlertCatId] = useState<string | null>(null);
    const [newData, setNewData] = useState({
        name: "",
        slug: "",
        description: "",
        color: "cyan",
        icon: "Folder",
        retentionYears: 5,
        defaultConfidentiality: "internal" as "public" | "internal" | "confidential" | "secret",
    });

    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

    const startEdit = (cat: ArchiveCategory) => {
        setEditingId(cat._id);
        setEditData({ retentionYears: cat.retentionYears, defaultConfidentiality: cat.defaultConfidentiality });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSaveEdit = async (cat: ArchiveCategory) => {
        setSaving(true);
        try {
            await onUpsert({
                id: cat._id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                color: cat.color,
                icon: cat.icon,
                retentionYears: editData.retentionYears ?? cat.retentionYears,
                defaultConfidentiality: editData.defaultConfidentiality ?? cat.defaultConfidentiality,
                sortOrder: cat.sortOrder,
            });
            toast.success(`Catégorie "${cat.name}" mise à jour`);
            cancelEdit();
        } catch {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newData.name || !newData.slug) {
            toast.error("Nom et slug sont requis");
            return;
        }
        setSaving(true);
        try {
            await onUpsert(newData);
            toast.success(`Catégorie "${newData.name}" créée`);
            setShowAdd(false);
            setNewData({
                name: "",
                slug: "",
                description: "",
                color: "cyan",
                icon: "Folder",
                retentionYears: 5,
                defaultConfidentiality: "internal",
            });
        } catch {
            toast.error("Erreur lors de la création");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cat: ArchiveCategory) => {
        if (cat.isFixed) return;
        setSaving(true);
        try {
            await onDelete(cat._id);
            toast.success(`Catégorie "${cat.name}" supprimée`);
        } catch {
            toast.error("Impossible de supprimer cette catégorie");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with seed button */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white/70">
                    Catégories de rétention
                </h4>
                {categories.length === 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onSeedDefaults}
                        className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    >
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        Appliquer le référentiel OHADA
                    </Button>
                )}
            </div>

            {/* Table */}
            {sorted.length > 0 && (
                <div className="rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-left py-2.5 px-3 text-white/40 font-medium text-xs">Catégorie</th>
                                <th className="text-center py-2.5 px-3 text-white/40 font-medium text-xs">Durée (ans)</th>
                                <th className="text-left py-2.5 px-3 text-white/40 font-medium text-xs">Transitions</th>
                                <th className="text-left py-2.5 px-3 text-white/40 font-medium text-xs">Réf. OHADA</th>
                                <th className="text-center py-2.5 px-3 text-white/40 font-medium text-xs">Confidentialité</th>
                                <th className="text-right py-2.5 px-3 text-white/40 font-medium text-xs w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((cat) => {
                                const isEditing = editingId === cat._id;
                                const ohadaRef = OHADA_REFERENCES[cat.slug];

                                return (
                                    <React.Fragment key={cat._id}>
                                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            {/* Name + color badge */}
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] px-1.5 ${COLOR_BADGE_MAP[cat.color] ?? COLOR_BADGE_MAP.cyan}`}
                                                    >
                                                        {cat.name}
                                                    </Badge>
                                                    {cat.isFixed && (
                                                        <span className="text-[10px] text-rose-400/60">🔒</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Retention years */}
                                            <td className="text-center py-2.5 px-3">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={99}
                                                        value={editData.retentionYears ?? cat.retentionYears}
                                                        onChange={(e) =>
                                                            setEditData((p) => ({
                                                                ...p,
                                                                retentionYears: parseInt(e.target.value) || 1,
                                                            }))
                                                        }
                                                        className="w-20 h-7 text-center bg-white/[0.04] border-white/10 text-white/90 mx-auto"
                                                    />
                                                ) : (
                                                    <span className="text-white/80 font-mono text-xs">
                                                        {cat.retentionYears === 99 ? "∞" : `${cat.retentionYears} ans`}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Transitions summary */}
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1 text-[10px] text-white/50">
                                                    {cat.isPerpetual ? (
                                                        <Badge variant="outline" className="text-[9px] border-rose-500/30 text-rose-300">♾ Perpétuel</Badge>
                                                    ) : (
                                                        <>
                                                            <span className="text-emerald-300">Actif</span>
                                                            <ArrowRight className="w-2.5 h-2.5 text-white/20" />
                                                            <span>{cat.activeDurationYears ?? "?"}a</span>
                                                            {cat.hasSemiActivePhase && (
                                                                <>
                                                                    <span className="text-white/20">·</span>
                                                                    <span className="text-amber-300">Semi</span>
                                                                    <ArrowRight className="w-2.5 h-2.5 text-white/20" />
                                                                    <span>{cat.semiActiveDurationYears ?? "?"}a</span>
                                                                </>
                                                            )}
                                                            {cat.alertBeforeArchiveMonths && (
                                                                <>
                                                                    <span className="text-white/20">·</span>
                                                                    <span className="text-blue-300" title={`Alerte ${cat.alertBeforeArchiveMonths}m avant`}>🔔{cat.alertBeforeArchiveMonths}m</span>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* OHADA reference */}
                                            <td className="py-2.5 px-3">
                                                {cat.ohadaReference ? (
                                                    <span className="text-[10px] text-white/50" title={cat.ohadaReference}>
                                                        {cat.ohadaReference.split("—")[0]?.trim()}
                                                    </span>
                                                ) : ohadaRef ? (
                                                    <span className="text-xs text-white/50" title={ohadaRef.description}>
                                                        {ohadaRef.article}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-white/20">—</span>
                                                )}
                                            </td>

                                            {/* Confidentiality */}
                                            <td className="text-center py-2.5 px-3">
                                                {isEditing && !cat.isFixed ? (
                                                    <Select
                                                        value={editData.defaultConfidentiality ?? cat.defaultConfidentiality}
                                                        onValueChange={(val) =>
                                                            setEditData((p) => ({
                                                                ...p,
                                                                defaultConfidentiality: val as "public" | "internal" | "confidential" | "secret",
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="w-28 h-7 bg-white/[0.04] border-white/10 text-xs mx-auto">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="public">Public</SelectItem>
                                                            <SelectItem value="internal">Interne</SelectItem>
                                                            <SelectItem value="confidential">Confidentiel</SelectItem>
                                                            <SelectItem value="secret">Secret</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] ${CONF_BADGE[cat.defaultConfidentiality]?.class ?? ""}`}
                                                    >
                                                        {CONF_BADGE[cat.defaultConfidentiality]?.label ?? cat.defaultConfidentiality}
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="text-right py-2.5 px-3">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
                                                            onClick={() => handleSaveEdit(cat)}
                                                            disabled={saving}
                                                        >
                                                            <Save className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-white/40 hover:text-white/70"
                                                            onClick={cancelEdit}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className={`h-7 w-7 ${alertCatId === cat._id ? 'text-amber-400' : 'text-white/40'} hover:text-amber-300`}
                                                            onClick={() => setAlertCatId(alertCatId === cat._id ? null : cat._id)}
                                                            title="Configurer les alertes"
                                                        >
                                                            <Bell className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-white/40 hover:text-white/70"
                                                            onClick={() => startEdit(cat)}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        {!cat.isFixed && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 text-white/40 hover:text-red-400"
                                                                onClick={() => handleDelete(cat)}
                                                                disabled={saving}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {/* Alert editor row */}
                                        {alertCatId === cat._id && organizationId && (
                                            <tr className="border-b border-white/5">
                                                <td colSpan={6} className="py-3 px-4 bg-white/[0.01]">
                                                    <RetentionAlertEditor
                                                        categoryId={cat._id as Id<"archive_categories">}
                                                        organizationId={organizationId}
                                                        categoryName={cat.name}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty state */}
            {sorted.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">
                    Aucune catégorie configurée. Utilisez le bouton ci-dessus pour appliquer le référentiel OHADA.
                </div>
            )}

            {/* Add new category form */}
            {showAdd ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                    <h5 className="text-xs font-semibold text-white/60">Nouvelle catégorie</h5>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-white/40 mb-1 block">Nom</label>
                            <Input
                                value={newData.name}
                                onChange={(e) => setNewData((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Ex: Technique"
                                className="h-8 bg-white/[0.04] border-white/10 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 mb-1 block">Slug</label>
                            <Input
                                value={newData.slug}
                                onChange={(e) => setNewData((p) => ({ ...p, slug: e.target.value }))}
                                placeholder="Ex: technique"
                                className="h-8 bg-white/[0.04] border-white/10 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 mb-1 block">Durée (ans)</label>
                            <Input
                                type="number"
                                min={1}
                                max={99}
                                value={newData.retentionYears}
                                onChange={(e) => setNewData((p) => ({ ...p, retentionYears: parseInt(e.target.value) || 1 }))}
                                className="h-8 bg-white/[0.04] border-white/10 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 mb-1 block">Couleur</label>
                            <Select value={newData.color} onValueChange={(v) => setNewData((p) => ({ ...p, color: v }))}>
                                <SelectTrigger className="h-8 bg-white/[0.04] border-white/10 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_COLORS.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-white/40 mb-1 block">Confidentialité par défaut</label>
                            <Select
                                value={newData.defaultConfidentiality}
                                onValueChange={(v) => setNewData((p) => ({ ...p, defaultConfidentiality: v as "public" | "internal" | "confidential" | "secret" }))}
                            >
                                <SelectTrigger className="h-8 bg-white/[0.04] border-white/10 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="internal">Interne</SelectItem>
                                    <SelectItem value="confidential">Confidentiel</SelectItem>
                                    <SelectItem value="secret">Secret</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            size="sm"
                            onClick={handleAddCategory}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            <Save className="w-3.5 h-3.5 mr-1.5" />
                            Créer
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAdd(false)}
                            className="text-white/50"
                        >
                            Annuler
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-white/60 hover:text-white/90 w-full"
                    onClick={() => setShowAdd(true)}
                >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Ajouter une catégorie
                </Button>
            )}
        </div>
    );
}
