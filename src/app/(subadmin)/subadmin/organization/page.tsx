// DIGITALIUM.IO — SubAdmin: Organisation (Lecture seule)
// 4 onglets : Profil · Structure Org · Classement · Modules
"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2, Globe, Mail, Phone, MapPin, Briefcase,
  Users, FolderTree, Layers3, Package, ChevronRight,
  Shield, Lock, Eye, Edit3, AlertTriangle, Info,
  Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

/* ─── Types ────────────────────────────────────── */

type TabKey = "profil" | "structure" | "classement" | "modules";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  { key: "profil", label: "Profil", icon: Building2, description: "Identité et coordonnées" },
  { key: "structure", label: "Structure Org", icon: Users, description: "Organigramme et départements" },
  { key: "classement", label: "Classement", icon: FolderTree, description: "Structure de classement active" },
  { key: "modules", label: "Modules", icon: Package, description: "Modules activés et configuration" },
];

/* ─── OrgType labels ───────────────────────────── */

const ORG_TYPE_LABELS: Record<string, string> = {
  enterprise: "Entreprise",
  institution: "Institution",
  government: "Gouvernement",
  organism: "Organisme",
  platform: "Plateforme",
};

const ORG_TYPE_COLORS: Record<string, string> = {
  enterprise: "bg-violet-500/15 text-violet-400",
  institution: "bg-amber-500/15 text-amber-400",
  government: "bg-emerald-500/15 text-emerald-400",
  organism: "bg-cyan-500/15 text-cyan-400",
  platform: "bg-red-500/15 text-red-400",
};

/* ─── Status Config ────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  brouillon: { label: "Brouillon", color: "bg-zinc-500/15 text-zinc-400", icon: Edit3 },
  prete: { label: "Prête", color: "bg-blue-500/15 text-blue-400", icon: CheckCircle2 },
  active: { label: "Active", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
  trial: { label: "Essai", color: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
  suspended: { label: "Suspendue", color: "bg-red-500/15 text-red-400", icon: XCircle },
  resiliee: { label: "Résiliée", color: "bg-red-500/15 text-red-400", icon: XCircle },
};

/* ─── Animations ───────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Info Row Component ───────────────────────── */

