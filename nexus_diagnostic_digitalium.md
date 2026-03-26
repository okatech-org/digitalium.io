# 🔬 DIAGNOSTIC NEXUS SYSTEM — DIGITALIUM.IO

---

## Étape 1 — Scan Express

### [package.json](file:///Users/okatech/okatech-projects/digitalium.io/package.json)
- **Framework** : Next.js 14.2.35 (App Router)
- **Runtime** : React 18, TypeScript 5
- **Backend** : Convex 1.31.7 (temps réel)
- **Auth** : Firebase (firebase 12.9.0 + firebase-admin)
- **BDD externe** : Supabase (supabase-js 2.95.3) + PostgreSQL (pg 8.18.0)
- **Styling** : TailwindCSS 3.4.1 + tailwindcss-animate
- **UI** : Radix UI (13 primitives), lucide-react, framer-motion
- **Éditeur** : Tiptap (18 extensions + Yjs collaboration)
- **AI** : @google/generative-ai (Gemini)
- **Export** : html2pdf.js, xlsx, mammoth
- **DnD** : @dnd-kit (core + sortable)
- **Charts** : Recharts
- **Validation** : Zod 4
- **Tests** : Playwright (E2E)
- **Scripts** : `dev`, `build`, [start](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/RetentionCategoryTable.tsx#117-121), `lint`, `test:e2e`

### Fichiers par type

| Type | Nombre |
|------|--------|
| [.ts](file:///Users/okatech/okatech-projects/digitalium.io/next-env.d.ts) + [.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/ui/skeleton.tsx) | 333 |
| Pages ([page.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/app/%28admin%29/admin/iam/page.tsx)) | 127 |
| Layouts (`layout.tsx`) | 18 |
| Composants (`src/components/`) | 113 |
| Backend Convex (`convex/*.ts`) | 43 |

### Routes/Pages (127) — 5 espaces

| Espace | Pages | Préfixe |
|--------|-------|---------|
| **Admin** (SysAdmin) | 31 | `/admin/*` |
| **Institutional** | 27 | `/institutional/*` |
| **Pro** | 30 | `/pro/*` |
| **SubAdmin** | 25 | `/subadmin/*` |
| **Public** | 7 | `/`, `/guide`, `/solutions/*`, `/verify/*` |
| **Auth** | 2 | `/login`, `/register` |
| **Onboarding** | 2 | `/onboarding/business`, `/onboarding/institution` |
| **Org Portal** | 1 | `/org/[domain]` |
| **Shared (error)** | 2 | error + layouts |

### Backend Convex (43 fichiers)
`aiSmartImport`, `archiveBridge`, `archiveConfig`, `archives`, `auditLogs`, `automationEngine`, `businessRoles`, `cellAccessOverrides`, `cellAccessRules`, `clients`, `configPropagation`, `crons`, `dataRooms`, `demoAccounts`, `documentMetadataFields`, `documentTypes`, `documents`, `filingCells`, `filingStructures`, `fixArchiveData`, `fixLifecycleData`, `folderArchiveMetadata`, `folders`, `generateDemoAccounts`, `iasted`, `leads`, `lifecycleScheduler`, `notifications`, `orgMembers`, `orgSites`, `orgUnits`, `org_lifecycle`, `organizations`, `payments`, `permissionGroups`, `retentionAlerts`, `schema`, `seed`, `seedLeads`, `signatureWorkflows`, `signatures`, `subscriptions`, `users`

### NEOCORTEX
- Fichiers bio-inspirés (`limbique`, `hippocampe`, `signaux`, `plasticite`, `prefrontal`) : **❌ Aucun détecté**
- Score NEOCORTEX : **0%**

### Auth
- **Firebase Auth** (6 vars env FIREBASE, `src/lib/firebase.ts`, `src/lib/adminService.ts`)
- Pas de Clerk

### BDD externe
- **Supabase** (`src/lib/supabase.ts`, 2 vars env SUPABASE)
- **PostgreSQL** (dépendance `pg`, type `@types/pg`)
- Architecture hybride : **Oui** (Convex temps réel + Supabase/PostgreSQL)

### Sous-systèmes détectés (15+)

| # | Sous-système | Fichiers backend |
|---|-------------|-----------------|
| 1 | 📄 Documents (iDocument) | `documents`, `folders`, `documentTypes`, `documentMetadataFields` |
| 2 | 🗄 Archives (iArchive) | `archives`, `archiveConfig`, `archiveBridge`, `dataRooms`, `retentionAlerts`, `folderArchiveMetadata` |
| 3 | ✍️ Signatures (iSignature) | `signatures`, `signatureWorkflows` |
| 4 | 📊 iAsted | `iasted` |
| 5 | 🏢 Organisations | `organizations`, `orgMembers`, `orgSites`, `orgUnits`, `org_lifecycle` |
| 6 | 📁 Classement | `filingCells`, `filingStructures`, `cellAccessOverrides`, `cellAccessRules` |
| 7 | 👥 Leads & Clients | `leads`, `clients`, `seedLeads` |
| 8 | 💳 Paiements | `payments`, `subscriptions` |
| 9 | 🔔 Notifications | `notifications` |
| 10 | 📋 Audit | `auditLogs` |
| 11 | 🤖 AI Import | `aiSmartImport` |
| 12 | ⚙️ Automatisation | `automationEngine`, `configPropagation` |
| 13 | 🔐 IAM & Permissions | `users`, `businessRoles`, `permissionGroups` |
| 14 | ⏰ Lifecycle | `lifecycleScheduler`, `fixLifecycleData` |
| 15 | 🌱 Seed & Demo | `seed`, `seedLeads`, `demoAccounts`, `generateDemoAccounts` |

---

## Étape 2 — Indicateurs

```yaml
📊 INDICATEURS PROJET

Nom du projet           : DIGITALIUM.IO
Stack frontend          : Next.js 14 (App Router) + React 18 + TailwindCSS + Radix UI + Framer Motion
Backend                 : Convex 1.31.7 (temps réel) + Firebase Auth + Supabase/PostgreSQL
Auth                    : Firebase Authentication

MÉTRIQUES DE TAILLE
  Pages / Routes        : 127
  Composants            : 113
  Entités / Tables      : 34
  Mutations backend     : 161
  Queries backend       : 113
  Total fichiers .ts/.tsx: 333

COMPLEXITÉ
  Sous-systèmes détectés : 15+ (documents, archives, signatures, iasted, organisations, 
                           classement, leads/clients, paiements, notifications, audit, 
                           AI import, automatisation, IAM, lifecycle, seed/demo)
  BDD externe            : Oui (Supabase + PostgreSQL via pg)
  Architecture hybride   : Oui (Convex + Supabase/PostgreSQL)
  Souveraineté données   : Requise (archivage numérique d'entreprise/admin)
  Temps réel requis      : Oui (Convex natif, Tiptap/Yjs collaboration)
  Multi-rôles            : Oui (system_admin, platform_admin, admin, subadmin, institutional, pro, membre)

NEOCORTEX EXISTANT
  Dossier convex/ présent          : Oui (43 fichiers)
  Fichiers bio-inspirés détectés   : Aucun
  Signaux pondérés implémentés     : Non
  Score NEOCORTEX estimé           : 0%
```

---

## Étape 3 — Arbre de Décision

```
Le projet a-t-il une BDD souveraine (PostgreSQL Hub) ou une architecture hybride ?
├── ✅ OUI → Supabase + PostgreSQL (pg) en plus de Convex
└── → 🔴 OMEGA
```

**Stop — Première condition satisfaite.**

Confirmations supplémentaires :
- ✅ > 30 pages (127 pages) → OMEGA
- ✅ > 15 entités (34 tables) → OMEGA
- ✅ > 30 mutations (161 mutations) → OMEGA
- ✅ 15+ sous-systèmes → OMEGA
- ✅ Multi-rôles (7 niveaux) → OMEGA
- ✅ Souveraineté données requise → OMEGA

**Tous les critères pointent unanimement vers OMEGA.**

---

## Étape 4 — Recommandation

```
╔══════════════════════════════════════════════════════════════╗
║                  🔬 DIAGNOSTIC NEXUS SYSTEM                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Projet        : DIGITALIUM.IO                               ║
║  Stack         : Next.js 14 + Convex + Supabase/PostgreSQL   ║
║                                                              ║
║  MÉTRIQUES                                                   ║
║  Pages         : 127    Entités     : 34                     ║
║  Mutations     : 161    Sous-syst.  : 15+                    ║
║  NEOCORTEX     : 0%     Hybride     : Oui                    ║
║                                                              ║
║  ══════════════════════════════════════════════════════════   ║
║                                                              ║
║  RECOMMANDATION :  🔴 OMEGA                                  ║
║                                                              ║
║  ══════════════════════════════════════════════════════════   ║
║                                                              ║
║  RAISONS :                                                   ║
║  1. Architecture hybride Convex + Supabase/PostgreSQL        ║
║     avec souveraineté des données requise                    ║
║  2. 127 pages, 34 entités, 161 mutations — dépasse tous     ║
║     les seuils OMEGA (>30 pages, >15 entités, >30 mut.)     ║
║  3. 15+ sous-systèmes complexes avec 4 espaces utilisateurs ║
║     distincts (Admin, SubAdmin, Institutional, Pro) et       ║
║     7 niveaux de rôles                                       ║
║                                                              ║
║  MODULES À UTILISER :                                        ║
║  M1 → Immersion Totale & Architecture                       ║
║  M2 → NEOCORTEX Full Backend (12 cortex)                     ║
║  M3 → Frontend & Espaces Utilisateurs Complets               ║
║  M4 → Infrastructure, BDD & Souveraineté                     ║
║  M5 → Nettoyage & Production                                ║
║                                                              ║
║  ESTIMATION EFFORT :                                         ║
║  Sprints estimés : 8-12 sprints                              ║
║  Complexité      : Élevée                                    ║
║  Risques         :                                           ║
║  - NEOCORTEX à 0% : tout le système nerveux est à construire ║
║  - Hybride Convex/Supabase mal défini (rôles flous)         ║
║  - 4 espaces quasi-dupliqués (pro ≈ institutional ≈ subadmin)║
║  - Firebase Auth non-standard dans écosystème Convex         ║
║  - Composants UI massifs (>1000 LoC dans certains fichiers)  ║
║                                                              ║
║  PAR OÙ COMMENCER :                                         ║
║  → Coller le module NEXUS-OMEGA-M1 (Immersion-Architecture) ║
║    avec le contexte projet pré-rempli ci-dessous.            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Étape 5 — Contexte Projet Pré-rempli pour NEXUS-OMEGA-M1

```markdown
## CONTEXTE PROJET (pré-rempli par le diagnostic)

Nom             : DIGITALIUM.IO
Stack frontend  : Next.js 14.2.35 (App Router) + React 18 + TailwindCSS 3.4 + Radix UI + Framer Motion + Tiptap (Yjs collab)
Backend         : Convex 1.31.7 (43 fichiers, 161 mutations, 113 queries)
BDD             : Convex (temps réel, 34 tables) + Supabase + PostgreSQL (pg) — Architecture hybride
Auth            : Firebase Authentication (firebase 12.9.0 + firebase-admin 13.6.1)
État            : ~70% fonctionnel — Backend Convex solide, frontend réactif mais avec des zones mortes
Fonctionne      : 
  - Backend Convex complet (archives, documents, signatures, organisations, classement, IAM, lifecycle, paiements)
  - 4 espaces utilisateurs (admin, subadmin, institutional, pro) avec layouts et navigation
  - Module iDocument (éditeur Tiptap, file manager, import AI)
  - Module iArchive (6 sous-onglets, catégories OHADA, calendrier rétention, versionnage politiques)
  - Module iSignature (workflows, pending, certificats)
  - Organisation config wizard (6 étapes : Profil, Structure Org, Classement, Modules, Automatisation, Déploiement)
  - Système de leads/clients avec pipeline
  - Build Next.js fonctionnel (exit code 0)
Cassé/Manquant  :
  P0 (Bloquant) :
  - NEOCORTEX 0% — Aucun système nerveux bio-inspiré (limbique, hippocampe, signaux, plasticité, préfrontal)
  - Architecture hybride Convex/Supabase non-définie (les 2 existent, rôles pas clairs)
  - Plusieurs pages avec des `any` types et lint warnings
  P1 (Dégradé) :
  - Duplication importante entre espaces (pro ≈ institutional ≈ subadmin)
  - IAM page avec des `any` types (6+ lints non-résolus)
  - OCR stub uniquement (pas d'extraction image réelle)
  - Convex hot-reload popup bloque certaines interactions dev
  P2 (Absent) :
  - Tests E2E (Playwright configuré mais pas de tests écrits)
  - i18n (contenu en français uniquement)
  - Chat/messaging temps réel
  - Monitoring/observabilité production
  - CI/CD pipeline
Priorité        : P0 d'abord → Architecture hybride + NEOCORTEX → puis P1 → puis P2
```
