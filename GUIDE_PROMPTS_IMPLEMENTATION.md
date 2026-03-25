# Guide de Prompts d'Implémentation — Digitalium.io
## Objectif : 100% du Tableau Récapitulatif

**Date** : 24 mars 2026
**Ordre** : Phase 1 (Haute priorité) → Phase 2 (Moyenne) → Phase 3 (Complémentaire)

> Chaque prompt est autonome. Copie-le tel quel dans Claude Code ou ton assistant IA de développement. Les prompts sont ordonnés par dépendance : exécute-les dans l'ordre indiqué.

---

# ═══════════════════════════════════════════
# PHASE 1 — PRIORITÉ HAUTE (Exigences 1, 6, 3)
# ═══════════════════════════════════════════

---

## EXIGENCE 6 — Types de documents obligatoires (5% → 100%)

> **Doit être fait EN PREMIER** car les exigences 1 et 3 en dépendent.

### Prompt 6.1 — Créer la table `document_types` dans le schéma Convex

```
Dans le fichier convex/schema.ts de digitalium.io, ajoute une nouvelle table "document_types"
APRÈS la table "documents" existante. Voici la définition exacte à insérer :

document_types: defineTable({
  organizationId: v.id("organizations"),
  nom: v.string(),
  code: v.string(),
  description: v.optional(v.string()),
  icone: v.optional(v.string()),
  couleur: v.optional(v.string()),
  retentionCategorySlug: v.optional(v.string()),
  isDefault: v.optional(v.boolean()),
  estActif: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_org_code", ["organizationId", "code"])
  .index("by_org_actif", ["organizationId", "estActif"]),

Ensuite, ajoute le champ suivant dans la table "documents" existante (après le champ "tags") :
  documentTypeId: v.optional(v.id("document_types")),

Et dans la table "folders" existante (après le champ "tags") :
  folderTypeId: v.optional(v.id("document_types")),

NE MODIFIE RIEN D'AUTRE dans le schéma. Garde tous les champs existants intacts.
```

### Prompt 6.2 — Créer le fichier CRUD `convex/documentTypes.ts`

```
Crée un nouveau fichier convex/documentTypes.ts dans digitalium.io avec les mutations et queries suivantes.
Utilise le même pattern que convex/filingStructures.ts (import mutation/query de "./_generated/server", v de "convex/values").

QUERIES :
1. list — args: { organizationId: v.id("organizations") }
   → Retourne tous les document_types de l'org, triés par nom
   → Filtre: estActif === true

2. listAll — args: { organizationId: v.id("organizations") }
   → Retourne TOUS les document_types (actifs et inactifs)

3. getById — args: { id: v.id("document_types") }
   → Retourne le type par ID

MUTATIONS :
4. create — args: { organizationId, nom, code, description?, icone?, couleur?, retentionCategorySlug?, isDefault? }
   → Vérifie l'unicité du code dans l'org : query document_types by_org_code, si existe → throw Error("Ce code de type existe déjà dans cette organisation")
   → Insert avec estActif: true, createdAt: Date.now(), updatedAt: Date.now()

5. update — args: { id: v.id("document_types"), nom?, code?, description?, icone?, couleur?, retentionCategorySlug?, estActif? }
   → Si code modifié : vérifier unicité (exclure le document courant)
   → Patch seulement les champs définis + updatedAt: Date.now()

6. remove — args: { id: v.id("document_types") }
   → Soft delete : patch estActif: false, updatedAt: Date.now()

7. seedDefaults — args: { organizationId: v.id("organizations") }
   → Vérifie qu'aucun type n'existe pour cette org
   → Insert 8 types par défaut :
     { code: "CORR", nom: "Correspondance", icone: "Mail", couleur: "#3B82F6" }
     { code: "RAPP", nom: "Rapport", icone: "FileText", couleur: "#8B5CF6" }
     { code: "PV", nom: "Procès-verbal", icone: "ScrollText", couleur: "#EAB308" }
     { code: "NOTE", nom: "Note de service", icone: "StickyNote", couleur: "#F97316" }
     { code: "CONT", nom: "Contrat", icone: "FileSignature", couleur: "#10B981" }
     { code: "FACT", nom: "Facture", icone: "Receipt", couleur: "#EC4899" }
     { code: "DECIS", nom: "Décision", icone: "Gavel", couleur: "#6366F1" }
     { code: "AUTRE", nom: "Autre", icone: "File", couleur: "#6B7280", isDefault: true }
   → Tous avec estActif: true, createdAt/updatedAt: Date.now()
```

### Prompt 6.3 — Interface admin pour gérer les types de documents

```
Dans le fichier src/components/admin/org-detail/tabs/ModulesConfigTab.tsx de digitalium.io,
ajoute une nouvelle section "Types de documents" dans la configuration du module iDocument.

La section doit apparaître DANS la partie iDocument existante (cherche "iDocument" ou le panel correspondant).

Fonctionnalités requises :

1. AFFICHAGE : Liste des types existants avec pour chaque type :
   - Icône lucide-react (dynamique depuis le champ icone)
   - Nom en gras
   - Code en monospace gris
   - Badge couleur (petit cercle de la couleur du type)
   - Badge "Par défaut" si isDefault === true
   - Boutons : Modifier (Edit3), Désactiver (Power), Supprimer (Trash2)

2. FORMULAIRE d'ajout/édition (Dialog de type @radix-ui/react-dialog) :
   - Champs : nom (obligatoire), code (obligatoire, max 9 caractères, regex: /^[A-Z0-9\-\.]{1,9}$/),
     description, icone (Select parmi : Mail, FileText, ScrollText, StickyNote, FileSignature, Receipt, Gavel, File, Briefcase, Scale, Landmark, Shield),
     couleur (input color), retentionCategorySlug (Select des archive_categories de l'org), isDefault (Switch)
   - Validation : code unique, nom non vide

3. BOUTON "Initialiser les types par défaut" :
   - Visible uniquement si aucun type n'existe
   - Appelle la mutation documentTypes.seedDefaults
   - Toast de succès

4. Utilise les queries/mutations de convex/documentTypes.ts.
   Import : import { useQuery, useMutation } from "convex/react"; import { api } from "../../../../convex/_generated/api";

Style : même design que le reste du panel (bg-white/[0.02], border-white/5, text-xs, violet accents).
```

