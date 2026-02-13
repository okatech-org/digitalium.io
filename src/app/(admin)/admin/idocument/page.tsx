// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Dossiers
// Gestion des dossiers avec UX macOS Finder
// 3 modes d'affichage + DnD + Dossier Brouillon
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderOpen,
    Plus,
    Search,
    Filter,
    Upload,
    FileText,
    Image as ImageIcon,
    File,
    MoreVertical,
    Users,
    Calendar,
    Tag,
    Lock,
    Globe,
    UsersRound,
    ArrowLeft,
    FolderPlus,
    Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    ViewModeToggle,
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

/* ─── Animations ─────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Tag colors ─────────────────────────── */

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
    fiscal: { bg: "bg-amber-500/15", text: "text-amber-400" },
    social: { bg: "bg-blue-500/15", text: "text-blue-400" },
    juridique: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    client: { bg: "bg-violet-500/15", text: "text-violet-400" },
    interne: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
};

/* ─── Visibility config ──────────────────── */

const VISIBILITY_CONFIG = {
    private: { icon: Lock, label: "Privé", color: "text-zinc-400" },
    shared: { icon: Globe, label: "Partagé", color: "text-blue-400" },
    team: { icon: UsersRound, label: "Équipe", color: "text-violet-400" },
};

/* ─── Mock data ──────────────────────────── */

interface MockFolder {
    id: string;
    name: string;
    description: string;
    tags: string[];
    visibility: "private" | "shared" | "team";
    sharedWith: number;
    fileCount: number;
    scheduledArchive: boolean;
    archiveDate: string | null;
    createdBy: string;
    updatedAt: string;
    isSystem?: boolean;
}

const MOCK_FOLDERS: MockFolder[] = [
    {
        id: "brouillon",
        name: "Brouillon",
        description: "Fichiers non classés — Dossier système",
        tags: [],
        visibility: "private",
        sharedWith: 0,
        fileCount: 2,
        scheduledArchive: false,
        archiveDate: null,
        createdBy: "Système",
        updatedAt: "il y a 30min",
        isSystem: true,
    },
    {
        id: "1",
        name: "Déclarations Fiscales 2025",
        description: "Toutes les déclarations fiscales de l'exercice 2025",
        tags: ["fiscal"],
        visibility: "shared",
        sharedWith: 3,
        fileCount: 12,
        scheduledArchive: true,
        archiveDate: "15 mar 2026",
        createdBy: "Marie Nzé",
        updatedAt: "il y a 2h",
    },
    {
        id: "2",
        name: "Contrats Employés",
        description: "Contrats de travail et avenants",
        tags: ["social", "juridique"],
        visibility: "team",
        sharedWith: 8,
        fileCount: 24,
        scheduledArchive: false,
        archiveDate: null,
        createdBy: "Patrick Obiang",
        updatedAt: "il y a 1j",
    },
    {
        id: "3",
        name: "Dossier Client — BGFI Bank",
        description: "Documents relatifs au contrat BGFI",
        tags: ["client"],
        visibility: "shared",
        sharedWith: 2,
        fileCount: 7,
        scheduledArchive: true,
        archiveDate: "1 jun 2026",
        createdBy: "Jean Moussavou",
        updatedAt: "il y a 3j",
    },
    {
        id: "4",
        name: "PV Assemblée Générale",
        description: "Procès-verbaux des AG et réunions",
        tags: ["juridique"],
        visibility: "private",
        sharedWith: 0,
        fileCount: 5,
        scheduledArchive: false,
        archiveDate: null,
        createdBy: "Marie Nzé",
        updatedAt: "il y a 5j",
    },
    {
        id: "5",
        name: "Bulletins de paie — Janvier 2026",
        description: "Fiches de paie de tout le personnel",
        tags: ["social"],
        visibility: "team",
        sharedWith: 12,
        fileCount: 45,
        scheduledArchive: true,
        archiveDate: "1 fév 2027",
        createdBy: "Alice Ndong",
        updatedAt: "il y a 1h",
    },
    {
        id: "6",
        name: "Notes internes",
        description: "Mémos et communications internes",
        tags: ["interne"],
        visibility: "private",
        sharedWith: 0,
        fileCount: 3,
        scheduledArchive: false,
        archiveDate: null,
        createdBy: "Patrick Obiang",
        updatedAt: "il y a 2j",
    },
];

interface MockFile {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    folderId: string;
}

