// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /inst/idocument
// Uses shared DocumentListPage component
// ═══════════════════════════════════════════════

"use client";

import DocumentListPage from "@/components/modules/idocument/DocumentListPage";

export default function IDocumentPage() {
    return <DocumentListPage basePath="/inst/idocument" />;
}
