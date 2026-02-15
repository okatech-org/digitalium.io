"use client";

import React from "react";
import { Cloud, Server, HardDrive, Globe, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { HostingType } from "@/types/org-structure";
import type { ProfileData } from "./StepProfile";
import type { ModulesData } from "./StepModules";

// ─── Types ────────────────────────────────────

export interface DeployData {
    hostingType: HostingType;
    domain: string;
    pagePublique: boolean;
}

const HOSTING_OPTIONS: {
    value: HostingType;
    label: string;
    description: string;
    recommended: string;
    icon: React.ReactNode;
}[] = [
    {
        value: "cloud",
        label: "Cloud",
        description: "Infrastructure cloud (AWS/Azure)",
        recommended: "PME, startups, organisations distribuées",
        icon: <Cloud className="h-5 w-5 text-blue-400" />,
    },
    {
        value: "datacenter",
        label: "Data Center DIGITALIUM",
        description: "Centre de données souverain",
        recommended: "Entreprises, organismes publics",
        icon: <Server className="h-5 w-5 text-violet-400" />,
    },
    {
        value: "local",
        label: "Local (On-Premise)",
        description: "Serveur chez le client",
        recommended: "Ministères, institutions sensibles",
        icon: <HardDrive className="h-5 w-5 text-emerald-400" />,
    },
];

// ─── Component ────────────────────────────────

interface StepDeployProps {
    data: DeployData;
    onChange: (data: DeployData) => void;
    profile: ProfileData;
    modules: ModulesData;
}

export default function StepDeploy({ data, onChange, profile, modules }: StepDeployProps) {
    const activeModules = Object.entries(modules)
        .filter(([, active]) => active)
        .map(([key]) => key);

    return (
        <div className="space-y-6">
            {/* Hébergement */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground">Hébergement des données</h3>
                <div className="space-y-2">
                    {HOSTING_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange({ ...data, hostingType: opt.value })}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                data.hostingType === opt.value
                                    ? "border-violet-500/50 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <div className="mt-0.5">{opt.icon}</div>
                            <div>
                                <p className="text-xs font-medium">{opt.label}</p>
                                <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                                <p className="text-[9px] text-muted-foreground mt-1">
                                    Idéal pour : {opt.recommended}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Personnalisation */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" /> Personnalisation
                    <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">optionnel</Badge>
                </h3>

                <div className="flex items-center gap-2">
                    <Input
                        value={data.domain}
                        onChange={(e) => onChange({ ...data, domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                        placeholder={profile.nom.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 20) || "mon-org"}
                        className="bg-white/[0.03] border-white/5 text-xs h-9 max-w-[200px]"
                    />
                    <span className="text-xs text-muted-foreground">.digitalium.io</span>
                </div>

                <label className="flex items-center gap-2 text-[10px]">
                    <input
                        type="checkbox"
                        checked={data.pagePublique}
                        onChange={(e) => onChange({ ...data, pagePublique: e.target.checked })}
                        className="rounded border-white/10"
                    />
                    <span className="text-muted-foreground">Activer la page publique</span>
                </label>
            </div>

            {/* Récapitulatif */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
                <h3 className="text-xs font-semibold">Récapitulatif</h3>

                <div className="space-y-2 text-[10px]">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Organisation</span>
                        <span className="font-medium">{profile.nom || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{profile.type || "—"}</span>
                    </div>
                    {profile.secteur && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Secteur</span>
                            <span className="font-medium">{profile.secteur}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Modules</span>
                        <span className="font-medium">{activeModules.join(", ") || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Hébergement</span>
                        <span className="font-medium">
                            {HOSTING_OPTIONS.find((h) => h.value === data.hostingType)?.label ?? "—"}
                        </span>
                    </div>
                    {data.domain && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Domaine</span>
                            <span className="font-medium">{data.domain}.digitalium.io</span>
                        </div>
                    )}
                    {profile.sites.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sites</span>
                            <span className="font-medium">{profile.sites.length}</span>
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-muted-foreground">
                            Statut après création : <strong className="text-amber-400">Brouillon</strong>
                        </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 ml-5">
                        Configurez-la ensuite via sa fiche avant de l&apos;activer.
                    </p>
                </div>
            </div>
        </div>
    );
}
