// DIGITALIUM.IO — iSignature: En attente
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, FileText, User, Send, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const WAITING = [
    { doc: "Contrat fournisseur — TechGabon", sentTo: "Jean-Pierre Ondo", sentDate: "Il y a 2h", status: "envoyé" as const, signers: 3, signed: 1 },
    { doc: "Accord partenariat — Port-Gentil Logistique", sentTo: "Robert Ndong", sentDate: "Hier", status: "vu" as const, signers: 2, signed: 0 },
    { doc: "Procuration bancaire #45", sentTo: "Marie Nzé, Patrick Obiang", sentDate: "Il y a 2j", status: "partiellement signé" as const, signers: 3, signed: 2 },
    { doc: "NDA — Okoumé Capital", sentTo: "David Mba", sentDate: "Il y a 3j", status: "envoyé" as const, signers: 2, signed: 1 },
    { doc: "Renouvellement bail — Owendo", sentTo: "Sylvie Moussavou", sentDate: "Il y a 5j", status: "vu" as const, signers: 2, signed: 0 },
];

const statusCfg = {
    "envoyé": { color: "bg-blue-500/15 text-blue-400" },
    "vu": { color: "bg-amber-500/15 text-amber-400" },
    "partiellement signé": { color: "bg-violet-500/15 text-violet-400" },
};

export default function WaitingSignaturesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-violet-400" /> En attente</h1>
                <p className="text-sm text-muted-foreground mt-1">{WAITING.length} documents envoyés en attente de signature</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Document</th><th className="text-left py-2 px-2">Envoyé à</th><th className="text-left py-2 px-2 hidden md:table-cell">Date</th><th className="text-center py-2 px-2">Progrès</th><th className="text-center py-2 px-2">Statut</th><th className="text-center py-2 px-2 w-16"></th></tr></thead>
                    <tbody>
                        {WAITING.map((w, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-violet-400 shrink-0" /><span className="font-medium truncate max-w-[220px]">{w.doc}</span></div></td>
                                <td className="py-2.5 px-2 text-muted-foreground">{w.sentTo}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{w.sentDate}</td>
                                <td className="py-2.5 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {Array.from({ length: w.signers }).map((_, j) => (
                                            <div key={j} className={`h-2 w-2 rounded-full ${j < w.signed ? "bg-emerald-400" : "bg-white/10"}`} />
                                        ))}
                                        <span className="text-[10px] text-muted-foreground ml-1">{w.signed}/{w.signers}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className={`text-[9px] border-0 ${statusCfg[w.status].color}`}>{w.status}</Badge></td>
                                <td className="py-2.5 px-2 text-center"><Button variant="ghost" size="sm" className="h-6 text-[10px] text-violet-400 px-2"><Send className="h-3 w-3 mr-1" />Relancer</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
