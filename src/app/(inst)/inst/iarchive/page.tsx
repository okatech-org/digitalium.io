// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Route: /inst/iarchive
// Uses shared ArchiveListPage component
// ═══════════════════════════════════════════════

"use client";

import ArchiveListPage from "@/components/modules/iarchive/ArchiveListPage";

export default function IArchivePage() {
    return <ArchiveListPage basePath="/inst/iarchive" />;
}
