# 🔴 NEXUS-OMEGA — Implementation Plan — DIGITALIUM.IO

> **Diagnostic** : 🔴 OMEGA | **Modules** : 5 | **Sprints estimés** : 8-12
> **Score NEOCORTEX actuel** : 0% → Cible : 100%

---

## User Review Required

> [!IMPORTANT]
> **Architecture hybride Convex + Supabase/PostgreSQL** : Le plan suppose que Supabase est la couche souveraineté (source de vérité pour données officielles). Confirmer cette stratégie avant M4.

> [!WARNING]
> **Firebase Auth** : DIGITALIUM.IO utilise Firebase Auth (pas Clerk). Le NEOCORTEX doit s'adapter. Les patterns M2/M3 référençant Clerk seront adaptés à Firebase.

> [!CAUTION]
> **Ampleur** : 127 pages, 34 tables, 161 mutations existantes. Chaque mutation devra émettre un signal limbique + log hippocampe. L'intégration NEOCORTEX sera progressive (par module métier).

---

## M1 — Immersion Totale & Architecture (Sprint 0)

*Audit existant déjà partiellement réalisé par le diagnostic. Ce sprint complète les données manquantes.*

### Audit Frontend Exhaustif

#### [ANALYSE] Routes & Composants (127 pages)
- Scanner chaque route des 5 espaces (admin, subadmin, institutional, pro, public)
- Identifier : boutons sans handler, formulaires sans validation, mock data résiduel
- Scorer chaque page /10 (rendu, nav, auth, données, boutons actifs)

#### [ANALYSE] Audit Backend & CRUD (34 entités)
- Matrice CRUD complète par entité (Create/Read/Update/Delete + validation + auth)
- Identifier entités sans CRUD complet

#### [PRODUCE] `audit_complet_digitalium.md`
- Rapport P0/P1/P2 avec plan d'action par sprint
- Score complétude global

---

## M2 — NEOCORTEX Full Backend (Sprints 1-3)

*Construction du système nerveux digital complet — 12 cortex.*

### Fondations NEOCORTEX

#### [NEW] [types.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/lib/types.ts)
- `SIGNAL_TYPES` : tous les types de signaux métier + système + utilisateur
- `CORTEX` enum : LIMBIQUE, HIPPOCAMPE, PREFRONTAL, SENSORIEL, VISUEL, AUDITIF, MOTEUR, PLASTICITE
- `CATEGORIES_ACTION` : METIER, SYSTEME, UTILISATEUR, SECURITE
- Interface `SignalPondere`
- Helpers `genererCorrelationId()`, `calculerScorePondere()`

#### [NEW] [validators.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/lib/validators.ts)
- Validateurs réutilisables Convex `v.*`

#### [NEW] [helpers.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/lib/helpers.ts)
- Helpers partagés (corrélation, scoring, formatage)

#### [MODIFY] [schema.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/schema.ts)
- Ajouter 5 tables NEOCORTEX : `signaux`, `historiqueActions`, `configSysteme`, `metriques`, `poidsAdaptatifs`
- Index optimisés par table

---

### Cortex Core (Sprint 1)

#### [NEW] [limbique.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/limbique.ts)
💓 **CŒUR** — Bus de signaux pondérés
- `emettreSignal` (internalMutation)
- `routerSignal` (internalMutation) — dispatch type → cortex destination
- `nettoyerSignaux` (internalMutation) — purge TTL
- `listerSignauxNonTraites` (query)

#### [NEW] [hippocampe.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/hippocampe.ts)
📚 **Mémoire** — Audit trail + métriques
- `loguerAction` (internalMutation) — trace (avant/après pour updates)
- `calculerMetriques` (internalMutation) — agrégation
- `listerHistorique` (query) — par entité/user/période
- `rechercherActions` (query)

#### [NEW] [plasticite.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/plasticite.ts)
🔧 **Adaptation** — Config dynamique
- `lireConfig` (query)
- `ecrireConfig` (mutation) + signal
- `ajusterPoids` (internalMutation)
- `lirePoidsAdaptatifs` (query)

#### [NEW] [prefrontal.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/prefrontal.ts)
🎯 **Décisions** — Scoring pondéré
- `evaluerDecision` (mutation)
- `executerWorkflow` (mutation) — machine à états
- `validerTransition` (query)

---

### Cortex Fonctionnels (Sprint 2)

#### [NEW] [sensoriel.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/sensoriel.ts)
📡 **Perception externe** — HTTP Actions + webhooks
- httpRouter pour webhooks entrants (Firebase Auth, Supabase, Stripe, etc.)
- Transformation données → signaux internes

#### [MODIFY] [visuel.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/visuel.ts)
👁️ **Médias** — Fichiers + OCR + Storage
- Adapter l'existant ([documents.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/documents.ts), [folders.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/folders.ts)) pour émettre signaux
- Upload → storage → signal DOCUMENT_CREE
- OCR Gemini si configuré

#### [MODIFY] [notifications.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/notifications.ts)
👂 **Auditif** — Rename/extend en cortex auditif
- `creerNotification` + signal
- `marquerLue` + signal
- `listerNonLues` (temps réel)
- Auto-notification sur signaux CRITICAL

#### [NEW] [moteur.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/moteur.ts)
🏃 **Exécution** — Actions externes + async
- Tâches vers APIs tierces (Gemini, Supabase sync)
- Retry logic sur échecs

#### [NEW] [neocortex_monitoring.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/neocortex_monitoring.ts)
📈 **Santé système**
- Compteurs signaux (émis/traités/erreurs)
- Latence par cortex
- Alertes anomalies

