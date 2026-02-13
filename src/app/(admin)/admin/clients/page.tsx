// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Business: Clients
// Relation commerciale avec les organisations
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CLIENTS = [
    { name: "DGDI", type: "Gouvernement", contact: "M. Essono", email: "contact@dgdi.ga", docs: 34, revenue: "4.5M XAF" },
    { name: "Min. Intérieur", type: "Gouvernement", contact: "Mme Akongo", email: "secgen@minterieur.ga", docs: 67, revenue: "8.2M XAF" },
    { name: "SEEG", type: "Établissement public", contact: "M. Bivigou", email: "direction@seeg.ga", docs: 23, revenue: "2.1M XAF" },
    { name: "Gabon Télécom", type: "Entreprise", contact: "Mme Ndong", email: "admin@gabtelecom.ga", docs: 45, revenue: "3.5M XAF" },
    { name: "Port-Gentil Logistique", type: "Entreprise", contact: "M. Mba", email: "direction@pgl.ga", docs: 12, revenue: "1.8M XAF" },
];

export default function ClientsPage() {
    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-blue-400" />
                        Clients
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{CLIENTS.length} clients</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-violet-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                    <Plus className="h-3.5 w-3.5" /> Ajouter
                </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Client</th>
                            <th className="text-left py-2 px-2">Type</th>
                            <th className="text-left py-2 px-2 hidden md:table-cell">Contact</th>
                            <th className="text-right py-2 px-2 hidden sm:table-cell">Documents</th>
                            <th className="text-right py-2 px-2">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CLIENTS.map((c, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2.5 px-2 font-medium">{c.name}</td>
                                <td className="py-2.5 px-2">
                                    <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{c.type}</Badge>
                                </td>
                                <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{c.contact}</td>
                                <td className="py-2.5 px-2 text-right font-mono hidden sm:table-cell">{c.docs}</td>
                                <td className="py-2.5 px-2 text-right font-mono">{c.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
