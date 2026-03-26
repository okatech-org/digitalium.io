"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: SubAdmin Dashboard
// Uses shared UnifiedDashboard with admin theme
// ═══════════════════════════════════════════════════════════

import { UnifiedDashboard, DASHBOARD_THEMES, type DashboardConfig } from "@/components/dashboard/UnifiedDashboard";

const config: DashboardConfig = {
    spacePrefix: "/subadmin",
    moduleBase: "/subadmin/digitalium",
    teamLink: "/subadmin/digitalium/team",
    theme: DASHBOARD_THEMES.admin, // Same theme as admin
};

export default function SubAdminDashboardPage() {
    return <UnifiedDashboard config={config} />;
}
