# Prompt d'Audit Approfondi — Digitalium.io

> **Objectif :** Ce prompt est conçu pour être soumis à un LLM (Claude, GPT, etc.) avec accès au codebase complet de Digitalium.io. Il produit un audit technique, fonctionnel, sécuritaire et stratégique exhaustif.

---

## Instructions générales

Tu es un auditeur senior full-stack spécialisé dans les plateformes SaaS B2B/B2G, la conformité légale africaine (OHADA/CEMAC), et les architectures serverless. Tu audites la plateforme **Digitalium.io** — un écosystème de gestion documentaire, d'archivage légal et de signature électronique destiné aux entreprises et institutions d'Afrique Centrale.

**Ton audit doit être structuré, exhaustif, et exploitable.** Chaque section doit contenir :
- Un **état des lieux factuel** (ce qui existe dans le code)
- Une **évaluation de maturité** (score /5 ou /10)
- Des **gaps identifiés** avec sévérité (🔴 Critique, 🟡 Moyenne, 🟠 Basse)
- Des **recommandations concrètes** avec effort estimé (S/M/L/XL)

---

## Contexte technique de la plateforme

### Stack technologique
| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | Next.js + React + TailwindCSS | 14.2.35 / React 18 / Tailwind 3.4 |
| Backend | Convex (serverless DB + functions + file storage) | 1.31.7 |
| Auth | Firebase Authentication | 12.9.0 |
| IA | Google Generative AI (Gemini 2.0 Flash) | 0.24.1 |
| Éditeur collaboratif | Tiptap + Yjs + y-webrtc | 3.19.0 / 13.6.29 |
| Stockage secondaire | Supabase (PDFs) | 2.95.3 |
| Tests E2E | Playwright | 1.58.2 |
| Infrastructure | Terraform + Docker + Vercel | - |
| Validation | Zod | 4.3.6 |

### Architecture du schéma — 22+ tables Convex
`users` · `organizations` · `organization_members` · `folders` · `folder_archive_metadata` · `documents` · `document_versions` · `document_comments` · `archive_categories` · `archives` · `archive_certificates` · `destruction_certificates` · `retention_alerts` · `alert_logs` · `signatures` · `signature_workflows` · `audit_logs` · `subscriptions` · `iasted_conversations` · `invoices` · `org_sites` · `org_units` · `business_roles` · `filing_structures` · `filing_cells` · `cell_access_rules` · `cell_access_overrides` · `leads` · `payments`

### 38 fichiers backend Convex (~11 177 lignes)
Fichiers les plus volumineux : `schema.ts` (1115L), `archives.ts` (910L), `organizations.ts` (883L), `documents.ts` (681L), `orgMembers.ts` (589L), `filingCells.ts` (511L), `cellAccessRules.ts` (491L), `archiveConfig.ts` (466L), `signatures.ts` (378L), `lifecycleScheduler.ts` (353L)

### 6 route groups frontend — 145 pages/layouts
- `(admin)` — Administration globale plateforme (analytics, billing, clients, databases, infrastructure, logs, monitoring, organizations, security, users, leads, subscriptions, IAM, formation)
- `(pro)` — Espace entreprise (iDocument, iArchive, iSignature, iAsted, clients, leads, billing, analytics, API, formation, organization, team, settings)
- `(subadmin)` — Sous-administration organisationnelle (clients, iArchive, iDocument, iSignature, leads, organization, parametres, subscriptions, workflow-templates, IAM, formation, design-theme)
- `(institutional)` — Espace institutionnel (iArchive, iDocument, iSignature, iAsted, compliance, formation, users, parametres)
- `(public)` — Pages publiques (guide, solutions/entreprises/administrations/organismes/particuliers, verify/[certificateNumber])
- `(auth)` — Authentification (login, register)
- Routes additionnelles : `onboarding/business`, `onboarding/institution`, `org/[domain]`

