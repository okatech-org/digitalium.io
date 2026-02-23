"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Smart Import Zone (IA-powered)
// Composant partagé d'import intelligent
// Supporte: Excel, CSV, PDF, DOCX, Image, MD, JSON
// ═══════════════════════════════════════════════

import React, { useState, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    FileSpreadsheet,
    FileText,
    Image,
    Loader2,
    X,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───

export interface SchemaField {
    key: string;
    label: string;
    required?: boolean;
    type?: "string" | "number" | "boolean";
}

interface SmartImportZoneProps {
    /** Schéma des champs attendus */
    schema: SchemaField[];
    /** Description du contexte pour l'IA */
    context: string;
    /** Callback après import confirmé */
    onImport: (rows: Record<string, any>[]) => Promise<void>;
    /** Formats acceptés (défaut: tous) */
    acceptedFormats?: string[];
    /** Texte du bouton d'import */
    importLabel?: string;
    /** Callback pour fermer le panneau */
    onClose?: () => void;
}

// ─── File format config ───

const FORMAT_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    ".xlsx": { icon: <FileSpreadsheet className="h-3 w-3" />, label: "Excel", color: "text-emerald-400" },
    ".xls": { icon: <FileSpreadsheet className="h-3 w-3" />, label: "Excel", color: "text-emerald-400" },
    ".csv": { icon: <FileSpreadsheet className="h-3 w-3" />, label: "CSV", color: "text-sky-400" },
    ".pdf": { icon: <FileText className="h-3 w-3" />, label: "PDF", color: "text-red-400" },
    ".docx": { icon: <FileText className="h-3 w-3" />, label: "Word", color: "text-blue-400" },
    ".doc": { icon: <FileText className="h-3 w-3" />, label: "Word", color: "text-blue-400" },
    ".png": { icon: <Image className="h-3 w-3" />, label: "Image", color: "text-amber-400" },
    ".jpg": { icon: <Image className="h-3 w-3" />, label: "Image", color: "text-amber-400" },
    ".jpeg": { icon: <Image className="h-3 w-3" />, label: "Image", color: "text-amber-400" },
    ".webp": { icon: <Image className="h-3 w-3" />, label: "Image", color: "text-amber-400" },
    ".md": { icon: <FileText className="h-3 w-3" />, label: "Markdown", color: "text-white/50" },
    ".json": { icon: <FileText className="h-3 w-3" />, label: "JSON", color: "text-yellow-400" },
    ".txt": { icon: <FileText className="h-3 w-3" />, label: "Texte", color: "text-white/40" },
};

const ALL_FORMATS = Object.keys(FORMAT_CONFIG);
const IMAGE_TYPES = [".png", ".jpg", ".jpeg", ".webp"];

// ─── Component ───

