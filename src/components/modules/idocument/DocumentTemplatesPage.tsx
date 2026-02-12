"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Modèles de Documents (Templates)
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FileStack, Search, FileText, BarChart3, ClipboardList,
    FileCheck, Receipt, Calculator, Scale, BookOpen, Plus,
    ArrowRight, Sparkles, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// ─── Types ──────────────────────────────────────────────────────

interface Template {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ElementType;
    gradient: string;
    popularity: number; // 0-100
    fields: string[];
}

// ─── Template data ──────────────────────────────────────────────

const TEMPLATES: Template[] = [
    {
        id: "tpl-1",
        title: "Rapport d'activité",
        description: "Modèle structuré pour les rapports d'activité mensuels ou trimestriels avec indicateurs clés.",
        category: "Rapport",
        icon: BarChart3,
        gradient: "from-blue-600 to-cyan-500",
        popularity: 95,
        fields: ["Période", "Objectifs", "Résultats", "Indicateurs clés", "Prochaines étapes"],
    },
    {
        id: "tpl-2",
        title: "Compte-rendu de réunion",
        description: "Format standard pour les procès-verbaux de réunion avec participants, décisions et actions.",
        category: "Compte-rendu",
        icon: ClipboardList,
        gradient: "from-violet-600 to-purple-500",
        popularity: 92,
        fields: ["Date", "Participants", "Ordre du jour", "Décisions", "Actions"],
    },
    {
        id: "tpl-3",
        title: "Note de service",
        description: "Communication interne officielle avec en-tête, objet, destinataires et contenu formaté.",
        category: "Communication",
        icon: FileText,
        gradient: "from-amber-600 to-orange-500",
        popularity: 88,
        fields: ["Destinataire(s)", "Objet", "Référence", "Corps du message"],
    },
    {
        id: "tpl-4",
        title: "Contrat type",
        description: "Modèle de contrat de prestation de services conforme au droit gabonais et OHADA.",
        category: "Juridique",
        icon: FileCheck,
        gradient: "from-emerald-600 to-green-500",
        popularity: 85,
        fields: ["Parties", "Objet", "Durée", "Conditions", "Obligations", "Clause résolutoire"],
    },
    {
        id: "tpl-5",
        title: "Devis",
        description: "Proposition commerciale avec détail des prestations, quantités et tarifs en XAF.",
        category: "Commercial",
        icon: Calculator,
        gradient: "from-pink-600 to-rose-500",
        popularity: 82,
        fields: ["Client", "Prestations", "Quantité", "Prix unitaire", "Total HT/TTC"],
    },
    {
        id: "tpl-6",
        title: "Facture",
        description: "Facture conforme avec mentions légales, TVA et coordonnées bancaires BGFI/UGB.",
        category: "Commercial",
        icon: Receipt,
        gradient: "from-red-600 to-orange-500",
        popularity: 78,
        fields: ["Numéro", "Client", "Lignes de facturation", "Sous-total", "TVA", "Total"],
    },
    {
        id: "tpl-7",
        title: "Procès-verbal",
        description: "Document officiel pour AG, CA ou comités avec résolutions votées et signatures.",
        category: "Juridique",
        icon: Scale,
        gradient: "from-indigo-600 to-blue-500",
        popularity: 75,
        fields: ["Instance", "Date", "Quorum", "Résolutions", "Votes", "Signatures"],
    },
    {
        id: "tpl-8",
        title: "Cahier des charges",
        description: "Spécifications techniques et fonctionnelles pour les projets IT et transformation digitale.",
        category: "Technique",
        icon: BookOpen,
        gradient: "from-teal-600 to-cyan-500",
        popularity: 70,
        fields: ["Contexte", "Périmètre", "Exigences fonctionnelles", "Contraintes", "Planning"],
    },
];

