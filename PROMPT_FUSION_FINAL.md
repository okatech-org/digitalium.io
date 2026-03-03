# DIGITALIUM.IO — Prompt d'Implémentation Fusionné (Final)
# Module iArchive Complet · Pont iDocument→iArchive · Configuration Organisation

> **Plateforme** : digitalium.io
> **Stack** : Next.js 14 · Convex (backend temps réel) · Supabase Storage · TailwindCSS · TypeScript
> **Conformité** : OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires)
> **Date** : Mars 2026
> **Stratégie** : 2 itérations — Cœur fonctionnel d'abord, Organisation & Automatisation ensuite

---

## TABLE DES MATIÈRES

**CONTEXTE & DIAGNOSTIC**
1. [État des lieux complet](#1-état-des-lieux-complet)
2. [Problèmes identifiés (classés par sévérité)](#2-problèmes-identifiés)
3. [Décisions architecturales](#3-décisions-architecturales)

**ITÉRATION 1 — Cœur fonctionnel** (Priorité immédiate)
4. [Phase 1 : Schema & Corrections Backend](#phase-1--schema--corrections-backend)
5. [Phase 2 : Pont iDocument → iArchive (archiveBridge)](#phase-2--pont-idocument--iarchive)
6. [Phase 3 : Destruction légale & Scheduler](#phase-3--destruction-légale--scheduler)
7. [Phase 4 : CRUD Dossiers (folders.ts)](#phase-4--crud-dossiers)
8. [Phase 5 : Frontend — ArchiveModal connecté](#phase-5--frontend--archivemodal-connecté)
9. [Phase 6 : Frontend — ArchiveListPage connecté](#phase-6--frontend--archivelistpage-connecté)
10. [Phase 7 : Upload manuel dans iArchive](#phase-7--upload-manuel-dans-iarchive)
11. [Phase 8 : Détail, Recherche, Certificats connectés](#phase-8--détail-recherche-certificats-connectés)
12. [Phase 9 : Dashboard iArchive](#phase-9--dashboard-iarchive)
13. [Phase 10 : Tags, WorkflowStatusBar, Corrections UX](#phase-10--tags-workflowstatusbar-corrections-ux)

**ITÉRATION 2 — Organisation & Automatisation**
14. [Phase 11 : Synchronisation Structure de Classement ↔ iDocument](#phase-11--synchronisation-structure-de-classement--idocument)
15. [Phase 12 : Matrice d'Accès dynamique](#phase-12--matrice-daccès-dynamique)
16. [Phase 13 : Multi-postes & Affectations](#phase-13--multi-postes--affectations)
17. [Phase 14 : Configuration Organisation complète](#phase-14--configuration-organisation-complète)
18. [Phase 15 : Tagging avancé (héritage dossier→document)](#phase-15--tagging-avancé)
19. [Phase 16 : Moteur d'automatisation (workflows runtime)](#phase-16--moteur-dautomatisation)

**VÉRIFICATION**
20. [Plan de tests complet](#20-plan-de-tests-complet)
21. [Fichiers critiques — Matrice complète](#21-fichiers-critiques)

---

## 1. ÉTAT DES LIEUX COMPLET

### 1.1 Ce qui est IMPLÉMENTÉ et FONCTIONNEL

| # | Composant | Fichiers clés | Notes |
|---|-----------|---------------|-------|
| 1 | Schéma DB complet (archives, archive_categories, retention_alerts, alert_logs, folders, documents) | `convex/schema.ts` | 22 tables définies |
| 2 | CRON lifecycle-transitions (horaire, minute 0) | `convex/crons.ts` | Transitions active→semi→archived |
| 3 | CRON retention-alerts (horaire, minute 30) | `convex/crons.ts`, `convex/retentionAlerts.ts` | Dédupliqué via alert_logs |
| 4 | Config admin iArchive (4 sous-onglets) | `IArchiveConfigPanel.tsx` | UI complète |
| 5 | 5 catégories OHADA par défaut (seedées) | `convex/archiveConfig.ts` | Fiscal, Social/RH, Juridique, Commercial, Coffre-Fort |
| 6 | UI explorateur Finder (grid/list/column) | `ArchiveListPage.tsx` | 100% mock data |
| 7 | Vérification intégrité SHA-256 | `IntegrityVerifier.tsx` | Client-side |
| 8 | Certificats d'archivage numériques | `CertificateViewer.tsx` | Génération |
| 9 | Coffre-Fort (PIN + accès admin) | `pro/iarchive/vault/page.tsx` | UI complète |
| 10 | Recherche full-text avec filtres | `ArchiveSearchBar.tsx` | UI fonctionnelle |
| 11 | Workflow document (draft→review→approved→archived) | `convex/documents.ts` | Mutations OK |
| 12 | Filing structures + cells | `convex/filingStructures.ts`, `convex/filingCells.ts` | CRUD OK |
| 13 | Matrice d'accès (cell_access_rules + overrides) | `convex/cellAccessRules.ts` | Résolution OK |
| 14 | Organisation wizard 3 étapes | `convex/organizations.ts` | brouillon→prête→active |
| 15 | Membres + rôles + niveaux dérivés (0-5) | `convex/orgMembers.ts` | Complet |
| 16 | Table `folders` avec `archiveSchedule` | `convex/schema.ts:242-279` | Défini mais aucun CRUD |

### 1.2 Ce qui est en état de MAQUETTE (UI sans backend)

| # | Composant | Problème |
|---|-----------|----------|
| 1 | `ArchiveModal.tsx` | 100% client-side, appelle `onConfirm` mais ne crée aucune archive dans Convex |
| 2 | `ArchiveListPage.tsx` | 100% données mock hardcodées, aucune query Convex |
| 3 | `ArchiveDetailSheet.tsx` | Données statiques |
| 4 | `ArchiveSearchBar.tsx` | Recherche sur données mock |

---

## 2. PROBLÈMES IDENTIFIÉS

### Sévérité CRITIQUE (bloquent le fonctionnement)

| # | Problème | Fichier | Ligne | Détail |
|---|----------|---------|-------|--------|
| P1 | **Flux iDocument→iArchive coupé** | `convex/documents.ts` | 358-385 | `archiveDocument` change seulement `status:"archived"`, ne crée PAS d'entrée dans la table `archives` |
| P2 | **ArchiveModal en démo** | `ArchiveModal.tsx` | Tout | Aucun appel Convex, catégories hardcodées avec mauvais slugs |
| P3 | **ArchiveListPage en mock** | `ArchiveListPage.tsx` | Tout | Données fictives, aucune query Convex |
| P4 | **Pas de destruction légale** | — | — | Aucune mutation `destroy`, aucun certificat de destruction |
| P5 | **Lifecycle scheduler incomplet** | `lifecycleScheduler.ts` | 78-98 | S'arrête à `"archived"`, ne gère pas l'expiration ni la destruction |

### Sévérité MAJEURE (fonctionnement dégradé)

| # | Problème | Fichier | Ligne | Détail |
|---|----------|---------|-------|--------|
| P6 | **RETENTION_MAP hardcodé** | `convex/archives.ts` | 18-24 | Utilise un map fixe au lieu de lire `archive_categories` |
| P7 | **Slugs incohérents** | `archives.ts` vs `archiveConfig.ts` | — | Modal/mutation utilisent `"legal"/"vault"` mais archiveConfig seedle `"juridique"/"coffre"` |
| P8 | **`categoryId` jamais peuplé** | `convex/archives.ts` | 109 | Champ `categoryId` existe dans le schéma mais `createArchiveEntry` ne le remplit pas |
| P9 | **`sourceDocumentId` jamais peuplé** | `convex/schema.ts` | 305 | Défini sur documents mais jamais renseigné |
| P10 | **`archiveSchedule` sur folders jamais implémenté** | `convex/schema.ts` | 258 | Défini dans le schéma mais aucun CRUD, aucun cron |
| P11 | **Tags archives pas dans le schéma** | `convex/schema.ts` | 381 | Pas de champ `tags` sur la table `archives` |
| P12 | **Pas de `convex/folders.ts`** | — | — | Aucun CRUD pour les dossiers malgré la table définie |
| P13 | **Filing Structure déconnectée de iDocument** | — | — | `dynamicFolders` jamais peuplé, filing_cells invisible dans iDocument |

### Sévérité MOYENNE (UX/cosmétique)

| # | Problème | Fichier | Détail |
|---|----------|---------|--------|
| P14 | **Bug affichage changement de vue** | `ArchiveListPage.tsx:283` | `viewMode` hardcodé à `"grid"` au lieu de `getInitialViewMode()` |
| P15 | **Renommage "Écosystème"** | `admin.ts`, 5 sections | Doit être "Structure de Classement" |
| P16 | **Coffre-Fort dans iArchive** | — | Confirmé correct (conservation perpétuelle = archivage) |
| P17 | **Doublon "Brouillon"** | — | Non-problème : c'est un statut (filtre), pas un dossier |

---

## 3. DÉCISIONS ARCHITECTURALES

### 3.1 Double Hash SHA-256

Chaque document archivé depuis iDocument reçoit **deux hash** :

| Hash | Champ | Quoi | Pourquoi |
|------|-------|------|----------|
| **contentHash** | `contentHash: string` | SHA-256 du JSON TipTap gelé (`frozenContent`) | Intégrité interne : prouver que le contenu n'a pas été altéré |
| **pdfHash** | `pdfHash: string` | SHA-256 du PDF généré | Intégrité légale : le certificat officiel référence ce hash |

Le champ existant `sha256Hash` est conservé pour les uploads manuels (fichiers non-TipTap).

**Flux technique :**
1. Côté client : geler le contenu TipTap (`JSON.stringify(content)`)
2. Côté client : calculer `contentHash` via `crypto.subtle.digest('SHA-256', ...)`
3. Côté client : générer le PDF via `html2pdf.js` ou `@react-pdf/renderer`
4. Côté client : uploader le PDF sur Supabase Storage → obtenir `pdfUrl`
5. Côté client : calculer `pdfHash` via `crypto.subtle.digest('SHA-256', ...)`
6. Appel mutation `archiveBridge.archiveDocument` avec `contentHash`, `pdfUrl`, `pdfHash`, `frozenContent`

### 3.2 Destruction configurable par catégorie

Chaque `archive_categories` reçoit un nouveau champ :

```typescript
autoDestroy: v.optional(v.boolean())  // défaut: false
```

| `autoDestroy` | `isPerpetual` | Comportement à l'expiration |
|---------------|---------------|----------------------------|
| `false` (défaut) | `false` | Admin reçoit alerte → valide destruction manuellement → certificat |
| `true` | `false` | CRON détecte expiration → destruction auto → certificat auto |
| `*` | `true` | **JAMAIS détruit** (Coffre-Fort perpétuel) |

### 3.3 Source Type (traçabilité)

Chaque archive enregistre comment elle a été créée :

```typescript
sourceType: v.union(
  v.literal("manual_upload"),      // Upload direct dans iArchive
  v.literal("document_archive"),   // Archivage depuis iDocument (pont)
  v.literal("folder_archive"),     // Archivage en masse d'un dossier
  v.literal("auto_archive")       // Archivage automatique (workflow/schedule)
)
```

### 3.4 Slugs canoniques

Les slugs canoniques sont ceux de `archiveConfig.ts` (source de vérité) :

| Ancien (à corriger) | Nouveau (canonique) | Catégorie |
|---------------------|---------------------|-----------|
| `"legal"` | `"juridique"` | Juridique |
| `"vault"` | `"coffre"` | Coffre-Fort |
| `"client"` | `"commercial"` | Commercial |
| `"fiscal"` | `"fiscal"` | Fiscal (inchangé) |
| `"social"` | `"social"` | Social/RH (inchangé) |

> **Note critique :** Le slug `"client"` dans archiveConfig.ts doit être changé en `"commercial"` pour correspondre au nom de la catégorie "Commercial". Alternativement, garder `"client"` partout si c'est l'intention métier. **Décision : garder `"client"` comme slug technique, mais afficher "Commercial" comme label UI.**

### 3.5 Cycle de vie complet d'un document

```
1. CRÉATION (iDocument)
   └─ draft → review → approved

2. DÉCLENCHEMENT ARCHIVAGE
   ├─ Manuel : bouton "Archiver" sur doc approved (admin/manager)
   ├─ Auto-signature : trigger signature.completed → auto_archive (Itération 2)
   ├─ Auto-schedule : archiveSchedule sur folder → cron check (Itération 2)
   └─ Auto-workflow : step auto_archive dans workflow org (Itération 2)

3. PROCESSUS D'ARCHIVAGE (archiveBridge)
   ├─ Gel du contenu (snapshot JSON TipTap frozen)
   ├─ Calcul SHA-256 du JSON gelé (contentHash — intégrité interne)
   ├─ Génération PDF depuis le contenu TipTap (côté client)
   ├─ Upload PDF vers Supabase Storage
   ├─ Calcul SHA-256 du PDF généré (pdfHash — intégrité légale)
   ├─ Création entrée archives (avec categoryId réel, lifecycle dates, double hash)
   ├─ Création certificat d'intégrité (référence le pdfHash)
   ├─ Mise à jour document.status = "archived" + archiveId + archivedAt
   └─ Audit log x2 (document.archive + archive.created)

4. PHASE ACTIVE (iArchive)
   └─ Durée = archive_categories.activeDurationYears
       ├─ Document accessible, recherche priorisée
       ├─ Alertes pré-archive configurables (X mois/semaines avant fin)
       └─ Compteur depuis countingStartEvent

5. PHASE SEMI-ACTIVE (si hasSemiActivePhase)
   └─ Durée = archive_categories.semiActiveDurationYears
       ├─ Document accessible, recherche dé-priorisée
       └─ Alertes pré-destruction

6. PHASE ARCHIVÉE
   └─ Durée = retentionYears - activeDuration - semiActiveDuration
       ├─ Accès restreint
       └─ Attente expiration de la rétention

7. SORT FINAL (à l'expiration de retentionExpiresAt)
   ├─ Option A : DESTRUCTION AUTO (si autoDestroy=true sur catégorie)
   │   └─ Cron détecte fin rétention → génère certificat destruction → status="destroyed"
   ├─ Option B : DESTRUCTION MANUELLE (si autoDestroy=false, défaut)
   │   └─ Admin reçoit alerte → valide destruction → certificat + audit log
   ├─ Option C : PROLONGATION (extendRetention — admin prolonge la durée)
   ├─ Option D : TRANSFERT COFFRE-FORT (reclasser en perpétuel)
   └─ COFFRE-FORT : Perpétuel (isPerpetual=true), jamais détruit automatiquement
```

### 3.6 Événements de début de comptage

| Événement | Code | Déclencheur | Exemple |
|-----------|------|-------------|---------|
| Date de création | `date_creation` | Automatique à l'upload/création | Contrat de travail : dès la signature |
| Date clôture | `date_cloture` | Événement métier externe | Bilan comptable : après clôture exercice |
| Date tag | `date_tag` | Quand l'utilisateur tague le document | Document fiscal : dès le dépôt aux archives |
| Date gel | `date_gel` | Quand le document est verrouillé | Coffre-Fort : dès le scellement |

### 3.7 Formule de calcul des transitions

```
ENTRÉES :
  T₀ = countingStartDate (timestamp selon l'événement choisi)
  A  = activeDurationYears
  S  = semiActiveDurationYears (peut être 0 si !hasSemiActivePhase)
  R  = retentionYears (durée totale)

CALCULS :
  activeUntil        = T₀ + (A × 365.25 × 24 × 3600 × 1000) ms
  semiActiveUntil    = T₀ + ((A + S) × 365.25 × 24 × 3600 × 1000) ms  [si S > 0, sinon null]
  retentionExpiresAt = T₀ + (R × 365.25 × 24 × 3600 × 1000) ms

CONTRAINTE : A + S ≤ R

EXEMPLE (Fiscal, T₀ = 01/01/2026) :
  A=5, S=3, R=10
  activeUntil        = 01/01/2031
  semiActiveUntil    = 01/01/2034
  retentionExpiresAt = 01/01/2036
  Phase archivée     = 2 ans (2034 → 2036)
```

---

# ITÉRATION 1 — CŒUR FONCTIONNEL

---

## Phase 1 : Schema & Corrections Backend

**Objectif :** Mettre à jour le schéma Convex et corriger les mutations existantes pour supporter le nouveau flux.

### 1.1 Modifications sur `convex/schema.ts`

#### Table `archives` — Nouveaux champs à ajouter :

```typescript
// Après la ligne sha256Hash existante, AJOUTER :
sourceDocumentId: v.optional(v.id("documents")),  // Lien vers le document source
sourceFolderId: v.optional(v.id("folders")),       // Lien vers le dossier source
sourceType: v.optional(v.union(
    v.literal("manual_upload"),
    v.literal("document_archive"),
    v.literal("folder_archive"),
    v.literal("auto_archive")
)),
tags: v.optional(v.array(v.string())),             // Tags libres
archivedBy: v.optional(v.string()),                // userId de l'archiveur

// ── Double hash (contenu TipTap) ──
frozenContent: v.optional(v.any()),                // Snapshot JSON du contenu TipTap gelé
contentHash: v.optional(v.string()),               // SHA-256 du JSON gelé (intégrité interne)
pdfUrl: v.optional(v.string()),                    // URL du PDF généré (Supabase Storage)
pdfHash: v.optional(v.string()),                   // SHA-256 du PDF (intégrité légale, réf certificat)
```

#### Table `archives` — Modifier `lifecycleState` pour inclure `"destroyed"` :

```typescript
// AVANT :
lifecycleState: v.optional(v.union(
    v.literal("active"),
    v.literal("semi_active"),
    v.literal("archived")
)),

// APRÈS :
lifecycleState: v.optional(v.union(
    v.literal("active"),
    v.literal("semi_active"),
    v.literal("archived"),
    v.literal("destroyed")
)),
```

#### Table `archives` — Nouveaux index :

```typescript
.index("by_sourceDocumentId", ["sourceDocumentId"])
.index("by_sourceType", ["sourceType"])
.index("by_tags", ["tags"])
```

#### Table `archive_categories` — Ajouter `autoDestroy` :

```typescript
// AJOUTER après isPerpetual :
autoDestroy: v.optional(v.boolean()),  // true = destruction auto à l'expiration. Défaut: false
```

#### Nouvelle table `destruction_certificates` :

```typescript
destruction_certificates: defineTable({
    // ── Référence ──
    certificateNumber: v.string(),                    // DEST-YYYY-NNNNN (unique)
    archiveId: v.id("archives"),
    organizationId: v.id("organizations"),

    // ── Informations du document détruit ──
    documentTitle: v.string(),
    documentCategory: v.string(),                     // Nom de la catégorie
    documentCategorySlug: v.string(),                 // Slug de la catégorie
    originalFileName: v.string(),
    originalFileSize: v.number(),
    originalMimeType: v.string(),
    originalSha256Hash: v.string(),                   // Hash du fichier original
    originalContentHash: v.optional(v.string()),      // Hash JSON TipTap (si document_archive)
    originalPdfHash: v.optional(v.string()),          // Hash PDF (si document_archive)
    originalCreatedAt: v.number(),
    originalArchivedAt: v.number(),

    // ── Rétention ──
    retentionYears: v.number(),
    retentionExpiresAt: v.number(),
    ohadaReference: v.optional(v.string()),           // Réf OHADA applicable
    ohadaCompliant: v.boolean(),                      // true si destruction après expiration complète

    // ── Destruction ──
    destroyedAt: v.number(),
    destroyedBy: v.string(),                          // userId
    destructionMethod: v.union(
        v.literal("legal_expiry"),                    // Fin de rétention légale (auto ou validée)
        v.literal("manual_request"),                  // Demande admin anticipée
        v.literal("compliance")                       // Décision DPO/compliance
    ),
    destructionReason: v.string(),                    // Description libre

    // ── Validation ──
    approvedBy: v.optional(v.string()),               // userId du validateur (requis si manuelle)
    approvedAt: v.optional(v.number()),

    // ── Témoins (conformité renforcée, optionnel) ──
    witnesses: v.optional(v.array(v.object({
        userId: v.string(),
        name: v.string(),
        role: v.string(),
        acknowledgedAt: v.number(),
    }))),

    // ── Métadonnées certificat ──
    status: v.union(v.literal("valid"), v.literal("revoked")),
    issuedAt: v.number(),
})
.index("by_certificateNumber", ["certificateNumber"])
.index("by_organizationId", ["organizationId"])
.index("by_archiveId", ["archiveId"]),
```

#### Table `documents` — Ajouter champs de liaison :

```typescript
// AJOUTER après sourceDocumentId existant :
archiveId: v.optional(v.id("archives")),             // Lien vers l'archive créée
archivedAt: v.optional(v.number()),                  // Timestamp d'archivage
archiveCategorySlug: v.optional(v.string()),         // Slug catégorie pour affichage rapide
```

### 1.2 Corrections sur `convex/archives.ts`

#### Supprimer le RETENTION_MAP hardcodé :

```typescript
// ❌ SUPPRIMER (lignes 18-24) :
const RETENTION_MAP: Record<string, number> = {
    fiscal: 10,
    social: 5,
    legal: 30,    // Bug: devrait être "juridique"
    client: 5,
    vault: 99,    // Bug: devrait être "coffre"
};

// ❌ SUPPRIMER le type archiveCategory hardcodé (lignes 8-14) :
const archiveCategory = v.union(
    v.literal("fiscal"),
    v.literal("social"),
    v.literal("legal"),
    v.literal("client"),
    v.literal("vault")
);
```

#### Réécrire `createArchiveEntry` pour utiliser `archive_categories` :

```typescript
export const createArchiveEntry = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        categorySlug: v.string(),                         // Slug dynamique
        organizationId: v.id("organizations"),
        uploadedBy: v.string(),
        fileUrl: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        sha256Hash: v.string(),
        tags: v.optional(v.array(v.string())),
        confidentiality: v.optional(v.string()),
        countingStartDate: v.optional(v.number()),
        // Double hash (optionnel, pour les archives de type document_archive)
        frozenContent: v.optional(v.any()),
        contentHash: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        pdfHash: v.optional(v.string()),
        sourceDocumentId: v.optional(v.id("documents")),
        sourceFolderId: v.optional(v.id("folders")),
        sourceType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Charger la catégorie depuis la DB (plus de hardcode)
        const categories = await ctx.db
            .query("archive_categories")
            .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
            .filter((q) =>
                args.organizationId
                    ? q.eq(q.field("organizationId"), args.organizationId)
                    : true
            )
            .first();

        if (!categories) {
            throw new Error(`Catégorie "${args.categorySlug}" introuvable pour cette organisation`);
        }

        // 2. Calculer les dates de lifecycle
        const T0 = args.countingStartDate ?? now;
        const msPerYear = 365.25 * 24 * 3600 * 1000;

        const activeDuration = (categories.activeDurationYears ?? categories.retentionYears) * msPerYear;
        const semiActiveDuration = (categories.semiActiveDurationYears ?? 0) * msPerYear;
        const totalRetention = categories.retentionYears * msPerYear;

        const activeUntil = T0 + activeDuration;
        const semiActiveUntil = categories.hasSemiActivePhase
            ? T0 + activeDuration + semiActiveDuration
            : undefined;
        const retentionExpiresAt = T0 + totalRetention;

        // 3. Créer l'archive avec tous les champs
        const archiveId = await ctx.db.insert("archives", {
            title: args.title,
            description: args.description,
            categoryId: categories._id,                    // ✅ Maintenant peuplé
            categorySlug: args.categorySlug,
            organizationId: args.organizationId,
            uploadedBy: args.uploadedBy,
            archivedBy: args.uploadedBy,
            fileUrl: args.fileUrl,
            fileName: args.fileName,
            fileSize: args.fileSize,
            mimeType: args.mimeType,
            sha256Hash: args.sha256Hash,
            tags: args.tags ?? [],
            // Double hash
            frozenContent: args.frozenContent,
            contentHash: args.contentHash,
            pdfUrl: args.pdfUrl,
            pdfHash: args.pdfHash,
            // Traçabilité
            sourceDocumentId: args.sourceDocumentId,
            sourceFolderId: args.sourceFolderId,
            sourceType: args.sourceType ?? "manual_upload",
            // Lifecycle
            retentionYears: categories.retentionYears,
            retentionExpiresAt,
            status: "active",
            lifecycleState: "active",
            countingStartDate: T0,
            triggerEvent: categories.countingStartEvent,
            activeUntil,
            semiActiveUntil,
            stateChangedAt: now,
            // Métadonnées
            metadata: {
                confidentiality: args.confidentiality ?? categories.defaultConfidentiality ?? "internal",
            },
            isVault: categories.isPerpetual ?? false,
            createdAt: now,
            updatedAt: now,
        });

        return archiveId;
    },
});
```

### 1.3 Ajouter index manquant sur `archive_categories`

```typescript
// Ajouter dans schema.ts sur archive_categories :
.index("by_slug", ["slug"])
.index("by_organizationId_slug", ["organizationId", "slug"])
```

### 1.4 Mise à jour `convex/archiveConfig.ts`

Ajouter `autoDestroy: false` dans chaque catégorie par défaut du `DEFAULT_CATEGORIES` :

```typescript
// Pour chaque catégorie (sauf Coffre-Fort) :
autoDestroy: false,

// Pour Coffre-Fort :
autoDestroy: false,  // isPerpetual=true prend le dessus de toute façon
```

### Fichiers modifiés Phase 1 :
- `convex/schema.ts` — Ajouts archives, destruction_certificates, documents
- `convex/archives.ts` — Suppression RETENTION_MAP, réécriture createArchiveEntry
- `convex/archiveConfig.ts` — Ajout autoDestroy dans defaults

---

## Phase 2 : Pont iDocument → iArchive

**Objectif :** Créer le pont complet entre un document approuvé dans iDocument et une entrée dans iArchive, avec double hash et certificat.

### 2.1 Nouveau fichier `convex/archiveBridge.ts`

```typescript
// convex/archiveBridge.ts — NOUVEAU FICHIER
// Pont iDocument → iArchive avec double hash SHA-256

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Mutation principale : Archiver un document ──────────────

export const archiveDocument = mutation({
    args: {
        documentId: v.id("documents"),
        userId: v.string(),
        categorySlug: v.string(),
        tags: v.optional(v.array(v.string())),
        confidentiality: v.optional(v.string()),
        countingStartDate: v.optional(v.number()),
        // Double hash (calculés côté client)
        frozenContent: v.any(),              // JSON TipTap gelé
        contentHash: v.string(),             // SHA-256 du JSON gelé
        pdfUrl: v.string(),                  // URL du PDF sur Supabase Storage
        pdfHash: v.string(),                 // SHA-256 du PDF généré
        pdfFileName: v.string(),             // Nom du fichier PDF
        pdfFileSize: v.number(),             // Taille du PDF en bytes
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // ── 1. Valider le document ──
        const doc = await ctx.db.get(args.documentId);
        if (!doc) throw new Error("Document introuvable");
        if (doc.status !== "approved") {
            throw new Error("Seul un document approuvé peut être archivé");
        }
        if (!doc.organizationId) {
            throw new Error("Le document doit appartenir à une organisation");
        }

        // ── 2. Charger la catégorie ──
        const category = await ctx.db
            .query("archive_categories")
            .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
            .filter((q) => q.eq(q.field("organizationId"), doc.organizationId))
            .first();

        if (!category) {
            throw new Error(`Catégorie "${args.categorySlug}" introuvable`);
        }

        // ── 3. Calculer les dates de lifecycle ──
        const T0 = args.countingStartDate ?? now;
        const msPerYear = 365.25 * 24 * 3600 * 1000;

        const activeUntil = T0 + (category.activeDurationYears ?? category.retentionYears) * msPerYear;
        const semiActiveUntil = category.hasSemiActivePhase
            ? T0 + ((category.activeDurationYears ?? 0) + (category.semiActiveDurationYears ?? 0)) * msPerYear
            : undefined;
        const retentionExpiresAt = T0 + category.retentionYears * msPerYear;

        // ── 4. Créer l'entrée dans archives ──
        const archiveId = await ctx.db.insert("archives", {
            title: doc.title,
            description: doc.excerpt ?? "",
            categoryId: category._id,
            categorySlug: args.categorySlug,
            organizationId: doc.organizationId,
            uploadedBy: args.userId,
            archivedBy: args.userId,
            // Fichier = PDF généré
            fileUrl: args.pdfUrl,
            fileName: args.pdfFileName,
            fileSize: args.pdfFileSize,
            mimeType: "application/pdf",
            sha256Hash: args.pdfHash,          // Hash principal = hash PDF
            // Double hash
            frozenContent: args.frozenContent,
            contentHash: args.contentHash,
            pdfUrl: args.pdfUrl,
            pdfHash: args.pdfHash,
            // Traçabilité
            sourceDocumentId: args.documentId,
            sourceType: "document_archive",
            tags: args.tags ?? [],
            // Lifecycle
            retentionYears: category.retentionYears,
            retentionExpiresAt,
            status: "active",
            lifecycleState: "active",
            countingStartDate: T0,
            triggerEvent: category.countingStartEvent,
            activeUntil,
            semiActiveUntil,
            stateChangedAt: now,
            // Métadonnées
            metadata: {
                confidentiality: args.confidentiality ?? category.defaultConfidentiality ?? "internal",
            },
            isVault: category.isPerpetual ?? false,
            createdAt: now,
            updatedAt: now,
        });

        // ── 5. Générer le certificat d'archivage ──
        // Compter les certificats existants pour numérotation
        const year = new Date(now).getFullYear();
        const existingCerts = await ctx.db
            .query("archive_certificates")
            .collect();
        const certCount = existingCerts.length + 1;
        const certificateNumber = `CERT-${year}-${String(certCount).padStart(5, "0")}`;

        const certId = await ctx.db.insert("archive_certificates", {
            archiveId,
            certificateNumber,
            sha256Hash: args.pdfHash,          // Le certificat référence le hash PDF
            issuedAt: now,
            issuedBy: args.userId,
            validUntil: retentionExpiresAt,
            status: "valid",
        });

        // Lier le certificat à l'archive
        await ctx.db.patch(archiveId, { certificateId: certId });

        // ── 6. Mettre à jour le document dans iDocument ──
        await ctx.db.patch(args.documentId, {
            status: "archived",
            archiveId: archiveId,
            archivedAt: now,
            archiveCategorySlug: args.categorySlug,
            workflowReason: `Archivé dans iArchive — Catégorie: ${category.name}`,
            updatedAt: now,
        });

        // ── 7. Audit logs ──
        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "document.archive",
            resourceType: "document",
            resourceId: args.documentId,
            details: {
                archiveId,
                categorySlug: args.categorySlug,
                certificateNumber,
                contentHash: args.contentHash,
                pdfHash: args.pdfHash,
            },
            createdAt: now,
        });

        await ctx.db.insert("audit_logs", {
            organizationId: doc.organizationId,
            userId: args.userId,
            action: "archive.created",
            resourceType: "archive",
            resourceId: archiveId,
            details: {
                sourceDocumentId: args.documentId,
                sourceType: "document_archive",
                certificateNumber,
            },
            createdAt: now,
        });

        // ── 8. Retour ──
        return {
            archiveId,
            certificateNumber,
            contentHash: args.contentHash,
            pdfHash: args.pdfHash,
            retentionExpiresAt,
            activeUntil,
            semiActiveUntil,
        };
    },
});

// ─── Archivage en masse d'un dossier ────────────────

export const archiveFolder = mutation({
    args: {
        folderId: v.id("folders"),
        categorySlug: v.string(),
        tags: v.optional(v.array(v.string())),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Charger le dossier
        const folder = await ctx.db.get(args.folderId);
        if (!folder) throw new Error("Dossier introuvable");

        // 2. Lister les documents approved du dossier
        const docs = await ctx.db
            .query("documents")
            .withIndex("by_parentFolderId", (q) =>
                q.eq("parentFolderId", args.folderId.toString())
            )
            .filter((q) => q.eq(q.field("status"), "approved"))
            .collect();

        if (docs.length === 0) {
            throw new Error("Aucun document approuvé dans ce dossier");
        }

        // 3. Archiver chaque document (les PDFs doivent être pré-générés côté client)
        // Note: Cette mutation est un orchestrateur.
        // En production, chaque document doit passer par archiveDocument individuellement
        // car la génération PDF se fait côté client.

        // 4. Audit log bulk
        await ctx.db.insert("audit_logs", {
            organizationId: folder.organizationId,
            userId: args.userId,
            action: "folder.archive_initiated",
            resourceType: "folder",
            resourceId: args.folderId,
            details: {
                documentCount: docs.length,
                categorySlug: args.categorySlug,
            },
            createdAt: Date.now(),
        });

        return { documentCount: docs.length, documentIds: docs.map((d) => d._id) };
    },
});
```

### 2.2 Modifier `convex/documents.ts` — Garder l'ancienne mutation comme fallback

L'ancienne mutation `archiveDocument` (lignes 358-385) est conservée mais **dépréciée**. Le nouveau flux passe par `archiveBridge.archiveDocument`.

Ajouter un commentaire :
```typescript
/**
 * @deprecated Utiliser archiveBridge.archiveDocument pour le flux complet avec double hash et certificat.
 * Cette mutation ne crée PAS d'archive dans iArchive.
 */
export const archiveDocument = mutation({ ... });
```

### Fichiers Phase 2 :
- `convex/archiveBridge.ts` — **NOUVEAU** (mutation principale + archiveFolder)
- `convex/documents.ts` — Dépréciation de l'ancienne mutation

---

## Phase 3 : Destruction légale & Scheduler

**Objectif :** Implémenter le cycle de fin de vie complet avec destruction auto/manuelle et certificats.

### 3.1 Nouvelles mutations dans `convex/archives.ts`

```typescript
// ─── Destruction manuelle (demandée par un admin) ───────────

export const requestDestruction = mutation({
    args: {
        archiveId: v.id("archives"),
        userId: v.string(),
        reason: v.string(),
        method: v.union(
            v.literal("legal_expiry"),
            v.literal("manual_request"),
            v.literal("compliance")
        ),
        legalBasis: v.optional(v.string()),
        approvedBy: v.optional(v.string()),
        witnesses: v.optional(v.array(v.object({
            userId: v.string(),
            name: v.string(),
            role: v.string(),
        }))),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Charger l'archive
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive introuvable");

        // 2. Vérifier l'état (doit être "archived" ou "expired")
        if (!["archived", "expired"].includes(archive.status)) {
            throw new Error("Seule une archive en état 'archived' ou 'expired' peut être détruite");
        }

        // 3. Charger la catégorie pour la référence OHADA
        const category = archive.categoryId
            ? await ctx.db.get(archive.categoryId)
            : null;

        // 4. Vérifier que le Coffre-Fort ne peut pas être détruit
        if (archive.isVault || category?.isPerpetual) {
            throw new Error("Les archives du Coffre-Fort (perpétuelles) ne peuvent pas être détruites");
        }

        // 5. Déterminer la conformité OHADA
        const ohadaCompliant = archive.retentionExpiresAt
            ? now >= archive.retentionExpiresAt
            : false;

        // 6. Générer le numéro de certificat
        const year = new Date(now).getFullYear();
        const existingCerts = await ctx.db
            .query("destruction_certificates")
            .collect();
        const certCount = existingCerts.length + 1;
        const certificateNumber = `DEST-${year}-${String(certCount).padStart(5, "0")}`;

        // 7. Créer le certificat de destruction
        const certId = await ctx.db.insert("destruction_certificates", {
            certificateNumber,
            archiveId: args.archiveId,
            organizationId: archive.organizationId!,
            // Document détruit
            documentTitle: archive.title,
            documentCategory: category?.name ?? "Inconnue",
            documentCategorySlug: archive.categorySlug,
            originalFileName: archive.fileName,
            originalFileSize: archive.fileSize,
            originalMimeType: archive.mimeType,
            originalSha256Hash: archive.sha256Hash,
            originalContentHash: archive.contentHash,
            originalPdfHash: archive.pdfHash,
            originalCreatedAt: archive.createdAt,
            originalArchivedAt: archive.stateChangedAt ?? archive.createdAt,
            // Rétention
            retentionYears: archive.retentionYears,
            retentionExpiresAt: archive.retentionExpiresAt,
            ohadaReference: category?.ohadaReference,
            ohadaCompliant,
            // Destruction
            destroyedAt: now,
            destroyedBy: args.userId,
            destructionMethod: args.method,
            destructionReason: args.reason,
            approvedBy: args.approvedBy,
            approvedAt: args.approvedBy ? now : undefined,
            // Témoins
            witnesses: args.witnesses?.map((w) => ({
                ...w,
                acknowledgedAt: now,
            })),
            // Certificat
            status: "valid",
            issuedAt: now,
        });

        // 8. Marquer l'archive comme détruite
        await ctx.db.patch(args.archiveId, {
            status: "destroyed",
            lifecycleState: "destroyed",
            stateChangedAt: now,
            updatedAt: now,
        });

        // 9. Révoquer le certificat d'archivage original (s'il existe)
        if (archive.certificateId) {
            await ctx.db.patch(archive.certificateId, {
                status: "revoked",
            });
        }

        // 10. Audit log
        await ctx.db.insert("audit_logs", {
            organizationId: archive.organizationId,
            userId: args.userId,
            action: "archive.destroyed",
            resourceType: "archive",
            resourceId: args.archiveId,
            details: {
                certificateNumber,
                method: args.method,
                reason: args.reason,
                ohadaCompliant,
            },
            createdAt: now,
        });

        return { certificateNumber, certId, ohadaCompliant };
    },
});

// ─── Prolonger la rétention ─────────────────────────

export const extendRetention = mutation({
    args: {
        archiveId: v.id("archives"),
        additionalYears: v.number(),
        userId: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const archive = await ctx.db.get(args.archiveId);
        if (!archive) throw new Error("Archive introuvable");

        const msPerYear = 365.25 * 24 * 3600 * 1000;
        const extension = args.additionalYears * msPerYear;

        await ctx.db.patch(args.archiveId, {
            retentionYears: archive.retentionYears + args.additionalYears,
            retentionExpiresAt: archive.retentionExpiresAt + extension,
            status: "archived",  // Repasse en archived si était expired
            updatedAt: Date.now(),
        });

        await ctx.db.insert("audit_logs", {
            organizationId: archive.organizationId,
            userId: args.userId,
            action: "archive.retention_extended",
            resourceType: "archive",
            resourceId: args.archiveId,
            details: {
                additionalYears: args.additionalYears,
                newRetentionExpiresAt: archive.retentionExpiresAt + extension,
                reason: args.reason,
            },
            createdAt: Date.now(),
        });
    },
});

// ─── Query : Certificat de destruction ──────────────

export const getDestructionCertificate = query({
    args: { archiveId: v.id("archives") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("destruction_certificates")
            .withIndex("by_archiveId", (q) => q.eq("archiveId", args.archiveId))
            .first();
    },
});
```

### 3.2 Mise à jour `convex/lifecycleScheduler.ts`

Ajouter **après** le bloc `semiActiveArchives` existant (après ligne 98) :

```typescript
// ── Étape 3 : Détecter les archives expirées ──

const archivedItems = await ctx.db
    .query("archives")
    .filter((q) => q.eq(q.field("status"), "archived"))
    .collect();

for (const archive of archivedItems) {
    if (!archive.retentionExpiresAt) continue;
    if (archive.isVault) continue;  // Coffre-Fort = jamais expiré

    if (now >= archive.retentionExpiresAt && archive.status !== "expired" && archive.status !== "destroyed") {
        // Charger la catégorie pour vérifier autoDestroy
        const category = archive.categoryId
            ? await ctx.db.get(archive.categoryId)
            : null;

        const autoDestroy = category?.autoDestroy ?? false;

        if (autoDestroy && !category?.isPerpetual) {
            // ── Destruction automatique ──
            // Générer le certificat de destruction
            const year = new Date(now).getFullYear();
            const existingCerts = await ctx.db.query("destruction_certificates").collect();
            const certCount = existingCerts.length + 1;
            const certificateNumber = `DEST-${year}-${String(certCount).padStart(5, "0")}`;

            await ctx.db.insert("destruction_certificates", {
                certificateNumber,
                archiveId: archive._id,
                organizationId: archive.organizationId!,
                documentTitle: archive.title,
                documentCategory: category?.name ?? "",
                documentCategorySlug: archive.categorySlug,
                originalFileName: archive.fileName,
                originalFileSize: archive.fileSize,
                originalMimeType: archive.mimeType,
                originalSha256Hash: archive.sha256Hash,
                originalContentHash: archive.contentHash,
                originalPdfHash: archive.pdfHash,
                originalCreatedAt: archive.createdAt,
                originalArchivedAt: archive.stateChangedAt ?? archive.createdAt,
                retentionYears: archive.retentionYears,
                retentionExpiresAt: archive.retentionExpiresAt,
                ohadaReference: category?.ohadaReference,
                ohadaCompliant: true,
                destroyedAt: now,
                destroyedBy: "system",
                destructionMethod: "legal_expiry",
                destructionReason: "Destruction automatique après expiration de la rétention légale",
                status: "valid",
                issuedAt: now,
            });

            await ctx.db.patch(archive._id, {
                status: "destroyed",
                lifecycleState: "destroyed",
                stateChangedAt: now,
                updatedAt: now,
            });

            await ctx.db.insert("audit_logs", {
                organizationId: archive.organizationId,
                userId: "system",
                action: "archive.auto_destroyed",
                resourceType: "archive",
                resourceId: archive._id,
                details: { certificateNumber, reason: "auto_destroy" },
                createdAt: now,
            });
        } else {
            // ── Marquage "expired" (attente validation manuelle) ──
            await ctx.db.patch(archive._id, {
                status: "expired",
                stateChangedAt: now,
                updatedAt: now,
            });

            // TODO (Itération 2) : Créer notification in-app pour l'admin
        }

        transitioned++;
    }
}
```

### 3.3 Modèle du Certificat de Destruction

Ce modèle sera utilisé par le frontend pour la génération PDF du certificat :

```
╔══════════════════════════════════════════════════════════════╗
║                  CERTIFICAT DE DESTRUCTION                   ║
║                    N° DEST-2026-00042                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ORGANISATION : OKA TECH SARL                               ║
║  DATE DE DESTRUCTION : 15 mars 2026 à 14:32:07 UTC         ║
║                                                              ║
║  ─── DOCUMENT DÉTRUIT ───                                   ║
║  Titre : Contrat fournisseur ABC Corp                       ║
║  Catégorie : Commercial                                     ║
║  Fichier original : contrat_ABC_2021.pdf (2.4 Mo)          ║
║  Hash SHA-256 (PDF) : a7f3c9...b2d1e8                      ║
║  Hash SHA-256 (JSON) : e2f1a4...c7d3b9                     ║
║  Créé le : 15/03/2021                                       ║
║  Archivé le : 15/03/2023                                    ║
║                                                              ║
║  ─── RÉTENTION ───                                          ║
║  Durée légale : 5 ans (OHADA: Acte Uniforme Commercial)    ║
║  Expiration : 15/03/2026                                    ║
║  Conformité OHADA : ✅ OUI                                  ║
║                                                              ║
║  ─── DESTRUCTION ───                                        ║
║  Méthode : Fin de rétention légale                          ║
║  Motif : Destruction après expiration de la rétention       ║
║  Exécuté par : Asted PELLEN (Admin)                         ║
║  Approuvé par : Ornella KOUMBA (DG)                         ║
║                                                              ║
║  ─── TÉMOINS ───                                            ║
║  • Jean MOUSSAVOU (DSI) — Confirmé le 15/03/2026           ║
║                                                              ║
║  ─── INTÉGRITÉ ───                                          ║
║  Ce certificat atteste que le document référencé ci-dessus  ║
║  a été définitivement détruit conformément aux dispositions  ║
║  de l'OHADA et à la politique de rétention de               ║
║  l'organisation.                                             ║
║                                                              ║
║  Signature numérique : digitalium.io/verify/DEST-2026-00042║
║  Émis par : digitalium.io                                   ║
╚══════════════════════════════════════════════════════════════╝
```

### Fichiers Phase 3 :
- `convex/archives.ts` — requestDestruction, extendRetention, getDestructionCertificate
- `convex/lifecycleScheduler.ts` — Ajout détection expiration + autoDestroy

---

## Phase 4 : CRUD Dossiers

**Objectif :** Créer le fichier `convex/folders.ts` manquant pour exploiter la table `folders` déjà définie dans le schéma.

### 4.1 Nouveau fichier `convex/folders.ts`

```typescript
// convex/folders.ts — NOUVEAU FICHIER
// CRUD complet pour les dossiers iDocument

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.id("organizations"),
        createdBy: v.string(),
        parentFolderId: v.optional(v.id("folders")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("folders", {
            name: args.name,
            description: args.description ?? "",
            organizationId: args.organizationId,
            createdBy: args.createdBy,
            parentFolderId: args.parentFolderId,
            tags: args.tags ?? [],
            permissions: {
                visibility: "team",
                sharedWith: [],
                teamIds: [],
            },
            isTemplate: false,
            status: "active",
            fileCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("folders"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        archiveSchedule: v.optional(v.object({
            scheduledDate: v.number(),
            targetCategory: v.string(),
            autoArchive: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const cleaned = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "trashed",
            updatedAt: Date.now(),
        });
    },
});

export const setArchiveSchedule = mutation({
    args: {
        id: v.id("folders"),
        scheduledDate: v.number(),
        targetCategory: v.string(),
        autoArchive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            archiveSchedule: {
                scheduledDate: args.scheduledDate,
                targetCategory: args.targetCategory,
                autoArchive: args.autoArchive,
            },
            updatedAt: Date.now(),
        });
    },
});

export const listByOrg = query({
    args: {
        organizationId: v.id("organizations"),
        parentFolderId: v.optional(v.id("folders")),
    },
    handler: async (ctx, args) => {
        let q = ctx.db
            .query("folders")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .filter((q) => q.eq(q.field("status"), "active"));

        const folders = await q.collect();

        if (args.parentFolderId !== undefined) {
            return folders.filter((f) => f.parentFolderId === args.parentFolderId);
        }
        return folders;
    },
});

export const getById = query({
    args: { id: v.id("folders") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
```

### Fichiers Phase 4 :
- `convex/folders.ts` — **NOUVEAU** (6 mutations/queries)

---

## Phase 5 : Frontend — ArchiveModal connecté

**Objectif :** Transformer l'ArchiveModal de démo en composant fonctionnel connecté à Convex avec double hash.

### 5.1 Refactoring `ArchiveModal.tsx`

**Changements requis :**

1. **Supprimer** le type `ArchiveCategory` hardcodé (`"legal"/"vault"`)
2. **Charger** les catégories depuis Convex via `useQuery(api.archiveConfig.listCategories, { organizationId })`
3. **Ajouter** sélecteur de `countingStartEvent` (date_tag, date_gel, date_creation, date_cloture)
4. **Ajouter** sélecteur de `confidentiality` (public, internal, confidential, secret)
5. **Ajouter** aperçu des transitions calculées (Actif → X, Semi-actif → Y, Archivé → Z)
6. **Implémenter** le processus d'archivage :
   - Geler le contenu TipTap (`JSON.stringify(content)`)
   - Calculer `contentHash` via `crypto.subtle.digest`
   - Générer PDF côté client via `html2pdf.js`
   - Uploader PDF sur Supabase Storage
   - Calculer `pdfHash`
   - Appeler `archiveBridge.archiveDocument`
7. **Afficher** le certificat retourné (numéro + lien vers iArchive)
8. **Fix slugs** : utiliser les slugs dynamiques de la DB

### 5.2 Interface cible de l'ArchiveModal

```
┌──────────────────────────────────────────────────────┐
│  🗄️ Archiver le document                             │
│                                                       │
│  📄 "Bilan comptable exercice 2025"                  │
│                                                       │
│  Catégorie d'archivage :                             │
│  ┌─────────────────────────────────────────────┐     │
│  │ 🏛️ Fiscal (10 ans — OHADA Art. 24)      ▼ │     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  Début du comptage :                                 │
│  ┌─────────────────────────────────────────────┐     │
│  │ 📅 Date de clôture                       ▼ │     │
│  └─────────────────────────────────────────────┘     │
│  Date : [31/12/2025]                                 │
│                                                       │
│  Confidentialité :                                   │
│  ┌─────────────────────────────────────────────┐     │
│  │ 🔒 Confidentiel                          ▼ │     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  Tags : [fiscal] [bilan] [2025] [+]                  │
│                                                       │
│  ── Aperçu du cycle de vie ──────────────────────    │
│  Phase Active    : 01/01/2026 → 01/01/2031 (5 ans)  │
│  Phase Semi-actif: 01/01/2031 → 01/01/2034 (3 ans)  │
│  Archivé jusqu'à : 01/01/2036 (10 ans total)        │
│  🔔 Alertes : 3 mois + 1 semaine + 3 jours avant    │
│                                                       │
│  ── Intégrité ─────────────────────────────────      │
│  🔐 SHA-256 JSON : [sera calculé à la confirmation]  │
│  📄 PDF généré   : [sera créé à la confirmation]     │
│                                                       │
│  [Annuler]  [🗄️ Archiver & Générer le certificat]   │
└──────────────────────────────────────────────────────┘
```

### 5.3 Connexion `EditorPage.tsx`

Dans `EditorPage.tsx`, remplacer le `handleArchiveConfirm` pour :
1. Appeler `archiveBridge.archiveDocument` au lieu de l'ancien `documents.archiveDocument`
2. Après succès, afficher un toast avec le numéro de certificat
3. Ajouter un lien "Voir dans iArchive" dans la page

### 5.4 Helper côté client : SHA-256

```typescript
// src/lib/crypto.ts — NOUVEAU
export async function sha256(data: string | ArrayBuffer): Promise<string> {
    const buffer = typeof data === "string"
        ? new TextEncoder().encode(data)
        : data;
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

### Fichiers Phase 5 :
- `src/components/modules/idocument/ArchiveModal.tsx` — Refactoring complet
- `src/components/modules/idocument/EditorPage.tsx` — Wire archiveBridge
- `src/lib/crypto.ts` — **NOUVEAU** (helper SHA-256)

---

## Phase 6 : Frontend — ArchiveListPage connecté

**Objectif :** Remplacer toutes les données mock par des queries Convex réelles.

### 6.1 Refactoring `ArchiveListPage.tsx`

**Changements requis :**

1. **Supprimer** toutes les constantes mock (`MOCK_ARCHIVES`, `MOCK_CATEGORIES`, etc.)
2. **Ajouter** les queries Convex :
   ```typescript
   const archives = useQuery(api.archives.list, { organizationId, categorySlug: selectedCategory });
   const categories = useQuery(api.archiveConfig.listCategories, { organizationId });
   const stats = useQuery(api.archives.getStats, { organizationId });
   ```
3. **Dossiers dynamiques** depuis `archive_categories` (plus de hardcode) :
   - Chaque catégorie = un dossier racine dans le Finder
   - Les tags permettent un sous-classement
4. **Stats réelles** : comptage par catégorie, espace utilisé, expirations proches
5. **Fix ViewMode** :
   ```typescript
   // AVANT (bug) :
   const [viewMode, setViewMode] = useState<ViewMode>("grid");
   // APRÈS (fix) :
   const [viewMode, setViewMode] = useState<ViewMode>(() =>
       getInitialViewMode("digitalium-iarchive-view")
   );
   ```

### 6.2 Nouvelles queries dans `convex/archives.ts`

```typescript
export const list = query({
    args: {
        organizationId: v.id("organizations"),
        categorySlug: v.optional(v.string()),
        status: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let results = await ctx.db
            .query("archives")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        if (args.categorySlug) {
            results = results.filter((a) => a.categorySlug === args.categorySlug);
        }
        if (args.status) {
            results = results.filter((a) => a.status === args.status);
        }
        if (args.search) {
            const s = args.search.toLowerCase();
            results = results.filter((a) =>
                a.title.toLowerCase().includes(s) ||
                a.fileName.toLowerCase().includes(s) ||
                a.tags?.some((t) => t.toLowerCase().includes(s))
            );
        }

        return results.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const getStats = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const all = await ctx.db
            .query("archives")
            .withIndex("by_organizationId", (q) =>
                q.eq("organizationId", args.organizationId)
            )
            .collect();

        const totalSize = all.reduce((sum, a) => sum + a.fileSize, 0);
        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const expiringSoon: typeof all = [];

        const threeMonths = 90 * 24 * 3600 * 1000;
        const now = Date.now();

        for (const a of all) {
            byCategory[a.categorySlug] = (byCategory[a.categorySlug] ?? 0) + 1;
            byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
            if (a.retentionExpiresAt && a.retentionExpiresAt - now < threeMonths && a.status !== "destroyed") {
                expiringSoon.push(a);
            }
        }

        return {
            totalArchives: all.length,
            totalSizeBytes: totalSize,
            byCategory,
            byStatus,
            expiringSoon: expiringSoon.length,
        };
    },
});
```

### Fichiers Phase 6 :
- `src/components/modules/iarchive/ArchiveListPage.tsx` — Refactoring complet
- `convex/archives.ts` — Ajout queries `list` et `getStats`

---

## Phase 7 : Upload manuel dans iArchive

**Objectif :** Permettre l'upload direct de fichiers dans iArchive (sans passer par iDocument).

### 7.1 Nouveau composant `ArchiveUploadDialog.tsx`

Fonctionnalités :
1. Upload fichier (PDF, images, docs) vers Supabase Storage
2. Sélection catégorie + tags + confidentialité
3. Calcul SHA-256 côté client (réutiliser `IntegrityVerifier`)
4. Appel `archives.createArchiveEntry` (version corrigée Phase 1)
5. Génération certificat automatique
6. `sourceType = "manual_upload"`

### Fichiers Phase 7 :
- `src/components/modules/iarchive/ArchiveUploadDialog.tsx` — **NOUVEAU**

---

## Phase 8 : Détail, Recherche, Certificats connectés

**Objectif :** Connecter les composants UI existants aux données Convex.

### 8.1 `ArchiveDetailSheet.tsx`

- Connecter aux données Convex via `useQuery(api.archives.getById, { id })`
- Ajouter timeline lifecycle visuelle (Active → Semi-Active → Archivée)
- Bouton "Prolonger rétention" → appelle `archives.extendRetention`
- Bouton "Demander la destruction" (si status === "archived" ou "expired") → appelle `archives.requestDestruction`
- Afficher certificat de destruction si status === "destroyed"
- Afficher les 2 hash (contentHash + pdfHash) si `sourceType === "document_archive"`

### 8.2 `ArchiveSearchBar.tsx`

- Connecter à `archives.list` avec paramètre `search`
- Filtres par catégorie, statut, date, confidentialité

### 8.3 `CertificateViewer.tsx`

- Connecter aux données Convex (certificat d'archivage + certificat de destruction)
- Afficher les deux hash avec explication
- Bouton de vérification d'intégrité (recalcul client-side vs hash stocké)

### 8.4 Page de vérification publique (optionnel)

- Route `/verify/[certificateNumber]`
- Saisie du numéro de certificat → affichage des détails (sans données sensibles)

### Fichiers Phase 8 :
- `src/components/modules/iarchive/ArchiveDetailSheet.tsx` — Connexion Convex
- `src/components/modules/iarchive/ArchiveSearchBar.tsx` — Connexion Convex
- `src/components/modules/iarchive/CertificateViewer.tsx` — Connexion Convex
- `src/app/(pro)/pro/verify/[certificateNumber]/page.tsx` — **NOUVEAU** (optionnel)

---

## Phase 9 : Dashboard iArchive

**Objectif :** Créer un tableau de bord avec statistiques, alertes et timeline.

### 9.1 Nouveau composant `ArchiveDashboard.tsx`

Sections :
1. **Stats globales** : Total archives, par catégorie, par statut, espace utilisé
2. **Alertes actives** : Archives avec alertes pré-archivage/pré-destruction en attente
3. **Expirations proches** : Timeline des archives expirant dans les 3/6/12 prochains mois
4. **Conformité** : % d'archives avec certificat valide, % conformes OHADA
5. **Archives expirées en attente** : Documents en status "expired" nécessitant une action admin

### Fichiers Phase 9 :
- `src/components/modules/iarchive/ArchiveDashboard.tsx` — **NOUVEAU**

---

## Phase 10 : Tags, WorkflowStatusBar, Corrections UX

**Objectif :** Finaliser les détails UX et les connexions transverses.

### 10.1 Tags sur documents et dossiers

- Dans `DocumentListPage.tsx` : afficher les tags, permettre l'ajout/suppression
- Suggestions de tags par catégorie d'archive (fiscal: "bilan", "déclaration", etc.)

### 10.2 `WorkflowStatusBar.tsx`

- Lire le vrai statut depuis Convex
- Si `status === "archived"` : afficher badge avec lien vers l'archive (`archiveId`)
- Afficher le numéro de certificat

### 10.3 Corrections UX

1. **Renommage "Écosystème" → "Structure de Classement"** :
   - `src/config/page-info/admin.ts` : lignes 100, 105, 115
   - 5 composants `src/components/sections/*.tsx` contenant "Configurer mon Écosystème"

2. **Fix ViewMode ArchiveListPage** (déjà fait en Phase 6)

### Fichiers Phase 10 :
- `src/components/modules/idocument/DocumentListPage.tsx` — Tags
- `src/components/modules/idocument/WorkflowStatusBar.tsx` — Badge archive
- `src/config/page-info/admin.ts` — Renommage
- `src/components/sections/*.tsx` — Renommage (5 fichiers)

---

# ITÉRATION 2 — ORGANISATION & AUTOMATISATION

---

## Phase 11 : Synchronisation Structure de Classement ↔ iDocument

**Objectif :** Les filing_cells (admin) se reflètent comme dossiers dans iDocument, et inversement pour les actions admin.

### 11.1 Principe

```
Structure de Classement (Admin)          iDocument (Utilisateur)
┌────────────────────┐                   ┌────────────────────┐
│ FISC (Fiscal)      │ ──── sync ────>  │ 📁 Documents Fiscaux│
│  ├── FISC-TVA      │ ──── sync ────>  │   ├── 📁 TVA        │
│  └── FISC-BIL      │ ──── sync ────>  │   └── 📁 Bilans     │
│ CFT (Coffre-Fort)  │ ──── sync ────>  │ 📁 Coffre-Fort     │
└────────────────────┘                   └────────────────────┘
```

### 11.2 Règles de synchronisation

| Action admin | Effet iDocument |
|-------------|-----------------|
| Créer filing_cell | → Créer folder correspondant (isSystem=true) |
| Renommer filing_cell | → Renommer folder |
| Supprimer filing_cell | → Folder.status = "trashed" (pas de suppression physique) |
| Créer folder dans iDocument (admin only) | → Créer filing_cell correspondante |

### 11.3 Implémentation

- Ajouter `filingCellId: v.optional(v.id("filing_cells"))` sur la table `folders`
- Ajouter `isSystem: v.optional(v.boolean())` sur la table `folders`
- Triggers dans `convex/filingCells.ts` : après chaque CRUD, sync vers `folders`
- Dans `DocumentListPage.tsx` : peupler `dynamicFolders` depuis les `folders` Convex
- Restriction : seuls les admin peuvent créer/modifier des dossiers de premier niveau

### 11.4 Cohérence dynamique

| Action admin | Effet espace utilisateur |
|-------------|--------------------------|
| Créer filing_cell | → Nouveau dossier visible dans iDocument |
| Modifier accès Matrice | → Permissions immédiatement appliquées |
| Ajouter catégorie archive | → Nouvelle option dans ArchiveModal |
| Créer membre avec rôle | → Accès automatiques selon Matrice |
| Modifier rôle métier | → Recalcul des accès de tous les membres concernés |

### Fichiers Phase 11 :
- `convex/schema.ts` — Ajout champs folders (filingCellId, isSystem)
- `convex/filingCells.ts` — Triggers de sync
- `convex/folders.ts` — Sync inverse
- `src/components/modules/idocument/DocumentListPage.tsx` — dynamicFolders

---

## Phase 12 : Matrice d'Accès dynamique

**Objectif :** Auto-seeder les règles d'accès à la création d'un dossier et assurer la résolution temps réel.

### 12.1 Auto-seed des règles par défaut

Quand une `filing_cell` est créée :
1. Récupérer tous les `business_roles` de l'organisation
2. Pour chaque rôle : créer une `cell_access_rule` avec :
   - Rôles `gouvernance`/`direction` → accès `admin`
   - Tous les autres → accès `aucun`
3. L'admin peut ensuite modifier via l'interface matricielle

### 12.2 Résolution améliorée

L'algorithme `resolveAccess` existant dans `cellAccessRules.ts` doit être étendu pour supporter les affectations multiples (Phase 13).

### Fichiers Phase 12 :
- `convex/filingCells.ts` — Ajout `seedDefaultAccessRules` après create
- `convex/cellAccessRules.ts` — Résolution multi-postes

---

## Phase 13 : Multi-postes & Affectations

**Objectif :** Permettre à un membre d'occuper plusieurs postes (business_role + org_unit) simultanément.

### 13.1 Modification du schéma `organization_members`

```typescript
// AJOUTER :
assignments: v.optional(v.array(v.object({
    businessRoleId: v.id("business_roles"),
    orgUnitId: v.id("org_units"),
    isPrimary: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
}))),
```

### 13.2 Impact sur la résolution d'accès

Pour chaque membre, `resolveAccess` doit :
1. Lister toutes les affectations actives (endDate null ou > now)
2. Pour chaque affectation, calculer l'accès via les rules
3. Prendre le **niveau le plus élevé** parmi toutes les affectations
4. Plafonner par le niveau de rôle plateforme

### Fichiers Phase 13 :
- `convex/schema.ts` — Ajout assignments sur organization_members
- `convex/orgMembers.ts` — Mutations CRUD assignments
- `convex/cellAccessRules.ts` — Résolution multi-affectations
- Composant admin pour l'UI d'affectation

---

## Phase 14 : Configuration Organisation complète

**Objectif :** Compléter le menu admin `/pro/organization` avec toutes les sections.

### 14.1 Menu cible

```
/pro/organization/
├── 📋 Profil (identité, contact, plan)
├── 🏢 Structure Organisationnelle (organigramme, rôles, sites)
├── 📁 Structure de Classement (filing_cells tree)
├── 🔐 Matrice d'Accès (cellule × rôle → accès)
├── 🗄️ Politiques d'Archivage (catégories CRUD, alertes, autoDestroy)
├── 👥 Membres & Rôles (affectations, invitations)
├── ⚙️ Modules (iDocument, iArchive, iSignature, iAsted)
└── 📊 Analytics (stats, stockage, conformité)
```

### 14.2 Seed complet à l'activation d'une organisation

Quand une org passe en statut "active" :
1. Générer les `archive_categories` OHADA par défaut
2. Générer les `filing_cells` selon le type d'org (presets)
3. Créer les `folders` correspondants dans iDocument
4. Seeder les `cell_access_rules` par défaut
5. Configurer les `retention_alerts` par défaut

### Fichiers Phase 14 :
- Pages `/pro/organization/` — Complétion des onglets
- `convex/organizations.ts` — Seed complet à l'activation
- Composants admin additionnels

---

## Phase 15 : Tagging avancé (héritage dossier→document)

**Objectif :** Permettre de tagger un dossier avec une politique d'archivage, et hériter automatiquement aux documents enfants.

### 15.1 Nouvelle table `folder_archive_metadata`

```typescript
folder_archive_metadata: defineTable({
    folderId: v.id("folders"),
    organizationId: v.id("organizations"),
    archiveCategoryId: v.id("archive_categories"),
    archiveCategorySlug: v.string(),
    countingStartEvent: v.string(),
    confidentiality: v.string(),
    inheritToChildren: v.boolean(),      // Sous-dossiers héritent ?
    inheritToDocuments: v.boolean(),      // Documents enfants héritent ?
    taggedAt: v.number(),
    taggedBy: v.string(),
})
```

### 15.2 Héritage automatique

Quand un document est créé dans un dossier tagué :
1. Vérifier si le dossier a un `folder_archive_metadata`
2. Si `inheritToDocuments === true`, copier les métadonnées sur le document
3. L'utilisateur peut override les valeurs héritées
4. Si le dossier est modifié, option de recalculer pour les documents existants

### 15.3 Interface de tagging dossier

Menu contextuel (clic droit) sur un dossier :
- "Politique d'archivage" → modal avec sélection catégorie, confidentialité, héritage

### Fichiers Phase 15 :
- `convex/schema.ts` — Table folder_archive_metadata
- `convex/folderArchiveMetadata.ts` — **NOUVEAU** (CRUD + héritage)
- Composants UI pour le tagging dossier

---

## Phase 16 : Moteur d'automatisation (workflows runtime)

**Objectif :** Implémenter l'exécution runtime des workflows et triggers d'archivage automatique.

### 16.1 Triggers d'archivage automatique

| Trigger | Source | Action |
|---------|--------|--------|
| `signature.completed` | iSignature | Archiver le document signé dans la catégorie configurée |
| `folder.schedule` | archiveSchedule sur folder | CRON vérifie les scheduledDate → archive les docs approved |
| `workflow.auto_archive` | Étape workflow org | Le workflow exécute l'archivage comme step automatique |

### 16.2 CRON additionnel : `scheduled-archives`

```typescript
// convex/crons.ts — Ajouter :
crons.interval("scheduled-archives", { hours: 6 }, internal.archiveBridge.processScheduledArchives);
```

Logique : Lister tous les folders avec `archiveSchedule.scheduledDate <= now` et `archiveSchedule.autoArchive === true`, puis archiver en masse les documents approved.

### 16.3 Mutation `archiveFromAutomation`

Point d'entrée unifié pour les archivages automatiques :
```typescript
export const archiveFromAutomation = mutation({
    args: {
        documentId: v.id("documents"),
        triggeredBy: v.union(v.literal("system"), v.literal("workflow"), v.literal("schedule")),
        workflowId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Déterminer la catégorie depuis les tags du document/folder parent
        // Appeler la logique d'archivage standard
        // sourceType = "auto_archive"
    },
});
```

### Fichiers Phase 16 :
- `convex/archiveBridge.ts` — processScheduledArchives, archiveFromAutomation
- `convex/crons.ts` — CRON scheduled-archives
- `convex/automationEngine.ts` — **NOUVEAU** (exécution workflows)

---

## 20. PLAN DE TESTS COMPLET

### Itération 1

| # | Test | Scénario | Résultat attendu |
|---|------|----------|------------------|
| T1 | Flow document complet | Créer doc → review → approve → archiver via ArchiveModal | Entrée `archives` créée + certificat + doc status="archived" + archiveId peuplé |
| T2 | Double hash | Archiver un document TipTap | `contentHash` ≠ `pdfHash`, les deux stockés, certificat référence `pdfHash` |
| T3 | Upload direct | Dans iArchive, upload fichier PDF | SHA-256 calculé + certificat + `sourceType="manual_upload"` |
| T4 | Lifecycle CRON | Créer archive avec `activeUntil` dans le passé | Transition auto vers `semi_active` ou `archived` |
| T5 | Alertes | Archive expirant bientôt | `alert_logs` générés par le CRON |
| T6 | Destruction manuelle | Archive `status="archived"` → requestDestruction | Certificat de destruction créé + archive `status="destroyed"` + cert archivage révoqué |
| T7 | Destruction auto | Catégorie avec `autoDestroy=true` + archive expirée | CRON détruit auto + certificat généré + audit log |
| T8 | Coffre-Fort | Archive `isPerpetual=true` + expiration atteinte | Rien ne se passe (perpétuel) |
| T9 | Prolongation | Archive expirée → extendRetention +5 ans | `retentionExpiresAt` recalculé + status redevient "archived" |
| T10 | Recherche | Chercher par titre, tag, catégorie | Résultats corrects filtrés |
| T11 | Slugs | Archiver en "Juridique" | Slug = `"juridique"` (pas `"legal"`) partout |
| T12 | Catégories dynamiques | Lister les catégories dans ArchiveModal | 5 catégories OHADA réelles (pas hardcodées) |
| T13 | Stats dashboard | Vérifier les compteurs | Comptage par catégorie/statut correct |
| T14 | Folders CRUD | Créer, renommer, supprimer dossier | CRUD fonctionnel + soft delete |
| T15 | ViewMode fix | Changer de vue dans ArchiveListPage | Préférence persistée en localStorage |

### Itération 2

| # | Test | Scénario | Résultat attendu |
|---|------|----------|------------------|
| T16 | Sync Structure→iDocument | Créer filing_cell en admin | Folder créé dans iDocument automatiquement |
| T17 | Sync inverse | Admin crée dossier dans iDocument | Filing_cell créée |
| T18 | Matrice auto-seed | Créer filing_cell | Rules créées : admin=admin, autres=aucun |
| T19 | Multi-postes | Membre avec 2 affectations | Accès = max des 2 niveaux |
| T20 | Héritage tagging | Tagger dossier fiscal → créer document dedans | Document hérite de la catégorie fiscal |
| T21 | archiveSchedule | Dossier avec schedule → CRON | Documents approved archivés automatiquement |

---

## 21. FICHIERS CRITIQUES — MATRICE COMPLÈTE

### Itération 1

| Phase | Fichier | Action | Description |
|-------|---------|--------|-------------|
| 1 | `convex/schema.ts` | **MODIFIER** | Ajouts archives (8 champs), destruction_certificates (table), documents (3 champs), archive_categories (autoDestroy) |
| 1 | `convex/archives.ts` | **MODIFIER** | Supprimer RETENTION_MAP, réécrire createArchiveEntry, ajouter list + getStats |
| 1 | `convex/archiveConfig.ts` | **MODIFIER** | Ajouter autoDestroy dans defaults |
| 2 | `convex/archiveBridge.ts` | **NOUVEAU** | Pont iDocument→iArchive (archiveDocument, archiveFolder) |
| 3 | `convex/archives.ts` | **MODIFIER** | Ajouter requestDestruction, extendRetention, getDestructionCertificate |
| 3 | `convex/lifecycleScheduler.ts` | **MODIFIER** | Ajouter détection expiration + autoDestroy + destruction auto |
| 4 | `convex/folders.ts` | **NOUVEAU** | CRUD complet (create, update, remove, list, get, setArchiveSchedule) |
| 5 | `ArchiveModal.tsx` | **MODIFIER** | Connexion Convex, catégories dynamiques, double hash, génération PDF |
| 5 | `EditorPage.tsx` | **MODIFIER** | Wire archiveBridge, lien iArchive |
| 5 | `src/lib/crypto.ts` | **NOUVEAU** | Helper SHA-256 |
| 6 | `ArchiveListPage.tsx` | **MODIFIER** | Remplacer mock par Convex, fix ViewMode |
| 7 | `ArchiveUploadDialog.tsx` | **NOUVEAU** | Upload manuel dans iArchive |
| 8 | `ArchiveDetailSheet.tsx` | **MODIFIER** | Connexion Convex, timeline, boutons destruction/prolongation |
| 8 | `ArchiveSearchBar.tsx` | **MODIFIER** | Connexion Convex |
| 8 | `CertificateViewer.tsx` | **MODIFIER** | Connexion Convex, double hash |
| 9 | `ArchiveDashboard.tsx` | **NOUVEAU** | Stats, alertes, timeline, conformité |
| 10 | `DocumentListPage.tsx` | **MODIFIER** | Tags |
| 10 | `WorkflowStatusBar.tsx` | **MODIFIER** | Badge archive |
| 10 | `admin.ts` + 5 sections | **MODIFIER** | Renommage "Écosystème" → "Structure de Classement" |

### Itération 2

| Phase | Fichier | Action | Description |
|-------|---------|--------|-------------|
| 11 | `convex/schema.ts` | **MODIFIER** | Ajout filingCellId, isSystem sur folders |
| 11 | `convex/filingCells.ts` | **MODIFIER** | Triggers sync vers folders |
| 11 | `convex/folders.ts` | **MODIFIER** | Sync inverse vers filing_cells |
| 11 | `DocumentListPage.tsx` | **MODIFIER** | dynamicFolders depuis Convex |
| 12 | `convex/filingCells.ts` | **MODIFIER** | seedDefaultAccessRules |
| 12 | `convex/cellAccessRules.ts` | **MODIFIER** | Résolution multi-postes |
| 13 | `convex/schema.ts` | **MODIFIER** | assignments[] sur organization_members |
| 13 | `convex/orgMembers.ts` | **MODIFIER** | CRUD assignments |
| 14 | Pages `/pro/organization/` | **MODIFIER** | Complétion onglets admin |
| 14 | `convex/organizations.ts` | **MODIFIER** | Seed complet à l'activation |
| 15 | `convex/schema.ts` | **MODIFIER** | Table folder_archive_metadata |
| 15 | `convex/folderArchiveMetadata.ts` | **NOUVEAU** | CRUD + héritage |
| 16 | `convex/archiveBridge.ts` | **MODIFIER** | processScheduledArchives |
| 16 | `convex/crons.ts` | **MODIFIER** | CRON scheduled-archives |
| 16 | `convex/automationEngine.ts` | **NOUVEAU** | Exécution workflows |

---

> **Ce prompt est prêt pour l'implémentation. Lancez les phases dans l'ordre indiqué. Chaque phase est indépendante mais s'appuie sur les précédentes.**
