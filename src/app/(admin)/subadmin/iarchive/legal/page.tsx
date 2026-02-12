// DIGITALIUM.IO — iArchive: Archives Juridiques
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Scale, FileText, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const ARCHIVES = [
    { name: "Statuts DIGITALIUM — version consolidée", ref: "JUR-2026-001", date: "12 fév 2026", type: "Statuts", retention: "Permanent" },
    { name: "PV Assemblée Générale 2025", ref: "JUR-2025-024", date: "20 jan 2026", type: "PV AG", retention: "Permanent" },
    { name: "Contrat de prestation — SEEG", ref: "JUR-2025-023", date: "15 jan 2026", type: "Contrat", retention: "10 ans" },
    { name: "Bail commercial — Libreville", ref: "JUR-2025-022", date: "10 jan 2026", type: "Bail", retention: "30 ans" },
    { name: "Accord de confidentialité — Gabon Télécom", ref: "JUR-2025-021", date: "5 jan 2026", type: "NDA", retention: "10 ans" },
    { name: "Conditions générales de vente v4", ref: "JUR-2025-020", date: "1 jan 2026", type: "CGV", retention: "10 ans" },
];

export default function LegalArchivesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Scale className="h-6 w-6 text-amber-400" /> Archives Juridiques</h1>
                <p className="text-sm text-muted-foreground mt-1">{ARCHIVES.length} documents juridiques archivés</p>
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
                                <td className="py-2.5 px-2 text-center"><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Eye className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Download className="h-3 w-3" /></Button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
