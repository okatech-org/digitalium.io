"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ═══════════════════════════════════════════════════════════════
// Innovation E — Règles sectorielles adaptatives
// ═══════════════════════════════════════════════════════════════

function getSectorPromptRules(sector?: string): string {
    if (!sector) return "";
    const rules: Record<string, string> = {
        assurance: `
RÈGLES SECTORIELLES — ASSURANCE:
- Sinistre, Déclaration, Expertise, Indemnisation → Dossiers Sinistres
- Police, Souscription, Conditions particulières → Dossiers Contrats/Polices
- Réassurance, Traité, Pool → Réassurance
- Risque, Cotation, Tarification → Souscription/Tarification
- Résiliation, Avenant, Modification → Gestion des contrats`,
        juridique: `
RÈGLES SECTORIELLES — CABINET JURIDIQUE:
- Assignation, Citation, Requête, Conclusions → Procédures/Contentieux
- Jugement, Arrêt, Ordonnance → Décisions de justice
- Statuts, PV AG, Acte constitutif → Droit des sociétés
- Bail, Cession, Donation → Droit immobilier/Mutations
- Consultation, Note juridique, Avis → Consultations`,
        btp: `
RÈGLES SECTORIELLES — BTP/CONSTRUCTION:
- Marché, Lot, Appel d'offres → Marchés publics/privés
- Situation de travaux, DGD, Décompte → Suivi de chantier
- CCTP, CCAP, Cahier des charges → Documents contractuels
- OPR, Réception, Réserves → Réception des travaux
- Plan, Coupe, Élévation → Plans techniques`,
        administration: `
RÈGLES SECTORIELLES — ADMINISTRATION PUBLIQUE:
- Arrêté, Décret, Décision → Actes administratifs
- Circulaire, Note de service, Instruction → Communication interne
- Délibération, PV de conseil → Organes délibérants
- Budget, Compte administratif → Finances publiques
- Mutation, Avancement, Notation → Gestion des carrières`,
        sante: `
RÈGLES SECTORIELLES — SANTÉ:
- Dossier patient, Anamnèse, Observation → Dossiers médicaux (confidentiel)
- Ordonnance, Prescription → Prescriptions (confidentiel)
- Résultat, Analyse, Imagerie → Examens complémentaires (confidentiel)
- Protocole, Procédure de soins → Qualité/Protocoles
- Convention, Agrément → Réglementation sanitaire`,
        commerce: `
RÈGLES SECTORIELLES — COMMERCE/DISTRIBUTION:
- Bon de commande, Bon de livraison → Cycle d'achat
- Facture, Avoir, Note de crédit → Facturation
- Relance, Mise en demeure → Recouvrement
- Inventaire, Catalogue, Tarif → Gestion des stocks
- Franchise, Concession, Licence → Partenariats commerciaux`,
        education: `
RÈGLES SECTORIELLES — ÉDUCATION:
- Inscription, Dossier scolaire → Administration scolaire
- Bulletin, Relevé de notes → Évaluation
- Diplôme, Attestation, Certificat → Certifications
- Programme, Syllabus, Emploi du temps → Organisation pédagogique
- Bourse, Aide, Subvention → Vie étudiante`,
    };
    return rules[sector.toLowerCase()] ?? "";
}

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — AI Smart Import
// Analyse fichiers via Gemini et retourne du JSON
// ═══════════════════════════════════════════════

/**
 * Analyse du texte extrait d'un fichier et retourne des données structurées.
 * Le frontend envoie le texte brut (extrait côté client) + le schéma cible.
 */
