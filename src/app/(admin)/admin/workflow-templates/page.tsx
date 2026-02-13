// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Redirect: Workflow Templates
// Redirigé vers Organisation > Workflows
// ═══════════════════════════════════════════════

import { redirect } from "next/navigation";

export default function WorkflowTemplatesRedirect() {
    redirect("/admin/organization/workflows");
}
