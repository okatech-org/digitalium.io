// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /inst/idocument/edit
// Redirects to document list (editor requires ID)
// ═══════════════════════════════════════════════

import { redirect } from "next/navigation";

export default function EditIndexPage() {
    redirect("/inst/idocument");
}
