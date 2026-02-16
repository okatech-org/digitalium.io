// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page publique dynamique par organisation
// Route: /org/[domain]
// Templates: corporate, startup, institution
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Building2, Globe, Mail, Phone, MapPin, ArrowRight,
    FileText, Archive, Pen, Bot, Shield, Loader2,
    ExternalLink, Sparkles, Zap, ChevronRight,
    Users, BarChart3, Lock,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Module icons ─────────────────────────────
const MODULE_ICONS: Record<string, React.ElementType> = {
    iDocument: FileText,
    iArchive: Archive,
    iSignature: Pen,
    iAsted: Bot,
};

const MODULE_LABELS: Record<string, string> = {
    iDocument: "Documents intelligents",
    iArchive: "Archivage certifié",
    iSignature: "Signature électronique",
    iAsted: "Assistant IA",
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
    iDocument: "Créez, collaborez et gérez vos documents en temps réel",
    iArchive: "Conservation aux normes OHADA avec traçabilité complète",
    iSignature: "Signez et faites signer vos documents en toute sécurité",
    iAsted: "Intelligence artificielle au service de votre productivité",
};

// ─── Type for org data ────────────────────────
interface OrgData {
    _id: string;
    name: string;
    subdomain?: string;
    type: string;
    description?: string;
    logoUrl?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    sector?: string;
    hosting?: {
        type: string;
        domain?: string;
        pagePublique?: boolean;
    };
    publicPageConfig?: {
        template?: "corporate" | "startup" | "institution";
        heroTitle?: string;
        heroSubtitle?: string;
        description?: string;
        primaryColor?: string;
        accentColor?: string;
        ctaText?: string;
        ctaLink?: string;
        showModules?: boolean;
        showContact?: boolean;
        customCss?: string;
    };
    modules?: string[];
    status: string;
}

// ─── Fade-in animation ────────────────────────
const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
};

// ═══════════════════════════════════════════════
//  NOT FOUND STATE
// ═══════════════════════════════════════════════

function NotFound({ domain }: { domain: string }) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
            <motion.div
                {...fadeIn}
                className="text-center max-w-md"
            >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center border border-violet-500/10">
                    <Globe className="w-10 h-10 text-violet-400/50" />
                </div>
                <h1 className="text-2xl font-bold text-white/90 mb-2">
                    Page introuvable
                </h1>
                <p className="text-white/40 text-sm mb-6">
                    L&apos;organisation <span className="text-violet-400 font-medium">{domain}.digitalium.io</span> n&apos;existe pas ou n&apos;a pas activé sa page publique.
                </p>
                <a
                    href="https://digitalium.io"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Visiter DIGITALIUM.IO <ArrowRight className="w-4 h-4" />
                </a>
            </motion.div>
        </div>
    );
}

// ═══════════════════════════════════════════════
//  LOADING STATE
// ═══════════════════════════════════════════════

function LoadingState() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                <p className="text-white/40 text-sm">Chargement…</p>
            </motion.div>
        </div>
    );
}

// ═══════════════════════════════════════════════
//  SHARED FOOTER
// ═══════════════════════════════════════════════

