// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Payment Provider Abstraction
// Strategy pattern: chaque fournisseur implémente PaymentProvider
//
// Fournisseurs supportés:
//   ✅ Simulation (actif — mode dev/demo)
//   🔲 Stripe (base préparée)
//   🔲 Airtel Money (base préparée)
//   🔲 Virement Bancaire (base préparée)
//   🔲 Chèque (base préparée)
// ═══════════════════════════════════════════════

// ─── Types ─────────────────────────────────────

export type PaymentMethodType =
    | "mobile_money"
    | "bank_transfer"
    | "card"
    | "check"
    | "simulation";

export type ProviderType =
    | "airtel_money"
    | "stripe"
    | "bank_transfer"
    | "check"
    | "simulation";

export type PaymentStatusType =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "refunded"
    | "cancelled";

export interface PaymentRequest {
    amount: number;
    currency: string;
    description?: string;

    // Mobile money
    phoneNumber?: string;

    // Card
    cardToken?: string;

    // Check
    checkNumber?: string;
    bankName?: string;

    // Bank transfer
    transferReference?: string;

    // Generic metadata
    metadata?: Record<string, unknown>;
}

export interface PaymentResult {
    success: boolean;
    externalId: string;
    externalStatus: string;
    status: PaymentStatusType;
    message?: string;
    metadata?: Record<string, unknown>;
}

export interface RefundResult {
    success: boolean;
    refundId: string;
    message?: string;
}

// ─── Provider Interface ────────────────────────

export interface PaymentProvider {
    readonly name: ProviderType;
    readonly displayName: string;
    readonly supportedMethods: PaymentMethodType[];
    readonly isAvailable: boolean;

    /** Initiate a payment */
    createPayment(request: PaymentRequest): Promise<PaymentResult>;

    /** Check payment status by external ID */
    getPaymentStatus(externalId: string): Promise<PaymentResult>;

    /** Process a refund */
    refund(externalId: string, amount?: number): Promise<RefundResult>;

    /** Validate that this provider can handle the given method */
    canHandle(method: PaymentMethodType): boolean;
}

// ─── Providers ─────────────────────────────────

import { SimulationProvider } from "./simulation";
import { StripeProvider } from "./stripe";
import { AirtelMoneyProvider } from "./airtel-money";
import { BankTransferProvider } from "./bank-transfer";
import { CheckProvider } from "./check";

export { SimulationProvider, StripeProvider, AirtelMoneyProvider, BankTransferProvider, CheckProvider };

/**
 * PaymentGateway — central facade that routes to the correct provider.
 *
 * Usage:
 *   const gw = new PaymentGateway();
 *   const result = await gw.pay("simulation", { amount: 49000, currency: "XAF" });
 */
export class PaymentGateway {
    private providers: Map<ProviderType, PaymentProvider>;

    constructor() {
        this.providers = new Map();

        const all: PaymentProvider[] = [
            new SimulationProvider(),
            new StripeProvider(),
            new AirtelMoneyProvider(),
            new BankTransferProvider(),
            new CheckProvider(),
        ];

        for (const provider of all) {
            this.providers.set(provider.name, provider);
        }
    }

    /** Get a specific provider */
    getProvider(name: ProviderType): PaymentProvider | undefined {
        return this.providers.get(name);
    }

    /** List all registered providers */
    listProviders(): { name: ProviderType; displayName: string; available: boolean; methods: PaymentMethodType[] }[] {
        return Array.from(this.providers.values()).map((p) => ({
            name: p.name,
            displayName: p.displayName,
            available: p.isAvailable,
            methods: p.supportedMethods,
        }));
    }

    /** List only available providers */
    listAvailable(): PaymentProvider[] {
        return Array.from(this.providers.values()).filter((p) => p.isAvailable);
    }

    /** Resolve the best provider for a payment method */
    resolveProvider(method: PaymentMethodType): PaymentProvider | null {
        for (const provider of Array.from(this.providers.values())) {
            if (provider.isAvailable && provider.canHandle(method)) {
                return provider;
            }
        }
        return null;
    }

    /** Pay using a specific provider */
    async pay(providerName: ProviderType, request: PaymentRequest): Promise<PaymentResult> {
        const provider = this.providers.get(providerName);
        if (!provider) {
            return {
                success: false,
                externalId: "",
                externalStatus: "error",
                status: "failed",
                message: `Fournisseur "${providerName}" non trouvé`,
            };
        }
        if (!provider.isAvailable) {
            return {
                success: false,
                externalId: "",
                externalStatus: "unavailable",
                status: "failed",
                message: `Fournisseur "${provider.displayName}" non disponible. Activez-le dans la configuration.`,
            };
        }
        return provider.createPayment(request);
    }
}
