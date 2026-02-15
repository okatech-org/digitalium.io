# Plan d'Implémentation — Structure de Classement

> **Objectif** : Remplacer l'onglet « Écosystème » par « Structure de Classement » dans le wizard/fiche "Nouvelle Organisation". Ce système définit l'arborescence de dossiers par défaut qu'un collaborateur voit dans iDocument en fonction de son **service**, de son **rôle métier** et de ses **habilitations individuelles**.

---

## 1. Analyse de l'existant

### Ce qui existe aujourd'hui

L'onglet **Écosystème** (étape 3 du wizard) configure les **Sites** et les **Unités Organisationnelles** (OrgUnits) de l'organisation. L'onglet **Dossiers** (étape 5) définit des dossiers par défaut (`DefaultFolder`) avec un champ `orgUnitAcces: string[]` qui relie un dossier à des unités organisationnelles par nom.

**Limites identifiées :**

- L'accès aux dossiers est lié au **nom** de l'unité organisationnelle (texte libre), pas à un identifiant — fragile et non relationnel.
- Pas de distinction entre rôles métier au sein d'un même service : tous les collaborateurs du service RH voient les mêmes dossiers.
- Pas de notion d'habilitation individuelle : on ne peut pas dire "Mr X, DRH, voit le dossier Rémunérations mais pas Mme Y, assistante RH".
- Les dossiers sont définis en dur dans le code (ex. `SEEG_DOSSIERS`), pas configurables dynamiquement.

### Ce qu'on veut

Mr X, collaborateur du service RH avec le rôle métier « DRH », se connecte et voit dans iDocument uniquement les dossiers configurés pour le service RH + le rôle DRH + ses habilitations personnelles. Sa collègue « Assistante RH » du même service voit un sous-ensemble différent.

---

## 2. Architecture de la solution

### 2.1 Concept : les trois couches d'accès

La Structure de Classement fonctionne en **trois couches cumulatives** (du plus large au plus fin) :

```
┌─────────────────────────────────────────────────────────┐
│  COUCHE 1 — MODÈLES DE CLASSEMENT (Templates)          │
│  Arborescences types par secteur/type d'organisation    │
│  Ex: "Classement PME Gabonaise", "Classement Ministère" │
├─────────────────────────────────────────────────────────┤
│  COUCHE 2 — AFFECTATION PAR SERVICE + RÔLE MÉTIER       │
│  Chaque cellule (dossier) est affectée à des couples    │
│  (Service, Rôle Métier) avec un niveau d'accès          │
│  Ex: (RH, DRH) → Lecture/Écriture sur "Rémunérations"  │
│      (RH, Assistant) → Lecture seule sur "Rémunérations"│
├─────────────────────────────────────────────────────────┤
│  COUCHE 3 — HABILITATIONS INDIVIDUELLES                 │
│  Override par collaborateur (ajouter/retirer l'accès)   │
│  Ex: Mr X → +Accès "Budget Prévisionnel" (hors scope RH)
│      Mme Y → -Accès "Dossiers Disciplinaires"          │
└─────────────────────────────────────────────────────────┘
```

**Résolution d'accès** : Un collaborateur voit un dossier si :
1. Son couple (Service, Rôle Métier) y a accès via la Couche 2, **ET**
2. Il n'a pas de retrait individuel (Couche 3), **OU**
3. Il a un ajout individuel (Couche 3), indépendamment de la Couche 2.

### 2.2 Concept : Rôle Métier vs Rôle Plateforme

Il est essentiel de distinguer deux notions :

| Concept | Rôle Plateforme (existant) | Rôle Métier (nouveau) |
|---------|---------------------------|----------------------|
| **Portée** | Technique — droits sur la plateforme | Fonctionnel — fonction dans l'organisation |
| **Exemples** | `org_admin`, `org_manager`, `org_member` | DRH, Comptable, Chef de Projet, Juriste |
| **Qui définit** | Digitalium (fixe, 6 niveaux) | L'administrateur de l'organisation (libre) |
| **Sert à** | Contrôler les permissions système | Déterminer les dossiers visibles |

