// ═══════════════════════════════════════════════
// ComplianceReportExport — Generates printable compliance report
// Opens an HTML document with org retention info
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// ─── Types ────────────────────────────────────

interface ComplianceReportExportProps {
    orgId: Id<"organizations">;
    orgName?: string;
}

interface ArchiveCategory {
    name: string;
    slug: string;
    retentionYears: number;
    ohadaReference?: string;
    activeDurationYears?: number;
    semiActiveDurationYears?: number;
    hasSemiActivePhase?: boolean;
    isPerpetual?: boolean;
    defaultConfidentiality: string;
    isActive: boolean;
}

// ─── Report generator ─────────────────────────

function generateReportHTML(
    orgName: string,
    categories: ArchiveCategory[],
    stats: {
        categories: number;
        totalArchives: number;
        totalExpired: number;
        totalOnHold: number;
        totalDestroyed: number;
        destructionCertificates: number;
        byCategorySlug: Record<string, { total: number; active: number; expired: number; onHold: number }>;
    }
): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

    const catRows = categories
        .filter((c) => c.isActive)
        .map((cat) => {
            const catStats = stats.byCategorySlug[cat.slug] ?? { total: 0, active: 0, expired: 0, onHold: 0 };
            const phases = [];
            if (cat.activeDurationYears) phases.push(`Active: ${cat.activeDurationYears} ans`);
            if (cat.hasSemiActivePhase && cat.semiActiveDurationYears) phases.push(`Semi-active: ${cat.semiActiveDurationYears} ans`);
            const remaining = cat.retentionYears - (cat.activeDurationYears ?? 0) - (cat.hasSemiActivePhase ? (cat.semiActiveDurationYears ?? 0) : 0);
            if (remaining > 0) phases.push(`Archivée: ${remaining} ans`);

            return `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500">${cat.name}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${cat.isPerpetual ? "∞" : cat.retentionYears + " ans"}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:11px;color:#666">${phases.join(" → ") || "—"}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:11px;color:#888">${cat.ohadaReference ?? "—"}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${catStats.total}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${catStats.expired}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:11px">${cat.defaultConfidentiality}</td>
            </tr>`;
        })
        .join("\n");

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport de Conformité Archivistique — ${orgName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; padding: 40px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #6d28d9; padding-bottom: 20px; }
        .header h1 { font-size: 22px; color: #6d28d9; }
        .header .meta { text-align: right; font-size: 12px; color: #666; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 16px; color: #6d28d9; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f8f5ff; color: #6d28d9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #6d28d9; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat-card { background: #f8f5ff; border: 1px solid #e5dff5; border-radius: 8px; padding: 16px; text-align: center; }
        .stat-card .value { font-size: 28px; font-weight: 700; color: #6d28d9; }
        .stat-card .label { font-size: 11px; color: #666; margin-top: 4px; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; text-align: center; }
        @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom:20px">
        <button onclick="window.print()" style="background:#6d28d9;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px">
            🖨️ Imprimer / Exporter PDF
        </button>
    </div>

    <div class="header">
        <div>
            <h1>📋 Rapport de Conformité Archivistique</h1>
            <p style="font-size:14px;color:#444;margin-top:4px">${orgName}</p>
        </div>
        <div class="meta">
            <p>Généré le ${dateStr}</p>
            <p>DIGITALIUM.IO</p>
        </div>
    </div>

    <div class="section">
        <h2>📊 Statistiques globales</h2>
        <div class="stats-grid">
            <div class="stat-card"><div class="value">${stats.categories}</div><div class="label">Catégories actives</div></div>
            <div class="stat-card"><div class="value">${stats.totalArchives}</div><div class="label">Archives totales</div></div>
            <div class="stat-card"><div class="value">${stats.totalExpired}</div><div class="label">Archives expirées</div></div>
            <div class="stat-card"><div class="value">${stats.totalOnHold}</div><div class="label">En gel juridique</div></div>
            <div class="stat-card"><div class="value">${stats.totalDestroyed}</div><div class="label">Détruites</div></div>
            <div class="stat-card"><div class="value">${stats.destructionCertificates}</div><div class="label">Certificats destruction</div></div>
        </div>
    </div>

    <div class="section">
        <h2>📂 Catégories de rétention</h2>
        <table>
            <thead>
                <tr>
                    <th>Catégorie</th>
                    <th style="text-align:center">Durée</th>
                    <th>Phases du cycle de vie</th>
                    <th>Référence OHADA</th>
                    <th style="text-align:center">Archives</th>
                    <th style="text-align:center">Expirées</th>
                    <th>Confidentialité</th>
                </tr>
            </thead>
            <tbody>${catRows}</tbody>
        </table>
    </div>

    <div class="section">
        <h2>✅ Conformité OHADA</h2>
        <ul style="padding-left:20px;font-size:13px;color:#444">
            <li>Durées de conservation alignées sur l'Acte Uniforme Comptable OHADA</li>
            <li>Cycle de vie en 3 phases : Active → Semi-active → Archivée</li>
            <li>Intégrité garantie par double hash SHA-256 (fichier + contenu)</li>
            <li>Certificats de destruction avec traçabilité complète</li>
            <li>Gel juridique (Legal Hold) disponible pour litige et audit</li>
            <li>Coffre-fort numérique pour conservation perpétuelle</li>
        </ul>
    </div>

    <div class="footer">
        Rapport généré automatiquement par DIGITALIUM.IO — Plateforme d'archivage numérique intelligent<br>
        Ce document est informatif et ne constitue pas un certificat de conformité.
    </div>
</body>
</html>`;
}

// ─── Main Component ───────────────────────────

export default function ComplianceReportExport({ orgId, orgName }: ComplianceReportExportProps) {
    const [generating, setGenerating] = useState(false);
    const categories = useQuery(api.archiveConfig.listCategories, { organizationId: orgId });
    const stats = useQuery(api.archiveConfig.getComplianceStats, { organizationId: orgId });

    const handleExport = () => {
        if (!categories || !stats) return;
        setGenerating(true);

        try {
            const html = generateReportHTML(
                orgName ?? "Organisation",
                categories as ArchiveCategory[],
                stats
            );

            const w = window.open("", "_blank");
            if (w) {
                w.document.write(html);
                w.document.close();
            }
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Button
            size="sm"
            onClick={handleExport}
            disabled={generating || !categories || !stats}
            className="h-7 text-xs gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25"
        >
            {generating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <FileDown className="h-3 w-3" />
            )}
            Rapport de conformité
        </Button>
    );
}
