// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Admin sub-layout
// Wraps /admin/* pages in AdminUnifiedLayout
// Unified: Business + Infrastructure + Modules
// ═══════════════════════════════════════════════

import AdminUnifiedLayout from "@/components/layout/AdminUnifiedLayout";

export default function AdminSubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminUnifiedLayout>{children}</AdminUnifiedLayout>;
}
