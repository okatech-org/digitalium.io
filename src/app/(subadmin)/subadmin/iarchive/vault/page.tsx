"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Coffre-Fort Numérique
// ═══════════════════════════════════════════════

import React, { useState } from "react";
import { Lock, ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArchiveCategoryTable, {
    type CategoryConfig,
} from "@/components/modules/iarchive/ArchiveCategoryTable";
import { useArchiveEntries } from "@/hooks/useArchiveEntries";

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

export default function SubAdminVaultPage() {
    const [unlocked, setUnlocked] = useState(false);
    const [pin, setPin] = useState("");
    const { entries, isLoading } = useArchiveEntries("vault");

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement du coffre-fort…</span>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/15"
            >
                <ShieldCheck className="h-4 w-4 text-rose-400" />
                <span className="text-[11px] text-rose-300">Chiffrement de bout en bout activé — Session sécurisée</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUnlocked(false)}
                    className="ml-auto h-5 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                    Verrouiller
                </Button>
            </motion.div>
            <ArchiveCategoryTable config={CONFIG} entries={entries} isVault />
        </div>
    );
}
