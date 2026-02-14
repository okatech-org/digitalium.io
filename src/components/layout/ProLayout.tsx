// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Layout: ProLayout
// Professional workspace for Business persona
// Violet/indigo theme · Module-oriented sidebar · RBAC gates
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
    Landmark,
    Briefcase,
    Scale,
    PenTool,
    Bot,
    BarChart3,
    Users,
    Settings,
    CreditCard,
    Plug,
    ChartArea,
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
import { PageInfoButton } from "@/components/shared/PageInfoButton";
import { PageArchitectButton } from "@/components/shared/PageArchitectButton";
import { PRO_PAGE_INFO } from "@/config/page-info/pro";
import { AstedChat } from "@/components/modules/iasted";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { getUserInitials, getUserDisplayName, getRoleLabel } from "@/config/role-helpers";

/* ─── Navigation Config ─────────────────────────── */

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    /** Minimum RBAC level required (lower = more privilege) */
    maxLevel?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
    /** Restrict entire section to this max level */
    maxLevel?: number;
}

const NAV_SECTIONS: NavSection[] = [
    {
        title: "Principal",
        items: [
            { label: "Dashboard", href: "/pro", icon: LayoutDashboard },
        ],
    },
    {
        title: "Documents",
        items: [
            { label: "iDocument", href: "/pro/idocument", icon: FileText },
        ],
    },
    {
        title: "Archives",
        items: [
            { label: "iArchive", href: "/pro/iarchive", icon: Archive },
        ],
    },
    {
        title: "Signatures",
        items: [
            { label: "iSignature", href: "/pro/isignature", icon: PenTool },
        ],
    },
    {
        title: "IA",
        items: [
            { label: "iAsted", href: "/pro/iasted", icon: Bot },
            { label: "Analytics IA", href: "/pro/iasted/analytics", icon: BarChart3 },
        ],
    },
    {
        title: "Gestion",
        maxLevel: 3, // org_admin (2) + org_manager (3)
        items: [
            { label: "Équipe", href: "/pro/team", icon: Users },
            { label: "Formation", href: "/pro/formation", icon: GraduationCap },
            { label: "Paramètres", href: "/pro/settings", icon: Settings, maxLevel: 2 },
            { label: "Facturation", href: "/pro/billing", icon: CreditCard },
            { label: "Intégrations API", href: "/pro/api", icon: Plug },
            { label: "Analytics", href: "/pro/analytics", icon: ChartArea },
        ],
    },
];

/* ─── Breadcrumb builder ────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    pro: "Espace Pro",
    idocument: "iDocument",
    iarchive: "iArchive",
    isignature: "iSignature",
    iasted: "iAsted",
    edit: "Éditeur",
    shared: "Partagés",
    templates: "Templates",
    fiscal: "Fiscal",
    social: "Social",
    legal: "Juridique",
    vault: "Coffre-Fort",
    certificates: "Certificats",
    upload: "Upload",
    pending: "En attente",
    workflows: "Workflows",
    analytics: "Analytics",
    team: "Équipe",
    settings: "Paramètres",
    billing: "Facturation",
    api: "Intégrations API",
    formation: "Formation",
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
                    ? "bg-violet-500/20 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }
                ${collapsed ? "justify-center px-2" : ""}
            `}
        >
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-violet-400" : ""}`} />
            {!collapsed && (
                <>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] bg-violet-500/20 text-violet-300 border-0"
                        >
                            {item.badge}
                        </Badge>
                    )}
                    {active && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-violet-400 shrink-0" />
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

/* ─── Sidebar Content ───────────────────────────── */

function SidebarContent({
    collapsed,
    pathname,
    userLevel,
    orgName,
    onToggle,
    onSignOut,
}: {
    collapsed: boolean;
    pathname: string;
    userLevel: number;
    orgName: string;
    onToggle: () => void;
    onSignOut: () => void;
}) {
    const isActive = (href: string) =>
        href === "/pro" ? pathname === "/pro" : pathname.startsWith(href);

    const { theme, toggleTheme } = useThemeContext();

    const visibleSections = NAV_SECTIONS.filter(
        (s) => s.maxLevel === undefined || userLevel <= s.maxLevel
    );

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-4 py-5`}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <p className="font-bold text-sm">{orgName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Espace Pro</p>
                    </motion.div>
                )}
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {visibleSections.map((section) => (
                    <div key={section.title}>
                        <div className="space-y-0.5">
                            {section.items
                                .filter(
                                    (item) =>
                                        item.maxLevel === undefined ||
                                        userLevel <= item.maxLevel
                                )
                                .map((item) => (
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

export default function ProLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifications] = useState(4);
    const pathname = usePathname();
    const router = useRouter();

    // Pull role from auth context for RBAC-based sidebar filtering
    const { user } = useAuth();
    const { orgName } = useOrganization();
    const userLevel = user?.level ?? 4;
    const userInitials = getUserInitials(user);
    const userDisplayName = getUserDisplayName(user);
    const userRoleLabel = getRoleLabel(user);

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
            <div className="min-h-screen flex bg-[var(--layout-bg)] p-3 gap-3">
                {/* Desktop Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: collapsed ? 64 : 260 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="hidden lg:flex flex-col shrink-0 glass-panel rounded-2xl overflow-hidden"
                >
                    <SidebarContent
                        collapsed={collapsed}
                        pathname={pathname}
                        userLevel={userLevel}
                        orgName={orgName}
                        onToggle={toggleCollapse}
                        onSignOut={handleSignOut}
                    />
                </motion.aside>

                {/* Mobile Sidebar */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-[280px] p-0 glass-section border-r border-border/40">
                        <SheetTitle className="sr-only">Menu Pro</SheetTitle>
                        <SidebarContent
                            collapsed={false}
                            pathname={pathname}
                            userLevel={userLevel}
                            orgName={orgName}
                            onToggle={() => setMobileOpen(false)}
                            onSignOut={handleSignOut}
                        />
                    </SheetContent>
                </Sheet>

                {/* Main area */}
                <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-2xl overflow-hidden">
                    {/* Header */}
                    <header className="h-14 border-b border-border/40 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
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
                                    className="h-8 w-48 pl-8 text-xs bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>

                            {(() => {
                                const segment = pathname === "/pro" ? "dashboard" : pathname.replace("/pro/", "");
                                const info = PRO_PAGE_INFO[segment];
                                return info ? <><PageArchitectButton info={info} accentColor="violet" /><PageInfoButton info={info} accentColor="violet" /></> : null;
                            })()}

                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
                                <Bell className="h-4 w-4" />
                                {notifications > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 gap-2 px-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-500 text-white text-[10px] font-bold">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-xs font-medium">{userDisplayName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuLabel className="text-xs">
                                        <p>{userDisplayName}</p>
                                        <p className="text-[10px] text-muted-foreground font-normal">{userRoleLabel} · {orgName}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                        <UserIcon className="h-3.5 w-3.5" /> Profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                        <SlidersHorizontal className="h-3.5 w-3.5" /> Préférences
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                        <Shield className="h-3.5 w-3.5" /> Sécurité
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

                {/* Floating AI Chat */}
                <AstedChat />
            </div>
        </TooltipProvider>
    );
}
