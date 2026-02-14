"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: iAsted (Institutional)
// Horizontal tab nav: iAsted + Analytics IA
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, BarChart3 } from "lucide-react";

const TABS = [
    { label: "iAsted", href: "/institutional/iasted", icon: Bot, exact: true },
    { label: "Analytics IA", href: "/institutional/iasted/analytics", icon: BarChart3 },
];

export default function IAstedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-0">
            <div className="mb-6 border-b border-white/5">
                <nav className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-none">
                    {TABS.map((tab) => {
                        const isActive = tab.exact
                            ? pathname === tab.href
                            : pathname.startsWith(tab.href);
                        const Icon = tab.icon;
                        return (
                            <Link key={tab.href} href={tab.href}>
                                <button
                                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                                        ? "border-cyan-500 text-cyan-300"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                                        }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                </button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            {children}
        </div>
    );
}
