"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api, internal } from "./_generated/api";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — AI Auto-Tag
// Analyse un document via Gemini et génère des tags intelligents
// ═══════════════════════════════════════════════

/**
 * Extrait le texte brut d'un contenu Tiptap JSON.
 * Parcourt récursivement les nodes pour assembler le texte.
 */
function extractTextFromTiptap(content: unknown): string {
    if (!content || typeof content !== "object") return "";

    const node = content as Record<string, unknown>;

    // Noeud texte simple
    if (node.type === "text" && typeof node.text === "string") {
        return node.text;
    }

    // Noeud avec enfants (paragraphs, headings, lists, etc.)
    if (Array.isArray(node.content)) {
        const childTexts = node.content.map((child: unknown) => extractTextFromTiptap(child));
        // Ajouter un saut de ligne entre les blocs
        const blockTypes = ["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "codeBlock"];
        if (typeof node.type === "string" && blockTypes.includes(node.type)) {
            return childTexts.join("") + "\n";
        }
        return childTexts.join("");
    }

    return "";
}

/**
 * Auto-tag un document via Gemini.
 * Analyse le titre, le contenu textuel et le contexte du dossier parent
 * pour générer des tags pertinents.
 */
export const autoTagDocument = action({
    args: {
        documentId: v.id("documents"),
    },
    handler: async (ctx, args): Promise<{
        tags: string[];
        confidence: number;
        reasoning: string;
        error?: string;
    }> => {
        // ── 1. Récupérer le document ──
        const doc = await ctx.runQuery(api.documents.get, { id: args.documentId });
        if (!doc) {
            return { tags: [], confidence: 0, reasoning: "", error: "Document introuvable" };
        }

        // ── 2. Extraire le texte du contenu Tiptap ──
        const textContent = extractTextFromTiptap(doc.content);
        const title = doc.title || "";
        const existingTags = doc.tags || [];

        // ── 3. Récupérer le nom du dossier parent ──
        let folderName = "";
        let folderPath = "";
        if (doc.folderId) {
            try {
                const folder = await ctx.runQuery(api.folders.getById, { id: doc.folderId });
                if (folder) {
                    folderName = folder.name || "";
                    // Essayer de remonter le chemin du dossier
                    if (folder.parentFolderId) {
                        try {
                            const parentFolder = await ctx.runQuery(api.folders.getById, { id: folder.parentFolderId });
                            if (parentFolder) {
                                folderPath = `${parentFolder.name} > ${folderName}`;
                            }
                        } catch {
                            folderPath = folderName;
                        }
                    } else {
                        folderPath = folderName;
                    }
                }
            } catch {
                // Ignorer silencieusement si le dossier n'existe pas
            }
        }

        // ── 4. Construire le prompt Gemini ──
        const truncatedContent = textContent.slice(0, 15000); // Limiter à 15k chars
        const prompt = `Tu es un expert en gestion documentaire et classification de documents professionnels.

Analyse le document suivant et génère entre 3 et 8 tags pertinents en français.

**Titre du document:** ${title}

${folderPath ? `**Dossier:** ${folderPath}` : ""}

**Contenu du document:**
${truncatedContent || "(Aucun contenu textuel — analyse le titre et le dossier uniquement)"}

${existingTags.length > 0 ? `**Tags existants (ne pas dupliquer):** ${existingTags.join(", ")}` : ""}

**Règles:**
- Génère des tags courts (1-3 mots maximum chacun)
- Tags en français, en minuscules
- Tags spécifiques au contenu du document (pas de tags génériques comme "document" ou "fichier")
- Inclure le domaine métier (ex: "fiscal", "juridique", "commercial", "rh")
- Inclure le type de document si identifiable (ex: "contrat", "facture", "procès-verbal", "rapport")
- Inclure les entités clés mentionnées (noms d'entreprises, projets, etc.)
- Ne pas dupliquer les tags existants
- Classer par pertinence (le plus pertinent en premier)

Réponds UNIQUEMENT en JSON valide, sans markdown, avec ce format exact:
{
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.85,
  "reasoning": "Explication courte de pourquoi ces tags ont été choisis"
}`;

        // ── 5. Appeler Gemini ──
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { tags: [], confidence: 0, reasoning: "", error: "Clé API Gemini manquante" };
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Parser le JSON de la réponse
            const cleaned = responseText
                .replace(/```json\s*/g, "")
                .replace(/```\s*/g, "")
                .trim();

            const parsed = JSON.parse(cleaned);
            const newTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : [];
            const confidence: number = typeof parsed.confidence === "number" ? parsed.confidence : 0.5;
            const reasoning: string = typeof parsed.reasoning === "string" ? parsed.reasoning : "";

            // Filtrer les doublons avec les tags existants
            const uniqueNewTags = newTags
                .map((t: string) => t.toLowerCase().trim())
                .filter((t: string) => t.length > 0 && !existingTags.map(e => e.toLowerCase()).includes(t));

            return {
                tags: uniqueNewTags,
                confidence,
                reasoning,
            };
        } catch (err) {
            console.error("[aiAutoTag] Erreur Gemini:", err);
            return {
                tags: [],
                confidence: 0,
                reasoning: "",
                error: `Erreur IA: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
            };
        }
    },
});

/**
 * Auto-tag un dossier via Gemini.
 * Analyse le nom du dossier, son chemin et les documents qu'il contient.
 */
export const autoTagFolder = action({
    args: {
        folderId: v.id("folders"),
    },
    handler: async (ctx, args): Promise<{
        tags: string[];
        confidence: number;
        reasoning: string;
        error?: string;
    }> => {
        // ── 1. Récupérer le dossier ──
        const folder = await ctx.runQuery(api.folders.getById, { id: args.folderId });
        if (!folder) {
            return { tags: [], confidence: 0, reasoning: "", error: "Dossier introuvable" };
        }

        const folderName = folder.name || "";
        const existingTags = folder.tags || [];

        // ── 2. Récupérer les noms des documents enfants ──
        let docNames: string[] = [];
        try {
            const docs = await ctx.runQuery(api.documents.list, {
                organizationId: folder.organizationId,
            });
            if (docs) {
                docNames = docs
                    .filter((d: any) => d.folderId === args.folderId && d.status !== "trashed")
                    .map((d: any) => d.title)
                    .slice(0, 20); // Max 20 docs pour le contexte
            }
        } catch {
            // Ignorer
        }

        // ── 3. Chemin parent ──
        let parentName = "";
        if (folder.parentFolderId) {
            try {
                const parent = await ctx.runQuery(api.folders.getById, { id: folder.parentFolderId });
                if (parent) parentName = parent.name || "";
            } catch { /* ignore */ }
        }

        // ── 4. Prompt Gemini ──
        const prompt = `Tu es un expert en gestion documentaire et classification de dossiers professionnels.

Analyse le dossier suivant et génère entre 3 et 6 tags pertinents en français.

**Nom du dossier:** ${folderName}
${parentName ? `**Dossier parent:** ${parentName}` : ""}
${docNames.length > 0 ? `**Documents contenus:** ${docNames.join(", ")}` : ""}
${existingTags.length > 0 ? `**Tags existants (ne pas dupliquer):** ${existingTags.join(", ")}` : ""}

**Règles:**
- Tags courts (1-3 mots), en français, en minuscules
- Tags spécifiques au contenu/domaine du dossier
- Inclure le domaine métier (fiscal, juridique, commercial, rh, etc.)
- Ne pas dupliquer les tags existants

Réponds UNIQUEMENT en JSON valide:
{
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.85,
  "reasoning": "Explication courte"
}`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { tags: [], confidence: 0, reasoning: "", error: "Clé API Gemini manquante" };
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const cleaned = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);

            const newTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : [];
            const uniqueNewTags = newTags
                .map((t: string) => t.toLowerCase().trim())
                .filter((t: string) => t.length > 0 && !existingTags.map(e => e.toLowerCase()).includes(t));

            return {
                tags: uniqueNewTags,
                confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
                reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
            };
        } catch (err) {
            console.error("[aiAutoTag] Erreur Gemini folder:", err);
            return {
                tags: [],
                confidence: 0,
                reasoning: "",
                error: `Erreur IA: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
            };
        }
    },
});
