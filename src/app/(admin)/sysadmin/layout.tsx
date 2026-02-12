// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SysAdmin sub-layout
// Wraps /sysadmin/* pages in SysAdminSpaceLayout
// ═══════════════════════════════════════════════

import SysAdminSpaceLayout from "@/components/layout/SysAdminSpaceLayout";

export default function SysAdminSubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SysAdminSpaceLayout>{children}</SysAdminSpaceLayout>;
}
