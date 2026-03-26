"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Certificates Page (Institutional)
// List, view, and verify archive certificates
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Search,
    Shield,
    ShieldCheck,
    ShieldAlert,
    FileText,
    Download,
    Eye,
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import CertificateViewer from "@/components/modules/iarchive/CertificateViewer";

// ─── Types and Helpers ──────────────────────────

interface CertificateRow {
    id: string;
    certificateNumber: string;
    documentTitle: string;
    sha256Hash: string;
    archivedAt: number;
    archivedBy: string;
    organization: string;
    retentionYears: number;
    retentionExpiresAt: number;
    status: string;
    category: string;
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    fiscal: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    social: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    legal: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    client: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    vault: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

// ─── Component ──────────────────────────────────

export default function CertificatesPage() {
    const { orgId } = useOrganization();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "revoked">("all");
    const [selectedCert, setSelectedCert] = useState<CertificateRow | null>(null);

    const certsQuery = useQuery(api.archives.listCertificates, 
        orgId ? { organizationId: orgId as any } : "skip"
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certificates: CertificateRow[] = certsQuery === undefined ? [] : certsQuery.map((data: any) => ({
        id: data.archive._id,
        certificateNumber: data.certificateNumber,
        documentTitle: data.archive.title || "Document sans titre",
        sha256Hash: data.hash,
        archivedAt: data.archive._creationTime,
        archivedBy: data.archivedBy,
        organization: data.organizationName,
        retentionYears: data.archive.retentionYears || 5,
        retentionExpiresAt: data.archive.retentionExpiresAt || (data.archive._creationTime + 5 * 365.25 * 24 * 3600 * 1000),
        status: data.archive.status === "archived" ? "valid" : "revoked",
        category: data.archive.categorySlug,
    }));

    const filtered = certificates.filter((cert) => {
        const matchSearch =
            cert.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
            cert.documentTitle.toLowerCase().includes(search.toLowerCase()) ||
            cert.archivedBy.toLowerCase().includes(search.toLowerCase()) ||
            cert.sha256Hash.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || cert.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (selectedCert) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Back header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/5"
                        onClick={() => setSelectedCert(null)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold">{selectedCert.certificateNumber}</h1>
                        <p className="text-xs text-muted-foreground">{selectedCert.documentTitle}</p>
                    </div>
                </motion.div>

                <CertificateViewer
                    archiveId={selectedCert.id as any}
                    onDownloadPDF={() => {
                        // Placeholder for PDF download
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Certificats d&apos;archivage</h1>
                        <p className="text-xs text-muted-foreground">
                            {certificates.length} certificats émis · Vérification d&apos;intégrité SHA-256
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ═══ SEARCH + FILTERS ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="space-y-3"
            >
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par numéro, document, émetteur ou hash…"
                            className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Statut</span>
                    {[
                        { key: "all" as const, label: "Tous" },
                        { key: "valid" as const, label: "Valides" },
                        { key: "revoked" as const, label: "Révoqués" },
                    ].map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setStatusFilter(s.key)}
                            className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${statusFilter === s.key
                                ? "bg-violet-500/10 text-violet-300 border border-violet-500/30"
                                : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ═══ TABLE ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/5 overflow-hidden"
            >
                {/* Header */}
                <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/5 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <div className="col-span-2">N° Certificat</div>
                    <div className="col-span-3">Document</div>
                    <div className="col-span-2">Hash SHA-256</div>
                    <div className="col-span-2">Émetteur</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1">Statut</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.03]">
                    {filtered.length === 0 && (
                        <div className="px-4 py-12 text-center text-xs text-zinc-500">
                            Aucun certificat trouvé.
                        </div>
                    )}

                    {filtered.map((cert, i) => {
                        const catColor = CATEGORY_COLORS[cert.category] ?? CATEGORY_COLORS.fiscal;
                        const isValid = cert.status === "valid";

                        return (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 hover:bg-white/[0.015] transition-colors cursor-pointer items-center"
                                onClick={() => setSelectedCert(cert)}
                            >
                                {/* Cert number */}
                                <div className="sm:col-span-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-[9px] font-mono ${isValid
                                            ? "border-emerald-500/20 text-emerald-400"
                                            : "border-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {isValid ? (
                                            <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                                        ) : (
                                            <ShieldAlert className="h-2.5 w-2.5 mr-0.5" />
                                        )}
                                        {cert.certificateNumber}
                                    </Badge>
                                </div>

                                {/* Document */}
                                <div className="sm:col-span-3 flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded ${catColor.bg} flex items-center justify-center shrink-0`}>
                                        <FileText className={`h-3 w-3 ${catColor.color}`} />
                                    </div>
                                    <span className="text-xs truncate">{cert.documentTitle}</span>
                                </div>

                                {/* Hash */}
                                <div className="sm:col-span-2">
                                    <span className="text-[10px] font-mono text-zinc-500 truncate block">
                                        {cert.sha256Hash.slice(0, 16)}…
                                    </span>
                                </div>

                                {/* Issuer */}
                                <div className="sm:col-span-2 text-[11px] text-zinc-400">
                                    {cert.archivedBy}
                                </div>

                                {/* Date */}
                                <div className="sm:col-span-1 text-[11px] text-zinc-500">
                                    {formatDate(cert.archivedAt)}
                                </div>

                                {/* Status */}
                                <div className="sm:col-span-1">
                                    <Badge
                                        variant="outline"
                                        className={`text-[9px] h-5 ${isValid
                                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                            : "text-red-400 bg-red-500/10 border-red-500/20"
                                            }`}
                                    >
                                        {isValid ? "Valide" : "Révoqué"}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="sm:col-span-1 flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                        onClick={(e) => { e.stopPropagation(); setSelectedCert(cert); }}
                                    >
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Download className="h-3 w-3" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{filtered.length} certificat{filtered.length > 1 ? "s" : ""}</span>
                <span>
                    {certificates.filter((c) => c.status === "valid").length} valides ·{" "}
                    {certificates.filter((c) => c.status === "revoked").length} révoqués
                </span>
            </div>
        </div>
    );
}
