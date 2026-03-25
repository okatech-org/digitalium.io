"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Archive,
    PenTool,
    Bot,
    Save,
    Loader2,
    Plus,
    Edit3,
    Power,
    Trash2,
    Sparkles,
    Tag,
    FormInput,
    Users,
    Shield,
    X,
    UserPlus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import IArchiveConfigPanel from "./iarchive/IArchiveConfigPanel";
import ConfigChangeConfirmDialog from "../ConfigChangeConfirmDialog";
import InfoButton from "../InfoButton";
import { HELP_MODULES } from "@/config/org-config-help";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────

interface ModulesConfigTabProps {
    orgId: any;
    activeModules: string[];
    config?: any;
    onSaveConfig: (config: any) => Promise<void>;
}

interface IDocumentConfig {
    versionnageAuto: boolean;
    autoClassification: boolean;
    maxFileSize: number;
    maxVideoSize: number;
    allowedFormats: string[];
}

interface IArchiveConfig {
    retentionPeriod: string;
    archivageAutomatique: boolean;
    notificationsExpiration: boolean;
}

interface ISignatureConfig {
    maxSignataires: number;
    delegationAutorisee: boolean;
    horodatageObligatoire: boolean;
}

// ─── Constants ────────────────────────────────

const MODULE_META: Record<
    string,
    { label: string; icon: React.ElementType; description: string }
> = {
    iDocument: {
        label: "iDocument",
        icon: FileText,
        description: "Gestion documentaire et workflows",
    },
    iArchive: {
        label: "iArchive",
        icon: Archive,
        description: "Archivage et conservation legale",
    },
    iSignature: {
        label: "iSignature",
        icon: PenTool,
        description: "Signature electronique et validation",
    },
    iAsted: {
        label: "iAsted",
        icon: Bot,
        description: "Assistant IA et automatisation",
    },
};

