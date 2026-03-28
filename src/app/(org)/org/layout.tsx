"use client";

import OrgLayout from "@/components/layout/OrgLayout";

export default function RootOrgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <OrgLayout>{children}</OrgLayout>;
}