### Composants clés
- **Guards** : `AuthLoader`, `DocumentAccessGuard`, `InstitutionalProtectedRoute`, `PersonaProtectedRoute`, `ProtectedRoute`
- **Modules** : file-manager (6 composants), iarchive (10 composants dont `LegalHoldManager`, `IntegrityVerifier`, `CertificateViewer`), idocument (12 composants dont `DocumentEditor`, `WorkflowStatusBar`), isignature (3 composants), iasted (1 composant chat)
- **Hooks** : `useRBAC`, `useAuth`, `useDocumentAccess`, `useFilingAccess`, `useOrgLifecycle`, `useOrgStructure`, `usePersona`, `useSubscription`, `useArchiveEntries`, `useConvexOrgId`
- **Contexts** : `FirebaseAuthContext`, `OrganizationContext`, `PersonaContext`, `ThemeContext`
- **Services** : `paymentService`, `subscriptionService`, `institutionalLicenseService`, + providers (Airtel Money, Stripe, Bank Transfer, Check, Simulation)

### RBAC — 6 niveaux hiérarchiques
| Level | Rôle | Accès routes |
|-------|------|-------------|
| 0 | system_admin | /admin, /sysadmin, tout |
| 1 | platform_admin | /admin, /subadmin, tout sauf système |
| 2 | admin (org) | /subadmin, /pro, /institutional |
| 3 | org_manager | /pro, /institutional |
| 4 | org_member | /pro, /institutional |
| 5 | viewer | /pro (lecture seule) |

### 3 CRON Jobs Convex
1. `lifecycle-transitions` — Toutes les heures (minute 0) : transitions active → semi_active → archived
2. `retention-alerts` — Toutes les heures (minute 30) : alertes pré-archivage et pré-suppression
3. `scheduled-archives` — Toutes les 6h : archivage planifié de dossiers

### Middleware
Routage par sous-domaine : `*.digitalium.io` → `/org/[subdomain]` avec bypass pour Cloud Run, Firebase Hosting, et domaines infrastructure.

---

## Sections de l'audit à produire

### SECTION 1 : Architecture & Qualité du code

**Analyse le code source complet et évalue :**

1.1. **Structure du projet** — Organisation des fichiers, séparation des responsabilités (backend Convex vs frontend Next.js), cohérence des conventions de nommage, DRY vs duplication.

1.2. **Schéma de données** — Analyse chaque table du schema.ts :
- Cohérence des types et validators
- Qualité des index (couverture des queries, index manquants)
- Relations entre tables (FK implicites vs explicites)
- Champs `v.any()` — risques de dérives non typées (notamment `config: v.optional(v.any())` sur organizations)
- Normalisation vs dénormalisation — choix justifiés ou non

1.3. **Qualité des mutations et queries Convex** — Pour chaque fichier backend :
- Validations d'entrée (args Zod/Convex validators)
- Gestion d'erreurs (try/catch, messages explicites)
- Atomicité des opérations (transactions multi-tables)
- Optimisation des queries (N+1, batch, pagination)
- Race conditions potentielles

1.4. **Frontend** — Évalue :
- Utilisation correcte des Server Components vs Client Components
- Gestion de l'état (contexts vs props drilling vs stores)
- Performance (lazy loading, code splitting, optimisation images)
- Accessibilité (a11y)
- Responsive design

1.5. **TypeScript** — Couverture et rigueur :
- Types stricts vs `any`
- Fichiers `.d.ts` personnalisés (html2pdf.d.ts)
- Cohérence entre types frontend (`src/types/`) et validators backend (`convex/schema.ts`)

---

### SECTION 2 : Sécurité

**Audite chaque vecteur de sécurité :**

2.1. **Authentification Firebase** — Évalue :
- Configuration Firebase (rules, providers activés)
- Gestion du token côté client (`FirebaseAuthContext`)
- Expiration/refresh des sessions
- Protection contre le vol de session