Un collaborateur a **un rôle plateforme** (ses droits techniques) ET **un rôle métier** (sa fonction, qui détermine ses dossiers).

---

## 3. Modèle de données

### 3.1 Nouvelles tables Convex

#### Table `business_roles` — Rôles métier par organisation

```typescript
business_roles: defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),              // "DRH", "Comptable Senior", "Juriste"
  slug: v.string(),              // "drh", "comptable-senior", "juriste"
  description: v.optional(v.string()),
  color: v.string(),             // Couleur d'identification
  icon: v.optional(v.string()),  // Icône Lucide
  orgUnitTypes: v.array(v.string()), // Types d'unités où ce rôle est valide
                                      // Ex: ["service", "departement"]
  isDefault: v.boolean(),        // Rôle par défaut pour nouveaux membres du service
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_org_slug", ["organizationId", "slug"])
```

#### Table `filing_structures` — Modèles de classement

```typescript
filing_structures: defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),              // "Structure Classement SEEG"
  description: v.optional(v.string()),
  isActive: v.boolean(),         // Une seule active par org
  orgType: v.optional(v.string()),  // Type d'org ciblé (pour les templates)
  isTemplate: v.boolean(),       // Modèle réutilisable cross-org
  version: v.number(),           // Versioning de la structure
  createdBy: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_org_active", ["organizationId", "isActive"])
  .index("by_isTemplate", ["isTemplate"])
```

#### Table `filing_cells` — Cellules (dossiers) de la structure

```typescript
filing_cells: defineTable({
  filingStructureId: v.id("filing_structures"),
  organizationId: v.id("organizations"),
  name: v.string(),              // "Documents Fiscaux", "Rémunérations"
  slug: v.string(),              // "documents-fiscaux"
  description: v.optional(v.string()),
  parentCellId: v.optional(v.id("filing_cells")),  // Hiérarchie
  depth: v.number(),             // 0 = racine, 1 = sous-dossier, etc.
  icon: v.string(),              // Icône Lucide
  color: v.string(),             // Couleur Tailwind
  tags: v.array(v.string()),     // Tags de classification
  category: v.optional(v.string()), // Catégorie fonctionnelle
  moduleAssociation: v.optional(  // Module principal
    v.union(
      v.literal("idocument"),
      v.literal("iarchive"),
      v.literal("isignature")
    )
  ),
  retentionYears: v.optional(v.number()),  // Rétention (si archive)
  confidentiality: v.union(       // Niveau de confidentialité
    v.literal("public"),
    v.literal("internal"),
    v.literal("confidential"),
    v.literal("secret")
  ),
  sortOrder: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_filingStructureId", ["filingStructureId"])
  .index("by_organizationId", ["organizationId"])
  .index("by_parentCellId", ["parentCellId"])
  .index("by_org_active", ["organizationId", "isActive"])
```

#### Table `cell_access_rules` — Règles d'accès par (Service, Rôle Métier)

```typescript
cell_access_rules: defineTable({
  filingCellId: v.id("filing_cells"),
  organizationId: v.id("organizations"),

  // Cible de la règle : un couple (OrgUnit, BusinessRole)
  orgUnitId: v.id("org_units"),       // Le service/département
  businessRoleId: v.optional(v.id("business_roles")),
    // Si null → tous les rôles métier de ce service ont accès

  accessLevel: v.union(
    v.literal("read"),              // Lecture seule
    v.literal("write"),             // Lecture + écriture
    v.literal("manage"),            // Lecture + écriture + gestion (sous-dossiers, tags)
    v.literal("full")               // Tout (y compris suppression)
  ),
  inherited: v.boolean(),           // Hérité du dossier parent
  createdAt: v.number(),
})
  .index("by_filingCellId", ["filingCellId"])
  .index("by_orgUnitId", ["orgUnitId"])
  .index("by_org_cell", ["organizationId", "filingCellId"])
  .index("by_orgUnit_role", ["orgUnitId", "businessRoleId"])
```

