// DIGITALIUM.IO — iArchive: Archives Sociales
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const ARCHIVES = [
    { name: "CNSS — Déclaration Janvier 2026", ref: "SOC-2026-001", date: "5 fév 2026", type: "CNSS", retention: "30 ans" },
    { name: "Registre du personnel — mise à jour", ref: "SOC-2026-002", date: "1 fév 2026", type: "Registre", retention: "Permanent" },
    { name: "Bulletins de paie — Janvier 2026 (lot)", ref: "SOC-2026-003", date: "31 jan 2026", type: "Paie", retention: "50 ans" },
    { name: "Attestations CNAMGS — Q4 2025", ref: "SOC-2025-048", date: "15 jan 2026", type: "CNAMGS", retention: "30 ans" },
    { name: "Convention collective — Avenant n°3", ref: "SOC-2025-047", date: "10 jan 2026", type: "Convention", retention: "Permanent" },
    { name: "Formation obligatoire — Bilan annuel 2025", ref: "SOC-2025-046", date: "5 jan 2026", type: "Formation", retention: "10 ans" },
    { name: "Contrats de travail archivés — 2025", ref: "SOC-2025-045", date: "31 déc 2025", type: "Contrats", retention: "50 ans" },
];

export default function SocialArchivesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6 text-amber-400" /> Archives Sociales</h1>
                <p className="text-sm text-muted-foreground mt-1">{ARCHIVES.length} documents · Droit social & RH</p>
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
