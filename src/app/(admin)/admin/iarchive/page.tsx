// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Vue Globale
// Tous les fichiers archivés avec modes Finder
// 3 modes d'affichage + DnD entre catégories
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Archive,
    Search,
    Filter,
    Download,
    FileText,
    HardDrive,
    Shield,
    Clock,
    Eye,
    Landmark,
    Briefcase,
    Scale,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    ViewModeToggle,
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

/* ─── Category config ────────────────────── */

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    fiscal: { bg: "bg-amber-500/15", text: "text-amber-400", icon: Landmark, label: "Fiscal" },
    social: { bg: "bg-blue-500/15", text: "text-blue-400", icon: Briefcase, label: "Social" },
    juridique: { bg: "bg-emerald-500/15", text: "text-emerald-400", icon: Scale, label: "Juridique" },
    client: { bg: "bg-violet-500/15", text: "text-violet-400", icon: Users, label: "Client" },
};

const CONFIDENTIALITY_COLORS: Record<string, { bg: string; text: string }> = {
    public: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
    internal: { bg: "bg-blue-500/15", text: "text-blue-400" },
    confidential: { bg: "bg-amber-500/15", text: "text-amber-400" },
    secret: { bg: "bg-red-500/15", text: "text-red-400" },
};

/* ─── Mock data ──────────────────────────── */

interface MockArchive {
    id: string;
    title: string;
    fileName: string;
    category: string;
    size: string;
    uploadedBy: string;
    archivedAt: string;
    retentionYears: number;
    retentionProgress: number;
    expiresAt: string;
    confidentiality: string;
    status: "active" | "expired";
}

const MOCK_ARCHIVES: MockArchive[] = [
    { id: "1", title: "Déclaration TVA Q4 2025", fileName: "declaration_tva_q4.pdf", category: "fiscal", size: "2.4 MB", uploadedBy: "Marie Nzé", archivedAt: "15 jan 2026", retentionYears: 10, retentionProgress: 10, expiresAt: "15 jan 2036", confidentiality: "internal", status: "active" },
    { id: "2", title: "Contrat CDI — Jean Moussavou", fileName: "contrat_cdi_moussavou.pdf", category: "social", size: "1.8 MB", uploadedBy: "Alice Ndong", archivedAt: "10 jan 2026", retentionYears: 5, retentionProgress: 4, expiresAt: "10 jan 2031", confidentiality: "confidential", status: "active" },
    { id: "3", title: "PV AG Extraordinaire 2025", fileName: "pv_ag_extraordinaire.pdf", category: "juridique", size: "3.2 MB", uploadedBy: "Patrick Obiang", archivedAt: "5 jan 2026", retentionYears: 10, retentionProgress: 10, expiresAt: "5 jan 2036", confidentiality: "secret", status: "active" },
    { id: "4", title: "Contrat BGFI Bank — Licence", fileName: "contrat_bgfi_licence.pdf", category: "client", size: "5.1 MB", uploadedBy: "Jean Moussavou", archivedAt: "1 jan 2026", retentionYears: 10, retentionProgress: 10, expiresAt: "1 jan 2036", confidentiality: "confidential", status: "active" },
    { id: "5", title: "Bilan Comptable 2025", fileName: "bilan_2025.pdf", category: "fiscal", size: "8.3 MB", uploadedBy: "Marie Nzé", archivedAt: "20 déc 2025", retentionYears: 10, retentionProgress: 10, expiresAt: "20 déc 2035", confidentiality: "internal", status: "active" },
    { id: "6", title: "Bulletins de paie — Déc 2025", fileName: "paie_dec_2025.zip", category: "social", size: "12.1 MB", uploadedBy: "Alice Ndong", archivedAt: "15 déc 2025", retentionYears: 5, retentionProgress: 4, expiresAt: "15 déc 2030", confidentiality: "confidential", status: "active" },
    { id: "7", title: "Statuts société — Modifiés", fileName: "statuts_modifies.pdf", category: "juridique", size: "2.1 MB", uploadedBy: "Patrick Obiang", archivedAt: "1 déc 2025", retentionYears: 30, retentionProgress: 2, expiresAt: "1 déc 2055", confidentiality: "secret", status: "active" },
    { id: "8", title: "Attestation CNSS 2025", fileName: "attestation_cnss.pdf", category: "social", size: "890 KB", uploadedBy: "Alice Ndong", archivedAt: "10 nov 2025", retentionYears: 5, retentionProgress: 8, expiresAt: "10 nov 2030", confidentiality: "internal", status: "active" },
];

/* ─── Converters ─────────────────────────── */

function archiveToFileManagerFile(a: MockArchive): FileManagerFile {
    return {
        id: a.id,
        name: a.fileName,
        type: "pdf",
        size: a.size,
        date: a.archivedAt,
        folderId: a.category,
        metadata: { title: a.title, category: a.category, confidentiality: a.confidentiality, retentionYears: a.retentionYears, retentionProgress: a.retentionProgress, expiresAt: a.expiresAt, uploadedBy: a.uploadedBy },
    };
}

