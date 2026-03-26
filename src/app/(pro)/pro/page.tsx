"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: Pro Dashboard
// Uses shared UnifiedDashboard with violet/indigo theme
// ═══════════════════════════════════════════════════════════

import { UnifiedDashboard, DASHBOARD_THEMES, type DashboardConfig } from "@/components/dashboard/UnifiedDashboard";

const config: DashboardConfig = {
    spacePrefix: "/pro",
    moduleBase: "/pro",
    teamLink: "/pro/team",
    theme: DASHBOARD_THEMES.pro,
};

export default function ProDashboardPage() {
    return <UnifiedDashboard config={config} />;
}