export const analyzeText = action({
    args: {
        textContent: v.string(),
        targetSchema: v.array(v.object({
            key: v.string(),
            label: v.string(),
            required: v.optional(v.boolean()),
            type: v.optional(v.string()), // "string" | "number" | "boolean"
        })),
        context: v.string(), // Ex: "Liste de membres d'une organisation"
        language: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const schemaDesc = args.targetSchema
            .map((f) => `- "${f.key}" (${f.label})${f.required ? " [OBLIGATOIRE]" : ""}: type ${f.type ?? "string"}`)
            .join("\n");

        const prompt = `Tu es un assistant d'extraction de données. Analyse le contenu suivant et extrais les données structurées.

CONTEXTE: ${args.context}

SCHÉMA CIBLE (chaque ligne extraite doit avoir ces champs):
${schemaDesc}

CONTENU À ANALYSER:
"""
${args.textContent.substring(0, 30000)}
"""

RÈGLES:
1. Retourne UNIQUEMENT un tableau JSON valide, rien d'autre
2. Chaque élément du tableau est un objet avec les champs du schéma
3. Si une valeur n'est pas trouvée, utilise null
4. Les champs obligatoires doivent avoir une valeur non-null
5. Nettoie les données : supprime les espaces inutiles, uniformise les formats
6. Pour les emails, normalise en minuscules
7. Pour les téléphones, garde le format original
8. Ignore les lignes d'en-tête, de total, ou non pertinentes

Réponds UNIQUEMENT avec le tableau JSON, sans markdown ni explication.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();

        // Extraire le JSON (parfois Gemini ajoute des backticks)
        let jsonText = text;
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) {
                return { rows: [parsed], confidence: 0.7, rawResponse: jsonText };
            }
            return { rows: parsed, confidence: 0.9, rawResponse: jsonText };
        } catch {
            // Si le JSON est invalide, retourner l'erreur
            return { rows: [], confidence: 0, rawResponse: text, error: "Impossible de parser la réponse IA" };
        }
    },
});

/**
 * Analyse d'une image via Gemini Vision (multimodal).
 * Le frontend envoie l'image en base64.
 */
export const analyzeImage = action({
    args: {
        imageBase64: v.string(),
        mimeType: v.string(), // "image/png", "image/jpeg", etc.
        targetSchema: v.array(v.object({
            key: v.string(),
            label: v.string(),
            required: v.optional(v.boolean()),
            type: v.optional(v.string()),
        })),
        context: v.string(),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const schemaDesc = args.targetSchema
            .map((f) => `- "${f.key}" (${f.label})${f.required ? " [OBLIGATOIRE]" : ""}: type ${f.type ?? "string"}`)
            .join("\n");

        const prompt = `Tu es un assistant d'extraction de données à partir d'images. Analyse cette image et extrais les données structurées.

CONTEXTE: ${args.context}

SCHÉMA CIBLE:
${schemaDesc}

RÈGLES:
1. Retourne UNIQUEMENT un tableau JSON valide
2. Extrais toutes les données visibles qui correspondent au schéma
3. Si tu vois un tableau, un organigramme, ou une liste, extrais chaque élément
4. Champs manquants = null
5. Nettoie les données (espaces, formats)

Réponds UNIQUEMENT avec le tableau JSON.`;

        const imagePart = {
            inlineData: {
                data: args.imageBase64,
                mimeType: args.mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text().trim();

        let jsonText = text;
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) {
                return { rows: [parsed], confidence: 0.7, rawResponse: jsonText };
            }
            return { rows: parsed, confidence: 0.9, rawResponse: jsonText };
        } catch {
            return { rows: [], confidence: 0, rawResponse: text, error: "Impossible de parser la réponse IA" };
        }
    },
});

/**
 * Gap #9 — CRM extraction from imported documents.
 * Uses Gemini to detect client/company info in text
 * and returns a suggestedClient object for CRM linking.
 */
export const extractClientInfo = action({
    args: {
        textContent: v.string(),
        context: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Tu es un assistant d'extraction CRM. Analyse le document suivant et extrais les informations de l'entreprise/client.

CONTEXTE: ${args.context ?? "Document commercial ou administratif"}

CHAMPS À EXTRAIRE:
- "companyName": Nom de l'entreprise ou du client
- "contactName": Nom du contact principal (personne physique)
- "email": Adresse email
- "phone": Numéro de téléphone
- "address": Adresse postale
- "rccm": Numéro RCCM (Registre du Commerce)
- "nif": Numéro d'Identification Fiscale
- "sector": Secteur d'activité
- "website": Site web

CONTENU:
"""
${args.textContent.substring(0, 20000)}
"""

RÈGLES:
1. Retourne UN SEUL objet JSON (pas un tableau)
2. Si un champ n'est pas trouvé, utilise null
3. Nettoie les données
4. Ajoute un champ "confidence" (0-1) indiquant ta confiance globale

Réponds UNIQUEMENT avec l'objet JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        let jsonText = text;
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const parsed = JSON.parse(jsonText);
            return {
                suggestedClient: parsed,
                rawResponse: jsonText,
            };
        } catch {
            return {
                suggestedClient: null,
                rawResponse: text,
                error: "Impossible de parser la réponse IA",
            };
        }
    },
});

/**
 * classifyDocuments — AI-powered document classification.
 * Uses Gemini to analyze file names against the existing folder hierarchy,
 * suggest optimal placement, create sub-folders (e.g. per client), and explain reasoning.
 */
export const classifyDocuments = action({
    args: {
        fileNames: v.array(v.string()),
        folderTree: v.array(v.object({
            id: v.string(),
            name: v.string(),
            path: v.string(),
            depth: v.number(),
            parentFolderId: v.union(v.string(), v.null()),
            tags: v.array(v.string()),
            description: v.string(),
        })),
        depthConfig: v.optional(v.object({
            maxDepth: v.number(),
            depthStrategy: v.string(),
        })),
        // Innovation A — Classification enrichie
        fileExcerpts: v.optional(v.array(v.string())),
        fileMimeTypes: v.optional(v.array(v.string())),
        fileSizes: v.optional(v.array(v.number())),
        orgSector: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build a readable folder tree for the prompt
        const treeStr = args.folderTree.length > 0
            ? args.folderTree
                .sort((a, b) => a.path.localeCompare(b.path))
                .map((f) => `  ${"  ".repeat(f.depth)}📁 "${f.path}" (id: ${f.id})${f.tags.length ? ` [tags: ${f.tags.join(", ")}]` : ""}`)
                .join("\n")
            : "  (Aucun dossier existant)";

        const filesStr = args.fileNames
            .map((name, i) => {
                let line = `  ${i + 1}. "${name}"`;
                if (args.fileMimeTypes?.[i]) line += ` [type: ${args.fileMimeTypes[i]}]`;
                if (args.fileSizes?.[i]) line += ` [${Math.round(args.fileSizes[i] / 1024)}KB]`;
                if (args.fileExcerpts?.[i]) line += `\n     Contenu: "${args.fileExcerpts[i].substring(0, 500)}"`;
                return line;
            })
            .join("\n");

        const sectorRules = getSectorPromptRules(args.orgSector);

        const prompt = `Tu es l'assistant de classement documentaire intelligent de Digitalium.io.
Ta mission est de classer des fichiers importés dans l'arborescence de dossiers EXISTANTE d'une organisation.
${args.orgSector ? `\nCette organisation opère dans le secteur: ${args.orgSector.toUpperCase()}` : ""}

═══════════════════════════════════════
ARBORESCENCE EXISTANTE DE L'ORGANISATION:
═══════════════════════════════════════
${treeStr}
${sectorRules ? `\n${sectorRules}` : ""}

═══════════════════════════════════════
FICHIERS À CLASSER:
═══════════════════════════════════════
${filesStr}

═══════════════════════════════════════
RÈGLES DE LOGIQUE DOCUMENTAIRE (CRITIQUES):
═══════════════════════════════════════

1. **PRIORITÉ AUX DOSSIERS EXISTANTS**: Toujours chercher un dossier existant approprié AVANT de proposer d'en créer un nouveau. Ne JAMAIS créer un dossier dont le nom est similaire à un existant.

2. **Classification par type de document**:
   - Devis, factures, bons de commande, relevés → Finances / Comptabilité
   - Contrats signés, avenants, conventions → Contrats Clients / Juridique
   - PV, délibérations, comptes-rendus → Direction / Gouvernance
   - CV, fiches de paie, contrats de travail → RH / Ressources Humaines
   - Plans, stratégies, rapports → Direction / Stratégie
   - Documents techniques, cahiers des charges, CCTP → Technique / Projets

3. **Extraction du client/projet**: Si le nom du fichier contient un identifiant client ou projet (ex: "SGG" dans "Devis_Maintenance_SGG"), proposer de créer un sous-dossier au nom du client/projet DANS le dossier de type approprié.

4. **Sous-dossiers intelligents**: Si plusieurs fichiers d'un même TYPE existent mais qu'il n'y a pas de sous-dossier dédié (ex: pas de dossier "Devis"), proposer de créer ce sous-dossier dans la branche logique.

5. **Hiérarchie de création**: Les nouveaux dossiers proposés doivent s'intégrer logiquement dans l'arborescence existante. Format du chemin: "DossierParent > NouveauDossier > SousDossier".

═══════════════════════════════════════
CONTRAINTE DE PROFONDEUR:
═══════════════════════════════════════

${args.depthConfig ? `- La profondeur maximale autorisée est de ${args.depthConfig.maxDepth} niveaux (0 = racine, ${args.depthConfig.maxDepth - 1} = dernier niveau).
- NE JAMAIS proposer "newFoldersToCreate" qui ferait dépasser cette limite de ${args.depthConfig.maxDepth} niveaux.
- Vérifie la profondeur du dossier parent dans l'arborescence avant de proposer des sous-dossiers.
${args.depthConfig.depthStrategy === "synthetique" ? "- STRATÉGIE SYNTHÉTIQUE: Consolide les documents dans des catégories larges. Préfère les dossiers existants. Minimise la création de sous-dossiers. Favorise une structure plate." : "- STRATÉGIE INTELLIGENTE: Organise de manière optimale selon le contenu et le volume, en respectant la contrainte de profondeur maximale."}` : "- Profondeur par défaut: maximum 3 niveaux."}

═══════════════════════════════════════
FORMAT DE RÉPONSE (JSON STRICT):
═══════════════════════════════════════

Retourne un tableau JSON avec un objet par fichier, dans l'ordre des fichiers fournis:

[
  {
    "fileName": "nom_du_fichier.ext",
    "suggestedFolderId": "id_du_dossier_existant_le_plus_proche",
    "suggestedPath": "Chemin > Complet > Proposé",
    "newFoldersToCreate": ["NomDossier1", "NomDossier2"],
    "parentFolderIdForNew": "id_du_dossier_parent_pour_les_nouveaux",
    "suggestedTags": ["Tag1", "Tag2"],
    "confidence": 0.92,
    "reasoning": "Explication courte du choix en français"
  }
]

RÈGLES JSON:
- "suggestedFolderId" = l'ID d'un dossier EXISTANT dans l'arborescence (le parent le plus proche)
- "suggestedPath" = le chemin final complet, incluant les dossiers à créer
- "newFoldersToCreate" = tableau des noms de nouveaux dossiers à créer (vide si aucun)
- "parentFolderIdForNew" = l'ID du dossier existant dans lequel créer les nouveaux sous-dossiers
- "confidence" = score entre 0 et 1
- "suggestedFolderId" est OBLIGATOIRE et ne doit JAMAIS être null. Chaque fichier DOIT être classé dans un dossier existant. Si aucun dossier ne correspond parfaitement, choisir le dossier le plus proche logiquement (même avec une faible confiance)

Réponds UNIQUEMENT avec le tableau JSON, sans markdown ni explication.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        let jsonText = text;
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) {
                return { classifications: [parsed], rawResponse: jsonText };
            }
            return { classifications: parsed, rawResponse: jsonText };
        } catch {
            return {
                classifications: [],
                rawResponse: text,
                error: "Impossible de parser la réponse IA de classification",
            };
        }
    },
});

