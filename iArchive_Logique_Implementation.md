# iArchive — Spécification Complète de la Logique Métier et d'Implémentation

> **Plateforme** : digitalium.io
> **Module** : iArchive (au sein de la suite iDocument · iArchive · iSignature)
> **Conformité réglementaire** : OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires)
> **Date de rédaction** : 15 février 2026

---

## 1. Vision Globale du Module

iArchive est un système de gestion du cycle de vie documentaire (Records Lifecycle Management) intégré à la plateforme digitalium.io. Son rôle est d'automatiser entièrement le passage des documents et dossiers à travers trois états successifs — de leur création jusqu'à leur archivage définitif ou leur suppression — tout en respectant les durées légales de conservation imposées par le droit OHADA.

Le module s'inscrit dans un panneau d'administration organisationnel (`/admin/organizations/new`) et permet de configurer des **politiques de rétention par catégorie documentaire**, chacune avec ses propres règles de transition, alertes et déclencheurs.

---

## 2. Les Trois États du Cycle de Vie Documentaire

Tout document ou dossier dans le système traverse obligatoirement un cycle de vie à **trois étapes** :

### 2.1 État « Actif »

C'est l'état par défaut de tout document ou dossier nouvellement créé ou importé.

- Le document est pleinement accessible et indexé dans le moteur de recherche.
- L'algorithme de recherche lui accorde la **priorité maximale** dans les résultats.
- Le document peut être consulté, modifié, partagé sans restriction.
- La durée de cette phase est configurable par catégorie (ex. : 5 ans pour les Documents Fiscaux, 50 ans pour le Coffre-Fort).

### 2.2 État « Semi-Actif » ou « Pré-Archivage » (optionnel)

C'est une phase de transition entre l'état actif et l'archivage définitif. Elle est **optionnelle** : certains types de documents peuvent ne pas avoir de période semi-active et passer directement de l'état Actif à l'Archivage.

- **Impact sur la recherche** : lorsqu'un document est en état semi-actif, l'algorithme de recherche **ne le priorise plus**. Il apparaît toujours dans les résultats mais dans une catégorie secondaire (résultats de recherche catégorisés : actifs vs. semi-actifs).
- La durée de cette phase est configurable : **1 à 5 ans par défaut**, ajustable par catégorie.
- Pendant cette période, le document reste consultable mais n'est plus considéré comme un document de travail courant.

### 2.3 État « Archivé »

C'est l'état final du document dans son cycle de conservation.

- Le document est archivé, en lecture seule, et conservé pour la durée légale restante.
- Après expiration de la durée totale de conservation, le système déclenche les **alertes de suppression** avant toute destruction.
- Le document peut être conservé indéfiniment dans le cas du Coffre-Fort (conservation perpétuelle).

### Synthèse du Flux

```
┌──────────┐     durée configurable     ┌──────────────┐     durée configurable     ┌──────────┐
│          │  ────────────────────────>  │              │  ────────────────────────>  │          │
│  ACTIF   │                            │  SEMI-ACTIF  │                            │ ARCHIVÉ  │
│          │                            │ (optionnel)  │                            │          │
└──────────┘                            └──────────────┘                            └──────────┘
     │                                                                                   │
     │          (si pas de phase semi-active)                                             │
     └───────────────────────────────────────────────────────────────────────────────────>│
                                                                                         │
                                                                              Après durée totale :
                                                                              Alertes suppression
                                                                                    puis
                                                                              Suppression / Revue
```

---

## 3. Politiques de Rétention par Catégorie

Chaque catégorie documentaire dispose de sa propre politique de rétention configurée dans le panneau d'administration. Voici les paramètres observés :

### 3.1 Structure d'une Politique de Rétention

Chaque politique comprend les champs suivants :

| Paramètre | Description | Exemple |
|---|---|---|
| **Nom de la catégorie** | Identifiant de la catégorie documentaire | Documents Fiscaux, Documents Sociaux, Coffre-Fort |
| **Référence légale OHADA** | Article de loi et durée minimale légale | OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24 |
| **Durée d'archivage** | Durée totale de conservation en années | 10 ans, 99 ans |
| **Date de début du comptage** | Événement déclencheur du calcul | Date tag, Date gel, Date de création du document |
| **Transitions (années)** | Répartition du temps entre les phases | Actif → 5a · Semi → 3a · Alerte → 12m |
| **Alertes avant archivage** | Notifications avant passage au semi-actif/archivé | 3 Mois, 1 Semaine, 3 Jours |
| **Alertes avant suppression** | Notifications avant destruction post-archivage | 1 Mois, 1 Semaine, 1 Jour |

