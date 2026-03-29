"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation H: Document Knowledge Graph
// Mini-graphe de relations entre documents + entités extraites
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
    GitBranch, User, Building2, Calendar, Hash,
    DollarSign, Briefcase, FileText, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ENTITY_ICONS: Record<string, typeof User> = {
    client: Building2,
    project: Briefcase,
    person: User,
    date: Calendar,
    amount: DollarSign,
    reference: Hash,
};

const ENTITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    client: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
    project: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
    person: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    date: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    amount: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    reference: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
};

const RELATION_LABELS: Record<string, string> = {
    related: "Lié",
    quote_to_invoice: "Devis → Facture",
    contract_amendment: "Avenant",
    response_to: "Réponse à",
};

interface DocumentGraphProps {
    documentId: Id<"documents">;
    onNavigate?: (docId: string) => void;
}

export default function DocumentGraph({ documentId, onNavigate }: DocumentGraphProps) {
    const entities = useQuery(api.knowledgeGraph.getDocumentEntities, { documentId });
    const relations = useQuery(api.knowledgeGraph.getDocumentRelations, { documentId });

    if (!entities && !relations) return null;
    if (entities?.length === 0 && relations?.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4"
        >
            {/* Entités extraites */}
            {entities && entities.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 text-white/70">
                        <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                        Entités extraites
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {entities.map((entity, i) => {
                            const colors = ENTITY_COLORS[entity.entityType] ?? ENTITY_COLORS.reference;
                            const Icon = ENTITY_ICONS[entity.entityType] ?? Hash;
                            return (
                                <Badge
                                    key={i}
                                    className={`text-[10px] py-0.5 gap-1 ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                    <Icon className="h-2.5 w-2.5" />
                                    {entity.entityValue}
                                    <span className="opacity-50">{Math.round(entity.confidence * 100)}%</span>
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Documents liés */}
            {relations && relations.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 text-white/70">
                        <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        Documents liés ({relations.length})
                    </h4>
                    <div className="space-y-1">
                        {relations.map((rel, i) => (
                            <button
                                key={i}
                                onClick={() => onNavigate?.(rel.linkedDocId)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group"
                            >
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-xs text-white/70 truncate flex-1 group-hover:text-white">
                                    {rel.linkedDocTitle}
                                </span>
                                <Badge className="text-[8px] py-0 bg-white/5 text-white/40 border-white/10 shrink-0">
                                    {RELATION_LABELS[rel.relationType] ?? rel.relationType}
                                </Badge>
                                <span className="text-[9px] text-muted-foreground shrink-0">
                                    {Math.round(rel.confidence * 100)}%
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