### Prompt 6.4 — Ajouter le sélecteur de type dans le dialogue de création de document

```
Dans src/components/modules/idocument/DocumentListPage.tsx de digitalium.io,
MODIFIE le dialogue "Nouveau Document" (showNewDocDialog, lignes ~1769-1807).

Changements à faire :

1. Ajoute un état :
   const [newDocTypeId, setNewDocTypeId] = useState<string>("");

2. Ajoute une query pour charger les types :
   const documentTypes = useQuery(api.documentTypes.list,
     organizationId ? { organizationId } : "skip"
   );

3. Dans le DialogContent du nouveau document, APRÈS le champ titre et AVANT le DialogFooter,
   ajoute un sélecteur de type de document :

   <div className="space-y-2">
     <Label htmlFor="doc-type" className="text-xs">Type de document *</Label>
     <Select value={newDocTypeId} onValueChange={setNewDocTypeId}>
       <SelectTrigger className="bg-white/5 border-white/10">
         <SelectValue placeholder="Sélectionnez un type..." />
       </SelectTrigger>
       <SelectContent className="bg-zinc-900 border-white/10">
         {documentTypes?.map((dt) => (
           <SelectItem key={dt._id} value={dt._id} className="text-xs">
             {dt.nom} ({dt.code})
           </SelectItem>
         ))}
       </SelectContent>
     </Select>
   </div>

4. Modifie le bouton "Créer" pour être disabled si pas de type sélectionné :
   disabled={!newDocTitle.trim() || !newDocTypeId}

5. Dans handleCreateDocument, ajoute documentTypeId: newDocTypeId au document créé.

6. Réinitialise newDocTypeId dans le cleanup : setNewDocTypeId("");

7. Importe Select, SelectContent, SelectItem, SelectTrigger, SelectValue depuis "@/components/ui/select".
```

### Prompt 6.5 — Ajouter le sélecteur de type dans le flux d'import

```
Dans src/components/modules/idocument/DocumentListPage.tsx de digitalium.io,
MODIFIE le flux d'import wizard existant.

Dans l'interface ImportFileItem (ligne ~65), ajoute :
  documentTypeId?: string;

Dans l'étape "review" du wizard d'import (quand importStep === "review"),
pour chaque fichier dans la liste de review, ajoute un Select de type de document
avec les mêmes options que le dialogue de création.

Dans la fonction qui appelle createFromImport (cherche "createFromImport" dans le fichier),
passe le documentTypeId de chaque ImportFileItem.

Dans convex/documents.ts, mutation createFromImport :
- Ajoute l'arg : documentTypeId: v.optional(v.id("document_types"))
- Passe-le dans le ctx.db.insert("documents", { ... documentTypeId: args.documentTypeId })

Validation : dans le handler de createFromImport, si documentTypeId est fourni,
vérifie qu'il existe : const docType = await ctx.db.get(args.documentTypeId);
if (!docType) throw new Error("Type de document invalide");
```

---

## EXIGENCE 1 — Classement obligatoire des dossiers (35% → 100%)

### Prompt 1.1 — Ajouter le sélecteur d'arborescence au dialogue de création de dossier

```
Dans src/components/modules/idocument/DocumentListPage.tsx de digitalium.io,
MODIFIE le dialogue "Nouveau Dossier" (showNewFolderDialog, lignes ~1812-1850).

Changements à faire :

1. Ajoute ces états :
   const [selectedFilingCellId, setSelectedFilingCellId] = useState<string>("");
   const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

2. Ajoute ces queries :
   const activeStructure = useQuery(api.filingStructures.getActive,
     organizationId ? { organizationId } : "skip"
   );
   const filingCellsTree = useQuery(api.filingCells.getTree,
     activeStructure?._id ? { filingStructureId: activeStructure._id } : "skip"
   );

3. Remplace le contenu du DialogContent du nouveau dossier par :

   a) Le champ nom existant (garder tel quel)

   b) SI une structure active existe (activeStructure !== null && filingCellsTree),
      affiche un composant arborescent de sélection :

      <div className="space-y-2">
        <Label className="text-xs">Emplacement dans le plan de classement *</Label>
        <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
          {/* Composant récursif FilingCellTreeSelect */}
          {filingCellsTree.map(node => (
            <FilingCellTreeNode
              key={node._id}
              node={node}
              depth={0}
              selected={selectedFilingCellId}
              onSelect={setSelectedFilingCellId}
              expanded={expandedCells}
              onToggle={(id) => setExpandedCells(prev => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              })}
            />
          ))}
        </div>
        {!selectedFilingCellId && (
          <p className="text-[10px] text-amber-400/70">
            Le classement dans l'arborescence est obligatoire
          </p>
        )}
      </div>

   c) SI aucune structure active : affiche un message invitant l'admin à créer un plan de classement.

4. Crée le composant FilingCellTreeNode en tant que sous-composant dans le même fichier :
   - Reçoit { node, depth, selected, onSelect, expanded, onToggle }
   - Affiche : chevron (si enfants), icône dossier, code en monospace, intitule
   - Indentation : paddingLeft = depth * 16 + "px"
   - Fond highlight si selected === node._id
   - onClick → onSelect(node._id)
   - Récursion sur node.children

5. Modifie le bouton "Créer" du dossier :
   disabled={!newFolderName.trim() || (!!activeStructure && !selectedFilingCellId)}

6. Dans handleCreateFolder :
   - Si selectedFilingCellId est défini : utilise createCellMut (création filing_cell + sync dossier)
     avec parentId = selectedFilingCellId
   - Le dossier sera automatiquement rattaché via le mécanisme existant de sync filingCells → folders

7. Réinitialise selectedFilingCellId dans le cleanup.
```

### Prompt 1.2 — Validation serveur : empêcher les dossiers "volants"

