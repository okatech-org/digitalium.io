"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Finder-Style Archive Explorer
// 3 modes (grille/liste/colonnes) · DnD · Dossiers · Navigation
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import {
    Archive, Search, Upload, Shield,
    Clock, Lock, Landmark, Users2, Scale,
    Building2, FileText, Folder, FolderOpen,
    Hash, CheckCircle2, AlertTriangle, XCircle,
    Loader2, X, FolderPlus, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    BreadcrumbPath,
    FinderGridView,
    FinderListView,
    FinderColumnView,
    getInitialViewMode,
} from "@/components/modules/file-manager";
import type {
    ViewMode,
    FileManagerFolder,
    FileManagerFile,
    ListColumn,
} from "@/components/modules/file-manager";
import { VaultFolderCard } from "@/components/ui/vault/VaultFolderCard";
import { VaultFileCard } from "@/components/ui/vault/VaultFileCard";
import { getCategoryConfigFromFolder } from "@/components/ui/vault/category-config";
import { CATEGORY_COLORS } from "@/config/category-colors";

// ─── Types ──────────────────────────────────────────────────────

type ArchiveStatus = "active" | "expiring" | "expired" | "pending";

interface ArchiveItem {
    id: string;
    title: string;
    archivedAt: string;
    archivedAtTs: number;
    expiresAt: string;
    size: string;
    hash: string;
    status: ArchiveStatus;
    certId: string;
    archivedBy: string;
    archivedByInitials: string;
    folderId: string;
}

// ─── Status config ──────────────────────────────────────────────

