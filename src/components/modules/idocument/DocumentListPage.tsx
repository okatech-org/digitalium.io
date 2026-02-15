"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Finder-Style Document Explorer
// 3 modes (grille/liste/colonnes) · DnD · Dossiers · Mes Documents par défaut
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/hooks/useAuth";
import { useFilingStructures, useFilingCells, useUserFilingAccess, useAccessRules } from "@/hooks/useFilingAccess";
import type { Id } from "../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Plus, Filter, MoreHorizontal,
    Edit3, Share2, Archive, Trash2, CheckSquare, Clock, Eye,
    Tag, User, X, Sparkles, PenTool, FolderPlus,
    FolderOpen, Folder, Lock, Upload, FileUp, Brain,
    Loader2, Check, ChevronRight, FileSpreadsheet, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// ─── Types ──────────────────────────────────────────────────────

type DocStatus = "draft" | "review" | "approved" | "archived";
type ImportStep = "select" | "analyzing" | "review" | "done";

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
    confidence: number;
    analyzed: boolean;
}

// ─── Status config ──────────────────────────────────────────────

const STATUS_CFG: Record<DocStatus, { label: string; icon: React.ElementType; class: string; dot: string }> = {
    draft: { label: "Brouillon", icon: PenTool, class: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-400" },
    review: { label: "En révision", icon: Eye, class: "bg-blue-500/15 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    approved: { label: "Approuvé", icon: CheckSquare, class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    archived: { label: "Archivé", icon: Archive, class: "bg-violet-500/15 text-violet-400 border-violet-500/20", dot: "bg-violet-400" },
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

// ─── Mock Documents (as FileManagerFile with DocItem metadata) ──

const INITIAL_DOCUMENTS: DocItem[] = [
    {
        id: "doc-1", title: "Contrat de prestation de services — SOGARA",
        excerpt: "Contrat cadre pour la fourniture de services numériques à la Société Gabonaise de Raffinage…",
        author: "Daniel Nguema", authorInitials: "DN",
        updatedAt: "Il y a 10 min", updatedAtTs: Date.now() - 600_000,
        status: "review", tags: ["Contrat", "SOGARA"], version: 3, folderId: "contrats",
    },
    {
        id: "doc-2", title: "Rapport financier T4-2025 — ASCOMA Gabon",
        excerpt: "Synthèse des performances financières pour le quatrième trimestre 2025…",
        author: "Aimée Gondjout", authorInitials: "AG",
        updatedAt: "Il y a 35 min", updatedAtTs: Date.now() - 2_100_000,
        status: "approved", tags: ["Finance", "Rapport"], version: 5, folderId: "fiscal",
    },
    {
        id: "doc-3", title: "Note de service — Politique de télétravail 2026",
        excerpt: "Mise à jour de la politique de télétravail pour l'ensemble des collaborateurs…",
        author: "Claude Mboumba", authorInitials: "CM",
        updatedAt: "Il y a 2h", updatedAtTs: Date.now() - 7_200_000,
        status: "draft", tags: ["RH", "Note"], version: 1, folderId: "__mes-documents",
    },
    {
        id: "doc-4", title: "PV du Conseil d'Administration — Janvier 2026",
        excerpt: "Procès-verbal de la réunion du conseil tenue le 28 janvier 2026…",
        author: "Daniel Nguema", authorInitials: "DN",
        updatedAt: "Il y a 2h", updatedAtTs: Date.now() - 7_200_000,
        status: "approved", tags: ["PV", "Direction"], version: 2, folderId: "pv",
    },
    {
        id: "doc-5", title: "Cahier des charges — Migration Cloud SEEG",
        excerpt: "Spécifications techniques pour la migration des systèmes legacy…",
        author: "Patrick Obiang", authorInitials: "PO",
        updatedAt: "Il y a 3h", updatedAtTs: Date.now() - 10_800_000,
        status: "review", tags: ["Technique", "Cloud"], version: 4, folderId: "contrats",
    },
    {
        id: "doc-6", title: "Devis prestation audit IT — Ministère de la Pêche",
        excerpt: "Proposition commerciale pour l'audit complet de l'infrastructure IT…",
        author: "Marie Nzé", authorInitials: "MN",
        updatedAt: "Il y a 3j", updatedAtTs: Date.now() - 259_200_000,
        status: "draft", tags: ["Devis", "Ministère"], version: 1, folderId: "__mes-documents",
    },
    {
        id: "doc-7", title: "Facture FV-2026-0847 — Gabon Télécom",
        excerpt: "Facture pour la prestation de connectivité réseau et maintenance technique…",
        author: "Aimée Gondjout", authorInitials: "AG",
        updatedAt: "Il y a 1j", updatedAtTs: Date.now() - 86_400_000,
        status: "approved", tags: ["Facture", "Télécom"], version: 1, folderId: "fiscal",
    },
    {
        id: "doc-8", title: "Plan stratégique numérique 2026-2028",
        excerpt: "Feuille de route pour la transformation digitale de l'organisation…",
        author: "Claude Mboumba", authorInitials: "CM",
        updatedAt: "Il y a 5j", updatedAtTs: Date.now() - 432_000_000,
        status: "draft", tags: ["Stratégie", "Direction"], version: 2, folderId: "__mes-documents",
    },
    {
        id: "doc-9", title: "Contrat CDI — Recrutement IT Senior",
        excerpt: "Contrat à durée indéterminée pour le poste d'ingénieur IT Senior…",
        author: "Aimée Gondjout", authorInitials: "AG",
        updatedAt: "Il y a 3j", updatedAtTs: Date.now() - 259_200_000,
        status: "approved", tags: ["RH", "Contrat"], version: 2, folderId: "rh",
    },
    {
        id: "doc-10", title: "Convention de stage — 2026-S1",
        excerpt: "Convention tripartite pour le stage de perfectionnement…",
        author: "Aimée Gondjout", authorInitials: "AG",
        updatedAt: "Il y a 5j", updatedAtTs: Date.now() - 432_000_000,
        status: "review", tags: ["RH", "Stage"], version: 1, folderId: "rh",
    },
    {
        id: "doc-11", title: "Avenant contrat maintenance — COMILOG",
        excerpt: "Avenant n°2 au contrat de maintenance des systèmes numériques…",
        author: "Patrick Obiang", authorInitials: "PO",
        updatedAt: "Il y a 7j", updatedAtTs: Date.now() - 604_800_000,
        status: "approved", tags: ["Contrat", "Mines"], version: 2, folderId: "contrats",
    },
    {
        id: "doc-12", title: "Déclaration fiscale annuelle 2025",
        excerpt: "Déclaration des résultats de l'exercice fiscal 2025…",
        author: "Claude Mboumba", authorInitials: "CM",
        updatedAt: "Il y a 10j", updatedAtTs: Date.now() - 864_000_000,
        status: "archived", tags: ["Fiscal", "Déclaration"], version: 3, folderId: "fiscal",
    },
];

// ─── AI Classification rules ────────────────────────────────────

const AI_RULES: { keywords: string[]; tags: string[]; folderId: string; folderName: string }[] = [
    { keywords: ["contrat", "contract"], tags: ["Contrat", "Juridique"], folderId: "contrats", folderName: "Contrats" },
    { keywords: ["facture", "invoice"], tags: ["Facture", "Comptabilité"], folderId: "fiscal", folderName: "Documents Fiscaux" },
    { keywords: ["rapport", "report"], tags: ["Rapport", "Analyse"], folderId: "__mes-documents", folderName: "Mes Documents" },
    { keywords: ["pv", "procès", "procès-verbal", "délibér"], tags: ["PV", "Direction"], folderId: "pv", folderName: "PV & Délibérations" },
    { keywords: ["note", "service", "circulaire"], tags: ["Note", "RH"], folderId: "__mes-documents", folderName: "Mes Documents" },
    { keywords: ["devis", "proposition", "offre"], tags: ["Devis", "Commercial"], folderId: "contrats", folderName: "Contrats" },
    { keywords: ["convention", "stage", "formation"], tags: ["Convention", "RH"], folderId: "rh", folderName: "Ressources Humaines" },
    { keywords: ["fiscal", "impôt", "taxe", "déclaration"], tags: ["Fiscal", "Déclaration"], folderId: "fiscal", folderName: "Documents Fiscaux" },
    { keywords: ["plan", "stratégi", "feuille de route"], tags: ["Stratégie", "Direction"], folderId: "__mes-documents", folderName: "Mes Documents" },
];

function classifyFileName(name: string): { tags: string[]; folderId: string; folderName: string; confidence: number } {
    const lower = name.toLowerCase();
    for (const rule of AI_RULES) {
        if (rule.keywords.some((kw) => lower.includes(kw))) {
            return { tags: rule.tags, folderId: rule.folderId, folderName: rule.folderName, confidence: 85 + Math.floor(Math.random() * 12) };
        }
    }
    return { tags: ["Document", "Import"], folderId: "__mes-documents", folderName: "Mes Documents", confidence: 55 + Math.floor(Math.random() * 15) };
}

const ACCEPTED_DOC_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
];
const MAX_IMPORT_SIZE = 50 * 1024 * 1024;

function getImportFileIcon(type: string) {
    if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-400" />;
    if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
    if (type.includes("image")) return <ImageIcon className="h-4 w-4 text-blue-400" />;
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
                const st = STATUS_CFG[status];
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
    const { orgId } = useOrganization();
    const { user } = useAuth();
    const isAdmin = (user?.level ?? 99) <= 2; // Admin = level 1 or 2

    // ─── Convex: fetch filing structure ─────────────────────────
    const isConvexId = orgId.length > 10;
    const convexOrgId = isConvexId ? (orgId as Id<"organizations">) : undefined;
    const { activeStructure } = useFilingStructures(convexOrgId);
    const { cells, isLoading: cellsLoading, createCell } = useFilingCells(activeStructure?._id);
    const { setRule } = useAccessRules(convexOrgId);

    // ─── Résolution d'accès utilisateur ─────────────────────────
    const { visibleCellIds, isLoading: accessLoading } = useUserFilingAccess(
        user?.uid, convexOrgId, user?.email ?? undefined, user?.displayName ?? undefined
    );

    // ─── Map filing_cells → FileManagerFolder (filtré par accès) ─
    const dynamicFolders = useMemo<FileManagerFolder[]>(() => {
        if (!cells || cells.length === 0) return [];
        return cells
            .filter((c) => c.estActif)
            .filter((c) => visibleCellIds.includes(c._id))
            .map((cell) => ({
                id: cell._id,
                name: cell.intitule,
                description: cell.description,
                parentFolderId: cell.parentId ?? null,
                tags: cell.tags ?? [],
                fileCount: 0,
                updatedAt: cell.updatedAt
                    ? new Date(cell.updatedAt).toLocaleDateString("fr-FR")
                    : "",
                createdBy: "",
                metadata: {
                    code: cell.code,
                    icon: cell.icone,
                    color: cell.couleur,
                    accessDefaut: cell.accessDefaut,
                    moduleId: cell.moduleId,
                },
            }));
    }, [cells, visibleCellIds]);

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
    const [documents, setDocuments] = useState<DocItem[]>(INITIAL_DOCUMENTS);
    const [localFolders, setLocalFolders] = useState<FileManagerFolder[]>([]);

    // Computed folders: base from Convex + locally created ones
    const folders = useMemo<FileManagerFolder[]>(
        () => [...baseFolders, ...localFolders],
        [baseFolders, localFolders]
    );
    const [showNewDocDialog, setShowNewDocDialog] = useState(false);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [importFiles, setImportFiles] = useState<ImportFileItem[]>([]);
    const [importStep, setImportStep] = useState<ImportStep>("select");
    const [isDragOver, setIsDragOver] = useState(false);

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
    }, [documents, currentFolderId, search, statusFilter, sortBy, sortDir]);

    const filesAsManagerFiles = useMemo(() => currentFiles.map(docToFile), [currentFiles]);

    // ─── Update folder file counts ──────────────────────────────
    const foldersWithCounts = useMemo(() => {
        return currentFolders.map((f) => ({
            ...f,
            fileCount: documents.filter((d) => d.folderId === f.id).length +
                folders.filter((sf) => sf.parentFolderId === f.id).length,
        }));
    }, [currentFolders, documents, folders]);

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

    const handleCreateFolder = useCallback(async () => {
        if (!newFolderName.trim()) return;

        const name = newFolderName.trim();
        const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20);

        // ─── Persist to Convex if connected ─────────────────────
        if (convexOrgId && activeStructure?._id) {
            try {
                // 1. Create the filing cell
                const cellId = await createCell({
                    filingStructureId: activeStructure._id,
                    organizationId: convexOrgId,
                    code,
                    intitule: name,
                    parentId: currentFolderId && !currentFolderId.startsWith("__")
                        ? currentFolderId as Id<"filing_cells">
                        : undefined,
                    accessDefaut: "restreint",
                });

                // 2. Auto-create admin access rule for this cell
                await setRule({
                    organizationId: convexOrgId,
                    filingCellId: cellId,
                    acces: "admin",
                });

                toast.success(`Dossier "${name}" créé et synchronisé`);
            } catch (err) {
                console.error("Erreur création dossier Convex:", err);
                toast.error("Erreur lors de la synchronisation du dossier");
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
    }, [newFolderName, currentFolderId, convexOrgId, activeStructure, createCell, setRule]);

    // ─── Import handlers ────────────────────────────────────────

    const handleImportFilesSelected = useCallback((fileList: FileList | null) => {
        if (!fileList) return;
        const newFiles: ImportFileItem[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > MAX_IMPORT_SIZE) {
                toast.error(`"${file.name}" dépasse la taille maximum (50 Mo)`);
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
                confidence: 0,
                analyzed: false,
            });
        }
        setImportFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleRemoveImportFile = useCallback((fileId: string) => {
        setImportFiles((prev) => prev.filter((f) => f.id !== fileId));
    }, []);

    const handleAnalyzeWithAI = useCallback(async () => {
        setImportStep("analyzing");
        // Simulate AI analysis with progressive updates
        for (let i = 0; i < importFiles.length; i++) {
            await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
            setImportFiles((prev) =>
                prev.map((f, idx) => {
                    if (idx === i) {
                        const result = classifyFileName(f.name);
                        return { ...f, suggestedTags: result.tags, suggestedFolderId: result.folderId, suggestedFolderName: result.folderName, confidence: result.confidence, analyzed: true };
                    }
                    return f;
                })
            );
        }
        setImportStep("review");
    }, [importFiles.length]);

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

    const handleConfirmImport = useCallback(() => {
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
        toast.success(`${importFiles.length} document${importFiles.length > 1 ? "s" : ""} importé${importFiles.length > 1 ? "s" : ""} avec succès`, {
            description: "Les tags IA ont été appliqués automatiquement.",
        });
        setImportFiles([]);
        setImportStep("select");
        setShowImportDialog(false);
    }, [importFiles]);

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
        (folder: FileManagerFolder, isDragOver: boolean) => (
            <Card className={`glass border-white/5 overflow-hidden transition-all ${isDragOver ? "ring-2 ring-violet-500/50 bg-violet-500/5 scale-[1.02]" : "hover:border-white/10"}`}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${folder.isSystem ? "bg-gradient-to-br from-amber-600 to-orange-500" : "bg-gradient-to-br from-violet-600 to-indigo-500"}`}>
                            {folder.isSystem ? (
                                <Lock className="h-4.5 w-4.5 text-white" />
                            ) : (
                                <Folder className="h-4.5 w-4.5 text-white" />
                            )}
                        </div>
                        {folder.isSystem && (
                            <Badge variant="outline" className="text-[9px] h-4 border-amber-500/20 text-amber-400">
                                Système
                            </Badge>
                        )}
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
        ),
        []
    );

    const renderFileCard = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as DocStatus;
            const st = STATUS_CFG[status];
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
        [router, basePath]
    );

    const renderFilePreview = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as DocStatus;
            const st = STATUS_CFG[status];
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
                    {isAdmin && (
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
                            renderFileIcon={(file) => (
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

            {/* ── New Folder Dialog (Admin only) ─────────────── */}
            {isAdmin && (
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
            )}

            {/* ── Import Dialog ────────────────────────────────── */}
            <Dialog open={showImportDialog} onOpenChange={(open) => { if (!open) handleCloseImport(); }}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            Importer avec l'IA
                        </DialogTitle>
                        <DialogDescription>
                            Déposez vos documents — l'IA analysera leur contenu et suggérera un classement automatique.
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
                                    input.accept = ACCEPTED_DOC_TYPES.join(",");
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
                                            {isDragOver ? "Déposez vos fichiers ici" : "Glissez-déposez ou cliquez pour sélectionner"}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            PDF, Word, Excel, Images — 50 Mo max par fichier
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                    Analyse terminée ! Vérifiez les suggestions ci-dessous avant d'importer.
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

                                            {/* Suggested folder */}
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Folder className="h-3 w-3" /> Dossier de destination
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {folders.filter((fl) => !fl.parentFolderId || fl.parentFolderId === null).map((fl) => (
                                                        <button
                                                            key={fl.id}
                                                            onClick={() => handleUpdateImportFolder(f.id, fl.id)}
                                                            className={`text-[10px] px-2 py-1 rounded-md transition-all ${f.suggestedFolderId === fl.id
                                                                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30"
                                                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                                                }`}
                                                        >
                                                            {fl.name}
                                                        </button>
                                                    ))}
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
                                Analyser avec l'IA
                            </Button>
                        )}
                        {importStep === "review" && (
                            <Button
                                onClick={handleConfirmImport}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Importer {importFiles.length} document{importFiles.length > 1 ? "s" : ""}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
