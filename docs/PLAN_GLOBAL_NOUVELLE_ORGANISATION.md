# Plan Global d'Implémentation — Gestion des Organisations v2

> **Architecture en 3 phases** : Inscrire → Configurer → Gérer
> Refonte complète du cycle de vie d'une organisation sur Digitalium.io.

---

## 1. Diagnostic du parcours actuel

### 1.1 Ce qui existe

**Volet « Organisations »** (`/admin/organizations`) : wizard « Nouvelle Organisation » en 8 étapes monolithiques (Profil → Modules → Écosystème → Personnel → Dossiers → Configuration → Automatisation → Déploiement). Tout se fait dans un seul flux linéaire. Les brouillons sont stockés en localStorage. L'organisation n'existe en base qu'une fois les 8 étapes terminées.

**Volet « Clients »** (`/admin/clients`) : wizard « Nouveau Client » en 3 étapes (Sélection Organisation → Abonnement → Confirmation). Crée la relation commerciale en liant un client à une organisation existante.

### 1.2 Les 6 problèmes fondamentaux

1. **Le wizard de 8 étapes est un mur** — personne ne configure un organigramme, des dossiers, des chaînes de signature ET des automatisations en une seule session. Le brouillon localStorage est un pansement sur un problème de conception.

2. **Créer et configurer sont confondus** — l'organisation n'existe pas tant qu'on n'a pas tout rempli. Or, la création (« cette entité existe ») et la configuration (« voici comment elle fonctionne ») sont deux actes distincts dans le temps.

3. **L'ordre des étapes crée des dépendances circulaires** — on définit le Personnel (étape 4) avant les Dossiers (étape 5), alors qu'on aimerait savoir quels dossiers existent pour assigner les accès. On configure les modules (étape 6) après avoir défini les dossiers, alors que la config des modules influence les dossiers.

4. **Pas de rôles métier** — le DRH et l'assistante RH du même service voient les mêmes dossiers. Il n'y a aucune granularité fonctionnelle.

5. **« Écosystème » ne veut rien dire** — le nom est opaque et le contenu mélange infrastructure physique (sites) et structure logique (organigramme).

6. **Données 100% mockées** — rien n'est persisté en base. Seule la SEEG a des données complètes, les autres organisations sont des coquilles vides.

---

## 2. Nouvelle architecture — INSCRIRE / CONFIGURER / GÉRER

### 2.1 Principe

On sépare le cycle de vie en **3 phases distinctes**, chacune dans son propre contexte d'utilisation :

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   PHASE 1 — INSCRIRE                    Volet « Organisations »      ║
║   Wizard rapide (3 étapes, ~5 min)      /admin/organizations/new     ║
║   → L'organisation EXISTE en base                                    ║
║     Statut : « Brouillon »                                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   PHASE 2 — CONFIGURER                  Fiche Organisation           ║
║   Onglets indépendants, à son rythme    /admin/organizations/[id]    ║
║   → L'organisation est PRÊTE                                        ║
║     Statut : « Brouillon » → « Prête »                             ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   PHASE 3 — GÉRER                       Volet « Clients »           ║
║   Relation commerciale + activation     /admin/clients/new           ║
║   → L'organisation est ACTIVE                                       ║
║     Statut : « Prête » → « Active »                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 2.2 Pourquoi 3 phases et pas un wizard géant

**L'analogie** : créer une organisation, c'est comme emménager dans un immeuble de bureaux.

- **Inscrire** = signer le bail (qui êtes-vous, quel bâtiment, quelles options). 5 minutes. Après ça, le bureau existe.
- **Configurer** = aménager les bureaux (organigramme sur les portes, classeurs dans les armoires, circuits de validation sur le mur). On fait ça pièce par pièce, sur plusieurs jours, pas nécessairement dans l'ordre.
- **Gérer** = ouvrir officiellement. On active les badges d'accès, on lance la facturation.

### 2.3 Les statuts du cycle de vie

```
Brouillon ──→ Prête ──→ Active ──→ Suspendue
    │            │                      │
    │            │                      ↓
    ↓            ↓                  Résiliée
  Supprimée   Supprimée
```

