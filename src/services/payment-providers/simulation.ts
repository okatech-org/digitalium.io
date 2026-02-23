// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Payment Provider: Simulation
// ✅ ACTIF — Mode développement / démo
// Auto-approuve le paiement après un délai simulé
// ═══════════════════════════════════════════════

import type {
    PaymentProvider,
    PaymentRequest,
    PaymentResult,
    RefundResult,
    PaymentMethodType,
} from "./index";

export class SimulationProvider implements PaymentProvider {
    readonly name = "simulation" as const;
    readonly displayName = "Mode Simulation";
    readonly supportedMethods: PaymentMethodType[] = [
        "mobile_money",
        "bank_transfer",
        "card",
        "check",
        "simulation",
    ];
    readonly isAvailable = true; // ← Toujours actif

    canHandle(method: PaymentMethodType): boolean {
        return this.supportedMethods.includes(method);
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResult> {
        // Simulate a small processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const txnId = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        // Simulate different outcomes based on amount for testing
        // Amount ending in 99 = fail, else = success
        const willFail = request.amount % 100 === 99;

        if (willFail) {
            return {
                success: false,
                externalId: txnId,
                externalStatus: "declined",
                status: "failed",
                message: "[Simulation] Paiement refusé — montant se terminant par 99 (test d'erreur)",
                metadata: {
                    simulatedAt: new Date().toISOString(),
                    testMode: true,
                },
            };
        }

        return {
            success: true,
            externalId: txnId,
            externalStatus: "approved",
            status: "completed",
            message: "[Simulation] Paiement approuvé automatiquement",
            metadata: {
                simulatedAt: new Date().toISOString(),
                testMode: true,
                originalAmount: request.amount,
                currency: request.currency,
            },
        };
    }

    async getPaymentStatus(externalId: string): Promise<PaymentResult> {
        return {
            success: true,
            externalId,
            externalStatus: "approved",
            status: "completed",
            message: "[Simulation] Statut vérifié",
        };
    }

    async refund(externalId: string, amount?: number): Promise<RefundResult> {
        return {
            success: true,
            refundId: `SIM-REFUND-${Date.now()}`,
            message: `[Simulation] Remboursement de ${amount ?? "total"} XAF effectué pour ${externalId}`,
        };
    }
}
