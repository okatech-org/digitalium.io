// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Organization Presets
// Pre-built configuration templates per org type
// ═══════════════════════════════════════════════

import type { OrgWorkflowBundle } from "./workflow-config";
import { buildOrgConfig, type OrganizationConfig, type OrgType } from "./org-config";

/* ───────────────────────────────────────────────
   Workflow Presets
   ─────────────────────────────────────────────── */

/** Entreprise (PME) — Simple approval + archive workflows */
const ENTERPRISE_WORKFLOWS: OrgWorkflowBundle = {
    workflows: [
        {
            id: "wf-ent-approval",
            name: "Validation Directeur Général",
            description: "Circuit d'approbation simple — soumission → DG valide → publié",
            trigger: "document.submitted",
            steps: [
                { id: "s1", type: "notification", label: "Notifier le DG", assignTo: { type: "role", value: "org_admin" }, order: 1 },
                { id: "s2", type: "approval", label: "Approbation DG", assignTo: { type: "role", value: "org_admin" }, order: 2 },
                { id: "s3", type: "notification", label: "Notifier l'auteur", assignTo: { type: "role", value: "org_member" }, order: 3 },
            ],
            isActive: true,
            isTemplate: true,
            orgType: "enterprise",
        },
        {
            id: "wf-ent-archive",
            name: "Archivage automatique post-signature",
            description: "Archivage automatique après complétion de toutes les signatures",
            trigger: "signature.completed",
            steps: [
                { id: "s1", type: "auto_archive", label: "Archiver le document signé", order: 1 },
                { id: "s2", type: "notification", label: "Confirmer l'archivage", assignTo: { type: "role", value: "org_admin" }, order: 2 },
            ],
            isActive: true,
            isTemplate: true,
            orgType: "enterprise",
        },
    ],
    processes: [
        {
            id: "proc-ent-contract",
            name: "Traitement des contrats",
            description: "Validation obligatoire pour tout document de type contrat",
            type: "approval",
            rules: [
                { id: "r1", condition: "document.tags.includes('contrat')", action: "require_approval", params: { minLevel: 2 } },
            ],
            isActive: true,
        },
    ],
    automations: [
        {
            id: "auto-ent-reminder",
            name: "Rappel signatures en attente",
            description: "Envoi de rappels quotidiens pour les signatures en attente depuis plus de 48h",
            trigger: "schedule",
            triggerConfig: { cron: "0 9 * * *" },
            actions: [
                { type: "send_reminder", params: { threshold: 48, unit: "hours" } },
            ],
            isActive: true,
            schedule: "0 9 * * *",
        },
        {
            id: "auto-ent-retention",
            name: "Alertes rétention archives",
            description: "Notification 30 jours avant expiration de la rétention",
            trigger: "schedule",
            triggerConfig: { cron: "0 8 * * 1" },
            actions: [
                { type: "flag_compliance", params: { daysBeforeExpiry: 30 } },
            ],
            isActive: true,
            schedule: "0 8 * * 1",
        },
    ],
};

