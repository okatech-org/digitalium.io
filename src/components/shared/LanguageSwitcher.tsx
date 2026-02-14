"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const [lang, setLang] = useState<"fr" | "en">("fr");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Changer de langue</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("fr")} className={lang === "fr" ? "bg-accent" : ""}>
                    Français (FR)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("en")} className={lang === "en" ? "bg-accent" : ""}>
                    English (EN)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
