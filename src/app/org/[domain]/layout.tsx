// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: Public Organization Page
// Minimal layout — no sidebar, no admin chrome
// ═══════════════════════════════════════════════

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Organisation — DIGITALIUM.IO",
    description: "Page publique de l'organisation sur DIGITALIUM.IO",
};

export default function OrgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
