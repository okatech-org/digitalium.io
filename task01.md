# 🔴 NEXUS-OMEGA — Implementation Tasks — DIGITALIUM.IO

---

## M1 — Immersion Totale & Architecture (Sprint 0)
- [ ] **Audit Frontend Exhaustif**
  - [ ] Scanner 31 pages Admin — score /10 chacune
  - [ ] Scanner 25 pages SubAdmin — score /10
  - [ ] Scanner 27 pages Institutional — score /10
  - [ ] Scanner 30 pages Pro — score /10
  - [ ] Scanner 7 pages Public + 2 Auth + 2 Onboarding — score /10
  - [ ] Identifier boutons sans handler / mock data / TODO-FIXME
- [ ] **Audit Backend & CRUD**
  - [ ] Matrice CRUD par entité (34 tables × 6 colonnes)
  - [ ] Identifier entités incomplètes
- [ ] **Évaluation NEOCORTEX** (confirmé 0%)
- [ ] **Audit Infrastructure**
  - [ ] Vérifier connexion Supabase/PostgreSQL
  - [ ] Vérifier Convex dev server
  - [ ] Documenter variables env existantes
- [ ] **Produire** `audit_complet_digitalium.md` (rapport P0/P1/P2)

---

## M2 — NEOCORTEX Full Backend (Sprints 1-3)

### Sprint 1 — Fondations + Cortex Core
- [ ] **Fondations NEOCORTEX**
  - [ ] Créer `convex/lib/types.ts` (SIGNAL_TYPES, CORTEX, helpers)
  - [ ] Créer `convex/lib/validators.ts`
  - [ ] Créer `convex/lib/helpers.ts`
  - [ ] Modifier [convex/schema.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/schema.ts) — ajouter 5 tables NEOCORTEX
    - [ ] `signaux` (type, source, destination, payload, confiance, priorité, correlationId, ttl, traite)
    - [ ] `historiqueActions` (action, catégorie, entité, userId, details avant/après)
    - [ ] `configSysteme` (clé, valeur, description)
    - [ ] `metriques` (nom, valeur, unité, période, dimensions)
    - [ ] `poidsAdaptatifs` (signal, règle, poids, exécutions)
  - [ ] `npx convex dev` — vérifier schéma sans erreur
- [ ] **💓 limbique.ts** — Bus de signaux
  - [ ] `emettreSignal` (internalMutation)
  - [ ] `routerSignal` (internalMutation)
  - [ ] `nettoyerSignaux` (internalMutation)
  - [ ] `listerSignauxNonTraites` (query)
  - [ ] Test : émettre signal → vérifier en BDD
- [ ] **📚 hippocampe.ts** — Mémoire
  - [ ] `loguerAction` (internalMutation)
  - [ ] `calculerMetriques` (internalMutation)
  - [ ] `listerHistorique` (query)
  - [ ] `rechercherActions` (query)
- [ ] **🔧 plasticite.ts** — Adaptation
  - [ ] `lireConfig` (query)
  - [ ] `ecrireConfig` (mutation)
  - [ ] `ajusterPoids` (internalMutation)
  - [ ] `lirePoidsAdaptatifs` (query)
- [ ] **🎯 prefrontal.ts** — Décisions
  - [ ] `evaluerDecision` (mutation)
  - [ ] `executerWorkflow` (mutation)
  - [ ] `validerTransition` (query)

### Sprint 2 — Cortex Fonctionnels
- [ ] **📡 sensoriel.ts** — Perception externe
  - [ ] httpRouter webhooks (Firebase auth, Supabase, Stripe)
  - [ ] Transformation données → signaux
- [ ] **👁️ visuel.ts** — Médias (adapter existant)
  - [ ] Étendre [documents.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/documents.ts) + [folders.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/folders.ts) pour émettre signaux
  - [ ] Upload → storage → signal DOCUMENT_CREE
  - [ ] OCR Gemini si configuré
- [ ] **👂 auditif.ts** — Notifications (étendre [notifications.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/notifications.ts))
  - [ ] `creerNotification` + signal NOTIFICATION_CREEE
  - [ ] `marquerLue` + signal
  - [ ] `listerNonLues` (temps réel)
  - [ ] Auto-notification sur signaux CRITICAL
- [ ] **🏃 moteur.ts** — Actions externes
  - [ ] Actions APIs tierces (Gemini, Supabase)
  - [ ] Retry logic sur échecs
- [ ] **📈 neocortex_monitoring.ts** — Santé
  - [ ] Compteurs signaux (émis/traités/erreurs)
  - [ ] Latence par cortex
  - [ ] Alertes anomalies
- [ ] **⏰ crons.ts** — Rythme circadien (modifier existant)
  - [ ] Nettoyage signaux traités (quotidien)
  - [ ] Calcul métriques hippocampe (horaire)
  - [ ] Purge historique ancien (hebdomadaire)
  - [ ] Vérification santé (5 min)