/**
 * reorganizeDocuments — AI-powered reorganization of existing documents.
 * Analyzes all documents and proposes an optimal folder structure.
 * Two modes: "classify" (use existing folders) and "reorganize" (create new folders).
 */
export const reorganizeDocuments = action({
    args: {
        documents: v.array(v.object({
            id: v.string(),
            title: v.string(),
            fileName: v.optional(v.string()),
            tags: v.array(v.string()),
            currentFolderId: v.union(v.string(), v.null()),
            currentFolderName: v.union(v.string(), v.null()),
        })),
        folderTree: v.array(v.object({
            id: v.string(),
            name: v.string(),
            path: v.string(),
            depth: v.number(),
            parentFolderId: v.union(v.string(), v.null()),
            tags: v.array(v.string()),
            description: v.string(),
        })),
        mode: v.union(v.literal("classify"), v.literal("reorganize")),
        depthConfig: v.optional(v.object({
            maxDepth: v.number(),
            depthStrategy: v.string(),
        })),
        orgSector: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const treeStr = args.folderTree.length > 0
            ? args.folderTree
                .sort((a, b) => a.path.localeCompare(b.path))
                .map((f) => `  ${"  ".repeat(f.depth)}📁 "${f.path}" (id: ${f.id})`)
                .join("\n")
            : "  (Aucun dossier existant)";

        const docsStr = args.documents
            .map((d, i) => `  ${i + 1}. "${d.title}" ${d.fileName ? `[fichier: ${d.fileName}]` : ""} [tags: ${d.tags.join(", ") || "aucun"}] → Dossier actuel: ${d.currentFolderName ?? "Aucun"} (id: ${d.currentFolderId ?? "null"})`)
            .join("\n");

        const modeInstruction = args.mode === "classify"
            ? `MODE CLASSEMENT UNIQUEMENT:
- Tu ne peux PAS créer de nouveaux dossiers
- Tu dois classer chaque document dans un dossier EXISTANT de l'arborescence
- "newFoldersToCreate" doit TOUJOURS être un tableau vide []
- Si aucun dossier existant ne convient parfaitement, choisis le plus proche`
            : `MODE RÉORGANISATION COMPLÈTE:
- Tu DOIS créer de nouveaux sous-dossiers quand ils n'existent PAS dans l'arborescence
- Crée des sous-dossiers par TYPE de document (Devis, Factures, Contrats, Notes de Service, Rapports, etc.)
- Crée des sous-sous-dossiers par CLIENT/PROJET si tu détectes des noms récurrents (ex: SGG, Atos)
- EXEMPLE: si "Finances et Comptabilité" existe mais pas "Devis", alors:
    "parentFolderIdForNew": "id_de_Finances_et_Comptabilité"
    "newFoldersToCreate": ["Devis"]
- EXEMPLE: si tu veux "Finances et Comptabilité > Devis > SGG", mais seul "Finances et Comptabilité" existe:
    "parentFolderIdForNew": "id_de_Finances_et_Comptabilité"
    "newFoldersToCreate": ["Devis", "SGG"]
- IMPORTANT: "newFoldersToCreate" est ORDONNÉ du parent au plus profond
- Ne mets PAS un dossier dans "newFoldersToCreate" s'il existe DÉJÀ dans l'arborescence
- "targetFolderId" = l'ID du dossier existant le plus PROFOND dans le chemin (le parent des nouveaux)`;

        const sectorRules = getSectorPromptRules(args.orgSector);

        const prompt = `Tu es l'assistant de réorganisation documentaire intelligent de Digitalium.io.
Ta mission est d'analyser TOUS les documents existants et de proposer un plan de réorganisation optimal.
${args.orgSector ? `\nCette organisation opère dans le secteur: ${args.orgSector.toUpperCase()}` : ""}
${sectorRules ? `\n${sectorRules}` : ""}

═══════════════════════════════════════
ARBORESCENCE ACTUELLE:
═══════════════════════════════════════
${treeStr}

═══════════════════════════════════════
DOCUMENTS À RÉORGANISER:
═══════════════════════════════════════
${docsStr}

═══════════════════════════════════════
${modeInstruction}
═══════════════════════════════════════

RÈGLES DE LOGIQUE DOCUMENTAIRE:
1. Devis, factures, bons de commande → Finances / Comptabilité (créer des sous-dossiers: Devis, Factures, etc.)
2. Contrats, avenants, conventions → Contrats Clients / Juridique
3. PV, délibérations, comptes-rendus → Direction / Gouvernance
4. CV, fiches de paie → RH / Ressources Humaines
5. Documents techniques, cahiers des charges → Technique / Projets
6. Si un document est DÉJÀ dans le bon dossier, ne le déplace PAS (même dossier source et destination)
7. Si un client/projet est identifiable (ex: "SGG"), regroupe ses documents dans un sous-dossier dédié

═══════════════════════════════════════
CONTRAINTE DE PROFONDEUR:
═══════════════════════════════════════
${args.depthConfig ? `- La profondeur maximale autorisée est de ${args.depthConfig.maxDepth} niveaux.
- NE JAMAIS proposer "newFoldersToCreate" qui ferait dépasser cette limite.
${args.depthConfig.depthStrategy === "synthetique" ? "- STRATÉGIE SYNTHÉTIQUE: Consolide dans des catégories larges. Minimise les sous-dossiers. Structure plate." : "- STRATÉGIE INTELLIGENTE: Organise selon le contenu/volume, en respectant la profondeur maximale."}` : "- Profondeur par défaut: maximum 3 niveaux."}

═══════════════════════════════════════
FORMAT DE RÉPONSE (JSON STRICT):
═══════════════════════════════════════

{
  "moves": [
    {
      "docId": "id_du_document",
      "docTitle": "titre_du_document",
      "currentFolderId": "id_dossier_actuel_ou_null",
      "targetFolderId": "id_dossier_existant_parent_le_plus_profond",
      "targetFolderPath": "Chemin > Complet > Final",
      "newFoldersToCreate": ["SousDossier1", "SousDossier2"],
      "parentFolderIdForNew": "id_dossier_existant_parent_pour_les_nouveaux",
      "shouldMove": true,
      "reasoning": "Explication courte en français",
      "confidence": 0.92
    }
  ],
  "summary": "Résumé global de la réorganisation proposée en français",
  "stats": {
    "totalDocuments": 10,
    "documentsToMove": 7,
    "documentsAlreadyCorrect": 3,
    "newFoldersToCreate": 2
  }
}

RÈGLES CRITIQUES:
- "shouldMove" = false si le document est déjà dans le bon dossier
- "targetFolderId" = toujours l'ID d'un dossier qui EXISTE DÉJÀ dans l'arborescence ci-dessus
- "parentFolderIdForNew" = ID du dossier existant sous lequel créer les nouveaux sous-dossiers (=targetFolderId en général)
- "newFoldersToCreate" = NE PAS LAISSER VIDE si le chemin final nécessite des dossiers qui n'existent pas 
- Inclure TOUS les documents dans "moves", même ceux qui ne bougent pas (shouldMove: false)
- Utilise les VRAIS IDs des documents et dossiers fournis ci-dessus

Réponds UNIQUEMENT avec l'objet JSON, sans markdown.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        let jsonText = text;
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const parsed = JSON.parse(jsonText);
            return { plan: parsed, rawResponse: jsonText };
        } catch {
            return {
                plan: null,
                rawResponse: text,
                error: "Impossible de parser le plan de réorganisation IA",
            };
        }
    },
});

// ═══════════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Deep Reorganization v2
// Réorganisation intelligente avec expertise métier documentaire
// Comprend le métier, l'activité, le contexte et applique:
//   - Déplacement intelligent avec sous-dossiers
//   - Tags métier automatiques
//   - Catégorie de rétention (OHADA)
//   - Confidentialité par nature de document
//   - Type de document automatique
//   - Restrictions d'accès recommandées
// ═══════════════════════════════════════════════════════════════════

export const deepReorganize = action({
    args: {
        documents: v.array(v.object({
            id: v.string(),
            title: v.string(),
            fileName: v.optional(v.string()),
            excerpt: v.optional(v.string()),
            tags: v.array(v.string()),
            currentFolderId: v.union(v.string(), v.null()),
            currentFolderName: v.union(v.string(), v.null()),
            status: v.optional(v.string()),
            mimeType: v.optional(v.string()),
            fileSize: v.optional(v.number()),
            createdBy: v.optional(v.string()),
            createdAt: v.optional(v.number()),
            documentTypeCode: v.optional(v.string()),
            archiveCategorySlug: v.optional(v.string()),
        })),
        folderTree: v.array(v.object({
            id: v.string(),
            name: v.string(),
            path: v.string(),
            depth: v.number(),
            parentFolderId: v.union(v.string(), v.null()),
            tags: v.array(v.string()),
            description: v.string(),
        })),
        // Catégories d'archive disponibles dans l'organisation
        archiveCategories: v.array(v.object({
            slug: v.string(),
            name: v.string(),
            retentionYears: v.number(),
            scope: v.string(),
        })),
        // Types de documents configurés
        documentTypes: v.array(v.object({
            id: v.string(),
            code: v.string(),
            nom: v.string(),
            retentionCategorySlug: v.optional(v.string()),
        })),
        // Contexte organisationnel
        orgContext: v.object({
            name: v.string(),
            sector: v.optional(v.string()),
            country: v.optional(v.string()),
            totalDocuments: v.number(),
            totalFolders: v.number(),
        }),
        mode: v.union(
            v.literal("classify"),        // Classer dans l'existant
            v.literal("reorganize"),       // Restructurer + créer dossiers
            v.literal("deep_audit"),       // Audit complet: move + tags + rétention + confidentialité
        ),
        depthConfig: v.optional(v.object({
            maxDepth: v.number(),
            depthStrategy: v.string(),
        })),
        orgSector: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // ── Construire la représentation de l'arborescence ──
        const treeStr = args.folderTree.length > 0
            ? args.folderTree
                .sort((a, b) => a.path.localeCompare(b.path))
                .map((f) => `  ${"  ".repeat(f.depth)}📁 "${f.path}" (id: ${f.id}) [tags: ${f.tags.join(", ") || "-"}]`)
                .join("\n")
            : "  (Aucun dossier existant)";

        // ── Construire la liste de documents enrichie ──
        const docsStr = args.documents
            .map((d, i) => {
                const parts = [
                    `${i + 1}. "${d.title}"`,
                    d.fileName ? `[fichier: ${d.fileName}]` : "",
                    `[type: ${d.documentTypeCode || "non défini"}]`,
                    `[tags: ${d.tags.join(", ") || "aucun"}]`,
                    `[rétention: ${d.archiveCategorySlug || "non définie"}]`,
                    `[statut: ${d.status || "?"}]`,
                    d.excerpt ? `[extrait: ${d.excerpt.slice(0, 120)}...]` : "",
                    `→ Dossier: ${d.currentFolderName ?? "Aucun"} (id: ${d.currentFolderId ?? "null"})`,
                ];
                return `  ${parts.filter(Boolean).join(" ")}`;
            })
            .join("\n");

        // ── Catégories d'archive OHADA disponibles ──
        const categoriesStr = args.archiveCategories
            .map((c) => `  - "${c.slug}" (${c.name}) → ${c.retentionYears} ans [scope: ${c.scope}]`)
            .join("\n");

        // ── Types de documents disponibles ──
        const typesStr = args.documentTypes
            .map((t) => `  - ${t.code}: ${t.nom}${t.retentionCategorySlug ? ` → rétention: ${t.retentionCategorySlug}` : ""}`)
            .join("\n");

        // ── Instructions par mode ──
        const modeInstructions: Record<string, string> = {
            classify: `MODE CLASSEMENT:
- Range chaque document dans un dossier EXISTANT uniquement
- "newFoldersToCreate" = toujours []
- Applique les tags, types et catégories de rétention recommandés`,

            reorganize: `MODE RÉORGANISATION:
- Crée de nouveaux sous-dossiers quand nécessaire
- Organise par TYPE puis par CLIENT/PROJET
- "newFoldersToCreate" ordonné du parent au plus profond
- Applique aussi tags, types et catégories de rétention`,

            deep_audit: `MODE AUDIT PROFOND:
- Restructure l'arborescence de façon optimale
- Crée des dossiers métier cohérents
- Applique tags, types de document, catégories de rétention
- Définit la confidentialité selon la nature du document
- Recommande les restrictions d'accès (visibilité du dossier)
- Corrige les tags existants (retire les incorrects, ajoute les manquants)
- Identifie les documents mal classés, les doublons potentiels
- Applique la logique OHADA pour les durées de conservation`,
        };

        const prompt = `Tu es un expert en gestion documentaire, archivistique et records management pour l'organisation "${args.orgContext.name}"${args.orgContext.sector ? ` (secteur: ${args.orgContext.sector})` : ""}${args.orgContext.country ? ` basée au/en ${args.orgContext.country}` : ""}.

Tu maîtrises parfaitement:
- Le plan de classement documentaire professionnel (séries, sous-séries, dossiers)
- La norme OHADA et la réglementation archivistique africaine
- Le cycle de vie du document: création → validation → conservation active → semi-active → archivage définitif → destruction
- Les principes de respect des fonds et de provenance
- La confidentialité par nature de document (public, interne, confidentiel, secret)

═══ CONTEXTE ORGANISATIONNEL ═══
Organisation: ${args.orgContext.name}
${args.orgContext.sector ? `Secteur d'activité: ${args.orgContext.sector}` : ""}
${args.orgContext.country ? `Pays: ${args.orgContext.country}` : ""}
Volume: ${args.orgContext.totalDocuments} documents dans ${args.orgContext.totalFolders} dossiers

═══ ARBORESCENCE ACTUELLE ═══
${treeStr}

═══ CATÉGORIES DE RÉTENTION DISPONIBLES (OHADA) ═══
${categoriesStr || "  (Aucune catégorie configurée — utilise les slugs: fiscal, social, juridique, client, coffre, general)"}

═══ TYPES DE DOCUMENTS CONFIGURÉS ═══
${typesStr || "  (Aucun type configuré — utilise les codes: CORR, RAPP, PV, NOTE, CONT, FACT, DECIS, AUTRE)"}

═══ DOCUMENTS À ANALYSER ═══
${docsStr}

═══ ${modeInstructions[args.mode]} ═══

═══ EXPERTISE MÉTIER — RÈGLES DE CLASSIFICATION INTELLIGENTE ═══

1. ANALYSE SÉMANTIQUE DU TITRE ET CONTENU:
   - "Devis", "Proposition commerciale", "Offre" → type FACT, catégorie "client", confidentiel
   - "Facture", "Bon de commande", "Avoir" → type FACT, catégorie "fiscal"
   - "Contrat", "Convention", "Avenant", "Protocole" → type CONT, catégorie "juridique", confidentiel
   - "PV", "Procès-verbal", "Délibération", "Compte-rendu" → type PV, catégorie "juridique"
   - "Note de service", "Circulaire", "Instruction" → type NOTE, catégorie "general"
   - "Rapport", "Étude", "Audit", "Bilan" → type RAPP, catégorie selon contexte
   - "CV", "Fiche de paie", "Contrat de travail", "Attestation" → type AUTRE, catégorie "social", confidentiel
   - "Statuts", "Règlement intérieur", "Acte constitutif" → type DECIS, catégorie "coffre", secret
   - "Plan", "Cahier des charges", "CCTP", "Spécifications" → type RAPP, catégorie "client"

2. DÉTECTION D'ENTITÉS:
   - Extraire noms de CLIENTS (entreprises, personnes morales)
   - Extraire noms de PROJETS identifiables
   - Extraire des DATES significatives (année fiscale, trimestre)
   - Regrouper les documents du même client/projet dans un sous-dossier dédié

3. COHÉRENCE DE LA RÉTENTION (OHADA):
   - Documents fiscaux: minimum 10 ans (Art. 22 AUDCG)
   - Documents sociaux/RH: minimum 5 ans
   - Documents juridiques: minimum 30 ans pour actes constitutifs
   - Contrats commerciaux: durée du contrat + 5 ans
   - Correspondance: 5 ans minimum

4. CONFIDENTIALITÉ:
   - "public": Documents à usage externe (rapports annuels, marketing)
   - "internal": Documents internes standards (notes, rapports internes)
   - "confidential": Données personnelles, contrats, devis, infos financières
   - "secret": Actes constitutifs, PV stratégiques, données RH sensibles

5. VISIBILITÉ DOSSIER:
   - "team": Tous les membres de l'org
   - "shared": Personnes autorisées uniquement
   - "private": Gestionnaires et admins

6. TAGS MÉTIER:
   - Maximum 6 tags par document
   - Tags normalisés en français, capitalisés (ex: "Fiscal", "Contrat", "RH")

═══ CONTRAINTE DE PROFONDEUR ═══
${args.depthConfig ? `- La profondeur maximale autorisée est de ${args.depthConfig.maxDepth} niveaux (0 = racine, ${args.depthConfig.maxDepth - 1} = dernier niveau).
- NE JAMAIS proposer "newFoldersToCreate" qui ferait dépasser cette limite.
- Vérifie la profondeur ("depth") du dossier parent dans l'arborescence avant de proposer des sous-dossiers.
${args.depthConfig.depthStrategy === "synthetique" ? "- STRATÉGIE SYNTHÉTIQUE: Consolide dans des catégories larges. Minimise les sous-dossiers. Favorise une arborescence plate et simple." : "- STRATÉGIE INTELLIGENTE: Organise selon le contenu et le volume, en respectant la profondeur maximale. Crée des sous-dossiers quand le volume le justifie."}` : "- Profondeur par défaut: maximum 3 niveaux."}

═══ FORMAT DE RÉPONSE JSON STRICT ═══
{
  "organizationAnalysis": {
    "detectedSector": "secteur détecté",
    "detectedClients": ["Client A", "Client B"],
    "detectedProjects": ["Projet X"],
    "keyInsights": "Résumé de l'analyse métier"
  },
  "moves": [
    {
      "docId": "id_du_document",
      "docTitle": "titre",
      "currentFolderId": "id_ou_null",
      "targetFolderId": "id_dossier_existant_le_plus_profond",
      "targetFolderPath": "Chemin > Complet > Final",
      "newFoldersToCreate": ["Sous-dossier1"],
      "parentFolderIdForNew": "id_parent_existant",
      "shouldMove": true,
      "reasoning": "Explication métier en français",
      "confidence": 0.92,
      "recommendations": {
        "suggestedTags": ["Tag1", "Tag2"],
        "suggestedDocTypeCode": "CONT",
        "suggestedRetentionSlug": "juridique",
        "suggestedConfidentiality": "confidential",
        "suggestedFolderVisibility": "shared",
        "retentionReasoning": "Justification OHADA ou métier"
      }
    }
  ],
  "folderRecommendations": [
    {
      "folderId": "id_dossier_existant",
      "suggestedRetentionSlug": "fiscal",
      "suggestedConfidentiality": "internal",
      "suggestedVisibility": "team",
      "suggestedTags": ["Finances"],
      "reasoning": "Justification"
    }
  ],
  "summary": "Résumé global en français",
  "stats": {
    "totalDocuments": 10,
    "documentsToMove": 7,
    "documentsAlreadyCorrect": 3,
    "newFoldersToCreate": 2,
    "tagsToApply": 25,
    "retentionToSet": 8,
    "confidentialityToSet": 6
  }
}

═══ RÈGLES CRITIQUES ═══
- "shouldMove" = false si déjà au bon endroit
- "targetFolderId" = toujours un ID EXISTANT
- "newFoldersToCreate" ordonné du parent au plus profond
- Inclure TOUS les documents, même ceux qui ne bougent pas
- Utilise les VRAIS IDs fournis ci-dessus
- "suggestedDocTypeCode" = un code parmi les types configurés
- "suggestedRetentionSlug" = un slug parmi les catégories configurées

Réponds UNIQUEMENT avec l'objet JSON, sans markdown, sans commentaires.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        let jsonText = text;
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const parsed = JSON.parse(jsonText);
            return { plan: parsed, rawResponse: jsonText };
        } catch {
            return {
                plan: null,
                rawResponse: text,
                error: "Impossible de parser le plan IA",
            };
        }
    },
});

