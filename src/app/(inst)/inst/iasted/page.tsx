"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: iAsted Institutionnel
// Assistant IA avec chat fonctionnel local
// ═══════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, MessageSquare, FileSearch, Brain, Sparkles,
    ArrowRight, Zap, Loader2, User, Trash2, Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

/* ─── Types ────────────────────────────────────── */

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
}

/* ─── AI Response Simulator ────────────────────── */

const AI_RESPONSES: Record<string, string> = {
    "document": "J'ai analysé votre demande concernant les documents. Dans votre espace iDocument, vous disposez actuellement de plusieurs documents en cours. Souhaitez-vous que je génère un résumé détaillé ou que je recherche un document spécifique ?",
    "archive": "Concernant l'archivage, votre institution respecte les normes OHADA de conservation. Les archives légales sont conservées 10 ans minimum, les archives fiscales 30 ans. Souhaitez-vous vérifier la conformité d'un dossier spécifique ?",
    "signature": "Votre espace iSignature est actif. Je peux vous aider à vérifier l'état des circuits de signature en cours, analyser les signatures en attente, ou préparer un résumé des documents signés récemment.",
    "conformité": "Le score de conformité de votre institution est actuellement élevé. Les principaux indicateurs sont au vert : chiffrement AES-256 actif, contrôle RBAC configuré, journalisation des accès opérationnelle. Souhaitez-vous un rapport détaillé ?",
    "rapport": "Je peux générer plusieurs types de rapports pour votre institution :\n\n• **Rapport d'activité** — Synthèse des opérations documentaires\n• **Rapport de conformité** — État des contrôles de sécurité\n• **Rapport d'archivage** — Statistiques des archives par catégorie\n\nQuel rapport souhaitez-vous que je prépare ?",
    "aide": "Voici ce que je peux faire pour vous :\n\n• 📄 **Analyse documentaire** — Résumés, extraction de données\n• 🔍 **Recherche intelligente** — Retrouver des documents par contexte\n• 📊 **Génération de rapports** — Synthèses et statistiques\n• ✅ **Vérification de conformité** — Contrôles réglementaires\n\nPosez-moi simplement votre question !",
};

function generateAIResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
        if (lower.includes(keyword)) return response;
    }
    return `J'ai bien reçu votre demande : "${prompt}"\n\nJe l'analyse dans le contexte de votre institution. Cette fonctionnalité sera bientôt connectée au moteur IA DIGITALIUM pour des réponses personnalisées basées sur vos documents et données réels.\n\nEn attendant, je peux vous aider avec :\n• L'analyse de documents\n• La recherche dans vos archives\n• La génération de rapports\n• La vérification de conformité`;
}

/* ─── Capabilities ─────────────────────────────── */

const capabilities = [
    { label: "Analyse documentaire", description: "Résumés automatiques de textes juridiques et rapports", icon: FileSearch, gradient: "from-amber-500 to-orange-500", prompt: "Analyse mes documents récents" },
    { label: "Recherche intelligente", description: "Retrouvez tout document par contexte et mots-clés", icon: Brain, gradient: "from-orange-500 to-red-500", prompt: "Recherche un document" },
    { label: "Génération de rapports", description: "Créez des synthèses et rapports à partir de vos données", icon: Sparkles, gradient: "from-teal-500 to-cyan-500", prompt: "Génère un rapport d'activité" },
    { label: "Conformité", description: "Vérification de conformité réglementaire automatisée", icon: Zap, gradient: "from-emerald-500 to-teal-500", prompt: "Vérifie la conformité de mon institution" },
];

