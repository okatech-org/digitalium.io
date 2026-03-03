"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Context Menu for Folders & Documents
// Menu « ⋯ » with: rename, delete, retention category, lifecycle,
// confidentiality, and inheritance settings.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import {
    MoreHorizontal,
    Edit3,
    Trash2,
    Archive,
    Calendar,
    Shield,
    GitBranch,
    Landmark,
    Users,
    Scale,
    Briefcase,
    Lock,
    Tag,
    CalendarClock,
    CalendarPlus,
    Clock,
    Info,
    User,
    FileText,
    Folder as FolderIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// ─── Types ──────────────────────────────────────────────

export interface ArchiveCategoryOption {
    _id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
    retentionYears: number;
    description?: string;
}

export type CountingStartEvent =
    | "date_creation"
    | "date_cloture"
    | "date_tag"
    | "date_gel"
    | "date_manuelle";

export type ConfidentialityLevel = "public" | "internal" | "confidential" | "secret";

export interface ArchivePolicyData {
    categoryId: string;
    categorySlug: string;
    countingStartEvent: CountingStartEvent;
    manualDate?: number; // timestamp, only when countingStartEvent === "date_manuelle"
    confidentiality: ConfidentialityLevel;
    inheritToChildren: boolean;
    inheritToDocuments: boolean;
}

interface FolderDocumentContextMenuProps {
    itemId: string;
    itemType: "folder" | "document";
    itemName: string;
    isSystem?: boolean;
    isAdmin?: boolean;
    categories: ArchiveCategoryOption[];
    currentPolicy?: Partial<ArchivePolicyData> | null;
    itemCreatedAt?: string;
    itemUpdatedAt?: string;
    itemCreatedBy?: string;
    onRename?: (id: string, newName: string) => void;
    onDelete?: (id: string) => void;
    onSavePolicy?: (id: string, policy: ArchivePolicyData) => void;
}

// ─── Constants ──────────────────────────────────────────

const COUNTING_START_OPTIONS: { value: CountingStartEvent; label: string; description: string }[] = [
    { value: "date_creation", label: "À la création", description: "Le cycle commence dès la création du document/dossier" },
    { value: "date_cloture", label: "À la clôture", description: "Le cycle commence quand le document est finalisé/approuvé" },
    { value: "date_tag", label: "Au tagging", description: "Le cycle commence quand la catégorie est assignée" },
    { value: "date_gel", label: "Au gel juridique", description: "Le cycle commence lors d'une suspension pour litige/audit" },
    { value: "date_manuelle", label: "Date personnalisée", description: "Vous définissez une date de début manuellement" },
];

const CONFIDENTIALITY_OPTIONS: { value: ConfidentialityLevel; label: string; color: string }[] = [
    { value: "public", label: "Public", color: "text-emerald-400" },
    { value: "internal", label: "Interne", color: "text-blue-400" },
    { value: "confidential", label: "Confidentiel", color: "text-amber-400" },
    { value: "secret", label: "Secret", color: "text-red-400" },
];

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Landmark,
    Users,
    Scale,
    Briefcase,
    Lock,
};

function getCategoryIcon(iconName: string): React.ComponentType<{ className?: string }> {
    return CATEGORY_ICON_MAP[iconName] || Archive;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
    amber: "text-amber-400 bg-amber-500/15",
    blue: "text-blue-400 bg-blue-500/15",
    emerald: "text-emerald-400 bg-emerald-500/15",
    violet: "text-violet-400 bg-violet-500/15",
    rose: "text-rose-400 bg-rose-500/15",
};

// ─── Main Component ─────────────────────────────────────

