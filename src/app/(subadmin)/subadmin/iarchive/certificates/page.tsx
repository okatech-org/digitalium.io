// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Certificats d'Archivage
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Award, Search, CheckCircle2, AlertTriangle, XCircle, Download, Eye, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

type CertStatus = "valid" | "expiring" | "expired";

interface Certificate {
    id: string;
    certId: string;
    title: string;
    issuedAt: string;
    expiresAt: string;
    hash: string;
    status: CertStatus;
    issuedBy: string;
}

const CERTIFICATES: Certificate[] = [
    { id: "c1", certId: "CERT-2026-08020", title: "Statuts société — Mise à jour 2026", issuedAt: "05/02/2026", expiresAt: "05/02/2056", hash: "1a2b3c4d...f1a2b", status: "valid", issuedBy: "iArchive CA" },
    { id: "c2", certId: "CERT-2026-07997", title: "Bilan comptable 2025", issuedAt: "15/01/2026", expiresAt: "15/01/2036", hash: "5854a1eb...47a5", status: "valid", issuedBy: "iArchive CA" },
    { id: "c3", certId: "CERT-2026-08012", title: "Contrat CDI — Aimée Gondjout", issuedAt: "01/02/2026", expiresAt: "01/02/2031", hash: "a1b2c3d4...a1b2", status: "valid", issuedBy: "iArchive CA" },
    { id: "c4", certId: "CERT-2026-07993", title: "Brevet logiciel — iDETUDE v3", issuedAt: "09/02/2026", expiresAt: "∞ Illimité", hash: "92b5c8d1...a2b5", status: "valid", issuedBy: "iArchive CA" },
    { id: "c5", certId: "CERT-2025-07860", title: "Accord de confidentialité SOGARA", issuedAt: "10/12/2025", expiresAt: "10/12/2055", hash: "3c4d5e6f...3c4d", status: "valid", issuedBy: "iArchive CA" },
    { id: "c6", certId: "CERT-2021-02345", title: "Attestation CNSS — Décembre 2020", issuedAt: "15/01/2021", expiresAt: "15/01/2026", hash: "e5f6a7b8...e5f6", status: "expiring", issuedBy: "iArchive CA" },
    { id: "c7", certId: "CERT-2016-00234", title: "Contrat SHO — Bail commercial 2016", issuedAt: "15/06/2016", expiresAt: "15/06/2026", hash: "f8d3a67b...6e78", status: "expiring", issuedBy: "iArchive CA" },
    { id: "c8", certId: "CERT-2015-02876", title: "Facture télécom 2015-Q2", issuedAt: "01/07/2015", expiresAt: "01/07/2025", hash: "09e4b78c...7f89", status: "expired", issuedBy: "iArchive CA" },
];

const STATUS_MAP: Record<CertStatus, { label: string; icon: React.ElementType; color: string }> = {
    valid: { label: "Valide", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    expiring: { label: "Expire bientôt", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    expired: { label: "Expiré", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function SubAdminCertificatesPage() {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        return CERTIFICATES.filter(
            (c) =>
                c.certId.toLowerCase().includes(search.toLowerCase()) ||
                c.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleVerify = useCallback((certId: string) => {
        toast.success(`Certificat ${certId} vérifié — Intégrité confirmée`);
    }, []);

    const handleDownload = useCallback((certId: string) => {
        toast.info(`Téléchargement du certificat ${certId}...`);
    }, []);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Certificats d&apos;archivage</h1>
                    <p className="text-xs text-muted-foreground">{filtered.length} certificat{filtered.length > 1 ? "s" : ""}</p>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Rechercher par ID ou titre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                </div>
            </motion.div>

            {/* Certificates List */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                {filtered.map((cert) => {
                    const st = STATUS_MAP[cert.status];
                    const Icon = st.icon;
                    return (
                        <motion.div
                            key={cert.id}
                            variants={fadeUp}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                        >
                            <div className="h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">{cert.title}</p>
                                    <Badge variant="outline" className={`text-[10px] shrink-0 ${st.color}`}>
                                        <Icon className="h-2.5 w-2.5 mr-1" />
                                        {st.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[11px] text-violet-400 font-mono">{cert.certId}</span>
                                    <span className="text-[11px] text-zinc-600">·</span>
                                    <span className="text-[11px] text-zinc-500">Émis le {cert.issuedAt}</span>
                                    <span className="text-[11px] text-zinc-600">·</span>
                                    <span className="text-[11px] text-zinc-500">Expire: {cert.expiresAt}</span>
                                </div>
                                <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">SHA-256: {cert.hash}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleVerify(cert.certId)}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Vérifier
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleDownload(cert.certId)}>
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    PDF
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-sm text-zinc-500">Aucun certificat trouvé</div>
                )}
            </motion.div>
        </div>
    );
}