2.2. **Autorisation et RBAC** — Analyse critique :
- Le `rbac.ts` définit 4 rôles mais le schema en définit 8 (`platformRole`). Évaluer l'écart et les rôles orphelins (`org_admin`, `org_manager`, `org_member`, `viewer`)
- Les guards frontend (`ProtectedRoute`, `DocumentAccessGuard`, etc.) — consomment-ils réellement les 5 niveaux de la matrice d'accès (cell_access_rules + overrides + module permissions) ?
- Les mutations backend — chaque mutation vérifie-t-elle l'identité et les permissions du caller ?
- Le hook `useRBAC` — compare les permissions level-based vs config-based, identifier les incohérences
- Test : un `membre` level 4 peut-il accéder à des routes/données de level 2 ?

2.3. **Matrice d'accès documentaire** — 5 niveaux identifiés :
- Niveau 1 : Folder visibility (private/shared/team)
- Niveau 2 : Filing cell access rules (orgUnit × cell × accès)
- Niveau 3 : Cell access overrides (user × cell)
- Niveau 4 : Module permissions (business_roles.modulePermissions)
- Niveau 5 : Member overrides (organization_members.moduleOverrides)
- **Question critique** : Ces 5 niveaux sont-ils tous effectivement vérifiés lors de l'accès à un document, tant côté backend (queries) que frontend (guards/hooks) ?

2.4. **Intégrité des archives** — Évalue :
- Le double hash SHA-256 (JSON + PDF) — est-il calculé côté client ou serveur ? Les deux ?
- Peut-on modifier une archive après certification ? (immutabilité)
- Le certificat peut-il être falsifié ?
- La vérification publique (`/verify/[certificateNumber]`) est-elle sécurisée ?

2.5. **Protection des données** — Évalue :
- Données sensibles en clair dans Convex (RCCM, NIF, emails, téléphones)
- Chiffrement au repos et en transit
- RGPD / loi gabonaise sur les données personnelles
- Supabase — sécurité de la connexion et des buckets PDF

2.6. **Middleware** — Le routing par sous-domaine est-il sûr ?
- Peut-on injecter un subdomain malveillant ?
- Les bypasses (Cloud Run, Firebase) sont-ils trop permissifs ?
- XSS/CSRF sur les pages publiques org

---

### SECTION 3 : Modules métier — Analyse fonctionnelle approfondie

**Pour chaque module, produis :**
- Inventaire complet des mutations et queries
- Diagramme du flux end-to-end
- Couverture fonctionnelle (ce qui est implémenté vs ce qui manque)
- Cohérence backend ↔ frontend

3.1. **iDocument** — Gestion documentaire
- Cycle de vie complet : création → édition → review → approbation → archivage → corbeille → suppression permanente
- Éditeur Tiptap : évaluer l'intégration Yjs WebRTC (collaboration temps réel), le support offline, les conflits de merge
- Versioning : robustesse de `createVersion` / `restoreVersion`, limites de stockage
- Partage : granularité (lecture/écriture), révocation, expiration des partages
- Templates : flexibilité, personnalisation par organisation
- Import intelligent (IA) : qualité de l'extraction, gestion des erreurs Gemini, fallback si API indisponible

3.2. **iArchive** — Archivage légal conforme OHADA
- Conformité OHADA : vérifier les durées de rétention légales pour chaque catégorie (Fiscal: 10 ans, Social/RH: 5 ans, Juridique: 30 ans, Commercial: 10 ans, Coffre-Fort: perpétuel)
- Pont archiveBridge : analyser les 6 étapes (validation → lifecycle → insert archive → insert certificat → patch archive → patch document → audit logs)
- Lifecycle scheduler : transitions automatiques, robustesse des CRON, gestion des pannes/reprises
- Destruction légale : processus, certificats de destruction, irréversibilité
- Legal hold : application, levée, impact sur le lifecycle (gel des transitions)
- Archivage en masse : gestion des erreurs partielles, idempotence, logging
- Catégories personnalisées vs catégories OHADA prédéfinies : flexibilité

3.3. **iSignature** — Processus de signature
- Workflow : création → attribution → signature/refus/délégation → complétion/annulation
- Trigger auto-archive post-signature : fiabilité, conditions (`inheritToDocuments`, `archivageApresSignature`)
- Workflows templates (`signature_workflows`) : état d'implémentation
- Multi-signataires : ordre séquentiel vs parallèle
- Valeur juridique : horodatage, traçabilité, non-répudiation

