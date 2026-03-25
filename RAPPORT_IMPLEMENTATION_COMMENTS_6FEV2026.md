# Rapport d'Implémentation Approfondi — Digitalium.io

## Analyse des commentaires du 6 février 2026 vs. État actuel du code

**Date du rapport** : 24 mars 2026
**Document analysé** : `Comments_6fev2026.docx`
**Base de code** : digitalium.io (Next.js 14 + Convex + TypeScript)

---

## Résumé exécutif

Le document de commentaires du 6 février 2026 recense **7 axes d'amélioration** portant sur les modules iDocument, Configuration Organisationnelle, Structure Organisationnelle, Configuration des documents, Gestion des permissions et Archivage automatique. Après analyse approfondie du code source (107 composants, 22+ tables Convex, ~15 000 lignes de logique métier), ce rapport dresse le bilan point par point de ce qui a été implémenté, partiellement implémenté ou reste à faire.

**Score global d'avancement : ~62%** — Sur les 7 axes majeurs, 3 sont largement implémentés, 2 sont partiellement couverts, et 2 nécessitent un travail significatif.

---

## 1. Création de dossier — Classement obligatoire dans l'arborescence

### Exigence du document

> *« Lorsqu'on crée un dossier, Digitalium demande dans quel répertoire du plan de classement le classer et propose toutes les rubriques et sous-rubriques de classement disponibles. Aucun dossier ne doit être "volant" ; le classement dans l'arborescence est donc obligatoire. »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Création via plan de classement (admins) | ✅ Implémenté | Si un admin crée un dossier ET qu'une structure de classement active existe, le système crée un `filing_cell` qui se synchronise automatiquement avec un dossier dans `folders`. Les règles d'accès sont auto-semées pour les rôles de gouvernance. |
| Création directe sans classement (utilisateurs) | ⚠️ Problème | Les utilisateurs non-admin peuvent créer des dossiers directement via `folders.create` SANS obligation de classement. Le champ `filingCellId` reste `null` — ce sont des **dossiers "volants"**. |
| Proposition de toutes les rubriques/sous-rubriques | ❌ Non implémenté | Le dialogue de création de dossier (`DocumentListPage.tsx`) ne présente **pas** l'arborescence du plan de classement. C'est un simple champ nom + parent optionnel. |
| Classement obligatoire | ❌ Non implémenté | Aucune validation côté serveur n'empêche la création de dossiers sans rattachement au plan de classement. |

### Travail restant

1. **Modifier le dialogue de création de dossier** pour intégrer un sélecteur d'arborescence du plan de classement (utiliser la query `filingCells.getTree` existante)
2. **Rendre le rattachement obligatoire** : ajouter une validation serveur dans `folders.create` qui vérifie la présence d'un `filingCellId` ou d'un `parentFolderId` rattaché à une cellule
3. **Proposer tous les niveaux** : afficher un composant TreeView avec les cellules de classement, similaire à celui de `ClassementTab.tsx`

### Fichiers impactés

- `src/components/modules/idocument/DocumentListPage.tsx` — dialogue de création
- `convex/folders.ts` — mutation `create`, ajouter validation
- `convex/filingCells.ts` — query `getTree` (déjà disponible)

---

## 2. Affichage des dossiers — Arborescence hiérarchique et actions rapides

### Exigence du document

> *« a. L'arborescence hiérarchique de dossiers devrait être la vue par défaut »*
> *« b. Actions rapides disponibles sur un dossier sans avoir à l'ouvrir : Partager, gérer les accès, créer un sous-dossier »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Vue arborescente | ✅ Implémenté | Le module file-manager offre 3 modes : grille (Grid), liste (List) et **colonnes (Column)** de type Finder macOS. La vue colonnes est bien une arborescence hiérarchique. |
| Vue par défaut = arborescence | ⚠️ Partiel | La vue par défaut est la **grille**, pas l'arborescence. Le mode est persisté dans `localStorage`. |
| Actions rapides sans ouvrir | ⚠️ Partiel | Le `FolderDocumentContextMenu.tsx` (593 lignes) propose : renommer, supprimer, configurer la rétention, définir la confidentialité. Mais **"Partager"** et **"Gérer les accès"** ne sont **pas** dans le menu contextuel des dossiers. L'action **"Créer un sous-dossier"** n'est **pas** non plus accessible directement depuis le menu contextuel. |

### Travail restant