### 3.2 Catégories Identifiées

#### Documents Fiscaux

- **Référence** : OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24
- **Contexte** : 10 ans à compter de la clôture de l'exercice fiscal
- **Durée d'archivage** : 10 ans
- **Date de début du comptage** : `Date tag`
- **Transitions** : Actif → 5 ans · Semi-actif → 3 ans · Alerte → 12 mois
- **Alertes avant archivage automatique** (3 alertes) :
  - 3 mois avant archivage
  - 1 semaine avant archivage
  - 3 jours avant archivage
- **Alertes avant suppression post-archivage** (3 alertes) :
  - 1 mois avant suppression
  - 1 semaine avant suppression
  - 1 jour avant suppression

#### Documents Sociaux

- **Référence** : OHADA: 5 ans min. — Code du Travail / Statuts Art. 115
- **Contexte** : 5 ans après création du document
- **Durée d'archivage** : 5 ans (à confirmer selon configuration)
- **Date de début du comptage** : Date de création ou événement social
- **Transitions** : à configurer selon les besoins

#### Coffre-Fort

- **Référence** : OHADA: 99 ans min. — Conservation perpétuelle
- **Contexte** : Conservation sans limite de durée
- **Durée d'archivage** : 99 ans (valeur symbolique pour « perpétuel »)
- **Date de début du comptage** : `Date gel`
- **Transitions** : Actif → 50 ans · Semi-actif → 30 ans · Alerte → 60 mois
- **Alertes avant archivage** : 0 alertes (conservation perpétuelle, pas de transition automatique nécessaire)
- **Alertes avant suppression** : 0 alertes (pas de suppression prévue)

---

## 4. Mécanisme de Déclenchement et Comptage

### 4.1 Déclenchement par Date

Le système calcule les transitions à partir d'une **date de début du comptage** configurable. Cette date correspond à un événement métier. Exemples de déclencheurs :

- **Date tag** : date apposée manuellement ou automatiquement sur le document (tag métier)
- **Date gel** : date à laquelle le document est « gelé » (figé, rendu non modifiable)
- **Date de clôture** : date de clôture d'un dossier ou d'un exercice fiscal
- **Date de création** : date de création du document dans le système

### 4.2 Déclenchement par Événement

En plus du déclenchement par date fixe, le système supporte l'archivage **par événement**. Le principe est le suivant :

1. Un dossier ou fichier est en cours d'utilisation (état Actif).
2. Un événement survient — par exemple, la **clôture du dossier** à une date X.
3. Le système enregistre cette date d'événement comme **point de départ du comptage**.
4. À partir de cette date, le compte à rebours commence : dans X années (1 à 5 ans configurable), le dossier ou document passe à l'état suivant (Semi-actif ou Archivé).

Les événements déclencheurs sont sélectionnables dans une liste déroulante « Date de début du comptage » et peuvent inclure n'importe quel événement métier pertinent pour la catégorie.

### 4.3 Formule de Calcul des Transitions

Pour une catégorie avec la configuration `Actif → 5a · Semi → 3a · Alerte → 12m` et une durée totale de 10 ans :

```
Date début du comptage = T₀

Phase Active :          T₀  →  T₀ + 5 ans
Alerte pré-archivage :  T₀ + 5 ans - 12 mois  =  T₀ + 4 ans
Phase Semi-Active :     T₀ + 5 ans  →  T₀ + 5 ans + 3 ans  =  T₀ + 8 ans
Phase Archivée :        T₀ + 8 ans  →  T₀ + 10 ans
Alertes suppression :   T₀ + 10 ans - [délais configurés]
```

---

## 5. Système d'Alertes

### 5.1 Alertes Avant Archivage Automatique

Ces alertes préviennent les utilisateurs qu'un document ou dossier va bientôt quitter l'état Actif pour passer en Semi-actif ou directement en Archivé.

**Options d'ajout rapide** (boutons dans l'interface) :
`+ 1 an` · `+ 6 mois` · `+ 3 mois` · `+ 15 jours` · `+ 1 semaine` · `+ 3 jours` · `+ 1 jour` · `+ 1 heure` · `+ Personnalisée`

