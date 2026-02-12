// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Pro / Formation
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { FormationPage } from "@/components/shared/formation/FormationPage";
import { PRO_FORMATION } from "@/config/formation/pro";

export default function ProFormationPage() {
    return <FormationPage config={PRO_FORMATION} accentColor="violet" />;
}