```
Dans convex/folders.ts de digitalium.io, modifie la mutation "create" pour ajouter
une validation de classement obligatoire.

Voici les changements EXACTS à faire dans le handler de create :

APRÈS la ligne "const now = Date.now();" et AVANT le "return await ctx.db.insert", ajoute :

// ── Validation : classement obligatoire ──
// Un dossier DOIT avoir soit un filingCellId, soit un parentFolderId rattaché à une cellule
if (args.parentFolderId) {
  // OK si parent existe (héritage de classement)
  const parent = await ctx.db.get(args.parentFolderId);
  if (!parent) throw new Error("Dossier parent introuvable");
} else {
  // Dossier racine : vérifier qu'une structure de classement est active
  // Si oui, interdire la création sans rattachement
  const activeStructure = await ctx.db
    .query("filing_structures")
    .withIndex("by_org_actif", (q) =>
      q.eq("organizationId", args.organizationId).eq("estActif", true)
    )
    .first();

  if (activeStructure) {
    throw new Error(
      "Un plan de classement est actif. Vous devez créer le dossier via le plan de classement ou comme sous-dossier d'un dossier existant."
    );
  }
}

NE MODIFIE PAS les arguments de la mutation ni le reste du handler.
```

---

## EXIGENCE 3 — Métadonnées obligatoires documents (20% → 100%)

### Prompt 3.1 — Enrichir le dialogue de création de document avec dossier obligatoire

```
Dans src/components/modules/idocument/DocumentListPage.tsx de digitalium.io,
MODIFIE le dialogue "Nouveau Document" (showNewDocDialog).

Note : le sélecteur de type a déjà été ajouté au Prompt 6.4. Maintenant on ajoute le dossier obligatoire.

1. Ajoute un état :
   const [newDocFolderId, setNewDocFolderId] = useState<string>(currentFolderId || "");

2. Dans le DialogContent, APRÈS le sélecteur de type et AVANT le DialogFooter, ajoute :

   <div className="space-y-2">
     <Label htmlFor="doc-folder" className="text-xs">Dossier de destination *</Label>
     <Select value={newDocFolderId} onValueChange={setNewDocFolderId}>
       <SelectTrigger className="bg-white/5 border-white/10">
         <SelectValue placeholder="Sélectionnez un dossier..." />
       </SelectTrigger>
       <SelectContent className="bg-zinc-900 border-white/10 max-h-60">
         {folders
           .filter(f => f.id !== "__poubelle" && f.status !== "trashed")
           .map((f) => (
             <SelectItem key={f.id} value={f.id} className="text-xs">
               {f.name}
             </SelectItem>
           ))}
       </SelectContent>
     </Select>
     {!newDocFolderId && (
       <p className="text-[10px] text-amber-400/70">
         Le classement dans un dossier est obligatoire
       </p>
     )}
   </div>

3. Modifie le bouton "Créer" :
   disabled={!newDocTitle.trim() || !newDocTypeId || !newDocFolderId}

4. Dans handleCreateDocument, ajoute folderId: newDocFolderId au document créé.

5. Réinitialise newDocFolderId à currentFolderId dans le cleanup.

6. Si currentFolderId est défini au moment de l'ouverture du dialogue,
   pré-sélectionne ce dossier : dans le useEffect ou au setShowNewDocDialog(true),
   fais setNewDocFolderId(currentFolderId || "").
```

### Prompt 3.2 — Validation serveur : document sans dossier interdit

```
Dans convex/documents.ts de digitalium.io, modifie les mutations "create" et "createFromImport".

MUTATION create :
1. Ajoute à args :
   folderId: v.optional(v.id("folders")),
   documentTypeId: v.optional(v.id("document_types")),

2. Dans le handler, AVANT le insert, ajoute :
   // Validation : dossier obligatoire si organisation avec structure active
   if (args.organizationId) {
     const activeStructure = await ctx.db
       .query("filing_structures")
       .withIndex("by_org_actif", (q) =>
         q.eq("organizationId", args.organizationId!).eq("estActif", true)
       )
       .first();

     if (activeStructure && !args.folderId) {
       throw new Error("Un dossier de destination est obligatoire pour créer un document.");
     }
   }

3. Ajoute dans l'objet du insert :
   folderId: args.folderId,
   documentTypeId: args.documentTypeId,

4. Après le insert, si folderId est défini, incrémente le fileCount du dossier :
   if (args.folderId) {
     const folder = await ctx.db.get(args.folderId);
     if (folder) {
       await ctx.db.patch(args.folderId, {
         fileCount: (folder.fileCount ?? 0) + 1,
         updatedAt: now,
       });
     }
   }

MUTATION createFromImport :
- La validation existe déjà partiellement (folderId optionnel + fileCount update)
- Ajoute la même validation de structure active que ci-dessus
- Ajoute documentTypeId dans les args et le insert (déjà fait au Prompt 6.5, vérifier la cohérence)
```

### Prompt 3.3 — Système de métadonnées configurables par l'admin

