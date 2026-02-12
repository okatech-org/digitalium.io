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
    FolderOpen,
    FileStack,
    Archive,
    Landmark,
    Briefcase,
    Scale,
    Lock,
    PenTool,
    Clock,
    CheckCircle2,
    Workflow,
    Users,
    Settings,
    CreditCard,
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
    Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageInfoButton } from "@/components/shared/PageInfoButton";
import { INSTITUTIONAL_PAGE_INFO } from "@/config/page-info/institutional";
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

const NAV_SECTIONS: NavSection[] = [
    {
        title: "Principal",
        items: [
            { label: "Dashboard", href: "/institutional", icon: LayoutDashboard },
        ],
    },
    {
        title: "iDocument",
        items: [
            { label: "Mes Documents", href: "/institutional/idocument", icon: FileText },
            { label: "Documents Partagés", href: "/institutional/idocument/shared", icon: FolderOpen },
            { label: "Templates", href: "/institutional/idocument/templates", icon: FileStack },
        ],
    },
    {
        title: "iArchive",
        items: [
            { label: "Archives Légales", href: "/institutional/iarchive/legal", icon: Scale },
            { label: "Archives Fiscales", href: "/institutional/iarchive/fiscal", icon: Landmark },
            { label: "Archives Sociales", href: "/institutional/iarchive/social", icon: Briefcase },
            { label: "Coffre-Fort", href: "/institutional/iarchive/vault", icon: Lock },
            { label: "Certifications", href: "/institutional/iarchive/certificates", icon: Award },
        ],
    },
    {
        title: "iSignature",
        items: [
            { label: "À signer", href: "/institutional/isignature/pending", icon: PenTool, badge: 2 },
            { label: "En attente", href: "/institutional/isignature/waiting", icon: Clock, badge: 3 },
            { label: "Signés", href: "/institutional/isignature/completed", icon: CheckCircle2 },
            { label: "Workflows", href: "/institutional/isignature/workflows", icon: Workflow },
        ],
    },
    {
        title: "Administration",
        items: [
            { label: "Utilisateurs", href: "/institutional/users", icon: Users },
            { label: "Sécurité & Conformité", href: "/institutional/compliance", icon: Shield },
        ],
    },
    {
        title: "Compte",
        items: [
            { label: "Formation", href: "/institutional/formation", icon: GraduationCap },
            { label: "Paramètres", href: "/institutional/parametres", icon: Settings },
        ],
    },
];

/* ─── Breadcrumb builder ────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
    institutional: "Institutionnel",
    idocument: "iDocument",
    iarchive: "iArchive",
    isignature: "iSignature",
    shared: "Partagés",
    templates: "Templates",
    fiscal: "Fiscales",
    social: "Sociales",
    legal: "Légales",
    vault: "Coffre-Fort",
    certificates: "Certifications",
    pending: "À signer",
    waiting: "En attente",
    completed: "Signés",
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
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${active
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
        >
            <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400" : ""}`} />
            {!collapsed && (
                <>
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-500/15 text-emerald-400 border-0">
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
    const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

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
            <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shrink-0">
                    <Landmark className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        className="overflow-hidden"
                    >
                        <p className="text-sm font-bold whitespace-nowrap">Institutionnel</p>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">Administration Souveraine</p>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
                                {section.title}
                            </p>
                        )}
                        {collapsed && <Separator className="my-2 bg-white/5" />}
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

            {/* Footer / Profile */}
            <div className="border-t border-white/5 px-3 py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-xs">IN</AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <div className="text-left min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">Administrateur</p>
                                    <p className="text-[10px] text-muted-foreground truncate">Institution Gov</p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="w-56">
                        <DropdownMenuLabel className="text-xs">Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/institutional/parametres")} className="text-xs gap-2">
                            <UserIcon className="h-3.5 w-3.5" /> Mon Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/institutional/parametres")} className="text-xs gap-2">
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Paramètres
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs gap-2 text-red-400 focus:text-red-400">
                            <LogOut className="h-3.5 w-3.5" /> Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <TooltipProvider>
            <div className="min-h-screen flex bg-background">
                {/* ─── Desktop Sidebar ─── */}
                <motion.aside
                    animate={{ width: collapsed ? 64 : 256 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="hidden md:flex flex-col glass border-r border-white/5 relative shrink-0"
                >
                    {sidebarContent}
                    <button
                        onClick={toggleCollapsed}
                        className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-background border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors z-10"
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
                        ) : (
                            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                        )}
                    </button>
                </motion.aside>

                {/* ─── Mobile Sidebar ─── */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-72 p-0 glass">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        {sidebarContent}
                    </SheetContent>
                </Sheet>

                {/* ─── Main Area ─── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-14 border-b border-white/5 flex items-center gap-3 px-4 glass shrink-0">
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
                                className="h-8 w-56 pl-8 text-xs bg-white/5 border-white/10"
                            />
                        </div>

                        {(() => {
                            const segment = pathname === "/institutional" ? "institutional" : pathname.replace("/institutional/", "");
                            const info = INSTITUTIONAL_PAGE_INFO[segment];
                            return info ? <PageInfoButton info={info} accentColor="emerald" /> : null;
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
