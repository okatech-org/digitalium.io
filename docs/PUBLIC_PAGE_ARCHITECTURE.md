# 📐 Architecture Graphique & Design — Page Publique DIGITALIUM.IO

> **Objectif :** Ce document décrit en détail l'architecture visuelle, le design system, la disposition et les patterns de la page publique (landing page) de DIGITALIUM.IO. Il est conçu pour être répliqué dans un autre projet.

---

## 📋 Table des Matières

1. [Stack Technique](#1-stack-technique)
2. [Design System (Tokens & Variables CSS)](#2-design-system)
3. [Typographie](#3-typographie)
4. [Palette de Couleurs](#4-palette-de-couleurs)
5. [Classes Utilitaires Custom](#5-classes-utilitaires-custom)
6. [Animations & Keyframes](#6-animations--keyframes)
7. [Architecture des Fichiers](#7-architecture-des-fichiers)
8. [Structure de la Page (Sections)](#8-structure-de-la-page)
9. [Composants Partagés](#9-composants-partagés)
10. [Patterns de Layout](#10-patterns-de-layout)
11. [Pages Secondaires](#11-pages-secondaires)
12. [Responsive & Mobile](#12-responsive--mobile)
13. [Performance & Optimisation](#13-performance--optimisation)
14. [SEO & Metadata](#14-seo--metadata)

---

## 1. Stack Technique

| Technologie | Rôle | Version |
|---|---|---|
| **Next.js 14** | Framework React (App Router) | 14.x |
| **TypeScript** | Typage statique | 5.x |
| **Tailwind CSS** | Utility-first CSS | 3.x |
| **Shadcn/ui** | Composants UI (Button, Badge, DropdownMenu, etc.) | latest |
| **Framer Motion** | Animations & transitions | 10.x+ |
| **Lucide React** | Bibliothèque d'icônes | latest |
| **next/font (Inter)** | Typographie optimisée | built-in |
| **next/image** | Images optimisées (WebP, lazy-load) | built-in |
| **Sonner** | Notifications toast | latest |

### Providers (contexte global)
```
ConvexProvider → FirebaseAuthProvider → OrganizationProvider → ThemeProvider → {children}
```

---

## 2. Design System

### 2.1 Variables CSS (HSL) — Thème Clair

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 217 91% 60%;          /* Bleu principal */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 263 70% 50.4%;         /* Violet accent */
  --accent-foreground: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 217 91% 60%;
  --radius: 0.75rem;

  /* Glass tokens (light) */
  --layout-bg: #fcfcfc;
  --glass-bg: rgba(255, 255, 255, 0.95);
  --glass-bg-hover: #f4f4f5;
  --glass-border: #e4e4e7;
  --glass-border-hover: #d4d4d8;
  --glass-subtle: #f4f4f5;
  --glass-panel-bg: #ffffff;
  --glass-panel-border: #e4e4e7;
  --shimmer-color: rgba(0, 0, 0, 0.04);
  --grid-line: #f4f4f5;
}
```

### 2.2 Variables CSS — Thème Sombre (`.dark`)

```css
.dark {
  --background: 224 71% 4%;        /* Bleu très foncé */
  --foreground: 213 31% 91%;
  --card: 224 71% 4%;
  --card-foreground: 213 31% 91%;
  --primary: 217 91% 60%;
  --secondary: 222 47% 11%;
  --muted: 223 47% 11%;
  --muted-foreground: 215.4 16.3% 56.9%;
  --accent: 263 70% 50.4%;
  --border: 216 34% 17%;
  --ring: 263 70% 50.4%;

  /* Glass tokens (dark) */
  --layout-bg: #09090b;
  --glass-bg: #18181b;
  --glass-bg-hover: #27272a;
  --glass-border: #27272a;
  --glass-border-hover: #3f3f46;
  --glass-subtle: #18181b;
  --glass-panel-bg: #0c0c0e;
  --glass-panel-border: #27272a;
  --shimmer-color: rgba(255, 255, 255, 0.05);
  --grid-line: #18181b;
}
```

### 2.3 Border Radius System (Tailwind)

```ts
borderRadius: {
  lg: 'var(--radius)',        // 0.75rem = 12px
  md: 'calc(var(--radius) - 2px)',  // 10px
  sm: 'calc(var(--radius) - 4px)',  // 8px
}
```

---

## 3. Typographie

| Propriété | Valeur |
|---|---|
| **Font principale** | `Inter` (Google Fonts) |
| **Variable CSS** | `--font-inter` |
| **Fallback** | `system-ui, sans-serif` |
| **Rendering** | `antialiased`, `font-display: swap` |
| **Import** | Via `next/font/google` (optimisée) + CSS fallback |

### Échelle typographique utilisée

| Élément | Classes Tailwind |
|---|---|
| **Hero H1** | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1]` |
| **Section H2** | `text-3xl md:text-5xl font-bold` |
| **Card H3** | `text-xl font-bold` ou `text-lg font-bold` |
| **Subtitle** | `text-lg md:text-xl text-muted-foreground` |
| **Body text** | `text-sm text-muted-foreground leading-relaxed` |
| **Badge/Label** | `text-xs` ou `text-[11px] font-medium` |
| **Micro text** | `text-[10px] text-muted-foreground/50` |
| **Mono numéro** | `text-xs font-mono font-bold tracking-wider` |
| **Logo brand** | `font-bold text-2xl tracking-tight` |
| **Tagline** | `text-[11px] font-medium tracking-[0.26em]` |

---

## 4. Palette de Couleurs

### 4.1 Couleurs de Marque (Tailwind custom)

```ts
digitalium: {
  blue: '#3B82F6',           // Bleu principal
  violet: '#8B5CF6',         // Violet principal
  'blue-light': '#60A5FA',
  'violet-light': '#A78BFA',
  'blue-dark': '#2563EB',
  'violet-dark': '#7C3AED',
}
```

### 4.2 Couleurs Fonctionnelles (inline styles)

| Usage | Couleur | Hex |
|---|---|---|
| **Module iDocument** | Bleu | `#3B82F6` |
| **Module iArchive** | Émeraude | `#10B981` |
| **Module iSignature** | Violet | `#8B5CF6` |
| **Module iAsted** | Ambre | `#F59E0B` |
| **Accent ".IO"** | Ambre | `#F59E0B` |
| **Erreur/Danger** | Rouge | `text-red-400` |
| **Warning** | Orange | `text-orange-400` |
| **Succès/Complété** | Émeraude | `text-emerald-400` / `text-emerald-500` |
| **Cyan accent** | Cyan | `#06B6D4` / `#00D9FF` |

### 4.3 Gradients Principaux

```css
/* Gradient texte principal (brand) */
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%);
background-size: 200% auto;

/* Gradient texte accent (violet→cyan) */
background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);

/* Gradient bouton CTA */
bg-gradient-to-r from-digitalium-blue to-digitalium-violet

/* Gradient mobile menu title */
background: linear-gradient(135deg, #3B82F6, #8B5CF6, #00D9FF);
```

---

## 5. Classes Utilitaires Custom

### 5.1 `.glass` — Glassmorphism (Navbar, badges)
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(0px);       /* Flat look, pas de blur */
  border: 1px solid var(--glass-border);
  box-shadow: none !important;
}
```

### 5.2 `.glass-card` — Cartes de contenu
```css
.glass-card {
  background: var(--glass-panel-bg);
  border: 1px solid var(--glass-panel-border);
  border-radius: var(--radius);     /* 0.75rem */
  transition: all 0.2s ease;
  box-shadow: none !important;
}
.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
```

### 5.3 `.glass-panel` — Panneaux détachés (sidebar)
```css
.glass-panel {
  background: var(--glass-panel-bg);
  border: 1px solid var(--glass-panel-border);
  box-shadow: none !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
```

### 5.4 `.glass-section` — Sections de fond
```css
.glass-section {
  background: var(--glass-subtle);
  backdrop-filter: blur(8px);
}
```

### 5.5 `.text-gradient` — Texte dégradé brand
```css
.text-gradient {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 5.6 `.gradient-text-accent` — Texte dégradé accent
```css
.gradient-text-accent {
  background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 5.7 `.gradient-border` — Bordure dégradée
```css
.gradient-border {
  position: relative;
  background: hsl(var(--card));
  border-radius: var(--radius);
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  z-index: -1;
}
```

### 5.8 `.shimmer` — Effet de scintillement
```css
.shimmer {
  background: linear-gradient(90deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

### 5.9 `.cortex-grid` — Motif de grille en fond
```css
.cortex-grid {
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### 5.10 `.glow` — Effet de lueur (hover)
```css
.glow {
  box-shadow: none !important;
  border: 1px solid var(--glass-border);
  transition: border-color 0.3s ease;
}
.glow:hover {
  border-color: var(--glass-border-hover);
}
```

### 5.11 Scrollbar personnalisée
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
```

---

## 6. Animations & Keyframes

### 6.1 Keyframes Tailwind (dans `tailwind.config.ts`)

```ts
keyframes: {
  'gradient-shift': {
    '0%, 100%': { backgroundPosition: '0% 50%' },
    '50%':      { backgroundPosition: '100% 50%' },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%':      { transform: 'translateY(-10px)' },
  },
  'pulse-glow': {
    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
    '50%':      { opacity: '0.8', boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' },
  },
  shimmer: {
    '0%':   { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
},
animation: {
  'gradient-shift': 'gradient-shift 6s ease infinite',
  float:            'float 3s ease-in-out infinite',
  'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
  shimmer:          'shimmer 2s linear infinite',
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up':   'accordion-up 0.2s ease-out',
},
```

### 6.2 Animations Framer Motion — Patterns Récurrents

#### Fade-in + Slide-up (usage universel)
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

#### Staggered children (Hero word-by-word reveal)
```tsx
variants={{
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}}
// Children:
variants={{
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}}
```

#### Scroll-triggered (`whileInView`)
```tsx
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: i * 0.15, duration: 0.6 }}
```

#### Scale-in (Spring pour cercles/badges)
```tsx
initial={{ scale: 0 }}
animate={inView ? { scale: 1 } : {}}
transition={{ delay: i * 0.2, type: "spring" }}
```

#### Mobile menu (AnimatePresence)
```tsx
initial={{ opacity: 0, y: 20, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.95 }}
transition={{ duration: 0.3, ease: "easeOut" }}
```

#### Animated arrow bounce
```tsx
animate={{ y: [0, 8, 0] }}
transition={{ repeat: Infinity, duration: 1.5 }}
```

#### Progress line animation (scaleX)
```tsx
initial={{ scaleX: 0 }}
animate={inView ? { scaleX: 1 } : {}}
transition={{ duration: 1.5, ease: "easeOut" }}
style={{ transformOrigin: "left" }}
```

---

## 7. Architecture des Fichiers

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (Inter font, Providers, Toaster)
│   ├── globals.css                   # Design system complet (tokens, utilities)
│   └── (public)/                     # Route group publique
│       ├── layout.tsx                # Layout public (DemoAccountSwitcher)
│       ├── page.tsx                  # ★ Landing Page principale
│       ├── guide/
│       │   └── page.tsx              # Guide d'utilisation interactif
│       └── solutions/
│           ├── administrations/
│           │   └── page.tsx          # Page Administrations
│           ├── entreprises/
│           │   └── page.tsx          # Page Entreprises
│           ├── organismes/
│           │   └── page.tsx          # Page Organismes
│           └── particuliers/
│               └── page.tsx          # Page Particuliers
│
├── components/
│   ├── sections/                     # Sections de la landing page
│   │   ├── HeroSection.tsx           # Hero avec image bg, badge, titre animé, CTAs
│   │   ├── ProblemSection.tsx        # Problèmes (3 cartes stat)
│   │   ├── ServicesSection.tsx       # 4 modules (grille 2x2)
│   │   ├── JourneySection.tsx        # Timeline 4 étapes
│   │   ├── FinalCTASection.tsx       # CTA final (image + texte)
│   │   ├── FooterSection.tsx         # Footer 5 colonnes
│   │   └── SolutionPageTemplate.tsx  # ★ Template réutilisable (sous-pages)
│   │
│   ├── shared/                       # Composants partagés
│   │   ├── ThemeToggle.tsx           # Toggle dark/light mode
│   │   ├── LanguageSwitcher.tsx      # Sélecteur FR/EN
│   │   └── DemoAccountSwitcher.tsx   # Panel flottant démo
│   │
│   ├── auth/                         # Modals d'authentification
│   │   ├── LoginModal.tsx            # Login (overlay glassmorphism)
│   │   └── RegisterModal.tsx         # Register avec choix persona
│   │
│   └── ui/                           # Shadcn/ui components
│       ├── button.tsx
│       ├── badge.tsx
│       ├── dropdown-menu.tsx
│       └── ...
│
├── contexts/                         # Providers React
│   ├── ThemeContext.tsx
│   ├── FirebaseAuthContext.tsx
│   └── OrganizationContext.tsx
│
└── public/                           # Assets statiques
    ├── logo_digitalium.png
    ├── og-image.png
    └── images/
        ├── security/                 # Images Hero & sécurité
        │   ├── sovereignty_main.png
        │   ├── encryption.png
        │   ├── hosting.png
        │   ├── compliance.png
        │   ├── audit.png
        │   └── cta_promo.png
        └── sections/                 # Images des sections
            ├── office_paper_chaos.png
            ├── digital_tablet_pro.png
            ├── team_collaboration_meeting.png
            └── ministry_office.png
```

---

## 8. Structure de la Page (Sections)

La landing page suit un **scroll vertical linéaire** avec 6 sections principales + modals flottants :

### 8.1 Navbar (fixe, `z-40`)

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo+Nom]    Accueil | Admins | Entreprises | ...   [🌙][🌐] [Connexion] [Commencer →]  │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- Position `fixed top-0 z-40`
- Classe `.glass` avec `border-b border-white/5`
- Container : `max-w-[95%] mx-auto px-4 h-16 flex items-center justify-between`
- Logo : `Image` 96x96 avec `translate-y-6` (déborde vers le bas)
- Brand : "DIGITALIUM" en `text-foreground` + ".IO" en `text-[#F59E0B]`
- Tagline : `text-[11px] tracking-[0.26em]` (visible `xl:` seulement)
- Nav links : `text-sm text-muted-foreground` avec `hover:text-foreground transition-colors`
- Lien actif : `text-foreground font-medium`
- Groupe droite : ThemeToggle + LanguageSwitcher + boutons auth
- Mobile : Hamburger → menu modal glassmorphism (AnimatePresence)

### 8.2 HeroSection (full-screen, above-the-fold)

```
┌──────────────────────────────────────────────────────────────┐
│                   [Image de fond plein écran]                │
│                   [Overlay gradient 60%+80%]                 │
│                                                              │
│            [Orbes flottants décoratifs bg]                   │
│                                                              │
│               ● Plateforme souveraine 🇬🇦                   │
│                                                              │
│          Votre Entreprise Perd                               │
│         23% de Productivité          ← text-gradient         │
│         Sans Archivage Intelligent                           │
│                                                              │
│    [Subtitle - muted-foreground max-w-2xl]                   │
│                                                              │
│    [CTA Primaire gradient] [CTA Secondaire outline]          │
│                                                              │
│    "Ils nous font confiance"  [Logos Trust Band]             │
│                                                              │
│    ─── Sécurité Souveraine (titre) ───                       │
│    ┌──────────────┐  ┌──────────────┐                        │
│    │ [img] │ text │  │ [img] │ text │   ← 2x2 grid          │
│    └──────────────┘  └──────────────┘                        │
│    ┌──────────────┐  ┌──────────────┐                        │
│    │ [img] │ text │  │ [img] │ text │                        │
│    └──────────────┘  └──────────────┘                        │
│                                                              │
│    🏆 Badge de confiance final                               │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- `min-h-screen flex items-center justify-center overflow-hidden`
- Image background : `next/image fill object-cover priority`
- Overlay double : `bg-background/60` + gradient `from-background/80 via-transparent to-background`
- 3 orbes décoratifs (cercles `blur-2xl` avec `animate-float` et `animate-pulse-glow`)
- Badge status : `inline-flex` avec dot `animate-pulse` vert + texte + emoji 🇬🇦
- Titre mot-par-mot animé (Framer `staggerChildren: 0.06`)
- CTA primaire : `bg-gradient-to-r from-digitalium-blue to-digitalium-violet` + `animate-pulse-glow`
- CTA secondaire : `variant="outline"` + `border-white/10`
- Trust band : logos textuels en badges `.glass`
- Security Pillars : grille `2x2` de cartes horizontales (40% image + 60% texte)
- Badge de confiance : `.glass-card` centré avec icône Award

### 8.3 ProblemSection (3 colonnes stat cards)

```
┌──────────────────────────────────────────────────────────────┐
│  [Image de fond opacity-20 avec overlay]                     │
│                                                              │
│       Le Gabon Perd des Milliards en "Documents Mal Gérés"   │
│       [subtitle muted]                                       │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   [icon]    │ │   [icon]    │ │   [icon]    │           │
│  │    23%      │ │   10 ans    │ │    67%      │           │
│  │  titre      │ │  titre      │ │  titre      │           │
│  │  desc       │ │  desc       │ │  desc       │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                              │
│       DIGITALIUM résout tout cela                            │
│              ↓ (animated bounce)                             │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- `py-24 px-6 border-t border-white/5`
- Image background : `opacity-20` + overlay `bg-background/80` + gradient vertical
- Titre : H2 `text-3xl md:text-5xl font-bold` avec accent coloré (`text-red-400`)
- Grid `grid-cols-1 md:grid-cols-3 gap-6`
- Chaque card : `.glass-card` + `hover:scale-[1.02]` + couleur thématique unique
- Stats : `text-4xl font-extrabold` en couleur thématique
- Transition fléchée animée : `animate({ y: [0, 8, 0] })` infini

### 8.4 ServicesSection (grille 2x2 modules)

```
┌──────────────────────────────────────────────────────────────┐
│  [Image côté droit opacity-5]                                │
│                                                              │
│     Un Écosystème Complet en "4 Modules Intelligents"        │
│     [subtitle muted]                                         │
│                                                              │
│  ┌────────────────────────┐ ┌────────────────────────┐      │
│  │ [Badge: Inclus]        │ │ [Badge: Inclus]        │      │
│  │ [Icon 64x64]  Name     │ │ [Icon 64x64]  Name     │      │
│  │               Tagline  │ │               Tagline  │      │
│  │               Desc     │ │               Desc     │      │
│  │               ✓ feat   │ │               ✓ feat   │      │
│  │               ✓ feat   │ │               ✓ feat   │      │
│  │               ✓ feat   │ │               ✓ feat   │      │
│  └────────────────────────┘ └────────────────────────┘      │
│  ┌────────────────────────┐ ┌────────────────────────┐      │
│  │ (même layout)          │ │ [Badge: + 5000 XAF]   │      │
│  └────────────────────────┘ └────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- `py-24 px-6` avec image décorative côté droit (`opacity-5 hidden lg:block`)
- Grid `grid-cols-1 md:grid-cols-2 gap-6`
- Chaque module card :
  - `.glass-card` + `backdrop-blur-md` + gradient subtil `bg-gradient-to-br`
  - `hover:-translate-y-2 hover:shadow-lg transition-all duration-300`
  - Badge positionné `absolute top-4 right-4`
  - Icône 64x64 dans un conteneur avec gradient inline + `group-hover:scale-110`
  - Features list avec check coloré
  - Glow hover `inset boxShadow` en overlay invisible

### 8.5 JourneySection (timeline 4 étapes)

```
┌──────────────────────────────────────────────────────────────┐
│  [Image de fond opacity-15 avec overlay]                     │
│                                                              │
│     Du Document Brut à "l'Intelligence Business"             │
│     en 4 étapes                                              │
│                                                              │
│  ═══════════ [Progress line gradient animated] ═══════════   │
│                                                              │
│  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐                  │
│  │(●)  │    │(●)  │    │(●)  │    │(●)  │                  │
│  │Cercl│    │Cercl│    │Cercl│    │Cercl│                  │
│  │01   │    │02   │    │03   │    │04   │                  │
│  │CRÉER│    │COLL │    │ARCH │    │ANAL │                  │
│  │desc │    │desc │    │desc │    │desc │                  │
│  └─────┘    └─────┘    └─────┘    └─────┘                  │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- `py-24 px-6 border-t border-white/5`
- Background image `opacity-15` + overlay `bg-background/90`
- Progress line : `h-0.5 bg-white/5` avec fill animé `scaleX` gradient multicolore
- Grid `grid-cols-1 md:grid-cols-4 gap-8`
- Chaque étape :
  - Cercle 104x104 avec `animate-pulse-glow` subtil
  - Icône centrée avec couleur thématique
  - Step number en `font-mono font-bold tracking-wider`
  - Card avec `bg-background/50 backdrop-blur-sm border border-white/5`

### 8.6 FinalCTASection (image + texte)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ┌───────────────┐                                    │    │
│  │ │               │  Prêt à "Transformer"              │    │
│  │ │  [Photo Pro]  │  Votre Gestion Documentaire ?      │    │
│  │ │     35%       │                                    │    │
│  │ │               │  [Subtitle muted]                  │    │
│  │ │               │                                    │    │
│  │ │               │  [CTA grad] [CTA outline]          │    │
│  │ │               │                                    │    │
│  │ │               │  ⚡ 30min  📱 Mobile Money  🔒 14j │    │
│  │ └───────────────┘                                    │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- `.glass-card rounded-2xl` avec `flex flex-col md:flex-row`
- Background gradient subtil `from-digitalium-blue/15 via-digitalium-violet/10`
- Texture grain en base64 SVG `opacity-[0.03]`
- Image côté gauche : `w-full md:w-[35%]` avec gradient overlay de fusion
- Contenu droit : `flex-1 p-10 md:p-14 text-center`
- Trust badges en ligne : icônes colorées + texte `text-xs`

### 8.7 FooterSection (5 colonnes)

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo+Desc]  Solutions    Modules    Entreprise    Contact  │
│               Admins       iDocument  Tarifs        email    │
│               Entreprises  iArchive   FAQ           phone    │
│               Organismes   iSignature CGV           addr     │
│               Particuliers iAsted     Confidential.          │
│  ────────────────────────────────────────────────────────────│
│  © 2026 DIGITALIUM                Fièrement conçu au Gabon  │
└──────────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- `border-t border-white/5 py-16 px-6`
- Grid `grid-cols-2 md:grid-cols-5 gap-8`
- Brand col : Logo 32x32 + `.text-gradient` + description `text-xs`
- Liens : `text-xs text-muted-foreground hover:text-foreground transition-colors`
- Copyright bar : `border-t border-white/5 pt-6 flex justify-between`

---

## 9. Composants Partagés

### 9.1 ThemeToggle
- Bouton ghost `h-9 w-9`
- Toggle Sun/Moon avec rotation CSS `dark:-rotate-90 dark:scale-0`
- Utilise `useThemeContext().toggleTheme`

### 9.2 LanguageSwitcher
- DropdownMenu (Shadcn/ui) avec icône Globe
- Toggle FR/EN avec état local
- `align="end"` pour le dropdown

### 9.3 DemoAccountSwitcher
- Chargé dynamiquement (`next/dynamic`, `ssr: false`)
- Panel flottant pour assigner des démo accounts
- Présent uniquement dans le layout `(public)`

### 9.4 Modals d'Auth (LoginModal, RegisterModal)
- Lazy-loaded via `React.lazy()`
- Rendus en overlay flottant (`Suspense fallback={null}`)
- Props : `open`, `onOpenChange`, `onSwitchToRegister/Login`
- Style glassmorphism
- Validation Zod

---

## 10. Patterns de Layout

### 10.1 Container principal
```tsx
<div className="max-w-6xl mx-auto px-6">
```
Variantes : `max-w-7xl` (CTA), `max-w-5xl` (guide), `max-w-[95%]` (navbar)

### 10.2 Section standard
```tsx
<section className="py-24 px-6 relative border-t border-white/5 overflow-hidden">
  {/* Background image/gradient optionnel */}
  <div className="absolute inset-0 z-0">...</div>
  <div className="absolute inset-0 bg-background/80" />

  {/* Contenu */}
  <div className="max-w-6xl mx-auto relative z-10">
    {/* Titre centré */}
    <motion.div className="text-center mb-16">
      <h2>...</h2>
      <p>...</p>
    </motion.div>

    {/* Grille de contenu */}
    <div className="grid grid-cols-1 md:grid-cols-X gap-6">
      ...
    </div>
  </div>
</section>
```

### 10.3 Pattern de Card
```tsx
<motion.div
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="glass-card p-8 group hover:scale-[1.02] transition-transform"
>
  {/* Icon container */}
  <div className="h-14 w-14 rounded-xl bg-{color}/10 flex items-center justify-center">
    <Icon className="h-7 w-7 text-{color}" />
  </div>
  {/* Content */}
  <h3 className="text-xl font-bold">...</h3>
  <p className="text-sm text-muted-foreground leading-relaxed">...</p>
</motion.div>
```

### 10.4 Pattern de Background Décoratif (Orbes)
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
  <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-digitalium-blue/10 blur-2xl animate-float" />
  <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-digitalium-violet/10 blur-2xl animate-float"
       style={{ animationDelay: "1.5s" }} />
</div>
```

### 10.5 Pattern Bouton CTA
```tsx
{/* CTA Primaire */}
<Button
  size="lg"
  className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-all text-lg px-8 h-14 shadow-lg shadow-digitalium-blue/20"
>
  Label <ArrowRight className="ml-2 h-5 w-5" />
</Button>

{/* CTA Secondaire */}
<Button
  size="lg"
  variant="outline"
  className="text-lg px-8 h-14 border-white/10 hover:bg-white/5"
>
  <Play className="mr-2 h-5 w-5" /> Label
</Button>
```

---

## 11. Pages Secondaires

### 11.1 SolutionPageTemplate (Template réutilisable)

Utilisé par : `/solutions/administrations`, `/solutions/entreprises`, `/solutions/organismes`

**Architecture du template :**
```
SolutionNavbar       → même style que Navbar principale
HeroBlock            → Badge + Titre gradient + Image bg + CTAs
ModulesBlock         → Grille de cartes modules
AdvantagesBlock      → Grille 2x2 d'avantages
TarifsBlock          → 3 plans de pricing (avec toggle mensuel/annuel)
TestimonialsBlock    → Carousel de témoignages (3 cartes)
FAQBlock             → Accordion FAQ animé
FinalCTABlock        → CTA final avec image + badge confiance
FooterSection        → Footer standard
```

**Data-driven :** Chaque page passe un objet `SolutionPageData` au template :
```ts
interface SolutionPageData {
  heroIcon: LucideIcon;
  heroBadge: string;
  heroTitle: string;
  heroTitleGradient: string;
  heroSubtitle: string;
  heroGradient: string;        // ex: "from-amber-500/15 to-orange-500/5"
  heroImage?: string;
  modules: SolutionModule[];
  advantages: SolutionAdvantage[];
  pricing: SolutionPricingPlan[];
  testimonials: SolutionTestimonial[];
  faqs: SolutionFAQ[];
  ctaTitle: string;
  ctaTitleGradient: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
}
```

### 11.2 Guide d'utilisation (page interactive)

**Architecture :**
```
GuideNavbar          → Style identique
Hero Section         → Badge + Titre + Orbes + cortex-grid
Progress Bar         → Barre animée gradient
Sidebar (desktop)    → Liste d'étapes (StepIndicator) avec état actif/complété
MobileStepDots       → Dots de navigation (mobile)
StepContent Panel    → Contenu animé (AnimatePresence mode="wait")
Navigation Buttons   → Précédent/Suivant avec gradient
FooterSection        → Footer standard
```

**Pattern StepIndicator :**
- Actif : `.glass-card border border-white/10 shadow-lg` + couleur thématique
- Complété : `bg-emerald-500/20` + icône Check verte
- Inactif : `opacity-60`

---

## 12. Responsive & Mobile

### 12.1 Breakpoints utilisés

| Breakpoint | Usage |
|---|---|
| **sm** (640px) | Boutons CTA en row, toggles visibles |
| **md** (768px) | Nav desktop, grids multi-colonnes, layout split |
| **lg** (1024px) | Images décoratives, grid 4 colonnes, sidebar guide |
| **xl** (1280px) | Tagline logo visible |

### 12.2 Patterns responsive récurrents

```
grid-cols-1 md:grid-cols-2     → Cards modules, security pillars
grid-cols-1 md:grid-cols-3     → Problem cards
grid-cols-1 md:grid-cols-4     → Journey timeline
grid-cols-2 md:grid-cols-5     → Footer columns
flex flex-col sm:flex-row      → CTA buttons
flex flex-col md:flex-row      → CTA final (image+texte), Guide
hidden md:flex                 → Nav links desktop
hidden md:block                → Progress line, Sidebar
md:hidden                      → Hamburger, MobileStepDots
hidden sm:flex                 → Theme/Language toggles desktop
sm:hidden                      → Theme/Language toggles in mobile menu
hidden xl:inline-block         → Logo tagline
hidden lg:block                → Step indicator subtitle, background images
```

### 12.3 Menu Mobile
- Bouton Hamburger : `md:hidden w-10 h-10 rounded-xl bg-white/5`
- Modal plein écran : `AnimatePresence` + backdrop `bg-black/60 backdrop-blur-sm`
- Card menu : `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6`
- Links animés séquentiellement (`delay: index * 0.05`)
- CTAs : `w-full h-11 rounded-xl` avec gradient

---

## 13. Performance & Optimisation

### 13.1 Code Splitting (Lazy Loading)

```tsx
// Above the fold — chargé immédiatement
import HeroSection from "@/components/sections/HeroSection";

// Below the fold — lazy loaded
const ProblemSection  = lazy(() => import("@/components/sections/ProblemSection"));
const ServicesSection = lazy(() => import("@/components/sections/ServicesSection"));
const JourneySection  = lazy(() => import("@/components/sections/JourneySection"));
const FinalCTASection = lazy(() => import("@/components/sections/FinalCTASection"));
const FooterSection   = lazy(() => import("@/components/sections/FooterSection"));

// Auth modals — lazy loaded
const LoginModal    = lazy(() => import("@/components/auth/LoginModal"));
const RegisterModal = lazy(() => import("@/components/auth/RegisterModal"));
```

### 13.2 Suspense Boundaries

```tsx
{/* Sections below fold */}
<Suspense fallback={<SectionSkeleton />}>
  <ProblemSection />
  <ServicesSection />
  ...
</Suspense>

{/* Auth modals — no visible fallback */}
<Suspense fallback={null}>
  <LoginModal ... />
  <RegisterModal ... />
</Suspense>
```

### 13.3 SectionSkeleton (minimal CLS)
```tsx
function SectionSkeleton() {
  return <div className="w-full min-h-[200px]" aria-hidden="true" />;
}
```

### 13.4 Images
- `next/image` partout (WebP auto, lazy-load, srcset)
- `priority` sur l'image Hero uniquement
- `fill` + `object-cover` pour les backgrounds
- Overlay gradients pour assurer lisibilité du texte

### 13.5 Dynamic Import (SSR disabled)
```tsx
const DemoAccountSwitcher = dynamic(
  () => import("@/components/shared/DemoAccountSwitcher"),
  { ssr: false }
);
```

### 13.6 Viewport-triggered animations
```tsx
viewport={{ once: true }}  // Animation jouée une seule fois au scroll
```

---

## 14. SEO & Metadata

### 14.1 Metadata Root Layout

```tsx
export const metadata: Metadata = {
  title: "BRAND — Tagline",
  description: "Description complète...",
  keywords: ["mot-clé1", "mot-clé2", ...],
  authors: [{ name: "BRAND" }],
  creator: "BRAND",
  publisher: "BRAND",
  metadataBase: new URL("https://domain.com"),
  openGraph: {
    type: "website",
    locale: "fr_GA",
    url: "https://domain.com",
    siteName: "BRAND",
    title: "...",
    description: "...",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "..." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
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
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};
```

### 14.2 HTML Root
```tsx
<html lang="fr" suppressHydrationWarning>
  <body className={`${inter.variable} font-sans antialiased`}>
    <Providers>
      {children}
    </Providers>
    <Toaster position="bottom-left" toastOptions={{ className: "glass-card" }} />
  </body>
</html>
```

---

## 🧩 Résumé — Checklist d'Implémentation

Pour répliquer ce design dans un autre projet :

1. ☐ **Installer les dépendances** : Next.js 14, Tailwind CSS, Shadcn/ui, Framer Motion, Lucide React, Sonner
2. ☐ **Configurer `tailwind.config.ts`** : copier les couleurs custom, keyframes, animations, border-radius
3. ☐ **Créer `globals.css`** : copier les CSS variables (light/dark), les classes `.glass*`, `.text-gradient`, `.shimmer`, etc.
4. ☐ **Configurer la police Inter** via `next/font/google` + variable CSS `--font-inter`
5. ☐ **Créer les Providers** : ThemeProvider (dark mode toggle), AuthProvider
6. ☐ **Implémenter le layout racine** : metadata SEO, Toaster, Providers wrapper
7. ☐ **Construire la Navbar** : fixed, glass, responsive avec menu mobile AnimatePresence
8. ☐ **Construire les sections** dans l'ordre : Hero → Problem → Services → Journey → CTA → Footer
9. ☐ **Appliquer les patterns d'animation** : fade-in-up, stagger, whileInView, spring
10. ☐ **Lazy-load** toutes les sections below-the-fold + modals
11. ☐ **Générer les images** nécessaires (hero bg, security, sections, CTA promo)
12. ☐ **Créer le template SolutionPage** pour les sous-pages data-driven
13. ☐ **Tester le responsive** : mobile menu, grids, breakpoints
14. ☐ **Vérifier le dark/light mode** avec les tokens CSS variables
