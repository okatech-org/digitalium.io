// DIGITALIUM.IO — iArchive: Archives Fiscales
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Landmark, FileText, Search, Filter, Calendar, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const ARCHIVES = [
    { name: "Déclaration TVA — Janvier 2026", ref: "FISC-2026-001", date: "31 jan 2026", exercice: "2026", type: "TVA", retention: "10 ans" },
    { name: "Bilan comptable 2025", ref: "FISC-2025-012", date: "15 jan 2026", exercice: "2025", type: "Bilan", retention: "10 ans" },
    { name: "Liasse fiscale 2025", ref: "FISC-2025-011", date: "10 jan 2026", exercice: "2025", type: "Liasse", retention: "10 ans" },
    { name: "Déclaration TVA — Décembre 2025", ref: "FISC-2025-010", date: "31 déc 2025", exercice: "2025", type: "TVA", retention: "10 ans" },
    { name: "Déclaration IS — 3ème trimestre", ref: "FISC-2025-009", date: "15 oct 2025", exercice: "2025", type: "IS", retention: "10 ans" },
    { name: "Attestation de conformité fiscale", ref: "FISC-2025-008", date: "1 oct 2025", exercice: "2025", type: "Attestation", retention: "5 ans" },
];

export default function FiscalArchivesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Landmark className="h-6 w-6 text-amber-400" /> Archives Fiscales</h1>
                <p className="text-sm text-muted-foreground mt-1">{ARCHIVES.length} documents archivés · Rétention légale appliquée</p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Rechercher…" className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5"><Calendar className="h-3 w-3" /> Exercice</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5"><Filter className="h-3 w-3" /> Type</Button>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Document</th><th className="text-left py-2 px-2 hidden sm:table-cell">Réf.</th><th className="text-left py-2 px-2">Type</th><th className="text-left py-2 px-2 hidden md:table-cell">Date</th><th className="text-center py-2 px-2">Rétention</th><th className="text-center py-2 px-2 w-16"></th></tr></thead>
                    <tbody>
                        {ARCHIVES.map((a, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] group">
                                <td className="py-2.5 px-2 font-medium">{a.name}</td>
                                <td className="py-2.5 px-2 font-mono text-muted-foreground hidden sm:table-cell">{a.ref}</td>
                                <td className="py-2.5 px-2"><Badge variant="secondary" className="text-[9px] bg-amber-500/15 text-amber-400 border-0">{a.type}</Badge></td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{a.date}</td>
                                <td className="py-2.5 px-2 text-center text-muted-foreground">{a.retention}</td>
                                <td className="py-2.5 px-2 text-center">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Eye className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Download className="h-3 w-3" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
