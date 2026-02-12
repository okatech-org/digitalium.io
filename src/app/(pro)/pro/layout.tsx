"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: Pro Space inner wrapper
// Wraps all /pro/* pages with ProLayout sidebar
// ═══════════════════════════════════════════════

import React from "react";
import ProLayout from "@/components/layout/ProLayout";

export default function ProSpaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProLayout>{children}</ProLayout>;
}
