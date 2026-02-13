"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: SignatureRequestModal
// Create a new signature request
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    PenTool,
    X,
    User,
    Calendar,
    FileText,
    Upload,
    Eye,
    Check,
    Loader2,
    ArrowRight,
    ArrowDown,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

type SignerRole = "signer" | "approver" | "observer";
type OrderMode = "parallel" | "sequential";

interface Signer {
    id: string;
    name: string;
    email: string;
    role: SignerRole;
    order: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        documentTitle: string;
        signers: Signer[];
        deadline: string;
        message: string;
        orderMode: OrderMode;
    }) => void;
    documents?: { id: string; title: string }[];
}

// ─── Helpers ────────────────────────────────────

const ROLE_CONFIG: Record<SignerRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
    signer: { label: "Signataire", icon: PenTool, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    approver: { label: "Approbateur", icon: Check, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    observer: { label: "Observateur", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

// ─── Mock team members ──────────────────────────

const TEAM_MEMBERS = [
    { name: "Daniel Nguema", email: "d.nguema@digitalium.io" },
    { name: "Aimée Gondjout", email: "a.gondjout@digitalium.io" },
    { name: "Claude Mboumba", email: "c.mboumba@digitalium.io" },
    { name: "Marie Obame", email: "m.obame@digitalium.io" },
    { name: "Ornella Doumba", email: "o.doumba@digitalium.io" },
];

// ─── Component ──────────────────────────────────

export default function SignatureRequestModal({ open, onClose, onSubmit, documents = [] }: Props) {
    const [step, setStep] = useState(1);
    const [documentTitle, setDocumentTitle] = useState("");
    const [selectedDoc, setSelectedDoc] = useState("");
    const [signers, setSigners] = useState<Signer[]>([]);
    const [newSignerName, setNewSignerName] = useState("");
    const [, setNewSignerEmail] = useState("");
    const [newSignerRole, setNewSignerRole] = useState<SignerRole>("signer");
    const [deadline, setDeadline] = useState("");
    const [message, setMessage] = useState("");
    const [orderMode, setOrderMode] = useState<OrderMode>("parallel");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredMembers = TEAM_MEMBERS.filter(
        (m) =>
            !signers.some((s) => s.email === m.email) &&
            (m.name.toLowerCase().includes(newSignerName.toLowerCase()) ||
                m.email.toLowerCase().includes(newSignerName.toLowerCase()))
    );

    const addSigner = (name: string, email: string) => {
        setSigners([
            ...signers,
            {
                id: `signer-${Date.now()}-${Math.random()}`,
                name,
                email,
                role: newSignerRole,
                order: signers.length + 1,
            },
        ]);
        setNewSignerName("");
        setNewSignerEmail("");
        setShowSuggestions(false);
    };

    const removeSigner = (id: string) => {
        setSigners(signers.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 800));
        onSubmit({
            documentTitle: selectedDoc || documentTitle || "Document sans titre",
            signers,
            deadline,
            message,
            orderMode,
        });
        setIsSubmitting(false);
        // Reset
        setStep(1);
        setDocumentTitle("");
        setSelectedDoc("");
        setSigners([]);
        setDeadline("");
        setMessage("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg bg-zinc-950 border-white/10 p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
                <DialogHeader className="p-5 pb-3 border-b border-white/5">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                            <PenTool className="h-4 w-4 text-white" />
                        </div>
                        Demander une signature
                    </DialogTitle>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-3">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-1.5">
                                <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                        step >= s
                                            ? "bg-violet-500 text-white"
                                            : "bg-white/5 text-zinc-500"
                                    }`}
                                >
                                    {step > s ? <Check className="h-3 w-3" /> : s}
                                </div>
                                <span className={`text-[10px] ${step >= s ? "text-zinc-300" : "text-zinc-600"}`}>
                                    {s === 1 ? "Document" : s === 2 ? "Signataires" : "Envoi"}
                                </span>
                                {s < 3 && <div className="w-6 h-px bg-white/10 mx-1" />}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4">
                    {/* Step 1: Document */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            {documents.length > 0 && (
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                        Sélectionner un document iDocument
                                    </label>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                        {documents.map((doc) => (
                                            <button
                                                key={doc.id}
                                                onClick={() => { setSelectedDoc(doc.title); setDocumentTitle(doc.title); }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
                                                    selectedDoc === doc.title
                                                        ? "bg-violet-500/10 border border-violet-500/30"
                                                        : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                                                }`}
                                            >
                                                <FileText className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                                <span className="text-xs truncate">{doc.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 my-3">
                                        <div className="flex-1 h-px bg-white/5" />
                                        <span className="text-[9px] text-zinc-500 uppercase">ou</span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                    Titre du document *
                                </label>
                                <Input
                                    value={documentTitle}
                                    onChange={(e) => setDocumentTitle(e.target.value)}
                                    placeholder="Ex: Contrat de prestation de services"
                                    className="h-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>

                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.01] transition-all">
                                <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                                <p className="text-xs font-medium">Uploader un fichier externe</p>
                                <p className="text-[10px] text-zinc-500 mt-1">PDF, DOCX · Max 50 Mo</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Signers */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            {/* Order mode */}
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                    Ordre de signature
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { key: "parallel" as const, label: "Parallèle", desc: "Tous signent en même temps", icon: ArrowRight },
                                        { key: "sequential" as const, label: "Séquentiel", desc: "Ordre défini", icon: ArrowDown },
                                    ].map((mode) => (
                                        <button
                                            key={mode.key}
                                            onClick={() => setOrderMode(mode.key)}
                                            className={`flex-1 p-2.5 rounded-lg text-left transition-all ${
                                                orderMode === mode.key
                                                    ? "bg-violet-500/10 border border-violet-500/30"
                                                    : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <mode.icon className={`h-3 w-3 ${orderMode === mode.key ? "text-violet-400" : "text-zinc-500"}`} />
                                                <span className="text-[11px] font-medium">{mode.label}</span>
                                            </div>
                                            <p className="text-[9px] text-zinc-500">{mode.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Add signer */}
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                    Ajouter un signataire
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                                        <Input
                                            value={newSignerName}
                                            onChange={(e) => {
                                                setNewSignerName(e.target.value);
                                                setShowSuggestions(e.target.value.length > 0);
                                            }}
                                            onFocus={() => newSignerName.length > 0 && setShowSuggestions(true)}
                                            placeholder="Nom ou email…"
                                            className="h-8 pl-7 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                        />

                                        {/* Autocomplete */}
                                        {showSuggestions && filteredMembers.length > 0 && (
                                            <div className="absolute top-9 left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                                                {filteredMembers.slice(0, 4).map((m) => (
                                                    <button
                                                        key={m.email}
                                                        onClick={() => addSigner(m.name, m.email)}
                                                        className="w-full flex items-center gap-2 p-2 text-left hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                            <span className="text-[9px] text-violet-300 font-bold">
                                                                {m.name.split(" ").map((n) => n[0]).join("")}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-medium">{m.name}</p>
                                                            <p className="text-[9px] text-zinc-500">{m.email}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Role selector */}
                                    <div className="flex items-center gap-1">
                                        {(Object.entries(ROLE_CONFIG) as [SignerRole, typeof ROLE_CONFIG.signer][]).map(([key, cfg]) => {
                                            const RoleIcon = cfg.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setNewSignerRole(key)}
                                                    className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${
                                                        newSignerRole === key
                                                            ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                                                            : "bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10"
                                                    }`}
                                                    title={cfg.label}
                                                >
                                                    <RoleIcon className="h-3.5 w-3.5" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Signers list */}
                            {signers.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                        {signers.length} signataire{signers.length > 1 ? "s" : ""}
                                    </span>
                                    {signers.map((signer, i) => {
                                        const roleCfg = ROLE_CONFIG[signer.role];
                                        const RoleIcon = roleCfg.icon;
                                        return (
                                            <motion.div
                                                key={signer.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                                            >
                                                {orderMode === "sequential" && (
                                                    <span className="text-[10px] text-zinc-500 font-mono w-4 text-center">
                                                        {i + 1}
                                                    </span>
                                                )}
                                                <div className="h-7 w-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] text-violet-300 font-bold">
                                                        {signer.name.split(" ").map((n) => n[0]).join("")}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{signer.name}</p>
                                                    <p className="text-[9px] text-zinc-500">{signer.email}</p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[8px] h-4 ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}
                                                >
                                                    <RoleIcon className="h-2 w-2 mr-0.5" />
                                                    {roleCfg.label}
                                                </Badge>
                                                <button
                                                    onClick={() => removeSigner(signer.id)}
                                                    className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/10 text-zinc-500 hover:text-zinc-300"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Deadline & Message */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            {/* Summary */}
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-violet-400" />
                                    <span className="text-xs font-medium">{documentTitle || selectedDoc || "Document"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {signers.map((s) => {
                                        const cfg = ROLE_CONFIG[s.role];
                                        return (
                                            <Badge key={s.id} variant="outline" className={`text-[8px] h-4 ${cfg.border} ${cfg.color}`}>
                                                {s.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-zinc-500">
                                    Mode : {orderMode === "parallel" ? "Parallèle" : "Séquentiel"}
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    Date limite
                                </label>
                                <Input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="h-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
                                    Message personnalisé
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ajoutez un message pour les signataires…"
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500/30 resize-none"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    {step > 1 ? (
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setStep(step - 1)}>
                            Retour
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                            disabled={
                                (step === 1 && !documentTitle && !selectedDoc) ||
                                (step === 2 && signers.length === 0)
                            }
                            onClick={() => setStep(step + 1)}
                        >
                            Suivant
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    Envoi…
                                </>
                            ) : (
                                <>
                                    <PenTool className="h-3.5 w-3.5 mr-1.5" />
                                    Envoyer la demande
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
