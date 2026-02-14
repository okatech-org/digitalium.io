// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Layout: InstitutionalLayout
// Emerald/teal theme · Collapsible sidebar · Full navigation
// Dashboard · iDocument · iArchive · iSignature · Formation
// ═══════════════════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    Archive,
    PenTool,
    Bot,
    BarChart3,
    Workflow,
    Users,
    Settings,
    GraduationCap,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Search,
    Bell,
    LogOut,
    Menu,
    User as UserIcon,
    SlidersHorizontal,
    Building2,
    Shield,
    Landmark,
    Sun,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageInfoButton } from "@/components/shared/PageInfoButton";
import { PageArchitectButton } from "@/components/shared/PageArchitectButton";
import { INSTITUTIONAL_PAGE_INFO } from "@/config/page-info/institutional";
import { useAuth } from "@/hooks/useAuth";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { getUserInitials, getUserDisplayName, getRoleLabel } from "@/config/role-helpers";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Navigation Config ─────────────────────────── */

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

function buildNavSections(userLevel: number): NavSection[] {
    const sections: NavSection[] = [
        {
            title: "Principal",
            items: [
                { label: "Dashboard", href: "/institutional", icon: LayoutDashboard },
            ],
        },
        {
            title: "Modules",
            items: [
                { label: "iDocument", href: "/institutional/idocument", icon: FileText },
                { label: "iArchive", href: "/institutional/iarchive", icon: Archive },
                { label: "iSignature", href: "/institutional/isignature", icon: PenTool },
                { label: "iAsted", href: "/institutional/iasted", icon: Bot },
            ],
        },
    ];

    // Admin section only for level ≤ 3 (managers and above)
    if (userLevel <= 3) {
        sections.push({
            title: "Administration",
            items: [
                { label: "Workflows", href: "/institutional/workflows", icon: Workflow },
                { label: "Utilisateurs", href: "/institutional/users", icon: Users },
                { label: "Sécurité & Conformité", href: "/institutional/compliance", icon: Shield },
                ...(userLevel <= 2
                    ? [{ label: "Console SubAdmin", href: "/subadmin", icon: SlidersHorizontal }]
                    : []),
            ],
        });
    }

    sections.push({
        title: "Compte",
        items: [
            { label: "Formation", href: "/institutional/formation", icon: GraduationCap },
            { label: "Paramètres", href: "/institutional/parametres", icon: Settings },
        ],
    });

    return sections;
}

/* ─── Breadcrumb builder ────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    institutional: "Institutionnel",
    idocument: "iDocument",
    iarchive: "iArchive",
    isignature: "iSignature",
    iasted: "iAsted",
    analytics: "Analytics IA",
    workflows: "Workflows",
    users: "Utilisateurs",
    compliance: "Conformité",
    formation: "Formation",
    parametres: "Paramètres",
};

function buildBreadcrumbs(pathname: string) {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, i) => ({
        label: ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1),
        href: "/" + parts.slice(0, i + 1).join("/"),
        isLast: i === parts.length - 1,
    }));
}

/* ─── Sidebar Nav Link ──────────────────────────── */

function NavLink({
    item,
    collapsed,
    active,
}: {
    item: NavItem;
    collapsed: boolean;
    active: boolean;
}) {
    const content = (
        <Link
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${active
                ? "bg-emerald-500/20 text-foreground"
                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                }`}
        >
            <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-emerald-400" : ""}`} />
            {!collapsed && (
                <>
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-500/15 text-emerald-400 border-0">
                            {item.badge}
                        </Badge>
                    )}
                    {active && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                </>
            )}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                    {item.label}
                    {item.badge !== undefined && <Badge variant="secondary" className="ml-2 h-4 px-1 text-[9px]">{item.badge}</Badge>}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}

/* ═══════════════════════════════════════════════ */
/*  MAIN LAYOUT COMPONENT                        */
/* ═══════════════════════════════════════════════ */

export default function InstitutionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useThemeContext();
    const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

    const { user } = useAuth();
    const { orgName } = useOrganization();
    const userLevel = user?.level ?? 4;
    const userInitials = getUserInitials(user);
    const userDisplayName = getUserDisplayName(user);
    const userRoleLabel = getRoleLabel(user);
    const navSections = useMemo(() => buildNavSections(userLevel), [userLevel]);

    const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

    const isActive = useCallback(
        (href: string) => {
            if (href === "/institutional") return pathname === "/institutional";
            return pathname.startsWith(href);
        },
        [pathname]
    );

    /* ─── Render sidebar contents (shared mobile/desktop) ─── */
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shrink-0">
                    <Landmark className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        className="overflow-hidden"
                    >
                        <p className="text-sm font-bold whitespace-nowrap">{orgName}</p>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-wider">Administration Souveraine</p>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {navSections.map((section) => (
                    <div key={section.title}>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    collapsed={collapsed}
                                    active={isActive(item.href)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-4 pt-2 space-y-1">
                {!collapsed ? (
                    <>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full"
                        >
                            {theme === "dark" ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
                            <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
                        </button>
                        <button
                            onClick={toggleCollapsed}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full"
                        >
                            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
                            <span>Réduire</span>
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                        >
                            <LogOut className="h-[18px] w-[18px] shrink-0" />
                            <span>Déconnexion</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center justify-center px-2 py-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full"
                                >
                                    {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{theme === "dark" ? "Mode clair" : "Mode sombre"}</TooltipContent>
                        </Tooltip>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleCollapsed}
                                    className="flex items-center justify-center px-2 py-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full"
                                >
                                    <PanelLeftOpen className="h-[18px] w-[18px]" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Agrandir</TooltipContent>
                        </Tooltip>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex items-center justify-center px-2 py-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                                >
                                    <LogOut className="h-[18px] w-[18px]" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Déconnexion</TooltipContent>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <TooltipProvider>
            <div className="min-h-screen flex bg-[var(--layout-bg)] p-3 gap-3">
                {/* ─── Desktop Sidebar ─── */}
                <motion.aside
                    animate={{ width: collapsed ? 64 : 256 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="hidden md:flex flex-col glass-panel rounded-2xl relative shrink-0 overflow-hidden"
                >
                    {sidebarContent}

                </motion.aside>

                {/* ─── Mobile Sidebar ─── */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-72 p-0 glass">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        {sidebarContent}
                    </SheetContent>
                </Sheet>

                {/* ─── Main Area ─── */}
                <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-2xl overflow-hidden">
                    {/* Header */}
                    <header className="h-14 border-b border-border/40 flex items-center gap-3 px-4 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-8 w-8"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-4 w-4" />
                        </Button>

                        {/* Breadcrumbs */}
                        <nav className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                            {breadcrumbs.map((bc, i) => (
                                <React.Fragment key={bc.href}>
                                    {i > 0 && <ChevronRightIcon className="h-3 w-3 mx-0.5 text-muted-foreground/40" />}
                                    {bc.isLast ? (
                                        <span className="text-foreground font-medium">{bc.label}</span>
                                    ) : (
                                        <Link href={bc.href} className="hover:text-foreground transition-colors">
                                            {bc.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>

                        <div className="flex-1" />

                        {/* Search */}
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher…"
                                className="h-8 w-56 pl-8 text-xs bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                            />
                        </div>

                        {(() => {
                            const segment = pathname === "/institutional" ? "institutional" : pathname.replace("/institutional/", "");
                            const info = INSTITUTIONAL_PAGE_INFO[segment];
                            return info ? <><PageArchitectButton info={info} accentColor="emerald" /><PageInfoButton info={info} accentColor="emerald" /></> : null;
                        })()}

                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                        </Button>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
