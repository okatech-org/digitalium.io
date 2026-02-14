"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Finder-Style Signature Explorer
// Dossiers de statut + 3 modes (grille/liste/colonnes) · DnD limité
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    PenTool,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Calendar,
    Send,
    Inbox,
    Eye,
    X,
    FolderOpen,
    Folder,
} from "lucide-react";
import SignatureRequestModal from "@/components/modules/isignature/SignatureRequestModal";
import { toast } from "sonner";

// File-manager Finder components
import {
    ViewModeToggle,
    BreadcrumbPath,
    FinderGridView,
    FinderListView,
    FinderColumnView,
} from "@/components/modules/file-manager";
import type {
    ViewMode,
    FileManagerFolder,
    FileManagerFile,
    DragMoveEvent,
    ListColumn,
} from "@/components/modules/file-manager";

// ─── Status folder config ──────────────────────────────────────

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: React.ElementType;
    gradient: string;
    color: string;
    bg: string;
    border: string;
    ring: string;
    chartColor: string;
}> = {
    to_sign: {
        label: "À signer", icon: PenTool,
        gradient: "from-amber-600 to-orange-500", color: "text-amber-400",
        bg: "bg-amber-500/10", border: "border-amber-500/20", ring: "ring-amber-500/20",
        chartColor: "#f59e0b",
    },
    drafts: {
        label: "Brouillons", icon: FileText,
        gradient: "from-zinc-600 to-zinc-500", color: "text-zinc-400",
        bg: "bg-zinc-500/10", border: "border-zinc-500/20", ring: "ring-zinc-500/20",
        chartColor: "#71717a",
    },
    sent: {
        label: "En attente", icon: Clock,
        gradient: "from-blue-600 to-cyan-500", color: "text-blue-400",
        bg: "bg-blue-500/10", border: "border-blue-500/20", ring: "ring-blue-500/20",
        chartColor: "#3b82f6",
    },
    completed: {
        label: "Signés", icon: CheckCircle2,
        gradient: "from-emerald-600 to-teal-500", color: "text-emerald-400",
        bg: "bg-emerald-500/10", border: "border-emerald-500/20", ring: "ring-emerald-500/20",
        chartColor: "#10b981",
    },
    declined: {
        label: "Refusés", icon: XCircle,
        gradient: "from-red-600 to-rose-500", color: "text-red-400",
        bg: "bg-red-500/10", border: "border-red-500/20", ring: "ring-red-500/20",
        chartColor: "#ef4444",
    },
};

// ─── Types ──────────────────────────────────────────────────────

interface SignatureRequest {
    id: string;
    title: string;
    requester: { name: string; avatar: string };
    requestedAt: number;
    deadline?: number;
    signers: { name: string; email: string; status: "pending" | "signed" | "declined" }[];
    status: "pending" | "in_progress" | "completed" | "cancelled" | "draft" | "declined";
    folderId: string;
}

// ─── Mock data ──────────────────────────────────────────────────