3.4. **iAsted** — Assistant IA conversationnel
- État d'implémentation (table `iasted_conversations`, composant `AstedChat`)
- Intégration Gemini : prompts, contexte organisationnel, qualité des réponses
- Historique des conversations : persistance, confidentialité

3.5. **Data Rooms** — Salles de données clients
- Architecture (basée sur folders avec tag `data-room`)
- Partage par email client : sécurité, expiration, traçabilité des accès
- Granularité des permissions : lecture seule, téléchargement, commentaires

3.6. **Gestion des organisations** — Lifecycle complet
- Wizard de création (3 étapes) → `createDraft`
- Checklist de configuration (6 étapes : profil, structure org, classement, modules, automatisation, déploiement)
- Transitions d'état : brouillon → prête → active → suspended → résiliée (+ branches trial)
- Seeding automatique OHADA à l'activation
- Configuration universelle (`config: v.any()`) — risque de schema drift

3.7. **Gestion des membres**
- Cycle de vie : invitation → active → suspended → departed (soft-delete)
- Multi-postes (assignments multiples)
- Guard dernier admin
- Transfert de rôle/unité au départ
- Dérivation automatique du level depuis le business_role

3.8. **Leads & Pipeline commercial**
- Pipeline : new → contacted → qualified → proposal → negotiation → converted → lost
- Gap conversion lead → client : existe-t-il une mutation automatique ?
- KPIs et analytics

3.9. **Subscriptions & Paiements**
- Modèle d'abonnement (tables subscriptions, invoices, payments)
- Providers implémentés : Airtel Money, Stripe, Bank Transfer, Check, Simulation
- État réel : simulation vs production
- Gestion des essais (trial)
- Facturation récurrente

3.10. **Notifications**
- Architecture (`notifications.ts` lit alert_logs + audit_logs)
- Canaux : in-app uniquement ? email ? push ?
- Consommation côté frontend : composant de notification, temps réel

3.11. **Formation**
- Routes formation dans admin, pro, subadmin, institutional
- Contenu et état d'implémentation

---

### SECTION 4 : Performance & Scalabilité

4.1. **Backend Convex**
- Limites Convex (taille documents, nombre de queries simultanées, cold starts)
- Optimisation des queries (index utilisés, queries N+1, pagination)
- CRON jobs : impact sur les performances si le nombre d'archives/organisations augmente

4.2. **Frontend Next.js**
- Analyse du bundle size (dépendances lourdes : Tiptap, Yjs, Recharts, html2pdf, xlsx, mammoth)
- Server-side rendering vs client-side rendering — choix par page
- Image optimization
- Lazy loading des modules

4.3. **Stockage**
- Double stockage Convex + Supabase : justification, coûts, cohérence
- Quotas par organisation : enforcement réel ?
- Nettoyage des fichiers orphelins

4.4. **Temps réel**
- WebRTC (Yjs) : limite de pairs simultanés, NAT traversal, fallback signaling
- Convex real-time subscriptions : charge sur le backend

---

### SECTION 5 : Tests & Qualité

5.1. **Tests existants**
- E2E Playwright : `e2e/iarchive.spec.ts` — quelle couverture ?
- Tests unitaires : existent-ils ?
- Tests d'intégration backend : existent-ils ?

5.2. **Couverture cible recommandée**
- Matrice de tests par module (iDocument, iArchive, iSignature, etc.)
- Tests de sécurité (injection, RBAC bypass, escalation de privilèges)
- Tests de performance (charge, stress)

5.3. **CI/CD**
- Pipeline actuel (Vercel deployment)
- Scripts (`seed-demo-accounts.ts`, `migrate_to_convex.ts`, `inspect_db.ts`)
- Environnements (dev, staging, production)

---

### SECTION 6 : Infrastructure & DevOps

