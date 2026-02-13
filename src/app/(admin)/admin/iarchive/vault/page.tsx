// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Coffre-Fort
// Documents ultra-sécurisés avec sous-dossiers
// UX macOS Finder — 3 modes d'affichage + DnD
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Lock,
    Shield,
    Key,
    Eye,
    Download,
    FolderOpen,
    Upload,
    FileText,
    ArrowLeft,
    MoreVertical,
    FolderPlus,
    Pencil,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

/* ─── Mock data ──────────────────────────── */

interface VaultFolder {
    id: string;
    name: string;
    fileCount: number;
    description: string;
}

interface VaultFile {
    name: string;
    type: string;
    encryption: string;
    addedBy: string;
    date: string;
    confidentiality: string;
}

const VAULT_FOLDERS: VaultFolder[] = [
    { id: "vf1", name: "Clés & Credentials", fileCount: 4, description: "Clés API, certificats SSL et tokens" },
    { id: "vf2", name: "Documents Scellés", fileCount: 3, description: "Documents avec sceau juridique" },
    { id: "vf3", name: "Contrats Originaux", fileCount: 6, description: "Originaux de contrats et actes notariés" },
    { id: "vf4", name: "Archives Sensibles", fileCount: 2, description: "Documents classifiés secret" },
];

const VAULT_ROOT_FILES: VaultFile[] = [
    { name: "Master Key — Base de données", type: "Credentials", encryption: "AES-256", addedBy: "System Admin", date: "1 jan 2026", confidentiality: "secret" },
    { name: "PV CA — Confidentiel", type: "Document scellé", encryption: "AES-256", addedBy: "Patrick Obiang", date: "15 déc 2025", confidentiality: "secret" },
];

const VAULT_FOLDER_FILES: Record<string, VaultFile[]> = {
    vf1: [
        { name: "Clé API Firebase — Production", type: "Credentials", encryption: "AES-256", addedBy: "System Admin", date: "15 jan 2026", confidentiality: "secret" },
        { name: "Certificat SSL — digitalium.io", type: "Certificat", encryption: "RSA-4096", addedBy: "System Admin", date: "10 jan 2026", confidentiality: "secret" },
        { name: "Token Supabase — Production", type: "Credentials", encryption: "AES-256", addedBy: "System Admin", date: "5 jan 2026", confidentiality: "secret" },
        { name: "Clé SSH — Serveur principal", type: "Credentials", encryption: "Ed25519", addedBy: "System Admin", date: "1 jan 2026", confidentiality: "secret" },
    ],
    vf2: [
        { name: "Contrat original — Scellé", type: "Document scellé", encryption: "AES-256", addedBy: "Marie Nzé", date: "15 déc 2025", confidentiality: "confidential" },
        { name: "PV AG — Copie certifiée conforme", type: "Document scellé", encryption: "AES-256", addedBy: "Patrick Obiang", date: "10 déc 2025", confidentiality: "confidential" },
        { name: "Acte notarié — Siège social", type: "Document scellé", encryption: "AES-256", addedBy: "Marie Nzé", date: "1 déc 2025", confidentiality: "secret" },
    ],
    vf3: [
        { name: "Contrat BGFI — Original", type: "Contrat", encryption: "AES-256", addedBy: "Jean Moussavou", date: "20 nov 2025", confidentiality: "confidential" },
        { name: "Contrat SEEG — Original", type: "Contrat", encryption: "AES-256", addedBy: "Jean Moussavou", date: "15 nov 2025", confidentiality: "confidential" },
        { name: "Bail commercial — Original", type: "Contrat", encryption: "AES-256", addedBy: "Marie Nzé", date: "1 nov 2025", confidentiality: "confidential" },
    ],
};

/* ─── Confidentiality colors ─────────────── */

const CONF_COLORS: Record<string, { bg: string; text: string }> = {
    confidential: { bg: "bg-amber-500/15", text: "text-amber-400" },
    secret: { bg: "bg-red-500/15", text: "text-red-400" },
};

/* ─── Data converters ────────────────────── */

function toFileManagerFolder(f: VaultFolder): FileManagerFolder {
    return {
        id: f.id,
        name: f.name,
        description: f.description,
        parentFolderId: null,
        tags: [],
        fileCount: f.fileCount,
        updatedAt: "",
        createdBy: "Coffre-Fort",
    };
}

