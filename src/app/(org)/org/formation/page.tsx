// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: Organisme Formation
// ═══════════════════════════════════════════════

"use client";

import { FormationPage } from "@/components/shared/formation/FormationPage";
import { ORG_FORMATION } from "@/config/formation/org";

export default function OrgFormationPage() {
    return <FormationPage config={ORG_FORMATION} accentColor="violet" />;
}
