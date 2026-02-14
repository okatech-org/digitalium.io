"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: iDocument (Institutional)
// Horizontal tab nav for sub-sections
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileText,
    PenLine,
    FolderOpen,
    FileStack,
} from "lucide-react";

const TABS = [
    { label: "Documents", href: "/institutional/idocument", icon: FileText, exact: true },
    { label: "Éditeur", href: "/institutional/idocument/edit", icon: PenLine },
    { label: "Partagés", href: "/institutional/idocument/shared", icon: FolderOpen },
    { label: "Templates", href: "/institutional/idocument/templates", icon: FileStack },
];

export default function IDocumentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hide tabs on detail pages (e.g. /institutional/idocument/edit/[id])
    const isDetailPage =
        TABS.every((t) => t.href !== pathname) &&
        !pathname.endsWith("/idocument");

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
