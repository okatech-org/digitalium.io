# Implémentation des 5 Manques Identifiés — Configuration Organisation

Objectif : Combler les 5 lacunes identifiées dans le système d'archivage pour atteindre un score de 100/100.

---

## Proposed Changes

### Feature 1 — Calendrier de Conservation (Timeline)

Ajout d'un 5e sous-onglet dans [IArchiveConfigPanel](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx#139-760) affichant une vue timeline/calendrier des échéances de rétention par catégorie.

#### [MODIFY] [IArchiveConfigPanel.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx)
- Ajouter un 5e sous-onglet `{ key: "calendrier", label: "Calendrier", icon: CalendarDays }` dans `SUB_TABS`
- Importer et rendre le nouveau composant `RetentionCalendar`

#### [NEW] [RetentionCalendar.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/RetentionCalendar.tsx)
- Component affichant un Gantt horizontal des catégories avec les phases (active → semi-active → archivée)
- Utilise les `categories` déjà queryées dans [IArchiveConfigPanel](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx#139-760)
- Barre horizontale colorée par catégorie montrant les échéances sur une échelle temporelle
- Calcul visuel : année courante → +30 ans max
- Pure UI, pas de backend additionnel requis

---

### Feature 2 — Export Rapport de Conformité

Bouton d'export dans [IArchiveConfigPanel](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx#139-760) générant un rapport HTML imprimable / PDF (via `window.print()`) résumant les catégories, durées, volumes, et références OHADA.

#### [MODIFY] [IArchiveConfigPanel.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx)
- Ajouter un bouton « Exporter rapport de conformité » dans le header du panel
- Appeler le nouveau composant/fonction `generateComplianceReport`

#### [NEW] [ComplianceReportExport.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/ComplianceReportExport.tsx)
- Composant/fonction qui génère un document HTML structuré:
  - En-tête avec nom organisation, date, logo
  - Tableau des catégories avec durées, références OHADA, phases
  - Statistiques globales (nombre archives par catégorie via query backend)
  - Section conformité OHADA
- Utilise `window.open()` + `window.print()` pour générer un PDF imprimable
- Pas de dépendance supplémentaire (jsPDF etc.)

#### [NEW] Backend query `archiveConfig.getComplianceStats`
#### [MODIFY] [archiveConfig.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archiveConfig.ts)
- Nouvelle query `getComplianceStats` : compte les archives par catégorie, archives expirées, archives en gel juridique, certificats de destruction

---

### Feature 3 — Lien Classement ↔ Catégorie de Rétention

Permettre de lier une cellule de classement (filing cell) à une catégorie de rétention. Tout document archivé depuis cette cellule héritera automatiquement de la politique de rétention.

#### [MODIFY] Schema [schema.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/schema.ts)
- Ajouter `retentionCategoryId: v.optional(v.id("archive_categories"))` à la table `filing_cells`

#### [MODIFY] [filingCells.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/filingCells.ts)
- Accepter `retentionCategoryId` optionnel dans `create`, [update](file:///Users/okatech/okatech-projects/digitalium.io/src/app/%28admin%29/admin/organizations/new/page.tsx#123-126), `bulkCreate`

#### [MODIFY] [ClassementTab.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/ClassementTab.tsx)
- Dans l'arborescence, ajouter un sélecteur `<Select>` optionnel « Catégorie de rétention » lors de l'édition/création d'une cellule
- Afficher un badge coloré sur chaque noeud si une catégorie est liée

---

### Feature 4 — Versionnage des Politiques d'Archivage

Table d'historique des modifications des politiques d'archivage avec horodatage, auteur, et diff.

#### [MODIFY] Schema [schema.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/schema.ts)
- Nouvelle table `archive_policy_changelog` : `organizationId`, `changeType` (category_created/updated/deleted, config_updated), `entityId`, `entityName`, `changes` (JSON diff), `changedBy`, `changedAt`

#### [MODIFY] [archiveConfig.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archiveConfig.ts)
- Modifier `saveConfig`, `upsertCategory`, `deleteCategory` pour écrire dans `archive_policy_changelog`
- Nouvelle query `getChangelog` pour lister l'historique avec pagination

#### [MODIFY] [IArchiveConfigPanel.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx)
- Ajouter un 6e sous-onglet `{ key: "historique", label: "Historique", icon: History }`

#### [NEW] [PolicyChangelogPanel.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/PolicyChangelogPanel.tsx)
- Affiche une liste chronologique des changements avec badges colorés par type
- Format: `[date] [auteur] a [créé/modifié/supprimé] la catégorie "Fiscal" — Durée: 10→15 ans`

---

### Feature 5 — Pipeline OCR (Extraction sur archivage)

Extraction automatique de texte OCR lors de l'archivage d'un document, en utilisant l'API native de reconnaissance du navigateur ou Tesseract.js.

#### [MODIFY] [archiveConfig.ts](file:///Users/okatech/okatech-projects/digitalium.io/convex/archiveConfig.ts)
- Nouvelle mutation `updateArchiveOcrText` pour sauvegarder le texte OCR extrait dans `archives.metadata.ocrText`

#### [NEW] [ocrExtractor.ts](file:///Users/okatech/okatech-projects/digitalium.io/src/lib/ocrExtractor.ts)
- Module utilitaire côté client qui :
  - Détecte le type de fichier (PDF → extraction texte natif, Image → canvas OCR)
  - Pour les images : utilise `<canvas>` + un appel serveur futur (stub)
  - Pour les PDFs : extraction texte basique via `pdf.js` (déjà disponible dans le projet si besoin)
  - Retourne le texte extrait
- Pour la v1 : implémentation lightweight via extraction texte PDF (pas de Tesseract lourd)

#### [MODIFY] [IArchiveConfigPanel.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/admin/org-detail/tabs/iarchive/IArchiveConfigPanel.tsx)
- Ajouter un toggle « OCR automatique à l'archivage » dans le sous-onglet Rétention ou Coffre-Fort
- Stocké dans `iArchiveConfig.ocrEnabled`

---

## Verification Plan

### Browser Testing
1. **Calendrier** : Naviguer vers Modules → iArchive → onglet Calendrier. Vérifier que les barres de Gantt s'affichent pour chaque catégorie existante.
2. **Export conformité** : Cliquer sur « Exporter rapport ». Vérifier qu'une fenêtre s'ouvre avec le rapport formaté et que le bouton imprimer fonctionne.
3. **Lien classement ↔ rétention** : Aller dans Classement → Arborescence → éditer une cellule. Vérifier que le sélecteur de catégorie de rétention apparaît et que la sélection est sauvegardée.
4. **Historique** : Naviguer vers Modules → iArchive → onglet Historique. Modifier une catégorie. Vérifier que l'entrée de changement apparaît dans la timeline.
5. **OCR toggle** : Vérifier le toggle dans la configuration iArchive.

### Build verification
- `npm run build` doit compiler sans erreur après toute modification
