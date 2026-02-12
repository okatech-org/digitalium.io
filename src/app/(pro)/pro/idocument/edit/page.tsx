// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /pro/idocument/edit
// Redirects to document list (editor requires ID)
// ═══════════════════════════════════════════════

import { redirect } from "next/navigation";

export default function EditIndexPage() {
    redirect("/pro/idocument");
}
