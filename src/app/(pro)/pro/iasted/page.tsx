"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iAsted: AI Assistant Main Page
// Full chat interface with conversation history
// ═══════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Bot,
    Send,
    Sparkles,
    FileText,
    Archive,
    PenTool,
    BarChart3,
    Loader2,
    Plus,
    MessageSquare,
    Shield,
    Users,
    TrendingUp,
    ChevronRight,
} from "lucide-react";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

// ─── Types ──────────────────────────────────────

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
    messageCount: number;
}

// ─── Simulated AI ──────────────────────────────

const KEYWORD_RESPONSES: Record<string, string> = {
    document:
        "📄 **Module iDocument**\n\nVous avez actuellement **23 documents** dont 5 en brouillon et 2 en attente de validation.\n\n**Actions rapides :**\n• Créer un nouveau document\n• Voir les documents en attente\n• Accéder aux modèles",
    archive:
        "📦 **Module iArchive**\n\nVotre espace d'archivage : **847 Mo / 5 Go** utilisés.\n\n**Répartition :**\n• Fiscal : 234 fichiers (40%)\n• Social : 156 fichiers (27%)\n• Juridique : 98 fichiers (17%)\n• Client : 92 fichiers (16%)\n\n⚠️ 3 archives expirent dans les 30 prochains jours.",
    signature:
        "✍️ **Module iSignature**\n\n**Ce mois :**\n• 47 demandes de signature envoyées\n• 43 complétées (taux : 92%)\n• 4 en attente de votre signature\n\n**Délai moyen :** 1.8 jours",
    conformité:
        "✅ **Score de conformité : 87/100**\n\n• Certificats valides : 94% ✅\n• Archives à jour : 91% ✅\n• Signatures complètes : 88% ⚠️\n• Rétention respectée : 76% ⚠️",
    statistiques:
        "📊 **Tableau de bord rapide**\n\n**Ce mois (Février 2026) :**\n• Documents créés : 18\n• Archives ajoutées : 12\n• Signatures envoyées : 47\n• Utilisateurs actifs : 8\n\n**Tendance :** +15% d'activité vs. janvier",
    résumé:
        "📝 **Résumé de l'activité**\n\nVotre organisation a connu une activité soutenue ce mois. Les principales actions :\n\n1. **18 documents** créés dont 3 contrats majeurs\n2. **12 archives** ajoutées (principalement fiscal)\n3. **47 signatures** traitées avec un taux de 92%\n\n**Point d'attention :** 3 archives arrivent à expiration.",
    aide:
        "🤖 **Comment puis-je vous aider ?**\n\n1. **Rechercher** des documents, archives ou signatures\n2. **Résumer** le contenu d'un document\n3. **Vérifier** la conformité de vos archives\n4. **Analyser** les tendances de votre organisation\n5. **Guider** dans les processus de signature",
    bonjour:
        "Bonjour ! 👋 Je suis **iAsted**, votre assistant IA.\n\nJe peux vous aider avec vos documents, archives, signatures et analyses. Que souhaitez-vous faire ?",
};

function getAIResponse(input: string): string {
    const lower = input.toLowerCase();
    for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
        if (lower.includes(keyword)) return response;
    }
    return `Je comprends votre demande.\n\n🔄 Cette fonctionnalité sera connectée à l'IA prochainement. Essayez :\n• « document » · « archive » · « signature »\n• « conformité » · « statistiques » · « résumé »`;
}

// ─── Quick Actions ──────────────────────────────

const QUICK_ACTIONS = [
    { label: "Résumer mon activité", icon: TrendingUp, color: "from-violet-600 to-indigo-500" },
    { label: "Vérifier la conformité", icon: Shield, color: "from-emerald-600 to-teal-500" },
    { label: "Mes documents récents", icon: FileText, color: "from-blue-600 to-cyan-500" },
    { label: "État des signatures", icon: PenTool, color: "from-amber-600 to-orange-500" },
    { label: "Statistiques équipe", icon: Users, color: "from-rose-600 to-pink-500" },
    { label: "Archives à renouveler", icon: Archive, color: "from-purple-600 to-fuchsia-500" },
];

// ─── Component ─────────────────────────────────

