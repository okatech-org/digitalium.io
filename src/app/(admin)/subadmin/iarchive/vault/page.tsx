// DIGITALIUM.IO — iArchive: Coffre-Fort numérique
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Lock, Shield, FileText, Key, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const VAULT_ITEMS = [
    { name: "Clé API Firebase — Production", type: "Credentials", addedBy: "System Admin", date: "15 jan 2026", encryption: "AES-256" },
    { name: "Certificat SSL — digitalium.io", type: "Certificat", addedBy: "System Admin", date: "10 jan 2026", encryption: "RSA-4096" },
    { name: "Master Key — Base de données", type: "Credentials", addedBy: "System Admin", date: "1 jan 2026", encryption: "AES-256" },
    { name: "Contrat original — Scellé", type: "Document scellé", addedBy: "Marie Nzé", date: "15 déc 2025", encryption: "AES-256" },
    { name: "PV AG — Copie certifiée conforme", type: "Document scellé", addedBy: "Patrick Obiang", date: "10 déc 2025", encryption: "AES-256" },
];

export default function VaultPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1000px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6 text-amber-400" /> Coffre-Fort</h1>
                <p className="text-sm text-muted-foreground mt-1">Documents chiffrés & secrets · Accès restreint</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-amber-500/10">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/5 mb-4">
                    <Shield className="h-5 w-5 text-amber-400 shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-amber-400">Espace sécurisé</p>
                        <p className="text-[10px] text-muted-foreground">Tous les documents sont chiffrés de bout en bout. L&apos;accès est journalisé.</p>
                    </div>
                </div>
                <div className="space-y-1">
                    {VAULT_ITEMS.map((v, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.02] group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Key className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">{v.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{v.type} · {v.encryption} · {v.addedBy} · {v.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Eye className="h-3 w-3" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
