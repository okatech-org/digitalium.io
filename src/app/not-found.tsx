"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Custom 404 Page
// Premium not-found page with navigation
// NEXUS-OMEGA M5 Sprint 9
// ═══════════════════════════════════════════════

import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full text-center space-y-8"
            >
                {/* Animated 404 */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative"
                >
                    <h1 className="text-[120px] font-extrabold leading-none bg-gradient-to-br from-violet-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 blur-3xl -z-10" />
                </motion.div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Page introuvable</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        La page que vous recherchez n&apos;existe pas ou a été déplacée.
                        Vérifiez l&apos;URL ou retournez à l&apos;accueil.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-medium hover:from-violet-700 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/20"
                    >
                        <Home className="h-4 w-4" />
                        Retour à l&apos;accueil
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Page précédente
                    </button>
                </div>

                <p className="text-[10px] text-muted-foreground/30">
                    DIGITALIUM.IO · Plateforme documentaire
                </p>
            </motion.div>
        </div>
    );
}
