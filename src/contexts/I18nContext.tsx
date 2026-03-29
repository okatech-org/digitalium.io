"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import fr from "@/locales/fr.json";
import en from "@/locales/en.json";

type Locale = "fr" | "en";
type Translations = typeof fr;

const translations: Record<Locale, Translations> = { fr, en };

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
    locale: "fr",
    setLocale: () => {},
    t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("digitalium_locale") as Locale) || "fr";
        }
        return "fr";
    });

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof window !== "undefined") {
            localStorage.setItem("digitalium_locale", newLocale);
        }
    }, []);

    const t = useCallback((key: string): string => {
        const keys = key.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = translations[locale];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) return key;
        }
        return typeof value === "string" ? value : key;
    }, [locale]);

    const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    return useContext(I18nContext);
}

export function useT() {
    const { t } = useContext(I18nContext);
    return t;
}
