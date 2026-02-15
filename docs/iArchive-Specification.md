# iArchive — Spécification complète du module d'archivage intelligent

> **Plateforme** : digitalium.io
> **Module** : iArchive (au sein de la suite iDocument · iArchive · iSignature)
> **Conformité réglementaire** : OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires)
> **Version** : 1.0 — Février 2026

---

## 1. Vision et objectif

iArchive est un moteur de gestion du cycle de vie documentaire qui automatise le passage de chaque document et dossier à travers trois phases réglementaires — **Actif → Semi-Actif → Archivé** — en respectant les durées légales OHADA et les politiques de rétention configurées par l'organisation. Le système doit notifier les utilisateurs à chaque transition imminente, adapter le comportement de recherche selon l'état du document, et garantir l'horodatage et la traçabilité intégrale.

---

## 2. Architecture du cycle de vie documentaire

### 2.1 Les trois états

Chaque document ou dossier possède un état parmi les trois suivants :

| État | Description | Recherche | Durée |
|------|-------------|-----------|-------|
| **Actif** | Document en cours d'utilisation. Pleinement accessible et prioritaire dans les résultats de recherche. | Priorité maximale | Variable, définie par la politique de rétention |
| **Semi-Actif** (Pré-Archivage) | Document qui n'est plus en usage courant mais dont la durée légale de conservation active n'est pas expirée. L'algorithme de recherche le **déprioritise** sans le masquer. | Déprioritisé (catégorisé séparément) | 1 à 5 ans par défaut, configurable par type de document |
| **Archivé** | Document transféré dans l'archive définitive. Conservation long terme, accès restreint. | Exclu des recherches courantes, accessible via recherche archive dédiée | Définie par la politique de rétention (ex. 10 ans, 99 ans, perpétuel) |

### 2.2 Phase Semi-Active optionnelle

Un type de document **peut ne pas avoir** de période Semi-Active. Dans ce cas, la transition se fait directement de **Actif → Archivé**. Cette option est configurable au niveau de la politique de rétention par catégorie.

### 2.3 Coffre-Fort numérique

Le Coffre-Fort est un cas particulier d'archivage dont la conservation est **perpétuelle** (99 ans min. par convention OHADA). Il n'a pas de durée de fin ni de transition vers la suppression. Les documents en coffre-fort ne sont jamais éligibles à la suppression automatique.

---

## 3. Politiques de rétention par catégorie

### 3.1 Structure d'une politique

Chaque catégorie documentaire est configurée avec les paramètres suivants :

```
Politique de rétention {
  categorie:              String        // Ex: "Documents Fiscaux", "Documents Sociaux", "Coffre-Fort"
  reference_legale:       String        // Ex: "OHADA 10 ans min. — Acte Uniforme Comptable Art. 24"
  description:            String        // Ex: "10 ans à compter de la clôture exercice fiscal"
  duree_archivage:        Number (ans)  // Durée totale de conservation (ex: 10, 5, 99)
  date_debut_comptage:    Enum          // Le déclencheur du compteur (voir §3.2)
  transitions: {
    duree_actif:          Number (ans)  // Durée en phase Active
    duree_semi_actif:     Number (ans)  // Durée en phase Semi-Active (0 = phase ignorée)
    delai_alerte:         Number (mois) // Délai avant transition pour déclencher les alertes
  }
  alertes_pre_archivage:  AlerteConfig[]  // Alertes avant passage en archive
  alertes_post_archivage: AlerteConfig[]  // Alertes avant suppression définitive
  coffre_fort:            Boolean         // Si true, conservation perpétuelle, pas de suppression
}
```

### 3.2 Date de début du comptage

Le compteur de rétention démarre selon l'un des déclencheurs suivants (configurable par catégorie) :

| Déclencheur | Description | Exemple d'usage |
|-------------|-------------|-----------------|
| **Date tag** | Date de création / tag initial du document | Documents fiscaux : comptage dès la clôture de l'exercice fiscal |
| **Date gel** | Date à laquelle le document est « gelé » / clôturé | Dossiers projets : comptage à la clôture du dossier |
| **Date de création** | Date de création du document dans le système | Documents sociaux : 5 ans après création |
| **Date événement** | Date d'un événement métier spécifique | Contrats : X ans après la fin du contrat |
| **Personnalisé** | Date saisie manuellement par l'utilisateur | Cas spéciaux nécessitant une date manuelle |