/** Administration — Multi-level hierarchical workflows */
const ADMINISTRATION_WORKFLOWS: OrgWorkflowBundle = {
    workflows: [
        {
            id: "wf-admin-hierarchical",
            name: "Validation hiérarchique multi-niveaux",
            description: "Circuit de validation : Chef de service → Directeur → Secrétaire Général → Ministre",
            trigger: "document.submitted",
            steps: [
                { id: "s1", type: "review", label: "Revue Chef de service", assignTo: { type: "role", value: "org_member" }, order: 1 },
                { id: "s2", type: "approval", label: "Validation Directeur", assignTo: { type: "role", value: "org_manager" }, order: 2 },
                { id: "s3", type: "approval", label: "Approbation finale", assignTo: { type: "role", value: "org_admin" }, order: 3 },
                { id: "s4", type: "notification", label: "Notification diffusion", order: 4 },
            ],
            isActive: true,
            isTemplate: true,
            orgType: "government",
        },
        {
            id: "wf-admin-parapheur",
            name: "Parapheur électronique",
            description: "Circuit de signatures hiérarchique pour les actes administratifs",
            trigger: "signature.requested",
            steps: [
                { id: "s1", type: "notification", label: "Mise en parapheur", order: 1 },
                { id: "s2", type: "approval", label: "Visa technique", assignTo: { type: "role", value: "org_manager" }, order: 2 },
                { id: "s3", type: "auto_sign", label: "Signature officielle", assignTo: { type: "role", value: "org_admin" }, order: 3 },
                { id: "s4", type: "auto_archive", label: "Archivage réglementaire", order: 4 },
            ],
            isActive: true,
            isTemplate: true,
            orgType: "government",
        },
    ],
    processes: [
        {
            id: "proc-admin-audit",
            name: "Journalisation obligatoire",
            description: "Toute action est tracée dans le journal d'audit",
            type: "compliance",
            rules: [
                { id: "r1", condition: "action.type !== 'read'", action: "log_audit" },
            ],
            isActive: true,
        },
    ],
    automations: [
        {
            id: "auto-admin-reports",
            name: "Rapports hebdomadaires de conformité",
            trigger: "schedule",
            triggerConfig: { cron: "0 7 * * 1" },
            actions: [
                { type: "generate_report", params: { type: "compliance_weekly" } },
                { type: "send_notification", params: { to: "org_admin" } },
            ],
            isActive: true,
            schedule: "0 7 * * 1",
        },
    ],
};

/** Organisme — Committee-driven workflows */
const ORGANISME_WORKFLOWS: OrgWorkflowBundle = {
    workflows: [
        {
            id: "wf-org-committee",
            name: "Validation par comité",
            description: "Soumission au comité de validation — quorum requis",
            trigger: "document.submitted",
            steps: [
                { id: "s1", type: "review", label: "Instruction du dossier", assignTo: { type: "role", value: "org_member" }, order: 1 },
                { id: "s2", type: "approval", label: "Vote du comité", assignTo: { type: "group", value: "committee" }, order: 2, config: { quorum: 3 } },
                { id: "s3", type: "notification", label: "Publication de la décision", order: 3 },
            ],
            isActive: true,
            isTemplate: true,
            orgType: "institution",
        },
    ],
    processes: [
        {
            id: "proc-org-regulatory",
            name: "Conformité réglementaire",
            description: "Vérification automatique de la conformité avant archivage",
            type: "compliance",
            rules: [
                { id: "r1", condition: "archive.category === 'regulatory'", action: "require_compliance_check" },
            ],
            isActive: true,
        },
    ],
    automations: [
        {
            id: "auto-org-retention",
            name: "Alertes conformité rétention",
            trigger: "schedule",
            triggerConfig: { cron: "0 8 1 * *" },
            actions: [
                { type: "flag_compliance", params: { scope: "all_archives" } },
                { type: "generate_report", params: { type: "retention_status" } },
            ],
            isActive: true,
            schedule: "0 8 1 * *",
        },
    ],
};

/** Platform (Digitalium internal) — Admin + support workflows */
const PLATFORM_WORKFLOWS: OrgWorkflowBundle = {
    workflows: [
        {
            id: "wf-platform-onboard",
            name: "Onboarding nouvelle organisation",
            description: "Circuit d'activation d'une nouvelle organisation cliente",
            trigger: "member.joined",
            steps: [
                { id: "s1", type: "notification", label: "Notification support", assignTo: { type: "role", value: "platform_admin" }, order: 1 },
                { id: "s2", type: "review", label: "Vérification KYC", assignTo: { type: "role", value: "platform_admin" }, order: 2 },
                { id: "s3", type: "notification", label: "Bienvenue client", order: 3 },
            ],
            isActive: true,
            isTemplate: true,
        },
    ],
    processes: [],
    automations: [
        {
            id: "auto-platform-monitor",
            name: "Monitoring quotidien",
            trigger: "schedule",
            triggerConfig: { cron: "0 6 * * *" },
            actions: [
                { type: "generate_report", params: { type: "platform_health" } },
            ],
            isActive: true,
            schedule: "0 6 * * *",
        },
    ],
};

/* ───────────────────────────────────────────────
   Workflow bundles by org type
   ─────────────────────────────────────────────── */

