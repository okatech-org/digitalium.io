"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