export default function SmartImportZone({
    schema,
    context,
    onImport,
    acceptedFormats = ALL_FORMATS,
    importLabel = "Importer",
    onClose,
}: SmartImportZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [preview, setPreview] = useState<Record<string, any>[]>([]);
    const [importing, setImporting] = useState(false);
    const [aiConfidence, setAiConfidence] = useState(0);

    const analyzeText = useAction(api.aiSmartImport.analyzeText);
    const analyzeImage = useAction(api.aiSmartImport.analyzeImage);

    // ─── Extract text from file (client-side) ───
    const extractText = useCallback(async (file: File): Promise<{ text?: string; imageBase64?: string; mimeType?: string }> => {
        const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");

        // Excel (.xlsx, .xls, .csv)
        if ([".xlsx", ".xls", ".csv"].includes(ext)) {
            const XLSX = (await import("xlsx")).default;
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const text = XLSX.utils.sheet_to_csv(firstSheet, { FS: ";" });
            return { text };
        }

        // DOCX
        if ([".docx", ".doc"].includes(ext)) {
            const mammoth = await import("mammoth");
            const buffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: buffer });
            return { text: result.value };
        }

        // PDF — extract readable text via basic parsing
        if (ext === ".pdf") {
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            // Simple text extraction from PDF streams
            let text = "";
            const decoder = new TextDecoder("utf-8", { fatal: false });
            const raw = decoder.decode(bytes);
            // Extract text between BT/ET markers (basic PDF text objects)
            const textMatches = raw.match(/\(([^)]+)\)/g);
            if (textMatches) {
                text = textMatches.map(m => m.slice(1, -1)).join(" ");
            }
            // If too little text, fall back to readable characters
            if (text.length < 50) {
                text = raw.replace(/[^\x20-\x7E\nàâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ@.+\-()]/g, " ")
                    .replace(/\s{3,}/g, "\n")
                    .trim();
            }
            if (text.length < 20) {
                // PDF might be image-based, try to treat as image via Gemini
                const sliced = bytes.slice(0, 5000000);
                const base64 = btoa(Array.from(new Uint8Array(sliced)).map(b => String.fromCharCode(b)).join(""));
                return { imageBase64: base64, mimeType: "application/pdf" };
            }
            return { text };
        }

        // Images
        if (IMAGE_TYPES.includes(ext)) {
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            const base64 = btoa(
                Array.from(bytes).map(byte => String.fromCharCode(byte)).join("")
            );
            return { imageBase64: base64, mimeType: file.type };
        }

        // MD, JSON, TXT — read as text
        const text = await file.text();
        return { text };
    }, []);

    // ─── Handle file upload ───
    const handleFile = useCallback(async (file: File) => {
        const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
        setFileName(file.name);
        setFileType(ext);
        setAnalyzing(true);
        setPreview([]);

        try {
            const extracted = await extractText(file);

            const schemaArg = schema.map((f) => ({
                key: f.key,
                label: f.label,
                required: f.required,
                type: f.type ?? "string",
            }));

            let result: any;

            if (extracted.imageBase64) {
                // Image/visual → Gemini Vision
                toast.info("🤖 Analyse IA de l'image en cours…");
                result = await analyzeImage({
                    imageBase64: extracted.imageBase64,
                    mimeType: extracted.mimeType ?? "image/png",
                    targetSchema: schemaArg,
                    context,
                });
            } else if (extracted.text) {
                // If it's a JSON file, try direct parse first
                if (ext === ".json") {
                    try {
                        const directParse = JSON.parse(extracted.text);
                        const rows = Array.isArray(directParse) ? directParse : [directParse];
                        setPreview(rows);
                        setAiConfidence(1);
                        setAnalyzing(false);
                        toast.success(`${rows.length} élément(s) détecté(s) depuis le JSON`);
                        return;
                    } catch {
                        // JSON invalid, pass to AI
                    }
                }

                // If CSV/Excel with clear structure, try simple parse first
                if ([".csv", ".xlsx", ".xls"].includes(ext) && extracted.text.includes(";")) {
                    const lines = extracted.text.split("\n").filter(l => l.trim());
                    if (lines.length > 1) {
                        const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
                        // Try to auto-map headers to schema
                        const mapped = tryAutoMap(headers, lines.slice(1), schema);
                        if (mapped.length > 0) {
                            setPreview(mapped);
                            setAiConfidence(0.95);
                            setAnalyzing(false);
                            toast.success(`${mapped.length} élément(s) détecté(s) automatiquement`);
                            return;
                        }
                    }
                }

                // Fall back to AI analysis
                toast.info("🤖 Analyse IA en cours…");
                result = await analyzeText({
                    textContent: extracted.text,
                    targetSchema: schemaArg,
                    context,
                });
            } else {
                toast.error("Impossible d'extraire le contenu du fichier");
                setAnalyzing(false);
                return;
            }

            if (result?.rows?.length > 0) {
                setPreview(result.rows);
                setAiConfidence(result.confidence ?? 0.8);
                toast.success(`🤖 ${result.rows.length} élément(s) détecté(s) par l'IA`);
            } else {
                toast.error(result?.error ?? "Aucune donnée détectée dans le fichier");
                setFileName("");
            }
        } catch (err: any) {
            console.error("Smart Import error:", err);
            toast.error(`Erreur d'analyse: ${err.message ?? "erreur inconnue"}`);
            setFileName("");
        } finally {
            setAnalyzing(false);
        }
    }, [extractText, schema, context, analyzeText, analyzeImage]);

    // ─── Confirm import ───
    const handleConfirmImport = useCallback(async () => {
        if (preview.length === 0) return;
        setImporting(true);
        try {
            await onImport(preview);
            toast.success(`${preview.length} élément(s) importé(s) avec succès !`);
            setPreview([]);
            setFileName("");
            onClose?.();
        } catch (err: any) {
            toast.error(`Erreur d'import: ${err.message ?? "erreur inconnue"}`);
        } finally {
            setImporting(false);
        }
    }, [preview, onImport, onClose]);

    // ─── Reset ───
    const handleReset = () => {
        setFileName("");
        setFileType("");
        setPreview([]);
        setAiConfidence(0);
    };

    // ─── Render ───
    const acceptStr = acceptedFormats.join(",");

    return (
        <div className="space-y-3">
            {/* ── Drop zone ── */}
            {!fileName && !analyzing && (
                <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-violet-400/50", "bg-violet-500/5"); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove("border-violet-400/50", "bg-violet-500/5"); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-violet-400/50", "bg-violet-500/5");
                        const file = e.dataTransfer.files[0];
                        if (file) handleFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptStr}
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                            e.target.value = "";
                        }}
                    />
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Upload className="h-6 w-6 text-violet-400/60" />
                        <Sparkles className="h-5 w-5 text-amber-400/60" />
                    </div>
                    <p className="text-xs text-white/50 mb-2">
                        Glissez-déposez un fichier ou cliquez pour sélectionner
                    </p>
                    <p className="text-[10px] text-white/30 mb-2">
                        L&apos;IA analyse et extrait automatiquement les données
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {acceptedFormats.filter((f) => FORMAT_CONFIG[f]).map((fmt) => {
                            const cfg = FORMAT_CONFIG[fmt];
                            return (
                                <span key={fmt} className={`flex items-center gap-1 text-[9px] ${cfg.color}`}>
                                    {cfg.icon} {fmt}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Analyzing animation ── */}
            {analyzing && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                        <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                    </div>
                    <p className="text-xs text-violet-300 mb-1">🤖 Analyse IA en cours…</p>
                    <p className="text-[10px] text-white/30">{fileName}</p>
                </div>
            )}

            {/* ── File badge ── */}
            {fileName && !analyzing && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    {FORMAT_CONFIG[fileType]?.icon ?? <FileText className="h-4 w-4 text-white/30" />}
                    <span className="text-xs text-violet-300 flex-1 truncate">{fileName}</span>
                    {aiConfidence > 0 && (
                        <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {Math.round(aiConfidence * 100)}% confiance
                        </Badge>
                    )}
                    <button
                        className="text-white/30 hover:text-white/60 transition-colors"
                        onClick={handleReset}
                        title="Supprimer"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* ── Preview table ── */}
            {preview.length > 0 && (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            Détecté par l&apos;IA
                        </span>
                        <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-300 border-0">
                            {preview.length} élément(s)
                        </Badge>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto overflow-x-auto">
                        <table className="w-full text-[10px]">
                            <thead>
                                <tr className="border-b border-white/5 text-white/30">
                                    <th className="text-left py-1.5 px-3 font-medium w-[30px]">#</th>
                                    {schema.map((f) => (
                                        <th key={f.key} className="text-left py-1.5 px-3 font-medium whitespace-nowrap">
                                            {f.label}
                                            {f.required && <span className="text-red-400 ml-0.5">*</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => {
                                    const hasError = schema.some((f) => f.required && !row[f.key]);
                                    return (
                                        <tr key={i} className={`border-b border-white/[0.03] hover:bg-white/[0.02] ${hasError ? "bg-red-500/5" : ""}`}>
                                            <td className="py-1 px-3 text-white/20">{i + 1}</td>
                                            {schema.map((f) => (
                                                <td key={f.key} className="py-1 px-3 text-white/60 max-w-[200px] truncate">
                                                    {row[f.key] ?? <span className="text-white/15">—</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {preview.some((row) => schema.some((f) => f.required && !row[f.key])) && (
                        <div className="px-3 py-1.5 border-t border-white/5 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                            <span className="text-[9px] text-amber-400">Certaines lignes ont des champs obligatoires manquants</span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Actions ── */}
            {preview.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-xs hover:from-violet-500 hover:to-indigo-400"
                        onClick={handleConfirmImport}
                        disabled={importing}
                    >
                        {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        {importLabel} {preview.length} élément(s)
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-white/40 hover:text-white/60"
                        onClick={handleReset}
                    >
                        Recommencer
                    </Button>
                    {onClose && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-white/40 hover:text-white/60"
                            onClick={() => { handleReset(); onClose(); }}
                        >
                            Annuler
                        </Button>
                    )}
                </div>
            )}

            {/* Close button when no preview */}
            {!preview.length && !analyzing && onClose && (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-white/40 hover:text-white/60"
                        onClick={onClose}
                    >
                        Annuler
                    </Button>
                </div>
            )}
        </div>
    );
}

// ─── Auto-mapping helper ───

function tryAutoMap(
    headers: string[],
    dataLines: string[],
    schema: SchemaField[]
): Record<string, any>[] {
    // Try to map CSV headers to schema fields
    const mapping: Record<number, string> = {};

    for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç0-9]/g, "");
        for (const f of schema) {
            const fKey = f.key.toLowerCase();
            const fLabel = f.label.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç0-9]/g, "");
            if (h === fKey || h === fLabel || h.includes(fKey) || fKey.includes(h)) {
                mapping[i] = f.key;
                break;
            }
        }
    }

    // Need at least one mapped column
    if (Object.keys(mapping).length === 0) return [];

    return dataLines
        .filter(line => line.trim())
        .map((line) => {
            const parts = line.split(";").map(p => p.trim());
            const row: Record<string, any> = {};
            for (const [idx, key] of Object.entries(mapping)) {
                const value = parts[Number(idx)];
                if (value) row[key] = value;
            }
            return row;
        })
        .filter((row) => Object.keys(row).length > 0);
}
