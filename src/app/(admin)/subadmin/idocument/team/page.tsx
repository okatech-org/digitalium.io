// DIGITALIUM.IO — iDocument: Documents Équipe
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, FileText, FolderOpen, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const TEAMS = [
    { name: "Direction Générale", docs: 34, members: 4, lastActivity: "Il y a 2h" },
    { name: "Finance & Comptabilité", docs: 67, members: 8, lastActivity: "Il y a 1h" },
    { name: "Ressources Humaines", docs: 45, members: 6, lastActivity: "Hier" },
    { name: "IT & Infrastructure", docs: 23, members: 5, lastActivity: "Il y a 3h" },
    { name: "Juridique", docs: 56, members: 3, lastActivity: "Hier" },
    { name: "Communication", docs: 18, members: 4, lastActivity: "Il y a 5h" },
];

export default function TeamDocumentsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-400" /> Documents Équipe</h1>
                <p className="text-sm text-muted-foreground mt-1">Espaces documentaires par équipe</p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEAMS.map((t) => (
                    <div key={t.name} className="glass-card rounded-xl p-5 group hover:bg-white/[0.03] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <FolderOpen className="h-5 w-5 text-blue-400" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-semibold text-sm">{t.name}</h3>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span>{t.docs} documents</span>
                            <span>·</span>
                            <span>{t.members} membres</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{t.lastActivity}</p>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
