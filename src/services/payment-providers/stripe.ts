// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Payment Provider: Stripe
// 🔲 BASE PRÉPARÉE — Nécessite clé API pour activation
// ═══════════════════════════════════════════════

import type {
    PaymentProvider,
    PaymentRequest,
    PaymentResult,
    RefundResult,
    PaymentMethodType,
} from "./index";

/**
 * StripeProvider
 *
 * Pour activer:
 * 1. Installer `stripe` : npm install stripe
 * 2. Configurer la variable d'environnement STRIPE_SECRET_KEY
 * 3. Mettre `isAvailable` à true
 * 4. Implémenter createPayment avec Stripe PaymentIntents API
 *
 * Docs: https://docs.stripe.com/api/payment_intents
 */
export class StripeProvider implements PaymentProvider {
    readonly name = "stripe" as const;
    readonly displayName = "Stripe (Carte Bancaire)";
    readonly supportedMethods: PaymentMethodType[] = ["card"];
    readonly isAvailable = false; // ← Activer quand la clé API est configurée

    // private stripe: Stripe;
    // constructor() {
    //     this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });
    // }

    canHandle(method: PaymentMethodType): boolean {
        return this.supportedMethods.includes(method);
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResult> {
        // TODO: Implémenter avec Stripe PaymentIntents
        // const paymentIntent = await this.stripe.paymentIntents.create({
        //     amount: request.amount,
        //     currency: request.currency.toLowerCase(),
        //     payment_method: request.cardToken,
        //     confirm: true,
        //     metadata: request.metadata,
        // });
        return {
            success: false,
            externalId: "",
            externalStatus: "not_configured",
            status: "failed",
            message: "Stripe n'est pas encore configuré. Ajoutez STRIPE_SECRET_KEY.",
        };
    }

    async getPaymentStatus(externalId: string): Promise<PaymentResult> {
        // TODO: const pi = await this.stripe.paymentIntents.retrieve(externalId);
        return {
            success: false,
            externalId,
            externalStatus: "not_configured",
            status: "failed",
            message: "Stripe non configuré",
        };
    }

    async refund(externalId: string, amount?: number): Promise<RefundResult> {
        // TODO: await this.stripe.refunds.create({ payment_intent: externalId, amount });
        void amount;
        return {
            success: false,
            refundId: "",
            message: "Stripe non configuré",
        };
    }
}
