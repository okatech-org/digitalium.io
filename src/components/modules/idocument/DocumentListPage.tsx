"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Finder-Style Document Explorer
// 3 modes (grille/liste/colonnes) · DnD · Dossiers · Mes Documents par défaut
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect } from "react";
import AIProgressIndicator from "@/components/shared/AIProgressIndicator";
import type { AIProgressFileStatus } from "@/components/shared/AIProgressIndicator";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/hooks/useAuth";
import { useFilingStructures, useUserFilingAccess, useAccessRules } from "@/hooks/useFilingAccess";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Plus,
    Edit3, Archive, Trash2, CheckSquare, Clock, Eye, RotateCcw,
    Tag, X, Sparkles, PenTool, FolderPlus,
    FolderOpen, Folder, FolderTree, Lock, Upload, FileUp, Brain,
    Loader2, Check, FileSpreadsheet, Image as ImageIcon,
    FolderUp, Wand2, ArrowRight, CheckCircle2, Send,
    Shield, Building2, Tags, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
// Avatar imports removed — unused
// DropdownMenu imports removed — unused, handled by FolderDocumentContextMenu
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// File-manager Finder components
import {
    ViewModeToggle,
    getInitialViewMode,
    BreadcrumbPath,
    FinderGridView,
    FinderListView,
    FinderColumnView,
} from "@/components/modules/file-manager";
import { ShareDialog } from "./ShareDialog";
import { ManageAccessDialog } from "./ManageAccessDialog";
import type {
    ViewMode,
    FileManagerFolder,
    FileManagerFile,
    DragMoveEvent,
    ListColumn,
} from "@/components/modules/file-manager";
import { useMultiSelection } from "@/components/modules/file-manager/useMultiSelection";
import FolderDocumentContextMenu, {
    type ArchivePolicyData,
    type ArchiveCategoryOption,
} from "./FolderDocumentContextMenu";
import { VaultFolderCard } from "@/components/ui/vault/VaultFolderCard";
import { VaultFileCard } from "@/components/ui/vault/VaultFileCard";
import { getCategoryConfigFromFolder } from "@/components/ui/vault/category-config";

// ─── Types ──────────────────────────────────────────────────────

type DocStatus = "draft" | "review" | "approved" | "archived" | "trashed";
type ImportStep = "select" | "analyzing" | "review" | "done";
type ReorgStep = "mode" | "analyzing" | "preview" | "executing" | "done";
type ReorgMode = "classify" | "reorganize" | "deep_audit";

interface ReorgMoveRecommendations {
    suggestedTags?: string[];
    suggestedDocTypeCode?: string;
    suggestedRetentionSlug?: string;
    suggestedConfidentiality?: string;
    suggestedFolderVisibility?: string;
    retentionReasoning?: string;
}

interface ReorgMove {
    docId: string;
    docTitle: string;
    currentFolderId: string | null;
    currentFolderName: string | null;
    targetFolderId: string;
    targetFolderPath: string;
    newFoldersToCreate: string[];
    parentFolderIdForNew: string | null;
    shouldMove: boolean;
    selected: boolean; // user can toggle
    reasoning: string;
    confidence: number;
    recommendations?: ReorgMoveRecommendations;
}

interface ReorgFolderRecommendation {
    folderId: string;
    suggestedRetentionSlug?: string;
    suggestedConfidentiality?: string;
    suggestedVisibility?: string;
    suggestedTags?: string[];
    reasoning?: string;
}

interface ReorgOrganizationAnalysis {
    detectedSector?: string;
    detectedClients?: string[];
    detectedProjects?: string[];
    keyInsights?: string;
}

interface ReorgPlan {
    moves: ReorgMove[];
    summary: string;
    organizationAnalysis?: ReorgOrganizationAnalysis;
    folderRecommendations?: ReorgFolderRecommendation[];
    stats: {
        totalDocuments: number;
        documentsToMove: number;
        documentsAlreadyCorrect: number;
        newFoldersToCreate: number;
        tagsToApply?: number;
        retentionToSet?: number;
        confidentialityToSet?: number;
    };
}

interface DocItem {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    authorInitials: string;
    updatedAt: string;
    updatedAtTs: number;
    status: DocStatus;
    tags: string[];
    version: number;
    folderId: string;
    archiveCategorySlug?: string;
    archiveCategoryId?: string;
}

interface ImportFileItem {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    suggestedTags: string[];
    suggestedFolderId: string;
    suggestedFolderName: string;
    suggestedPath: string;
    newFoldersToCreate: string[];
    parentFolderIdForNew: string | null;
    reasoning: string;
    confidence: number;
    analyzed: boolean;
}

// ─── Status config ──────────────────────────────────────────────

const STATUS_CFG: Record<DocStatus, { label: string; icon: React.ElementType; class: string; dot: string }> = {
    draft: { label: "Brouillon", icon: PenTool, class: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-400" },
    review: { label: "En révision", icon: Eye, class: "bg-blue-500/15 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    approved: { label: "Approuvé", icon: CheckSquare, class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    archived: { label: "Archivé", icon: Archive, class: "bg-violet-500/15 text-violet-400 border-violet-500/20", dot: "bg-violet-400" },
    trashed: { label: "Corbeille", icon: Trash2, class: "bg-red-500/15 text-red-400 border-red-500/20", dot: "bg-red-400" },
};

const STATUS_FILTERS: { value: DocStatus | "all"; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "review", label: "En révision" },
    { value: "approved", label: "Approuvés" },
    { value: "archived", label: "Archivés" },
];

// ─── Default System Folders (toujours présents) ────────────────
// Brouillons = dossier virtuel contenant tous les documents avec status "draft"
// Le Coffre-fort est géré dans iArchive (schema: isVault, isPerpetual).

const DEFAULT_SYSTEM_FOLDERS: FileManagerFolder[] = [
    { id: "__brouillons", name: "Brouillons", parentFolderId: null, tags: [], fileCount: 0, updatedAt: "", createdBy: "Système", isSystem: true },
    { id: "__poubelle", name: "Poubelle", parentFolderId: null, tags: [], fileCount: 0, updatedAt: "", createdBy: "Système", isSystem: true },
];

// ─── (Demo data removed — documents now fetched from Convex) ──────

// ─── AI Classification (via Gemini — folder-aware) ──────────────
// Hardcoded AI_RULES have been removed. Classification is now
// handled by aiSmartImport.classifyDocuments (Convex action)
// which receives the full folder hierarchy as context.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ACCEPTED_DOC_TYPES = [
    // Documents
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // .xlsx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "text/plain",       // .txt
    "text/csv",          // .csv
    // Images
    "image/jpeg",        // .jpg
    "image/png",         // .png
    "image/svg+xml",     // .svg
    "image/webp",        // .webp
    "image/gif",         // .gif
    // Vidéo
    "video/mp4",         // .mp4
    "video/webm",        // .webm
    "video/quicktime",   // .mov
    "video/x-msvideo",   // .avi
];
const ACCEPTED_EXTENSIONS = ".pdf,.docx,.xlsx,.pptx,.txt,.csv,.jpg,.jpeg,.png,.svg,.webp,.gif,.mp4,.webm,.mov,.avi";
const MAX_IMPORT_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 2000 * 1024 * 1024; // 2 Go for videos

