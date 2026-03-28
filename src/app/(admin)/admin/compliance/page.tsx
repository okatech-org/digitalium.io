"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Sécurité & Conformité Admin
// Tableau de bord de conformité Back-Office
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield, CheckCircle2, AlertTriangle, XCircle,
    Activity, FileText, Loader2, FileCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const complianceMetrics = [
    { label: "Score Plateforme", value: "98%", icon: Shield, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { label: "Alertes Critiques", value: "0", icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Politiques Actives", value: "14", icon: FileCheck, color: "text-teal-500", bgColor: "bg-teal-500/10" },
    { label: "Intégrité Logs", value: "100%", icon: Activity, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
];

const complianceChecks = [
    { label: "Isolation des Tenants", status: "pass", detail: "Étanchéité des données inter-organisations certifiée" },
    { label: "Chiffrement AES-256", status: "pass", detail: "Actif sur l'ensemble de la base de données production" },
    { label: "Accessibilité SuperAdmin", status: "warning", detail: "2 sessions privilégiées n'ont pas de 2FA configuré" },
    { label: "Certificats SSL Wildcard", status: "pass", detail: "Valide jusqu'au Q3 2027" },
    { label: "Sauvegardes Géo-redondantes", status: "pass", detail: "Objectif de Point de Reprise (RPO) < 1h" },
    { label: "Conformité OHADA / RGPD", status: "pass", detail: "Traitements alignés avec les directives légales" },
];

const statusIcons: Record<string, { icon: React.ElementType; className: string }> = {
    pass: { icon: CheckCircle2, className: "text-emerald-500" },
    warning: { icon: AlertTriangle, className: "text-amber-500" },
    fail: { icon: XCircle, className: "text-red-500" },
};

export default function AdminCompliancePage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        toast.info("Génération du rapport d'audit top-level...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsGenerating(false);
        toast.success("Rapport d'audit global généré.");
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-500" />
                        Sécurité & Conformité
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tableau de bord de sécurité global — DIGITALIUM
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="text-xs h-9 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        Générer un rapport
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceMetrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Card className="glass border-white/5 h-full hover:border-white/10 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                                        <p className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</p>
                                    </div>
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${m.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${m.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <Card className="glass border-white/5 flex flex-col h-full hover:border-white/10 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Surveillance Top-Level</CardTitle>
                    <CardDescription className="text-[11px]">Indicateurs critiques d&apos;intégrité applicative</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {complianceChecks.map((check, i) => {
                            const { icon: StatusIcon, className } = statusIcons[check.status];
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:border-emerald-500/10 hover:bg-emerald-500/[0.02]">
                                    <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 ${check.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : ''}`}>
                                        <StatusIcon className={`h-4 w-4 ${className}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className="text-xs font-semibold">{check.label}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">{check.detail}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
