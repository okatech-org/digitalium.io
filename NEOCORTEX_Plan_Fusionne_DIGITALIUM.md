# NEXUS-OMEGA — Plan d'Implémentation Fusionné — DIGITALIUM.IO

> **Diagnostic** : 🔴 OMEGA | **Modules** : 5 | **Sprints estimés** : 9-12
> **Score NEOCORTEX actuel** : 0% → Cible : 100%
> **Date** : 26 mars 2026

---

## PARTIE 1 — ANALYSE DES DIVERGENCES ENTRE LES PLANS

Cette section identifie les écarts significatifs entre les documents sources :
- **Plan A** : `implementation_plan_neocortex.md` + `task01.md`
- **Plan B** : `neocortex_plan_02.md` + `task02.md`
- **Diagnostic** : `nexus_diagnostic_digitalium.md`

### Divergence 1 — BDD Souveraine (CRITIQUE)

| Aspect | Plan A | Plan B |
|--------|--------|--------|
| **Cible souveraineté** | Supabase / PostgreSQL | Google Cloud SQL (PostgreSQL) |
| **Sync** | `syncVersPostgres` → Supabase | `syncVersPostgres` → Google Cloud SQL |
| **Polling** | Cron Supabase → Convex | PostgreSQL → Convex mapping |
| **Migrations** | Non mentionnées | Migrations PostgreSQL explicites |

**Impact** : C'est la divergence la plus critique. Les deux plans visent PostgreSQL comme hub souverain, mais l'hébergement diffère (Supabase managed vs. Google Cloud SQL self-managed). Cela affecte les coûts, la latence, la maintenance et la stratégie de backup.

**Recommandation fusionnée** : Décision à prendre AVANT le Sprint 7 (M4). Le code de sync (`syncVersPostgres`) est identique quel que soit l'hébergeur — seul le driver de connexion change. Préparer une abstraction de connexion PostgreSQL qui supporte les deux.

---

### Divergence 2 — Organisation du Frontend (M3)

| Aspect | Plan A | Plan B |
|--------|--------|--------|
| **Approche** | Par **espace utilisateur** (Admin 31p, SubAdmin 25p, Institutional 27p, Pro 30p) | Par **section fonctionnelle** (Profile, Settings, Dashboard, Subsystems) |
| **Avantage** | Couverture exhaustive page par page | Vision transversale, évite la duplication |

**Impact** : Plan A garantit que chaque page est visitée. Plan B identifie les patterns communs à factoriser.

**Recommandation fusionnée** : Adopter une approche hybride — organiser le travail par espace (Plan A) mais appliquer des patterns transversaux (Plan B) pour Profile, Settings et Dashboard qui sont quasi-identiques entre espaces.

---

### Divergence 3 — Éléments exclusifs à chaque plan

#### Présent uniquement dans Plan B (à intégrer)
- **PWA removal** comme tâche P0 explicite
- **Refactoring Profile** (Read, Edit, Avatar Upload, validation)
- **Refactoring Settings** (Personal, Security, Notifications, Appearance, Danger Zone)
- **Optimisation performance** (memos, lazy loading, indexed queries)
- **Security patches** explicites (pas de secrets côté client, headers sécurisés)
- **Migrations schema PostgreSQL** pour correspondre aux structures Convex
- **Rapport final OMEGA** comme livrable de clôture

#### Présent uniquement dans Plan A (à intégrer)
- **Score /10 par page** lors de l'audit M1
- **Responsive détaillé** : 320px mobile, 768px tablette, 1024px desktop
- **Design system** : mode sombre complet, palette cohérente, animations Framer Motion
- **Navigation** : max 3 clics, fil d'Ariane, page active, accessibilité clavier
- **Debounce** sur les formulaires
- **Avertissement Clerk** : les patterns référençant Clerk doivent être adaptés à Firebase

---

### Divergence 4 — Nombre de Cortex

| Plan A | Plan B |
|--------|--------|
| Mentionne "12 cortex" | Mentionne "12 cortex modules" |
| Liste effective : 8 cortex + monitoring + crons = **10 modules** | Liste : limbique, hippocampe, plasticité, préfrontal, sensoriel, visuel, auditif, moteur, crons, monitoring = **10 modules** |

