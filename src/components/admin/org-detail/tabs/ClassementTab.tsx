// ===============================================
// DIGITALIUM.IO — Tab: Structure de Classement
// Sub-tabs: Arborescence, Matrice d'Acces, Habilitations
// ===============================================

"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  FolderTree,
  Grid3X3,
  Shield,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Loader2,
  Download,
  X,
  RotateCcw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useFilingStructures, useFilingCells } from "@/hooks/useFilingAccess";
import { getFilingTemplate } from "@/config/filing-presets";
import { CONFIDENTIALITY_LABELS } from "@/types/filing";
import type { ConfidentialityLevel, FilingCellNode } from "@/types/filing";

/* ─── Animations ───────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Constants ────────────────────────────────── */

const CONFIDENTIALITY_COLORS: Record<ConfidentialityLevel, { bg: string; text: string; border: string }> = {
  public: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  restreint: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  confidentiel: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

const MODULE_LABELS: Record<string, { label: string; color: string }> = {
  idocument: { label: "iDocument", color: "blue" },
  iarchive: { label: "iArchive", color: "violet" },
  isignature: { label: "iSignature", color: "emerald" },
};

/* ─── Types ────────────────────────────────────── */

interface ClassementTabProps {
  orgId: any; // Id<"organizations">
  orgType: string;
}

interface AddCellForm {
  parentId: string | null;
  code: string;
  intitule: string;
  accessDefaut: ConfidentialityLevel;
}

/* ─── Tree Node Component ──────────────────────── */

function TreeNode({
  node,
  depth,
  expanded,
  onToggle,
  onAddChild,
  onRemove,
}: {
  node: FilingCellNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node._id);
  const confidentiality = CONFIDENTIALITY_COLORS[node.accessDefaut] ?? CONFIDENTIALITY_COLORS.public;
  const moduleInfo = node.moduleId ? MODULE_LABELS[node.moduleId] : null;

  return (
    <div style={{ paddingLeft: depth * 24 }}>
      <div className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-all">
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node._id)}
            className="text-muted-foreground hover:text-white transition-colors shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Folder icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-amber-400/60 shrink-0" />
        )}

        {/* Code */}
        <span className="text-xs font-bold text-white/90 font-mono shrink-0">{node.code}</span>

        {/* Label */}
        <span className="text-xs text-white/70 truncate">{node.intitule}</span>

        {/* Access level badge */}
        <Badge
          className={`text-[8px] py-0 px-1.5 ${confidentiality.bg} ${confidentiality.text} ${confidentiality.border}`}
        >
          {CONFIDENTIALITY_LABELS[node.accessDefaut]}
        </Badge>

        {/* Module badge */}
        {moduleInfo && (
          <Badge
            className={`text-[8px] py-0 px-1.5 bg-${moduleInfo.color}-500/10 text-${moduleInfo.color}-400 border-${moduleInfo.color}-500/20`}
          >
            {moduleInfo.label}
          </Badge>
        )}

        {/* Action buttons (visible on hover) */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node._id)}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Ajouter un sous-dossier"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => onRemove(node._id)}
            className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Render children recursively */}
      {isExpanded &&
        hasChildren &&
        node.children
          .sort((a, b) => a.ordre - b.ordre)
          .map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onRemove={onRemove}
            />
          ))}
    </div>
  );
}

/* ─── Add Cell Form ────────────────────────────── */

