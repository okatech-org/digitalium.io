// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Documents envoyés pour signature
// ═══════════════════════════════════════════════

"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Send, RefreshCw, XCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

type WaitStatus = "en_cours" | "partiel" | "expire";

interface WaitingDoc {
    id: string;
    title: string;
    recipients: string[];
    sentAt: string;
    status: WaitStatus;
    signed: number;
    total: number;
}

const WAITING_DOCS: WaitingDoc[] = [
    { id: "w1", title: "Convention partenariat SEEG 2026", recipients: ["Marie Obame", "Pierre Ndong"], sentAt: "10/02/2026", status: "en_cours", signed: 1, total: 2 },
    { id: "w2", title: "Accord de non-divulgation — COMILOG", recipients: ["Claude Mboumba"], sentAt: "08/02/2026", status: "en_cours", signed: 0, total: 1 },
    { id: "w3", title: "Contrat sous-traitance — Maintenance IT", recipients: ["Aimée Gondjout", "Daniel Nguema", "Pierre Ndong"], sentAt: "01/02/2026", status: "partiel", signed: 2, total: 3 },
    { id: "w4", title: "Avenant contrat ASCOMA — Clause 12", recipients: ["Marie Obame"], sentAt: "15/01/2026", status: "expire", signed: 0, total: 1 },
    { id: "w5", title: "PV réunion stratégique — Validation DG", recipients: ["Daniel Nguema", "Aimée Gondjout"], sentAt: "20/01/2026", status: "partiel", signed: 1, total: 2 },
];

const STATUS_CONFIG: Record<WaitStatus, { label: string; icon: React.ElementType; color: string }> = {
    en_cours: { label: "En cours", icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    partiel: { label: "Signé partiellement", icon: CheckCircle2, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    expire: { label: "Expiré", icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function SubAdminWaitingSignaturesPage() {
    const handleRelance = useCallback((title: string) => {
        toast.success(`Relance envoyée pour "${title}"`);
    }, []);

    const handleCancel = useCallback((title: string) => {
        toast.warning(`Demande annulée pour "${title}"`);
    }, []);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Documents envoyés</h1>
                    <p className="text-xs text-muted-foreground">
                        {WAITING_DOCS.length} document{WAITING_DOCS.length > 1 ? "s" : ""} en attente de signature
                    </p>
                </div>
            </motion.div>

            {/* List */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                {WAITING_DOCS.map((doc) => {
                    const st = STATUS_CONFIG[doc.status];
                    const Icon = st.icon;
                    const progress = doc.total > 0 ? (doc.signed / doc.total) * 100 : 0;

                    return (
                        <motion.div
                            key={doc.id}
                            variants={fadeUp}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium truncate">{doc.title}</p>
                                        <Badge variant="outline" className={`text-[10px] shrink-0 ${st.color}`}>
                                            <Icon className="h-2.5 w-2.5 mr-1" />
                                            {st.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                        <span>Envoyé le {doc.sentAt}</span>
                                        <span className="text-zinc-600">·</span>
                                        <span>Destinataires : {doc.recipients.join(", ")}</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-mono">{doc.signed}/{doc.total}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => handleRelance(doc.title)}
                                    >
                                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                        Relancer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        onClick={() => handleCancel(doc.title)}
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
