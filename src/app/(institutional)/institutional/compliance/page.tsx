"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Conformité Institutionnel
// Sécurité & conformité réglementaire
// ═══════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
    Shield, CheckCircle2, AlertTriangle, XCircle,
    Lock, FileCheck, Activity, Clock,
    TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/contexts/OrganizationContext";

const complianceMetrics = [
    { label: "Score global", value: "94%", icon: Shield, color: "text-emerald-400", bgColor: "bg-emerald-500/5 border-emerald-500/10" },
    { label: "Documents conformes", value: "3,181", icon: FileCheck, color: "text-teal-400", bgColor: "bg-teal-500/5 border-teal-500/10" },
    { label: "Alertes actives", value: "2", icon: AlertTriangle, color: "text-amber-400", bgColor: "bg-amber-500/5 border-amber-500/10" },
    { label: "Audit trail", value: "100%", icon: Activity, color: "text-cyan-400", bgColor: "bg-cyan-500/5 border-cyan-500/10" },
];

const complianceChecks = [
    { label: "Rétention documentation légale", status: "pass", detail: "Toutes les archives légales respectent la durée de rétention de 10 ans" },
    { label: "Signatures numériques valides", status: "pass", detail: "156/156 signatures vérifiées et certifiées" },
    { label: "Chiffrement au repos", status: "pass", detail: "AES-256 actif sur tous les coffres-forts" },
    { label: "Contrôle d'accès RBAC", status: "pass", detail: "5 niveaux d'accès configurés et audités" },
    { label: "Expiration certificats SSL", status: "warning", detail: "2 certificats expirent dans 30 jours" },
    { label: "Sauvegarde off-site", status: "pass", detail: "Dernière sauvegarde : il y a 4 heures" },
    { label: "Conformité RGPD", status: "pass", detail: "Registre de traitement à jour" },
    { label: "Journalisation des accès", status: "warning", detail: "Rotation des logs à activer sur 1 module" },
];

const statusIcons: Record<string, { icon: React.ElementType; className: string }> = {
    pass: { icon: CheckCircle2, className: "text-emerald-400" },
    warning: { icon: AlertTriangle, className: "text-amber-400" },
    fail: { icon: XCircle, className: "text-red-400" },
};

const auditLog = [
    { action: "Connexion admin", user: "Admin Pêche", time: "Il y a 10 min", type: "info" },
    { action: "Document approuvé", user: "DGPA", time: "Il y a 25 min", type: "success" },
    { action: "Tentative d'accès refusée", user: "Inconnu", time: "Il y a 1h", type: "warning" },
    { action: "Archive vérifiée", user: "Système", time: "Il y a 2h", type: "info" },
    { action: "Signature validée", user: "Ministre", time: "Il y a 3h", type: "success" },
];

export default function InstitutionalCompliancePage() {
    const { orgName } = useOrganization();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    Sécurité & Conformité
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Tableau de bord de conformité réglementaire — {orgName}
                </p>
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
                            <Card className={`${m.bgColor} border`}>
                                <CardContent className="p-4 text-center">
                                    <Icon className={`h-6 w-6 mx-auto mb-2 ${m.color}`} />
                                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Compliance Checks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white/[0.02] border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Vérifications de conformité</CardTitle>
                        <CardDescription className="text-[11px]">État des contrôles de sécurité</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {complianceChecks.map((check, i) => {
                            const { icon: StatusIcon, className } = statusIcons[check.status];
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                                >
                                    <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${className}`} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium">{check.label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{check.detail}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Audit Log */}
                <Card className="bg-white/[0.02] border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-cyan-400" />
                            Journal d&apos;audit
                        </CardTitle>
                        <CardDescription className="text-[11px]">Activité de sécurité récente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {auditLog.map((entry, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                            >
                                <div className={`h-2 w-2 rounded-full shrink-0 ${entry.type === "success" ? "bg-emerald-400" :
                                        entry.type === "warning" ? "bg-amber-400" : "bg-gray-400"
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{entry.action}</p>
                                    <p className="text-[10px] text-muted-foreground">{entry.user} · {entry.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