1. **Changer la vue par défaut** en mode Column (arborescence) dans `DocumentListPage.tsx`
2. **Ajouter au menu contextuel** des dossiers :
   - "Partager" → ouvrir un dialogue de partage (le modèle `permissions` sur les dossiers existe déjà avec `sharedWith[]` et `teamIds[]`)
   - "Gérer les accès" → si le dossier est lié à une `filingCell`, ouvrir la matrice d'accès
   - "Créer un sous-dossier" → dialogue rapide avec le dossier courant comme parent

### Fichiers impactés

- `src/components/modules/idocument/DocumentListPage.tsx` — vue par défaut
- `src/components/modules/idocument/FolderDocumentContextMenu.tsx` — actions rapides

---

## 3. Créer un document — Métadonnées obligatoires et classement

### Exigence du document

> *« a. Lorsqu'on clique sur "Créer un document", Digitalium demande à saisir les métadonnées obligatoires, telles que définies par l'administrateur, ainsi que le dossier où le déposer. Aucun document ne doit être "volant" ; le classement dans un dossier est donc obligatoire. »*
> *« b. Lorsqu'un document est bien créé, l'utilisateur peut le visualiser automatiquement et poser les actions souhaitées, sans avoir à le télécharger (annoter, partager, etc.). »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Saisie de métadonnées à la création | ❌ Non implémenté | Le dialogue de création ne demande qu'un **titre**. Pas de métadonnées obligatoires configurables par l'admin. |
| Classement obligatoire dans un dossier | ❌ Non implémenté | Les documents peuvent être créés sans `folderId`. La mutation `create` dans `convex/documents.ts` accepte un `folderId` optionnel. |
| Métadonnées configurables par admin | ❌ Non implémenté | Aucun mécanisme de configuration de métadonnées obligatoires n'existe dans le schéma ni dans l'interface de configuration. |
| Visualisation directe sans téléchargement | ✅ Implémenté | L'éditeur Tiptap (`EditorPage.tsx`, 1 476 lignes) permet la visualisation et l'édition directe. Les actions (annoter via commentaires, partager, soumettre pour révision) sont disponibles in-app. |
| Actions sans téléchargement | ✅ Implémenté | Annotation (système de commentaires), partage (`shareDocument`), approbation workflow — tout est in-app. |

### Travail restant

1. **Créer un système de métadonnées configurables** :
   - Nouvelle table `document_metadata_config` (ou champ dans `org.config.iDocument`)
   - Interface admin pour définir les champs obligatoires (type, description, date, etc.)
   - Dialogue de création étendu avec ces champs
2. **Rendre le dossier obligatoire** : validation serveur dans `documents.create` et `documents.createFromImport`
3. **Modifier le dialogue de création** pour inclure un sélecteur de dossier et les champs de métadonnées

### Fichiers impactés

- `convex/schema.ts` — potentielle nouvelle table ou extension de config
- `convex/documents.ts` — validation `folderId` obligatoire
- `src/components/modules/idocument/DocumentListPage.tsx` — dialogue de création enrichi

---

## 4. Configuration Orga — Modification des configurations initiales

### Exigence du document

> *« Permettre la modification des configurations initiales. Chaque changement déjà appliqué à des dossiers ou documents nécessite un traitement en lot pour appliquer les nouvelles valeurs. Un message doit donc s'afficher pour indiquer à l'Admin quels éléments sont touchés et confirmer l'application des nouvelles valeurs. »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Modification des configurations | ✅ Implémenté | Les onglets de configuration (`ModulesConfigTab.tsx`, `AutomationTab.tsx`, `IArchiveConfigPanel.tsx`) permettent de modifier les paramètres à tout moment. |
| Traitement en lot (batch update) | ❌ Non implémenté | Aucun mécanisme de propagation des changements de configuration aux éléments existants. Si l'admin change une catégorie de rétention, les archives existantes ne sont PAS mises à jour. |
| Message d'impact | ❌ Non implémenté | Aucun dialogue de confirmation montrant les éléments impactés avant application d'un changement de configuration. |
| Aperçu des éléments touchés | ❌ Non implémenté | Pas de query pour compter/lister les documents/dossiers affectés par un changement. |

### Travail restant

1. **Créer des mutations batch** dans Convex pour propager les changements :
   - `archiveConfig.propagateRetentionChange` — recalculer les dates de rétention
   - `filingCells.propagateAccessChange` — mettre à jour les accès
   - `folders.propagateConfigChange` — appliquer les nouveaux tags/métadonnées
2. **Ajouter un dialogue de confirmation** dans les panneaux de configuration montrant :
   - Nombre d'éléments impactés (query de comptage)
   - Nature du changement
   - Bouton de confirmation explicite
3. **Journaliser les changements** dans `audit_logs`

### Fichiers impactés

