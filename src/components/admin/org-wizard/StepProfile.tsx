"use client";

import React from "react";
import { Building2, MapPin, Plus, Trash2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrgType } from "@/types/org-structure";

// ─── Types ────────────────────────────────────

export interface ProfileData {
    nom: string;
    type: OrgType;
    secteur: string;
    rccm: string;
    nif: string;
    contact: string;
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    pays: string;
    logoUrl: string;
    sites: SiteInput[];
}

export interface SiteInput {
    id: string;
    nom: string;
    type: "siege" | "filiale" | "agence" | "bureau_regional" | "antenne";
    adresse: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    estSiege: boolean;
}

const ORG_TYPE_OPTIONS: { value: OrgType; label: string; description: string; icon: string }[] = [
    { value: "enterprise", label: "Entreprise", description: "PME, GE, société privée", icon: "🏢" },
    { value: "institution", label: "Institution", description: "Hôpital, université, école", icon: "🏛️" },
    { value: "government", label: "Administration", description: "Ministère, mairie, préfecture", icon: "⚖️" },
    { value: "organism", label: "Organisme", description: "CNSS, CNAMGS, régulateur", icon: "🔧" },
];

const SECTOR_OPTIONS = [
    "Énergie & Eau", "Banque & Finance", "Assurance", "Télécommunications",
    "Pétrole & Mines", "Agriculture & Forêts", "Transport & Logistique",
    "BTP & Immobilier", "Santé", "Éducation", "Commerce & Distribution",
    "Technologies", "Services", "Industrie", "Autre",
];

// ─── Component ────────────────────────────────

interface StepProfileProps {
    data: ProfileData;
    onChange: (data: ProfileData) => void;
    errors: Record<string, string>;
}

