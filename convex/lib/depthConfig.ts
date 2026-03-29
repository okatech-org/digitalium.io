// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Depth Config Helper
// Extracts filing depth configuration from organization config
// ═══════════════════════════════════════════════════════════════

import type { OrgConfig } from "./types";

export type DepthStrategy = "synthetique" | "intelligente";

export interface DepthConfig {
    maxDepth: number;
    depthStrategy: DepthStrategy;
}

const DEFAULTS: DepthConfig = {
    maxDepth: 3,
    depthStrategy: "intelligente",
};

export function getDepthConfig(org: { config?: OrgConfig } | null): DepthConfig {
    const c = org?.config?.classement;
    if (!c) return DEFAULTS;

    return {
        maxDepth: Math.min(Math.max(Number(c.maxDepth) || DEFAULTS.maxDepth, 1), 20),
        depthStrategy: c.depthStrategy === "synthetique" ? "synthetique" : "intelligente",
    };
}
