"use client";

// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin Dashboard
// Uses shared UnifiedDashboard with admin theme
// ═══════════════════════════════════════════════════════════

import { UnifiedDashboard, DASHBOARD_THEMES, type DashboardConfig } from "@/components/dashboard/UnifiedDashboard";

const config: DashboardConfig = {
    spacePrefix: "/admin",
    moduleBase: "/admin/digitalium",
    teamLink: "/admin/digitalium/team",
    theme: DASHBOARD_THEMES.admin,
};

export default function AdminDashboardPage() {
    return <UnifiedDashboard config={config} />;
}