function Footer({ org, primaryColor }: { org: OrgData; primaryColor: string }) {
    return (
        <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)` }}
                            >
                                {org.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm font-medium text-white/70">{org.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                        <span>Propulsé par</span>
                        <a
                            href="https://digitalium.io"
                            className="text-violet-400 hover:text-violet-300 transition-colors font-medium inline-flex items-center gap-1"
                        >
                            DIGITALIUM.IO <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ═══════════════════════════════════════════════
//  TEMPLATE: CORPORATE
// ═══════════════════════════════════════════════

function CorporateTemplate({ org }: { org: OrgData }) {
    const config = org.publicPageConfig ?? {};
    const primary = config.primaryColor || "#8B5CF6";
    const accent = config.accentColor || "#6366F1";

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                            >
                                {org.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-lg font-bold">{org.name}</span>
                    </div>
                    {config.ctaLink && (
                        <a
                            href={config.ctaLink}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                        >
                            {config.ctaText || "Nous contacter"}
                        </a>
                    )}
                </div>
            </nav>

            {/* ── Hero ── */}
            <motion.section
                {...fadeIn}
                className="relative overflow-hidden py-24 md:py-32"
            >
                {/* Gradient background */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: `radial-gradient(ellipse at 50% 30%, ${primary}40, transparent 70%)` }}
                />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
                            style={{
                                borderColor: `${primary}30`,
                                backgroundColor: `${primary}10`,
                                color: primary,
                            }}
                        >
                            <Shield className="w-3 h-3" />
                            {org.sector || "Organisation vérifiée"}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            {config.heroTitle || org.name}
                        </h1>
                        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8">
                            {config.heroSubtitle || config.description || org.description || "Bienvenue sur notre espace digital"}
                        </p>
                        {config.ctaLink && (
                            <a
                                href={config.ctaLink}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${primary}, ${accent})`,
                                    boxShadow: `0 8px 32px ${primary}30`,
                                }}
                            >
                                {config.ctaText || "Découvrir"} <ArrowRight className="w-4 h-4" />
                            </a>
                        )}
                    </motion.div>
                </div>
            </motion.section>

            {/* ── About ── */}
            {(config.description || org.description) && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={stagger}
                    className="py-16 md:py-20"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <motion.div variants={fadeIn} className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${primary}15` }}>
                                    <Building2 className="w-5 h-5" style={{ color: primary }} />
                                </div>
                                <h2 className="text-xl font-bold">À propos</h2>
                            </div>
                            <p className="text-white/60 leading-relaxed">
                                {config.description || org.description}
                            </p>
                        </motion.div>
                    </div>
                </motion.section>
            )}

            {/* ── Modules ── */}
            {config.showModules !== false && org.modules && org.modules.length > 0 && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={stagger}
                    className="py-16 md:py-20 border-t border-white/5"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div variants={fadeIn} className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Nos solutions</h2>
                            <p className="text-white/40 text-sm">Les modules activés pour notre organisation</p>
                        </motion.div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {org.modules.map((mod) => {
                                const Icon = MODULE_ICONS[mod] || FileText;
                                return (
                                    <motion.div
                                        key={mod}
                                        variants={fadeIn}
                                        className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                            style={{ backgroundColor: `${primary}15` }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: primary }} />
                                        </div>
                                        <h3 className="font-semibold text-sm mb-1">{MODULE_LABELS[mod] || mod}</h3>
                                        <p className="text-xs text-white/40 leading-relaxed">{MODULE_DESCRIPTIONS[mod] || ""}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* ── Contact ── */}
            {config.showContact !== false && (org.email || org.telephone || org.adresse) && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={stagger}
                    className="py-16 md:py-20 border-t border-white/5"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <motion.div variants={fadeIn} className="text-center mb-10">
                            <h2 className="text-2xl font-bold mb-2">Contact</h2>
                            <p className="text-white/40 text-sm">Nous sommes à votre disposition</p>
                        </motion.div>
                        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {org.email && (
                                <a href={`mailto:${org.email}`} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
                                    <Mail className="w-5 h-5 shrink-0" style={{ color: primary }} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Email</p>
                                        <p className="text-sm text-white/70 truncate">{org.email}</p>
                                    </div>
                                </a>
                            )}
                            {org.telephone && (
                                <a href={`tel:${org.telephone}`} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
                                    <Phone className="w-5 h-5 shrink-0" style={{ color: primary }} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Téléphone</p>
                                        <p className="text-sm text-white/70">{org.telephone}</p>
                                    </div>
                                </a>
                            )}
                            {org.adresse && (
                                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <MapPin className="w-5 h-5 shrink-0" style={{ color: primary }} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Adresse</p>
                                        <p className="text-sm text-white/70">{org.adresse}{org.ville ? `, ${org.ville}` : ""}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.section>
            )}

            <Footer org={org} primaryColor={primary} />
        </div>
    );
}

// ═══════════════════════════════════════════════
//  TEMPLATE: STARTUP
// ═══════════════════════════════════════════════

function StartupTemplate({ org }: { org: OrgData }) {
    const config = org.publicPageConfig ?? {};
    const primary = config.primaryColor || "#F97316";
    const accent = config.accentColor || "#EC4899";

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* ── Floating Nav ── */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {org.logoUrl ? (
                        <img src={org.logoUrl} alt={org.name} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                        >
                            {org.name.charAt(0)}
                        </div>
                    )}
                    <span className="text-sm font-bold">{org.name}</span>
                </div>
                {config.ctaLink && (
                    <a
                        href={config.ctaLink}
                        className="px-4 py-1.5 rounded-full text-xs font-medium text-white transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                    >
                        {config.ctaText || "Go"} <ArrowRight className="w-3 h-3 inline-block ml-1" />
                    </a>
                )}
            </nav>

            {/* ── Hero (bold, center) ── */}
            <motion.section
                {...fadeIn}
                className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6"
            >
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px] opacity-20 animate-pulse"
                        style={{ backgroundColor: primary }}
                    />
                    <div
                        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[128px] opacity-15 animate-pulse"
                        style={{ backgroundColor: accent, animationDelay: "1s" }}
                    />
                </div>

                <div className="relative text-center max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 border border-white/10 bg-white/5">
                            <Sparkles className="w-3.5 h-3.5" style={{ color: primary }} />
                            {org.sector || "Innovation"}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: `linear-gradient(135deg, ${primary}, ${accent})` }}
                            >
                                {config.heroTitle || org.name}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-10">
                            {config.heroSubtitle || config.description || org.description || "L'innovation au service de votre réussite"}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {config.ctaLink && (
                                <a
                                    href={config.ctaLink}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold transition-all hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${accent})`,
                                        boxShadow: `0 12px 40px ${primary}40`,
                                    }}
                                >
                                    {config.ctaText || "Commencer"} <Zap className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* ── Features / Modules ── */}
            {config.showModules !== false && org.modules && org.modules.length > 0 && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={stagger}
                    className="py-20 md:py-28"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div variants={fadeIn} className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                Tout ce dont vous avez besoin
                            </h2>
                            <p className="text-white/40">Nos solutions intégrées</p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {org.modules.map((mod, i) => {
                                const Icon = MODULE_ICONS[mod] || FileText;
                                return (
                                    <motion.div
                                        key={mod}
                                        variants={fadeIn}
                                        className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
                                    >
                                        <div
                                            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"
                                            style={{ backgroundColor: i % 2 === 0 ? primary : accent }}
                                        />
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                            style={{ backgroundColor: `${primary}15` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: primary }} />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{MODULE_LABELS[mod] || mod}</h3>
                                        <p className="text-sm text-white/40 leading-relaxed">{MODULE_DESCRIPTIONS[mod] || ""}</p>
                                        <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 text-white/10 group-hover:text-white/30 transition-colors" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* ── Contact (compact) ── */}
            {config.showContact !== false && (org.email || org.telephone) && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="py-20 border-t border-white/5"
                >
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <motion.div variants={fadeIn}>
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Parlons de votre projet</h2>
                            <p className="text-white/40 mb-8">N&apos;hésitez pas à nous contacter</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {org.email && (
                                    <a
                                        href={`mailto:${org.email}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm hover:border-white/20 transition-all"
                                    >
                                        <Mail className="w-4 h-4" style={{ color: primary }} />
                                        {org.email}
                                    </a>
                                )}
                                {org.telephone && (
                                    <a
                                        href={`tel:${org.telephone}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm hover:border-white/20 transition-all"
                                    >
                                        <Phone className="w-4 h-4" style={{ color: primary }} />
                                        {org.telephone}
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.section>
            )}

            <Footer org={org} primaryColor={primary} />
        </div>
    );
}

// ═══════════════════════════════════════════════
//  TEMPLATE: INSTITUTION
// ═══════════════════════════════════════════════

function InstitutionTemplate({ org }: { org: OrgData }) {
    const config = org.publicPageConfig ?? {};
    const primary = config.primaryColor || "#0EA5E9";
    const accent = config.accentColor || "#0369A1";

    return (
        <div className="min-h-screen bg-[#060a14] text-white">
            {/* ── Header ── */}
            <header className="border-b border-white/5 bg-[#060a14]/90 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Top bar */}
                    <div className="flex items-center justify-between py-2 border-b border-white/5 text-[10px] text-white/30">
                        <span>République du {org.pays || "Gabon"}</span>
                        <span>{org.ville || ""}</span>
                    </div>
                    {/* Main nav */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            {org.logoUrl ? (
                                <img src={org.logoUrl} alt={org.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg"
                                    style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                                >
                                    {org.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h1 className="text-base font-bold">{org.name}</h1>
                                {org.sector && (
                                    <p className="text-[11px] text-white/40">{org.sector}</p>
                                )}
                            </div>
                        </div>
                        {config.ctaLink && (
                            <a
                                href={config.ctaLink}
                                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                                style={{ background: primary }}
                            >
                                {config.ctaText || "Portail"} <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Hero (institutional) ── */}
            <motion.section
                {...fadeIn}
                className="relative py-20 md:py-28"
            >
                <div
                    className="absolute inset-0 opacity-5"
                    style={{ background: `linear-gradient(180deg, ${primary}20, transparent 60%)` }}
                />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: primary }} />
                                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    {org.type === "government" ? "Institution Gouvernementale" : org.type === "institution" ? "Institution Publique" : "Organisation"}
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                                {config.heroTitle || org.name}
                            </h2>
                            <p className="text-white/50 leading-relaxed mb-8">
                                {config.heroSubtitle || config.description || org.description || "Au service de la transformation digitale"}
                            </p>
                            {config.ctaLink && (
                                <a
                                    href={config.ctaLink}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
                                    style={{ background: primary }}
                                >
                                    {config.ctaText || "Accéder au portail"} <ArrowRight className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Users, label: "Gestion RH", value: "Centralisée" },
                                    { icon: FileText, label: "Documents", value: "Dématérialisés" },
                                    { icon: Lock, label: "Sécurité", value: "Certifiée" },
                                    { icon: BarChart3, label: "Analytics", value: "Temps réel" },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center"
                                    >
                                        <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: primary }} />
                                        <p className="text-xs font-bold">{stat.value}</p>
                                        <p className="text-[10px] text-white/30">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* ── Modules ── */}
            {config.showModules !== false && org.modules && org.modules.length > 0 && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="py-16 md:py-20 border-t border-white/5"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div variants={fadeIn} className="flex items-center gap-3 mb-10">
                            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: primary }} />
                            <h2 className="text-xl font-bold">Services numériques</h2>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {org.modules.map((mod) => {
                                const Icon = MODULE_ICONS[mod] || FileText;
                                return (
                                    <motion.div
                                        key={mod}
                                        variants={fadeIn}
                                        className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${primary}15` }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: primary }} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm mb-1">{MODULE_LABELS[mod] || mod}</h3>
                                            <p className="text-xs text-white/40 leading-relaxed">{MODULE_DESCRIPTIONS[mod] || ""}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* ── Contact ── */}
            {config.showContact !== false && (org.email || org.telephone || org.adresse) && (
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="py-16 md:py-20 border-t border-white/5"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div variants={fadeIn} className="flex items-center gap-3 mb-10">
                            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: primary }} />
                            <h2 className="text-xl font-bold">Coordonnées</h2>
                        </motion.div>
                        <motion.div variants={fadeIn} className="rounded-xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {org.adresse && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primary }} />
                                        <div>
                                            <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-1">Adresse</p>
                                            <p className="text-sm text-white/70">{org.adresse}</p>
                                            {org.ville && <p className="text-sm text-white/70">{org.ville}, {org.pays || "Gabon"}</p>}
                                        </div>
                                    </div>
                                )}
                                {org.telephone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primary }} />
                                        <div>
                                            <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-1">Téléphone</p>
                                            <a href={`tel:${org.telephone}`} className="text-sm text-white/70 hover:text-white/90 transition-colors">{org.telephone}</a>
                                        </div>
                                    </div>
                                )}
                                {org.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primary }} />
                                        <div>
                                            <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-1">Email</p>
                                            <a href={`mailto:${org.email}`} className="text-sm text-white/70 hover:text-white/90 transition-colors">{org.email}</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.section>
            )}

            <Footer org={org} primaryColor={primary} />
        </div>
    );
}

// ═══════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════

export default function OrgPublicPage() {
    const params = useParams();
    const domain = typeof params.domain === "string" ? params.domain : "";

    const org = useQuery(api.organizations.getByDomain, domain ? { domain } : "skip") as OrgData | null | undefined;

    // Loading
    if (org === undefined) return <LoadingState />;

    // Not found or page not enabled
    if (!org || !org.hosting?.pagePublique) return <NotFound domain={domain} />;

    // Route to template
    const template = org.publicPageConfig?.template || "corporate";

    switch (template) {
        case "startup":
            return <StartupTemplate org={org} />;
        case "institution":
            return <InstitutionTemplate org={org} />;
        case "corporate":
        default:
            return <CorporateTemplate org={org} />;
    }
}