function InfoRow({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-violet-500/10" : "bg-white/5"}`}>
        <Icon className={`h-4 w-4 ${accent ? "text-violet-400" : "text-muted-foreground"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ─── Tab: Profil ──────────────────────────────── */

function ProfilTab({ org }: { org: Record<string, unknown> }) {
  const status = STATUS_CONFIG[(org.status as string) || "brouillon"] || STATUS_CONFIG.brouillon;
  const StatusIcon = status.icon;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Identity Card */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Identité de l'organisation</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${ORG_TYPE_COLORS[(org.type as string) || "enterprise"]} border-0 text-[10px]`}>
                {ORG_TYPE_LABELS[(org.type as string) || "enterprise"]}
              </Badge>
              <Badge className={`${status.color} border-0 text-[10px] gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow icon={Building2} label="Nom" value={org.name as string} accent />
          <Separator className="bg-white/5" />
          <InfoRow icon={Briefcase} label="Secteur" value={org.sector as string} />
          <Separator className="bg-white/5" />
          <InfoRow icon={Globe} label="Description" value={org.description as string} />
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow icon={Mail} label="Email" value={org.email as string} />
          <Separator className="bg-white/5" />
          <InfoRow icon={Phone} label="Téléphone" value={org.telephone as string} />
          <Separator className="bg-white/5" />
          <InfoRow icon={MapPin} label="Adresse" value={[org.adresse, org.ville, org.pays].filter(Boolean).join(", ") || undefined} />
        </CardContent>
      </Card>

      {/* Identifiers Card */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identifiants légaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow icon={Shield} label="RCCM" value={org.rccm as string} />
          <Separator className="bg-white/5" />
          <InfoRow icon={Shield} label="NIF" value={org.nif as string} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Tab: Structure Org ───────────────────────── */

function StructureOrgTab({ orgId }: { orgId: Id<"organizations"> | undefined }) {
  const members = useQuery(
    api.organizations.getById,
    orgId ? { id: orgId } : "skip"
  );
  const businessRoles = useQuery(
    api.businessRoles.list,
    orgId ? { organizationId: orgId } : "skip"
  );

  if (!orgId) return <EmptyState message="Organisation non connectée à Convex" />;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Members Count */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Équipe</CardTitle>
            <Badge className="bg-violet-500/15 text-violet-400 border-0 text-[10px]">
              {members?.memberCount ?? "—"} membres
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Membres de l'organisation et rôles métier
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Business Roles */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rôles métier</CardTitle>
          <CardDescription className="text-xs">
            Rôles définis pour votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!businessRoles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : businessRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucun rôle métier configuré
            </p>
          ) : (
            <div className="space-y-1">
              {businessRoles.map((role) => (
                <div
                  key={role._id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/3 transition-colors"
                >
                  <div className="h-7 w-7 rounded-md bg-violet-500/10 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{role.nom}</p>
                    {role.description && (
                      <p className="text-[11px] text-muted-foreground truncate">{role.description}</p>
                    )}
                  </div>
                  <Badge className="bg-white/5 text-muted-foreground border-0 text-[10px]">
                    Niveau {role.niveau ?? "—"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Tab: Classement ──────────────────────────── */

function ClassementTab({ orgId }: { orgId: Id<"organizations"> | undefined }) {
  const structures = useQuery(
    api.filingStructures.list,
    orgId ? { organizationId: orgId } : "skip"
  );
  const activeStructure = structures?.find((s) => s.estActif);
  const cells = useQuery(
    api.filingCells.list,
    activeStructure?._id ? { filingStructureId: activeStructure._id } : "skip"
  );

  if (!orgId) return <EmptyState message="Organisation non connectée à Convex" />;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Active Structure */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Structure de classement active</CardTitle>
              <CardDescription className="text-xs">
                {activeStructure?.nom ?? "Aucune structure active"}
              </CardDescription>
            </div>
            {activeStructure && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filing Cells */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cellules de classement</CardTitle>
          <CardDescription className="text-xs">
            Dossiers de la structure active — visibles dans iDocument
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!cells ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : cells.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucune cellule de classement définie
            </p>
          ) : (
            <div className="space-y-1">
              {cells
                .filter((c) => c.estActif)
                .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
                .map((cell) => (
                  <div
                    key={cell._id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/3 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-md bg-indigo-500/10 flex items-center justify-center">
                      <FolderTree className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cell.intitule}</p>
                      {cell.description && (
                        <p className="text-[11px] text-muted-foreground truncate">{cell.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/5 text-muted-foreground border-0 text-[10px]">
                        {cell.code}
                      </Badge>
                      {cell.accessDefaut && (
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[10px] gap-1">
                          {cell.accessDefaut === "admin" ? (
                            <Lock className="h-2.5 w-2.5" />
                          ) : cell.accessDefaut === "lecture" ? (
                            <Eye className="h-2.5 w-2.5" />
                          ) : (
                            <Edit3 className="h-2.5 w-2.5" />
                          )}
                          {cell.accessDefaut}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Tab: Modules ─────────────────────────────── */

const MODULE_META: Record<string, { label: string; gradient: string; description: string }> = {
  idocument: { label: "iDocument", gradient: "from-violet-600 to-indigo-500", description: "Gestion documentaire intelligente" },
  iarchive: { label: "iArchive", gradient: "from-indigo-600 to-cyan-500", description: "Archivage numérique conforme OHADA" },
  isignature: { label: "iSignature", gradient: "from-violet-600 to-pink-500", description: "Signature électronique sécurisée" },
  iasted: { label: "iAsted", gradient: "from-emerald-600 to-teal-500", description: "Assistant IA documentaire" },
};

function ModulesTab({ modules, orgConfig }: { modules: string[]; orgConfig: Record<string, unknown> }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Active modules */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Modules activés</CardTitle>
            <Badge className="bg-violet-500/15 text-violet-400 border-0 text-[10px]">
              {modules.length} module{modules.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Services DIGITALIUM disponibles pour votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((mod) => {
              const meta = MODULE_META[mod];
              if (!meta) return null;
              return (
                <div
                  key={mod}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0`}>
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-[11px] text-muted-foreground">{meta.description}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-auto" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuration</CardTitle>
          <CardDescription className="text-xs">
            Paramètres généraux de l'environnement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow icon={Globe} label="Locale" value={(orgConfig as Record<string, Record<string, unknown>>)?.environment?.locale as string || "fr-GA"} />
          <Separator className="bg-white/5" />
          <InfoRow icon={Briefcase} label="Devise" value={(orgConfig as Record<string, Record<string, unknown>>)?.environment?.currency as string || "XAF"} />
          <Separator className="bg-white/5" />
          <InfoRow icon={Layers3} label="Format date" value={(orgConfig as Record<string, Record<string, unknown>>)?.environment?.dateFormat as string || "DD/MM/YYYY"} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Empty State ──────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card className="glass border-white/5">
        <CardContent className="flex flex-col items-center py-12">
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
            <Info className="h-6 w-6 text-violet-400/60" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function SubAdminOrganizationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profil");
  const { orgName, orgId, orgType, orgConfig, orgModules } = useOrganization();
  const { user } = useAuth();

  // Resolve Convex org ID
  const isConvexId = orgId.length > 10;
  const convexOrgId = isConvexId ? (orgId as Id<"organizations">) : undefined;

  // Fetch org data from Convex
  const orgData = useQuery(
    api.organizations.getById,
    convexOrgId ? { id: convexOrgId } : "skip"
  );

  // Merge Convex data with context for display
  const org = useMemo(() => ({
    name: orgData?.name ?? orgName,
    type: orgData?.type ?? orgType,
    sector: orgData?.sector ?? orgConfig.sector,
    description: orgData?.description,
    email: orgData?.email,
    telephone: orgData?.telephone,
    adresse: orgData?.adresse,
    ville: orgData?.ville,
    pays: orgData?.pays,
    rccm: orgData?.rccm,
    nif: orgData?.nif,
    status: orgData?.status ?? "active",
    logoUrl: orgData?.logoUrl,
  }), [orgData, orgName, orgType, orgConfig.sector]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${ORG_TYPE_COLORS[orgType]?.includes("violet") ? "from-violet-600 to-indigo-500" : ORG_TYPE_COLORS[orgType]?.includes("emerald") ? "from-emerald-500 to-teal-500" : ORG_TYPE_COLORS[orgType]?.includes("amber") ? "from-amber-500 to-orange-500" : ORG_TYPE_COLORS[orgType]?.includes("cyan") ? "from-cyan-500 to-teal-500" : "from-violet-600 to-indigo-500"} flex items-center justify-center`}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{org.name}</h1>
            <p className="text-xs text-muted-foreground">
              Configuration de l'organisation · Lecture seule
            </p>
          </div>
        </div>
      </motion.div>

      {/* Read-only Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5"
      >
        <Eye className="h-4 w-4 text-indigo-400 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-indigo-300">Mode lecture</span> — Les modifications sont gérées par l'administrateur DIGITALIUM via le back-office.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/5 overflow-x-auto"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isActive
                ? "bg-violet-500/15 text-violet-300"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-violet-400" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "profil" && <ProfilTab org={org} />}
        {activeTab === "structure" && <StructureOrgTab orgId={convexOrgId} />}
        {activeTab === "classement" && <ClassementTab orgId={convexOrgId} />}
        {activeTab === "modules" && (
          <ModulesTab
            modules={orgModules}
            orgConfig={orgConfig as unknown as Record<string, unknown>}
          />
        )}
      </div>
    </div>
  );
}
