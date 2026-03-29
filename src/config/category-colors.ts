// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Centralized Category Colors
// Single source of truth for category styling
// ═══════════════════════════════════════════════

import { Landmark, Users, Scale, Briefcase, Lock } from "lucide-react";

export const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    fiscal: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    social: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    juridique: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    legal: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    client: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    coffre: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    vault: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    general: { color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
};

export const CATEGORY_CONFIG = [
    { key: "fiscal", label: "Fiscal", icon: Landmark, gradient: "from-amber-600 to-orange-500", ...CATEGORY_COLORS.fiscal, retention: "10 ans" },
    { key: "social", label: "Social / RH", icon: Users, gradient: "from-blue-600 to-cyan-500", ...CATEGORY_COLORS.social, retention: "5 ans" },
    { key: "juridique", label: "Juridique", icon: Scale, gradient: "from-emerald-600 to-teal-500", ...CATEGORY_COLORS.juridique, retention: "30 ans" },
    { key: "client", label: "Client", icon: Briefcase, gradient: "from-violet-600 to-purple-500", ...CATEGORY_COLORS.client, retention: "5 ans" },
    { key: "coffre", label: "Coffre-Fort", icon: Lock, gradient: "from-rose-600 to-pink-500", ...CATEGORY_COLORS.coffre, retention: "Illimité" },
];
