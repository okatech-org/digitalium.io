// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: Auth Layout
// No protection — public pages (login/register)
// ═══════════════════════════════════════════════

import dynamic from "next/dynamic";

const DemoAccountSwitcher = dynamic(
    () => import("@/components/shared/DemoAccountSwitcher"),
    { ssr: false }
);

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <DemoAccountSwitcher />
        </>
    );
}