```
Dans digitalium.io, implémente un système de métadonnées personnalisables pour les documents.

ÉTAPE 1 — Schéma (convex/schema.ts) :
Ajoute une nouvelle table :

document_metadata_fields: defineTable({
  organizationId: v.id("organizations"),
  fieldName: v.string(),
  fieldLabel: v.string(),
  fieldType: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("date"),
    v.literal("select"),
    v.literal("boolean")
  ),
  options: v.optional(v.array(v.string())),
  isRequired: v.boolean(),
  defaultValue: v.optional(v.string()),
  ordre: v.number(),
  estActif: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_org_actif", ["organizationId", "estActif"]),

Dans la table "documents" existante, ajoute :
  customMetadata: v.optional(v.any()),

ÉTAPE 2 — CRUD (convex/documentMetadataFields.ts) :
Crée un nouveau fichier avec :
- Query list(organizationId) → retourne les champs actifs triés par ordre
- Mutation create(organizationId, fieldName, fieldLabel, fieldType, options?, isRequired, defaultValue?, ordre)
  → Vérifie unicité de fieldName dans l'org
- Mutation update(id, fieldLabel?, fieldType?, options?, isRequired?, defaultValue?, estActif?)
- Mutation remove(id) → soft delete

ÉTAPE 3 — Interface admin :
Dans ModulesConfigTab.tsx, ajoute une section "Métadonnées personnalisées"
dans la config iDocument, APRÈS la section "Types de documents" :
- Liste des champs avec nom, type, obligatoire/optionnel, boutons edit/delete
- Formulaire d'ajout : label, nom (auto-généré en snake_case), type (select parmi text/number/date/select/boolean),
  options (visible si type=select), obligatoire (Switch), valeur par défaut
- Drag & drop pour réordonner (optionnel, sinon input numérique pour ordre)

ÉTAPE 4 — Dans le dialogue de création de document (DocumentListPage.tsx) :
Après le sélecteur de dossier, ajoute un rendu dynamique des champs de métadonnées :
- Query les champs actifs de l'org
- Pour chaque champ : rendre le composant approprié (Input, DatePicker, Select, Switch, NumberInput)
- Les champs isRequired doivent être marqués avec *
- Stocker les valeurs dans un state local : const [customMeta, setCustomMeta] = useState<Record<string, any>>({})
- Validation : tous les champs required doivent avoir une valeur avant de pouvoir créer
- Passer customMetadata: customMeta au create

Style cohérent avec le reste du dialogue.
```

---

# ═══════════════════════════════════════════
# PHASE 2 — PRIORITÉ MOYENNE (Exigences 2, 5)
# ═══════════════════════════════════════════

---

## EXIGENCE 2 — Arborescence par défaut + Actions rapides (60% → 100%)

### Prompt 2.1 — Changer la vue par défaut en mode arborescence (Column)

```
Dans src/components/modules/idocument/DocumentListPage.tsx de digitalium.io,
modifie la fonction getInitialViewMode() ou l'initialisation du state viewMode.

Actuellement le viewMode par défaut est probablement "grid".
Change-le pour que "column" soit la vue par défaut.

Cherche le code qui initialise viewMode et modifie-le :

const [viewMode, setViewMode] = useState<ViewMode>(() => {
  // Respecter la préférence sauvegardée si elle existe
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("idocument-view-mode");
    if (saved && ["grid", "list", "column"].includes(saved)) {
      return saved as ViewMode;
    }
  }
  return "column"; // ← CHANGEMENT : était "grid", maintenant "column"
});

Si getInitialViewMode() est une fonction importée depuis file-manager,
modifie son default dans le fichier source correspondant.

Assure-toi que le localStorage continue de persister la préférence utilisateur.
```

### Prompt 2.2 — Ajouter les actions rapides au menu contextuel des dossiers

```
Dans src/components/modules/idocument/FolderDocumentContextMenu.tsx de digitalium.io,
ajoute 3 nouvelles actions pour les dossiers (itemType === "folder").

Le menu contextuel actuel contient : Renommer, Politique d'archivage, Catégorie de rétention, Supprimer.

Ajoute les items suivants APRÈS "Renommer" et AVANT "Politique d'archivage" :

1. ACTION "Partager" :
   <DropdownMenuItem onClick={() => setShowShareDialog(true)} className="text-xs gap-2">
     <Share2 className="h-3.5 w-3.5 text-blue-400" />
     Partager
   </DropdownMenuItem>

2. ACTION "Gérer les accès" (seulement si le dossier a un filingCellId) :
   {filingCellId && (
     <DropdownMenuItem onClick={() => setShowAccessDialog(true)} className="text-xs gap-2">
       <Shield className="h-3.5 w-3.5 text-amber-400" />
       Gérer les accès
     </DropdownMenuItem>
   )}

3. ACTION "Créer un sous-dossier" :
   <DropdownMenuItem onClick={() => onCreateSubfolder?.(itemId)} className="text-xs gap-2">
     <FolderPlus className="h-3.5 w-3.5 text-emerald-400" />
     Créer un sous-dossier
   </DropdownMenuItem>

Puis implémente les dialogues correspondants :

DIALOGUE "Partager" (showShareDialog) :
- Champ de recherche d'utilisateurs (filtrer parmi les membres de l'org)
- Liste des utilisateurs avec qui c'est déjà partagé (depuis folder.permissions.sharedWith)
- Select de visibilité : private, shared, team
- Bouton sauvegarder → mutation folders.update avec les nouvelles permissions

DIALOGUE "Gérer les accès" (showAccessDialog) :
- Affiche les cell_access_rules existantes pour ce filingCellId
- Permet d'ajouter/modifier des règles (rôle métier → niveau d'accès)
- Utilise les mutations de convex/cellAccessRules.ts : setRule, removeRule

Props à ajouter au composant :
- filingCellId?: string (depuis le dossier)
- onCreateSubfolder?: (folderId: string) => void

Imports nécessaires : Share2, Shield, FolderPlus depuis "lucide-react"
```

---

## EXIGENCE 5 — Codes structure org (65% → 100%)

### Prompt 5.1 — Validation des codes : format, longueur et unicité

```
Dans convex/filingCells.ts de digitalium.io, modifie les mutations "create" et "update"
pour ajouter une validation stricte des codes.

DANS LA MUTATION create, APRÈS "const now = Date.now();" et AVANT le calcul du niveau, ajoute :

// ── Validation du code ──
const codeRegex = /^[A-Za-z0-9.\-]{1,9}$/;
if (!codeRegex.test(args.code)) {
  throw new Error(
    "Le code doit contenir entre 1 et 9 caractères alphanumériques, points ou tirets uniquement."
  );
}

// ── Unicité globale du code dans la structure ──
const existingWithCode = await ctx.db
  .query("filing_cells")
  .withIndex("by_filingStructureId", (q) =>
    q.eq("filingStructureId", args.filingStructureId)
  )
  .filter((q) => q.eq(q.field("code"), args.code))
  .first();

if (existingWithCode) {
  throw new Error(
    `Le code "${args.code}" est déjà utilisé dans cette structure de classement (par "${existingWithCode.intitule}"). Chaque code doit être unique à travers tous les niveaux.`
  );
}

DANS LA MUTATION update :
Si le champ "code" est modifié, ajoute la même validation :
- Vérification regex
- Vérification d'unicité (en excluant la cellule courante par son _id)

DANS LA MUTATION bulkCreate :
Pour chaque cellule dans la boucle, ajoute avant l'insert :
- Validation regex du code
- Vérification d'unicité (contre les cellules déjà insérées dans cette batch + celles en base)
  → Maintenir un Set<string> local des codes déjà créés dans le batch
```