| Statut | Signification | Qui peut agir | Visible côté collaborateur |
|--------|--------------|---------------|---------------------------|
| **Brouillon** | Créée mais pas configurée | Admin plateforme uniquement | Non |
| **Prête** | Configurée, checklist validée | Admin plateforme | Non |
| **Active** | En production, facturation en cours | Admin plateforme + Admin org | Oui |
| **Suspendue** | Temporairement désactivée (impayé, maintenance) | Admin plateforme | Non (message d'info) |
| **Résiliée** | Contrat terminé, données en rétention | Admin plateforme | Non |

---

## 3. PHASE 1 — INSCRIRE (Wizard « Nouvelle Organisation »)

### 3.1 Principe

Un wizard rapide en **3 étapes** qui crée l'organisation en base immédiatement. L'objectif est de répondre à : **qui, quoi, où** — en moins de 5 minutes.

```
┌─────────┐     ┌─────────┐     ┌──────────────┐
│ 1.Profil │ ──→ │2.Modules│ ──→ │3.Déploiement │
└─────────┘     └─────────┘     └──────────────┘
  Qui ?           Quoi ?          Où ?
  (~2 min)        (~1 min)        (~2 min)
```

### 3.2 Étape 1 — Profil

**Question** : « Qui est cette organisation ? »

```
┌──────────────────────────────────────────────────────────────┐
│  NOUVELLE ORGANISATION — Étape 1/3 : Profil                  │
│                                                                │
│  ── Identité ─────────────────────────────────────────────── │
│  Raison sociale     [________________________]                │
│  Type               [▼ Entreprise          ]  ← DÉTERMINANT  │
│                      • Entreprise (PME/GE)                    │
│                      • Institution (hôpital, université)      │
│                      • Administration (ministère, mairie)     │
│                      • Organisme (CNSS, CNAMGS, régulateur)  │
│  Secteur d'activité [▼ Énergie & Eau       ]                │
│  RCCM               [________________________]                │
│  NIF                [________________________]                │
│                                                                │
│  ── Coordonnées ──────────────────────────────────────────── │
│  Contact principal  [________________________]                │
│  Email              [________________________]                │
│  Téléphone          [________________________]                │
│  Adresse siège      [________________________]                │
│  Ville              [________________________]                │
│                                                                │
│  ── Sites (optionnel, peut être complété plus tard) ──────── │
│  ☑ Siège social : Libreville (auto-rempli depuis adresse)   │
│  [+ Ajouter un site]                                         │
│                                                                │
│                                          [Suivant →]          │
└──────────────────────────────────────────────────────────────┘
```

**Le champ « Type » est le déterminant principal** : il conditionne les presets de tout le reste (vocabulaire de l'organigramme, rôles métier prédéfinis, templates de classement, workflows par défaut).

**Données persistées immédiatement** : table `organizations` (identité) + table `org_sites` (siège au minimum).

### 3.3 Étape 2 — Modules

**Question** : « Quels outils veut-on ? »

```
┌──────────────────────────────────────────────────────────────┐
│  NOUVELLE ORGANISATION — Étape 2/3 : Modules                 │
│                                                                │
│  Sélectionnez les modules à activer pour cette organisation.  │
│  Vous pourrez modifier ces choix plus tard.                   │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ 📄 iDocument     │  │ 📦 iArchive      │                  │
│  │ Édition collab.  │  │ Archivage légal  │                  │
│  │ Dossiers partagés│  │ Coffre-fort num. │                  │
│  │ Versionnage      │  │ Rétention OHADA  │                  │
│  │                  │  │                  │                  │
│  │ [✅ Activé]      │  │ [✅ Activé]      │                  │
│  └──────────────────┘  └──────────────────┘                  │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ ✍️ iSignature    │  │ 🤖 iAsted       │                  │
│  │ Signature élec.  │  │ Assistant IA     │                  │
│  │ Circuits valid.  │  │ Analyse docs     │                  │
│  │ Parapheur        │  │ Suggestions      │                  │
│  │                  │  │                  │                  │
│  │ [✅ Activé]      │  │ [  Désactivé  ]  │                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                                │
│  💡 Les modules conditionnent les options de configuration    │
│     disponibles dans la fiche organisation.                   │
│                                                                │
│                              [← Retour]  [Suivant →]          │
└──────────────────────────────────────────────────────────────┘
```

**Simplicité** : pas de plan ni d'abonnement ici. Les modules sont juste activés/désactivés. L'abonnement et la facturation se gèrent dans le volet Clients (Phase 3).

**Données persistées** : champ `modules` de `organizations` + champ `quota` (valeurs par défaut selon le type).

### 3.4 Étape 3 — Déploiement

**Question** : « Où héberger les données ? »

```
┌──────────────────────────────────────────────────────────────┐
│  NOUVELLE ORGANISATION — Étape 3/3 : Déploiement             │
│                                                                │
│  ── Hébergement des données ─────────────────────────────── │
│                                                                │
│  ○ ☁️  Cloud                                                 │
│    Infrastructure cloud (AWS/Azure)                           │
│    Idéal pour : PME, startups, organisations distribuées     │
│                                                                │
│  ● 🏢 Data Center DIGITALIUM                                 │
│    Centre de données souverain                                │
│    Idéal pour : entreprises, organismes publics              │
│                                                                │
│  ○ 🏠 Local (On-Premise)                                     │
│    Serveur chez le client                                     │
│    Idéal pour : ministères, institutions sensibles           │
│                                                                │
│  ── Personnalisation (optionnel) ────────────────────────── │
│  Domaine           [seeg          ].digitalium.io             │
│  Page publique     [✅ Activée]                               │
│                                                                │
│  ── Récapitulatif ───────────────────────────────────────── │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ SEEG • Entreprise • Énergie & Eau                      │  │
│  │ Modules : iDocument, iArchive, iSignature              │  │
│  │ Hébergement : Data Center DIGITALIUM                   │  │
│  │ 1 site • Statut après création : Brouillon             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ⓘ L'organisation sera créée en statut « Brouillon ».       │
│    Configurez-la ensuite via sa fiche avant de l'activer.    │
│                                                                │
│                       [← Retour]  [✓ Créer l'organisation]   │
└──────────────────────────────────────────────────────────────┘
```

**Au clic sur « Créer »** : l'organisation est persistée en base Convex avec statut `brouillon`. L'admin est redirigé vers la fiche organisation (`/admin/organizations/[id]`) qui affiche un bandeau « Configuration requise » avec la checklist.

---

## 4. PHASE 2 — CONFIGURER (Fiche Organisation)

### 4.1 Principe

La fiche organisation (`/admin/organizations/[id]`) est le **cockpit de configuration**. Elle contient des onglets indépendants, chacun configurable dans n'importe quel ordre, à n'importe quel moment. Chaque onglet a un indicateur de complétude (vide / en cours / complet).

### 4.2 Le bandeau de progression

En haut de la fiche, un bandeau permanent affiche l'avancement :

```
┌──────────────────────────────────────────────────────────────────────┐
│  SEEG — Brouillon                                                     │
│                                                                        │
│  ┌──────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────┐ ┌─────────┐ │
│  │Profil│ │Structure │ │Classem. │ │ Config │ │Auto. │ │Déploiem.│ │
│  │  ✅  │ │ Org.  ⚠️ │ │   ❌    │ │  ❌    │ │  ❌  │ │   ✅    │ │
│  └──────┘ └──────────┘ └─────────┘ └────────┘ └──────┘ └─────────┘ │
│                                                                        │
│  Progression : ██████░░░░░░░░░░░░░░ 33%                              │
│  ⚠️ 3 onglets à configurer avant activation                          │
│  Requis : Structure Org. (au moins 1 unité) • Classement (≥1 dossier)│
│           Configuration modules (paramètres de base)                  │
│                                                        [▶ Activer]    │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 Les 6 onglets de configuration

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Profil] [Structure Org.] [Classement] [Config] [Auto.] [Déploiem.]│
└─────────────────────────────────────────────────────────────────────┘
```

| # | Onglet | Contenu | Pré-requis | Obligatoire |
|---|--------|---------|------------|-------------|
| 1 | **Profil** | Identité + Sites + Coordonnées | Aucun (rempli à l'inscription) | ✅ Oui |
| 2 | **Structure Organisationnelle** | Organigramme + Rôles Métier + Personnel | Aucun | ✅ Oui (min 1 unité + 1 admin) |
| 3 | **Structure de Classement** | Arborescence dossiers + Matrice d'accès + Habilitations | Structure Org. (pour la matrice) | ✅ Oui (min 1 dossier) |
| 4 | **Configuration Modules** | Paramétrage iDocument / iArchive / iSignature | Modules (définis à l'inscription) | ✅ Oui (paramètres de base) |
| 5 | **Automatisation** | Workflows + Règles QUAND/ALORS | Classement + Config Modules | ❌ Optionnel |
| 6 | **Déploiement** | Hébergement + Domaine + Thème | Aucun (rempli à l'inscription) | ✅ Oui |

#### Dépendances entre onglets

```
 Profil ←──────── rempli à l'inscription
   │
   ↓
 Structure Org. ← peut se faire juste après l'inscription
   │
   ↓
 Classement ←──── nécessite Structure Org. (pour la matrice)
   │
   ↓
 Config Modules ← indépendant (mais enrichi par le Classement)
   │
   ↓
 Automatisation ← exploite Classement + Config Modules
   │
 Déploiement ←─── rempli à l'inscription, modifiable

 ──→ = dépendance directe (l'onglet B utilise les données de A)
```

**Les onglets sans pré-requis** (Profil, Structure Org., Config Modules, Déploiement) sont accessibles dès la création. Les onglets avec pré-requis affichent un message « Configurez d'abord [onglet X] » si la dépendance n'est pas satisfaite.

### 4.4 Onglet 1 — Profil (reprise de l'inscription)

Identique à l'étape 1 de l'inscription, mais en mode édition complète. On peut ajouter des sites supplémentaires, modifier les coordonnées, compléter les champs facultatifs (logo, description longue).

### 4.5 Onglet 2 — Structure Organisationnelle

**3 sous-onglets** :

**A. Organigramme** — Arborescence drag-and-drop des unités :
```
Direction Générale
├── Secrétariat Général
├── Direction Technique
│   ├── Production Électrique
│   ├── Distribution Eau
│   └── Maintenance
├── Direction Commerciale
│   ├── Ventes Entreprises
│   └── Recouvrement
└── Direction Administrative
    ├── Ressources Humaines
    ├── Comptabilité
    └── Juridique
```

Les types d'unités sont adaptés au type d'organisation :

| Type d'org | Vocabulaire des unités |
|-----------|----------------------|
| Entreprise | Direction Générale → Direction → Département → Service |
| Administration | Cabinet → Secrétariat Général → Direction → Service → Bureau |
| Institution | Rectorat/Direction → Décanat/Département → Service → Unité |
| Organisme | Direction Générale → Direction → Département → Cellule |

**B. Rôles Métier** — Définition des fonctions propres à l'organisation :

Des rôles prédéfinis sont proposés selon le type d'org. L'admin peut les personnaliser librement.

| Type d'org | Rôles prédéfinis |
|-----------|-----------------|
| Entreprise | DG, DAF, DRH, Directeur, Chef de Service, Juriste, Comptable, Assistant(e), Technicien |
| Administration | Ministre, Secrétaire Général, Directeur, Chef de Service, Agent, Archiviste, Secrétaire |
| Institution | Directeur, Doyen, Professeur, Chercheur, Secrétaire Académique, Gestionnaire |
| Organisme | Directeur Général, Directeur, Contrôleur, Agent de Traitement, Juriste |

Chaque rôle a : nom, description, couleur, icône.

**C. Personnel** — Ajout des collaborateurs :

| Champ | Description |
|-------|-------------|
| Nom, Email, Poste | Informations de base |
| Service | OrgUnit d'affectation (sélection dans l'arborescence du sous-onglet A) |
| Rôle plateforme | Droits techniques : org_admin / org_manager / org_member / org_viewer |
| Rôle métier | Fonction : DRH, Comptable, Juriste... (sélection parmi les rôles du sous-onglet B) |

**Tables** : `org_units`, `business_roles`, `organization_members` (enrichie)

### 4.6 Onglet 3 — Structure de Classement

Le cœur du système. **3 sous-onglets** :

**A. Arborescence** — Définition des cellules (dossiers) :
- Template prédéfini proposé selon le type d'org (modifiable)
- Drag-and-drop, profondeur illimitée
- Chaque cellule : nom, icône, couleur, tags, catégorie, module associé, confidentialité

**B. Matrice d'Accès** — Qui accède à quoi :
- Grille interactive : cellules (lignes) × couples Service + Rôle Métier (colonnes)
- 5 niveaux : — (aucun) / read / write / manage / full
- Héritage parent-enfant automatique
- Filtres par service, module, confidentialité

```
                     │ RH       │ RH        │ Compta    │ DG
 Cellule             │ DRH      │ Assistant  │ Comptable │ DG
 ────────────────────┼──────────┼───────────┼───────────┼────────
 📁 Docs Fiscaux     │    —     │    —      │  ✏️ write │ 🔑 full
 📁 Documents RH     │  ✏️ write│  👁 read  │    —      │ 🔑 full
   ├ Contrats        │  ✏️      │  👁       │    —      │ 🔑
   ├ Bulletins Paie  │  ✏️      │  ✏️       │  👁 read  │ 🔑
   ├ Disciplinaires  │  ⚙️ mng  │    —      │    —      │ 🔑
 📁 Juridique        │    —     │    —      │    —      │ 🔑 full
```

**C. Habilitations Individuelles** — Overrides par collaborateur :
- Recherche d'un collaborateur → vue de ses accès effectifs (source : rôle ou override)
- Ajout/retrait d'accès avec motif obligatoire et expiration optionnelle

**Tables** : `filing_structures`, `filing_cells`, `cell_access_rules`, `cell_access_overrides`

### 4.7 Onglet 4 — Configuration des Modules

N'affiche que les modules activés à l'inscription. **Sous-onglets par module** :

**iDocument** :
- Paramètres (versionnage, auto-classification, champs obligatoires)
- Catégories de tags (Nature, Confidentialité, Priorité)
- Règles de classement automatique

**iArchive** :
- Conformité OHADA (bannière)
- Politiques de rétention par catégorie (durée, déclencheur, référence OHADA)
- Cycle de vie (pipeline 8 états : Création → Actif → Semi-actif → Archivé → Gel → Expiration → Expiré → Détruit)
- Catégories d'archivage (Fiscal, Social, Juridique, Client, Coffre-Fort)
- Règles de notification (alertes avant expiration)

**iSignature** :
- Paramètres (signature avancée, horodatage, contre-signature, délais)
- Chaînes de signature (circuits multi-étapes : Visa → Approbation → Signature → Contre-signature)
- Délégations (transferts temporaires de pouvoir de signature)

### 4.8 Onglet 5 — Automatisation

**Sous-onglets** :

**A. Workflows prédéfinis** :
- Templates par type d'org, activables/désactivables
- Entreprise : Validation DG simple, Archivage post-signature
- Administration : Validation hiérarchique, Parapheur électronique
- Organisme : Validation par comité avec quorum

**B. Règles personnalisées** :
- Format QUAND (déclencheur + conditions) → ALORS (actions ordonnées)
- Déclencheurs : document créé/tagué/approuvé, archive déposée, rétention expirante, signature complétée
- Actions : archiver, classer, notifier, changer statut, envoyer en signature, générer certificat

### 4.9 Onglet 6 — Déploiement (reprise de l'inscription)

Identique à l'étape 3 de l'inscription, mais en mode édition complète :
- Hébergement (modifiable)
- Domaine personnalisé
- Thème / branding (couleur, gradient, logo, favicon)
- Page publique + annuaire
- Ressources allouées (CPU, RAM, Stockage selon le plan)

### 4.10 La checklist d'activation

Le bouton « Activer » n'est cliquable que si la checklist est complète :

```
Checklist d'activation
──────────────────────
✅ Profil complet (raison sociale + type + au moins 1 site)
✅ Au moins 1 module activé
⬜ Structure organisationnelle (au moins 1 unité + 1 collaborateur org_admin)
⬜ Structure de classement (au moins 1 dossier racine)
⬜ Configuration modules (paramètres de base définis)
✅ Hébergement choisi

Statut actuel : Brouillon
Progression : 3/6 ──────████████░░░░░░ 50%
```

Quand la checklist est complète, le statut passe à « Prête ». L'activation effective (statut « Active ») se fait soit depuis la fiche, soit via le volet Clients.

---

## 5. PHASE 3 — GÉRER (Volet « Clients »)

### 5.1 Principe

Le volet Clients reste tel qu'il est, avec un enrichissement : il gère la **relation commerciale** et **l'activation** de l'organisation.

### 5.2 Wizard « Nouveau Client » enrichi (3 étapes)

**Étape 1 — Sélection Organisation** (existant) :
- Recherche/sélection parmi les organisations existantes
- Filtre : ne montre que les organisations en statut « Prête » (configurées)
- Affiche un résumé de l'org (type, modules, sites, collaborateurs)

**Étape 2 — Abonnement** (existant + enrichi) :
- Plan : Starter / Pro / Enterprise / Institutionnel
- Cycle : mensuel / annuel
- Le plan sélectionné met à jour les quotas de l'organisation (maxUsers, maxStorage)
- Contact commercial

**Étape 3 — Confirmation & Activation** (enrichi) :
- Récapitulatif complet (org + plan + config)
- Bouton « Créer le client & Activer l'organisation »
- L'organisation passe de « Prête » à « Active »
- Les collaborateurs peuvent désormais se connecter

### 5.3 Gestion continue

Le volet Clients permet aussi la gestion post-activation : changement de plan, suspension (impayé), résiliation, suivi du chiffre d'affaires, gestion de la facturation.

---

## 6. Comparaison des modèles

### 6.1 Ancien (wizard 8 étapes) vs Nouveau (3 phases)

| Critère | Wizard monolithique (8 étapes) | 3 phases (Inscrire/Configurer/Gérer) |
|---------|-------------------------------|--------------------------------------|
| **Temps de création** | 30-60 min (tout d'un coup) | 5 min (inscription) + à son rythme |
| **Brouillons** | localStorage (fragile) | Base Convex (statut « Brouillon ») |
| **Ordre des étapes** | Linéaire, obligatoire | Libre (onglets indépendants) |
| **Collaboration** | Un seul admin fait tout | Plusieurs admins peuvent configurer en parallèle |
| **Visibilité** | Rien visible tant que pas fini | L'org existe dès l'inscription |
| **Complexité ressentie** | 8 écrans avant de voir un résultat | 3 écrans + config progressive |
| **Itération** | Difficile (retour arrière dans le wizard) | Naturelle (onglets modifiables à tout moment) |

### 6.2 Comment le contenu des 8 étapes est redistribué

| Ancien (wizard) | Nouveau (3 phases) |
|-----------------|-------------------|
| 1. Profil | → **Phase 1** étape 1 (inscription) + **Phase 2** onglet Profil (édition) |
| 2. Modules | → **Phase 1** étape 2 (inscription) |
| 3. Écosystème (Sites) | → **Phase 1** étape 1 sites + **Phase 2** onglet Profil |
| 3. Écosystème (OrgUnits) | → **Phase 2** onglet Structure Organisationnelle |
| 4. Personnel | → **Phase 2** onglet Structure Organisationnelle (sous-onglet C) |
| 5. Dossiers | → **Phase 2** onglet Structure de Classement |
| 6. Configuration | → **Phase 2** onglet Configuration Modules |
| 7. Automatisation | → **Phase 2** onglet Automatisation |
| 8. Déploiement | → **Phase 1** étape 3 (inscription) + **Phase 2** onglet Déploiement (édition) |
| — (abonnement) | → **Phase 3** volet Clients |

**Rien n'est perdu.** Tout le contenu fonctionnel est préservé. Il est simplement redistribué de manière plus logique.

---

## 7. Architecture technique

### 7.1 Nouvelles tables Convex (7 tables)

```
org_sites              — Sites physiques de l'organisation
org_units              — Unités organisationnelles (hiérarchie)
business_roles         — Rôles métier par organisation
filing_structures      — Modèles de classement
filing_cells           — Cellules (dossiers) d'une structure
cell_access_rules      — Règles d'accès (Service × Rôle Métier → Cellule)
cell_access_overrides  — Habilitations individuelles
```

### 7.2 Tables existantes modifiées

```
organizations          — Ajout champ `status` (brouillon/prete/active/suspendue/resiliee)
                         Ajout config structurée par module
organization_members   — Ajout orgUnitId + businessRoleId
```

### 7.3 Nouveaux fichiers

**Backend (Convex)** :

| Fichier | Rôle |
|---------|------|
| `convex/org_sites.ts` | CRUD sites |
| `convex/org_units.ts` | CRUD unités org + arborescence |
| `convex/business_roles.ts` | CRUD rôles métier + presets |
| `convex/filing_structures.ts` | CRUD structures de classement |
| `convex/filing_cells.ts` | CRUD cellules + arborescence |
| `convex/cell_access.ts` | Règles d'accès + overrides + résolution |
| `convex/org_lifecycle.ts` | Transitions de statut + checklist validation |

**Frontend — Wizard inscription** :

| Fichier | Rôle |
|---------|------|
| `src/app/(admin)/admin/organizations/new/page.tsx` | Refonte — wizard 3 étapes |
| `src/components/admin/org-wizard/StepProfile.tsx` | Étape 1 — Profil |
| `src/components/admin/org-wizard/StepModules.tsx` | Étape 2 — Modules |
| `src/components/admin/org-wizard/StepDeploy.tsx` | Étape 3 — Déploiement |

**Frontend — Fiche organisation (onglets)** :

| Fichier | Rôle |
|---------|------|
| `src/app/(admin)/admin/organizations/[id]/page.tsx` | Refonte — 6 onglets + bandeau |
| `src/components/admin/org-tabs/ProfileTab.tsx` | Onglet Profil |
| `src/components/admin/org-tabs/StructureTab.tsx` | Onglet Structure Organisationnelle |
| `src/components/admin/org-tabs/FilingTab.tsx` | Onglet Structure de Classement |
| `src/components/admin/org-tabs/ConfigTab.tsx` | Onglet Configuration Modules |
| `src/components/admin/org-tabs/AutomationTab.tsx` | Onglet Automatisation |
| `src/components/admin/org-tabs/DeployTab.tsx` | Onglet Déploiement |
| `src/components/admin/org-tabs/ProgressBanner.tsx` | Bandeau de progression + checklist |

**Frontend — Composants partagés** :

| Fichier | Rôle |
|---------|------|
| `src/components/admin/filing-structure/FilingTreeEditor.tsx` | Éditeur d'arborescence |
| `src/components/admin/filing-structure/AccessMatrix.tsx` | Matrice d'accès |
| `src/components/admin/filing-structure/IndividualAccess.tsx` | Habilitations individuelles |
| `src/components/admin/org-structure/OrgTreeEditor.tsx` | Éditeur d'organigramme |
| `src/components/admin/org-structure/RoleManager.tsx` | Gestion des rôles métier |
| `src/components/admin/org-structure/PersonnelTable.tsx` | Table du personnel enrichie |

**Configuration & Types** :

| Fichier | Rôle |
|---------|------|
| `src/types/filing.ts` | Types TS pour le classement |
| `src/types/org-structure.ts` | Types TS pour OrgUnits, Sites, Roles |
| `src/config/filing-presets.ts` | Templates d'arborescences par type d'org |
| `src/config/business-role-presets.ts` | Rôles métier par secteur |
| `src/hooks/useFilingAccess.ts` | Résolution d'accès côté client |
| `src/hooks/useOrgStructure.ts` | Gestion organigramme |
| `src/hooks/useOrgLifecycle.ts` | Gestion du statut + checklist |

### 7.4 Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `convex/schema.ts` | 7 nouvelles tables + modification `organizations` et `organization_members` |
| `src/app/(admin)/admin/organizations/page.tsx` | Afficher le statut de chaque org + progression |
| `src/app/(admin)/admin/clients/new/page.tsx` | Filtrer par statut « Prête » + activation |
| `src/config/rbac.ts` | Ajouter permissions `canManageFilingStructure`, `canManageOrgStructure` |
| `src/components/modules/idocument/DocumentListPage.tsx` | Filtrage dossiers par accès résolu |
| `convex/documents.ts` | Vérification d'accès avant CRUD |
| `src/components/layout/AdminUnifiedLayout.tsx` | Badge statut dans la nav Organisations |

---

## 8. Scénario complet — SEEG

### Phase 1 — Inscription (5 minutes)

L'admin plateforme clique sur « Nouvelle Organisation » :

**Étape 1 (Profil)** : SEEG, Entreprise, Énergie & Eau, RCCM, NIF, contact, siège à Libreville.
**Étape 2 (Modules)** : iDocument ✅, iArchive ✅, iSignature ✅, iAsted ❌.
**Étape 3 (Déploiement)** : Data Center DIGITALIUM, domaine seeg.digitalium.io.

→ Clic « Créer » → SEEG existe en base, statut **Brouillon**.
→ Redirection vers la fiche `/admin/organizations/seeg`.

### Phase 2 — Configuration (sur plusieurs jours)

**Jour 1 — L'admin configure la Structure Organisationnelle** :
- Construit l'organigramme (4 directions, 12 services)
- Crée les rôles métier (DG, DRH, DAF, Juriste, Comptable, Technicien...)
- Ajoute 5 collaborateurs clés avec leur triple affectation (service + rôle plateforme + rôle métier)
- → Onglet passe à ✅

**Jour 2 — L'admin configure la Structure de Classement** :
- Le template « PME Gabonaise » est pré-rempli (6 dossiers racine)
- Personnalise l'arborescence (ajoute « Maintenance Industrielle »)
- Remplit la matrice d'accès service × rôle métier
- Ajoute un override pour Rose Mintsa (accès lecture aux Liasses Fiscales)
- → Onglet passe à ✅

**Jour 3 — L'admin configure les Modules** :
- iDocument : versionnage 10, tags obligatoires
- iArchive : rétention OHADA, notifications 6/3/1 mois
- iSignature : 3 chaînes, horodatage certifié
- → Onglet passe à ✅

**Jour 4 — L'admin configure l'Automatisation** :
- Active 4 règles (archivage auto, signature auto, alertes expiration, classement PV)
- → Onglet passe à ✅ (mais optionnel)

**Résultat** : Checklist 6/6 → Statut passe à **Prête**.

### Phase 3 — Activation (volet Clients)

Le commercial crée un « Nouveau Client » :
- Sélectionne SEEG (statut Prête)
- Plan Enterprise, 3.5M XAF/mois, cycle annuel
- Confirme → SEEG passe à **Active**

Les collaborateurs peuvent se connecter. Hélène Mboumba (DRH) ouvre iDocument et ne voit que ses dossiers RH.

---

## 9. Règles de précédence RBAC × Accès Classement

### 9.1 Principe

L'accès documentaire = intersection de deux systèmes :
- **Rôle plateforme** → ce que l'utilisateur peut **faire** (lire, écrire, gérer)
- **Structure de Classement** → ce que l'utilisateur peut **voir** (quels dossiers)

Résultat effectif = `MIN(permission plateforme, accès classement)`

### 9.2 Matrice de précédence

| Rôle Plateforme | Accès Classement | Résultat effectif |
|----------------|------------------|-------------------|
| `org_admin` (level 0-2) | quel que soit | **full** sur TOUS les dossiers (bypass) |
| `org_manager` (level 3) | full | manage (plafonné) |
| `org_manager` (level 3) | write | write |
| `org_member` (level 4) | manage | write (plafonné) |
| `org_member` (level 4) | write | write |
| `org_member` (level 4) | read | read |
| `org_viewer` (level 5) | write | **read** (plafonné) |
| `org_viewer` (level 5) | read | read |
| tout rôle | — (aucun) | **aucun accès** |

### 9.3 Règles

1. **Les org_admin voient tout** — bypass total de la Structure de Classement.
2. **Le rôle plateforme plafonne** — un org_viewer ne peut jamais écrire, même avec un accès write dans la matrice.
3. **Le classement filtre** — un org_member ne voit que les dossiers où la matrice lui accorde un accès.
4. **Les overrides respectent le plafond** — un grant(write) pour un org_viewer est plafonné à read.

### 9.4 Migration `filing_cells` ← `folders`

- **Phase transitoire** : `filing_cells` coexistent avec `folders`, liées par `legacyFolderId`.
- **Phase migration** : `documents.parentFolderId` migré vers `filing_cells`.
- **Phase finale** : `folders` dépréciée, `filing_cells` seule source de vérité.

---

## 10. Phases d'implémentation

### Phase 1 — Fondations Data (Semaines 1-2)

| Tâche | Fichier(s) | Priorité |
|-------|-----------|----------|
| Schéma Convex (7 nouvelles tables + modifications) | `convex/schema.ts` | Critique |
| API CRUD org_sites | `convex/org_sites.ts` | Haute |
| API CRUD org_units + arborescence | `convex/org_units.ts` | Haute |
| API CRUD business_roles + presets | `convex/business_roles.ts` | Haute |
| API CRUD filing_structures + templates | `convex/filing_structures.ts` | Haute |
| API CRUD filing_cells + arborescence | `convex/filing_cells.ts` | Haute |
| API cell_access (règles + overrides + résolution) | `convex/cell_access.ts` | Critique |
| API org_lifecycle (statuts + checklist) | `convex/org_lifecycle.ts` | Haute |
| Types TypeScript | `src/types/filing.ts`, `src/types/org-structure.ts` | Haute |

### Phase 2 — Presets & Configuration (Semaine 3)

| Tâche | Fichier(s) | Priorité |
|-------|-----------|----------|
| Presets rôles métier par type d'org | `src/config/business-role-presets.ts` | Haute |
| Presets structures de classement par type d'org | `src/config/filing-presets.ts` | Haute |
| Enrichir org-presets avec nouveaux presets | `src/config/org-presets.ts` | Moyenne |
| Nouvelles permissions RBAC | `src/config/rbac.ts` | Haute |
| Hooks React (useFilingAccess, useOrgStructure, useOrgLifecycle) | `src/hooks/` | Haute |

### Phase 3 — Wizard Inscription (Semaine 4)

| Tâche | Fichier(s) | Priorité |
|-------|-----------|----------|
| Refonte wizard 3 étapes (Profil → Modules → Déploiement) | `organizations/new/page.tsx` | Critique |
| Composant StepProfile | `StepProfile.tsx` | Haute |
| Composant StepModules | `StepModules.tsx` | Haute |
| Composant StepDeploy | `StepDeploy.tsx` | Haute |
| Redirection vers fiche post-création | Navigation | Haute |

### Phase 4 — Fiche Organisation (Semaines 5-7)

| Tâche | Fichier(s) | Priorité |
|-------|-----------|----------|
| Bandeau de progression + checklist | `ProgressBanner.tsx` | Critique |
| Onglet Profil (lecture/édition) | `ProfileTab.tsx` | Haute |
| Onglet Structure Org (organigramme + rôles + personnel) | `StructureTab.tsx` + composants | Critique |
| Onglet Classement (arborescence + matrice + habilitations) | `FilingTab.tsx` + composants | Critique |
| Onglet Config Modules (iDocument + iArchive + iSignature) | `ConfigTab.tsx` | Haute |
| Onglet Automatisation (workflows + règles) | `AutomationTab.tsx` | Moyenne |
| Onglet Déploiement (hébergement + thème) | `DeployTab.tsx` | Haute |

### Phase 5 — Intégration & Clients (Semaine 8)

| Tâche | Fichier(s) | Priorité |
|-------|-----------|----------|
| Filtrer dossiers iDocument par accès résolu | `DocumentListPage.tsx` | Critique |
| Vérifier accès avant CRUD document | `convex/documents.ts` | Critique |
| Enrichir wizard Nouveau Client (filtre Prête + activation) | `clients/new/page.tsx` | Haute |
| Badge statut dans la grille Organisations | `organizations/page.tsx` | Moyenne |
| Affichage progression dans la liste des organisations | Idem | Moyenne |

### Phase 6 — Migration & Tests (Semaines 9-10)

| Tâche | Priorité |
|-------|----------|
| Migration SEEG_SITES → org_sites | Haute |
| Migration SEEG_ORG_UNITS → org_units | Haute |
| Migration SEEG_PERSONNEL → organization_members enrichi | Haute |
| Migration SEEG_DOSSIERS → filing_cells + cell_access_rules | Haute |
| Migration configs modules → champs structurés | Moyenne |
| Tests unitaires algorithme résolution d'accès | Critique |
| Tests intégration parcours complet (inscription → config → activation → connexion) | Critique |
| Tests non-régression organisations existantes | Haute |
| Tests UX parcours admin sur les 4 types d'organisation | Haute |
