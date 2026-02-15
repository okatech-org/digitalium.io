// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Documents Équipe
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, Search, FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

type DocStatus = "brouillon" | "en_revision" | "valide" | "archive";

interface TeamDoc {
    id: string;
    title: string;
    author: string;
    avatar: string;
    status: DocStatus;
    date: string;
    size: string;
}

const TEAM_DOCS: TeamDoc[] = [
    { id: "td-1", title: "Contrat prestation SOGARA — Q2 2026", author: "Daniel Nguema", avatar: "DN", status: "valide", date: "12/02/2026", size: "2.4 Mo" },
    { id: "td-2", title: "Rapport audit interne — Février 2026", author: "Marie Obame", avatar: "MO", status: "en_revision", date: "10/02/2026", size: "5.1 Mo" },
    { id: "td-3", title: "Facture SEEG N°2026-0045", author: "Claude Mboumba", avatar: "CM", status: "valide", date: "08/02/2026", size: "342 Ko" },
    { id: "td-4", title: "Procès-verbal AG — Janvier 2026", author: "Aimée Gondjout", avatar: "AG", status: "valide", date: "05/02/2026", size: "1.8 Mo" },
    { id: "td-5", title: "Note de service — Politique RH", author: "Daniel Nguema", avatar: "DN", status: "brouillon", date: "03/02/2026", size: "420 Ko" },
    { id: "td-6", title: "Avenant bail Immeuble Triomphal", author: "Marie Obame", avatar: "MO", status: "en_revision", date: "01/02/2026", size: "890 Ko" },
    { id: "td-7", title: "Devis maintenance réseau COMILOG", author: "Claude Mboumba", avatar: "CM", status: "brouillon", date: "28/01/2026", size: "1.2 Mo" },
    { id: "td-8", title: "Contrat assurance ASCOMA 2026", author: "Aimée Gondjout", avatar: "AG", status: "valide", date: "25/01/2026", size: "3.5 Mo" },
    { id: "td-9", title: "Rapport financier T4 2025", author: "Daniel Nguema", avatar: "DN", status: "archive", date: "15/01/2026", size: "8.7 Mo" },
    { id: "td-10", title: "Plan formation équipe 2026", author: "Marie Obame", avatar: "MO", status: "valide", date: "10/01/2026", size: "650 Ko" },
];

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string }> = {
    brouillon: { label: "Brouillon", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
    en_revision: { label: "En révision", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    valide: { label: "Validé", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    archive: { label: "Archivé", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const AUTHORS = ["Daniel Nguema", "Marie Obame", "Claude Mboumba", "Aimée Gondjout"];

export default function SubAdminTeamDocumentsPage() {
    const [search, setSearch] = useState("");
    const [authorFilter, setAuthorFilter] = useState("all");

    const filtered = useMemo(() => {
        return TEAM_DOCS.filter((d) => {
            const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
            const matchAuthor = authorFilter === "all" || d.author === authorFilter;
            return matchSearch && matchAuthor;
        });
    }, [search, authorFilter]);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Documents de l&apos;équipe</h1>
                    <p className="text-xs text-muted-foreground">{filtered.length} document{filtered.length > 1 ? "s" : ""}</p>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Rechercher un document..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                </div>
                <Select value={authorFilter} onValueChange={setAuthorFilter}>
                    <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
                        <SelectValue placeholder="Filtrer par auteur" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les auteurs</SelectItem>
                        {AUTHORS.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Document List */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
                {filtered.map((doc) => {
                    const st = STATUS_CONFIG[doc.status];
                    return (
                        <motion.div
                            key={doc.id}
                            variants={fadeUp}
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                            onClick={() => toast.info("Ouverture du document...")}
                        >
                            <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">{doc.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="h-4 w-4 rounded-full bg-violet-500/15 flex items-center justify-center">
                                        <span className="text-[8px] text-violet-300 font-bold">{doc.avatar}</span>
                                    </div>
                                    <span className="text-[11px] text-zinc-500">{doc.author}</span>
                                    <span className="text-[11px] text-zinc-600">·</span>
                                    <span className="text-[11px] text-zinc-500">{doc.date}</span>
                                    <span className="text-[11px] text-zinc-600">·</span>
                                    <span className="text-[11px] text-zinc-500">{doc.size}</span>
                                </div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] shrink-0 ${st.color}`}>{st.label}</Badge>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-3.5 w-3.5" />
                            </Button>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-sm text-zinc-500">Aucun document trouvé</div>
                )}
            </motion.div>
        </div>
    );
}
