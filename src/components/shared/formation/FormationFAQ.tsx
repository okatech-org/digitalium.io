// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Formation: FAQ Component
// Section FAQ avec accordéon
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { FAQItem } from "@/types/formation";

interface FormationFAQProps {
    items: FAQItem[];
    accentColor?: string;
}

const ACCENT: Record<string, { bg: string; text: string; badge: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", badge: "bg-violet-500/15 text-violet-300" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500/15 text-blue-300" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-300" },
};

export function FormationFAQ({ items, accentColor = "violet" }: FormationFAQProps) {
    const accent = ACCENT[accentColor] || ACCENT.violet;

    // Group by categorie
    const grouped = items.reduce<Record<string, FAQItem[]>>((acc, item) => {
        const cat = item.categorie || "Général";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([categorie, faqItems]) => (
                <motion.div
                    key={categorie}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className={`h-4 w-4 ${accent.text}`} />
                        <h3 className="text-sm font-semibold">{categorie}</h3>
                        <Badge variant="secondary" className={`text-[9px] h-4 px-1.5 border-0 ${accent.badge}`}>
                            {faqItems.length}
                        </Badge>
                    </div>

                    <Accordion type="single" collapsible className="space-y-1">
                        {faqItems.map((item, index) => (
                            <AccordionItem
                                key={index}
                                value={`${categorie}-${index}`}
                                className="border-white/5 rounded-lg glass px-4"
                            >
                                <AccordionTrigger className="text-xs font-medium py-3 hover:no-underline hover:text-foreground">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                                    {item.reponse}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            ))}
        </div>
    );
}
