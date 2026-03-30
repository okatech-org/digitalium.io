"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation J: RAG Documentaire (Ask AI)
// Barre de recherche IA avec réponses contextuelles + sources
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Search, Loader2, FileText, X, Sparkles, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AskAIBarProps {
    orgId: Id<"organizations">;
    orgName?: string;
    orgSector?: string;
}

interface AIResponse {
    answer: string;
    sources: Array<{ docIndex: number; docTitle: string; relevance: number }>;
    confidence: number;
}

export default function AskAIBar({ orgId, orgName, orgSector }: AskAIBarProps) {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<AIResponse | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const askDocumentsAction = useAction(api.aiSmartImport.askDocuments);

    const handleAsk = useCallback(async () => {
        if (!question.trim() || loading) return;
        setLoading(true);
        setResponse(null);

        try {
            // Rechercher les documents pertinents côté serveur
            const searchResults = await fetch(`/api/rag-search?orgId=${orgId}&q=${encodeURIComponent(question)}`).then(r => r.json()).catch(() => null);

            // Fallback: utiliser directement l'action avec les docs disponibles
            const result = await askDocumentsAction({
                question: question.trim(),
                documentContexts: searchResults?.results?.slice(0, 8) ?? [],
                orgName,
                orgSector,
            });

            setResponse(result as AIResponse);
        } catch {
            setResponse({
                answer: "Erreur lors de l'analyse. Veuillez réessayer.",
                sources: [],
                confidence: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [question, loading, orgId, orgName, orgSector, askDocumentsAction]);

    return (
        <div className="relative">
            {/* Trigger button */}
            {!isOpen && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 gap-1.5 text-xs"
                >
                    <Brain className="h-3.5 w-3.5" />
                    Demander à l&apos;IA
                </Button>
            )}

            {/* Expanded search */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white/[0.03] border border-cyan-500/20 rounded-xl p-4 space-y-3"
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Brain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                                <Input
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                                    placeholder="Posez une question sur vos documents..."
                                    className="pl-10 bg-white/[0.03] border-white/10 text-sm"
                                    autoFocus
                                />
                            </div>
                            <Button
                                size="sm"
                                onClick={handleAsk}
                                disabled={loading || !question.trim()}
                                className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white border-0 gap-1"
                            >
                                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setIsOpen(false); setResponse(null); setQuestion(""); }}
                                className="text-muted-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Suggestions */}
                        {!response && !loading && (
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    "Résumé des derniers contrats",
                                    "Documents liés au projet en cours",
                                    "Factures du mois dernier",
                                ].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setQuestion(s); }}
                                        className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
                                    >
                                        <Sparkles className="h-2.5 w-2.5 inline mr-1" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center gap-2 text-cyan-400 text-xs">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Analyse des documents en cours...
                            </div>
                        )}

                        {/* Response */}
                        {response && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                {/* Answer */}
                                <div className="bg-white/[0.02] border border-cyan-500/10 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="h-3.5 w-3.5 text-cyan-400" />
                                        <span className="text-xs font-semibold text-cyan-300">Réponse IA</span>
                                        <Badge className="text-[10px] py-0 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                            {Math.round(response.confidence * 100)}% confiance
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                                        {response.answer}
                                    </p>
                                </div>

                                {/* Sources */}
                                {response.sources.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-muted-foreground">Sources :</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {response.sources.map((s, i) => (
                                                <Badge
                                                    key={i}
                                                    className="text-[10px] py-0.5 bg-white/5 text-white/60 border-white/10 gap-1"
                                                >
                                                    <FileText className="h-2.5 w-2.5" />
                                                    {s.docTitle}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