function getImportFileIcon(type: string) {
    if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-400" />;
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv")) return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
    if (type.includes("image")) return <ImageIcon className="h-4 w-4 text-blue-400" />;
    if (type.includes("video")) return <FileText className="h-4 w-4 text-purple-400" />;
    if (type.includes("presentation") || type.includes("pptx")) return <FileText className="h-4 w-4 text-orange-400" />;
    if (type.includes("word") || type.includes("document")) return <FileText className="h-4 w-4 text-blue-400" />;
    return <FileText className="h-4 w-4 text-zinc-400" />;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

// ─── Helper: convert DocItem → FileManagerFile ──────────────────

function docToFile(doc: DocItem): FileManagerFile {
    return {
        id: doc.id,
        name: doc.title,
        type: "document",
        size: `v${doc.version}`,
        date: doc.updatedAt,
        folderId: doc.folderId,
        metadata: {
            excerpt: doc.excerpt,
            author: doc.author,
            authorInitials: doc.authorInitials,
            status: doc.status,
            tags: doc.tags,
            version: doc.version,
            updatedAtTs: doc.updatedAtTs,
            archiveCategorySlug: doc.archiveCategorySlug,
            archiveCategoryId: doc.archiveCategoryId,
        },
    };
}

// ─── List columns definition ───────────────────────────────────

const DOC_COLUMNS: ListColumn[] = [
    { key: "name", label: "Nom", sortable: true, width: "40%" },
    {
        key: "author", label: "Auteur", sortable: true, width: "15%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            if (meta?.author) {
                return (
                    <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-violet-500/15 flex items-center justify-center">
                            <span className="text-[10px] text-violet-300 font-bold">{meta.authorInitials as string}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{meta.author as string}</span>
                    </div>
                );
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
    {
        key: "date", label: "Modifié", sortable: true, width: "12%",
        render: (item) => (
            <span className="text-muted-foreground text-xs flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {"date" in item ? item.date : (item as FileManagerFolder).updatedAt}
            </span>
        ),
    },
    {
        key: "status", label: "Statut", sortable: true, width: "12%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            const status = meta?.status as DocStatus | undefined;
            if (status && STATUS_CFG[status]) {
                const st = STATUS_CFG[status] ?? STATUS_CFG.draft;
                return (
                    <Badge className={`text-[10px] h-5 border ${st.class}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1`} />
                        {st.label}
                    </Badge>
                );
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
    {
        key: "tags", label: "Tags", width: "15%",
        render: (item) => {
            const tags = (item.metadata as Record<string, unknown>)?.tags as string[] | undefined;
            if (!tags?.length) {
                const folderTags = "tags" in item ? (item as FileManagerFolder).tags : [];
                if (folderTags?.length) {
                    return (
                        <div className="flex gap-1 flex-wrap">
                            {folderTags.slice(0, 2).map((t: string) => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">{t}</span>
                            ))}
                        </div>
                    );
                }
                return <span className="text-muted-foreground">—</span>;
            }
            return (
                <div className="flex gap-1 flex-wrap">
                    {tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">{t}</span>
                    ))}
                    {tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{tags.length - 2}</span>}
                </div>
            );
        },
    },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DocumentListPage({ basePath = "/pro/idocument" }: { basePath?: string }) {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orgId: _orgId } = useOrganization();
    const { user, isAdmin, level } = useAuth();
    // ⚙️Gestion (level ≤ 3) et 🔑Admin = peuvent modifier/gérer/déplacer
    const canManage = isAdmin || (typeof level === "number" && level <= 3);

    // ─── Convex: fetch filing structure ─────────────────────────
    // Resolve the org display name to a real Convex document ID
    const { convexOrgId } = useConvexOrgId();
    const { activeStructure } = useFilingStructures(convexOrgId);

    // Instead of raw cells, we now fetch actual folders that are synced from cells
    const convexFolders = useQuery(api.folders.listByOrg, convexOrgId ? { organizationId: convexOrgId } : "skip");
    const classifyDocumentsAction = useAction(api.aiSmartImport.classifyDocuments);
    const reorganizeDocumentsAction = useAction(api.aiSmartImport.reorganizeDocuments);
    const deepReorganizeAction = useAction(api.aiSmartImport.deepReorganize);
    const autoTagDocumentAction = useAction(api.aiAutoTag.autoTagDocument);
    const autoTagFolderAction = useAction(api.aiAutoTag.autoTagFolder);
    const createFolderMut = useMutation(api.folders.create);
    const batchMoveToFolderMut = useMutation(api.documents.batchMoveToFolder);
    const batchApplyAIMut = useMutation(api.documents.batchApplyAIRecommendations);
    const convexOrgDoc = useQuery(api.organizations.getById, convexOrgId ? { id: convexOrgId } : "skip");
    const syncFoldersMut = useMutation(api.filingCells.syncFoldersFromCells);
    const cleanupEmptyFoldersMut = useMutation(api.folders.cleanupEmptyFolders);
    const syncFromFoldersMut = useMutation(api.filingCells.syncFromFolders);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setRule: _setRule } = useAccessRules(convexOrgId);

    // ─── Convex: import mutations ────────────────────────────────
    const generateUploadUrlMut = useMutation(api.documents.generateUploadUrl);
    const createFromImportMut = useMutation(api.documents.createFromImport);
    const getOrCreateFolderMut = useMutation(api.folders.getOrCreateByName);
    const removeDocMut = useMutation(api.documents.remove);

    // ─── Convex: fetch existing documents ────────────────────────
    const convexDocuments = useQuery(
        api.documents.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // ─── Convex: fetch trashed documents & folders (for Poubelle) ─
    const convexTrashedDocs = useQuery(
        api.documents.listTrashed,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const convexTrashedFolders = useQuery(
        api.folders.listTrashed,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const restoreDocMut = useMutation(api.documents.restore);
    const permanentDeleteDocMut = useMutation(api.documents.permanentDelete);
    const restoreFolderMut = useMutation(api.folders.restore);
    const permanentDeleteFolderMut = useMutation(api.folders.permanentDelete);

    // ─── Convex: archive categories + metadata ───────────────────
    const archiveCategories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const setFolderArchiveMetaMut = useMutation(api.folderArchiveMetadata.setMetadata);
    const setDocArchivePolicyMut = useMutation(api.documents.setArchivePolicy);
    const folderArchiveMetas = useQuery(
        api.folderArchiveMetadata.listByOrg,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const updateFolderMut = useMutation(api.folders.update);
    const updateDocumentMut = useMutation(api.documents.update);
    const removeFolderMut = useMutation(api.folders.remove);

    // ── Document Types + Metadata (v7) ──
    const documentTypes = useQuery(api.documentTypes.list, convexOrgId ? { organizationId: convexOrgId } : "skip");
    const metadataFields = useQuery(api.documentMetadataFields.list, convexOrgId ? { organizationId: convexOrgId } : "skip");
    const createDocMut = useMutation(api.documents.create);

    // Map archive categories to the shape expected by the context menu
    const categoryOptions: ArchiveCategoryOption[] = useMemo(() => {
        if (!archiveCategories) return [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return archiveCategories.map((c: any) => ({
            _id: c._id,
            name: c.name,
            slug: c.slug,
            color: c.color ?? "violet",
            icon: c.icon ?? "Archive",
            retentionYears: c.retentionYears ?? 5,
            description: c.description,
            isPerpetual: c.isPerpetual,
        }));
    }, [archiveCategories]);

    // ─── Auto-sync: backfill folders from filing_cells if missing ─
    const syncAttemptedRef = React.useRef(false);
    React.useEffect(() => {
        if (syncAttemptedRef.current) return;
        if (!convexOrgId || !activeStructure) return;
        if (convexFolders === undefined) return; // still loading
        // If we have a structure but no synced folders, trigger backfill
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasSyncedFolders = convexFolders.some((f: any) => f.filingCellId);
        if (!hasSyncedFolders) {
            syncAttemptedRef.current = true;
            syncFoldersMut({ organizationId: convexOrgId })
                .then((r) => {
                    if (r.synced > 0) {
                        console.log(`[iDocument] Auto-synced ${r.synced} folders from filing cells`);
                    }
                })
                .catch((err) => console.error("[iDocument] Folder sync error:", err));
        }
    }, [convexOrgId, activeStructure, convexFolders, syncFoldersMut]);

    // ─── Résolution d'accès utilisateur ─────────────────────────
    // NOTE: organization_members stores email as userId, not Firebase UID
    const { visibleCellIds, isLoading: accessLoading } = useUserFilingAccess(
        user?.email, convexOrgId
    );

    // ─── Map convex folders → FileManagerFolder (filtré par accès) ─
    const dynamicFolders = useMemo<FileManagerFolder[]>(() => {
        if (!convexFolders || convexFolders.length === 0) return [];

        return convexFolders
            // Strict access: if it's a system folder (synced from filing_cells), check access matrix
            // Admin bypass: admins (level ≤ 2) see all org folders
            // Loading fallback: while access is resolving, show all folders
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((f: any) => {
                if (isAdmin) return true;
                if (accessLoading) return true;
                if (f.isSystem && f.filingCellId) {
                    return visibleCellIds.includes(f.filingCellId);
                }
                return true; // regular user folders
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((f: any) => {
                const archiveMeta = folderArchiveMetas?.find((m) => m.folderId === f._id);
                return {
                    id: f._id,
                    name: f.name,
                    description: f.description,
                    parentFolderId: f.parentFolderId ?? null,
                    tags: f.tags ?? [],
                    fileCount: f.fileCount ?? 0,
                    updatedAt: new Date(f.updatedAt).toLocaleDateString("fr-FR"),
                    createdBy: f.createdBy === "system" ? "Système" : f.createdBy,
                    isSystem: false,
                    metadata: {
                        filingCellId: f.filingCellId,
                        isArborescence: !!f.filingCellId,
                        archiveCategoryId: archiveMeta?.archiveCategoryId ?? undefined,
                        createdAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString("fr-FR") : undefined,
                    },
                };
            });
    }, [convexFolders, visibleCellIds, isAdmin, accessLoading, folderArchiveMetas]);

    // ─── Merge: system folders + dynamic filing cells ───────────
    // No useEffect-based sync — compute directly to avoid loops
    const baseFolders = useMemo<FileManagerFolder[]>(
        () => [...DEFAULT_SYSTEM_FOLDERS, ...dynamicFolders],
        [dynamicFolders]
    );

    // ─── State ──────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<ViewMode>(() => getInitialViewMode("digitalium-idocument-view", "grid"));
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [subfolderParentId, setSubfolderParentId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all");
    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [documents, setDocuments] = useState<DocItem[]>([]);
    const [localFolders, setLocalFolders] = useState<FileManagerFolder[]>([]);

    // ─── Sync Convex documents into local state ──────────────
    useEffect(() => {
        if (!convexDocuments) return;
        const convexDocItems: DocItem[] = convexDocuments.map((d) => ({
            id: d._id,
            title: d.title,
            excerpt: d.excerpt ?? "",
            author: d.createdBy,
            authorInitials: d.createdBy.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
            updatedAt: new Date(d.updatedAt).toLocaleDateString("fr-FR"),
            updatedAtTs: d.updatedAt,
            status: d.status as DocStatus,
            tags: d.tags,
            version: d.version,
            folderId: (d.folderId ?? d.parentFolderId ?? "") as string,
            archiveCategorySlug: (d as any).archiveCategorySlug ?? undefined,
            archiveCategoryId: (d as any).archiveCategoryId ?? undefined,
        }));
        // Merge: Convex docs + any locally-added docs not yet in Convex
        setDocuments((prev) => {
            const convexIds = new Set(convexDocItems.map((d) => d.id));
            const localOnly = prev.filter((d) => !convexIds.has(d.id) && !d.id.startsWith("doc-"));
            return [...convexDocItems, ...localOnly];
        });
    }, [convexDocuments]);

    // Computed folders: base from Convex + locally created ones
    const folders = useMemo<FileManagerFolder[]>(
        () => [...baseFolders, ...localFolders],
        [baseFolders, localFolders]
    );
    const [showNewDocDialog, setShowNewDocDialog] = useState(false);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showTagDialog, setShowTagDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [manageAccessTargetId, setManageAccessTargetId] = useState<string | null>(null);
    const [showManageAccessDialog, setShowManageAccessDialog] = useState(false);
    const [shareTarget, setShareTarget] = useState<{ id: string; type: "folder" | "document" } | null>(null);

    // ─── Deferred: AI folder tree (only fetched when import dialog is open) ──
    const folderTreeWithPaths = useQuery(
        api.folders.getTreeWithPaths,
        showImportDialog && convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const [tagEditDocId, setTagEditDocId] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [newDocTitle, setNewDocTitle] = useState("");
    const [newDocTypeId, setNewDocTypeId] = useState<string>("");
    const [newDocFolderId, setNewDocFolderId] = useState<string>("");
    const [newDocMetadata, setNewDocMetadata] = useState<Record<string, string>>({});
    const [newFolderName, setNewFolderName] = useState("");
    const [importFiles, setImportFiles] = useState<ImportFileItem[]>([]);
    const [importStep, setImportStep] = useState<ImportStep>("select");
    const [isDragOver, setIsDragOver] = useState(false);

    // ─── Trashed folder navigation (Poubelle) ─────────────────────
    // Quand on navigue dans un dossier supprimé dans la Poubelle
    const [trashedFolderNav, setTrashedFolderNav] = useState<{
        folderId: string;
        folderName: string;
    } | null>(null);

    // ─── Approval reclassification dialog ────────────────────────
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalDocId, setApprovalDocId] = useState<string | null>(null);
    const [approvalTargetFolderId, setApprovalTargetFolderId] = useState<string>("");

    // ─── Reorganization state ────────────────────────────────────
    const [showReorgDialog, setShowReorgDialog] = useState(false);
    const [reorgStep, setReorgStep] = useState<ReorgStep>("mode");
    const [reorgMode, setReorgMode] = useState<ReorgMode>("classify");
    const [reorgPlan, setReorgPlan] = useState<ReorgPlan | null>(null);
    const [reorgLoading, setReorgLoading] = useState(false);
    const [reorgProgress, setReorgProgress] = useState(0);
    const [reorgResult, setReorgResult] = useState<{
        moved: number; foldersCreated: number; tagged: number; typed: number; archived: number;
        foldersCleanedUp: number; cellsCreated: number; cellsRemoved: number;
    } | null>(null);

    // Deferred: AI folder tree for reorganization
    const folderTreeForReorg = useQuery(
        api.folders.getTreeWithPaths,
        showReorgDialog && convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // ─── Tag Suggestions by archive category ────────────────────
    const TAG_SUGGESTIONS: Record<string, string[]> = {
        fiscal: ["Bilan", "Déclaration", "TVA", "Impôt", "Comptabilité", "Facture"],
        social: ["Contrat", "RH", "Paie", "Convention", "Stage", "Formation"],
        legal: ["PV", "Délibération", "Statuts", "Juridique", "Conformité"],
        client: ["Devis", "Proposition", "Commande", "Livraison", "Commercial"],
        general: ["Rapport", "Note", "Stratégie", "Direction", "Technique", "Cloud", "Audit"],
    };

    const tagEditDoc = useMemo(() => documents.find((d) => d.id === tagEditDocId), [documents, tagEditDocId]);

    const tagSuggestions = useMemo(() => {
        if (!tagEditDoc) return TAG_SUGGESTIONS.general;
        // Determine category from folder
        const folder = folders.find((f) => f.id === tagEditDoc.folderId);
        const slug = folder?.metadata?.code?.toString()?.toLowerCase() || "";
        return TAG_SUGGESTIONS[slug] || TAG_SUGGESTIONS.general;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagEditDoc, folders]);

    const handleOpenTagDialog = useCallback((docId: string) => {
        setTagEditDocId(docId);
        setTagInput("");
        setShowTagDialog(true);
    }, []);

    const handleAddTag = useCallback((tag: string) => {
        if (!tagEditDocId || !tag.trim()) return;
        setDocuments((prev) =>
            prev.map((d) =>
                d.id === tagEditDocId && !d.tags.includes(tag.trim())
                    ? { ...d, tags: [...d.tags, tag.trim()] }
                    : d
            )
        );
        setTagInput("");
    }, [tagEditDocId]);

    const handleRemoveTag = useCallback((tag: string) => {
        if (!tagEditDocId) return;
        setDocuments((prev) =>
            prev.map((d) =>
                d.id === tagEditDocId
                    ? { ...d, tags: d.tags.filter((t) => t !== tag) }
                    : d
            )
        );
    }, [tagEditDocId]);

    // ─── AI Auto-tag ─────────────────────────────────────────
    const [autoTaggingId, setAutoTaggingId] = useState<string | null>(null);
    const [autoTagResult, setAutoTagResult] = useState<{
        tags: string[];
        confidence: number;
        reasoning: string;
        forId: string;
    } | null>(null);

    const handleAutoTag = useCallback(async (id: string, itemType: "folder" | "document") => {
        setAutoTaggingId(id);
        setAutoTagResult(null);
        try {
            let result;
            if (itemType === "document") {
                result = await autoTagDocumentAction({
                    documentId: id as Id<"documents">,
                });
            } else {
                result = await autoTagFolderAction({
                    folderId: id as Id<"folders">,
                });
            }

            if (result.error) {
                toast.error(result.error);
                setAutoTaggingId(null);
                return;
            }

            if (result.tags.length === 0) {
                toast.info("L'IA n'a pas pu générer de tags pour cet élément");
                setAutoTaggingId(null);
                return;
            }

            // Stocker le résultat pour affichage dans le dialog
            setAutoTagResult({
                tags: result.tags,
                confidence: result.confidence,
                reasoning: result.reasoning,
                forId: id,
            });

            // Appliquer automatiquement les tags au document/dossier
            if (itemType === "document") {
                // Fusionner avec tags existants
                const existingDoc = convexDocuments?.find((d) => d._id === id);
                const existingTags = existingDoc?.tags || [];
                const mergedTags = Array.from(new Set([...existingTags, ...result.tags]));
                await updateDocumentMut({
                    id: id as Id<"documents">,
                    tags: mergedTags,
                });
            } else {
                // Pour les dossiers, utiliser updateFolderMut
                const existingFolder = convexFolders?.find((f) => f._id === id);
                const existingTags = existingFolder?.tags || [];
                const mergedTags = Array.from(new Set([...existingTags, ...result.tags]));
                await updateFolderMut({
                    id: id as Id<"folders">,
                    tags: mergedTags,
                });
            }

            toast.success(`${result.tags.length} tags générés par l'IA et appliqués`);
        } catch (err) {
            console.error("[AutoTag] Erreur:", err);
            toast.error("Erreur lors de l'auto-tagging IA");
        } finally {
            setAutoTaggingId(null);
        }
    }, [autoTagDocumentAction, autoTagFolderAction, convexDocuments, convexFolders, updateDocumentMut, updateFolderMut]);

    // ─── Breadcrumb path ────────────────────────────────────────
    const breadcrumbPath = useMemo(() => {
        // Si on navigue dans un dossier supprimé (Poubelle)
        if (trashedFolderNav && currentFolderId === "__poubelle") {
            return [
                { id: "__poubelle", name: "Poubelle" },
                { id: trashedFolderNav.folderId, name: trashedFolderNav.folderName },
            ];
        }
        if (!currentFolderId) return [];
        const path: { id: string; name: string }[] = [];
        let fId: string | null = currentFolderId;
        while (fId) {
            const folder = folders.find((f) => f.id === fId);
            if (folder) {
                path.unshift({ id: folder.id, name: folder.name });
                fId = folder.parentFolderId;
            } else {
                break;
            }
        }
        return path;
    }, [currentFolderId, folders, trashedFolderNav]);

    // ─── Current view: folders + files at current level ─────────
    const currentFolders = useMemo(() => {
        // Dans un dossier supprimé de la Poubelle → pas de sous-dossiers navigables
        if (trashedFolderNav && currentFolderId === "__poubelle") return [];
        return folders.filter((f) => f.parentFolderId === currentFolderId);
    }, [folders, currentFolderId, trashedFolderNav]);

    // ─── Trashed folders for Poubelle display (navigables) ─────
    const trashedFoldersForPoubelle = useMemo<FileManagerFolder[]>(() => {
        if (!convexTrashedFolders) return [];
        return convexTrashedFolders.map((f) => {
            // Compter les documents qui étaient dans ce dossier
            const docsInFolder = convexTrashedDocs?.filter((d) => d.folderId === f._id)?.length ?? 0;
            // Compter aussi les documents non-supprimés qui avaient ce folderId
            const activeDocs = documents.filter((d) => d.folderId === f._id).length;
            return {
                id: f._id,
                name: f.name,
                parentFolderId: "__poubelle" as string | null,
                tags: f.tags ?? [],
                fileCount: docsInFolder + activeDocs,
                updatedAt: new Date(f.updatedAt).toLocaleDateString("fr-FR"),
                createdBy: f.createdBy === "system" ? "Système" : f.createdBy,
                isSystem: false,
                metadata: {
                    isTrashedFolder: true,
                    trashedAt: f.updatedAt,
                },
            };
        });
    }, [convexTrashedFolders, convexTrashedDocs, documents]);

    const currentFiles = useMemo(() => {
        // POUBELLE — Navigation dans un dossier supprimé
        if (currentFolderId === "__poubelle" && trashedFolderNav) {
            const fId = trashedFolderNav.folderId;
            // Documents supprimés qui étaient dans ce dossier
            const trashedDocsInFolder: FileManagerFile[] = (convexTrashedDocs ?? [])
                .filter((d) => d.folderId === fId)
                .map((d) => ({
                    id: d._id,
                    name: d.title,
                    type: "document",
                    size: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : "—",
                    date: new Date(d.trashedAt ?? d.updatedAt).toLocaleDateString("fr-FR"),
                    folderId: fId,
                    metadata: {
                        status: "trashed" as DocStatus,
                        tags: d.tags ?? [],
                        authorInitials: d.createdBy?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "??",
                        author: d.createdBy ?? "Inconnu",
                        excerpt: d.excerpt ?? "",
                        trashedAt: d.trashedAt,
                        trashedBy: d.trashedBy,
                        previousStatus: d.previousStatus,
                        version: d.version ?? 1,
                        itemType: "document" as const,
                        archiveCategorySlug: (d as any).archiveCategorySlug,
                    },
                }));
            // Documents actifs qui avaient ce folderId (dossier supprimé mais docs pas encore supprimés)
            const activeDocsInFolder: FileManagerFile[] = documents
                .filter((d) => d.folderId === fId)
                .map((d) => ({
                    id: d.id,
                    name: d.title,
                    type: "document",
                    size: `v${d.version}`,
                    date: d.updatedAt,
                    folderId: fId,
                    metadata: {
                        status: d.status as DocStatus,
                        tags: d.tags,
                        authorInitials: d.authorInitials,
                        author: d.author,
                        excerpt: d.excerpt,
                        version: d.version,
                        itemType: "document" as const,
                        archiveCategorySlug: d.archiveCategorySlug,
                    },
                }));
            return [...trashedDocsInFolder, ...activeDocsInFolder];
        }

        // POUBELLE: show only trashed documents (folders are now navigable separately)
        if (currentFolderId === "__poubelle") {
            const trashedDocItems: FileManagerFile[] = (convexTrashedDocs ?? []).map((d) => ({
                id: d._id,
                name: d.title,
                type: "document",
                size: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : "—",
                date: new Date(d.trashedAt ?? d.updatedAt).toLocaleDateString("fr-FR"),
                folderId: "__poubelle",
                metadata: {
                    status: "trashed" as DocStatus,
                    tags: d.tags ?? [],
                    authorInitials: d.createdBy?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "??",
                    author: d.createdBy ?? "Inconnu",
                    excerpt: d.excerpt ?? "",
                    trashedAt: d.trashedAt,
                    trashedBy: d.trashedBy,
                    previousStatus: d.previousStatus,
                    version: d.version ?? 1,
                    itemType: "document" as const,
                    archiveCategorySlug: (d as any).archiveCategorySlug,
                },
            }));
            // Les dossiers supprimés ne sont plus mélangés comme FileManagerFile
            // Ils s'affichent comme de vrais dossiers navigables via foldersWithCounts
            return trashedDocItems;
        }

        // BROUILLONS: dossier virtuel contenant tous les documents draft
        if (currentFolderId === "__brouillons") {
            const draftDocs = documents.filter((d) => d.status === "draft");
            // Apply search
            let docs = draftDocs;
            if (search) {
                const q = search.toLowerCase();
                docs = docs.filter(
                    (d) =>
                        d.title.toLowerCase().includes(q) ||
                        d.excerpt.toLowerCase().includes(q) ||
                        d.tags.some((t) => t.toLowerCase().includes(q)) ||
                        d.author.toLowerCase().includes(q)
                );
            }
            docs.sort((a, b) => {
                let cmp = 0;
                switch (sortBy) {
                    case "name": cmp = a.title.localeCompare(b.title, "fr"); break;
                    case "author": cmp = a.author.localeCompare(b.author, "fr"); break;
                    case "date": cmp = a.updatedAtTs - b.updatedAtTs; break;
                    default: cmp = a.updatedAtTs - b.updatedAtTs;
                }
                return sortDir === "asc" ? cmp : -cmp;
            });
            return docs;
        }

        // Quand un filtre de statut est actif, rechercher dans TOUS les dossiers
        const isStatusFilterActive = statusFilter !== "all";

        let docs: DocItem[];
        if (isStatusFilterActive) {
            // Cross-dossier : afficher tous les documents correspondant au statut
            docs = documents.filter((d) => d.status === statusFilter && d.status !== "trashed");
        } else if (currentFolderId === null) {
            // À la racine sans filtre : ne montrer que les dossiers
            return [];
        } else {
            // Exclure les brouillons des dossiers normaux — ils sont dans le dossier virtuel "Brouillons"
            docs = documents.filter((d) => d.folderId === currentFolderId && d.status !== "draft");
        }

        // Search
        if (search) {
            const q = search.toLowerCase();
            docs = docs.filter(
                (d) =>
                    d.title.toLowerCase().includes(q) ||
                    d.excerpt.toLowerCase().includes(q) ||
                    d.tags.some((t) => t.toLowerCase().includes(q)) ||
                    d.author.toLowerCase().includes(q)
            );
        }

        // Sort
        docs.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case "name": cmp = a.title.localeCompare(b.title, "fr"); break;
                case "author": cmp = a.author.localeCompare(b.author, "fr"); break;
                case "date": cmp = a.updatedAtTs - b.updatedAtTs; break;
                case "status": cmp = a.status.localeCompare(b.status); break;
                default: cmp = a.updatedAtTs - b.updatedAtTs;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return docs;
    }, [documents, currentFolderId, search, statusFilter, sortBy, sortDir, convexTrashedDocs, convexTrashedFolders, trashedFolderNav]);

    const filesAsManagerFiles = useMemo(() => {
        if (currentFolderId === "__poubelle") {
            // Poubelle mode (y compris navigation dans dossier supprimé): déjà FileManagerFile
            return currentFiles as FileManagerFile[];
        }
        // Brouillons et dossiers normaux : convertir DocItem → FileManagerFile
        return (currentFiles as DocItem[]).map(docToFile);
    }, [currentFiles, currentFolderId]);

    // ─── Update folder file counts ──────────────────────────────
    const foldersWithCounts = useMemo(() => {
        // Quand un filtre de statut est actif, masquer les dossiers
        // pour montrer uniquement les documents filtrés cross-dossier
        if (statusFilter !== "all") return [];

        // Dans la Poubelle (sans navigation dans un dossier supprimé),
        // afficher les dossiers supprimés comme vrais dossiers navigables
        if (currentFolderId === "__poubelle" && !trashedFolderNav) {
            return trashedFoldersForPoubelle;
        }

        return currentFolders.map((f) => {
            let fileCount = 0;
            let subfolderCount = 0;

            if (f.id === "__brouillons") {
                // Brouillons : compter uniquement les documents draft
                fileCount = documents.filter((d) => d.status === "draft").length;
            } else if (f.id === "__poubelle") {
                // Poubelle : documents supprimés (non rangés dans un dossier) + dossiers supprimés
                fileCount = convexTrashedDocs?.filter((d) => !convexTrashedFolders?.some((tf) => tf._id === d.folderId))?.length ?? 0;
                subfolderCount = convexTrashedFolders?.length ?? 0;
            } else {
                // Dossier normal : exclure les brouillons du comptage fichiers
                fileCount = documents.filter((d) => d.folderId === f.id && d.status !== "draft").length;
                subfolderCount = folders.filter((sf) => sf.parentFolderId === f.id).length;
            }

            return { ...f, fileCount, subfolderCount };
        });
    }, [currentFolders, documents, folders, convexTrashedDocs, convexTrashedFolders, statusFilter, currentFolderId, trashedFolderNav, trashedFoldersForPoubelle]);

    // ─── Compteurs par statut (globaux — tous les documents) ──
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: 0, draft: 0, review: 0, approved: 0, archived: 0 };
        for (const d of documents) {
            if (d.status === "trashed") continue; // Exclure les supprimés
            counts.all++;
            if (d.status in counts) counts[d.status]++;
        }
        return counts;
    }, [documents]);

    // ─── Multi-sélection ───────────────────────────────────────
    const orderedIds = useMemo(() => {
        const folderIds = foldersWithCounts.map(f => f.id);
        const fileIds = filesAsManagerFiles.map(f => f.id);
        return [...folderIds, ...fileIds];
    }, [foldersWithCounts, filesAsManagerFiles]);

    const itemTypeMap = useMemo(() => {
        const map = new Map<string, "file" | "folder">();
        foldersWithCounts.forEach(f => map.set(f.id, "folder"));
        filesAsManagerFiles.forEach(f => map.set(f.id, "file"));
        return map;
    }, [foldersWithCounts, filesAsManagerFiles]);

    const itemNameMap = useMemo(() => {
        const map = new Map<string, string>();
        foldersWithCounts.forEach(f => map.set(f.id, f.name));
        filesAsManagerFiles.forEach(f => map.set(f.id, f.name));
        return map;
    }, [foldersWithCounts, filesAsManagerFiles]);

    const {
        selectedIds,
        selectedItems,
        selectionCount,
        isSelected: isItemSelected,
        handleClick: handleSelectionClick,
        clearSelection,
        selectAll,
        hasSelection,
    } = useMultiSelection({ orderedIds, itemTypeMap, itemNameMap });

    // Réinitialiser la sélection et navigation poubelle quand on change de dossier
    useEffect(() => {
        clearSelection();
        if (currentFolderId !== "__poubelle") {
            setTrashedFolderNav(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFolderId]);

    const handleItemClick = useCallback((id: string, type: "file" | "folder", event: React.MouseEvent) => {
        handleSelectionClick(id, event);
    }, [handleSelectionClick]);

    // ─── Handlers ───────────────────────────────────────────────

    const handleOpenFolder = useCallback((folderId: string) => {
        // Si on est dans la Poubelle et qu'on clique sur un dossier supprimé
        const isTrashedFolder = convexTrashedFolders?.some((f) => f._id === folderId);
        if (currentFolderId === "__poubelle" && isTrashedFolder) {
            const folder = convexTrashedFolders?.find((f) => f._id === folderId);
            setTrashedFolderNav({
                folderId,
                folderName: folder?.name ?? "Dossier",
            });
            return;
        }
        // Navigation normale
        setTrashedFolderNav(null);
        setCurrentFolderId(folderId);
    }, [currentFolderId, convexTrashedFolders]);

    const handleNavigate = useCallback((folderId: string | null) => {
        // Si on revient à la Poubelle depuis un dossier supprimé
        if (folderId === "__poubelle") {
            setTrashedFolderNav(null);
        }
        // Si on revient à la racine
        if (folderId === null) {
            setTrashedFolderNav(null);
        }
        setCurrentFolderId(folderId);
    }, []);

    const moveDocMut = useMutation(api.documents.moveToFolder);
    const submitForReviewMut = useMutation(api.documents.submitForReview);
    const approveDocumentMut = useMutation(api.documents.approveDocument);
    const rejectDocumentMut = useMutation(api.documents.rejectDocument);

    // ─── Workflow Handlers ──────────────────────────────────────
    const handleSubmitForReview = useCallback(async (docId: string) => {
        try {
            await submitForReviewMut({
                id: docId as Id<"documents">,
                userId: user?.email || "unknown",
                comment: "Soumis pour révision depuis la liste",
            });
            toast.success("Document soumis pour révision");
        } catch (err) {
            console.error("Submit for review error:", err);
            toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de la soumission"}`);
        }
    }, [submitForReviewMut, user?.email]);

    const handleApproveDocument = useCallback(async (docId: string) => {
        // Ouvrir la dialog de reclassement qui permet de choisir le dossier de destination
        const doc = documents.find((d) => d.id === docId);
        setApprovalDocId(docId);
        // Pré-sélectionner le dossier actuel du document
        setApprovalTargetFolderId(doc?.folderId ?? "");
        setShowApprovalDialog(true);
    }, [documents]);

    const handleConfirmApproval = useCallback(async () => {
        if (!approvalDocId) return;
        try {
            // 1. Approuver le document
            await approveDocumentMut({
                id: approvalDocId as Id<"documents">,
                userId: user?.email || "unknown",
                comment: "Approuvé depuis la liste",
            });

            // 2. Si un dossier de destination est choisi (et différent de l'actuel), déplacer
            const doc = documents.find((d) => d.id === approvalDocId);
            if (approvalTargetFolderId && approvalTargetFolderId !== doc?.folderId) {
                const isSystem = approvalTargetFolderId.startsWith("__");
                if (!isSystem) {
                    await moveDocMut({
                        id: approvalDocId as Id<"documents">,
                        folderId: approvalTargetFolderId as Id<"folders">,
                    });
                }
            }

            toast.success("Document approuvé et classé");
            setShowApprovalDialog(false);
            setApprovalDocId(null);
            setApprovalTargetFolderId("");
        } catch (err) {
            console.error("Approve error:", err);
            toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de l'approbation"}`);
        }
    }, [approvalDocId, approvalTargetFolderId, approveDocumentMut, moveDocMut, documents, user?.email]);

    const handleRejectDocument = useCallback(async (docId: string) => {
        try {
            await rejectDocumentMut({
                id: docId as Id<"documents">,
                userId: user?.email || "unknown",
                reason: "Rejeté depuis la liste — modifications nécessaires",
            });
            toast.success("Document rejeté — retourné en brouillon");
        } catch (err) {
            console.error("Reject error:", err);
            toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec du rejet"}`);
        }
    }, [rejectDocumentMut, user?.email]);

    const handleMoveItem = useCallback((event: DragMoveEvent) => {
        // Vérifier les permissions avant tout déplacement
        if (!canManage) {
            toast.error("Vous n'avez pas les droits pour déplacer des éléments");
            return;
        }

        const { itemId, itemType, targetFolderId } = event;

        // System folder IDs are virtual (not real Convex IDs)
        const isSystemTarget = targetFolderId.startsWith("__");
        const newFolderId = (isSystemTarget || !targetFolderId)
            ? undefined
            : targetFolderId as Id<"folders">;

        // Dropping onto Poubelle = soft-delete
        if (targetFolderId === "__poubelle") {
            if (itemType === "file") {
                if (!itemId.startsWith("doc-")) {
                    toast.promise(
                        removeDocMut({ id: itemId as Id<"documents">, trashedBy: user?.displayName ?? "Utilisateur" }),
                        {
                            loading: "Déplacement vers la corbeille...",
                            success: "Document déplacé dans la corbeille",
                            error: "Erreur lors de la suppression",
                        }
                    );
                    setDocuments((prev) => prev.filter((d) => d.id !== itemId));
                } else {
                    setDocuments((prev) => prev.filter((d) => d.id !== itemId));
                    toast.success("Document supprimé");
                }
            } else {
                // Folder dropped onto Poubelle = trash folder
                if (!itemId.startsWith("folder-")) {
                    toast.promise(
                        removeFolderMut({ id: itemId as Id<"folders">, trashedBy: user?.displayName ?? "Utilisateur" }),
                        {
                            loading: "Déplacement vers la corbeille...",
                            success: "Dossier déplacé dans la corbeille",
                            error: "Erreur lors de la suppression",
                        }
                    );
                } else {
                    setLocalFolders((prev) => prev.filter((f) => f.id !== itemId));
                    toast.success("Dossier supprimé");
                }
            }
            return;
        }

        if (itemType === "file") {
            setDocuments((prev) =>
                prev.map((d) => (d.id === itemId ? { ...d, folderId: targetFolderId } : d))
            );

            if (!itemId.startsWith("doc-")) {
                toast.promise(
                    moveDocMut({
                        id: itemId as Id<"documents">,
                        folderId: newFolderId,
                        parentFolderId: newFolderId,
                    }),
                    {
                        loading: "Déplacement...",
                        success: "Document déplacé",
                        error: "Erreur lors du déplacement",
                    }
                );
            } else {
                toast.success("Document (local) déplacé");
            }
        } else {
            // Move folder — prevent moving into self or descendants
            // Check against ALL folders (both Convex and local), not just localFolders
            const allFolders = folders;
            const isDescendant = (parentId: string, childId: string): boolean => {
                if (parentId === childId) return true;
                const children = allFolders.filter((f) => f.parentFolderId === parentId);
                return children.some((c) => isDescendant(c.id, childId));
            };

            if (isDescendant(itemId, targetFolderId)) {
                toast.error("Impossible de déplacer un dossier dans lui-même ou ses enfants.");
                return;
            }

            // Optimistic local update for local folders
            setLocalFolders((prev) =>
                prev.map((f) =>
                    f.id === itemId
                        ? { ...f, parentFolderId: isSystemTarget ? null : targetFolderId }
                        : f
                )
            );

            if (!itemId.startsWith("folder-")) {
                toast.promise(
                    updateFolderMut({
                        id: itemId as Id<"folders">,
                        parentFolderId: newFolderId === undefined ? null : newFolderId,
                    }),
                    {
                        loading: "Déplacement...",
                        success: "Dossier déplacé",
                        error: "Erreur lors du déplacement",
                    }
                );
            } else {
                toast.success("Dossier (local) déplacé");
            }
        }
    }, [moveDocMut, updateFolderMut, removeFolderMut, removeDocMut, folders, user?.displayName, canManage]);

    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDir("asc");
        }
    }, [sortBy]);

    // ─── Context menu handlers ──────────────────────────────────

    const handleRenameItem = useCallback(async (id: string, newName: string) => {
        // Try Convex update for real folders
        if (convexOrgId) {
            try {
                await updateFolderMut({ id: id as Id<"folders">, name: newName });
                toast.success(`Renommé en "${newName}"`);
            } catch {
                // Fallback: update local
                setLocalFolders((prev) =>
                    prev.map((f) => f.id === id ? { ...f, name: newName } : f)
                );
                toast.success(`Renommé en "${newName}" (local)`);
            }
        } else {
            setLocalFolders((prev) =>
                prev.map((f) => f.id === id ? { ...f, name: newName } : f)
            );
            setDocuments((prev) =>
                prev.map((d) => d.id === id ? { ...d, title: newName } : d)
            );
            toast.success(`Renommé en "${newName}"`);
        }
    }, [convexOrgId, updateFolderMut]);

    const handleDeleteItem = useCallback(async (id: string) => {
        // Determine if this is a folder or a document.
        const isFolder = folders.some((f) => f.id === id) || localFolders.some((f) => f.id === id);
        // In Poubelle, check if it's a trashed folder
        const isTrashedFolder = convexTrashedFolders?.some((f) => f._id === id);
        // Convex IDs don't start with "doc-" (local-only prefix)
        const isConvexId = !id.startsWith("doc-");

        console.log("[iDocument DELETE]", { id, isFolder, isTrashedFolder, isConvexId, currentFolderId });

        if (currentFolderId === "__poubelle") {
            // In Poubelle: permanent delete
            if (isTrashedFolder) {
                try {
                    await permanentDeleteFolderMut({ id: id as Id<"folders"> });
                    toast.success("Dossier supprimé définitivement");
                } catch (err) {
                    console.error("[iDocument DELETE] Permanent delete folder failed:", err);
                    toast.error("Erreur lors de la suppression du dossier");
                }
            } else if (isConvexId) {
                try {
                    await permanentDeleteDocMut({ id: id as Id<"documents"> });
                    toast.success("Document supprimé définitivement");
                } catch (err) {
                    console.error("[iDocument DELETE] Permanent delete failed:", err);
                    toast.error("Erreur lors de la suppression");
                }
            }
            return;
        }

        if (!isFolder) {
            // It's a document
            if (isConvexId) {
                // Normal view: soft-delete to trash via Convex mutation
                try {
                    await removeDocMut({ id: id as Id<"documents">, trashedBy: user?.displayName ?? "Utilisateur" });
                    // Optimistic local update: remove from documents list immediately
                    setDocuments((prev) => prev.filter((d) => d.id !== id));
                    toast.success("Document déplacé dans la corbeille");
                } catch (err) {
                    console.error("[iDocument DELETE] removeDocMut FAILED:", err);
                    setDocuments((prev) => prev.filter((d) => d.id !== id));
                    toast.error("Erreur lors de la suppression");
                }
            } else {
                // Local-only document (no Convex ID yet)
                setDocuments((prev) => prev.filter((d) => d.id !== id));
                toast.success("Document supprimé");
            }
            return; // Never fall through to folder delete
        }

        // It's a folder — soft-delete to trash
        if (isConvexId) {
            try {
                await removeFolderMut({ id: id as Id<"folders">, trashedBy: user?.displayName ?? "Utilisateur" });
                toast.success("Dossier déplacé dans la corbeille");
            } catch {
                setLocalFolders((prev) => prev.filter((f) => f.id !== id));
                toast.success("Dossier supprimé (local)");
            }
        } else {
            setLocalFolders((prev) => prev.filter((f) => f.id !== id));
            toast.success("Dossier supprimé");
        }
    }, [removeFolderMut, removeDocMut, permanentDeleteDocMut, permanentDeleteFolderMut, folders, localFolders, convexTrashedFolders, currentFolderId, user?.displayName]);

    // ─── Actions groupées (multi-sélection) ────────────────────

    const handleBatchDelete = useCallback(async () => {
        if (!hasSelection) return;
        let count = 0;
        for (const item of selectedItems) {
            await handleDeleteItem(item.id);
            count++;
        }
        clearSelection();
        toast.success(`${count} élément${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}`);
    }, [hasSelection, selectedItems, handleDeleteItem, clearSelection]);

    const handleBatchSubmitForReview = useCallback(async () => {
        if (!hasSelection) return;
        const docs = selectedItems.filter((item) => item.type === "file");
        let count = 0;
        for (const item of docs) {
            const doc = documents.find((d) => d.id === item.id);
            if (doc && doc.status === "draft") {
                try {
                    await submitForReviewMut({
                        id: item.id as Id<"documents">,
                        userId: user?.email || "unknown",
                        comment: "Soumis pour révision (action en masse)",
                    });
                    count++;
                } catch (err) {
                    console.error(`[Batch review] Error for ${item.id}:`, err);
                }
            }
        }
        clearSelection();
        if (count > 0) toast.success(`${count} document${count > 1 ? "s" : ""} soumis pour révision`);
        else toast.info("Aucun brouillon éligible dans la sélection");
    }, [hasSelection, selectedItems, documents, submitForReviewMut, user?.email, clearSelection]);

    const handleBatchApprove = useCallback(async () => {
        if (!hasSelection) return;
        const docs = selectedItems.filter((item) => item.type === "file");
        let count = 0;
        for (const item of docs) {
            const doc = documents.find((d) => d.id === item.id);
            if (doc && doc.status === "review") {
                try {
                    await approveDocumentMut({
                        id: item.id as Id<"documents">,
                        userId: user?.email || "unknown",
                        comment: "Approuvé (action en masse)",
                    });
                    count++;
                } catch (err) {
                    console.error(`[Batch approve] Error for ${item.id}:`, err);
                }
            }
        }
        clearSelection();
        if (count > 0) toast.success(`${count} document${count > 1 ? "s" : ""} approuvé${count > 1 ? "s" : ""}`);
        else toast.info("Aucun document en révision dans la sélection");
    }, [hasSelection, selectedItems, documents, approveDocumentMut, user?.email, clearSelection]);

    // ─── Déplacement en masse ─────────────────────────────────────
    const [showBatchMoveDialog, setShowBatchMoveDialog] = useState(false);
    const [batchMoveTargetFolderId, setBatchMoveTargetFolderId] = useState<string>("");

    const handleBatchMoveOpen = useCallback(() => {
        if (!hasSelection) return;
        setBatchMoveTargetFolderId("");
        setShowBatchMoveDialog(true);
    }, [hasSelection]);

    const handleBatchMoveConfirm = useCallback(async () => {
        if (!batchMoveTargetFolderId || !hasSelection) return;
        const docs = selectedItems.filter((item) => item.type === "file");
        let count = 0;
        for (const item of docs) {
            try {
                await moveDocMut({
                    id: item.id as Id<"documents">,
                    folderId: batchMoveTargetFolderId as Id<"folders">,
                });
                count++;
            } catch (err) {
                console.error(`[Batch move] Error for ${item.id}:`, err);
            }
        }
        clearSelection();
        setShowBatchMoveDialog(false);
        setBatchMoveTargetFolderId("");
        if (count > 0) {
            const targetFolder = folders.find((f) => f.id === batchMoveTargetFolderId);
            toast.success(`${count} document${count > 1 ? "s" : ""} déplacé${count > 1 ? "s" : ""} vers "${targetFolder?.name ?? "dossier"}"`);
        }
    }, [batchMoveTargetFolderId, hasSelection, selectedItems, moveDocMut, folders, clearSelection]);

    // ─── Statistiques de la sélection (pour afficher les bonnes actions) ──
    const selectionStats = useMemo(() => {
        const stats = { drafts: 0, reviews: 0, approved: 0, trashed: 0, folders: 0, files: 0 };
        for (const item of selectedItems) {
            if (item.type === "folder") {
                stats.folders++;
                continue;
            }
            stats.files++;
            const doc = documents.find((d) => d.id === item.id);
            if (doc) {
                if (doc.status === "draft") stats.drafts++;
                else if (doc.status === "review") stats.reviews++;
                else if (doc.status === "approved") stats.approved++;
            }
            // Vérifier dans la poubelle
            if (currentFolderId === "__poubelle") stats.trashed++;
        }
        // Pour la Poubelle, compter aussi les dossiers supprimés
        if (currentFolderId === "__poubelle") {
            stats.trashed += stats.folders;
        }
        return stats;
    }, [selectedItems, documents, currentFolderId]);

    // ─── Restore from trash (documents + folders) ────────────────
    const handleRestoreItem = useCallback(async (id: string) => {
        // Check if it's a trashed folder
        const isTrashedFolder = convexTrashedFolders?.some((f) => f._id === id);

        if (isTrashedFolder) {
            try {
                await restoreFolderMut({ id: id as Id<"folders"> });
                toast.success("Dossier restauré");
            } catch (err) {
                console.warn("[iDocument] Folder restore failed:", err);
                toast.error("Erreur lors de la restauration du dossier");
            }
        } else {
            try {
                await restoreDocMut({ id: id as Id<"documents"> });
                toast.success("Document restauré");
            } catch (err) {
                console.warn("[iDocument] Restore failed:", err);
                toast.error("Erreur lors de la restauration");
            }
        }
    }, [restoreDocMut, restoreFolderMut, convexTrashedFolders]);

    // ─── Restauration groupée (multi-sélection) ──────────────────
    const handleBatchRestore = useCallback(async () => {
        if (!hasSelection) return;
        let count = 0;
        for (const item of selectedItems) {
            try {
                await handleRestoreItem(item.id);
                count++;
            } catch (err) {
                console.error(`[Batch restore] Error for ${item.id}:`, err);
            }
        }
        clearSelection();
        if (count > 0) toast.success(`${count} élément${count > 1 ? "s" : ""} restauré${count > 1 ? "s" : ""}`);
    }, [hasSelection, selectedItems, handleRestoreItem, clearSelection]);

    const handleSavePolicy = useCallback(async (id: string, policy: ArchivePolicyData, itemType: "folder" | "document" = "folder") => {
        if (!convexOrgId) {
            toast.info("Politique d'archivage enregistrée (mode local)");
            return;
        }
        try {
            if (itemType === "document") {
                // Document: patch archiveCategorySlug directement
                await setDocArchivePolicyMut({
                    id: id as Id<"documents">,
                    archiveCategorySlug: policy.categorySlug,
                    archiveCategoryId: policy.categoryId,
                    confidentiality: policy.confidentiality,
                    countingStartEvent: policy.countingStartEvent,
                    userId: user?.email || "unknown",
                });
            } else {
                // Dossier: mutation complète avec héritage
                await setFolderArchiveMetaMut({
                    userId: user?.email || "unknown",
                    folderId: id as Id<"folders">,
                    organizationId: convexOrgId,
                    archiveCategoryId: policy.categoryId as Id<"archive_categories">,
                    archiveCategorySlug: policy.categorySlug,
                    countingStartEvent: policy.countingStartEvent,
                    confidentiality: policy.confidentiality,
                    inheritToChildren: policy.inheritToChildren,
                    inheritToDocuments: policy.inheritToDocuments,
                    manualDate: policy.manualDate,
                });
            }
            toast.success(`Politique "${policy.categorySlug}" appliquée`);
        } catch (err) {
            console.error("Erreur save policy:", err);
            toast.error("Erreur lors de l'enregistrement de la politique");
        }
    }, [convexOrgId, user, setFolderArchiveMetaMut, setDocArchivePolicyMut]);

    // ─── Context menu callbacks: subfolder, share, manage access ────
    const handleCreateSubfolder = useCallback((parentId: string) => {
        setSubfolderParentId(parentId);
        setShowNewFolderDialog(true);
    }, []);

    const handleShareItem = useCallback((id: string, type: "folder" | "document" = "document") => {
        setShareTarget({ id, type });
        setShowShareDialog(true);
    }, []);

    const handleManageAccess = useCallback((id: string) => {
        if (isAdmin) {
            setManageAccessTargetId(id);
            setShowManageAccessDialog(true);
        } else {
            toast.info("Seuls les administrateurs peuvent gérer les accès.");
        }
    }, [isAdmin]);

    const handleCreateDocument = useCallback(async () => {
        if (!newDocTitle.trim()) return;

        // ── If connected to Convex, use the create mutation ──
        if (convexOrgId && user) {
            try {
                const folderId = newDocFolderId || (currentFolderId && !currentFolderId.startsWith("__") ? currentFolderId : undefined);
                await createDocMut({
                    title: newDocTitle.trim(),
                    content: null,
                    organizationId: convexOrgId,
                    createdBy: user.email || "user",
                    tags: [],
                    folderId: folderId ? folderId as Id<"folders"> : undefined,
                    documentTypeId: newDocTypeId ? newDocTypeId as Id<"document_types"> : undefined,
                    customMetadata: Object.keys(newDocMetadata).length > 0 ? newDocMetadata : undefined,
                });
                toast.success(`Document "${newDocTitle.trim()}" créé`);
            } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
            }
        } else {
            // Fallback local
            const newDoc: DocItem = {
                id: `doc-${Date.now()}`,
                title: newDocTitle.trim(),
                excerpt: "Nouveau document créé — commencez à rédiger votre contenu…",
                author: "Vous",
                authorInitials: "V",
                updatedAt: "À l'instant",
                updatedAtTs: Date.now(),
                status: "draft",
                tags: [],
                version: 1,
                folderId: currentFolderId || "",
            };
            setDocuments((prev) => [newDoc, ...prev]);
        }

        setNewDocTitle("");
        setNewDocTypeId("");
        setNewDocFolderId("");
        setNewDocMetadata({});
        setShowNewDocDialog(false);
    }, [newDocTitle, currentFolderId, convexOrgId, user, createDocMut, newDocTypeId, newDocFolderId, newDocMetadata]);

    const createCellMut = useMutation(api.filingCells.create);

    const handleCreateFolder = useCallback(async () => {
        if (!newFolderName.trim()) return;

        const name = newFolderName.trim();
        const effectiveParentId = subfolderParentId !== null ? subfolderParentId : currentFolderId;

        // ─── Persist to Convex if connected ─────────────────────
        if (convexOrgId && user) {
            try {
                // Admin + active filing structure? Create via filing_cells (syncs folder automatically)
                if (isAdmin && activeStructure?._id) {
                    // Generate a code from the name (slug-like)
                    const code = name
                        .toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")
                        .slice(0, 30);

                    await createCellMut({
                        filingStructureId: activeStructure._id,
                        organizationId: convexOrgId,
                        code,
                        intitule: name,
                        description: "",
                        tags: [],
                    });

                    toast.success(`Dossier "${name}" créé et ajouté à la Structure de classement`, {
                        description: "Le dossier est visible dans iDocument et dans la Structure de classement.",
                    });
                } else {
                    // Regular user folder (no filing_cell sync)
                    await createFolderMut({
                        name,
                        description: "",
                        organizationId: convexOrgId,
                        createdBy: user.email || "user",
                        parentFolderId: effectiveParentId && !effectiveParentId.startsWith("__")
                            ? effectiveParentId as Id<"folders">
                            : undefined,
                        tags: [],
                    });

                    toast.success(`Dossier "${name}" créé avec succès`);
                }
            } catch (err) {
                console.error("Erreur création dossier Convex:", err);
                toast.error("Erreur lors de la création du dossier");
            }
        } else {
            // Fallback: local-only folder
            const newFolder: FileManagerFolder = {
                id: `folder-${Date.now()}`,
                name,
                parentFolderId: effectiveParentId,
                tags: [],
                fileCount: 0,
                updatedAt: "À l'instant",
                createdBy: "Vous",
            };
            setLocalFolders((prev) => [...prev, newFolder]);
            toast.success(`Dossier "${name}" créé (local)`);
        }

        setNewFolderName("");
        setSubfolderParentId(null);
        setShowNewFolderDialog(false);
    }, [newFolderName, currentFolderId, subfolderParentId, convexOrgId, user, isAdmin, activeStructure, createFolderMut, createCellMut]);

    // ─── Import handlers ────────────────────────────────────────

    const handleImportFilesSelected = useCallback((fileList: FileList | null) => {
        if (!fileList) return;
        const newFiles: ImportFileItem[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const maxSize = file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMPORT_SIZE;
            if (file.size > maxSize) {
                toast.error(`"${file.name}" dépasse la taille maximum (${file.type.startsWith("video/") ? "2 Go" : "50 Mo"})`);
                continue;
            }
            newFiles.push({
                id: `import-${Date.now()}-${i}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                suggestedTags: [],
                suggestedFolderId: null,
                suggestedFolderName: "",
                suggestedPath: "",
                newFoldersToCreate: [],
                parentFolderIdForNew: null,
                reasoning: "",
                confidence: 0,
                analyzed: false,
            });
        }
        setImportFiles((prev) => [...prev, ...newFiles]);
    }, []);

    // ─── Folder import: traverse directory entries ───────────────
    const handleImportFolderSelected = useCallback(async (items: DataTransferItemList) => {
        const collectFiles = async (
            entry: FileSystemEntry,
            path: string = ""
        ): Promise<{ file: File; path: string }[]> => {
            if (entry.isFile) {
                return new Promise((resolve) => {
                    (entry as FileSystemFileEntry).file((file) => {
                        resolve([{ file, path }]);
                    });
                });
            }
            if (entry.isDirectory) {
                const dirReader = (entry as FileSystemDirectoryEntry).createReader();
                return new Promise((resolve) => {
                    dirReader.readEntries(async (entries) => {
                        const allFiles: { file: File; path: string }[] = [];
                        for (const child of entries) {
                            const subPath = path ? `${path}/${entry.name}` : entry.name;
                            const childFiles = await collectFiles(child, subPath);
                            allFiles.push(...childFiles);
                        }
                        resolve(allFiles);
                    });
                });
            }
            return [];
        };

        const allFiles: { file: File; path: string }[] = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry?.();
            if (entry) {
                const files = await collectFiles(entry);
                allFiles.push(...files);
            }
        }

        const newFiles: ImportFileItem[] = allFiles
            .filter((f) => {
                const maxSize = f.file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMPORT_SIZE;
                return f.file.size <= maxSize;
            })
            .map((f, i) => ({
                id: `import-${Date.now()}-${i}`,
                file: f.file,
                name: f.path ? `${f.path}/${f.file.name}` : f.file.name,
                size: f.file.size,
                type: f.file.type || "application/octet-stream",
                suggestedTags: [],
                suggestedFolderId: null,
                suggestedFolderName: "",
                suggestedPath: "",
                newFoldersToCreate: [],
                parentFolderIdForNew: null,
                reasoning: "",
                confidence: 0,
                analyzed: false,
            }));

        if (newFiles.length === 0) {
            toast.error("Aucun fichier trouvé dans le dossier (ou tous dépassent 50 Mo)");
            return;
        }

        setImportFiles((prev) => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} fichier${newFiles.length > 1 ? "s" : ""} trouvé${newFiles.length > 1 ? "s" : ""} dans le dossier`);
    }, []);

    const handleRemoveImportFile = useCallback((fileId: string) => {
        setImportFiles((prev) => prev.filter((f) => f.id !== fileId));
    }, []);

    const handleAnalyzeWithAI = useCallback(async () => {
        setImportStep("analyzing");

        try {
            // Build folder tree context for AI
            const treeData = (folderTreeWithPaths ?? []).map((f) => ({
                id: String(f.id),
                name: f.name,
                path: f.path,
                depth: f.depth,
                parentFolderId: f.parentFolderId ? String(f.parentFolderId) : null,
                tags: f.tags,
                description: f.description,
            }));

            const fileNames = importFiles.map((f) => f.name);

            // Call Gemini for intelligent, folder-aware classification
            const depthConfig = convexOrgDoc?.config?.classement
                ? { maxDepth: convexOrgDoc.config.classement.maxDepth ?? 3, depthStrategy: convexOrgDoc.config.classement.depthStrategy ?? "intelligente" }
                : undefined;

            const result = await classifyDocumentsAction({
                fileNames,
                folderTree: treeData,
                depthConfig,
            });

            if (result.error) {
                console.warn("[iDocument AI] Classification error:", result.error);
                toast.error("L'IA n'a pas pu analyser les fichiers. Classement par défaut appliqué.");
                // Fallback: mark all as analyzed with defaults
                setImportFiles((prev) =>
                    prev.map((f) => ({ ...f, analyzed: true, confidence: 50 }))
                );
            } else if (result.classifications?.length > 0) {
                // Map AI results back to import files
                setImportFiles((prev) =>
                    prev.map((f, idx) => {
                        const classification = result.classifications[idx];
                        if (!classification) return { ...f, analyzed: true };

                        // Resolve the suggested folder name from tree
                        const suggestedFolder = treeData.find((td) => td.id === classification.suggestedFolderId);

                        return {
                            ...f,
                            suggestedTags: classification.suggestedTags ?? ["Document", "Import"],
                            suggestedFolderId: classification.suggestedFolderId ?? null,
                            suggestedFolderName: suggestedFolder?.name ?? "",
                            suggestedPath: classification.suggestedPath ?? "",
                            newFoldersToCreate: classification.newFoldersToCreate ?? [],
                            parentFolderIdForNew: classification.parentFolderIdForNew ?? null,
                            reasoning: classification.reasoning ?? "",
                            confidence: Math.round((classification.confidence ?? 0.7) * 100),
                            analyzed: true,
                        };
                    })
                );
                toast.success(`🤖 ${result.classifications.length} fichier(s) classé(s) par l'IA Gemini`);
            }
        } catch (err) {
            console.error("[iDocument AI] Classification call failed:", err);
            toast.error("Erreur lors de l'analyse IA. Classement par défaut appliqué.");
            setImportFiles((prev) =>
                prev.map((f) => ({ ...f, analyzed: true, confidence: 50 }))
            );
        }

        setImportStep("review");
    }, [importFiles, folderTreeWithPaths, classifyDocumentsAction]);

    const handleUpdateImportTag = useCallback((fileId: string, tagIndex: number, newTag: string) => {
        setImportFiles((prev) =>
            prev.map((f) => {
                if (f.id === fileId) {
                    const newTags = [...f.suggestedTags];
                    if (newTag) newTags[tagIndex] = newTag;
                    else newTags.splice(tagIndex, 1);
                    return { ...f, suggestedTags: newTags };
                }
                return f;
            })
        );
    }, []);

    const handleUpdateImportFolder = useCallback((fileId: string, folderId: string) => {
        const folder = folders.find((f) => f.id === folderId);
        setImportFiles((prev) =>
            prev.map((f) => f.id === fileId ? { ...f, suggestedFolderId: folderId, suggestedFolderName: folder?.name || "" } : f)
        );
    }, [folders]);

    const [importLoading, setImportLoading] = useState(false);

    const handleConfirmImport = useCallback(async () => {
        if (!convexOrgId || !user) {
            // Fallback local-only (pas de Convex)
            const newDocs: DocItem[] = importFiles.map((f) => ({
                id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: f.name.replace(/\.[^.]+$/, ""),
                excerpt: `Document importé — Classé automatiquement par l'IA avec ${f.confidence}% de confiance.`,
                author: "Vous",
                authorInitials: "V",
                updatedAt: "À l'instant",
                updatedAtTs: Date.now(),
                status: "draft" as DocStatus,
                tags: f.suggestedTags,
                version: 1,
                folderId: f.suggestedFolderId,
            }));
            setDocuments((prev) => [...newDocs, ...prev]);
            toast.success(`${importFiles.length} document${importFiles.length > 1 ? "s" : ""} importé${importFiles.length > 1 ? "s" : ""} (local)`);
            setImportFiles([]);
            setImportStep("select");
            setShowImportDialog(false);
            return;
        }

        setImportLoading(true);
        const createdBy = user.email || "import";
        let successCount = 0;
        let foldersCreated = 0;

        try {
            for (const importFile of importFiles) {
                // 1. Resolve destination folder (AI-powered)
                let targetFolderId: Id<"folders"> | undefined;
                const suggestedId = importFile.suggestedFolderId;

                // Determine if the suggestedId is a real Convex ID or a system pseudo-ID
                const isConvexId = suggestedId && !suggestedId.startsWith("__");

                if (isConvexId) {
                    // Start with the AI-suggested existing folder
                    targetFolderId = suggestedId as Id<"folders">;
                }

                // 1b. Create sub-folders suggested by AI (cascade creation)
                if (importFile.newFoldersToCreate && importFile.newFoldersToCreate.length > 0) {
                    // Determine the parent for new folders: AI suggestion or existing target
                    let parentId: Id<"folders"> | undefined =
                        importFile.parentFolderIdForNew && !importFile.parentFolderIdForNew.startsWith("__")
                            ? (importFile.parentFolderIdForNew as Id<"folders">)
                            : targetFolderId;

                    for (const folderName of importFile.newFoldersToCreate) {
                        try {
                            const folderResult = await getOrCreateFolderMut({
                                name: folderName,
                                organizationId: convexOrgId,
                                createdBy,
                                parentFolderId: parentId,
                            });
                            parentId = folderResult.id;
                            if (folderResult.created) foldersCreated++;
                        } catch (folderErr) {
                            console.warn(`[iDocument] Failed to create sub-folder "${folderName}":`, folderErr);
                        }
                    }
                    // The final created folder is the actual destination
                    targetFolderId = parentId;
                } else if (!isConvexId) {
                    // No real folder assigned — check for folder paths in filename
                    // Check for folder paths in imported filenames (folder import)
                    const pathParts = importFile.name.split("/");
                    if (pathParts.length > 1) {
                        // Has folder path — create each level
                        let parentId: Id<"folders"> | undefined;
                        for (let i = 0; i < pathParts.length - 1; i++) {
                            const folderResult = await getOrCreateFolderMut({
                                name: pathParts[i],
                                organizationId: convexOrgId,
                                createdBy,
                                parentFolderId: parentId,
                            });
                            parentId = folderResult.id;
                            if (folderResult.created) foldersCreated++;
                        }
                        targetFolderId = parentId;
                    }
                }

                // 2. Upload file to Convex Storage
                const uploadUrl = await generateUploadUrlMut();
                const uploadResult = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": importFile.file.type || "application/octet-stream" },
                    body: importFile.file,
                });

                if (!uploadResult.ok) {
                    toast.error(`Erreur lors de l'upload de "${importFile.name.split("/").pop()}"`);
                    continue;
                }

                const { storageId } = await uploadResult.json();

                // 3. Create document record in Convex
                const fileName = importFile.name.split("/").pop() || importFile.name;
                await createFromImportMut({
                    title: fileName.replace(/\.[^.]+$/, ""),
                    organizationId: convexOrgId,
                    createdBy,
                    tags: importFile.suggestedTags,
                    folderId: targetFolderId,
                    parentFolderId: targetFolderId ? undefined : undefined,
                    storageId: storageId as Id<"_storage">,
                    fileName,
                    fileSize: importFile.size,
                    mimeType: importFile.type || "application/octet-stream",
                    excerpt: `Document importé — Classé automatiquement par l'IA avec ${importFile.confidence}% de confiance.`,
                });

                successCount++;
            }

            const parts = [`${successCount} document${successCount > 1 ? "s" : ""} importé${successCount > 1 ? "s" : ""} avec succès`];
            if (foldersCreated > 0) parts.push(`${foldersCreated} dossier${foldersCreated > 1 ? "s" : ""} créé${foldersCreated > 1 ? "s" : ""}`);

            toast.success(parts.join(" · "), {
                description: "Les fichiers sont persistés et synchronisés dans l'arborescence.",
            });
        } catch (err) {
            console.error("[iDocument] Import error:", err);
            toast.error("Erreur lors de l'import", {
                description: `${successCount} fichier${successCount > 1 ? "s" : ""} importé${successCount > 1 ? "s" : ""} avant l'erreur.`,
            });
        } finally {
            setImportLoading(false);
            setImportFiles([]);
            setImportStep("select");
            setShowImportDialog(false);
        }
    }, [importFiles, convexOrgId, user, generateUploadUrlMut, createFromImportMut, getOrCreateFolderMut]);

    const handleCloseImport = useCallback(() => {
        setImportFiles([]);
        setImportStep("select");
        setShowImportDialog(false);
    }, []);

    // ─── Map id → parentFolderId pour la column view ────────────
    const folderParentMap = useMemo(() => {
        const map = new Map<string, string | null>();
        for (const f of folders) {
            map.set(f.id, f.parentFolderId);
        }
        return map;
    }, [folders]);

    // ─── Folder contents for column view ────────────────────────
    const getFolderContents = useCallback(
        (folderId: string) => {
            // Poubelle: montrer les dossiers supprimés comme vrais dossiers navigables + docs
            if (folderId === "__poubelle") {
                const trashedDocFiles: FileManagerFile[] = (convexTrashedDocs ?? []).map((d) => ({
                    id: d._id,
                    name: d.title,
                    type: "document",
                    size: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : "—",
                    date: new Date(d.trashedAt ?? d.updatedAt).toLocaleDateString("fr-FR"),
                    folderId: "__poubelle",
                    metadata: {
                        status: "trashed" as DocStatus,
                        tags: d.tags ?? [],
                        author: d.createdBy ?? "Inconnu",
                        authorInitials: d.createdBy?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "??",
                        itemType: "document" as const,
                        trashedAt: d.trashedAt,
                        version: d.version ?? 1,
                        excerpt: d.excerpt ?? "",
                        archiveCategorySlug: (d as any).archiveCategorySlug,
                    },
                }));
                return { folders: trashedFoldersForPoubelle, files: trashedDocFiles };
            }

            // Vérifier si c'est un dossier supprimé → montrer ses documents
            const isTrashedFolder = convexTrashedFolders?.some((f) => f._id === folderId);
            if (isTrashedFolder) {
                const docsInTrashedFolder: FileManagerFile[] = [
                    ...(convexTrashedDocs ?? [])
                        .filter((d) => d.folderId === folderId)
                        .map((d) => ({
                            id: d._id,
                            name: d.title,
                            type: "document",
                            size: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : "—",
                            date: new Date(d.trashedAt ?? d.updatedAt).toLocaleDateString("fr-FR"),
                            folderId,
                            metadata: {
                                status: "trashed" as DocStatus,
                                tags: d.tags ?? [],
                                author: d.createdBy ?? "Inconnu",
                                authorInitials: d.createdBy?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "??",
                                itemType: "document" as const,
                                trashedAt: d.trashedAt,
                                version: d.version ?? 1,
                                excerpt: d.excerpt ?? "",
                                archiveCategorySlug: (d as any).archiveCategorySlug,
                            },
                        })),
                    ...documents
                        .filter((d) => d.folderId === folderId)
                        .map(docToFile),
                ];
                return { folders: [] as FileManagerFolder[], files: docsInTrashedFolder };
            }

            const subFolders = folders
                .filter((f) => f.parentFolderId === folderId)
                .map((f) => ({
                    ...f,
                    fileCount: documents.filter((d) => d.folderId === f.id).length +
                        folders.filter((sf) => sf.parentFolderId === f.id).length,
                }));
            const subFiles = documents.filter((d) => d.folderId === folderId).map(docToFile);
            return { folders: subFolders, files: subFiles };
        },
        [folders, documents, convexTrashedDocs, convexTrashedFolders, trashedFoldersForPoubelle]
    );

    // ─── Render callbacks ───────────────────────────────────────

    const renderFolderCard = useCallback(
        (folder: FileManagerFolder, isDragOver: boolean) => {
            const meta = folder.metadata as Record<string, unknown> | undefined;
            const isTrashedFolder = meta?.isTrashedFolder === true;
            const archiveCategoryId = meta?.archiveCategoryId as string | undefined;
            const categoryObj = categoryOptions?.find((c: { _id: string; name: string }) => c._id === archiveCategoryId);
            const retentionText = categoryObj ? categoryObj.name : null;

            // Dossier supprimé dans la Poubelle : badges spéciaux avec Restaurer/Supprimer
            const badges = isTrashedFolder ? (
                <div className="flex flex-col gap-0.5 w-full">
                    <Badge variant="outline" className="text-[9px] h-4 border-red-500/20 text-red-400 bg-red-500/10 whitespace-nowrap">
                        Supprimé
                    </Badge>
                </div>
            ) : (
                <>
                    {folder.isSystem && (
                        <Badge variant="outline" className="text-[9px] h-4 border-amber-500/20 text-amber-500 bg-amber-500/10 whitespace-nowrap">
                            Système
                        </Badge>
                    )}
                    {retentionText && (
                        <Badge variant="outline" className="text-[9px] h-4 border-white/10 text-muted-foreground bg-white/5 whitespace-nowrap">
                            {retentionText}
                        </Badge>
                    )}
                </>
            );

            // Tags pour les dossiers supprimés : boutons Restaurer / Supprimer
            const trashedTags = isTrashedFolder ? (
                <div className="flex gap-1 mt-0.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRestoreItem(folder.id); }}
                        className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 transition-colors flex items-center gap-0.5"
                    >
                        <RotateCcw className="h-2.5 w-2.5" /> Restaurer
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(folder.id); }}
                        className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors flex items-center gap-0.5"
                    >
                        <Trash2 className="h-2.5 w-2.5" /> Suppr.
                    </button>
                </div>
            ) : null;

            const folderMeta = folder.metadata as Record<string, unknown> | undefined;
            // Pas de context menu pour les dossiers dans la Poubelle
            const contextMenu = isTrashedFolder ? null : (
                <FolderDocumentContextMenu
                    itemId={folder.id}
                    itemType="folder"
                    itemName={folder.name}
                    isSystem={folder.isSystem}
                    isAdmin={canManage}
                    categories={categoryOptions}
                    itemCreatedAt={folderMeta?.createdAt as string | undefined}
                    itemUpdatedAt={folder.updatedAt}
                    itemCreatedBy={folder.createdBy}
                    onRename={canManage ? handleRenameItem : undefined}
                    onDelete={canManage ? handleDeleteItem : undefined}
                    onSavePolicy={canManage ? handleSavePolicy : undefined}
                    onCreateSubfolder={canManage ? handleCreateSubfolder : undefined}
                    onShare={canManage ? handleShareItem : undefined}
                    onManageAccess={isAdmin ? handleManageAccess : undefined}
                    onAutoTag={handleAutoTag}
                    isAutoTagging={autoTaggingId === folder.id}
                    autoTagResult={autoTagResult?.forId === folder.id ? autoTagResult : null}
                />
            );

            return (
                <VaultFolderCard
                    label={folder.name}
                    count={folder.fileCount}
                    subfolderCount={folder.subfolderCount}
                    isDragOver={isDragOver}
                    badges={badges}
                    contextMenu={contextMenu}
                    tags={trashedTags}
                    isSelected={isItemSelected(folder.id)}
                />
            );
        },
        [isAdmin, canManage, categoryOptions, handleRenameItem, handleDeleteItem, handleSavePolicy, handleCreateSubfolder, handleShareItem, handleManageAccess, isItemSelected, handleAutoTag, autoTaggingId, autoTagResult, handleRestoreItem]
    );

    const renderFileCard = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as DocStatus;
            const st = STATUS_CFG[status] ?? STATUS_CFG.draft;
            const tags = meta.tags as string[];
            const itemType = meta.itemType as string | undefined;
            const isTrashedFolder = itemType === "folder";

            // ── Résoudre la catégorie de rétention depuis les données réelles ──
            const docArchiveSlug = meta.archiveCategorySlug as string | undefined;
            const docArchiveCatId = meta.archiveCategoryId as string | undefined;
            // Chercher dans categoryOptions (archive_categories Convex) par ID ou slug
            const archiveCat = docArchiveCatId
                ? categoryOptions?.find((c) => c._id === docArchiveCatId)
                : docArchiveSlug
                    ? categoryOptions?.find((c) => c.slug === docArchiveSlug)
                    : null;

            // Fallback: catégorie visuelle par matching de nom (heuristique)
            const categoryMatchStr = tags.join(" ") + " " + file.name;
            const categoryConfig = getCategoryConfigFromFolder(categoryMatchStr);

            // Couleur de la catégorie de rétention basée sur la vraie catégorie
            const ARCHIVE_CATEGORY_COLORS: Record<string, string> = {
                fiscal: "bg-amber-500/10 text-amber-400",
                social: "bg-blue-500/10 text-blue-400",
                legal: "bg-violet-500/10 text-violet-400",
                client: "bg-emerald-500/10 text-emerald-400",
                general: "bg-cyan-500/10 text-cyan-400",
            };

            const retentionCategoryName = archiveCat?.name ?? null;
            const retentionColor = archiveCat
                ? (ARCHIVE_CATEGORY_COLORS[archiveCat.slug] ?? `bg-white/[0.06] text-${archiveCat.color}-400`)
                : undefined;

            const statusBadge = isTrashedFolder ? (
                <Badge className="text-[9px] h-5 border bg-violet-500/15 text-violet-400 border-violet-500/20">
                    <Folder className="h-2.5 w-2.5 mr-1" />
                    Dossier
                </Badge>
            ) : (
                <Badge className={`text-[9px] h-5 border ${st.class}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1`} />
                    {st.label}
                </Badge>
            );

            // Préparer currentPolicy pour le context menu (pré-remplir la politique)
            const currentPolicy = docArchiveSlug ? {
                categorySlug: docArchiveSlug,
                categoryId: docArchiveCatId,
            } : undefined;

            const contextMenu = (
                <FolderDocumentContextMenu
                    itemId={file.id}
                    itemType={isTrashedFolder ? "folder" : "document"}
                    itemName={file.name}
                    isAdmin={canManage}
                    categories={categoryOptions}
                    itemStatus={status}
                    itemCreatedAt={file.date}
                    itemUpdatedAt={file.date}
                    itemCreatedBy={meta.author as string | undefined}
                    currentPolicy={currentPolicy}
                    onRename={canManage ? handleRenameItem : undefined}
                    onDelete={canManage ? handleDeleteItem : undefined}
                    onSavePolicy={canManage ? handleSavePolicy : undefined}
                    onShare={canManage ? handleShareItem : undefined}
                    onSubmitForReview={canManage ? handleSubmitForReview : undefined}
                    onApprove={canManage ? handleApproveDocument : undefined}
                    onReject={canManage ? handleRejectDocument : undefined}
                    onEditTags={canManage ? handleOpenTagDialog : undefined}
                    onAutoTag={handleAutoTag}
                    isAutoTagging={autoTaggingId === file.id}
                    autoTagResult={autoTagResult?.forId === file.id ? autoTagResult : null}
                />
            );

            const badges = currentFolderId === "__poubelle" ? (
                <div className="flex flex-col gap-1 w-full mt-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRestoreItem(file.id); }}
                        className="text-[9px] px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1 w-full"
                    >
                        <RotateCcw className="h-3 w-3" /> Restaurer
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(file.id); }}
                        className="text-[9px] px-2 py-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 w-full"
                    >
                        <Trash2 className="h-3 w-3" /> Supprimer définitivement
                    </button>
                </div>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); handleOpenTagDialog(file.id); }}
                    className="text-[9px] px-1.5 py-0.5 bg-background/50 hover:bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground rounded transition-colors flex items-center gap-0.5 shadow-sm"
                >
                    <Tag className="h-2.5 w-2.5" /> Tags
                </button>
            );

            return (
                <VaultFileCard
                    title={file.name}
                    subtitle={isTrashedFolder ? "Dossier supprimé" : (meta.excerpt as string)}
                    gradient={isTrashedFolder ? "from-violet-500/20 to-indigo-500/20" : categoryConfig.gradient}
                    iconColor={isTrashedFolder ? "text-violet-400" : categoryConfig.iconColor}
                    date={file.date}
                    statusBadge={statusBadge}
                    version={isTrashedFolder ? undefined : (meta.version as number)}
                    tags={tags}
                    retentionCategory={retentionCategoryName ?? (categoryConfig.label !== "Divers" ? categoryConfig.label : undefined)}
                    retentionColor={retentionColor ?? (categoryConfig.label !== "Divers" ? `bg-white/[0.06] ${categoryConfig.iconColor}` : undefined)}
                    contextMenu={currentFolderId !== "__poubelle" ? contextMenu : null}
                    badges={badges}
                    isSelected={isItemSelected(file.id)}
                />
            );
        },
        [router, basePath, currentFolderId, handleDeleteItem, handleRestoreItem, handleOpenTagDialog, canManage, categoryOptions, handleRenameItem, handleSavePolicy, handleShareItem, isItemSelected, handleSubmitForReview, handleApproveDocument, handleRejectDocument, handleAutoTag, autoTaggingId, autoTagResult]
    );

    const renderFilePreview = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as DocStatus;
            const st = STATUS_CFG[status] ?? STATUS_CFG.draft;
            const tags = meta.tags as string[];
            return (
                <div className="p-4 space-y-4">
                    <div className="flex flex-col items-center py-6">
                        <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                            <FileText className="h-7 w-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-center px-2">{file.name}</p>
                        <Badge className={`text-[10px] h-5 border mt-2 ${st.class}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1.5`} />
                            {st.label}
                        </Badge>
                    </div>
                    <div className="space-y-2 px-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Auteur</span>
                            <span>{meta.author as string}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Version</span>
                            <span>v{meta.version as number}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Modifié</span>
                            <span>{file.date}</span>
                        </div>
                        {tags.length > 0 && (
                            <div className="pt-2">
                                <span className="text-[10px] text-muted-foreground block mb-1">Tags</span>
                                <div className="flex flex-wrap gap-1">
                                    {tags.map((t) => (
                                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="pt-3">
                            <Button
                                size="sm"
                                className="w-full text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                                onClick={() => router.push(`${basePath}/edit/${file.id}`)}
                            >
                                <Edit3 className="h-3 w-3 mr-1.5" />
                                Ouvrir
                            </Button>
                        </div>
                    </div>
                </div>
            );
        },
        [router, basePath]
    );

    const hasActiveFilters = statusFilter !== "all" || search;

    // ─── Counters ───────────────────────────────────────────────
    const totalDocs = documents.length;
    const reviewCount = documents.filter((d) => d.status === "review").length;

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-5 max-w-[1400px] mx-auto"
        >
            {/* ── Header ────────────────────────────────────── */}
            <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Gestion Documentaire
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {totalDocs} document{totalDocs > 1 ? "s" : ""} · {reviewCount} en révision
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Nouveau dossier: ⚙️Gestion + 🔑Admin */}
                    {canManage && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNewFolderDialog(true)}
                            className="border-white/10 text-xs gap-1.5"
                        >
                            <FolderPlus className="h-3.5 w-3.5" />
                            Nouveau dossier
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImportDialog(true)}
                        className="border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 text-xs gap-1.5"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Importer
                    </Button>
                    {/* Réorganisation IA: ⚙️Gestion + 🔑Admin */}
                    {canManage && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowReorgDialog(true);
                                setReorgStep("mode");
                                setReorgMode("classify");
                                setReorgPlan(null);
                                setReorgResult(null);
                                setReorgProgress(0);
                            }}
                            className="border-amber-500/20 text-amber-300 hover:bg-amber-500/10 text-xs gap-1.5"
                        >
                            <Wand2 className="h-3.5 w-3.5" />
                            Réorganisation IA
                        </Button>
                    )}
                    <Button
                        onClick={() => setShowNewDocDialog(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0 gap-2 shadow-lg shadow-violet-500/20 text-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Nouveau document
                    </Button>
                </div>
            </motion.div>

            {/* ── Toolbar ───────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un document…"
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>

                            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />

                            {/* Status filter pills with counts */}
                            <div className="flex items-center gap-1">
                                {STATUS_FILTERS.map((f) => {
                                    const count = statusCounts[f.value] ?? 0;
                                    return (
                                        <button
                                            key={f.value}
                                            onClick={() => setStatusFilter(f.value)}
                                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${statusFilter === f.value
                                                ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                                                : "text-muted-foreground hover:bg-white/5"
                                                }`}
                                        >
                                            {f.label}
                                            {count > 0 && (
                                                <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold ${statusFilter === f.value
                                                    ? "bg-violet-500/30 text-violet-200"
                                                    : "bg-white/10 text-muted-foreground"
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Clear filters */}
                            {hasActiveFilters && (
                                <>
                                    <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[11px] gap-1.5 text-red-400 hover:text-red-300"
                                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                    >
                                        <X className="h-3 w-3" /> Effacer
                                    </Button>
                                </>
                            )}

                            {/* View mode toggle */}
                            <div className="ml-auto">
                                <ViewModeToggle
                                    value={viewMode}
                                    onChange={setViewMode}
                                    storageKey="digitalium-idocument-view"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Breadcrumb ─────────────────────────────────── */}
            <BreadcrumbPath
                path={breadcrumbPath}
                onNavigate={handleNavigate}
                rootLabel="Documents"
                rootIcon={FileText}
            />

            {/* ── Barre d'actions en masse (multi-sélection) ── */}
            <AnimatePresence>
                {hasSelection && (
                    <motion.div
                        key="selection-bar"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-wrap items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm"
                    >
                        {/* Compteur de sélection */}
                        <div className="flex items-center gap-2 text-sm font-medium text-violet-300 mr-2">
                            <CheckSquare className="h-4 w-4" />
                            <span>{selectionCount} élément{selectionCount > 1 ? "s" : ""}</span>
                        </div>

                        <Separator orientation="vertical" className="h-5 bg-white/10" />

                        {/* ── Actions contextuelles ── */}
                        <div className="flex items-center gap-1 flex-wrap">
                            {/* Soumettre pour révision (si des brouillons sont sélectionnés) */}
                            {canManage && selectionStats.drafts > 0 && currentFolderId !== "__poubelle" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBatchSubmitForReview}
                                    className="h-7 text-xs gap-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                >
                                    <Send className="h-3 w-3" />
                                    Révision ({selectionStats.drafts})
                                </Button>
                            )}

                            {/* Approuver en masse (si des documents en révision sont sélectionnés) */}
                            {canManage && selectionStats.reviews > 0 && currentFolderId !== "__poubelle" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBatchApprove}
                                    className="h-7 text-xs gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approuver ({selectionStats.reviews})
                                </Button>
                            )}

                            {/* Déplacer en masse (pour les documents hors Poubelle) */}
                            {canManage && selectionStats.files > 0 && currentFolderId !== "__poubelle" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBatchMoveOpen}
                                    className="h-7 text-xs gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                >
                                    <FolderUp className="h-3 w-3" />
                                    Déplacer ({selectionStats.files})
                                </Button>
                            )}

                            {/* Restaurer en masse (dans la Poubelle) */}
                            {currentFolderId === "__poubelle" && selectionStats.trashed > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBatchRestore}
                                    className="h-7 text-xs gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Restaurer ({selectionStats.trashed})
                                </Button>
                            )}

                            {/* Supprimer en masse */}
                            {canManage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBatchDelete}
                                    className="h-7 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    {currentFolderId === "__poubelle" ? "Suppr. définitif" : "Supprimer"}
                                </Button>
                            )}
                        </div>

                        <div className="flex-1" />

                        {/* Tout sélectionner / Désélectionner */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectAll()}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Tout sélectionner
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Désélectionner
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Bandeau filtre actif ──────────────────────── */}
            {statusFilter !== "all" && (
                <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-blue-500/8 border border-blue-500/15 text-xs">
                    <Eye className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-blue-300">
                        {STATUS_FILTERS.find(f => f.value === statusFilter)?.label ?? statusFilter}
                    </span>
                    <span className="text-muted-foreground">
                        — {filesAsManagerFiles.length} document{filesAsManagerFiles.length !== 1 ? "s" : ""} dans tous les dossiers
                    </span>
                    <button
                        onClick={() => setStatusFilter("all")}
                        className="ml-auto text-muted-foreground hover:text-white transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            {/* ── Content — Finder Views ─────────────────────── */}
            <AnimatePresence mode="popLayout">
                {viewMode === "grid" && (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FinderGridView
                            folders={foldersWithCounts}
                            files={filesAsManagerFiles}
                            onOpenFolder={handleOpenFolder}
                            onMoveItem={handleMoveItem}
                            renderFolderCard={renderFolderCard}
                            renderFileCard={renderFileCard}
                            onItemClick={handleItemClick}
                            selectedIds={selectedIds}
                            onOpenFile={(fileId) => {
                                const meta = filesAsManagerFiles.find(f => f.id === fileId)?.metadata as Record<string, unknown> | undefined;
                                if (meta?.itemType === "folder") return;
                                router.push(`${basePath}/edit/${fileId}`);
                            }}
                            emptyState={
                                <div className="flex flex-col items-center py-16 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                                        <FolderOpen className="h-8 w-8 text-violet-400/60" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">Dossier vide</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Ce dossier ne contient aucun document. Glissez-déposez des fichiers ici ou créez-en un nouveau.
                                    </p>
                                </div>
                            }
                            columns={5}
                        />
                    </motion.div>
                )}

                {viewMode === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FinderListView
                            folders={foldersWithCounts}
                            files={filesAsManagerFiles}
                            columns={DOC_COLUMNS}
                            onOpenFolder={handleOpenFolder}
                            onItemClick={handleItemClick}
                            selectedIds={selectedIds}
                            onOpenFile={(fileId) => {
                                // Vérifier si c'est un dossier trashedé (dans Poubelle)
                                const meta = filesAsManagerFiles.find(f => f.id === fileId)?.metadata as Record<string, unknown> | undefined;
                                if (meta?.itemType === "folder") return; // pas d'ouverture pour les dossiers supprimés
                                router.push(`${basePath}/edit/${fileId}`);
                            }}
                            getFolderContents={getFolderContents}
                            onMoveItem={handleMoveItem}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={handleSort}
                            renderFolderIcon={(folder) => (
                                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${folder.isSystem ? "bg-amber-500/15" : "bg-violet-500/15"}`}>
                                    {folder.isSystem
                                        ? <Lock className="h-3 w-3 text-amber-400" />
                                        : <Folder className="h-3 w-3 text-violet-400" />
                                    }
                                </div>
                            )}
                            renderFileIcon={(file) => {
                                const meta = file.metadata as Record<string, unknown> | undefined;
                                const isTrashedFolder = meta?.itemType === "folder";
                                return (
                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${isTrashedFolder ? "bg-violet-500/15" : "bg-violet-500/10"}`}>
                                        {isTrashedFolder
                                            ? <Folder className="h-3 w-3 text-violet-400" />
                                            : <FileText className="h-3 w-3 text-violet-400" />
                                        }
                                    </div>
                                );
                            }}
                            emptyState={
                                <div className="flex flex-col items-center py-16 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                                        <FolderOpen className="h-8 w-8 text-violet-400/60" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">Dossier vide</h3>
                                    <p className="text-sm text-muted-foreground">Aucun contenu dans ce dossier.</p>
                                </div>
                            }
                        />
                    </motion.div>
                )}

                {viewMode === "column" && (
                    <motion.div
                        key="column"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FinderColumnView
                            rootFolders={folders.filter((f) => f.parentFolderId === null).map((f) => ({
                                ...f,
                                fileCount: f.id === "__poubelle"
                                    ? (convexTrashedDocs?.length ?? 0) + (convexTrashedFolders?.length ?? 0)
                                    : documents.filter((d) => d.folderId === f.id).length +
                                      folders.filter((sf) => sf.parentFolderId === f.id).length,
                            }))}
                            rootFiles={[]}
                            getFolderContents={getFolderContents}
                            onMoveItem={handleMoveItem}
                            onItemClick={handleItemClick}
                            selectedIds={selectedIds}
                            currentFolderId={currentFolderId}
                            folderParentMap={folderParentMap}
                            renderFilePreview={renderFilePreview}
                            renderFolderIcon={(folder) => (
                                folder.isSystem
                                    ? <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                    : <Folder className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                            )}
                            renderFileIcon={() => (
                                <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── New Document Dialog ────────────────────────── */}
            <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                            Nouveau Document
                        </DialogTitle>
                        <DialogDescription>
                            Créez un nouveau document{currentFolderId ? ` dans "${folders.find((f) => f.id === currentFolderId)?.name || "ce dossier"}"` : " dans Mes Documents"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="doc-title" className="text-xs">Titre du document *</Label>
                            <Input
                                id="doc-title"
                                placeholder="Ex: Rapport mensuel février 2026"
                                value={newDocTitle}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocTitle(e.target.value)}
                                className="bg-white/5 border-white/10"
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === "Enter") handleCreateDocument();
                                }}
                            />
                        </div>

                        {/* ── Type de document (v7) ── */}
                        {documentTypes && documentTypes.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs">Type de document <span className="text-rose-400">*</span></Label>
                                <Select value={newDocTypeId} onValueChange={setNewDocTypeId}>
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Sélectionner un type…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {documentTypes.map((dt) => (
                                            <SelectItem key={dt._id} value={dt._id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dt.couleur || "#6B7280" }} />
                                                    <span>{dt.nom}</span>
                                                    <span className="text-[10px] text-muted-foreground ml-1">{dt.code}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* ── Dossier de destination (v7) ── */}
                        {!currentFolderId && dynamicFolders.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs">Dossier de destination {activeStructure ? "*" : ""}</Label>
                                <Select value={newDocFolderId} onValueChange={setNewDocFolderId}>
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Sélectionner un dossier…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dynamicFolders.filter(f => !f.parentFolderId).map((f) => (
                                            <SelectItem key={f.id} value={f.id}>
                                                <div className="flex items-center gap-2">
                                                    <Folder className="h-3 w-3 text-amber-400" />
                                                    <span>{f.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* ── Métadonnées personnalisées (v7) ── */}
                        {metadataFields && metadataFields.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Métadonnées</p>
                                {metadataFields.map((field) => (
                                    <div key={field._id} className="space-y-1">
                                        <Label className="text-xs text-white/60">
                                            {field.fieldLabel} {field.isRequired && <span className="text-amber-400">*</span>}
                                        </Label>
                                        {field.fieldType === "select" ? (
                                            <Select value={newDocMetadata[field.fieldName] || ""} onValueChange={(v) => setNewDocMetadata(p => ({ ...p, [field.fieldName]: v }))}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-xs h-8"><SelectValue placeholder="—" /></SelectTrigger>
                                                <SelectContent>
                                                    {field.options?.map((opt: string) => (
                                                        <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : field.fieldType === "boolean" ? (
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={newDocMetadata[field.fieldName] === "true"} onChange={(e) => setNewDocMetadata(p => ({ ...p, [field.fieldName]: e.target.checked ? "true" : "false" }))} aria-label={field.fieldLabel} className="rounded" />
                                                <span className="text-xs text-white/50">Oui</span>
                                            </div>
                                        ) : (
                                            <Input
                                                type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
                                                value={newDocMetadata[field.fieldName] || ""}
                                                onChange={(e) => setNewDocMetadata(p => ({ ...p, [field.fieldName]: e.target.value }))}
                                                className="bg-white/5 border-white/10 text-xs h-8"
                                                placeholder={field.defaultValue || ""}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewDocDialog(false)} className="border-white/10">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateDocument}
                            disabled={
                                !newDocTitle.trim()
                                || (!!activeStructure && !currentFolderId && !newDocFolderId)
                                || (!!documentTypes && documentTypes.length > 0 && !newDocTypeId)
                                || (!!metadataFields && metadataFields.filter((f: { isRequired?: boolean }) => f.isRequired).some((f: { fieldName: string }) => !newDocMetadata[f.fieldName] || newDocMetadata[f.fieldName] === ""))
                            }
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── New Folder Dialog ─────────────────── */}
            <Dialog open={showNewFolderDialog} onOpenChange={(open) => {
                setShowNewFolderDialog(open);
                if (!open) {
                    setNewFolderName("");
                    setSubfolderParentId(null);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-violet-400" />
                            Nouveau Dossier
                        </DialogTitle>
                        <DialogDescription>
                            Créez un nouveau dossier{subfolderParentId ? ` dans "${folders.find((f) => f.id === subfolderParentId)?.name || "ce dossier"}"` : currentFolderId ? ` dans "${folders.find((f) => f.id === currentFolderId)?.name || "ce dossier"}"` : " à la racine"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="folder-name" className="text-xs">Nom du dossier *</Label>
                            <Input
                                id="folder-name"
                                placeholder="Ex: Rapports financiers"
                                value={newFolderName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
                                className="bg-white/5 border-white/10"
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === "Enter") handleCreateFolder();
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewFolderDialog(false)} className="border-white/10">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            disabled={!newFolderName.trim()}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0"
                        >
                            <FolderPlus className="h-4 w-4 mr-1.5" />
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Import Dialog ────────────────────────────────── */}
            <Dialog open={showImportDialog} onOpenChange={(open) => { if (!open) handleCloseImport(); }}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            Importer avec l&apos;IA
                        </DialogTitle>
                        <DialogDescription>
                            Déposez vos documents — l&apos;IA analysera leur contenu et suggérera un classement automatique.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step: select files */}
                    {importStep === "select" && (
                        <div className="space-y-4 py-2">
                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(false);
                                    // Check if dropped items contain folders
                                    const items = e.dataTransfer.items;
                                    if (items && items.length > 0) {
                                        const hasFolder = Array.from(items).some((item) => {
                                            const entry = item.webkitGetAsEntry?.();
                                            return entry?.isDirectory;
                                        });
                                        if (hasFolder) {
                                            handleImportFolderSelected(items);
                                            return;
                                        }
                                    }
                                    handleImportFilesSelected(e.dataTransfer.files);
                                }}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragOver
                                    ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                    }`}
                                onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.multiple = true;
                                    input.accept = ACCEPTED_EXTENSIONS;
                                    input.onchange = (e) => handleImportFilesSelected((e.target as HTMLInputElement).files);
                                    input.click();
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? "bg-cyan-500/20" : "bg-white/5"
                                        }`}>
                                        <FileUp className={`h-7 w-7 ${isDragOver ? "text-cyan-400" : "text-muted-foreground"}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {isDragOver ? "Déposez vos fichiers ou dossiers ici" : "Glissez-déposez ou cliquez pour sélectionner"}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            PDF, Word, Excel, PowerPoint, Images, Vidéos — 50 Mo max (2 Go vidéos)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Folder import button */}
                            <button
                                onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.webkitdirectory = true;
                                    input.multiple = true;
                                    input.onchange = (e) => {
                                        const files = (e.target as HTMLInputElement).files;
                                        if (files) handleImportFilesSelected(files);
                                    };
                                    input.click();
                                }}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-sm text-muted-foreground hover:text-violet-300"
                            >
                                <FolderUp className="h-4 w-4" />
                                Importer un dossier complet
                            </button>

                            {/* Selected files list */}
                            {importFiles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {importFiles.length} fichier{importFiles.length > 1 ? "s" : ""} sélectionné{importFiles.length > 1 ? "s" : ""}
                                    </p>
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                                        {importFiles.map((f) => (
                                            <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                                                {getImportFileIcon(f.type)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{f.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{formatSize(f.size)}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveImportFile(f.id); }}
                                                    title="Retirer le fichier"
                                                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-red-400 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: analyzing */}
                    {importStep === "analyzing" && (
                        <div className="py-6">
                            <AIProgressIndicator
                                phase="analyzing"
                                operationLabel="Classification IA"
                                operationDescription={`Gemini analyse ${importFiles.length} fichier${importFiles.length > 1 ? "s" : ""} — extraction de tags et classement`}
                                totalItems={importFiles.length}
                                processedItems={importFiles.filter(f => f.analyzed).length}
                                colorTheme="cyan"
                                showTimer={true}
                                fileStatuses={importFiles.map((f): AIProgressFileStatus => ({
                                    name: f.name,
                                    status: f.analyzed ? "done" : "processing",
                                    confidence: f.analyzed ? f.confidence : undefined,
                                }))}
                            />
                        </div>
                    )}

                    {/* Step: review AI suggestions */}
                    {importStep === "review" && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                                <p className="text-xs text-emerald-300">
                                    Analyse terminée ! Vérifiez les suggestions ci-dessous avant d&apos;importer.
                                </p>
                            </div>

                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                {importFiles.map((f) => (
                                    <Card key={f.id} className="glass border-white/5 overflow-hidden">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                {getImportFileIcon(f.type)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{f.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{formatSize(f.size)}</p>
                                                </div>
                                                <Badge className="text-[10px] h-5 bg-cyan-500/15 text-cyan-300 border-cyan-500/20">
                                                    {f.confidence}% confiance
                                                </Badge>
                                            </div>

                                            {/* Suggested tags */}
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Tag className="h-3 w-3" /> Tags suggérés
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {f.suggestedTags.map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 flex items-center gap-1"
                                                        >
                                                            {tag}
                                                            <button
                                                                onClick={() => handleUpdateImportTag(f.id, i, "")}
                                                                title="Supprimer le tag"
                                                                className="ml-0.5 hover:text-red-400 transition-colors"
                                                            >
                                                                <X className="h-2.5 w-2.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AI Reasoning & Suggested Path */}
                                            {f.reasoning && (
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Brain className="h-3 w-3 text-cyan-400" /> Raisonnement IA
                                                    </p>
                                                    <p className="text-[10px] text-cyan-300/80 bg-cyan-500/5 rounded-md px-2 py-1.5 border border-cyan-500/10">
                                                        {f.reasoning}
                                                    </p>
                                                </div>
                                            )}

                                            {f.suggestedPath && (
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <FolderTree className="h-3 w-3" /> Chemin suggéré
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px]">
                                                        {f.suggestedPath.split(" > ").map((part, pi, arr) => (
                                                            <span key={pi} className="flex items-center gap-1">
                                                                <span className={`px-1.5 py-0.5 rounded ${
                                                                    f.newFoldersToCreate.includes(part)
                                                                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 border-dashed"
                                                                        : "bg-white/5 text-white/60"
                                                                }`}>
                                                                    {f.newFoldersToCreate.includes(part) && "✨ "}{part}
                                                                </span>
                                                                {pi < arr.length - 1 && <span className="text-white/20">›</span>}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {f.newFoldersToCreate.length > 0 && (
                                                        <p className="text-[9px] text-emerald-400/60 flex items-center gap-1">
                                                            <FolderPlus className="h-2.5 w-2.5" />
                                                            {f.newFoldersToCreate.length} nouveau(x) dossier(s) sera/seront créé(s)
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Suggested folder */}
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Folder className="h-3 w-3" /> Dossier de destination
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {folders.map((fl) => {
                                                        // Calculate depth for indent
                                                        let depth = 0;
                                                        let pid = fl.parentFolderId;
                                                        while (pid) {
                                                            depth++;
                                                            const parent = folders.find((p) => p.id === pid);
                                                            pid = parent?.parentFolderId ?? null;
                                                        }
                                                        return (
                                                            <button
                                                                key={fl.id}
                                                                onClick={() => handleUpdateImportFolder(f.id, fl.id)}
                                                                className={`text-[10px] px-2 py-1 rounded-md transition-all ${f.suggestedFolderId === fl.id
                                                                    ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30"
                                                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                                                    }`}
                                                            >
                                                                {depth > 0 ? "└ ".repeat(depth) : ""}{fl.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {/* Warning si aucun dossier sélectionné */}
                                                {(!f.suggestedFolderId || f.suggestedFolderId.startsWith("__")) && (
                                                    <div className="flex items-center gap-1.5 mt-1 px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                                                        <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                                                        <span className="text-[10px] text-amber-300">Aucun dossier sélectionné — veuillez choisir un dossier de destination</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseImport} className="border-white/10">
                            Annuler
                        </Button>
                        {importStep === "select" && (
                            <Button
                                onClick={handleAnalyzeWithAI}
                                disabled={importFiles.length === 0}
                                className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white border-0 gap-2"
                            >
                                <Brain className="h-4 w-4" />
                                Analyser avec l&apos;IA
                            </Button>
                        )}
                        {importStep === "review" && (() => {
                            const allFilesHaveFolder = importFiles.every(
                                (f) => f.suggestedFolderId && !f.suggestedFolderId.startsWith("__")
                            );
                            return (
                                <Button
                                    onClick={handleConfirmImport}
                                    disabled={importLoading || !allFilesHaveFolder}
                                    title={!allFilesHaveFolder ? "Tous les fichiers doivent avoir un dossier de destination" : undefined}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 gap-2"
                                >
                                    {importLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : !allFilesHaveFolder ? (
                                        <AlertTriangle className="h-4 w-4" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    {importLoading
                                        ? "Import en cours…"
                                        : !allFilesHaveFolder
                                            ? "Classement requis"
                                            : `Importer ${importFiles.length} document${importFiles.length > 1 ? "s" : ""}`
                                    }
                                </Button>
                            );
                        })()}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══ TAG MANAGEMENT DIALOG ═══ */}
            <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
                <DialogContent className="glass border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-violet-400" />
                            Gérer les tags
                        </DialogTitle>
                        <DialogDescription>
                            {tagEditDoc?.title ?? "Document"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Current tags */}
                        <div>
                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 block">Tags actuels</Label>
                            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                                {tagEditDoc?.tags.length === 0 && (
                                    <span className="text-[10px] text-zinc-500 italic">Aucun tag</span>
                                )}
                                {tagEditDoc?.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 flex items-center gap-1"
                                    >
                                        {t}
                                        <button
                                            onClick={() => handleRemoveTag(t)}
                                            title="Supprimer le tag"
                                            className="ml-0.5 hover:text-red-400 transition-colors"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Add tag input */}
                        <div>
                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 block">Ajouter un tag</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(tagInput); } }}
                                    placeholder="Saisir un tag…"
                                    className="h-8 text-xs bg-white/5 border-white/10"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddTag(tagInput)}
                                    disabled={!tagInput.trim()}
                                    className="h-8 text-xs border-white/10"
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        {/* Suggestions */}
                        <div>
                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 block">Suggestions</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {tagSuggestions
                                    .filter((s) => !tagEditDoc?.tags.includes(s))
                                    .map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleAddTag(suggestion)}
                                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/20 transition-all"
                                        >
                                            + {suggestion}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTagDialog(false)} className="border-white/10">
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══ REORGANIZATION DIALOG v2 ═══ */}
            <Dialog open={showReorgDialog} onOpenChange={(open) => { if (!open) { setShowReorgDialog(false); setReorgStep("mode"); } }}>
                <DialogContent className="glass border-white/10 max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-amber-400" />
                            Réorganisation Intelligente
                        </DialogTitle>
                        <DialogDescription>
                            {reorgStep === "mode" && "Choisissez le niveau d'intervention de l'IA sur vos documents."}
                            {reorgStep === "analyzing" && "L'IA analyse vos documents, votre arborescence et votre contexte métier..."}
                            {reorgStep === "preview" && "Voici le plan de réorganisation proposé par l'IA."}
                            {reorgStep === "executing" && "Application des recommandations en cours..."}
                            {reorgStep === "done" && "Réorganisation terminée !"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step: Mode Selection */}
                    {reorgStep === "mode" && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setReorgMode("classify")}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        reorgMode === "classify"
                                            ? "border-cyan-500/50 bg-cyan-500/10"
                                            : "border-white/10 hover:border-white/20 bg-white/5"
                                    }`}
                                >
                                    <Folder className="h-7 w-7 text-cyan-400 mb-2" />
                                    <h3 className="font-semibold text-xs mb-1">Classer</h3>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Range dans les dossiers existants. Tags, rétention et type de document recommandés.
                                    </p>
                                </button>
                                <button
                                    onClick={() => setReorgMode("reorganize")}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        reorgMode === "reorganize"
                                            ? "border-amber-500/50 bg-amber-500/10"
                                            : "border-white/10 hover:border-white/20 bg-white/5"
                                    }`}
                                >
                                    <FolderTree className="h-7 w-7 text-amber-400 mb-2" />
                                    <h3 className="font-semibold text-xs mb-1">Réorganiser</h3>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Crée des sous-dossiers par type et client. Applique tags et rétention.
                                    </p>
                                </button>
                                <button
                                    onClick={() => setReorgMode("deep_audit")}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        reorgMode === "deep_audit"
                                            ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/20"
                                            : "border-white/10 hover:border-white/20 bg-white/5"
                                    }`}
                                >
                                    <Brain className="h-7 w-7 text-violet-400 mb-2" />
                                    <h3 className="font-semibold text-xs mb-1">Audit Profond</h3>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Restructuration complète, confidentialité, rétention OHADA, restrictions d&apos;accès.
                                    </p>
                                </button>
                            </div>
                            {reorgMode === "deep_audit" && (
                                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 space-y-1">
                                    <p className="text-[11px] text-violet-300/80 font-medium">L&apos;audit profond analyse :</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
                                        <span>• Déplacement intelligent</span>
                                        <span>• Tags métier automatiques</span>
                                        <span>• Type de document (FACT, CONT...)</span>
                                        <span>• Rétention OHADA (fiscal, social...)</span>
                                        <span>• Confidentialité (secret, confidentiel)</span>
                                        <span>• Visibilité dossier (privé, équipe)</span>
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-center text-muted-foreground">
                                {documents.length} document{documents.length > 1 ? "s" : ""} · {folders.length} dossier{folders.length > 1 ? "s" : ""}
                                {convexOrgDoc ? ` · ${(convexOrgDoc as any).nom ?? convexOrgDoc.name ?? ""}` : ""}
                            </p>
                        </div>
                    )}

                    {/* Step: Analyzing */}
                    {reorgStep === "analyzing" && (
                        <div className="py-8">
                            <AIProgressIndicator
                                phase="analyzing"
                                operationLabel={reorgMode === "deep_audit" ? "Audit Profond IA" : reorgMode === "reorganize" ? "Réorganisation IA" : "Classement IA"}
                                operationDescription={`Gemini analyse ${documents.length} documents et ${folders.length} dossiers`}
                                totalItems={documents.length}
                                colorTheme={reorgMode === "deep_audit" ? "violet" : "amber"}
                                showTimer={true}
                                compact={false}
                            />
                        </div>
                    )}

                    {/* Step: Preview */}
                    {reorgStep === "preview" && reorgPlan && (
                        <div className="space-y-4">
                            {/* Organization Analysis (deep_audit mode) */}
                            {reorgPlan.organizationAnalysis && (
                                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-3.5 w-3.5 text-violet-400" />
                                        <span className="text-[11px] font-medium text-violet-300">Analyse Organisationnelle</span>
                                    </div>
                                    {reorgPlan.organizationAnalysis.keyInsights && (
                                        <p className="text-[10px] text-muted-foreground">{reorgPlan.organizationAnalysis.keyInsights}</p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                        {reorgPlan.organizationAnalysis.detectedSector && (
                                            <Badge className="text-[10px] h-4 bg-violet-500/10 text-violet-300 border-violet-500/20">
                                                Secteur: {reorgPlan.organizationAnalysis.detectedSector}
                                            </Badge>
                                        )}
                                        {reorgPlan.organizationAnalysis.detectedClients?.map((c) => (
                                            <Badge key={c} className="text-[10px] h-4 bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                                                Client: {c}
                                            </Badge>
                                        ))}
                                        {reorgPlan.organizationAnalysis.detectedProjects?.map((p) => (
                                            <Badge key={p} className="text-[10px] h-4 bg-amber-500/10 text-amber-300 border-amber-500/20">
                                                Projet: {p}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <p className="text-xs text-amber-300/80">{reorgPlan.summary}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
                                    <span>{reorgPlan.stats.documentsToMove} à déplacer</span>
                                    <span>{reorgPlan.stats.documentsAlreadyCorrect} déjà corrects</span>
                                    {reorgPlan.stats.newFoldersToCreate > 0 && (
                                        <span className="text-emerald-400">{reorgPlan.stats.newFoldersToCreate} dossier(s) à créer</span>
                                    )}
                                    {(reorgPlan.stats.tagsToApply ?? 0) > 0 && (
                                        <span className="text-cyan-400"><Tags className="h-2.5 w-2.5 inline mr-0.5" />{reorgPlan.stats.tagsToApply} tags</span>
                                    )}
                                    {(reorgPlan.stats.retentionToSet ?? 0) > 0 && (
                                        <span className="text-violet-400"><Archive className="h-2.5 w-2.5 inline mr-0.5" />{reorgPlan.stats.retentionToSet} rétentions</span>
                                    )}
                                    {(reorgPlan.stats.confidentialityToSet ?? 0) > 0 && (
                                        <span className="text-rose-400"><Shield className="h-2.5 w-2.5 inline mr-0.5" />{reorgPlan.stats.confidentialityToSet} confidentialités</span>
                                    )}
                                </div>
                            </div>

                            {/* Moves list */}
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                {reorgPlan.moves.map((move, i) => (
                                    <div
                                        key={move.docId || i}
                                        className={`p-3 rounded-lg border transition-all ${
                                            !move.shouldMove && !move.recommendations
                                                ? "border-white/5 bg-white/[0.02] opacity-60"
                                                : move.selected
                                                    ? "border-amber-500/20 bg-amber-500/5"
                                                    : "border-white/10 bg-white/5 opacity-50"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <button
                                                onClick={() => {
                                                    setReorgPlan((prev) => {
                                                        if (!prev) return prev;
                                                        const newMoves = [...prev.moves];
                                                        newMoves[i] = { ...newMoves[i], selected: !newMoves[i].selected };
                                                        return { ...prev, moves: newMoves };
                                                    });
                                                }}
                                                className="mt-0.5 flex-shrink-0"
                                            >
                                                {move.selected
                                                    ? <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                                    : <div className="h-4 w-4 rounded-full border border-white/20" />
                                                }
                                            </button>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-medium truncate">{move.docTitle}</p>
                                                    <Badge className="text-[9px] h-4 bg-white/5 text-white/40 border-white/10 flex-shrink-0">
                                                        {Math.round(move.confidence * 100)}%
                                                    </Badge>
                                                </div>

                                                {move.shouldMove ? (
                                                    <div className="flex items-center gap-2 text-[10px]">
                                                        <span className="text-red-300/60 truncate max-w-[120px]">
                                                            {move.currentFolderName || "Non classé"}
                                                        </span>
                                                        <ArrowRight className="h-3 w-3 text-amber-400 flex-shrink-0" />
                                                        <span className="text-emerald-300 truncate">
                                                            {move.targetFolderPath}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-emerald-400/60">✓ Déjà au bon endroit</p>
                                                )}

                                                {move.reasoning && (
                                                    <p className="text-[9px] text-muted-foreground italic">{move.reasoning}</p>
                                                )}

                                                {move.newFoldersToCreate.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[9px] text-emerald-400/60">
                                                        <FolderPlus className="h-2.5 w-2.5" />
                                                        Nouveau(x): {move.newFoldersToCreate.join(", ")}
                                                    </div>
                                                )}

                                                {/* Recommendations badges (v2) */}
                                                {move.recommendations && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {move.recommendations.suggestedDocTypeCode && (
                                                            <Badge className="text-[10px] h-3.5 bg-blue-500/10 text-blue-300 border-blue-500/20 gap-0.5">
                                                                <FileText className="h-2 w-2" />
                                                                {move.recommendations.suggestedDocTypeCode}
                                                            </Badge>
                                                        )}
                                                        {move.recommendations.suggestedRetentionSlug && (
                                                            <Badge className="text-[10px] h-3.5 bg-violet-500/10 text-violet-300 border-violet-500/20 gap-0.5">
                                                                <Archive className="h-2 w-2" />
                                                                {move.recommendations.suggestedRetentionSlug}
                                                            </Badge>
                                                        )}
                                                        {move.recommendations.suggestedConfidentiality && (
                                                            <Badge className={`text-[10px] h-3.5 gap-0.5 ${
                                                                move.recommendations.suggestedConfidentiality === "secret"
                                                                    ? "bg-red-500/10 text-red-300 border-red-500/20"
                                                                    : move.recommendations.suggestedConfidentiality === "confidential"
                                                                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                                                        : "bg-zinc-500/10 text-zinc-300 border-zinc-500/20"
                                                            }`}>
                                                                <Shield className="h-2 w-2" />
                                                                {move.recommendations.suggestedConfidentiality}
                                                            </Badge>
                                                        )}
                                                        {move.recommendations.suggestedTags?.slice(0, 4).map((tag) => (
                                                            <Badge key={tag} className="text-[10px] h-3.5 bg-white/5 text-zinc-400 border-white/10">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {(move.recommendations.suggestedTags?.length ?? 0) > 4 && (
                                                            <Badge className="text-[10px] h-3.5 bg-white/5 text-zinc-500 border-white/10">
                                                                +{(move.recommendations.suggestedTags?.length ?? 0) - 4}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                                {move.recommendations?.retentionReasoning && (
                                                    <p className="text-[10px] text-violet-400/60 mt-0.5">{move.recommendations.retentionReasoning}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Folder recommendations (deep_audit) */}
                            {reorgPlan.folderRecommendations && reorgPlan.folderRecommendations.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1">
                                        <Folder className="h-3 w-3" /> Recommandations Dossiers
                                    </p>
                                    <div className="space-y-1.5">
                                        {reorgPlan.folderRecommendations.map((fr) => {
                                            const folderName = folders.find((f) => f.id === fr.folderId)?.name ?? fr.folderId;
                                            return (
                                                <div key={fr.folderId} className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/5 text-[10px]">
                                                    <Folder className="h-3 w-3 text-violet-400 shrink-0" />
                                                    <span className="font-medium truncate">{folderName}</span>
                                                    <div className="flex gap-1 ml-auto shrink-0">
                                                        {fr.suggestedRetentionSlug && (
                                                            <Badge className="text-[10px] h-3.5 bg-violet-500/10 text-violet-300 border-violet-500/20">{fr.suggestedRetentionSlug}</Badge>
                                                        )}
                                                        {fr.suggestedConfidentiality && (
                                                            <Badge className="text-[10px] h-3.5 bg-amber-500/10 text-amber-300 border-amber-500/20">{fr.suggestedConfidentiality}</Badge>
                                                        )}
                                                        {fr.suggestedVisibility && (
                                                            <Badge className="text-[10px] h-3.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{fr.suggestedVisibility}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Executing */}
                    {reorgStep === "executing" && (
                        <div className="py-8">
                            <AIProgressIndicator
                                phase="applying"
                                progress={reorgProgress}
                                operationLabel="Application des recommandations"
                                operationDescription={reorgPlan ? `${reorgPlan.stats.documentsToMove} déplacement(s), ${reorgPlan.stats.newFoldersToCreate} dossier(s) à créer` : "Mise à jour des documents..."}
                                colorTheme="emerald"
                                showTimer={true}
                                compact={true}
                            />
                        </div>
                    )}

                    {/* Step: Done */}
                    {reorgStep === "done" && reorgResult && (
                        <div className="flex flex-col gap-6 py-6">
                            {/* Header */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                                </div>
                                <p className="text-sm font-semibold">Réorganisation terminée !</p>
                            </div>

                            {/* Section: Documents */}
                            {(reorgResult.moved > 0 || reorgResult.tagged > 0 || reorgResult.typed > 0 || reorgResult.archived > 0) && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> Documents
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                                            <p className="text-xl font-bold text-amber-400">{reorgResult.moved}</p>
                                            <p className="text-[10px] text-muted-foreground">Déplacés</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                                            <p className="text-xl font-bold text-blue-400">{reorgResult.tagged}</p>
                                            <p className="text-[10px] text-muted-foreground">Tagués</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                                            <p className="text-xl font-bold text-purple-400">{reorgResult.typed}</p>
                                            <p className="text-[10px] text-muted-foreground">Typés</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                                            <p className="text-xl font-bold text-orange-400">{reorgResult.archived}</p>
                                            <p className="text-[10px] text-muted-foreground">Rétentions</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Dossiers */}
                            {(reorgResult.foldersCreated > 0 || reorgResult.foldersCleanedUp > 0) && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                                        <FolderTree className="h-3.5 w-3.5" /> Restructuration dossiers
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {reorgResult.foldersCreated > 0 && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                <FolderPlus className="h-5 w-5 text-emerald-400 shrink-0" />
                                                <div>
                                                    <p className="text-lg font-bold text-emerald-400">{reorgResult.foldersCreated}</p>
                                                    <p className="text-[10px] text-muted-foreground">Dossiers créés</p>
                                                </div>
                                            </div>
                                        )}
                                        {reorgResult.foldersCleanedUp > 0 && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                                <Trash2 className="h-5 w-5 text-rose-400 shrink-0" />
                                                <div>
                                                    <p className="text-lg font-bold text-rose-400">{reorgResult.foldersCleanedUp}</p>
                                                    <p className="text-[10px] text-muted-foreground">Dossiers vides supprimés</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Les dossiers supprimés sont dans la Poubelle et peuvent être restaurés.
                                    </p>
                                </div>
                            )}

                            {/* Section: Classement */}
                            {(reorgResult.cellsCreated > 0 || reorgResult.cellsRemoved > 0) && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5" /> Arborescence de classement
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {reorgResult.cellsCreated > 0 && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-emerald-400 font-bold">+{reorgResult.cellsCreated}</span>
                                                <span className="text-muted-foreground">cellule(s) ajoutée(s)</span>
                                            </div>
                                        )}
                                        {reorgResult.cellsRemoved > 0 && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-rose-400 font-bold">-{reorgResult.cellsRemoved}</span>
                                                <span className="text-muted-foreground">cellule(s) désactivée(s)</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        La structure de classement a été synchronisée avec la nouvelle arborescence.
                                    </p>
                                </div>
                            )}

                            {/* Aucune modification */}
                            {reorgResult.moved === 0 && reorgResult.tagged === 0 && reorgResult.typed === 0 && reorgResult.archived === 0 && reorgResult.foldersCreated === 0 && reorgResult.foldersCleanedUp === 0 && (
                                <p className="text-xs text-muted-foreground text-center">Aucune modification n&apos;a été nécessaire.</p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {reorgStep !== "executing" && (
                            <Button
                                variant="outline"
                                onClick={() => { setShowReorgDialog(false); setReorgStep("mode"); }}
                                className="border-white/10"
                            >
                                {reorgStep === "done" ? "Fermer" : "Annuler"}
                            </Button>
                        )}
                        {reorgStep === "mode" && (
                            <Button
                                onClick={async () => {
                                    setReorgStep("analyzing");
                                    try {
                                        const treeData = (folderTreeForReorg ?? []).map((f) => ({
                                            id: String(f.id),
                                            name: f.name,
                                            path: f.path,
                                            depth: f.depth,
                                            parentFolderId: f.parentFolderId ? String(f.parentFolderId) : null,
                                            tags: f.tags,
                                            description: f.description,
                                        }));

                                        const docsData = documents.map((d) => {
                                            const folder = folders.find((fl) => fl.id === d.folderId);
                                            const docType = documentTypes?.find((dt: { _id: string }) => dt._id === (d as unknown as Record<string, unknown>).documentTypeId);
                                            return {
                                                id: d.id,
                                                title: d.title,
                                                fileName: undefined as string | undefined,
                                                excerpt: d.excerpt || undefined,
                                                tags: d.tags,
                                                currentFolderId: d.folderId ?? null,
                                                currentFolderName: folder?.name ?? null,
                                                status: d.status,
                                                documentTypeCode: docType?.code as string | undefined,
                                                archiveCategorySlug: d.archiveCategorySlug,
                                            };
                                        });

                                        // ── Appel deepReorganize (v2) ou reorganizeDocuments (legacy) ──
                                        let result: { plan?: unknown; error?: string; rawResponse?: string };

                                        if (reorgMode === "deep_audit" || reorgMode === "reorganize" || reorgMode === "classify") {
                                            // Build archive categories list
                                            const archiveCats = (archiveCategories ?? []).map((c: Record<string, unknown>) => ({
                                                slug: String(c.slug ?? ""),
                                                name: String(c.name ?? ""),
                                                retentionYears: Number(c.retentionYears ?? 5),
                                                scope: String(c.scope ?? "document"),
                                            }));
                                            // Build document types list
                                            const docTypes = (documentTypes ?? []).map((dt: Record<string, unknown>) => ({
                                                id: String(dt._id ?? ""),
                                                code: String(dt.code ?? ""),
                                                nom: String(dt.nom ?? ""),
                                                retentionCategorySlug: dt.retentionCategorySlug as string | undefined,
                                            }));

                                            const reorgDepthConfig = convexOrgDoc?.config?.classement
                                                ? { maxDepth: (convexOrgDoc.config as any).classement.maxDepth ?? 3, depthStrategy: (convexOrgDoc.config as any).classement.depthStrategy ?? "intelligente" }
                                                : undefined;

                                            result = await deepReorganizeAction({
                                                documents: docsData,
                                                folderTree: treeData,
                                                archiveCategories: archiveCats,
                                                documentTypes: docTypes,
                                                orgContext: {
                                                    name: (convexOrgDoc as Record<string, unknown>)?.nom as string ?? "Organisation",
                                                    sector: (convexOrgDoc as Record<string, unknown>)?.sector as string | undefined,
                                                    country: (convexOrgDoc as Record<string, unknown>)?.country as string | undefined,
                                                    totalDocuments: documents.length,
                                                    totalFolders: folders.length,
                                                },
                                                mode: reorgMode,
                                                depthConfig: reorgDepthConfig,
                                            });
                                        } else {
                                            const reorgDepthConfig = convexOrgDoc?.config?.classement
                                                ? { maxDepth: (convexOrgDoc.config as any).classement.maxDepth ?? 3, depthStrategy: (convexOrgDoc.config as any).classement.depthStrategy ?? "intelligente" }
                                                : undefined;

                                            result = await reorganizeDocumentsAction({
                                                documents: docsData.map(d => ({
                                                    id: d.id, title: d.title, fileName: undefined,
                                                    tags: d.tags, currentFolderId: d.currentFolderId, currentFolderName: d.currentFolderName,
                                                })),
                                                folderTree: treeData,
                                                mode: reorgMode as "classify" | "reorganize",
                                                depthConfig: reorgDepthConfig,
                                            });
                                        }

                                        if (result.error || !result.plan) {
                                            toast.error("L'IA n'a pas pu analyser les documents.");
                                            setReorgStep("mode");
                                        } else {
                                            const plan = result.plan as ReorgPlan;

                                            // Remap AI-generated placeholder docIds back to real Convex IDs
                                            const docByTitle = new Map<string, string>();
                                            const docByIndex = new Map<string, string>();
                                            docsData.forEach((d, idx) => {
                                                docByTitle.set(d.title.toLowerCase(), d.id);
                                                docByIndex.set(`doc_${idx + 1}`, d.id);
                                                docByIndex.set(String(idx + 1), d.id);
                                            });

                                            plan.moves = plan.moves.map((m: ReorgMove) => {
                                                let resolvedDocId = m.docId;
                                                if (!docsData.some(d => d.id === m.docId)) {
                                                    if (docByIndex.has(m.docId)) {
                                                        resolvedDocId = docByIndex.get(m.docId)!;
                                                    } else if (m.docTitle && docByTitle.has(m.docTitle.toLowerCase())) {
                                                        resolvedDocId = docByTitle.get(m.docTitle.toLowerCase())!;
                                                    }
                                                }

                                                // ── Infer missing sub-folders from targetFolderPath ──
                                                let newFolders = m.newFoldersToCreate ?? [];
                                                let parentForNew = m.parentFolderIdForNew ?? m.targetFolderId;
                                                if (newFolders.length === 0 && m.targetFolderPath && m.targetFolderPath.includes(">")) {
                                                    const pathSegments = m.targetFolderPath.split(/\s*>\s*/).filter(Boolean);
                                                    const childrenMap = new Map<string, Map<string, string>>();
                                                    treeData.forEach(f => {
                                                        const parentKey = f.parentFolderId ?? "root";
                                                        if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, new Map());
                                                        childrenMap.get(parentKey)!.set(f.name.toLowerCase(), f.id);
                                                    });
                                                    let currentParentId: string = "root";
                                                    let missingStartIdx = 0;
                                                    for (let si = 0; si < pathSegments.length; si++) {
                                                        const segName = pathSegments[si].trim().toLowerCase();
                                                        const children = childrenMap.get(currentParentId);
                                                        if (children && children.has(segName)) {
                                                            currentParentId = children.get(segName)!;
                                                            missingStartIdx = si + 1;
                                                        } else break;
                                                    }
                                                    if (missingStartIdx < pathSegments.length) {
                                                        newFolders = pathSegments.slice(missingStartIdx);
                                                        if (currentParentId !== "root") parentForNew = currentParentId;
                                                    }
                                                }

                                                // In deep mode, mark as selected if there's any recommendation (even if not moving)
                                                const hasRecommendation = !!(m.recommendations?.suggestedTags?.length
                                                    || m.recommendations?.suggestedDocTypeCode
                                                    || m.recommendations?.suggestedRetentionSlug);

                                                return {
                                                    ...m,
                                                    docId: resolvedDocId,
                                                    newFoldersToCreate: newFolders,
                                                    parentFolderIdForNew: parentForNew,
                                                    selected: m.shouldMove || hasRecommendation,
                                                };
                                            });

                                            setReorgPlan(plan);
                                            setReorgStep("preview");
                                            toast.success(reorgMode === "deep_audit"
                                                ? `Plan d'audit profond généré`
                                                : `Plan de réorganisation généré`);
                                        }
                                    } catch (err) {
                                        console.error("[Reorg] AI error:", err);
                                        toast.error("Erreur lors de l'analyse IA.");
                                        setReorgStep("mode");
                                    }
                                }}
                                disabled={documents.length === 0}
                                className={`text-white border-0 gap-2 ${
                                    reorgMode === "deep_audit"
                                        ? "bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600"
                                        : "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
                                }`}
                            >
                                <Brain className="h-4 w-4" />
                                {reorgMode === "deep_audit" ? "Audit Profond IA" : "Analyser avec l'IA"}
                            </Button>
                        )}
                        {reorgStep === "preview" && reorgPlan && (
                            <Button
                                onClick={async () => {
                                    setReorgStep("executing");
                                    setReorgLoading(true);
                                    const selectedMoves = reorgPlan.moves.filter((m) => m.selected);
                                    let foldersCreated = 0;

                                    try {
                                        if (!convexOrgId) {
                                            toast.error("Organisation non trouvée. Rechargez la page.");
                                            setReorgStep("preview");
                                            setReorgLoading(false);
                                            return;
                                        }

                                        const realFolderIds = new Set(folders.map((f) => f.id));
                                        const isRealFolderId = (id: string | null | undefined): boolean =>
                                            !!id && !id.startsWith("__") && !id.startsWith("new_") && realFolderIds.has(id);

                                        // 1. Create new folders
                                        const createdFolderMap = new Map<string, string>();
                                        const movesWithFolders = selectedMoves.filter(m => m.shouldMove);
                                        for (let i = 0; i < movesWithFolders.length; i++) {
                                            const move = movesWithFolders[i];
                                            setReorgProgress(((i + 1) / (movesWithFolders.length + selectedMoves.length)) * 50);

                                            if (move.newFoldersToCreate.length > 0) {
                                                let parentId: Id<"folders"> | undefined = undefined;
                                                if (isRealFolderId(move.parentFolderIdForNew)) parentId = move.parentFolderIdForNew as Id<"folders">;
                                                else if (isRealFolderId(move.targetFolderId)) parentId = move.targetFolderId as Id<"folders">;
                                                if (!parentId && move.parentFolderIdForNew && createdFolderMap.has(move.parentFolderIdForNew))
                                                    parentId = createdFolderMap.get(move.parentFolderIdForNew) as Id<"folders">;

                                                for (const folderName of move.newFoldersToCreate) {
                                                    const cacheKey = `${parentId ?? "root"}_${folderName}`;
                                                    if (createdFolderMap.has(cacheKey)) {
                                                        parentId = createdFolderMap.get(cacheKey) as Id<"folders">;
                                                        continue;
                                                    }
                                                    try {
                                                        const folderResult = await getOrCreateFolderMut({
                                                            name: folderName,
                                                            organizationId: convexOrgId!,
                                                            createdBy: user?.email || "system",
                                                            parentFolderId: parentId,
                                                        });
                                                        createdFolderMap.set(cacheKey, folderResult.id as string);
                                                        parentId = folderResult.id;
                                                        if (folderResult.created) foldersCreated++;
                                                    } catch (e) {
                                                        console.warn(`[Reorg] Failed to create folder "${folderName}":`, e);
                                                    }
                                                }
                                            }
                                        }

                                        // 2. Build batch recommendations (v2: all-in-one mutation)
                                        setReorgProgress(55);
                                        const docIds = new Set(documents.map((d) => d.id));
                                        const docTypeByCode = new Map(
                                            (documentTypes ?? []).map((dt: Record<string, unknown>) => [String(dt.code), String(dt._id)])
                                        );

                                        const recommendations = selectedMoves
                                            .filter(m => docIds.has(m.docId))
                                            .map(m => {
                                                // Resolve target folder
                                                let targetFolderId: string | undefined = undefined;
                                                if (m.shouldMove) {
                                                    if (m.newFoldersToCreate.length > 0) {
                                                        // Walk created folders to find deepest
                                                        let parentId = m.parentFolderIdForNew ?? m.targetFolderId;
                                                        for (const fn of m.newFoldersToCreate) {
                                                            const key = `${parentId ?? "root"}_${fn}`;
                                                            if (createdFolderMap.has(key)) parentId = createdFolderMap.get(key)!;
                                                        }
                                                        if (parentId && !parentId.startsWith("__")) targetFolderId = parentId;
                                                    } else if (isRealFolderId(m.targetFolderId)) {
                                                        targetFolderId = m.targetFolderId;
                                                    } else if (createdFolderMap.has(m.targetFolderId)) {
                                                        targetFolderId = createdFolderMap.get(m.targetFolderId);
                                                    }
                                                }

                                                // Resolve document type ID from code
                                                const docTypeId = m.recommendations?.suggestedDocTypeCode
                                                    ? docTypeByCode.get(m.recommendations.suggestedDocTypeCode) ?? undefined
                                                    : undefined;

                                                return {
                                                    docId: m.docId,
                                                    targetFolderId,
                                                    tags: m.recommendations?.suggestedTags,
                                                    documentTypeId: docTypeId,
                                                    archiveCategorySlug: m.recommendations?.suggestedRetentionSlug,
                                                };
                                            });

                                        setReorgProgress(70);

                                        // 3. Apply all recommendations in one batch
                                        const applyResult = await batchApplyAIMut({
                                            recommendations,
                                            userId: user?.email || "system",
                                        });

                                        setReorgProgress(80);

                                        // 4. Phase D: Nettoyer les dossiers vides
                                        let foldersCleanedUp = 0;
                                        if (convexOrgId) {
                                            try {
                                                const cleanupResult = await cleanupEmptyFoldersMut({ organizationId: convexOrgId });
                                                foldersCleanedUp = cleanupResult.cleaned;
                                            } catch (cleanupErr) {
                                                console.warn("[Reorg] Cleanup warning:", cleanupErr);
                                            }
                                        }

                                        setReorgProgress(90);

                                        // 5. Phase E: Synchroniser l'arborescence de classement
                                        let cellsCreated = 0;
                                        let cellsRemoved = 0;
                                        if (activeStructure?._id && convexOrgId) {
                                            try {
                                                const syncResult = await syncFromFoldersMut({
                                                    filingStructureId: activeStructure._id,
                                                    organizationId: convexOrgId,
                                                });
                                                cellsCreated = syncResult.cellsCreated;
                                                cellsRemoved = syncResult.cellsRemoved;
                                            } catch (syncErr) {
                                                console.warn("[Reorg] Filing sync warning:", syncErr);
                                            }
                                        }

                                        setReorgProgress(100);
                                        setReorgResult({
                                            moved: applyResult.moved,
                                            foldersCreated,
                                            tagged: applyResult.tagged,
                                            typed: applyResult.typed,
                                            archived: applyResult.archived,
                                            foldersCleanedUp,
                                            cellsCreated,
                                            cellsRemoved,
                                        });
                                        setReorgStep("done");
                                        const parts = [`${applyResult.moved} déplacé(s)`];
                                        if (foldersCreated > 0) parts.push(`${foldersCreated} dossier(s) créé(s)`);
                                        if (foldersCleanedUp > 0) parts.push(`${foldersCleanedUp} dossier(s) vide(s) supprimé(s)`);
                                        if (applyResult.tagged > 0) parts.push(`${applyResult.tagged} tagué(s)`);
                                        if (applyResult.typed > 0) parts.push(`${applyResult.typed} typé(s)`);
                                        if (applyResult.archived > 0) parts.push(`${applyResult.archived} rétention(s) appliquée(s)`);
                                        if (cellsCreated > 0 || cellsRemoved > 0) parts.push(`classement restructuré (+${cellsCreated}/-${cellsRemoved})`);
                                        toast.success(`Réorganisation terminée : ${parts.join(", ")}`);
                                    } catch (err) {
                                        console.error("[Reorg] Execution error:", err);
                                        toast.error("Erreur lors de la réorganisation.");
                                        setReorgStep("preview");
                                    }
                                    setReorgLoading(false);
                                }}
                                disabled={reorgLoading || !reorgPlan.moves.some((m) => m.selected)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Appliquer ({reorgPlan.moves.filter((m) => m.selected).length} action{reorgPlan.moves.filter((m) => m.selected).length > 1 ? "s" : ""})
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ShareDialog 
                isOpen={showShareDialog} 
                onClose={() => setShowShareDialog(false)} 
                itemId={shareTarget?.id || null} 
                itemType={shareTarget?.type || null} 
            />

            <ManageAccessDialog
                isOpen={showManageAccessDialog}
                onClose={() => setShowManageAccessDialog(false)}
                itemId={manageAccessTargetId}
            />

            {/* ── Dialog: Approbation + Reclassement ──────────────── */}
            <Dialog open={showApprovalDialog} onOpenChange={(open) => { if (!open) { setShowApprovalDialog(false); setApprovalDocId(null); } }}>
                <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            Approuver et classer le document
                        </DialogTitle>
                        <DialogDescription>
                            Choisissez le dossier de destination pour ce document approuvé.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        {/* Info document */}
                        {approvalDocId && (() => {
                            const doc = documents.find((d) => d.id === approvalDocId);
                            return doc ? (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm font-medium">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Par {doc.author} · {doc.updatedAt}
                                    </p>
                                    {doc.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {doc.tags.map((t) => (
                                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        {/* Sélection du dossier */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Dossier de destination</Label>
                            <Select value={approvalTargetFolderId} onValueChange={setApprovalTargetFolderId}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Choisir un dossier..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a2e] border-white/10">
                                    {/* Dossier actuel (par défaut) */}
                                    {approvalDocId && (() => {
                                        const doc = documents.find((d) => d.id === approvalDocId);
                                        const currentFolder = folders.find((f) => f.id === doc?.folderId);
                                        return currentFolder ? (
                                            <SelectItem value={currentFolder.id} className="text-sm">
                                                <span className="flex items-center gap-2">
                                                    <FolderOpen className="h-3 w-3 text-amber-400" />
                                                    {currentFolder.name} (actuel)
                                                </span>
                                            </SelectItem>
                                        ) : null;
                                    })()}
                                    {/* Tous les autres dossiers */}
                                    {folders
                                        .filter((f) => !f.id.startsWith("__") && f.id !== documents.find((d) => d.id === approvalDocId)?.folderId)
                                        .map((f) => (
                                            <SelectItem key={f.id} value={f.id} className="text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Folder className="h-3 w-3 text-muted-foreground" />
                                                    {f.name}
                                                </span>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setShowApprovalDialog(false); setApprovalDocId(null); }}
                            className="border-white/10"
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleConfirmApproval}
                            className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Approuver et classer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Déplacement en masse ────────────────── */}
            <Dialog open={showBatchMoveDialog} onOpenChange={(open) => { if (!open) setShowBatchMoveDialog(false); }}>
                <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-400">
                            <FolderUp className="h-5 w-5" />
                            Déplacer {selectionStats.files} document{selectionStats.files > 1 ? "s" : ""}
                        </DialogTitle>
                        <DialogDescription>
                            Choisissez le dossier de destination pour les documents sélectionnés.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        {/* Liste des documents sélectionnés */}
                        <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-lg bg-white/5 border border-white/10">
                            {selectedItems.filter((item) => item.type === "file").map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3 text-violet-400 flex-shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Sélecteur de dossier */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Dossier de destination</Label>
                            <Select value={batchMoveTargetFolderId} onValueChange={setBatchMoveTargetFolderId}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Choisir un dossier..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a2e] border-white/10 max-h-60">
                                    {folders
                                        .filter((f) => !f.id.startsWith("__"))
                                        .map((f) => (
                                            <SelectItem key={f.id} value={f.id} className="text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Folder className="h-3 w-3 text-muted-foreground" />
                                                    {f.name}
                                                </span>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBatchMoveDialog(false)}
                            className="border-white/10"
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleBatchMoveConfirm}
                            disabled={!batchMoveTargetFolderId}
                            className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 disabled:opacity-50"
                        >
                            <FolderUp className="h-3.5 w-3.5 mr-1.5" />
                            Déplacer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
