"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: iAsted Institutionnel
// Assistant IA pour les institutions
// ═══════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
    Bot, MessageSquare, FileSearch, Brain, Sparkles,
    ArrowRight, Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/contexts/OrganizationContext";

const capabilities = [
    { label: "Analyse documentaire", description: "Résumés automatiques de textes juridiques et rapports", icon: FileSearch, gradient: "from-emerald-600 to-teal-500" },
    { label: "Recherche intelligente", description: "Retrouvez tout document par contexte et mots-clés", icon: Brain, gradient: "from-teal-600 to-cyan-500" },
    { label: "Génération de rapports", description: "Créez des synthèses et rapports à partir de vos données", icon: Sparkles, gradient: "from-cyan-600 to-blue-500" },
    { label: "Conformité", description: "Vérification de conformité réglementaire automatisée", icon: Zap, gradient: "from-amber-600 to-orange-500" },
];

const recentConversations = [
    { title: "Analyse de l'arrêté sur la pêche artisanale", date: "Il y a 2h", messages: 8 },
    { title: "Synthèse rapport inspection Zone 47", date: "Hier", messages: 12 },
    { title: "Vérification conformité archivage Q4", date: "10 fév", messages: 5 },
];

export default function InstitutionalAstedPage() {
    const { orgName } = useOrganization();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-cyan-400" />
                    iAsted
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Assistant IA souverain — {orgName}
                </p>
            </motion.div>

            {/* Prompt Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-white/[0.02] border-white/5">
                    <CardContent className="p-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Posez une question sur vos documents, archives, ou demandez une analyse…"
                                    className="pl-9 h-11 text-sm bg-white/5 border-white/10"
                                />
                            </div>
                            <Button className="h-11 bg-gradient-to-r from-cyan-600 to-blue-500 text-white px-6">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {capabilities.map((cap, i) => {
                    const Icon = cap.icon;
                    return (
                        <motion.div
                            key={cap.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.08 }}
                        >
                            <Card className="bg-white/[0.02] border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${cap.gradient} flex items-center justify-center shrink-0`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{cap.label}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{cap.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Conversations */}
            <Card className="bg-white/[0.02] border-white/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Conversations récentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {recentConversations.map((conv, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                        >
                            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                                <MessageSquare className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{conv.title}</p>
                                <p className="text-[10px] text-muted-foreground">{conv.date} · {conv.messages} messages</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