export default function StepProfile({ data, onChange, errors }: StepProfileProps) {
    const update = (key: keyof ProfileData, value: string | OrgType) => {
        onChange({ ...data, [key]: value });
    };

    const addSite = () => {
        const newSite: SiteInput = {
            id: Math.random().toString(36).slice(2, 10),
            nom: "",
            type: "agence",
            adresse: "",
            ville: "",
            pays: "Gabon",
            telephone: "",
            email: "",
            estSiege: data.sites.length === 0,
        };
        onChange({ ...data, sites: [...data.sites, newSite] });
    };

    const updateSite = (index: number, key: keyof SiteInput, value: string | boolean) => {
        const sites = [...data.sites];
        sites[index] = { ...sites[index], [key]: value };
        onChange({ ...data, sites });
    };

    const removeSite = (index: number) => {
        const sites = data.sites.filter((_, i) => i !== index);
        onChange({ ...data, sites });
    };

    return (
        <div className="space-y-6">
            {/* Type d'organisation */}
            <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                    Type d&apos;organisation *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {ORG_TYPE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => update("type", opt.value)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                                data.type === opt.value
                                    ? "border-violet-500/50 bg-violet-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                            }`}
                        >
                            <span className="text-lg">{opt.icon}</span>
                            <p className="text-xs font-medium mt-1">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                        </button>
                    ))}
                </div>
                {errors.type && <p className="text-[10px] text-red-400 mt-1">{errors.type}</p>}
            </div>

            {/* Identité */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> Identité
                </h3>

                <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Raison sociale *</label>
                    <Input
                        value={data.nom}
                        onChange={(e) => update("nom", e.target.value)}
                        placeholder="Ex : SEEG, ASCOMA, Ministère de la Pêche..."
                        className="bg-white/[0.03] border-white/5 text-xs h-9"
                    />
                    {errors.nom && <p className="text-[10px] text-red-400 mt-1">{errors.nom}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Secteur d&apos;activité</label>
                        <select
                            value={data.secteur}
                            onChange={(e) => update("secteur", e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 text-xs h-9 rounded-md px-2"
                        >
                            <option value="">Sélectionner...</option>
                            {SECTOR_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">RCCM</label>
                        <Input
                            value={data.rccm}
                            onChange={(e) => update("rccm", e.target.value)}
                            placeholder="Numéro RCCM"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">NIF</label>
                    <Input
                        value={data.nif}
                        onChange={(e) => update("nif", e.target.value)}
                        placeholder="Numéro d'identification fiscale"
                        className="bg-white/[0.03] border-white/5 text-xs h-9"
                    />
                </div>
            </div>

            {/* Coordonnées */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" /> Coordonnées
                </h3>

                <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Contact principal *</label>
                    <Input
                        value={data.contact}
                        onChange={(e) => update("contact", e.target.value)}
                        placeholder="Nom du contact principal"
                        className="bg-white/[0.03] border-white/5 text-xs h-9"
                    />
                    {errors.contact && <p className="text-[10px] text-red-400 mt-1">{errors.contact}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Email *</label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="contact@organisation.ga"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                        {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Téléphone *</label>
                        <Input
                            value={data.telephone}
                            onChange={(e) => update("telephone", e.target.value)}
                            placeholder="+241 00 00 00 00"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                        {errors.telephone && <p className="text-[10px] text-red-400 mt-1">{errors.telephone}</p>}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Adresse *</label>
                    <Input
                        value={data.adresse}
                        onChange={(e) => update("adresse", e.target.value)}
                        placeholder="Adresse du siège social"
                        className="bg-white/[0.03] border-white/5 text-xs h-9"
                    />
                    {errors.adresse && <p className="text-[10px] text-red-400 mt-1">{errors.adresse}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Ville *</label>
                        <Input
                            value={data.ville}
                            onChange={(e) => update("ville", e.target.value)}
                            placeholder="Libreville"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Pays</label>
                        <Input
                            value={data.pays}
                            onChange={(e) => update("pays", e.target.value)}
                            placeholder="Gabon"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>
                </div>
            </div>

            {/* Sites */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> Sites
                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">
                            optionnel
                        </Badge>
                    </h3>
                    <Button size="sm" variant="ghost" onClick={addSite} className="text-[10px] h-7 gap-1">
                        <Plus className="h-3 w-3" /> Ajouter un site
                    </Button>
                </div>

                {data.sites.length > 0 && (
                    <div className="space-y-2">
                        {data.sites.map((site, i) => (
                            <div key={site.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={site.nom}
                                            onChange={(e) => updateSite(i, "nom", e.target.value)}
                                            placeholder="Nom du site"
                                            className="bg-white/[0.03] border-white/5 text-xs h-7 w-48"
                                        />
                                        {site.estSiege && (
                                            <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0 gap-1">
                                                <Star className="h-2.5 w-2.5" /> Siège
                                            </Badge>
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => removeSite(i)} className="h-6 w-6 p-0">
                                        <Trash2 className="h-3 w-3 text-red-400" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input
                                        value={site.adresse}
                                        onChange={(e) => updateSite(i, "adresse", e.target.value)}
                                        placeholder="Adresse"
                                        className="bg-white/[0.03] border-white/5 text-[10px] h-7"
                                    />
                                    <Input
                                        value={site.ville}
                                        onChange={(e) => updateSite(i, "ville", e.target.value)}
                                        placeholder="Ville"
                                        className="bg-white/[0.03] border-white/5 text-[10px] h-7"
                                    />
                                    <select
                                        value={site.type}
                                        onChange={(e) => updateSite(i, "type", e.target.value)}
                                        className="bg-white/[0.03] border border-white/5 text-[10px] h-7 rounded-md px-2"
                                    >
                                        <option value="siege">Siège</option>
                                        <option value="filiale">Filiale</option>
                                        <option value="agence">Agence</option>
                                        <option value="bureau_regional">Bureau régional</option>
                                        <option value="antenne">Antenne</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-[10px] text-muted-foreground">
                    Vous pourrez compléter les sites plus tard dans la fiche organisation.
                </p>
            </div>
        </div>
    );
}