function AddCellInlineForm({
  parentId,
  onSubmit,
  onCancel,
}: {
  parentId: string | null;
  onSubmit: (data: AddCellForm) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [intitule, setIntitule] = useState("");
  const [accessDefaut, setAccessDefaut] = useState<ConfidentialityLevel>("restreint");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !intitule.trim()) {
      toast.error("Le code et l'intitule sont requis");
      return;
    }
    onSubmit({ parentId, code: code.trim(), intitule: intitule.trim(), accessDefaut });
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/5 rounded-lg mt-2"
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code (ex: FISC-TVA)"
        className="h-8 text-xs bg-white/[0.03] border-white/10 w-32"
        autoFocus
      />
      <Input
        value={intitule}
        onChange={(e) => setIntitule(e.target.value)}
        placeholder="Intitule du dossier"
        className="h-8 text-xs bg-white/[0.03] border-white/10 flex-1"
      />
      <select
        value={accessDefaut}
        onChange={(e) => setAccessDefaut(e.target.value as ConfidentialityLevel)}
        className="h-8 text-xs bg-white/[0.03] border border-white/10 rounded-md px-2 text-white/70"
      >
        <option value="public">Public</option>
        <option value="restreint">Restreint</option>
        <option value="confidentiel">Confidentiel</option>
      </select>
      <Button type="submit" size="sm" className="h-8 text-xs bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0">
        <Plus className="h-3 w-3 mr-1" />
        Ajouter
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </motion.form>
  );
}

/* ─── Sub-tab A: Arborescence ──────────────────── */

