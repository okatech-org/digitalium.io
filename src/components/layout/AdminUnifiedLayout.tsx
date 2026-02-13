// ═══════════════════════════════════════════════════════════
// DIGITALIUM.IO — Layout: AdminUnifiedLayout
// Unified admin layout with Space Switcher (Business / Infra / Modules)
// Dynamic theme & sidebar based on active space
// ═══════════════════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Target,
    Users,
    Building2,
    CreditCard,
    BarChart3,
    Receipt,
    Settings,
    Server,
    Activity,
    Database,
    ScrollText,
    ShieldAlert,
    KeyRound,
    Monitor,
    HardDrive,
    DatabaseBackup,
    FileText,
    FolderOpen,
    PenTool,
    Building,
    Palette,
    UserCircle,
    Terminal,
    Sparkles,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    ChevronDown,
    Search,
    Bell,
    LogOut,
    Menu,
    User as UserIcon,
    SlidersHorizontal,
    GraduationCap,
    Shield,
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
import { ADMIN_PAGE_INFO } from "@/config/page-info/admin";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Space Types ──────────────────────────────── */

type AdminSpace = "business" | "infra" | "modules" | "digitalium";

/* ─── Space Theme Config ───────────────────────── */

const SPACE_THEMES: Record<AdminSpace, {
    gradient: string;
    activeBg: string;
    activeText: string;
    border: string;
    indicator: string;
    badgeBg: string;
    badgeText: string;
    notifBg: string;
    ringColor: string;
    pageInfoAccent: "blue" | "orange" | "violet";
}> = {
    business: {
        gradient: "from-digitalium-blue to-digitalium-violet",
        activeBg: "bg-digitalium-blue/15",
        activeText: "text-digitalium-blue",
        border: "border-white/5",
        indicator: "bg-digitalium-blue",
        badgeBg: "bg-digitalium-blue/20",
        badgeText: "text-digitalium-blue",
        notifBg: "bg-digitalium-blue",
        ringColor: "focus-visible:ring-digitalium-blue/30",
        pageInfoAccent: "blue",
    },
    infra: {
        gradient: "from-red-600 to-orange-500",
        activeBg: "bg-red-500/15",
        activeText: "text-orange-400",
        border: "border-red-900/20",
        indicator: "bg-orange-500",
        badgeBg: "bg-orange-500/20",
        badgeText: "text-orange-400",
        notifBg: "bg-red-500",
        ringColor: "focus-visible:ring-orange-500/30",
        pageInfoAccent: "orange",
    },
    modules: {
        gradient: "from-violet-600 to-indigo-500",
        activeBg: "bg-violet-500/15",
        activeText: "text-violet-300",
        border: "border-violet-900/20",
        indicator: "bg-violet-500",
        badgeBg: "bg-violet-500/20",
        badgeText: "text-violet-300",
        notifBg: "bg-violet-500",
        ringColor: "focus-visible:ring-violet-500/30",
        pageInfoAccent: "violet",
    },
    digitalium: {
        gradient: "from-emerald-600 to-teal-500",
        activeBg: "bg-emerald-500/15",
        activeText: "text-emerald-400",
        border: "border-emerald-900/20",
        indicator: "bg-emerald-500",
        badgeBg: "bg-emerald-500/20",
        badgeText: "text-emerald-400",
        notifBg: "bg-emerald-500",
        ringColor: "focus-visible:ring-emerald-500/30",
        pageInfoAccent: "violet",
    },
};

/* ─── Space Switcher Config ────────────────────── */

const SPACES: { id: AdminSpace; label: string; icon: React.ElementType; href: string; color: string; activeColor: string }[] = [
    { id: "business", label: "Gestion Business", icon: LayoutDashboard, href: "/admin", color: "text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10", activeColor: "bg-blue-500/20 text-blue-400" },
    { id: "infra", label: "Infrastructure", icon: Terminal, href: "/admin/infrastructure", color: "text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10", activeColor: "bg-orange-500/20 text-orange-400" },
    { id: "modules", label: "Modules DIGITALIUM", icon: Sparkles, href: "/admin/modules", color: "text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10", activeColor: "bg-violet-500/20 text-violet-400" },
    { id: "digitalium", label: "DIGITALIUM", icon: Building, href: "/admin/digitalium", color: "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10", activeColor: "bg-emerald-500/20 text-emerald-400" },
];