### Prompt 5.2 — Validation des codes dans l'UI (ClassementTab)

```
Dans src/components/admin/org-detail/tabs/ClassementTab.tsx de digitalium.io,
modifie le composant AddCellInlineForm pour ajouter une validation visuelle du code.

Changements dans AddCellInlineForm :

1. Ajoute un état d'erreur :
   const [codeError, setCodeError] = useState("");

2. Modifie le champ Input du code :
   <div className="relative">
     <Input
       value={code}
       onChange={(e) => {
         const val = e.target.value.toUpperCase();
         setCode(val);
         // Validation temps réel
         if (val && !/^[A-Za-z0-9.\-]{0,9}$/.test(val)) {
           setCodeError("Max 9 car. : lettres, chiffres, points, tirets");
         } else {
           setCodeError("");
         }
       }}
       placeholder="Code (ex: FISC-TVA)"
       maxLength={9}
       className={`h-8 text-xs bg-white/[0.03] border-white/10 w-36 font-mono uppercase
         ${codeError ? "border-red-500/50" : ""}`}
     />
     <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-white/30">
       {code.length}/9
     </span>
   </div>
   {codeError && (
     <p className="text-[9px] text-red-400 mt-0.5">{codeError}</p>
   )}

3. Désactive le bouton de soumission si codeError ou code vide :
   disabled={!code.trim() || !intitule.trim() || !!codeError || submitting}

4. En cas d'erreur serveur (code dupliqué), catch l'erreur et affiche un toast :
   try {
     await createCell({ ... });
   } catch (err: any) {
     if (err.message?.includes("déjà utilisé")) {
       setCodeError(err.message);
     }
     toast.error(err.message || "Erreur lors de la création");
     return;
   }
```

### Prompt 5.3 — Clarifier l'action "Désactiver" vs "Supprimer" pour les unités org

```
Dans src/components/admin/org-detail/tabs/StructureOrgTab.tsx de digitalium.io,
dans le composant TreeNode (OrgUnitNode), modifie les boutons d'action.

Actuellement il y a un bouton "Supprimer" (Trash2). Ajoute un bouton "Désactiver" distinct.

Remplace la zone des boutons d'action du nœud par :

{/* Bouton Désactiver/Réactiver */}
<button
  onClick={(e) => {
    e.stopPropagation();
    handleToggleActive(node._id, node.estActif);
  }}
  className={`p-1 rounded transition-colors ${
    node.estActif
      ? "text-amber-400/50 hover:text-amber-400 hover:bg-amber-500/10"
      : "text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-500/10"
  }`}
  title={node.estActif ? "Désactiver cette unité" : "Réactiver cette unité"}
>
  {node.estActif ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
</button>

{/* Bouton Supprimer (seulement si désactivé et sans enfants actifs) */}
{!node.estActif && (!node.children || node.children.length === 0) && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(node._id);
    }}
    className="p-1 rounded text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
    title="Supprimer définitivement"
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
)}

Crée la fonction handleToggleActive :
const handleToggleActive = async (unitId: string, currentlyActive: boolean) => {
  try {
    await updateUnit({
      id: unitId as Id<"org_units">,
      estActif: !currentlyActive
    });
    toast.success(currentlyActive ? "Unité désactivée" : "Unité réactivée");
  } catch (err: any) {
    toast.error(err.message || "Erreur");
  }
};

Affichage visuel des unités désactivées :
- Ajouter une opacité réduite : className={`... ${!node.estActif ? "opacity-40" : ""}`}
- Badge "Inactif" à côté du nom : {!node.estActif && <span className="text-[9px] text-red-400/70 ml-1">(inactif)</span>}

Imports : PowerOff, Power depuis "lucide-react"
```

---

# ═══════════════════════════════════════════
# PHASE 3 — COMPLÉMENTAIRE (Exigences 4, 7, 8)
# ═══════════════════════════════════════════

---

## EXIGENCE 4 — Propagation batch des changements config (10% → 100%)

### Prompt 4.1 — Mutations batch de propagation dans Convex

```
Dans digitalium.io, crée un nouveau fichier convex/configPropagation.ts
qui contient les mutations de propagation des changements de configuration.

Imports :
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

QUERY 1 — countImpactedItems :
args: {
  organizationId: v.id("organizations"),
  changeType: v.union(
    v.literal("retention_category"),
    v.literal("filing_cell_access"),
    v.literal("folder_config")
  ),
  targetId: v.string(),
}
handler:
- Si changeType === "retention_category" :
  → Compter les archives avec ce categorySlug + les folder_archive_metadata avec ce categoryId
  → Retourner { archives: number, folders: number, total: number }

- Si changeType === "filing_cell_access" :
  → Compter les cell_access_rules pour cette cellule
  → Compter les folders liés à cette cellule
  → Retourner { rules: number, folders: number, total: number }

- Si changeType === "folder_config" :
  → Compter les documents dans ce dossier (by_folderId) + sous-dossiers récursifs
  → Retourner { documents: number, subfolders: number, total: number }


MUTATION 2 — propagateRetentionChange :
args: {
  organizationId: v.id("organizations"),
  categoryId: v.id("archive_categories"),
  userId: v.string(),
}
handler:
1. Charger la catégorie mise à jour
2. Récupérer TOUTES les archives de cette catégorie dans l'org :
   query archives by_org_category(organizationId, categorySlug)
3. Pour chaque archive (en excluant status "destroyed") :
   - Recalculer retentionExpiresAt = countingStartDate + retentionYears * msPerYear
   - Recalculer activeUntil et semiActiveUntil
   - Patcher l'archive avec les nouvelles dates
4. Récupérer les folder_archive_metadata de cette catégorie :
   - Mettre à jour les dates si nécessaire
5. Log audit : "config.retention_propagated" avec détails du nombre d'éléments mis à jour
6. Retourner { updatedArchives: number, updatedFolders: number }


MUTATION 3 — propagateAccessChange :
args: {
  organizationId: v.id("organizations"),
  filingCellId: v.id("filing_cells"),
  userId: v.string(),
}
handler:
1. Charger la cellule + son accessDefaut mis à jour
2. Trouver le dossier lié (by_filingCellId)
3. Mettre à jour les permissions du dossier :
   - Si accessDefaut === "public" → visibility: "team"
   - Si "restreint" ou "confidentiel" → visibility: "private"
4. Trouver les dossiers enfants (récursivement via parentFolderId)
5. Si inheritToChildren est actif, propager la même visibilité
6. Log audit "config.access_propagated"
7. Retourner { updatedFolders: number }
```