Chaque alerte est définie par :
- Une **valeur numérique** (ex. : 3)
- Une **unité de temps** (Mois, Semaine(s), Jour(s), Heure(s))
- Un **libellé descriptif** auto-généré (ex. : « 3 mois avant archivage »)

Les alertes sont empilables : on peut en configurer autant que nécessaire (compteur visible dans l'interface, ex. : « 3 alertes »).

### 5.2 Alertes Avant Suppression (Post-Archivage)

Ces alertes préviennent les utilisateurs qu'un document archivé arrive en fin de durée de conservation et va être proposé à la suppression.

**Options d'ajout rapide** :
`+ 6 mois` · `+ 3 mois` · `+ 1 mois` · `+ 15 jours` · `+ 1 semaine` · `+ 1 jour` · `+ 1 heure` · `+ Personnalisée`

Même structure que les alertes pré-archivage : valeur + unité + libellé.

### 5.3 Logique d'Envoi des Alertes

L'implémentation doit prévoir :

1. **Un job/scheduler récurrent** (CRON ou équivalent) qui parcourt tous les documents et dossiers.
2. Pour chaque entité, le scheduler compare la date courante avec les seuils d'alerte calculés à partir de la date de début du comptage et des durées de transition.
3. Lorsqu'un seuil est atteint, une notification est envoyée (email, notification in-app, ou les deux).
4. Chaque alerte envoyée doit être tracée (éviter les doublons, journaliser l'envoi).

---

## 6. Granularité : Dossiers et Documents

### 6.1 Double Niveau de Gestion

L'archivage s'applique à **deux niveaux** :

- **Au niveau du document** (fichier individuel) : chaque fichier possède son propre cycle de vie, ses propres dates, son propre état.
- **Au niveau du dossier** (conteneur de documents) : un dossier entier peut être tagué et géré comme une unité, avec son propre cycle de vie.

### 6.2 Tagging Unifié

Le système doit pouvoir « tagger un dossier comme un document », c'est-à-dire :

- Appliquer les mêmes métadonnées de cycle de vie (état, date de début, catégorie, durée) à un dossier qu'à un document individuel.
- Permettre l'héritage optionnel : quand un dossier passe en Semi-actif, ses documents enfants peuvent hériter de cet état (ou être gérés individuellement).
- Permettre le tagging mixte : certains documents d'un dossier Actif pourraient être individuellement en Semi-actif.

### 6.3 Horodatage Obligatoire

**Chaque document et chaque dossier doivent être horodatés.** Cela implique :

- Un timestamp de création (date/heure exacte d'ajout au système).
- Un timestamp de chaque changement d'état (Actif → Semi-actif, Semi-actif → Archivé).
- Un timestamp de chaque événement déclencheur (clôture, gel, tag).
- Ces horodatages sont immuables et servent de preuve légale.

---

## 7. Arborescence Prédéfinie

L'utilisateur (l'organisation) dispose d'une **arborescence de dossiers déjà prédéfinie** lors de la création de son espace. Cela signifie :

- Le système fournit un modèle d'arborescence par défaut (probablement basé sur les catégories légales OHADA : Documents Fiscaux, Documents Sociaux, Coffre-Fort, etc.).
- L'utilisateur n'a pas à créer manuellement la structure : elle est pré-générée.
- L'arborescence peut être personnalisable après création (ajout/suppression de sous-dossiers), mais la structure de base est imposée pour garantir la conformité réglementaire.

---

## 8. Coffre-Fort Numérique

Le Coffre-Fort est un cas particulier dans le système :

- **Conservation perpétuelle** : pas de durée de fin, le document y reste indéfiniment.
- **Valeur de 99 ans** : utilisée comme représentation technique de « perpétuel » dans un champ numérique.
- **Pas d'alertes de suppression** : puisqu'il n'y a pas de fin prévue.
- **Date de début du comptage : « Date gel »** : le document est figé au moment où il entre dans le coffre-fort.
- **Transitions symboliques** : Actif → 50a · Semi → 30a · Alerte → 60m — ces valeurs sont très longues car le coffre-fort n'est pas destiné à être détruit.

---

## 9. Comportement du Moteur de Recherche

L'algorithme de recherche doit intégrer la notion d'état du cycle de vie :

- **Documents Actifs** : priorité haute dans les résultats de recherche. Ils apparaissent en premier.
- **Documents Semi-Actifs** : priorité basse. Ils apparaissent dans une section séparée ou en dessous des résultats actifs. La recherche est « catégorisée » : l'utilisateur peut voir clairement quels résultats sont actifs et lesquels sont semi-actifs.
- **Documents Archivés** : accessibles uniquement via une recherche explicite dans les archives (filtre ou section dédiée).

L'implémentation suggérée :

- Un champ `lifecycle_state` indexé (enum : `active`, `semi_active`, `archived`).
- Un scoring de recherche qui booste les documents `active`, pénalise les `semi_active`, et exclut par défaut les `archived` (sauf filtre explicite).
- Une interface de résultats segmentée avec onglets ou sections visuelles.

---

## 10. Modèle de Données Suggéré

### 10.1 Entité `RetentionPolicy` (Politique de Rétention)

```
RetentionPolicy {
  id                    : UUID
  name                  : String          // "Documents Fiscaux"
  ohada_reference       : String          // "OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24"
  description           : String          // "10 ans à compter de la clôture exercice fiscal"
  retention_duration    : Integer          // Durée totale en années (10)
  counting_start_event  : Enum/String     // "date_tag", "date_gel", "date_creation", "date_cloture"
  active_duration       : Integer          // Durée phase active en années (5)
  semi_active_duration  : Integer?         // Durée semi-actif en années (3) — nullable si pas de semi-actif
  alert_before_archive  : Integer          // Délai d'alerte pré-archivage en mois (12)
  has_semi_active_phase : Boolean          // true/false
  is_perpetual          : Boolean          // true pour le Coffre-Fort
  organization_id       : UUID            // Lien vers l'organisation
  created_at            : Timestamp
  updated_at            : Timestamp
}
```

### 10.2 Entité `RetentionAlert` (Alerte Configurable)

```
RetentionAlert {
  id                : UUID
  policy_id         : UUID              // FK vers RetentionPolicy
  alert_type        : Enum              // "pre_archive" | "pre_deletion"
  value             : Integer           // 3
  unit              : Enum              // "months" | "weeks" | "days" | "hours"
  label             : String            // "3 mois avant archivage" (auto-généré)
  created_at        : Timestamp
}
```

### 10.3 Entité `ArchiveItem` (Document ou Dossier Archivable)

```
ArchiveItem {
  id                    : UUID
  type                  : Enum              // "document" | "folder"
  name                  : String
  parent_folder_id      : UUID?             // FK vers ArchiveItem (si dossier parent)
  policy_id             : UUID              // FK vers RetentionPolicy
  lifecycle_state       : Enum              // "active" | "semi_active" | "archived"
  counting_start_date   : Timestamp         // Date de début du comptage effectif
  trigger_event         : String?           // Événement déclencheur (ex: "clôture exercice 2025")
  created_at            : Timestamp         // Horodatage de création
  state_changed_at      : Timestamp         // Dernier changement d'état
  active_until          : Timestamp         // Date calculée de fin de phase active
  semi_active_until     : Timestamp?        // Date calculée de fin de phase semi-active
  archive_until         : Timestamp         // Date calculée de fin d'archivage
  organization_id       : UUID
  tags                  : String[]          // Tags métier
}
```

### 10.4 Entité `AlertLog` (Journal des Alertes Envoyées)

```
AlertLog {
  id                : UUID
  archive_item_id   : UUID              // FK vers ArchiveItem
  alert_id          : UUID              // FK vers RetentionAlert
  sent_at           : Timestamp
  notification_type : Enum              // "email" | "in_app" | "both"
  recipient_id      : UUID              // Utilisateur notifié
  status            : Enum              // "sent" | "read" | "acknowledged"
}
```

---

## 11. Automatisations à Implémenter

### 11.1 Scheduler de Transitions d'État

Un processus automatisé (CRON job, worker, ou système événementiel) doit s'exécuter périodiquement (toutes les heures ou quotidiennement) pour :

1. **Scanner** tous les `ArchiveItem` dont la date de transition approche.
2. **Comparer** la date courante avec `active_until`, `semi_active_until`, et `archive_until`.
3. **Transitionner** automatiquement l'état :
   - Si `now >= active_until` et `has_semi_active_phase` → passer en `semi_active`.
   - Si `now >= active_until` et `!has_semi_active_phase` → passer en `archived`.
   - Si `now >= semi_active_until` → passer en `archived`.
4. **Logger** chaque transition avec horodatage.

### 11.2 Scheduler d'Alertes

Un processus distinct (ou combiné) pour l'envoi des alertes :

1. Pour chaque `ArchiveItem`, calculer les dates d'alerte en soustrayant les délais configurés des dates de transition.
2. Si `now >= date_alerte` et que l'alerte n'a pas encore été envoyée → envoyer la notification et créer un `AlertLog`.
3. Gérer le dédoublonnage : ne jamais envoyer deux fois la même alerte pour le même item.

### 11.3 Calcul Automatique des Dates lors de la Création/Import

Lors de l'ajout d'un document ou dossier :

1. Identifier la `RetentionPolicy` applicable (basée sur la catégorie du dossier parent ou le tag du document).
2. Déterminer la `counting_start_date` en fonction de l'événement configuré.
3. Calculer automatiquement : `active_until`, `semi_active_until`, `archive_until`.
4. Enregistrer le tout avec horodatage de création.

### 11.4 Recalcul lors d'un Événement Déclencheur

Lorsqu'un événement métier survient (ex. : clôture d'un dossier) :

1. Mettre à jour la `counting_start_date` avec la date de l'événement.
2. Recalculer toutes les dates de transition et de suppression.
3. Annuler les alertes obsolètes et recalculer les nouvelles.

---

## 12. Interface d'Administration (Résumé des Éléments UI)

L'interface observée dans les captures d'écran comprend :

- **Sélection du module** : onglets `iDocument` · `iArchive` · `iSignature`.
- **Bandeau de conformité** : indicateur vert « Configuration conforme OHADA — Durées légales d'archivage intégrées ».
- **Liste des politiques par catégorie** : chaque catégorie affichée comme un bloc avec son icône, son nom, sa référence OHADA, et sa description.
- **Champs de configuration** : durée d'archivage (input numérique + « ans »), date de début du comptage (select dropdown), transitions (résumé textuel).
- **Sections d'alertes dépliables** : avec compteur d'alertes et boutons d'ajout rapide (chips cliquables pour les durées prédéfinies).
- **Chaque alerte** : ligne avec valeur numérique, unité (dropdown), et libellé descriptif.

---

## 13. Contraintes Techniques et Règles Métier

1. **Conformité OHADA obligatoire** : les durées minimales légales ne peuvent pas être inférieures aux seuils OHADA. L'interface doit valider que `retention_duration >= durée_min_ohada`.
2. **Horodatage infalsifiable** : tous les timestamps doivent être générés côté serveur (pas côté client) et idéalement signés ou stockés dans un journal d'audit immuable.
3. **Pas de suppression silencieuse** : toute suppression doit être précédée des alertes configurées et d'une validation humaine (ou d'un délai de grâce après la dernière alerte).
4. **Cohérence des durées** : `active_duration + semi_active_duration ≤ retention_duration`. Le temps restant après les phases actives est la phase d'archivage pur.
5. **Coffre-Fort indestructible** : les documents dans le Coffre-Fort ne peuvent jamais être supprimés automatiquement. Seule une action administrative manuelle avec traçabilité complète peut les retirer.
6. **Multi-tenant** : chaque organisation a ses propres politiques, arborescences, et documents. Isolation stricte des données.

---

## 14. Résumé des Points Clés

| Aspect | Détail |
|---|---|
| **États du cycle de vie** | Actif → Semi-actif (optionnel) → Archivé |
| **Déclencheurs** | Par date fixe OU par événement métier |
| **Durées configurables** | 1 à 5 ans (semi-actif par défaut), illimité pour le Coffre-Fort |
| **Alertes** | Pré-archivage + Post-archivage, multiples et configurables |
| **Granularité** | Document individuel ET dossier (tagging unifié) |
| **Recherche** | Catégorisée par état (actifs priorisés, semi-actifs dépiorisés) |
| **Horodatage** | Obligatoire sur chaque entité et chaque transition |
| **Arborescence** | Prédéfinie à la création de l'organisation |
| **Conformité** | OHADA avec durées minimales légales intégrées |
| **Coffre-Fort** | Conservation perpétuelle, pas de suppression automatique |
