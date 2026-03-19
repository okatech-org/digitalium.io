// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Payment Provider: Airtel Money
// Auto-activates when AIRTEL_MONEY_CLIENT_ID is set
// ═══════════════════════════════════════════════

import type {
    PaymentProvider,
    PaymentRequest,
    PaymentResult,
    RefundResult,
    PaymentMethodType,
} from "./index";

/**
 * AirtelMoneyProvider
 *
 * Pour activer:
 * 1. Obtenir les identifiants API Airtel Money Gabon
 * 2. Configurer les variables d'environnement:
 *    - AIRTEL_MONEY_CLIENT_ID
 *    - AIRTEL_MONEY_CLIENT_SECRET
 *    - AIRTEL_MONEY_ENVIRONMENT (sandbox | production)
 * 3. Mettre `isAvailable` à true
 *
 * API Flow:
 * 1. POST /auth/oauth2/token → obtenir access_token
 * 2. POST /merchant/v2/payments → initier le paiement
 * 3. GET /standard/v1/payments/{id} → vérifier le statut
 *
 * Docs: https://developers.airtel.africa/
 */
export class AirtelMoneyProvider implements PaymentProvider {
    readonly name = "airtel_money" as const;
    readonly displayName = "Airtel Money";
    readonly supportedMethods: PaymentMethodType[] = ["mobile_money"];

    /** Auto-detect live mode from environment variable */
    readonly isLive = Boolean(
        typeof process !== "undefined" &&
        process.env?.AIRTEL_MONEY_CLIENT_ID
    );
    readonly isAvailable = Boolean(
        typeof process !== "undefined" &&
        process.env?.AIRTEL_MONEY_CLIENT_ID
    );

    getMode(): "live" | "simulation" {
        return this.isLive ? "live" : "simulation";
    }

    // private baseUrl: string;
    // private clientId: string;
    // private clientSecret: string;
    //
    // constructor() {
    //     const env = process.env.AIRTEL_MONEY_ENVIRONMENT ?? "sandbox";
    //     this.baseUrl = env === "production"
    //         ? "https://openapi.airtel.africa"
    //         : "https://openapiuat.airtel.africa";
    //     this.clientId = process.env.AIRTEL_MONEY_CLIENT_ID!;
    //     this.clientSecret = process.env.AIRTEL_MONEY_CLIENT_SECRET!;
    // }

    canHandle(method: PaymentMethodType): boolean {
        return this.supportedMethods.includes(method);
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResult> {
        // TODO: Implémenter avec l'API Airtel Money
        // 1. Obtenir token OAuth2
        // 2. POST /merchant/v2/payments avec:
        //    - subscriber.msisdn = request.phoneNumber
        //    - transaction.amount = request.amount
        //    - transaction.currency = "XAF"
        //    - transaction.country = "GA"
        void request;
        return {
            success: false,
            externalId: "",
            externalStatus: "not_configured",
            status: "failed",
            message: "Airtel Money n'est pas encore configuré. Ajoutez les identifiants API.",
        };
    }

    async getPaymentStatus(externalId: string): Promise<PaymentResult> {
        // TODO: GET /standard/v1/payments/{externalId}
        return {
            success: false,
            externalId,
            externalStatus: "not_configured",
            status: "failed",
            message: "Airtel Money non configuré",
        };
    }

    async refund(externalId: string, amount?: number): Promise<RefundResult> {
        // TODO: POST /standard/v1/payments/refund
        void externalId;
        void amount;
        return {
            success: false,
            refundId: "",
            message: "Airtel Money non configuré",
        };
    }
}