### Prompt 4.2 — Dialogue de confirmation d'impact dans l'UI

```
Dans digitalium.io, crée un nouveau composant réutilisable :
src/components/admin/ConfigChangeConfirmDialog.tsx

Ce composant est un dialogue de confirmation qui s'affiche AVANT d'appliquer
un changement de configuration. Il montre l'impact du changement.

Props :
interface ConfigChangeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeType: "retention_category" | "filing_cell_access" | "folder_config";
  changeDescription: string;
  impactData: {
    archives?: number;
    folders?: number;
    documents?: number;
    rules?: number;
    total: number;
  } | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

Rendu :
- DialogHeader : icône AlertTriangle (amber), titre "Confirmer le changement"
- Corps :
  - Description du changement (props.changeDescription)
  - Tableau d'impact :
    - Si archives > 0 : "{archives} archives seront recalculées"
    - Si folders > 0 : "{folders} dossiers seront mis à jour"
    - Si documents > 0 : "{documents} documents seront affectés"
    - Si rules > 0 : "{rules} règles d'accès seront modifiées"
  - Avertissement : "Cette action ne peut pas être annulée. Les nouvelles valeurs
    seront appliquées immédiatement à tous les éléments concernés."
- Footer : Bouton "Annuler" (outline) + Bouton "Appliquer à {total} éléments" (destructive gradient rouge→orange)

Style : même design que les autres dialogues du projet (bg-zinc-900, border-white/10, etc.)


INTÉGRATION — Dans src/components/admin/org-detail/tabs/ :

Dans IArchiveConfigPanel.tsx (ou le panel de catégories d'archivage) :
- Quand l'admin modifie une catégorie et clique "Sauvegarder" :
  1. Appeler countImpactedItems avec changeType="retention_category"
  2. Afficher ConfigChangeConfirmDialog avec les résultats
  3. Sur confirmation : sauvegarder la catégorie PUIS appeler propagateRetentionChange
  4. Toast de succès : "Changement propagé à X archives et Y dossiers"

Dans ClassementTab.tsx :
- Quand l'admin modifie l'accessDefaut d'une cellule :
  1. Appeler countImpactedItems avec changeType="filing_cell_access"
  2. Afficher le dialogue de confirmation
  3. Sur confirmation : update PUIS propagateAccessChange
```

---

## EXIGENCE 7 — Groupes de permissions (45% → 100%)

### Prompt 7.1 — Créer la table et le CRUD des groupes de permissions

```
Dans digitalium.io, implémente le concept de groupes de permissions.

ÉTAPE 1 — Schéma (convex/schema.ts) :
Ajoute une nouvelle table :

permission_groups: defineTable({
  organizationId: v.id("organizations"),
  nom: v.string(),
  description: v.optional(v.string()),
  couleur: v.optional(v.string()),
  members: v.array(v.string()),
  estActif: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_org_actif", ["organizationId", "estActif"]),

Dans la table "cell_access_rules", ajoute le champ optionnel :
  groupId: v.optional(v.id("permission_groups")),

Dans la table "folders", dans l'objet permissions, le champ teamIds existe déjà
(v.array(v.string())). Il sera utilisé pour stocker les IDs des groupes.


ÉTAPE 2 — CRUD (convex/permissionGroups.ts) :
Crée un nouveau fichier avec :

Queries :
- list(organizationId) → groupes actifs, triés par nom
- listAll(organizationId) → tous les groupes
- getById(id) → un groupe

Mutations :
- create({ organizationId, nom, description?, couleur?, members: string[] })
  → Vérifie unicité du nom dans l'org
  → Insert avec estActif: true

- update({ id, nom?, description?, couleur?, members?, estActif? })
  → Patch les champs définis

- addMember({ id, userId })
  → Ajoute userId au tableau members si pas déjà présent

- removeMember({ id, userId })
  → Retire userId du tableau members

- remove({ id })
  → Soft delete (estActif: false)
  → Retirer ce groupId de toutes les cell_access_rules qui le référencent


ÉTAPE 3 — Extension de cellAccessRules.ts :
Dans convex/cellAccessRules.ts :

- Dans setRule : ajouter arg optionnel groupId: v.optional(v.id("permission_groups"))
  → Si groupId est fourni (sans orgUnitId ni businessRoleId), créer une règle basée sur le groupe

- Dans resolveUserAccess :
  → APRÈS la résolution par rôle/unité, ajouter une étape :
  → Charger les permission_groups de l'org dont le user est member
  → Pour chaque groupe, chercher les cell_access_rules avec ce groupId
  → Comparer avec l'accès déjà résolu, garder le plus élevé
  → Source = "group" dans le résultat

- computePriority : ajouter un cas pour groupId seul → priorité 4 (entre role=5 et unit=3)
```

### Prompt 7.2 — Interface admin pour gérer les groupes