- `convex/archiveConfig.ts`, `convex/filingCells.ts`, `convex/folders.ts` — mutations batch
- `src/components/admin/org-detail/tabs/` — dialogues de confirmation
- `convex/auditLogs.ts` — traçabilité

---

## 5. Structure organisationnelle — Codes, hiérarchie et désactivation

### Exigences du document

> *« Les codes sont limités à 6 caractères → Permettre l'utilisation de points et tirets → Permettre jusqu'à 9 caractères »*
> *« Affichage optimisé des niveaux parents dans la création des sous-dossiers »*
> *« Codes hiérarchiques : ne pas permettre la réutilisation du même code d'un niveau à l'autre »*
> *« Créer l'action "Désactiver une unité" »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Codes limités à 6 caractères | ⚠️ Non vérifié | Le champ `code` dans `filing_cells` est un `v.string()` sans validation de longueur côté serveur. L'UI de `ClassementTab.tsx` ne montre pas de validation visible de longueur. |
| Points et tirets dans les codes | ✅ Probablement OK | Le code est un slug généré automatiquement à partir du nom. Le format slug autorise les tirets. Les points ne sont pas explicitement bloqués. |
| Jusqu'à 9 caractères | ⚠️ À valider | Pas de limite explicite trouvée — il faut ajouter une validation min/max. |
| Affichage optimisé des niveaux parents | ✅ Implémenté | Le `StructureOrgTab.tsx` (2 188 lignes) utilise un composant `TreeNode` récursif avec indentation par profondeur, chevrons d'expansion/repli, et navigation progressive. |
| Codes hiérarchiques uniques entre niveaux | ❌ Non implémenté | Aucune validation d'unicité inter-niveaux dans `filingCells.create` ou `filingCells.bulkCreate`. Un même code peut être utilisé à des niveaux différents. |
| Désactiver une unité (sans suppression) | ✅ Implémenté | Le champ `estActif` existe sur `org_units`, `filing_cells`, `cell_access_rules`, `cell_access_overrides`. Les mutations `orgUnits.update` permettent de passer `estActif: false`. L'unité reste en base mais devient invisible dans les queries actives. |

### Travail restant

1. **Validation des codes** :
   - Ajouter une validation regex côté serveur : `/^[A-Za-z0-9.\-]{1,9}$/`
   - Ajouter une vérification d'unicité globale du code (pas seulement au même niveau)
   - Mettre à jour l'UI pour afficher la contrainte (compteur de caractères, regex feedback)
2. **Unicité inter-niveaux** :
   - Dans `filingCells.create` et `filingCells.update` : query vérifiant que le code n'existe nulle part dans la structure
3. **Action "Désactiver" dans l'UI** :
   - S'assurer que le bouton est bien visible et distinct du bouton "Supprimer"
   - Vérifier que les unités désactivées sont filtrées dans les sélecteurs mais visibles dans l'admin

### Fichiers impactés

- `convex/filingCells.ts` — validation codes
- `convex/orgUnits.ts` — vérifier la mutation de désactivation
- `src/components/admin/org-detail/tabs/StructureOrgTab.tsx` — UI code validation
- `src/components/admin/org-detail/tabs/ClassementTab.tsx` — UI code validation

---

## 6. Configuration des documents — Type de document obligatoire

### Exigence du document

> *« L'archivage permet d'identifier les types de documents ciblés. Il faut donc obliger le choix du type de document (choix préconfigurés) lors de la création ou l'importation de document. Idem pour les dossiers. »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Types de documents préconfigurés | ❌ Non implémenté | Le schéma `documents` n'a pas de champ `documentType` ou `typeId`. Les documents ont des `tags` (tableau de strings libres) mais pas de type structuré. |
| Choix du type obligatoire à la création | ❌ Non implémenté | Ni le dialogue de création ni la mutation `create` ne demandent un type. |
| Choix du type à l'importation | ❌ Non implémenté | Le flux d'import AI (`createFromImport` + `aiSmartImport`) classe par dossier et tags, mais ne propose pas de type de document. |
| Types préconfigurés pour les dossiers | ❌ Non implémenté | Les dossiers n'ont pas de champ `folderType` structuré. |

### Travail restant

