// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: Cron Jobs
// Scheduled tasks for lifecycle management
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

export default crons;
