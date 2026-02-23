// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Payment Provider: Chèque
// 🔲 BASE PRÉPARÉE — Mode manuel avec confirmation admin
// ═══════════════════════════════════════════════

import type {
    PaymentProvider,
    PaymentRequest,
    PaymentResult,
    RefundResult,
    PaymentMethodType,
} from "./index";

/**
 * CheckProvider
 *
 * Flux:
 * 1. Le client déclare l'envoi d'un chèque → statut "pending"
 * 2. L'admin reçoit et encaisse le chèque
 * 3. L'admin confirme l'encaissement → statut "completed"
 *
 * Ce provider ne se connecte à aucune API.
 * Il crée une transaction en attente de confirmation manuelle.
 *
 * Pour activer:
 * 1. Configurer l'adresse de réception des chèques
 * 2. Mettre `isAvailable` à true
 */
export class CheckProvider implements PaymentProvider {
    readonly name = "check" as const;
    readonly displayName = "Chèque";
    readonly supportedMethods: PaymentMethodType[] = ["check"];
    readonly isAvailable = false; // ← Activer quand l'adresse est configurée

    /** Adresse de réception des chèques */
    static readonly MAILING_ADDRESS = {
        company: "DIGITALIUM.IO SARL",
        address: "À configurer",
        city: "Libreville",
        country: "Gabon",
        attn: "Service Comptabilité",
    };

    canHandle(method: PaymentMethodType): boolean {
        return this.supportedMethods.includes(method);
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResult> {
        const txnId = `CHK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        if (!request.checkNumber) {
            return {
                success: false,
                externalId: txnId,
                externalStatus: "missing_check_number",
                status: "failed",
                message: "Le numéro de chèque est requis",
            };
        }

        return {
            success: true,
            externalId: txnId,
            externalStatus: "awaiting_check",
            status: "pending",
            message: `Chèque n°${request.checkNumber} enregistré. En attente de réception et d'encaissement.`,
            metadata: {
                checkNumber: request.checkNumber,
                bankName: request.bankName,
                mailingAddress: CheckProvider.MAILING_ADDRESS,
                amount: request.amount,
                currency: request.currency,
            },
        };
    }

    async getPaymentStatus(externalId: string): Promise<PaymentResult> {
        return {
            success: true,
            externalId,
            externalStatus: "awaiting_deposit",
            status: "pending",
            message: "En attente de réception et d'encaissement du chèque",
        };
    }

    async refund(externalId: string, amount?: number): Promise<RefundResult> {
        void amount;
        return {
            success: true,
            refundId: `CHK-REFUND-${Date.now()}`,
            message: `Remboursement par chèque à émettre manuellement pour ${externalId}`,
        };
    }
}
