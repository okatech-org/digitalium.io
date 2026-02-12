"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Upload Page
// Drag & drop + SHA-256 client-side + progress bar
// ═══════════════════════════════════════════════

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Upload,
    FileText,
    FileImage,
    FileSpreadsheet,
    X,
    Hash,
    CheckCircle2,
    Loader2,
    Archive,
    Landmark,
    Users2,
    Scale,
    Building2,
    Lock,
    Clock,
    Shield,
    AlertCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface UploadFile {
    file: File;
    id: string;
    progress: number;
    hash: string | null;
    status: "pending" | "hashing" | "uploading" | "complete" | "error";
    error?: string;
}

type ArchiveCategory = "fiscal" | "social" | "legal" | "client" | "vault";

// ─── Category config ────────────────────────────

const CATEGORIES: {
    key: ArchiveCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    color: string;
    bg: string;
    border: string;
    retention: string;
}[] = [
        { key: "fiscal", label: "Fiscal", icon: Landmark, gradient: "from-amber-600 to-orange-500", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", retention: "10 ans" },
        { key: "social", label: "Social", icon: Users2, gradient: "from-blue-600 to-cyan-500", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", retention: "5 ans" },
        { key: "legal", label: "Juridique", icon: Scale, gradient: "from-emerald-600 to-teal-500", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", retention: "10 ans" },
        { key: "client", label: "Client", icon: Building2, gradient: "from-violet-600 to-purple-500", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", retention: "5 ans" },
        { key: "vault", label: "Coffre-fort", icon: Lock, gradient: "from-rose-600 to-pink-500", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", retention: "Illimité" },
    ];

const ACCEPTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo

// ─── Helpers ────────────────────────────────────

function getFileIcon(type: string) {
    if (type.includes("image")) return FileImage;
    if (type.includes("spreadsheet")) return FileSpreadsheet;
    return FileText;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

async function computeSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Component ──────────────────────────────────

export default function ArchiveUploadPage() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [certId, setCertId] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedCat = CATEGORIES.find((c) => c.key === selectedCategory);

    // ── File handling ──

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const validFiles = Array.from(newFiles).filter((f) => {
            if (!ACCEPTED_TYPES.includes(f.type)) return false;
            if (f.size > MAX_FILE_SIZE) return false;
            return true;
        });

        const uploadFiles: UploadFile[] = validFiles.map((f) => ({
            file: f,
            id: `${f.name}-${Date.now()}-${Math.random()}`,
            progress: 0,
            hash: null,
            status: "pending",
        }));

        setFiles((prev) => [...prev, ...uploadFiles]);
    }, []);

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    // ── Drag handlers ──

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        },
        [addFiles]
    );

    // ── Processing ──

    const processArchive = async () => {
        if (!selectedCategory || files.length === 0 || !title) return;
        setIsProcessing(true);

        // Simulate hashing all files
        for (let i = 0; i < files.length; i++) {
            setFiles((prev) =>
                prev.map((f, idx) =>
                    idx === i ? { ...f, status: "hashing" } : f
                )
            );

            // Compute real SHA-256
            try {
                const hash = await computeSHA256(files[i].file);
                setFiles((prev) =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, hash, status: "uploading", progress: 0 } : f
                    )
                );
            } catch {
                setFiles((prev) =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: "error", error: "Erreur de calcul SHA-256" } : f
                    )
                );
                continue;
            }

            // Simulate upload progress
            for (let p = 0; p <= 100; p += 10) {
                await new Promise((r) => setTimeout(r, 80));
                setFiles((prev) =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, progress: Math.min(p, 100) } : f
                    )
                );
            }

            setFiles((prev) =>
                prev.map((f, idx) =>
                    idx === i ? { ...f, status: "complete", progress: 100 } : f
                )
            );
        }

        // Generate certificate
        const id = `CERT-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
        setCertId(id);
        setIsComplete(true);
        setIsProcessing(false);
    };

    // ── Complete screen ──

    if (isComplete) {
        return (
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6"
                    >
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    </motion.div>

                    <h1 className="text-2xl font-bold mb-2">Archivage Terminé</h1>
                    <p className="text-sm text-zinc-400 max-w-md mb-4">
                        {files.length} fichier{files.length > 1 ? "s" : ""} archivé{files.length > 1 ? "s" : ""} avec succès dans la
                        catégorie <span className={selectedCat?.color}>{selectedCat?.label}</span>.
                    </p>

                    <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-400 mb-4">
                        {certId}
                    </Badge>

                    {/* Show hashes */}
                    <div className="w-full max-w-lg space-y-2 mb-6">
                        {files.filter((f) => f.hash).map((f) => (
                            <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                <Hash className="h-3 w-3 text-emerald-400 shrink-0" />
                                <span className="text-[10px] truncate text-zinc-400">{f.file.name}</span>
                                <span className="text-[9px] font-mono text-emerald-400 ml-auto truncate max-w-[200px]">
                                    {f.hash}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Link href="/pro/iarchive">
                            <Button variant="outline" className="border-white/10">
                                <Archive className="h-4 w-4 mr-2" />
                                Voir les archives
                            </Button>
                        </Link>
                        <Button
                            onClick={() => {
                                setFiles([]);
                                setTitle("");
                                setDescription("");
                                setTags("");
                                setSelectedCategory(null);
                                setIsComplete(false);
                                setCertId("");
                            }}
                            className="bg-gradient-to-r from-violet-600 to-indigo-500"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Archiver un autre document
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <Link href="/pro/iarchive">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Archiver un document</h1>
                    <p className="text-xs text-muted-foreground">
                        Archivage manuel avec calcul SHA-256 et certificat d&apos;authenticité
                    </p>
                </div>
            </motion.div>

            {/* ═══ STEP 1: CATEGORY ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] flex items-center justify-center font-bold">1</span>
                    Catégorie d&apos;archivage
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => {
                        const CatIcon = cat.icon;
                        const selected = selectedCategory === cat.key;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`p-3 rounded-xl border transition-all text-left ${selected
                                    ? `${cat.border} ${cat.bg} ring-1 ${cat.border}`
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2`}>
                                    <CatIcon className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-xs font-medium">{cat.label}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-2.5 w-2.5 text-zinc-500" />
                                    <span className="text-[9px] text-zinc-500">{cat.retention}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* ═══ STEP 2: FILE DROP ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] flex items-center justify-center font-bold">2</span>
                    Fichier(s)
                </h2>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                        ? "border-violet-500 bg-violet-500/5"
                        : "border-white/10 hover:border-white/20 bg-white/[0.01]"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                        className="hidden"
                    />
                    <Upload className={`h-8 w-8 mx-auto mb-3 ${isDragging ? "text-violet-400" : "text-zinc-500"}`} />
                    <p className="text-sm font-medium mb-1">
                        {isDragging ? "Déposez les fichiers ici" : "Glissez-déposez ou cliquez"}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                        PDF, JPG, PNG, DOCX, XLSX · Max 50 Mo par fichier
                    </p>
                </div>

                {/* File list */}
                <AnimatePresence>
                    {files.map((uf) => {
                        const Icon = getFileIcon(uf.file.type);
                        return (
                            <motion.div
                                key={uf.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <Icon className="h-5 w-5 text-violet-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{uf.file.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-zinc-500">
                                                {formatFileSize(uf.file.size)}
                                            </span>
                                            {uf.status === "hashing" && (
                                                <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                    Calcul SHA-256…
                                                </span>
                                            )}
                                            {uf.status === "uploading" && (
                                                <span className="text-[10px] text-amber-400">
                                                    Upload {uf.progress}%
                                                </span>
                                            )}
                                            {uf.status === "complete" && (
                                                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    Archivé
                                                </span>
                                            )}
                                            {uf.status === "error" && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="h-2.5 w-2.5" />
                                                    {uf.error}
                                                </span>
                                            )}
                                        </div>
                                        {uf.hash && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Hash className="h-2.5 w-2.5 text-emerald-400" />
                                                <span className="text-[9px] font-mono text-emerald-400 truncate">
                                                    {uf.hash}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    {(uf.status === "uploading" || uf.status === "hashing") && (
                                        <div className="w-20">
                                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                <motion.div
                                                    animate={{ width: `${uf.status === "hashing" ? 50 : uf.progress}%` }}
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {uf.status === "complete" && (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                    )}

                                    {uf.status === "pending" && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(uf.id); }}
                                            className="h-6 w-6 rounded-md hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* ═══ STEP 3: METADATA ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] flex items-center justify-center font-bold">3</span>
                    Informations
                </h2>

                <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Titre *</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Bilan comptable 2025"
                            className="h-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description optionnelle du document…"
                            rows={3}
                            className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500/30 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Tags (séparés par des virgules)</label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Ex: comptabilité, 2025, bilan"
                            className="h-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                        />
                    </div>

                    {/* Auto retention display */}
                    {selectedCat && (
                        <div className={`flex items-center gap-2 p-2 rounded-lg ${selectedCat.bg} border ${selectedCat.border}`}>
                            <Shield className={`h-3.5 w-3.5 ${selectedCat.color}`} />
                            <span className="text-[11px]">
                                Rétention automatique : <strong className={selectedCat.color}>{selectedCat.retention}</strong>
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ═══ SUBMIT ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between pt-2"
            >
                <p className="text-[10px] text-zinc-500">
                    {files.length} fichier{files.length !== 1 ? "s" : ""} sélectionné{files.length !== 1 ? "s" : ""}
                    {selectedCat && <> · Catégorie: <span className={selectedCat.color}>{selectedCat.label}</span></>}
                </p>
                <Button
                    onClick={processArchive}
                    disabled={!selectedCategory || files.length === 0 || !title || isProcessing}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 disabled:opacity-40"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Traitement…
                        </>
                    ) : (
                        <>
                            <Archive className="h-4 w-4 mr-2" />
                            Archiver · SHA-256
                        </>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