**Conclusion** : Les deux plans convergent vers 10 modules effectifs. Le chiffre "12" semble inclure les fichiers fondations (`types.ts`, `validators.ts`) qui ne sont pas des cortex à proprement parler.

---

### Divergence 5 — Estimation Sprints

| Plan A | Plan B | Diagnostic |
|--------|--------|-----------|
| Sprint 0 à Sprint 9 = **10 sprints** | 8-12 sprints (non détaillés) | 8-12 sprints |

**Recommandation fusionnée** : 10-12 sprints réalistes (Sprint 0 audit + 9 sprints implémentation + 1-2 sprints buffer).

---

### Synthèse des Divergences

| # | Divergence | Sévérité | Statut |
|---|-----------|----------|--------|
| 1 | BDD Souveraine (Supabase vs Google Cloud SQL) | 🔴 CRITIQUE | Décision requise avant M4 |
| 2 | Organisation Frontend (par espace vs par section) | 🟡 MOYEN | Fusionné : approche hybride |
| 3 | Éléments exclusifs (PWA, Profile, Responsive...) | 🟢 MINEUR | Fusionné : tout intégré |
| 4 | Nombre de cortex (12 vs 10 effectifs) | 🟢 MINEUR | Clarifié : 10 modules |
| 5 | Estimation sprints | 🟢 MINEUR | Fusionné : 10-12 sprints |

---
---

## PARTIE 2 — PLAN D'IMPLÉMENTATION FUSIONNÉ

### Contexte Projet

- **Nom** : DIGITALIUM.IO
- **Stack Frontend** : Next.js 14.2.35 (App Router) + React 18 + TailwindCSS 3.4 + Radix UI + Framer Motion + Tiptap (Yjs collab)
- **Backend** : Convex 1.31.7 (43 fichiers, 161 mutations, 113 queries, 34 tables)
- **Auth** : Firebase Authentication (firebase 12.9.0 + firebase-admin 13.6.1)
- **BDD externe** : Supabase (supabase-js 2.95.3) + PostgreSQL (pg 8.18.0) — Architecture hybride
- **AI** : Google Gemini (@google/generative-ai)
- **Pages** : 127 pages réparties sur 5 espaces (Admin, SubAdmin, Institutional, Pro, Public)
- **Sous-systèmes** : 15+ (Documents, Archives, Signatures, iAsted, Organisations, Classement, Leads/Clients, Paiements, Notifications, Audit, AI Import, Automatisation, IAM, Lifecycle, Seed/Demo)
- **NEOCORTEX** : 0% — Tout le système nerveux bio-inspiré est à construire

---

## M1 — Immersion Totale & Architecture (Sprint 0)

Audit complet de l'existant. Aucun code produit, uniquement de l'analyse.

### 1.1 Audit Frontend Exhaustif (127 pages)

Scanner chaque route des 5 espaces. Pour chaque page, scorer /10 sur les critères : rendu, navigation, auth, données, boutons actifs.

- Scanner 31 pages Admin — score /10 chacune
- Scanner 25 pages SubAdmin — score /10
- Scanner 27 pages Institutional — score /10
- Scanner 30 pages Pro — score /10
- Scanner 7 pages Public + 2 Auth + 2 Onboarding — score /10
- Identifier : boutons sans handler, formulaires sans validation, mock data résiduel, TODO/FIXME

### 1.2 Audit Backend & CRUD (34 entités)

- Matrice CRUD complète par entité (34 tables × 6 colonnes : Create, Read, Update, Delete, Validation, Auth)
- Identifier entités incomplètes (CRUD partiel)
- Évaluer NEOCORTEX maturity score (confirmé 0%)

### 1.3 Audit Infrastructure

- Vérifier connexion Supabase/PostgreSQL
- Vérifier Convex dev server
- Documenter variables env existantes (.env.local)
- Auditer architecture hybride (Convex + SQL) — clarifier les rôles de chaque BDD

### 1.4 Détection Sous-systèmes

- Valider les 15+ sous-systèmes identifiés par le diagnostic
- Évaluer la maturité de chacun (complet, partiel, stub)
- Comprendre vision, personas cibles, et flux utilisateurs

### 1.5 Livrable

- Produire `audit_complet_digitalium.md` — Rapport P0/P1/P2 avec plan d'action par sprint et score de complétude global

