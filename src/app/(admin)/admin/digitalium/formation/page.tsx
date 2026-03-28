// ═══════════════════════════════════════════════
// DIGITALIUM.IO — DIGITALIUM: Formation
// Module d'apprentissage et certification
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { FormationPage } from "@/components/shared/formation/FormationPage";
import { ADMIN_FORMATION } from "@/config/formation/admin";

export default function DigitaliumFormationPage() {
    // We reuse the standard Admin formation config but pass "teal" to fit Digitalium's branding
    return <FormationPage config={ADMIN_FORMATION} accentColor="teal" />;
}
