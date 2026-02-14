// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Config: Workflow & Process Configuration
// Customizable per-organization workflows, processes, automations
// ═══════════════════════════════════════════════

/* ───────────────────────────────────────────────
   Workflow Types
   ─────────────────────────────────────────────── */

export type WorkflowTrigger =
    | "document.created"
    | "document.submitted"
    | "document.approved"
    | "archive.uploaded"
    | "archive.expiring"
    | "signature.requested"
    | "signature.completed"
    | "member.joined"
    | "manual";

export type WorkflowStepType =
    | "approval"      // Requires approval from a user/role
    | "review"        // Requires review (no binding decision)
    | "notification"  // Send notification
    | "auto_archive"  // Automatically archive
    | "auto_sign"     // Auto-forward for signature
    | "webhook"       // External webhook call
    | "delay";        // Wait for a period

export interface WorkflowStep {
    id: string;
    type: WorkflowStepType;
    label: string;
    assignTo?: {
        type: "user" | "role" | "group";
        value: string;  // userId, role name, or group id
    };
    config?: Record<string, unknown>;
    order: number;
}

export interface WorkflowConfig {
    id: string;
    name: string;
    description?: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    isActive: boolean;
    isTemplate: boolean;      // true = available for org customization
    orgType?: string;          // restrict to specific org type
}

/* ───────────────────────────────────────────────
   Process Types
   ─────────────────────────────────────────────── */

export type ProcessType =
    | "approval"      // Document approval circuit
    | "review"        // Document review circuit
    | "archive"       // Archiving process
    | "notification"  // Notification dispatch
    | "compliance";   // Regulatory compliance check

export interface ProcessRule {
    id: string;
    condition: string;        // e.g. "document.type === 'contract'"
    action: string;           // e.g. "require_approval"
    params?: Record<string, unknown>;
}

export interface ProcessConfig {
    id: string;
    name: string;
    description?: string;
    type: ProcessType;
    rules: ProcessRule[];
    isActive: boolean;
}

/* ───────────────────────────────────────────────
   Automation Types
   ─────────────────────────────────────────────── */

export type AutomationTrigger =
    | "schedule"      // Cron-based
    | "event"         // Event-based
    | "threshold";    // Metric threshold

export type AutomationAction =
    | "send_notification"
    | "archive_document"
    | "generate_report"
    | "send_reminder"
    | "flag_compliance"
    | "webhook";

export interface AutomationConfig {
    id: string;
    name: string;
    description?: string;
    trigger: AutomationTrigger;
    triggerConfig: Record<string, unknown>;  // cron, event name, threshold
    actions: {
        type: AutomationAction;
        params?: Record<string, unknown>;
    }[];
    isActive: boolean;
    schedule?: string;  // Cron expression if trigger = "schedule"
}

/* ───────────────────────────────────────────────
   Full Org Workflow Bundle
   ─────────────────────────────────────────────── */

export interface OrgWorkflowBundle {
    workflows: WorkflowConfig[];
    processes: ProcessConfig[];
    automations: AutomationConfig[];
}

/** Empty workflow bundle — default for new orgs. */
export const EMPTY_WORKFLOW_BUNDLE: OrgWorkflowBundle = {
    workflows: [],
    processes: [],
    automations: [],
};
