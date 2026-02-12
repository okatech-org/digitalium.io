// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Admin sub-layout
// Wraps /admin/* pages in AdminSpaceLayout
// ═══════════════════════════════════════════════

import AdminSpaceLayout from "@/components/layout/AdminSpaceLayout";

export default function AdminSubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminSpaceLayout>{children}</AdminSpaceLayout>;
}
