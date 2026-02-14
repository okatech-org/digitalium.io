"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iArchive: Coffre-Fort Numérique (Institutional)
// Restricted access (org_admin only) with encryption indicator
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ArchiveCategoryTable, {
    type ArchiveEntry,
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";

const CONFIG: CategoryConfig = {
    key: "vault",
    label: "Coffre-Fort Numérique",
    description: "Documents sensibles — Accès org_admin uniquement",
    icon: Lock,
    gradient: "from-rose-600 to-pink-500",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    retention: "Illimité",
    chartColor: "#f43f5e",
};

const ENTRIES: ArchiveEntry[] = [
    { id: "v1", title: "Brevet logiciel — iDETUDE v3", archivedAt: "09/02/2026", expiresAt: "∞ Illimité", size: "12.4 Mo", hash: "92b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5", status: "active", certId: "CERT-2026-07993", archivedBy: "Daniel Nguema" },
    { id: "v2", title: "Accord d'actionnaires — Confidentiel", archivedAt: "15/01/2026", expiresAt: "∞ Illimité", size: "3.8 Mo", hash: "a3c6f9e2b5d8a1c4f7e0b3d6a9c2f5e8b1d4a7c0f3e6b9d2a5c8f1e4b7d0a3c6", status: "active", certId: "CERT-2026-07950", archivedBy: "Daniel Nguema" },
    { id: "v3", title: "Plan stratégique 2026–2030", archivedAt: "20/12/2025", expiresAt: "∞ Illimité", size: "8.2 Mo", hash: "b4d7a0c3f6e9b2d5a8c1f4e7b0d3a6c9f2e5b8d1a4c7f0e3b6d9a2c5f8e1b4d7", status: "active", certId: "CERT-2025-07895", archivedBy: "Daniel Nguema" },
    { id: "v4", title: "Contrat de cession IP — Technologie Nexus", archivedAt: "01/11/2025", expiresAt: "∞ Illimité", size: "1.9 Mo", hash: "c5e8b1d4a7c0f3e6b9d2a5c8f1e4b7d0a3c6f9e2b5d8a1c4f7e0b3d6a9c2f5e8", status: "active", certId: "CERT-2025-07210", archivedBy: "Claude Mboumba" },
    { id: "v5", title: "Audit sécurité SI — Rapport confidentiel 2025", archivedAt: "10/09/2025", expiresAt: "∞ Illimité", size: "5.6 Mo", hash: "d6f9c2e5b8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e9b2d5a8c1f4e7b0d3a6c9", status: "active", certId: "CERT-2025-06543", archivedBy: "Daniel Nguema" },
];

type UserRole = "org_member" | "org_manager" | "org_admin" | "org_viewer";

export default function VaultPage() {
    // Demo: toggle between admin and non-admin views
    const [userRole] = useState<UserRole>("org_admin");
    const [unlocked, setUnlocked] = useState(false);
    const [pin, setPin] = useState("");

    const isAdmin = userRole === "org_admin";

    // Access gate for non-admin users
    if (!isAdmin) {
        return (
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                    <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                        <Lock className="h-10 w-10 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Accès Restreint</h1>
                    <p className="text-sm text-zinc-400 max-w-md mb-4">
                        Le Coffre-Fort Numérique est réservé aux administrateurs de l&apos;organisation.
                        Contactez votre administrateur pour obtenir l&apos;accès.
                    </p>
                    <Badge variant="outline" className="text-xs border-red-500/20 text-red-400">
                        Rôle requis : org_admin
                    </Badge>
                </motion.div>
            </div>
        );
    }

    // Unlock gate for admin users
    if (!unlocked) {
        return (
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                    <motion.div
                        animate={{ boxShadow: ["0 0 0 0 rgba(244,63,94,0)", "0 0 30px 8px rgba(244,63,94,0.15)", "0 0 0 0 rgba(244,63,94,0)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-20 w-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6"
                    >
                        <KeyRound className="h-10 w-10 text-rose-400" />
                    </motion.div>
                    <h1 className="text-2xl font-bold mb-2">Coffre-Fort Numérique</h1>
                    <p className="text-sm text-zinc-400 max-w-md mb-6">
                        Entrez votre code PIN pour accéder aux documents confidentiels.
                        Chiffrement de bout en bout activé.
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                        <Input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && setUnlocked(true)}
                            placeholder="Code PIN"
                            className="w-48 h-10 text-center text-lg tracking-[0.5em] bg-white/5 border-rose-500/20 focus-visible:ring-rose-500/30"
                            maxLength={6}
                        />
                        <Button
                            onClick={() => setUnlocked(true)}
                            className="h-10 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600"
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            Déverrouiller
                        </Button>
                    </div>
                    <p className="text-[10px] text-zinc-600">Demo: entrez n&apos;importe quel PIN</p>
                </motion.div>
            </div>
        );
    }

    // Unlocked vault view
    return (
        <div className="space-y-0">
            {/* Encryption banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/15"
            >
                <ShieldCheck className="h-4 w-4 text-rose-400" />
                <span className="text-[11px] text-rose-300">
                    🔐 Chiffrement de bout en bout activé — Session sécurisée
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUnlocked(false)}
                    className="ml-auto h-5 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                    Verrouiller
                </Button>
            </motion.div>

            <ArchiveCategoryTable config={CONFIG} entries={ENTRIES} isVault />
        </div>
    );
}
