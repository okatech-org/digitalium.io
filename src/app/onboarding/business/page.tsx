// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /onboarding/business
// Business Onboarding Wizard
// ═══════════════════════════════════════════════

import BusinessOnboarding from "@/components/onboarding/BusinessOnboarding";

export const metadata = {
    title: "Créer votre espace entreprise | DIGITALIUM.IO",
    description: "Configurez votre espace professionnel DIGITALIUM.IO en quelques étapes.",
};

export default function BusinessOnboardingPage() {
    return <BusinessOnboarding />;
}
