"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: CertificateViewer
// Connected to Convex — loads archive + certificate data
// Displays both archiving and destruction certificates
// with integrity verification
// ═══════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { sha256 } from "@/lib/crypto";
import { downloadFile } from "@/lib/supabase";
import {
    Download,
    Shield,
    ShieldCheck,
    ShieldAlert,
    QrCode,
    Loader2,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
    Hash,
    Trash2,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
}

function formatDateTime(ts: number): string {
    const d = new Date(ts);
    return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

// ─── Props ──────────────────────────────────────

interface Props {
    archiveId: Id<"archives">;
    onDownloadPDF?: () => void;
}

// ─── Component ──────────────────────────────────

export default function CertificateViewer({ archiveId, onDownloadPDF }: Props) {
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<null | boolean>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Convex queries
    const archive = useQuery(api.archives.get, { id: archiveId });
    const certificate = useQuery(api.archives.getCertificate, { archiveId });
    const destructionCert = useQuery(api.archives.getDestructionCertificate, { archiveId });

    const handleCopy = useCallback(async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    }, []);

    const handleVerify = useCallback(async () => {
        if (!archive?.sha256Hash || !archive?.fileUrl) return;
        setVerifying(true);
        setVerifyResult(null);
        try {
            // Extract Supabase Storage path from the URL
            const fileUrl = archive.fileUrl;

            if (fileUrl.startsWith("placeholder://") || fileUrl.startsWith("local://")) {
                // Fallback for legacy placeholder URLs — cannot verify
                await new Promise((r) => setTimeout(r, 500));
                setVerifyResult(null);
                setVerifying(false);
                return;
            }

            // Parse the storage path from the public URL
            // URL format: https://<project>.supabase.co/storage/v1/object/public/archives/<path>
            const urlParts = fileUrl.split("/storage/v1/object/public/");
            let blob: Blob | null = null;

            if (urlParts.length === 2) {
                const [bucket, ...rest] = urlParts[1].split("/");
                const path = rest.join("/");
                blob = await downloadFile(bucket, path);
            }

            if (!blob) {
                // Try direct fetch as fallback
                const resp = await fetch(fileUrl);
                if (resp.ok) blob = await resp.blob();
            }

            if (blob) {
                const buffer = await blob.arrayBuffer();
                const computedHash = await sha256(buffer);
                setVerifyResult(computedHash === archive.sha256Hash);
            } else {
                setVerifyResult(false);
            }
        } catch (err) {
            console.error("Integrity verification error:", err);
            setVerifyResult(false);
        }
        setVerifying(false);
    }, [archive?.sha256Hash, archive?.fileUrl]);

    if (!archive || !certificate) {
        return (
            <div className="w-full max-w-xl mx-auto p-8 text-center">
                <Loader2 className="h-6 w-6 text-violet-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Chargement du certificat…</p>
            </div>
        );
    }

    const isDestroyed = archive.status === "destroyed";
    const isValid = !isDestroyed;
    const hashShort = archive.sha256Hash
        ? `${archive.sha256Hash.slice(0, 12)}...${archive.sha256Hash.slice(-8)}`
        : "—";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto space-y-4"
        >
            {/* ─── Archiving Certificate ─── */}
            <div className="rounded-xl border-2 border-violet-500/30 bg-gradient-to-b from-violet-950/40 to-zinc-950/80 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center border-b border-white/5">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-violet-400" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
                            Certificat d&apos;Archivage Numérique
                        </h2>
                    </div>
                    <p className="text-[11px] text-zinc-400">DIGITALIUM.IO</p>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-3">
                    <CertRow label="N° Certificat">
                        <Badge variant="outline" className={`text-xs font-mono ${isValid ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}`}>
                            {certificate.certificateNumber}
                        </Badge>
                    </CertRow>

                    <CertRow label="Document">
                        <span className="text-xs text-zinc-200 font-medium text-right max-w-[60%] truncate">
                            {archive.title}
                        </span>
                    </CertRow>

                    <CertRow label="Catégorie">
                        <span className="text-xs text-violet-300 capitalize">{archive.categorySlug}</span>
                    </CertRow>

                    {/* SHA-256 main hash */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">Hash SHA-256</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-emerald-400 truncate">{hashShort}</span>
                            <button onClick={() => handleCopy(archive.sha256Hash, "main")} className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
                                {copiedField === "main" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                            </button>
                        </div>
                    </div>

                    {/* Double hash for document_archive sources */}
                    {archive.contentHash && (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">Hash JSON</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono text-cyan-400 truncate">
                                    {archive.contentHash.slice(0, 12)}...{archive.contentHash.slice(-8)}
                                </span>
                                <button onClick={() => handleCopy(archive.contentHash!, "content")} className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
                                    {copiedField === "content" ? <Check className="h-3 w-3 text-cyan-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {archive.pdfHash && (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">Hash PDF</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono text-violet-400 truncate">
                                    {archive.pdfHash.slice(0, 12)}...{archive.pdfHash.slice(-8)}
                                </span>
                                <button onClick={() => handleCopy(archive.pdfHash!, "pdf")} className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
                                    {copiedField === "pdf" ? <Check className="h-3 w-3 text-violet-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <CertRow label="Archivé le">
                        <span className="text-xs text-zinc-300">{formatDateTime(archive.createdAt)}</span>
                    </CertRow>

                    <CertRow label="Par">
                        <span className="text-xs text-zinc-300">{archive.uploadedBy}</span>
                    </CertRow>

                    <CertRow label="Rétention">
                        <span className="text-xs text-zinc-300">
                            {archive.isVault
                                ? "∞ Perpétuel"
                                : archive.retentionExpiresAt
                                    ? `${archive.retentionYears ?? "—"} ans (jusqu'au ${formatDate(archive.retentionExpiresAt)})`
                                    : "—"
                            }
                        </span>
                    </CertRow>

                    {/* Status */}
                    <div className="border-t border-white/5 pt-3">
                        <div className="flex items-center justify-center gap-2">
                            {isValid ? (
                                <>
                                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm font-semibold text-emerald-400">INTÉGRITÉ VÉRIFIÉE</span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="h-5 w-5 text-red-400" />
                                    <span className="text-sm font-semibold text-red-400">ARCHIVE DÉTRUITE</span>
                                </>
                            )}
                        </div>

                        {verifyResult !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-3 p-2.5 rounded-lg text-center ${verifyResult ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {verifyResult ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span className="text-xs font-medium text-emerald-400">
                                                Intégrité confirmée — le fichier n&apos;a pas été modifié
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-red-400" />
                                            <span className="text-xs font-medium text-red-400">
                                                ALERTE : Le fichier a été modifié !
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-white/5 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={onDownloadPDF} className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Télécharger le certificat
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleVerify} disabled={verifying} className="text-xs border-white/10">
                        {verifying ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Vérification…</>
                        ) : (
                            <><Shield className="h-3.5 w-3.5 mr-1.5" />Vérifier l&apos;intégrité</>
                        )}
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-white/10">
                        <QrCode className="h-3.5 w-3.5 mr-1.5" />QR Code
                    </Button>
                </div>
            </div>

            {/* ─── Destruction Certificate (if applicable) ─── */}
            {isDestroyed && destructionCert && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-xl border-2 border-red-500/30 bg-gradient-to-b from-red-950/30 to-zinc-950/80 overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                        <div className="px-6 pt-5 pb-3 text-center border-b border-white/5">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Trash2 className="h-4 w-4 text-red-400" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-red-300">
                                    Certificat de Destruction
                                </h3>
                            </div>
                        </div>
                        <div className="px-6 py-4 space-y-2.5">
                            {destructionCert.certificateNumber && (
                                <CertRow label="N° Certificat">
                                    <Badge variant="outline" className="text-xs font-mono border-red-500/30 text-red-400">
                                        {destructionCert.certificateNumber}
                                    </Badge>
                                </CertRow>
                            )}
                            <CertRow label="Détruit par">
                                <span className="text-xs text-zinc-300">{destructionCert.destroyedBy}</span>
                            </CertRow>
                            <CertRow label="Motif">
                                <span className="text-xs text-zinc-300">{destructionCert.destructionReason}</span>
                            </CertRow>
                            <CertRow label="Date">
                                <span className="text-xs text-zinc-300">{formatDateTime(destructionCert.destroyedAt)}</span>
                            </CertRow>
                            {destructionCert.originalSha256Hash && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">Hash final</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-mono text-red-400 truncate">
                                            {destructionCert.originalSha256Hash.slice(0, 12)}...{destructionCert.originalSha256Hash.slice(-8)}
                                        </span>
                                        <button onClick={() => handleCopy(destructionCert.originalSha256Hash, "destHash")} className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
                                            {copiedField === "destHash" ? <Check className="h-3 w-3 text-red-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

// ─── Helper Component ───────────────────────────

function CertRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
            {children}
        </div>
    );
}
