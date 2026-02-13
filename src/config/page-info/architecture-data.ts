// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Architecture Data for all pages
// Centralized technical architecture info
// ═══════════════════════════════════════════════

import type { ArchitectureInfo } from "@/types/page-info";

/* ─── Shared base stacks ──────────────────────── */

const BASE_STACK = ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Shadcn/ui"];
const CONVEX_STACK = [...BASE_STACK, "Convex"];
const FIREBASE_STACK = [...BASE_STACK, "Firebase Auth"];
const FULL_STACK = [...BASE_STACK, "Convex", "Firebase Auth", "Framer Motion"];

/* ─── Helper for consistent diagrams ──────────── */

const DIAGRAMS = {
    dashboard: `┌─────────────────────────────────────┐
│         Layout (SSR Shell)          │
│  ┌───────────┐  ┌───────────────┐   │
│  │  Sidebar   │  │    Header     │   │
│  │  (NavLink) │  │ [Architec][i] │   │
│  └───────────┘  └───────────────┘   │
│  ┌──────────────────────────────┐   │
│  │       Dashboard Page          │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │ KPI  │ │ KPI  │ │ KPI  │  │   │
│  │  └──────┘ └──────┘ └──────┘  │   │
│  │  ┌────────────────────────┐  │   │
│  │  │   Graphique / Tableau  │  │   │
│  │  └────────────────────────┘  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
     ↕ React State + useQuery (Convex)`,

    crud: `┌──────────────────────────────────┐
│          Page Component          │
│  ┌────────┐  ┌───────────────┐  │
│  │ Filtres │  │  Recherche    │  │
│  └────┬───┘  └──────┬────────┘  │
│       ↓              ↓           │
│  ┌──────────────────────────┐   │
│  │   Tableau / Grille Data  │   │
│  │   (useState + useQuery)  │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Modal Créer / Modifier  │   │
│  │  (Dialog + Form State)   │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Convex mutations / queries`,

    document: `┌──────────────────────────────────┐
│        iDocument Module          │
│  ┌──────────────────────────┐   │
│  │  Toolbar: [Grille|Liste] │   │
│  │  [Filtres] [Recherche]   │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  DocumentGrid / List     │   │
│  │  ┌─────┐ ┌─────┐ ┌────┐ │   │
│  │  │ Doc │ │ Doc │ │ ...│ │   │
│  │  └──┬──┘ └──┬──┘ └──┬─┘ │   │
│  └─────┼───────┼───────┼────┘   │
│        ↓       ↓       ↓        │
│  [Ouvrir] [Partager] [Archiver] │
└──────────────────────────────────┘
  ↕ Convex DB + Firebase Storage`,

    archive: `┌──────────────────────────────────┐
│        iArchive Module           │
│  ┌──────────────────────────┐   │
│  │  KPI Cards (par catégorie)│   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Catégorie Filter Tabs   │   │
│  │  [Fiscal][Social][Legal] │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Archive Table + Search  │   │
│  │  (Rétention + Confid.)   │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Convex + AES-256 (Vault)`,

    signature: `┌──────────────────────────────────┐
│       iSignature Module          │
│  ┌──────────────────────────┐   │
│  │  Document Preview Panel  │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Signature Zone          │   │
│  │  [Signer] [Refuser]     │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Workflow Engine         │   │
│  │  Signataire₁ → ₂ → ₃    │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Convex + Certificat PKI`,

    infra: `┌──────────────────────────────────┐
│      Infrastructure View         │
│  ┌──────────────────────────┐   │
│  │  Server Cards (health)   │   │
│  │  [CPU] [RAM] [Disk] [Net]│   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Real-time Metrics       │   │
│  │  (WebSocket polling)     │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Actions: Restart, Maint │   │
│  │  (Confirmation Modal)    │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ API REST + Cloud Monitoring`,

    settings: `┌──────────────────────────────────┐
│         Paramètres Page          │
│  ┌──────────────────────────┐   │
│  │  Tabs Navigation         │   │
│  │  [Profil][Thème][Notif]  │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Form Fields (controlled)│   │
│  │  useState + validation   │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  [Sauvegarder] [Reset]   │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Convex user preferences`,

    formation: `┌──────────────────────────────────┐
│        Formation Module          │
│  ┌──────────────────────────┐   │
│  │  Rôle Overview Card      │   │
│  │  (contextuel au persona) │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Guide Tabs              │   │
│  │  [Vue d'ensemble]        │   │
│  │  [Tutoriels] [FAQ]       │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Step-by-step Content    │   │
│  │  (Markdown + interactif) │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Config statique (RBAC)`,

    analytics: `┌──────────────────────────────────┐
│        Analytics Page            │
│  ┌──────────────────────────┐   │
│  │  Period Selector         │   │
│  │  [7j] [30j] [90j] [1an] │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  KPI Summary Cards       │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Charts (Recharts/d3)    │   │
│  │  Line + Bar + Pie        │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Convex aggregation queries`,

    iam: `┌──────────────────────────────────┐
│        IAM Module                │
│  ┌──────────────────────────┐   │
│  │  Roles Table             │   │
│  │  [system_admin → user]   │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Permissions Matrix      │   │
│  │  Rôle × Module × Action  │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  RBAC Guard Component    │   │
│  │  (HOC + Context)         │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ rbac.ts + Firebase Claims`,
};

