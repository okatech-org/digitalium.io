// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Payment Provider: Virement Bancaire
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
 * BankTransferProvider
 *
 * Flux:
 * 1. Le client initie le paiement → statut "pending"
 * 2. Le client effectue le virement depuis sa banque
 * 3. L'admin confirme la réception → statut "completed"
 *
 * Ce provider ne se connecte pas à une API bancaire.
 * Il crée une transaction en attente de confirmation manuelle.
 *
 * Pour activer:
 * 1. Configurer les coordonnées bancaires dans les paramètres
 * 2. Mettre `isAvailable` à true
 */
export class BankTransferProvider implements PaymentProvider {
    readonly name = "bank_transfer" as const;
    readonly displayName = "Virement Bancaire";
    readonly supportedMethods: PaymentMethodType[] = ["bank_transfer"];
    readonly isAvailable = false; // ← Activer quand les coordonnées sont configurées

    /** Coordonnées bancaires de DIGITALIUM.IO pour le Gabon */
    static readonly BANK_DETAILS = {
        bankName: "À configurer",
        accountName: "DIGITALIUM.IO SARL",
        iban: "À configurer",
        bic: "À configurer",
        reference: "DIGpay-{txnId}",
    };

    canHandle(method: PaymentMethodType): boolean {
        return this.supportedMethods.includes(method);
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResult> {
        const txnId = `BT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        // Le virement est toujours "pending" jusqu'à confirmation manuelle
        return {
            success: true,
            externalId: txnId,
            externalStatus: "awaiting_transfer",
            status: "pending",
            message: `Veuillez effectuer un virement de ${request.amount} ${request.currency} avec la référence ${BankTransferProvider.BANK_DETAILS.reference.replace("{txnId}", txnId)}`,
            metadata: {
                bankDetails: BankTransferProvider.BANK_DETAILS,
                transferReference: request.transferReference ?? txnId,
                amount: request.amount,
                currency: request.currency,
            },
        };
    }

    async getPaymentStatus(externalId: string): Promise<PaymentResult> {
        // En production, vérifier si l'admin a confirmé la réception
        return {
            success: true,
            externalId,
            externalStatus: "awaiting_confirmation",
            status: "pending",
            message: "En attente de confirmation de réception du virement par l'administrateur",
        };
    }

    async refund(externalId: string, amount?: number): Promise<RefundResult> {
        void amount;
        return {
            success: true,
            refundId: `BT-REFUND-${Date.now()}`,
            message: `Remboursement par virement à effectuer manuellement pour ${externalId}`,
        };
    }
}