const MOCK_FILES: MockFile[] = [
    { id: "f1", name: "declaration_tva_q4_2025.pdf", type: "pdf", size: "2.4 MB", date: "15 jan 2026", folderId: "1" },
    { id: "f2", name: "bilan_comptable_2025.pdf", type: "pdf", size: "5.1 MB", date: "10 jan 2026", folderId: "1" },
    { id: "f3", name: "justificatif_paiement.jpg", type: "image", size: "1.2 MB", date: "8 jan 2026", folderId: "1" },
    { id: "f4", name: "annexe_fiscale.docx", type: "docx", size: "890 KB", date: "5 jan 2026", folderId: "1" },
    { id: "f5", name: "recapitulatif_charges.pdf", type: "pdf", size: "3.7 MB", date: "1 jan 2026", folderId: "1" },
    { id: "f6", name: "note_interne_janv.pdf", type: "pdf", size: "420 KB", date: "20 jan 2026", folderId: "brouillon" },
    { id: "f7", name: "scan_recu.jpg", type: "image", size: "1.8 MB", date: "18 jan 2026", folderId: "brouillon" },
];

/* ─── File icon helper ───────────────────── */

function getFileIcon(type: string) {
    switch (type) {
        case "pdf": return <FileText className="h-4 w-4 text-red-400" />;
        case "image": return <ImageIcon className="h-4 w-4 text-blue-400" />;
        case "docx": return <File className="h-4 w-4 text-blue-500" />;
        default: return <File className="h-4 w-4 text-zinc-400" />;
    }
}

/* ─── Convert to shared types ────────────── */

function toFileManagerFolder(f: MockFolder): FileManagerFolder {
    return {
        id: f.id,
        name: f.name,
        description: f.description,
        parentFolderId: null,
        tags: f.tags,
        fileCount: f.fileCount,
        updatedAt: f.updatedAt,
        createdBy: f.createdBy,
        isSystem: f.isSystem,
        metadata: { visibility: f.visibility, sharedWith: f.sharedWith, scheduledArchive: f.scheduledArchive, archiveDate: f.archiveDate },
    };
}

