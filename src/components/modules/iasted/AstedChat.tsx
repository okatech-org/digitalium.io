"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iAsted: Floating ChatBot
// AI assistant drawer with simulated responses
// ═══════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Bot,
    X,
    Send,
    Sparkles,
    FileText,
    Archive,
    PenTool,
    BarChart3,
    Loader2,
    Minimize2,
    Maximize2,
    RotateCcw,
} from "lucide-react";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { useAction, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// ─── Types ──────────────────────────────────────

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    context?: { module?: string };
}

// ─── Preferences Helper ──────────────────────────

interface IAstedPreferences {
    tone: "professional" | "casual";
    modules: string[];
    language: "fr" | "en";
}

function getIAstedPreferences(): IAstedPreferences {
    if (typeof window === "undefined") return { tone: "professional", modules: ["iDocument", "iArchive", "iSignature"], language: "fr" };
    try {
        const stored = localStorage.getItem("iasted_preferences");
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { tone: "professional", modules: ["iDocument", "iArchive", "iSignature"], language: "fr" };
}

// ─── Suggestion Chips ──────────────────────────

const SUGGESTIONS = [
    { label: "Mes documents", icon: FileText },
    { label: "Archives fiscales", icon: Archive },
    { label: "Signatures en attente", icon: PenTool },
    { label: "Statistiques", icon: BarChart3 },
];

// ─── Component ─────────────────────────────────

export default function AstedChat() {
    const { convexOrgId } = useConvexOrgId();
    const convex = useConvex();
    const askDocumentsAction = useAction(api.aiSmartImport.askDocuments);

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Bonjour ! 👋 Je suis **iAsted**, votre assistant IA.\n\nComment puis-je vous aider aujourd'hui ?",
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Search for relevant documents via RAG (smaller context for floating bot)
            let ragResults: Array<{
                id: string; title: string; excerpt: string;
                folderName?: string; tags?: string[];
                score: number; fileName: string; mimeType: string;
            }> = [];

            if (convexOrgId) {
                try {
                    ragResults = await convex.query(api.documentRAG.searchDocumentsForRAG, {
                        organizationId: convexOrgId,
                        query: text,
                        limit: 5,
                    });
                } catch (ragError) {
                    console.warn("RAG search failed:", ragError);
                }
            }

            // Build document contexts
            const documentContexts = ragResults.map((doc) => ({
                id: doc.id,
                title: doc.title,
                excerpt: doc.excerpt,
                folderName: doc.folderName,
                tags: doc.tags,
            }));

            // Get preferences
            const prefs = getIAstedPreferences();
            const toneInstruction = prefs.tone === "casual" ? " Reponds de maniere decontractee." : "";
            const langInstruction = prefs.language === "en" ? " Answer in English." : "";
            const enhancedQuestion = `${text}${toneInstruction}${langInstruction}`;

            // Call Gemini via askDocuments
            const aiResponse = await askDocumentsAction({
                question: enhancedQuestion,
                documentContexts,
            });

            // Build response with sources
            let responseWithSources = aiResponse || "Je n'ai pas pu trouver de reponse pertinente.";
            if (ragResults.length > 0) {
                const sourcesSection = ragResults
                    .slice(0, 2)
                    .map((doc) => `- **${doc.title}**`)
                    .join("\n");
                responseWithSources += `\n\n---\n**Sources :**\n${sourcesSection}`;
            }

            const aiMsg: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: "assistant",
                content: responseWithSources,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("iAsted chat error:", error);
            const aiMsg: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: "assistant",
                content: "Desole, une erreur est survenue. Veuillez reessayer.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        }

        setIsTyping(false);
    };

    const resetChat = () => {
        setMessages([
            {
                id: "welcome-reset",
                role: "assistant",
                content: "Conversation réinitialisée.\n\nComment puis-je vous aider ?",
                timestamp: Date.now(),
            },
        ]);
    };

    // Format markdown-like bold text
    const formatContent = (text: string) => {
        return text.split("\n").map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <React.Fragment key={i}>
                    {parts.map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j} className="font-semibold text-zinc-200">
                                {part.slice(2, -2)}
                            </strong>
                        ) : (
                            <span key={j}>{part}</span>
                        )
                    )}
                    {i < text.split("\n").length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/25 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Bot className="h-6 w-6 text-white" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed z-50 ${
                            isExpanded
                                ? "inset-4"
                                : "bottom-6 right-6 w-[380px] h-[560px]"
                        } bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">iAsted</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] text-zinc-500">En ligne</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={resetChat}
                                    title="Réinitialiser"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles className="h-3 w-3 text-violet-400" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-violet-500/20 text-zinc-200 rounded-tr-sm"
                                                : "bg-white/[0.03] text-zinc-300 rounded-tl-sm border border-white/5"
                                        }`}
                                    >
                                        {formatContent(msg.content)}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2"
                                >
                                    <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-3 w-3 text-violet-400" />
                                    </div>
                                    <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 rounded-tl-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion Chips */}
                        {messages.length <= 2 && (
                            <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
                                {SUGGESTIONS.map((s) => {
                                    const SIcon = s.icon;
                                    return (
                                        <button
                                            key={s.label}
                                            onClick={() => sendMessage(s.label)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-[10px] text-zinc-400 hover:text-zinc-200"
                                        >
                                            <SIcon className="h-3 w-3" />
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-white/5 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(input);
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez une question…"
                                    className="flex-1 h-9 px-3 text-xs bg-white/[0.03] border border-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/30 placeholder:text-zinc-600"
                                    disabled={isTyping}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-9 w-9 bg-gradient-to-r from-violet-600 to-indigo-500 shrink-0"
                                    disabled={!input.trim() || isTyping}
                                >
                                    {isTyping ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                            <p className="text-[8px] text-zinc-600 text-center mt-1.5">
                                iAsted IA · Powered by Gemini
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
