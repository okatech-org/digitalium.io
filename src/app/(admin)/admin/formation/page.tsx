// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Admin / Formation
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { FormationPage } from "@/components/shared/formation/FormationPage";
import { ADMIN_FORMATION } from "@/config/formation/admin";

export default function AdminFormationPage() {
    return <FormationPage config={ADMIN_FORMATION} accentColor="blue" />;
}
