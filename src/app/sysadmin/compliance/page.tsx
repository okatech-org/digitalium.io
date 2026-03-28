"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert, CheckCircle2, AlertTriangle, XCircle,
    Activity, Loader2, Server
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const complianceMetrics = [
    { label: "Intégrité Infra", value: "99%", icon: ShieldAlert, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { label: "Alertes Serveur", value: "1", icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Uptime SLA", value: "99.9%", icon: Activity, color: "text-red-500", bgColor: "bg-red-500/10" },
    { label: "Mise à jour OS", value: "Ok", icon: Server, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
];

const complianceChecks = [
    { label: "Accès root désactivé", status: "pass", detail: "Les connexions SSH root sont bloquées" },
    { label: "Rotation logs Vercel", status: "pass", detail: "Archivage automatique tous les 30 jours" },
    { label: "Réseau VPC isolé", status: "warning", detail: "Alerte mineure sur le pont de staging" },
    { label: "Bases de données encryptées", status: "pass", detail: "Volumes EBS chiffrés avec KMS" },
];

const statusIcons: Record<string, { icon: React.ElementType; className: string }> = {
    pass: { icon: CheckCircle2, className: "text-emerald-500" },
    warning: { icon: AlertTriangle, className: "text-amber-500" },
    fail: { icon: XCircle, className: "text-red-500" },
};

export default function SysAdminCompliancePage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        toast.info("Analyse de l'infrastructure en cours...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsGenerating(false);
        toast.success("Rapport d'audit infra prêt.");
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
                        <ShieldAlert className="h-5 w-5 text-orange-500" />
                        Sécurité & Conformité Infra
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Contrôle de sécurité des couches basses
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="text-xs h-9 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 transition-all"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                        Audit Infra
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
                    <CardTitle className="text-sm font-semibold">Contrôles Systèmes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {complianceChecks.map((check, i) => {
                            const { icon: StatusIcon, className } = statusIcons[check.status];
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:bg-orange-500/[0.02]">
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
