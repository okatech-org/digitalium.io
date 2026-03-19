"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Finder-Style Document Explorer
// 3 modes (grille/liste/colonnes) · DnD · Dossiers · Mes Documents par défaut
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
    FolderUp, Wand2, ArrowRight, CheckCircle2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// File-manager Finder components
import {
    ViewModeToggle,
    getInitialViewMode,
    BreadcrumbPath,
    FinderGridView,
    FinderListView,
    FinderColumnView,
} from "@/components/modules/file-manager";
import type {
    ViewMode,
    FileManagerFolder,
    FileManagerFile,
    DragMoveEvent,
    ListColumn,
} from "@/components/modules/file-manager";
import FolderDocumentContextMenu, {
    type ArchivePolicyData,
    type ArchiveCategoryOption,
} from "./FolderDocumentContextMenu";

// ─── Types ──────────────────────────────────────────────────────

type DocStatus = "draft" | "review" | "approved" | "archived" | "trashed";
type ImportStep = "select" | "analyzing" | "review" | "done";
type ReorgStep = "mode" | "analyzing" | "preview" | "executing" | "done";
type ReorgMode = "classify" | "reorganize";

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
}

interface ReorgPlan {
    moves: ReorgMove[];
    summary: string;
    stats: {
        totalDocuments: number;
        documentsToMove: number;
        documentsAlreadyCorrect: number;
        newFoldersToCreate: number;
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
    { value: "draft", label: "Brouillons" },
    { value: "review", label: "En révision" },
    { value: "approved", label: "Approuvés" },
    { value: "archived", label: "Archivés" },
];

// ─── Default System Folders (toujours présents) ────────────────
// Note: "Brouillon" est un statut de document (filtre), pas un dossier.
// Le Coffre-fort est géré dans iArchive (schema: isVault, isPerpetual).

const DEFAULT_SYSTEM_FOLDERS: FileManagerFolder[] = [
    { id: "__mes-documents", name: "Mes Documents", parentFolderId: null, tags: [], fileCount: 0, updatedAt: "", createdBy: "Système", isSystem: true },
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
                            <span className="text-[8px] text-violet-300 font-bold">{meta.authorInitials as string}</span>
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
    const { user, isAdmin } = useAuth();

    // ─── Convex: fetch filing structure ─────────────────────────
    // Resolve the org display name to a real Convex document ID
    const { convexOrgId } = useConvexOrgId();
    const { activeStructure } = useFilingStructures(convexOrgId);

    // Instead of raw cells, we now fetch actual folders that are synced from cells
    const convexFolders = useQuery(api.folders.listByOrg, convexOrgId ? { organizationId: convexOrgId } : "skip");
    const classifyDocumentsAction = useAction(api.aiSmartImport.classifyDocuments);
    const reorganizeDocumentsAction = useAction(api.aiSmartImport.reorganizeDocuments);
    const createFolderMut = useMutation(api.folders.create);
    const batchMoveToFolderMut = useMutation(api.documents.batchMoveToFolder);
    const syncFoldersMut = useMutation(api.filingCells.syncFoldersFromCells);
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
        convexOrgId ? { organizationId: convexOrgId } : {}
    );

    // ─── Convex: fetch trashed documents (for Poubelle) ─────────
    const convexTrashedDocs = useQuery(
        api.documents.listTrashed,
        convexOrgId ? { organizationId: convexOrgId } : {}
    );
    const restoreDocMut = useMutation(api.documents.restore);
    const permanentDeleteDocMut = useMutation(api.documents.permanentDelete);

