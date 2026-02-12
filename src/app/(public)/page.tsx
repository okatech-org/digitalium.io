"use client";

import { useState, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
const PersonaSection = lazy(() => import("@/components/sections/PersonaSection"));
const SocialProofSection = lazy(() => import("@/components/sections/SocialProofSection"));
const SecuritySection = lazy(() => import("@/components/sections/SecuritySection"));
const FAQSection = lazy(() => import("@/components/sections/FAQSection"));
const FinalCTASection = lazy(() => import("@/components/sections/FinalCTASection"));
const FooterSection = lazy(() => import("@/components/sections/FooterSection"));

// Demo switcher — client only, deferred
const DemoAccountSwitcher = dynamic(
    () => import("@/components/shared/DemoAccountSwitcher"),
    { ssr: false }
);

/* ═══════════════════════════════════════════════
   Section placeholder — minimal to avoid CLS
   ═══════════════════════════════════════════════ */
function SectionSkeleton() {
    return <div className="w-full min-h-[200px]" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════════ */

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-digitalium-blue to-digitalium-violet flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="font-bold text-lg text-gradient">
                        DIGITALIUM.IO
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                    <a
                        href="#modules"
                        className="hover:text-foreground transition-colors"
                    >
                        Modules
                    </a>
                    <a
                        href="#pricing"
                        className="hover:text-foreground transition-colors"
                    >
                        Tarifs
                    </a>
                    <a href="#faq" className="hover:text-foreground transition-colors">
                        FAQ
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Connexion
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity"
                        >
                            Commencer
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
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

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Above the fold — loaded immediately */}
            <HeroSection onOpenDemo={() => setDemoOpen(true)} />

            {/* Below the fold — lazy loaded */}
            <Suspense fallback={<SectionSkeleton />}>
                <ProblemSection />
                <ServicesSection />
                <JourneySection />
                <PersonaSection />
                <SocialProofSection />
                <SecuritySection />
                <FAQSection />
                <FinalCTASection />
                <FooterSection />
            </Suspense>

            {/* Demo switcher — always rendered (shows floating button),
                Firebase inits only inside DemoAccountSwitcher when Sheet opens */}
            <DemoAccountSwitcher />
        </div>
    );
}