```
Dans src/components/admin/org-detail/tabs/ClassementTab.tsx de digitalium.io,
ajoute un 4ème sous-onglet "Groupes" dans les TabsList.

Nouveau TabsTrigger :
<TabsTrigger value="groupes" className="gap-1.5 text-xs">
  <Users className="h-3.5 w-3.5" />
  Groupes
</TabsTrigger>

Nouveau TabsContent (composant GroupesPanel) :

AFFICHAGE :
- Liste des groupes existants sous forme de cartes
- Chaque carte montre :
  - Pastille de couleur + Nom du groupe en gras
  - Description (si présente)
  - Nombre de membres : "{n} membres"
  - Avatars des premiers membres (max 5, +X si plus)
  - Boutons : Modifier (Edit3), Gérer les membres (UserPlus), Désactiver (Power)

FORMULAIRE de création/édition (Dialog) :
- Nom du groupe (obligatoire)
- Description
- Couleur (palette de 8 couleurs prédéfinies)
- Membres :
  - Liste déroulante des membres de l'org (useQuery api.organizationMembers.list ou similaire)
  - Possibilité de sélectionner/désélectionner des membres
  - Affichage en chips des membres sélectionnés

BOUTON d'action principal :
- "Nouveau groupe" avec icône Plus

INTÉGRATION avec la matrice d'accès :
Dans MatriceAccesPanel (même fichier), ajouter une section ou un sélecteur
qui permet de choisir "Par rôle métier" ou "Par groupe" pour afficher la matrice.
- Si "Par groupe" : les colonnes de la matrice sont les groupes au lieu des rôles/unités
- Utiliser les mêmes cellules de cycle d'accès (aucun/lecture/ecriture/gestion/admin)
- Sauvegarder via setRule avec groupId

Queries utilisées :
- api.permissionGroups.list
- api.cellAccessRules.listByOrg (filtrer par groupId !== undefined)

Mutations utilisées :
- api.permissionGroups.create / update / addMember / removeMember
- api.cellAccessRules.setRule (avec groupId)
```

---

## EXIGENCE 8 — Conversion PDF à l'archivage (50% → 100%)

### Prompt 8.1 — Implémenter la conversion PDF côté client