#### [MODIFY] [crons.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/crons.ts)
⏰ **Rythme circadien**
- Nettoyage signaux traités (quotidien)
- Calcul métriques hippocampe (horaire)
- Purge historique ancien (hebdomadaire)
- Vérification santé (5 min)

---

### Intégration Mutations Existantes (Sprint 3)

#### [MODIFY] Toutes mutations existantes (43 fichiers convex/)
Pour **chaque** mutation existante (161 au total), ajouter :
1. `scheduler.runAfter(0, internal.limbique.emettreSignal, {...})`
2. `scheduler.runAfter(0, internal.hippocampe.loguerAction, {...})`
3. Capture avant/après pour updates

**Fichiers prioritaires** (par volume de mutations) :
- [organizations.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/organizations.ts), [archives.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archives.ts), [documents.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/documents.ts), [signatures.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/signatures.ts)
- [filingCells.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/filingCells.ts), [filingStructures.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/filingStructures.ts), [leads.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/leads.ts), [clients.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/clients.ts)
- [users.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/users.ts), [orgMembers.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/orgMembers.ts), [payments.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/payments.ts), [subscriptions.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/subscriptions.ts)

---

## M3 — Frontend & Espaces Utilisateurs (Sprints 4-6)

*Connecter chaque page au NEOCORTEX — pattern 8 étapes sur chaque handler.*

### Sprint 4 — Corrections P0

#### [MODIFY] Toutes les pages avec mock data
- Remplacer mock → `useQuery` Convex temps réel
- Connecter `useMutation` sur chaque handler

#### [MODIFY] Handlers → Pattern 8 étapes
Sur chaque bouton/action :
`reset error → loading → validate → call mutation → update state → success toast → auto-dismiss 3s → catch error`

---

### Sprint 5 — Espaces Utilisateurs Complets

#### [MODIFY] Admin Space (31 pages)
- Dashboard connecté aux métriques NEOCORTEX (`hippocampe.calculerMetriques`)
- Monitoring (signaux, santé, métriques)
- IAM avec CRUD complet (fix `any` types)
- Config système via plasticité

#### [MODIFY] SubAdmin Space (25 pages)
- Dashboard + KPI Cards → métriques useQuery
- iArchive/iDocument/iSignature → useQuery + useMutation
- Organisation config → plasticité

#### [MODIFY] Institutional Space (27 pages)
- iArchive (8 sous-pages) → fullstack
- iDocument (6 sous-pages) → fullstack
- iSignature (5 sous-pages) → fullstack
- iAsted → fullstack

#### [MODIFY] Pro Space (30 pages)
- Miroir institutional avec adaptations Pro
- Settings, billing, API → fullstack

---

### Sprint 6 — UX & Polish

#### [MODIFY] Formulaires
- Labels visibles (pas placeholder-only), validation onChange, messages erreur sous champ
- Submit disabled si invalide, champs requis marqués (*)

#### [MODIFY] Feedback
- Skeleton screens (loading), illustrations (empty), message + retry (error)
- Modale confirmation (destructif), toast auto-dismiss (succès)

#### [MODIFY] Responsive
- Mobile 320px+ : hamburger/bottom nav, touch 44×44px
- Tablette 768px+ : layouts adaptés
- Desktop 1024px+ : sidebar complète

---

## M4 — Infrastructure, BDD & Souveraineté (Sprint 7)

*Synchronisation Convex ↔ Supabase/PostgreSQL.*

### Sync Layer

#### [NEW] [sync/actions.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/sync/actions.ts)
- `syncVersPostgres` (action) — Convex → Supabase
- Déclenché par signaux limbiques sur entités souveraines
- Signal `SYNC_POSTGRES_OK` en confirmation

#### [NEW] [sync/polling.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/sync/polling.ts)
- Cron polling Supabase → Convex (si nécessaire)

#### [MODIFY] [.env.local](file:///Users/okatech/okatech-projects/digitalium.io/.env.local)
- Vérifier/compléter variables Supabase + PostgreSQL

### Sécurité BDD
- SSL, IPs restrictives, utilisateur applicatif
- Backups automatiques, PITR
- Aucun secret dans le code source

---

## M5 — Nettoyage & Production (Sprints 8-9)

### Purification Code

#### [DELETE] Fichiers orphelins
- Composants non importés, pages sans route, mutations non appelées
- Code mort, console.log, variables inutilisées, blocs commentés
- Mock data résiduels

#### [MODIFY] [package.json](file:///Users/okatech/okatech-projects/digitalium.io/package.json)
- Supprimer dépendances inutilisées

### TypeScript Strict
- Éliminer tous les `any` restants
- Types stricts sur toutes les interfaces

### Déploiement Production
- `npm run build` sans erreurs
- `npx convex deploy` production
- Variables env production (Convex dashboard + hosting)
- Domaine + SSL + SEO (title, description, og:image)
- Page 404 personnalisée, Error Boundary

### Vérification Finale
- Test end-to-end : inscription → utilisation → signaux → sync
- Crons actifs, monitoring sans alertes
- Sync Convex ↔ Supabase opérationnelle

---

## Verification Plan

### Automated Tests
```bash
npx convex dev          # Schema + all cortex load without errors
npm run build           # Build 0 errors
npm run test:e2e        # Playwright E2E tests (à écrire Sprint 8)
```

### Manual Verification
- Browser test : chaque espace (admin, subadmin, institutional, pro)
- Signal propagation : mutation → signal → table → routage → cortex destination
- Historique : action → log hippocampe → query historique
- Sync : mutation Convex → Supabase PostgreSQL → confirmation signal
- Monitoring dashboard : compteurs, santé, alertes
