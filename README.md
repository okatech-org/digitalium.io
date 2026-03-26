# DIGITALIUM.IO

> Plateforme SaaS de gestion documentaire, archivage légal et signature électronique pour les organisations africaines.

## 🏗 Architecture

| Couche | Technologie |
|--------|------------|
| **Frontend** | Next.js 14 (App Router) + TailwindCSS + Radix UI |
| **Backend** | Convex (serverless functions + real-time DB) |
| **Auth** | Firebase Authentication |
| **Storage** | Convex File Storage |
| **AI** | Google Gemini (iAsted module) |

## 📦 Modules

- **iDocument** — Éditeur collaboratif TipTap + gestion de dossiers
- **iArchive** — Archivage légal OHADA avec double hash SHA-256 et certificats
- **iSignature** — Workflows de signature électronique
- **iAsted** — Assistant IA (OCR, résumés, analytics)

## 🧪 Démarrage

```bash
# Installation
npm install

# Lancer Convex (dans un terminal séparé)
npx convex dev

# Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

## 🔐 Authentification

Le projet utilise Firebase Auth avec un mode démo intégré pour le développement.
Les rôles sont résolus dynamiquement via la table `users` de Convex.

## 📁 Structure

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (admin)/           # Espace sysadmin
│   ├── (institutional)/   # Espace institutions
│   └── (pro)/             # Espace entreprises
├── components/            # Composants React (UI + modules)
├── config/                # Configuration RBAC, modules, orgs
├── contexts/              # React Contexts (Auth, Persona, Theme)
├── hooks/                 # Custom hooks
└── types/                 # TypeScript types
convex/
├── schema.ts              # 29 tables Convex
├── lib/                   # Helpers (auth, crypto, validators)
└── *.ts                   # Server functions (queries + mutations)
```

## 📄 Licence

Propriétaire — © OKA TECH
