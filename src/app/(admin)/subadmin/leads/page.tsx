// DIGITALIUM.IO — SubAdmin: Leads
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Target, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const LEADS = [
    { company: "Assala Energy", contact: "Michel Bongo", status: "chaud" as const, source: "Site web", date: "12 fév 2026" },
    { company: "CNAMGS", contact: "Anne Nyangui", status: "tiède" as const, source: "Démonstration", date: "10 fév 2026" },
    { company: "Total Energies Gabon", contact: "Pierre Essone", status: "chaud" as const, source: "Référence", date: "8 fév 2026" },
    { company: "Air Service Gabon", contact: "Eric Ndouna", status: "froid" as const, source: "LinkedIn", date: "5 fév 2026" },
];

const statusCfg = { chaud: "bg-red-500/15 text-red-400", tiède: "bg-amber-500/15 text-amber-400", froid: "bg-blue-500/15 text-blue-400" };

export default function LeadsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-violet-400" /> Leads</h1><p className="text-sm text-muted-foreground mt-1">Prospects et opportunités</p></div>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8"><Plus className="h-3.5 w-3.5" /> Ajouter</Button>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left py-2 px-2">Entreprise</th><th className="text-left py-2 px-2">Contact</th><th className="text-left py-2 px-2 hidden sm:table-cell">Source</th><th className="text-left py-2 px-2 hidden md:table-cell">Date</th><th className="text-center py-2 px-2">Statut</th></tr></thead>
                    <tbody>
                        {LEADS.map((l, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{l.company}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{l.contact}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{l.source}</td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{l.date}</td>
                                <td className="py-2.5 px-2 text-center"><Badge variant="secondary" className={`text-[9px] border-0 ${statusCfg[l.status]}`}>{l.status}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
