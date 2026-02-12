// DIGITALIUM.IO — iSignature: Signés
"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Download, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const COMPLETED = [
    { doc: "Contrat prestation — SEEG", signers: "Vous, J-P. Ondo", date: "12 fév 2026", hash: "0x4a7b...f912" },
    { doc: "Lettre de mission — Audit Q1 2026", signers: "Vous, Marie Nzé", date: "10 fév 2026", hash: "0x2c3d...a845" },
    { doc: "Protocole d'accord — Gabon Télécom", signers: "Vous, P. Obiang, D. Mba", date: "8 fév 2026", hash: "0x8e2f...b367" },
    { doc: "Avenant contrat CDD — S. Moussavou", signers: "Vous, Marie Nzé", date: "5 fév 2026", hash: "0x1f5a...d234" },
    { doc: "PV réunion extraordinaire CA", signers: "Vous, J-P. Ondo, Marie Nzé", date: "3 fév 2026", hash: "0x7c9e...e678" },
    { doc: "Convention partenariat — CNAMGS", signers: "Vous, P. Obiang", date: "1 fév 2026", hash: "0x3d4a...c159" },
    { doc: "Ordre de mission #238", signers: "Vous", date: "30 jan 2026", hash: "0x5b6c...f482" },
    { doc: "Attestation de conformité RGPD", signers: "Vous, C. Ayo", date: "28 jan 2026", hash: "0x9a1b...d793" },
];

export default function CompletedSignaturesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-emerald-400" /> Documents Signés</h1>
                <p className="text-sm text-muted-foreground mt-1">{COMPLETED.length} documents signés ce mois</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Document</th><th className="text-left py-2 px-2">Signataires</th><th className="text-left py-2 px-2 hidden md:table-cell">Date</th><th className="text-left py-2 px-2 hidden lg:table-cell">Hash</th><th className="text-center py-2 px-2 w-20"></th></tr></thead>
                    <tbody>
                        {COMPLETED.map((c, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] group">
                                <td className="py-2.5 px-2"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span className="font-medium truncate max-w-[250px]">{c.doc}</span></div></td>
                                <td className="py-2.5 px-2 text-muted-foreground">{c.signers}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{c.date}</td>
                                <td className="py-2.5 px-2 font-mono text-muted-foreground/50 hidden lg:table-cell">{c.hash}</td>
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
