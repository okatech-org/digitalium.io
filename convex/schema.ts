import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Convex Schema
// 12 tables | RBAC 6-level | iDocument · iArchive · iSignature · iAsted
// ═══════════════════════════════════════════════════════════════════

// ─── Reusable validators ────────────────────────────────────────
const platformRole = v.union(
    v.literal("system_admin"),
    v.literal("platform_admin"),
    v.literal("org_admin"),
    v.literal("org_manager"),
    v.literal("org_member"),
    v.literal("org_viewer")
);

const personaType = v.union(
    v.literal("citizen"),
    v.literal("business"),
    v.literal("institutional")
);

const orgType = v.union(
    v.literal("enterprise"),
    v.literal("institution"),
    v.literal("government")
);

// ─── Schema ─────────────────────────────────────────────────────
export default defineSchema({
    // ═══════════════════════════════════════════
    // 1. USERS — Profils enrichis
    // ═══════════════════════════════════════════
    users: defineTable({
        userId: v.string(), // Firebase UID
        email: v.string(),
        displayName: v.string(),
        avatarUrl: v.optional(v.string()),
        personaType: v.optional(personaType),
        onboardingCompleted: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_email", ["email"])
        .index("by_personaType", ["personaType"]),

    // ═══════════════════════════════════════════
    // 2. ORGANIZATIONS
    // ═══════════════════════════════════════════
    organizations: defineTable({
        name: v.string(),
        type: orgType,
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        ownerId: v.string(), // ref users.userId
        quota: v.object({
            maxUsers: v.number(),
            maxStorage: v.number(), // bytes
            modules: v.array(v.string()),
        }),
        settings: v.object({
            theme: v.optional(v.string()),
            locale: v.string(),      // default: "fr-GA"
            currency: v.string(),    // default: "XAF"
        }),
        status: v.union(
            v.literal("active"),
            v.literal("trial"),
            v.literal("suspended")
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_ownerId", ["ownerId"])
        .index("by_type", ["type"])
        .index("by_status", ["status"]),

    // ═══════════════════════════════════════════
    // 3. ORGANIZATION MEMBERS
    // ═══════════════════════════════════════════
    organization_members: defineTable({
        organizationId: v.id("organizations"),
        userId: v.string(), // ref users.userId
        role: platformRole,
        level: v.number(),  // 0-5
        invitedBy: v.optional(v.string()),
        joinedAt: v.optional(v.number()),
        status: v.union(
            v.literal("active"),
            v.literal("invited"),
            v.literal("suspended")
        ),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_userId", ["userId"])
        .index("by_org_user", ["organizationId", "userId"])
        .index("by_org_role", ["organizationId", "role"]),

    // ═══════════════════════════════════════════
    // 4a. FOLDERS (iDocument — Dossiers)
    // ═══════════════════════════════════════════
    folders: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        createdBy: v.string(), // ref users.userId
        parentFolderId: v.optional(v.id("folders")),
        tags: v.array(v.string()), // e.g. ["fiscal", "social"]
        permissions: v.object({
            visibility: v.union(
                v.literal("private"),
                v.literal("shared"),
                v.literal("team")
            ),
            sharedWith: v.array(v.string()), // userIds
            teamIds: v.array(v.string()),
        }),
        archiveSchedule: v.optional(v.object({
            scheduledDate: v.number(), // timestamp
            targetCategory: v.string(), // slug of archive_category
            autoArchive: v.boolean(),
        })),
        isTemplate: v.boolean(),
        templateConfig: v.optional(v.object({
            defaultTags: v.array(v.string()),
            defaultPermissions: v.any(),
            subFolders: v.array(v.string()),
        })),
        status: v.union(v.literal("active"), v.literal("trashed")),
        fileCount: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_createdBy", ["createdBy"])
        .index("by_status", ["status"])
        .index("by_parentFolderId", ["parentFolderId"])
        .index("by_isTemplate", ["isTemplate"])
        .index("by_org_status", ["organizationId", "status"]),

    // ═══════════════════════════════════════════
    // 4b. DOCUMENTS (iDocument — Fichiers)
    // ═══════════════════════════════════════════
    documents: defineTable({
        title: v.string(),
        content: v.any(),   // JSON Tiptap
        excerpt: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        createdBy: v.string(),       // ref users.userId
        lastEditedBy: v.optional(v.string()),
        collaborators: v.array(v.string()), // userIds
        status: v.union(
            v.literal("draft"),
            v.literal("review"),
            v.literal("approved"),
            v.literal("archived")
        ),
        version: v.number(),
        tags: v.array(v.string()),
        parentFolderId: v.optional(v.string()),
        // Workflow fields
        workflowReason: v.optional(v.string()),   // approval/rejection comment
        workflowDeadline: v.optional(v.number()),  // deadline timestamp
        workflowAssignee: v.optional(v.string()),  // next approver userId
        sourceDocumentId: v.optional(v.string()),  // link back from archive
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_createdBy", ["createdBy"])
        .index("by_status", ["status"])
        .index("by_org_status", ["organizationId", "status"]),

    // ═══════════════════════════════════════════
    // 5. DOCUMENT VERSIONS (historique)
    // ═══════════════════════════════════════════
    document_versions: defineTable({
        documentId: v.id("documents"),
        version: v.number(),
        content: v.any(),   // JSON snapshot
        editedBy: v.string(),
        changeDescription: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_documentId", ["documentId"])
        .index("by_doc_version", ["documentId", "version"]),

    // ═══════════════════════════════════════════
    // 5b. DOCUMENT COMMENTS
    // ═══════════════════════════════════════════
    document_comments: defineTable({
        documentId: v.id("documents"),
        userId: v.string(),
        userName: v.string(),
        text: v.string(),
        selection: v.optional(v.any()), // JSON: { from, to } anchor positions
        resolved: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_documentId", ["documentId"]),

    // ═══════════════════════════════════════════
    // 6a. ARCHIVE CATEGORIES (iArchive — Catégories gérées)
    // ═══════════════════════════════════════════
    archive_categories: defineTable({
        name: v.string(),
        slug: v.string(), // e.g. "fiscal", "social", "juridique"
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        color: v.string(), // tailwind color: "amber", "blue", "emerald", "violet"
        icon: v.string(), // lucide icon name: "Landmark", "Briefcase", "Scale"
        retentionYears: v.number(), // default retention in years
        defaultConfidentiality: v.union(
            v.literal("public"),
            v.literal("internal"),
            v.literal("confidential"),
            v.literal("secret")
        ),
        isFixed: v.boolean(), // true for Coffre-Fort (non-deletable)
        isActive: v.boolean(),
        sortOrder: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_slug", ["slug"])
        .index("by_isActive", ["isActive"])
        .index("by_sortOrder", ["sortOrder"]),

    // ═══════════════════════════════════════════
    // 6b. ARCHIVES (iArchive — Fichiers archivés)
    // ═══════════════════════════════════════════
    archives: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id("archive_categories")),
        categorySlug: v.string(), // denormalized for quick filter
        organizationId: v.optional(v.id("organizations")),
        uploadedBy: v.string(), // ref users.userId
        folderId: v.optional(v.id("folders")), // source folder from iDocument
        fileUrl: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        sha256Hash: v.string(),
        retentionYears: v.number(),
        retentionExpiresAt: v.number(), // timestamp
        status: v.union(
            v.literal("active"),
            v.literal("expired"),
            v.literal("on_hold"),
            v.literal("destroyed")
        ),
        metadata: v.object({
            ocrText: v.optional(v.string()),
            extractedData: v.optional(v.any()),
            confidentiality: v.optional(
                v.union(
                    v.literal("public"),
                    v.literal("internal"),
                    v.literal("confidential"),
                    v.literal("secret")
                )
            ),
        }),
        isVault: v.boolean(), // true if stored in coffre-fort
        vaultFolderId: v.optional(v.id("folders")), // sub-folder in vault
        certificateId: v.optional(v.id("archive_certificates")),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_uploadedBy", ["uploadedBy"])
        .index("by_status", ["status"])
        .index("by_categorySlug", ["categorySlug"])
        .index("by_categoryId", ["categoryId"])
        .index("by_sha256Hash", ["sha256Hash"])
        .index("by_isVault", ["isVault"])
        .index("by_org_category", ["organizationId", "categorySlug"]),

    // ═══════════════════════════════════════════
    // 7. ARCHIVE CERTIFICATES
    // ═══════════════════════════════════════════
    archive_certificates: defineTable({
        archiveId: v.id("archives"),
        certificateNumber: v.string(), // unique
        sha256Hash: v.string(),
        issuedAt: v.number(),
        issuedBy: v.string(),
        validUntil: v.number(),
        status: v.union(
            v.literal("valid"),
            v.literal("revoked")
        ),
    })
        .index("by_archiveId", ["archiveId"])
        .index("by_certificateNumber", ["certificateNumber"]),

    // ═══════════════════════════════════════════
    // 8. SIGNATURES (iSignature)
    // ═══════════════════════════════════════════
    signatures: defineTable({
        documentId: v.optional(v.id("documents")),
        archiveId: v.optional(v.id("archives")),
        organizationId: v.optional(v.id("organizations")),
        requestedBy: v.string(), // ref users.userId
        signers: v.array(
            v.object({
                userId: v.optional(v.string()),
                email: v.string(),
                status: v.union(
                    v.literal("pending"),
                    v.literal("signed"),
                    v.literal("declined")
                ),
                signedAt: v.optional(v.number()),
            })
        ),
        workflowId: v.optional(v.id("signature_workflows")),
        status: v.union(
            v.literal("pending"),
            v.literal("in_progress"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
        dueDate: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_documentId", ["documentId"])
        .index("by_archiveId", ["archiveId"])
        .index("by_organizationId", ["organizationId"])
        .index("by_requestedBy", ["requestedBy"])
        .index("by_status", ["status"]),

    // ═══════════════════════════════════════════
    // 9. SIGNATURE WORKFLOWS
    // ═══════════════════════════════════════════
    signature_workflows: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        steps: v.array(
            v.object({
                order: v.number(),
                signerId: v.optional(v.string()),
                role: v.optional(v.string()),
                required: v.boolean(),
            })
        ),
        createdBy: v.string(),
        isTemplate: v.boolean(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_createdBy", ["createdBy"]),

    // ═══════════════════════════════════════════
    // 10. AUDIT LOGS
    // ═══════════════════════════════════════════
    audit_logs: defineTable({
        organizationId: v.optional(v.id("organizations")),
        userId: v.string(),
        action: v.string(), // e.g. 'document.create', 'archive.upload'
        resourceType: v.union(
            v.literal("document"),
            v.literal("archive"),
            v.literal("signature"),
            v.literal("organization"),
            v.literal("user")
        ),
        resourceId: v.string(),
        details: v.optional(v.any()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_userId", ["userId"])
        .index("by_createdAt", ["createdAt"])
        .index("by_action", ["action"])
        .index("by_resourceType", ["resourceType", "resourceId"]),

    // ═══════════════════════════════════════════
    // 11. SUBSCRIPTIONS (facturation SaaS)
    // ═══════════════════════════════════════════
    subscriptions: defineTable({
        organizationId: v.id("organizations"),
        plan: v.union(
            v.literal("starter"),
            v.literal("pro"),
            v.literal("enterprise")
        ),
        pricePerUser: v.number(), // XAF
        activeUsers: v.number(),
        maxUsers: v.number(),
        modules: v.object({
            iDocument: v.boolean(),
            iArchive: v.boolean(),
            iSignature: v.boolean(),
            iAsted: v.boolean(),
        }),
        billingCycle: v.union(
            v.literal("monthly"),
            v.literal("annual")
        ),
        paymentMethod: v.union(
            v.literal("mobile_money"),
            v.literal("bank_transfer"),
            v.literal("card")
        ),
        status: v.union(
            v.literal("trial"),
            v.literal("active"),
            v.literal("past_due"),
            v.literal("cancelled")
        ),
        currentPeriodStart: v.number(),
        currentPeriodEnd: v.number(),
        trialEndsAt: v.optional(v.number()),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_status", ["status"])
        .index("by_plan", ["plan"]),

    // ═══════════════════════════════════════════
    // 12. iASTED CONVERSATIONS
    // ═══════════════════════════════════════════
    iasted_conversations: defineTable({
        organizationId: v.optional(v.id("organizations")),
        userId: v.string(),
        messages: v.array(
            v.object({
                role: v.union(v.literal("user"), v.literal("assistant")),
                content: v.string(),
                timestamp: v.number(),
                context: v.optional(
                    v.object({
                        module: v.optional(v.string()),
                        documentId: v.optional(v.string()),
                    })
                ),
            })
        ),
        title: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_organizationId", ["organizationId"]),

    // ═══════════════════════════════════════════
    // 13. INVOICES (facturation détaillée)
    // ═══════════════════════════════════════════
    invoices: defineTable({
        organizationId: v.id("organizations"),
        invoiceNumber: v.string(),
        amount: v.number(),
        currency: v.string(),
        status: v.union(
            v.literal("paid"),
            v.literal("pending"),
            v.literal("failed"),
            v.literal("cancelled")
        ),
        paymentMethod: v.union(
            v.literal("mobile_money"),
            v.literal("bank_transfer"),
            v.literal("card")
        ),
        paymentDetails: v.optional(v.any()),
        periodStart: v.number(),
        periodEnd: v.number(),
        paidAt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_status", ["status"])
        .index("by_invoiceNumber", ["invoiceNumber"]),

    // ═══════════════════════════════════════════
    // 14. LEADS (prospects)
    // ═══════════════════════════════════════════
    leads: defineTable({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        subject: v.optional(v.string()),
        message: v.optional(v.string()),
        source: v.union(
            v.literal("website"),
            v.literal("referral"),
            v.literal("event"),
            v.literal("other")
        ),
        status: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("qualified"),
            v.literal("converted"),
            v.literal("lost")
        ),
        assignedTo: v.optional(v.string()),
        notes: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_email", ["email"])
        .index("by_source", ["source"])
        .index("by_createdAt", ["createdAt"]),
});
