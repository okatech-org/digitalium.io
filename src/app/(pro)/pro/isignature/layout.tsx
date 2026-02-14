"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: iSignature
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
import { Badge } from "@/components/ui/badge";

const TABS = [
    { label: "Signatures", href: "/pro/isignature", icon: PenTool, exact: true },
    { label: "En attente", href: "/pro/isignature/pending", icon: Clock, badge: 3 },
    { label: "Workflows", href: "/pro/isignature/workflows", icon: Workflow },
    { label: "Analytics", href: "/pro/isignature/analytics", icon: BarChart3 },
];

export default function ISignatureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Check if we're on a detail page (e.g. /pro/isignature/sig-1)
    const isDetailPage = /^\/pro\/isignature\/[^/]+$/.test(pathname)
        && !TABS.some((t) => t.href === pathname);

    return (
        <div className="space-y-0">
            {/* Horizontal tab bar — hidden on detail pages */}
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
                                        {tab.badge && (
                                            <Badge
                                                className={`h-4 min-w-4 px-1 text-[9px] font-bold ${isActive
                                                        ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                                                        : "bg-white/5 text-zinc-500 border-white/10"
                                                    }`}
                                            >
                                                {tab.badge}
                                            </Badge>
                                        )}
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