const INITIAL_REQUESTS: SignatureRequest[] = [
    // À signer
    {
        id: "sig-1",
        title: "Contrat prestation SOGARA — Q2 2026",
        requester: { name: "Daniel Nguema", avatar: "DN" },
        requestedAt: Date.now() - 2 * 3600 * 1000,
        deadline: Date.now() + 3 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "pending" },
            { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", status: "signed" },
        ],
        status: "in_progress",
        folderId: "to_sign",
    },
    {
        id: "sig-2",
        title: "Avenant bail Immeuble Triomphal 2026",
        requester: { name: "Marie Obame", avatar: "MO" },
        requestedAt: Date.now() - 24 * 3600 * 1000,
        deadline: Date.now() + 7 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "pending" },
        ],
        status: "pending",
        folderId: "to_sign",
    },
    {
        id: "sig-3",
        title: "Procuration générale — Mission Afrique du Sud",
        requester: { name: "Aimée Gondjout", avatar: "AG" },
        requestedAt: Date.now() - 3 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "pending" },
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "pending" },
        ],
        status: "pending",
        folderId: "to_sign",
    },
    // Brouillon
    {
        id: "sig-draft-1",
        title: "Protocole d'accord — Extension bureaux",
        requester: { name: "Ornella Doumba", avatar: "OD" },
        requestedAt: Date.now() - 12 * 3600 * 1000,
        signers: [
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "pending" },
        ],
        status: "draft",
        folderId: "drafts",
    },
    // En attente (envoyées)
    {
        id: "sig-4",
        title: "NDA — Partenariat COMILOG",
        requester: { name: "Ornella Doumba", avatar: "OD" },
        requestedAt: Date.now() - 4 * 3600 * 1000,
        deadline: Date.now() + 5 * 24 * 3600 * 1000,
        signers: [
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "signed" },
            { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", status: "pending" },
        ],
        status: "in_progress",
        folderId: "sent",
    },
    {
        id: "sig-5",
        title: "Attestation de conformité — Audit 2025",
        requester: { name: "Ornella Doumba", avatar: "OD" },
        requestedAt: Date.now() - 2 * 24 * 3600 * 1000,
        signers: [
            { name: "Marie Obame", email: "m.obame@digitalium.io", status: "pending" },
            { name: "Aimée Gondjout", email: "a.gondjout@digitalium.io", status: "pending" },
        ],
        status: "pending",
        folderId: "sent",
    },
    // Signés
    {
        id: "sig-6",
        title: "Contrat CDI — Recrutement IT Senior",
        requester: { name: "Daniel Nguema", avatar: "DN" },
        requestedAt: Date.now() - 10 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "signed" },
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "signed" },
        ],
        status: "completed",
        folderId: "completed",
    },
    {
        id: "sig-7",
        title: "Convention de stage — 2026-S1",
        requester: { name: "Marie Obame", avatar: "MO" },
        requestedAt: Date.now() - 15 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "signed" },
            { name: "Marie Obame", email: "m.obame@digitalium.io", status: "signed" },
            { name: "Claude Mboumba", email: "c.mboumba@digitalium.io", status: "signed" },
        ],
        status: "completed",
        folderId: "completed",
    },
    {
        id: "sig-8",
        title: "Devis accepté — Infrastructure Cloud",
        requester: { name: "Aimée Gondjout", avatar: "AG" },
        requestedAt: Date.now() - 20 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "signed" },
        ],
        status: "completed",
        folderId: "completed",
    },
    // Refusé
    {
        id: "sig-9",
        title: "Contrat sous-traitance — IT Consulting",
        requester: { name: "Claude Mboumba", avatar: "CM" },
        requestedAt: Date.now() - 5 * 24 * 3600 * 1000,
        signers: [
            { name: "Ornella Doumba", email: "o.doumba@digitalium.io", status: "declined" },
            { name: "Daniel Nguema", email: "d.nguema@digitalium.io", status: "signed" },
        ],
        status: "declined",
        folderId: "declined",
    },
];

// ─── Helpers ────────────────────────────────────────────────

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Il y a moins d'1h";
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}

function daysUntil(ts: number): string {
    const days = Math.ceil((ts - Date.now()) / (24 * 3600 * 1000));
    if (days <= 0) return "Expiré";
    if (days === 1) return "Demain";
    return `${days} jours`;
}

function requestToFile(req: SignatureRequest): FileManagerFile {
    const signedCount = req.signers.filter((s) => s.status === "signed").length;
    const totalSigners = req.signers.length;
    return {
        id: req.id,
        name: req.title,
        type: "signature",
        size: `${signedCount}/${totalSigners}`,
        date: timeAgo(req.requestedAt),
        folderId: req.folderId,
        metadata: {
            status: req.status,
            requesterName: req.requester.name,
            requesterAvatar: req.requester.avatar,
            deadline: req.deadline,
            signers: req.signers,
            signedCount,
            totalSigners,
            requestedAt: req.requestedAt,
        },
    };
}

// ─── Animations ─────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
};

// ─── List columns ───────────────────────────────────────────

