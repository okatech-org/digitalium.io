// ═══════════════════════════════════════════════
// DIGITALIUM.IO — SubAdmin: Formation
// ═══════════════════════════════════════════════

"use client";

import { FormationPage } from "@/components/shared/formation/FormationPage";
import { SUBADMIN_FORMATION } from "@/config/formation/subadmin";

export default function SubAdminFormationPage() {
    return <FormationPage config={SUBADMIN_FORMATION} accentColor="violet" />;
}