---

## M2 — NEOCORTEX Full Backend (Sprints 1-3)

Construction du système nerveux digital complet — 10 modules cortex.

### Sprint 1 — Fondations + Cortex Core

#### Fondations NEOCORTEX

- **Créer `convex/lib/types.ts`** : `SIGNAL_TYPES` (signaux métier + système + utilisateur), `CORTEX` enum (LIMBIQUE, HIPPOCAMPE, PREFRONTAL, SENSORIEL, VISUEL, AUDITIF, MOTEUR, PLASTICITE), `CATEGORIES_ACTION` (METIER, SYSTEME, UTILISATEUR, SECURITE), interface `SignalPondere`, helpers `genererCorrelationId()`, `calculerScorePondere()`
- **Créer `convex/lib/validators.ts`** : Validateurs réutilisables Convex `v.*`, validation stricte
- **Créer `convex/lib/helpers.ts`** : Helpers partagés (corrélation, scoring, formatage)
- **Modifier `convex/schema.ts`** : Ajouter 5 tables NEOCORTEX avec index optimisés :
  - `signaux` (type, source, destination, payload, confiance, priorité, correlationId, ttl, traite)
  - `historiqueActions` (action, catégorie, entité, userId, details avant/après)
  - `configSysteme` (clé, valeur, description)
  - `metriques` (nom, valeur, unité, période, dimensions)
  - `poidsAdaptatifs` (signal, règle, poids, exécutions)
- **Vérification** : `npx convex dev` — schéma sans erreur

#### 💓 limbique.ts — Bus de signaux pondérés

- `emettreSignal` (internalMutation)
- `routerSignal` (internalMutation) — dispatch type → cortex destination
- `nettoyerSignaux` (internalMutation) — purge TTL
- `listerSignauxNonTraites` (query)
- Test : émettre signal → vérifier en BDD → routage correct

#### 📚 hippocampe.ts — Mémoire & Audit trail

- `loguerAction` (internalMutation) — trace avec capture avant/après pour updates
- `calculerMetriques` (internalMutation) — agrégation
- `listerHistorique` (query) — par entité/user/période
- `rechercherActions` (query)

#### 🔧 plasticite.ts — Adaptation & Config dynamique

- `lireConfig` (query)
- `ecrireConfig` (mutation) + émission signal
- `ajusterPoids` (internalMutation)
- `lirePoidsAdaptatifs` (query)

#### 🎯 prefrontal.ts — Décisions & Workflows

- `evaluerDecision` (mutation) — scoring pondéré
- `executerWorkflow` (mutation) — machine à états
- `validerTransition` (query)

---

### Sprint 2 — Cortex Fonctionnels

#### 📡 sensoriel.ts — Perception externe

- httpRouter pour webhooks entrants (Firebase Auth, Supabase, Stripe, etc.)
- Transformation données externes → signaux internes

#### 👁️ visuel.ts — Médias & Storage

- Adapter l'existant (`documents.ts`, `folders.ts`) pour émettre signaux
- Upload → storage → signal DOCUMENT_CREE
- OCR Gemini si configuré

#### 👂 auditif.ts — Notifications (étendre notifications.ts)

- `creerNotification` + signal NOTIFICATION_CREEE
- `marquerLue` + signal
- `listerNonLues` (temps réel)
- Auto-notification sur signaux CRITICAL

#### 🏃 moteur.ts — Exécution & Actions externes

- Tâches vers APIs tierces (Gemini, Supabase sync)
- Retry logic sur échecs

#### 📈 neocortex_monitoring.ts — Santé système

- Compteurs signaux (émis/traités/erreurs)
- Latence par cortex
- Alertes anomalies

#### ⏰ crons.ts — Rythme circadien (modifier existant)

- Nettoyage signaux traités (quotidien)
- Calcul métriques hippocampe (horaire)
- Purge historique ancien (hebdomadaire)
- Vérification santé (toutes les 5 min)

---

### Sprint 3 — Intégration Mutations Existantes

Appliquer le pattern OMEGA sur les 161 mutations existantes (43 fichiers convex/) :

