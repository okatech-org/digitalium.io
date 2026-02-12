// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: SysAdmin / Formation
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { FormationPage } from "@/components/shared/formation/FormationPage";
import { SYSADMIN_FORMATION } from "@/config/formation/sysadmin";

export default function SysAdminFormationPage() {
    return <FormationPage config={SYSADMIN_FORMATION} accentColor="orange" />;
}
