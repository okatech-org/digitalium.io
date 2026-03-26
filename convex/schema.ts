import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════════
// DIGITALIUM.IO — Convex Schema
// 22 tables | RBAC 6-level | iDocument · iArchive · iSignature · iAsted
// v2: org_sites, org_units, business_roles, filing_structures,
//     filing_cells, cell_access_rules, cell_access_overrides
// ═══════════════════════════════════════════════════════════════════

// ─── Reusable validators ────────────────────────────────────────
const platformRole = v.union(
    v.literal("system_admin"),
    v.literal("platform_admin"),
    v.literal("org_admin"),
    v.literal("org_manager"),
    v.literal("org_member"),
    v.literal("admin"),
    v.literal("membre"),
    v.literal("viewer")
);

const personaType = v.union(
    v.literal("citizen"),
    v.literal("business"),
    v.literal("institutional")
);

const orgType = v.union(
    v.literal("enterprise"),
    v.literal("institution"),
    v.literal("government"),
    v.literal("organism")
);

const orgStatus = v.union(
    v.literal("brouillon"),
    v.literal("prete"),
    v.literal("active"),
    v.literal("trial"),
    v.literal("suspended"),
    v.literal("resiliee")
);

const siteType = v.union(
    v.literal("siege"),
    v.literal("filiale"),
    v.literal("agence"),
    v.literal("bureau_regional"),
    v.literal("antenne")
);

const orgUnitType = v.union(
    v.literal("presidence"),
    v.literal("direction_generale"),
    v.literal("direction"),
    v.literal("sous_direction"),
    v.literal("departement"),
    v.literal("service"),
    v.literal("bureau"),
    v.literal("unite"),
    v.literal("cellule")
);

const accessLevel = v.union(
    v.literal("aucun"),
    v.literal("lecture"),
    v.literal("ecriture"),
    v.literal("gestion"),
    v.literal("admin")
);