6.1. **Déploiement**
- Vercel (frontend) — configuration `vercel.json`
- Convex (backend) — déploiement automatique
- Terraform (`infrastructure/main.tf`, `versions.tf`) — quelles ressources ?
- Docker (`Dockerfile`) — pour quoi ?
- Supabase — migrations (`supabase/migrations/`)

6.2. **Monitoring & Observabilité**
- Route admin `/monitoring` — qu'est-ce qui est surveillé ?
- Logs (`/admin/logs`) — audit_logs Convex ou logs infrastructure ?
- Alerting : mécanismes en place ?

6.3. **Sécurité infrastructure**
- Route `/admin/security` — fonctionnalités
- IAM (`/admin/iam`, `/subadmin/iam`) — gestion des accès infrastructure
- Backups (`/admin/databases/backups`) — stratégie et fréquence
- Replicas (`/admin/databases/replicas`) — haute disponibilité

---

### SECTION 7 : Conformité légale & réglementaire

7.1. **OHADA** — Acte Uniforme relatif au Droit Comptable (AUDCIF)
- Durées de rétention par catégorie : conformes aux textes ?
- Destruction légale : certificat conforme ?
- Intégrité des archives (hash SHA-256) : valeur probante en droit OHADA ?

7.2. **CEMAC** — Réglementation régionale
- Archivage électronique : cadre légal applicable
- Signature électronique : reconnaissance juridique

7.3. **Protection des données**
- Loi gabonaise n°001/2011 relative à la protection des données à caractère personnel
- RGPD (si clients européens)
- Droit à l'effacement vs obligation de rétention légale

7.4. **Vérification publique**
- Route `/verify/[certificateNumber]` — quelle information est exposée publiquement ?
- Risque de fuite d'information sur les documents archivés

---

### SECTION 8 : UX & Parcours utilisateur

8.1. **Onboarding**
- Flux `onboarding/business` vs `onboarding/institution` — différences
- Persona routing (`PersonaContext`, `PersonaProtectedRoute`)
- Temps estimé pour compléter l'onboarding

8.2. **Espaces par persona**
- Pro vs Institutional vs Subadmin — duplication de fonctionnalités ?
- Cohérence de l'expérience entre les espaces

8.3. **Pages publiques**
- Template pages org (`corporate/startup/institution`)
- Solutions sectorielles (entreprises, administrations, organismes, particuliers)
- Guide utilisateur

---

### SECTION 9 : Écosystème & Intégrations

9.1. **IA (Gemini)**
- Smart Import : robustesse, fallback, coûts API
- iAsted : maturité, utilité, confidentialité des données envoyées à Google

9.2. **Paiements**
- Airtel Money : état de l'intégration, spécificités Afrique Centrale
- Stripe : configuration, webhooks
- Mode simulation : comment bascule-t-on en production ?

9.3. **Stockage externe**
- Supabase : raison du double stockage avec Convex, synchronisation
- Risque de désynchronisation entre les deux systèmes

9.4. **Collaboration**
- Yjs WebRTC : limitations (pas de serveur de signaling dédié ?)
- Compatibilité navigateurs

---

### SECTION 10 : Roadmap & Recommandations stratégiques

10.1. **Quick wins** (effort S, impact élevé)
10.2. **Améliorations court terme** (effort M, 1-3 mois)
10.3. **Chantiers structurants** (effort L/XL, 3-6 mois)
10.4. **Vision produit** — fonctionnalités manquantes pour le marché cible

---

## Format de sortie attendu

L'audit doit être produit en **Markdown** avec :
- Des tableaux de synthèse par section
- Des scores de maturité (/10) par domaine
- Un tableau récapitulatif de tous les gaps identifiés (ID, description, sévérité, effort de correction, section)
- Des diagrammes Mermaid pour les flux critiques
- Une conclusion exécutive de 10-15 lignes

**Longueur attendue :** 3000-5000 lignes de Markdown structuré.

---

## Fichiers à analyser en priorité