### 3.3 Exemples de politiques OHADA intégrées

**Documents Fiscaux** :
- Référence : OHADA 10 ans min. — Acte Uniforme Comptable Art. 24
- Durée d'archivage : **10 ans**
- Début du comptage : **Date tag** (clôture exercice fiscal)
- Transitions : Actif → 5 ans · Semi-Actif → 3 ans · Alerte → 12 mois
- 3 alertes pré-archivage configurées (3 mois, 1 semaine, 3 jours)
- 3 alertes post-archivage configurées (1 mois, 1 semaine, 1 jour)

**Documents Sociaux** :
- Référence : OHADA 5 ans min. — Code du Travail / Statuts Art. 115
- Durée d'archivage : **5 ans**
- Début du comptage : **Date de création du document**

**Coffre-Fort** :
- Référence : OHADA 99 ans min. — Conservation perpétuelle
- Durée d'archivage : **99 ans** (perpétuel)
- Début du comptage : **Date gel**
- Aucune suppression automatique, 0 alertes par défaut
- Transitions : Actif → 50 ans · Semi-Actif → 30 ans · Alerte → 60 mois

---

## 4. Système d'alertes

### 4.1 Deux catégories d'alertes

Le système gère deux familles d'alertes indépendantes pour chaque politique de rétention :

**Alertes avant archivage automatique (pré-archivage)** : Préviennent l'utilisateur qu'un document/dossier va passer de l'état Actif (ou Semi-Actif) à l'état Archivé. L'objectif est de laisser le temps de finaliser le traitement du document avant qu'il ne soit archivé.

**Alertes avant suppression (post-archivage)** : Préviennent l'utilisateur qu'un document archivé approche de sa date de fin de rétention et sera éligible à la suppression définitive. L'objectif est de permettre une revue avant destruction.

### 4.2 Configuration d'une alerte

```
AlerteConfig {
  id:           UUID
  valeur:       Number       // Ex: 3, 1, 15
  unite:        Enum         // "Mois" | "Semaine(s)" | "Jour(s)" | "Heure(s)" | "An(s)"
  description:  String       // Ex: "3 mois avant archivage", "1 semaine avant suppression"
  type:         Enum         // "pre_archivage" | "post_archivage"
}
```

### 4.3 Ajout rapide d'alertes

L'interface propose des raccourcis pour ajouter des alertes prédéfinies :

- **Pré-archivage** : +1 an, +6 mois, +3 mois, +15 jours, +1 semaine, +3 jours, +1 jour, +1 heure, +Personnalisée
- **Post-archivage** : +6 mois, +3 mois, +1 mois, +15 jours, +1 semaine, +1 jour, +1 heure, +Personnalisée

Chaque politique peut avoir **0 à N alertes** dans chaque catégorie.

### 4.4 Logique de déclenchement des alertes

```
POUR chaque document/dossier :
  date_reference = document.date_debut_comptage
  date_archivage = date_reference + politique.duree_actif + politique.duree_semi_actif
  date_suppression = date_reference + politique.duree_archivage

  POUR chaque alerte_pre IN politique.alertes_pre_archivage :
    date_declenchement = date_archivage - alerte_pre.delai
    SI maintenant >= date_declenchement ET alerte NON envoyée :
      → Envoyer notification pré-archivage
      → Marquer alerte comme envoyée

  POUR chaque alerte_post IN politique.alertes_post_archivage :
    date_declenchement = date_suppression - alerte_post.delai
    SI maintenant >= date_declenchement ET alerte NON envoyée :
      → Envoyer notification post-archivage
      → Marquer alerte comme envoyée
```

---

## 5. Archivage par dossier et par document

### 5.1 Granularité d'archivage

L'archivage opère à **deux niveaux** :

- **Par document** : Chaque fichier individuel possède son propre cycle de vie, son propre état, et ses propres dates de transition.
- **Par dossier** : Un dossier entier peut être taggé et traité comme une unité d'archivage. Lorsqu'un dossier est archivé, tous les documents qu'il contient héritent de l'état archivé.

### 5.2 Tagging unifié

