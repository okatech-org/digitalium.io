"use client";

import React, { useState, useCallback } from "react";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Plus,
    Trash2,
    Star,
    Save,
    Loader2,
    Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useOrgSites } from "@/hooks/useOrgStructure";
import { toast } from "sonner";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — ProfilTab (Org Detail)
// Identity editing + Sites CRUD via Convex
// ═══════════════════════════════════════════════

// ─── Types ────────────────────────────────────

interface ProfilTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    org: any; // Full org document from Convex query result
    onFieldSaved?: () => void;
}

type SiteType = "siege" | "filiale" | "agence" | "bureau_regional" | "antenne";

interface NewSiteForm {
    nom: string;
    type: SiteType;
    adresse: string;
    ville: string;
    pays: string;
}

const SITE_TYPE_OPTIONS: { value: SiteType; label: string }[] = [
    { value: "siege", label: "Siege" },
    { value: "filiale", label: "Filiale" },
    { value: "agence", label: "Agence" },
    { value: "bureau_regional", label: "Bureau regional" },
    { value: "antenne", label: "Antenne" },
];

const SITE_TYPE_LABELS: Record<SiteType, string> = {
    siege: "Siege",
    filiale: "Filiale",
    agence: "Agence",
    bureau_regional: "Bureau regional",
    antenne: "Antenne",
};

const ORG_TYPE_LABELS: Record<string, string> = {
    enterprise: "Entreprise",
    institution: "Institution",
    government: "Administration",
    organism: "Organisme",
};

const EMPTY_SITE_FORM: NewSiteForm = {
    nom: "",
    type: "agence",
    adresse: "",
    ville: "",
    pays: "Gabon",
};

// ─── Component ────────────────────────────────

