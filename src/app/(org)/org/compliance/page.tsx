"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Conformité Org
// Sécurité & conformité réglementaire (Organismes / ONG)
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield, CheckCircle2, AlertTriangle, XCircle,
    Activity, Download, FileText, Loader2, FileCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

const complianceMetrics = [
    { label: "Score global", value: "96%", icon: Shield, color: "text-violet-500", bgColor: "bg-violet-500/10" },
    { label: "Documents certifiés", value: "854", icon: FileCheck, color: "text-fuchsia-500", bgColor: "bg-fuchsia-500/10" },
    { label: "Alertes actives", value: "1", icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Traçabilité", value: "100%", icon: Activity, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
];

const complianceChecks = [
    { label: "Rétention documentation donateurs", status: "pass", detail: "Les reçus fiscaux respectent les 10 ans légaux" },
    { label: "Signatures des conventions", status: "pass", detail: "Toutes les signatures récentes sont certifiées conformes" },
    { label: "Chiffrement au repos", status: "pass", detail: "AES-256 actif sur tous les espaces documentaires" },
    { label: "Contrôle d'accès Bureau", status: "pass", detail: "Vérification des droits d'accès des membres du bureau à jour" },
    { label: "Expiration certificats SSL", status: "warning", detail: "Certificats expirant dans 45 jours" },
    { label: "Sauvegarde off-site", status: "pass", detail: "Dernière sauvegarde : il y a 6 heures" },
    { label: "Protection des bénéficiaires", status: "pass", detail: "Registre de traitement conforme" },
    { label: "Journalisation des accès", status: "pass", detail: "Journaux d'audit intègres" },
];

const statusIcons: Record<string, { icon: React.ElementType; className: string }> = {
    pass: { icon: CheckCircle2, className: "text-emerald-500" },
    warning: { icon: AlertTriangle, className: "text-amber-500" },
    fail: { icon: XCircle, className: "text-red-500" },
};

const auditLog = [
    { action: "Connexion Bureau", user: "Président", time: "Il y a 10 min", type: "info" },
    { action: "Convention partagée", user: "Trésorier", time: "Il y a 25 min", type: "success" },
    { action: "Tentative d'accès hors zone", user: "Inconnu", time: "Il y a 1h", type: "warning" },
    { action: "Archive vérifiée", user: "Système", time: "Il y a 4h", type: "info" },
    { action: "Ordre du jour validé", user: "Secrétaire", time: "Il y a 5h", type: "success" },
];

export default function OrgCompliancePage() {
    const { orgName } = useOrganization();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        toast.info("Analyse de la conformité associative en cours...");
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsGenerating(false);
        toast.success(
            <div className="flex flex-col gap-1">
                <span className="font-semibold">Rapport de conformité prêt</span>
                <span className="text-xs text-muted-foreground">Le rapport d&apos;audit a été généré et enregistré dans vos documents.</span>
            </div>
        );
    };

    const handleExportAudit = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsExporting(false);
        toast.success("Logs d'audit exportés avec succès pour le Conseil.");
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-violet-500" />
                        Sécurité & Conformité
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tableau de bord de conformité — {orgName}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExportAudit}
                        disabled={isExporting}
                        className="text-xs h-9 border-white/10 hover:bg-white/5"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Exporter les logs
                    </Button>
                    <Button 
                        size="sm"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="text-xs h-9 bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30 transition-all"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        Générer un rapport
                    </Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceMetrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
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

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                {/* Compliance Checks */}
                <Card className="glass border-white/5 flex flex-col h-full hover:border-white/10 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Contrôles de sécurité de l&apos;organisme</CardTitle>
                        <CardDescription className="text-[11px]">Surveillance des standards de transparence donateurs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 flex-1 relative min-h-[300px]">
                        {isGenerating && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                                    <span className="text-xs font-medium text-violet-400">Analyse Associative en cours...</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {complianceChecks.map((check, i) => {
                                const { icon: StatusIcon, className } = statusIcons[check.status];
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:border-violet-500/10 hover:bg-violet-500/[0.02] transition-colors"
                                    >
                                        <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 ${check.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : ''}`}>
                                            <StatusIcon className={`h-4 w-4 ${className}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className="text-xs font-semibold">{check.label}</p>
                                                {check.status === 'warning' && (
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/30 text-amber-500">Examen conseillé</Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">{check.detail}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log */}
                <Card className="glass border-white/5 flex flex-col h-full hover:border-white/10 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-cyan-500" />
                            Journal d&apos;audit
                        </CardTitle>
                        <CardDescription className="text-[11px]">Traçabilité des accès et actions bureautiques</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden relative min-h-[300px]">
                        {isExporting && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-6 w-6 text-foreground animate-spin" />
                                    <span className="text-xs font-medium text-muted-foreground">Préparation de l&apos;export CSV...</span>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2 h-full pr-1 overflow-auto custom-scrollbar">
                            {auditLog.map((entry, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="pt-0.5">
                                        <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-background shrink-0 ${
                                            entry.type === "success" ? "bg-emerald-500" :
                                            entry.type === "warning" ? "bg-amber-500" : "bg-cyan-500"
                                        }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate group-hover:text-amber-500 transition-colors">{entry.action}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <div className="h-3 w-3 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[8px] font-bold">{entry.user.charAt(0)}</span>
                                                </div>
                                                <span className="truncate max-w-[80px]">{entry.user}</span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">•</span>
                                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">{entry.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
