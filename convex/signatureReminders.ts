import { internalMutation } from "./_generated/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Signature Reminders
// Automated reminder processing for pending signatures
// ═══════════════════════════════════════════════

const THREE_DAYS_MS = 3 * 24 * 3600 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 3600 * 1000;

export const processReminders = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const threeDaysFromNow = now + THREE_DAYS_MS;

        // Get all pending/in_progress signatures
        const pendingSigs = await ctx.db
            .query("signatures")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        const inProgressSigs = await ctx.db
            .query("signatures")
            .withIndex("by_status", (q) => q.eq("status", "in_progress"))
            .collect();

        const allPending = [...pendingSigs, ...inProgressSigs];

        let remindersCreated = 0;

        for (const sig of allPending) {
            // Only process signatures with a dueDate within the next 3 days
            if (!sig.dueDate || sig.dueDate > threeDaysFromNow || sig.dueDate < now) {
                continue;
            }

            // Skip if a reminder was already sent in the last 24 hours
            if (
                sig.lastReminderSentAt &&
                now - sig.lastReminderSentAt < TWENTY_FOUR_HOURS_MS
            ) {
                continue;
            }

            // Update lastReminderSentAt on the signature
            await ctx.db.patch(sig._id, {
                lastReminderSentAt: now,
                updatedAt: now,
            });

            // Insert audit log entry for the reminder
            await ctx.db.insert("audit_logs", {
                organizationId: sig.organizationId,
                userId: "system",
                action: "signature.auto_reminder_sent",
                resourceType: "signature" as const,
                resourceId: String(sig._id),
                details: {
                    dueDate: sig.dueDate,
                    pendingSigners: sig.signers
                        .filter((s) => s.status === "pending")
                        .map((s) => s.email),
                },
                createdAt: now,
            });

            remindersCreated++;
        }

        return { remindersCreated };
    },
});