#### Table `cell_access_overrides` — Habilitations individuelles (Couche 3)

```typescript
cell_access_overrides: defineTable({
  filingCellId: v.id("filing_cells"),
  organizationId: v.id("organizations"),
  userId: v.string(),               // Le collaborateur concerné

  overrideType: v.union(
    v.literal("grant"),             // Ajout d'accès
    v.literal("revoke")            // Retrait d'accès
  ),
  accessLevel: v.optional(v.union(  // Niveau si grant
    v.literal("read"),
    v.literal("write"),
    v.literal("manage"),
    v.literal("full")
  )),
  reason: v.optional(v.string()),   // Motif de l'override
  grantedBy: v.string(),            // Qui a fait l'override
  expiresAt: v.optional(v.number()), // Expiration optionnelle
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_filingCellId", ["filingCellId"])
  .index("by_org_user", ["organizationId", "userId"])
```

### 3.2 Modification de la table `organization_members`

Ajout du champ `businessRoleId` pour lier un collaborateur à son rôle métier :

```typescript
organization_members: defineTable({
  // ... champs existants ...
  organizationId: v.id("organizations"),
  userId: v.string(),
  role: platformRole,           // Rôle plateforme (inchangé)
  level: v.number(),

  // ── Nouveaux champs ──
  orgUnitId: v.optional(v.id("org_units")),        // Service d'affectation
  businessRoleId: v.optional(v.id("business_roles")), // Rôle métier

  status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended")),
  joinedAt: v.optional(v.number()),
  invitedBy: v.optional(v.string()),
})
```

### 3.3 Nouvelle table `org_units` (migration de l'existant)

Les OrgUnits sont actuellement définies en dur dans le code. Il faut les migrer en table :

```typescript
org_units: defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),              // "Direction RH", "Service Comptabilité"
  slug: v.string(),
  type: v.union(
    v.literal("direction_generale"),
    v.literal("direction"),
    v.literal("sous_direction"),
    v.literal("departement"),
    v.literal("service"),
    v.literal("bureau"),
    v.literal("unite"),
    v.literal("cellule")
  ),
  parentId: v.optional(v.id("org_units")),
  siteId: v.optional(v.string()),
  responsableUserId: v.optional(v.string()),
  color: v.string(),
  description: v.optional(v.string()),
  sortOrder: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_parentId", ["parentId"])
  .index("by_org_type", ["organizationId", "type"])
```

---

## 4. Algorithme de résolution d'accès

### 4.1 Fonction principale

```
resolveUserFilingAccess(userId, organizationId):

  1. Récupérer le member = organization_members.find(userId, organizationId)
  2. Extraire orgUnitId = member.orgUnitId
  3. Extraire businessRoleId = member.businessRoleId
  4. Extraire platformRole = member.role (pour vérification admin)

  5. Si platformRole ∈ {system_admin, platform_admin, org_admin}:
     → Retourner TOUTES les cellules avec accessLevel = "full"
     (Les admins voient tout)

  6. Récupérer rules = cell_access_rules.findAll(orgUnitId)
     → Filtrer par businessRoleId OU businessRoleId = null (wildcard)

  7. Récupérer overrides = cell_access_overrides.findAll(userId, organizationId)

  8. Construire la map d'accès :
     accessMap = {}

     Pour chaque rule dans rules:
       accessMap[rule.filingCellId] = rule.accessLevel

     Pour chaque override dans overrides:
       Si override.type == "grant":
         accessMap[override.filingCellId] = override.accessLevel
       Si override.type == "revoke":
         Supprimer accessMap[override.filingCellId]
       (Vérifier expiresAt si défini)

  9. Propager l'héritage :
     Pour chaque cellId dans accessMap:
       Récupérer les cellules enfants (parentCellId == cellId)
       Si enfant pas déjà dans accessMap → hériter du parent

  10. Retourner accessMap : { cellId → accessLevel }
```

### 4.2 Cas d'usage concret

**Organisation** : SEEG
**Service** : Direction Administrative (RH)
**Structure de classement** :

