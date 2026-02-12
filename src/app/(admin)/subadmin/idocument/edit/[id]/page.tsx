// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /subadmin/idocument/edit/[id]
// ═══════════════════════════════════════════════

"use client";

import EditorPage from "@/components/modules/idocument/EditorPage";

export default function SubadminDocumentEditPage({
    params,
}: {
    params: { id: string };
}) {
    return <EditorPage documentId={params.id} />;
}