### Sprint 3 — Intégration Mutations Existantes
- [ ] **Pattern OMEGA sur chaque mutation**
  - [ ] [organizations.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/organizations.ts) — signaux + hippocampe sur toutes mutations
  - [ ] [archives.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archives.ts) + [archiveConfig.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archiveConfig.ts) + [archiveBridge.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archiveBridge.ts)
  - [ ] [documents.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/documents.ts) + [folders.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/folders.ts) + [documentTypes.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/documentTypes.ts)
  - [ ] [signatures.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/signatures.ts) + [signatureWorkflows.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/signatureWorkflows.ts)
  - [ ] [filingCells.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/filingCells.ts) + [filingStructures.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/filingStructures.ts)
  - [ ] [leads.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/leads.ts) + [clients.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/clients.ts)
  - [ ] [users.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/users.ts) + [orgMembers.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/orgMembers.ts)
  - [ ] [payments.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/payments.ts) + [subscriptions.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/subscriptions.ts)
  - [ ] [notifications.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/notifications.ts) + [retentionAlerts.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/retentionAlerts.ts)
  - [ ] [auditLogs.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/auditLogs.ts) + [automationEngine.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/automationEngine.ts)
  - [ ] [businessRoles.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/businessRoles.ts) + [permissionGroups.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/permissionGroups.ts)
  - [ ] [orgSites.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/orgSites.ts) + [orgUnits.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/orgUnits.ts) + [org_lifecycle.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/org_lifecycle.ts)
  - [ ] [iasted.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/iasted.ts) + [dataRooms.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/dataRooms.ts)
  - [ ] [cellAccessOverrides.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/cellAccessOverrides.ts) + [cellAccessRules.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/cellAccessRules.ts)
  - [ ] [lifecycleScheduler.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/lifecycleScheduler.ts) + [configPropagation.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/configPropagation.ts)
  - [ ] [aiSmartImport.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/aiSmartImport.ts) + [folderArchiveMetadata.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/folderArchiveMetadata.ts)
- [ ] **Vérification** : `npx convex dev` sans erreur, signaux vérifiés end-to-end

---

## M3 — Frontend & Espaces Utilisateurs (Sprints 4-6)

### Sprint 4 — Corrections P0
- [ ] **Build sans erreur** + Convex dev OK
- [ ] **Auth fonctionnelle** → session → routes protégées → redirections
- [ ] **Éliminer mock data** → useQuery Convex partout
- [ ] **Handler 8 étapes** sur toutes actions existantes

### Sprint 5 — Espaces Complets
- [ ] **Admin (31 pages)**
  - [ ] Dashboard → métriques NEOCORTEX
  - [ ] Monitoring → signaux, santé, métriques
  - [ ] IAM → CRUD complet, fix `any` types
  - [ ] Config système → plasticité UI
  - [ ] Organizations, Users, Leads, Billing, Logs, Analytics
- [ ] **SubAdmin (25 pages)**
  - [ ] Dashboard + KPI
  - [ ] iArchive, iDocument, iSignature → useQuery + useMutation
  - [ ] Organisation config
- [ ] **Institutional (27 pages)**
  - [ ] iArchive (8 sous-pages) → fullstack
  - [ ] iDocument (6 sous-pages) → fullstack  
  - [ ] iSignature (5 sous-pages) → fullstack
  - [ ] iAsted → fullstack
  - [ ] Parametres, Users, Formation
- [ ] **Pro (30 pages)**
  - [ ] Miroir institutional + adaptations
  - [ ] Settings, Billing, API, Leads, Clients

### Sprint 6 — UX & Polish
- [ ] **Formulaires** : labels, validation onChange, messages erreur, debounce
- [ ] **Feedback** : skeleton loading, empty states, error retry, modales confirmation
- [ ] **Responsive** : 320px mobile, 768px tablette, 1024px desktop
- [ ] **Design** : palette cohérente, mode sombre complet, animations Framer Motion
- [ ] **Navigation** : max 3 clics, fil d'Ariane, page active, clavier

---

## M4 — Infrastructure & Souveraineté (Sprint 7)
- [ ] **Sync Convex ↔ Supabase**
  - [ ] Créer `convex/sync/actions.ts` (syncVersPostgres)
  - [ ] Créer `convex/sync/polling.ts` (si nécessaire)
  - [ ] Signal `SYNC_POSTGRES_OK` après sync
- [ ] **Sécurité BDD**
  - [ ] SSL, IPs restrictives, utilisateur applicatif
  - [ ] Backups automatiques
- [ ] **Variables d'env** — dev + prod complétées
- [ ] **Tests connectivité** — Convex ↔ Supabase < 100ms

---

## M5 — Nettoyage & Production (Sprints 8-9)

### Sprint 8 — Purification
- [ ] **Fichiers orphelins** → supprimer
- [ ] **Imports fantômes** → supprimer
- [ ] **Code mort** → supprimer (console.log, blocs commentés, variables)
- [ ] **TODO/FIXME** → résoudre ou supprimer
- [ ] **`any` types** → éliminer
- [ ] **Dépendances inutilisées** → retirer de package.json
- [ ] **Tests Playwright E2E** → écrire + exécuter

### Sprint 9 — Déploiement
- [ ] **Pré-déploiement**
  - [ ] `npm run build` sans erreur
  - [ ] Variables env production
  - [ ] SEO : title, description, og:image, favicon
  - [ ] Page 404 + Error Boundary
- [ ] **Déploiement**
  - [ ] `npx convex deploy` production
  - [ ] Frontend hosting (Vercel/etc.)
  - [ ] Domaine + SSL
  - [ ] Crons actifs vérifiés
- [ ] **Post-déploiement**
  - [ ] Test e2e production
  - [ ] Signaux émis + routés OK
  - [ ] Sync Supabase OK
  - [ ] Monitoring actif, 0 alertes
- [ ] **Rapport final NEXUS-OMEGA**
