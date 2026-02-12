// DIGITALIUM.IO — SubAdmin: Workflow Templates
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Workflow, Plus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const TEMPLATES = [
    { name: "Onboarding employé", steps: 5, status: "active" as const, executions: 24, desc: "Création compte → Attribution rôle → Formation → Validation RH → Accès" },
    { name: "Approbation congés", steps: 3, status: "active" as const, executions: 67, desc: "Demande → Manager → RH" },
    { name: "Archivage document", steps: 4, status: "active" as const, executions: 156, desc: "Upload → Validation → Classif → Archivage" },
    { name: "Révision contrat", steps: 4, status: "draft" as const, executions: 0, desc: "Rédaction → Juridique → DG → Contre-partie" },
];

export default function WorkflowTemplatesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Workflow className="h-6 w-6 text-violet-400" /> Workflow Templates</h1>
                    <p className="text-sm text-muted-foreground mt-1">Modèles de processus internes</p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"><Plus className="h-3.5 w-3.5" /> Nouveau</Button>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((t, i) => (
                    <div key={i} className="glass-card rounded-xl p-5 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${t.status === "active" ? "bg-gradient-to-r from-violet-600 to-indigo-500" : "bg-white/5"}`} />
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">{t.name}</h3>
                            <Badge variant="secondary" className={`text-[9px] border-0 ${t.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}>{t.status === "active" ? "Actif" : "Brouillon"}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                        <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                            <span>{t.steps} étapes</span>
                            {t.executions > 0 && <span className="text-violet-400 font-mono">{t.executions} exec</span>}
                        </div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