export const ORG_WORKFLOW_PRESETS: Record<OrgType, OrgWorkflowBundle> = {
    enterprise: ENTERPRISE_WORKFLOWS,
    institution: ORGANISME_WORKFLOWS,
    government: ADMINISTRATION_WORKFLOWS,
    platform: PLATFORM_WORKFLOWS,
};

/* ───────────────────────────────────────────────
   Organization Config Presets
   ─────────────────────────────────────────────── */

export const ORG_CONFIG_PRESETS: Record<OrgType, Omit<OrganizationConfig, "id" | "name">> = {
    enterprise: buildOrgConfig({
        id: "__preset__",
        name: "__preset__",
        type: "enterprise",
        branding: {
            primaryColor: "#8B5CF6",
            gradient: "from-violet-500 to-purple-500",
        },
        modules: ["idocument", "iarchive", "isignature", "iasted"],
        dashboard: {
            showActivityChart: true,
            showTeamWidget: true,
            showQuickActions: true,
            showRecentDocs: true,
            kpiModules: ["idocument", "iarchive", "isignature", "iasted"],
            greeting: "Bienvenue chez {orgName}",
        },
        navigation: {
            showBilling: true,
            showApiIntegrations: true,
            showAnalytics: true,
            showFormation: false,
        },
    }),

    institution: buildOrgConfig({
        id: "__preset__",
        name: "__preset__",
        type: "institution",
        branding: {
            primaryColor: "#F59E0B",
            gradient: "from-amber-500 to-orange-500",
        },
        modules: ["idocument", "iarchive", "isignature", "iasted"],
        dashboard: {
            showActivityChart: true,
            showTeamWidget: true,
            showQuickActions: true,
            showRecentDocs: true,
            kpiModules: ["idocument", "iarchive", "isignature", "iasted"],
            greeting: "Bienvenue — {orgName}",
        },
        navigation: {
            showBilling: false,
            showApiIntegrations: false,
            showAnalytics: true,
            showFormation: true,
        },
    }),

    government: buildOrgConfig({
        id: "__preset__",
        name: "__preset__",
        type: "government",
        branding: {
            primaryColor: "#10B981",
            gradient: "from-emerald-500 to-teal-500",
        },
        modules: ["idocument", "iarchive", "isignature", "iasted"],
        dashboard: {
            showActivityChart: true,
            showTeamWidget: true,
            showQuickActions: true,
            showRecentDocs: true,
            kpiModules: ["idocument", "iarchive", "isignature"],
            greeting: "Bienvenue — {orgName}",
        },
        navigation: {
            showBilling: false,
            showApiIntegrations: false,
            showAnalytics: true,
            showFormation: true,
        },
    }),

    platform: buildOrgConfig({
        id: "__preset__",
        name: "__preset__",
        type: "platform",
        branding: {
            primaryColor: "#EF4444",
            gradient: "from-red-500 to-orange-500",
        },
        modules: ["idocument", "iarchive", "isignature", "iasted"],
        dashboard: {
            showActivityChart: true,
            showTeamWidget: true,
            showQuickActions: true,
            showRecentDocs: true,
            kpiModules: ["idocument", "iarchive", "isignature", "iasted"],
            greeting: "Bienvenue sur la plateforme {orgName}",
        },
        navigation: {
            showBilling: true,
            showApiIntegrations: true,
            showAnalytics: true,
            showFormation: false,
        },
    }),
};

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

/** Get the workflow preset for an org type. */
export function getWorkflowPreset(type: OrgType): OrgWorkflowBundle {
    return ORG_WORKFLOW_PRESETS[type] ?? ORG_WORKFLOW_PRESETS.enterprise;
}

/** Get the config preset for an org type. */
export function getConfigPreset(type: OrgType): Omit<OrganizationConfig, "id" | "name"> {
    return ORG_CONFIG_PRESETS[type] ?? ORG_CONFIG_PRESETS.enterprise;
}

/** Build a complete org config from a name, type, and optional overrides. */
export function buildOrgFromPreset(
    id: string,
    name: string,
    type: OrgType,
    overrides?: Partial<OrganizationConfig>
): OrganizationConfig {
    const preset = getConfigPreset(type);
    return {
        ...preset,
        id,
        name,
        type,
        ...overrides,
    } as OrganizationConfig;
}
