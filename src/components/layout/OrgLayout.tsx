"use client"; // Force HMR cache invalidation

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, FileText, Archive, PenTool, Users, Settings, LogOut,
    Menu, ChevronRight as ChevronRightIcon, Shield, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageInfoButton } from "@/components/shared/PageInfoButton";
import { PageArchitectButton } from "@/components/shared/PageArchitectButton";
import { ORG_PAGE_INFO } from "@/config/page-info/org";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import { getUserInitials, getUserDisplayName, getRoleLabel } from "@/config/role-helpers";

const NAV_SECTIONS = [
    {
        title: "Modules Métier",
        items: [
            { label: "Dashboard", href: "/org", icon: LayoutDashboard },
            { label: "iDocument", href: "/org/idocument", icon: FileText },
            { label: "iArchive", href: "/org/iarchive", icon: Archive },
            { label: "iSignature", href: "/org/isignature", icon: PenTool },
            { label: "iAsted", href: "/org/iasted", icon: Bot },
        ],
    },
    {
        title: "Organisation",
        items: [
            { label: "Équipe", href: "/org/team", icon: Users },
            { label: "Sécurité & Conformité", href: "/org/compliance", icon: Shield },
            { label: "Paramètres", href: "/org/settings", icon: Settings },
        ],
    },
];

const ROUTE_LABELS: Record<string, string> = {
    org: "Espace Organisme",
    idocument: "iDocument",
    iarchive: "iArchive",
    isignature: "iSignature",
    compliance: "Conformité",
    iasted: "iAsted",
    settings: "Paramètres",
    team: "Équipe",
};

export default function OrgLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { orgName } = useOrganization();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Breadcrumb logic
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        const isLast = index === pathSegments.length - 1;
        const label = ROUTE_LABELS[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1);
        return { label, href, isLast };
    });

    const segmentKey = pathname === "/org" ? "dashboard" : pathname.replace("/org/", "");
    const pageInfoData = ORG_PAGE_INFO[segmentKey];

    const renderSidebar = () => (
        <div className="flex flex-col h-full bg-background border-r border-white/5">
            <div className="p-4 md:p-6 shrink-0 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <span className="text-white font-bold text-lg">O</span>
                </div>
                <div>
                    <h2 className="font-bold text-sm tracking-tight text-zinc-100">{orgName}</h2>
                    <p className="text-[10px] font-medium text-violet-400">Espace Organisme</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
                {NAV_SECTIONS.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        <h3 className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            {section.title}
                        </h3>
                        {section.items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/org" && pathname.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative group ${isActive ? "text-violet-400 bg-violet-500/10 font-medium" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"}`}>
                                        {isActive && (
                                            <motion.div layoutId="org-active-nav" className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                        )}
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="p-4 shrink-0 border-t border-white/5 bg-background">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full h-12 flex items-center justify-start gap-3 px-2 hover:bg-white/5">
                            <Avatar className="h-8 w-8 rounded-lg border border-white/10 ring-2 ring-transparent">
                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white text-xs rounded-lg">
                                    {getUserInitials(user)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-zinc-200 truncate">{getUserDisplayName(user)}</p>
                                <p className="text-[10px] text-zinc-500 truncate">{getRoleLabel(user)}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass border-white/10 text-white">
                        <DropdownMenuLabel>Mon compte Associatif</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" /> Paramètres
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer" onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen bg-background text-foreground flex">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-[280px] shrink-0 sticky top-0 h-screen z-40">
                    {renderSidebar()}
                </div>

                {/* Mobile Sheet */}
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetContent side="left" className="w-[280px] p-0 border-r border-white/5 bg-background [&>button]:hidden">
                        <SheetTitle className="sr-only">Menu de navigation Organisme</SheetTitle>
                        {renderSidebar()}
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen relative max-w-[100vw]">
                    {/* Header */}
                    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-background/80 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 -ml-2 text-zinc-400 hover:text-white" onClick={() => setIsMobileOpen(true)}>
                                <Menu className="h-5 w-5" />
                            </Button>
                            <nav className="hidden sm:flex items-center text-sm font-medium text-zinc-400 max-w-[50vw] overflow-hidden whitespace-nowrap">
                                {breadcrumbs.map((crumb, idx) => (
                                    <React.Fragment key={crumb.href}>
                                        {idx > 0 && <ChevronRightIcon className="h-4 w-4 mx-2 text-zinc-600 shrink-0" />}
                                        <Link href={crumb.href} className={`truncate transition-colors ${crumb.isLast ? "text-violet-400 cursor-default" : "hover:text-zinc-200"}`} onClick={(e) => crumb.isLast && e.preventDefault()}>
                                            {crumb.label}
                                        </Link>
                                    </React.Fragment>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            {pageInfoData && (
                                <>
                                    <PageArchitectButton info={pageInfoData} accentColor="violet" />
                                    <PageInfoButton info={pageInfoData} accentColor="violet" />
                                </>
                            )}
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