// ─── Animations ─────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const cardHover = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DocumentTemplatesPage() {
    const [search, setSearch] = useState("");
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [createdMsg, setCreatedMsg] = useState("");

    const filtered = search
        ? TEMPLATES.filter(
            (t) =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.category.toLowerCase().includes(search.toLowerCase()) ||
                t.description.toLowerCase().includes(search.toLowerCase())
        )
        : TEMPLATES;

    const handleUseTemplate = (template: Template) => {
        setCreatedMsg(`Document « ${template.title} » créé avec succès !`);
        setPreviewTemplate(null);
        setTimeout(() => setCreatedMsg(""), 3000);
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <FileStack className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modèles de Documents</h1>
                        <p className="text-sm text-muted-foreground">
                            {TEMPLATES.length} modèles prédéfinis · Prêts à l&apos;emploi
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeUp}>
                <Card className="glass border-white/5">
                    <CardContent className="p-3">
                        <div className="relative max-w-[400px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un modèle…"
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                className="h-8 pl-8 text-xs bg-white/5 border-white/10"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Success toast */}
            {createdMsg && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-500/15 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-emerald-400"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {createdMsg}
                </motion.div>
            )}

            {/* Template grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((tpl) => {
                    const Icon = tpl.icon;
                    return (
                        <motion.div
                            key={tpl.id}
                            variants={fadeUp}
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                        >
                            <motion.div variants={cardHover}>
                                <Card className="glass border-white/5 overflow-hidden group cursor-pointer h-full">
                                    <CardContent className="p-0 h-full flex flex-col">
                                        {/* Gradient preview header */}
                                        <div className={`h-20 bg-gradient-to-br ${tpl.gradient} relative flex items-center justify-center`}>
                                            <Icon className="h-8 w-8 text-white/80" />
                                            {/* Popularity badge */}
                                            <Badge className="absolute top-2 right-2 text-[9px] h-4 bg-white/20 text-white border-0 backdrop-blur-sm">
                                                <Sparkles className="h-2 w-2 mr-0.5" />
                                                {tpl.popularity}%
                                            </Badge>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-1.5">
                                                <h3 className="text-sm font-semibold group-hover:text-violet-300 transition-colors">
                                                    {tpl.title}
                                                </h3>
                                            </div>
                                            <Badge variant="secondary" className="text-[9px] h-4 w-fit mb-2 bg-white/5 border-0">
                                                {tpl.category}
                                            </Badge>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1">
                                                {tpl.description}
                                            </p>

                                            {/* Fields preview */}
                                            <div className="flex flex-wrap gap-1 mt-3 mb-3">
                                                {tpl.fields.slice(0, 3).map((f) => (
                                                    <span
                                                        key={f}
                                                        className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground"
                                                    >
                                                        {f}
                                                    </span>
                                                ))}
                                                {tpl.fields.length > 3 && (
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                                                        +{tpl.fields.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-7 text-[11px] bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0 gap-1"
                                                    onClick={() => handleUseTemplate(tpl)}
                                                >
                                                    <Plus className="h-3 w-3" /> Utiliser
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-[11px] border-white/10 gap-1"
                                                    onClick={() => setPreviewTemplate(tpl)}
                                                >
                                                    Aperçu
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Preview dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="sm:max-w-lg">
                    {previewTemplate && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${previewTemplate.gradient} flex items-center justify-center`}>
                                        <previewTemplate.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle>{previewTemplate.title}</DialogTitle>
                                        <Badge variant="secondary" className="text-[9px] h-4 mt-1 bg-white/5 border-0">
                                            {previewTemplate.category}
                                        </Badge>
                                    </div>
                                </div>
                                <DialogDescription>{previewTemplate.description}</DialogDescription>
                            </DialogHeader>

                            <div className="py-3">
                                <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                                    Sections incluses
                                </h4>
                                <div className="space-y-2">
                                    {previewTemplate.fields.map((field, i) => (
                                        <div
                                            key={field}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                                        >
                                            <span className="text-[10px] font-mono text-muted-foreground w-5">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className="text-xs">{field}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setPreviewTemplate(null)} className="border-white/10">
                                    Fermer
                                </Button>
                                <Button
                                    onClick={() => handleUseTemplate(previewTemplate)}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white border-0 gap-1.5"
                                >
                                    <Plus className="h-4 w-4" /> Utiliser ce modèle
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
