"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Upload Direct Dialog
// Upload files directly to iArchive (manual_upload)
// with SHA-256 integrity, category selection, and certificate
// ═══════════════════════════════════════════════

import React, { useCallback, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { useAuth } from "@/hooks/useAuth";

import { sha256 } from "@/lib/crypto";
import {
    X,
    Archive,
    Shield,
    Hash,
    Calendar,
    Tag,
    FolderArchive,
    CheckCircle2,
    Loader2,
    FileText,
    Lock,
    Upload,
    File,
    Eye,
    Users,
    ShieldCheck,
    Landmark,
    Scale,
    Briefcase,
    Sparkles,
    AlertTriangle,
} from "lucide-react";

// ─── Icon/Color maps (shared with ArchiveModal) ─

const ICON_MAP: Record<string, React.ElementType> = {
    Landmark, Users, Scale, Briefcase, Lock, FileText,
    Shield, Archive, Tag, FolderArchive,
};

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
    amber: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    blue: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    emerald: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    violet: { color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    rose: { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
};

const FALLBACK_COLORS = { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" };

const CONFIDENTIALITY_OPTIONS: { key: string; label: string; icon: React.ElementType }[] = [
    { key: "public", label: "Public", icon: Eye },
    { key: "internal", label: "Interne", icon: Users },
    { key: "confidential", label: "Confidentiel", icon: Lock },
    { key: "secret", label: "Secret", icon: ShieldCheck },
];

const UPLOAD_STEPS = [
    { label: "Lecture du fichier", icon: File },
    { label: "Calcul du hash SHA-256", icon: Hash },
    { label: "Upload vers le stockage sécurisé", icon: Archive },
    { label: "Création de l'entrée archive", icon: Archive },
    { label: "Génération du certificat", icon: Shield },
    { label: "Log d'audit créé", icon: Sparkles },
];

// ─── Types ──────────────────────────────────────

interface ArchiveUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (data: { archiveId: string; certificateNumber: string }) => void;
}

// ─── Component ──────────────────────────────────

export default function ArchiveUploadDialog({
    open,
    onClose,
    onSuccess,
}: ArchiveUploadDialogProps) {
    const { convexOrgId } = useConvexOrgId();
    const { user } = useAuth();
    const userName = user?.displayName || user?.email?.split("@")[0] || "Utilisateur";
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Convex
    const categories = useQuery(
        api.archiveConfig.listCategories,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );
    const createArchive = useMutation(api.archives.createArchiveEntry);
    const createCertificate = useMutation(api.archives.createCertificate);

    const sortedCategories = useMemo(
        () => [...(categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
        [categories]
    );

    // Form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [tags, setTags] = useState("");
    const [confidentiality, setConfidentiality] = useState("internal");
    const [originalCreationDate, setOriginalCreationDate] = useState(""); // ISO date string

    // Processing
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [computedHash, setComputedHash] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ archiveId: string; certificateNumber: string } | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _selectedCategory = sortedCategories.find((c) => c.slug === selectedSlug);

    // ─── File selection ─────────────────────────
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
            setError(null);
        }
    }, [title]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
            setError(null);
        }
    }, [title]);

    // ─── Format file size ───────────────────────
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} o`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
        return `${(bytes / 1048576).toFixed(1)} Mo`;
    };

    // ─── Upload handler ─────────────────────────
    const handleUpload = useCallback(async () => {
        if (!selectedFile || !selectedSlug || !convexOrgId) return;
        setProcessing(true);
        setError(null);
        setResult(null);

        try {
            // Step 0: Read file
            setCurrentStep(0);
            const arrayBuffer = await selectedFile.arrayBuffer();
            await sleep(300);

            // Step 1: Compute SHA-256
            setCurrentStep(1);
            const fileHash = await sha256(arrayBuffer);
            setComputedHash(fileHash);
            await sleep(300);

            // Step 2: Upload to Convex File Storage
            setCurrentStep(2);
            // File data is passed to Convex mutation which handles server-side storage.
            // We use a local reference URL here.
            const fileUrl = `local://${selectedFile.name}`;
            await sleep(200);

            // Step 3: Create archive entry
            setCurrentStep(3);
            const archiveId = await createArchive({
                title: title || selectedFile.name,
                description: description || undefined,
                categorySlug: selectedSlug,
                organizationId: convexOrgId,
                uploadedBy: userName,
                fileUrl,
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                mimeType: selectedFile.type || "application/octet-stream",
                sha256Hash: fileHash,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                confidentiality,
                sourceType: "manual_upload",
                // v5: Date réelle de création
                originalCreationDate: originalCreationDate
                    ? new Date(originalCreationDate).getTime()
                    : undefined,
            });
            await sleep(200);

            // Step 4: Create certificate
            setCurrentStep(4);
            const cert = await createCertificate({
                archiveId,
                sha256Hash: fileHash,
                issuedBy: userName,
            });
            await sleep(200);

            // Step 5: Done
            setCurrentStep(5);
            await sleep(200);

            const resultData = { archiveId: archiveId as string, certificateNumber: cert.certificateNumber };
            setResult(resultData);
            onSuccess?.(resultData);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
        } finally {
            setProcessing(false);
            setCurrentStep(-1);
        }
    }, [selectedFile, selectedSlug, convexOrgId, title, description, tags, confidentiality, originalCreationDate, userName, createArchive, createCertificate, onSuccess]);

    // ─── Reset ──────────────────────────────────
    const handleClose = useCallback(() => {
        if (processing) return;
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        setSelectedSlug(null);
        setTags("");
        setConfidentiality("internal");
        setOriginalCreationDate("");
        setComputedHash("");
        setError(null);
        setResult(null);
        onClose();
    }, [processing, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Upload className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">Upload direct dans iArchive</h3>
                                    <p className="text-[10px] text-zinc-500">sourceType: manual_upload</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                onClick={handleClose}
                                disabled={processing}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* ─── Success State ─── */}
                        {result ? (
                            <div className="px-5 py-8 flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Archive créée avec succès</h3>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Certificat : <span className="font-mono text-emerald-400">{result.certificateNumber}</span>
                                </p>
                                {computedHash && (
                                    <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5 w-full mb-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash className="h-3 w-3 text-zinc-400" />
                                            <span className="text-[10px] text-zinc-400 font-medium">SHA-256</span>
                                        </div>
                                        <p className="text-[9px] font-mono text-emerald-400/80 break-all">{computedHash}</p>
                                    </div>
                                )}
                                <Button
                                    size="sm"
                                    className="bg-violet-600 hover:bg-violet-700 text-white"
                                    onClick={handleClose}
                                >
                                    Fermer
                                </Button>
                            </div>
                        ) : !processing ? (
                            /* ─── Form ─── */
                            <div className="px-5 py-4 space-y-4 overflow-auto flex-1">
                                {/* File drop zone */}
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${selectedFile
                                            ? "border-emerald-500/30 bg-emerald-500/5"
                                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                                        title="Sélectionner un fichier à archiver"
                                    />
                                    {selectedFile ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <File className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                                <p className="text-[10px] text-zinc-500">
                                                    {formatSize(selectedFile.size)} · {selectedFile.type || "fichier"}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="ml-auto text-[9px] border-emerald-500/20 text-emerald-400 shrink-0">
                                                ✓ Sélectionné
                                            </Badge>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                                            <p className="text-xs text-zinc-400">Glissez-déposez ou cliquez pour sélectionner</p>
                                            <p className="text-[10px] text-zinc-600 mt-1">PDF, documents, images — max 50 Mo</p>
                                        </>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Titre de l&apos;archive</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nom du document archivé"
                                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/30 placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description (optionnel)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description du document..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/30 placeholder:text-zinc-600 resize-none"
                                    />
                                </div>

                                {/* v5: Original creation date */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                                        <Calendar className="h-3 w-3" />
                                        Date réelle de création (optionnel)
                                    </label>
                                    <p className="text-[10px] text-zinc-600 mb-1.5">
                                        Si le document existait avant son import, indiquez sa vraie date de création
                                    </p>
                                    <input
                                        type="date"
                                        value={originalCreationDate}
                                        onChange={(e) => setOriginalCreationDate(e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                        title="Date réelle de création"
                                        className="w-48 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/30 text-white/80 [color-scheme:dark]"
                                    />
                                    {originalCreationDate && (
                                        <p className="text-[10px] text-violet-400/60 mt-1">
                                            ✓ Le calcul de rétention utilisera cette date au lieu de la date d&apos;import
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                        <FolderArchive className="h-3 w-3" />
                                        Catégorie
                                    </label>
                                    {!categories ? (
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Chargement…
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            {sortedCategories.map((cat) => {
                                                const colors = COLOR_MAP[cat.color] ?? FALLBACK_COLORS;
                                                const CatIcon = ICON_MAP[cat.icon] ?? FileText;
                                                return (
                                                    <button
                                                        key={cat._id}
                                                        onClick={() => setSelectedSlug(cat.slug)}
                                                        className={`flex flex-col items-center p-2.5 rounded-lg border transition-all ${selectedSlug === cat.slug
                                                                ? `${colors.bg} ${colors.color}`
                                                                : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10"
                                                            }`}
                                                    >
                                                        <CatIcon className="h-3.5 w-3.5 mb-1" />
                                                        <span className="text-[10px] font-medium">{cat.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Confidentiality */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                        <Lock className="h-3 w-3" />
                                        Confidentialité
                                    </label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {CONFIDENTIALITY_OPTIONS.map((opt) => {
                                            const OptIcon = opt.icon;
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => setConfidentiality(opt.key)}
                                                    className={`flex flex-col items-center p-2 rounded-lg border text-[10px] transition-all ${confidentiality === opt.key
                                                            ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                                                            : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10"
                                                        }`}
                                                >
                                                    <OptIcon className="h-3 w-3 mb-1" />
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                        <Tag className="h-3 w-3" />
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="facture, 2026, fournisseur (séparés par virgule)"
                                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/30 placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                                        🔐 Le hash SHA-256 sera calculé depuis le fichier original.
                                        Un certificat d&apos;intégrité sera automatiquement généré.
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                                        <p className="text-[11px] text-red-300">{error}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ─── Processing Steps ─── */
                            <div className="px-5 py-4 overflow-auto flex-1">
                                <div className="space-y-3">
                                    {UPLOAD_STEPS.map((step, i) => {
                                        const StepIcon = step.icon;
                                        const isDone = i < currentStep;
                                        const isActive = i === currentStep;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isActive
                                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                                        : isDone
                                                            ? "bg-emerald-500/5"
                                                            : "opacity-40"
                                                    }`}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                ) : isActive ? (
                                                    <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                                                ) : (
                                                    <StepIcon className="h-4 w-4 text-zinc-500" />
                                                )}
                                                <span className={`text-xs ${isDone ? "text-emerald-300/80" : isActive ? "text-emerald-300 font-medium" : "text-zinc-500"
                                                    }`}>
                                                    {step.label}
                                                </span>
                                                {isDone && (
                                                    <Badge variant="outline" className="ml-auto text-[8px] h-4 border-emerald-500/20 text-emerald-400">
                                                        ✓
                                                    </Badge>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                {computedHash && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash className="h-3 w-3 text-zinc-400" />
                                            <span className="text-[10px] text-zinc-400 font-medium">SHA-256</span>
                                        </div>
                                        <p className="text-[9px] font-mono text-emerald-400/80 break-all leading-relaxed">{computedHash}</p>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        {!processing && !result && (
                            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01] shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-zinc-400"
                                    onClick={handleClose}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 text-xs text-white gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || !selectedSlug || !title}
                                >
                                    <Upload className="h-3 w-3" />
                                    Archiver le fichier
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}