Un dossier doit pouvoir être **taggé de la même manière qu'un document** :

```
EntiteArchivable {
  id:                 UUID
  type:               Enum         // "document" | "dossier"
  nom:                String
  chemin:             String       // Position dans l'arborescence
  etat:               Enum         // "actif" | "semi_actif" | "archive"
  categorie:          String       // Catégorie documentaire (lie à la politique de rétention)
  date_creation:      DateTime     // Horodatage de création
  date_modification:  DateTime     // Dernière modification
  date_tag:           DateTime     // Date de tagging / classification
  date_gel:           DateTime?    // Date de clôture / gel (nullable)
  date_evenement:     DateTime?    // Date d'événement métier (nullable)
  date_debut_comptage: DateTime    // Date effective calculée selon la politique
  politique_id:       UUID         // Référence vers la politique de rétention applicable
  alertes_envoyees:   AlerteLog[] // Historique des alertes envoyées
  horodatage:         HorodatageLog[] // Journal complet d'horodatage
}
```

### 5.3 Horodatage obligatoire

Chaque document et dossier doit être **horodaté** à chaque action :
- Création
- Modification
- Classification / tagging
- Gel / clôture
- Transition d'état (Actif → Semi-Actif → Archivé)
- Consultation en archive
- Suppression

L'horodatage est **immuable** et constitue la piste d'audit réglementaire.

---

## 6. Archivage par date et par événement

### 6.1 Archivage par date fixe

Le compteur démarre à une date absolue (création, tag, gel). Le système calcule automatiquement les dates de transition.

Exemple : Un document fiscal créé le 01/01/2020 avec une politique de 10 ans → archivage au 01/01/2030.

### 6.2 Archivage par événement

Le compteur démarre lors d'un **événement métier spécifique**. L'événement correspond à une des valeurs du champ "Date de début du comptage" de la politique.

Exemple concret :
1. Un dossier projet est ouvert le 01/03/2022
2. Le projet est clôturé le 15/09/2024 → la **date gel** est fixée
3. La politique prévoit 5 ans après la clôture → le système calcule que le dossier passera en archive le 15/09/2029
4. Les alertes sont programmées en conséquence (ex: notification 3 mois avant = 15/06/2029)

### 6.3 Logique de calcul des transitions

```
FONCTION calculer_transitions(entite, politique) :
  // Déterminer la date de référence
  SELON politique.date_debut_comptage :
    "date_tag"       → date_ref = entite.date_tag
    "date_gel"       → date_ref = entite.date_gel
    "date_creation"  → date_ref = entite.date_creation
    "date_evenement" → date_ref = entite.date_evenement

  // Si la date de référence n'est pas encore définie (ex: dossier non encore clôturé)
  SI date_ref EST NULL :
    → Le compteur ne démarre pas, l'entité reste en état "actif"
    → Surveiller l'événement déclencheur

  // Calculer les dates de transition
  date_fin_actif = date_ref + politique.transitions.duree_actif

  SI politique.transitions.duree_semi_actif > 0 :
    date_fin_semi_actif = date_fin_actif + politique.transitions.duree_semi_actif
    date_archivage = date_fin_semi_actif
  SINON :
    date_archivage = date_fin_actif  // Pas de phase semi-active

  date_fin_retention = date_ref + politique.duree_archivage

  SI politique.coffre_fort :
    date_fin_retention = JAMAIS  // Perpétuel

  RETOURNER {
    date_fin_actif,
    date_fin_semi_actif,  // null si phase ignorée
    date_archivage,
    date_fin_retention
  }
```

---

## 7. Impact sur la recherche

### 7.1 Catégorisation des résultats

L'algorithme de recherche doit **catégoriser** les résultats en fonction de l'état du document :

```
FONCTION rechercher(requete, options) :
  resultats = recherche_full_text(requete)

  // Séparer par état
  resultats_actifs     = filtrer(resultats, etat == "actif")
  resultats_semi_actifs = filtrer(resultats, etat == "semi_actif")
  resultats_archives   = filtrer(resultats, etat == "archive")

  // Par défaut, seuls les documents actifs sont affichés
  SI options.inclure_semi_actifs :
    → Ajouter resultats_semi_actifs APRÈS les actifs (déprioritisés)

  SI options.inclure_archives :
    → Ajouter resultats_archives dans une section séparée

  RETOURNER resultats_tries
```