```
Dans src/components/modules/idocument/ArchiveModal.tsx de digitalium.io,
le processus d'archivage actuel a 8 étapes. L'étape 3 "Génération du PDF figé"
existe mais utilise un fallback simple.

Remplace la logique de l'étape 3 par une implémentation complète :

DANS le handler d'archivage (cherche "handleArchive" ou la fonction async qui traite les étapes),
modifie l'étape de génération PDF :

// ── Étape 3 : Génération du PDF ──
setCurrentStep(2);

let pdfBlob: Blob;
let pdfUrl = "";
let pdfFileName = "";
let pdfFileSize = 0;

if (document.content) {
  // Document TipTap : convertir JSON → HTML → PDF
  const { generateHTML } = await import("@tiptap/html");
  const StarterKit = (await import("@tiptap/starter-kit")).default;

  const htmlContent = generateHTML(document.content, [StarterKit]);

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 16px; }
        h2 { font-size: 20px; margin-bottom: 12px; }
        h3 { font-size: 16px; margin-bottom: 8px; }
        p { margin-bottom: 8px; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .header { border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 24px; }
        .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 10px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${document.title}</h1>
        <p style="font-size: 12px; color: #666;">
          Archivé le ${new Date().toLocaleDateString("fr-FR")} — Document gelé pour archivage
        </p>
      </div>
      ${htmlContent}
      <div class="footer">
        <p>Ce document a été généré automatiquement par Digitalium.io lors de l'archivage.</p>
        <p>Hash du contenu JSON : ${contentHash}</p>
      </div>
    </body>
    </html>
  `;

  // Utiliser html2pdf.js (déjà dans les dépendances)
  const html2pdf = (await import("html2pdf.js")).default;

  const container = window.document.createElement("div");
  container.innerHTML = fullHtml;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  window.document.body.appendChild(container);

  pdfBlob = await html2pdf()
    .set({
      margin: [15, 15, 20, 15],
      filename: `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}_archive.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .outputPdf("blob");

  window.document.body.removeChild(container);

} else if (document.storageId && document.fileUrl) {
  // Document importé (fichier binaire) : télécharger et re-stocker comme PDF
  // Si déjà un PDF, utiliser directement
  if (document.mimeType === "application/pdf") {
    const response = await fetch(document.fileUrl);
    pdfBlob = await response.blob();
  } else {
    // Pour les formats non-PDF (docx, xlsx, images) :
    // Créer un PDF wrapper avec le nom du fichier et métadonnées
    const html2pdf = (await import("html2pdf.js")).default;
    const wrapperHtml = `
      <div style="font-family: Arial; padding: 40px;">
        <h1>${document.title}</h1>
        <p>Fichier original : ${document.fileName} (${(document.fileSize! / 1024).toFixed(1)} Ko)</p>
        <p>Type : ${document.mimeType}</p>
        <p>Archivé le : ${new Date().toLocaleDateString("fr-FR")}</p>
        <p>Hash SHA-256 du contenu : ${contentHash}</p>
        <hr/>
        <p><em>Le fichier original est conservé dans le stockage sécurisé.</em></p>
      </div>
    `;
    const container = window.document.createElement("div");
    container.innerHTML = wrapperHtml;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    window.document.body.appendChild(container);
    pdfBlob = await html2pdf().set({ margin: 15, jsPDF: { unit: "mm", format: "a4" } })
      .from(container).outputPdf("blob");
    window.document.body.removeChild(container);
  }
}

pdfFileName = `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}_archive.pdf`;
pdfFileSize = pdfBlob.size;

// Upload vers Supabase Storage (code existant) ou Convex Storage
// ... suite du processus existant
```

### Prompt 8.2 — Message informatif dans l'UI d'archivage

```
Dans src/components/modules/idocument/ArchiveModal.tsx de digitalium.io,
ajoute un bandeau informatif en haut du dialogue d'archivage.

APRÈS le DialogHeader et AVANT le contenu principal (sélection de catégorie), ajoute :

<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
  <FileText className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
  <div className="space-y-1">
    <p className="text-xs font-medium text-blue-300">Conversion automatique en PDF</p>
    <p className="text-[11px] text-blue-300/70 leading-relaxed">
      L'archivage convertit automatiquement ce document en PDF figé avec double hash SHA-256
      (contenu JSON + PDF). Le document original sera marqué comme archivé et un certificat
      d'archivage sera généré pour garantir l'intégrité.
    </p>
  </div>
</div>

Import FileText si pas déjà importé depuis "lucide-react".

De plus, dans la zone de progression (quand processing === true),
modifie le label de l'étape 3 pour être plus explicite :

Remplace :
  { label: "Génération du PDF figé", icon: FileText }
Par :
  { label: "Conversion automatique en PDF (document figé)", icon: FileText }
```

### Prompt 8.3 — Intégrer la conversion PDF dans l'archivage automatique

```
Dans convex/automationEngine.ts de digitalium.io,
la mutation archiveFromAutomation ne gère pas actuellement la conversion PDF
(elle flag seulement le document pour archivage).

Modifie le commentaire et la logique pour documenter clairement le flux :

Dans archiveFromAutomation, APRÈS le patch du document et AVANT le return, ajoute :

// ── NOTE ARCHITECTURE ──
// La conversion PDF ne peut PAS se faire côté serveur Convex (pas d'accès DOM/html2pdf).
// Le flux complet est :
// 1. Cette mutation flag le document (archiveCategorySlug + workflowReason)
// 2. Le client détecte le flag via une query réactive
// 3. Le client ouvre ArchiveModal qui effectue la conversion PDF + upload
// 4. Le client appelle archiveBridge.archiveDocument avec le PDF généré
//
// Pour l'archivage 100% automatique sans intervention client,
// il faudrait un service de conversion PDF externe (ex: Gotenberg, LibreOffice headless via Cloud Run).

Crée aussi une query réactive dans convex/documents.ts :

export const listPendingAutoArchive = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "approved")
      )
      .collect();

    // Filtrer les documents flaggés pour auto-archivage
    return docs.filter(d =>
      d.archiveCategorySlug &&
      d.workflowReason?.includes("auto_archive")
    );
  },
});

Enfin, dans DocumentListPage.tsx, ajoute une notification discrète :
- Query listPendingAutoArchive
- Si résultats > 0, afficher un badge/banner :
  "{n} document(s) en attente d'archivage automatique"
  avec un bouton "Archiver maintenant" qui ouvre le ArchiveModal pour chaque document
```

---

# ═══════════════════════════════════════════
# VÉRIFICATION FINALE
# ═══════════════════════════════════════════

### Prompt FINAL — Audit de cohérence et tests

```
Dans digitalium.io, effectue un audit de cohérence après toutes les modifications :

1. SCHÉMA :
   - Vérifie que convex/schema.ts compile sans erreur : npx convex dev --once
   - Vérifie que toutes les nouvelles tables (document_types, document_metadata_fields,
     permission_groups) ont leurs indexes
   - Vérifie que les nouveaux champs optionnels (documentTypeId, folderTypeId, customMetadata,
     groupId) sont bien v.optional()

2. TYPES TypeScript :
   - Ajoute les types manquants dans src/types/ :
     - src/types/document-types.ts (DocumentType, DocumentTypeInput)
     - Extend src/types/filing.ts si nécessaire
   - Vérifie le build TypeScript : npx tsc --noEmit

3. IMPORTS :
   - Vérifie que tous les nouveaux fichiers Convex sont accessibles via api.*
   - Vérifie que les composants UI importent correctement les composants Radix

4. COHÉRENCE DES MUTATIONS :
   - documents.create : vérifie que folderId et documentTypeId sont passés
   - documents.createFromImport : idem
   - folders.create : vérifie la validation de classement
   - filingCells.create : vérifie la validation du code (regex + unicité)

5. TEST FONCTIONNEL (parcours utilisateur) :
   a. Admin : configurer les types de documents → vérifier l'affichage
   b. Admin : configurer les métadonnées → vérifier les champs
   c. Utilisateur : créer un document → type + dossier obligatoires
   d. Utilisateur : importer un fichier → type demandé dans le review
   e. Admin : créer un dossier → sélection dans l'arborescence obligatoire
   f. Admin : modifier une catégorie → dialogue de confirmation + propagation
   g. Admin : créer un groupe → assigner des membres → vérifier dans la matrice
   h. Utilisateur : archiver → message PDF visible + conversion effective

6. VALIDATION TABLEAU RÉCAPITULATIF :
   | # | Exigence                              | Cible |
   |---|---------------------------------------|-------|
   | 1 | Classement obligatoire dossiers       | 100%  |
   | 2 | Arborescence par défaut + actions     | 100%  |
   | 3 | Métadonnées obligatoires documents    | 100%  |
   | 4 | Propagation batch configs             | 100%  |
   | 5 | Codes structure (9 car, unicité)      | 100%  |
   | 6 | Types documents obligatoires          | 100%  |
   | 7 | Groupes de permissions                | 100%  |
   | 8 | Conversion PDF archivage              | 100%  |
```

---

# Ordre d'exécution recommandé

| Étape | Prompts | Durée estimée | Dépendances |
|-------|---------|---------------|-------------|
| 1 | 6.1, 6.2 | 30 min | Aucune |
| 2 | 6.3 | 45 min | Étape 1 |
| 3 | 6.4, 6.5 | 30 min | Étape 2 |
| 4 | 1.1 | 45 min | Étape 3 |
| 5 | 1.2 | 15 min | Étape 4 |
| 6 | 3.1, 3.2 | 30 min | Étapes 4-5 |
| 7 | 3.3 | 1h | Étape 6 |
| 8 | 2.1 | 10 min | Aucune |
| 9 | 2.2 | 1h | Aucune |
| 10 | 5.1, 5.2, 5.3 | 45 min | Aucune |
| 11 | 4.1, 4.2 | 1h30 | Aucune |
| 12 | 7.1, 7.2 | 2h | Aucune |
| 13 | 8.1, 8.2, 8.3 | 1h30 | Aucune |
| 14 | FINAL | 1h | Toutes |
| **TOTAL** | **22 prompts** | **~11h** | |

---

*Guide généré le 24 mars 2026 — Chaque prompt est autonome et peut être copié-collé directement dans un assistant IA de développement.*