Pour **chaque** mutation, ajouter :
1. `scheduler.runAfter(0, internal.limbique.emettreSignal, {...})`
2. `scheduler.runAfter(0, internal.hippocampe.loguerAction, {...})`
3. Capture avant/après pour les updates
4. Validation stricte `v.*` + try/catch + TypeScript pur

**Ordre de priorité (par volume et criticité)** :

1. `organizations.ts` + `orgMembers.ts` + `orgSites.ts` + `orgUnits.ts` + `org_lifecycle.ts`
2. `archives.ts` + `archiveConfig.ts` + `archiveBridge.ts` + `retentionAlerts.ts`
3. `documents.ts` + `folders.ts` + `documentTypes.ts` + `documentMetadataFields.ts`
4. `signatures.ts` + `signatureWorkflows.ts`
5. `filingCells.ts` + `filingStructures.ts` + `cellAccessOverrides.ts` + `cellAccessRules.ts`
6. `leads.ts` + `clients.ts`
7. `users.ts` + `businessRoles.ts` + `permissionGroups.ts`
8. `payments.ts` + `subscriptions.ts`
9. `notifications.ts` + `auditLogs.ts`
10. `automationEngine.ts` + `configPropagation.ts` + `lifecycleScheduler.ts`
11. `iasted.ts` + `dataRooms.ts` + `aiSmartImport.ts`
12. `folderArchiveMetadata.ts` + `demoAccounts.ts` + `seed.ts` + `seedLeads.ts`

**Vérification** : `npx convex dev` sans erreur, test end-to-end signal émis → routé → logué

---

## M3 — Frontend & Espaces Utilisateurs (Sprints 4-6)

Approche hybride : par espace (exhaustivité) avec patterns transversaux (factorisation).

### Sprint 4 — Corrections P0 & Patterns Transversaux

#### P0 Bloquants
- Build sans erreur + Convex dev OK
- Auth fonctionnelle → session → routes protégées → redirections (adapter tout pattern Clerk → Firebase)
- Éliminer mock data → `useQuery` Convex partout
- Retirer PWA si présent (P0 identifié dans Plan B)

#### Pattern 8 étapes (appliqué globalement)
Sur chaque bouton/action interactive :
`reset error → loading → validate → call mutation → update state → success toast → auto-dismiss 3s → catch error`

#### Double validation
- Frontend : validation formulaire (Zod) côté client
- Backend : validation schema `v.*` côté Convex

#### Patterns transversaux (sections communes entre espaces)
- **Profile** : Read, Edit, Avatar Upload, validation — composant partagé
- **Settings** : Personal, Security, Notifications, Appearance, Danger Zone — composant partagé
- **Dashboard** : KPI Cards, Trend Graphs, Activity Timeline → métriques NEOCORTEX

---

### Sprint 5 — Espaces Utilisateurs Complets

#### Admin (31 pages)
- Dashboard connecté aux métriques NEOCORTEX (`hippocampe.calculerMetriques`)
- Monitoring : signaux, santé, métriques en temps réel
- IAM : CRUD complet, éliminer tous les `any` types
- Config système → plasticité UI
- Organizations, Users, Leads, Billing, Logs, Analytics → fullstack

#### SubAdmin (25 pages)
- Dashboard + KPI Cards → métriques useQuery
- iArchive, iDocument, iSignature → useQuery + useMutation
- Organisation config → plasticité

#### Institutional (27 pages)
- iArchive (8 sous-pages) → fullstack
- iDocument (6 sous-pages) → fullstack
- iSignature (5 sous-pages) → fullstack
- iAsted → fullstack
- Paramètres, Users, Formation

#### Pro (30 pages)
- Miroir institutional avec adaptations Pro
- Settings, Billing, API, Leads, Clients → fullstack

---

### Sprint 6 — UX & Polish

#### Formulaires
- Labels visibles (pas placeholder-only), validation onChange, messages erreur sous champ
- Submit disabled si invalide, champs requis marqués (*)
- Debounce sur les champs de recherche

#### Feedback & États
- Skeleton screens (loading), illustrations (empty states), message + retry (error)
- Modale confirmation pour actions destructives, toast auto-dismiss pour succès

#### Responsive
- Mobile 320px+ : hamburger/bottom nav, touch targets 44×44px
- Tablette 768px+ : layouts adaptés
- Desktop 1024px+ : sidebar complète

