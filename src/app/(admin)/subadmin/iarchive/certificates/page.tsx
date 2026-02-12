// DIGITALIUM.IO — iArchive: Certificats
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Award, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CERTS = [
    { name: "Registre de Commerce (RCCM)", issuer: "Tribunal de Commerce", issued: "15 mar 2024", expires: "15 mar 2029", status: "valide" as const },
    { name: "Patente commerciale 2026", issuer: "DGI Gabon", issued: "1 jan 2026", expires: "31 déc 2026", status: "valide" as const },
    { name: "Attestation CNSS — employeur", issuer: "CNSS Gabon", issued: "1 jan 2026", expires: "31 mar 2026", status: "valide" as const },
    { name: "Certificat de conformité — ANINF", issuer: "ANINF", issued: "1 oct 2025", expires: "30 sep 2026", status: "valide" as const },
    { name: "Attestation fiscale 2025", issuer: "DGI Gabon", issued: "15 jan 2026", expires: "15 jan 2027", status: "valide" as const },
    { name: "Licence d'exploitation logicielle", issuer: "ARCEP Gabon", issued: "1 jun 2024", expires: "1 jun 2025", status: "expiré" as const },
];

export default function CertificatesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-amber-400" /> Certificats</h1>
                <p className="text-sm text-muted-foreground mt-1">Licences, permis et certifications officielles</p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold text-emerald-400">{CERTS.filter(c => c.status === "valide").length}</p><p className="text-[10px] text-muted-foreground">Valides</p></div>
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold text-red-400">{CERTS.filter(c => c.status === "expiré").length}</p><p className="text-[10px] text-muted-foreground">Expirés</p></div>
                <div className="glass-card rounded-xl p-4"><p className="text-2xl font-bold text-amber-400">1</p><p className="text-[10px] text-muted-foreground">Bientôt expiré</p></div>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Certificat</th><th className="text-left py-2 px-2 hidden sm:table-cell">Émetteur</th><th className="text-left py-2 px-2 hidden md:table-cell">Émis le</th><th className="text-left py-2 px-2">Expire le</th><th className="text-center py-2 px-2">Statut</th><th className="text-center py-2 px-2 w-10"></th></tr></thead>
                    <tbody>
                        {CERTS.map((c, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{c.name}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{c.issuer}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{c.issued}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{c.expires}</td>
                                <td className="py-2.5 px-2 text-center">
                                    <Badge variant="secondary" className={`text-[9px] border-0 ${c.status === "valide" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                        {c.status === "valide" ? "✓ Valide" : "⚠ Expiré"}
                                    </Badge>
                                </td>
                                <td className="py-2.5 px-2 text-center"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Download className="h-3 w-3" /></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