```
📁 Documents RH
  ├── 📂 Contrats de Travail        → (RH, DRH): write  | (RH, Assistant): read
  ├── 📂 Bulletins de Paie           → (RH, DRH): write  | (RH, Assistant): write
  ├── 📂 Congés                      → (RH, DRH): write  | (RH, Assistant): write
  ├── 📂 Dossiers Disciplinaires     → (RH, DRH): manage | (RH, Assistant): ❌
  └── 📂 Rémunérations & Primes      → (RH, DRH): manage | (RH, Assistant): ❌
📁 Documents Fiscaux
  └── (accessible uniquement via override individuel)
```

**Mr X (DRH)** voit : Contrats de Travail, Bulletins de Paie, Congés, Dossiers Disciplinaires, Rémunérations.
**Mme Y (Assistante RH)** voit : Contrats de Travail (lecture), Bulletins de Paie, Congés.

---

## 5. Interface Utilisateur — Onglet « Structure de Classement »

### 5.1 Remplacement de l'onglet Écosystème

L'onglet « Écosystème » (étape 3) est renommé en **« Structure de Classement »** dans le wizard et la fiche organisation. Son contenu change complètement.

> **Note** : Les Sites et OrgUnits actuellement dans « Écosystème » sont déplacés dans un nouvel onglet ou sous-onglet dédié, car ils restent nécessaires.

### 5.2 Vue principale — 3 sous-onglets