function ArborescencePanel({ orgId, orgType }: { orgId: any; orgType: string }) {
  const {
    structures,
    activeStructure,
    isLoading: structuresLoading,
    createStructure,
    setActiveStructure,
  } = useFilingStructures(orgId);

  const {
    tree,
    isLoading: cellsLoading,
    createCell,
    removeCell,
    bulkCreateCells,
  } = useFilingCells(activeStructure?._id);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingParentId, setAddingParentId] = useState<string | null | undefined>(undefined);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  // Auto-expand root nodes when tree loads
  React.useEffect(() => {
    if (tree && tree.length > 0 && expanded.size === 0) {
      setExpanded(new Set(tree.map((n: { _id: string }) => n._id)));
    }
  }, [tree, expanded.size]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(Array.from(prev));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreateStructure = async () => {
    try {
      const id = await createStructure({
        organizationId: orgId,
        nom: "Structure de classement principale",
        type: "custom",
      });
      await setActiveStructure({ id, organizationId: orgId });
      toast.success("Structure de classement creee");
    } catch {
      toast.error("Erreur lors de la creation de la structure");
    }
  };

  const handleLoadTemplate = async () => {
    setIsCreatingTemplate(true);
    try {
      // Create the structure first
      const structureId = await createStructure({
        organizationId: orgId,
        nom: "Structure de classement standard",
        type: "standard",
      });
      await setActiveStructure({ id: structureId, organizationId: orgId });

      // Load template cells
      const template = getFilingTemplate(orgType as any);
      const cellsToCreate = template.map((t) => ({
        code: t.code,
        intitule: t.intitule,
        niveau: t.niveau,
        accessDefaut: t.accessDefaut,
        moduleId: t.moduleId,
        icone: t.icone,
        couleur: t.couleur,
        tags: t.tags,
        ordre: t.ordre,
        tempId: t.tempId,
        parentTempId: t.parentTempId,
      }));

      await bulkCreateCells({
        filingStructureId: structureId,
        organizationId: orgId,
        cells: cellsToCreate,
      });

      toast.success("Modele de classement charge avec succes");
    } catch {
      toast.error("Erreur lors du chargement du modele");
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleAddCell = async (data: AddCellForm) => {
    if (!activeStructure) return;
    try {
      await createCell({
        filingStructureId: activeStructure._id,
        organizationId: orgId,
        code: data.code,
        intitule: data.intitule,
        accessDefaut: data.accessDefaut,
        parentId: data.parentId ? (data.parentId as any) : undefined,
        niveau: data.parentId ? 1 : 0,
        tags: [],
        ordre: tree.length,
      });
      setAddingParentId(undefined);
      toast.success("Cellule ajoutee");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleRemoveCell = async (id: string) => {
    try {
      await removeCell({ id: id as any });
      toast.success("Cellule supprimee");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Loading state
  if (structuresLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
        <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  // No structures yet — show creation card
  if (structures.length === 0 || !activeStructure) {
    return (
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
          <FolderTree className="h-6 w-6 text-violet-400" />
        </div>
        <h3 className="text-base font-semibold mb-2">Aucune structure de classement</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Definissez la structure de classement pour organiser les documents, archives et dossiers de cette organisation.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={handleCreateStructure}
            className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Creer une structure de classement
          </Button>
          <Button
            variant="outline"
            onClick={handleLoadTemplate}
            disabled={isCreatingTemplate}
            className="border-white/10 hover:bg-white/5"
          >
            {isCreatingTemplate ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Charger un modele
          </Button>
        </div>
      </motion.div>
    );
  }

  // Tree view
  return (
    <motion.div variants={stagger} className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold">{activeStructure.nom}</span>
          <Badge className="text-[8px] bg-violet-500/10 text-violet-400 border-violet-500/20 py-0">
            {activeStructure.type === "standard" ? "Standard" : "Personnalise"}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAddingParentId(null)}
          className="text-xs border-white/10 hover:bg-white/5"
        >
          <Plus className="h-3 w-3 mr-1.5" />
          Ajouter une racine
        </Button>
      </div>

      {/* Loading cells */}
      {cellsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
        </div>
      ) : (
        <>
          {/* Tree */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-0.5">
            {tree.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune cellule de classement. Ajoutez un dossier racine pour commencer.
              </p>
            ) : (
              (tree as any[])
                .sort((a: any, b: any) => a.ordre - b.ordre)
                .map((node: any) => (
                  <TreeNode
                    key={node._id}
                    node={node}
                    depth={0}
                    expanded={expanded}
                    onToggle={toggleExpand}
                    onAddChild={(parentId) => setAddingParentId(parentId)}
                    onRemove={handleRemoveCell}
                  />
                ))
            )}
          </div>

          {/* Add cell form */}
          {addingParentId !== undefined && (
            <AddCellInlineForm
              parentId={addingParentId}
              onSubmit={handleAddCell}
              onCancel={() => setAddingParentId(undefined)}
            />
          )}
        </>
      )}
    </motion.div>
  );
}

/* ─── Sub-tab B: Matrice d'Accès (Service × Rôle → Cellule) ── */

const ACCESS_LEVELS = ["aucun", "lecture", "ecriture", "gestion", "admin"] as const;
type AccessLevelType = (typeof ACCESS_LEVELS)[number];

const ACCESS_DISPLAY: Record<AccessLevelType, { icon: string; label: string; bg: string; text: string }> = {
  aucun: { icon: "—", label: "Aucun", bg: "bg-white/5", text: "text-white/20" },
  lecture: { icon: "👁", label: "Lecture", bg: "bg-sky-500/15", text: "text-sky-400" },
  ecriture: { icon: "✏️", label: "Écriture", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  gestion: { icon: "⚙️", label: "Gestion", bg: "bg-amber-500/15", text: "text-amber-400" },
  admin: { icon: "🔑", label: "Admin", bg: "bg-violet-500/15", text: "text-violet-400" },
};

function nextAccessLevel(current: AccessLevelType): AccessLevelType {
  const idx = ACCESS_LEVELS.indexOf(current);
  return ACCESS_LEVELS[(idx + 1) % ACCESS_LEVELS.length];
}

function MatriceAccesPanel({ orgId }: { orgId: any }) {
  // Org units & business roles (real columns)
  const orgUnits = useQuery(api.orgUnits.list, { organizationId: orgId });
  const businessRoles = useQuery(api.businessRoles.list, { organizationId: orgId });

  // Filing structures + cells
  const { activeStructure } = useFilingStructures(orgId);
  const { tree: filingTree } = useFilingCells(activeStructure?._id);

  // Flatten filing tree to { id, label, depth }
  const flatCells = React.useMemo(() => {
    const results: { id: string; label: string; depth: number }[] = [];
    const walk = (nodes: any[], prefix = "", depth = 0) => {
      for (const n of nodes) {
        const label = prefix ? `${prefix} / ${n.intitule || n.code}` : (n.intitule || n.code);
        results.push({ id: n._id, label, depth });
        if (n.children && n.children.length > 0) walk(n.children, label, depth + 1);
      }
    };
    if (filingTree && filingTree.length > 0) walk(filingTree as any[]);
    return results;
  }, [filingTree]);

  // Build column headers: OrgUnit × BusinessRole (scoped by unit type)
  const columns = React.useMemo(() => {
    const cols: { key: string; unitId?: string; roleId?: string; label: string; subLabel?: string }[] = [];
    const units = orgUnits ?? [];
    const roles = businessRoles ?? [];

    if (units.length > 0 && roles.length > 0) {
      for (const unit of units) {
        const unitType = (unit as any).type;
        const matchingRoles = roles.filter(
          (role: any) => role.orgUnitType === unitType || !role.orgUnitType
        );
        for (const role of matchingRoles) {
          cols.push({
            key: `${unit._id}__${role._id}`,
            unitId: unit._id,
            roleId: role._id,
            label: (role as any).nom,
            subLabel: (unit as any).nom,
          });
        }
      }
    } else if (roles.length > 0) {
      for (const role of roles) {
        cols.push({ key: `__${role._id}`, roleId: role._id, label: (role as any).nom });
      }
    } else if (units.length > 0) {
      for (const unit of units) {
        cols.push({ key: `${unit._id}__`, unitId: unit._id, label: (unit as any).nom });
      }
    }
    return cols;
  }, [orgUnits, businessRoles]);

  // ─── Convex persistence (cell_access_rules) ───
  const accessRules = useQuery(api.cellAccessRules.listByOrg, { organizationId: orgId });
  const bulkUpsertMutation = useMutation(api.cellAccessRules.bulkUpsert);

  // ─── Server state snapshot (readonly reference) ───
  const serverMap = React.useMemo(() => {
    const map: Record<string, { acces: AccessLevelType; ruleId?: string }> = {};
    if (accessRules) {
      for (const r of accessRules) {
        if (!r.estActif) continue;
        const key = `${r.filingCellId}__${r.orgUnitId ?? ""}__${r.businessRoleId ?? ""}`;
        map[key] = { acces: r.acces as AccessLevelType, ruleId: r._id };
      }
    }
    return map;
  }, [accessRules]);

  // ─── Local state (editable copy) ───
  const [localMap, setLocalMap] = React.useState<Record<string, AccessLevelType>>({});
  const [saving, setSaving] = React.useState(false);

  // Sync local state from server rules whenever accessRules changes
  // Use a ref to track what we last synced from, so we only overwrite
  // localMap when server data actually changes (not on every render).
  const lastSyncedRulesRef = React.useRef<typeof accessRules>(undefined);

  React.useEffect(() => {
    if (accessRules && accessRules !== lastSyncedRulesRef.current) {
      lastSyncedRulesRef.current = accessRules;
      const init: Record<string, AccessLevelType> = {};
      for (const [key, val] of Object.entries(serverMap)) {
        init[key] = val.acces;
      }
      setLocalMap(init);
    }
  }, [accessRules, serverMap]);

  // ─── Dirty tracking ───
  const dirtyKeys = React.useMemo(() => {
    const dirty = new Set<string>();
    // Check modified or added
    for (const [key, localAccess] of Object.entries(localMap)) {
      const serverAccess = serverMap[key]?.acces ?? "aucun";
      if (localAccess !== serverAccess) dirty.add(key);
    }
    // Check removed (was on server but now "aucun" or removed from local)
    for (const [key, val] of Object.entries(serverMap)) {
      const localAccess = localMap[key] ?? "aucun";
      if (localAccess !== val.acces) dirty.add(key);
    }
    return dirty;
  }, [localMap, serverMap]);

  const isDirty = dirtyKeys.size > 0;

  // ─── Helpers ───
  const makeKey = (cellId: string, unitId?: string, roleId?: string) =>
    `${cellId}__${unitId ?? ""}__${roleId ?? ""}`;

  const getAccess = (cellId: string, unitId?: string, roleId?: string): AccessLevelType => {
    return localMap[makeKey(cellId, unitId, roleId)] ?? "aucun";
  };

  // ─── Click: cycle access (local only) ───
  const handleCycleAccess = (cellId: string, unitId?: string, roleId?: string) => {
    const key = makeKey(cellId, unitId, roleId);
    const current = localMap[key] ?? "aucun";
    const next = nextAccessLevel(current);
    setLocalMap((prev) => {
      const copy = { ...prev };
      if (next === "aucun") {
        delete copy[key];
      } else {
        copy[key] = next;
      }
      return copy;
    });
  };

  // ─── Fill column: set all cells for one column to a level ───
  const handleFillColumn = (col: typeof columns[0], level: AccessLevelType) => {
    setLocalMap((prev) => {
      const copy = { ...prev };
      for (const cell of flatCells) {
        const key = makeKey(cell.id, col.unitId, col.roleId);
        if (level === "aucun") {
          delete copy[key];
        } else {
          copy[key] = level;
        }
      }
      return copy;
    });
  };

  // ─── Fill row: set all columns for one cell to a level ───
  const handleFillRow = (cellId: string, level: AccessLevelType) => {
    setLocalMap((prev) => {
      const copy = { ...prev };
      for (const col of columns) {
        const key = makeKey(cellId, col.unitId, col.roleId);
        if (level === "aucun") {
          delete copy[key];
        } else {
          copy[key] = level;
        }
      }
      return copy;
    });
  };

  // ─── Reset to server state ───
  const handleReset = () => {
    const init: Record<string, AccessLevelType> = {};
    for (const [key, val] of Object.entries(serverMap)) {
      init[key] = val.acces;
    }
    setLocalMap(init);
  };

  // ─── Save: compute diff → bulkUpsert ───
  const handleSave = async () => {
    setSaving(true);
    try {
      // Upserts: keys in local that differ from server
      const upserts: { filingCellId: any; orgUnitId?: any; businessRoleId?: any; acces: any }[] = [];
      const removals: any[] = [];

      for (const key of Array.from(dirtyKeys)) {
        const [cellId, unitId, roleId] = key.split("__");
        const localAccess = localMap[key] ?? "aucun";
        const serverEntry = serverMap[key];

        if (localAccess === "aucun" && serverEntry?.ruleId) {
          // Rule was on server, now removed
          removals.push(serverEntry.ruleId);
        } else if (localAccess !== "aucun") {
          // New or changed rule
          upserts.push({
            filingCellId: cellId,
            orgUnitId: unitId || undefined,
            businessRoleId: roleId || undefined,
            acces: localAccess,
          });
        }
      }

      await bulkUpsertMutation({
        organizationId: orgId,
        upserts,
        removals,
      });

      toast.success("Matrice sauvegardée", {
        description: `${upserts.length} règle(s) modifiée(s), ${removals.length} supprimée(s)`,
      });
    } catch (err: any) {
      console.error("Matrice save error:", err);
      toast.error("Erreur lors de la sauvegarde", {
        description: err?.message ?? "Erreur inconnue",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Access cell renderer ───
  const renderAccessCell = (cellId: string, col: typeof columns[0]) => {
    const key = makeKey(cellId, col.unitId, col.roleId);
    const level = localMap[key] ?? "aucun";
    const display = ACCESS_DISPLAY[level];
    const modified = dirtyKeys.has(key);
    return (
      <td key={col.key} className="py-1.5 px-2 text-center">
        <button
          onClick={() => handleCycleAccess(cellId, col.unitId, col.roleId)}
          className={`w-8 h-8 rounded-lg border transition-all hover:scale-105 hover:border-white/20 flex items-center justify-center mx-auto ${display.bg} ${modified ? "border-amber-400/60 ring-1 ring-amber-400/30" : "border-white/10"}`}
          title={`${display.label}${modified ? " (modifié)" : ""} — cliquez pour changer`}
        >
          <span className={`text-sm ${display.text}`}>{display.icon}</span>
        </button>
      </td>
    );
  };

  const hasData = columns.length > 0 && flatCells.length > 0;
  const hasUnits = (orgUnits ?? []).length > 0;
  const hasRoles = (businessRoles ?? []).length > 0;

  // ─── Fill menu state ───
  const [fillMenu, setFillMenu] = React.useState<{
    type: "col" | "row";
    col?: typeof columns[0];
    cellId?: string;
    x: number;
    y: number;
  } | null>(null);

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold">Matrice d&apos;Accès</span>
          {isDirty && (
            <Badge variant="secondary" className="text-[9px] bg-amber-500/15 text-amber-400 border-0 animate-pulse">
              {dirtyKeys.size} modification{dirtyKeys.size > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-white/50 hover:text-white/70"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-7 text-[10px] bg-gradient-to-r from-emerald-600 to-green-500 text-white border-0 hover:opacity-90 gap-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Sauvegarder
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
        {ACCESS_LEVELS.map((level) => {
          const d = ACCESS_DISPLAY[level];
          return (
            <div key={level} className="flex items-center gap-1">
              <span className={`inline-block w-4 h-4 rounded text-center leading-4 text-[10px] ${d.bg} ${d.text}`}>{d.icon}</span>
              <span>{d.label}</span>
            </div>
          );
        })}
      </div>

      {(!hasUnits || !hasRoles) && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-300">
            💡 {!hasUnits && !hasRoles
              ? "Configurez d'abord les unités organisationnelles et les rôles métier dans l'onglet Structure Org."
              : !hasUnits
                ? "Ajoutez des unités organisationnelles dans l'onglet Structure Org → Organigramme."
                : "Définissez des rôles métier dans l'onglet Structure Org → Rôles Métier."}
          </p>
        </div>
      )}

      {flatCells.length === 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-300">
            💡 Configurez d&apos;abord l&apos;Arborescence de classement pour définir les cellules d&apos;accès.
          </p>
        </div>
      )}

      {hasData && (
        <>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                {/* Sub-labels row (unit names) */}
                {columns.some((c) => c.subLabel) && (
                  <tr className="border-b border-white/5">
                    <th className="text-left py-1.5 px-3 font-medium text-white/30 min-w-[200px]" />
                    {columns.map((col) => (
                      <th key={`sub-${col.key}`} className="py-1.5 px-2 font-normal text-[9px] text-white/30 text-center">
                        {col.subLabel}
                      </th>
                    ))}
                  </tr>
                )}
                {/* Main labels row (role names) — click for fill column */}
                <tr className="border-b border-white/5">
                  <th className="text-left py-2.5 px-3 font-medium text-white/50 min-w-[200px]">Cellule / Rôle</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="py-2.5 px-2 font-medium text-white/50 text-center min-w-[60px] text-[10px] cursor-pointer hover:text-blue-400 transition-colors"
                      title="Clic droit : remplir la colonne"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setFillMenu({ type: "col", col, x: e.clientX, y: e.clientY });
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatCells.map((cell) => (
                  <tr key={cell.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td
                      className="py-1.5 px-3 text-white/70 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                      style={{ paddingLeft: 12 + cell.depth * 16 }}
                      title="Clic droit : remplir la ligne"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setFillMenu({ type: "row", cellId: cell.id, x: e.clientX, y: e.clientY });
                      }}
                    >
                      {cell.depth > 0 && <span className="text-white/20 mr-1">└</span>}
                      {cell.label.split(" / ").pop()}
                    </td>
                    {columns.map((col) => renderAccessCell(cell.id, col))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Cliquez sur une cellule pour cycler le niveau d&apos;accès · Clic droit sur un en-tête pour remplir
          </p>
        </>
      )}

      {/* ─── Fill Context Menu ─── */}
      {fillMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setFillMenu(null)} />
          {/* Menu */}
          <div
            className="fixed z-50 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl py-1 min-w-[160px]"
            style={{ left: fillMenu.x, top: fillMenu.y }}
          >
            <p className="text-[9px] text-white/30 px-3 py-1 uppercase tracking-wider">
              Remplir {fillMenu.type === "col" ? "la colonne" : "la ligne"}
            </p>
            {ACCESS_LEVELS.map((level) => {
              const d = ACCESS_DISPLAY[level];
              return (
                <button
                  key={level}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 transition-colors flex items-center gap-2"
                  onClick={() => {
                    if (fillMenu.type === "col" && fillMenu.col) {
                      handleFillColumn(fillMenu.col, level);
                    } else if (fillMenu.type === "row" && fillMenu.cellId) {
                      handleFillRow(fillMenu.cellId, level);
                    }
                    setFillMenu(null);
                  }}
                >
                  <span className={`inline-block w-4 h-4 rounded text-center leading-4 text-[10px] ${d.bg} ${d.text}`}>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ─── Sub-tab C: Habilitations Individuelles (v2) ── */

function HabilitationsPanel({ orgId }: { orgId: any }) {
  const members = useQuery(api.orgMembers.list, { organizationId: orgId });

  // Filing structures + cells for the access dropdown
  const { activeStructure } = useFilingStructures(orgId);
  const { tree: filingTree } = useFilingCells(activeStructure?._id);

  // Flatten the filing tree into a list of selectable cells
  const flatCells = React.useMemo(() => {
    const results: { id: string; label: string }[] = [];
    const walk = (nodes: any[], prefix = "") => {
      for (const n of nodes) {
        const label = prefix ? `${prefix} / ${n.intitule || n.code}` : (n.intitule || n.code);
        results.push({ id: n._id, label });
        if (n.children && n.children.length > 0) walk(n.children, label);
      }
    };
    if (filingTree && filingTree.length > 0) walk(filingTree as any[]);
    return results;
  }, [filingTree]);

  // ─── Convex persistence (cell_access_overrides) ───
  const overrides = useQuery(api.cellAccessOverrides.listByOrg, { organizationId: orgId });
  const createOverride = useMutation(api.cellAccessOverrides.createOverride);
  const removeOverride = useMutation(api.cellAccessOverrides.removeOverride);

  const [showForm, setShowForm] = useState(false);
  const [formMember, setFormMember] = useState("");
  const [formCell, setFormCell] = useState("");
  const [formAccess, setFormAccess] = useState<"lecture" | "ecriture" | "gestion" | "admin" | "aucun">("lecture");
  const [formMotif, setFormMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasMembers = members && members.length > 0;
  const hasCells = flatCells.length > 0;

  const handleAdd = async () => {
    if (!formMember || !formCell) {
      toast.error("Membre et cellule d'accès sont requis");
      return;
    }
    const member = (members as any[])?.find((m: any) => m._id === formMember);
    setSubmitting(true);
    try {
      await createOverride({
        organizationId: orgId,
        filingCellId: formCell as any,
        userId: member?.userId ?? formMember,
        acces: formAccess,
        motif: formMotif || undefined,
        accordePar: "admin", // TODO: use actual current user
      });
      setFormMember("");
      setFormCell("");
      setFormAccess("lecture");
      setFormMotif("");
      setShowForm(false);
      toast.success("Habilitation enregistrée");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: any) => {
    try {
      await removeOverride({ id });
      toast.success("Habilitation désactivée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Build cell label lookup
  const cellLabels = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of flatCells) map[c.id] = c.label;
    return map;
  }, [flatCells]);

  // Build member name lookup
  const memberNames = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (members) {
      for (const m of members as any[]) {
        if (m.userId) map[m.userId] = m.nom ?? m.email ?? "?";
      }
    }
    return map;
  }, [members]);

  const activeOverrides = (overrides ?? []).filter((o: any) => o.estActif);

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">Habilitations Individuelles</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
          {ACCESS_LEVELS.filter((l) => l !== "aucun").map((level) => {
            const d = ACCESS_DISPLAY[level];
            return (
              <div key={level} className="flex items-center gap-1">
                <span className={`inline-block w-4 h-4 rounded text-center leading-4 text-[10px] ${d.bg} ${d.text}`}>{d.icon}</span>
                <span>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {!hasMembers && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-300">
            💡 Ajoutez d&apos;abord du personnel dans l&apos;onglet Structure Org → Personnel pour pouvoir créer des habilitations.
          </p>
        </div>
      )}

      {hasMembers && !hasCells && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-300">
            💡 Configurez d&apos;abord l&apos;Arborescence de classement (onglet précédent) pour définir les cellules d&apos;accès.
          </p>
        </div>
      )}

      {hasMembers && hasCells && (
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-amber-600 to-orange-500 text-xs hover:opacity-90"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une habilitation
        </Button>
      )}

      {showForm && hasMembers && hasCells && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium text-white/60">Nouvelle habilitation individuelle</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={formMember}
              onChange={(e) => setFormMember(e.target.value)}
              className="h-9 text-xs bg-white/[0.03] border border-white/10 rounded-md px-2 text-white/70"
            >
              <option value="">Sélectionner un membre…</option>
              {(members as any[]).map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.nom ?? "Sans nom"}
                </option>
              ))}
            </select>
            <select
              value={formCell}
              onChange={(e) => setFormCell(e.target.value)}
              className="h-9 text-xs bg-white/[0.03] border border-white/10 rounded-md px-2 text-white/70"
            >
              <option value="">Sélectionner une cellule…</option>
              {flatCells.map((cell) => (
                <option key={cell.id} value={cell.id}>
                  {cell.label}
                </option>
              ))}
            </select>
            <select
              value={formAccess}
              onChange={(e) => setFormAccess(e.target.value as any)}
              className="h-9 text-xs bg-white/[0.03] border border-white/10 rounded-md px-2 text-white/70"
            >
              <option value="aucun">🚫 Aucun accès</option>
              <option value="lecture">👁 Lecture seule</option>
              <option value="ecriture">✏️ Écriture</option>
              <option value="gestion">⚙️ Gestion</option>
              <option value="admin">🔑 Admin</option>
            </select>
            <Input
              value={formMotif}
              onChange={(e) => setFormMotif(e.target.value)}
              placeholder="Motif (optionnel)"
              className="h-9 text-xs bg-white/[0.03] border-white/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs bg-gradient-to-r from-amber-600 to-orange-500" onClick={handleAdd} disabled={submitting}>
              {submitting ? "Enregistrement…" : "Ajouter"}
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-white/40" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {activeOverrides.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="text-left py-2.5 px-3 font-medium">Collaborateur</th>
                <th className="text-left py-2.5 px-3 font-medium">Cellule</th>
                <th className="text-center py-2.5 px-3 font-medium">Accès</th>
                <th className="text-left py-2.5 px-3 font-medium">Motif</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {activeOverrides.map((o: any) => {
                const display = ACCESS_DISPLAY[o.acces as AccessLevelType] ?? ACCESS_DISPLAY.aucun;
                return (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white/90">
                      {memberNames[o.userId] ?? o.userId}
                    </td>
                    <td className="py-2.5 px-3 text-white/60">
                      {cellLabels[o.filingCellId] ?? o.filingCellId}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="secondary" className={`text-[9px] border-0 ${display.bg} ${display.text}`}>
                        {display.icon} {display.label}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-white/40 italic max-w-[150px] truncate">
                      {o.motif ?? "—"}
                    </td>
                    <td className="py-2.5 px-1">
                      <button
                        onClick={() => handleRemove(o._id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeOverrides.length === 0 && hasMembers && !showForm && (
        <div className="py-8 text-center">
          <Shield className="h-8 w-8 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune habilitation individuelle définie</p>
          <p className="text-[11px] text-muted-foreground mt-1">Les dérogations individuelles à la matrice d&apos;accès apparaîtront ici.</p>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ───────────────────────────── */

export default function ClassementTab({ orgId, orgType }: ClassementTabProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
      <Tabs defaultValue="arborescence" className="w-full">
        <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-lg h-auto">
          <TabsTrigger
            value="arborescence"
            className="text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white gap-1.5"
          >
            <FolderTree className="h-3.5 w-3.5" />
            Arborescence
          </TabsTrigger>
          <TabsTrigger
            value="matrice"
            className="text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white gap-1.5"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Matrice d&apos;Acces
          </TabsTrigger>
          <TabsTrigger
            value="habilitations"
            className="text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            Habilitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arborescence" className="mt-4">
          <ArborescencePanel orgId={orgId} orgType={orgType} />
        </TabsContent>

        <TabsContent value="matrice" className="mt-4">
          <MatriceAccesPanel orgId={orgId} />
        </TabsContent>

        <TabsContent value="habilitations" className="mt-4">
          <HabilitationsPanel orgId={orgId} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
