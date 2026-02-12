// DIGITALIUM.IO — iArchive: Archives Clients
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Building2, FileText, Search, FolderOpen, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CLIENTS = [
    { name: "DGDI", docs: 34, lastUpdate: "Il y a 2h", type: "Gouvernement" },
    { name: "Ministère de l'Intérieur", docs: 67, lastUpdate: "Hier", type: "Gouvernement" },
    { name: "SEEG", docs: 23, lastUpdate: "Il y a 3j", type: "Établissement public" },
    { name: "Gabon Télécom", docs: 45, lastUpdate: "Il y a 5j", type: "Entreprise" },
    { name: "Port-Gentil Logistique", docs: 12, lastUpdate: "Il y a 7j", type: "Entreprise" },
    { name: "Okoumé Capital", docs: 8, lastUpdate: "Il y a 10j", type: "Entreprise" },
];

export default function ClientArchivesPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-amber-400" /> Archives Clients</h1>
                <p className="text-sm text-muted-foreground mt-1">Dossiers archivés par client</p>
            </motion.div>
            <motion.div variants={fadeUp} className="relative max-w-[320px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher un client…" className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CLIENTS.map((c) => (
                    <div key={c.name} className="glass-card rounded-xl p-5 group hover:bg-white/[0.03] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><FolderOpen className="h-5 w-5 text-amber-400" /></div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-semibold text-sm">{c.name}</h3>
                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0 mt-1">{c.type}</Badge>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span>{c.docs} documents</span><span>·</span><span>{c.lastUpdate}</span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