const FORMAT_CATEGORIES = [
    {
        label: "Documents",
        formats: [
            { ext: "pdf", label: "PDF", color: "bg-red-500/15 text-red-300 border-red-500/30" },
            { ext: "docx", label: "DOCX", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
            { ext: "xlsx", label: "XLSX", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
            { ext: "pptx", label: "PPTX", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
            { ext: "txt", label: "TXT", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
            { ext: "csv", label: "CSV", color: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
        ],
    },
    {
        label: "Images",
        formats: [
            { ext: "jpg", label: "JPG", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
            { ext: "png", label: "PNG", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
            { ext: "svg", label: "SVG", color: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
            { ext: "webp", label: "WEBP", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
            { ext: "gif", label: "GIF", color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
        ],
    },
    {
        label: "Vidéo",
        formats: [
            { ext: "mp4", label: "MP4", color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
            { ext: "webm", label: "WEBM", color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
            { ext: "mov", label: "MOV", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
            { ext: "avi", label: "AVI", color: "bg-lime-500/15 text-lime-300 border-lime-500/30" },
        ],
    },
];

const VIDEO_FORMATS = FORMAT_CATEGORIES.find((c) => c.label === "Vidéo")!.formats.map((f) => f.ext);

const DEFAULT_FORMATS = ["pdf", "docx", "xlsx", "jpg", "png"];

// ─── Helpers ──────────────────────────────────

function parseFormats(val: string | string[] | undefined): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
        return val.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    }
    return DEFAULT_FORMATS;
}

function getDefaultDocumentConfig(existing?: any): IDocumentConfig {
    return {
        versionnageAuto: existing?.versionnageAuto ?? true,
        autoClassification: existing?.autoClassification ?? false,
        maxFileSize: existing?.maxFileSize ?? 50,
        maxVideoSize: existing?.maxVideoSize ?? 500,
        allowedFormats: parseFormats(existing?.allowedFormats),
    };
}

function getDefaultArchiveConfig(existing?: any): IArchiveConfig {
    return {
        retentionPeriod: existing?.retentionPeriod ?? "10",
        archivageAutomatique: existing?.archivageAutomatique ?? true,
        notificationsExpiration: existing?.notificationsExpiration ?? true,
    };
}

function getDefaultSignatureConfig(existing?: any): ISignatureConfig {
    return {
        maxSignataires: existing?.maxSignataires ?? 5,
        delegationAutorisee: existing?.delegationAutorisee ?? false,
        horodatageObligatoire: existing?.horodatageObligatoire ?? true,
    };
}

// ─── Sub-components ───────────────────────────

function ToggleRow({
    label,
    description,
    checked,
    onCheckedChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (val: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80">{label}</p>
                {description && (
                    <p className="text-xs text-white/40 mt-0.5">{description}</p>
                )}
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

function SaveButton({
    onClick,
    saving,
}: {
    onClick: () => void;
    saving: boolean;
}) {
    return (
        <div className="flex justify-end pt-4">
            <Button
                onClick={onClick}
                disabled={saving}
                className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white border-0 shadow-lg shadow-violet-500/20"
            >
                {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
            </Button>
        </div>
    );
}

// ─── Module Sub-tab Panels ────────────────────

function IDocumentPanel({
    config,
    onSave,
    orgId,
}: {
    config: IDocumentConfig;
    onSave: (cfg: IDocumentConfig) => Promise<void>;
    orgId: Id<"organizations"> | null;
}) {
    const [local, setLocal] = useState<IDocumentConfig>(config);
    const [saving, setSaving] = useState(false);

    // ── Document Types state ──
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [typeForm, setTypeForm] = useState({ nom: "", code: "", description: "", icone: "File", couleur: "#6B7280", retentionCategorySlug: "", isDefault: false });

    // ── Metadata Fields state ──
    const [showMetaDialog, setShowMetaDialog] = useState(false);
    const [metaForm, setMetaForm] = useState({ fieldLabel: "", fieldName: "", fieldType: "text" as string, isRequired: false, options: "", defaultValue: "", ordre: 0 });

    // ── Convex queries / mutations ──
    const documentTypes = useQuery(api.documentTypes.listAll, orgId ? { organizationId: orgId } : "skip");
    const metadataFields = useQuery(api.documentMetadataFields.list, orgId ? { organizationId: orgId } : "skip");
    const createType = useMutation(api.documentTypes.create);
    const updateType = useMutation(api.documentTypes.update);
    const removeType = useMutation(api.documentTypes.remove);
    const seedDefaults = useMutation(api.documentTypes.seedDefaults);
    const createMeta = useMutation(api.documentMetadataFields.create);
    const updateMeta = useMutation(api.documentMetadataFields.update);
    const removeMeta = useMutation(api.documentMetadataFields.remove);

    // ── Permission Groups state ──
    const permissionGroups = useQuery(api.permissionGroups.list, orgId ? { organizationId: orgId } : "skip");
    const createGroup = useMutation(api.permissionGroups.create);
    const updateGroup = useMutation(api.permissionGroups.update);
    const removeGroup = useMutation(api.permissionGroups.remove);
    const addMemberMut = useMutation(api.permissionGroups.addMember);
    const removeMemberMut = useMutation(api.permissionGroups.removeMember);
    const [showGroupDialog, setShowGroupDialog] = useState(false);
    const [groupForm, setGroupForm] = useState({ nom: "", description: "", permissions: "" as string });
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [addMemberGroupId, setAddMemberGroupId] = useState<string | null>(null);
    const [newMemberId, setNewMemberId] = useState("");

    // ── ConfigChangeConfirmDialog state ──
    const [showConfigConfirm, setShowConfigConfirm] = useState(false);
    const [pendingConfigChange, setPendingConfigChange] = useState<{ type: string; description: string } | null>(null);

    useEffect(() => {
        setLocal(config);
    }, [config]);

    const handleSave = async () => {
        // Show the config change impact dialog before saving
        if (orgId) {
            setPendingConfigChange({ type: "document_type", description: "Modification de la configuration iDocument" });
            setShowConfigConfirm(true);
            return;
        }
        await doSave();
    };

    const doSave = async () => {
        setSaving(true);
        try {
            await onSave(local);
        } finally {
            setSaving(false);
        }
    };

    const toggleFormat = (ext: string) => {
        setLocal((prev) => {
            const has = prev.allowedFormats.includes(ext);
            return {
                ...prev,
                allowedFormats: has
                    ? prev.allowedFormats.filter((f) => f !== ext)
                    : [...prev.allowedFormats, ext],
            };
        });
    };

    const hasVideoFormats = local.allowedFormats.some((f) => VIDEO_FORMATS.includes(f));

    // ── Document Type handlers ──
    const handleSaveType = async () => {
        if (!orgId) return;
        try {
            if (editingType) {
                await updateType({ id: editingType._id, ...typeForm });
                toast.success("Type modifié");
            } else {
                await createType({ organizationId: orgId, ...typeForm });
                toast.success("Type créé");
            }
            setShowTypeDialog(false);
            setEditingType(null);
            setTypeForm({ nom: "", code: "", description: "", icone: "File", couleur: "#6B7280", retentionCategorySlug: "", isDefault: false });
        } catch (err: any) {
            toast.error(err.message || "Erreur");
        }
    };

    const handleSeedDefaults = async () => {
        if (!orgId) return;
        try {
            await seedDefaults({ organizationId: orgId });
            toast.success("8 types par défaut créés");
        } catch (err: any) {
            toast.error(err.message || "Erreur");
        }
    };

    // ── Metadata handlers ──
    const handleSaveMeta = async () => {
        if (!orgId) return;
        try {
            const fieldName = metaForm.fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
            await createMeta({
                organizationId: orgId,
                fieldName,
                fieldLabel: metaForm.fieldLabel,
                fieldType: metaForm.fieldType as any,
                isRequired: metaForm.isRequired,
                options: metaForm.fieldType === "select" ? metaForm.options.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
                defaultValue: metaForm.defaultValue || undefined,
                ordre: metaForm.ordre || (metadataFields?.length ?? 0),
            });
            toast.success("Champ ajouté");
            setShowMetaDialog(false);
            setMetaForm({ fieldLabel: "", fieldName: "", fieldType: "text", isRequired: false, options: "", defaultValue: "", ordre: 0 });
        } catch (err: any) {
            toast.error(err.message || "Erreur");
        }
    };

    return (
        <div className="space-y-4">
            {/* ── Config standard iDocument ── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4">
                    Configuration iDocument
                </h3>
                <div className="space-y-3">
                    <ToggleRow
                        label="Versionnage automatique"
                        description="Créer automatiquement une nouvelle version à chaque modification"
                        checked={local.versionnageAuto}
                        onCheckedChange={(val) =>
                            setLocal((prev) => ({ ...prev, versionnageAuto: val }))
                        }
                    />
                    <ToggleRow
                        label="Auto-classification"
                        description="Classer automatiquement les documents par type et catégorie"
                        checked={local.autoClassification}
                        onCheckedChange={(val) =>
                            setLocal((prev) => ({ ...prev, autoClassification: val }))
                        }
                    />

                    <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Label className="text-sm font-medium text-white/80">
                            Taille max des fichiers (Mo)
                        </Label>
                        <p className="text-xs text-white/40 mt-0.5 mb-2">
                            Limite de taille pour les documents et images uploadés
                        </p>
                        <Input
                            type="number"
                            min={1}
                            max={500}
                            value={local.maxFileSize}
                            onChange={(e) =>
                                setLocal((prev) => ({
                                    ...prev,
                                    maxFileSize: Number(e.target.value) || 1,
                                }))
                            }
                            className="w-32 bg-white/[0.04] border-white/10 text-white/90"
                        />
                    </div>

                    {/* ── Formats autorisés (badges cliquables) ── */}
                    <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Label className="text-sm font-medium text-white/80">
                            Formats autorisés
                        </Label>
                        <p className="text-xs text-white/40 mt-0.5 mb-3">
                            Cliquez pour activer ou désactiver un format
                        </p>

                        {FORMAT_CATEGORIES.map((cat) => (
                            <div key={cat.label} className="mb-3 last:mb-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">
                                    {cat.label}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {cat.formats.map((fmt) => {
                                        const isActive = local.allowedFormats.includes(fmt.ext);
                                        return (
                                            <button
                                                key={fmt.ext}
                                                type="button"
                                                aria-label={`Format .${fmt.label.toLowerCase()}`}
                                                onClick={() => toggleFormat(fmt.ext)}
                                                className={`
                                                    px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200
                                                    ${isActive
                                                        ? `${fmt.color} shadow-sm`
                                                        : "bg-white/[0.02] text-white/20 border-white/5 hover:border-white/15 hover:text-white/40"
                                                    }
                                                `}
                                            >
                                                .{fmt.label.toLowerCase()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="mt-3 pt-2 border-t border-white/5">
                            <p className="text-[10px] text-white/30">
                                {local.allowedFormats.length} format{local.allowedFormats.length > 1 ? "s" : ""} sélectionné{local.allowedFormats.length > 1 ? "s" : ""} :{" "}
                                <span className="text-white/50">{local.allowedFormats.join(", ")}</span>
                            </p>
                        </div>
                    </div>

                    {/* ── Taille max vidéo (affiché uniquement si un format vidéo est activé) ── */}
                    {hasVideoFormats && (
                        <div className="py-3 px-4 rounded-lg bg-fuchsia-500/[0.04] border border-fuchsia-500/15">
                            <Label className="text-sm font-medium text-fuchsia-300">
                                Taille max des vidéos (Mo)
                            </Label>
                            <p className="text-xs text-white/40 mt-0.5 mb-2">
                                Limite spécifique pour les fichiers vidéo (mp4, webm, mov, avi)
                            </p>
                            <Input
                                type="number"
                                min={10}
                                max={5000}
                                value={local.maxVideoSize}
                                onChange={(e) =>
                                    setLocal((prev) => ({
                                        ...prev,
                                        maxVideoSize: Number(e.target.value) || 100,
                                    }))
                                }
                                className="w-32 bg-white/[0.04] border-fuchsia-500/20 text-white/90"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ TYPES DE DOCUMENTS (v7) ═══ */}
            {orgId && (
                <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.03] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-violet-400" />
                            <h3 className="text-sm font-semibold text-white/70">Types de documents</h3>
                        </div>
                        <div className="flex gap-2">
                            {(!documentTypes || documentTypes.length === 0) && (
                                <Button size="sm" variant="outline" onClick={handleSeedDefaults} className="text-xs h-7 border-violet-500/20 text-violet-300 hover:bg-violet-500/10">
                                    <Sparkles className="h-3 w-3 mr-1" /> Initialiser par défaut
                                </Button>
                            )}
                            <Button size="sm" onClick={() => { setEditingType(null); setTypeForm({ nom: "", code: "", description: "", icone: "File", couleur: "#6B7280", retentionCategorySlug: "", isDefault: false }); setShowTypeDialog(true); }} className="text-xs h-7 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border-0">
                                <Plus className="h-3 w-3 mr-1" /> Ajouter
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {documentTypes?.map((dt) => (
                            <div key={dt._id} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${dt.estActif ? "border-white/5 bg-white/[0.02]" : "border-red-500/10 bg-red-500/[0.02] opacity-50"}`}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dt.couleur || "#6B7280" }} />
                                    <span className="text-xs font-medium text-white/80 truncate">{dt.nom}</span>
                                    <span className="text-[10px] font-mono text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">{dt.code}</span>
                                    {dt.isDefault && <span className="text-[9px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Défaut</span>}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button aria-label="Modifier le type" onClick={() => { setEditingType(dt); setTypeForm({ nom: dt.nom, code: dt.code, description: dt.description || "", icone: dt.icone || "File", couleur: dt.couleur || "#6B7280", retentionCategorySlug: dt.retentionCategorySlug || "", isDefault: dt.isDefault || false }); setShowTypeDialog(true); }} className="p-1 rounded text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
                                        <Edit3 className="h-3 w-3" />
                                    </button>
                                    <button aria-label={dt.estActif ? "Désactiver le type" : "Réactiver le type"} onClick={async () => { try { if (dt.estActif) { await updateType({ id: dt._id, estActif: false }); toast.success("Type désactivé"); } else { await updateType({ id: dt._id, estActif: true }); toast.success("Type réactivé"); } } catch (err: any) { toast.error(err.message); } }} className="p-1 rounded text-white/30 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                                        <Power className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!documentTypes || documentTypes.length === 0) && (
                            <p className="text-xs text-white/30 text-center py-4">Aucun type de document configuré. Cliquez sur &quot;Initialiser par défaut&quot; pour commencer.</p>
                        )}
                    </div>

                    {/* Dialog création/édition type */}
                    <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
                        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-white/90">{editingType ? "Modifier le type" : "Nouveau type de document"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-white/60">Nom *</Label>
                                    <Input value={typeForm.nom} onChange={(e) => setTypeForm(p => ({ ...p, nom: e.target.value }))} className="bg-white/5 border-white/10 text-xs mt-1" placeholder="Correspondance" />
                                </div>
                                <div>
                                    <Label className="text-xs text-white/60">Code * (max 9 car.)</Label>
                                    <Input value={typeForm.code} onChange={(e) => setTypeForm(p => ({ ...p, code: e.target.value.toUpperCase().slice(0, 9) }))} className="bg-white/5 border-white/10 text-xs mt-1 font-mono uppercase" placeholder="CORR" maxLength={9} />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Label className="text-xs text-white/60">Icône</Label>
                                        <Select value={typeForm.icone} onValueChange={(v) => setTypeForm(p => ({ ...p, icone: v }))}>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-xs mt-1"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10">
                                                {["Mail", "FileText", "ScrollText", "StickyNote", "FileSignature", "Receipt", "Gavel", "File", "Briefcase", "Scale", "Landmark", "Shield"].map((i) => (
                                                    <SelectItem key={i} value={i} className="text-xs">{i}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-20">
                                        <Label className="text-xs text-white/60">Couleur</Label>
                                        <input type="color" value={typeForm.couleur} onChange={(e) => setTypeForm(p => ({ ...p, couleur: e.target.value }))} title="Choisir une couleur" aria-label="Couleur du type" className="w-full h-9 mt-1 rounded border border-white/10 bg-transparent cursor-pointer" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={typeForm.isDefault} onCheckedChange={(v) => setTypeForm(p => ({ ...p, isDefault: v }))} />
                                    <Label className="text-xs text-white/60">Type par défaut</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowTypeDialog(false)} className="text-xs">Annuler</Button>
                                <Button onClick={handleSaveType} disabled={!typeForm.nom.trim() || !typeForm.code.trim()} className="text-xs bg-violet-600 hover:bg-violet-500">
                                    {editingType ? "Modifier" : "Créer"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* ═══ MÉTADONNÉES PERSONNALISÉES (v7) ═══ */}
            {orgId && (
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FormInput className="h-4 w-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-white/70">Métadonnées personnalisées</h3>
                        </div>
                        <Button size="sm" onClick={() => { setMetaForm({ fieldLabel: "", fieldName: "", fieldType: "text", isRequired: false, options: "", defaultValue: "", ordre: (metadataFields?.length ?? 0) }); setShowMetaDialog(true); }} className="text-xs h-7 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border-0">
                            <Plus className="h-3 w-3 mr-1" /> Ajouter un champ
                        </Button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {metadataFields?.map((f) => (
                            <div key={f._id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-xs font-medium text-white/80">{f.fieldLabel}</span>
                                    <span className="text-[10px] text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">{f.fieldType}</span>
                                    {f.isRequired && <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Obligatoire</span>}
                                </div>
                                <button aria-label="Supprimer le champ" onClick={async () => { try { await removeMeta({ id: f._id }); toast.success("Champ supprimé"); } catch (err: any) { toast.error(err.message); }}} className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {(!metadataFields || metadataFields.length === 0) && (
                            <p className="text-xs text-white/30 text-center py-4">Aucun champ de métadonnées personnalisé.</p>
                        )}
                    </div>

                    <Dialog open={showMetaDialog} onOpenChange={setShowMetaDialog}>
                        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                            <DialogHeader><DialogTitle className="text-white/90">Nouveau champ de métadonnées</DialogTitle></DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-white/60">Libellé *</Label>
                                    <Input value={metaForm.fieldLabel} onChange={(e) => setMetaForm(p => ({ ...p, fieldLabel: e.target.value }))} className="bg-white/5 border-white/10 text-xs mt-1" placeholder="Numéro de référence" />
                                </div>
                                <div>
                                    <Label className="text-xs text-white/60">Type</Label>
                                    <Select value={metaForm.fieldType} onValueChange={(v) => setMetaForm(p => ({ ...p, fieldType: v }))}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-xs mt-1"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10">
                                            <SelectItem value="text" className="text-xs">Texte</SelectItem>
                                            <SelectItem value="number" className="text-xs">Nombre</SelectItem>
                                            <SelectItem value="date" className="text-xs">Date</SelectItem>
                                            <SelectItem value="select" className="text-xs">Liste déroulante</SelectItem>
                                            <SelectItem value="boolean" className="text-xs">Oui/Non</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {metaForm.fieldType === "select" && (
                                    <div>
                                        <Label className="text-xs text-white/60">Options (séparées par des virgules)</Label>
                                        <Input value={metaForm.options} onChange={(e) => setMetaForm(p => ({ ...p, options: e.target.value }))} className="bg-white/5 border-white/10 text-xs mt-1" placeholder="Option1, Option2, Option3" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Switch checked={metaForm.isRequired} onCheckedChange={(v) => setMetaForm(p => ({ ...p, isRequired: v }))} />
                                    <Label className="text-xs text-white/60">Obligatoire</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowMetaDialog(false)} className="text-xs">Annuler</Button>
                                <Button onClick={handleSaveMeta} disabled={!metaForm.fieldLabel.trim()} className="text-xs bg-emerald-600 hover:bg-emerald-500">Créer</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            {/* ═══ Section: Groupes de Permissions (7.2) ═══ */}
            {orgId && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-amber-400" />
                            <h3 className="text-sm font-semibold text-white/70">Groupes de permissions</h3>
                            <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20 py-0">
                                {(permissionGroups ?? []).length}
                            </Badge>
                        </div>
                        <Button
                            size="sm"
                            className="gap-1.5 text-xs bg-gradient-to-r from-amber-600 to-orange-500 hover:opacity-90 border-0"
                            onClick={() => {
                                setGroupForm({ nom: "", description: "", permissions: "" });
                                setEditingGroupId(null);
                                setShowGroupDialog(true);
                            }}
                        >
                            <Plus className="h-3 w-3" />
                            Nouveau groupe
                        </Button>
                    </div>

                    {(permissionGroups ?? []).length === 0 ? (
                        <div className="py-6 text-center">
                            <Users className="h-8 w-8 text-white/10 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Aucun groupe de permissions. Créez-en un pour gérer l&apos;accès par groupe.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {(permissionGroups ?? []).map((group: { _id: string; nom: string; description?: string; members?: string[]; permissions?: string[] }) => (
                                <div key={group._id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-amber-400" />
                                            <span className="text-xs font-semibold text-white/80">{group.nom}</span>
                                            <Badge className="text-[8px] bg-white/5 text-white/40 border-white/10 py-0">
                                                {(group.members ?? []).length} membre(s)
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setGroupForm({ nom: group.nom, description: group.description ?? "", permissions: (group.permissions ?? []).join(", ") });
                                                    setEditingGroupId(group._id);
                                                    setShowGroupDialog(true);
                                                }}
                                                className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                                title="Modifier le groupe"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await removeGroup({ id: group._id as Id<"permission_groups"> });
                                                        toast.success(`Groupe "${group.nom}" supprimé`);
                                                    } catch { toast.error("Erreur lors de la suppression"); }
                                                }}
                                                className="p-1 rounded hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                                                title="Supprimer le groupe"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    {group.description && (
                                        <p className="text-[10px] text-white/40 mb-2">{group.description}</p>
                                    )}
                                    {/* Members list */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {(group.members ?? []).map((memberId: string) => (
                                            <Badge key={memberId} className="text-[9px] bg-white/5 text-white/60 border-white/10 py-0 gap-1">
                                                {memberId.slice(0, 12)}…
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await removeMemberMut({ id: group._id as Id<"permission_groups">, userId: memberId });
                                                            toast.success("Membre retiré");
                                                        } catch { toast.error("Erreur"); }
                                                    }}
                                                    className="hover:text-rose-400 transition-colors"
                                                    title="Retirer ce membre"
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </Badge>
                                        ))}
                                        {addMemberGroupId === group._id ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    value={newMemberId}
                                                    onChange={(e) => setNewMemberId(e.target.value)}
                                                    placeholder="User ID"
                                                    className="h-6 w-32 text-[10px] bg-white/5 border-white/10"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        if (!newMemberId.trim()) return;
                                                        try {
                                                            await addMemberMut({ id: group._id as Id<"permission_groups">, userId: newMemberId.trim() });
                                                            toast.success("Membre ajouté");
                                                            setNewMemberId("");
                                                            setAddMemberGroupId(null);
                                                        } catch { toast.error("Erreur"); }
                                                    }}
                                                    className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                                    title="Confirmer"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => { setAddMemberGroupId(null); setNewMemberId(""); }}
                                                    className="p-1 rounded text-white/40 hover:text-white transition-colors"
                                                    title="Annuler"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAddMemberGroupId(group._id)}
                                                className="p-0.5 rounded-full border border-dashed border-white/20 text-white/30 hover:text-white/60 hover:border-white/40 transition-colors"
                                                title="Ajouter un membre"
                                            >
                                                <UserPlus className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create/Edit Group Dialog */}
                    <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
                        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-sm">
                                    {editingGroupId ? "Modifier le groupe" : "Nouveau groupe de permissions"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-white/60">Nom du groupe</Label>
                                    <Input value={groupForm.nom} onChange={(e) => setGroupForm(p => ({ ...p, nom: e.target.value }))} className="bg-white/5 border-white/10 text-xs mt-1" placeholder="Ex: Administrateurs, Comptabilité..." />
                                </div>
                                <div>
                                    <Label className="text-xs text-white/60">Description</Label>
                                    <Input value={groupForm.description} onChange={(e) => setGroupForm(p => ({ ...p, description: e.target.value }))} className="bg-white/5 border-white/10 text-xs mt-1" placeholder="Description du groupe" />
                                </div>
                                <div>
                                    <Label className="text-xs text-white/60">Permissions (séparées par des virgules)</Label>
                                    <Input value={groupForm.permissions} onChange={(e) => setGroupForm(p => ({ ...p, permissions: e.target.value }))} className="bg-white/5 border-white/10 text-xs mt-1" placeholder="read, write, manage" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowGroupDialog(false)} className="text-xs">Annuler</Button>
                                <Button
                                    onClick={async () => {
                                        if (!orgId || !groupForm.nom.trim()) return;
                                        try {
                                            const perms = groupForm.permissions.split(",").map(s => s.trim()).filter(Boolean);
                                            if (editingGroupId) {
                                                await updateGroup({ id: editingGroupId as Id<"permission_groups">, nom: groupForm.nom, description: groupForm.description || undefined });
                                                toast.success("Groupe modifié");
                                            } else {
                                                await createGroup({ organizationId: orgId, nom: groupForm.nom, description: groupForm.description || undefined, members: [] });
                                                toast.success("Groupe créé");
                                            }
                                            setShowGroupDialog(false);
                                        } catch (err: unknown) {
                                            toast.error(err instanceof Error ? err.message : "Erreur");
                                        }
                                    }}
                                    disabled={!groupForm.nom.trim()}
                                    className="text-xs bg-amber-600 hover:bg-amber-500"
                                >
                                    {editingGroupId ? "Modifier" : "Créer"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <SaveButton onClick={handleSave} saving={saving} />

            {/* ── Config Change Impact Dialog ── */}
            {orgId && (
                <ConfigChangeConfirmDialog
                    open={showConfigConfirm}
                    onClose={() => { setShowConfigConfirm(false); setPendingConfigChange(null); }}
                    onConfirm={async () => { await doSave(); }}
                    changeType={(pendingConfigChange?.type as "document_type" | "retention_category" | "access_rule" | "metadata_field") ?? "document_type"}
                    changeDescription={pendingConfigChange?.description ?? ""}
                    orgId={orgId}
                />
            )}
        </div>
    );
}

function IArchivePanel({
    config,
    onSave,
}: {
    config: IArchiveConfig;
    onSave: (cfg: IArchiveConfig) => Promise<void>;
}) {
    const [local, setLocal] = useState<IArchiveConfig>(config);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocal(config);
    }, [config]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(local);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4">
                    Configuration iArchive
                </h3>
                <div className="space-y-3">
                    <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Label className="text-sm font-medium text-white/80">
                            Duree de retention OHADA
                        </Label>
                        <p className="text-xs text-white/40 mt-0.5 mb-2">
                            Periode de conservation legale des documents archives
                        </p>
                        <Select
                            value={local.retentionPeriod}
                            onValueChange={(val) =>
                                setLocal((prev) => ({ ...prev, retentionPeriod: val }))
                            }
                        >
                            <SelectTrigger className="w-48 bg-white/[0.04] border-white/10 text-white/90">
                                <SelectValue placeholder="Choisir une duree" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 ans</SelectItem>
                                <SelectItem value="10">10 ans (recommande)</SelectItem>
                                <SelectItem value="30">30 ans</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ToggleRow
                        label="Archivage automatique"
                        description="Archiver automatiquement les documents a leur date d'echeance"
                        checked={local.archivageAutomatique}
                        onCheckedChange={(val) =>
                            setLocal((prev) => ({ ...prev, archivageAutomatique: val }))
                        }
                    />
                    <ToggleRow
                        label="Notifications avant expiration"
                        description="Envoyer des alertes avant l'expiration de la periode de retention"
                        checked={local.notificationsExpiration}
                        onCheckedChange={(val) =>
                            setLocal((prev) => ({
                                ...prev,
                                notificationsExpiration: val,
                            }))
                        }
                    />
                </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    );
}

function ISignaturePanel({
    config,
    onSave,
}: {
    config: ISignatureConfig;
    onSave: (cfg: ISignatureConfig) => Promise<void>;
}) {
    const [local, setLocal] = useState<ISignatureConfig>(config);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocal(config);
    }, [config]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(local);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4">
                    Configuration iSignature
                </h3>
                <div className="space-y-3">
                    <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Label className="text-sm font-medium text-white/80">
                            Nombre max de signataires
                        </Label>
                        <p className="text-xs text-white/40 mt-0.5 mb-2">
                            Nombre maximum de signataires par document
                        </p>
                        <Input
                            type="number"
                            min={1}
                            max={20}
                            value={local.maxSignataires}
                            onChange={(e) =>
                                setLocal((prev) => ({
                                    ...prev,
                                    maxSignataires: Number(e.target.value) || 1,
                                }))
                            }
                            className="w-32 bg-white/[0.04] border-white/10 text-white/90"
                        />
                    </div>

                    <ToggleRow
                        label="Delegation autorisee"
                        description="Permettre a un signataire de deleguer sa signature a un tiers"
                        checked={local.delegationAutorisee}
                        onCheckedChange={(val) =>
                            setLocal((prev) => ({ ...prev, delegationAutorisee: val }))
                        }
                    />
                    <ToggleRow
                        label="Horodatage obligatoire"
                        description="Exiger un horodatage certifie pour chaque signature"
                        checked={local.horodatageObligatoire}
                        onCheckedChange={(val) =>
                            setLocal((prev) => ({
                                ...prev,
                                horodatageObligatoire: val,
                            }))
                        }
                    />
                </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    );
}

// ─── Main Component ───────────────────────────

export default function ModulesConfigTab({
    orgId,
    activeModules,
    config,
    onSaveConfig,
}: ModulesConfigTabProps) {
    const [documentConfig, setDocumentConfig] = useState<IDocumentConfig>(
        getDefaultDocumentConfig(config?.iDocument)
    );
    const [archiveConfig, setArchiveConfig] = useState<IArchiveConfig>(
        getDefaultArchiveConfig(config?.iArchive)
    );
    const [signatureConfig, setSignatureConfig] = useState<ISignatureConfig>(
        getDefaultSignatureConfig(config?.iSignature)
    );

    useEffect(() => {
        setDocumentConfig(getDefaultDocumentConfig(config?.iDocument));
        setArchiveConfig(getDefaultArchiveConfig(config?.iArchive));
        setSignatureConfig(getDefaultSignatureConfig(config?.iSignature));
    }, [config]);

    const visibleModules = activeModules.filter((m) => MODULE_META[m]);
    const defaultTab = visibleModules[0] ?? "iDocument";

    if (visibleModules.length === 0) {
        return (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
                <Archive className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">
                    Aucun module actif. Activez des modules dans l&apos;onglet Profil
                    pour configurer leurs parametres.
                </p>
            </div>
        );
    }

    const handleSaveDocument = async (cfg: IDocumentConfig) => {
        await onSaveConfig({
            ...config,
            iDocument: cfg,
        });
    };

    const handleSaveArchive = async (cfg: IArchiveConfig) => {
        await onSaveConfig({
            ...config,
            iArchive: cfg,
        });
    };

    const handleSaveSignature = async (cfg: ISignatureConfig) => {
        await onSaveConfig({
            ...config,
            iSignature: cfg,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    Configuration des modules
                    <InfoButton {...HELP_MODULES.general} side="bottom" />
                </h2>
                <p className="text-sm text-white/40 mt-1">
                    Parametrez chaque module actif selon les besoins de l&apos;organisation
                </p>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="bg-white/[0.04] border border-white/5 p-1 h-auto flex-wrap">
                    {visibleModules.map((moduleKey) => {
                        const meta = MODULE_META[moduleKey];
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                            <TabsTrigger
                                key={moduleKey}
                                value={moduleKey}
                                className="data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300 text-white/50 gap-2 px-4 py-2"
                            >
                                <Icon className="w-4 h-4" />
                                {meta.label}
                                {HELP_MODULES[moduleKey] && <InfoButton {...HELP_MODULES[moduleKey]} />}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {activeModules.includes("iDocument") && (
                    <TabsContent value="iDocument" className="mt-4">
                        <IDocumentPanel
                            config={documentConfig}
                            onSave={handleSaveDocument}
                            orgId={orgId}
                        />
                    </TabsContent>
                )}

                {activeModules.includes("iArchive") && (
                    <TabsContent value="iArchive" className="mt-4">
                        <IArchiveConfigPanel orgId={orgId} />
                    </TabsContent>
                )}

                {activeModules.includes("iSignature") && (
                    <TabsContent value="iSignature" className="mt-4">
                        <ISignaturePanel
                            config={signatureConfig}
                            onSave={handleSaveSignature}
                        />
                    </TabsContent>
                )}

                {activeModules.includes("iAsted") && (
                    <TabsContent value="iAsted" className="mt-4">
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
                            <Bot className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-sm font-medium text-white/60 mb-1">
                                iAsted - Assistant IA
                            </p>
                            <p className="text-xs text-white/30">
                                Configuration avancee bientot disponible
                            </p>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
