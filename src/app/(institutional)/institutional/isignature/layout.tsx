"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: iSignature (Institutional)
// Horizontal tab nav for sub-sections
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    PenTool,
    Clock,
    Workflow,
    BarChart3,
} from "lucide-react";

const TABS = [
    { label: "Signatures", href: "/institutional/isignature", icon: PenTool, exact: true },
    { label: "En attente", href: "/institutional/isignature/pending", icon: Clock, badge: 3 },
    { label: "Workflows", href: "/institutional/isignature/workflows", icon: Workflow },
    { label: "Analytics", href: "/institutional/isignature/analytics", icon: BarChart3 },
];

export default function ISignatureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Check if we're on a detail page (e.g. /institutional/isignature/sig-1)
    const knownSubPaths = TABS.map((t) => t.href);
    const isDetailPage =
        !knownSubPaths.some((p) => p === pathname) &&
        !pathname.endsWith("/isignature");

    return (
        <div className="space-y-0">
            {!isDetailPage && (
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
                                            ? "border-violet-500 text-violet-300"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                                            }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {tab.label}
                                        {"badge" in tab && tab.badge ? (
                                            <span className="ml-1 h-4 min-w-[16px] rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center justify-center px-1">
                                                {tab.badge}
                                            </span>
                                        ) : null}
                                    </button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
            {children}
        </div>
    );
}
