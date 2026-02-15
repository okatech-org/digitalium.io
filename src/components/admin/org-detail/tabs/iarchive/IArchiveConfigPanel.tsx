// ═══════════════════════════════════════════════
// IArchiveConfigPanel — Full iArchive config
// 4 sub-sections: Rétention, Cycle de Vie,
// Alertes, Coffre-Fort
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Archive,
    Clock,
    Bell,
    Lock,
    Save,
    Loader2,
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
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import LifecyclePipeline from "./LifecyclePipeline";
import RetentionCategoryTable from "./RetentionCategoryTable";

// ─── Types ────────────────────────────────────

interface IArchiveFullConfig {
    retentionPeriod: string;
    archivageAutomatique: boolean;
    notificationsExpiration: boolean;
    alerteChain: {
        premierRappel: number;
        premierRappelUnite: string;
        deuxiemeRappel: number;
        deuxiemeRappelUnite: string;
        alerteUrgente: number;
        alerteUrgenteUnite: string;
        destinataires: string[];
    };
    coffreFort: {
        enabled: boolean;
        partitions: string[];
        chiffrementActif: boolean;
    };
    lifecycleRules: {
        semiActifDelaiMois: number;
        gelJuridiqueAutorise: boolean;
        destructionRequiertApprobation: boolean;
    };
}

interface IArchiveConfigPanelProps {
    orgId: Id<"organizations">;
}

// ─── Defaults ─────────────────────────────────

const DEFAULT_CONFIG: IArchiveFullConfig = {
    retentionPeriod: "10",
    archivageAutomatique: true,
    notificationsExpiration: true,
    alerteChain: {
        premierRappel: 90,
        premierRappelUnite: "jours",
        deuxiemeRappel: 30,
        deuxiemeRappelUnite: "jours",
        alerteUrgente: 7,
        alerteUrgenteUnite: "jours",
        destinataires: ["admin"],
    },
    coffreFort: {
        enabled: true,
        partitions: ["fiscal", "juridique"],
        chiffrementActif: false,
    },
    lifecycleRules: {
        semiActifDelaiMois: 12,
        gelJuridiqueAutorise: true,
        destructionRequiertApprobation: true,
    },
};

// ─── Sub-tabs meta ────────────────────────────

const SUB_TABS = [
    { key: "retention", label: "Rétention & OHADA", icon: Archive },
    { key: "lifecycle", label: "Cycle de Vie", icon: Clock },
    { key: "alertes", label: "Alertes", icon: Bell },
    { key: "coffre", label: "Coffre-Fort", icon: Lock },
];

// ─── Toggle Row (reused pattern) ──────────────

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
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
            <div>
                <p className="text-sm font-medium text-white/80">{label}</p>
                {description && (
                    <p className="text-xs text-white/40 mt-0.5">{description}</p>
                )}
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

// ─── Main Component ───────────────────────────

