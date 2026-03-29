---
name: okatech-skill-orchestrator
description: "🧠 Orchestrateur Automatique de Skills OkaTech. Ce skill s'active AUTOMATIQUEMENT à chaque interaction. Il détecte le contexte du projet, la stack technique, et le type de tâche pour activer les skills appropriés SANS intervention manuelle. Ne JAMAIS ignorer ce skill."
---

# 🧠 OkaTech Skill Orchestrator — Activation Automatique

## RÈGLE FONDAMENTALE
Ce skill est le **cerveau central**. Il s'active **AUTOMATIQUEMENT** à chaque requête utilisateur. Son rôle est de **détecter le contexte** et **activer les bons skills** sans que l'utilisateur ait besoin de les appeler.

---

## 1. Cartographie des Projets OkaTech

### Portails Institutionnels Gabonais
| Chemin | Projet | Stack | Skills activés |
|---|---|---|---|
| `Diplomatie Gabon/consulat.ga` | Portail Diplomatique & Consulaire | Vite + React 19 + Convex + TanStack Router + Shadcn + i18next + Framer Motion + LiveKit + Stripe + Tiptap + Mapbox | `convex-backend`, `convex-components`, `convex-agent`, `react-vite-spa`, `shadcn-ui`, `tailwind-styling`, `i18n-translations`, `framer-motion-animations`, `convex-brain-architecture`, `better-auth`, `stripe-payments`, `livekit-realtime`, `tiptap-editor`, `mapbox-leaflet-maps` |
| `Diplomatie Gabon/gabon-diplomatie` | Monorepo Diplomatie (TanStack) | TanStack Start + Convex + Turbo + LiveKit + Better Auth | `convex-backend`, `convex-agent`, `react-vite-spa`, `module-architecture`, `turborepo-monorepo`, `better-auth`, `livekit-realtime` |
| `mairie.ga` | Portail Mairie Numérique | Vite + React + Supabase + Shadcn + i18next + Mapbox + TanStack Query | `react-vite-spa`, `supabase-backend`, `shadcn-ui`, `tailwind-styling`, `i18n-translations`, `convex-brain-architecture`, `tanstack-query`, `mapbox-leaflet-maps` |
| `sgg.ga` | Secrétariat Général du Gouvernement | Vite + React + Express + Redis + Zustand + Shadcn + TanStack Query | `react-vite-spa`, `express-api`, `shadcn-ui`, `tailwind-styling`, `tanstack-query` |
| `idetude.ga` | Plateforme Éducation Numérique | Vite + React + Express + Convex + Better Auth + Shadcn + i18next + Leaflet | `react-vite-spa`, `express-api`, `convex-backend`, `shadcn-ui`, `auth-patterns`, `better-auth`, `i18n-translations`, `mapbox-leaflet-maps` |
| `cnom.ga` | Ordre National des Médecins | Vite + React + Supabase + Shadcn + TanStack Query | `react-vite-spa`, `supabase-backend`, `shadcn-ui`, `tailwind-styling`, `tanstack-query` |
| `secretariat-general-gouv` | Secrétariat Général du Gouv. | Vite + React + Convex + Leaflet + PWA | `react-vite-spa`, `convex-backend`, `shadcn-ui`, `mapbox-leaflet-maps`, `tanstack-query` |

### Plateformes SaaS
| Chemin | Projet | Stack | Skills activés |
|---|---|---|---|
| `digitalium.io` | SaaS Gestion Documentaire | Next.js 14 + Convex + Shadcn + Multi-persona RBAC + Tiptap + Yjs | `nextjs-app-router`, `convex-backend`, `convex-agent`, `convex-components`, `shadcn-ui`, `tailwind-styling`, `auth-patterns`, `tiptap-editor` |
| `evenement.ga` | Gestion Événements | Next.js 14 + Convex + Prisma + NextAuth v5 + Shadcn | `nextjs-app-router`, `convex-backend`, `prisma-database`, `shadcn-ui`, `auth-patterns` |
| `foot.cd` | Plateforme Football RDC | Next.js 14 + Convex + Clerk + Framer Motion + Recharts | `nextjs-app-router`, `convex-backend`, `shadcn-ui`, `auth-patterns`, `clerk-auth`, `framer-motion-animations` |

