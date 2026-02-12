// DIGITALIUM.IO — iSignature: À signer
"use client";
import React from "react";
import { motion } from "framer-motion";
import { PenTool, FileText, Clock, AlertCircle, CheckCircle2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const PENDING = [
    { doc: "Contrat CDI — Marcel Obiang", type: "Contrat", pages: 8, requestedBy: "Marie Nzé", date: "Il y a 1h", priority: "haute" as const, deadline: "Aujourd'hui" },
    { doc: "Ordre de mission #242 — Franceville", type: "Ordre de mission", pages: 2, requestedBy: "Patrick Akogo", date: "Il y a 3h", priority: "normale" as const, deadline: "Demain" },
    { doc: "Avenant bail bureau Libreville", type: "Avenant", pages: 4, requestedBy: "Sylvie Moussavou", date: "Hier", priority: "haute" as const, deadline: "14 fév" },
];

export default function PendingSignaturesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><PenTool className="h-6 w-6 text-violet-400" /> À signer</h1>
                <p className="text-sm text-muted-foreground mt-1">{PENDING.length} documents nécessitent votre signature</p>
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-3">
                {PENDING.map((p, i) => (
                    <motion.div key={i} variants={fadeUp} className="glass-card rounded-xl p-5 border border-white/5 hover:border-violet-500/20 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText className="h-5 w-5 text-violet-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm">{p.doc}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">{p.type}</Badge>
                                        <span className="text-[10px] text-muted-foreground">{p.pages} pages</span>
                                        <span className="text-[10px] text-muted-foreground">·</span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-2.5 w-2.5" />{p.requestedBy}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{p.date}</span>
                                        <span className={`flex items-center gap-1 ${p.priority === "haute" ? "text-red-400" : "text-muted-foreground"}`}>
                                            <AlertCircle className="h-2.5 w-2.5" />Deadline: {p.deadline}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 text-[11px] h-8 px-4 gap-1.5">
                                    <PenTool className="h-3 w-3" /> Signer
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground">
                                    Aperçu
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
