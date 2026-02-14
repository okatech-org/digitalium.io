"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iSignature: Pending Page
// Documents awaiting my signature
// ═══════════════════════════════════════════════

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Clock,
    PenTool,
    Calendar,
    CheckCircle2,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";

const PENDING = [
    {
        id: "sig-1",
        title: "Contrat prestation SOGARA — Q2 2026",
        requester: "Daniel Nguema",
        avatar: "DN",
        deadline: Date.now() + 3 * 24 * 3600 * 1000,
        signers: 2,
        signed: 1,
    },
    {
        id: "sig-2",
        title: "Avenant bail Immeuble Triomphal 2026",
        requester: "Marie Obame",
        avatar: "MO",
        deadline: Date.now() + 7 * 24 * 3600 * 1000,
        signers: 1,
        signed: 0,
    },
    {
        id: "sig-3",
        title: "Procuration générale — Mission Afrique du Sud",
        requester: "Aimée Gondjout",
        avatar: "AG",
        deadline: Date.now() + 2 * 24 * 3600 * 1000,
        signers: 2,
        signed: 0,
    },
];

function daysUntil(ts: number): number {
    return Math.max(0, Math.ceil((ts - Date.now()) / (24 * 3600 * 1000)));
}

export default function PendingSignaturesPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">En attente de ma signature</h1>
                    <p className="text-xs text-muted-foreground">
                        {PENDING.length} document{PENDING.length > 1 ? "s" : ""} en attente
                    </p>
                </div>
            </motion.div>

            {/* List */}
            <div className="space-y-2">
                {PENDING.map((item, i) => {
                    const days = daysUntil(item.deadline);
                    const urgent = days <= 2;

                    return (
                        <Link key={item.id} href={`/institutional/isignature/${item.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${urgent
                                    ? "bg-red-500/5 border-red-500/15 hover:border-red-500/30"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="h-10 w-10 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                                    <span className="text-xs text-violet-300 font-bold">{item.avatar}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-zinc-500">Par {item.requester}</span>
                                        <span className="text-[11px] text-zinc-600">·</span>
                                        <span className={`text-[11px] flex items-center gap-0.5 ${urgent ? "text-red-400 font-medium" : "text-zinc-500"}`}>
                                            {urgent && <AlertTriangle className="h-2.5 w-2.5" />}
                                            <Calendar className="h-2.5 w-2.5" />
                                            {days === 0 ? "Aujourd'hui" : days === 1 ? "Demain" : `${days} jours`}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="text-right shrink-0">
                                    <span className="text-[10px] text-zinc-400 font-mono">{item.signed}/{item.signers}</span>
                                    <div className="h-1 w-10 rounded-full bg-white/5 mt-1 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-violet-500"
                                            style={{ width: `${(item.signed / item.signers) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action */}
                                <Button
                                    size="sm"
                                    className="h-8 text-xs bg-gradient-to-r from-violet-600 to-indigo-500 shrink-0"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <PenTool className="h-3.5 w-3.5 mr-1" />
                                    Signer
                                </Button>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