### 7.2 Règles de priorisation

1. Les documents **Actifs** apparaissent toujours en premier
2. Les documents **Semi-Actifs** apparaissent dans une section secondaire, clairement identifiée
3. Les documents **Archivés** ne sont accessibles que via une recherche dédiée ou un filtre explicite
4. Le Coffre-Fort a sa propre interface de recherche

---

## 8. Arborescence prédéfinie

L'utilisateur/organisation dispose d'une **arborescence de dossiers prédéfinie** lors de la création de son espace. Cette arborescence :

- Est définie par l'administrateur lors de la configuration initiale de l'organisation
- Sert de structure de classement pour tous les documents
- Chaque nœud de l'arborescence peut être associé à une **catégorie documentaire** et donc à une **politique de rétention** spécifique
- Les sous-dossiers héritent de la politique du dossier parent sauf configuration explicite contraire
- L'arborescence peut être étendue par l'utilisateur mais les dossiers racine restent les catégories réglementaires

---

## 9. Automatisations (moteur CRON / scheduler)

### 9.1 Jobs automatiques requis

| Job | Fréquence | Description |
|-----|-----------|-------------|
| `check_transitions` | Quotidien | Vérifie si des documents/dossiers doivent changer d'état |
| `send_alerts` | Quotidien | Envoie les notifications pour les alertes dont la date est atteinte |
| `auto_archive` | Quotidien | Déplace les documents ayant atteint leur date d'archivage vers l'état "archivé" |
| `auto_semi_actif` | Quotidien | Déplace les documents ayant atteint leur date de fin de phase active vers "semi_actif" |
| `check_suppression` | Hebdomadaire | Identifie les documents archivés ayant dépassé leur durée de rétention |
| `horodatage_audit` | Mensuel | Vérifie l'intégrité de la chaîne d'horodatage |

### 9.2 Workflow de transition automatique

```
JOB check_transitions (exécution quotidienne) :

  POUR chaque entite IN entites_actives :
    transitions = calculer_transitions(entite, entite.politique)

    SI maintenant >= transitions.date_fin_actif ET entite.etat == "actif" :
      SI transitions.date_fin_semi_actif N'EST PAS NULL :
        → Changer entite.etat → "semi_actif"
        → Horodater la transition
        → Logger l'événement
      SINON :
        → Changer entite.etat → "archive"
        → Horodater la transition
        → Logger l'événement

    SI maintenant >= transitions.date_archivage ET entite.etat == "semi_actif" :
      → Changer entite.etat → "archive"
      → Horodater la transition
      → Logger l'événement

  POUR chaque entite IN entites_archivees :
    SI entite.politique.coffre_fort == false :
      transitions = calculer_transitions(entite, entite.politique)
      SI maintenant >= transitions.date_fin_retention :
        → Marquer comme éligible à la suppression
        → Notifier les administrateurs
        → NE PAS SUPPRIMER AUTOMATIQUEMENT (validation humaine requise)
```

---

## 10. Modèle de données suggéré

### 10.1 Tables principales

