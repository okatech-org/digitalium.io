// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: SysAdminSpaceLayout
// Red/Orange technical theme, collapsible sidebar
// 15 navigation items, responsive drawer
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Monitor,
    Server,
    Activity,
    Database,
    ScrollText,
    ShieldAlert,
    KeyRound,
    Building2,
    Palette,
    Users,
    Briefcase,
    CreditCard,
    Target,
    Workflow,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    ChevronDown,
    Search,
    Bell,
    LogOut,
    Menu,
    User as UserIcon,
    SlidersHorizontal,
    Terminal,
    HardDrive,
    DatabaseBackup,
    GraduationCap,
    Settings,
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
import { PageInfoButton } from "@/components/shared/PageInfoButton";
import { SYSADMIN_PAGE_INFO } from "@/config/page-info/sysadmin";
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
    children?: { label: string; href: string; icon: React.ElementType }[];
}

const INFRA_NAV: NavItem[] = [
    { label: "Dashboard Système", href: "/sysadmin", icon: Monitor },
    { label: "Infrastructure", href: "/sysadmin/infrastructure", icon: Server },
    { label: "Monitoring", href: "/sysadmin/monitoring", icon: Activity },
    {
        label: "Databases",
        href: "/sysadmin/databases",
        icon: Database,
        children: [
            { label: "Réplicas", href: "/sysadmin/databases/replicas", icon: HardDrive },
            { label: "Sauvegardes", href: "/sysadmin/databases/backups", icon: DatabaseBackup },
        ],
    },
    { label: "Journaux", href: "/sysadmin/logs", icon: ScrollText },
    { label: "Sécurité", href: "/sysadmin/security", icon: ShieldAlert },
    { label: "IAM", href: "/sysadmin/iam", icon: KeyRound },
];

const MANAGEMENT_NAV: NavItem[] = [
    { label: "Configuration Orga", href: "/sysadmin/organization", icon: Building2 },
    { label: "Thème", href: "/sysadmin/design-theme", icon: Palette },
    { label: "Utilisateurs", href: "/sysadmin/users", icon: Users },
    { label: "Clients", href: "/sysadmin/clients", icon: Briefcase },
    { label: "Abonnements", href: "/sysadmin/subscriptions", icon: CreditCard },
    { label: "Leads", href: "/sysadmin/leads", icon: Target, badge: 3 },
    { label: "Workflow Templates", href: "/sysadmin/workflow-templates", icon: Workflow },
    { label: "Formation", href: "/sysadmin/formation", icon: GraduationCap },
    { label: "Paramètres", href: "/sysadmin/parametres", icon: Settings },
];

/* ─── Breadcrumb builder ────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    sysadmin: "SysAdmin",
    infrastructure: "Infrastructure",
    monitoring: "Monitoring",
    databases: "Databases",
    replicas: "Réplicas",
    backups: "Sauvegardes",
    logs: "Journaux",
    security: "Sécurité",
    iam: "IAM",
    organization: "Configuration Orga",
    "design-theme": "Thème",
    users: "Utilisateurs",
    clients: "Clients",
    subscriptions: "Abonnements",
    leads: "Leads",
    "workflow-templates": "Workflow Templates",
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
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${active
                    ? "bg-red-500/15 text-orange-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }
                ${collapsed ? "justify-center px-2" : ""}
            `}
        >
            {active && (
                <motion.div
                    layoutId="sysadmin-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-orange-500"
                />
            )}
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-orange-400" : ""}`} />
            {!collapsed && (
                <>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] bg-orange-500/20 text-orange-400 border-0"
                        >
                            {item.badge}
                        </Badge>
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

/* ─── Expandable Nav Group ──────────────────────── */