/* ─── Navigation Config ────────────────────────── */

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    children?: { label: string; href: string; icon: React.ElementType }[];
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const BUSINESS_NAV: NavSection[] = [
    {
        title: "Plateforme",
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { label: "Leads & Contacts", href: "/admin/leads", icon: Target, badge: 7 },
            { label: "Utilisateurs", href: "/admin/users", icon: Users },
            { label: "Organisations", href: "/admin/organizations", icon: Building2 },
            { label: "Clients", href: "/admin/clients", icon: UserCircle },
            { label: "Abonnements", href: "/admin/subscriptions", icon: CreditCard },
            { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
            { label: "Facturation", href: "/admin/billing", icon: Receipt },
            { label: "Formation", href: "/admin/formation", icon: GraduationCap },
            { label: "Paramètres", href: "/admin/parametres", icon: Settings },
        ],
    },
];

const INFRA_NAV: NavSection[] = [
    {
        title: "Infrastructure",
        items: [
            { label: "Dashboard Système", href: "/admin/infrastructure", icon: Monitor },
            { label: "Serveurs", href: "/admin/infrastructure/servers", icon: Server },
            { label: "Monitoring", href: "/admin/monitoring", icon: Activity },
            {
                label: "Databases",
                href: "/admin/databases",
                icon: Database,
                children: [
                    { label: "Réplicas", href: "/admin/databases/replicas", icon: HardDrive },
                    { label: "Sauvegardes", href: "/admin/databases/backups", icon: DatabaseBackup },
                ],
            },
            { label: "Journaux", href: "/admin/logs", icon: ScrollText },
            { label: "Sécurité", href: "/admin/security", icon: ShieldAlert },
            { label: "IAM", href: "/admin/iam", icon: KeyRound },
        ],
    },
];

const MODULES_NAV: NavSection[] = [
    {
        title: "Principal",
        items: [
            { label: "Dashboard Modules", href: "/admin/modules", icon: LayoutDashboard },
        ],
    },
    {
        title: "Clients",
        items: [
            { label: "Liste des clients", href: "/admin/modules/clients", icon: UserCircle },
            { label: "Nouveau client", href: "/admin/modules/clients/new", icon: Users },
        ],
    },
    {
        title: "Configuration Modules",
        items: [
            { label: "iDocument", href: "/admin/modules/config/idocument", icon: FileText },
            { label: "iArchive", href: "/admin/modules/config/iarchive", icon: FolderOpen },
            { label: "iSignature", href: "/admin/modules/config/isignature", icon: PenTool },
        ],
    },
    {
        title: "Thème & Design",
        items: [
            { label: "Design System", href: "/admin/modules/design-theme", icon: Palette },
        ],
    },
];

const DIGITALIUM_NAV: NavSection[] = [
    {
        title: "DIGITALIUM",
        items: [
            { label: "Dashboard", href: "/admin/digitalium", icon: LayoutDashboard },
            { label: "Profil Entreprise", href: "/admin/digitalium/profile", icon: Building },
            { label: "Équipe", href: "/admin/digitalium/team", icon: Users },
            { label: "Bureaux", href: "/admin/digitalium/offices", icon: Building2 },
            { label: "Paramètres", href: "/admin/digitalium/settings", icon: Settings },
        ],
    },
];

const SPACE_NAVS: Record<AdminSpace, NavSection[]> = {
    business: BUSINESS_NAV,
    infra: INFRA_NAV,
    modules: MODULES_NAV,
    digitalium: DIGITALIUM_NAV,
};

/* ─── Detect Active Space ──────────────────────── */

const INFRA_PREFIXES = ["/admin/infrastructure", "/admin/monitoring", "/admin/databases", "/admin/logs", "/admin/security", "/admin/iam"];
const MODULES_PREFIXES = ["/admin/modules"];
const DIGITALIUM_PREFIXES = ["/admin/digitalium"];

function detectSpace(pathname: string): AdminSpace {
    if (DIGITALIUM_PREFIXES.some((p) => pathname.startsWith(p))) return "digitalium";
    if (INFRA_PREFIXES.some((p) => pathname.startsWith(p))) return "infra";
    if (MODULES_PREFIXES.some((p) => pathname.startsWith(p))) return "modules";
    return "business";
}