/* ─── Architecture entries by pageId ──────────── */

export const ARCHITECTURE_DATA: Record<string, ArchitectureInfo> = {

    // ━━━ Admin Dashboard ━━━━━━━━━━━━━━━━━━━━━━━
    "admin-dashboard": {
        stack: FULL_STACK,
        pattern: "Client-side SPA avec Server Shell (Next.js App Router). Layout SSR + pages hydratées côté client.",
        dataFlow: "Les KPIs sont récupérés via Convex useQuery() en temps réel. Les données de session passent par Firebase Auth + Context Provider.",
        diagram: DIAGRAMS.dashboard,
        keyComponents: ["AdminSpaceLayout", "KPICard", "ActivityTable", "GrowthChart"],
        apiEndpoints: ["convex/admin.getStats", "convex/admin.getActivity"],
        stateManagement: "React Context (AuthProvider) + Convex realtime subscriptions. Pas de Redux — les queries Convex sont auto-réactives.",
    },
    "admin-leads": {
        stack: [...FULL_STACK, "React Hook Form"],
        pattern: "CRUD avec pipeline visuel. Filtres côté client + pagination serveur.",
        dataFlow: "Leads stockés dans Convex. Mutation pour créer/qualifier. Queries filtrées par statut pipeline.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["LeadsPipeline", "LeadCard", "AddLeadModal", "FilterBar"],
        apiEndpoints: ["convex/leads.list", "convex/leads.create", "convex/leads.update"],
        stateManagement: "useState pour filtres locaux + useQuery Convex pour les données serveur.",
    },
    "admin-users": {
        stack: FIREBASE_STACK,
        pattern: "Table CRUD avec recherche full-text et actions par ligne.",
        dataFlow: "Utilisateurs gérés via Firebase Auth + profil étendu dans Convex. Recherche côté client.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["UsersTable", "UserActions", "InviteModal", "SearchBar"],
        apiEndpoints: ["convex/users.list", "convex/users.update", "Firebase Admin SDK"],
        stateManagement: "useQuery Convex + useState pour recherche/filtres temps réel.",
    },
    "admin-organizations": {
        stack: CONVEX_STACK,
        pattern: "Table CRUD avec detail view. Master-detail pattern.",
        dataFlow: "Organisations dans Convex avec relations vers users et subscriptions.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["OrgsTable", "OrgDetailPanel", "CreateOrgModal"],
        apiEndpoints: ["convex/organizations.list", "convex/organizations.create"],
        stateManagement: "Convex queries réactives + useState pour sélection.",
    },
    "admin-subscriptions": {
        stack: CONVEX_STACK,
        pattern: "Dashboard analytique + CRUD plans. Cards + Table hybrid.",
        dataFlow: "Plans définis en config statique. Abonnements actifs dans Convex avec relation org.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["PlanCard", "SubscriptionsTable", "MRRChart"],
        apiEndpoints: ["convex/subscriptions.list", "convex/subscriptions.update"],
    },
    "admin-analytics": {
        stack: [...CONVEX_STACK, "Recharts"],
        pattern: "Dashboard analytique read-only avec sélecteur de période.",
        dataFlow: "Données agrégées via Convex queries avec paramètres de période. Rendu charts côté client.",
        diagram: DIAGRAMS.analytics,
        keyComponents: ["AnalyticsDashboard", "PeriodSelector", "UsageChart", "ModuleBreakdown"],
        apiEndpoints: ["convex/analytics.getUsage", "convex/analytics.getGrowth"],
    },
    "admin-billing": {
        stack: CONVEX_STACK,
        pattern: "Read-only dashboard financier avec export.",
        dataFlow: "Factures générées par webhook Stripe → Convex. Affichage read-only avec download PDF.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["RevenueCards", "InvoicesTable", "ExportButton"],
        apiEndpoints: ["convex/billing.getInvoices", "convex/billing.getRevenue"],
    },
    "admin-formation": {
        stack: BASE_STACK,
        pattern: "Contenu statique configurable par rôle. RBAC-driven content.",
        dataFlow: "Contenu chargé depuis la config locale (formation/). Pas d'appel API — tout est statique côté client.",
        diagram: DIAGRAMS.formation,
        keyComponents: ["FormationModule", "GuideCard", "StepContent", "RoleOverview"],
        stateManagement: "Config statique importée. useState pour navigation entre guides.",
    },
    "admin-parametres": {
        stack: FIREBASE_STACK,
        pattern: "Formulaire multi-onglets avec sauvegarde par section.",
        dataFlow: "Préférences stockées dans Convex (user preferences). Auth modifiée via Firebase.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["SettingsTabs", "ProfileForm", "ThemeSelector", "NotificationPrefs"],
        apiEndpoints: ["convex/users.updatePrefs", "Firebase Auth updateProfile"],
    },
    "admin-modules": {
        stack: FULL_STACK,
        pattern: "Dashboard modulaire avec cartes statistiques par module.",
        dataFlow: "Stats par module via Convex queries agrégées. Navigation vers sous-modules.",
        diagram: DIAGRAMS.dashboard,
        keyComponents: ["ModuleCard", "RecentDossiers", "PendingSignatures"],
        apiEndpoints: ["convex/modules.getStats"],
    },

    // ━━━ iDocument ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "admin-idocument": {
        stack: [...FULL_STACK, "Firebase Storage"],
        pattern: "File Manager UI avec drag-and-drop + grille/liste toggle.",
        dataFlow: "Métadonnées dans Convex. Fichiers binaires dans Firebase Storage. Upload via zones de drop.",
        diagram: DIAGRAMS.document,
        keyComponents: ["DocumentGrid", "FolderCard", "DropZone", "FilePreview", "TagFilter"],
        apiEndpoints: ["convex/documents.list", "convex/documents.create", "Firebase Storage upload"],
        stateManagement: "useState pour vue (grille/liste) + useQuery Convex pour data. Upload state local.",
    },
    "admin-idocument-templates": {
        stack: CONVEX_STACK,
        pattern: "Bibliothèque de templates avec action 'Utiliser' qui clone le template.",
        dataFlow: "Templates stockés dans Convex. 'Utiliser' crée un nouveau dossier pré-rempli via mutation.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["TemplateGrid", "TemplateCard", "UseTemplateModal"],
        apiEndpoints: ["convex/templates.list", "convex/documents.createFromTemplate"],
    },
    "admin-idocument-trash": {
        stack: CONVEX_STACK,
        pattern: "Soft-delete avec expiration automatique (30 jours).",
        dataFlow: "Documents marqués 'deleted' dans Convex avec timestamp. Cron job Convex pour purge auto.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["TrashTable", "RestoreButton", "EmptyTrashModal"],
        apiEndpoints: ["convex/documents.listTrash", "convex/documents.restore", "convex/documents.purge"],
    },

    // ━━━ iArchive ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "admin-iarchive": {
        stack: [...CONVEX_STACK, "AES-256"],
        pattern: "Archive centralisée avec catégories dynamiques et barres de rétention.",
        dataFlow: "Archives dans Convex avec métadonnées de rétention. Catégories configurables. Coffre-fort chiffré AES-256.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["ArchiveTable", "CategoryKPI", "RetentionBar", "ConfidentialityBadge"],
        apiEndpoints: ["convex/archives.list", "convex/archives.getByCategory"],
    },
    "admin-iarchive-vault": {
        stack: [...CONVEX_STACK, "AES-256", "Firebase Storage"],
        pattern: "Coffre-fort numérique avec chiffrement client-side + stockage sécurisé.",
        dataFlow: "Fichiers chiffrés côté client (AES-256) avant upload. Clé dérivée du mot de passe utilisateur. Stockage Firebase Storage.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["VaultBrowser", "SecureUpload", "SubfolderTree", "EncryptionBadge"],
        apiEndpoints: ["convex/vault.list", "convex/vault.createFolder", "Firebase Storage encrypted upload"],
        stateManagement: "useState pour navigation arborescente + Convex queries pour le contenu.",
    },
    "admin-iarchive-categories": {
        stack: CONVEX_STACK,
        pattern: "CRUD de catégories avec couleur, icône et rétention configurable.",
        dataFlow: "Catégories dans Convex. CRUD complet sauf Coffre-Fort (catégorie système protégée).",
        diagram: DIAGRAMS.crud,
        keyComponents: ["CategoryList", "CategoryForm", "ColorPicker", "IconSelector"],
        apiEndpoints: ["convex/categories.list", "convex/categories.create", "convex/categories.update"],
    },
    "admin-iarchive-certificates": {
        stack: CONVEX_STACK,
        pattern: "Gestion de certificats avec suivi de validité et génération.",
        dataFlow: "Certificats stockés dans Convex avec dates de validité. Génération PDF côté serveur.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["CertificateTable", "ValidityBadge", "GenerateButton"],
        apiEndpoints: ["convex/certificates.list", "convex/certificates.generate"],
    },

    // ━━━ iSignature ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "subadmin-isignature-pending": {
        stack: [...CONVEX_STACK, "PKI"],
        pattern: "Queue de signature avec priorisation par urgence.",
        dataFlow: "Documents à signer depuis Convex. Signature électronique via PKI. Horodatage certifié.",
        diagram: DIAGRAMS.signature,
        keyComponents: ["SignatureQueue", "DocumentPreview", "SignButton", "DelegateModal"],
        apiEndpoints: ["convex/signatures.getPending", "convex/signatures.sign", "convex/signatures.refuse"],
    },
    "subadmin-isignature-waiting": {
        stack: CONVEX_STACK,
        pattern: "Suivi de status avec relance automatique.",
        dataFlow: "Documents envoyés trackés dans Convex. Statut mis à jour en temps réel via subscriptions.",
        diagram: DIAGRAMS.signature,
        keyComponents: ["WaitingTable", "StatusTracker", "RemindButton"],
        apiEndpoints: ["convex/signatures.getWaiting", "convex/signatures.remind"],
    },
    "subadmin-isignature-completed": {
        stack: CONVEX_STACK,
        pattern: "Archive de signatures avec certificats téléchargeables.",
        dataFlow: "Documents signés archivés dans Convex. Certificats de signature générés et stockés.",
        diagram: DIAGRAMS.signature,
        keyComponents: ["CompletedTable", "CertificateDownload", "AuditTrail"],
        apiEndpoints: ["convex/signatures.getCompleted", "convex/signatures.getCertificate"],
    },
    "subadmin-isignature-workflows": {
        stack: CONVEX_STACK,
        pattern: "Éditeur de workflows avec étapes séquentielles.",
        dataFlow: "Modèles de workflows dans Convex. Définition de l'ordre des signataires et conditions.",
        diagram: DIAGRAMS.signature,
        keyComponents: ["WorkflowList", "WorkflowEditor", "StepConfigurator"],
        apiEndpoints: ["convex/workflows.list", "convex/workflows.create", "convex/workflows.update"],
    },

    // ━━━ SysAdmin ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "sysadmin-dashboard": {
        stack: [...FULL_STACK, "Cloud Monitoring API"],
        pattern: "Dashboard temps réel avec polling des métriques infrastructure.",
        dataFlow: "Métriques serveur via Cloud Monitoring API (polling 30s). Alertes stockées dans Convex.",
        diagram: DIAGRAMS.infra,
        keyComponents: ["SystemKPICards", "LoadChart", "AlertsTable", "ActivityLog"],
        apiEndpoints: ["API Cloud Monitoring", "convex/alerts.getActive"],
        stateManagement: "setInterval polling + Convex realtime pour alertes.",
    },
    "sysadmin-infrastructure": {
        stack: [...FULL_STACK, "Cloud Compute API"],
        pattern: "Server management avec actions dangereuses protégées par confirmation.",
        dataFlow: "Statut serveurs via Cloud API. Actions (restart, maintenance) via mutations protégées.",
        diagram: DIAGRAMS.infra,
        keyComponents: ["ServerTable", "ServerCard", "RestartConfirm", "MaintenanceToggle"],
        apiEndpoints: ["API Cloud Compute", "convex/infra.restart", "convex/infra.setMaintenance"],
    },
    "sysadmin-monitoring": {
        stack: [...FULL_STACK, "Recharts", "WebSocket"],
        pattern: "Monitoring temps réel avec graphiques streaming.",
        dataFlow: "Métriques en temps réel via WebSocket. Historique des incidents dans Convex.",
        diagram: DIAGRAMS.infra,
        keyComponents: ["RealtimeCharts", "AlertThresholds", "IncidentTimeline"],
        apiEndpoints: ["WebSocket /metrics", "convex/incidents.list"],
    },
    "sysadmin-databases": {
        stack: [...CONVEX_STACK, "Cloud SQL"],
        pattern: "Database administration avec monitoring de santé et backup management.",
        dataFlow: "Statut DB via Cloud SQL API. Sauvegardes déclenchées par mutation Convex → Cloud Function.",
        diagram: DIAGRAMS.infra,
        keyComponents: ["DatabaseList", "ReplicationStatus", "BackupManager"],
        apiEndpoints: ["Cloud SQL API", "convex/backups.trigger", "convex/backups.list"],
    },
    "sysadmin-logs": {
        stack: [...CONVEX_STACK, "Cloud Logging"],
        pattern: "Log viewer avec filtrage temps réel et export.",
        dataFlow: "Logs agrégés depuis Cloud Logging API. Filtrage côté serveur. Export CSV/JSON côté client.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["LogTable", "LogFilters", "ExportButton", "LogLevelBadge"],
        apiEndpoints: ["Cloud Logging API", "convex/logs.search"],
    },
    "sysadmin-security": {
        stack: [...FIREBASE_STACK, "Cloud Armor"],
        pattern: "Security dashboard avec règles firewall et audit SSL.",
        dataFlow: "Règles firewall via Cloud Armor API. Certificats SSL trackés dans Convex. Logs sécurité temps réel.",
        diagram: DIAGRAMS.infra,
        keyComponents: ["FirewallRules", "SSLCertTable", "SecurityLogs", "IPBlocker"],
        apiEndpoints: ["Cloud Armor API", "convex/security.getCerts", "convex/security.getLogs"],
    },
    "sysadmin-iam": {
        stack: [...FIREBASE_STACK, "Custom Claims"],
        pattern: "RBAC manager avec matrice de permissions.",
        dataFlow: "Rôles définis dans rbac.ts. Claims Firebase pour auth. Matrice permissions cross-reference.",
        diagram: DIAGRAMS.iam,
        keyComponents: ["RolesTable", "PermissionsMatrix", "RoleEditor"],
        apiEndpoints: ["Firebase Admin setCustomClaims", "convex/roles.list"],
        stateManagement: "Config statique rbac.ts + Firebase Custom Claims + Convex user roles.",
    },
    "sysadmin-organization": {
        stack: CONVEX_STACK,
        pattern: "Formulaire d'édition avec preview temps réel.",
        dataFlow: "Données org dans Convex. Upload logo via Firebase Storage. Sauvegarde par mutation.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["OrgForm", "LogoUpload", "SaveButton"],
        apiEndpoints: ["convex/organization.get", "convex/organization.update"],
    },
    "sysadmin-design-theme": {
        stack: [...CONVEX_STACK, "CSS Variables"],
        pattern: "Theme editor avec preview live via CSS custom properties.",
        dataFlow: "Thème stocké dans Convex. Appliqué via CSS variables injectées dans :root. Preview instantané.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["ThemeEditor", "ColorPicker", "FontSelector", "LivePreview"],
        apiEndpoints: ["convex/theme.get", "convex/theme.update"],
        stateManagement: "useState pour preview temps réel + mutation Convex pour persistence.",
    },
    "sysadmin-users": {
        stack: FIREBASE_STACK,
        pattern: "User management CRUD avec Firebase Auth integration.",
        dataFlow: "Utilisateurs Firebase Auth + profil étendu Convex. Invitation par email.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["UsersTable", "InviteModal", "UserActions", "RoleSelector"],
        apiEndpoints: ["Firebase Admin listUsers", "convex/users.list", "convex/users.invite"],
    },
    "sysadmin-clients": {
        stack: CONVEX_STACK,
        pattern: "Client management avec filtres avancés et actions CRUD.",
        dataFlow: "Organisations clientes dans Convex. Relation avec plans d'abonnement et utilisateurs.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["ClientsTable", "CreateClientModal", "ClientFilters"],
        apiEndpoints: ["convex/clients.list", "convex/clients.create", "convex/clients.update"],
    },
    "sysadmin-subscriptions": {
        stack: CONVEX_STACK,
        pattern: "Plans d'abonnement CRUD + gestion des abonnements actifs.",
        dataFlow: "Plans en config + abonnements actifs dans Convex. Webhook Stripe pour facturation.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["PlanCards", "SubscriptionTable", "PlanEditor"],
        apiEndpoints: ["convex/subscriptions.list", "convex/plans.update"],
    },
    "sysadmin-leads": {
        stack: CONVEX_STACK,
        pattern: "Pipeline CRM avec étapes de conversion.",
        dataFlow: "Leads dans Convex avec statut pipeline. Conversion en client via mutation.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["LeadPipeline", "LeadCard", "ConvertModal"],
        apiEndpoints: ["convex/leads.list", "convex/leads.create", "convex/leads.convert"],
    },
    "sysadmin-workflow-templates": {
        stack: CONVEX_STACK,
        pattern: "Template builder avec éditeur visuel drag-and-drop.",
        dataFlow: "Templates dans Convex. Étapes définies en JSON. Utilisés par les organisations.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["TemplateList", "WorkflowEditor", "StepBuilder"],
        apiEndpoints: ["convex/workflowTemplates.list", "convex/workflowTemplates.create"],
    },
    "sysadmin-formation": {
        stack: BASE_STACK,
        pattern: "Contenu pédagogique statique rendu via config RBAC.",
        dataFlow: "Guides chargés depuis config locale. Contextuels au rôle system_admin.",
        diagram: DIAGRAMS.formation,
        keyComponents: ["FormationModule", "GuideCard", "StepContent"],
    },
    "sysadmin-parametres": {
        stack: FIREBASE_STACK,
        pattern: "Settings multi-onglets avec zones protégées.",
        dataFlow: "Préférences dans Convex. Auth via Firebase. Zone danger avec double confirmation.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["SettingsTabs", "ProfileForm", "DangerZone"],
        apiEndpoints: ["convex/users.updatePrefs", "Firebase Auth updateProfile"],
    },

    // ━━━ SubAdmin ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "subadmin-dashboard": {
        stack: FULL_STACK,
        pattern: "Dashboard organisationnel avec KPIs par module.",
        dataFlow: "Statistiques par module via Convex queries filtrées par org_id.",
        diagram: DIAGRAMS.dashboard,
        keyComponents: ["OrgDashboard", "ModuleKPI", "RecentActivity", "PendingActions"],
        apiEndpoints: ["convex/org.getStats", "convex/org.getActivity"],
        stateManagement: "Convex realtime subscriptions scoped à l'organisation.",
    },
    "subadmin-idocument": {
        stack: [...CONVEX_STACK, "Firebase Storage"],
        pattern: "Gestion documentaire CRUD avec permissions par rôle.",
        dataFlow: "Documents dans Convex (metadata) + Firebase Storage (fichiers). Scoped à l'org.",
        diagram: DIAGRAMS.document,
        keyComponents: ["DocumentList", "CreateDoc", "ShareModal", "SearchBar"],
        apiEndpoints: ["convex/documents.list", "convex/documents.create", "Firebase Storage"],
    },
    "subadmin-idocument-shared": {
        stack: CONVEX_STACK,
        pattern: "Liste filtrable de documents partagés entrants.",
        dataFlow: "Documents partagés via table de jointure dans Convex. Filtrage par permission (read/write).",
        diagram: DIAGRAMS.document,
        keyComponents: ["SharedDocsList", "PermissionBadge"],
        apiEndpoints: ["convex/documents.getSharedWithMe"],
    },
    "subadmin-idocument-team": {
        stack: CONVEX_STACK,
        pattern: "Vue agrégée des documents par membre d'équipe.",
        dataFlow: "Documents filtrés par auteur dans l'organisation. Query Convex avec filtre user_id.",
        diagram: DIAGRAMS.document,
        keyComponents: ["TeamDocsTable", "AuthorFilter"],
        apiEndpoints: ["convex/documents.listByOrg"],
    },
    "subadmin-idocument-templates": {
        stack: CONVEX_STACK,
        pattern: "Bibliothèque de templates avec instanciation.",
        dataFlow: "Templates Convex. Action 'Utiliser' clone le template en nouveau document.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["TemplateGrid", "UseTemplateAction"],
        apiEndpoints: ["convex/templates.list", "convex/documents.createFromTemplate"],
    },
    "subadmin-idocument-trash": {
        stack: CONVEX_STACK,
        pattern: "Soft-delete avec restauration et purge automatique.",
        dataFlow: "Marquage soft-delete dans Convex. Purge auto via scheduled function (30j).",
        diagram: DIAGRAMS.crud,
        keyComponents: ["TrashList", "RestoreAction", "PurgeConfirm"],
        apiEndpoints: ["convex/documents.listTrash", "convex/documents.restore"],
    },
    "subadmin-iarchive-fiscal": {
        stack: [...CONVEX_STACK, "AES-256"],
        pattern: "Archive catégorisée avec rétention réglementaire.",
        dataFlow: "Documents fiscaux archivés dans Convex avec métadonnées de rétention légale.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["FiscalArchiveTable", "DepositButton", "RetentionBar"],
        apiEndpoints: ["convex/archives.listByCategory"],
    },
    "subadmin-iarchive-social": {
        stack: CONVEX_STACK,
        pattern: "Archive RH avec classification par type de document.",
        dataFlow: "Documents sociaux (contrats, fiches de paie) dans Convex avec classification.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["SocialArchiveTable", "DocTypeFilter"],
        apiEndpoints: ["convex/archives.listByCategory"],
    },
    "subadmin-iarchive-legal": {
        stack: CONVEX_STACK,
        pattern: "Archive juridique avec scellé cryptographique.",
        dataFlow: "Actes juridiques archivés avec hash d'intégrité. Immutables après archivage.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["LegalArchiveTable", "IntegrityBadge", "SealVerifier"],
        apiEndpoints: ["convex/archives.listByCategory", "convex/archives.verifySeal"],
    },
    "subadmin-iarchive-vault": {
        stack: [...CONVEX_STACK, "AES-256"],
        pattern: "Coffre-fort chiffré avec sous-dossiers.",
        dataFlow: "Chiffrement AES-256 côté client. Stockage sécurisé. Accès journalisé.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["VaultBrowser", "SecureUpload", "AccessLog"],
        apiEndpoints: ["convex/vault.list", "convex/vault.deposit"],
    },
    "subadmin-iarchive-certificates": {
        stack: CONVEX_STACK,
        pattern: "Gestion de certificats avec suivi de validité.",
        dataFlow: "Certificats dans Convex avec dates de validité et statut.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["CertTable", "ValidityTracker", "GenerateAction"],
        apiEndpoints: ["convex/certificates.list", "convex/certificates.generate"],
    },
    "subadmin-iarchive-clients": {
        stack: CONVEX_STACK,
        pattern: "Dossiers clients archivés avec recherche par nom.",
        dataFlow: "Archives clients dans Convex avec relation vers la fiche client.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["ClientArchiveTable", "ClientSearch"],
        apiEndpoints: ["convex/archives.listByClient"],
    },
    "subadmin-clients": {
        stack: CONVEX_STACK,
        pattern: "CRM basique avec fiche client et historique.",
        dataFlow: "Clients dans Convex avec historique des interactions.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["ClientsTable", "ClientCard", "AddClientModal"],
        apiEndpoints: ["convex/clients.list", "convex/clients.create"],
    },
    "subadmin-leads": {
        stack: CONVEX_STACK,
        pattern: "Pipeline CRM simplifié.",
        dataFlow: "Leads dans Convex. Pipeline visuel avec étapes de conversion.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["LeadPipeline", "LeadForm"],
        apiEndpoints: ["convex/leads.list", "convex/leads.create"],
    },
    "subadmin-subscriptions": {
        stack: CONVEX_STACK,
        pattern: "Vue read-only de l'abonnement avec historique factures.",
        dataFlow: "Abonnement org dans Convex. Factures générées par webhook.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["PlanDetail", "InvoiceHistory"],
        apiEndpoints: ["convex/subscriptions.getForOrg"],
    },
    "subadmin-organization": {
        stack: CONVEX_STACK,
        pattern: "Formulaire d'édition organisation.",
        dataFlow: "Données org dans Convex. Logo via Firebase Storage.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["OrgForm", "LogoUpload"],
        apiEndpoints: ["convex/organization.get", "convex/organization.update"],
    },
    "subadmin-iam": {
        stack: [...FIREBASE_STACK, "Custom Claims"],
        pattern: "Gestion des rôles au niveau organisation.",
        dataFlow: "Rôles org dans rbac.ts. Attribution via Convex mutation + Firebase Claims update.",
        diagram: DIAGRAMS.iam,
        keyComponents: ["OrgRolesTable", "MemberPermissions", "InviteMember"],
        apiEndpoints: ["convex/orgRoles.list", "convex/orgRoles.assign"],
    },
    "subadmin-design-theme": {
        stack: [...CONVEX_STACK, "CSS Variables"],
        pattern: "Personnalisation visuelle au niveau organisation.",
        dataFlow: "Thème org dans Convex. Appliqué via CSS variables scoped.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["ThemePicker", "ColorPalette"],
        apiEndpoints: ["convex/orgTheme.get", "convex/orgTheme.update"],
    },
    "subadmin-workflow-templates": {
        stack: CONVEX_STACK,
        pattern: "Gestion de modèles de workflows réutilisables.",
        dataFlow: "Templates workflow dans Convex. Utilisés par les modules iSignature.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["WorkflowTemplateList", "TemplateEditor"],
        apiEndpoints: ["convex/workflowTemplates.list", "convex/workflowTemplates.create"],
    },
    "subadmin-formation": {
        stack: BASE_STACK,
        pattern: "Formation contextuelle au rôle org_admin.",
        dataFlow: "Contenu statique depuis config formation/. Contextuel au rôle.",
        diagram: DIAGRAMS.formation,
        keyComponents: ["FormationModule", "GuideCard"],
    },
    "subadmin-parametres": {
        stack: FIREBASE_STACK,
        pattern: "Paramètres utilisateur multi-onglets.",
        dataFlow: "Préférences Convex + Auth Firebase.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["SettingsTabs", "ProfileForm"],
        apiEndpoints: ["convex/users.updatePrefs"],
    },

    // ━━━ Pro ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "pro-dashboard": {
        stack: FULL_STACK,
        pattern: "Dashboard métier avec raccourcis et KPIs modules.",
        dataFlow: "KPIs par module via Convex. Raccourcis personnalisables. Activité équipe temps réel.",
        diagram: DIAGRAMS.dashboard,
        keyComponents: ["ProDashboard", "KPICards", "QuickActions", "TeamActivity"],
        apiEndpoints: ["convex/pro.getStats", "convex/pro.getActivity"],
        stateManagement: "Convex realtime + Context pour org/user info.",
    },
    "pro-idocument": {
        stack: [...CONVEX_STACK, "Firebase Storage"],
        pattern: "Gestion documentaire complète avec vue grille/liste.",
        dataFlow: "Metadata Convex + Fichiers Firebase Storage. Recherche full-text côté serveur.",
        diagram: DIAGRAMS.document,
        keyComponents: ["DocumentView", "GridListToggle", "AdvancedSearch", "BulkActions"],
        apiEndpoints: ["convex/documents.list", "convex/documents.create", "convex/documents.share"],
    },
    "pro-iarchive": {
        stack: [...CONVEX_STACK, "AES-256"],
        pattern: "Archive numérique multi-catégories avec coffre-fort.",
        dataFlow: "Archives catégorisées dans Convex. Coffre-fort avec chiffrement AES-256.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["ArchiveCategories", "SearchArchive", "VaultAccess"],
        apiEndpoints: ["convex/archives.list", "convex/archives.deposit"],
    },
    "pro-isignature": {
        stack: [...CONVEX_STACK, "PKI"],
        pattern: "Signature électronique qualifiée avec workflows.",
        dataFlow: "Documents à signer via Convex. Signature PKI. Workflow multi-signataires.",
        diagram: DIAGRAMS.signature,
        keyComponents: ["SignatureQueue", "WorkflowViewer", "SignAction"],
        apiEndpoints: ["convex/signatures.list", "convex/signatures.sign"],
    },
    "pro-iasted": {
        stack: [...FULL_STACK, "Google GenAI"],
        pattern: "Assistant IA conversationnel avec analyse de documents.",
        dataFlow: "Requêtes IA via Convex action → Google GenAI API. Historique conversations Convex.",
        diagram: `┌──────────────────────────────────┐
│        iAsted (IA Module)        │
│  ┌──────────────────────────┐   │
│  │  Chat Interface          │   │
│  │  [Message input]         │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Convex Action           │   │
│  │  (Server-side)           │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Google GenAI API        │   │
│  │  (Gemini / PaLM)         │   │
│  └────────────┬─────────────┘   │
│               ↓                  │
│  ┌──────────────────────────┐   │
│  │  Response + History      │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
  ↕ Convex actions + GenAI SDK`,
        keyComponents: ["AstedChat", "MessageBubble", "DocumentAnalysis", "HistoryPanel"],
        apiEndpoints: ["convex/ai.chat", "convex/ai.analyzeDoc", "Google GenAI API"],
        stateManagement: "useState pour messages locaux + Convex pour historique persisté.",
    },
    "pro-team": {
        stack: FIREBASE_STACK,
        pattern: "Team management avec invitation par email.",
        dataFlow: "Membres via Convex avec rôles. Invitation déclenche Firebase Auth invite.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["MemberTable", "InviteModal", "RoleSelector"],
        apiEndpoints: ["convex/team.list", "convex/team.invite", "convex/team.updateRole"],
    },
    "pro-settings": {
        stack: FIREBASE_STACK,
        pattern: "Paramètres utilisateur avec onglets.",
        dataFlow: "Préférences Convex + profil Firebase Auth.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["SettingsTabs", "ProfileForm", "ThemeSelector"],
        apiEndpoints: ["convex/users.updatePrefs"],
    },
    "pro-formation": {
        stack: BASE_STACK,
        pattern: "Formation contextuelle au rôle professionnel.",
        dataFlow: "Contenu statique. Contextuel au rôle org_user.",
        diagram: DIAGRAMS.formation,
        keyComponents: ["FormationModule", "GuideCard"],
    },
    "pro-billing": {
        stack: CONVEX_STACK,
        pattern: "Vue read-only abonnement + factures.",
        dataFlow: "Plan et factures depuis Convex. Factures générées par Stripe webhook.",
        diagram: DIAGRAMS.crud,
        keyComponents: ["PlanCard", "InvoiceTable", "UpgradeButton"],
        apiEndpoints: ["convex/billing.getForOrg"],
    },
    "pro-analytics": {
        stack: [...CONVEX_STACK, "Recharts"],
        pattern: "Analytics d'utilisation par module.",
        dataFlow: "Données agrégées Convex par période. Graphiques Recharts côté client.",
        diagram: DIAGRAMS.analytics,
        keyComponents: ["UsageCharts", "PeriodSelector", "ModuleBreakdown"],
        apiEndpoints: ["convex/analytics.getOrgUsage"],
    },

    // ━━━ Institutional ━━━━━━━━━━━━━━━━━━━━━━━━━
    "inst-dashboard": {
        stack: FULL_STACK,
        pattern: "Dashboard institutionnel avec score de conformité.",
        dataFlow: "KPIs depuis Convex. Score conformité calculé côté serveur. Alertes temps réel.",
        diagram: DIAGRAMS.dashboard,
        keyComponents: ["InstitutionalDashboard", "ComplianceScore", "AlertCards"],
        apiEndpoints: ["convex/institutional.getStats", "convex/compliance.getScore"],
    },
    "inst-idocument": {
        stack: [...CONVEX_STACK, "Firebase Storage"],
        pattern: "Gestion documentaire institutionnelle avec versioning.",
        dataFlow: "Documents dans Convex + Firebase Storage. Versioning automatique à chaque modification.",
        diagram: DIAGRAMS.document,
        keyComponents: ["DocumentList", "VersionHistory", "CollabEditor"],
        apiEndpoints: ["convex/documents.list", "convex/documents.create"],
    },
    "inst-iarchive-legal": {
        stack: [...CONVEX_STACK, "AES-256", "PKI"],
        pattern: "Archive légale certifiée avec scellé cryptographique.",
        dataFlow: "Documents scellés avec empreinte SHA-256 + horodatage certifié. Immutables.",
        diagram: DIAGRAMS.archive,
        keyComponents: ["LegalArchive", "SealVerifier", "TimestampCertificate"],
        apiEndpoints: ["convex/archives.seal", "convex/archives.verify"],
    },
    "inst-isignature-pending": {
        stack: [...CONVEX_STACK, "PKI"],
        pattern: "Signature électronique juridiquement contraignante.",
        dataFlow: "Documents à signer avec PKI qualifié. Horodatage légal.",
        diagram: DIAGRAMS.signature,
        keyComponents: ["SignatureList", "QualifiedSign", "RefuseWithComment"],
        apiEndpoints: ["convex/signatures.getPending", "convex/signatures.qualifiedSign"],
    },
    "inst-compliance": {
        stack: [...CONVEX_STACK, "Recharts"],
        pattern: "Dashboard conformité RGPD avec scoring automatique.",
        dataFlow: "Score calculé via Convex query aggregate. Alertes et rapports d'audit.",
        diagram: DIAGRAMS.analytics,
        keyComponents: ["ComplianceDashboard", "ScoreGauge", "AlertList", "AuditReport"],
        apiEndpoints: ["convex/compliance.getScore", "convex/compliance.getAlerts", "convex/audit.generate"],
    },
    "inst-formation": {
        stack: BASE_STACK,
        pattern: "Formation institutionnelle contextuelle.",
        dataFlow: "Contenu statique spécifique au rôle institutionnel.",
        diagram: DIAGRAMS.formation,
        keyComponents: ["FormationModule", "TutorialCards"],
    },
    "inst-parametres": {
        stack: FIREBASE_STACK,
        pattern: "Paramètres avec thème et sécurité renforcée.",
        dataFlow: "Préférences Convex. Sécurité renforcée via Firebase MFA.",
        diagram: DIAGRAMS.settings,
        keyComponents: ["SettingsTabs", "ProfileForm", "MFASetup"],
        apiEndpoints: ["convex/users.updatePrefs", "Firebase Auth MFA"],
    },
};

/**
 * Injects architecture data into a PageInfoMap based on pageId matching.
 */
export function injectArchitecture<T extends Record<string, { pageId: string }>>(
    pageInfoMap: T
): T {
    const result = { ...pageInfoMap };
    for (const key of Object.keys(result)) {
        const entry = result[key];
        const arch = ARCHITECTURE_DATA[entry.pageId];
        if (arch) {
            (result as Record<string, typeof entry & { architecture?: typeof arch }>)[key] = {
                ...entry,
                architecture: arch,
            };
        }
    }
    return result;
}
