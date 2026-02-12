// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /onboarding/institution
// Institutional Quote Request Form
// ═══════════════════════════════════════════════

import InstitutionalContactForm from "@/components/onboarding/InstitutionalContactForm";

export const metadata = {
    title: "Demande de devis — Institutions | DIGITALIUM.IO",
    description: "Demandez un devis pour la solution DIGITALIUM.IO adaptée à votre institution.",
};

export default function InstitutionalOnboardingPage() {
    return <InstitutionalContactForm />;
}
