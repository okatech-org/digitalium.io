// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules: Liste des Clients
// Recherche, filtres et tableau des organisations clientes
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    UserCircle,
    Plus,
    Search,
    FileText,
    Archive,
    PenTool,
    CheckCircle2,
    Clock,
    Server,
    Cloud,
    HardDrive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ─────────────────────────── */

interface ClientItem {
    id: string;
    name: string;
    type: string;
    contact: string;
    email: string;
    modules: string[];
    hebergement: "Local" | "Data Center" | "Cloud";
    statut: "Actif" | "Config" | "Suspendu";
    stockage: string;
    membres: number;
}

/* ─── Mock Data ─────────────────────────── */

const CLIENTS: ClientItem[] = [
    { id: "seeg", name: "SEEG", type: "Établissement public", contact: "M. Bivigou", email: "direction@seeg.ga", modules: ["iDocument", "iArchive", "iSignature"], hebergement: "Data Center", statut: "Actif", stockage: "45 GB", membres: 47 },
    { id: "dgdi", name: "DGDI", type: "Gouvernement", contact: "M. Essono", email: "contact@dgdi.ga", modules: ["iDocument", "iArchive"], hebergement: "Cloud", statut: "Actif", stockage: "32 GB", membres: 34 },
    { id: "minterieur", name: "Min. Intérieur", type: "Gouvernement", contact: "Mme Akongo", email: "secgen@minterieur.ga", modules: ["iDocument", "iArchive", "iSignature"], hebergement: "Local", statut: "Actif", stockage: "28 GB", membres: 67 },
    { id: "gabtelecom", name: "Gabon Télécom", type: "Entreprise", contact: "Mme Ndong", email: "admin@gabtelecom.ga", modules: ["iDocument", "iSignature"], hebergement: "Cloud", statut: "Config", stockage: "15 GB", membres: 45 },
    { id: "pgl", name: "Port-Gentil Logistique", type: "Entreprise", contact: "M. Mba", email: "direction@pgl.ga", modules: ["iDocument"], hebergement: "Cloud", statut: "Config", stockage: "8 GB", membres: 12 },
];

const MODULE_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    iDocument: { bg: "bg-blue-500/15", text: "text-blue-400", icon: FileText },
    iArchive: { bg: "bg-amber-500/15", text: "text-amber-400", icon: Archive },
    iSignature: { bg: "bg-violet-500/15", text: "text-violet-400", icon: PenTool },
};

const HEBERGEMENT_ICONS: Record<string, React.ElementType> = {
    Local: Server,
    "Data Center": HardDrive,
    Cloud: Cloud,
};

/* ═══════════════════════════════════════════ */

export default function ModulesClientsPage() {
    const [search, setSearch] = useState("");
    const [filterModule, setFilterModule] = useState<string | null>(null);
    const [filterStatut, setFilterStatut] = useState<string | null>(null);

    const filtered = CLIENTS.filter((c) => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase());
        const matchModule = !filterModule || c.modules.includes(filterModule);
        const matchStatut = !filterStatut || c.statut === filterStatut;
        return matchSearch && matchModule && matchStatut;
    });

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-violet-400" />
                        Clients
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{CLIENTS.length} organisations clientes</p>
                </div>
                <Link href="/admin/modules/clients/new">
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 gap-2 text-xs h-8">
                        <Plus className="h-3.5 w-3.5" /> Nouveau client
                    </Button>
                </Link>
            </motion.div>

            {/* Search & Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-9 text-xs bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    {["iDocument", "iArchive", "iSignature"].map((m) => (
                        <button
                            key={m}
                            onClick={() => setFilterModule(filterModule === m ? null : m)}
                            className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all border ${
                                filterModule === m
                                    ? `${MODULE_COLORS[m].bg} ${MODULE_COLORS[m].text} border-current/20`
                                    : "border-white/10 text-muted-foreground hover:bg-white/5"
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    {["Actif", "Config", "Suspendu"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatut(filterStatut === s ? null : s)}
                            className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all border ${
                                filterStatut === s
                                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                                    : "border-white/10 text-muted-foreground hover:bg-white/5"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="text-left py-2 px-2">Client</th>
                            <th className="text-left py-2 px-2 hidden md:table-cell">Type</th>
                            <th className="text-left py-2 px-2 hidden lg:table-cell">Contact</th>
                            <th className="text-left py-2 px-2">Modules</th>
                            <th className="text-left py-2 px-2 hidden sm:table-cell">Hébergement</th>
                            <th className="text-center py-2 px-2">Statut</th>
                            <th className="text-right py-2 px-2 hidden lg:table-cell">Stockage</th>
                            <th className="text-right py-2 px-2 hidden xl:table-cell">Membres</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((c) => {
                            const HebIcon = HEBERGEMENT_ICONS[c.hebergement] || Cloud;
                            return (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] group">
                                    <td className="py-3 px-2">
                                        <Link href={`/admin/modules/clients/${c.id}`} className="font-medium hover:text-violet-300 transition-colors">
                                            {c.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-2 hidden md:table-cell">
                                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{c.type}</Badge>
                                    </td>
                                    <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                                        <div>
                                            <p className="text-xs">{c.contact}</p>
                                            <p className="text-[10px] text-muted-foreground/60">{c.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {c.modules.map((m) => (
                                                <Badge key={m} variant="secondary" className={`text-[8px] border-0 px-1.5 ${MODULE_COLORS[m]?.bg} ${MODULE_COLORS[m]?.text}`}>
                                                    {m}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 hidden sm:table-cell">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <HebIcon className="h-3 w-3" />
                                            <span className="text-[10px]">{c.hebergement}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <Badge variant="secondary" className={`text-[9px] border-0 ${
                                            c.statut === "Actif" ? "bg-emerald-500/15 text-emerald-400" :
                                            c.statut === "Config" ? "bg-amber-500/15 text-amber-400" :
                                            "bg-red-500/15 text-red-400"
                                        }`}>
                                            {c.statut === "Actif" ? <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> : <Clock className="h-2.5 w-2.5 mr-1" />}
                                            {c.statut}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-2 text-right font-mono text-muted-foreground hidden lg:table-cell">{c.stockage}</td>
                                    <td className="py-3 px-2 text-right font-mono text-muted-foreground hidden xl:table-cell">{c.membres}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        Aucun client trouvé avec ces critères
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