function NavGroup({
    item,
    collapsed,
    pathname,
}: {
    item: NavItem;
    collapsed: boolean;
    pathname: string;
}) {
    const [expanded, setExpanded] = useState(pathname.startsWith(item.href));
    const Icon = item.icon;
    const isChildActive = item.children?.some((c) => pathname.startsWith(c.href));

    if (collapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={`flex items-center justify-center px-2 py-2 rounded-lg text-sm font-medium transition-all ${isChildActive ? "bg-red-500/15 text-orange-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        <Icon className={`h-[18px] w-[18px] ${isChildActive ? "text-orange-400" : ""}`} />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div>
            <button
                onClick={() => setExpanded((p) => !p)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isChildActive ? "bg-red-500/10 text-orange-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
            >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isChildActive ? "text-orange-400" : ""}`} />
                <span className="truncate flex-1 text-left">{item.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`} />
            </button>
            {expanded && item.children && (
                <div className="ml-5 pl-3 border-l border-white/5 mt-1 space-y-0.5">
                    {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname.startsWith(child.href);
                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${childActive ? "text-orange-400 bg-red-500/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                <span>{child.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Sidebar Content ───────────────────────────── */

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
        href === "/sysadmin" ? pathname === "/sysadmin" : pathname.startsWith(href);

    const renderNavItem = (item: NavItem) => {
        if (item.children) {
            return <NavGroup key={item.href} item={item} collapsed={collapsed} pathname={pathname} />;
        }
        return <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-4`}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shrink-0">
                    <Terminal className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <span className="font-bold text-sm bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                            SYSADMIN
                        </span>
                    </motion.div>
                )}
            </div>

            <Separator className="bg-white/5" />

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {!collapsed && (
                    <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2">
                        Infrastructure
                    </p>
                )}
                {INFRA_NAV.map(renderNavItem)}

                <div className="pt-3" />
                {!collapsed && (
                    <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2">
                        Gestion
                    </p>
                )}
                {MANAGEMENT_NAV.map(renderNavItem)}
            </div>

            <Separator className="bg-white/5" />

            {/* Footer */}
            <div className="p-3 space-y-2">
                {!collapsed && (
                    <div className="flex items-center gap-2 px-1">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-red-500/20 text-orange-400 text-[10px] font-bold">
                                SA
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate">System Admin</p>
                            <p className="text-[10px] text-muted-foreground truncate">system_admin</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={onSignOut}
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-muted-foreground hover:text-foreground"
                    onClick={onToggle}
                >
                    {collapsed ? (
                        <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            <span className="text-xs">Réduire</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN LAYOUT
   ═══════════════════════════════════════════════ */

export default function SysAdminSpaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [alerts] = useState(5);
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
            // silent
        }
    }, [router]);

    const toggleCollapse = useCallback(() => setCollapsed((p) => !p), []);

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen flex bg-background">
                {/* Desktop Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: collapsed ? 64 : 260 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="hidden lg:flex flex-col shrink-0 border-r border-red-900/20 glass-section overflow-hidden"
                >
                    <SidebarContent
                        collapsed={collapsed}
                        pathname={pathname}
                        onToggle={toggleCollapse}
                        onSignOut={handleSignOut}
                    />
                </motion.aside>

                {/* Mobile Sidebar */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-[280px] p-0 glass-section border-r border-red-900/20">
                        <SheetTitle className="sr-only">Menu SysAdmin</SheetTitle>
                        <SidebarContent
                            collapsed={false}
                            pathname={pathname}
                            onToggle={() => setMobileOpen(false)}
                            onSignOut={handleSignOut}
                        />
                    </SheetContent>
                </Sheet>

                {/* Main area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-14 border-b border-red-900/20 glass flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
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
                                            <span className="font-medium text-foreground">{crumb.label}</span>
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

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center relative">
                                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Rechercher…"
                                    className="h-8 w-48 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-orange-500/30"
                                />
                            </div>

                            {(() => {
                                const segment = pathname === "/sysadmin" ? "dashboard" : pathname.replace("/sysadmin/", "");
                                const info = SYSADMIN_PAGE_INFO[segment];
                                return info ? <PageInfoButton info={info} accentColor="orange" /> : null;
                            })()}

                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
                                <Bell className="h-4 w-4" />
                                {alerts > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                                        {alerts}
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 gap-2 px-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-500 text-white text-[10px] font-bold">
                                                SA
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-xs font-medium">System Admin</span>
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

                    {/* Page content */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