// ═══════════════════════════════════════════════════════════════
// Innovation D — Extraction de contenu + résumé intelligent
// ═══════════════════════════════════════════════════════════════

export const generateSmartExcerpt = action({
    args: {
        text: v.string(),
        fileName: v.string(),
        mimeType: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { excerpt: `Document importé — ${args.fileName}`, confidence: 0.5 };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const truncated = args.text.substring(0, 5000);

        const prompt = `Analyse ce document et génère un résumé professionnel en 1-2 phrases maximum (en français).
Le résumé doit capturer: le type de document, les parties impliquées, les dates clés, et les montants si présents.

Fichier: "${args.fileName}"
Type: ${args.mimeType ?? "inconnu"}

Contenu:
${truncated}

Réponds UNIQUEMENT avec le JSON:
{"excerpt": "résumé en 1-2 phrases", "documentType": "type détecté", "confidence": 0.85}`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return {
                excerpt: parsed.excerpt ?? `Document importé — ${args.fileName}`,
                documentType: parsed.documentType ?? null,
                confidence: parsed.confidence ?? 0.7,
            };
        } catch {
            return { excerpt: `Document importé — ${args.fileName}`, confidence: 0.5 };
        }
    },
});

// ═══════════════════════════════════════════════════════════════
// Innovation H — Extraction d'entités (Knowledge Graph)
// ═══════════════════════════════════════════════════════════════