#### Design System
- Palette cohérente, mode sombre complet
- Animations Framer Motion cohérentes
- Navigation : max 3 clics vers toute fonction, fil d'Ariane, page active, accessibilité clavier

---

## M4 — Infrastructure, BDD & Souveraineté (Sprint 7)

> ⚠️ **DÉCISION PRÉALABLE REQUISE** : Choisir entre Supabase (managed) et Google Cloud SQL (self-managed) comme hub souverain PostgreSQL. Voir Divergence 1.

### Sync Layer

- **Créer `convex/sync/actions.ts`** : `syncVersPostgres` (action) — Convex → PostgreSQL souverain. Déclenché par signaux limbiques sur entités souveraines. Signal `SYNC_POSTGRES_OK` en confirmation.
- **Créer `convex/sync/polling.ts`** : Cron polling PostgreSQL → Convex (si nécessaire, pour données modifiées côté SQL)
- **Abstraction connexion** : Driver PostgreSQL abstrait supportant Supabase ET Google Cloud SQL
- **Migrations schema PostgreSQL** : Créer les tables PostgreSQL correspondant aux structures Convex souveraines

### Sécurité BDD
- SSL obligatoire, IPs restrictives, utilisateur applicatif dédié
- Backups automatiques + PITR (Point-in-Time Recovery)
- Aucun secret dans le code source

### Variables d'environnement
- Vérifier/compléter `.env.local` et `.env.production`
- Variables Supabase + PostgreSQL + Firebase + Convex + Stripe

### Tests connectivité
- Convex ↔ PostgreSQL < 100ms
- Test de sync round-trip complet
- Vérification en conditions dev ET production

---

## M5 — Nettoyage & Production (Sprints 8-10)

### Sprint 8 — Purification Code

- **Fichiers orphelins** : composants non importés, pages sans route, mutations non appelées → supprimer
- **Code mort** : console.log, variables inutilisées, blocs commentés, TODO/FIXME → résoudre ou supprimer
- **Imports fantômes** → supprimer
- **Mock data résiduels** → supprimer
- **`any` types** → éliminer complètement, types stricts partout
- **Dépendances inutilisées** → retirer de package.json

### Sprint 9 — Tests & Optimisation

- **Tests Playwright E2E** : écrire les tests couvrant le parcours complet (inscription → utilisation → signaux → sync)
- **Optimisation performance** : React.memo ciblés, lazy loading des routes, indexed queries Convex
- **Security patches** : pas de secrets côté client, headers sécurisés (CSP, HSTS), vérification stricte des rôles

### Sprint 10 — Déploiement Production

#### Pré-déploiement
- `npm run build` sans erreur, 0 warning TypeScript
- Variables env production complètes (Convex dashboard + hosting)
- SEO : title, description, og:image, favicon
- Page 404 personnalisée + Error Boundary global

#### Déploiement
- `npx convex deploy` production
- Frontend hosting (Vercel ou équivalent)
- Domaine + SSL
- Crons actifs vérifiés

#### Post-déploiement
- Test e2e en production
- Signaux émis + routés correctement
- Sync PostgreSQL souverain opérationnelle
- Monitoring actif, 0 alertes
- Générer **Rapport final NEXUS-OMEGA** (livrable de clôture)

---
---

## PARTIE 3 — IMPLEMENTATION TASKS (CHECKLIST FUSIONNÉE)

### M1 — Immersion Totale & Architecture (Sprint 0)

- [ ] Scanner 31 pages Admin — score /10 chacune
- [ ] Scanner 25 pages SubAdmin — score /10
- [ ] Scanner 27 pages Institutional — score /10
- [ ] Scanner 30 pages Pro — score /10
- [ ] Scanner 7 pages Public + 2 Auth + 2 Onboarding — score /10
- [ ] Identifier boutons sans handler / mock data / TODO-FIXME
- [ ] Matrice CRUD par entité (34 tables × 6 colonnes)
- [ ] Identifier entités incomplètes
- [ ] Évaluer NEOCORTEX maturity (confirmé 0%)
- [ ] Vérifier connexion Supabase/PostgreSQL
- [ ] Vérifier Convex dev server
- [ ] Documenter variables env existantes
- [ ] Valider les 15+ sous-systèmes et leur maturité
- [ ] Produire `audit_complet_digitalium.md` (rapport P0/P1/P2)

