// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Layout: SubAdminSpaceLayout
// Violet/Indigo theme, module-oriented sidebar
// iDocument · iArchive · iSignature · Gestion
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Users as UsersIcon,
    FileStack,
    Trash2,
    Landmark,
    Briefcase,
    Scale,
    Building2,
    Lock,
    ScrollText,
    PenTool,
    Clock,
    CheckCircle2,
    Workflow,
    KeyRound,
    Building,
    Palette,
    Target,
    CreditCard,
    UserCircle,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    ChevronDown,
    Search,
    Bell,
    LogOut,
    Menu,
    User as UserIcon,
    SlidersHorizontal,
    Sparkles,
    Award,
    Shield,
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
import { SUBADMIN_PAGE_INFO } from "@/config/page-info/subadmin";
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

const NAV_SECTIONS: NavSection[] = [
    {
        title: "Principal",
        items: [
            { label: "Dashboard", href: "/subadmin", icon: LayoutDashboard },
        ],
    },
    {
        title: "iDocument",
        items: [
            { label: "Mes Documents", href: "/subadmin/idocument", icon: FileText },
            { label: "Documents Partagés", href: "/subadmin/idocument/shared", icon: FolderOpen },
            { label: "Documents Équipe", href: "/subadmin/idocument/team", icon: UsersIcon },
            { label: "Templates", href: "/subadmin/idocument/templates", icon: FileStack },
            { label: "Corbeille", href: "/subadmin/idocument/trash", icon: Trash2 },
        ],
    },
    {
        title: "iArchive",
        items: [
            { label: "Archives Fiscales", href: "/subadmin/iarchive/fiscal", icon: Landmark },
            { label: "Archives Sociales", href: "/subadmin/iarchive/social", icon: Briefcase },
            { label: "Archives Juridiques", href: "/subadmin/iarchive/legal", icon: Scale },
            { label: "Archives Clients", href: "/subadmin/iarchive/clients", icon: Building2 },
            { label: "Coffre-Fort", href: "/subadmin/iarchive/vault", icon: Lock },
            { label: "Certificats", href: "/subadmin/iarchive/certificates", icon: Award },
        ],
    },
    {
        title: "iSignature",
        items: [
            { label: "À signer", href: "/subadmin/isignature/pending", icon: PenTool, badge: 3 },
            { label: "En attente", href: "/subadmin/isignature/waiting", icon: Clock, badge: 5 },
            { label: "Signés", href: "/subadmin/isignature/completed", icon: CheckCircle2 },
            { label: "Workflows", href: "/subadmin/isignature/workflows", icon: Workflow },
        ],
    },
    {
        title: "Gestion",
        items: [
            { label: "IAM", href: "/subadmin/iam", icon: KeyRound },
            { label: "Organisation", href: "/subadmin/organization", icon: Building },
            { label: "Thème", href: "/subadmin/design-theme", icon: Palette },
            { label: "Workflow Templates", href: "/subadmin/workflow-templates", icon: Workflow },
            { label: "Clients", href: "/subadmin/clients", icon: UserCircle },
            { label: "Leads", href: "/subadmin/leads", icon: Target },
            { label: "Abonnements", href: "/subadmin/subscriptions", icon: CreditCard },
        ],
    },
    {
        title: "Compte",
        items: [
            { label: "Formation", href: "/subadmin/formation", icon: GraduationCap },
            { label: "Paramètres", href: "/subadmin/parametres", icon: Settings },
        ],
    },
];

/* ─── Breadcrumb builder ────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    subadmin: "SubAdmin",
    idocument: "iDocument",
    iarchive: "iArchive",
    isignature: "iSignature",
    shared: "Partagés",
    team: "Équipe",
    templates: "Templates",
    trash: "Corbeille",
    fiscal: "Fiscales",
    social: "Sociales",
    legal: "Juridiques",
    clients: "Clients",
    vault: "Coffre-Fort",
    certificates: "Certificats",
    pending: "À signer",
    waiting: "En attente",
    completed: "Signés",
    workflows: "Workflows",
    iam: "IAM",
    formation: "Formation",
    parametres: "Paramètres",
    organization: "Organisation",
    "design-theme": "Thème",
    "workflow-templates": "Workflow Templates",
    leads: "Leads",
    subscriptions: "Abonnements",
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
                    layoutId="subadmin-nav-indicator"
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
    onToggle,
    onSignOut,
}: {
    collapsed: boolean;
    pathname: string;
    onToggle: () => void;
    onSignOut: () => void;
}) {
    const isActive = (href: string) =>
        href === "/subadmin" ? pathname === "/subadmin" : pathname.startsWith(href);

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-4`}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            DIGITALIUM
                        </span>
                    </motion.div>
                )}
            </div>

            <Separator className="bg-white/5" />

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                {NAV_SECTIONS.map((section) => (
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
            </div>

            <Separator className="bg-white/5" />

            {/* Footer */}
            <div className="p-3 space-y-2">
                {!collapsed && (
                    <div className="flex items-center gap-2 px-1">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                                DG
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate">DIGITALIUM</p>
                            <p className="text-[10px] text-muted-foreground truncate">org_admin</p>
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

export default function SubAdminSpaceLayout({
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
                        onToggle={toggleCollapse}
                        onSignOut={handleSignOut}
                    />
                </motion.aside>

                {/* Mobile Sidebar */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-[280px] p-0 glass-section border-r border-violet-900/20">
                        <SheetTitle className="sr-only">Menu SubAdmin</SheetTitle>
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
                                const segment = pathname === "/subadmin" ? "dashboard" : pathname.replace("/subadmin/", "");
                                const info = SUBADMIN_PAGE_INFO[segment];
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
                                        <span className="hidden md:block text-xs font-medium">DIGITALIUM</span>
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