const confidentialityLevel = v.union(
    v.literal("public"),
    v.literal("restreint"),
    v.literal("confidentiel")
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

    // ── User Preferences (Settings page) ──
    user_preferences: defineTable({
        userId: v.string(), // Firebase UID — one row per user
        // Profil
        prenom: v.optional(v.string()),
        nom: v.optional(v.string()),
        telephone: v.optional(v.string()),
        bio: v.optional(v.string()),
        // Design System
        theme: v.optional(v.string()),
        densite: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        borderRadius: v.optional(v.string()),
        brandName: v.optional(v.string()),
        brandColors: v.optional(v.any()),
        // Langue
        langue: v.optional(v.string()),
        // Notifications
        notifications: v.optional(v.any()),
        // Accessibilité
        tailleTexte: v.optional(v.string()),
        contrasteEleve: v.optional(v.boolean()),
        animationsReduites: v.optional(v.boolean()),
        // Timestamps
        updatedAt: v.number(),
    })
        .index("by_userId", ["userId"]),

    // ═══════════════════════════════════════════
    // 2. ORGANIZATIONS
    // ═══════════════════════════════════════════
    organizations: defineTable({
        name: v.string(),
        subdomain: v.optional(v.string()), // top-level indexable field synced with hosting.domain
        type: orgType,
        sector: v.optional(v.string()),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        ownerId: v.string(), // ref users.userId
        // ── Identité étendue (v2) ──
        rccm: v.optional(v.string()),
        nif: v.optional(v.string()),
        contact: v.optional(v.string()),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        adresse: v.optional(v.string()),
        ville: v.optional(v.string()),
        pays: v.optional(v.string()),
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
        // ── Hébergement (v2) ──
        hosting: v.optional(v.object({
            type: v.union(
                v.literal("cloud"),
                v.literal("datacenter"),
                v.literal("local")
            ),
            types: v.optional(v.array(v.union(
                v.literal("cloud"),
                v.literal("datacenter"),
                v.literal("local")
            ))),
            domain: v.optional(v.string()),
            pagePublique: v.optional(v.boolean()),
        })),
        // ── Configuration page publique (v2) ──
        publicPageConfig: v.optional(v.object({
            template: v.optional(v.union(
                v.literal("corporate"),
                v.literal("startup"),
                v.literal("institution")
            )),
            heroTitle: v.optional(v.string()),
            heroSubtitle: v.optional(v.string()),
            description: v.optional(v.string()),
            primaryColor: v.optional(v.string()),
            accentColor: v.optional(v.string()),
            ctaText: v.optional(v.string()),
            ctaLink: v.optional(v.string()),
            showModules: v.optional(v.boolean()),
            showContact: v.optional(v.boolean()),
            customCss: v.optional(v.string()),
        })),
        // ── Universal org config — workflows, processes, automations ──
        config: v.optional(v.any()),
        // ── Progression configuration (v2) ──
        configProgress: v.optional(v.object({
            profilComplete: v.boolean(),
            structureOrgComplete: v.boolean(),
            structureClassementComplete: v.boolean(),
            modulesConfigComplete: v.boolean(),
            automationConfigComplete: v.boolean(),
            deploymentConfigComplete: v.boolean(),
        })),
        // ── Essai (trial) ──
        trialDuration: v.optional(v.number()),  // days
        trialEndsAt: v.optional(v.number()),    // timestamp
        status: orgStatus,
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_ownerId", ["ownerId"])
        .index("by_type", ["type"])
        .index("by_status", ["status"])
        .index("by_subdomain", ["subdomain"]),

    // ═══════════════════════════════════════════
    // 3. ORGANIZATION MEMBERS
    // ═══════════════════════════════════════════
    organization_members: defineTable({
        organizationId: v.id("organizations"),
        userId: v.string(), // ref users.userId
        role: platformRole,
        estAdmin: v.optional(v.boolean()), // Désignation manuelle d'administrateur
        level: v.number(),  // 0-5 — dérivé automatiquement du rôle métier
        invitedBy: v.optional(v.string()),
        joinedAt: v.optional(v.number()),
        status: v.union(
            v.literal("active"),
            v.literal("invited"),
            v.literal("suspended"),
            v.literal("departed")
        ),
        // ── v2: Structure organisationnelle ──
        orgUnitId: v.optional(v.id("org_units")),
        businessRoleId: v.optional(v.id("business_roles")),
        nom: v.optional(v.string()),
        email: v.optional(v.string()),
        telephone: v.optional(v.string()),
        poste: v.optional(v.string()),
        // ── v3: Multi-postes (affectations multiples) ──
        assignments: v.optional(v.array(v.object({
            businessRoleId: v.id("business_roles"),
            orgUnitId: v.id("org_units"),
            isPrimary: v.boolean(),
            startDate: v.optional(v.number()),
            endDate: v.optional(v.number()),
        }))),
        // ── v3: Override des permissions modules (exceptions individuelles) ──
        moduleOverrides: v.optional(v.object({
            dashboard: v.optional(v.boolean()),
            idocument: v.optional(v.boolean()),
            iarchive: v.optional(v.boolean()),
            isignature: v.optional(v.boolean()),
            formation: v.optional(v.boolean()),
            clients: v.optional(v.boolean()),
            leads: v.optional(v.boolean()),
            organisation: v.optional(v.boolean()),
            equipe: v.optional(v.boolean()),
            abonnements: v.optional(v.boolean()),
            parametres: v.optional(v.boolean()),
        })),
        // ── v4: Départ / archivage de membre ──
        departedAt: v.optional(v.number()),
        departureReason: v.optional(v.string()),
        replacedById: v.optional(v.id("organization_members")),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_userId", ["userId"])
        .index("by_org_user", ["organizationId", "userId"])
        .index("by_org_role", ["organizationId", "role"])
        .index("by_orgUnitId", ["orgUnitId"])
        .index("by_businessRoleId", ["businessRoleId"])
        .index("by_org_status", ["organizationId", "status"]),





    // ═══════════════════════════════════════════
    // 4a. FOLDERS (iDocument — Dossiers)
    // ═══════════════════════════════════════════
    folders: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        createdBy: v.string(), // ref users.userId
        parentFolderId: v.optional(v.id("folders")),
        filingCellId: v.optional(v.id("filing_cells")), // Link to admin structure
        isSystem: v.optional(v.boolean()), // True if synced from filing_cells
        tags: v.array(v.string()), // e.g. ["fiscal", "social"]
        folderTypeId: v.optional(v.id("document_types")), // Type de dossier (v7)
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
        .index("by_filingCellId", ["filingCellId"])
        .index("by_org_status", ["organizationId", "status"]),

    // ═══════════════════════════════════════════
    // 4a-bis. FOLDER ARCHIVE METADATA (Tagging avancé — Phase 15)
    // ═══════════════════════════════════════════
    folder_archive_metadata: defineTable({
        folderId: v.id("folders"),
        organizationId: v.id("organizations"),
        archiveCategoryId: v.id("archive_categories"),
        archiveCategorySlug: v.string(),
        countingStartEvent: v.string(),  // date_creation | date_cloture | date_tag | date_gel | date_manuelle
        confidentiality: v.string(),     // public | internal | confidential | secret
        inheritToChildren: v.boolean(),  // Sous-dossiers héritent ?
        inheritToDocuments: v.boolean(), // Documents enfants héritent ?
        taggedAt: v.number(),
        taggedBy: v.string(),            // userId
        // ── Lifecycle tracking (v6) ──
        manualDate: v.optional(v.number()),          // Timestamp si countingStartEvent === "date_manuelle"
        countingStartDate: v.optional(v.number()),   // Date résolue de début de comptage
        lifecycleStartedAt: v.optional(v.number()),  // Timestamp effectif du début du cycle
    })
        .index("by_folderId", ["folderId"])
        .index("by_organizationId", ["organizationId"])
        .index("by_archiveCategoryId", ["archiveCategoryId"]),

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
            v.literal("archived"),
            v.literal("trashed")
        ),
        version: v.number(),
        tags: v.array(v.string()),
        documentTypeId: v.optional(v.id("document_types")),    // Type de document obligatoire (v7)
        customMetadata: v.optional(v.any()),                    // Métadonnées personnalisées (v7)
        parentFolderId: v.optional(v.string()),
        // ── Imported file storage (v4) ──
        folderId: v.optional(v.id("folders")),               // Lien structurel vers le dossier parent
        storageId: v.optional(v.id("_storage")),             // Convex File Storage ID
        fileUrl: v.optional(v.string()),                     // URL de téléchargement
        fileName: v.optional(v.string()),                    // Nom du fichier original
        fileSize: v.optional(v.number()),                    // Taille en bytes
        mimeType: v.optional(v.string()),                    // Type MIME du fichier
        // Workflow fields
        workflowReason: v.optional(v.string()),   // approval/rejection comment
        workflowDeadline: v.optional(v.number()),  // deadline timestamp
        workflowAssignee: v.optional(v.string()),  // next approver userId
        sourceDocumentId: v.optional(v.string()),  // link back from archive
        // ── Trash fields (v5) ──
        trashedAt: v.optional(v.number()),                   // Timestamp mise en corbeille
        trashedBy: v.optional(v.string()),                   // Qui a supprimé
        previousStatus: v.optional(v.string()),              // Statut avant suppression (pour restore)
        // ── Sharing fields (v5) ──
        sharedWith: v.optional(v.array(v.object({
            userId: v.string(),
            permission: v.union(v.literal("read"), v.literal("edit"), v.literal("comment")),
            sharedAt: v.number(),
            sharedBy: v.string(),
        }))),
        // ── Archive link fields (v3) ──
        archiveId: v.optional(v.id("archives")),             // Lien vers l'archive créée
        archivedAt: v.optional(v.number()),                  // Timestamp d'archivage
        archiveCategorySlug: v.optional(v.string()),         // Slug catégorie pour affichage rapide
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_createdBy", ["createdBy"])
        .index("by_status", ["status"])
        .index("by_org_status", ["organizationId", "status"])
        .index("by_parentFolderId", ["parentFolderId"])
        .index("by_folderId", ["folderId"]),

    // ═══════════════════════════════════════════
    // 4c. DOCUMENT TYPES (v7 — types de documents préconfigurés)
    // ═══════════════════════════════════════════
    document_types: defineTable({
        organizationId: v.id("organizations"),
        nom: v.string(),
        code: v.string(),
        description: v.optional(v.string()),
        icone: v.optional(v.string()),
        couleur: v.optional(v.string()),
        retentionCategorySlug: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_code", ["organizationId", "code"])
        .index("by_org_actif", ["organizationId", "estActif"]),

    // ═══════════════════════════════════════════
    // 4d. DOCUMENT METADATA FIELDS (v7 — métadonnées personnalisables)
    // ═══════════════════════════════════════════
    document_metadata_fields: defineTable({
        organizationId: v.id("organizations"),
        fieldName: v.string(),
        fieldLabel: v.string(),
        fieldType: v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("date"),
            v.literal("select"),
            v.literal("boolean")
        ),
        options: v.optional(v.array(v.string())),
        isRequired: v.boolean(),
        defaultValue: v.optional(v.string()),
        ordre: v.number(),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_actif", ["organizationId", "estActif"]),

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
        retentionYears: v.number(), // durée totale de conservation en années
        // ── Lifecycle phases (v2) ──
        ohadaReference: v.optional(v.string()),           // ex: "OHADA: 10 ans min. — Acte Uniforme Comptable Art. 24"
        countingStartEvent: v.optional(v.string()),       // "date_tag"|"date_gel"|"date_creation"|"date_cloture"
        activeDurationYears: v.optional(v.number()),      // durée phase active en années
        semiActiveDurationYears: v.optional(v.number()),  // durée phase semi-active (null = pas de semi-actif)
        alertBeforeArchiveMonths: v.optional(v.number()), // délai d'alerte pré-archivage en mois
        hasSemiActivePhase: v.optional(v.boolean()),      // true si phase semi-active activée
        isPerpetual: v.optional(v.boolean()),              // true pour le Coffre-Fort
        autoDestroy: v.optional(v.boolean()),              // true = destruction auto à l'expiration. Défaut: false
        // ── Déclassement scope (v5) ──
        declassificationScope: v.optional(v.union(
            v.literal("document"),   // Chaque document a son propre cycle indépendant
            v.literal("folder"),     // Le dossier entier avance comme une unité
            v.literal("hybrid")     // Dossier + exceptions par document
        )),
        // ── Permissions par phase de cycle de vie (v5) ──
        phasePermissions: v.optional(v.object({
            active: v.object({ read: v.string(), write: v.string(), delete: v.string() }),
            semiActive: v.object({ read: v.string(), write: v.string(), delete: v.string() }),
            archived: v.object({ read: v.string(), write: v.string(), delete: v.string() }),
        })),
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
        .index("by_sortOrder", ["sortOrder"])
        .index("by_organizationId_slug", ["organizationId", "slug"]),

    // ═══════════════════════════════════════════
    // 6b. ARCHIVES (iArchive — Fichiers archivés)
    // ═══════════════════════════════════════════
    archives: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id("archive_categories")),
        categorySlug: v.string(), // denormalized for quick filter
        category: v.optional(v.string()), // LEGACY field from old seed — kept for compat
        organizationId: v.optional(v.id("organizations")),
        uploadedBy: v.string(), // ref users.userId
        folderId: v.optional(v.id("folders")), // source folder from iDocument
        fileUrl: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        sha256Hash: v.string(),
        retentionYears: v.number(),
        retentionExpiresAt: v.number(), // timestamp fin de conservation
        status: v.union(
            v.literal("active"),
            v.literal("semi_active"),
            v.literal("archived"),
            v.literal("expired"),
            v.literal("on_hold"),
            v.literal("destroyed")
        ),
        // ── Traçabilité source (v3) ──
        sourceDocumentId: v.optional(v.id("documents")),   // Lien vers le document source
        sourceFolderId: v.optional(v.id("folders")),       // Lien vers le dossier source
        sourceType: v.optional(v.union(
            v.literal("manual_upload"),
            v.literal("document_archive"),
            v.literal("folder_archive"),
            v.literal("auto_archive")
        )),
        tags: v.optional(v.array(v.string())),             // Tags libres
        archivedBy: v.optional(v.string()),                // userId de l'archiveur
        // ── Double hash SHA-256 (v3 — contenu TipTap) ──
        frozenContent: v.optional(v.any()),                 // Snapshot JSON du contenu TipTap gelé
        contentHash: v.optional(v.string()),                // SHA-256 du JSON gelé (intégrité interne)
        pdfUrl: v.optional(v.string()),                     // URL du PDF généré (Convex File Storage)
        pdfHash: v.optional(v.string()),                    // SHA-256 du PDF (intégrité légale)
        // ── Lifecycle tracking (v2) ──
        lifecycleState: v.optional(v.union(
            v.literal("active"),
            v.literal("semi_active"),
            v.literal("archived"),
            v.literal("destroyed")
        )),
        countingStartDate: v.optional(v.number()),    // timestamp début comptage
        triggerEvent: v.optional(v.string()),          // événement déclencheur
        activeUntil: v.optional(v.number()),           // fin phase active
        semiActiveUntil: v.optional(v.number()),       // fin phase semi-active
        stateChangedAt: v.optional(v.number()),        // dernier changement d'état
        // ── Gel juridique (v6) ──
        legalHoldAppliedAt: v.optional(v.number()),       // Timestamp d'application du gel
        legalHoldReason: v.optional(v.string()),          // Motif du gel (litige, audit, etc.)
        legalHoldAppliedBy: v.optional(v.string()),       // userId qui a appliqué le gel
        legalHoldReleasedAt: v.optional(v.number()),      // Timestamp de levée du gel
        previousStatusBeforeHold: v.optional(v.string()), // Status avant le gel (pour restauration)
        // ── Date réelle de création (v5) ──
        originalCreationDate: v.optional(v.number()),  // Date réelle de création du document (pas d'import)
        originalCreationYear: v.optional(v.number()),  // Année extraite pour calcul de rétention
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
        .index("by_org_category", ["organizationId", "categorySlug"])
        .index("by_lifecycleState", ["lifecycleState"])
        .index("by_sourceDocumentId", ["sourceDocumentId"])
        .index("by_sourceType", ["sourceType"]),

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
    // 7a-bis. DESTRUCTION CERTIFICATES (iArchive — Certificats de destruction)
    // ═══════════════════════════════════════════
    destruction_certificates: defineTable({
        // ── Référence ──
        certificateNumber: v.string(),                    // DEST-YYYY-NNNNN (unique)
        archiveId: v.id("archives"),
        organizationId: v.id("organizations"),
        // ── Informations du document détruit ──
        documentTitle: v.string(),
        documentCategory: v.string(),                     // Nom de la catégorie
        documentCategorySlug: v.string(),                 // Slug de la catégorie
        originalFileName: v.string(),
        originalFileSize: v.number(),
        originalMimeType: v.string(),
        originalSha256Hash: v.string(),                   // Hash du fichier original
        originalContentHash: v.optional(v.string()),      // Hash JSON TipTap (si document_archive)
        originalPdfHash: v.optional(v.string()),          // Hash PDF (si document_archive)
        originalCreatedAt: v.number(),
        originalArchivedAt: v.number(),
        // ── Rétention ──
        retentionYears: v.number(),
        retentionExpiresAt: v.number(),
        ohadaReference: v.optional(v.string()),           // Réf OHADA applicable
        ohadaCompliant: v.boolean(),                      // true si destruction après expiration complète
        // ── Destruction ──
        destroyedAt: v.number(),
        destroyedBy: v.string(),                          // userId
        destructionMethod: v.union(
            v.literal("legal_expiry"),                    // Fin de rétention légale
            v.literal("manual_request"),                  // Demande admin anticipée
            v.literal("compliance")                       // Décision DPO/compliance
        ),
        destructionReason: v.string(),                    // Description libre
        // ── Validation ──
        approvedBy: v.optional(v.string()),               // userId du validateur
        approvedAt: v.optional(v.number()),
        // ── Témoins (conformité renforcée) ──
        witnesses: v.optional(v.array(v.object({
            userId: v.string(),
            name: v.string(),
            role: v.string(),
            acknowledgedAt: v.number(),
        }))),
        // ── Métadonnées certificat ──
        status: v.union(v.literal("valid"), v.literal("revoked")),
        issuedAt: v.number(),
    })
        .index("by_certificateNumber", ["certificateNumber"])
        .index("by_organizationId", ["organizationId"])
        .index("by_archiveId", ["archiveId"]),

    // ═══════════════════════════════════════════
    // 7b. RETENTION ALERTS (iArchive — Alertes configurables)
    // ═══════════════════════════════════════════
    retention_alerts: defineTable({
        categoryId: v.id("archive_categories"),
        organizationId: v.id("organizations"),
        alertType: v.union(
            v.literal("pre_archive"),
            v.literal("pre_deletion")
        ),
        value: v.number(),          // ex: 3
        unit: v.union(
            v.literal("months"),
            v.literal("weeks"),
            v.literal("days"),
            v.literal("hours")
        ),
        label: v.string(),          // ex: "3 mois avant archivage"
        createdAt: v.number(),
    })
        .index("by_categoryId", ["categoryId"])
        .index("by_organizationId", ["organizationId"])
        .index("by_type", ["alertType"]),

    // ═══════════════════════════════════════════
    // 7c. ALERT LOGS (iArchive — Journal des alertes envoyées)
    // ═══════════════════════════════════════════
    alert_logs: defineTable({
        archiveId: v.id("archives"),
        alertId: v.id("retention_alerts"),
        organizationId: v.id("organizations"),
        sentAt: v.number(),
        notificationType: v.union(
            v.literal("email"),
            v.literal("in_app"),
            v.literal("both")
        ),
        recipientId: v.string(),    // ref users.userId
        status: v.union(
            v.literal("sent"),
            v.literal("read"),
            v.literal("acknowledged")
        ),
    })
        .index("by_archiveId", ["archiveId"])
        .index("by_alertId", ["alertId"])
        .index("by_organizationId", ["organizationId"])
        .index("by_archive_alert", ["archiveId", "alertId"]),

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
            v.literal("folder"),
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
            v.literal("card"),
            v.literal("check"),
            v.literal("simulation")
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
            v.literal("card"),
            v.literal("check"),
            v.literal("simulation")
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
    // 14. ORG SITES (v2 — sites physiques)
    // ═══════════════════════════════════════════
    org_sites: defineTable({
        organizationId: v.id("organizations"),
        nom: v.string(),
        type: siteType,
        adresse: v.string(),
        ville: v.string(),
        pays: v.string(),
        telephone: v.optional(v.string()),
        email: v.optional(v.string()),
        estSiege: v.boolean(),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_siege", ["organizationId", "estSiege"]),

    // ═══════════════════════════════════════════
    // 15. ORG UNITS (v2 — unités organisationnelles)
    // ═══════════════════════════════════════════
    org_units: defineTable({
        organizationId: v.id("organizations"),
        siteId: v.optional(v.id("org_sites")),
        nom: v.string(),
        type: orgUnitType,
        parentId: v.optional(v.id("org_units")),
        responsable: v.optional(v.string()),
        description: v.optional(v.string()),
        couleur: v.string(),
        ordre: v.number(),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_parentId", ["parentId"])
        .index("by_siteId", ["siteId"])
        .index("by_org_parent", ["organizationId", "parentId"]),

    // ═══════════════════════════════════════════
    // 16. BUSINESS ROLES (v2 — rôles métier)
    // ═══════════════════════════════════════════
    business_roles: defineTable({
        organizationId: v.id("organizations"),
        orgUnitType: v.optional(orgUnitType),
        nom: v.string(),
        description: v.optional(v.string()),
        categorie: v.optional(v.string()),
        niveau: v.optional(v.number()),
        couleur: v.optional(v.string()),
        icone: v.optional(v.string()),
        // Module permissions — hérité par tous les collaborateurs avec ce rôle
        modulePermissions: v.optional(v.object({
            // Modules Métier (par défaut: tous)
            dashboard: v.optional(v.boolean()),
            idocument: v.optional(v.boolean()),
            iarchive: v.optional(v.boolean()),
            isignature: v.optional(v.boolean()),
            iasted: v.optional(v.boolean()),
            formation: v.optional(v.boolean()),
            // Commercial (par défaut: admin seulement)
            clients: v.optional(v.boolean()),
            leads: v.optional(v.boolean()),
            // Organisation (par défaut: admin seulement)
            organisation: v.optional(v.boolean()),
            equipe: v.optional(v.boolean()),
            // Administration (par défaut: admin seulement)
            abonnements: v.optional(v.boolean()),
            parametres: v.optional(v.boolean()),
        })),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_unitType", ["organizationId", "orgUnitType"])
        .index("by_org_categorie", ["organizationId", "categorie"]),

    // ═══════════════════════════════════════════
    // 17. FILING STRUCTURES (v2 — modèles de classement)
    // ═══════════════════════════════════════════
    filing_structures: defineTable({
        organizationId: v.id("organizations"),
        nom: v.string(),
        description: v.optional(v.string()),
        type: v.union(v.literal("standard"), v.literal("custom")),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_actif", ["organizationId", "estActif"]),

    // ═══════════════════════════════════════════
    // 18. FILING CELLS (v2 — cellules de classement)
    // ═══════════════════════════════════════════
    filing_cells: defineTable({
        filingStructureId: v.id("filing_structures"),
        organizationId: v.id("organizations"),
        code: v.string(),
        intitule: v.string(),
        parentId: v.optional(v.id("filing_cells")),
        niveau: v.number(),
        description: v.optional(v.string()),
        accessDefaut: confidentialityLevel,
        moduleId: v.optional(v.string()),
        icone: v.optional(v.string()),
        couleur: v.optional(v.string()),
        tags: v.array(v.string()),
        ordre: v.number(),
        // v8: Lien vers catégorie de rétention (héritage politique d'archivage)
        retentionCategoryId: v.optional(v.id("archive_categories")),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_filingStructureId", ["filingStructureId"])
        .index("by_organizationId", ["organizationId"])
        .index("by_parentId", ["parentId"])
        .index("by_org_parent", ["organizationId", "parentId"]),

    // ═══════════════════════════════════════════
    // 19. CELL ACCESS RULES (v2 — matrice d'accès)
    // ═══════════════════════════════════════════
    cell_access_rules: defineTable({
        organizationId: v.id("organizations"),
        filingCellId: v.id("filing_cells"),
        orgUnitId: v.optional(v.id("org_units")),
        businessRoleId: v.optional(v.id("business_roles")),
        groupId: v.optional(v.id("permission_groups")),  // Groupe de permissions (v7)
        acces: accessLevel,
        priorite: v.number(),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_filingCellId", ["filingCellId"])
        .index("by_orgUnitId", ["orgUnitId"])
        .index("by_businessRoleId", ["businessRoleId"])
        .index("by_cell_unit", ["filingCellId", "orgUnitId"])
        .index("by_cell_role", ["filingCellId", "businessRoleId"])
        .index("by_groupId", ["groupId"]),

    // ═══════════════════════════════════════════
    // 20. CELL ACCESS OVERRIDES (v2 — habilitations individuelles)
    // ═══════════════════════════════════════════
    cell_access_overrides: defineTable({
        organizationId: v.id("organizations"),
        filingCellId: v.id("filing_cells"),
        userId: v.string(),
        acces: accessLevel,
        motif: v.optional(v.string()),
        accordePar: v.string(),
        dateExpiration: v.optional(v.number()),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_filingCellId", ["filingCellId"])
        .index("by_userId", ["userId"])
        .index("by_cell_user", ["filingCellId", "userId"]),

    // ═══════════════════════════════════════════
    // 21. LEADS (prospects)
    // ═══════════════════════════════════════════
    leads: defineTable({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        sector: v.optional(v.string()),
        subject: v.optional(v.string()),
        message: v.optional(v.string()),
        source: v.union(
            v.literal("website"),
            v.literal("referral"),
            v.literal("event"),
            v.literal("linkedin"),
            v.literal("salon"),
            v.literal("other")
        ),
        status: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("qualified"),
            v.literal("proposal"),
            v.literal("negotiation"),
            v.literal("converted"),
            v.literal("lost")
        ),
        value: v.optional(v.number()), // Pipeline value in XAF
        assignedTo: v.optional(v.string()),
        notes: v.optional(v.string()),
        lastContactedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_email", ["email"])
        .index("by_source", ["source"])
        .index("by_createdAt", ["createdAt"]),

    // ═══════════════════════════════════════════
    // 22. PAYMENTS (transactions de paiement)
    // ═══════════════════════════════════════════
    payments: defineTable({
        organizationId: v.id("organizations"),
        subscriptionId: v.optional(v.id("subscriptions")),
        invoiceId: v.optional(v.id("invoices")),
        amount: v.number(),           // montant en XAF
        currency: v.string(),         // "XAF"
        method: v.union(
            v.literal("mobile_money"),
            v.literal("bank_transfer"),
            v.literal("card"),
            v.literal("check"),
            v.literal("simulation")
        ),
        provider: v.union(
            v.literal("airtel_money"),
            v.literal("stripe"),
            v.literal("bank_transfer"),
            v.literal("check"),
            v.literal("simulation")
        ),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("refunded"),
            v.literal("cancelled")
        ),
        // Provider-specific reference
        externalId: v.optional(v.string()),       // ID du fournisseur (Stripe charge_id, Airtel txn_id...)
        externalStatus: v.optional(v.string()),   // Statut brut du fournisseur
        // Payment details
        description: v.optional(v.string()),
        metadata: v.optional(v.any()),             // Données fournisseur (numéro chèque, IBAN...)
        // Mobile Money specifics
        phoneNumber: v.optional(v.string()),
        // Card specifics
        cardLast4: v.optional(v.string()),
        cardBrand: v.optional(v.string()),
        // Check specifics
        checkNumber: v.optional(v.string()),
        bankName: v.optional(v.string()),
        // Bank transfer specifics
        transferReference: v.optional(v.string()),
        // Lifecycle
        initiatedBy: v.string(),       // ref users.userId
        completedAt: v.optional(v.number()),
        failedReason: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_subscriptionId", ["subscriptionId"])
        .index("by_invoiceId", ["invoiceId"])
        .index("by_status", ["status"])
        .index("by_provider", ["provider"])
        .index("by_method", ["method"])
        .index("by_externalId", ["externalId"])
        .index("by_org_status", ["organizationId", "status"]),

    // ═══════════════════════════════════════════
    // 23. PERMISSION GROUPS (v7 — groupes de permissions ad-hoc)
    // ═══════════════════════════════════════════
    permission_groups: defineTable({
        organizationId: v.id("organizations"),
        nom: v.string(),
        description: v.optional(v.string()),
        couleur: v.optional(v.string()),
        members: v.array(v.string()),
        estActif: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_actif", ["organizationId", "estActif"]),

    // ═══════════════════════════════════════════
    // 24. ARCHIVE POLICY CHANGELOG (v8 — historique des politiques)
    // ═══════════════════════════════════════════
    archive_policy_changelog: defineTable({
        organizationId: v.id("organizations"),
        changeType: v.union(
            v.literal("category_created"),
            v.literal("category_updated"),
            v.literal("category_deleted"),
            v.literal("config_updated")
        ),
        entityId: v.optional(v.string()),       // ID de la catégorie ou config concernée
        entityName: v.optional(v.string()),      // Nom lisible (ex: "Fiscal")
        changes: v.optional(v.any()),            // JSON diff { field: { old, new } }
        changedBy: v.string(),                   // userId
        changedAt: v.number(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_date", ["organizationId", "changedAt"]),

    // ═══════════════════════════════════════════
    // N1. NEOCORTEX — SIGNAUX (bus de signaux pondérés)
    // ═══════════════════════════════════════════
    signaux: defineTable({
        type: v.string(),                    // SignalType
        source: v.string(),                  // CortexType émetteur
        destination: v.string(),             // CortexType destinataire
        payload: v.any(),                    // Données du signal
        confiance: v.number(),               // 0.0 - 1.0
        priorite: v.number(),                // 0=basse, 1=normale, 2=haute, 3=critique
        correlationId: v.string(),           // Traçabilité inter-signaux
        ttl: v.number(),                     // Durée de vie en ms
        traite: v.boolean(),                 // Signal traité ?
        emetteurId: v.optional(v.string()),  // userId déclencheur
        entiteId: v.optional(v.string()),    // ID de l'entité concernée
        entiteType: v.optional(v.string()),  // Table de l'entité
        organisationId: v.optional(v.string()), // Contexte organisation
        createdAt: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_traite", ["traite"])
        .index("by_destination", ["destination"])
        .index("by_correlationId", ["correlationId"])
        .index("by_priorite", ["priorite"])
        .index("by_organisationId", ["organisationId"])
        .index("by_createdAt", ["createdAt"]),

    // ═══════════════════════════════════════════
    // N2. NEOCORTEX — HISTORIQUE ACTIONS (audit trail)
    // ═══════════════════════════════════════════
    historiqueActions: defineTable({
        action: v.string(),                  // ex: "organizations.create"
        categorie: v.union(
            v.literal("metier"),
            v.literal("systeme"),
            v.literal("utilisateur"),
            v.literal("securite")
        ),
        entiteType: v.string(),              // Table Convex
        entiteId: v.string(),                // _id de l'entité
        userId: v.string(),                  // Qui a fait l'action
        organisationId: v.optional(v.string()),
        details: v.object({
            avant: v.optional(v.any()),      // Snapshot avant modification
            apres: v.optional(v.any()),      // Snapshot après modification
            description: v.optional(v.string()),
            metadata: v.optional(v.any()),
        }),
        createdAt: v.number(),
    })
        .index("by_action", ["action"])
        .index("by_entiteType", ["entiteType"])
        .index("by_entiteId", ["entiteId"])
        .index("by_userId", ["userId"])
        .index("by_organisationId", ["organisationId"])
        .index("by_createdAt", ["createdAt"])
        .index("by_categorie", ["categorie"]),

    // ═══════════════════════════════════════════
    // N3. NEOCORTEX — CONFIG SYSTÈME (plasticité)
    // ═══════════════════════════════════════════
    configSysteme: defineTable({
        cle: v.string(),                     // Clé unique de config
        valeur: v.any(),                     // Valeur (type libre)
        description: v.optional(v.string()), // Description humaine
        updatedAt: v.number(),
    })
        .index("by_cle", ["cle"]),

    // ═══════════════════════════════════════════
    // N4. NEOCORTEX — MÉTRIQUES (hippocampe)
    // ═══════════════════════════════════════════
    metriques: defineTable({
        nom: v.string(),                     // Nom de la métrique
        valeur: v.number(),                  // Valeur numérique
        unite: v.string(),                   // "count", "ms", "%", "bytes"
        periode: v.string(),                 // "5min", "1h", "24h", "7d"
        dimensions: v.optional(v.any()),     // { cortex: "limbique", org: "xxx" }
        createdAt: v.number(),
    })
        .index("by_nom", ["nom"])
        .index("by_periode", ["periode"])
        .index("by_createdAt", ["createdAt"]),

    // ═══════════════════════════════════════════
    // N5. NEOCORTEX — POIDS ADAPTATIFS (plasticité)
    // ═══════════════════════════════════════════
    poidsAdaptatifs: defineTable({
        signal: v.string(),                  // Type de signal
        regle: v.string(),                   // Nom de la règle
        poids: v.number(),                   // Poids actuel (0-10)
        executions: v.number(),              // Nombre d'exécutions
        derniereExecution: v.optional(v.number()),
        updatedAt: v.number(),
    })
        .index("by_signal", ["signal"])
        .index("by_regle", ["regle"]),
});
