// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Settings / User Preferences
// ═══════════════════════════════════════════════

export type ThemePreference = "light" | "dark" | "auto";
export type Densite = "compact" | "normal" | "confort";
export type TailleTexte = "normal" | "grand" | "tres-grand";
export type BorderRadiusPreset = "sharp" | "rounded" | "pill";
export type FontFamilyPreset = "inter" | "roboto" | "outfit" | "dm-sans" | "space-grotesk";

export interface NotificationChannel {
    inApp: boolean;
    email: boolean;
    sms: boolean;
}

export interface BrandColor {
    name: string;
    value: string;
    label: string;
}

export interface UserPreferences {
    // Profil
    prenom: string;
    nom: string;
    telephone: string;
    bio: string;
    avatarUrl: string;

    // Design System
    theme: ThemePreference;
    densite: Densite;
    brandColors: BrandColor[];
    fontFamily: FontFamilyPreset;
    borderRadius: BorderRadiusPreset;
    brandName: string;

    // Langue
    langue: string;

    // Notifications
    notifications: Record<string, NotificationChannel>;

    // Accessibilité
    tailleTexte: TailleTexte;
    contrasteEleve: boolean;
    animationsReduites: boolean;
}

export const DEFAULT_BRAND_COLORS: BrandColor[] = [
    { name: "Primary", value: "#8B5CF6", label: "Violet 500" },
    { name: "Secondary", value: "#6366F1", label: "Indigo 500" },
    { name: "Accent", value: "#3B82F6", label: "Blue 500" },
    { name: "Destructive", value: "#EF4444", label: "Red 500" },
    { name: "Success", value: "#22C55E", label: "Green 500" },
    { name: "Background", value: "#030712", label: "Gray 950" },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
    prenom: "",
    nom: "",
    telephone: "",
    bio: "",
    avatarUrl: "",
    theme: "dark",
    densite: "normal",
    brandColors: DEFAULT_BRAND_COLORS,
    fontFamily: "inter",
    borderRadius: "rounded",
    brandName: "DIGITALIUM",
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