### Backend (par ordre d'importance)
1. `convex/schema.ts` — Schéma complet (1115 lignes)
2. `convex/archives.ts` — Module iArchive (910 lignes)
3. `convex/organizations.ts` — Organisations (883 lignes)
4. `convex/documents.ts` — iDocument (681 lignes)
5. `convex/orgMembers.ts` — Gestion membres (589 lignes)
6. `convex/signatures.ts` — iSignature (378 lignes)
7. `convex/lifecycleScheduler.ts` — CRON lifecycle (353 lignes)
8. `convex/archiveBridge.ts` — Pont iDoc→iArchive (232 lignes)
9. `convex/automationEngine.ts` — Automatisation (taille à vérifier)
10. `convex/cellAccessRules.ts` — Matrice d'accès (491 lignes)
11. `convex/cellAccessOverrides.ts` — Overrides accès
12. `convex/businessRoles.ts` — Rôles métier (296 lignes)
13. `convex/leads.ts` — Pipeline commercial (295 lignes)
14. `convex/clients.ts` — Gestion clients (216 lignes)
15. `convex/org_lifecycle.ts` — Lifecycle org (244 lignes)
16. `convex/notifications.ts` — Notifications
17. `convex/dataRooms.ts` — Data Rooms (218 lignes)
18. `convex/aiSmartImport.ts` — Import IA (224 lignes)
19. `convex/crons.ts` — Tâches planifiées
20. `convex/payments.ts` — Paiements
21. `convex/subscriptions.ts` — Abonnements

### Frontend (par ordre d'importance)
1. `src/config/rbac.ts` — Configuration RBAC
2. `src/hooks/useRBAC.ts` — Hook RBAC
3. `src/hooks/useAuth.ts` — Hook authentification
4. `src/hooks/useDocumentAccess.ts` — Accès documents
5. `src/hooks/useFilingAccess.ts` — Accès classement
6. `src/components/guards/` — Tous les guards (6 fichiers)
7. `src/contexts/` — Tous les contexts (4 fichiers)
8. `src/middleware.ts` — Routing sous-domaine
9. `src/services/paymentService.ts` — Service paiement
10. `src/services/subscriptionService.ts` — Service abonnement
11. `src/components/modules/iarchive/` — 10 composants
12. `src/components/modules/idocument/` — 12 composants
13. `src/components/modules/isignature/` — 3 composants

### Infrastructure & Config
1. `infrastructure/main.tf` — Terraform
2. `Dockerfile` — Container
3. `vercel.json` — Déploiement Vercel
4. `firebase.json` — Config Firebase
5. `supabase/config.toml` + `supabase/migrations/`
6. `e2e/iarchive.spec.ts` — Tests E2E
7. `playwright.config.ts` — Config tests

---

## Notes importantes pour l'auditeur

1. **Convex est serverless** — il n'y a pas de middleware backend traditionnel. Chaque mutation/query est une fonction isolée. L'authentification doit être vérifiée dans chaque fonction individuellement.

2. **Le RBAC a deux systèmes parallèles** — un basé sur les levels (0-5) et un basé sur les permissions config (`ROLE_PERMISSIONS`). Vérifier qu'ils sont cohérents et qu'aucun ne peut être contourné.

3. **Le schéma utilise `v.any()` pour le champ `config` des organisations** — c'est un trou typé qui peut contenir n'importe quoi. Évaluer le risque.

4. **Le double stockage Convex + Supabase** doit être justifié — y a-t-il un risque de désynchronisation ?

5. **Les payment providers incluent un mode `simulation`** — vérifier qu'il ne peut pas être activé en production par erreur.

6. **Le middleware de sous-domaine** est critique pour l'isolation des données entre organisations.

7. **L'archivage légal** est la valeur différenciante principale — l'intégrité SHA-256 et la conformité OHADA doivent être irréprochables.

8. **Il y a 8 rôles dans le schema mais seulement 4 dans la config RBAC** — les rôles `org_admin`, `org_manager`, `org_member`, `viewer` sont dans le schema mais pas dans `rbac.ts`. Vérifier si c'est intentionnel ou un gap.
