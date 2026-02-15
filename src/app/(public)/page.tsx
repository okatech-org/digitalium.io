"use client";

import { useState, useCallback, lazy, Suspense } from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════
   EAGERLY LOADED — above the fold only
   ═══════════════════════════════════════════════ */
import HeroSection from "@/components/sections/HeroSection";

/* ═══════════════════════════════════════════════
   LAZY LOADED — below the fold, split into chunks
   ═══════════════════════════════════════════════ */
const ProblemSection = lazy(() => import("@/components/sections/ProblemSection"));
const ServicesSection = lazy(() => import("@/components/sections/ServicesSection"));
const JourneySection = lazy(() => import("@/components/sections/JourneySection"));
const FinalCTASection = lazy(() => import("@/components/sections/FinalCTASection"));
const FooterSection = lazy(() => import("@/components/sections/FooterSection"));



// Auth modals — lazy loaded
const LoginModal = lazy(() => import("@/components/auth/LoginModal"));
const RegisterModal = lazy(() => import("@/components/auth/RegisterModal"));

/* ═══════════════════════════════════════════════
   Section placeholder — minimal to avoid CLS
   ═══════════════════════════════════════════════ */
function SectionSkeleton() {
    return <div className="w-full min-h-[200px]" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════
   Navigation links data
   ═══════════════════════════════════════════════ */
const navLinks = [
    { href: "/", label: "Accueil", active: true },
    { href: "/solutions/administrations", label: "Administrations" },
    { href: "/solutions/entreprises", label: "Entreprises" },
    { href: "/solutions/organismes", label: "Organismes" },
    { href: "https://identite.ga/", label: "Particuliers", external: true },
    { href: "/guide", label: "Guide d'utilisation" },
];

/* ═══════════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════════ */

interface NavbarProps {
    onOpenLogin: () => void;
    onOpenRegister: () => void;
}

function Navbar({ onOpenLogin, onOpenRegister }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMobileLogin = useCallback(() => {
        setMobileMenuOpen(false);
        setTimeout(() => onOpenLogin(), 200);
    }, [onOpenLogin]);

    const handleMobileRegister = useCallback(() => {
        setMobileMenuOpen(false);
        setTimeout(() => onOpenRegister(), 200);
    }, [onOpenRegister]);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
                <div className="w-full max-w-[95%] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-0">
                            <div className="relative z-50">
                                <Image
                                    src="/logo_digitalium.png"
                                    alt="DIGITALIUM.IO"
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 rounded-xl translate-y-6"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-2xl tracking-tight">
                                    <span className="text-foreground">DIGITALIUM</span>
                                    <span className="text-[#F59E0B]">.IO</span>
                                </span>
                                <span className="hidden xl:inline-block text-[11px] font-medium text-muted-foreground leading-tight tracking-[0.26em]">
                                    L&apos;archivage intelligent
                                </span>
                            </div>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        {navLinks.map((link) =>
                            link.external ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        link.active
                                            ? "text-foreground font-medium transition-colors"
                                            : "hover:text-foreground transition-colors"
                                    }
                                >
                                    {link.label}
                                </Link>
                            )
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 mr-2">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                        {/* Desktop buttons */}
                        <Button variant="ghost" size="sm" onClick={onOpenLogin} className="hidden md:inline-flex">
                            Connexion
                        </Button>
                        <Button
                            size="sm"
                            className="hidden md:inline-flex bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity"
                            onClick={onOpenRegister}
                        >
                            Commencer
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                        {/* Mobile hamburger button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════
               Floating Mobile Menu — glassmorphism modal
               ═══════════════════════════════════════════════ */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                        {/* Menu card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
                            >
                                <X size={14} />
                            </button>

                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
                                {/* Logo header */}
                                <div className="text-center mb-6">
                                    <h2
                                        className="text-2xl font-bold tracking-wider"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #3B82F6, #8B5CF6, #00D9FF)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        DIGITALIUM
                                    </h2>
                                    <p className="text-xs text-white/40 mt-1">
                                        L&apos;archivage intelligent
                                    </p>
                                </div>

                                {/* Separator */}
                                <div className="border-t border-white/10 mb-4" />

                                {/* Navigation links */}
                                <div className="space-y-1">
                                    {navLinks.map((link, index) => {
                                        const linkContent = (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${link.active
                                                        ? "bg-white/10 text-white font-medium"
                                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                                    }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                                                {link.label}
                                            </motion.div>
                                        );

                                        return link.external ? (
                                            <a
                                                key={link.href}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {linkContent}
                                            </a>
                                        ) : (
                                            <Link key={link.href} href={link.href}>
                                                {linkContent}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Separator */}
                                <div className="border-t border-white/10 my-4" />

                                {/* Theme & Language toggles */}
                                <div className="flex items-center justify-center gap-2 mb-4 sm:hidden">
                                    <ThemeToggle />
                                    <LanguageSwitcher />
                                </div>

                                {/* Action buttons */}
                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                                        onClick={handleMobileLogin}
                                    >
                                        Connexion
                                    </Button>
                                    <Button
                                        className="w-full h-11 rounded-xl font-medium text-white"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                                        }}
                                        onClick={handleMobileRegister}
                                    >
                                        Commencer
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ═══════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════ */

export default function LandingPage() {
    const [demoOpen, setDemoOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    const handleSwitchToRegister = useCallback(() => {
        setLoginOpen(false);
        // Small delay to allow exit animation
        setTimeout(() => setRegisterOpen(true), 150);
    }, []);

    const handleSwitchToLogin = useCallback(() => {
        setRegisterOpen(false);
        setTimeout(() => setLoginOpen(true), 150);
    }, []);

    return (
        <div className="min-h-screen">
            <Navbar
                onOpenLogin={() => setLoginOpen(true)}
                onOpenRegister={() => setRegisterOpen(true)}
            />

            {/* Above the fold — loaded immediately */}
            <HeroSection onOpenDemo={() => setDemoOpen(true)} />

            {/* Below the fold — lazy loaded */}
            <Suspense fallback={<SectionSkeleton />}>
                <ProblemSection />
                <ServicesSection />
                <JourneySection />
                <FinalCTASection />
                <FooterSection />
            </Suspense>



            {/* Auth modals — floating overlays */}
            <Suspense fallback={null}>
                <LoginModal
                    open={loginOpen}
                    onOpenChange={setLoginOpen}
                    onSwitchToRegister={handleSwitchToRegister}
                />
                <RegisterModal
                    open={registerOpen}
                    onOpenChange={setRegisterOpen}
                    onSwitchToLogin={handleSwitchToLogin}
                />
            </Suspense>
        </div>
    );
}
