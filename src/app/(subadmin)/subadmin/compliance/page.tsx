"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield, CheckCircle2, AlertTriangle, XCircle,
    Activity, FileText, Loader2, Users
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const complianceMetrics = [
    { label: "Conformité Globale", value: "95%", icon: Shield, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    { label: "Anomalies Mineures", value: "3", icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Audits Clients", value: "12", icon: Users, color: "text-violet-500", bgColor: "bg-violet-500/10" },
    { label: "Traçabilité", value: "100%", icon: Activity, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
];

const complianceChecks = [
    { label: "Suites logicielles clients", status: "pass", detail: "Tous les abonnements actifs sont conformes" },
    { label: "Rétention des logs délégués", status: "pass", detail: "Archivage sécurisé à 30 jours" },
    { label: "Conventions commerciales", status: "warning", detail: "1 nouvelle convention à certifier" },
    { label: "Assistance technique tracée", status: "pass", detail: "Tickets et interventions loggés" },
];

const statusIcons: Record<string, { icon: React.ElementType; className: string }> = {
    pass: { icon: CheckCircle2, className: "text-emerald-500" },
    warning: { icon: AlertTriangle, className: "text-amber-500" },
    fail: { icon: XCircle, className: "text-red-500" },
};

export default function SubAdminCompliancePage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        toast.info("Analyse des activités déléguées en cours...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsGenerating(false);
        toast.success("Rapport SubAdmin prêt.");
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
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Sécurité & Conformité Déléguée
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Audits des portefeuilles et gestion courante
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="text-xs h-9 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
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
                    <CardTitle className="text-sm font-semibold">Contrôles SubAdmin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {complianceChecks.map((check, i) => {
                            const { icon: StatusIcon, className } = statusIcons[check.status];
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:bg-indigo-500/[0.02]">
                                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <StatusIcon className={`h-4 w-4 ${className}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold">{check.label}</p>
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