### M2 — NEOCORTEX Full Backend

#### Sprint 1 — Fondations + Cortex Core

- [ ] Créer `convex/lib/types.ts` (SIGNAL_TYPES, CORTEX enum, helpers)
- [ ] Créer `convex/lib/validators.ts` (validateurs Convex réutilisables)
- [ ] Créer `convex/lib/helpers.ts` (corrélation, scoring, formatage)
- [ ] Modifier `convex/schema.ts` — ajouter 5 tables NEOCORTEX + index
- [ ] `npx convex dev` — vérifier schéma sans erreur
- [ ] Implémenter `limbique.ts` : emettreSignal, routerSignal, nettoyerSignaux, listerSignauxNonTraites
- [ ] Test limbique : signal émis → BDD → routage correct
- [ ] Implémenter `hippocampe.ts` : loguerAction, calculerMetriques, listerHistorique, rechercherActions
- [ ] Implémenter `plasticite.ts` : lireConfig, ecrireConfig, ajusterPoids, lirePoidsAdaptatifs
- [ ] Implémenter `prefrontal.ts` : evaluerDecision, executerWorkflow, validerTransition

#### Sprint 2 — Cortex Fonctionnels

- [ ] Implémenter `sensoriel.ts` : httpRouter webhooks (Firebase, Supabase, Stripe)
- [ ] Implémenter `visuel.ts` : adapter documents.ts + folders.ts pour signaux, OCR Gemini
- [ ] Implémenter `auditif.ts` : étendre notifications.ts (creerNotification, marquerLue, listerNonLues, auto-notif CRITICAL)
- [ ] Implémenter `moteur.ts` : actions APIs tierces + retry logic
- [ ] Implémenter `neocortex_monitoring.ts` : compteurs, latence, alertes
- [ ] Modifier `crons.ts` : nettoyage quotidien, métriques horaires, purge hebdomadaire, santé 5min
- [ ] Vérification : `npx convex dev` sans erreur

#### Sprint 3 — Intégration Mutations

- [ ] Pattern OMEGA sur organizations.ts + orgMembers.ts + orgSites.ts + orgUnits.ts + org_lifecycle.ts
- [ ] Pattern OMEGA sur archives.ts + archiveConfig.ts + archiveBridge.ts + retentionAlerts.ts
- [ ] Pattern OMEGA sur documents.ts + folders.ts + documentTypes.ts + documentMetadataFields.ts
- [ ] Pattern OMEGA sur signatures.ts + signatureWorkflows.ts
- [ ] Pattern OMEGA sur filingCells.ts + filingStructures.ts + cellAccessOverrides.ts + cellAccessRules.ts
- [ ] Pattern OMEGA sur leads.ts + clients.ts
- [ ] Pattern OMEGA sur users.ts + businessRoles.ts + permissionGroups.ts
- [ ] Pattern OMEGA sur payments.ts + subscriptions.ts
- [ ] Pattern OMEGA sur notifications.ts + auditLogs.ts
- [ ] Pattern OMEGA sur automationEngine.ts + configPropagation.ts + lifecycleScheduler.ts
- [ ] Pattern OMEGA sur iasted.ts + dataRooms.ts + aiSmartImport.ts
- [ ] Pattern OMEGA sur folderArchiveMetadata.ts + demoAccounts.ts + seed.ts + seedLeads.ts
- [ ] Vérification end-to-end : mutation → signal → routage → log hippocampe

### M3 — Frontend & Espaces Utilisateurs

#### Sprint 4 — Corrections P0 & Patterns

- [ ] Build sans erreur + Convex dev OK
- [ ] Auth Firebase fonctionnelle (adapter patterns Clerk → Firebase)
- [ ] Éliminer tout mock data → useQuery Convex
- [ ] Retirer PWA si présent
- [ ] Appliquer pattern 8 étapes sur toutes actions
- [ ] Implémenter double validation (frontend Zod + backend v.*)
- [ ] Créer composant partagé Profile (Read, Edit, Avatar Upload)
- [ ] Créer composant partagé Settings (Personal, Security, Notifications, Appearance, Danger Zone)
- [ ] Créer composant partagé Dashboard (KPI Cards, Trends, Activity Timeline)

