"use client";

import React from "react";
import { ProtectedRoute } from "@/components/guards";
import SysAdminSpaceLayout from "@/components/layout/SysAdminSpaceLayout";

export default function SysAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute requireAdmin>
            <SysAdminSpaceLayout>{children}</SysAdminSpaceLayout>
        </ProtectedRoute>
    );
}