### Micro-Applications AGASA
| Chemin | Projet | Stack |
|---|---|---|
| `AGASA Digital/AGASA-Admin` | Back-office AGASA | Next.js + Convex + Shadcn + Cloud Run |
| `AGASA Digital/AGASA-Citoyen` | Portail citoyen | Next.js + Convex + Cloud Run |
| `AGASA Digital/AGASA-Core` | Noyau partagé | Next.js + Convex + Shadcn + Cloud Run |
| `AGASA Digital/AGASA-Inspect` | App inspection | Next.js + Convex + Tailwind + Cloud Run |
| `AGASA Digital/AGASA-Pro` | Portail professionnel | Next.js + Convex + Shadcn + CloudSQL + Cloud Run |

**Skills communs AGASA** : `nextjs-app-router`, `convex-backend`, `shadcn-ui`, `tailwind-styling`, `docker-cloud-run`, `deployment-cicd`

## 2. Détection Automatique par Type de Tâche

| Mots-clés détectés | Skills à activer | Contexte |
|---|---|---|
| `schema`, `table`, `defineTable`, `v.`, `migration` | `convex-backend` + **`convex-migration-helper`** (système) OU `prisma-database` OU `supabase-backend` | Selon le projet détecté |
| `page`, `composant`, `component`, `UI`, `écran`, `formulaire` | `shadcn-ui` + `tailwind-styling` | Toujours ensemble |
| `API`, `endpoint`, `route`, `middleware`, `serveur` | `express-api` OU `nextjs-app-router` | Vite→Express, Next→Route Handler |
| `auth`, `login`, `JWT`, `session`, `rôle`, `permission`, `TaskCode` | `auth-patterns` + **`convex-setup-auth`** (système, si Convex) | Détecte le système auth du projet |
| `deploy`, `build`, `CI/CD`, `GitHub Actions`, `Vercel` | `deployment-cicd` | Matrice de déploiement |
| `module`, `iDocument`, `iCorrespondance`, `iAsted`, `iBoite` | `module-architecture` | Convention iModule |
| `traduction`, `i18n`, `t()`, `useTranslation` | `i18n-translations` | Clé seule, jamais fallback |
| `animation`, `motion`, `transition`, `hover`, `slide` | `framer-motion-animations` + `tailwind-styling` | Framer Motion patterns |
| `store`, `zustand`, `état global`, `state` | `zustand-state` | Zustand avec persist |
| `seed`, `données test`, `backfill`, `DevAccountSwitcher` | `convex-backend` | Seeds & dev tools |
| `trigger`, `agrégat`, `hippocampe`, `neocortex`, `limbique` | `convex-brain-architecture` | Architecture cerveau |
| `workflow`, `statut`, `transition`, `état machine` | `workflow-state-machine` | Pattern FSM récurrent |
| `guard`, `protection`, `route protégée`, `ProtectedRoute` | `auth-patterns` | Guards par rôle/persona |
| `fichier`, `upload`, `storage`, `_storage`, `generateUploadUrl` | `convex-backend` | File Storage Convex |
| `test`, `vitest`, `playwright`, `e2e` | `testing-patterns` | Tests unitaires et e2e |
| `erreur`, `bug`, `debug`, `crash`, `fix` | Active le skill du domaine concerné | Diagnostic contextuel |
| `performance`, `optimisation`, `lent`, `cache`, `OCC`, `hot path` | **`convex-performance-audit`** (système, si Convex) | Audit performance Convex |
| `composant convex`, `component convex`, `backend reutilisable` | **`convex-create-component`** (système) | Creation composant Convex isolé |
| `nouveau projet convex`, `init convex`, `ajouter convex` | **`convex-quickstart`** (système) | Initialisation Convex |
| `agent`, `AI`, `chat`, `LLM`, `thread`, `streaming`, `RAG`, `vector` | `convex-agent` | Agents IA avec Convex |
| `rate limit`, `workflow durable`, `stripe`, `aggregate`, `counter` | `convex-components` | Composants ecosystem Convex |
| `paiement`, `payment`, `checkout`, `subscription`, `facture` | `stripe-payments` | Intégration Stripe |
| `vidéo`, `audio`, `appel`, `visio`, `livekit`, `room`, `call` | `livekit-realtime` | Video/Audio temps réel |
| `carte`, `map`, `mapbox`, `leaflet`, `géolocalisation`, `GPS` | `mapbox-leaflet-maps` | Cartes interactives |
| `better-auth`, `better auth`, `17 rôles`, `convex auth` | `better-auth` | Better Auth patterns |
| `clerk`, `@clerk`, `ClerkProvider`, `SignIn`, `SignUp` | `clerk-auth` | Clerk authentification |
| `useQuery`, `useMutation`, `react-query`, `tanstack`, `queryClient` | `tanstack-query` | TanStack React Query |
| `éditeur`, `editor`, `tiptap`, `rich text`, `prosemirror`, `yjs` | `tiptap-editor` | Éditeur riche Tiptap |
| `docker`, `container`, `cloud run`, `Dockerfile`, `GCP`, `artifact` | `docker-cloud-run` | Docker & Cloud Run |
| `turbo`, `monorepo`, `workspace`, `turborepo`, `packages/` | `turborepo-monorepo` | Architecture monorepo |