function toFileManagerFile(v: VaultFile, folderId: string, index: number): FileManagerFile {
    return {
        id: `${folderId}-file-${index}`,
        name: v.name,
        type: v.type,
        size: v.encryption,
        date: v.date,
        folderId,
        metadata: {
            confidentiality: v.confidentiality,
            addedBy: v.addedBy,
            encryption: v.encryption,
        },
    };
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function VaultPage() {
    const [openFolder, setOpenFolder] = useState<string | null>(null);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const selectedFolder = VAULT_FOLDERS.find((f) => f.id === openFolder);
    const folderFiles = openFolder ? (VAULT_FOLDER_FILES[openFolder] || []) : [];

    /* ─── Converted data ─── */
    const fmFolders = VAULT_FOLDERS.map(toFileManagerFolder);
    const fmRootFiles = VAULT_ROOT_FILES.map((v, i) => toFileManagerFile(v, "root", i));

    /* ─── Handlers ─── */
    const handleMoveItem = (event: DragMoveEvent) => {
        const targetFolder = VAULT_FOLDERS.find(f => f.id === event.targetFolderId);
        toast.success(`Déplacé vers "${targetFolder?.name || event.targetFolderId}"`, {
            description: `${event.itemType === "folder" ? "Dossier" : "Fichier"} déplacé avec succès`,
        });
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDir("asc");
        }
    };

    /* ─── List columns ─── */
    const listColumns: ListColumn[] = [
        { key: "name", label: "Nom", sortable: true, width: "40%" },
        {
            key: "type",
            label: "Type",
            sortable: true,
            width: "15%",
            render: (item) => {
                if ("fileCount" in item) return <span className="text-muted-foreground">{(item as FileManagerFolder).fileCount} fichiers</span>;
                return <span className="text-muted-foreground">{item.type}</span>;
            },
        },
        {
            key: "encryption",
            label: "Chiffrement",
            width: "15%",
            render: (item) => {
                if ("fileCount" in item) return <span className="text-muted-foreground">—</span>;
                const encryption = (item as FileManagerFile).metadata?.encryption as string || "AES-256";
                return (
                    <Badge variant="secondary" className="text-[9px] border-0 bg-amber-500/10 text-amber-400">
                        {encryption}
                    </Badge>
                );
            },
        },
        {
            key: "confidentiality",
            label: "Confid.",
            width: "12%",
            render: (item) => {
                if ("fileCount" in item) return <span className="text-muted-foreground">—</span>;
                const conf = (item as FileManagerFile).metadata?.confidentiality as string || "confidential";
                const colors = CONF_COLORS[conf] || { bg: "bg-zinc-500/15", text: "text-zinc-400" };
                return (
                    <Badge variant="secondary" className={`text-[9px] border-0 ${colors.bg} ${colors.text}`}>
                        {conf}
                    </Badge>
                );
            },
        },
        {
            key: "date",
            label: "Date",
            sortable: true,
            width: "18%",
            render: (item) => {
                if ("fileCount" in item) return <span className="text-muted-foreground">—</span>;
                return <span className="text-muted-foreground">{(item as FileManagerFile).date}</span>;
            },
        },
    ];

    /* ─── Grid render callbacks ─── */
    const renderFolderCard = (folder: FileManagerFolder, isDragOver: boolean) => (
        <div
            className={`glass-card rounded-xl p-4 border transition-all group ${
                isDragOver
                    ? "border-amber-500/40 bg-amber-500/5 scale-[1.02]"
                    : "border-amber-500/10 hover:border-amber-500/25"
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{folder.name}</p>
                        <p className="text-[10px] text-muted-foreground">{folder.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 text-muted-foreground">
                        <FileText className="h-2.5 w-2.5 mr-1" />
                        {folder.fileCount}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs gap-2"><Pencil className="h-3 w-3" /> Renommer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs gap-2 text-red-400"><Trash2 className="h-3 w-3" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );

    const renderFileCard = (file: FileManagerFile) => {
        const conf = file.metadata?.confidentiality as string || "confidential";
        const colors = CONF_COLORS[conf] || { bg: "bg-zinc-500/15", text: "text-zinc-400" };
        return (
            <div className="glass-card rounded-xl p-4 border border-amber-500/10 hover:border-amber-500/20 transition-all group">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Key className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.type} · {file.size}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[9px] border-0 shrink-0 ${colors.bg} ${colors.text}`}>
                        {conf}
                    </Badge>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Eye className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Download className="h-3 w-3" /></Button>
                    </div>
                </div>
            </div>
        );
    };

    /* ─── Column view helpers ─── */
    const getFolderContents = (folderId: string) => {
        const files = (VAULT_FOLDER_FILES[folderId] || []).map((v, i) => toFileManagerFile(v, folderId, i));
        return { folders: [] as FileManagerFolder[], files };
    };

    const renderFilePreview = (file: FileManagerFile) => {
        const conf = file.metadata?.confidentiality as string || "confidential";
        const colors = CONF_COLORS[conf] || { bg: "bg-zinc-500/15", text: "text-zinc-400" };
        const encryption = file.metadata?.encryption as string || "AES-256";
        const addedBy = file.metadata?.addedBy as string || "—";
        return (
            <div className="p-4 space-y-4">
                <div className="flex flex-col items-center py-8">
                    <div className="h-16 w-16 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                        <Key className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className="text-sm font-semibold text-center">{file.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={`text-[9px] border-0 ${colors.bg} ${colors.text}`}>
                            {conf}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] border-0 bg-amber-500/10 text-amber-400">
                            {encryption}
                        </Badge>
                    </div>
                </div>
                <div className="space-y-2 px-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Type</span>
                        <span>{file.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Chiffrement</span>
                        <span className="text-amber-400">{encryption}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Ajouté par</span>
                        <span>{addedBy}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Date</span>
                        <span>{file.date}</span>
                    </div>
                </div>
                <div className="flex gap-2 px-4 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5 border-white/10">
                        <Eye className="h-3 w-3" /> Voir
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5 border-white/10">
                        <Download className="h-3 w-3" /> Télécharger
                    </Button>
                </div>
            </div>
        );
    };

    /* ── Sub-folder view ── */
    if (openFolder && selectedFolder) {
        return (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenFolder(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Lock className="h-5 w-5 text-amber-400" />
                            Coffre-Fort / {selectedFolder.name}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedFolder.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] border-0 bg-amber-500/10 text-amber-400 gap-1">
                        <Shield className="h-2.5 w-2.5" />
                        Chiffrement AES-256
                    </Badge>
                </motion.div>

                {/* Upload zone */}
                <motion.div variants={fadeUp}>
                    <div
                        className={`flex flex-col items-center justify-center py-5 rounded-xl border-2 border-dashed ${dragOver ? "border-amber-400/50 bg-amber-500/5" : "border-white/10"} transition-colors`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
                    >
                        <Upload className={`h-6 w-6 mb-2 ${dragOver ? "text-amber-400" : "text-muted-foreground/40"}`} />
                        <p className="text-xs text-muted-foreground">
                            Déposer des fichiers dans ce dossier sécurisé
                        </p>
                    </div>
                </motion.div>

                {/* Files in this folder */}
                <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-amber-500/10">
                    <div className="space-y-1">
                        {folderFiles.map((v, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.02] group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Key className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium">{v.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{v.type} · {v.encryption} · {v.addedBy} · {v.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${CONF_COLORS[v.confidentiality]?.bg || "bg-zinc-500/15"} ${CONF_COLORS[v.confidentiality]?.text || "text-zinc-400"}`}>
                                        {v.confidentiality}
                                    </Badge>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Eye className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Download className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {folderFiles.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                Ce dossier est vide
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    /* ── Main vault view ── */
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Lock className="h-6 w-6 text-amber-400" />
                        Coffre-Fort
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Documents chiffrés &amp; secrets · Accès restreint</p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewModeToggle
                        value={viewMode}
                        onChange={setViewMode}
                        storageKey="digitalium-vault-view-mode"
                    />
                    <Button
                        onClick={() => setCreateFolderOpen(true)}
                        className="bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:opacity-90 text-xs gap-2"
                    >
                        <FolderPlus className="h-3.5 w-3.5" />
                        Nouveau sous-dossier
                    </Button>
                </div>
            </motion.div>

            {/* Security notice */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <Shield className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                    <p className="text-xs font-medium text-amber-400">Espace sécurisé</p>
                    <p className="text-[10px] text-muted-foreground">Tous les documents sont chiffrés AES-256. L&apos;accès est journalisé et audité.</p>
                </div>
            </motion.div>

            {/* ═══ VIEW MODES ═══ */}
            <motion.div variants={fadeUp}>
                {viewMode === "grid" && (
                    <>
                        {/* Sub-folders grid */}
                        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3 px-1">Sous-dossiers</p>
                        <FinderGridView
                            folders={fmFolders}
                            files={fmRootFiles}
                            onOpenFolder={(id) => setOpenFolder(id)}
                            onMoveItem={handleMoveItem}
                            renderFolderCard={renderFolderCard}
                            renderFileCard={renderFileCard}
                            columns={2}
                        />
                    </>
                )}

                {viewMode === "list" && (
                    <FinderListView
                        folders={fmFolders}
                        files={fmRootFiles}
                        columns={listColumns}
                        onOpenFolder={(id) => setOpenFolder(id)}
                        onMoveItem={handleMoveItem}
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                        renderFolderIcon={() => (
                            <FolderOpen className="h-4 w-4 text-amber-400" />
                        )}
                        renderFileIcon={() => (
                            <Key className="h-4 w-4 text-amber-400" />
                        )}
                    />
                )}

                {viewMode === "column" && (
                    <FinderColumnView
                        rootFolders={fmFolders}
                        rootFiles={fmRootFiles}
                        getFolderContents={getFolderContents}
                        onMoveItem={handleMoveItem}
                        renderFilePreview={renderFilePreview}
                        renderFolderIcon={() => (
                            <FolderOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        )}
                        renderFileIcon={() => (
                            <Key className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        )}
                        accentColor="amber"
                    />
                )}
            </motion.div>

            {/* Create folder modal */}
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
                <DialogContent className="sm:max-w-[420px] glass-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-amber-400" />
                            Nouveau sous-dossier
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Ce dossier héritera des propriétés de sécurité du Coffre-Fort
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block">Nom du dossier</label>
                            <Input
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="ex: Contrats Originaux"
                                className="h-9 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5">
                            <Shield className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-[10px] text-muted-foreground">Chiffrement AES-256 · Accès journalisé · Audit automatique</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCreateFolderOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-amber-600 to-orange-500 text-white"
                            disabled={!newFolderName.trim()}
                            onClick={() => { setCreateFolderOpen(false); setNewFolderName(""); }}
                        >
                            <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
                            Créer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
