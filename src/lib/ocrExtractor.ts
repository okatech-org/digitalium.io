// ═══════════════════════════════════════════════
// DIGITALIUM.IO — OCR Extractor (v1 lightweight)
// Client-side text extraction from PDF and images
// ═══════════════════════════════════════════════

/**
 * Extract text from a file URL.
 * v1: PDF text extraction via pdf.js text layer.
 * Images: returns placeholder for future Tesseract integration.
 */
export async function extractTextFromFile(
    fileUrl: string,
    mimeType: string
): Promise<{ text: string; method: string }> {
    // PDF: try to extract text from text layer
    if (mimeType === "application/pdf") {
        return extractTextFromPdf(fileUrl);
    }

    // Images: placeholder for future OCR
    if (mimeType.startsWith("image/")) {
        return {
            text: "",
            method: "image_ocr_pending",
        };
    }

    // Text files: fetch directly
    if (mimeType.startsWith("text/") || mimeType === "application/json") {
        try {
            const response = await fetch(fileUrl);
            const text = await response.text();
            return { text: text.slice(0, 50000), method: "direct_text" };
        } catch {
            return { text: "", method: "direct_text_failed" };
        }
    }

    return { text: "", method: "unsupported_type" };
}

/**
 * Extract text from PDF using pdf.js text content API.
 * Falls back gracefully if pdfjs is not available.
 */
async function extractTextFromPdf(
    fileUrl: string
): Promise<{ text: string; method: string }> {
    try {
        // Dynamic import of pdf.js (if available in project)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib = (window as any)["pdfjs-dist/build/pdf"] ??
            // @ts-expect-error — pdfjs-dist is optional; fallback to null
            await import("pdfjs-dist").catch(() => null);

        if (!pdfjsLib) {
            return { text: "", method: "pdfjs_not_available" };
        }

        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        const textParts: string[] = [];

        // Extract text from first 20 pages max
        const maxPages = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageText = content.items.map((item: any) => item.str).join(" ");
            textParts.push(pageText);
        }

        const fullText = textParts.join("\n\n").trim();
        return {
            text: fullText.slice(0, 50000), // Cap at 50KB
            method: fullText.length > 0 ? "pdfjs_text_layer" : "pdfjs_no_text",
        };
    } catch {
        return { text: "", method: "pdfjs_extraction_failed" };
    }
}

/**
 * Check if a file type supports OCR extraction.
 */
export function isOcrSupported(mimeType: string): boolean {
    return (
        mimeType === "application/pdf" ||
        mimeType.startsWith("image/") ||
        mimeType.startsWith("text/")
    );
}