```
┌────────────────────────────────────────────────────────────────┐
│  Structure de Classement                                        │
│                                                                  │
│  [Modèle]  [Matrice d'Accès]  [Habilitations]                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Sous-onglet actif : contenu ci-dessous                         │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 Sous-onglet 1 : Modèle de Classement

**But** : Définir l'arborescence des cellules (dossiers) avec leurs propriétés.

```
┌──────────────────────────────────────────────────────────────┐
│  🏗️ Modèle : Structure Classement SEEG  (v2)   [Éditer ✏️] │
│                                                                │
│  Choisir un modèle prédéfini :                                │
│  [PME Gabonaise ▼] [Ministère] [Organisme] [Personnalisé]    │
│                                                                │
│  ── Arborescence ──────────────────────────────────────────── │
│                                                                │
│  📁 Documents Fiscaux          🏷 fiscal     🔒 confidentiel  │
│    ├── 📂 Déclarations TVA     🏷 tva                         │
│    ├── 📂 Bilans Annuels       🏷 bilan                       │
│    └── 📂 Liasses Fiscales     🏷 ohada                       │
│  📁 Documents RH               🏷 social     🔒 interne       │
│    ├── 📂 Contrats de Travail  🏷 contrat                     │
│    ├── 📂 Bulletins de Paie    🏷 paie                        │
│    ├── 📂 Congés               🏷 congé                       │
│    ├── 📂 Dossiers Disciplin.  🏷 disciplinaire 🔒 secret     │
│    └── 📂 Rémunérations        🏷 rémunération  🔒 confidentiel│
│  📁 Contrats & Juridique       🏷 juridique  🔒 confidentiel  │
│    └── ...                                                     │
│                                                                │
│  [+ Ajouter un dossier racine]  [+ Ajouter un sous-dossier]  │
└──────────────────────────────────────────────────────────────┘
```

**Interactions** :
- Drag-and-drop pour réordonner
- Clic sur une cellule → panneau latéral d'édition (nom, icône, couleur, tags, confidentialité, module associé)
- Templates prédéfinis par type d'organisation
- Import/export d'une structure

### 5.4 Sous-onglet 2 : Matrice d'Accès

**But** : Vue matricielle croisant les cellules (lignes) avec les couples Service × Rôle Métier (colonnes). C'est le cœur de la configuration.

```
┌────────────────────────────────────────────────────────────────────┐
│  📊 Matrice d'Accès                                                │
│                                                                      │
│  Filtrer par service : [Tous ▼]   Filtrer par module : [Tous ▼]    │
│                                                                      │
│                      │ RH        │ RH        │ Compta    │ DG       │
│  Cellule             │ DRH       │ Assistant  │ Comptable │ DG      │
│  ────────────────────┼───────────┼───────────┼───────────┼──────── │
│  📁 Docs Fiscaux     │    —      │    —      │  ✏️ write │ 🔑 full │
│    ├ Décl. TVA       │    —      │    —      │  ✏️ write │ 🔑 full │
│    ├ Bilans          │    —      │    —      │  ✏️ write │ 🔑 full │
│  📁 Documents RH     │  ✏️ write │  👁 read  │    —      │ 🔑 full │
│    ├ Contrats        │  ✏️ write │  👁 read  │    —      │ 🔑 full │
│    ├ Bulletins Paie  │  ✏️ write │  ✏️ write │  👁 read  │ 🔑 full │
│    ├ Congés          │  ✏️ write │  ✏️ write │    —      │ 🔑 full │
│    ├ Disciplinaires  │  ⚙️ manage│    —      │    —      │ 🔑 full │
│    ├ Rémunérations   │  ⚙️ manage│    —      │    —      │ 🔑 full │
│  📁 Juridique        │    —      │    —      │    —      │ 🔑 full │
│  ────────────────────┼───────────┼───────────┼───────────┼──────── │
│                                                                      │
│  Légende: 👁 read  ✏️ write  ⚙️ manage  🔑 full  — aucun accès     │
│                                                                      │
│  💡 Cliquez sur une case pour changer le niveau d'accès             │
│     Shift+clic pour sélectionner une plage                          │
└────────────────────────────────────────────────────────────────────┘
```

**Interactions** :
- Clic sur une case → cycle entre les niveaux (— → read → write → manage → full → —)
- Sélection par plage (Shift+clic) pour appliquer un niveau d'accès à plusieurs cases
- "Appliquer à tous les enfants" quand on modifie un dossier parent (héritage)
- Filtres par service, module, niveau de confidentialité
- Bouton "Suggestions automatiques" basé sur le nom du service et du rôle

### 5.5 Sous-onglet 3 : Habilitations Individuelles

**But** : Gérer les overrides par collaborateur (Couche 3).

```
┌────────────────────────────────────────────────────────────────┐
│  👤 Habilitations Individuelles                                 │
│                                                                  │
│  Rechercher un collaborateur : [_________________] 🔍           │
│                                                                  │
│  ── Mr X — Pierre Nguema (DRH, Direction Administrative) ──── │
│                                                                  │
│  Accès effectifs (résultat des 3 couches) :                     │
│                                                                  │
│  ✅ Documents RH / Contrats          ✏️ write  (via rôle DRH)  │
│  ✅ Documents RH / Bulletins         ✏️ write  (via rôle DRH)  │
│  ✅ Documents RH / Congés            ✏️ write  (via rôle DRH)  │
│  ✅ Documents RH / Disciplinaires    ⚙️ manage (via rôle DRH)  │
│  ✅ Documents RH / Rémunérations     ⚙️ manage (via rôle DRH)  │
│  🔵 Documents Fiscaux / Bilans       👁 read   (override ↑)    │
│  🔴 Juridique / PV Assemblée        ❌ révoqué (override ↓)    │
│                                                                  │
│  [+ Ajouter un accès]  [- Retirer un accès]                    │
│                                                                  │
│  ── Historique des modifications ────────────────────────────── │
│  14/02/2026  Admin a ajouté l'accès "Bilans Annuels" (read)   │
│  10/01/2026  Admin a révoqué l'accès "PV Assemblée"            │
└────────────────────────────────────────────────────────────────┘
```

**Interactions** :
- Recherche de collaborateur avec autocomplétion
- Vue consolidée : affiche la source de chaque accès (rôle, override)
- Ajout/retrait d'accès avec motif et date d'expiration optionnelle
- Historique traçable dans les audit_logs

---

## 6. Templates prédéfinis par type d'organisation

### 6.1 Catalogue de modèles

Chaque type d'organisation dispose d'un modèle de classement prédéfini qui peut être personnalisé :

**Entreprise (PME)** :
- Documents Fiscaux (Déclarations, Bilans, Liasses)
- Documents RH (Contrats, Paie, Congés, Formation)
- Juridique (Contrats Fournisseurs, PV, Statuts)
- Commercial (Factures, Devis, Bons de Commande)
- Technique (Plans, Rapports, Normes)
- Coffre-Fort Numérique

**Administration/Gouvernement** :
- Courrier Officiel (Arrivée, Départ, Interne)
- Actes Administratifs (Arrêtés, Décisions, Notes de Service)
- Budget & Finances (Engagements, Mandats, Marchés Publics)
- Ressources Humaines (Dossiers Agents, Carrières, Congés)
- Archives Réglementaires
- Parapheur Électronique

**Institution (Hôpital, Université)** :
- Dossiers Étudiants/Patients
- Administration Générale
- Recherche & Publications
- Finances & Comptabilité
- Ressources Humaines
- Conformité & Accréditation

**Organisme (Sécurité Sociale, Régulateur)** :
- Dossiers Assurés/Adhérents
- Réglementation & Conformité
- Prestations & Remboursements
- Contentieux
- Administration & RH
- Rapports & Statistiques

### 6.2 Rôles métier prédéfinis par secteur

De même, des rôles métier types sont proposés :

**Entreprise** : DG, DAF, DRH, Directeur Commercial, Chef de Projet, Juriste, Comptable, Assistant(e), Responsable IT
**Administration** : Ministre, Secrétaire Général, Directeur, Chef de Service, Agent, Secrétaire, Archiviste
**Institution** : Directeur, Doyen, Professeur, Chercheur, Secrétaire Académique, Gestionnaire
**Organisme** : Directeur Général, Directeur de Département, Contrôleur, Agent de Traitement, Juriste

---

## 7. Fichiers à créer / modifier

### 7.1 Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| `convex/filing_structures.ts` | Mutations et queries CRUD pour les structures de classement |
| `convex/filing_cells.ts` | Mutations et queries CRUD pour les cellules |
| `convex/cell_access.ts` | Mutations et queries pour les règles d'accès et overrides |
| `convex/business_roles.ts` | Mutations et queries pour les rôles métier |
| `convex/org_units.ts` | Mutations et queries pour les unités org (migration du code en dur) |
| `src/config/filing-presets.ts` | Templates de structures de classement par type d'org |
| `src/config/business-role-presets.ts` | Rôles métier prédéfinis par secteur |
| `src/types/filing.ts` | Types TypeScript pour les structures, cellules, accès |
| `src/hooks/useFilingAccess.ts` | Hook React pour résoudre les accès d'un user |
| `src/hooks/useBusinessRoles.ts` | Hook React pour gérer les rôles métier |
| `src/components/admin/filing-structure/` | Composants UI de l'onglet Structure de Classement |
| `src/components/admin/filing-structure/FilingTreeEditor.tsx` | Éditeur d'arborescence (sous-onglet 1) |
| `src/components/admin/filing-structure/AccessMatrix.tsx` | Matrice d'accès (sous-onglet 2) |
| `src/components/admin/filing-structure/IndividualAccess.tsx` | Habilitations individuelles (sous-onglet 3) |
| `src/components/admin/filing-structure/CellEditPanel.tsx` | Panneau d'édition d'une cellule |
| `src/components/admin/filing-structure/RoleSelector.tsx` | Sélecteur de rôle métier |

### 7.2 Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `convex/schema.ts` | Ajouter les 6 nouvelles tables + modifier `organization_members` |
| `src/app/(admin)/admin/organizations/page.tsx` | Renommer "Écosystème" → "Structure de Classement" dans `STEP_LABELS` |
| `src/app/(admin)/admin/organizations/[id]/page.tsx` | Remplacer le contenu de l'onglet Écosystème, déplacer Sites/OrgUnits |
| `src/config/rbac.ts` | Ajouter la permission `canManageFilingStructure` |
| `src/types/auth.ts` | Ajouter `canManageFilingStructure` à `AdminPermissions` |
| `src/components/modules/idocument/DocumentListPage.tsx` | Filtrer les dossiers selon `resolveUserFilingAccess()` |
| `convex/documents.ts` | Vérifier l'accès à la cellule avant CRUD |

---

## 8. Phases d'implémentation

### Phase 1 — Fondations (Semaine 1-2)

**Objectif** : Mettre en place le modèle de données et les API backend.

1. **Mise à jour du schéma Convex** (`convex/schema.ts`)
   - Ajouter les tables : `org_units`, `business_roles`, `filing_structures`, `filing_cells`, `cell_access_rules`, `cell_access_overrides`
   - Modifier `organization_members` pour ajouter `orgUnitId` et `businessRoleId`

2. **API Backend — OrgUnits** (`convex/org_units.ts`)
   - `createOrgUnit`, `updateOrgUnit`, `deleteOrgUnit`
   - `listOrgUnits(organizationId)`
   - `getOrgUnitTree(organizationId)` — retourne l'arborescence

3. **API Backend — Business Roles** (`convex/business_roles.ts`)
   - `createBusinessRole`, `updateBusinessRole`, `deleteBusinessRole`
   - `listBusinessRoles(organizationId)`
   - Seed des rôles prédéfinis lors de la création d'org

4. **API Backend — Filing Structures** (`convex/filing_structures.ts`)
   - `createFilingStructure`, `updateFilingStructure`
   - `activateFilingStructure(id)` — désactive les autres
   - `cloneFromTemplate(templateId, organizationId)`

5. **API Backend — Filing Cells** (`convex/filing_cells.ts`)
   - `createCell`, `updateCell`, `deleteCell`, `moveCell`
   - `listCells(filingStructureId)`
   - `getCellTree(filingStructureId)` — arborescence complète

6. **Types TypeScript** (`src/types/filing.ts`)

### Phase 2 — Système d'accès (Semaine 3)

**Objectif** : Implémenter l'algorithme de résolution d'accès.

1. **API Backend — Cell Access** (`convex/cell_access.ts`)
   - `setCellAccess(cellId, orgUnitId, businessRoleId, accessLevel)`
   - `removeCellAccess(cellId, orgUnitId, businessRoleId)`
   - `bulkSetCellAccess(rules[])` — pour la matrice
   - `addAccessOverride(cellId, userId, type, level, reason)`
   - `removeAccessOverride(overrideId)`
   - `resolveUserAccess(userId, organizationId)` — algorithme complet

2. **Hook React** (`src/hooks/useFilingAccess.ts`)
   - `useUserFilingAccess(userId)` — retourne la map d'accès résolue
   - `useFilingMatrix(organizationId)` — données pour la matrice
   - Cache et invalidation via Convex reactivity

3. **Intégration iDocument** — Filtrage des dossiers
   - Modifier `DocumentListPage.tsx` pour n'afficher que les cellules accessibles
   - Modifier `convex/documents.ts` pour vérifier l'accès en write avant modification

### Phase 3 — Interface Admin (Semaine 4-5)

**Objectif** : Construire les 3 sous-onglets de l'interface.

1. **Onglet renommé** — Modifier le wizard et la fiche organisation
   - Renommer "Écosystème" → "Structure de Classement"
   - Déplacer la config Sites dans l'onglet "Profil" (ou créer un sous-onglet "Infrastructure")
   - Déplacer la config OrgUnits dans un sous-onglet dédié de "Structure de Classement"

2. **Sous-onglet Modèle** (`FilingTreeEditor.tsx`)
   - Arborescence interactive avec drag-and-drop
   - Panneau latéral d'édition de cellule
   - Sélection de template prédéfini
   - Import/export JSON

3. **Sous-onglet Matrice d'Accès** (`AccessMatrix.tsx`)
   - Grille interactive cellules × (service, rôle)
   - Cycle de niveaux au clic
   - Filtres et sélection par plage
   - Héritage parent-enfant visuel

4. **Sous-onglet Habilitations** (`IndividualAccess.tsx`)
   - Recherche de collaborateur
   - Vue consolidée des accès effectifs avec source
   - Ajout/retrait d'override
   - Historique (via audit_logs)

### Phase 4 — Templates et Presets (Semaine 6)

**Objectif** : Créer les templates prédéfinis et le système d'auto-configuration.

1. **Filing Presets** (`src/config/filing-presets.ts`)
   - Structures de classement types par orgType
   - Rôles métier types par secteur

2. **Auto-configuration au onboarding**
   - Quand une org choisit son type (étape 1), pré-remplir la structure de classement
   - L'admin peut ensuite personnaliser

3. **Suggestions intelligentes**
   - Quand un service est nommé "RH" ou "Ressources Humaines", suggérer automatiquement les cellules et accès pertinents

### Phase 5 — Tests et validation (Semaine 7)

1. **Tests unitaires** — Algorithme de résolution d'accès
2. **Tests d'intégration** — Vérification end-to-end : config admin → connexion collaborateur → dossiers visibles
3. **Tests de non-régression** — S'assurer que les dossiers existants restent fonctionnels
4. **Migration des données** — Script pour convertir les `DefaultFolder` existants en `filing_cells` + `cell_access_rules`

---

## 9. Scénario complet — Parcours utilisateur

### 9.1 Côté Admin (Configuration)

1. L'admin crée une nouvelle organisation « SEEG » (type: enterprise)
2. Étape 1 (Profil) : infos générales + sites → inchangé
3. Étape 2 (Modules) : active iDocument, iArchive, iSignature → inchangé
4. **Étape 3 (Structure de Classement)** :
   - Le système propose le template « PME Gabonaise »
   - L'admin voit l'arborescence pré-remplie, l'ajuste
   - Il ajoute un dossier « Maintenance Industrielle »
   - Il passe à la Matrice d'Accès et configure :
     - (RH, DRH) : accès write sur Documents RH, manage sur Disciplinaires
     - (RH, Assistant) : accès read sur Contrats, write sur Bulletins/Congés
     - (Comptabilité, DAF) : accès full sur Documents Fiscaux
5. Étape 4 (Personnel) : ajoute les collaborateurs avec leur service ET leur rôle métier
6. Les étapes 5-8 continuent normalement

### 9.2 Côté Collaborateur (Utilisation)

1. Pierre Nguema (DRH) se connecte
2. Ouvre iDocument
3. Le système appelle `resolveUserFilingAccess("pierre", "seeg")`
4. Pierre voit : Documents RH (5 sous-dossiers), pas les Documents Fiscaux ni Juridique
5. Il peut créer/modifier des documents dans Contrats, Bulletins, Congés (write)
6. Il peut aussi gérer Disciplinaires et Rémunérations (manage : créer des sous-dossiers, définir des tags)
7. Si l'admin lui a ajouté un override pour "Bilans Annuels" (read), il le voit aussi en lecture

---

## 10. Points d'attention

### Sécurité
- L'accès est TOUJOURS vérifié côté serveur (Convex mutations/queries), jamais uniquement côté client
- Chaque modification d'accès génère une entrée `audit_logs`
- Les overrides individuels ont un champ `reason` obligatoire pour la traçabilité

### Performance
- L'accès résolu est mis en cache côté client via la réactivité Convex
- La matrice d'accès utilise la pagination si l'organisation a beaucoup de cellules
- Index Convex optimisés pour les requêtes fréquentes

### Migration
- Les organisations existantes (SEEG demo) seront migrées automatiquement
- Les `DefaultFolder` avec `orgUnitAcces` seront convertis en `cell_access_rules`
- Période de compatibilité : l'ancien format reste lisible pendant 1 mois

### UX
- La matrice d'accès affiche un indicateur visuel pour les accès hérités vs explicites
- Des tooltips expliquent pourquoi un collaborateur a ou n'a pas accès
- L'admin peut simuler la vue d'un collaborateur ("Voir comme...") depuis la matrice