function categoriesToFolders(): FileManagerFolder[] {
    return Object.entries(CATEGORY_COLORS).map(([slug, cfg]) => ({
        id: slug,
        name: cfg.label,
        description: `Archives ${cfg.label.toLowerCase()}`,
        parentFolderId: null,
        tags: [slug],
        fileCount: MOCK_ARCHIVES.filter(a => a.category === slug).length,
        updatedAt: "",
        createdBy: "Système",
        metadata: { color: cfg.bg, textColor: cfg.text },
    }));
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function ArchiveGlobalPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterConfidentiality, setFilterConfidentiality] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const filtered = MOCK_ARCHIVES.filter((a) => {
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.fileName.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory !== "all" && a.category !== filterCategory) return false;
        if (filterConfidentiality !== "all" && a.confidentiality !== filterConfidentiality) return false;
        return true;
    });

    const totalArchives = MOCK_ARCHIVES.length;
    const categoryCounts = Object.entries(CATEGORY_COLORS).map(([slug, cfg]) => ({
        slug,
        label: cfg.label,
        count: MOCK_ARCHIVES.filter((a) => a.category === slug).length,
        Icon: cfg.icon,
        bg: cfg.bg,
        text: cfg.text,
    }));
    const totalSizeGB = "42.3 GB";

    const handleMoveItem = (event: DragMoveEvent) => {
        const catInfo = CATEGORY_COLORS[event.targetFolderId];
        toast.success(`Archive déplacée vers "${catInfo?.label || event.targetFolderId}"`);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDir("asc");
        }
    };

    const fmFolders = categoriesToFolders();
    const fmFiles = filtered.map(archiveToFileManagerFile);

    const listColumns: ListColumn[] = [
        { key: "name", label: "Document", sortable: true },
        { key: "category", label: "Catégorie", width: "100px", render: (item) => {
            const archive = MOCK_ARCHIVES.find(a => a.id === item.id);
            if (!archive) return null;
            const cat = CATEGORY_COLORS[archive.category];
            return <Badge variant="secondary" className={`text-[9px] border-0 ${cat?.bg} ${cat?.text}`}>{cat?.label || archive.category}</Badge>;
        }},
        { key: "size", label: "Taille", width: "80px", sortable: true, render: (item) => (
            <span className="text-muted-foreground">{(item as FileManagerFile).size}</span>
        )},
        { key: "confidentiality", label: "Confid.", width: "100px", render: (item) => {
            const archive = MOCK_ARCHIVES.find(a => a.id === item.id);
            if (!archive) return null;
            const conf = CONFIDENTIALITY_COLORS[archive.confidentiality];
            return <Badge variant="secondary" className={`text-[9px] border-0 ${conf?.bg} ${conf?.text}`}>{archive.confidentiality}</Badge>;
        }},
        { key: "date", label: "Archivé le", width: "100px", sortable: true, render: (item) => (
            <span className="text-muted-foreground">{(item as FileManagerFile).date}</span>
        )},
    ];

    const getFolderContents = (categorySlug: string) => {
        const files = MOCK_ARCHIVES.filter(a => a.category === categorySlug).map(archiveToFileManagerFile);
        return { folders: [] as FileManagerFolder[], files };
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Archive className="h-6 w-6 text-violet-400" />
                        Archives — Vue Globale
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tous les fichiers archivés, filtrables par catégorie et confidentialité
                    </p>
                </div>
                <ViewModeToggle value={viewMode} onChange={setViewMode} storageKey="digitalium-iarchive-view" />
            </motion.div>

            {/* KPI cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Archive className="h-4 w-4 text-violet-400" />
                        <span className="text-[10px] text-muted-foreground">Total</span>
                    </div>
                    <p className="text-2xl font-bold">{totalArchives}</p>
                </div>
                {categoryCounts.map((cat) => (
                    <div key={cat.slug} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <cat.Icon className={`h-4 w-4 ${cat.text}`} />
                            <span className="text-[10px] text-muted-foreground">{cat.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${cat.text}`}>{cat.count}</p>
                    </div>
                ))}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="h-4 w-4 text-zinc-400" />
                        <span className="text-[10px] text-muted-foreground">Stockage</span>
                    </div>
                    <p className="text-2xl font-bold">{totalSizeGB}</p>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Rechercher un fichier archivé…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-xs bg-white/5 border-white/10" />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[150px] h-9 text-xs bg-white/5 border-white/10">
                        <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        <SelectItem value="fiscal">Fiscal</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="juridique">Juridique</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterConfidentiality} onValueChange={setFilterConfidentiality}>
                    <SelectTrigger className="w-[160px] h-9 text-xs bg-white/5 border-white/10">
                        <Shield className="h-3 w-3 mr-1.5 text-muted-foreground" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toute confidentialité</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Interne</SelectItem>
                        <SelectItem value="confidential">Confidentiel</SelectItem>
                        <SelectItem value="secret">Secret</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>

            {/* View modes */}
            <motion.div variants={fadeUp}>
                {viewMode === "list" && (
                    <FinderListView
                        folders={[]}
                        files={fmFiles}
                        columns={listColumns}
                        onOpenFolder={() => {}}
                        onMoveItem={handleMoveItem}
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                        renderFileIcon={(file) => {
                            const archive = MOCK_ARCHIVES.find(a => a.id === file.id);
                            const cat = archive ? CATEGORY_COLORS[archive.category] : null;
                            const CatIcon = cat?.icon || FileText;
                            return (
                                <div className={`h-6 w-6 rounded-md ${cat?.bg || "bg-zinc-500/15"} flex items-center justify-center`}>
                                    <CatIcon className={`h-3 w-3 ${cat?.text || "text-zinc-400"}`} />
                                </div>
                            );
                        }}
                        emptyState={
                            <div className="text-center py-12">
                                <Archive className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Aucune archive trouvée</p>
                            </div>
                        }
                    />
                )}

                {viewMode === "grid" && (
                    <FinderGridView
                        folders={[]}
                        files={fmFiles}
                        onOpenFolder={() => {}}
                        onMoveItem={handleMoveItem}
                        renderFolderCard={() => null}
                        renderFileCard={(file) => {
                            const archive = MOCK_ARCHIVES.find(a => a.id === file.id);
                            if (!archive) return null;
                            const cat = CATEGORY_COLORS[archive.category];
                            const CatIcon = cat?.icon || FileText;
                            const conf = CONFIDENTIALITY_COLORS[archive.confidentiality];
                            return (
                                <div className="glass-card rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-all group">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`h-9 w-9 rounded-lg ${cat?.bg || "bg-zinc-500/15"} flex items-center justify-center shrink-0`}>
                                            <CatIcon className={`h-4 w-4 ${cat?.text || "text-zinc-400"}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold truncate">{archive.title}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{archive.fileName} · {archive.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${cat?.bg} ${cat?.text}`}>{cat?.label}</Badge>
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${conf?.bg} ${conf?.text}`}>{archive.confidentiality}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Eye className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Download className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                        <div className="flex-1 h-1.5 rounded-full bg-white/5">
                                            <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(archive.retentionProgress, 100)}%` }} />
                                        </div>
                                        <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{archive.retentionYears} ans</span>
                                    </div>
                                </div>
                            );
                        }}
                        emptyState={
                            <div className="text-center py-12">
                                <Archive className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Aucune archive trouvée</p>
                            </div>
                        }
                    />
                )}

                {viewMode === "column" && (
                    <FinderColumnView
                        rootFolders={fmFolders}
                        rootFiles={[]}
                        getFolderContents={getFolderContents}
                        onMoveItem={handleMoveItem}
                        renderFolderIcon={(folder) => {
                            const cat = CATEGORY_COLORS[folder.id];
                            const CatIcon = cat?.icon || Archive;
                            return <CatIcon className={`h-3.5 w-3.5 ${cat?.text || "text-zinc-400"}`} />;
                        }}
                        renderFileIcon={(file) => {
                            const archive = MOCK_ARCHIVES.find(a => a.id === file.id);
                            const cat = archive ? CATEGORY_COLORS[archive.category] : null;
                            return <FileText className={`h-3.5 w-3.5 ${cat?.text || "text-zinc-400"}`} />;
                        }}
                        renderFilePreview={(file) => {
                            const archive = MOCK_ARCHIVES.find(a => a.id === file.id);
                            if (!archive) return null;
                            const cat = CATEGORY_COLORS[archive.category];
                            const CatIcon = cat?.icon || FileText;
                            const conf = CONFIDENTIALITY_COLORS[archive.confidentiality];
                            return (
                                <div className="p-4 space-y-4">
                                    <div className="flex flex-col items-center py-6">
                                        <div className={`h-14 w-14 rounded-xl ${cat?.bg || "bg-zinc-500/15"} flex items-center justify-center mb-3`}>
                                            <CatIcon className={`h-7 w-7 ${cat?.text || "text-zinc-400"}`} />
                                        </div>
                                        <p className="text-sm font-semibold text-center">{archive.title}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{archive.fileName} · {archive.size}</p>
                                    </div>
                                    <div className="space-y-2 px-2">
                                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                            <span className="text-muted-foreground">Catégorie</span>
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${cat?.bg} ${cat?.text}`}>{cat?.label}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                            <span className="text-muted-foreground">Confidentialité</span>
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${conf?.bg} ${conf?.text}`}>{archive.confidentiality}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                            <span className="text-muted-foreground">Rétention</span>
                                            <span>{archive.retentionYears} ans</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                            <span className="text-muted-foreground">Archivé par</span>
                                            <span>{archive.uploadedBy}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Expire le</span>
                                            <span>{archive.expiresAt}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}
