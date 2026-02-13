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

// ─── Types ──────────────────────────────────────

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    context?: { module?: string };
}

// ─── Simulated AI Responses ────────────────────

const KEYWORD_RESPONSES: Record<string, string> = {
    document:
        "📄 **Module iDocument**\n\nVous avez actuellement **23 documents** dont 5 en brouillon et 2 en attente de validation.\n\n**Actions rapides :**\n• Créer un nouveau document\n• Voir les documents en attente\n• Accéder aux modèles",
    archive:
        "📦 **Module iArchive**\n\nVotre espace d'archivage : **847 Mo / 5 Go** utilisés.\n\n**Répartition :**\n• Fiscal : 234 fichiers (40%)\n• Social : 156 fichiers (27%)\n• Juridique : 98 fichiers (17%)\n• Client : 92 fichiers (16%)\n\n⚠️ 3 archives expirent dans les 30 prochains jours.",
    signature:
        "✍️ **Module iSignature**\n\n**Ce mois :**\n• 47 demandes de signature envoyées\n• 43 complétées (taux : 92%)\n• 4 en attente de votre signature\n\n**Délai moyen :** 1.8 jours\n\nVoulez-vous voir les signatures en attente ?",
    fiscal:
        "🏛️ **Archives fiscales**\n\nVous avez **234 documents fiscaux** archivés.\n\n**Durée de conservation :** 10 ans (conformité OHADA)\n**Certificats actifs :** 218 / 234\n\n⚠️ 12 certificats expirent en 2026. Pensez à les renouveler.",
    bonjour:
        "Bonjour ! 👋 Je suis **iAsted**, votre assistant IA Digitalium.\n\nJe peux vous aider avec :\n• 📄 Gestion documentaire\n• 📦 Archivage et conformité\n• ✍️ Signatures électroniques\n• 📊 Analyses et rapports\n\nQue souhaitez-vous faire ?",
    aide:
        "🤖 **Comment puis-je vous aider ?**\n\nVoici ce que je sais faire :\n\n1. **Rechercher** des documents, archives ou signatures\n2. **Résumer** le contenu d'un document\n3. **Vérifier** la conformité de vos archives\n4. **Analyser** les tendances de votre organisation\n5. **Guider** dans les processus de signature\n\nEssayez : « Combien de documents ai-je ce mois ? »",
    conformité:
        "✅ **Score de conformité : 87/100**\n\n**Détails :**\n• Certificats valides : 94% ✅\n• Archives à jour : 91% ✅\n• Signatures complètes : 88% ⚠️\n• Rétention respectée : 76% ⚠️\n\n**Recommandations :**\n1. Renouveler 12 certificats expirés\n2. Compléter 4 signatures en attente\n3. Vérifier 8 archives en rétention prolongée",
    statistiques:
        "📊 **Tableau de bord rapide**\n\n**Ce mois (Février 2026) :**\n• Documents créés : 18\n• Archives ajoutées : 12\n• Signatures envoyées : 47\n• Utilisateurs actifs : 8\n\n**Tendance :** +15% d'activité vs. janvier\n\nVoulez-vous un rapport détaillé ?",
    équipe:
        "👥 **Votre équipe**\n\n**5 membres actifs :**\n1. Daniel Nguema — Manager (15 signatures ce mois)\n2. Marie Obame — Juriste (12 signatures)\n3. Aimée Gondjout — Comptable (9 signatures)\n4. Claude Mboumba — RH (8 signatures)\n5. Ornella Doumba — Assistante (6 signatures)\n\n**Membre le plus actif :** D. Nguema\n**Temps moyen de signature :** 1.8 jours",
};

function getAIResponse(input: string): string {
    const lower = input.toLowerCase();
    for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
        if (lower.includes(keyword)) return response;
    }
    return `Je comprends votre demande : « ${input} ».\n\n🔄 Cette fonctionnalité sera bientôt connectée à l'IA. En attendant, essayez :\n• « document » pour voir vos documents\n• « archive » pour le suivi des archives\n• « signature » pour les signatures\n• « conformité » pour le score de conformité\n• « statistiques » pour un aperçu rapide`;
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

        // Simulate AI thinking
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));

        const aiResponse = getAIResponse(text);
        const aiMsg: ChatMessage = {
            id: `msg-${Date.now()}-ai`,
            role: "assistant",
            content: aiResponse,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
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
                                iAsted IA · Réponses simulées en mode démo
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