const STATUS_CFG: Record<ArchiveStatus, { label: string; icon: React.ElementType; class: string; dot: string }> = {
    active: { label: "Actif", icon: CheckCircle2, class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    expiring: { label: "Expiration", icon: AlertTriangle, class: "bg-amber-500/15 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    expired: { label: "Expiré", icon: XCircle, class: "bg-red-500/15 text-red-400 border-red-500/20", dot: "bg-red-400" },
    pending: { label: "En attente", icon: Loader2, class: "bg-blue-500/15 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
};

const STATUS_FILTERS: { value: ArchiveStatus | "all"; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "expiring", label: "Expiration" },
    { value: "expired", label: "Expirés" },
    { value: "pending", label: "En attente" },
];

// ─── Category icons ─────────────────────────────────────────────

const FOLDER_ICONS: Record<string, React.ElementType> = {
    fiscal: Landmark,
    social: Users2,
    juridique: Scale,
    client: Building2,
    coffre: Lock,
};

// Gradient mapping moved to vault/category-config.ts

// Colors now sourced from centralized CATEGORY_COLORS (@/config/category-colors)

// ─── (Mock data removed — categories are loaded from Convex) ───

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

// ─── Helper: convert ArchiveItem → FileManagerFile ──────────────

function archiveToFile(item: ArchiveItem): FileManagerFile {
    return {
        id: item.id,
        name: item.title,
        type: "archive",
        size: item.size,
        date: item.archivedAt,
        folderId: item.folderId,
        metadata: {
            hash: item.hash,
            certId: item.certId,
            status: item.status,
            expiresAt: item.expiresAt,
            archivedBy: item.archivedBy,
            archivedByInitials: item.archivedByInitials,
            archivedAtTs: item.archivedAtTs,
        },
    };
}

// ─── List columns definition ───────────────────────────────────

const ARCHIVE_COLUMNS: ListColumn[] = [
    { key: "name", label: "Nom", sortable: true, width: "35%" },
    {
        key: "author", label: "Archivé par", sortable: true, width: "15%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            if (meta?.archivedBy) {
                return (
                    <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-violet-500/15 flex items-center justify-center">
                            <span className="text-[8px] text-violet-300 font-bold">{meta.archivedByInitials as string}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{meta.archivedBy as string}</span>
                    </div>
                );
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
    {
        key: "date", label: "Date", sortable: true, width: "12%",
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
            const status = meta?.status as ArchiveStatus | undefined;
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
        key: "size", label: "Taille", width: "10%",
        render: (item) => {
            if ("size" in item) {
                return <span className="text-muted-foreground text-xs">{(item as FileManagerFile).size}</span>;
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
    {
        key: "hash", label: "Hash", width: "16%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            if (meta?.hash) {
                return (
                    <div className="flex items-center gap-1">
                        <Hash className="h-2.5 w-2.5 text-zinc-600" />
                        <span className="text-[9px] font-mono text-zinc-500">{meta.hash as string}</span>
                    </div>
                );
            }
            const tags = "tags" in item ? (item as FileManagerFolder).tags : [];
            if (tags?.length) {
                return (
                    <div className="flex gap-1 flex-wrap">
                        {tags.slice(0, 2).map((t: string) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">{t}</span>
                        ))}
                    </div>
                );
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ArchiveListPage({ basePath = "/pro/iarchive" }: { basePath?: string }) {
    const { convexOrgId } = useConvexOrgId();

    // ─── Convex Queries ────────────────────────────────────────
    const rawArchives = useQuery(
        api.archives.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const categories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const stats = useQuery(
        api.archives.getStats,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    const createFolderMutation = useMutation(api.folders.create);

    // ─── Map Convex archives → ArchiveItem ──────────────────────
    const archives: ArchiveItem[] = useMemo(() => {
        if (!rawArchives) return [];
        return rawArchives.map((a) => {
            const statusMap: Record<string, ArchiveStatus> = {
                active: "active",
                semi_active: "active",
                archived: "active",
                expired: "expired",
                destroyed: "expired",
            };
            const threeMonths = 90 * 24 * 3600 * 1000;
            let mappedStatus: ArchiveStatus = statusMap[a.status] ?? "pending";
            if (a.retentionExpiresAt && a.retentionExpiresAt - Date.now() < threeMonths && a.retentionExpiresAt > Date.now()) {
                mappedStatus = "expiring";
            }

            const fmt = (ts: number) => new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
            const formatSize = (bytes: number) => {
                if (bytes < 1024) return `${bytes} o`;
                if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
                return `${(bytes / 1048576).toFixed(1)} Mo`;
            };
            const initials = (a.uploadedBy ?? "SY")
                .split(" ")
                .map((n: string) => n[0] ?? "")
                .join("")
                .toUpperCase()
                .slice(0, 2);

            return {
                id: a._id,
                title: a.title,
                archivedAt: fmt(a.createdAt),
                archivedAtTs: a.createdAt,
                expiresAt: a.isVault ? "Illimité" : (a.retentionExpiresAt ? fmt(a.retentionExpiresAt) : "—"),
                size: formatSize(a.fileSize),
                hash: a.sha256Hash ? `${a.sha256Hash.slice(0, 8)}…${a.sha256Hash.slice(-4)}` : "—",
                status: mappedStatus,
                certId: a.certificateId ? "CERT" : "—",
                archivedBy: a.uploadedBy ?? "Système",
                archivedByInitials: initials,
                folderId: a.categorySlug, // Use category slug as folder id
            };
        });
    }, [rawArchives]);

    // ─── Build folders from categories ──────────────────────────
    const folders: FileManagerFolder[] = useMemo(() => {
        if (!categories) return [];
        return categories.map((cat) => ({
            id: cat.slug,
            name: cat.name,
            parentFolderId: null,
            tags: [cat.slug, cat.isPerpetual ? "perpétuel" : `${cat.retentionYears} ans`],
            fileCount: archives.filter((a) => a.folderId === cat.slug).length,
            updatedAt: cat.ohadaReference ? `OHADA` : "—",
            createdBy: "Système",
            isSystem: cat.isPerpetual,
        }));
    }, [categories, archives]);

    // ─── State ──────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<ViewMode>(() =>
        getInitialViewMode("digitalium-iarchive-view")
    );
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ArchiveStatus | "all">("all");
    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

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
        // At root level, don't show individual files — just folders
        if (currentFolderId === null) return [];

        let items = archives.filter((a) => a.folderId === currentFolderId);

        // Search
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    a.hash.toLowerCase().includes(q) ||
                    a.certId.toLowerCase().includes(q) ||
                    a.archivedBy.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            items = items.filter((a) => a.status === statusFilter);
        }

        // Sort
        items.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case "name": cmp = a.title.localeCompare(b.title, "fr"); break;
                case "author": cmp = a.archivedBy.localeCompare(b.archivedBy, "fr"); break;
                case "date": cmp = a.archivedAtTs - b.archivedAtTs; break;
                case "status": cmp = a.status.localeCompare(b.status); break;
                default: cmp = a.archivedAtTs - b.archivedAtTs;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return items;
    }, [archives, currentFolderId, search, statusFilter, sortBy, sortDir]);

    const filesAsManagerFiles = useMemo(() => currentFiles.map(archiveToFile), [currentFiles]);

    // ─── Update folder file counts ──────────────────────────────
    const foldersWithCounts = useMemo(() => {
        return currentFolders.map((f) => ({
            ...f,
            fileCount: archives.filter((a) => a.folderId === f.id).length +
                folders.filter((sf) => sf.parentFolderId === f.id).length,
        }));
    }, [currentFolders, archives, folders]);

    // ─── Handlers ───────────────────────────────────────────────

    const handleOpenFolder = useCallback((folderId: string) => {
        setCurrentFolderId(folderId);
    }, []);

    const handleNavigate = useCallback((folderId: string | null) => {
        setCurrentFolderId(folderId);
    }, []);

    const handleMoveItem = useCallback(() => {
        // DnD disabled with live data — folders are categories
    }, []);

    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDir("asc");
        }
    }, [sortBy]);

    const handleCreateFolder = useCallback(async () => {
        if (!newFolderName.trim() || !convexOrgId) return;
        try {
            await createFolderMutation({
                name: newFolderName.trim(),
                organizationId: convexOrgId,
                // NOTE: Replace hardcoded user with useAuth() hook
            });
        } catch (err) {
            console.error("Folder creation error:", err);
        }
        setNewFolderName("");
        setShowNewFolderDialog(false);
    }, [newFolderName, convexOrgId, createFolderMutation]);

    // ─── Folder contents for column view ────────────────────────
    const getFolderContents = useCallback(
        (folderId: string) => {
            const subFolders = folders
                .filter((f) => f.parentFolderId === folderId)
                .map((f) => ({
                    ...f,
                    fileCount: archives.filter((a) => a.folderId === f.id).length +
                        folders.filter((sf) => sf.parentFolderId === f.id).length,
                }));
            const subFiles = archives.filter((a) => a.folderId === folderId).map(archiveToFile);
            return { folders: subFolders, files: subFiles };
        },
        [folders, archives]
    );

    // ─── Render callbacks ───────────────────────────────────────

    const renderFolderCard = useCallback(
        (folder: FileManagerFolder, isDragOver: boolean) => {
            const badges = folder.isSystem ? (
                <Badge variant="outline" className="text-[9px] h-4 border-rose-500/20 text-rose-500 bg-rose-500/10">
                    Sécurisé
                </Badge>
            ) : null;

            return (
                <VaultFolderCard
                    label={folder.name}
                    count={folder.fileCount}
                    isDragOver={isDragOver}
                    badges={badges}
                    contextMenu={null}
                    tags={
                        folder.tags.length > 0
                            ? folder.tags.map((t) => (
                                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border">
                                      {t}
                                  </span>
                              ))
                            : null
                    }
                />
            );
        },
        []
    );

    const renderFileCard = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as ArchiveStatus;
            const st = STATUS_CFG[status];
            
            // Get category styling from folderId or fallbacks
            const categoryConfig = getCategoryConfigFromFolder(file.folderId || file.name);

            const statusBadge = (
                <Badge className={`text-[9px] h-5 border ${st.class}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1.5`} />
                    {st.label}
                </Badge>
            );

            return (
                <VaultFileCard
                    title={file.name}
                    gradient={categoryConfig.gradient}
                    iconColor={categoryConfig.iconColor}
                    sizeBytes={0}
                    author={meta.archivedBy as string}
                    authorInitials={meta.archivedByInitials as string}
                    date={file.date}
                    statusBadge={statusBadge}
                    version={meta.certId as string} // Displaying certId as version badge for visibility
                    tags={[]}
                    badges={null}
                    contextMenu={null}
                />
            );
        },
        []
    );

    const renderFilePreview = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const status = meta.status as ArchiveStatus;
            const st = STATUS_CFG[status];
            return (
                <div className="p-4 space-y-4">
                    <div className="flex flex-col items-center py-6">
                        <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                            <Archive className="h-7 w-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-center px-2">{file.name}</p>
                        <Badge className={`text-[10px] h-5 border mt-2 ${st.class}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot} mr-1.5`} />
                            {st.label}
                        </Badge>
                    </div>
                    <div className="space-y-2 px-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Archivé par</span>
                            <span>{meta.archivedBy as string}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Date</span>
                            <span>{file.date}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Expiration</span>
                            <span>{meta.expiresAt as string}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Taille</span>
                            <span>{file.size}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Certificat</span>
                            <span className="text-violet-400 font-mono text-[11px]">{meta.certId as string}</span>
                        </div>
                        <div className="pt-2">
                            <span className="text-[10px] text-muted-foreground block mb-1">Hash SHA-256</span>
                            <span className="text-[10px] font-mono text-emerald-400">{meta.hash as string}</span>
                        </div>
                        <div className="pt-3 flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs border-white/10"
                            >
                                <Download className="h-3 w-3 mr-1.5" />
                                Télécharger
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs border-white/10"
                            >
                                <Shield className="h-3 w-3 mr-1.5" />
                                Vérifier
                            </Button>
                        </div>
                    </div>
                </div>
            );
        },
        []
    );

    const hasActiveFilters = statusFilter !== "all" || search;
    const totalArchives = stats?.totalArchives ?? archives.length;
    const activeCount = stats?.byStatus?.active ?? archives.filter((a) => a.status === "active").length;
    const alertCount = (stats?.byStatus?.expired ?? 0) + (stats?.expiringSoon ?? 0);

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
                        <Archive className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            iArchive
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {totalArchives} archive{totalArchives > 1 ? "s" : ""} · {activeCount} active{activeCount > 1 ? "s" : ""} · {alertCount} alerte{alertCount > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewFolderDialog(true)}
                        className="border-white/10 text-xs gap-1.5"
                    >
                        <FolderPlus className="h-3.5 w-3.5" />
                        Nouveau dossier
                    </Button>
                    <Link href={`${basePath}/certificates`}>
                        <Button variant="outline" size="sm" className="text-xs border-white/10">
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            Certificats
                        </Button>
                    </Link>
                    <Link href={`${basePath}/upload`}>
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                        >
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            Archiver
                        </Button>
                    </Link>
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
                                    placeholder="Rechercher dans les archives…"
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
                                    storageKey="digitalium-iarchive-view"
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
                rootLabel="Archives"
                rootIcon={Archive}
            />

            {/* ── Content — Finder Views ─────────────────────── */}
            <AnimatePresence mode="wait">
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
                                        Ce dossier ne contient aucune archive. Glissez-déposez des fichiers ici ou archivez un document.
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
                            columns={ARCHIVE_COLUMNS}
                            onOpenFolder={handleOpenFolder}
                            onMoveItem={handleMoveItem}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={handleSort}
                            renderFolderIcon={(folder) => {
                                const FIcon = FOLDER_ICONS[folder.id] || Folder;
                                const bg = CATEGORY_COLORS[folder.id]?.bg || "bg-violet-500/15";
                                const clr = CATEGORY_COLORS[folder.id]?.color || "text-violet-400";
                                return (
                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${bg}`}>
                                        <FIcon className={`h-3 w-3 ${clr}`} />
                                    </div>
                                );
                            }}
                            renderFileIcon={() => (
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
                                    <p className="text-sm text-muted-foreground">Aucune archive dans ce dossier.</p>
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
                                fileCount: archives.filter((a) => a.folderId === f.id).length +
                                    folders.filter((sf) => sf.parentFolderId === f.id).length,
                            }))}
                            rootFiles={[]}
                            getFolderContents={getFolderContents}
                            onMoveItem={handleMoveItem}
                            renderFilePreview={renderFilePreview}
                            renderFolderIcon={(folder) => {
                                const FIcon = FOLDER_ICONS[folder.id] || Folder;
                                const clr = CATEGORY_COLORS[folder.id]?.color || "text-violet-400";
                                return <FIcon className={`h-3.5 w-3.5 ${clr} shrink-0`} />;
                            }}
                            renderFileIcon={() => (
                                <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── New Folder Dialog ──────────────────────────── */}
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
                            <Label htmlFor="archive-folder-name" className="text-xs">Nom du dossier *</Label>
                            <Input
                                id="archive-folder-name"
                                placeholder="Ex: Contrats 2026"
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
        </motion.div>
    );
}
