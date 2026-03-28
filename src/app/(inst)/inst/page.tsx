"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: Institutional Dashboard
// Uses shared UnifiedDashboard with emerald/teal theme
// ═══════════════════════════════════════════════════════════

import { UnifiedDashboard, DASHBOARD_THEMES, type DashboardConfig } from "@/components/dashboard/UnifiedDashboard";

const config: DashboardConfig = {
    spacePrefix: "/inst",
    moduleBase: "/inst",
    teamLink: "/inst/team",
    theme: DASHBOARD_THEMES.institutional,
};

export default function InstitutionalDashboardPage() {
    return <UnifiedDashboard config={config} />;
}
