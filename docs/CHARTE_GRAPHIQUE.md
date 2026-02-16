# 🎨 Charte Graphique Complète — DIGITALIUM.IO

> **Version :** 1.0.0  
> **Dernière mise à jour :** 16 février 2026  
> **Statut :** Document de référence  
> **Audience :** Développeurs, Designers, Intégrateurs

---

## 📋 Table des Matières

1. [Identité de Marque](#1-identité-de-marque)
2. [Logo & Logotype](#2-logo--logotype)
3. [Palette de Couleurs](#3-palette-de-couleurs)
4. [Typographie](#4-typographie)
5. [Design Tokens (CSS Variables)](#5-design-tokens)
6. [Système d'Espacement](#6-système-despacement)
7. [Système de Bordures & Radius](#7-système-de-bordures--radius)
8. [Effets Visuels & Glassmorphism](#8-effets-visuels--glassmorphism)
9. [Dégradés (Gradients)](#9-dégradés-gradients)
10. [Iconographie](#10-iconographie)
11. [Composants UI (Design System)](#11-composants-ui)
12. [Système d'Animations](#12-système-danimations)
13. [Thématisation Multi-Espace](#13-thématisation-multi-espace)
14. [Responsive & Breakpoints](#14-responsive--breakpoints)
15. [Hiérarchie Visuelle des Rôles (RBAC)](#15-hiérarchie-visuelle-des-rôles)
16. [Modules — Identité Visuelle](#16-modules--identité-visuelle)
17. [Imagerie & Photographie](#17-imagerie--photographie)
18. [Page Publique vs Dashboard](#18-page-publique-vs-dashboard)
19. [Accessibilité](#19-accessibilité)
20. [SEO & Metadata](#20-seo--metadata)
21. [Fichiers de Référence](#21-fichiers-de-référence)

---

## 1. Identité de Marque

### 1.1 Mission

DIGITALIUM.IO est une **plateforme SaaS d'archivage intelligent et de gestion documentaire** destinée au marché gabonais et africain. L'identité visuelle communique :

- **Souveraineté numérique** — Données hébergées au Gabon
- **Confiance & Sécurité** — Intégrité cryptographique SHA-256
- **Modernité** — Interface premium et technologique
- **Accessibilité** — Simplicité d'usage pour tous les profils

### 1.2 Valeurs Visuelles

| Valeur | Traduction Design |
|---|---|
| **Innovation** | Gradients dynamiques, animations fluides |
| **Confiance** | Couleurs sereines (bleu), typographie stable |
| **Souveraineté** | Références locales (drapeau 🇬🇦, "Made in Gabon") |
| **Premium** | Glassmorphism, micro-animations, dark mode par défaut |
| **Clarté** | Hiérarchie visuelle forte, whitespace généreux |

### 1.3 Nom de Marque

| Élément | Valeur |
|---|---|
| **Nom complet** | DIGITALIUM.IO |
| **Nom court** | Digitalium |
| **Description** | Plateforme d'archivage intelligent et de gestion documentaire pour le Gabon |
| **Site web** | https://digitalium.io |
| **Email** | contact@digitalium.io |
| **Localisation** | Libreville, Gabon |

### 1.4 Web Manifest

```json
{
  "name": "DIGITALIUM.IO",
  "short_name": "Digitalium",
  "background_color": "#09090b",
  "theme_color": "#7c3aed"
}
```

---

## 2. Logo & Logotype

### 2.1 Logo Principal

|  Propriété | Valeur |
|---|---|
| **Fichier** | `/public/logo_digitalium.png` |
| **Format** | PNG (transparent) |
| **Taille de référence** | 96×96 px (public), 48×48 px (admin), 32×32 px (footer) |
| **Zone de sécurité** | 12px autour du logo |
| **Fonds autorisés** | Fond sombre (#09090b), fond clair (#ffffff), glassmorphism |

### 2.2 Logotype (texte)

Le nom de marque est rendu en texte stylisé, pas en image :

```
DIGITALIUM.IO
```

| Partie | Style |
|---|---|
| **"DIGITALIUM"** | `font-bold text-2xl tracking-tight text-foreground` |
| **".IO"** | `text-[#F59E0B]` (ambre/or) — distingue la marque |

### 2.3 Tagline sous-logo

```
ARCHIVAGE INTELLIGENT
```

| Propriété | Valeur |
|---|---|
| Taille | `text-[11px]` |
| Style | `font-medium tracking-[0.26em] uppercase` |
| Couleur | `text-muted-foreground/50` |
| Visibilité | Desktop XL+ uniquement (`hidden xl:inline-block`) |

### 2.4 Favicon & Icônes d'App

| Usage | Fichier | Configuration |
|---|---|---|
| **Favicon** | `/public/favicon.ico` | 48×48 px |
| **Icon navigateur** | `/public/logo_digitalium.png` | via metadata `icons.icon` |
| **Apple Touch Icon** | `/public/apple-touch-icon.png` | via metadata `icons.apple` |

---

## 3. Palette de Couleurs

### 3.1 Couleurs de Marque (Brand)

| Nom | Hex | Tailwind | Usage |
|---|---|---|---|
| **Digitalium Blue** | `#3B82F6` | `digitalium-blue` | Couleur primaire, CTA, liens actifs |
| **Digitalium Violet** | `#8B5CF6` | `digitalium-violet` | Accent, gradients, signatures |
| **Blue Light** | `#60A5FA` | `digitalium-blue-light` | Hover states clairs |
| **Violet Light** | `#A78BFA` | `digitalium-violet-light` | Accents secondaires clairs |
| **Blue Dark** | `#2563EB` | `digitalium-blue-dark` | CTAs pressed states |
| **Violet Dark** | `#7C3AED` | `digitalium-violet-dark` | Theme color manifest |

### 3.2 Couleurs Sémantiques

| Rôle | Hex | Tailwind | Usage |
|---|---|---|---|
| **Primary** | `#3B82F6` | `hsl(var(--primary))` | Actions principales |
| **Accent** | `#8B5CF6` | `hsl(var(--accent))` | Accent, ring focus |
| **Success** | `#10B981` | `emerald-500` | Validations, complété, iArchive |
| **Warning** | `#F59E0B` | `amber-500` | Alertes, iAsted, ".IO" branding |
| **Error** | `#EF4444` | `red-500` | Erreurs, destructive, déconnexion |
| **Info** | `#06B6D4` | `cyan-500` | Informations, orbes décoratifs |

### 3.3 Couleurs Contextuelles

| Contexte | Valeur CSS | Light | Dark |
|---|---|---|---|
| **Background** | `hsl(var(--background))` | `0 0% 100%` (blanc) | `224 71% 4%` (bleu très foncé) |
| **Foreground** | `hsl(var(--foreground))` | `222.2 84% 4.9%` | `213 31% 91%` |
| **Card** | `hsl(var(--card))` | blanc | bleu foncé |
| **Popover** | `hsl(var(--popover))` | blanc | bleu foncé |
| **Muted** | `hsl(var(--muted))` | `210 40% 96.1%` | `223 47% 11%` |
| **Muted Foreground** | `hsl(var(--muted-foreground))` | `215.4 16.3% 46.9%` | `215.4 16.3% 56.9%` |
| **Border** | `hsl(var(--border))` | `214.3 31.8% 91.4%` | `216 34% 17%` |
| **Input** | `hsl(var(--input))` | `214.3 31.8% 91.4%` | `216 34% 17%` |
| **Ring** | `hsl(var(--ring))` | `217 91% 60%` (blue) | `263 70% 50.4%` (violet) |
| **Destructive** | `hsl(var(--destructive))` | `0 84.2% 60.2%` | `0 63% 31%` |

### 3.4 Layout & Glass Tokens

| Token | Light | Dark |
|---|---|---|
| `--layout-bg` | `#fcfcfc` | `#09090b` |
| `--glass-bg` | `rgba(255,255,255,0.95)` | `#18181b` |
| `--glass-bg-hover` | `#f4f4f5` | `#27272a` |
| `--glass-border` | `#e4e4e7` | `#27272a` |
| `--glass-border-hover` | `#d4d4d8` | `#3f3f46` |
| `--glass-subtle` | `#f4f4f5` | `#18181b` |
| `--glass-panel-bg` | `#ffffff` | `#0c0c0e` |
| `--glass-panel-border` | `#e4e4e7` | `#27272a` |
| `--shimmer-color` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.05)` |
| `--grid-line` | `#f4f4f5` | `#18181b` |

---

## 4. Typographie

### 4.1 Police Principale

| Propriété | Valeur |
|---|---|
| **Famille** | **Inter** (Google Fonts) |
| **Variable CSS** | `--font-inter` |
| **Fallback** | `system-ui, sans-serif` |
| **Graisses** | 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black) |
| **Display** | `swap` (optimisé pour le rendu) |
| **Rendu** | `antialiased` |

### 4.2 Échelle Typographique

| Usage | Classes Tailwind | Poids | Taille réelle |
|---|---|---|---|
| **Hero H1** | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl` | `font-extrabold` | 36px → 72px |
| **Section H2** | `text-3xl md:text-5xl` | `font-bold` | 30px → 48px |
| **Card H3** | `text-xl` ou `text-lg` | `font-bold` | 18px → 20px |
| **Subtitle** | `text-lg md:text-xl` | `font-normal` | 18px → 20px |
| **Body** | `text-sm` | `font-normal` | 14px |
| **Body large** | `text-base` | `font-normal` | 16px |
| **Small** | `text-xs` | `font-medium` | 12px |
| **Micro** | `text-[11px]` ou `text-[10px]` | `font-medium` | 10–11px |
| **Mono badge** | `text-xs font-mono` | `font-bold tracking-wider` | 12px mono |
| **Logo** | `text-2xl tracking-tight` | `font-bold` | 24px |
| **Tagline** | `text-[11px] tracking-[0.26em]` | `font-medium uppercase` | 11px |
| **Sidebar item** | `text-sm` | `font-medium` | 14px |
| **Sidebar label** | `text-[10px]` | `font-semibold uppercase tracking-wider` | 10px |
| **Breadcrumb** | `text-sm` | `font-medium (active) / normal` | 14px |

### 4.3 Line Height

| Usage | Valeur |
|---|---|
| **Hero** | `leading-[1.1]` |
| **Body relaxed** | `leading-relaxed` (1.625) |
| **Default** | `leading-normal` (1.5) |
| **Tight (heading)** | `leading-none` (1.0) |

### 4.4 Tracking (Letter Spacing)

| Usage | Valeur |
|---|---|
| **Logo** | `tracking-tight` (-0.025em) |
| **Tagline** | `tracking-[0.26em]` |
| **Section label** | `tracking-wider` (0.05em) |
| **General** | Default (0em) |

---

## 5. Design Tokens

### 5.1 Thème Clair (`:root`)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 217 91% 60%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 263 70% 50.4%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 217 91% 60%;
  --radius: 0.75rem;
}
```

### 5.2 Thème Sombre (`.dark`)

```css
.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  --card: 224 71% 4%;
  --card-foreground: 213 31% 91%;
  --popover: 224 71% 4%;
  --popover-foreground: 213 31% 91%;
  --primary: 217 91% 60%;
  --primary-foreground: 210 40% 98%;
  --secondary: 222 47% 11%;
  --secondary-foreground: 210 40% 98%;
  --muted: 223 47% 11%;
  --muted-foreground: 215.4 16.3% 56.9%;
  --accent: 263 70% 50.4%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;
  --border: 216 34% 17%;
  --input: 216 34% 17%;
  --ring: 263 70% 50.4%;
}
```

### 5.3 Mécanisme de Thème

```
localStorage: "digitalium-theme" = "light" | "dark"
Default: "dark"
Toggle: <html> class "dark" ajoutée/retirée
Implémentation: ThemeContext.tsx → useThemeContext()
```

---

## 6. Système d'Espacement

### 6.1 Paddings Récurrents

| Usage | Valeur |
|---|---|
| **Layout root** | `p-3 gap-3` |
| **Section verticale** | `py-24 px-6` |
| **Header** | `px-4 lg:px-6 h-14` (Pro) / `h-16` (Admin) |
| **Container** | `max-w-6xl mx-auto px-6` |
| **Card content** | `p-6` ou `p-8` ou `p-10` |
| **Sidebar nav** | `py-3 px-3 space-y-0.5` |
| **Sidebar logo** | `px-4 py-5` |
| **Sidebar footer** | `px-3 pb-4 pt-2 space-y-1` |
| **Footer section** | `py-16 px-6` |
| **Nav link** | `px-3 py-2.5` |
| **Badge interne** | `px-2.5 py-0.5` |

### 6.2 Gaps Récurrents

| Usage | Valeur |
|---|---|
| **Grid cards** | `gap-6` |
| **Grid journey** | `gap-8` |
| **Header items** | `gap-2` ou `gap-3` |
| **Sidebar sections** | `space-y-3` |
| **Nav items** | `space-y-0.5` |
| **Button icon** | `gap-2` |
| **Footer cols** | `gap-8` |
| **Sidebar item icons** | `gap-3` |

---

## 7. Système de Bordures & Radius

### 7.1 Border Radius

| Token | CSS | Valeur réelle |
|---|---|---|
| `rounded-lg` | `var(--radius)` | **12px** |
| `rounded-md` | `calc(var(--radius) - 2px)` | **10px** |
| `rounded-sm` | `calc(var(--radius) - 4px)` | **8px** |
| `rounded-xl` | — | **12px** |
| `rounded-2xl` | — | **16px** |
| `rounded-full` | — | **9999px** |

### 7.2 Usages Courants

| Composant | Radius |
|---|---|
| **Sidebar / Main panel** | `rounded-2xl` |
| **Glass cards** | `var(--radius)` = 12px |
| **Buttons** | `rounded-md` = 10px |
| **Nav links (sidebar)** | `rounded-full` |
| **Avatars** | `rounded-full` |
| **Logo container** | `rounded-lg` = 12px |
| **Inputs** | `rounded-md` |
| **Mobile menu** | `rounded-2xl` |
| **Badge** | `rounded-md` |
| **Checkbox** | `rounded-sm` |

### 7.3 Bordures

| Usage | Classe |
|---|---|
| **Section separator** | `border-t border-white/5` |
| **Header bottom** | `border-b border-border/40` |
| **Glass border** | `border border-glass-border` |
| **Card border** | `border border-glass-panel-border` |
| **Navbar bottom** | `border-b border-white/5` |
| **Mobile menu button** | `border border-white/10` |
| **Footer copyright** | `border-t border-white/5` |
| **Expandable nav** | `border-l border-border/30` |

---

## 8. Effets Visuels & Glassmorphism

### 8.1 `.glass` — Navbar & Badges
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(0px);           /* Pas de blur — look flat */
  border: 1px solid var(--glass-border);
  box-shadow: none !important;
}
```
> *Philosophie : Le glass de DIGITALIUM est « flat glass » — opaque avec bordure subtile, sans effet de flou.*

### 8.2 `.glass-card` — Cartes de Contenu
```css
.glass-card {
  background: var(--glass-panel-bg);
  border: 1px solid var(--glass-panel-border);
  border-radius: var(--radius);
  transition: all 0.2s ease;
  box-shadow: none !important;
}
.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
```

### 8.3 `.glass-panel` — Panneaux Détachés (Sidebar, Main)
```css
.glass-panel {
  background: var(--glass-panel-bg);
  border: 1px solid var(--glass-panel-border);
  box-shadow: none !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
```
> *Utilisé pour le sidebar et le panneau principal du dashboard, créant un effet de « cartes détachées » sur un fond `--layout-bg`.*

### 8.4 `.glass-section` — Fonds de Sections
```css
.glass-section {
  background: var(--glass-subtle);
  backdrop-filter: blur(8px);
}
```

### 8.5 `.glow` — Effet Hover Bordure
```css
.glow {
  box-shadow: none !important;
  border: 1px solid var(--glass-border);
  transition: border-color 0.3s ease;
}
.glow:hover { border-color: var(--glass-border-hover); }
```

### 8.6 `.shimmer` — Scintillement de Chargement
```css
.shimmer {
  background: linear-gradient(90deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

### 8.7 `.cortex-grid` — Motif de Grille
```css
.cortex-grid {
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### 8.8 Textures Grain (inline)
```css
/* Texture bruit — appliquée via div overlay */
background-image: url("data:image/svg+xml,...");  /* SVG noise */
opacity: 0.03;
```

---

## 9. Dégradés (Gradients)

### 9.1 Gradients de Marque

| Nom | CSS | Usage |
|---|---|---|
| **Brand Principal** | `linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)` | `.text-gradient`, titres |
| **Brand Accent** | `linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)` | `.gradient-text-accent` |
| **Brand Border** | `linear-gradient(135deg, #3B82F6, #8B5CF6)` | `.gradient-border::before` |
| **CTA Button** | `bg-gradient-to-r from-digitalium-blue to-digitalium-violet` | Boutons principaux |
| **Mobile Title** | `linear-gradient(135deg, #3B82F6, #8B5CF6, #00D9FF)` | Menu mobile titre |

### 9.2 Gradients par Type d'Organisation

| Type | Gradient Tailwind | Usage |
|---|---|---|
| **Enterprise** | `from-violet-600 to-indigo-500` | Sidebar ProLayout entreprise |
| **Institution** | `from-amber-500 to-orange-500` | Sidebar ProLayout institution |
| **Government** | `from-emerald-500 to-teal-500` | Sidebar ProLayout gouvernement |
| **Platform** | `from-red-500 to-orange-500` | Sidebar ProLayout plateforme |
| **Organism** | `from-cyan-500 to-teal-500` | Sidebar ProLayout organisme |

### 9.3 Gradients Admin (Espaces)

| Espace | Gradient | Couleur |
|---|---|---|
| **Business** | `from-digitalium-blue to-digitalium-violet` | Bleu→Violet |
| **Infrastructure** | `from-red-600 to-orange-500` | Rouge→Orange |
| **DIGITALIUM** | `from-emerald-600 to-teal-500` | Émeraude→Teal |

### 9.4 Gradients par Module

| Module | Gradient |
|---|---|
| **iDocument** | `from-blue-500 to-blue-600` |
| **iArchive** | `from-emerald-500 to-emerald-600` |
| **iSignature** | `from-violet-500 to-violet-600` |
| **iAsted** | `from-amber-500 to-amber-600` |

### 9.5 Overlays de Background

```css
/* Image bg overlay - double couche */
.overlay-1 { background: hsl(var(--background) / 0.60); }  /* 60% opaque */
.overlay-2 { background: linear-gradient(to-b, hsl(var(--background) / 0.80), transparent, hsl(var(--background))); }

/* Section overlay */
background: hsl(var(--background) / 0.80);  /* 80% opaque */
background: hsl(var(--background) / 0.90);  /* 90% opaque */
```

---

## 10. Iconographie

### 10.1 Bibliothèque

| Propriété | Valeur |
|---|---|
| **Bibliothèque** | **Lucide React** |
| **Config shadcn** | `"iconLibrary": "lucide"` |
| **Style** | Outline, stroke-width 2 |
| **Couleur par défaut** | `currentColor` |

### 10.2 Tailles Standards

| Usage | Taille | Classe |
|---|---|---|
| **Sidebar nav** | 18px | `h-[18px] w-[18px]` |
| **Icon button** | 16px | `h-4 w-4` |
| **Card icon conteneur** | 28px | `h-7 w-7` |
| **Hero section icon** | 20px | `h-5 w-5` |
| **Sidebar logo** | 24px | `h-6 w-6` |
| **Notification bell** | 18px | `h-[18px] w-[18px]` |
| **Dropdown items** | 14px | `h-3.5 w-3.5` |
| **Chevron breadcrumb** | 12px | `h-3 w-3` |
| **Expandable children** | 14px | `h-3.5 w-3.5` |

### 10.3 Icônes par Module

| Module | Icône Lucide |
|---|---|
| **iDocument** | `FileText` |
| **iArchive** | `Archive` |
| **iSignature** | `PenTool` |
| **iAsted** | `Bot` |

### 10.4 Icônes des Actions Globales

| Action | Icône |
|---|---|
| Dashboard | `LayoutDashboard` |
| Recherche | `Search` |
| Notifications | `Bell` |
| Paramètres | `Settings` |
| Déconnexion | `LogOut` |
| Menu mobile | `Menu` |
| Toggle sidebar | `PanelLeftClose` / `PanelLeftOpen` |
| Theme toggle | `Sun` / `Moon` |
| Langue | `Globe` |
| Profil | `User` |
| Sécurité | `Shield` / `ShieldAlert` |
| Équipe | `Users` |
| Organisation | `Building2` |
| Facturation | `CreditCard` |
| Analytics | `BarChart3` / `ChartArea` |
| Formation | `GraduationCap` |
| Intégrations | `Plug` |

---

## 11. Composants UI (Design System)

> **Libraire base :** Shadcn/ui (style `new-york`, base color `slate`)  
> **Composition :** Radix UI primitives + Tailwind CSS + CVA (class-variance-authority)  
> **Utilitaire :** `cn()` = `twMerge(clsx(...))`

### 11.1 Button

| Variant | Style |
|---|---|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

| Size | Dimensions |
|---|---|
| `default` | `h-9 px-4 py-2` |
| `sm` | `h-8 px-3 text-xs` |
| `lg` | `h-10 px-8` |
| `icon` | `h-9 w-9` |

**CTA Custom :**
```css
/* CTA Primaire (gradient) */
bg-gradient-to-r from-digitalium-blue to-digitalium-violet
hover:opacity-90 transition-all text-lg px-8 h-14
shadow-lg shadow-digitalium-blue/20

/* CTA Secondaire */
variant="outline" text-lg px-8 h-14
border-white/10 hover:bg-white/5
```

### 11.2 Badge

| Variant | Style |
|---|---|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/80` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `destructive` | `bg-destructive text-destructive-foreground shadow hover:bg-destructive/80` |
| `outline` | `text-foreground` (border uniquement) |

**Base commune :** `rounded-md px-2.5 py-0.5 text-xs font-semibold`

### 11.3 Card

```css
Card:        rounded-xl border bg-card text-card-foreground shadow
CardHeader:  flex flex-col space-y-1.5 p-6
CardTitle:   font-semibold leading-none tracking-tight
CardDesc:    text-sm text-muted-foreground
CardContent: p-6 pt-0
CardFooter:  flex items-center p-6 pt-0
```

### 11.4 Input & Textarea

```css
/* Input */
h-9 w-full rounded-md border border-input bg-transparent
px-3 py-1 text-base md:text-sm
placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring

/* Textarea */
min-h-[60px] w-full rounded-md border border-input bg-transparent
px-3 py-2 text-base md:text-sm
```

### 11.5 Dialog (Modal)

```css
Overlay:  fixed inset-0 z-50 bg-black/80 fade-in/out
Content:  fixed center z-50 w-full max-w-lg border bg-background p-6
          shadow-lg zoom-in/out-95 slide-from-top sm:rounded-lg
Close:    absolute right-4 top-4 opacity-70 hover:opacity-100
          X icon h-4 w-4
```

### 11.6 Tabs

```css
TabsList:    inline-flex h-9 rounded-lg bg-muted p-1 text-muted-foreground
TabsTrigger: rounded-md px-3 py-1 text-sm font-medium
             data-[state=active]:bg-background data-[state=active]:text-foreground
             data-[state=active]:shadow
```

### 11.7 Select

```css
Trigger:     h-9 w-full rounded-md border border-input bg-transparent
             px-3 py-2 text-sm
Content:     z-50 rounded-md border bg-popover shadow-md
Item:        rounded-sm py-1.5 pl-2 pr-8 text-sm
             focus:bg-accent focus:text-accent-foreground
```

### 11.8 Avatar

```css
Avatar:         h-10 w-10 rounded-full overflow-hidden
AvatarFallback: bg-muted w-full h-full flex items-center justify-center rounded-full
                bg-gradient-to-br {theme.gradient} text-white text-[10px] font-bold
```

### 11.9 Switch

```css
Root:   h-5 w-9 rounded-full border-2 border-transparent
        data-[state=checked]:bg-primary
        data-[state=unchecked]:bg-input
Thumb:  h-4 w-4 rounded-full bg-background shadow-lg
        data-[state=checked]:translate-x-4
```

### 11.10 Accordion

```css
Item:     border-b
Trigger:  py-4 text-sm font-medium [data-state=open]>svg:rotate-180
          ChevronDown icon h-4 w-4 text-muted-foreground
Content:  animate-accordion-down / animate-accordion-up
          overflow-hidden text-sm
```

### 11.11 Tooltip

```css
Content: z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground
         animate-in fade-in zoom-in-95
```

### 11.12 Separator

```css
Horizontal: h-[1px] w-full bg-border
Vertical:   h-full w-[1px] bg-border
```

### 11.13 Checkbox

```css
h-4 w-4 rounded-sm border border-primary shadow
data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
Check icon h-4 w-4
```

### 11.14 Toast (Sonner)

```css
Position: bottom-left
Style:    className="glass-card"
```

---

## 12. Système d'Animations

### 12.1 Keyframes Tailwind

| Nom | Durée | Description |
|---|---|---|
| `gradient-shift` | 6s infinite | Déplacement du gradient (0%→100%→0%) |
| `float` | 3s infinite | Flottement vertical (-10px) |
| `pulse-glow` | 2s infinite | Pulsation d'ombre bleue→violette |
| `shimmer` | 2s infinite | Scintillement horizontal gauche→droite |
| `accordion-down` | 0.2s | Expansion verticale |
| `accordion-up` | 0.2s | Contraction verticale |

### 12.2 Patterns Framer Motion

| Pattern | Props | Usage |
|---|---|---|
| **Fade-in + Slide-up** | `opacity: 0→1, y: 20→0, duration: 0.6` | Tous les éléments |
| **Staggered Children** | `staggerChildren: 0.06` | Hero titre mot par mot |
| **Scroll-triggered** | `whileInView, viewport: {once: true}` | Sections below-the-fold |
| **Scale-in Spring** | `scale: 0→1, type: "spring"` | Cercles, badges |
| **AnimatePresence** | `exit: {opacity:0, y:20, scale:0.95}` | Menu mobile, steps |
| **Animated Bounce** | `y: [0, 8, 0], repeat: Infinity` | Flèches de transition |
| **ScaleX Progress** | `scaleX: 0→1, transformOrigin: "left"` | Barre de progression |
| **Sidebar Expand** | `width: 64→260, duration: 0.2` | Toggle sidebar |

### 12.3 Transitions CSS Natives

| Usage | Propriété |
|---|---|
| **Cards hover** | `transition-all duration-200` ou `duration-300` |
| **Nav links** | `transition-all duration-200` |
| **Borders hover** | `transition: border-color 0.3s ease` |
| **Colors** | `transition-colors` |
| **Opacity** | `transition-opacity` |
| **Transform** | `hover:scale-[1.02]`, `hover:-translate-y-2` |

---

## 13. Thématisation Multi-Espace

### 13.1 Concept

DIGITALIUM utilise un système de **thèmes dynamiques** qui change l'accent colorimétrique selon le type d'espace ou d'organisation. Le fond et les composants de base restent identiques — seuls les *accent colors* changent.

### 13.2 Layout Root Pattern

```
┌─ bg: var(--layout-bg) ────────────────────────────────┐
│  p-3 gap-3                                              │
│  ┌─ .glass-panel rounded-2xl ─┐  ┌─ .glass-panel ─────┐ │
│  │  SIDEBAR (260px/64px)       │  │  MAIN CONTENT      │ │
│  │  - Logo org                 │  │  ┌─ HEADER h-14 ──┐│ │
│  │  - Nav links (rounded-full) │  │  │ Breadcrumb    ││ │
│  │  - Footer (theme/logout)    │  │  │ Search+Avatar ││ │
│  │                             │  │  └────────────────┘│ │
│  │                             │  │  ┌─ CONTENT ──────┐│ │
│  │                             │  │  │ p-4 lg:p-6     ││ │
│  │                             │  │  │  {children}    ││ │
│  │                             │  │  └────────────────┘│ │
│  └─────────────────────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 13.3 ProLayout Themes (par type d'org)

| OrgType | Gradient | Active BG | Active Text | Indicator | Notif BG |
|---|---|---|---|---|---|
| `enterprise` | violet→indigo | `violet-500/20` | `violet-400` | `violet-400` | `violet-500` |
| `institution` | amber→orange | `amber-500/20` | `amber-400` | `amber-400` | `amber-500` |
| `government` | emerald→teal | `emerald-500/20` | `emerald-400` | `emerald-400` | `emerald-500` |
| `platform` | red→orange | `red-500/20` | `red-400` | `red-400` | `red-500` |
| `organism` | cyan→teal | `cyan-500/20` | `cyan-400` | `cyan-400` | `cyan-500` |

### 13.4 AdminLayout Spaces

| Space | Label | Gradient | Active Color | Icon |
|---|---|---|---|---|
| `business` | Gestion Business | blue→violet | `blue-400` | `LayoutDashboard` |
| `infra` | Infrastructure | red→orange | `orange-400` | `Terminal` |
| `digitalium` | DIGITALIUM | emerald→teal | `emerald-400` | `Building` |

### 13.5 Interface du Thème

```ts
interface ProLayoutTheme {
  gradient: string;        // "from-X to-Y"
  activeBg: string;        // "bg-X/20"
  activeText: string;      // "text-X"
  indicator: string;       // "bg-X"
  badgeBg: string;         // "bg-X/20"
  badgeText: string;       // "text-X"
  notifBg: string;         // "bg-X"
  ringColor: string;       // "focus-visible:ring-X/30"
  pageInfoAccent: string;  // "violet" | "orange" | etc.
}
```

---

## 14. Responsive & Breakpoints

### 14.1 Points de Rupture Tailwind

| Breakpoint | Min-width | Usage clé |
|---|---|---|
| **sm** | 640px | CTA en flex-row, toggles visibles |
| **md** | 768px | Grids multi-colonnes, nav desktop, layouts split |
| **lg** | 1024px | Sidebar visible, images décoratives, grid 4 colonnes |
| **xl** | 1280px | Tagline logo visible |

### 14.2 Layout Responsive Dashboard

| Breakpoint | Sidebar | Header | Content |
|---|---|---|---|
| **< lg** | Sheet (mobile drawer) | Hamburger + breadcrumb | `p-4` |
| **≥ lg** | Sidebar fixe 260px (collapsible → 64px) | Breadcrumb + search + avatar | `p-6` |

### 14.3 Patterns Mobile Récurrents

```
hidden md:flex         → Nav links, search bar desktop
hidden md:block        → Progress line, sidebar desktop
md:hidden              → Hamburger menu button
hidden sm:flex         → Utility toggles desktop
sm:hidden              → Utility toggles in mobile menu
hidden xl:inline-block → Logo tagline
hidden lg:block        → Step indicator subtitle, background images
```

### 14.4 Grilles Responsives

| Composant | Mobile | Tablet | Desktop |
|---|---|---|---|
| **Problem cards** | `grid-cols-1` | `md:grid-cols-3` | — |
| **Service modules** | `grid-cols-1` | `md:grid-cols-2` | — |
| **Journey steps** | `grid-cols-1` | — | `md:grid-cols-4` |
| **Footer columns** | `grid-cols-2` | — | `md:grid-cols-5` |
| **CTA buttons** | `flex-col` | `sm:flex-row` | — |
| **CTA final** | `flex-col` | `md:flex-row` | — |

### 14.5 Menu Mobile (Public)

```
Trigger:   w-10 h-10 rounded-xl bg-white/5 border border-white/10
Backdrop:  fixed inset-0 bg-black/60 backdrop-blur-sm z-50
Container: rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6
Animation: AnimatePresence → opacity, y, scale avec stagger
CTAs:      w-full h-11 rounded-xl bg-gradient-to-r
```

---

## 15. Hiérarchie Visuelle des Rôles (RBAC)

### 15.1 Niveaux & Couleurs

| Niveau | Rôle | Couleur | Hex | Label FR |
|---|---|---|---|---|
| 0 | `system_admin` | 🔴 Rouge | `#EF4444` | Administrateur Système |
| 1 | `platform_admin` | 🟠 Orange | `#F97316` | Administrateur Plateforme |
| 2 | `org_admin` | 🟣 Violet | `#8B5CF6` | Administrateur Organisation |
| 3 | `org_manager` | 🔵 Bleu | `#3B82F6` | Gestionnaire |
| 4 | `org_member` | 🟢 Émeraude | `#10B981` | Collaborateur |
| 5 | `org_viewer` | ⚪ Gris | `#6B7280` | Observateur |

### 15.2 Routing par Rôle

| Rôle(s) | Route | Layout |
|---|---|---|
| `system_admin` | `/sysadmin` | SysAdminSpaceLayout |
| `platform_admin` | `/admin` | AdminUnifiedLayout |
| `org_admin` | `/subadmin` | SubAdminLayout |
| `org_manager` → `org_viewer` | `/pro` | ProLayout |
| Institutions | `/institutional` | InstitutionalLayout |

### 15.3 Accès Visuel dans le Sidebar

- **Section RBAC-gated** : `maxLevel` sur la section ou l'item
- **Module-gated** : `moduleId` vérifié contre `orgModules[]`
- **Nav-config-gated** : `navConfigKey` vérifié contre `NavigationConfig`
- **Triple filtrage** : `RBAC → Module → NavConfig`

---

## 16. Modules — Identité Visuelle

### 16.1 Cartographie Couleur / Module

| Module | Nom | Hex | Gradient Tailwind | Icône | Status |
|---|---|---|---|---|---|
| **iDocument** | `idocument` | `#3B82F6` | `from-blue-500 to-blue-600` | `FileText` | Active |
| **iArchive** | `iarchive` | `#10B981` | `from-emerald-500 to-emerald-600` | `Archive` | Active |
| **iSignature** | `isignature` | `#8B5CF6` | `from-violet-500 to-violet-600` | `PenTool` | Active |
| **iAsted** | `iasted` | `#F59E0B` | `from-amber-500 to-amber-600` | `Bot` | Beta |

### 16.2 Pattern d'Affichage Module

```tsx
{/* Icon Container — usage dans cards et nav */}
<div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${module.gradient}
  flex items-center justify-center`}>
  <ModuleIcon className="h-8 w-8 text-white" />
</div>
```

### 16.3 Pricing Visuel

| Module | Inclus? | Addon |
|---|---|---|
| iDocument | ✅ Oui | — |
| iArchive | ✅ Oui | — |
| iSignature | ❌ Non | 5 000 XAF/mois |
| iAsted | ❌ Non | 10 000 XAF/mois |

---

## 17. Imagerie & Photographie

### 17.1 Bibliothèque d'Images

| Chemin | Description | Usage |
|---|---|---|
| `/images/security/sovereignty_main.png` | Image hero — souveraineté data | Background hero section |
| `/images/security/encryption.png` | Cadenas / chiffrement | Pilier sécurité |
| `/images/security/hosting.png` | Datacenter | Pilier hébergement |
| `/images/security/compliance.png` | Document conformité | Pilier conformité |
| `/images/security/audit.png` | Journal d'audit | Pilier audit |
| `/images/security/cta_promo.png` | Photo pro | CTA final section |
| `/images/sections/office_paper_chaos.png` | Bureau papier désorganisé | Problem section |
| `/images/sections/digital_tablet_pro.png` | Tablette professionnelle | Services section |
| `/images/sections/team_collaboration_meeting.png` | Réunion d'équipe | Journey section |
| `/images/sections/ministry_office.png` | Bureau ministère | Solutions admin |
| `/images/sections/libreville_corporate_skyline.png` | Skyline Libreville | Contexte gabonais |
| `/images/sections/gabon_flag_data.png` | Drapeau + données | Souveraineté |
| `/images/sections/compliance_document.png` | Document conforme | Conformité |
| `/images/sections/encryption_lock.png` | Cadenas numérique | Sécurité |
| `/images/sections/audit_log_trace.png` | Trace d'audit | Traçabilité |

### 17.2 Traitement des Images

| Propriété | Valeur |
|---|---|
| **Format** | PNG (fourni), converti en WebP par Next.js |
| **Optimisation** | `next/image` avec `fill`, `object-cover`, lazy-load |
| **Priority** | Uniquement l'image Hero |
| **Overlay** | Toujours avec gradient pour lisibilité du texte |
| **Opacité** | 15%–20% pour les backgrounds décoratifs |

### 17.3 Orbes Décoratives (éléments abstraits)

```tsx
{/* Pattern d'orbe flottante */}
<div className="absolute -top-20 -right-20 
  w-72 h-72 rounded-full 
  bg-digitalium-blue/10 blur-2xl 
  animate-float" />

<div className="absolute -bottom-20 -left-20 
  w-80 h-80 rounded-full 
  bg-digitalium-violet/10 blur-2xl 
  animate-float" 
  style={{ animationDelay: "1.5s" }} />
```

---

## 18. Page Publique vs Dashboard

### 18.1 Comparaison Structurelle

| Aspect | Page Publique | Dashboard |
|---|---|---|
| **Layout** | Scroll vertical, full-width | Panels détachés (sidebar + main) |
| **Navbar** | Fixed glass, `z-40` | Header intégré dans le main panel |
| **Background** | Images + overlays + orbes | `var(--layout-bg)` solid |
| **Typography** | Titres XXL (text-7xl) | Titres standards (text-xl) |
| **CTA** | Grands boutons gradient (h-14) | Boutons standards (h-9) |
| **Animations** | Framer Motion intensif | Framer Motion minimal (sidebar) |
| **Cards** | `.glass-card` avec hover effects | `.glass-panel` flat |
| **Sections** | `py-24` espacements généreux | `p-4 lg:p-6` compact |
| **Navigation** | Links → ancres sections | Links → routes Next.js |
| **Theme** | Dark par défaut fixe | Dynamic par type d'org |
| **Menu mobile** | AnimatePresence modal | Sheet (drawer latéral) |
| **Recherche** | Non | Input dans le header |
| **Breadcrumbs** | Non | Oui, dynamique |

### 18.2 Pattern Dashboard (ProLayout)

```
min-h-screen flex bg-[var(--layout-bg)] p-3 gap-3
  ├─ aside.glass-panel rounded-2xl (260px ↔ 64px animated)
  │   ├─ Logo + OrgName
  │   ├─ Nav sections (RBAC + Module filtered)
  │   └─ Footer (theme/collapse/logout)
  └─ div.glass-panel rounded-2xl flex-col
      ├─ header h-14|h-16 border-b
      │   ├─ Hamburger (mobile) + Breadcrumbs
      │   └─ Search + PageInfo + Notifications + Avatar Dropdown
      └─ main.overflow-y-auto p-4|p-6
          └─ {children}
```

---

## 19. Accessibilité

### 19.1 Standards Suivis

| Critère | Implémentation |
|---|---|
| **Focus visible** | `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` |
| **SR-only labels** | `<span className="sr-only">Close</span>` sur les boutons icône |
| **Aria labels** | `aria-label="Ouvrir le menu"` sur les boutons |
| **Contraste** | Tokens HSL calculés pour ratio ≥ 4.5:1 |
| **Keyboard nav** | Tous les composants Radix sont navigables au clavier |
| **Anti-aliasing** | `antialiased` sur le body |
| **Reduced motion** | ⚠️ Non implémenté (à ajouter) |
| **Color-blind safe** | Couleurs sémantiques doublées d'icônes |

### 19.2 Composants Accessibles (Radix UI)

Tous les composants Shadcn/ui utilisent les primitives **Radix UI** qui gèrent :
- Focus trap dans les modals
- Dismiss via Escape
- Screen reader support
- ARIA attributes automatiques
- Role management

---

## 20. SEO & Metadata

### 20.1 Configuration Globale (Root Layout)

```ts
{
  title: "DIGITALIUM.IO — Archivage Intelligent & Gestion Documentaire",
  description: "Plateforme d'archivage intelligent et de gestion documentaire pour le Gabon...",
  keywords: ["archivage", "gestion documentaire", "signature électronique", "Gabon", 
             "DIGITALIUM", "conformité OHADA", "iDocument", "iArchive", "iSignature", "Mobile Money"],
  authors: [{ name: "DIGITALIUM.IO" }],
  creator: "DIGITALIUM.IO",
  publisher: "DIGITALIUM.IO",
  metadataBase: new URL("https://digitalium.io"),

  openGraph: {
    type: "website",
    locale: "fr_GA",
    url: "https://digitalium.io",
    siteName: "DIGITALIUM.IO",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },

  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/logo_digitalium.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}
```

### 20.2 HTML Structure

```html
<html lang="fr" suppressHydrationWarning>
<body class="${inter.variable} font-sans antialiased">
```

---

## 21. Fichiers de Référence

### 21.1 Fichiers Source du Design System

| Fichier | Contenu |
|---|---|
| `tailwind.config.ts` | Couleurs custom, keyframes, animations, radius, fonts |
| `src/app/globals.css` | Tokens CSS light/dark, classes .glass*, .text-gradient, etc. |
| `components.json` | Config Shadcn/ui (style new-york, slate, lucide) |
| `src/lib/utils.ts` | Utilitaire `cn()` = twMerge + clsx |
| `src/contexts/ThemeContext.tsx` | Provider dark/light mode |
| `src/config/constants.ts` | Constantes app (nom, couleurs thème, limites) |
| `src/config/modules.ts` | Définition des 4 modules (couleurs, gradients, features) |
| `src/config/org-config.ts` | Thèmes ProLayout + OrgBranding + NavigationConfig |
| `src/config/rbac.ts` | Couleurs des rôles, labels, permissions |

### 21.2 Composants UI (Shadcn/ui)

| Composant | Fichier |
|---|---|
| Button | `src/components/ui/button.tsx` |
| Badge | `src/components/ui/badge.tsx` |
| Card | `src/components/ui/card.tsx` |
| Input | `src/components/ui/input.tsx` |
| Textarea | `src/components/ui/textarea.tsx` |
| Dialog | `src/components/ui/dialog.tsx` |
| Tabs | `src/components/ui/tabs.tsx` |
| Select | `src/components/ui/select.tsx` |
| Avatar | `src/components/ui/avatar.tsx` |
| Switch | `src/components/ui/switch.tsx` |
| Tooltip | `src/components/ui/tooltip.tsx` |
| Accordion | `src/components/ui/accordion.tsx` |
| Separator | `src/components/ui/separator.tsx` |
| Checkbox | `src/components/ui/checkbox.tsx` |
| Dropdown Menu | `src/components/ui/dropdown-menu.tsx` |
| Sheet | `src/components/ui/sheet.tsx` |
| Label | `src/components/ui/label.tsx` |

### 21.3 Layouts Dashboard

| Layout | Fichier | Usage |
|---|---|---|
| ProLayout | `src/components/layout/ProLayout.tsx` | Espace professionnel (org_manager→org_viewer) |
| AdminUnifiedLayout | `src/components/layout/AdminUnifiedLayout.tsx` | Administration unifiée (3 espaces) |
| SubAdminLayout | `src/components/layout/SubAdminLayout.tsx` | Sous-administration (org_admin) |
| InstitutionalLayout | `src/components/layout/InstitutionalLayout.tsx` | Espace institutionnel |
| SysAdminSpaceLayout | `src/components/layout/SysAdminSpaceLayout.tsx` | Administration système |
| AdminSpaceLayout | `src/components/layout/AdminSpaceLayout.tsx` | Admin espace |
| SubAdminSpaceLayout | `src/components/layout/SubAdminSpaceLayout.tsx` | Sous-admin espace |

### 21.4 Sections Publiques

| Section | Fichier |
|---|---|
| Hero | `src/components/sections/HeroSection.tsx` |
| Problem | `src/components/sections/ProblemSection.tsx` |
| Services | `src/components/sections/ServicesSection.tsx` |
| Journey | `src/components/sections/JourneySection.tsx` |
| Final CTA | `src/components/sections/FinalCTASection.tsx` |
| Footer | `src/components/sections/FooterSection.tsx` |
| Solution Template | `src/components/sections/SolutionPageTemplate.tsx` |

---

## 📐 Annexe : Résumé Visuel Rapide

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   COULEURS    ■ #3B82F6  ■ #8B5CF6  ■ #10B981  ■ #F59E0B         │
│               ■ #EF4444  ■ #06B6D4  ■ #6B7280                    │
│                                                                    │
│   GRADIENT    ████████████████████████████████████                 │
│               blue ─────────── violet                              │
│                                                                    │
│   FONT        Inter (300-900) — antialiased — swap                │
│                                                                    │
│   RADIUS      sm:8px  md:10px  lg:12px  xl:12px  2xl:16px  ●     │
│                                                                    │
│   GLASS       flat (no blur, no shadow) — border tokens           │
│                                                                    │
│   DARK MODE   Default "dark" — localStorage "digitalium-theme"    │
│                                                                    │
│   ICONS       Lucide React — outline, stroke-2                    │
│                                                                    │
│   ANIMATIONS  Framer Motion + Tailwind keyframes                  │
│                                                                    │
│   UI LIB      Shadcn/ui (new-york, slate, no prefix)             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

*Ce document constitue la source de vérité pour toute décision de design au sein de DIGITALIUM.IO et peut être utilisé comme base pour tout projet dérivé.*
