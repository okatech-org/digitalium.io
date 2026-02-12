// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Types: Documents (iDocument)
// ═══════════════════════════════════════════════

import { Id } from "../../convex/_generated/dataModel";

export type DocumentStatus = "draft" | "review" | "approved" | "archived";
export type DocumentPermission = "owner" | "editor" | "viewer";

export interface Document {
    _id: Id<"documents">;
    title: string;
    content: string;
    ownerId: string;
    organizationId?: string;
    status: DocumentStatus;
    collaborators: DocumentCollaborator[];
    tags: string[];
    version: number;
    createdAt: number;
    updatedAt: number;
}

export interface DocumentCollaborator {
    userId: string;
    permission: DocumentPermission;
    addedAt: number;
}

export interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    content: string;
    thumbnail?: string;
}