export default function FolderDocumentContextMenu({
    itemId,
    itemType,
    itemName,
    isSystem = false,
    isAdmin = false,
    categories,
    currentPolicy,
    itemCreatedAt,
    itemUpdatedAt,
    itemCreatedBy,
    onRename,
    onDelete,
    onSavePolicy,
}: FolderDocumentContextMenuProps) {
    // ─── State ──────────────────────────────────────
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showPolicyDialog, setShowPolicyDialog] = useState(false);
    const [renameValue, setRenameValue] = useState(itemName);

    // Policy editing state
    const [selectedCategoryId, setSelectedCategoryId] = useState(currentPolicy?.categoryId || "");
    const [selectedCategorySlug, setSelectedCategorySlug] = useState(currentPolicy?.categorySlug || "");
    const [countingStart, setCountingStart] = useState<CountingStartEvent>(
        (currentPolicy?.countingStartEvent as CountingStartEvent) || "date_creation"
    );
    const [manualDate, setManualDate] = useState<string>(() => {
        if (currentPolicy?.manualDate) {
            return new Date(currentPolicy.manualDate).toISOString().split("T")[0];
        }
        return new Date().toISOString().split("T")[0];
    });
    const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>(
        (currentPolicy?.confidentiality as ConfidentialityLevel) || "internal"
    );
    const [inheritChildren, setInheritChildren] = useState(currentPolicy?.inheritToChildren ?? true);
    const [inheritDocuments, setInheritDocuments] = useState(currentPolicy?.inheritToDocuments ?? true);

    // ─── Handlers ───────────────────────────────────

    const handleOpenRename = useCallback(() => {
        setRenameValue(itemName);
        setShowRenameDialog(true);
    }, [itemName]);

    const handleConfirmRename = useCallback(() => {
        if (renameValue.trim() && onRename) {
            onRename(itemId, renameValue.trim());
        }
        setShowRenameDialog(false);
    }, [renameValue, itemId, onRename]);

    const handleDelete = useCallback(() => {
        if (onDelete) onDelete(itemId);
    }, [itemId, onDelete]);

    const handleOpenPolicy = useCallback(() => {
        // Reset to current values
        setSelectedCategoryId(currentPolicy?.categoryId || "");
        setSelectedCategorySlug(currentPolicy?.categorySlug || "");
        setCountingStart((currentPolicy?.countingStartEvent as CountingStartEvent) || "date_creation");
        setConfidentiality((currentPolicy?.confidentiality as ConfidentialityLevel) || "internal");
        setInheritChildren(currentPolicy?.inheritToChildren ?? true);
        setInheritDocuments(currentPolicy?.inheritToDocuments ?? true);
        setShowPolicyDialog(true);
    }, [currentPolicy]);

    const handleSelectCategory = useCallback((cat: ArchiveCategoryOption) => {
        setSelectedCategoryId(cat._id);
        setSelectedCategorySlug(cat.slug);
    }, []);

    const handleSavePolicy = useCallback(() => {
        if (!selectedCategoryId || !onSavePolicy) return;
        onSavePolicy(itemId, {
            categoryId: selectedCategoryId,
            categorySlug: selectedCategorySlug,
            countingStartEvent: countingStart,
            manualDate: countingStart === "date_manuelle" ? new Date(manualDate).getTime() : undefined,
            confidentiality,
            inheritToChildren: inheritChildren,
            inheritToDocuments: inheritDocuments,
        });
        setShowPolicyDialog(false);
    }, [
        itemId, selectedCategoryId, selectedCategorySlug,
        countingStart, manualDate, confidentiality,
        inheritChildren, inheritDocuments, onSavePolicy,
    ]);

    const selectedCategory = categories.find((c) => c._id === selectedCategoryId);

    // ─── Render ─────────────────────────────────────

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 w-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all text-muted-foreground hover:text-white"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 bg-zinc-900 border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        {itemType === "folder" ? "Dossier" : "Document"} — Actions
                    </DropdownMenuLabel>

                    {/* ── Rename ── */}
                    {!isSystem && (
                        <DropdownMenuItem onClick={handleOpenRename} className="text-xs gap-2">
                            <Edit3 className="h-3.5 w-3.5" />
                            Renommer
                        </DropdownMenuItem>
                    )}

                    {/* ── Archive Policy ── */}
                    {isAdmin && (
                        <DropdownMenuItem onClick={handleOpenPolicy} className="text-xs gap-2">
                            <Archive className="h-3.5 w-3.5 text-cyan-400" />
                            Politique d'archivage
                        </DropdownMenuItem>
                    )}

                    {/* ── Quick Category Sub-menu ── */}
                    {isAdmin && categories.length > 0 && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="text-xs gap-2">
                                <Tag className="h-3.5 w-3.5 text-violet-400" />
                                Catégorie de rétention
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-zinc-900 border-white/10">
                                {categories.map((cat) => {
                                    const Icon = getCategoryIcon(cat.icon);
                                    const colorClasses = CATEGORY_COLOR_MAP[cat.color] || "text-zinc-400 bg-zinc-500/15";
                                    const isSelected = cat._id === (currentPolicy?.categoryId || selectedCategoryId);
                                    return (
                                        <DropdownMenuItem
                                            key={cat._id}
                                            onClick={() => {
                                                handleSelectCategory(cat);
                                                // Quick-save just the category
                                                if (onSavePolicy) {
                                                    onSavePolicy(itemId, {
                                                        categoryId: cat._id,
                                                        categorySlug: cat.slug,
                                                        countingStartEvent: countingStart,
                                                        confidentiality,
                                                        inheritToChildren: inheritChildren,
                                                        inheritToDocuments: inheritDocuments,
                                                    });
                                                }
                                            }}
                                            className={`text-xs gap-2 ${isSelected ? "bg-white/5" : ""}`}
                                        >
                                            <div className={`h-5 w-5 rounded flex items-center justify-center ${colorClasses.split(" ")[1]}`}>
                                                <Icon className={`h-3 w-3 ${colorClasses.split(" ")[0]}`} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium">{cat.name}</span>
                                                <span className="text-[10px] text-muted-foreground ml-1.5">
                                                    {cat.retentionYears} ans
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <span className="text-emerald-400 text-[10px]">✓</span>
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )}

                    {/* ── Delete ── */}
                    {!isSystem && (
                        <>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-xs gap-2 text-red-400 focus:text-red-400"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Supprimer
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ═══ Rename Dialog ═══════════════════════════════ */}
            <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-violet-400" />
                            Renommer {itemType === "folder" ? "le dossier" : "le document"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="rename-input" className="text-xs">Nouveau nom</Label>
                            <Input
                                id="rename-input"
                                value={renameValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
                                className="bg-white/5 border-white/10"
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === "Enter") handleConfirmRename();
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRenameDialog(false)} className="border-white/10">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmRename}
                            disabled={!renameValue.trim() || renameValue.trim() === itemName}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0"
                        >
                            Renommer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══ Archive Policy Dialog — Two-column Layout ═══ */}
            <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-white/5">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <div className="h-8 w-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                                    <Archive className="h-4 w-4 text-cyan-400" />
                                </div>
                                Politique d&apos;archivage
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-1">
                                {itemType === "folder" ? <FolderIcon className="h-3 w-3 inline mr-1" /> : <FileText className="h-3 w-3 inline mr-1" />}
                                <span className="font-medium text-white/60">{itemName}</span>
                                <span className="text-white/30"> — configurez la rétention, le cycle de vie et la confidentialité</span>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Scrollable Body — Two Columns */}
                    <div className="overflow-y-auto max-h-[calc(90vh-160px)] px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ══ Left Column ══ */}
                            <div className="space-y-5">
                                {/* Category Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Tag className="h-3 w-3 text-violet-400" />
                                        Catégorie de rétention
                                    </Label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {categories.map((cat) => {
                                            const Icon = getCategoryIcon(cat.icon);
                                            const colorClasses = CATEGORY_COLOR_MAP[cat.color] || "text-zinc-400 bg-zinc-500/15";
                                            const isSelected = cat._id === selectedCategoryId;
                                            return (
                                                <button
                                                    key={cat._id}
                                                    onClick={() => handleSelectCategory(cat)}
                                                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${isSelected
                                                            ? "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20"
                                                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                                        }`}
                                                >
                                                    <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${colorClasses.split(" ")[1]}`}>
                                                        <Icon className={`h-3 w-3 ${colorClasses.split(" ")[0]}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-medium truncate">{cat.name}</p>
                                                        <p className="text-[9px] text-muted-foreground">{cat.retentionYears} ans</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedCategory?.description && (
                                        <p className="text-[10px] text-muted-foreground italic pl-1">
                                            {selectedCategory.description}
                                        </p>
                                    )}
                                </div>

                                {/* Lifecycle Start Event */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <CalendarClock className="h-3 w-3 text-amber-400" />
                                        Début du cycle de vie
                                    </Label>
                                    <div className="space-y-1">
                                        {COUNTING_START_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setCountingStart(opt.value)}
                                                className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${countingStart === opt.value
                                                        ? "border-amber-500/40 bg-amber-500/10"
                                                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                                    }`}
                                            >
                                                <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${countingStart === opt.value ? "border-amber-400" : "border-white/20"
                                                    }`}>
                                                    {countingStart === opt.value && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium">{opt.label}</p>
                                                    <p className="text-[9px] text-muted-foreground leading-tight">{opt.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {countingStart === "date_manuelle" && (
                                        <div className="flex items-center gap-2 mt-1 pl-6">
                                            <CalendarPlus className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                            <Input
                                                type="date"
                                                value={manualDate}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualDate(e.target.value)}
                                                className="h-7 text-xs bg-white/5 border-white/10 max-w-[180px]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ══ Right Column ══ */}
                            <div className="space-y-5">
                                {/* Confidentiality */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Shield className="h-3 w-3 text-rose-400" />
                                        Confidentialité
                                    </Label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {CONFIDENTIALITY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setConfidentiality(opt.value)}
                                                className={`py-2 px-3 rounded-lg border text-[11px] font-medium transition-all ${confidentiality === opt.value
                                                        ? `border-white/20 bg-white/10 ${opt.color}`
                                                        : "border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/10"
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Inheritance (folders only) */}
                                {itemType === "folder" && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                                            <GitBranch className="h-3 w-3 text-teal-400" />
                                            Héritage
                                        </Label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                                <div>
                                                    <p className="text-[11px] font-medium">Sous-dossiers</p>
                                                    <p className="text-[9px] text-muted-foreground">Héritent de cette politique</p>
                                                </div>
                                                <Switch checked={inheritChildren} onCheckedChange={setInheritChildren} />
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                                <div>
                                                    <p className="text-[11px] font-medium">Documents enfants</p>
                                                    <p className="text-[9px] text-muted-foreground">Héritent de la catégorie</p>
                                                </div>
                                                <Switch checked={inheritDocuments} onCheckedChange={setInheritDocuments} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Horodatage */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-sky-400" />
                                        Horodatage
                                    </Label>
                                    <div className="rounded-lg bg-white/[0.02] border border-white/5 divide-y divide-white/5">
                                        <div className="flex items-center gap-2.5 px-3 py-2">
                                            <Calendar className="h-3 w-3 text-sky-400/60 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Créé le</p>
                                                <p className="text-[11px] font-medium text-white/70">{itemCreatedAt || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-2">
                                            <Clock className="h-3 w-3 text-sky-400/60 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Dernière modification</p>
                                                <p className="text-[11px] font-medium text-white/70">{itemUpdatedAt || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-2">
                                            <User className="h-3 w-3 text-sky-400/60 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Créé par</p>
                                                <p className="text-[11px] font-medium text-white/70">{itemCreatedBy || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-2">
                                            <Info className="h-3 w-3 text-sky-400/60 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Identifiant</p>
                                                <p className="text-[10px] font-mono text-white/40 truncate">{itemId}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowPolicyDialog(false)} className="border-white/10">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSavePolicy}
                            disabled={!selectedCategoryId}
                            className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white border-0"
                        >
                            <Archive className="h-4 w-4 mr-1.5" />
                            Enregistrer la politique
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══ Current Policy Badge (exported for inline use) ═══ */}
        </>
    );
}

// ─── Helper: Badge showing current retention category ───

export function RetentionCategoryBadge({
    categorySlug,
    categories,
}: {
    categorySlug?: string;
    categories: ArchiveCategoryOption[];
}) {
    if (!categorySlug) return null;
    const cat = categories.find((c) => c.slug === categorySlug);
    if (!cat) return null;

    const Icon = getCategoryIcon(cat.icon);
    const colorClasses = CATEGORY_COLOR_MAP[cat.color] || "text-zinc-400 bg-zinc-500/15";
    const textColor = colorClasses.split(" ")[0];
    const bgColor = colorClasses.split(" ")[1];

    return (
        <Badge
            variant="outline"
            className={`text-[9px] h-4 gap-1 border-transparent ${bgColor} ${textColor}`}
        >
            <Icon className="h-2.5 w-2.5" />
            {cat.name}
        </Badge>
    );
}
