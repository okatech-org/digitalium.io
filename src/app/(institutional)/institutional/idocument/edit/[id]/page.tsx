// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /institutional/idocument/edit/[id]
// ═══════════════════════════════════════════════

"use client";

import EditorPage from "@/components/modules/idocument/EditorPage";

export default function DocumentEditPage({
    params,
}: {
    params: { id: string };
}) {
    return <EditorPage documentId={params.id} />;
}
