"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iAsted (Organisme)
// Assistant IA Documentaire (RAG)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  Search,
  BookOpen,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  FolderTree,
  Command
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

// ─── Animations ───────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

// ─── Types ────────────────────────────────────────────────────

interface Source {
  id: string;
  title: string;
  relevance: number;
  type: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  isSearching?: boolean;
}

// ─── Mock Data & Suggested Queries ────────────────────────────

const SUGGESTED_QUERIES = [
  { icon: Search, label: "Recherche profonde", text: "Retrouve tous les documents relatifs au financement 2023." },
  { icon: FileText, label: "Synthèse de dossier", text: "Fais un résumé des engagements pris lors du CA du mois dernier." },
  { icon: BookOpen, label: "Analyse réglementaire", text: "Quelle est la procédure actuelle pour l'approbation des subventions ?" },
  { icon: FolderTree, label: "Audit de classement", text: "Quels dossiers sont classés comme confidentiels dans la structure active ?" },
];

const MOCK_SOURCES: Source[] = [
  { id: "s1", title: "CR_Conseil_Admin_Dec2023.pdf", relevance: 92, type: "PDF" },
  { id: "s2", title: "Procédure_Subventions_v2.docx", relevance: 85, type: "DOCX" },
  { id: "s3", title: "Note_Interne_Financement_2023.pdf", relevance: 78, type: "PDF" },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function OrgAstedPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-0",
      role: "assistant",
      content: `Bonjour ${user?.email || "collaborateur"}. Je suis iAsted, votre assistant documentaire intelligent.\n\nJe suis connecté à l'ensemble du fonds documentaire de votre organisme. Je suis là pour vous aider.`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;

    const newUserMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate RAG process
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-search`,
          role: "assistant",
          content: "Recherche dans la documentation interne...",
          timestamp: new Date(),
          isSearching: true,
        }
      ]);

      setTimeout(() => {
        setMessages((prev) => {
          const newArr = [...prev];
          newArr.pop(); // Remove "searching" message
          newArr.push({
            id: `msg-${Date.now()}-reply`,
            role: "assistant",
            content: "Basé sur les documents consultés, voici ce que j'ai trouvé.\n\nLes procédures de financement pour l'année 2023 ont été revues lors du Conseil d'Administration de Décembre. Toute demande de subvention doit désormais être accompagnée du formulaire V2 dument rempli et signé par le directeur de département concerné. Le plafond d'approbation directe est fixé à 5 000 000 XAF.\n\nPour des montants supérieurs, le dossier doit passer en commission restreinte (voir Section 3 de la Procédure_Subventions_v2).",
            timestamp: new Date(),
            sources: MOCK_SOURCES,
          });
          return newArr;
        });
        setIsTyping(false);
      }, 2000);
    }, 600);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* ═══ HEADER ═══ */}
      <motion.div variants={fadeUp} className="flex-none mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-white absolute opacity-20 animate-pulse" />
              <Bot className="h-5 w-5 text-white relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">iAsted</h1>
                <Badge className="bg-violet-500/15 text-violet-400 border-0 text-[10px] font-mono uppercase tracking-wider h-5 flex items-center">
                  Alpha v0.9 • RAG Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assistant RAG — Interrogation sémantique du fonds documentaire
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
             <Card className="glass border-white/5 bg-white/[0.02]">
                <CardContent className="p-2 px-3 flex items-center gap-3">
                   <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Indexeur Actif</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <FolderTree className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-xs font-medium">1,245 Doc.</span>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </motion.div>

      {/* ═══ CHAT INTERFACE ═══ */}
      <motion.div variants={fadeUp} className="flex-1 min-h-0 flex flex-col border border-white/5 rounded-2xl overflow-hidden glass bg-zinc-950/40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
        
        {/* Messages Area */}
        <div className="flex-1 min-h-0 relative z-10">
          <div ref={scrollRef} className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex gap-4 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-1">
                      {msg.role === "assistant" ? (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className={`flex flex-col gap-1 min-w-0 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {/* Name & Time */}
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {msg.role === "assistant" ? "iAsted" : "Vous"}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3 sm:p-4 rounded-2xl relative text-sm ${
                          msg.role === "assistant"
                            ? msg.isSearching 
                               ? "bg-transparent border border-violet-500/20 text-violet-300/80 italic flex items-center gap-2"
                               : "bg-white/5 border border-white/10 text-foreground rounded-tl-sm shadow-sm"
                            : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-md"
                        }`}
                      >
                         {msg.isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />}
                         <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Sources (if assistant reply) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 space-y-2 w-full max-w-sm">
                          <div className="flex items-center gap-1.5 px-1">
                            <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sources identifiées</span>
                          </div>
                          <div className="grid gap-1.5">
                            {msg.sources.map((src, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs truncate group-hover:text-violet-300 transition-colors">{src.title}</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] h-5 border-violet-500/30 text-violet-400 ml-2 shrink-0">
                                  {src.relevance}% pertinence
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions (if assistant reply) */}
                      {msg.role === "assistant" && !msg.isSearching && msg.id !== "msg-0" && (
                         <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3"/></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3 w-3"/></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><ThumbsDown className="h-3 w-3"/></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><RefreshCw className="h-3 w-3"/></Button>
                         </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div variants={messageVariants} initial="hidden" animate="visible" className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-start justify-center">
                     <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm shadow-sm h-11 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ INPUT AREA ═══ */}
        <div className="flex-none p-4 rounded-b-2xl bg-black/40 border-t border-white/5 backdrop-blur-md relative z-20">
          <div className="max-w-3xl mx-auto space-y-3">
             {/* Suggested Queries */}
             {messages.length === 1 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                 {SUGGESTED_QUERIES.map((q, i) => {
                   const QIcon = q.icon;
                   return (
                     <button
                       key={i}
                       onClick={() => handleSend(q.text)}
                       className="flex items-start gap-2.5 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all text-left group"
                     >
                       <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                          <QIcon className="h-3.5 w-3.5 text-violet-400" />
                       </div>
                       <div>
                         <p className="text-xs font-medium text-foreground group-hover:text-violet-300 transition-colors">{q.label}</p>
                         <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{q.text}</p>
                       </div>
                     </button>
                   );
                 })}
               </div>
             )}

            {/* Input Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="relative flex items-center"
            >
              <div className="absolute left-4 flex items-center gap-2">
                 <Command className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question sur vos documents, demandez un résumé, recherchez un dossier..."
                className="w-full pl-12 pr-14 h-12 bg-white/5 border-white/10 text-sm focus-visible:ring-violet-500/40 rounded-xl"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 h-9 w-9 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-between px-1">
               <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                 <AlertCircle className="h-3 w-3" /> iAsted peut faire des erreurs. Vérifiez toujours les sources citées.
               </p>
               <p className="text-[10px] text-muted-foreground/50 hidden sm:block">Appuyez sur Entrée pour envoyer</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
