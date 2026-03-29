// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Cron Jobs
// Scheduled tasks for lifecycle + NEOCORTEX rhythm
// ═══════════════════════════════════════════════

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ─── Lifecycle State Transitions ──────────────
// Runs every hour at minute 0
// Transitions: active → semi_active → archived
crons.hourly(
    "lifecycle-transitions",
    { minuteUTC: 0 },
    internal.lifecycleScheduler.processTransitions
);

// ─── Retention Alert Processing ───────────────
// Runs every hour at minute 30
// Sends pre-archive and pre-deletion alerts
crons.hourly(
    "retention-alerts",
    { minuteUTC: 30 },
    internal.lifecycleScheduler.processAlerts
);

// ─── Phase 16 : Scheduled Archives ──────────────
// Runs every 6 hours — processes folders with archiveSchedule
crons.interval(
    "scheduled-archives",
    { hours: 6 },
    internal.automationEngine.processScheduledArchives
);

// ═══════════════════════════════════════════════
// NEOCORTEX — Rythme Circadien
// ═══════════════════════════════════════════════

// ─── Health Check (toutes les 5 minutes) ─────
crons.interval(
    "neocortex-health-check",
    { minutes: 5 },
    internal.neocortex_monitoring.healthCheck
);

// ─── Métriques (toutes les heures à minute 15) ─
crons.hourly(
    "neocortex-metriques",
    { minuteUTC: 15 },
    internal.hippocampe.calculerMetriques
);

// ─── Nettoyage signaux expirés (quotidien à 3h) ─
crons.daily(
    "neocortex-nettoyage-signaux",
    { hourUTC: 3, minuteUTC: 0 },
    internal.limbique.nettoyerSignaux
);

// ─── Purge métriques > 7j (quotidien à 4h) ─────
crons.daily(
    "neocortex-purge-metriques",
    { hourUTC: 4, minuteUTC: 0 },
    internal.neocortex_monitoring.purgerMetriques
);

// ═══════════════════════════════════════════════
// ISIGNATURE — Rappels automatiques
// ═══════════════════════════════════════════════

// ─── Signature Reminders (quotidien à 8h UTC) ───
// Envoie des rappels pour les signatures expirant dans 3 jours
crons.daily(
    "signature-reminders",
    { hourUTC: 8, minuteUTC: 0 },
    internal.signatureReminders.processReminders
);

// ═══════════════════════════════════════════════
// COMPLIANCE — Audit automatique quotidien
// ═══════════════════════════════════════════════

// ─── Compliance Audit (quotidien à 2h UTC) ──────
crons.daily(
    "compliance-audit",
    { hourUTC: 2, minuteUTC: 0 },
    internal.complianceCheckerMutations.runScheduledAudits
);

export default crons;
