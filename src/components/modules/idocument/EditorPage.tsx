"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Editor Page
// Full collaborative editor with Tiptap + Yjs
// ═══════════════════════════════════════════════

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table as TipTapTable } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import EditorToolbar from "./EditorToolbar";
import WorkflowStatusBar from "./WorkflowStatusBar";
import type { UserRole } from "./WorkflowStatusBar";
import type { ApprovalAction } from "./ApprovalModal";
import ApprovalModal from "./ApprovalModal";
import ArchiveModal from "./ArchiveModal";
import ArchiveCertificate from "./ArchiveCertificate";

import {
    ArrowLeft,
    Save,
    Share2,
    History,
    FileDown,
    MoreHorizontal,
    MessageSquare,
    Clock,
    Settings2,
    Users,
    CheckCircle2,
    Eye,
    PenTool,
    Archive,
    X,
    FileText,
    RotateCcw,
    ChevronRight,
    Send,
    Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

type DocStatus = "draft" | "review" | "approved" | "archived";

interface DocMeta {
    id: string;
    title: string;
    status: DocStatus;
    version: number;
    lastSavedAt: number | null;
    tags: string[];
    author: string;
    collaborators: string[];
    workflowReason?: string;
}

interface VersionEntry {
    id: string;
    version: number;
    editedBy: string;
    description: string;
    createdAt: number;
}

interface Comment {
    id: string;
    userName: string;
    text: string;
    createdAt: number;
    resolved: boolean;
}

// ─── Status config ──────────────────────────────

const STATUS_CFG: Record<
    DocStatus,
    { label: string; icon: React.ElementType; cls: string }
> = {
    draft: {
        label: "Brouillon",
        icon: PenTool,
        cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
    },
    review: {
        label: "En révision",
        icon: Eye,
        cls: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    },
    approved: {
        label: "Approuvé",
        icon: CheckCircle2,
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    archived: {
        label: "Archivé",
        icon: Archive,
        cls: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    },
};

// ─── Collaborator colors ────────────────────────

const COLLAB_COLORS = [
    "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444",
    "#10b981", "#ec4899", "#3b82f6", "#f97316",
];

function userColor(name: string) {
    let hash = 0;
    for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return COLLAB_COLORS[Math.abs(hash) % COLLAB_COLORS.length];
}

// ─── Demo data ──────────────────────────────────

const DEMO_META: DocMeta = {
    id: "demo-1",
    title: "Contrat de prestation de services — SOGARA",
    status: "draft",
    version: 3,
    lastSavedAt: null,
    tags: ["Contrat", "SOGARA", "Services IT"],
    author: "Daniel Nguema",
    collaborators: ["Daniel Nguema", "Aimée Gondjout", "Claude Mboumba"],
};

const DEMO_VERSIONS: VersionEntry[] = [
    {
        id: "v3",
        version: 3,
        editedBy: "Daniel Nguema",
        description: "Ajout des clauses de confidentialité",
        createdAt: Date.now() - 3600_000,
    },
    {
        id: "v2",
        version: 2,
        editedBy: "Aimée Gondjout",
        description: "Révision des conditions financières",
        createdAt: Date.now() - 86400_000,
    },
    {
        id: "v1",
        version: 1,
        editedBy: "Daniel Nguema",
        description: "Version initiale du contrat",
        createdAt: Date.now() - 172800_000,
    },
];

const DEMO_COMMENTS: Comment[] = [
    {
        id: "c1",
        userName: "Aimée Gondjout",
        text: "Les montants de pénalité doivent être revus selon le taux en vigueur au Gabon.",
        createdAt: Date.now() - 7200_000,
        resolved: false,
    },
    {
        id: "c2",
        userName: "Claude Mboumba",
        text: "Clause 4.2 — préciser la durée de la période d'essai.",
        createdAt: Date.now() - 14400_000,
        resolved: true,
    },
];

const INITIAL_CONTENT = `
<h1>Contrat de Prestation de Services Numériques</h1>
<p><strong>Entre les soussignés :</strong></p>
<p>La Société Gabonaise de Raffinage (SOGARA), société anonyme au capital de 15 000 000 000 FCFA, immatriculée au RCCM sous le numéro GA-LBV-2024-B-0042, dont le siège social est situé à Port-Gentil, Ogooué-Maritime, République Gabonaise, représentée par son Directeur Général,</p>
<p><em>Ci-après dénommée « Le Client »,</em></p>
<p><strong>Et :</strong></p>
<p>DIGITALIUM SA, société de droit gabonais au capital de 500 000 000 FCFA, immatriculée au RCCM sous le numéro GA-LBV-2025-A-0187, dont le siège social est situé au boulevard Triomphal Omar Bongo, Libreville, République Gabonaise,</p>
<p><em>Ci-après dénommée « Le Prestataire »,</em></p>
<h2>Article 1 — Objet du Contrat</h2>
<p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire fournira au Client les services de transformation numérique suivants :</p>
<ul>
  <li>Conception et déploiement d'une plateforme de gestion documentaire (iDocument)</li>
  <li>Mise en place d'un système d'archivage numérique certifié NF Z42-013</li>
  <li>Formation des équipes métier (minimum 50 collaborateurs)</li>
  <li>Support technique et maintenance pendant 24 mois</li>
</ul>
<h2>Article 2 — Durée du Contrat</h2>
<p>Le présent contrat est conclu pour une durée de <strong>vingt-quatre (24) mois</strong> à compter de sa date de signature, renouvelable par tacite reconduction pour des périodes successives de douze (12) mois, sauf dénonciation par l'une des parties avec un préavis de trois (3) mois.</p>
<h2>Article 3 — Conditions Financières</h2>
<p>Le montant total de la prestation est fixé à <strong>350 000 000 FCFA</strong> (trois cent cinquante millions de francs CFA), hors taxes, décomposé comme suit :</p>
<table>
  <tr><th>Phase</th><th>Description</th><th>Montant (FCFA)</th></tr>
  <tr><td>Phase 1</td><td>Audit et conception</td><td>75 000 000</td></tr>
  <tr><td>Phase 2</td><td>Développement et intégration</td><td>150 000 000</td></tr>
  <tr><td>Phase 3</td><td>Formation et déploiement</td><td>50 000 000</td></tr>
  <tr><td>Phase 4</td><td>Support et maintenance (24 mois)</td><td>75 000 000</td></tr>
</table>
<h2>Article 4 — Obligations des Parties</h2>
<h3>4.1 — Obligations du Prestataire</h3>
<p>Le Prestataire s'engage à :</p>
<ol>
  <li>Exécuter les prestations conformément aux normes techniques en vigueur</li>
  <li>Respecter les délais de livraison convenus à l'annexe A</li>
  <li>Garantir la confidentialité des données traitées</li>
  <li>Fournir un rapport d'avancement mensuel</li>
</ol>
<h3>4.2 — Obligations du Client</h3>
<p>Le Client s'engage à :</p>
<ol>
  <li>Mettre à disposition les ressources nécessaires (accès réseau, locaux, données)</li>
  <li>Désigner un interlocuteur unique pour le suivi du projet</li>
  <li>Procéder au règlement des factures dans un délai de trente (30) jours</li>
</ol>
`;

// ─── Editor Page Component ──────────────────────

interface EditorPageProps {
    documentId?: string;
}

export default function EditorPage({ documentId }: EditorPageProps) {
    const router = useRouter();
    const [meta, setMeta] = useState<DocMeta>(DEMO_META);
    const [sidePanel, setSidePanel] = useState<"comments" | "history" | "properties" | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [versions] = useState(DEMO_VERSIONS);
    const [comments, setComments] = useState(DEMO_COMMENTS);
    const [newComment, setNewComment] = useState("");
    const [editingTitle, setEditingTitle] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Workflow state ────────────────────────
    const [userRole] = useState<UserRole>("org_admin"); // Demo: admin role
    const [approvalModal, setApprovalModal] = useState<{ open: boolean; action: ApprovalAction }>({ open: false, action: "submit_review" });
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [certificateData, setCertificateData] = useState<{
        open: boolean;
        data: {
            certificateNumber: string;
            documentTitle: string;
            category: string;
            sha256Hash: string;
            retentionYears: number;
            archivedAt: number;
            issuedBy: string;
            validUntil: number;
        } | null;
    }>({ open: false, data: null });
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({ show: false, message: "", type: "info" });

    // ─── Toast helper ──────────────────────────
    const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
    }, []);

    // ─── Workflow handlers ─────────────────────
    const handleWorkflowAction = useCallback((action: ApprovalAction) => {
        setApprovalModal({ open: true, action });
    }, []);

    const handleApprovalConfirm = useCallback((data: { assignee?: string; comment: string; deadline?: number }) => {
        const action = approvalModal.action;
        setApprovalModal({ open: false, action: "submit_review" });

        if (action === "submit_review") {
            setMeta((m) => ({ ...m, status: "review" as DocStatus, workflowReason: data.comment }));
            showToast("Document soumis pour révision", "success");
        } else if (action === "approve") {
            setMeta((m) => ({ ...m, status: "approved" as DocStatus }));
            showToast("Document approuvé ✓", "success");
        } else if (action === "reject" || action === "request_changes") {
            setMeta((m) => ({ ...m, status: "draft" as DocStatus, workflowReason: data.comment }));
            showToast(action === "reject" ? "Document rejeté" : "Modifications demandées", "info");
        }
    }, [approvalModal.action, showToast]);

    const handleArchiveConfirm = useCallback((data: { category: string; tags: string[]; sha256Hash: string; retentionYears: number }) => {
        setArchiveModalOpen(false);
        setMeta((m) => ({ ...m, status: "archived" as DocStatus }));

        const now = Date.now();
        const certNumber = `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, "0")}`;
        setCertificateData({
            open: true,
            data: {
                certificateNumber: certNumber,
                documentTitle: meta.title,
                category: data.category,
                sha256Hash: data.sha256Hash,
                retentionYears: data.retentionYears,
                archivedAt: now,
                issuedBy: "Daniel Nguema",
                validUntil: now + data.retentionYears * 365.25 * 24 * 3600 * 1000,
            },
        });
        showToast("Document archivé dans iArchive avec certificat SHA-256", "success");
    }, [meta.title, showToast]);

    // ─── Yjs setup ─────────────────────────────
    // Collaboration disabled by default — enable via NEXT_PUBLIC_ENABLE_COLLAB=true
    const collabEnabled = typeof window !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_COLLAB === "true";
    const ydoc = useMemo(() => new Y.Doc(), []);
    const provider = useMemo(() => {
        if (!collabEnabled) return null;
        try {
            const roomName = `digitalium-doc-${documentId || "demo-1"}`;
            return new WebrtcProvider(roomName, ydoc, {
                signaling: ["wss://signaling.yjs.dev"],
            });
        } catch {
            return null;
        }
    }, [collabEnabled, ydoc, documentId]);

    const currentUser = useMemo(
        () => ({
            name: "Daniel Nguema",
            color: userColor("Daniel Nguema"),
        }),
        []
    );

    // ─── Build extensions ─────────────────────
    const extensions = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exts: any[] = [
            StarterKit.configure({}),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Link.configure({ openOnClick: false }),
            Image,
            TipTapTable.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: "Commencez à rédiger votre document…",
            }),
        ];

        // Only add collaboration extensions if provider is available
        if (provider) {
            exts.push(
                Collaboration.configure({ document: ydoc }),
                CollaborationCursor.configure({
                    provider,
                    user: currentUser,
                })
            );
        }

        return exts;
    }, [ydoc, provider, currentUser]);

    // ─── Tiptap editor ────────────────────────
    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        content: INITIAL_CONTENT,
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[800px] px-16 py-12",
            },
        },
    });

    // ─── Auto-save (every 5s) ─────────────────
    useEffect(() => {
        if (!editor) return;
        autoSaveRef.current = setInterval(() => {
            setIsSaving(true);
            // Simulate save to Convex
            setTimeout(() => {
                setIsSaving(false);
                setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
            }, 400);
        }, 5000);

        return () => {
            if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        };
    }, [editor]);

    // ─── Cleanup Yjs on unmount ───────────────
    useEffect(() => {
        return () => {
            provider?.destroy();
            ydoc.destroy();
        };
    }, [provider, ydoc]);

    // ─── Title editing ────────────────────────
    useEffect(() => {
        if (editingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [editingTitle]);

    const handleTitleSave = useCallback(() => {
        setEditingTitle(false);
    }, []);

    // ─── Manual save ──────────────────────────
    const handleSave = useCallback(() => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
        }, 600);
    }, []);

    // ─── Export ───────────────────────────────
    const handleExportPDF = useCallback(() => {
        window.print();
    }, []);

    // ─── Add comment ─────────────────────────
    const handleAddComment = useCallback(() => {
        if (!newComment.trim()) return;
        setComments((prev) => [
            {
                id: `c-${Date.now()}`,
                userName: "Daniel Nguema",
                text: newComment.trim(),
                createdAt: Date.now(),
                resolved: false,
            },
            ...prev,
        ]);
        setNewComment("");
    }, [newComment]);

    // ─── Status config ───────────────────────
    const statusCfg = STATUS_CFG[meta.status];
    const StatusIcon = statusCfg.icon;

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] max-h-screen">
            {/* ═══ HEADER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 border-b border-white/5 backdrop-blur-sm shrink-0"
            >
                {/* Back */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={() => router.push("/pro/idocument")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    {editingTitle ? (
                        <Input
                            ref={titleInputRef}
                            value={meta.title}
                            onChange={(e) =>
                                setMeta((m) => ({ ...m, title: e.target.value }))
                            }
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                            className="h-8 text-sm font-semibold bg-white/5 border-violet-500/30"
                        />
                    ) : (
                        <button
                            onClick={() => setEditingTitle(true)}
                            className="text-sm font-semibold truncate text-left hover:text-violet-300 transition-colors"
                        >
                            {meta.title}
                        </button>
                    )}
                </div>

                {/* Status badge */}
                <Badge
                    variant="outline"
                    className={`text-[10px] h-5 border ${statusCfg.cls}`}
                >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusCfg.label}
                </Badge>

                {/* Save indicator */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 min-w-[80px]">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
                            <span className="text-violet-400">Sauvegarde…</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">{lastSaved}</span>
                        </>
                    ) : null}
                </div>

                <Separator orientation="vertical" className="h-6 bg-white/10" />

                {/* Action buttons */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-zinc-400 hover:text-white"
                    onClick={handleSave}
                >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Sauvegarder
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-zinc-400 hover:text-white"
                >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    Partager
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-zinc-400 hover:text-white"
                    onClick={() =>
                        setSidePanel((p) => (p === "history" ? null : "history"))
                    }
                >
                    <History className="h-3.5 w-3.5 mr-1" />
                    Historique
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-zinc-400 hover:text-white"
                    onClick={handleExportPDF}
                >
                    <FileDown className="h-3.5 w-3.5 mr-1" />
                    PDF
                </Button>

                <Separator orientation="vertical" className="h-6 bg-white/10" />

                {/* Collaborator avatars */}
                <div className="flex items-center -space-x-2">
                    {meta.collaborators.slice(0, 4).map((name) => (
                        <div
                            key={name}
                            className="h-7 w-7 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: userColor(name) }}
                            title={name}
                        >
                            {name.split(" ").map((n) => n[0]).join("")}
                        </div>
                    ))}
                    {meta.collaborators.length > 4 && (
                        <div className="h-7 w-7 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                            +{meta.collaborators.length - 4}
                        </div>
                    )}
                </div>

                {/* Overflow menu */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-white"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </motion.div>

            {/* ═══ WORKFLOW STATUS BAR ═══ */}
            <WorkflowStatusBar
                status={meta.status}
                userRole={userRole}
                onSubmitForReview={() => handleWorkflowAction("submit_review")}
                onApprove={() => handleWorkflowAction("approve")}
                onReject={() => handleWorkflowAction("reject")}
                onRequestChanges={() => handleWorkflowAction("request_changes")}
                onArchive={() => setArchiveModalOpen(true)}
            />

            {/* ═══ TOOLBAR ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="px-4 py-2 bg-zinc-950/40 border-b border-white/5 shrink-0"
            >
                <EditorToolbar editor={editor} />
            </motion.div>

            {/* ═══ MAIN AREA ═══ */}
            <div className="flex flex-1 overflow-hidden">
                {/* ── A4 editing zone ── */}
                <div className="flex-1 overflow-auto bg-zinc-800/30 py-8 print:bg-white print:py-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto bg-white shadow-2xl shadow-black/30 print:shadow-none"
                        style={{
                            width: "210mm",
                            minHeight: "297mm",
                            maxWidth: "100%",
                        }}
                    >
                        <EditorContent
                            editor={editor}
                            className="editor-a4-content [&_.ProseMirror]:text-zinc-900 [&_.ProseMirror]:min-h-[297mm] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:text-zinc-900 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-zinc-800 [&_.ProseMirror_h2]:border-b [&_.ProseMirror_h2]:border-zinc-200 [&_.ProseMirror_h2]:pb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-medium [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-zinc-700 [&_.ProseMirror_p]:text-sm [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:text-zinc-700 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_li]:text-sm [&_.ProseMirror_li]:text-zinc-700 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:mb-4 [&_.ProseMirror_th]:bg-zinc-100 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-zinc-300 [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:text-xs [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-zinc-300 [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2 [&_.ProseMirror_td]:text-xs [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.collaboration-cursor__caret]:relative [&_.collaboration-cursor__caret]:border-l-2 [&_.collaboration-cursor__label]:absolute [&_.collaboration-cursor__label]:top-[-1.4em] [&_.collaboration-cursor__label]:left-[-1px] [&_.collaboration-cursor__label]:text-[10px] [&_.collaboration-cursor__label]:font-medium [&_.collaboration-cursor__label]:px-1 [&_.collaboration-cursor__label]:py-0.5 [&_.collaboration-cursor__label]:rounded [&_.collaboration-cursor__label]:whitespace-nowrap [&_.collaboration-cursor__label]:text-white [&_.ProseMirror_.is-empty]:before:text-zinc-400 [&_.ProseMirror_.is-empty]:before:float-left [&_.ProseMirror_.is-empty]:before:pointer-events-none"
                        />
                    </motion.div>
                </div>

                {/* ── Side panel ── */}
                <AnimatePresence>
                    {sidePanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="border-l border-white/5 bg-zinc-900/80 backdrop-blur-sm overflow-hidden shrink-0 flex flex-col"
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    {sidePanel === "comments" && (
                                        <>
                                            <MessageSquare className="h-4 w-4 text-cyan-400" />
                                            <span className="text-sm font-medium">
                                                Commentaires
                                            </span>
                                        </>
                                    )}
                                    {sidePanel === "history" && (
                                        <>
                                            <Clock className="h-4 w-4 text-amber-400" />
                                            <span className="text-sm font-medium">
                                                Historique
                                            </span>
                                        </>
                                    )}
                                    {sidePanel === "properties" && (
                                        <>
                                            <Settings2 className="h-4 w-4 text-violet-400" />
                                            <span className="text-sm font-medium">
                                                Propriétés
                                            </span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-zinc-400 hover:text-white"
                                    onClick={() => setSidePanel(null)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Panel tabs */}
                            <div className="flex border-b border-white/5">
                                {(
                                    [
                                        {
                                            key: "comments" as const,
                                            icon: MessageSquare,
                                            label: "Commentaires",
                                        },
                                        {
                                            key: "history" as const,
                                            icon: Clock,
                                            label: "Historique",
                                        },
                                        {
                                            key: "properties" as const,
                                            icon: Settings2,
                                            label: "Propriétés",
                                        },
                                    ] as const
                                ).map(({ key, icon: Icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSidePanel(key)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] transition-colors border-b-2 ${sidePanel === key
                                            ? "border-violet-500 text-violet-300"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Panel content */}
                            <div className="flex-1 overflow-auto p-4">
                                {sidePanel === "comments" && (
                                    <CommentsPanel
                                        comments={comments}
                                        newComment={newComment}
                                        onNewCommentChange={setNewComment}
                                        onAddComment={handleAddComment}
                                        onResolve={(id) =>
                                            setComments((prev) =>
                                                prev.map((c) =>
                                                    c.id === id
                                                        ? { ...c, resolved: true }
                                                        : c
                                                )
                                            )
                                        }
                                    />
                                )}
                                {sidePanel === "history" && (
                                    <HistoryPanel versions={versions} />
                                )}
                                {sidePanel === "properties" && (
                                    <PropertiesPanel meta={meta} />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ BOTTOM BAR ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-t border-white/5 text-[11px] text-zinc-500 shrink-0"
            >
                <div className="flex items-center gap-4">
                    <span>
                        Version {meta.version}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meta.collaborators.length} collaborateur
                        {meta.collaborators.length > 1 ? "s" : ""} en ligne
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() =>
                            setSidePanel((p) =>
                                p === "comments" ? null : "comments"
                            )
                        }
                        className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                    >
                        <MessageSquare className="h-3 w-3" />
                        {comments.filter((c) => !c.resolved).length} commentaire
                        {comments.filter((c) => !c.resolved).length !== 1 ? "s" : ""}
                    </button>
                    <Separator
                        orientation="vertical"
                        className="h-3 bg-white/10"
                    />
                    <button
                        onClick={() =>
                            setSidePanel((p) =>
                                p === "properties" ? null : "properties"
                            )
                        }
                        className="flex items-center gap-1 hover:text-violet-400 transition-colors"
                    >
                        <Settings2 className="h-3 w-3" />
                        Propriétés
                    </button>
                </div>
            </motion.div>

            {/* ═══ WORKFLOW MODALS ═══ */}
            <ApprovalModal
                open={approvalModal.open}
                action={approvalModal.action}
                onClose={() => setApprovalModal((s) => ({ ...s, open: false }))}
                onConfirm={handleApprovalConfirm}
            />
            <ArchiveModal
                open={archiveModalOpen}
                documentTitle={meta.title}
                onClose={() => setArchiveModalOpen(false)}
                onConfirm={handleArchiveConfirm}
            />
            <ArchiveCertificate
                open={certificateData.open}
                certificate={certificateData.data}
                onClose={() => setCertificateData({ open: false, data: null })}
            />

            {/* ═══ TOAST ═══ */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 40, x: "-50%" }}
                        className={`fixed bottom-6 left-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl border backdrop-blur-sm ${toast.type === "success"
                            ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-300"
                            : toast.type === "error"
                                ? "bg-red-500/15 border-red-500/20 text-red-300"
                                : "bg-blue-500/15 border-blue-500/20 text-blue-300"
                            }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Sub-components ─────────────────────────────

function CommentsPanel({
    comments,
    newComment,
    onNewCommentChange,
    onAddComment,
    onResolve,
}: {
    comments: Comment[];
    newComment: string;
    onNewCommentChange: (v: string) => void;
    onAddComment: () => void;
    onResolve: (id: string) => void;
}) {
    return (
        <div className="space-y-4">
            {/* Add comment */}
            <div className="flex gap-2">
                <Input
                    value={newComment}
                    onChange={(e) => onNewCommentChange(e.target.value)}
                    placeholder="Ajouter un commentaire…"
                    className="h-8 text-xs bg-white/5 border-white/10 flex-1"
                    onKeyDown={(e) => e.key === "Enter" && onAddComment()}
                />
                <Button
                    size="icon"
                    className="h-8 w-8 bg-cyan-600 hover:bg-cyan-700"
                    onClick={onAddComment}
                    disabled={!newComment.trim()}
                >
                    <Send className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Comment list */}
            {comments.map((c) => (
                <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${c.resolved
                        ? "bg-zinc-800/30 border-white/5 opacity-60"
                        : "bg-zinc-800/60 border-cyan-500/10"
                        }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-cyan-300">
                            {c.userName}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                            {formatTimeAgo(c.createdAt)}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed mb-2">
                        {c.text}
                    </p>
                    {!c.resolved && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-zinc-500 hover:text-emerald-400"
                            onClick={() => onResolve(c.id)}
                        >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Résoudre
                        </Button>
                    )}
                    {c.resolved && (
                        <Badge
                            variant="outline"
                            className="text-[9px] h-4 border-emerald-500/20 text-emerald-400"
                        >
                            Résolu
                        </Badge>
                    )}
                </motion.div>
            ))}

            {comments.length === 0 && (
                <div className="text-center text-xs text-zinc-500 py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
                    Aucun commentaire
                </div>
            )}
        </div>
    );
}

function HistoryPanel({ versions }: { versions: VersionEntry[] }) {
    return (
        <div className="space-y-3">
            {versions.map((v, i) => (
                <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-6"
                >
                    {/* Timeline dot + line */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                        <div
                            className={`h-3 w-3 rounded-full border-2 ${i === 0
                                ? "bg-amber-500 border-amber-400"
                                : "bg-zinc-700 border-zinc-600"
                                }`}
                        />
                        {i < versions.length - 1 && (
                            <div className="flex-1 w-px bg-zinc-700 mt-1" />
                        )}
                    </div>

                    <Card className="p-3 bg-zinc-800/60 border-white/5">
                        <div className="flex items-center justify-between mb-1">
                            <Badge
                                variant="outline"
                                className="text-[10px] h-4 border-amber-500/20 text-amber-400"
                            >
                                v{v.version}
                            </Badge>
                            <span className="text-[10px] text-zinc-500">
                                {formatTimeAgo(v.createdAt)}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-300 mb-1">
                            {v.description}
                        </p>
                        <p className="text-[10px] text-zinc-500 mb-2">
                            Par {v.editedBy}
                        </p>
                        {i > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-zinc-500 hover:text-amber-400"
                            >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restaurer
                            </Button>
                        )}
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

function PropertiesPanel({ meta }: { meta: DocMeta }) {
    const statusCfg = STATUS_CFG[meta.status];

    return (
        <div className="space-y-5">
            {/* Status */}
            <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Statut
                </label>
                <Badge
                    variant="outline"
                    className={`text-xs border ${statusCfg.cls}`}
                >
                    {statusCfg.label}
                </Badge>
            </div>

            {/* Tags */}
            <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {meta.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] bg-violet-500/10 text-violet-300 border-0"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Informations
                </label>
                {([
                    ["Auteur", meta.author],
                    ["Version", `v${meta.version}`],
                    [
                        "Collaborateurs",
                        `${meta.collaborators.length} personne${meta.collaborators.length > 1 ? "s" : ""}`,
                    ],
                    ["ID", meta.id],
                ] as const).map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between text-xs"
                    >
                        <span className="text-zinc-500">{label}</span>
                        <span className="text-zinc-300">{value}</span>
                    </div>
                ))}
            </div>

            {/* Collaborators */}
            <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Collaborateurs
                </label>
                <div className="space-y-2">
                    {meta.collaborators.map((name) => (
                        <div
                            key={name}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                style={{
                                    backgroundColor: userColor(name),
                                }}
                            >
                                {name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </div>
                            <span className="text-xs text-zinc-300">
                                {name}
                            </span>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Utils ──────────────────────────────────────

function formatTimeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}
