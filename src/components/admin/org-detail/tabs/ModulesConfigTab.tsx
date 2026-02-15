"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Archive,
    PenTool,
    Bot,
    Save,
    Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import IArchiveConfigPanel from "./iarchive/IArchiveConfigPanel";

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
}: {
    config: IDocumentConfig;
    onSave: (cfg: IDocumentConfig) => Promise<void>;
}) {
    const [local, setLocal] = useState<IDocumentConfig>(config);
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

    return (
        <div className="space-y-4">
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
            <SaveButton onClick={handleSave} saving={saving} />
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
                <h2 className="text-lg font-semibold text-white/90">
                    Configuration des modules
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
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {activeModules.includes("iDocument") && (
                    <TabsContent value="iDocument" className="mt-4">
                        <IDocumentPanel
                            config={documentConfig}
                            onSave={handleSaveDocument}
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