/* ─── Animations ───────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function InstitutionalAstedPage() {
    const { orgName } = useOrganization();
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConversation?.messages.length]);

    const createConversation = useCallback((title: string): string => {
        const id = `conv-${Date.now()}`;
        const conv: Conversation = {
            id,
            title,
            messages: [],
            createdAt: Date.now(),
        };
        setConversations((prev) => [conv, ...prev]);
        setActiveConversationId(id);
        return id;
    }, []);

    const handleSendMessage = useCallback(async (messageText?: string) => {
        const text = messageText || prompt.trim();
        if (!text || isLoading) return;

        setPrompt("");
        setIsLoading(true);

        // Create conversation if none active
        let convId = activeConversationId;
        if (!convId) {
            convId = createConversation(text.slice(0, 50) + (text.length > 50 ? "…" : ""));
        }

        // Add user message
        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}-user`,
            role: "user",
            content: text,
            timestamp: Date.now(),
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c
            )
        );

        // Simulate AI typing delay
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

        // Generate and add AI response
        const aiMsg: ChatMessage = {
            id: `msg-${Date.now()}-ai`,
            role: "assistant",
            content: generateAIResponse(text),
            timestamp: Date.now(),
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId ? { ...c, messages: [...c.messages, aiMsg] } : c
            )
        );

        setIsLoading(false);
        inputRef.current?.focus();
    }, [prompt, isLoading, activeConversationId, createConversation]);

    const handleNewConversation = useCallback(() => {
        setActiveConversationId(null);
        setPrompt("");
        inputRef.current?.focus();
    }, []);

    const handleDeleteConversation = useCallback((convId: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConversationId === convId) {
            setActiveConversationId(null);
        }
        toast.success("Conversation supprimée");
    }, [activeConversationId]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const handleCapabilityClick = useCallback((capPrompt: string) => {
        handleSendMessage(capPrompt);
    }, [handleSendMessage]);

    // ─── Render ──────────────────────────────────

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Bot className="h-5 w-5 text-amber-400" />
                            iAsted
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Assistant IA souverain — {orgName}
                        </p>
                    </div>
                    {activeConversationId && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-white/10 hover:bg-white/5"
                            onClick={handleNewConversation}
                        >
                            <Plus className="h-3 w-3 mr-1.5" />
                            Nouvelle conversation
                        </Button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                {/* Sidebar — Conversations */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <Card className="glass border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Historique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
                            {conversations.length === 0 ? (
                                <p className="text-xs text-muted-foreground/50 text-center py-6">
                                    Aucune conversation
                                </p>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                                            activeConversationId === conv.id
                                                ? "bg-amber-500/10 border border-amber-500/20"
                                                : "hover:bg-white/[0.03] border border-transparent"
                                        }`}
                                        onClick={() => setActiveConversationId(conv.id)}
                                    >
                                        <div className="h-7 w-7 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{conv.title}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {conv.messages.length} message{conv.messages.length > 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteConversation(conv.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 text-red-400" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Area */}
                <div className="space-y-4">
                    {/* Chat Messages or Welcome */}
                    {activeConversation && activeConversation.messages.length > 0 ? (
                        <Card className="glass border-white/5">
                            <CardContent className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
                                <AnimatePresence initial={false}>
                                    {activeConversation.messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                                        >
                                            {msg.role === "assistant" && (
                                                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bot className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                                    msg.role === "user"
                                                        ? "bg-amber-500/15 border border-amber-500/20 text-foreground"
                                                        : "bg-white/[0.03] border border-white/5"
                                                }`}
                                            >
                                                {msg.content.split("\n").map((line, i) => (
                                                    <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                                                        {line}
                                                    </p>
                                                ))}
                                            </div>
                                            {msg.role === "user" && (
                                                <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Typing indicator */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3"
                                    >
                                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                                            <Bot className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={chatEndRef} />
                            </CardContent>
                        </Card>
                    ) : (
                        /* Capabilities Grid (welcome state) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {capabilities.map((cap, i) => {
                                const Icon = cap.icon;
                                return (
                                    <motion.div
                                        key={cap.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.08 }}
                                    >
                                        <Card
                                            className="glass border-white/5 hover:border-amber-500/20 transition-all cursor-pointer group h-full"
                                            onClick={() => handleCapabilityClick(cap.prompt)}
                                        >
                                            <CardContent className="p-4 flex items-start gap-3">
                                                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${cap.gradient} flex items-center justify-center shrink-0`}>
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold group-hover:text-amber-300 transition-colors">{cap.label}</p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{cap.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Prompt Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <Card className="glass border-white/5">
                            <CardContent className="p-3">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            ref={inputRef}
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Posez une question sur vos documents, archives, ou demandez une analyse…"
                                            className="pl-9 h-11 text-sm bg-white/5 border-white/10 focus-visible:ring-amber-500/30"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <Button
                                        className="h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6"
                                        onClick={() => handleSendMessage()}
                                        disabled={!prompt.trim() || isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