```sql
-- Politiques de rétention
retention_policies (
  id                    UUID PRIMARY KEY,
  organization_id       UUID REFERENCES organizations(id),
  category_name         VARCHAR(255),
  legal_reference       TEXT,
  description           TEXT,
  retention_duration    INTEGER,          -- en années
  counting_start_type   VARCHAR(50),      -- 'date_tag' | 'date_gel' | 'date_creation' | 'date_evenement'
  active_duration       INTEGER,          -- durée phase active en années
  semi_active_duration  INTEGER DEFAULT 0,-- durée phase semi-active (0 = ignorée)
  alert_lead_time       INTEGER,          -- délai d'alerte en mois
  is_vault              BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ
)

-- Configuration des alertes
alert_configs (
  id                UUID PRIMARY KEY,
  policy_id         UUID REFERENCES retention_policies(id),
  alert_type        VARCHAR(20),    -- 'pre_archivage' | 'post_archivage'
  value             INTEGER,
  unit              VARCHAR(20),    -- 'mois' | 'semaines' | 'jours' | 'heures' | 'ans'
  description       TEXT,
  sort_order        INTEGER
)

-- Entités archivables (documents et dossiers)
archivable_entities (
  id                    UUID PRIMARY KEY,
  organization_id       UUID REFERENCES organizations(id),
  entity_type           VARCHAR(20),    -- 'document' | 'dossier'
  name                  VARCHAR(500),
  path                  TEXT,
  state                 VARCHAR(20) DEFAULT 'actif',  -- 'actif' | 'semi_actif' | 'archive'
  policy_id             UUID REFERENCES retention_policies(id),
  parent_folder_id      UUID REFERENCES archivable_entities(id),
  created_at            TIMESTAMPTZ,
  modified_at           TIMESTAMPTZ,
  tagged_at             TIMESTAMPTZ,
  frozen_at             TIMESTAMPTZ,    -- date de gel/clôture
  event_date            TIMESTAMPTZ,    -- date événement métier
  counting_start_date   TIMESTAMPTZ,    -- date effective calculée
  active_end_date       TIMESTAMPTZ,    -- date fin phase active
  semi_active_end_date  TIMESTAMPTZ,    -- date fin phase semi-active
  archive_date          TIMESTAMPTZ,    -- date de passage en archive
  retention_end_date    TIMESTAMPTZ,    -- date fin de rétention
  eligible_for_deletion BOOLEAN DEFAULT FALSE
)

-- Journal d'horodatage (immutable, append-only)
audit_timestamps (
  id              UUID PRIMARY KEY,
  entity_id       UUID REFERENCES archivable_entities(id),
  action          VARCHAR(50),
  old_state       VARCHAR(20),
  new_state       VARCHAR(20),
  performed_by    UUID REFERENCES users(id),
  timestamp       TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB
)

-- Alertes envoyées
sent_alerts (
  id              UUID PRIMARY KEY,
  entity_id       UUID REFERENCES archivable_entities(id),
  alert_config_id UUID REFERENCES alert_configs(id),
  sent_at         TIMESTAMPTZ,
  recipients      JSONB,
  status          VARCHAR(20)     -- 'sent' | 'read' | 'acknowledged'
)
```

---

## 11. Règles métier critiques — Résumé

1. **Tout document et dossier est horodaté** à chaque action. L'horodatage est immutable.
2. **La phase Semi-Active est optionnelle** par catégorie. Si durée = 0, transition directe Actif → Archivé.
3. **Le Coffre-Fort est perpétuel**. Aucune suppression automatique, aucune date de fin.
4. **L'archivage se fait par dossier ET par document**. Un dossier taggé se comporte comme un document.
5. **Le compteur peut démarrer par date ou par événement**. Si l'événement n'a pas eu lieu, le compteur ne démarre pas.
6. **La recherche déprioritise les Semi-Actifs** et exclut les Archivés par défaut.
7. **La suppression n'est jamais automatique**. Elle nécessite une validation humaine après alerte.
8. **Les alertes sont configurables** par catégorie avec des valeurs et unités libres.
9. **L'arborescence est prédéfinie** par l'organisation. Les sous-dossiers héritent de la politique parent.
10. **La conformité OHADA** est intégrée avec des durées légales pré-configurées.

---

## 12. Interface d'administration attendue

L'écran de configuration (visible dans l'interface digitalium.io) doit permettre :

- La **sélection du module** (iDocument / iArchive / iSignature)
- L'affichage d'un **badge de conformité OHADA** confirmant l'intégration des durées légales
- Pour **chaque catégorie documentaire** :
  - Afficher la référence légale et la description
  - Configurer la **durée d'archivage** (en années)
  - Sélectionner la **date de début du comptage** via un menu déroulant
  - Visualiser les **transitions** sous forme résumée (ex: "Actif → 5a · Semi → 3a · Alerte → 12m")
  - Gérer les **alertes pré-archivage** (ajout, suppression, configuration valeur/unité)
  - Gérer les **alertes post-archivage** (ajout, suppression, configuration valeur/unité)
  - Boutons d'ajout rapide pour les durées fréquentes
  - Compteur du nombre d'alertes configurées affiché à droite

---

*Ce document constitue la spécification fonctionnelle et technique de référence pour l'implémentation du module iArchive sur la plateforme digitalium.io.*