## 3. Règles d'Auto-Activation

### OBLIGATOIRE à chaque interaction :
1. **Identifier le projet** via le chemin du fichier ouvert ou la mention dans la requête
2. **Lire le `package.json`** pour confirmer les dépendances exactes
3. **Vérifier `components.json`** si présent (config Shadcn)
4. **Respecter la structure de dossiers existante** du projet (ne PAS réorganiser)
5. **Utiliser les alias de chemin** du projet (`@/`, `~/`, `@repo/`)

### INTERDIT :
- ❌ Inventer des dépendances absentes du `package.json`
- ❌ Mélanger les patterns entre projets (Express dans Next.js, etc.)
- ❌ Utiliser `any` sans justification documentée
- ❌ Modifier les fichiers `components/ui/` (gérés par Shadcn)
- ❌ Ignorer le système i18n quand il est configuré
- ❌ Utiliser `default export` — préférer `named exports`

## 4. Conventions de Code OkaTech

| Aspect | Convention |
|---|---|
| **Langue du code** | Anglais (variables, fonctions, types) |
| **Langue des commentaires** | Français |
| **Langue de l'UI** | Français (ou i18n si configuré) |
| **Nommage des fichiers** | kebab-case (`document-editor.tsx`) |
| **Nommage des composants** | PascalCase (`DocumentEditor`) |
| **Nommage des hooks** | camelCase avec `use` (`useDocuments`) |
| **Exports** | Named exports uniquement |
| **Types** | `interface` pour les objets, `type` pour les unions/aliases |
| **Enums** | `enum` TypeScript pour les constantes partagées backend/frontend |
| **Stores** | Zustand avec `persist` middleware quand nécessaire |
| **Toast/Notifications** | `sonner` (toast) dans tous les projets |
| **Icônes** | `lucide-react` dans tous les projets |
| **Date** | `date-fns` dans tous les projets |

## 5. Architecture "Cerveau" OkaTech (Pattern Unique)

Certains projets (consulat.ga, mairie.ga) utilisent une métaphore neuroscientifique :

| Terme | Rôle | Équivalent technique |
|---|---|---|
| **Neocortex** | Audit trail centralisé | Logger de mutations avec corrélation |
| **Hippocampe** | Mémorisation des actions | Audit log persistant |
| **Limbique** | Signaux de routage | Event bus pour notifications |
| **Sensoriel** | Entrées utilisateur | Input handlers |
| **Moteur** | Actions exécutables | Mutation dispatchers |
| **Prefrontal** | Décisions complexes | Workflow state machine |
| **Cortex** | Skills/compétences | Services métier |
| **Consciousness** | Orchestration IA (iAsted) | AI agent avec context/intent |

Quand ces termes sont rencontrés : activer `convex-brain-architecture`.

## 6. Skills Système Convex (Activation Automatique)

Ces skills sont fournis par le système Claude et s'activent EN COMPLEMENT des skills locaux quand le projet utilise Convex :