export default function IArchiveConfigPanel({ orgId }: IArchiveConfigPanelProps) {
    // Convex data
    const savedConfig = useQuery(api.archiveConfig.getConfig, { organizationId: orgId });
    const categories = useQuery(api.archiveConfig.listCategories, { organizationId: orgId });
    const saveConfigMut = useMutation(api.archiveConfig.saveConfig);
    const upsertCategoryMut = useMutation(api.archiveConfig.upsertCategory);
    const deleteCategoryMut = useMutation(api.archiveConfig.deleteCategory);
    const seedDefaultsMut = useMutation(api.archiveConfig.seedDefaultCategories);

    // Local state
    const [config, setConfig] = useState<IArchiveFullConfig>(DEFAULT_CONFIG);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("retention");

    // Sync from server
    useEffect(() => {
        if (savedConfig) {
            setConfig({
                ...DEFAULT_CONFIG,
                ...savedConfig,
                alerteChain: {
                    ...DEFAULT_CONFIG.alerteChain,
                    ...(savedConfig as IArchiveFullConfig).alerteChain,
                },
                coffreFort: {
                    ...DEFAULT_CONFIG.coffreFort,
                    ...(savedConfig as IArchiveFullConfig).coffreFort,
                },
                lifecycleRules: {
                    ...DEFAULT_CONFIG.lifecycleRules,
                    ...(savedConfig as IArchiveFullConfig).lifecycleRules,
                },
            });
        }
    }, [savedConfig]);

    // Save config
    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            await saveConfigMut({
                organizationId: orgId,
                iArchiveConfig: config,
            });
            toast.success("Configuration iArchive enregistrée");
        } catch {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    }, [config, orgId, saveConfigMut]);

    // Category handlers
    const handleUpsertCategory = useCallback(
        async (data: {
            id?: string;
            name: string;
            slug: string;
            description?: string;
            color: string;
            icon: string;
            retentionYears: number;
            defaultConfidentiality: "public" | "internal" | "confidential" | "secret";
            sortOrder?: number;
        }) => {
            await upsertCategoryMut({
                ...data,
                id: data.id ? (data.id as Id<"archive_categories">) : undefined,
                organizationId: orgId,
            });
        },
        [orgId, upsertCategoryMut]
    );

    const handleDeleteCategory = useCallback(
        async (id: string) => {
            await deleteCategoryMut({ id: id as Id<"archive_categories"> });
        },
        [deleteCategoryMut]
    );

    const handleSeedDefaults = useCallback(async () => {
        try {
            const result = await seedDefaultsMut({ organizationId: orgId });
            if (result.seeded) {
                toast.success(`${result.count} catégories OHADA créées`);
            } else {
                toast.info("Des catégories existent déjà");
            }
        } catch {
            toast.error("Erreur lors de l'initialisation");
        }
    }, [orgId, seedDefaultsMut]);

    const updateConfig = <K extends keyof IArchiveFullConfig>(
        key: K,
        val: IArchiveFullConfig[K]
    ) => {
        setConfig((prev) => ({ ...prev, [key]: val }));
    };

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/[0.03] border border-white/5 p-1 rounded-xl w-full grid grid-cols-4 gap-1">
                    {SUB_TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.key}
                                value={tab.key}
                                className="rounded-lg text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white flex items-center gap-1.5 px-2 py-1.5"
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {/* ───── Rétention & OHADA ───── */}
                <TabsContent value="retention" className="mt-4 space-y-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                            <Label className="text-sm font-medium text-white/80">
                                Durée de rétention globale (par défaut)
                            </Label>
                            <p className="text-xs text-white/40 mt-0.5 mb-2">
                                Période de conservation appliquée si aucune catégorie spécifique n&apos;est définie
                            </p>
                            <Select
                                value={config.retentionPeriod}
                                onValueChange={(val) => updateConfig("retentionPeriod", val)}
                            >
                                <SelectTrigger className="w-48 bg-white/[0.04] border-white/10 text-white/90">
                                    <SelectValue placeholder="Choisir une durée" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 ans</SelectItem>
                                    <SelectItem value="10">10 ans (recommandé)</SelectItem>
                                    <SelectItem value="30">30 ans</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <ToggleRow
                            label="Archivage automatique"
                            description="Archiver automatiquement les documents à leur date d'échéance"
                            checked={config.archivageAutomatique}
                            onCheckedChange={(val) => updateConfig("archivageAutomatique", val)}
                        />
                    </div>

                    {/* Per-category table */}
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                        <RetentionCategoryTable
                            categories={(categories ?? []) as any[]}
                            onUpsert={handleUpsertCategory}
                            onDelete={handleDeleteCategory}
                            onSeedDefaults={handleSeedDefaults}
                        />
                    </div>
                </TabsContent>

                {/* ───── Cycle de Vie ───── */}
                <TabsContent value="lifecycle" className="mt-4 space-y-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-5">
                        <h3 className="text-sm font-semibold text-white/70">
                            Pipeline du cycle de vie
                        </h3>
                        <LifecyclePipeline />

                        <div className="border-t border-white/5 pt-4 space-y-3">
                            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                                Paramètres de transition
                            </h4>

                            <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                                <Label className="text-sm font-medium text-white/80">
                                    Délai avant passage en semi-actif
                                </Label>
                                <p className="text-xs text-white/40 mt-0.5 mb-2">
                                    Nombre de mois d&apos;inactivité avant le passage automatique
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={config.lifecycleRules.semiActifDelaiMois}
                                        onChange={(e) =>
                                            updateConfig("lifecycleRules", {
                                                ...config.lifecycleRules,
                                                semiActifDelaiMois: parseInt(e.target.value) || 12,
                                            })
                                        }
                                        className="w-20 bg-white/[0.04] border-white/10 text-white/90"
                                    />
                                    <span className="text-sm text-white/50">mois</span>
                                </div>
                            </div>

                            <ToggleRow
                                label="Gel juridique autorisé"
                                description="Permettre la suspension temporaire d'une archive en cas de litige ou audit"
                                checked={config.lifecycleRules.gelJuridiqueAutorise}
                                onCheckedChange={(val) =>
                                    updateConfig("lifecycleRules", {
                                        ...config.lifecycleRules,
                                        gelJuridiqueAutorise: val,
                                    })
                                }
                            />

                            <ToggleRow
                                label="Approbation requise pour destruction"
                                description="Exiger une validation administrative avant la destruction définitive"
                                checked={config.lifecycleRules.destructionRequiertApprobation}
                                onCheckedChange={(val) =>
                                    updateConfig("lifecycleRules", {
                                        ...config.lifecycleRules,
                                        destructionRequiertApprobation: val,
                                    })
                                }
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* ───── Alertes ───── */}
                <TabsContent value="alertes" className="mt-4 space-y-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-white/70">
                            Chaîne de notifications
                        </h3>
                        <p className="text-xs text-white/40">
                            Configurez les alertes envoyées avant l&apos;expiration de la période de rétention
                        </p>

                        <ToggleRow
                            label="Notifications d'expiration activées"
                            description="Envoyer des alertes avant l'expiration de la période de rétention"
                            checked={config.notificationsExpiration}
                            onCheckedChange={(val) => updateConfig("notificationsExpiration", val)}
                        />

                        {config.notificationsExpiration && (
                            <div className="space-y-3 pt-2">
                                {/* First reminder */}
                                <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px]">
                                            1er rappel
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={365}
                                            value={config.alerteChain.premierRappel}
                                            onChange={(e) =>
                                                updateConfig("alerteChain", {
                                                    ...config.alerteChain,
                                                    premierRappel: parseInt(e.target.value) || 90,
                                                })
                                            }
                                            className="w-20 bg-white/[0.04] border-white/10 text-white/90"
                                        />
                                        <Select
                                            value={config.alerteChain.premierRappelUnite}
                                            onValueChange={(val) =>
                                                updateConfig("alerteChain", {
                                                    ...config.alerteChain,
                                                    premierRappelUnite: val,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-32 bg-white/[0.04] border-white/10 text-white/90">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jours">Jours</SelectItem>
                                                <SelectItem value="semaines">Semaines</SelectItem>
                                                <SelectItem value="mois">Mois</SelectItem>
                                                <SelectItem value="annees">Années</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-white/50">avant expiration</span>
                                    </div>
                                </div>

                                {/* Second reminder */}
                                <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                                            2e rappel
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={180}
                                            value={config.alerteChain.deuxiemeRappel}
                                            onChange={(e) =>
                                                updateConfig("alerteChain", {
                                                    ...config.alerteChain,
                                                    deuxiemeRappel: parseInt(e.target.value) || 30,
                                                })
                                            }
                                            className="w-20 bg-white/[0.04] border-white/10 text-white/90"
                                        />
                                        <Select
                                            value={config.alerteChain.deuxiemeRappelUnite}
                                            onValueChange={(val) =>
                                                updateConfig("alerteChain", {
                                                    ...config.alerteChain,
                                                    deuxiemeRappelUnite: val,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-32 bg-white/[0.04] border-white/10 text-white/90">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jours">Jours</SelectItem>
                                                <SelectItem value="semaines">Semaines</SelectItem>
                                                <SelectItem value="mois">Mois</SelectItem>
                                                <SelectItem value="annees">Années</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-white/50">avant expiration</span>
                                    </div>
                                </div>

                                {/* Urgent alert */}
                                <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-red-500/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-red-500/15 text-red-300 border-red-500/30 text-[10px]">
                                            Alerte urgente
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={config.alerteChain.alerteUrgente}
                                            onChange={(e) =>
                                                updateConfig("alerteChain", {
                                                    ...config.alerteChain,
                                                    alerteUrgente: parseInt(e.target.value) || 7,
                                                })
                                            }
                                            className="w-20 bg-white/[0.04] border-white/10 text-white/90"
                                        />
                                        <Select
                                            value={config.alerteChain.alerteUrgenteUnite}
                                            onValueChange={(val) =>
                                                updateConfig("alerteChain", {
                                                    ...config.alerteChain,
                                                    alerteUrgenteUnite: val,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-32 bg-white/[0.04] border-white/10 text-white/90">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jours">Jours</SelectItem>
                                                <SelectItem value="semaines">Semaines</SelectItem>
                                                <SelectItem value="mois">Mois</SelectItem>
                                                <SelectItem value="annees">Années</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-white/50">avant expiration</span>
                                    </div>
                                </div>

                                {/* Recipients — multi-select toggles */}
                                <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                                    <Label className="text-sm font-medium text-white/80">
                                        Destinataires
                                    </Label>
                                    <p className="text-xs text-white/40 mt-0.5 mb-3">
                                        Qui reçoit les alertes d&apos;expiration — sélection multiple possible
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {([
                                            { key: "admin", label: "Administrateurs" },
                                            { key: "responsable", label: "Responsables de catégorie" },
                                            { key: "tous", label: "Tous les membres" },
                                        ] as const).map(({ key, label }) => {
                                            const isTousSelected = config.alerteChain.destinataires.includes("tous");
                                            const isActive = config.alerteChain.destinataires.includes(key);

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        let next: string[];
                                                        if (key === "tous") {
                                                            // "Tous" overrides everything
                                                            next = isActive ? ["admin"] : ["tous"];
                                                        } else {
                                                            if (isActive) {
                                                                // Un-toggle — ensure at least one remains
                                                                next = config.alerteChain.destinataires.filter((d) => d !== key);
                                                                if (next.length === 0) next = ["admin"];
                                                            } else {
                                                                // Add — remove "tous" if present
                                                                next = [
                                                                    ...config.alerteChain.destinataires.filter((d) => d !== "tous"),
                                                                    key,
                                                                ];
                                                            }
                                                        }
                                                        updateConfig("alerteChain", {
                                                            ...config.alerteChain,
                                                            destinataires: next,
                                                        });
                                                    }}
                                                    className={`
                                                        px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                        ${key === "tous" && isActive
                                                            ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                                                            : isActive && !isTousSelected
                                                                ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                                                : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"
                                                        }
                                                    `}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {config.alerteChain.destinataires.includes("tous") && (
                                        <p className="text-[10px] text-violet-400/60 mt-2">
                                            ✦ Tous les membres de l&apos;organisation recevront les alertes
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ───── Coffre-Fort ───── */}
                <TabsContent value="coffre" className="mt-4 space-y-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-white/70">
                            Coffre-Fort Numérique
                        </h3>
                        <p className="text-xs text-white/40">
                            Espace sécurisé pour les documents à conservation perpétuelle
                        </p>

                        <ToggleRow
                            label="Activer le Coffre-Fort"
                            description="Créer un espace de stockage sécurisé pour les documents critiques"
                            checked={config.coffreFort.enabled}
                            onCheckedChange={(val) =>
                                updateConfig("coffreFort", {
                                    ...config.coffreFort,
                                    enabled: val,
                                })
                            }
                        />

                        {config.coffreFort.enabled && (
                            <>
                                <div className="py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                                    <Label className="text-sm font-medium text-white/80">
                                        Partitions
                                    </Label>
                                    <p className="text-xs text-white/40 mt-0.5 mb-3">
                                        Catégories de documents stockées dans le coffre-fort
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["fiscal", "juridique", "rh", "propriete", "brevets"].map(
                                            (partition) => {
                                                const active = config.coffreFort.partitions.includes(partition);
                                                return (
                                                    <button
                                                        key={partition}
                                                        onClick={() => {
                                                            const next = active
                                                                ? config.coffreFort.partitions.filter((p) => p !== partition)
                                                                : [...config.coffreFort.partitions, partition];
                                                            updateConfig("coffreFort", {
                                                                ...config.coffreFort,
                                                                partitions: next,
                                                            });
                                                        }}
                                                        className={`
                                                            px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                            ${active
                                                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                                                : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"
                                                            }
                                                        `}
                                                    >
                                                        {partition.charAt(0).toUpperCase() + partition.slice(1)}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                <ToggleRow
                                    label="Chiffrement activé"
                                    description="Activer le chiffrement AES-256 pour les documents dans le coffre-fort"
                                    checked={config.coffreFort.chiffrementActif}
                                    onCheckedChange={(val) =>
                                        updateConfig("coffreFort", {
                                            ...config.coffreFort,
                                            chiffrementActif: val,
                                        })
                                    }
                                />
                            </>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Global Save Button */}
            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-6"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Enregistrer la configuration
                </Button>
            </div>
        </div>
    );
}
