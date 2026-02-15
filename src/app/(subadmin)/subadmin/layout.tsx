"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: SubAdmin Space Wrapper
// Wraps all /subadmin/* pages with SubAdminLayout sidebar
// ═══════════════════════════════════════════════

import React from "react";
import SubAdminLayout from "@/components/layout/SubAdminLayout";

export default function SubAdminSpaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SubAdminLayout>{children}</SubAdminLayout>;
}
