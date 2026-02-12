// DIGITALIUM.IO — iSignature: Workflows de signature
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Workflow, Plus, ArrowRight, Users, CheckCircle2, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const WORKFLOWS = [
    { name: "Contrat employé", steps: ["RH", "Manager", "DG", "Employé"], active: true, executions: 28, desc: "Visa RH → Approbation manager → Signature DG → Contre-signature employé" },
    { name: "Ordre de mission", steps: ["Demandeur", "Manager", "DG"], active: true, executions: 67, desc: "Saisie demandeur → Validation manager → Signature DG" },
    { name: "Bon de commande", steps: ["Acheteur", "DAF", "DG"], active: true, executions: 45, desc: "Émission acheteur → Visa DAF → Signature DG" },
    { name: "Document juridique", steps: ["Juridique", "DG", "Partie externe"], active: true, executions: 12, desc: "Rédaction juridique → Signature DG → Signature externe" },
    { name: "Procès-verbal", steps: ["Secrétaire", "Président"], active: false, executions: 0, desc: "Rédaction secrétaire → Approbation président" },
];

export default function SignatureWorkflowsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Workflow className="h-6 w-6 text-violet-400" /> Workflows de signature</h1>
                    <p className="text-sm text-muted-foreground mt-1">Circuits de validation et signature</p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"><Plus className="h-3.5 w-3.5" /> Nouveau workflow</Button>
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-3">
                {WORKFLOWS.map((w, i) => (
                    <motion.div key={i} variants={fadeUp} className="glass-card rounded-xl p-5 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${w.active ? "bg-gradient-to-r from-violet-600 to-indigo-500" : "bg-white/5"}`} />
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-sm">{w.name}</h3>
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${w.active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}>
                                        {w.active ? "Actif" : "Brouillon"}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mb-3">{w.desc}</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {w.steps.map((s, j) => (
                                        <React.Fragment key={j}>
                                            {j > 0 && <ArrowRight className="h-3 w-3 text-violet-400/40" />}
                                            <Badge variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-300/80 border-0">{s}</Badge>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                {w.executions > 0 && (
                                    <p className="text-sm font-bold text-violet-400">{w.executions}</p>
                                )}
                                <p className="text-[10px] text-muted-foreground">{w.executions > 0 ? "exécutions" : ""}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
