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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="gap-1.5 text-xs data-[state=active]:bg-white/[0.06]"
          >
            <Briefcase className="h-3.5 w-3.5" />
            R&ocirc;les M&eacute;tier
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="gap-1.5 text-xs data-[state=active]:bg-white/[0.06]"
          >
            <Users className="h-3.5 w-3.5" />
            Personnel
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
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
            onClick={handleAddRoot}
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une unit\u00e9
          </Button>
        </div>
      </div>

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
  const { roles, isLoading, createRole, removeRole, bulkCreateRoles } =
    useBusinessRoles(orgId);

  const [showFormForType, setShowFormForType] = useState<OrgUnitType | null>(null);
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
        </div>
      </div>

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
                      className="group flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
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
                        {role.categorie && (
                          <Badge
                            variant="outline"
                            className="mt-1.5 border-white/10 bg-white/[0.04] text-[10px] text-white/50"
                          >
                            {ROLE_CATEGORIES.find((c) => c.id === role.categorie)?.label ?? role.categorie}
                          </Badge>
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

  const { units } = useOrgUnits(orgId);
  const { roles } = useBusinessRoles(orgId);

  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Edit state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    role: "org_member" as string,
    orgUnitId: "" as string,
    businessRoleId: "" as string,
  });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    role: "org_member" as string,
    orgUnitId: "" as string,
    businessRoleId: "" as string,
  });

  const [bulkText, setBulkText] = useState("");

  // ── Start editing a member ──
  const startEdit = useCallback((member: any) => {
    setEditingId(member._id);
    setEditForm({
      nom: member.nom ?? "",
      email: member.email ?? "",
      telephone: member.telephone ?? "",
      poste: member.poste ?? "",
      role: member.role ?? "org_member",
      orgUnitId: member.orgUnitId ?? "",
      businessRoleId: member.businessRoleId ?? "",
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({ nom: "", email: "", telephone: "", poste: "", role: "org_member", orgUnitId: "", businessRoleId: "" });
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
        role: editForm.role as any,
        orgUnitId: editForm.orgUnitId ? (editForm.orgUnitId as any) : undefined,
        businessRoleId: editForm.businessRoleId ? (editForm.businessRoleId as any) : undefined,
      });
      toast.success("Membre mis à jour");
      cancelEdit();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }, [editingId, editForm, updateMember, cancelEdit]);

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
        role: form.role as any,
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
        role: "org_member",
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

  const handleBulkAdd = useCallback(async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) {
      toast.error("Aucune ligne à importer");
      return;
    }
    setSubmitting(true);
    try {
      const parsed = lines.map((line) => {
        const parts = line.split(/[;,\t]/).map((p) => p.trim());
        return {
          nom: parts[0] ?? "",
          email: parts[1] || undefined,
          telephone: parts[2] || undefined,
          poste: parts[3] || undefined,
        };
      });
      await bulkAddMembers({
        organizationId: orgId,
        members: parsed.filter((p) => p.nom.length > 0),
      });
      toast.success(`${parsed.length} membre(s) importé(s)`);
      setBulkText("");
      setShowBulk(false);
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setSubmitting(false);
    }
  }, [bulkText, orgId, bulkAddMembers]);

  const handleRemove = useCallback(
    async (id: any, nom: string) => {
      try {
        await removeMember({ id });
        toast.success(`Membre "${nom}" retiré`);
      } catch {
        toast.error("Erreur lors de la suppression");
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

      {/* ── Role Permissions Summary ── */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-medium text-white/60">
            Permissions par Rôle Système
          </span>
          <span className="text-[9px] text-white/30 ml-auto">
            Rôle = accès interface · Poste = accès documents (Matrice d&apos;Accès)
          </span>
        </div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-white/5 text-white/40">
              <th className="text-left py-2 px-4 font-medium">Fonctionnalité</th>
              <th className="text-center py-2 px-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />Admin
                </span>
              </th>
              <th className="text-center py-2 px-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />Responsable
                </span>
              </th>
              <th className="text-center py-2 px-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />Collaborateur
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Config Organisation", admin: true, manager: false, member: false },
              { label: "Gestion Personnel", admin: true, manager: false, member: false },
              { label: "Structure de Classement", admin: true, manager: false, member: false },
              { label: "Config Modules", admin: true, manager: false, member: false },
              { label: "Analytics", admin: true, manager: true, member: false },
              { label: "Facturation", admin: true, manager: false, member: false },
              { label: "Création/Édition contenu", admin: true, manager: true, member: true },
              { label: "Accès /subadmin", admin: true, manager: false, member: false },
              { label: "Accès espace de travail", admin: true, manager: true, member: true },
            ].map((perm) => (
              <tr key={perm.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-1.5 px-4 text-white/60">{perm.label}</td>
                <td className="py-1.5 px-3 text-center">
                  {perm.admin ? <span className="text-emerald-400">✓</span> : <span className="text-white/15">—</span>}
                </td>
                <td className="py-1.5 px-3 text-center">
                  {perm.manager ? <span className="text-emerald-400">✓</span> : <span className="text-white/15">—</span>}
                </td>
                <td className="py-1.5 px-3 text-center">
                  {perm.member ? <span className="text-emerald-400">✓</span> : <span className="text-white/15">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
            >
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-sm text-white/80">
                <SelectValue placeholder="Rôle système" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org_admin">Admin</SelectItem>
                <SelectItem value="org_manager">Responsable</SelectItem>
                <SelectItem value="org_member">Collaborateur</SelectItem>
              </SelectContent>
            </Select>
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
      )}

      {/* Bulk import */}
      {showBulk && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium text-white/60">
            Import en masse
          </p>
          <p className="text-[11px] text-white/30">
            Un membre par ligne. Format : Nom ; Email ; Téléphone ; Poste
            (séparateur : virgule, point-virgule ou tabulation)
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"Jean Dupont ; jean@exemple.com ; +241 07 00 00 ; Directeur\nMarie Moussavou ; marie@exemple.com ; ; Assistante"}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/30 resize-none"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
              onClick={handleBulkAdd}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Importer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-white/40 hover:text-white/60"
              onClick={() => setShowBulk(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      {members.length > 0 && (
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
                        <Select
                          value={editForm.role}
                          onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                        >
                          <SelectTrigger className="h-7 border-white/10 bg-white/[0.05] text-xs text-white/80">
                            <SelectValue placeholder="Rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="org_admin">Admin</SelectItem>
                            <SelectItem value="org_manager">Responsable</SelectItem>
                            <SelectItem value="org_member">Collaborateur</SelectItem>
                          </SelectContent>
                        </Select>
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
                      {unitName ? (
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
                      {roleName ? (
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
                        const roleConfig: Record<string, { label: string; color: string }> = {
                          org_admin: { label: "Admin", color: "bg-red-500/15 text-red-400" },
                          org_manager: { label: "Responsable", color: "bg-amber-500/15 text-amber-400" },
                          org_member: { label: "Collaborateur", color: "bg-cyan-500/15 text-cyan-400" },
                          org_viewer: { label: "Observateur", color: "bg-gray-500/15 text-gray-400" },
                        };
                        const cfg = roleConfig[m.role] ?? roleConfig.org_member;
                        return (
                          <Badge
                            variant="secondary"
                            className={`text-[9px] border-0 ${cfg.color}`}
                          >
                            {cfg.label}
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
                          title="Modifier"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/30 hover:bg-red-500/10 hover:text-red-400"
                          onClick={() => handleRemove(m._id, m.nom ?? "?")}
                          title="Retirer"
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
      )}
    </div>
  );
}