export const extractEntities = action({
    args: {
        documentId: v.string(),
        title: v.string(),
        text: v.string(),
        fileName: v.optional(v.string()),
        orgSector: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { entities: [] };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const truncated = args.text.substring(0, 10000);

        const prompt = `Analyse ce document et extrais toutes les entités métier identifiables.
${args.orgSector ? `Secteur de l'organisation: ${args.orgSector}` : ""}

Titre: "${args.title}"
${args.fileName ? `Fichier: "${args.fileName}"` : ""}

Contenu:
${truncated}

Extrais les entités selon ces catégories:
- "client": nom d'entreprise, organisme, institution mentionné
- "project": nom de projet, programme, mission identifié
- "amount": montant financier avec devise (ex: "150 000 XAF")
- "date": date significative (contrat, échéance, création)
- "person": nom de personne impliquée
- "reference": numéro de référence, facture, contrat, marché

Réponds UNIQUEMENT en JSON:
{"entities": [{"type": "client", "value": "SGG", "confidence": 0.95}, ...]}`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return { entities: parsed.entities ?? [] };
        } catch {
            return { entities: [] };
        }
    },
});

// ═══════════════════════════════════════════════════════════════
// Innovation J — RAG documentaire (Ask AI)
// ═══════════════════════════════════════════════════════════════

export const askDocuments = action({
    args: {
        question: v.string(),
        documentContexts: v.array(v.object({
            id: v.string(),
            title: v.string(),
            excerpt: v.string(),
            folderName: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
        })),
        orgName: v.optional(v.string()),
        orgSector: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY non configurée");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const docsContext = args.documentContexts
            .map((d, i) => `[Doc ${i + 1}] "${d.title}" (${d.folderName ?? "sans dossier"})${d.tags?.length ? ` [${d.tags.join(", ")}]` : ""}\n${d.excerpt}`)
            .join("\n\n");

        const prompt = `Tu es l'assistant IA de Digitalium.io, spécialisé en intelligence documentaire.
${args.orgName ? `Organisation: ${args.orgName}` : ""}
${args.orgSector ? `Secteur: ${args.orgSector}` : ""}

L'utilisateur pose une question sur ses documents. Réponds en te basant UNIQUEMENT sur les documents fournis ci-dessous.
Si l'information n'est pas dans les documents, dis-le clairement.
Cite toujours les documents sources entre crochets [Doc N].

═══ DOCUMENTS DISPONIBLES ═══
${docsContext}

═══ QUESTION ═══
${args.question}

Réponds en JSON:
{
  "answer": "Réponse détaillée en français avec citations [Doc N]",
  "sources": [{"docIndex": 1, "docTitle": "titre", "relevance": 0.9}],
  "confidence": 0.85
}`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return {
                answer: parsed.answer ?? "Je n'ai pas trouvé d'information pertinente dans les documents disponibles.",
                sources: parsed.sources ?? [],
                confidence: parsed.confidence ?? 0.5,
            };
        } catch {
            return {
                answer: "Erreur lors de l'analyse. Veuillez reformuler votre question.",
                sources: [],
                confidence: 0,
                error: true,
            };
        }
    },
});