const SIG_COLUMNS: ListColumn[] = [
    { key: "name", label: "Document", sortable: true, width: "30%" },
    {
        key: "requester", label: "Demandeur", width: "15%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            const name = meta?.requesterName as string | undefined;
            const avatar = meta?.requesterAvatar as string | undefined;
            if (!name) return <span className="text-muted-foreground">—</span>;
            return (
                <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                        <span className="text-[7px] text-violet-300 font-bold">{avatar}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{name}</span>
                </div>
            );
        },
    },
    {
        key: "deadline", label: "Échéance", width: "12%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            const deadline = meta?.deadline as number | undefined;
            if (!deadline) return <span className="text-muted-foreground text-xs">—</span>;
            const isUrgent = deadline - Date.now() < 2 * 24 * 3600 * 1000;
            return (
                <span className={`text-xs flex items-center gap-1 ${isUrgent ? "text-red-400" : "text-muted-foreground"}`}>
                    <Calendar className="h-2.5 w-2.5" />
                    {daysUntil(deadline)}
                </span>
            );
        },
    },
    {
        key: "signers", label: "Signataires", width: "15%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            const signers = meta?.signers as { name: string; status: string }[] | undefined;
            if (!signers) return <span className="text-muted-foreground">—</span>;
            return (
                <div className="flex items-center gap-0.5">
                    {signers.slice(0, 3).map((s, i) => (
                        <div
                            key={i}
                            className={`h-5 w-5 rounded-full border flex items-center justify-center text-[7px] font-bold ${s.status === "signed" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                                    s.status === "declined" ? "bg-red-500/15 border-red-500/30 text-red-400" :
                                        "bg-zinc-800 border-white/10 text-zinc-400"
                                }`}
                            title={`${s.name} — ${s.status}`}
                        >
                            {s.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                    ))}
                    {signers.length > 3 && (
                        <span className="text-[9px] text-zinc-500 ml-0.5">+{signers.length - 3}</span>
                    )}
                </div>
            );
        },
    },
    {
        key: "progress", label: "Progression", sortable: true, width: "12%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            const signedCount = (meta?.signedCount as number) ?? 0;
            const totalSigners = (meta?.totalSigners as number) ?? 1;
            const pct = Math.round((signedCount / totalSigners) * 100);
            return (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-mono w-7">{signedCount}/{totalSigners}</span>
                    <div className="h-1 w-12 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${signedCount === totalSigners ? "bg-emerald-500" : "bg-violet-500"}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        key: "status", label: "Statut", width: "10%",
        render: (item) => {
            const meta = item.metadata as Record<string, unknown> | undefined;
            const status = meta?.status as string | undefined;
            const cfgMap: Record<string, { label: string; cls: string }> = {
                pending: { label: "En attente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                in_progress: { label: "En cours", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                completed: { label: "Signé", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
                draft: { label: "Brouillon", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
                declined: { label: "Refusé", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
                cancelled: { label: "Annulé", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
            };
            const cfg = cfgMap[status ?? ""] ?? cfgMap.pending;
            return (
                <Badge className={`text-[10px] h-5 border ${cfg.cls}`}>
                    {cfg.label}
                </Badge>
            );
        },
    },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ISignaturePage() {
    const router = useRouter();

    // ─── State ──────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [requests, setRequests] = useState<SignatureRequest[]>(INITIAL_REQUESTS);
    const [showModal, setShowModal] = useState(false);

    // ─── Folders (status-based, all system) ─────────────────────
    const folders: FileManagerFolder[] = useMemo(() => {
        return Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
            id: key,
            name: cfg.label,
            parentFolderId: null,
            tags: [],
            fileCount: requests.filter((r) => r.folderId === key).length,
            updatedAt: "Maintenant",
            createdBy: "Système",
            isSystem: true,
            metadata: { statusKey: key },
        }));
    }, [requests]);

    // ─── KPI ────────────────────────────────────────────────────
    const toSignCount = requests.filter((r) => r.folderId === "to_sign").length;
    const sentCount = requests.filter((r) => r.folderId === "sent").length;
    const completedCount = requests.filter((r) => r.folderId === "completed").length;

    // ─── Breadcrumb path ────────────────────────────────────────
    const breadcrumbPath = useMemo(() => {
        if (!currentFolderId) return [];
        const folder = folders.find((f) => f.id === currentFolderId);
        if (!folder) return [];
        return [{ id: folder.id, name: folder.name }];
    }, [currentFolderId, folders]);

    // ─── Current view data ──────────────────────────────────────
    const currentFolders = useMemo(() => {
        if (currentFolderId !== null) return []; // Status folders have no sub-folders
        return folders;
    }, [folders, currentFolderId]);

    const currentFiles = useMemo(() => {
        if (currentFolderId === null) return [];
        let reqs = requests.filter((r) => r.folderId === currentFolderId);
        if (search) {
            const q = search.toLowerCase();
            reqs = reqs.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.requester.name.toLowerCase().includes(q) ||
                    r.signers.some((s) => s.name.toLowerCase().includes(q))
            );
        }
        reqs.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case "name": cmp = a.title.localeCompare(b.title, "fr"); break;
                case "progress": {
                    const pa = a.signers.filter((s) => s.status === "signed").length / a.signers.length;
                    const pb = b.signers.filter((s) => s.status === "signed").length / b.signers.length;
                    cmp = pa - pb;
                    break;
                }
                default: cmp = a.requestedAt - b.requestedAt;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });
        return reqs;
    }, [requests, currentFolderId, search, sortBy, sortDir]);

    const filesAsManagerFiles = useMemo(() => currentFiles.map(requestToFile), [currentFiles]);

    // ─── Handlers ───────────────────────────────────────────────

    const handleOpenFolder = useCallback((folderId: string) => {
        setCurrentFolderId(folderId);
    }, []);

    const handleNavigate = useCallback((folderId: string | null) => {
        setCurrentFolderId(folderId);
    }, []);

    const handleMoveItem = useCallback((event: DragMoveEvent) => {
        const { itemId, itemType, targetFolderId } = event;
        // Only allow moving requests to "drafts" folder (reporter la demande)
        if (itemType === "file" && targetFolderId === "drafts") {
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === itemId ? { ...r, folderId: "drafts", status: "draft" as const } : r
                )
            );
        }
    }, []);

    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDir("asc");
        }
    }, [sortBy]);

    // Navigate to detail page on file click
    const handleFileClick = useCallback((fileId: string) => {
        router.push(`/pro/isignature/${fileId}`);
    }, [router]);

    // ─── Folder contents for column view ────────────────────────
    const getFolderContents = useCallback(
        (folderId: string) => {
            const subFiles = requests.filter((r) => r.folderId === folderId).map(requestToFile);
            return { folders: [], files: subFiles };
        },
        [requests]
    );

    // ─── Render callbacks ───────────────────────────────────────

    const renderFolderCard = useCallback(
        (folder: FileManagerFolder, isDragOver: boolean) => {
            const statusKey = (folder.metadata as Record<string, unknown>)?.statusKey as string | undefined;
            const cfg = statusKey ? STATUS_CONFIG[statusKey] : null;
            const StatusIcon = cfg?.icon ?? Folder;

            return (
                <Card className={`glass overflow-hidden transition-all ${isDragOver
                    ? "ring-2 ring-violet-500/50 bg-violet-500/5 scale-[1.02]"
                    : cfg ? `border ${cfg.border} ${cfg.bg} hover:ring-1 ${cfg.ring}` : "border-white/5 hover:border-white/10"
                    }`}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cfg?.gradient ?? "from-violet-600 to-indigo-500"}`}>
                                <StatusIcon className="h-4.5 w-4.5 text-white" />
                            </div>
                            <span className={`text-xl font-bold ${cfg?.color ?? "text-foreground"}`}>
                                {folder.fileCount}
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold mb-0.5">{folder.name}</h3>
                        <p className="text-[11px] text-muted-foreground">
                            {folder.fileCount} demande{folder.fileCount > 1 ? "s" : ""}
                        </p>
                    </CardContent>
                </Card>
            );
        },
        []
    );

    const renderFileCard = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const requesterAvatar = meta.requesterAvatar as string;
            const requesterName = meta.requesterName as string;
            const deadline = meta.deadline as number | undefined;
            const signers = meta.signers as { name: string; status: string }[];
            const signedCount = meta.signedCount as number;
            const totalSigners = meta.totalSigners as number;
            const status = meta.status as string;
            const isUrgent = deadline ? deadline - Date.now() < 2 * 24 * 3600 * 1000 : false;

            const statusCfgMap: Record<string, { label: string; cls: string }> = {
                pending: { label: "En attente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                in_progress: { label: "En cours", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                completed: { label: "Signé", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
                draft: { label: "Brouillon", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
                declined: { label: "Refusé", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
                cancelled: { label: "Annulé", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
            };
            const stCfg = statusCfgMap[status] ?? statusCfgMap.pending;

            return (
                <Card
                    className="glass border-white/5 overflow-hidden cursor-pointer hover:border-white/10 transition-all group"
                    onClick={() => handleFileClick(file.id)}
                >
                    <CardContent className="p-4 space-y-3">
                        {/* Status + deadline */}
                        <div className="flex items-center justify-between">
                            <Badge className={`text-[10px] h-5 border ${stCfg.cls}`}>
                                {stCfg.label}
                            </Badge>
                            {deadline && (
                                <span className={`text-[10px] flex items-center gap-1 ${isUrgent ? "text-red-400" : "text-muted-foreground"}`}>
                                    <Calendar className="h-2.5 w-2.5" />
                                    {daysUntil(deadline)}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                            {file.name}
                        </h3>

                        {/* Requester */}
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                                <span className="text-[7px] text-violet-300 font-bold">{requesterAvatar}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{requesterName}</span>
                        </div>

                        {/* Signers + progress */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <div className="flex items-center gap-0.5">
                                {signers.slice(0, 3).map((s, i) => (
                                    <div
                                        key={i}
                                        className={`h-5 w-5 rounded-full border flex items-center justify-center text-[7px] font-bold ${s.status === "signed" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                                                s.status === "declined" ? "bg-red-500/15 border-red-500/30 text-red-400" :
                                                    "bg-zinc-800 border-white/10 text-zinc-400"
                                            }`}
                                    >
                                        {s.name.split(" ").map((n) => n[0]).join("")}
                                    </div>
                                ))}
                                {signers.length > 3 && (
                                    <span className="text-[9px] text-zinc-500 ml-0.5">+{signers.length - 3}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400 font-mono">{signedCount}/{totalSigners}</span>
                                <div className="h-1 w-10 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${signedCount === totalSigners ? "bg-emerald-500" : "bg-violet-500"}`}
                                        style={{ width: `${(signedCount / totalSigners) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        },
        [handleFileClick]
    );

    const renderFilePreview = useCallback(
        (file: FileManagerFile) => {
            const meta = file.metadata as Record<string, unknown>;
            const requesterAvatar = meta.requesterAvatar as string;
            const requesterName = meta.requesterName as string;
            const deadline = meta.deadline as number | undefined;
            const signers = meta.signers as { name: string; email: string; status: string }[];
            const signedCount = meta.signedCount as number;
            const totalSigners = meta.totalSigners as number;
            const status = meta.status as string;

            return (
                <div className="p-4 space-y-4">
                    <div className="flex flex-col items-center py-6">
                        <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                            <PenTool className="h-7 w-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-center px-2">{file.name}</p>
                        <Badge className="text-[10px] h-5 border mt-2 bg-violet-500/15 text-violet-400 border-violet-500/20">
                            {status === "completed" ? "Signé" : status === "draft" ? "Brouillon" : "En cours"}
                        </Badge>
                    </div>
                    <div className="space-y-2 px-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Demandeur</span>
                            <div className="flex items-center gap-1">
                                <div className="h-4 w-4 rounded-full bg-violet-500/15 flex items-center justify-center">
                                    <span className="text-[6px] text-violet-300 font-bold">{requesterAvatar}</span>
                                </div>
                                <span>{requesterName}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Demandé</span>
                            <span>{file.date}</span>
                        </div>
                        {deadline && (
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Échéance</span>
                                <span>{daysUntil(deadline)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-mono">{signedCount}/{totalSigners}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 mt-2">
                            <span className="text-[10px] text-muted-foreground block mb-2">Signataires</span>
                            <div className="space-y-1.5">
                                {signers.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center text-[7px] font-bold ${s.status === "signed" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                                                s.status === "declined" ? "bg-red-500/15 border-red-500/30 text-red-400" :
                                                    "bg-zinc-800 border-white/10 text-zinc-400"
                                            }`}>
                                            {s.name.split(" ").map((n) => n[0]).join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] truncate block">{s.name}</span>
                                        </div>
                                        {s.status === "signed" && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}
                                        {s.status === "declined" && <XCircle className="h-3 w-3 text-red-400 shrink-0" />}
                                        {s.status === "pending" && <Clock className="h-3 w-3 text-amber-400 shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-3">
                            <Button
                                size="sm"
                                className="w-full text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                                onClick={() => handleFileClick(file.id)}
                            >
                                <Eye className="h-3 w-3 mr-1.5" />
                                Voir le détail
                            </Button>
                        </div>
                    </div>
                </div>
            );
        },
        [handleFileClick]
    );

    const renderFolderIcon = useCallback(
        (folder: FileManagerFolder) => {
            const statusKey = (folder.metadata as Record<string, unknown>)?.statusKey as string | undefined;
            const cfg = statusKey ? STATUS_CONFIG[statusKey] : null;
            if (cfg) {
                const StatusIcon = cfg.icon;
                return (
                    <div className="h-4 w-4 rounded-sm flex items-center justify-center" style={{ color: cfg.chartColor }}>
                        <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                    </div>
                );
            }
            return <Folder className="h-3.5 w-3.5 text-violet-400 shrink-0" />;
        },
        []
    );

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* ═══ HEADER ═══ */}
            <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">iSignature</h1>
                        <p className="text-xs text-muted-foreground">
                            Validation électronique avec traçabilité complète
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Demander une signature
                    </Button>
                </div>
            </motion.div>

            {/* ═══ KPI STRIP ═══ */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                {[
                    { label: "À signer", value: toSignCount, icon: Inbox, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "En attente", value: sentCount, icon: Send, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Complétés", value: completedCount, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                        <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-2 mb-1">
                                <StatIcon className={`h-3.5 w-3.5 ${stat.color}`} />
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-lg font-bold">{stat.value}</p>
                        </div>
                    );
                })}
            </motion.div>

            {/* ═══ FINDER SECTION ═══ */}

            {/* Finder Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-violet-400" />
                    <h2 className="text-sm font-semibold">Demandes de signature</h2>
                </div>
                <ViewModeToggle
                    value={viewMode}
                    onChange={setViewMode}
                    storageKey="digitalium-isignature-view"
                />
            </motion.div>

            {/* Finder Toolbar */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    placeholder="Rechercher par titre, demandeur, signataire…"
                                    className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>
                            {search && (
                                <>
                                    <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[11px] gap-1.5 text-red-400 hover:text-red-300"
                                        onClick={() => setSearch("")}
                                    >
                                        <X className="h-3 w-3" /> Effacer
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Breadcrumb */}
            <BreadcrumbPath
                path={breadcrumbPath}
                onNavigate={handleNavigate}
                rootLabel="Signatures"
                rootIcon={PenTool}
            />

            {/* Finder Content */}
            <AnimatePresence mode="wait">
                {viewMode === "grid" && (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FinderGridView
                            folders={currentFolders}
                            files={filesAsManagerFiles}
                            onOpenFolder={handleOpenFolder}
                            onMoveItem={handleMoveItem}
                            renderFolderCard={renderFolderCard}
                            renderFileCard={renderFileCard}
                            emptyState={
                                <div className="flex flex-col items-center py-16 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                                        <PenTool className="h-8 w-8 text-violet-400/60" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">Aucune demande</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Aucune demande de signature dans ce dossier.
                                    </p>
                                </div>
                            }
                        />
                    </motion.div>
                )}

                {viewMode === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FinderListView
                            folders={currentFolders}
                            files={filesAsManagerFiles}
                            columns={SIG_COLUMNS}
                            onOpenFolder={handleOpenFolder}
                            onMoveItem={handleMoveItem}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={handleSort}
                            renderFolderIcon={renderFolderIcon}
                            renderFileIcon={() => (
                                <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                                    <PenTool className="h-3 w-3 text-violet-400" />
                                </div>
                            )}
                            emptyState={
                                <div className="flex flex-col items-center py-16 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                                        <PenTool className="h-8 w-8 text-violet-400/60" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">Aucune demande</h3>
                                    <p className="text-sm text-muted-foreground">Aucune demande de signature dans ce dossier.</p>
                                </div>
                            }
                        />
                    </motion.div>
                )}

                {viewMode === "column" && (
                    <motion.div
                        key="column"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FinderColumnView
                            rootFolders={folders}
                            rootFiles={[]}
                            getFolderContents={getFolderContents}
                            onMoveItem={handleMoveItem}
                            renderFilePreview={renderFilePreview}
                            renderFolderIcon={renderFolderIcon}
                            renderFileIcon={() => (
                                <PenTool className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ MODAL ═══ */}
            <SignatureRequestModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={(data) => {
                    toast.success(`Demande envoyée à ${data.signers.length} signataire(s)`);
                }}
                documents={[
                    { id: "d1", title: "Contrat prestation SOGARA — Q2 2026" },
                    { id: "d2", title: "Convention collective 2026" },
                    { id: "d3", title: "NDA — Partenariat COMILOG" },
                    { id: "d4", title: "Bail commercial — Immeuble Triomphal" },
                ]}
            />
        </motion.div>
    );
}