    // ─── Convex: archive categories + metadata ───────────────────
    const archiveCategories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const setFolderArchiveMetaMut = useMutation(api.folderArchiveMetadata.setMetadata);
    const updateFolderMut = useMutation(api.folders.update);
    const removeFolderMut = useMutation(api.folders.remove);

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
            .map((f: any) => ({
                id: f._id,
                name: f.name,
                description: f.description,
                parentFolderId: f.parentFolderId ?? null,
                tags: f.tags ?? [],
                fileCount: f.fileCount ?? 0,
                updatedAt: new Date(f.updatedAt).toLocaleDateString("fr-FR"),
                createdBy: f.createdBy === "system" ? "Système" : f.createdBy,
                isSystem: false, // Only __mes-documents and __poubelle are true system folders
                metadata: {
                    filingCellId: f.filingCellId,
                    isArborescence: !!f.filingCellId, // Synced from filing structure
                },
            }));
    }, [convexFolders, visibleCellIds, isAdmin, accessLoading]);

    // ─── Merge: system folders + dynamic filing cells ───────────
    // No useEffect-based sync — compute directly to avoid loops
    const baseFolders = useMemo<FileManagerFolder[]>(
        () => [...DEFAULT_SYSTEM_FOLDERS, ...dynamicFolders],
        [dynamicFolders]
    );

    // ─── State ──────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<ViewMode>(() => getInitialViewMode());
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
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
            folderId: (d.folderId ?? d.parentFolderId ?? "__mes-documents") as string,
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

    // ─── Deferred: AI folder tree (only fetched when import dialog is open) ──
    const folderTreeWithPaths = useQuery(
        api.folders.getTreeWithPaths,
        showImportDialog && convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const [tagEditDocId, setTagEditDocId] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [newDocTitle, setNewDocTitle] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [importFiles, setImportFiles] = useState<ImportFileItem[]>([]);
    const [importStep, setImportStep] = useState<ImportStep>("select");
    const [isDragOver, setIsDragOver] = useState(false);

    // ─── Reorganization state ────────────────────────────────────
    const [showReorgDialog, setShowReorgDialog] = useState(false);
    const [reorgStep, setReorgStep] = useState<ReorgStep>("mode");
    const [reorgMode, setReorgMode] = useState<ReorgMode>("classify");
    const [reorgPlan, setReorgPlan] = useState<ReorgPlan | null>(null);
    const [reorgLoading, setReorgLoading] = useState(false);
    const [reorgProgress, setReorgProgress] = useState(0);
    const [reorgResult, setReorgResult] = useState<{ moved: number; foldersCreated: number } | null>(null);

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

    // ─── Breadcrumb path ────────────────────────────────────────
    const breadcrumbPath = useMemo(() => {
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
    }, [currentFolderId, folders]);

    // ─── Current view: folders + files at current level ─────────
    const currentFolders = useMemo(() => {
        return folders.filter((f) => f.parentFolderId === currentFolderId);
    }, [folders, currentFolderId]);

    const currentFiles = useMemo(() => {
        // POUBELLE: show trashed documents
        if (currentFolderId === "__poubelle") {
            if (!convexTrashedDocs) return [];
            return convexTrashedDocs.map((d) => ({
                id: d._id,
                name: d.title,
                type: "file" as const,
                size: d.fileSize ?? 0,
                date: new Date(d.trashedAt ?? d.updatedAt).toLocaleDateString("fr-FR"),
                metadata: {
                    status: "trashed" as DocStatus,
                    tags: d.tags ?? [],
                    authorInitials: d.createdBy?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "??",
                    author: d.createdBy ?? "Inconnu",
                    trashedAt: d.trashedAt,
                    trashedBy: d.trashedBy,
                    previousStatus: d.previousStatus,
                },
            }));
        }

        let docs = documents.filter((d) => d.folderId === (currentFolderId ?? "__mes-documents"));

        // If at root, show docs without folder match OR in any root-level context
        if (currentFolderId === null) {
            // At root level, don't show individual files — just folders
            return [];
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

        // Status filter
        if (statusFilter !== "all") {
            docs = docs.filter((d) => d.status === statusFilter);
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
    }, [documents, currentFolderId, search, statusFilter, sortBy, sortDir, convexTrashedDocs]);

    const filesAsManagerFiles = useMemo(() => {
        if (currentFolderId === "__poubelle") {
            // Poubelle mode: currentFiles already in FileManagerFile shape
            return currentFiles as unknown as FileManagerFile[];
        }
        return (currentFiles as DocItem[]).map(docToFile);
    }, [currentFiles, currentFolderId]);

    // ─── Update folder file counts ──────────────────────────────
    const foldersWithCounts = useMemo(() => {
        return currentFolders.map((f) => ({
            ...f,
            fileCount: f.id === "__poubelle"
                ? (convexTrashedDocs?.length ?? 0)
                : documents.filter((d) => d.folderId === f.id).length +
                folders.filter((sf) => sf.parentFolderId === f.id).length,
        }));
    }, [currentFolders, documents, folders, convexTrashedDocs]);

    // ─── Handlers ───────────────────────────────────────────────

    const handleOpenFolder = useCallback((folderId: string) => {
        setCurrentFolderId(folderId);
    }, []);

    const handleNavigate = useCallback((folderId: string | null) => {
        setCurrentFolderId(folderId);
    }, []);

    const handleMoveItem = useCallback((event: DragMoveEvent) => {
        const { itemId, itemType, targetFolderId } = event;
        if (itemType === "file") {
            setDocuments((prev) =>
                prev.map((d) => (d.id === itemId ? { ...d, folderId: targetFolderId } : d))
            );
        } else {
            // Move folder — prevent moving into self or descendants
            setLocalFolders((prev) => {
                const isDescendant = (parentId: string, childId: string): boolean => {
                    if (parentId === childId) return true;
                    const children = prev.filter((f) => f.parentFolderId === parentId);
                    return children.some((c) => isDescendant(c.id, childId));
                };
                if (isDescendant(itemId, targetFolderId)) return prev;
                return prev.map((f) =>
                    f.id === itemId ? { ...f, parentFolderId: targetFolderId } : f
                );
            });
        }
    }, []);

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
        // Convex IDs don't start with "doc-" (local-only prefix)
        const isConvexId = !id.startsWith("doc-");

        console.log("[iDocument DELETE]", { id, isFolder, isConvexId, currentFolderId });

        if (!isFolder) {
            // It's a document
            if (currentFolderId === "__poubelle" && isConvexId) {
                // In Poubelle: permanent delete
                try {
                    await permanentDeleteDocMut({ id: id as Id<"documents"> });
                    toast.success("Document supprimé définitivement");
                } catch (err) {
                    console.error("[iDocument DELETE] Permanent delete failed:", err);
                    toast.error("Erreur lors de la suppression");
                }
            } else if (isConvexId) {
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

        // It's a folder
        if (isConvexId) {
            try {
                await removeFolderMut({ id: id as Id<"folders"> });
                toast.success("Dossier supprimé avec succès");
            } catch {
                setLocalFolders((prev) => prev.filter((f) => f.id !== id));
                toast.success("Dossier supprimé (local)");
            }
        } else {
            setLocalFolders((prev) => prev.filter((f) => f.id !== id));
            toast.success("Dossier supprimé");
        }
    }, [removeFolderMut, removeDocMut, permanentDeleteDocMut, folders, localFolders, currentFolderId, user?.displayName]);

    // ─── Restore from trash ─────────────────────────────────────
    const handleRestoreItem = useCallback(async (id: string) => {
        try {
            await restoreDocMut({ id: id as Id<"documents"> });
            toast.success("Document restauré");
        } catch (err) {
            console.warn("[iDocument] Restore failed:", err);
            toast.error("Erreur lors de la restauration");
        }
    }, [restoreDocMut]);

    const handleSavePolicy = useCallback(async (id: string, policy: ArchivePolicyData) => {
        if (!convexOrgId) {
            toast.info("Politique d'archivage enregistrée (mode local)");
            return;
        }
        try {
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
                manualDate: policy.manualDate, // v6: date personnalisée
            });
            toast.success(`Politique "${policy.categorySlug}" appliquée`);
        } catch (err) {
            console.error("Erreur save policy:", err);
            toast.error("Erreur lors de l'enregistrement de la politique");
        }
    }, [convexOrgId, user, setFolderArchiveMetaMut]);

    const handleCreateDocument = useCallback(() => {
        if (!newDocTitle.trim()) return;
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
            folderId: currentFolderId || "__mes-documents",
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setNewDocTitle("");
        setShowNewDocDialog(false);
    }, [newDocTitle, currentFolderId]);

    const createCellMut = useMutation(api.filingCells.create);

    const handleCreateFolder = useCallback(async () => {
        if (!newFolderName.trim()) return;

        const name = newFolderName.trim();

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
                        parentFolderId: currentFolderId && !currentFolderId.startsWith("__")
                            ? currentFolderId as Id<"folders">
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
                parentFolderId: currentFolderId,
                tags: [],
                fileCount: 0,
                updatedAt: "À l'instant",
                createdBy: "Vous",
            };
            setLocalFolders((prev) => [...prev, newFolder]);
            toast.success(`Dossier "${name}" créé (local)`);
        }

        setNewFolderName("");
        setShowNewFolderDialog(false);
    }, [newFolderName, currentFolderId, convexOrgId, user, isAdmin, activeStructure, createFolderMut, createCellMut]);

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
                suggestedFolderId: "__mes-documents",
                suggestedFolderName: "Mes Documents",
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
                suggestedFolderId: "__mes-documents",
                suggestedFolderName: "Mes Documents",
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
            const result = await classifyDocumentsAction({
                fileNames,
                folderTree: treeData,
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
                            suggestedFolderId: classification.suggestedFolderId ?? "__mes-documents",
                            suggestedFolderName: suggestedFolder?.name ?? "Mes Documents",
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
            prev.map((f) => f.id === fileId ? { ...f, suggestedFolderId: folderId, suggestedFolderName: folder?.name || "Mes Documents" } : f)
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
                    // System pseudo-ID (__mes-documents, etc.) or no folder
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

    // ─── Folder contents for column view ────────────────────────
    const getFolderContents = useCallback(
        (folderId: string) => {
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
        [folders, documents]
    );

    // ─── Render callbacks ───────────────────────────────────────

    const renderFolderCard = useCallback(
        (folder: FileManagerFolder, isDragOver: boolean) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isArborescence = !!(folder.metadata as any)?.isArborescence;
            return (
                <Card className={`glass border-white/5 overflow-hidden transition-all group ${isDragOver ? "ring-2 ring-violet-500/50 bg-violet-500/5 scale-[1.02]" : "hover:border-white/10"}`}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${folder.isSystem ? "bg-gradient-to-br from-amber-600 to-orange-500" : isArborescence ? "bg-gradient-to-br from-cyan-600 to-blue-500" : "bg-gradient-to-br from-violet-600 to-indigo-500"}`}>
                                {folder.isSystem ? (
                                    <Lock className="h-4.5 w-4.5 text-white" />
                                ) : isArborescence ? (
                                    <FolderTree className="h-4.5 w-4.5 text-white" />
                                ) : (
                                    <Folder className="h-4.5 w-4.5 text-white" />
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {folder.isSystem && (
                                    <Badge variant="outline" className="text-[9px] h-4 border-amber-500/20 text-amber-400">
                                        Système
                                    </Badge>
                                )}
                                {isArborescence && (
                                    <Badge variant="outline" className="text-[9px] h-4 border-cyan-500/20 text-cyan-400">
                                        Arborescence
                                    </Badge>
                                )}
                                <FolderDocumentContextMenu
                                    itemId={folder.id}
                                    itemType="folder"
                                    itemName={folder.name}
                                    isSystem={folder.isSystem}
                                    isAdmin={isAdmin}
                                    categories={categoryOptions}
                                    itemUpdatedAt={folder.updatedAt}
                                    itemCreatedBy={folder.createdBy}
                                    onRename={handleRenameItem}
                                    onDelete={handleDeleteItem}
                                    onSavePolicy={handleSavePolicy}
                                />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold mb-0.5">{folder.name}</h3>
                        <p className="text-[11px] text-muted-foreground">
                            {folder.fileCount} élément{folder.fileCount > 1 ? "s" : ""} · {folder.updatedAt}
                        </p>
                        {folder.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                                {folder.tags.map((t) => (
                                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        },
        [isAdmin, categoryOptions, handleRenameItem, handleDeleteItem, handleSavePolicy]
    );

    const renderFileCard = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as DocStatus;
            const st = STATUS_CFG[status] ?? STATUS_CFG.draft;
            const tags = meta.tags as string[];
            return (
                <Card
                    className="glass border-white/5 overflow-hidden cursor-pointer hover:border-white/10 transition-all group"
                    onClick={() => router.push(`${basePath}/edit/${file.id}`)}
                >
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Badge className={`text-[10px] h-5 border ${st.class}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1.5`} />
                                {st.label}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground font-mono">v{meta.version as number}</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                                {file.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                {meta.excerpt as string}
                            </p>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map((t) => (
                                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 -mt-1">
                            {currentFolderId === "__poubelle" ? (
                                /* ── Poubelle mode: restore + permanent delete ── */
                                <div className="flex items-center gap-2 w-full">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRestoreItem(file.id); }}
                                        className="text-[9px] text-emerald-400/80 hover:text-emerald-400 transition-colors flex items-center gap-0.5"
                                    >
                                        <RotateCcw className="h-2.5 w-2.5" /> Restaurer
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(file.id); }}
                                        className="text-[9px] text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-0.5"
                                    >
                                        <Trash2 className="h-2.5 w-2.5" /> Supprimer définitivement
                                    </button>
                                </div>
                            ) : (
                                /* ── Normal mode: tags + context menu ── */
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenTagDialog(file.id); }}
                                        className="text-[9px] text-violet-400/60 hover:text-violet-400 transition-colors flex items-center gap-0.5"
                                    >
                                        <Tag className="h-2.5 w-2.5" /> Gérer les tags
                                    </button>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <FolderDocumentContextMenu
                                            itemId={file.id}
                                            itemType="document"
                                            itemName={file.name}
                                            isAdmin={isAdmin}
                                            categories={categoryOptions}
                                            itemUpdatedAt={file.date}
                                            onRename={handleRenameItem}
                                            onDelete={handleDeleteItem}
                                            onSavePolicy={handleSavePolicy}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="bg-violet-500/15 text-violet-300 text-[8px]">
                                        {meta.authorInitials as string}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground">{meta.author as string}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {file.date}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            );
        },
        [router, basePath, currentFolderId, handleDeleteItem, handleRestoreItem, handleOpenTagDialog, isAdmin, categoryOptions, handleRenameItem, handleSavePolicy]
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
                    {/* Nouveau dossier: non-admins can only create inside "Mes Documents" */}
                    {(isAdmin || currentFolderId === "__mes-documents") && (
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
                    {/* Réorganisation IA: admin only */}
                    {isAdmin && (
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

                            {/* Status filter pills */}
                            <div className="flex items-center gap-1">
                                {STATUS_FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => setStatusFilter(f.value)}
                                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${statusFilter === f.value
                                            ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                                            : "text-muted-foreground hover:bg-white/5"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
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
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            renderFileIcon={(_file) => (
                                <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                                    <FileText className="h-3 w-3 text-violet-400" />
                                </div>
                            )}
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
                                fileCount: documents.filter((d) => d.folderId === f.id).length +
                                    folders.filter((sf) => sf.parentFolderId === f.id).length,
                            }))}
                            rootFiles={[]}
                            getFolderContents={getFolderContents}
                            onMoveItem={handleMoveItem}
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
                <DialogContent className="sm:max-w-md">
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewDocDialog(false)} className="border-white/10">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateDocument}
                            disabled={!newDocTitle.trim()}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── New Folder Dialog ─────────────────── */}
            <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-violet-400" />
                            Nouveau Dossier
                        </DialogTitle>
                        <DialogDescription>
                            Créez un nouveau dossier{currentFolderId ? ` dans "${folders.find((f) => f.id === currentFolderId)?.name || "ce dossier"}"` : " à la racine"}.
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
                        <div className="py-8 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                                        <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                        <Loader2 className="h-3 w-3 text-white animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold">Analyse IA en cours…</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Classification automatique et extraction de tags
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {importFiles.map((f) => (
                                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                                        {getImportFileIcon(f.type)}
                                        <p className="text-xs flex-1 truncate">{f.name}</p>
                                        {f.analyzed ? (
                                            <div className="flex items-center gap-1.5 text-emerald-400">
                                                <Check className="h-3.5 w-3.5" />
                                                <span className="text-[10px] font-medium">{f.confidence}%</span>
                                            </div>
                                        ) : (
                                            <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                                        )}
                                    </div>
                                ))}
                            </div>
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
                        {importStep === "review" && (
                            <Button
                                onClick={handleConfirmImport}
                                disabled={importLoading}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 gap-2"
                            >
                                {importLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                {importLoading
                                    ? "Import en cours…"
                                    : `Importer ${importFiles.length} document${importFiles.length > 1 ? "s" : ""}`
                                }
                            </Button>
                        )}
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

            {/* ═══ REORGANIZATION DIALOG ═══ */}
            <Dialog open={showReorgDialog} onOpenChange={(open) => { if (!open) { setShowReorgDialog(false); setReorgStep("mode"); } }}>
                <DialogContent className="glass border-white/10 max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-amber-400" />
                            Réorganisation Intelligente
                        </DialogTitle>
                        <DialogDescription>
                            {reorgStep === "mode" && "Choisissez le mode de réorganisation de vos documents."}
                            {reorgStep === "analyzing" && "L'IA analyse vos documents et votre arborescence..."}
                            {reorgStep === "preview" && "Voici le plan de réorganisation proposé par l'IA."}
                            {reorgStep === "executing" && "Réorganisation en cours..."}
                            {reorgStep === "done" && "Réorganisation terminée !"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step: Mode Selection */}
                    {reorgStep === "mode" && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setReorgMode("classify")}
                                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                                        reorgMode === "classify"
                                            ? "border-cyan-500/50 bg-cyan-500/10"
                                            : "border-white/10 hover:border-white/20 bg-white/5"
                                    }`}
                                >
                                    <Folder className="h-8 w-8 text-cyan-400 mb-3" />
                                    <h3 className="font-semibold text-sm mb-1">Classer</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Range les documents dans les dossiers existants.
                                        Aucun nouveau dossier ne sera créé.
                                    </p>
                                </button>
                                <button
                                    onClick={() => setReorgMode("reorganize")}
                                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                                        reorgMode === "reorganize"
                                            ? "border-amber-500/50 bg-amber-500/10"
                                            : "border-white/10 hover:border-white/20 bg-white/5"
                                    }`}
                                >
                                    <FolderTree className="h-8 w-8 text-amber-400 mb-3" />
                                    <h3 className="font-semibold text-sm mb-1">Réorganiser</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Crée une arborescence optimale : dossiers par type,
                                        sous-dossiers par client, et déplace les documents.
                                    </p>
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground">
                                {documents.length} document{documents.length > 1 ? "s" : ""} · {folders.length} dossier{folders.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    )}

                    {/* Step: Analyzing */}
                    {reorgStep === "analyzing" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Brain className="h-8 w-8 text-amber-400 animate-pulse" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">Analyse IA en cours...</p>
                            <p className="text-[10px] text-muted-foreground">
                                Gemini analyse {documents.length} documents et {folders.length} dossiers
                            </p>
                        </div>
                    )}

                    {/* Step: Preview */}
                    {reorgStep === "preview" && reorgPlan && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <p className="text-xs text-amber-300/80">{reorgPlan.summary}</p>
                                <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                                    <span>{reorgPlan.stats.documentsToMove} à déplacer</span>
                                    <span>{reorgPlan.stats.documentsAlreadyCorrect} déjà corrects</span>
                                    {reorgPlan.stats.newFoldersToCreate > 0 && (
                                        <span className="text-emerald-400">✨ {reorgPlan.stats.newFoldersToCreate} dossier(s) à créer</span>
                                    )}
                                </div>
                            </div>

                            {/* Moves list */}
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                {reorgPlan.moves.map((move, i) => (
                                    <div
                                        key={move.docId || i}
                                        className={`p-3 rounded-lg border transition-all ${
                                            !move.shouldMove
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
                                                disabled={!move.shouldMove}
                                                className="mt-0.5 flex-shrink-0"
                                            >
                                                {move.shouldMove ? (
                                                    move.selected
                                                        ? <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                                        : <div className="h-4 w-4 rounded-full border border-white/20" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400/50" />
                                                )}
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: Executing */}
                    {reorgStep === "executing" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <RefreshCw className="h-10 w-10 text-amber-400 animate-spin" />
                            <p className="text-sm">Réorganisation en cours…</p>
                            <div className="w-full max-w-xs bg-white/5 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${reorgProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">{Math.round(reorgProgress)}%</p>
                        </div>
                    )}

                    {/* Step: Done */}
                    {reorgStep === "done" && reorgResult && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            </div>
                            <p className="text-sm font-semibold">Réorganisation terminée !</p>
                            <div className="flex gap-6 text-sm">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-400">{reorgResult.moved}</p>
                                    <p className="text-[10px] text-muted-foreground">Documents déplacés</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-400">{reorgResult.foldersCreated}</p>
                                    <p className="text-[10px] text-muted-foreground">Dossiers créés</p>
                                </div>
                            </div>
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
                                            return {
                                                id: d.id,
                                                title: d.title,
                                                fileName: undefined,
                                                tags: d.tags,
                                                currentFolderId: d.folderId ?? null,
                                                currentFolderName: folder?.name ?? null,
                                            };
                                        });

                                        const result = await reorganizeDocumentsAction({
                                            documents: docsData,
                                            folderTree: treeData,
                                            mode: reorgMode,
                                        });

                                        if (result.error || !result.plan) {
                                            toast.error("L'IA n'a pas pu analyser les documents.");
                                            setReorgStep("mode");
                                        } else {
                                            const plan = result.plan as ReorgPlan;

                                            // Remap AI-generated placeholder docIds back to real Convex IDs
                                            // AI may return "doc_1", "doc_2" or index-based IDs instead of real Convex IDs
                                            const docByTitle = new Map<string, string>();
                                            const docByIndex = new Map<string, string>();
                                            docsData.forEach((d, idx) => {
                                                docByTitle.set(d.title.toLowerCase(), d.id);
                                                docByIndex.set(`doc_${idx + 1}`, d.id);
                                                docByIndex.set(String(idx + 1), d.id);
                                            });

                                            plan.moves = plan.moves.map((m: ReorgMove) => {
                                                let resolvedDocId = m.docId;
                                                // If the docId is not a real document ID, try to remap it
                                                if (!docsData.some(d => d.id === m.docId)) {
                                                    // Try index-based mapping (doc_1, doc_2, etc.)
                                                    if (docByIndex.has(m.docId)) {
                                                        resolvedDocId = docByIndex.get(m.docId)!;
                                                    }
                                                    // Try title-based mapping
                                                    else if (m.docTitle && docByTitle.has(m.docTitle.toLowerCase())) {
                                                        resolvedDocId = docByTitle.get(m.docTitle.toLowerCase())!;
                                                    }
                                                }

                                                // ── Infer missing sub-folders from targetFolderPath ──
                                                // AI often returns targetFolderPath="Finances > Devis > SGG"
                                                // but leaves newFoldersToCreate=[] and targetFolderId set to "Finances".
                                                // We parse the path and auto-populate newFoldersToCreate.
                                                let newFolders = m.newFoldersToCreate ?? [];
                                                let parentForNew = m.parentFolderIdForNew ?? m.targetFolderId;
                                                console.log(`[Reorg] Post-process move: path="${m.targetFolderPath}" newFolders=${JSON.stringify(newFolders)} hasGt=${m.targetFolderPath?.includes(">")}`);
                                                if (newFolders.length === 0 && m.targetFolderPath && m.targetFolderPath.includes(">")) {
                                                    const pathSegments = m.targetFolderPath.split(/\s*>\s*/).filter(Boolean);

                                                    // Build parent→children map for hierarchy-aware lookup
                                                    // Key = parentId (or "root" for top-level), Value = Map<name_lower, folderId>
                                                    const childrenMap = new Map<string, Map<string, string>>();
                                                    treeData.forEach(f => {
                                                        const parentKey = f.parentFolderId ?? "root";
                                                        if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, new Map());
                                                        childrenMap.get(parentKey)!.set(f.name.toLowerCase(), f.id);
                                                    });

                                                    // Walk path segments: at each step, find the folder with this name
                                                    // as a CHILD of the current parent
                                                    let currentParentId: string = "root";
                                                    let missingStartIdx = 0;
                                                    for (let si = 0; si < pathSegments.length; si++) {
                                                        const segName = pathSegments[si].trim().toLowerCase();
                                                        const children = childrenMap.get(currentParentId);
                                                        if (children && children.has(segName)) {
                                                            currentParentId = children.get(segName)!;
                                                            missingStartIdx = si + 1;
                                                        } else {
                                                            break;
                                                        }
                                                    }

                                                    if (missingStartIdx < pathSegments.length) {
                                                        newFolders = pathSegments.slice(missingStartIdx);
                                                        if (currentParentId !== "root") {
                                                            parentForNew = currentParentId;
                                                        }
                                                        console.log(`[Reorg] Inferred new folders from path "${m.targetFolderPath}":`, newFolders, "parent:", parentForNew);
                                                    }
                                                }

                                                return {
                                                    ...m,
                                                    docId: resolvedDocId,
                                                    newFoldersToCreate: newFolders,
                                                    parentFolderIdForNew: parentForNew,
                                                    selected: m.shouldMove,
                                                };
                                            });

                                            setReorgPlan(plan);
                                            setReorgStep("preview");
                                            toast.success(`🤖 Plan de réorganisation généré`);
                                        }
                                    } catch (err) {
                                        console.error("[Reorg] AI error:", err);
                                        toast.error("Erreur lors de l'analyse IA.");
                                        setReorgStep("mode");
                                    }
                                }}
                                disabled={documents.length === 0}
                                className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white border-0 gap-2"
                            >
                                <Brain className="h-4 w-4" />
                                Analyser avec l&apos;IA
                            </Button>
                        )}
                        {reorgStep === "preview" && reorgPlan && (
                            <Button
                                onClick={async () => {
                                    setReorgStep("executing");
                                    setReorgLoading(true);
                                    const selectedMoves = reorgPlan.moves.filter((m) => m.selected && m.shouldMove);
                                    let foldersCreated = 0;
                                    const finalMoves: { docId: string; targetFolderId: string }[] = [];

                                    try {
                                        console.log("[Reorg] Starting execution. convexOrgId =", convexOrgId, "user =", user?.email);
                                        console.log("[Reorg] selectedMoves:", selectedMoves.length, selectedMoves.map(m => ({
                                            docId: m.docId, targetFolderId: m.targetFolderId,
                                            newFolders: m.newFoldersToCreate, parentForNew: m.parentFolderIdForNew
                                        })));
                                        console.log("[Reorg] Known folders:", folders.map(f => ({ id: f.id, name: f.name })));
                                        console.log("[Reorg] Known documents:", documents.map(d => ({ id: d.id, title: d.title })));
                                        if (!convexOrgId) {
                                            toast.error("Erreur: Organisation non trouvée. Rechargez la page.");
                                            setReorgStep("preview");
                                            setReorgLoading(false);
                                            return;
                                        }
                                        // Helper: check if an ID looks like a real Convex folder ID
                                        const realFolderIds = new Set(folders.map((f) => f.id));
                                        const isRealFolderId = (id: string | null | undefined): boolean =>
                                            !!id && !id.startsWith("__") && !id.startsWith("new_") && realFolderIds.has(id);

                                        // 1. Create any new folders first
                                        const createdFolderMap = new Map<string, string>();
                                        for (let i = 0; i < selectedMoves.length; i++) {
                                            const move = selectedMoves[i];
                                            setReorgProgress(((i + 1) / (selectedMoves.length * 2)) * 100);

                                            if (move.newFoldersToCreate.length > 0) {
                                                // Resolve starting parent from the move's parentFolderIdForNew
                                                let parentId: Id<"folders"> | undefined = undefined;
                                                if (isRealFolderId(move.parentFolderIdForNew)) {
                                                    parentId = move.parentFolderIdForNew as Id<"folders">;
                                                } else if (isRealFolderId(move.targetFolderId)) {
                                                    parentId = move.targetFolderId as Id<"folders">;
                                                }
                                                // If parent was already created in this session, use it
                                                if (!parentId && move.parentFolderIdForNew && createdFolderMap.has(move.parentFolderIdForNew)) {
                                                    parentId = createdFolderMap.get(move.parentFolderIdForNew) as Id<"folders">;
                                                }
                                                console.log(`[Reorg] Move ${i}: creating ${move.newFoldersToCreate.length} folders. Starting parentId =`, parentId);

                                                for (const folderName of move.newFoldersToCreate) {
                                                    const cacheKey = `${parentId ?? "root"}_${folderName}`;
                                                    if (createdFolderMap.has(cacheKey)) {
                                                        parentId = createdFolderMap.get(cacheKey) as Id<"folders">;
                                                        console.log(`[Reorg] Cached folder "${folderName}" → ${parentId}`);
                                                        continue;
                                                    }
                                                    try {
                                                        console.log(`[Reorg] Creating folder "${folderName}" under parentId =`, parentId);
                                                        const folderResult = await getOrCreateFolderMut({
                                                            name: folderName,
                                                            organizationId: convexOrgId!,
                                                            createdBy: user?.email || "system",
                                                            parentFolderId: parentId,
                                                        });
                                                        console.log(`[Reorg] ✓ Folder "${folderName}" → ${folderResult.id} (created: ${folderResult.created})`);
                                                        createdFolderMap.set(cacheKey, folderResult.id as string);
                                                        parentId = folderResult.id;
                                                        if (folderResult.created) foldersCreated++;
                                                    } catch (e) {
                                                        console.warn(`[Reorg] ✗ Failed to create folder "${folderName}":`, e);
                                                    }
                                                }
                                                if (parentId) {
                                                    console.log(`[Reorg] Move ${i}: doc ${move.docId} → folder ${parentId}`);
                                                    finalMoves.push({ docId: move.docId, targetFolderId: String(parentId) });
                                                } else {
                                                    console.warn(`[Reorg] Move ${i}: no parentId resolved, skipping`);
                                                }
                                            } else {
                                                // No new folders — use targetFolderId only if it's a real Convex ID
                                                if (isRealFolderId(move.targetFolderId)) {
                                                    console.log(`[Reorg] Move ${i}: doc ${move.docId} → existing folder ${move.targetFolderId}`);
                                                    finalMoves.push({ docId: move.docId, targetFolderId: move.targetFolderId });
                                                } else if (createdFolderMap.has(move.targetFolderId)) {
                                                    console.log(`[Reorg] Move ${i}: doc ${move.docId} → cached folder ${createdFolderMap.get(move.targetFolderId)}`);
                                                    finalMoves.push({ docId: move.docId, targetFolderId: createdFolderMap.get(move.targetFolderId)! });
                                                } else {
                                                    console.warn(`[Reorg] Move ${i}: targetFolderId "${move.targetFolderId}" is not real and not cached, skipping`);
                                                }
                                            }
                                        }

                                        // 2. Batch move documents
                                        setReorgProgress(75);
                                        console.log("[Reorg] finalMoves:", finalMoves);
                                        const docIds = new Set(documents.map((d) => d.id));
                                        const validMoves = finalMoves.filter((m) => m.targetFolderId && !m.targetFolderId.startsWith("__") && docIds.has(m.docId));
                                        console.log("[Reorg] validMoves after docId filter:", validMoves.length, validMoves);
                                        if (validMoves.length > 0) {
                                            await batchMoveToFolderMut({
                                                moves: validMoves.map((m) => ({
                                                    docId: m.docId as Id<"documents">,
                                                    targetFolderId: m.targetFolderId as Id<"folders">,
                                                })),
                                            });
                                        }
                                        setReorgProgress(100);
                                        setReorgResult({ moved: validMoves.length, foldersCreated });
                                        setReorgStep("done");
                                        toast.success(`✅ ${validMoves.length} document(s) réorganisé(s)`);
                                    } catch (err) {
                                        console.error("[Reorg] Execution error:", err);
                                        toast.error("Erreur lors de la réorganisation.");
                                        setReorgStep("preview");
                                    }
                                    setReorgLoading(false);
                                }}
                                disabled={reorgLoading || !reorgPlan.moves.some((m) => m.selected && m.shouldMove)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Appliquer ({reorgPlan.moves.filter((m) => m.selected && m.shouldMove).length} déplacements)
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