#### Sprint 5 — Espaces Complets

- [ ] Admin : Dashboard → métriques NEOCORTEX
- [ ] Admin : Monitoring → signaux, santé, métriques temps réel
- [ ] Admin : IAM → CRUD complet, fix `any` types
- [ ] Admin : Config système → plasticité UI
- [ ] Admin : Organizations, Users, Leads, Billing, Logs, Analytics → fullstack
- [ ] SubAdmin : Dashboard + KPI Cards → métriques useQuery
- [ ] SubAdmin : iArchive, iDocument, iSignature → useQuery + useMutation
- [ ] SubAdmin : Organisation config → plasticité
- [ ] Institutional : iArchive (8 sous-pages) → fullstack
- [ ] Institutional : iDocument (6 sous-pages) → fullstack
- [ ] Institutional : iSignature (5 sous-pages) → fullstack
- [ ] Institutional : iAsted, Paramètres, Users, Formation → fullstack
- [ ] Pro : Miroir institutional + adaptations
- [ ] Pro : Settings, Billing, API, Leads, Clients → fullstack

#### Sprint 6 — UX & Polish

- [ ] Formulaires : labels, validation onChange, messages erreur, debounce, submit disabled
- [ ] Feedback : skeleton loading, empty states, error retry, modales confirmation, toast
- [ ] Responsive : 320px mobile, 768px tablette, 1024px desktop
- [ ] Design : palette cohérente, mode sombre, animations Framer Motion
- [ ] Navigation : max 3 clics, fil d'Ariane, page active, accessibilité clavier

### M4 — Infrastructure & Souveraineté (Sprint 7)

- [ ] **DÉCISION** : Choisir hébergeur PostgreSQL souverain (Supabase vs Google Cloud SQL)
- [ ] Créer `convex/sync/actions.ts` (syncVersPostgres) + abstraction connexion
- [ ] Créer `convex/sync/polling.ts` (si nécessaire)
- [ ] Exécuter migrations schema PostgreSQL
- [ ] Signal `SYNC_POSTGRES_OK` après sync
- [ ] Sécurité : SSL, IPs restrictives, utilisateur applicatif, backups, PITR
- [ ] Variables d'env dev + prod complétées
- [ ] Tests connectivité : Convex ↔ PostgreSQL < 100ms

### M5 — Nettoyage & Production

#### Sprint 8 — Purification

- [ ] Supprimer fichiers orphelins (composants, pages, mutations)
- [ ] Supprimer imports fantômes + code mort + console.log + blocs commentés
- [ ] Résoudre tous TODO/FIXME
- [ ] Éliminer tous `any` types restants
- [ ] Retirer dépendances inutilisées de package.json

#### Sprint 9 — Tests & Optimisation

- [ ] Écrire tests Playwright E2E (parcours complet)
- [ ] Optimisation : React.memo, lazy loading routes, indexed queries
- [ ] Security patches : headers sécurisés, pas de secrets client, rôles stricts

#### Sprint 10 — Déploiement

- [ ] `npm run build` sans erreur, 0 warning TS
- [ ] Variables env production complètes
- [ ] SEO : title, description, og:image, favicon
- [ ] Page 404 + Error Boundary
- [ ] `npx convex deploy` production
- [ ] Frontend hosting + domaine + SSL
- [ ] Crons actifs vérifiés
- [ ] Test e2e production
- [ ] Sync PostgreSQL opérationnelle
- [ ] Monitoring actif, 0 alertes
- [ ] Générer Rapport final NEXUS-OMEGA

---

## Verification Plan

### Tests Automatisés
```bash
npx convex dev          # Schema + tous les cortex chargent sans erreur
npm run build           # Build 0 erreurs, 0 warnings TS
npm run test:e2e        # Playwright E2E (Sprint 9)
```

### Vérification Manuelle
- Parcours complet : inscription → utilisation → signaux → sync → monitoring
- Browser test : chaque espace (admin, subadmin, institutional, pro)
- Signal propagation : mutation → signal → table → routage → cortex destination
- Historique : action → log hippocampe → query historique
- Sync : mutation Convex → PostgreSQL souverain → confirmation signal
- Monitoring dashboard : compteurs, santé, alertes
- Réactivité temps réel : éditions concurrentes via Convex + Yjs
