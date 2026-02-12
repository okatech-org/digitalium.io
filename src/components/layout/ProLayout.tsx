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
    FolderOpen,
    FileStack,
    PenLine,
    Archive,
    Landmark,
    Briefcase,
    Scale,
    Lock,
    PenTool,
    Clock,
    Workflow,
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
    Upload,
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
import { PRO_PAGE_INFO } from "@/config/page-info/pro";
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
            { label: "Éditeur", href: "/pro/idocument/edit", icon: PenLine },
            { label: "Partagés", href: "/pro/idocument/shared", icon: FolderOpen },
            { label: "Templates", href: "/pro/idocument/templates", icon: FileStack },
        ],
    },
    {
        title: "Archives",
        items: [
            { label: "iArchive", href: "/pro/iarchive", icon: Archive },
            { label: "Fiscal", href: "/pro/iarchive/fiscal", icon: Landmark },
            { label: "Social", href: "/pro/iarchive/social", icon: Briefcase },
            { label: "Juridique", href: "/pro/iarchive/legal", icon: Scale },
            { label: "Client", href: "/pro/iarchive/client", icon: Building2 },
            { label: "Coffre-Fort", href: "/pro/iarchive/vault", icon: Lock },
            { label: "Upload", href: "/pro/iarchive/upload", icon: Upload },
        ],
    },
    {
        title: "Signatures",
        items: [
            { label: "iSignature", href: "/pro/isignature", icon: PenTool },
            { label: "En attente", href: "/pro/isignature/pending", icon: Clock, badge: 4 },
            { label: "Workflows", href: "/pro/isignature/workflows", icon: Workflow },
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
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${active
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }
                ${collapsed ? "justify-center px-2" : ""}
            `}
        >
            {active && (
                <motion.div
                    layoutId="pro-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-500"
                />
            )}
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

    const visibleSections = NAV_SECTIONS.filter(
        (s) => s.maxLevel === undefined || userLevel <= s.maxLevel
    );

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-4`}>
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
                        <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            {orgName}
                        </span>
                    </motion.div>
                )}
            </div>

            <Separator className="bg-white/5" />

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                {visibleSections.map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
                                {section.title}
                            </p>
                        )}
                        {collapsed && section.title !== "Principal" && (
                            <Separator className="my-1.5 bg-white/5" />
                        )}
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

            <Separator className="bg-white/5" />

            {/* Footer */}
            <div className="p-3 space-y-2">
                {!collapsed && (
                    <div className="flex items-center gap-2 px-1">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                                PR
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate">{orgName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Espace Pro</p>
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

    // In production, pull these from useAuth / usePersona
    const userLevel = 2; // org_admin default for dev
    const orgName = "ASCOMA Gabon";

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
                    className="hidden lg:flex flex-col shrink-0 border-r border-violet-900/20 glass-section overflow-hidden"
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
                    <SheetContent side="left" className="w-[280px] p-0 glass-section border-r border-violet-900/20">
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
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-14 border-b border-violet-900/20 glass flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
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
                                    className="h-8 w-48 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30"
                                />
                            </div>

                            {(() => {
                                const segment = pathname === "/pro" ? "dashboard" : pathname.replace("/pro/", "");
                                const info = PRO_PAGE_INFO[segment];
                                return info ? <PageInfoButton info={info} accentColor="violet" /> : null;
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
                                                DG
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-xs font-medium">{orgName}</span>
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

                    {/* Page content */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
