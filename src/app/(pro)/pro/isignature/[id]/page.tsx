"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Signature Detail
// View document, sign, refuse, delegate
// ═══════════════════════════════════════════════

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    PenTool,
    FileText,
    User,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Send,
    Shield,
    Forward,
    Loader2,
    AlertTriangle,
    Archive,
    Type,
    Pencil,
} from "lucide-react";
import { toast } from "sonner";

// ─── Mock data (simulates fetching by ID) ───────

const MOCK_SIGNATURE = {
    id: "sig-1",
    title: "Contrat prestation SOGARA — Q2 2026",
    requester: { name: "Daniel Nguema", email: "d.nguema@digitalium.io", avatar: "DN" },
    requestedAt: Date.now() - 2 * 3600 * 1000,
    deadline: Date.now() + 3 * 24 * 3600 * 1000,
    message: "Merci de bien vouloir signer ce contrat avant vendredi. Le client attend notre retour rapidement.",
    sequential: false,
    signers: [
        { name: "Ornella Doumba", email: "o.doumba@digitalium.io", role: "signer" as const, status: "pending" as const, signedAt: null, order: 1 },
        { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", role: "signer" as const, status: "signed" as const, signedAt: Date.now() - 3600 * 1000, order: 2 },
        { name: "Marie Obame", email: "m.obame@digitalium.io", role: "approver" as const, status: "pending" as const, signedAt: null, order: 3 },
    ],
    status: "in_progress" as const,
    comments: [
        { id: "c1", user: "Claude Mboumba", text: "Document vérifié et signé. RAS.", createdAt: Date.now() - 3600 * 1000 },
        { id: "c2", user: "Daniel Nguema", text: "Merci Claude. En attente des autres signatures.", createdAt: Date.now() - 1800 * 1000 },
    ],
    documentContent: "Ce contrat de prestation de services est conclu entre DIGITALIUM SAS et SOGARA pour une durée de 12 mois à compter de la date de signature. Le prestataire s'engage à fournir les services définis dans l'annexe technique ci-jointe...",
};

// ─── Helpers ────────────────────────────────────

function formatDateTime(ts: number): string {
    const d = new Date(ts);
    return `${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}min`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
}

const ROLE_CONFIG = {
    signer: { label: "Signataire", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    approver: { label: "Approbateur", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    observer: { label: "Observateur", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const STATUS_ICON = {
    pending: { icon: Clock, color: "text-amber-400", label: "En attente" },
    signed: { icon: CheckCircle2, color: "text-emerald-400", label: "Signé" },
    declined: { icon: XCircle, color: "text-red-400", label: "Refusé" },
};

// ─── Component ──────────────────────────────────

export default function SignatureDetailPage() {
    const [signatureMode, setSignatureMode] = useState<"type" | "draw" | null>(null);
    const [typedSignature, setTypedSignature] = useState("");
    const [comment, setComment] = useState("");
    const [showRefuseForm, setShowRefuseForm] = useState(false);
    const [refuseReason, setRefuseReason] = useState("");
    const [showDelegateForm, setShowDelegateForm] = useState(false);
    const [delegateEmail, setDelegateEmail] = useState("");
    const [isSigning, setIsSigning] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const sig = MOCK_SIGNATURE;
    const signedCount = sig.signers.filter((s) => s.status === "signed").length;
    const daysLeft = Math.ceil((sig.deadline - Date.now()) / (24 * 3600 * 1000));

    const handleSign = async () => {
        setIsSigning(true);
        await new Promise((r) => setTimeout(r, 1200));
        toast.success("Document signé avec succès");
        setIsSigning(false);
        setSignatureMode(null);
    };

    const handleRefuse = () => {
        if (!refuseReason) return;
        toast.error("Signature refusée");
        setShowRefuseForm(false);
    };

    const handleDelegate = () => {
        if (!delegateEmail) return;
        toast.success(`Signature déléguée à ${delegateEmail}`);
        setShowDelegateForm(false);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <Link href="/pro/isignature">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                    <PenTool className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold truncate">{sig.title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px] h-5 border-blue-500/20 text-blue-400">
                            {(sig.status as string) === "completed" ? "Complété" : sig.status === "in_progress" ? "En cours" : "En attente"}
                        </Badge>
                        <span className="text-[10px] text-zinc-500">
                            {signedCount}/{sig.signers.length} signatures
                        </span>
                        {sig.deadline && (
                            <span className={`text-[10px] ${daysLeft <= 2 ? "text-red-400" : "text-zinc-500"}`}>
                                <Calendar className="h-2.5 w-2.5 inline mr-0.5" />
                                {daysLeft} jours restants
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ═══ MAIN PANEL (document + sign) ═══ */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Document preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-violet-400" />
                            <span className="text-xs font-semibold">Aperçu du document</span>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                                {sig.documentContent}
                            </p>
                        </div>
                    </motion.div>

                    {/* Message from requester */}
                    {sig.message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                                <span className="text-[10px] text-blue-300 font-medium">Message de {sig.requester.name}</span>
                            </div>
                            <p className="text-[11px] text-blue-200/80">{sig.message}</p>
                        </motion.div>
                    )}

                    {/* ═══ SIGNATURE AREA ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PenTool className="h-4 w-4 text-violet-400" />
                                <span className="text-xs font-semibold">Signer le document</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Signature mode toggle */}
                            {!signatureMode && !showRefuseForm && !showDelegateForm && (
                                <div className="space-y-3">
                                    <p className="text-[11px] text-zinc-400">
                                        Choisissez votre méthode de signature pour valider ce document.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 flex-1"
                                            onClick={() => setSignatureMode("type")}
                                        >
                                            <Type className="h-3.5 w-3.5 mr-1.5" />
                                            Signature tapée
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 flex-1"
                                            onClick={() => setSignatureMode("draw")}
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            Signature dessinée
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 flex-1"
                                            onClick={() => setShowRefuseForm(true)}
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Refuser
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs border-white/10 flex-1"
                                            onClick={() => setShowDelegateForm(true)}
                                        >
                                            <Forward className="h-3.5 w-3.5 mr-1.5" />
                                            Déléguer
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Typed signature */}
                            {signatureMode === "type" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <p className="text-[11px] text-zinc-400">
                                        Tapez votre nom complet pour signer.
                                    </p>
                                    <Input
                                        value={typedSignature}
                                        onChange={(e) => setTypedSignature(e.target.value)}
                                        placeholder="Votre nom complet"
                                        className="h-10 text-sm bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                    />
                                    {typedSignature && (
                                        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                                            <p className="text-xl italic font-serif text-violet-300">{typedSignature}</p>
                                            <p className="text-[9px] text-zinc-500 mt-1">Aperçu de votre signature</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-white/10"
                                            onClick={() => { setSignatureMode(null); setTypedSignature(""); }}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 flex-1"
                                            disabled={!typedSignature || isSigning}
                                            onClick={handleSign}
                                        >
                                            {isSigning ? (
                                                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Signature en cours…</>
                                            ) : (
                                                <><PenTool className="h-3.5 w-3.5 mr-1.5" />Confirmer et signer</>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Drawn signature */}
                            {signatureMode === "draw" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <p className="text-[11px] text-zinc-400">
                                        Dessinez votre signature dans le cadre ci-dessous.
                                    </p>
                                    <div className="relative rounded-lg bg-white/[0.03] border-2 border-dashed border-white/10 overflow-hidden">
                                        <canvas
                                            ref={canvasRef}
                                            width={400}
                                            height={150}
                                            className="w-full cursor-crosshair"
                                            onMouseDown={(e) => {
                                                const canvas = canvasRef.current;
                                                if (!canvas) return;
                                                const ctx = canvas.getContext("2d");
                                                if (!ctx) return;
                                                ctx.strokeStyle = "#a78bfa";
                                                ctx.lineWidth = 2;
                                                ctx.lineCap = "round";
                                                ctx.beginPath();
                                                const rect = canvas.getBoundingClientRect();
                                                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

                                                const handleMove = (ev: MouseEvent) => {
                                                    ctx.lineTo(ev.clientX - rect.left, ev.clientY - rect.top);
                                                    ctx.stroke();
                                                };
                                                const handleUp = () => {
                                                    window.removeEventListener("mousemove", handleMove);
                                                    window.removeEventListener("mouseup", handleUp);
                                                };
                                                window.addEventListener("mousemove", handleMove);
                                                window.addEventListener("mouseup", handleUp);
                                            }}
                                        />
                                        <p className="absolute bottom-1 right-2 text-[8px] text-zinc-600">
                                            Dessinez ici
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-white/10"
                                            onClick={() => {
                                                const ctx = canvasRef.current?.getContext("2d");
                                                if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                            }}
                                        >
                                            Effacer
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-white/10"
                                            onClick={() => setSignatureMode(null)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 flex-1"
                                            disabled={isSigning}
                                            onClick={handleSign}
                                        >
                                            {isSigning ? (
                                                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Signature…</>
                                            ) : (
                                                <><PenTool className="h-3.5 w-3.5 mr-1.5" />Confirmer et signer</>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Refuse form */}
                            {showRefuseForm && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-red-400">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-medium">Refuser la signature</span>
                                    </div>
                                    <textarea
                                        value={refuseReason}
                                        onChange={(e) => setRefuseReason(e.target.value)}
                                        placeholder="Motif du refus (obligatoire)…"
                                        rows={3}
                                        className="w-full px-3 py-2 text-xs bg-white/5 border border-red-500/20 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500/30 resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs border-white/10" onClick={() => setShowRefuseForm(false)}>
                                            Annuler
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-xs bg-red-600 hover:bg-red-700 flex-1"
                                            disabled={!refuseReason}
                                            onClick={handleRefuse}
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Confirmer le refus
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Delegate form */}
                            {showDelegateForm && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Forward className="h-4 w-4" />
                                        <span className="text-xs font-medium">Déléguer la signature</span>
                                    </div>
                                    <Input
                                        value={delegateEmail}
                                        onChange={(e) => setDelegateEmail(e.target.value)}
                                        placeholder="Email du destinataire"
                                        className="h-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs border-white/10" onClick={() => setShowDelegateForm(false)}>
                                            Annuler
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 flex-1"
                                            disabled={!delegateEmail}
                                            onClick={handleDelegate}
                                        >
                                            <Forward className="h-3.5 w-3.5 mr-1.5" />
                                            Déléguer
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* ═══ SIDEBAR ═══ */}
                <div className="space-y-4">
                    {/* Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5">
                            <span className="text-xs font-semibold">Détails</span>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500">Demandeur</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-5 w-5 rounded-full bg-violet-500/15 flex items-center justify-center">
                                        <span className="text-[7px] text-violet-300 font-bold">{sig.requester.avatar}</span>
                                    </div>
                                    <span className="text-[11px] text-zinc-300">{sig.requester.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500">Date</span>
                                <span className="text-[11px] text-zinc-300">{formatDateTime(sig.requestedAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500">Deadline</span>
                                <span className={`text-[11px] ${daysLeft <= 2 ? "text-red-400 font-medium" : "text-zinc-300"}`}>
                                    {formatDateTime(sig.deadline)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500">Progression</span>
                                <span className="text-[11px] text-zinc-300 font-mono">{signedCount}/{sig.signers.length}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                                    style={{ width: `${(signedCount / sig.signers.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Signers */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5">
                            <span className="text-xs font-semibold">Signataires</span>
                        </div>
                        <div className="p-3 space-y-2">
                            {sig.signers.map((signer, i) => {
                                const roleCfg = ROLE_CONFIG[signer.role];
                                const statusCfg = STATUS_ICON[signer.status];
                                const StatusIcon = statusCfg.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 + i * 0.05 }}
                                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02]"
                                    >
                                        {sig.sequential && (
                                            <span className="text-[10px] text-zinc-600 font-mono w-3">{signer.order}</span>
                                        )}
                                        <div className="relative">
                                            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                                                <span className="text-[9px] font-bold text-zinc-400">
                                                    {signer.name.split(" ").map((n) => n[0]).join("")}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5">
                                                <StatusIcon className={`h-3.5 w-3.5 ${statusCfg.color}`} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium truncate">{signer.name}</p>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className={`text-[7px] h-3.5 ${roleCfg.border} ${roleCfg.color}`}>
                                                    {roleCfg.label}
                                                </Badge>
                                                <span className={`text-[9px] ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                        </div>
                                        {signer.signedAt && (
                                            <span className="text-[9px] text-zinc-500">{timeAgo(signer.signedAt)}</span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Comments */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5">
                            <span className="text-xs font-semibold flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                                Discussion
                            </span>
                        </div>
                        <div className="p-3 space-y-2">
                            {sig.comments.map((c) => (
                                <div key={c.id} className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-medium text-zinc-300">{c.user}</span>
                                        <span className="text-[9px] text-zinc-600">{timeAgo(c.createdAt)}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 pl-0">{c.text}</p>
                                </div>
                            ))}

                            {/* Add comment */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <Input
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ajouter un commentaire…"
                                    className="h-7 text-[11px] bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-zinc-500 hover:text-violet-400"
                                    disabled={!comment}
                                    onClick={() => {
                                        toast.success("Commentaire ajouté");
                                        setComment("");
                                    }}
                                >
                                    <Send className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Auto archive after completion */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/15"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Archive className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-[10px] text-violet-300 font-medium">Archivage automatique</span>
                        </div>
                        <p className="text-[10px] text-violet-300/70">
                            Une fois toutes les signatures collectées, le document sera automatiquement archivé dans iArchive.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
