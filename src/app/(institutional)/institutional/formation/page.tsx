// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: Institutional Formation
// ═══════════════════════════════════════════════

"use client";

import { FormationPage } from "@/components/shared/formation/FormationPage";
import { INSTITUTIONAL_FORMATION } from "@/config/formation/institutional";

export default function InstitutionalFormationPage() {
    return <FormationPage config={INSTITUTIONAL_FORMATION} accentColor="emerald" />;
}