export default function ProfilTab({ org, onFieldSaved }: ProfilTabProps) {
    const updateOrg = useMutation(api.organizations.update);

    const {
        sites,
        isLoading: sitesLoading,
        createSite,
        updateSite,
        removeSite,
        setSiege,
    } = useOrgSites(org?._id);

    // ── Identity form state ──
    const [identity, setIdentity] = useState({
        name: org?.name ?? "",
        sector: org?.sector ?? "",
        rccm: org?.rccm ?? "",
        nif: org?.nif ?? "",
    });

    // ── Coordinates form state ──
    const [coords, setCoords] = useState({
        contact: org?.contact ?? "",
        email: org?.email ?? "",
        telephone: org?.telephone ?? "",
        adresse: org?.adresse ?? "",
        ville: org?.ville ?? "",
        pays: org?.pays ?? "",
    });

    // ── Save loading states ──
    const [savingIdentity, setSavingIdentity] = useState(false);
    const [savingCoords, setSavingCoords] = useState(false);

    // ── Site form state ──
    const [showSiteForm, setShowSiteForm] = useState(false);
    const [siteForm, setSiteForm] = useState<NewSiteForm>({ ...EMPTY_SITE_FORM });
    const [creatingSite, setCreatingSite] = useState(false);

    // ── Edit site state ──
    const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
    const [editSiteForm, setEditSiteForm] = useState<NewSiteForm>({ ...EMPTY_SITE_FORM });
    const [updatingSite, setUpdatingSite] = useState(false);

    // ── Delete confirmation ──
    const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);

    // ── Save Identity ──
    const handleSaveIdentity = useCallback(async () => {
        if (!org?._id) return;
        setSavingIdentity(true);
        try {
            await updateOrg({
                id: org._id,
                name: identity.name || undefined,
                sector: identity.sector || undefined,
                rccm: identity.rccm || undefined,
                nif: identity.nif || undefined,
            });
            toast.success("Identite mise a jour");
            onFieldSaved?.();
        } catch (err) {
            toast.error(
                `Erreur : ${err instanceof Error ? err.message : "Impossible de sauvegarder"}`
            );
        } finally {
            setSavingIdentity(false);
        }
    }, [org?._id, identity, updateOrg, onFieldSaved]);

    // ── Save Coordinates ──
    const handleSaveCoords = useCallback(async () => {
        if (!org?._id) return;
        setSavingCoords(true);
        try {
            await updateOrg({
                id: org._id,
                contact: coords.contact || undefined,
                email: coords.email || undefined,
                telephone: coords.telephone || undefined,
                adresse: coords.adresse || undefined,
                ville: coords.ville || undefined,
                pays: coords.pays || undefined,
            });
            toast.success("Coordonnees mises a jour");
            onFieldSaved?.();
        } catch (err) {
            toast.error(
                `Erreur : ${err instanceof Error ? err.message : "Impossible de sauvegarder"}`
            );
        } finally {
            setSavingCoords(false);
        }
    }, [org?._id, coords, updateOrg, onFieldSaved]);

    // ── Create Site ──
    const handleCreateSite = useCallback(async () => {
        if (!org?._id || !siteForm.nom.trim()) return;
        setCreatingSite(true);
        try {
            await createSite({
                organizationId: org._id,
                nom: siteForm.nom,
                type: siteForm.type,
                adresse: siteForm.adresse,
                ville: siteForm.ville,
                pays: siteForm.pays || "Gabon",
                estSiege: siteForm.type === "siege",
            });
            toast.success("Site cree avec succes");
            setSiteForm({ ...EMPTY_SITE_FORM });
            setShowSiteForm(false);
        } catch (err) {
            toast.error(
                `Erreur : ${err instanceof Error ? err.message : "Impossible de creer le site"}`
            );
        } finally {
            setCreatingSite(false);
        }
    }, [org?._id, siteForm, createSite]);

    // ── Start editing a site ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStartEditSite = useCallback((site: any) => {
        setEditingSiteId(site._id);
        setEditSiteForm({
            nom: site.nom,
            type: site.type,
            adresse: site.adresse,
            ville: site.ville,
            pays: site.pays,
        });
    }, []);

    // ── Save edited site ──
    const handleSaveEditSite = useCallback(async () => {
        if (!editingSiteId) return;
        setUpdatingSite(true);
        try {
            await updateSite({
                id: editingSiteId as never,
                nom: editSiteForm.nom,
                type: editSiteForm.type,
                adresse: editSiteForm.adresse,
                ville: editSiteForm.ville,
                pays: editSiteForm.pays,
            });
            toast.success("Site mis a jour");
            setEditingSiteId(null);
        } catch (err) {
            toast.error(
                `Erreur : ${err instanceof Error ? err.message : "Impossible de modifier le site"}`
            );
        } finally {
            setUpdatingSite(false);
        }
    }, [editingSiteId, editSiteForm, updateSite]);

    // ── Delete site ──
    const handleDeleteSite = useCallback(
        async (siteId: string) => {
            try {
                await removeSite({ id: siteId as never });
                toast.success("Site supprime");
                setDeletingSiteId(null);
            } catch (err) {
                toast.error(
                    `Erreur : ${err instanceof Error ? err.message : "Impossible de supprimer le site"}`
                );
            }
        },
        [removeSite]
    );

    // ── Set as Siege ──
    const handleSetSiege = useCallback(
        async (siteId: string) => {
            try {
                await setSiege({ id: siteId as never });
                toast.success("Siege mis a jour");
            } catch (err) {
                toast.error(
                    `Erreur : ${err instanceof Error ? err.message : "Impossible de definir le siege"}`
                );
            }
        },
        [setSiege]
    );

    if (!org) return null;

    return (
        <div className="space-y-6">
            {/* ═══ Identity + Coordinates — 2 columns ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Left: Identity Card ── */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-violet-400" />
                            Identite
                        </h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveIdentity}
                            disabled={savingIdentity}
                            className="text-[10px] h-7 gap-1.5 text-violet-400 hover:text-violet-300"
                        >
                            {savingIdentity ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Save className="h-3 w-3" />
                            )}
                            Sauvegarder
                        </Button>
                    </div>

                    {/* Raison sociale */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            Raison sociale *
                        </label>
                        <Input
                            value={identity.name}
                            onChange={(e) =>
                                setIdentity((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Nom de l'organisation"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* Type (read-only badge) */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            Type
                        </label>
                        <Badge
                            variant="secondary"
                            className="bg-violet-500/15 text-violet-400 border-0 text-[10px]"
                        >
                            {ORG_TYPE_LABELS[org.type] ?? org.type}
                        </Badge>
                    </div>

                    {/* Secteur */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            Secteur
                        </label>
                        <Input
                            value={identity.sector}
                            onChange={(e) =>
                                setIdentity((prev) => ({ ...prev, sector: e.target.value }))
                            }
                            placeholder="Secteur d'activite"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* RCCM */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            RCCM
                        </label>
                        <Input
                            value={identity.rccm}
                            onChange={(e) =>
                                setIdentity((prev) => ({ ...prev, rccm: e.target.value }))
                            }
                            placeholder="Numero RCCM"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* NIF */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            NIF
                        </label>
                        <Input
                            value={identity.nif}
                            onChange={(e) =>
                                setIdentity((prev) => ({ ...prev, nif: e.target.value }))
                            }
                            placeholder="Numero d'identification fiscale"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>
                </div>

                {/* ── Right: Coordinates Card ── */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-violet-400" />
                            Coordonnees
                        </h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveCoords}
                            disabled={savingCoords}
                            className="text-[10px] h-7 gap-1.5 text-violet-400 hover:text-violet-300"
                        >
                            {savingCoords ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Save className="h-3 w-3" />
                            )}
                            Sauvegarder
                        </Button>
                    </div>

                    {/* Contact principal */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            Contact principal *
                        </label>
                        <Input
                            value={coords.contact}
                            onChange={(e) =>
                                setCoords((prev) => ({ ...prev, contact: e.target.value }))
                            }
                            placeholder="Nom du contact principal"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            <Mail className="h-3 w-3 inline mr-1" />
                            Email *
                        </label>
                        <Input
                            type="email"
                            value={coords.email}
                            onChange={(e) =>
                                setCoords((prev) => ({ ...prev, email: e.target.value }))
                            }
                            placeholder="contact@organisation.ga"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* Telephone */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            <Phone className="h-3 w-3 inline mr-1" />
                            Telephone *
                        </label>
                        <Input
                            value={coords.telephone}
                            onChange={(e) =>
                                setCoords((prev) => ({ ...prev, telephone: e.target.value }))
                            }
                            placeholder="+241 00 00 00 00"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">
                            Adresse *
                        </label>
                        <Input
                            value={coords.adresse}
                            onChange={(e) =>
                                setCoords((prev) => ({ ...prev, adresse: e.target.value }))
                            }
                            placeholder="Adresse du siege social"
                            className="bg-white/[0.03] border-white/5 text-xs h-9"
                        />
                    </div>

                    {/* Ville + Pays */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">
                                Ville *
                            </label>
                            <Input
                                value={coords.ville}
                                onChange={(e) =>
                                    setCoords((prev) => ({ ...prev, ville: e.target.value }))
                                }
                                placeholder="Libreville"
                                className="bg-white/[0.03] border-white/5 text-xs h-9"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">
                                <Globe className="h-3 w-3 inline mr-1" />
                                Pays
                            </label>
                            <Input
                                value={coords.pays}
                                onChange={(e) =>
                                    setCoords((prev) => ({ ...prev, pays: e.target.value }))
                                }
                                placeholder="Gabon"
                                className="bg-white/[0.03] border-white/5 text-xs h-9"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Sites Section ═══ */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-violet-400" />
                        Sites
                        <Badge
                            variant="secondary"
                            className="text-[9px] bg-white/5 border-0 text-muted-foreground"
                        >
                            {sites.length}
                        </Badge>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setSiteForm({ ...EMPTY_SITE_FORM });
                            setShowSiteForm(true);
                        }}
                        className="text-[10px] h-7 gap-1 text-violet-400 hover:text-violet-300"
                    >
                        <Plus className="h-3 w-3" /> Ajouter un site
                    </Button>
                </div>

                {/* ── Add Site Form (inline) ── */}
                {showSiteForm && (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                        <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
                            Nouveau site
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                    Nom *
                                </label>
                                <Input
                                    value={siteForm.nom}
                                    onChange={(e) =>
                                        setSiteForm((prev) => ({ ...prev, nom: e.target.value }))
                                    }
                                    placeholder="Nom du site"
                                    className="bg-white/[0.03] border-white/5 text-xs h-8"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                    Type
                                </label>
                                <select
                                    value={siteForm.type}
                                    onChange={(e) =>
                                        setSiteForm((prev) => ({
                                            ...prev,
                                            type: e.target.value as SiteType,
                                        }))
                                    }
                                    className="w-full bg-white/[0.03] border border-white/5 text-xs h-8 rounded-md px-2 text-white"
                                >
                                    {SITE_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                    Adresse
                                </label>
                                <Input
                                    value={siteForm.adresse}
                                    onChange={(e) =>
                                        setSiteForm((prev) => ({
                                            ...prev,
                                            adresse: e.target.value,
                                        }))
                                    }
                                    placeholder="Adresse"
                                    className="bg-white/[0.03] border-white/5 text-[10px] h-8"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                    Ville
                                </label>
                                <Input
                                    value={siteForm.ville}
                                    onChange={(e) =>
                                        setSiteForm((prev) => ({
                                            ...prev,
                                            ville: e.target.value,
                                        }))
                                    }
                                    placeholder="Ville"
                                    className="bg-white/[0.03] border-white/5 text-[10px] h-8"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                    Pays
                                </label>
                                <Input
                                    value={siteForm.pays}
                                    onChange={(e) =>
                                        setSiteForm((prev) => ({
                                            ...prev,
                                            pays: e.target.value,
                                        }))
                                    }
                                    placeholder="Gabon"
                                    className="bg-white/[0.03] border-white/5 text-[10px] h-8"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                size="sm"
                                onClick={handleCreateSite}
                                disabled={creatingSite || !siteForm.nom.trim()}
                                className="text-[10px] h-7 gap-1 bg-violet-600 hover:bg-violet-500"
                            >
                                {creatingSite ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Plus className="h-3 w-3" />
                                )}
                                Creer
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowSiteForm(false)}
                                className="text-[10px] h-7"
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Loading state ── */}
                {sitesLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* ── Empty state ── */}
                {!sitesLoading && sites.length === 0 && !showSiteForm && (
                    <div className="text-center py-8">
                        <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                            Aucun site enregistre
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Ajoutez le siege et les sites secondaires de cette organisation.
                        </p>
                    </div>
                )}

                {/* ── Sites List ── */}
                {!sitesLoading && sites.length > 0 && (
                    <div className="space-y-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {sites.map((site: any) => {
                            const isEditing = editingSiteId === site._id;
                            const isDeleting = deletingSiteId === site._id;

                            if (isEditing) {
                                // ── Inline Edit Form ──
                                return (
                                    <div
                                        key={site._id}
                                        className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-2"
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                                    Nom
                                                </label>
                                                <Input
                                                    value={editSiteForm.nom}
                                                    onChange={(e) =>
                                                        setEditSiteForm((prev) => ({
                                                            ...prev,
                                                            nom: e.target.value,
                                                        }))
                                                    }
                                                    className="bg-white/[0.03] border-white/5 text-xs h-7"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground mb-1 block">
                                                    Type
                                                </label>
                                                <select
                                                    value={editSiteForm.type}
                                                    onChange={(e) =>
                                                        setEditSiteForm((prev) => ({
                                                            ...prev,
                                                            type: e.target.value as SiteType,
                                                        }))
                                                    }
                                                    className="w-full bg-white/[0.03] border border-white/5 text-xs h-7 rounded-md px-2 text-white"
                                                >
                                                    {SITE_TYPE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input
                                                value={editSiteForm.adresse}
                                                onChange={(e) =>
                                                    setEditSiteForm((prev) => ({
                                                        ...prev,
                                                        adresse: e.target.value,
                                                    }))
                                                }
                                                placeholder="Adresse"
                                                className="bg-white/[0.03] border-white/5 text-[10px] h-7"
                                            />
                                            <Input
                                                value={editSiteForm.ville}
                                                onChange={(e) =>
                                                    setEditSiteForm((prev) => ({
                                                        ...prev,
                                                        ville: e.target.value,
                                                    }))
                                                }
                                                placeholder="Ville"
                                                className="bg-white/[0.03] border-white/5 text-[10px] h-7"
                                            />
                                            <Input
                                                value={editSiteForm.pays}
                                                onChange={(e) =>
                                                    setEditSiteForm((prev) => ({
                                                        ...prev,
                                                        pays: e.target.value,
                                                    }))
                                                }
                                                placeholder="Pays"
                                                className="bg-white/[0.03] border-white/5 text-[10px] h-7"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button
                                                size="sm"
                                                onClick={handleSaveEditSite}
                                                disabled={updatingSite}
                                                className="text-[10px] h-6 gap-1 bg-violet-600 hover:bg-violet-500"
                                            >
                                                {updatingSite ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Save className="h-3 w-3" />
                                                )}
                                                Enregistrer
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingSiteId(null)}
                                                className="text-[10px] h-6"
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }

                            // ── Display Card ──
                            return (
                                <div
                                    key={site._id}
                                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs font-medium text-white truncate">
                                                {site.nom}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[9px] bg-white/5 border-0 text-muted-foreground shrink-0"
                                            >
                                                {SITE_TYPE_LABELS[site.type as SiteType] ?? site.type}
                                            </Badge>
                                            {site.estSiege && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[9px] bg-violet-500/15 text-violet-400 border-0 gap-1 shrink-0"
                                                >
                                                    <Star className="h-2.5 w-2.5" /> Siege
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!site.estSiege && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleSetSiege(site._id)}
                                                    className="h-6 px-2 text-[9px] text-muted-foreground hover:text-violet-400"
                                                    title="Definir comme siege"
                                                >
                                                    <Star className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleStartEditSite(site)}
                                                className="h-6 px-2 text-[9px] text-muted-foreground hover:text-white"
                                            >
                                                Modifier
                                            </Button>
                                            {isDeleting ? (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleDeleteSite(site._id)
                                                        }
                                                        className="h-6 px-2 text-[9px] text-red-400 hover:text-red-300"
                                                    >
                                                        Confirmer
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setDeletingSiteId(null)
                                                        }
                                                        className="h-6 px-2 text-[9px]"
                                                    >
                                                        Non
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDeletingSiteId(site._id)
                                                    }
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Trash2 className="h-3 w-3 text-red-400/60 hover:text-red-400" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Site details row */}
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                        {site.adresse && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5" />
                                                {site.adresse}
                                            </span>
                                        )}
                                        {site.ville && (
                                            <span>{site.ville}</span>
                                        )}
                                        {site.pays && site.pays !== "Gabon" && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-2.5 w-2.5" />
                                                {site.pays}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
