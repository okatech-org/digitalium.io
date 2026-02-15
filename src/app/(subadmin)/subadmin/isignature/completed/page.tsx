// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Documents Signés
// ═══════════════════════════════════════════════

"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Download, Eye, Award, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface SignedDoc {
    id: string;
    title: string;
    signers: string[];
    signedAt: string;
    certId: string;
}

const SIGNED_DOCS: SignedDoc[] = [
    { id: "sd1", title: "Contrat annuel SOGARA 2025", signers: ["Daniel Nguema", "Marie Obame"], signedAt: "05/02/2026", certId: "SIG-2026-0045" },
    { id: "sd2", title: "Accord de partenariat COMILOG", signers: ["Claude Mboumba", "Pierre Ndong", "Aimée Gondjout"], signedAt: "28/01/2026", certId: "SIG-2026-0039" },
    { id: "sd3", title: "Bail commercial — Renouvellement 2026", signers: ["Daniel Nguema"], signedAt: "15/01/2026", certId: "SIG-2026-0028" },
    { id: "sd4", title: "Procès-verbal CA — Décembre 2025", signers: ["Daniel Nguema", "Marie Obame", "Aimée Gondjout"], signedAt: "22/12/2025", certId: "SIG-2025-0312" },
    { id: "sd5", title: "Contrat assurance ASCOMA 2025", signers: ["Marie Obame"], signedAt: "10/12/2025", certId: "SIG-2025-0298" },
    { id: "sd6", title: "Convention de formation — SEEG", signers: ["Claude Mboumba", "Daniel Nguema"], signedAt: "01/12/2025", certId: "SIG-2025-0285" },
];

export default function SubAdminCompletedSignaturesPage() {
    const handleDownload = useCallback((certId: string) => {
        toast.info(`Téléchargement du PDF signé ${certId}...`);
    }, []);

    const handleViewCert = useCallback((certId: string) => {
        toast.info(`Ouverture du certificat ${certId}...`);
    }, []);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Documents signés</h1>
                    <p className="text-xs text-muted-foreground">
                        {SIGNED_DOCS.length} document{SIGNED_DOCS.length > 1 ? "s" : ""} complété{SIGNED_DOCS.length > 1 ? "s" : ""}
                    </p>
                </div>
            </motion.div>

            {/* List */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                {SIGNED_DOCS.map((doc) => (
                    <motion.div
                        key={doc.id}
                        variants={fadeUp}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                    >
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{doc.title}</p>
                                <Badge variant="outline" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shrink-0">
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                    Signé
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-zinc-500">Signataires : {doc.signers.join(", ")}</span>
                                <span className="text-[11px] text-zinc-600">·</span>
                                <span className="text-[11px] text-zinc-500">{doc.signedAt}</span>
                                <span className="text-[11px] text-zinc-600">·</span>
                                <span className="text-[11px] text-violet-400 font-mono">{doc.certId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleDownload(doc.certId)}>
                                <Download className="h-3.5 w-3.5 mr-1" />
                                PDF
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleViewCert(doc.certId)}>
                                <Award className="h-3.5 w-3.5 mr-1" />
                                Certificat
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
