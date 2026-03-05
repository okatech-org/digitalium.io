// ===============================================
// DIGITALIUM.IO — Admin: Onglet Structure Organisationnelle
// Organigramme, Roles Metier, Personnel
// ===============================================

"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Network,
  Briefcase,
  Users,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Zap,
  Loader2,
  Info,
  Pencil,
  Check,
  X,
  Shield,
  Sparkles,
  Upload,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmartImportZone from "@/components/shared/SmartImportZone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MODULE_GROUPS } from "@/config/modules";
import InfoButton from "../InfoButton";
import { HELP_STRUCTURE_ORG } from "@/config/org-config-help";

import { useOrgUnits, useBusinessRoles } from "@/hooks/useOrgStructure";
import {
  ORG_UNIT_TYPE_LABELS,
  ORG_UNIT_TYPE_COLORS,
  ORG_UNIT_VOCABULARY,
} from "@/types/org-structure";
import type { OrgUnitNode, OrgUnitType, OrgType } from "@/types/org-structure";
import { getOrgUnitTemplate } from "@/config/org-unit-templates";
import {
  getAllRolePresets,
  getRolesForUnitType,
  ROLE_CATEGORIES,
} from "@/config/business-role-presets";
import type { Id } from "../../../../../convex/_generated/dataModel";

/* ─── Props ─────────────────────────────────────── */

interface StructureOrgTabProps {
  orgId: any; // Id<"organizations">
  orgType: string; // "enterprise" | "institution" | "government" | "organism"
}

/* ─── Add Unit Form State ───────────────────────── */

interface AddUnitForm {
  nom: string;
  type: OrgUnitType;
  parentId?: Id<"org_units">;
}

const initialAddUnitForm: AddUnitForm = {
  nom: "",
  type: "direction_generale",
  parentId: undefined,
};

/* ─── Add Role Form State ───────────────────────── */

interface AddRoleForm {
  nom: string;
  description: string;
  categorie: string;
}

const initialAddRoleForm: AddRoleForm = {
  nom: "",
  description: "",
  categorie: "",
};

/* ─── Helper: map AI-generated type strings to valid OrgUnitType ─── */

function mapUnitType(raw?: string): OrgUnitType | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç0-9 ]/g, "").trim();
  const MAP: Record<string, OrgUnitType> = {
    "direction generale": "direction_generale",
    "direction générale": "direction_generale",
    "dg": "direction_generale",
    "direction": "direction",
    "sous direction": "sous_direction",
    "sous-direction": "sous_direction",
    "service": "service",
    "departement": "departement",
    "département": "departement",
    "bureau": "bureau",
    "cellule": "cellule",
    "unite": "unite",
    "unité": "unite",
    "division": "departement",
    "secretariat": "direction",
    "secrétariat": "direction",
    "cabinet": "direction",
    "presidence": "presidence",
    "présidence": "presidence",
  };
  for (const [pattern, uType] of Object.entries(MAP)) {
    if (lower.includes(pattern)) return uType;
  }
  return "service"; // default fallback
}

/* ─── Tree Node Component ───────────────────────── */

interface TreeNodeProps {
  node: OrgUnitNode;
  depth: number;
  onAddChild: (parentId: Id<"org_units">) => void;
  onRemove: (id: Id<"org_units">, nom: string) => void;
}

function TreeNode({ node, depth, onAddChild, onRemove }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const dotColor = ORG_UNIT_TYPE_COLORS[node.type] ?? "#6B7280";

  return (
    <div>
      {/* Node row */}
      <div
        className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.04]"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-white/40 hover:text-white/70"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Colored dot */}
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />

        {/* Name */}
        <span className="text-sm font-medium text-white/90">{node.nom}</span>

        {/* Type badge */}
        <Badge
          variant="outline"
          className="ml-1 border-white/10 bg-white/[0.04] text-[10px] text-white/50"
        >
          {ORG_UNIT_TYPE_LABELS[node.type]}
        </Badge>

        {/* Responsable */}
        {node.responsable && (
          <span className="ml-auto mr-2 text-xs text-white/40">
            {node.responsable}
          </span>
        )}

        {/* Actions (visible on hover) */}
        <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/40 hover:bg-white/[0.06] hover:text-white/70"
            onClick={() => onAddChild(node._id)}
            title="Ajouter une sous-unit\u00e9"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/40 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onRemove(node._id, node.nom)}
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────── */

