"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: iArchive (Institutional)
// Horizontal tab nav for sub-sections
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Archive,
    Lock,
    Shield,
} from "lucide-react";

const TABS = [
    { label: "Archives", href: "/institutional/iarchive", icon: Archive, exact: true },
    { label: "Coffre-Fort", href: "/institutional/iarchive/vault", icon: Lock },
    { label: "Certificats", href: "/institutional/iarchive/certificates", icon: Shield },
];

export default function IArchiveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hide tabs on category detail pages (fiscal, social, legal, client)
    const isDetailPage =
        TABS.every((t) => t.href !== pathname) &&
        !pathname.endsWith("/iarchive");

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
