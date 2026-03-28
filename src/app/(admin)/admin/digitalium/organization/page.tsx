// ═══════════════════════════════════════════════
// DIGITALIUM.IO — DIGITALIUM: Organisation
// Gestion de la structure interne DIGITALIUM
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { SettingsPage } from "@/components/shared/settings/SettingsPage";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DigitaliumOrganizationPage() {
    const { orgId, isResolved } = useOrganization();

    if (!isResolved) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!orgId) {
        return (
            <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <Building2 className="mb-4 h-10 w-10 text-white/20" />
                <h3 className="text-lg font-medium">Organisation non trouvée</h3>
                <p className="text-sm text-muted-foreground">
                    Impossible de charger le profil de l&apos;organisation DIGITALIUM.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20">
                    <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Paramètres de l&apos;Organisation</h1>
                    <p className="text-sm text-muted-foreground">
                        Gérez les informations, les adresses et la structure de l&apos;entité DIGITALIUM.
                    </p>
                </div>
            </div>

            {/* Reusing the shared SettingsPage component */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <SettingsPage accentColor="emerald" />
            </div>
        </motion.div>
    );
}