export default function StructureOrgTab({
  orgId,
  orgType,
}: StructureOrgTabProps) {
  const [subTab, setSubTab] = useState("organigramme");

  return (
    <div className="space-y-6">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-9 gap-1 border border-white/5 bg-white/[0.02]">
          <TabsTrigger
            value="organigramme"
            className="gap-1.5 text-xs data-[state=active]:bg-white/[0.06]"
          >
            <Network className="h-3.5 w-3.5" />
            Organigramme
            <InfoButton {...HELP_STRUCTURE_ORG.organigramme} />
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="gap-1.5 text-xs data-[state=active]:bg-white/[0.06]"
          >
            <Briefcase className="h-3.5 w-3.5" />
            R&ocirc;les M&eacute;tier
            <InfoButton {...HELP_STRUCTURE_ORG.roles} />
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="gap-1.5 text-xs data-[state=active]:bg-white/[0.06]"
          >
            <Users className="h-3.5 w-3.5" />
            Personnel
            <InfoButton {...HELP_STRUCTURE_ORG.personnel} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organigramme" className="mt-4">
          <OrganigrammePanel orgId={orgId} orgType={orgType as OrgType} />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RolesMetierPanel orgId={orgId} orgType={orgType as OrgType} />
        </TabsContent>

        <TabsContent value="personnel" className="mt-4">
          <PersonnelPanel orgId={orgId} orgType={orgType as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Sub-tab A: Organigramme ───────────────────── */

function OrganigrammePanel({
  orgId,
  orgType,
}: {
  orgId: Id<"organizations">;
  orgType: OrgType;
}) {
  const { units, tree, isLoading, createUnit, removeUnit, bulkCreateUnits } =
    useOrgUnits(orgId);

  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState<AddUnitForm>(initialAddUnitForm);
  const [submitting, setSubmitting] = useState(false);

  const handleAddChild = useCallback(
    (parentId: Id<"org_units">) => {
      setForm({ ...initialAddUnitForm, parentId });
      setShowForm(true);
    },
    []
  );

  const handleAddRoot = useCallback(() => {
    setForm(initialAddUnitForm);
    setShowForm(true);
  }, []);

  const handleRemove = useCallback(
    async (id: Id<"org_units">, nom: string) => {
      try {
        await removeUnit({ id });
        toast.success(`Unit\u00e9 "${nom}" supprim\u00e9e`);
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    },
    [removeUnit]
  );

  const handleCreate = useCallback(async () => {
    if (!form.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    try {
      await createUnit({
        organizationId: orgId,
        nom: form.nom.trim(),
        type: form.type,
        parentId: form.parentId,
        couleur: ORG_UNIT_TYPE_COLORS[form.type] ?? "#6B7280",
        ordre: units.length,
      });
      toast.success(`Unit\u00e9 "${form.nom}" cr\u00e9\u00e9e`);
      setForm(initialAddUnitForm);
      setShowForm(false);
    } catch {
      toast.error("Erreur lors de la cr\u00e9ation");
    } finally {
      setSubmitting(false);
    }
  }, [form, orgId, units.length, createUnit]);

  const handleQuickStart = useCallback(async () => {
    const template = getOrgUnitTemplate(orgType);
    if (units.length > 0) {
      toast.error("L'organigramme contient d\u00e9j\u00e0 des unit\u00e9s. Supprimez-les d'abord.");
      return;
    }
    setSubmitting(true);
    try {
      await bulkCreateUnits({
        organizationId: orgId,
        units: template.map((t) => ({
          nom: t.nom,
          type: t.type,
          parentTempId: t.parentTempId,
          tempId: t.tempId,
          couleur: t.couleur,
          description: t.description,
          ordre: t.ordre,
        })),
      });
      toast.success("Organigramme cr\u00e9\u00e9 \u00e0 partir du template");
    } catch {
      toast.error("Erreur lors de la cr\u00e9ation du template");
    } finally {
      setSubmitting(false);
    }
  }, [orgType, orgId, units.length, bulkCreateUnits]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {units.length === 0
            ? "Aucune unit\u00e9 d\u00e9finie. Utilisez Quick Start ou ajoutez manuellement."
            : `${units.length} unit\u00e9(s) organisationnelle(s)`}
        </p>
        <div className="flex items-center gap-2">
          {units.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-violet-500/30 text-xs text-violet-400 hover:bg-violet-500/10"
              onClick={handleQuickStart}
              disabled={submitting}
            >
              <Zap className="h-3.5 w-3.5" />
              Quick Start
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/10"
            onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Import IA
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
            onClick={handleAddRoot}
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une unit\u00e9
          </Button>
        </div>
      </div>

      {/* Smart Import for org units */}
      {showBulk && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium text-white/60 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Import intelligent — Organigramme
          </p>
          <SmartImportZone
            schema={[
              { key: "nom", label: "Nom de l'unité", required: true },
              { key: "type", label: "Type (direction, service, bureau…)" },
              { key: "parent", label: "Unité parente" },
              { key: "responsable", label: "Responsable" },
              { key: "description", label: "Description" },
            ]}
            context="Structure organisationnelle / organigramme d'une entreprise. Extrais les noms des unités organisationnelles (directions, services, départements, bureaux), leur type hiérarchique, et leur unité parente si visible."
            onImport={async (rows: Record<string, any>[]) => {
              const validUnits = rows.filter((r: Record<string, any>) => r.nom);
              await bulkCreateUnits({
                organizationId: orgId,
                units: validUnits.map((r: Record<string, any>, i: number) => ({
                  nom: r.nom,
                  type: mapUnitType(r.type) ?? "service" as any,
                  tempId: `import_${i}_${Date.now()}`,
                  ordre: i,
                })),
              });
            }}
            importLabel="Créer"
            onClose={() => setShowBulk(false)}
          />
        </div>
      )}

      {/* Add unit form */}
      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium text-white/60">
            {form.parentId ? "Ajouter une sous-unit\u00e9" : "Ajouter une unit\u00e9 racine"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              placeholder="Nom de l'unit\u00e9"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
            />
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as OrgUnitType })}
            >
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORG_UNIT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Cr\u00e9er
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-white/40 hover:text-white/60"
              onClick={() => {
                setShowForm(false);
                setForm(initialAddUnitForm);
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Tree display */}
      {tree.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] py-2">
          {(tree as any[]).map((node: any) => (
            <TreeNode
              key={node._id}
              node={node}
              depth={0}
              onAddChild={handleAddChild}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sub-tab B: Roles Metier ───────────────────── */

function RolesMetierPanel({
  orgId,
  orgType,
}: {
  orgId: Id<"organizations">;
  orgType: OrgType;
}) {
  const { roles, isLoading, createRole, removeRole, updateRole, bulkCreateRoles } =
    useBusinessRoles(orgId);

  const [showFormForType, setShowFormForType] = useState<OrgUnitType | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [form, setForm] = useState<AddRoleForm>(initialAddRoleForm);
  const [submitting, setSubmitting] = useState(false);

  // Available unit types for this org type
  const unitTypes = ORG_UNIT_VOCABULARY[orgType] ?? [];

  // Group roles by orgUnitType
  const grouped = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const role of (roles as any[])) {
      const key = role.orgUnitType ?? "_non_classe";
      if (!groups[key]) groups[key] = [];
      groups[key].push(role);
    }
    return groups;
  }, [roles]);

  const handleCreate = useCallback(async (unitType: OrgUnitType) => {
    if (!form.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    try {
      await createRole({
        organizationId: orgId,
        nom: form.nom.trim(),
        description: form.description.trim() || undefined,
        categorie: form.categorie || undefined,
        orgUnitType: unitType,
      });
      toast.success(`R\u00f4le "${form.nom}" cr\u00e9\u00e9`);
      setForm(initialAddRoleForm);
      setShowFormForType(null);
    } catch {
      toast.error("Erreur lors de la cr\u00e9ation");
    } finally {
      setSubmitting(false);
    }
  }, [form, orgId, createRole]);

  const handleRemove = useCallback(
    async (id: Id<"business_roles">, nom: string) => {
      try {
        await removeRole({ id, force: true });
        toast.success(`R\u00f4le "${nom}" supprim\u00e9`);
      } catch (err: any) {
        toast.error(err?.message ?? "Erreur lors de la suppression");
      }
    },
    [removeRole]
  );

  const handleLoadPresets = useCallback(async () => {
    if (roles.length > 0) {
      toast.error("Des r\u00f4les existent d\u00e9j\u00e0. Supprimez-les d'abord.");
      return;
    }
    setSubmitting(true);
    try {
      // Load presets only for unit types in this org's vocabulary
      const presets = unitTypes.flatMap((ut) => getRolesForUnitType(ut));
      await bulkCreateRoles({
        organizationId: orgId,
        roles: presets.map((p) => ({
          nom: p.nom,
          description: p.description,
          categorie: p.categorie,
          orgUnitType: p.orgUnitType,
          niveau: p.niveau,
          couleur: p.couleur,
          icone: p.icone,
        })),
      });
      toast.success(`${presets.length} r\u00f4les pr\u00e9d\u00e9finis charg\u00e9s`);
    } catch {
      toast.error("Erreur lors du chargement des pr\u00e9sets");
    } finally {
      setSubmitting(false);
    }
  }, [orgType, orgId, roles.length, bulkCreateRoles, unitTypes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {roles.length === 0
            ? "Aucun r\u00f4le d\u00e9fini. Chargez les pr\u00e9sets ou ajoutez manuellement."
            : `${roles.length} r\u00f4le(s) m\u00e9tier configur\u00e9(s)`}
        </p>
        <div className="flex items-center gap-2">
          {roles.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-violet-500/30 text-xs text-violet-400 hover:bg-violet-500/10"
              onClick={handleLoadPresets}
              disabled={submitting}
            >
              <Zap className="h-3.5 w-3.5" />
              Charger les pr\u00e9sets
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/10"
            onClick={() => setShowBulk(!showBulk)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Import IA
          </Button>
        </div>
      </div>

      {/* Smart Import for roles */}
      {showBulk && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium text-white/60 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Import intelligent — Rôles Métier
          </p>
          <SmartImportZone
            schema={[
              { key: "nom", label: "Nom du rôle", required: true },
              { key: "categorie", label: "Catégorie" },
              { key: "orgUnitType", label: "Type d'unité (direction, service…)" },
              { key: "description", label: "Description" },
            ]}
            context="Liste de rôles métier / postes dans une organisation. Extrais le nom de chaque rôle, sa catégorie (dirigeant, cadre, agent...), le type d'unité organisationnelle où il s'applique, et une description si disponible."
            onImport={async (rows: Record<string, any>[]) => {
              const validRoles = rows.filter((r: Record<string, any>) => r.nom);
              await bulkCreateRoles({
                organizationId: orgId,
                roles: validRoles.map((r: Record<string, any>) => ({
                  nom: r.nom,
                  description: r.description || undefined,
                  categorie: r.categorie || undefined,
                  orgUnitType: mapUnitType(r.orgUnitType),
                })),
              });
            }}
            importLabel="Créer"
            onClose={() => setShowBulk(false)}
          />
        </div>
      )}

      {/* Roles grouped by unit type */}
      <div className="space-y-5">
        {unitTypes.map((unitType) => {
          const unitRoles = grouped[unitType] ?? [];
          const dotColor = ORG_UNIT_TYPE_COLORS[unitType] ?? "#6B7280";
          const isAdding = showFormForType === unitType;

          return (
            <div key={unitType} className="space-y-2">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span className="text-sm font-semibold text-white/80">
                    {ORG_UNIT_TYPE_LABELS[unitType]}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-[10px] text-white/40"
                  >
                    {unitRoles.length} poste(s)
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs text-white/40 hover:text-white/70"
                  onClick={() => {
                    if (isAdding) {
                      setShowFormForType(null);
                      setForm(initialAddRoleForm);
                    } else {
                      setShowFormForType(unitType);
                      setForm(initialAddRoleForm);
                    }
                  }}
                >
                  {isAdding ? (
                    <><X className="h-3 w-3" /> Annuler</>
                  ) : (
                    <><Plus className="h-3 w-3" /> Ajouter</>
                  )}
                </Button>
              </div>

              {/* Add role form for this unit type */}
              {isAdding && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Input
                      placeholder="Nom du poste"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
                      autoFocus
                    />
                    <Input
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
                    />
                    <Select
                      value={form.categorie}
                      onValueChange={(v) => setForm({ ...form, categorie: v })}
                    >
                      <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80">
                        <SelectValue placeholder="Cat\u00e9gorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
                    onClick={() => handleCreate(unitType)}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                    Cr\u00e9er
                  </Button>
                </div>
              )}

              {/* Role cards */}
              {unitRoles.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {unitRoles.map((role: any) => (
                    <div
                      key={role._id}
                      className="group rounded-xl border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => setExpandedRoleId(expandedRoleId === role._id ? null : role._id)}
                        >
                          <p className="text-sm font-medium text-white/90">
                            {role.nom}
                          </p>
                          {role.description && (
                            <p className="mt-0.5 text-xs text-white/40 line-clamp-2">
                              {role.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {role.categorie && (
                              <Badge
                                variant="outline"
                                className="border-white/10 bg-white/[0.04] text-[10px] text-white/50"
                              >
                                {ROLE_CATEGORIES.find((c) => c.id === role.categorie)?.label ?? role.categorie}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className={`text-[9px] border-0 gap-0.5 cursor-pointer ${role.modulePermissions
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-white/5 text-white/30"
                                }`}
                            >
                              <Shield className="h-2.5 w-2.5" />
                              {role.modulePermissions ? "Modules configurés" : "Modules par défaut"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-white/30 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                          onClick={() => handleRemove(role._id, role.nom)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* Expandable module permissions */}
                      {expandedRoleId === role._id && (
                        <ModulePermissionsEditor
                          role={role}
                          onUpdate={async (perms: Record<string, boolean>) => {
                            await updateRole({
                              id: role._id,
                              modulePermissions: perms as any,
                            });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/25 italic pl-5">
                  Aucun poste configur\u00e9 pour ce type d'unit\u00e9
                </p>
              )}
            </div>
          );
        })}

        {/* Show non-classified roles if any exist */}
        {grouped["_non_classe"] && grouped["_non_classe"].length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="text-sm font-semibold text-white/60">
                Non class\u00e9s
              </span>
              <Badge
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-[10px] text-white/40"
              >
                {grouped["_non_classe"].length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {grouped["_non_classe"].map((role: any) => (
                <div
                  key={role._id}
                  className="group flex items-start gap-3 rounded-xl border border-orange-500/10 bg-orange-500/[0.03] p-3 transition-colors hover:bg-orange-500/[0.06]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/90">
                      {role.nom}
                    </p>
                    {role.description && (
                      <p className="mt-0.5 text-xs text-white/40 line-clamp-2">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-white/30 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    onClick={() => handleRemove(role._id, role.nom)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Module Permissions Editor (inline in role card) ──── */

// Uses MODULE_GROUPS from @/config/modules (single source of truth)

const MODULE_DEFAULTS: Record<string, boolean> = {
  dashboard: true, idocument: true, iarchive: true, isignature: true, iasted: true, formation: true,
  clients: false, leads: false, organisation: false, equipe: false,
  abonnements: false, parametres: false,
};

function ModulePermissionsEditor({
  role,
  onUpdate,
}: {
  role: any;
  onUpdate: (perms: Record<string, boolean>) => Promise<void>;
}) {
  const perms: Record<string, boolean> = { ...MODULE_DEFAULTS, ...(role.modulePermissions ?? {}) };

  const toggle = async (key: string) => {
    const updated = { ...perms, [key]: !perms[key] };
    await onUpdate(updated);
  };

  return (
    <div className="border-t border-white/5 px-3 py-2 space-y-2">
      {MODULE_GROUPS.map((group) => (
        <div key={group.cat}>
          <p className={`text-[9px] font-medium uppercase tracking-wide mb-1 ${group.color}`}>
            {group.cat}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.modules.map((mod) => (
              <button
                key={mod.key}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${perms[mod.key]
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/[0.02] text-white/30 hover:text-white/50"
                  }`}
                onClick={() => toggle(mod.key)}
                title={perms[mod.key] ? `Désactiver ${mod.label}` : `Activer ${mod.label}`}
              >
                {perms[mod.key] ? "✓" : "—"} {mod.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Sub-tab C: Personnel ──────────────────────── */

function PersonnelPanel({
  orgId,
  orgType,
}: {
  orgId: Id<"org_units"> extends never ? never : any;
  orgType: string;
}) {
  const members = useQuery(api.orgMembers.list, { organizationId: orgId });
  const addMember = useMutation(api.orgMembers.add);
  const bulkAddMembers = useMutation(api.orgMembers.bulkAdd);
  const removeMember = useMutation(api.orgMembers.remove);
  const updateMember = useMutation(api.orgMembers.update);
  const addAssignment = useMutation(api.orgMembers.addAssignment);
  const removeAssignment = useMutation(api.orgMembers.removeAssignment);
  const setModuleOverridesMutation = useMutation(api.orgMembers.setModuleOverrides);

  const { units } = useOrgUnits(orgId);
  const { roles } = useBusinessRoles(orgId);

  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Edit state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openAssignmentsMemberId, setOpenAssignmentsMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    role: "membre" as string,
    estAdmin: false,
    orgUnitId: "" as string,
    businessRoleId: "" as string,
  });
  const [saving, setSaving] = useState(false);

  // Compute admin count for last-admin protection
  const adminCount = React.useMemo(() =>
    (members ?? []).filter((m: any) => m.estAdmin === true).length,
    [members]
  );
  const isLastAdmin = (member: any) =>
    member.estAdmin === true && adminCount <= 1;

  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    role: "membre" as string,
    estAdmin: false,
    orgUnitId: "" as string,
    businessRoleId: "" as string,
  });

  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState<"file" | "text">("file");
  const [bulkPreview, setBulkPreview] = useState<{ nom: string; email?: string; telephone?: string; poste?: string }[]>([]);
  const [bulkFileName, setBulkFileName] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Start editing a member ──
  const startEdit = useCallback((member: any) => {
    setEditingId(member._id);
    setEditForm({
      nom: member.nom ?? "",
      email: member.email ?? "",
      telephone: member.telephone ?? "",
      poste: member.poste ?? "",
      role: member.role ?? "membre",
      estAdmin: member.estAdmin ?? false,
      orgUnitId: member.orgUnitId ?? "",
      businessRoleId: member.businessRoleId ?? "",
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({ nom: "", email: "", telephone: "", poste: "", role: "membre", estAdmin: false, orgUnitId: "", businessRoleId: "" });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    if (!editForm.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      await updateMember({
        id: editingId as any,
        nom: editForm.nom.trim(),
        email: editForm.email.trim() || undefined,
        telephone: editForm.telephone.trim() || undefined,
        poste: editForm.poste.trim() || undefined,
        estAdmin: editForm.estAdmin,
      });
      // Handle the first assignment change for simplicity in this inline form
      try {
        await addAssignment({
          id: editingId as any,
          orgUnitId: editForm.orgUnitId as any,
          businessRoleId: editForm.businessRoleId as any,
          isPrimary: true,
        });
      } catch (e) { /* ignore if already exists */ }

      toast.success("Membre mis à jour");
      cancelEdit();
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }, [editingId, editForm, updateMember, addAssignment, cancelEdit]);

  const handleAdd = useCallback(async () => {
    if (!form.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    try {
      await addMember({
        organizationId: orgId,
        nom: form.nom.trim(),
        email: form.email.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
        poste: form.poste.trim() || undefined,
        estAdmin: form.estAdmin,
        orgUnitId: form.orgUnitId ? (form.orgUnitId as any) : undefined,
        businessRoleId: form.businessRoleId
          ? (form.businessRoleId as any)
          : undefined,
      });
      toast.success(`Membre "${form.nom}" ajouté`);
      setForm({
        nom: "",
        email: "",
        telephone: "",
        poste: "",
        role: "membre",
        estAdmin: false,
        orgUnitId: "",
        businessRoleId: "",
      });
      setShowForm(false);
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  }, [form, orgId, addMember]);

  // ── Parse CSV/text lines into preview rows ──
  const parseLines = useCallback((text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    // Detect if first line looks like a header
    const firstLine = lines[0]?.toLowerCase() ?? "";
    const isHeader = ["nom", "name", "email", "mail", "téléphone"].some((h) => firstLine.includes(h));
    const dataLines = isHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const parts = line.split(/[;,\t]/).map((p) => p.trim());
      return {
        nom: parts[0] ?? "",
        email: parts[1] || undefined,
        telephone: parts[2] || undefined,
        poste: parts[3] || undefined,
      };
    }).filter((p) => p.nom.length > 0);
  }, []);

  // ── Handle file upload (CSV / Excel) ──
  const handleFileUpload = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    setBulkFileName(file.name);

    if (ext === "csv" || ext === "txt") {
      const text = await file.text();
      const rows = parseLines(text);
      setBulkPreview(rows);
    } else if (ext === "xlsx" || ext === "xls") {
      // Read Excel via simple parsing (tab-separated from clipboard or basic xlsx)
      try {
        const buffer = await file.arrayBuffer();
        // Simple XLSX parsing: extract shared strings + sheet data
        // For production, use SheetJS. Here we handle via text extraction fallback.
        const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
        // Try to extract readable text rows from the binary
        const readable = text.replace(/[^\x20-\x7E\n\t;,àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ@.+\-()\s]/g, "");
        const rows = parseLines(readable);
        if (rows.length > 0) {
          setBulkPreview(rows);
        } else {
          toast.error("Format Excel non supporté. Exportez en CSV depuis Excel puis réimportez.", {
            description: "Fichier → Enregistrer sous → CSV (séparateur point-virgule)",
            duration: 6000,
          });
          setBulkFileName("");
        }
      } catch {
        toast.error("Impossible de lire le fichier Excel. Utilisez le format CSV.");
        setBulkFileName("");
      }
    } else {
      toast.error(`Format .${ext} non supporté. Utilisez CSV, TXT ou Excel.`);
      setBulkFileName("");
    }
  }, [parseLines]);

  // ── Handle text paste → preview ──
  const handleTextPreview = useCallback(() => {
    const rows = parseLines(bulkText);
    if (rows.length === 0) {
      toast.error("Aucune ligne valide détectée");
      return;
    }
    setBulkPreview(rows);
  }, [bulkText, parseLines]);

  // ── Import confirmed rows via bulkAdd ──
  const handleBulkAdd = useCallback(async () => {
    const rows = bulkPreview.length > 0 ? bulkPreview : parseLines(bulkText);
    if (rows.length === 0) {
      toast.error("Aucune ligne à importer");
      return;
    }
    setSubmitting(true);
    try {
      await bulkAddMembers({
        organizationId: orgId,
        members: rows,
      });
      toast.success(`${rows.length} membre(s) importé(s) avec succès`);
      setBulkText("");
      setBulkPreview([]);
      setBulkFileName("");
      setShowBulk(false);
    } catch {
      toast.error("Erreur lors de l'import en masse");
    } finally {
      setSubmitting(false);
    }
  }, [bulkPreview, bulkText, orgId, bulkAddMembers, parseLines]);

  const handleRemove = useCallback(
    async (id: any, nom: string) => {
      try {
        await removeMember({ id });
        toast.success(`Membre "${nom}" retiré`);
      } catch (err: any) {
        toast.error(err?.message ?? "Erreur lors de la suppression");
      }
    },
    [removeMember]
  );

  const getUnitName = (unitId?: any) => {
    if (!unitId) return null;
    const unit = (units as any[]).find((u: any) => u._id === unitId);
    return unit?.nom ?? null;
  };

  const getRoleName = (roleId?: any) => {
    if (!roleId) return null;
    const role = (roles as any[]).find((r: any) => r._id === roleId);
    return role?.nom ?? null;
  };

  if (members === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {members.length === 0
            ? "Aucun membre enregistré. Ajoutez manuellement ou importez en masse."
            : `${members.length} membre(s) enregistré(s)`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-violet-500/30 text-xs text-violet-400 hover:bg-violet-500/10"
            onClick={() => { setShowBulk(true); setShowForm(false); }}
          >
            <Users className="h-3.5 w-3.5" />
            Import en masse
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
            onClick={() => { setShowForm(true); setShowBulk(false); }}
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un membre
          </Button>
        </div>
      </div>

      {/* ── Module Permissions — Interactive Overrides ── */}
      {editingId && (() => {
        const editingMember = (members as any[]).find((m: any) => m._id === editingId);
        if (!editingMember) return null;

        const currentOverrides: Record<string, boolean | undefined> = editingMember.moduleOverrides ?? {};
        const memberRole = editingMember.businessRoleId
          ? (roles as any[]).find((r: any) => r._id === editingMember.businessRoleId)
          : null;
        const rolePerms: Record<string, boolean | undefined> = memberRole?.modulePermissions ?? {};

        // Uses MODULE_GROUPS from @/config/modules (single source of truth)

        const handleOverrideToggle = async (moduleKey: string) => {
          const current = currentOverrides[moduleKey];
          // Cycle: undefined (inherit) → true (force allow) → false (force deny) → undefined
          let next: boolean | undefined;
          if (current === undefined) next = true;
          else if (current === true) next = false;
          else next = undefined;

          const newOverrides = { ...currentOverrides, [moduleKey]: next };
          // Clean up undefined values
          const cleanOverrides: Record<string, boolean> = {};
          let hasAny = false;
          for (const [k, val] of Object.entries(newOverrides)) {
            if (val !== undefined) {
              cleanOverrides[k] = val;
              hasAny = true;
            }
          }

          try {
            await setModuleOverridesMutation({
              id: editingId as any,
              overrides: hasAny ? cleanOverrides as any : undefined,
            });
          } catch {
            toast.error("Erreur lors de la mise à jour des overrides");
          }
        };

        const hasOverrides = Object.keys(currentOverrides).length > 0;

        return (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-violet-500/10 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">
                Overrides Modules — {editingMember.nom}
              </span>
              {hasOverrides && (
                <Badge variant="secondary" className="ml-auto text-[9px] bg-amber-500/15 text-amber-400 border-0">
                  {Object.keys(currentOverrides).length} override(s)
                </Badge>
              )}
              {!hasOverrides && (
                <span className="text-[9px] text-white/30 ml-auto">
                  Cliquez pour ajouter des exceptions individuelles
                </span>
              )}
            </div>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-white/5 text-white/40">
                  <th className="text-left py-2 px-4 font-medium">Catégorie</th>
                  <th className="text-left py-2 px-4 font-medium">Module</th>
                  <th className="text-center py-2 px-3 font-medium">Rôle Métier</th>
                  <th className="text-center py-2 px-3 font-medium">Override</th>
                  <th className="text-center py-2 px-3 font-medium">Effectif</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_GROUPS.map((group) =>
                  group.modules.map((mod, i) => {
                    const roleVal = rolePerms[mod.key];
                    const overrideVal = currentOverrides[mod.key];
                    const effective = overrideVal !== undefined ? overrideVal : (roleVal !== undefined ? roleVal : true);

                    return (
                      <tr key={mod.key} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        {i === 0 && (
                          <td className="py-1.5 px-4 text-white/50 font-medium" rowSpan={group.modules.length}>
                            {group.cat}
                          </td>
                        )}
                        <td className="py-1.5 px-4 text-white/60">{mod.label}</td>
                        <td className="py-1.5 px-3 text-center">
                          {roleVal === false
                            ? <span className="text-red-400">✗</span>
                            : roleVal === true
                              ? <span className="text-emerald-400">✓</span>
                              : <span className="text-white/20">—</span>
                          }
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <button
                            onClick={() => handleOverrideToggle(mod.key)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer
                              ${overrideVal === true
                                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                                : overrideVal === false
                                  ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                                  : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
                              }`}
                            title={
                              overrideVal === true ? "Override: Forcé ✓ — Cliquez pour forcer ✗"
                                : overrideVal === false ? "Override: Forcé ✗ — Cliquez pour hériter du rôle"
                                  : "Hérite du rôle — Cliquez pour forcer ✓"
                            }
                          >
                            {overrideVal === true ? "✓ Forcé"
                              : overrideVal === false ? "✗ Bloqué"
                                : "— Hérite"}
                          </button>
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {effective
                            ? <span className="text-emerald-400 font-semibold">✓</span>
                            : <span className="text-red-400 font-semibold">✗</span>
                          }
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        );
      })()}

      {!editingId && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium text-white/60">
              Permissions Modules
            </span>
            <span className="text-[9px] text-white/30 ml-auto">
              Cliquez sur un membre pour configurer des overrides individuels
            </span>
          </div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="text-left py-2 px-4 font-medium">Catégorie</th>
                <th className="text-left py-2 px-4 font-medium">Module</th>
                <th className="text-center py-2 px-3 font-medium">Admin</th>
                <th className="text-center py-2 px-3 font-medium">Métier (défaut)</th>
              </tr>
            </thead>
            <tbody>
              {MODULE_GROUPS.map((group) =>
                group.modules.map((mod, i) => (
                  <tr key={mod.key} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    {i === 0 && (
                      <td className="py-1.5 px-4 text-white/50 font-medium" rowSpan={group.modules.length}>
                        {group.cat}
                      </td>
                    )}
                    <td className="py-1.5 px-4 text-white/60">{mod.label}</td>
                    <td className="py-1.5 px-3 text-center">
                      <span className="text-emerald-400">✓</span>
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      {mod.defaut
                        ? <span className="text-emerald-400">✓</span>
                        : <span className="text-white/15">—</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add member form */}
      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium text-white/60">
            Nouveau membre
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Nom complet *"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) =>
                setForm({ ...form, telephone: e.target.value })
              }
              className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Poste / Fonction"
              value={form.poste}
              onChange={(e) => setForm({ ...form, poste: e.target.value })}
              className="border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
            />
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.03]">
              <input
                type="checkbox"
                id="add-estAdmin"
                checked={form.estAdmin}
                onChange={(e) => setForm({ ...form, estAdmin: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-white/30 text-violet-500 focus:ring-violet-500/30"
              />
              <label htmlFor="add-estAdmin" className="text-xs text-white/70 cursor-pointer">Admin ?</label>
            </div>
            {(units as any[]).length > 0 && (
              <Select
                value={form.orgUnitId}
                onValueChange={(v) => setForm({ ...form, orgUnitId: v, businessRoleId: "" })}
              >
                <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80">
                  <SelectValue placeholder="Unité organisationnelle" />
                </SelectTrigger>
                <SelectContent>
                  {(units as any[]).map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(() => {
              const selectedUnit = form.orgUnitId
                ? (units as any[]).find((u: any) => u._id === form.orgUnitId)
                : null;
              const filteredRoles = selectedUnit
                ? (roles as any[]).filter((r: any) => r.orgUnitType === selectedUnit.type || !r.orgUnitType)
                : (roles as any[]);
              return filteredRoles.length > 0 ? (
                <Select
                  value={form.businessRoleId}
                  onValueChange={(v) =>
                    setForm({ ...form, businessRoleId: v })
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80">
                    <SelectValue placeholder={selectedUnit ? `Poste (${selectedUnit.nom})` : "Rôle métier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRoles.map((r: any) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
              onClick={handleAdd}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Ajouter
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-white/40 hover:text-white/60"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )
      }

      {/* Bulk import — Smart AI Import */}
      {
        showBulk && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <p className="text-xs font-medium text-white/60 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Import intelligent (IA)
            </p>
            <SmartImportZone
              schema={[
                { key: "nom", label: "Nom", required: true },
                { key: "email", label: "Email" },
                { key: "telephone", label: "Téléphone" },
                { key: "poste", label: "Poste" },
              ]}
              context="Liste de membres/collaborateurs d'une organisation. Extrais le nom complet, l'email, le numéro de téléphone et le poste/fonction de chaque personne."
              onImport={async (rows: Record<string, any>[]) => {
                await bulkAddMembers({
                  organizationId: orgId,
                  members: rows.map((r: Record<string, any>) => ({
                    nom: r.nom ?? "",
                    email: r.email || undefined,
                    telephone: r.telephone || undefined,
                    poste: r.poste || undefined,
                  })).filter((m: { nom: string }) => m.nom.length > 0),
                });
              }}
              importLabel="Importer"
              onClose={() => setShowBulk(false)}
            />
          </div>
        )
      }

      {/* Members list */}
      {
        members.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/40">
                  <th className="text-left py-2.5 px-3 font-medium">Nom</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Poste
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium hidden lg:table-cell">
                    Unité
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium hidden lg:table-cell">
                    Rôle Métier
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium">
                    Rôle Syst.
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium">
                    Statut
                  </th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => {
                  const isEditing = editingId === m._id;
                  const unitName = getUnitName(m.orgUnitId);
                  const roleName = getRoleName(m.businessRoleId);

                  if (isEditing) {
                    return (
                      <tr
                        key={m._id}
                        className="border-b border-violet-500/20 bg-violet-500/[0.04]"
                      >
                        <td className="py-2 px-2">
                          <Input
                            value={editForm.nom}
                            onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                            placeholder="Nom *"
                            className="h-7 border-white/10 bg-white/[0.05] text-xs text-white placeholder:text-white/30"
                          />
                        </td>
                        <td className="py-2 px-2 hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            <Input
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              placeholder="Email"
                              type="email"
                              className="h-7 border-white/10 bg-white/[0.05] text-xs text-white placeholder:text-white/30"
                            />
                            <Input
                              value={editForm.telephone}
                              onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                              placeholder="Téléphone"
                              className="h-7 border-white/10 bg-white/[0.05] text-xs text-white placeholder:text-white/30"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-2 hidden md:table-cell">
                          <Input
                            value={editForm.poste}
                            onChange={(e) => setEditForm({ ...editForm, poste: e.target.value })}
                            placeholder="Poste"
                            className="h-7 border-white/10 bg-white/[0.05] text-xs text-white placeholder:text-white/30"
                          />
                        </td>
                        <td className="py-2 px-2 hidden lg:table-cell">
                          {(units as any[]).length > 0 ? (
                            <Select
                              value={editForm.orgUnitId}
                              onValueChange={(v) => setEditForm({ ...editForm, orgUnitId: v })}
                            >
                              <SelectTrigger className="h-7 border-white/10 bg-white/[0.05] text-xs text-white/80">
                                <SelectValue placeholder="Unité" />
                              </SelectTrigger>
                              <SelectContent>
                                {(units as any[]).map((u: any) => (
                                  <SelectItem key={u._id} value={u._id}>{u.nom}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 hidden lg:table-cell">
                          {(() => {
                            const editUnit = editForm.orgUnitId
                              ? (units as any[]).find((u: any) => u._id === editForm.orgUnitId)
                              : null;
                            const editFilteredRoles = editUnit
                              ? (roles as any[]).filter((r: any) => r.orgUnitType === editUnit.type || !r.orgUnitType)
                              : (roles as any[]);
                            return editFilteredRoles.length > 0 ? (
                              <Select
                                value={editForm.businessRoleId}
                                onValueChange={(v) => setEditForm({ ...editForm, businessRoleId: v })}
                              >
                                <SelectTrigger className="h-7 border-white/10 bg-white/[0.05] text-xs text-white/80">
                                  <SelectValue placeholder="Rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editFilteredRoles.map((r: any) => (
                                    <SelectItem key={r._id} value={r._id}>{r.nom}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-white/30">—</span>
                            );
                          })()}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2 px-2">
                            <input
                              type="checkbox"
                              checked={editForm.estAdmin}
                              onChange={(e) => setEditForm({ ...editForm, estAdmin: e.target.checked })}
                              className="h-3 w-3 rounded border-white/30 text-violet-500 disabled:opacity-30"
                              disabled={isLastAdmin(m) && editForm.estAdmin}
                            />
                            <span className="text-xs text-white/50">
                              {isLastAdmin(m) ? "Admin (seul)" : "Admin"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] border-0 ${m.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : m.status === "invited"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-red-500/15 text-red-400"
                              }`}
                          >
                            {m.status === "active"
                              ? "Actif"
                              : m.status === "invited"
                                ? "Invité"
                                : "Suspendu"}
                          </Badge>
                        </td>
                        <td className="py-2 px-1">
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              onClick={handleSaveEdit}
                              disabled={saving}
                              title="Enregistrer"
                            >
                              {saving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                              onClick={cancelEdit}
                              title="Annuler"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={m._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-white/90">
                        {m.nom ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-white/50 hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {m.email && <span>{m.email}</span>}
                          {m.telephone && <span>{m.telephone}</span>}
                          {!m.email && !m.telephone && <span>—</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-white/50 hidden md:table-cell">
                        {m.poste ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 hidden lg:table-cell">
                        {m.assignments && m.assignments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {m.assignments.map((a: any, idx: number) => {
                              const uName = getUnitName(a.orgUnitId);
                              return (
                                <Badge
                                  key={idx}
                                  variant={a.isPrimary ? "default" : "outline"}
                                  className={`text-[9px] ${a.isPrimary ? "bg-violet-500 hover:bg-violet-600 text-white" : "border-white/10 bg-white/[0.04] text-white/50"}`}
                                >
                                  {uName || "—"} {a.isPrimary && "(Principal)"}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : unitName ? (
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-white/[0.04] text-[10px] text-white/50"
                          >
                            {unitName}
                          </Badge>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 hidden lg:table-cell">
                        {m.assignments && m.assignments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {m.assignments.map((a: any, idx: number) => {
                              const rName = getRoleName(a.businessRoleId);
                              return (
                                <Badge
                                  key={idx}
                                  variant={a.isPrimary ? "default" : "outline"}
                                  className={`text-[9px] ${a.isPrimary ? "bg-violet-500 hover:bg-violet-600 text-white" : "border-white/10 bg-violet-500/10 text-violet-300"}`}
                                >
                                  {rName || "—"}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : roleName ? (
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-violet-500/10 text-[10px] text-violet-300"
                          >
                            {roleName}
                          </Badge>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {(() => {
                          const isAdm = m.estAdmin === true;
                          return (
                            <Badge
                              variant="secondary"
                              className={`text-[9px] border-0 ${isAdm ? "bg-violet-500/15 text-violet-400" : "bg-cyan-500/15 text-cyan-400"}`}
                            >
                              {isAdm ? "Admin" : "Membre"}
                            </Badge>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant="secondary"
                          className={`text-[9px] border-0 ${m.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : m.status === "invited"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-red-500/15 text-red-400"
                            }`}
                        >
                          {m.status === "active"
                            ? "Actif"
                            : m.status === "invited"
                              ? "Invité"
                              : "Suspendu"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white/30 hover:bg-violet-500/10 hover:text-violet-400"
                            onClick={() => startEdit(m)}
                            title="Modifier infos"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                            onClick={() => {
                              setOpenAssignmentsMemberId(m._id);
                            }}
                            title="Gérer les affectations multiples"
                          >
                            <Network className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 ${isLastAdmin(m)
                              ? "text-white/10 cursor-not-allowed"
                              : "text-white/30 hover:bg-red-500/10 hover:text-red-400"
                              }`}
                            onClick={() => handleRemove(m._id, m.nom ?? "?")}
                            disabled={isLastAdmin(m)}
                            title={isLastAdmin(m) ? "Dernier admin — activez un autre admin d'abord" : "Retirer"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
      {/* Gérer les affectations multiples */}
      {openAssignmentsMemberId && (
        <MultiAssignmentsModal
          memberId={openAssignmentsMemberId}
          orgId={orgId}
          onClose={() => setOpenAssignmentsMemberId(null)}
          units={units}
          roles={roles}
        />
      )}
    </div >
  );
}

function MultiAssignmentsModal({
  memberId,
  orgId,
  onClose,
  units,
  roles,
}: {
  memberId: any;
  orgId: any;
  onClose: () => void;
  units: any[];
  roles: any[];
}) {
  const assignments = useQuery(api.orgMembers.listAssignments, { id: memberId });
  const addAssignment = useMutation(api.orgMembers.addAssignment);
  const removeAssignment = useMutation(api.orgMembers.removeAssignment);
  const updateAssignment = useMutation(api.orgMembers.updateAssignment);

  const [form, setForm] = useState({
    orgUnitId: "",
    businessRoleId: "",
    isPrimary: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!form.orgUnitId || !form.businessRoleId) {
      toast.error("Veuillez sélectionner une unité et un poste");
      return;
    }
    setSubmitting(true);
    try {
      await addAssignment({
        id: memberId,
        orgUnitId: form.orgUnitId as any,
        businessRoleId: form.businessRoleId as any,
        isPrimary: form.isPrimary,
      });
      toast.success("Affectation ajoutée");
      setForm({ orgUnitId: "", businessRoleId: "", isPrimary: false });
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await removeAssignment({ id: memberId, index });
      toast.success("Affectation retirée");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors du retrait");
    }
  };

  const handleSetPrimary = async (index: number) => {
    try {
      await updateAssignment({ id: memberId, index, isPrimary: true });
      toast.success("Affectation principale définie");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de la mise à jour");
    }
  };

  const getUnitName = (id: string) => units.find(u => u._id === id)?.nom ?? "—";
  const getRoleName = (id: string) => roles.find(r => r._id === id)?.nom ?? "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Affectations Multiples</h3>
              <p className="text-xs text-white/50">Gérez les différents postes et unités de ce membre</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* List of assignments */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white/80">Affectations actuelles</h4>
            {assignments === undefined ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-white/30" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
                <p className="text-sm text-white/40">Aucune affectation configurée pour ce membre.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {assignments.map((assignment: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between rounded-xl border p-3 ${assignment.isPrimary
                    ? 'border-violet-500/30 bg-violet-500/5'
                    : 'border-white/10 bg-white/[0.02]'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${assignment.isPrimary ? 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-sm font-medium text-white/90">
                          {getRoleName(assignment.businessRoleId)}
                        </p>
                        <p className="text-xs text-white/50">
                          {getUnitName(assignment.orgUnitId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {assignment.isPrimary ? (
                        <Badge className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border-0">
                          Principale
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(index)}
                          className="h-7 text-[10px] border-white/10 bg-transparent text-white/50 hover:text-white"
                        >
                          Définir Principale
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(index)}
                        className="h-7 w-7 text-white/30 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new assignment form */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
            <h4 className="text-sm font-medium text-white/80">Nouvelle affectation</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                value={form.orgUnitId}
                onValueChange={(v) => setForm({ ...form, orgUnitId: v, businessRoleId: "" })}
              >
                <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80">
                  <SelectValue placeholder="Sélectionner une unité..." />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>{u.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(() => {
                const selectedUnit = form.orgUnitId ? units.find(u => u._id === form.orgUnitId) : null;
                const filteredRoles = selectedUnit
                  ? roles.filter((r: any) => r.orgUnitType === selectedUnit.type || !r.orgUnitType)
                  : roles;

                return (
                  <Select
                    value={form.businessRoleId}
                    onValueChange={(v) => setForm({ ...form, businessRoleId: v })}
                    disabled={!form.orgUnitId}
                  >
                    <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80 disabled:opacity-50">
                      <SelectValue placeholder={!form.orgUnitId ? "Sélectionnez l'unité d'abord" : "Poste ou rôle métier..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRoles.map((r: any) => (
                        <SelectItem key={r._id} value={r._id}>{r.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="target-primary"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-white/30 text-violet-500 focus:ring-violet-500/30"
                />
                <label htmlFor="target-primary" className="text-xs text-white/70 cursor-pointer">
                  Définir comme affectation principale
                </label>
              </div>

              <Button
                size="sm"
                onClick={handleAdd}
                disabled={submitting || !form.orgUnitId || !form.businessRoleId}
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Ajouter
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