function toFileManagerFile(f: MockFile): FileManagerFile {
    return { id: f.id, name: f.name, type: f.type, size: f.size, date: f.date, folderId: f.folderId };
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function DossiersPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [search, setSearch] = useState("");
    const [filterTag, setFilterTag] = useState("all");
    const [filterVisibility, setFilterVisibility] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [openFolder, setOpenFolder] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [currentPath, setCurrentPath] = useState<{ id: string; name: string }[]>([]);
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // New folder form
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTags, setNewTags] = useState<string[]>([]);
    const [newVisibility, setNewVisibility] = useState<"private" | "shared" | "team">("private");
    const [newAutoArchive, setNewAutoArchive] = useState(false);
    const [newArchiveCategory, setNewArchiveCategory] = useState("fiscal");

    // Filter logic (Brouillon always shows)
    const filteredFolders = MOCK_FOLDERS.filter((f) => {
        if (f.isSystem) return true;
        if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterTag !== "all" && !f.tags.includes(filterTag)) return false;
        if (filterVisibility !== "all" && f.visibility !== filterVisibility) return false;
        return true;
    });

    const selectedFolder = MOCK_FOLDERS.find((f) => f.id === openFolder);
    const folderFiles = MOCK_FILES.filter((f) => f.folderId === openFolder);

    const handleCreate = () => {
        setCreateOpen(false);
        setNewName("");
        setNewDesc("");
        setNewTags([]);
        setNewVisibility("private");
        setNewAutoArchive(false);
        toast.success("Dossier créé avec succès");
    };

    const toggleTag = (tag: string) => {
        setNewTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleOpenFolder = (folderId: string) => {
        const folder = MOCK_FOLDERS.find((f) => f.id === folderId);
        if (folder) {
            setOpenFolder(folderId);
            setCurrentPath([{ id: folderId, name: folder.name }]);
        }
    };

    const handleNavigate = (folderId: string | null) => {
        if (folderId === null) {
            setOpenFolder(null);
            setCurrentPath([]);
        }
    };

    const handleMoveItem = (event: DragMoveEvent) => {
        const target = MOCK_FOLDERS.find((f) => f.id === event.targetFolderId);
        toast.success(`${event.itemType === "file" ? "Fichier" : "Dossier"} déplacé vers "${target?.name || event.targetFolderId}"`);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDir("asc");
        }
    };

    /* ─── Render callbacks for shared components ── */

    const renderFolderCard = (folder: FileManagerFolder, isDragOver: boolean) => {
        const mockFolder = MOCK_FOLDERS.find((f) => f.id === folder.id);
        if (!mockFolder) return null;
        const vis = VISIBILITY_CONFIG[mockFolder.visibility];
        const VisIcon = vis.icon;
        const isSystem = mockFolder.isSystem;

        return (
            <div className={`glass-card rounded-xl p-4 border transition-all group ${
                isDragOver
                    ? "border-violet-500/40 bg-violet-500/5 scale-[1.02]"
                    : isSystem
                        ? "border-dashed border-white/10 hover:border-zinc-400/20"
                        : "border-white/5 hover:border-violet-500/20"
            }`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSystem ? "bg-zinc-500/10" : "bg-violet-500/10"
                        }`}>
                            {isSystem
                                ? <Inbox className="h-4 w-4 text-zinc-500" />
                                : <FolderOpen className="h-4 w-4 text-violet-400" />
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate flex items-center gap-2">
                                {mockFolder.name}
                                {isSystem && (
                                    <span className="text-[9px] text-zinc-500 bg-zinc-500/10 px-1.5 py-0.5 rounded font-normal">
                                        Système
                                    </span>
                                )}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{mockFolder.description}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs">Ouvrir</DropdownMenuItem>
                            {!isSystem && (
                                <>
                                    <DropdownMenuItem className="text-xs">Renommer</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs">Modifier les permissions</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-xs text-red-400">Supprimer</DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Tags */}
                {mockFolder.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {mockFolder.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className={`text-[9px] border-0 ${TAG_COLORS[tag]?.bg || "bg-zinc-500/15"} ${TAG_COLORS[tag]?.text || "text-zinc-400"}`}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <VisIcon className={`h-3 w-3 ${vis.color}`} />
                            {vis.label}
                        </span>
                        {mockFolder.sharedWith > 0 && (
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {mockFolder.sharedWith}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {mockFolder.fileCount}
                        </span>
                    </div>
                    {mockFolder.scheduledArchive && (
                        <span className="flex items-center gap-1 text-amber-400">
                            <Calendar className="h-3 w-3" />
                            {mockFolder.archiveDate}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderFileCard = (file: FileManagerFile) => (
        <div className="glass-card rounded-xl p-3 border border-white/5 hover:border-violet-500/20 transition-all group">
            <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{file.size} · {file.date}</p>
                </div>
            </div>
        </div>
    );

    /* ─── List view columns ── */

    const listColumns: ListColumn[] = [
        { key: "name", label: "Nom", sortable: true },
        { key: "tags", label: "Tags", width: "120px", render: (item) => {
            const f = MOCK_FOLDERS.find(mf => mf.id === item.id);
            if (!f) return <span className="text-muted-foreground">{(item as FileManagerFile).type?.toUpperCase()}</span>;
            return (
                <div className="flex gap-1">
                    {f.tags.map(t => (
                        <Badge key={t} variant="secondary" className={`text-[9px] border-0 ${TAG_COLORS[t]?.bg} ${TAG_COLORS[t]?.text}`}>{t}</Badge>
                    ))}
                </div>
            );
        }},
        { key: "fileCount", label: "Fichiers", width: "80px", sortable: true, render: (item) => {
            const f = MOCK_FOLDERS.find(mf => mf.id === item.id);
            return <span className="text-muted-foreground">{f ? f.fileCount : (item as FileManagerFile).size}</span>;
        }},
        { key: "updatedAt", label: "Modifié", width: "100px", sortable: true, render: (item) => (
            <span className="text-muted-foreground">{(item as FileManagerFolder).updatedAt || (item as FileManagerFile).date}</span>
        )},
    ];

    /* ─── Column view: get folder contents ── */

    const getFolderContents = (folderId: string) => {
        const files = MOCK_FILES.filter(f => f.folderId === folderId).map(toFileManagerFile);
        return { folders: [] as FileManagerFolder[], files };
    };

    /* ── Folder detail view (inside a folder) ── */
    if (openFolder && selectedFolder) {
        const vis = VISIBILITY_CONFIG[selectedFolder.visibility];
        const VisIcon = vis.icon;

        return (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
                {/* Header + Breadcrumb */}
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setOpenFolder(null); setCurrentPath([]); }}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {selectedFolder.isSystem
                                ? <Inbox className="h-5 w-5 text-zinc-500" />
                                : <FolderOpen className="h-5 w-5 text-violet-400" />
                            }
                            {selectedFolder.name}
                        </h1>
                        <BreadcrumbPath path={currentPath} onNavigate={handleNavigate} />
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedFolder.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className={`text-[9px] border-0 ${TAG_COLORS[tag]?.bg || "bg-zinc-500/15"} ${TAG_COLORS[tag]?.text || "text-zinc-400"}`}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </motion.div>

                {/* Info bar */}
                <motion.div variants={fadeUp} className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <VisIcon className={`h-3.5 w-3.5 ${vis.color}`} />
                        {vis.label}
                        {selectedFolder.sharedWith > 0 && ` · ${selectedFolder.sharedWith} personnes`}
                    </span>
                    <span>{folderFiles.length} fichiers</span>
                    {selectedFolder.scheduledArchive && (
                        <span className="flex items-center gap-1 text-amber-400">
                            <Calendar className="h-3 w-3" />
                            Archivage le {selectedFolder.archiveDate}
                        </span>
                    )}
                </motion.div>

                {/* Drop zone + file list */}
                <motion.div variants={fadeUp}>
                    <div
                        className={`glass-card rounded-2xl p-5 border ${dragOver ? "border-violet-500/40 bg-violet-500/5" : "border-white/5"} transition-colors`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); toast.info("Import en cours…"); }}
                    >
                        {/* Upload area */}
                        <div className={`flex flex-col items-center justify-center py-6 mb-4 rounded-xl border-2 border-dashed ${dragOver ? "border-violet-400/50 bg-violet-500/5" : "border-white/10"} transition-colors`}>
                            <Upload className={`h-8 w-8 mb-2 ${dragOver ? "text-violet-400" : "text-muted-foreground/40"}`} />
                            <p className="text-xs text-muted-foreground">
                                Glissez vos fichiers ici ou{" "}
                                <button className="text-violet-400 hover:underline">parcourir</button>
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-1">PDF, DOCX, PNG, JPG — Max 50 MB</p>
                        </div>

                        {/* File list */}
                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                                <span>Fichier</span>
                                <div className="flex items-center gap-8">
                                    <span className="w-16 text-right">Taille</span>
                                    <span className="w-20 text-right">Date</span>
                                    <span className="w-8" />
                                </div>
                            </div>
                            {folderFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.02] group">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(file.type)}
                                        <span className="text-xs font-medium">{file.name}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-[10px] text-muted-foreground w-16 text-right">{file.size}</span>
                                        <span className="text-[10px] text-muted-foreground w-20 text-right">{file.date}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-xs">Prévisualiser</DropdownMenuItem>
                                                <DropdownMenuItem className="text-xs">Télécharger</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-xs text-red-400">Supprimer</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                            {folderFiles.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground/40">
                                    <p className="text-xs">Ce dossier est vide</p>
                                    <p className="text-[10px] mt-1">Glissez des fichiers pour les importer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    /* ── Main folders view with Finder modes ── */

    const fmFolders = filteredFolders.map(toFileManagerFolder);
    const fmRootFiles = MOCK_FILES.filter(f => f.folderId === "brouillon").map(toFileManagerFile);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FolderOpen className="h-6 w-6 text-violet-400" />
                        Dossiers
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {MOCK_FOLDERS.length} dossiers · {MOCK_FOLDERS.reduce((s, f) => s + f.fileCount, 0)} fichiers au total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewModeToggle value={viewMode} onChange={setViewMode} storageKey="digitalium-idoc-view" />
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Nouveau dossier
                    </Button>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un dossier…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="w-[140px] h-9 text-xs bg-white/5 border-white/10">
                        <Tag className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les tags</SelectItem>
                        <SelectItem value="fiscal">Fiscal</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="juridique">Juridique</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="interne">Interne</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                    <SelectTrigger className="w-[140px] h-9 text-xs bg-white/5 border-white/10">
                        <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="private">Privés</SelectItem>
                        <SelectItem value="shared">Partagés</SelectItem>
                        <SelectItem value="team">Équipe</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>

            {/* View modes */}
            <motion.div variants={fadeUp}>
                {viewMode === "grid" && (
                    <FinderGridView
                        folders={fmFolders}
                        files={[]}
                        onOpenFolder={handleOpenFolder}
                        onMoveItem={handleMoveItem}
                        renderFolderCard={renderFolderCard}
                        renderFileCard={renderFileCard}
                        emptyState={
                            <div className="text-center py-16">
                                <FolderPlus className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Aucun dossier trouvé</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Modifiez vos filtres ou créez un nouveau dossier</p>
                            </div>
                        }
                    />
                )}

                {viewMode === "list" && (
                    <FinderListView
                        folders={fmFolders}
                        files={[]}
                        columns={listColumns}
                        onOpenFolder={handleOpenFolder}
                        onMoveItem={handleMoveItem}
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                        renderFolderIcon={(folder) => {
                            const f = MOCK_FOLDERS.find(mf => mf.id === folder.id);
                            return f?.isSystem
                                ? <Inbox className="h-4 w-4 text-zinc-500" />
                                : <FolderOpen className="h-4 w-4 text-violet-400" />;
                        }}
                        renderFileIcon={(file) => getFileIcon(file.type)}
                        emptyState={
                            <div className="text-center py-16">
                                <FolderPlus className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Aucun dossier trouvé</p>
                            </div>
                        }
                    />
                )}

                {viewMode === "column" && (
                    <FinderColumnView
                        rootFolders={fmFolders}
                        rootFiles={fmRootFiles}
                        getFolderContents={getFolderContents}
                        onMoveItem={handleMoveItem}
                        renderFolderIcon={(folder) => {
                            const f = MOCK_FOLDERS.find(mf => mf.id === folder.id);
                            return f?.isSystem
                                ? <Inbox className="h-3.5 w-3.5 text-zinc-500" />
                                : <FolderOpen className="h-3.5 w-3.5 text-violet-400" />;
                        }}
                        renderFileIcon={(file) => getFileIcon(file.type)}
                        renderFilePreview={(file) => (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center py-6">
                                    <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <p className="text-sm font-semibold text-center">{file.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{file.type.toUpperCase()} · {file.size}</p>
                                </div>
                                <div className="space-y-2 px-4">
                                    <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                        <span className="text-muted-foreground">Type</span>
                                        <span>{file.type.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                        <span className="text-muted-foreground">Taille</span>
                                        <span>{file.size}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Date</span>
                                        <span>{file.date}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                )}
            </motion.div>

            {/* ═══ Create folder modal ═══ */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[520px] glass-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <FolderPlus className="h-5 w-5 text-violet-400" />
                            Nouveau dossier
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Créez un dossier pour organiser et importer vos fichiers
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Nom du dossier</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="ex: Déclarations Fiscales 2026"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Description</label>
                            <Textarea
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Description optionnelle du dossier…"
                                className="text-xs bg-white/5 border-white/10 min-h-[60px] resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(TAG_COLORS).map(([tag, colors]) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                                            newTags.includes(tag)
                                                ? `${colors.bg} ${colors.text} border-transparent`
                                                : "border-white/10 text-muted-foreground hover:bg-white/5"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Visibilité</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["private", "shared", "team"] as const).map((v) => {
                                    const cfg = VISIBILITY_CONFIG[v];
                                    const Icon = cfg.icon;
                                    return (
                                        <button
                                            key={v}
                                            onClick={() => setNewVisibility(v)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                                                newVisibility === v
                                                    ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                                                    : "border-white/10 text-muted-foreground hover:bg-white/5"
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="glass-card rounded-lg p-3 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                                    <span className="text-xs font-medium">Archivage automatique</span>
                                </div>
                                <button
                                    onClick={() => setNewAutoArchive(!newAutoArchive)}
                                    className={`h-5 w-9 rounded-full transition-colors ${newAutoArchive ? "bg-violet-500" : "bg-white/10"}`}
                                >
                                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${newAutoArchive ? "translate-x-4" : "translate-x-0.5"}`} />
                                </button>
                            </div>
                            <AnimatePresence>
                                {newAutoArchive && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 flex items-center gap-2">
                                            <Select value={newArchiveCategory} onValueChange={setNewArchiveCategory}>
                                                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 flex-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fiscal">Catégorie: Fiscal</SelectItem>
                                                    <SelectItem value="social">Catégorie: Social</SelectItem>
                                                    <SelectItem value="juridique">Catégorie: Juridique</SelectItem>
                                                    <SelectItem value="client">Catégorie: Client</SelectItem>
                                                    <SelectItem value="vault">Coffre-Fort</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input type="date" className="h-8 text-xs bg-white/5 border-white/10 w-[140px]" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCreateOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 text-white"
                            onClick={handleCreate}
                            disabled={!newName.trim()}
                        >
                            <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
                            Créer le dossier
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
