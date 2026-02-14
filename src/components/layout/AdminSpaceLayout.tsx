// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: AdminSpaceLayout
// Collapsible sidebar + Header with breadcrumb,
// search, notifications, avatar dropdown
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Target,
    Users,
    Building2,
    CreditCard,
    BarChart3,
    Receipt,
    Server,
    Activity,
    ShieldCheck,
    Settings,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Search,
    Bell,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    SlidersHorizontal,
    GraduationCap,
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
import { useThemeContext } from "@/contexts/ThemeContext";
import { PageInfoButton } from "@/components/shared/PageInfoButton";
import { PageArchitectButton } from "@/components/shared/PageArchitectButton";
import { ADMIN_PAGE_INFO } from "@/config/page-info/admin";
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

const PLATFORM_NAV: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Leads & Contacts", href: "/admin/leads", icon: Target, badge: 7 },
    { label: "Utilisateurs", href: "/admin/users", icon: Users },
    { label: "Organisations", href: "/admin/organizations", icon: Building2 },
    { label: "Abonnements", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Facturation", href: "/admin/billing", icon: Receipt },
    { label: "Formation", href: "/admin/formation", icon: GraduationCap },
    { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

const SYSTEM_NAV: NavItem[] = [
    { label: "Infrastructure", href: "/sysadmin/infrastructure", icon: Server },
    { label: "Monitoring", href: "/sysadmin/monitoring", icon: Activity },
    { label: "Sécurité", href: "/sysadmin/security", icon: ShieldCheck },
    { label: "Configuration", href: "/sysadmin/config", icon: Settings },
];

/* ─── Breadcrumb builder ────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    admin: "Administration",
    leads: "Leads & Contacts",
    users: "Utilisateurs",
    organizations: "Organisations",
    subscriptions: "Abonnements",
    analytics: "Analytics",
    billing: "Facturation",
    sysadmin: "Système",
    infrastructure: "Infrastructure",
    monitoring: "Monitoring",
    security: "Sécurité",
    config: "Configuration",
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
    const Icon = item.icon;

    const content = (
        <Link
            href={item.href}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium
                transition-all duration-200 group relative
                ${active
                    ? "bg-digitalium-blue/20 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }
                ${collapsed ? "justify-center px-2" : ""}
            `}
        >
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-digitalium-blue" : ""}`} />
            {!collapsed && (
                <>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] bg-digitalium-blue/20 text-blue-300 border-0"
                        >
                            {item.badge}
                        </Badge>
                    )}
                    {active && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-digitalium-blue shrink-0" />
                    )}
                </>
            )}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {item.badge !== undefined && (
                        <Badge variant="secondary" className="h-4 text-[9px] px-1">
                            {item.badge}
                        </Badge>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}

/* ─── Sidebar Content (shared desktop/mobile) ──── */

function SidebarContent({
    collapsed,
    pathname,
    onToggle,
    onSignOut,
}: {
    collapsed: boolean;
    pathname: string;
    onToggle: () => void;
    onSignOut: () => void;
}) {
    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

    const { theme, toggleTheme } = useThemeContext();

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-4 py-5`}>
                <Image src="/logo_digitalium.png" alt="DIGITALIUM.IO" width={32} height={32} className="h-8 w-8 rounded-lg shrink-0" />
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <p className="font-bold text-sm">DIGITALIUM</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Administration</p>
                    </motion.div>
                )}
            </div>

            {/* Platform Nav */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {PLATFORM_NAV.map((item) => (
                    <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
                ))}
                {SYSTEM_NAV.map((item) => (
                    <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
                ))}
            </div>

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
                            onClick={onToggle}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full"
                        >
                            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
                            <span>Réduire</span>
                        </button>
                        <button
                            onClick={onSignOut}
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
                                    onClick={onToggle}
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
                                    onClick={onSignOut}
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
}

/* ═══════════════════════════════════════════════
   MAIN LAYOUT
   ═══════════════════════════════════════════════ */

export default function AdminSpaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifications] = useState(3);
    const pathname = usePathname();
    const router = useRouter();

    const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

    const handleSignOut = useCallback(async () => {
        try {
            const { auth } = await import("@/lib/firebase");
            const { signOut } = await import("firebase/auth");
            await signOut(auth);
            router.push("/");
        } catch {
            // silent fail
        }
    }, [router]);

    const toggleCollapse = useCallback(() => setCollapsed((p) => !p), []);

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen flex bg-[var(--layout-bg)] p-3 gap-3">
                {/* ── Desktop Sidebar ── */}
                <motion.aside
                    initial={false}
                    animate={{ width: collapsed ? 64 : 256 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="hidden lg:flex flex-col shrink-0 glass-panel rounded-2xl overflow-hidden"
                >
                    <SidebarContent
                        collapsed={collapsed}
                        pathname={pathname}
                        onToggle={toggleCollapse}
                        onSignOut={handleSignOut}
                    />
                </motion.aside>

                {/* ── Mobile Sidebar (Sheet) ── */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-[280px] p-0 glass-section border-r border-border/40">
                        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                        <SidebarContent
                            collapsed={false}
                            pathname={pathname}
                            onToggle={() => setMobileOpen(false)}
                            onSignOut={handleSignOut}
                        />
                    </SheetContent>
                </Sheet>

                {/* ── Main area ── */}
                <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-2xl overflow-hidden">
                    {/* ── Header ── */}
                    <header className="h-14 border-b border-border/40 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
                        {/* Left: Hamburger + Breadcrumb */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-8 w-8 text-muted-foreground"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="h-4 w-4" />
                            </Button>

                            <nav className="flex items-center gap-1 text-sm">
                                {breadcrumbs.map((crumb, i) => (
                                    <React.Fragment key={crumb.href}>
                                        {i > 0 && (
                                            <ChevronRightIcon className="h-3 w-3 text-muted-foreground/40 mx-1" />
                                        )}
                                        {crumb.isLast ? (
                                            <span className="font-medium text-foreground">
                                                {crumb.label}
                                            </span>
                                        ) : (
                                            <Link
                                                href={crumb.href}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </React.Fragment>
                                ))}
                            </nav>
                        </div>

                        {/* Right: Search + Notifications + Avatar */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="hidden md:flex items-center relative">
                                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Rechercher…"
                                    className="h-8 w-48 pl-8 text-xs bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-digitalium-blue/30"
                                />
                            </div>

                            {(() => {
                                const segment = pathname === "/admin" ? "dashboard" : pathname.replace("/admin/", "");
                                const info = ADMIN_PAGE_INFO[segment];
                                return info ? <><PageArchitectButton info={info} accentColor="blue" /><PageInfoButton info={info} accentColor="blue" /></> : null;
                            })()}

                            {/* Notifications */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground relative"
                            >
                                <Bell className="h-4 w-4" />
                                {notifications > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-digitalium-blue text-white text-[9px] font-bold flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </Button>

                            {/* Avatar + Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 gap-2 px-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-gradient-to-br from-digitalium-blue to-digitalium-violet text-white text-[10px] font-bold">
                                                SA
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-xs font-medium">
                                            Super Admin
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs">Mon compte</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                        <UserIcon className="h-3.5 w-3.5" /> Profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                        <SlidersHorizontal className="h-3.5 w-3.5" /> Préférences
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-xs gap-2 text-destructive cursor-pointer"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="h-3.5 w-3.5" /> Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* ── Page content ── */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
