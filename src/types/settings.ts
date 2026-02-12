// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Settings / User Preferences
// ═══════════════════════════════════════════════

export type ThemePreference = "light" | "dark" | "auto";
export type Densite = "compact" | "normal" | "confort";
export type TailleTexte = "normal" | "grand" | "tres-grand";

export interface NotificationChannel {
    inApp: boolean;
    email: boolean;
    sms: boolean;
}

export interface UserPreferences {
    // Profil
    prenom: string;
    nom: string;
    telephone: string;
    bio: string;
    avatarUrl: string;

    // Apparence
    theme: ThemePreference;
    densite: Densite;

    // Langue
    langue: string;

    // Notifications
    notifications: Record<string, NotificationChannel>;

    // Accessibilité
    tailleTexte: TailleTexte;
    contrasteEleve: boolean;
    animationsReduites: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    prenom: "",
    nom: "",
    telephone: "",
    bio: "",
    avatarUrl: "",
    theme: "dark",
    densite: "normal",
    langue: "fr",
    notifications: {
        "nouvelle-demande": { inApp: true, email: false, sms: false },
        "document-signe": { inApp: true, email: true, sms: false },
        "rappel-echeance": { inApp: true, email: false, sms: false },
        "mise-a-jour-systeme": { inApp: true, email: false, sms: false },
    },
    tailleTexte: "normal",
    contrasteEleve: false,
    animationsReduites: false,
};
