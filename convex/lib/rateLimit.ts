import type { GenericMutationCtx } from "convex/server";

export async function checkRateLimit(
    ctx: any,
    userId: string,
    action: string,
    maxPerMinute: number = 30
): Promise<void> {
    const oneMinuteAgo = Date.now() - 60_000;
    const recentLogs = await ctx.db
        .query("audit_logs")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .filter((q: any) => q.gte(q.field("createdAt"), oneMinuteAgo))
        .collect();

    const actionLogs = recentLogs.filter((l: any) => l.action.startsWith(action));

    if (actionLogs.length >= maxPerMinute) {
        throw new Error(
            `Limite de fréquence atteinte: ${maxPerMinute} ${action} par minute. Veuillez patienter.`
        );
    }
}