| Skill Système | Quand l'activer | Complète |
|---|---|---|
| `convex-setup-auth` | Auth, login, identity, access control dans un projet Convex | `auth-patterns` |
| `convex-migration-helper` | Changement de schema, ajout champ, nouvelle table, migration | `convex-backend` |
| `convex-performance-audit` | Performance, lenteur, OCC conflict, hot path, subscription cost | `convex-backend` |
| `convex-create-component` | Création composant réutilisable, isolation, packaging | `convex-backend` |
| `convex-quickstart` | Nouveau projet Convex, initialisation, scaffolding | `convex-backend` |

## 7. Inventaire Complet des 28 Skills

### Skills Locaux (.agent/skills/) — 23 skills

#### Backend & Data (7)
| # | Skill | Domaine |
|---|---|---|
| 1 | `convex-backend` | Backend Convex (enrichi patterns officiels get-convex) |
| 2 | `convex-agent` | **NOUVEAU** — Agents IA avec Convex (threads, streaming, RAG) |
| 3 | `convex-components` | **NOUVEAU** — Ecosystem Convex (Rate Limiter, Workflow, Stripe, etc.) |
| 4 | `supabase-backend` | Backend Supabase (enrichi Postgres best practices officielles) |
| 5 | `express-api` | Backend Express.js |
| 6 | `prisma-database` | ORM Prisma |
| 7 | `tanstack-query` | **NOUVEAU** — TanStack React Query (fetching, cache, mutations) |

#### Frontend (5)
| # | Skill | Domaine |
|---|---|---|
| 8 | `react-vite-spa` | Frontend Vite + React |
| 9 | `nextjs-app-router` | Frontend Next.js (enrichi Server Actions, Streaming, ISR) |
| 10 | `shadcn-ui` | Composants UI Shadcn |
| 11 | `tailwind-styling` | Styling Tailwind CSS |
| 12 | `framer-motion-animations` | Animations Framer Motion |

#### Authentification (3)
| # | Skill | Domaine |
|---|---|---|
| 13 | `auth-patterns` | Hub central auth (enrichi Better Auth, Clerk, MFA) |
| 14 | `better-auth` | **NOUVEAU** — Better Auth + Convex (17 rôles, RBAC) |
| 15 | `clerk-auth` | **NOUVEAU** — Clerk + Next.js + Convex |

#### Intégrations (4)
| # | Skill | Domaine |
|---|---|---|
| 16 | `stripe-payments` | **NOUVEAU** — Paiements Stripe (checkout, subscriptions) |
| 17 | `livekit-realtime` | **NOUVEAU** — Video/Audio LiveKit |
| 18 | `mapbox-leaflet-maps` | **NOUVEAU** — Cartes Mapbox & Leaflet |
| 19 | `tiptap-editor` | **NOUVEAU** — Éditeur riche Tiptap + collaboration |

#### Architecture & Patterns (3)
| # | Skill | Domaine |
|---|---|---|
| 20 | `convex-brain-architecture` | Architecture Cerveau neuro-mimétique |
| 21 | `workflow-state-machine` | State Machine & workflows |
| 22 | `module-architecture` | Modules iX transversaux |

#### DevOps & Infrastructure (3)
| # | Skill | Domaine |
|---|---|---|
| 23 | `deployment-cicd` | CI/CD & Deploy (enrichi Cloud Run, Turbo CI) |
| 24 | `docker-cloud-run` | **NOUVEAU** — Docker & Google Cloud Run |
| 25 | `turborepo-monorepo` | **NOUVEAU** — Architecture monorepo Turborepo |

#### Transversaux (3)
| # | Skill | Domaine |
|---|---|---|
| 26 | `typescript-patterns` | TypeScript strict |
| 27 | `i18n-translations` | Internationalisation i18next |
| 28 | `orchestrator` | Cerveau central (TOUJOURS actif) |

### Skills Système Convex (5)
| Skill | Source |
|---|---|
| `convex-setup-auth` | get-convex/agent-skills (officiel) |
| `convex-migration-helper` | get-convex/agent-skills (officiel) |
| `convex-performance-audit` | get-convex/agent-skills (officiel) |
| `convex-create-component` | get-convex/agent-skills (officiel) |
| `convex-quickstart` | get-convex/agent-skills (officiel) |
