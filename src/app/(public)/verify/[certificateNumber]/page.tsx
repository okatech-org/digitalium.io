"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    Search,
    Loader2,
    CheckCircle2,
    Trash2,
    Lock,
} from "lucide-react";
import Link from "next/link";

function formatDateTime(ts: number): string {
    const d = new Date(ts);
    return `${d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })} à ${d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;
}

export default function PublicVerificationPage() {
    const params = useParams();
    const rawCertNum = Array.isArray(params.certificateNumber)
        ? params.certificateNumber[0]
        : params.certificateNumber;

    const initialCertNum = rawCertNum ? decodeURIComponent(rawCertNum) : "";
    const [searchInput, setSearchInput] = useState(initialCertNum);
    const [activeSearch, setActiveSearch] = useState(initialCertNum);

    const result = useQuery(
        api.archives.getCertificateByNumber,
        activeSearch ? { certificateNumber: activeSearch } : "skip"
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setActiveSearch(searchInput.trim());
        }
    };

    const isSearching = activeSearch !== "" && result === undefined;
    const notFound = activeSearch !== "" && result === null;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navbar */}
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-violet-400" />
                        <span className="text-xl font-bold tracking-tight">DIGITALIUM<span className="text-violet-400">.IO</span></span>
                    </div>
                    <div>
                        <Link href="/">
                            <Button variant="ghost" className="text-white/60 hover:text-white">Retour à l'accueil</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-start pt-16 px-6 relative z-10 w-full max-w-3xl mx-auto space-y-12">

                {/* Header & Search */}
                <div className="text-center space-y-6 w-full">
                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Vérification de Certificat
                        </h1>
                        <p className="text-lg text-white/50 max-w-xl mx-auto">
                            Saisissez le numéro unique de certificat d'archivage ou de destruction pour vérifier son authenticité.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-lg mx-auto relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-white/50 group-focus-within:text-violet-400 transition-colors" />
                        </div>
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Ex: ARCH-2024-ABC123XYZ"
                            className="h-14 pl-12 pr-32 rounded-2xl border-white/10 bg-white/5 text-lg placeholder:text-white/20 focus-visible:ring-violet-500/50 focus-visible:border-violet-500"
                        />
                        <Button
                            type="submit"
                            disabled={!searchInput.trim()}
                            className="absolute right-2 top-2 bottom-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg"
                        >
                            Vérifier
                        </Button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="w-full">
                    {isSearching && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                            <p className="text-sm text-white/50">Recherche dans le registre immuable...</p>
                        </div>
                    )}

                    {notFound && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4"
                        >
                            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <ShieldAlert className="h-8 w-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Certificat introuvable</h3>
                            <p className="text-white/60">
                                Le numéro <span className="text-white font-mono">{activeSearch}</span> ne correspond à aucun certificat valide ou détruit dans notre système.
                            </p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                            {result.type === "archive" ? (
                                /* ─── Archiving Certificate ─── */
                                <div className="rounded-3xl border-2 border-violet-500/30 bg-gradient-to-b from-violet-950/40 to-black overflow-hidden shadow-2xl">
                                    <div className="h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600" />
                                    <div className="p-8 sm:p-10 space-y-8">
                                        <div className="text-center space-y-2">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <ShieldCheck className="h-8 w-8 text-emerald-400" />
                                                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-emerald-400">
                                                    Certificat d'Archivage Valide
                                                </h2>
                                            </div>
                                            <p className="text-sm text-white/40">Généré par le registre de confiance DIGITALIUM.IO</p>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="rounded-2xl bg-white/5 p-5 border border-white/5 space-y-4">
                                                <CertRow label="N° Certificat">
                                                    <span className="font-mono text-violet-300 text-base">{result.cert.certificateNumber}</span>
                                                </CertRow>
                                                <CertRow label="Organisation">
                                                    <span className="text-white font-medium">{result.orgName}</span>
                                                </CertRow>
                                                <CertRow label="Date d'archivage">
                                                    <span className="text-white/80">{formatDateTime(result.archive.createdAt)}</span>
                                                </CertRow>
                                                <CertRow label="Catégorie OHADA">
                                                    <Badge variant="outline" className="text-xs border-white/10 text-white/70 capitalize">
                                                        {result.archive.categorySlug}
                                                    </Badge>
                                                </CertRow>
                                            </div>

                                            <div className="rounded-2xl bg-white/5 p-5 border border-white/5 space-y-4">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Empreintes Numériques (Hashes)</h4>
                                                <div className="space-y-3">
                                                    <div className="space-y-1 text-left">
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Hash Global (SHA-256)</p>
                                                        <p className="text-xs font-mono text-emerald-400 break-all bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                                                            {result.archive.sha256Hash}
                                                        </p>
                                                    </div>
                                                    {result.archive.contentHash && (
                                                        <div className="space-y-1 text-left">
                                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Hash Flux Données (JSON)</p>
                                                            <p className="text-xs font-mono text-cyan-400 break-all bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                                                                {result.archive.contentHash}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {result.archive.pdfHash && (
                                                        <div className="space-y-1 text-left">
                                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Hash Rendu Original (PDF)</p>
                                                            <p className="text-xs font-mono text-violet-400 break-all bg-violet-500/10 p-2 rounded border border-violet-500/20">
                                                                {result.archive.pdfHash}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                                <Lock className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                                                <p className="text-sm text-violet-200">
                                                    Les métadonnées sensibles et le contenu du document original ne sont pas accessibles via cette page publique pour des raisons de confidentialité.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ─── Destruction Certificate ─── */
                                <div className="rounded-3xl border-2 border-red-500/30 bg-gradient-to-b from-red-950/40 to-black overflow-hidden shadow-2xl">
                                    <div className="h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
                                    <div className="p-8 sm:p-10 space-y-8">
                                        <div className="text-center space-y-2">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <Trash2 className="h-8 w-8 text-red-500" />
                                                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-red-400">
                                                    Certificat de Destruction
                                                </h2>
                                            </div>
                                            <p className="text-sm text-white/40">Généré par le registre de confiance DIGITALIUM.IO</p>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="rounded-2xl bg-white/5 p-5 border border-white/5 space-y-4">
                                                <CertRow label="N° Certificat Destruction">
                                                    <span className="font-mono text-red-300 text-base">{result.cert.certificateNumber}</span>
                                                </CertRow>
                                                <CertRow label="Organisation">
                                                    <span className="text-white font-medium">{result.orgName}</span>
                                                </CertRow>
                                                <CertRow label="Date de destruction">
                                                    <span className="text-white/80">{formatDateTime(result.cert.destroyedAt)}</span>
                                                </CertRow>
                                                <CertRow label="Motif">
                                                    <span className="text-white/70 italic max-w-xs text-right">{result.cert.destructionReason}</span>
                                                </CertRow>
                                            </div>

                                            {result.cert.originalSha256Hash && (
                                                <div className="rounded-2xl bg-white/5 p-5 border border-white/5 space-y-4">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Empreinte de l'Archive Détruite</h4>
                                                    <div className="space-y-1 text-left">
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Hash Global Original (SHA-256)</p>
                                                        <p className="text-xs font-mono text-red-400 break-all bg-red-500/10 p-2 rounded border border-red-500/20">
                                                            {result.cert.originalSha256Hash}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                <ShieldAlert className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                                                <p className="text-sm text-orange-200">
                                                    Ce document a été détruit de manière sécurisée et irréversible conformément aux politiques de rétention. L'archive d'origine n'existe plus.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-8 text-center relative z-10 border-t border-white/5 bg-black/40 mt-12">
                <p className="text-xs text-white/50">
                    © {new Date().getFullYear()} Digitalium. Plateforme sécurisée de confiance.
                </p>
            </footer>
        </div>
    );
}

function CertRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-xs text-zinc-500 uppercase tracking-wider shrink-0">{label}</span>
            <div className="text-right flex-1 flex justify-end">
                {children}
            </div>
        </div>
    );
}
