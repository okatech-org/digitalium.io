"use client";

import { useState, useCallback, lazy, Suspense } from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

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
   Navigation
   ═══════════════════════════════════════════════ */

interface NavbarProps {
    onOpenLogin: () => void;
    onOpenRegister: () => void;
}

function Navbar({ onOpenLogin, onOpenRegister }: NavbarProps) {
    return (
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
                    <Link
                        href="/"
                        className="text-foreground font-medium transition-colors"
                    >
                        Accueil
                    </Link>
                    <Link
                        href="/solutions/administrations"
                        className="hover:text-foreground transition-colors"
                    >
                        Administrations
                    </Link>
                    <Link
                        href="/solutions/entreprises"
                        className="hover:text-foreground transition-colors"
                    >
                        Entreprises
                    </Link>
                    <Link
                        href="/solutions/organismes"
                        className="hover:text-foreground transition-colors"
                    >
                        Organismes
                    </Link>
                    <a
                        href="https://identite.ga/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        Particuliers
                    </a>
                    <Link
                        href="/guide"
                        className="hover:text-foreground transition-colors"
                    >
                        Guide d&apos;utilisation
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1 mr-2">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                    <Button variant="ghost" size="sm" onClick={onOpenLogin}>
                        Connexion
                    </Button>
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity"
                        onClick={onOpenRegister}
                    >
                        Commencer
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </nav>
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