export default function IAstedPage() {
    const { user } = useAuth();
    const { convexOrgId } = useConvexOrgId();

    const conversationsQuery = useQuery(api.iasted.listConversations, 
        user && convexOrgId ? { userId: user.uid, organizationId: convexOrgId } : "skip"
    );

    const [activeConv, setActiveConv] = useState<string | null>(null);
    const activeData = useQuery(api.iasted.getConversation, 
        // Ensure variables correctly defined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeConv ? { id: activeConv as any } : "skip"
    );

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showSidebar] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const addMessageMutation = useMutation(api.iasted.addMessage);

    const rawConversations = conversationsQuery || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversations: Conversation[] = rawConversations.map((c: any) => ({
        id: c._id,
        title: c.title || "Nouvelle conversation",
        lastMessage: c.messages[c.messages.length - 1]?.content || "",
        timestamp: c.updatedAt || c.createdAt,
        messageCount: c.messages.length,
    }));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // sync active messages
    useEffect(() => {
        if (activeData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMessages(activeData.messages.map((m: any, i: number) => ({
                id: `${m.timestamp}-${i}`,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp
            })));
        }
    }, [activeData]);

    const startNewConversation = (initialMessage?: string) => {
        setActiveConv(null);
        const welcomeMsg: ChatMessage = {
            id: "msg-welcome-new",
            role: "assistant",
            content: "Bonjour ! 👋 Comment puis-je vous aider ?",
            timestamp: Date.now(),
        };
        setMessages([welcomeMsg]);

        if (initialMessage) {
            setTimeout(() => sendMessage(initialMessage), 300);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || !user || !convexOrgId) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        const title = text.slice(0, 40);
        // Ensure variables correctly defined
        const newConvId = await addMessageMutation({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            id: activeConv ? (activeConv as any) : undefined,
            userId: user.uid,
            organizationId: convexOrgId,
            role: "user",
            content: text,
            title: !activeConv ? title : undefined
        });

        if (!activeConv) {
            setActiveConv(newConvId);
        }

        await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));

        const aiResponse = getAIResponse(text);

        // Ensure variables correctly defined
        await addMessageMutation({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            id: newConvId as any,
            userId: user.uid,
            organizationId: convexOrgId,
            role: "assistant",
            content: aiResponse,
        });

        setIsTyping(false);
    };

    const formatContent = (text: string) => {
        return text.split("\n").map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <React.Fragment key={i}>
                    {parts.map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j} className="font-semibold text-zinc-200">{part.slice(2, -2)}</strong>
                        ) : (
                            <span key={j}>{part}</span>
                        )
                    )}
                    {i < text.split("\n").length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    const timeAgo = (ts: number) => {
        const diff = Date.now() - ts;
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return "À l'instant";
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Il y a ${days}j`;
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] max-w-7xl mx-auto gap-3">
            {/* Sidebar */}
            {showSidebar && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-72 shrink-0 flex flex-col rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden"
                >
                    <div className="p-3 border-b border-white/5">
                        <Button
                            size="sm"
                            className="w-full text-xs bg-gradient-to-r from-violet-600 to-indigo-500"
                            onClick={() => startNewConversation()}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Nouvelle conversation
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConv(conv.id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                    activeConv === conv.id
                                        ? "bg-violet-500/10 border border-violet-500/20"
                                        : "hover:bg-white/[0.03] border border-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-0.5">
                                    <MessageSquare className="h-3 w-3 text-violet-400 shrink-0" />
                                    <span className="text-xs font-medium truncate">{conv.title}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate pl-5">{conv.lastMessage}</p>
                                <div className="flex items-center gap-2 pl-5 mt-1">
                                    <span className="text-[9px] text-zinc-600">{timeAgo(conv.timestamp)}</span>
                                    <span className="text-[9px] text-zinc-600">·</span>
                                    <span className="text-[9px] text-zinc-600">{conv.messageCount} msgs</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="p-3 border-t border-white/5">
                        <Link href="/pro/iasted/analytics">
                            <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-400 justify-between">
                                <span className="flex items-center gap-1.5">
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    Analytics IA
                                </span>
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">iAsted — Assistant IA</h2>
                            <div className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] text-zinc-500">En ligne · Mode démo</span>
                            </div>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-400 border-0">
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA Simulée
                    </Badge>
                </div>

                {/* Chat Content */}
                {!activeConv ? (
                    /* Welcome Screen */
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center max-w-lg"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                                <Bot className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-lg font-bold mb-1">Bienvenue sur iAsted</h2>
                            <p className="text-xs text-zinc-400 mb-6">
                                Votre assistant IA pour la gestion documentaire, l&apos;archivage et les signatures.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                                {QUICK_ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={action.label}
                                            onClick={() => startNewConversation(action.label)}
                                            className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all text-left group"
                                        >
                                            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-2`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                                {action.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-[10px] text-zinc-600">
                                Tapez votre question ou cliquez sur une action rapide
                            </p>
                        </motion.div>
                    </div>
                ) : (
                    /* Messages */
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="h-7 w-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                                </div>
                                <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 rounded-tl-sm">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-white/5 shrink-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!activeConv) startNewConversation(input);
                            else sendMessage(input);
                        }}
                        className="flex items-center gap-2"
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez une question à iAsted…"
                            className="flex-1 h-10 px-4 text-sm bg-white/[0.03] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/30 placeholder:text-zinc-600"
                            disabled={isTyping}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 bg-gradient-to-r from-violet-600 to-indigo-500 rounded-xl shrink-0"
                            disabled={!input.trim() || isTyping}
                        >
                            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