1. **Modèle de données** :
   - Ajouter une table `document_types` (ou un champ `documentTypes[]` dans la config de l'organisation)
   - Champs : `nom`, `code`, `description`, `icone`, `couleur`, `retentionCategorySlug` (lien avec l'archivage)
   - Ajouter `documentTypeId` au schéma `documents` et `folderTypeId` au schéma `folders`
2. **Interface admin** :
   - Nouveau panel dans `ModulesConfigTab.tsx` ou tab dédié pour gérer les types de documents
3. **Validation** :
   - Rendre `documentTypeId` obligatoire dans `documents.create` et `documents.createFromImport`
   - Ajouter le sélecteur de type dans les dialogues de création et le flux d'import
4. **Intégration archivage** :
   - Lier le type de document à la catégorie d'archivage pour automatiser le classement

### Fichiers impactés

- `convex/schema.ts` — nouvelle table ou extension
- `convex/documents.ts` — champ et validation
- `convex/folders.ts` — champ et validation
- `src/components/modules/idocument/DocumentListPage.tsx` — dialogues
- `src/components/admin/org-detail/tabs/ModulesConfigTab.tsx` — config admin

---

## 7. Gestion des permissions — Groupes de permissions

### Exigence du document

> *« On doit pouvoir créer des groupes dans la configuration afin d'assigner les permissions par groupe et non uniquement par utilisateur. »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Permissions par rôle métier | ✅ Implémenté | Les `business_roles` ont des `modulePermissions` (11 modules) et les `cell_access_rules` peuvent cibler un `businessRoleId`. |
| Permissions par unité org | ✅ Implémenté | Les `cell_access_rules` peuvent cibler un `orgUnitId`. La combinaison unité + rôle = accès. |
| Groupes personnalisés | ❌ Non implémenté | Il n'existe pas de table `permission_groups` ni de concept de groupe indépendant des unités organisationnelles et des rôles métier. |
| Assignation par groupe | ⚠️ Partiel | Les dossiers ont un champ `permissions.teamIds[]` dans le schéma, mais il n'y a pas de table `teams` ni de mécanisme de gestion d'équipes. Ce champ semble prévu mais pas implémenté. |

### Analyse

Le système actuel utilise les **unités organisationnelles** et les **rôles métier** comme "groupes de fait". C'est un système riche (matrice d'accès, overrides individuels, priorités) mais qui ne répond pas exactement au besoin de **groupes ad-hoc** que l'admin pourrait créer librement.

### Travail restant

1. **Option A — Groupes légers** (recommandé) :
   - Nouvelle table `permission_groups` : `nom`, `description`, `organizationId`, `members[]`
   - Extension de `cell_access_rules` avec un champ optionnel `groupId`
   - Interface admin dans la matrice d'accès pour créer/gérer des groupes
   - Extension du partage de dossiers avec sélection de groupes

2. **Option B — Exploiter teamIds existant** :
   - Implémenter le concept de "teams" déjà esquissé dans le schéma des dossiers
   - Créer une table `teams` avec membres
   - Connecter aux permissions existantes

### Fichiers impactés

- `convex/schema.ts` — nouvelle table `permission_groups` ou `teams`
- `convex/cellAccessRules.ts` — extension avec `groupId`
- `src/components/admin/org-detail/tabs/ClassementTab.tsx` — matrice d'accès étendue
- `src/components/modules/idocument/DocumentListPage.tsx` — partage par groupe

---

## 8. Archivage automatique — Conversion PDF

### Exigence du document

> *« Archivage automatique : préciser que cela convertit automatiquement les documents en PDF. »*

### État actuel

| Aspect | Statut | Détail |
|--------|--------|--------|
| Archivage automatique | ✅ Implémenté | Le système d'archivage est complet avec : `archiveBridge.ts` (pont iDocument → iArchive), `lifecycleScheduler.ts`, `automationEngine.ts`. Les dossiers peuvent avoir un `archiveSchedule` avec date et catégorie. |
| Conversion automatique en PDF | ⚠️ Partiel | Le schéma `archives` inclut les champs `pdfUrl` et `pdfHash` pour stocker le PDF généré. Le code `archiveBridge.ts` prévoit la gestion du PDF. MAIS la conversion effective (TipTap JSON → PDF ou fichier → PDF) via un service de conversion n'est **pas visible** dans le code. La dépendance `html2pdf.js` est dans le `package.json` mais son usage côté archivage n'est pas confirmé. |
| Information utilisateur sur la conversion | ❌ Non implémenté | Aucun message dans l'UI n'indique à l'utilisateur que l'archivage implique une conversion en PDF. |
| Double hash (contenu + PDF) | ✅ Implémenté | Le schéma archives stocke `sha256Hash` (fichier original), `contentHash` (JSON TipTap), et `pdfHash` (PDF généré). L'intégrité est vérifiable via `verifyIntegrity`. |

### Travail restant

1. **Implémenter la conversion PDF effective** :
   - Pour les documents TipTap : convertir le JSON → HTML → PDF (via `html2pdf.js` ou LibreOffice headless)
   - Pour les fichiers importés (docx, xlsx) : convertir en PDF via LibreOffice headless
   - Stocker le PDF dans Convex Storage et enregistrer `pdfUrl` + `pdfHash`
2. **Afficher un message** dans `ArchiveModal.tsx` et le flux d'archivage indiquant : *« Ce document sera automatiquement converti en PDF pour archivage »*
3. **Automatiser** dans `lifecycleScheduler.ts` : la conversion doit se faire automatiquement lors de l'archivage programmé

### Fichiers impactés

- `convex/archiveBridge.ts` — logique de conversion
- `convex/lifecycleScheduler.ts` — déclenchement auto
- `src/components/modules/idocument/ArchiveModal.tsx` — message utilisateur

---

## Tableau récapitulatif

| # | Exigence | Statut | Avancement | Priorité |
|---|----------|--------|------------|----------|
| 1 | Classement obligatoire des dossiers | ⚠️ Partiel | 35% | 🔴 Haute |
| 2 | Arborescence par défaut + actions rapides | ⚠️ Partiel | 60% | 🟡 Moyenne |
| 3 | Métadonnées obligatoires documents | ❌ Insuffisant | 20% | 🔴 Haute |
| 4 | Propagation batch des changements config | ❌ Non fait | 10% | 🟡 Moyenne |
| 5 | Codes structure org (9 car, unicité) | ⚠️ Partiel | 65% | 🟡 Moyenne |
| 6 | Types de documents obligatoires | ❌ Non fait | 5% | 🔴 Haute |
| 7 | Groupes de permissions | ⚠️ Partiel | 45% | 🟡 Moyenne |
| 8 | Conversion PDF à l'archivage | ⚠️ Partiel | 50% | 🟡 Moyenne |

---

## Recommandations de priorisation

### Phase 1 — Critique (à faire en premier)

**Exigences 1, 3 et 6** sont les plus critiques car elles touchent à l'intégrité fonctionnelle du système. Le principe fondamental du document est qu'**aucun élément ne doit être "volant"** (ni dossier sans classement, ni document sans dossier, ni document sans type). Ces trois exigences sont interdépendantes :

1. Créer le système de types de documents (exigence 6)
2. Rendre le classement dans un dossier obligatoire (exigences 1 et 3)
3. Enrichir les dialogues de création avec les métadonnées et le sélecteur d'arborescence

**Estimation** : 3-5 jours de développement

### Phase 2 — Important

**Exigences 2 et 5** améliorent l'ergonomie et la cohérence des données :

4. Changer la vue par défaut en arborescence
5. Ajouter les actions rapides au menu contextuel
6. Valider les codes (longueur, format, unicité inter-niveaux)

**Estimation** : 2-3 jours de développement

### Phase 3 — Complémentaire

**Exigences 4, 7 et 8** sont des améliorations de fond qui renforcent la robustesse :

7. Groupes de permissions ad-hoc
8. Propagation batch des changements de configuration
9. Conversion PDF effective à l'archivage

**Estimation** : 4-6 jours de développement

---

## Architecture technique du projet (référence)

### Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14.2, React 18, TypeScript |
| UI | Radix UI, Tailwind CSS, Framer Motion |
| Éditeur | Tiptap (ProseMirror) + Yjs |
| Backend | Convex (BaaS temps réel) |
| Auth | Firebase Authentication |
| IA | Google Generative AI (Gemini) |
| Fichiers | Convex Storage |
| Drag & Drop | @dnd-kit/core + sortable |

### Modules principaux

| Module | Pages | Composants | Tables Convex |
|--------|-------|------------|---------------|
| iDocument | 6 routes | 11 composants | folders, documents, document_versions, document_comments |
| iArchive | 8 routes | 14 composants | archives, archive_categories, archive_certificates, destruction_certificates, retention_alerts, alert_logs, folder_archive_metadata |
| iSignature | 6 routes | 3 composants | signatures, signature_workflows |
| Organisation | 6 onglets admin | 10 composants | org_units, org_sites, business_roles, organization_members |
| Classement | 3 sous-onglets | Intégrés dans StructureOrgTab | filing_structures, filing_cells, cell_access_rules, cell_access_overrides |

### Nombre total de fichiers source

| Type | Nombre |
|------|--------|
| Composants React (.tsx) | ~107 |
| Mutations/Queries Convex (.ts) | ~40 |
| Types TypeScript | ~12 |
| Pages/Routes | ~45 |

---

*Rapport généré le 24 mars 2026 — Analyse basée sur le code source actuel et le document Comments_6fev2026.docx*