/* ─── Breadcrumb builder ───────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    admin: "Administration",
    leads: "Leads & Contacts",
    users: "Utilisateurs",
    organizations: "Organisations",
    subscriptions: "Abonnements",
    analytics: "Analytics",
    billing: "Facturation",
    formation: "Formation",
    parametres: "Paramètres",
    infrastructure: "Infrastructure",
    servers: "Serveurs",
    monitoring: "Monitoring",
    databases: "Databases",
    replicas: "Réplicas",
    backups: "Sauvegardes",
    logs: "Journaux",
    security: "Sécurité",
    iam: "IAM",
    modules: "Modules",
    clients: "Clients",
    new: "Nouveau",
    config: "Configuration",
    idocument: "iDocument",
    iarchive: "iArchive",
    isignature: "iSignature",
    "design-theme": "Thème & Design",
    digitalium: "DIGITALIUM",
    profile: "Profil",
    team: "Équipe",
    offices: "Bureaux",
};

function buildBreadcrumbs(pathname: string) {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, i) => ({
        label: ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1),
        href: "/" + parts.slice(0, i + 1).join("/"),
        isLast: i === parts.length - 1,
    }));
}

/* ─── Sidebar Nav Link ─────────────────────────── */

function NavLink({
    item,
    collapsed,
    active,
    theme,
}: {
    item: NavItem;
    collapsed: boolean;
    active: boolean;
    theme: typeof SPACE_THEMES.business;
}) {
    const Icon = item.icon;

    const content = (
        <Link
            href={item.href}
            className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${active
                    ? `${theme.activeBg} ${theme.activeText}`
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }
                ${collapsed ? "justify-center px-2" : ""}
            `}
        >
            {active && (
                <motion.div
                    layoutId="admin-unified-nav-indicator"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${theme.indicator}`}
                />
            )}
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? theme.activeText : ""}`} />
            {!collapsed && (
                <>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <Badge
                            variant="secondary"
                            className={`ml-auto h-5 min-w-[20px] px-1.5 text-[10px] ${theme.badgeBg} ${theme.badgeText} border-0`}
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

/* ─── Expandable Nav Group ─────────────────────── */

function NavGroup({
    item,
    collapsed,
    pathname,
    theme,
}: {
    item: NavItem;
    collapsed: boolean;
    pathname: string;
    theme: typeof SPACE_THEMES.business;
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
                        className={`flex items-center justify-center px-2 py-2 rounded-lg text-sm font-medium transition-all ${isChildActive ? `${theme.activeBg} ${theme.activeText}` : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                    >
                        <Icon className={`h-[18px] w-[18px] ${isChildActive ? theme.activeText : ""}`} />
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isChildActive ? `${theme.activeBg.replace("/15", "/10")} ${theme.activeText}` : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isChildActive ? theme.activeText : ""}`} />
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
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${childActive ? `${theme.activeText} ${theme.activeBg.replace("/15", "/10")}` : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
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

/* ─── Sidebar Content ──────────────────────────── */

function SidebarContent({
    collapsed,
    pathname,
    activeSpace,
    theme,
    onToggle,
    onSignOut,
}: {
    collapsed: boolean;
    pathname: string;
    activeSpace: AdminSpace;
    theme: typeof SPACE_THEMES.business;
    onToggle: () => void;
    onSignOut: () => void;
}) {
    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        if (href === "/admin/infrastructure") return pathname === "/admin/infrastructure";
        if (href === "/admin/modules") return pathname === "/admin/modules";
        return pathname.startsWith(href);
    };

    const sections = SPACE_NAVS[activeSpace];

    const renderNavItem = (item: NavItem) => {
        if (item.children) {
            return <NavGroup key={item.href} item={item} collapsed={collapsed} pathname={pathname} theme={theme} />;
        }
        return <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} theme={theme} />;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-4`}>
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0`}>
                    {activeSpace === "infra" ? (
                        <Terminal className="h-4 w-4 text-white" />
                    ) : activeSpace === "modules" ? (
                        <Sparkles className="h-4 w-4 text-white" />
                    ) : (
                        <span className="text-white font-bold text-sm">D</span>
                    )}
                </div>
                {!collapsed && (
                    <motion.span
                        key={activeSpace}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        className="font-bold text-sm overflow-hidden whitespace-nowrap"
                    >
                        <span className={`bg-gradient-to-r ${activeSpace === "business" ? "from-blue-400 to-violet-400" : activeSpace === "infra" ? "from-red-400 to-orange-400" : activeSpace === "digitalium" ? "from-emerald-400 to-teal-400" : "from-violet-400 to-indigo-400"} bg-clip-text text-transparent`}>
                            {activeSpace === "business" ? "DIGITALIUM" : activeSpace === "infra" ? "INFRASTRUCTURE" : activeSpace === "digitalium" ? "DIGITALIUM" : "MODULES"}
                        </span>
                    </motion.span>
                )}
            </div>

            <Separator className="bg-white/5" />

            {/* Nav Sections */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                {sections.map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
                                {section.title}
                            </p>
                        )}
                        {collapsed && section.title !== sections[0]?.title && (
                            <Separator className="my-1.5 bg-white/5" />
                        )}
                        <div className="space-y-0.5">
                            {section.items.map(renderNavItem)}
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="bg-white/5" />

            {/* Footer */}
            <div className="p-3 space-y-2">
                {!collapsed && (
                    <div className="flex items-center gap-2 px-1">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className={`${theme.badgeBg} ${theme.badgeText} text-[10px] font-bold`}>
                                SA
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate">Super Admin</p>
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

export default function AdminUnifiedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifications] = useState(3);
    const pathname = usePathname();
    const router = useRouter();

    const activeSpace = useMemo(() => detectSpace(pathname), [pathname]);
    const theme = SPACE_THEMES[activeSpace];
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
                {/* ── Desktop Sidebar ── */}
                <motion.aside
                    initial={false}
                    animate={{ width: collapsed ? 64 : 260 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={`hidden lg:flex flex-col shrink-0 border-r ${theme.border} glass-section overflow-hidden`}
                >
                    <SidebarContent
                        collapsed={collapsed}
                        pathname={pathname}
                        activeSpace={activeSpace}
                        theme={theme}
                        onToggle={toggleCollapse}
                        onSignOut={handleSignOut}
                    />
                </motion.aside>

                {/* ── Mobile Sidebar ── */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className={`w-[280px] p-0 glass-section border-r ${theme.border}`}>
                        <SheetTitle className="sr-only">Menu Administration</SheetTitle>
                        <SidebarContent
                            collapsed={false}
                            pathname={pathname}
                            activeSpace={activeSpace}
                            theme={theme}
                            onToggle={() => setMobileOpen(false)}
                            onSignOut={handleSignOut}
                        />
                    </SheetContent>
                </Sheet>

                {/* ── Main area ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* ── Header ── */}
                    <header className={`h-14 border-b ${theme.border} glass flex items-center justify-between px-4 lg:px-6 shrink-0 z-20`}>
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

                            <nav className="hidden sm:flex items-center gap-1 text-sm">
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

                        {/* Right: Space Switcher + Search + Notifications + Avatar */}
                        <div className="flex items-center gap-2">
                            {/* ── Space Switcher ── */}
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.02] border border-white/5">
                                {SPACES.map((space) => {
                                    const SpaceIcon = space.icon;
                                    const isActive = activeSpace === space.id;
                                    return (
                                        <Tooltip key={space.id} delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => router.push(space.href)}
                                                    className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${isActive ? space.activeColor : space.color}`}
                                                >
                                                    <SpaceIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <span className="text-xs">{space.label}</span>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>

                            {/* Search */}
                            <div className="hidden md:flex items-center relative">
                                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Rechercher…"
                                    className={`h-8 w-48 pl-8 text-xs bg-white/5 border-white/10 ${theme.ringColor}`}
                                />
                            </div>

                            {/* Page Info */}
                            {(() => {
                                const segment = pathname === "/admin" ? "dashboard" : pathname.replace("/admin/", "");
                                const info = ADMIN_PAGE_INFO[segment];
                                return info ? <><PageArchitectButton info={info} accentColor={theme.pageInfoAccent} /><PageInfoButton info={info} accentColor={theme.pageInfoAccent} /></> : null;
                            })()}

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
                                <Bell className="h-4 w-4" />
                                {notifications > 0 && (
                                    <span className={`absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full ${theme.notifBg} text-white text-[9px] font-bold flex items-center justify-center`}>
                                        {notifications}
                                    </span>
                                )}
                            </Button>

                            {/* Avatar + Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 gap-2 px-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className={`bg-gradient-to-br ${theme.gradient} text-white text-[10px] font-bold`}>
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

                    {/* ── Page content ── */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
