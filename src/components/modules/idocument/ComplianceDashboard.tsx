"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Innovation I+K: Compliance Dashboard
// Score de conformité + anomalies + prédictions lifecycle
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
    Shield, AlertTriangle, CheckCircle2, Info, Loader2,
    TrendingUp, BarChart3, RefreshCw, Calendar, HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function ScoreRing({ score }: { score: number }) {
    const color = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400";
    const bgColor = score >= 80 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-rose-500/10";
    return (
        <div className={`relative w-24 h-24 rounded-full ${bgColor} flex items-center justify-center`}>
            <span className={`text-2xl font-bold ${color}`}>{score}</span>
            <span className={`text-[10px] ${color} absolute bottom-5`}>/100</span>
        </div>
    );
}

const SEVERITY_CONFIG = {
    critical: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Critique" },
    warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Attention" },
    info: { icon: Info, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", label: "Info" },
};

export default function ComplianceDashboard({ orgId }: { orgId: Id<"organizations"> }) {
    const auditReport = useQuery(api.complianceCheckerQueries.getLatestReport, { organizationId: orgId, type: "audit" });
    const forecastReport = useQuery(api.complianceCheckerQueries.getLatestReport, { organizationId: orgId, type: "forecast" });
    const runAudit = useAction(api.complianceChecker.runComplianceAudit);
    const runForecast = useAction(api.complianceChecker.generateForecast);
    const [loading, setLoading] = React.useState(false);

    const handleRunAudit = async () => {
        setLoading(true);
        try {
            await runAudit({ organizationId: orgId });
            await runForecast({ organizationId: orgId });
            toast.success("Audit de conformité terminé");
        } catch {
            toast.error("Erreur lors de l'audit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-violet-400" />
                    <h2 className="text-base font-semibold">Conformité & Intelligence</h2>
                </div>
                <Button
                    size="sm"
                    onClick={handleRunAudit}
                    disabled={loading}
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 border-0 gap-1.5 text-xs"
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Lancer un audit
                </Button>
            </div>

            {/* Score + Stats */}
            {auditReport && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Score */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center">
                        <ScoreRing score={auditReport.score} />
                        <p className="text-xs text-muted-foreground mt-2">Score de conformité</p>
                        <p className="text-[10px] text-muted-foreground">
                            {new Date(auditReport.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                    </div>

                    {/* Stats cards */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs text-muted-foreground">Documents catégorisés</span>
                        </div>
                        <p className="text-xl font-bold">
                            {auditReport.stats?.documentsWithCategory ?? 0}
                            <span className="text-sm text-muted-foreground font-normal"> / {auditReport.stats?.totalDocuments ?? 0}</span>
                        </p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-violet-400" />
                            <span className="text-xs text-muted-foreground">Certificats d&apos;intégrité</span>
                        </div>
                        <p className="text-xl font-bold">{auditReport.stats?.documentsWithCertificate ?? 0}</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-400" />
                            <span className="text-xs text-muted-foreground">Expirant sous 90j</span>
                        </div>
                        <p className="text-xl font-bold">{auditReport.stats?.expiringNext90Days ?? 0}</p>
                    </div>
                </div>
            )}

            {/* Forecast */}
            {forecastReport?.stats?.expiringByQuarter && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-cyan-400" />
                        <h3 className="text-sm font-semibold">Prévisions {new Date().getFullYear()}</h3>
                        <Badge className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Innovation K</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {(["q1", "q2", "q3", "q4"] as const).map((q, i) => (
                            <div key={q} className="text-center p-3 bg-white/[0.02] rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">T{i + 1}</p>
                                <p className="text-lg font-bold">
                                    {forecastReport.stats!.expiringByQuarter![q]}
                                </p>
                                <p className="text-[9px] text-muted-foreground">expirations</p>
                            </div>
                        ))}
                    </div>
                    {forecastReport.stats.storageToFreeBytes !== undefined && forecastReport.stats.storageToFreeBytes > 0 && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <HardDrive className="h-3 w-3" />
                            ~{Math.round(forecastReport.stats.storageToFreeBytes / (1024 * 1024))} MB de stockage libérable
                        </div>
                    )}
                </div>
            )}

            {/* Issues */}
            {auditReport && auditReport.issues.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-amber-400" />
                        <h3 className="text-sm font-semibold">Anomalies détectées</h3>
                        <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                            {auditReport.issues.length}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        {auditReport.issues.map((issue, i) => {
                            const config = SEVERITY_CONFIG[issue.severity];
                            const Icon = config.icon;
                            return (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} border ${config.border}`}>
                                    <Icon className={`h-4 w-4 ${config.color} shrink-0 mt-0.5`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`text-[10px] py-0 ${config.bg} ${config.color} ${config.border}`}>
                                                {config.label}
                                            </Badge>
                                            <Badge className="text-[10px] py-0 bg-white/5 text-white/40 border-white/10">
                                                {issue.category}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-white/80 mt-1">{issue.message}</p>
                                        {issue.suggestion && (
                                            <p className="text-[10px] text-muted-foreground mt-1 italic">{issue.suggestion}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {auditReport && auditReport.recommendations.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Recommandations
                    </h3>
                    <ul className="space-y-1.5">
                        {auditReport.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-emerald-400 shrink-0">•</span>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Empty state */}
            {!auditReport && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
                    <Shield className="h-10 w-10 text-violet-400/40 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold mb-1">Aucun audit de conformité</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        Lancez votre premier audit pour obtenir un score de conformité et détecter les anomalies.
                    </p>
                    <Button
                        size="sm"
                        onClick={handleRunAudit}
                        disabled={loading}
                        className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 border-0"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                        Lancer le premier audit
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
