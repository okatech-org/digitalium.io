// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Services: Payment Service
// Façade client-side pour les paiements multi-fournisseur
//
// Architecture:
//   Client → PaymentService → PaymentGateway → Provider
//                           → Convex (enregistrement)
// ═══════════════════════════════════════════════

import {
    PaymentGateway,
    type PaymentMethodType,
    type ProviderType,
    type PaymentResult,
} from "./payment-providers";

// ─── Singleton ──────────────────────────────────

let _gateway: PaymentGateway | null = null;

function getGateway(): PaymentGateway {
    if (!_gateway) _gateway = new PaymentGateway();
    return _gateway;
}

// ─── Types ──────────────────────────────────────

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    provider: ProviderType;
    label: string;
    last4?: string;
    isDefault: boolean;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: "pending" | "processing" | "completed" | "failed";
    method: PaymentMethod;
    providerResult?: PaymentResult;
    createdAt: Date;
}

// ─── Service Functions ──────────────────────────

/**
 * Initiate a payment via the active provider.
 * In simulation mode, payments are auto-approved.
 */
export async function createPayment(
    amount: number,
    currency: string,
    method: PaymentMethodType,
    options?: {
        phoneNumber?: string;
        checkNumber?: string;
        bankName?: string;
        transferReference?: string;
        cardToken?: string;
        description?: string;
    }
): Promise<PaymentIntent> {
    const gateway = getGateway();

    // Resolve provider for the given method
    const provider = gateway.resolveProvider(method);
    const providerName: ProviderType = provider?.name ?? "simulation";

    const result = await gateway.pay(providerName, {
        amount,
        currency,
        ...options,
    });

    return {
        id: result.externalId || `LOCAL-${Date.now()}`,
        amount,
        currency,
        status: result.status === "completed" ? "completed" :
            result.status === "failed" ? "failed" :
                result.status === "processing" ? "processing" : "pending",
        method: {
            id: providerName,
            type: method,
            provider: providerName,
            label: provider?.displayName ?? "Inconnu",
            isDefault: false,
        },
        providerResult: result,
        createdAt: new Date(),
    };
}

/**
 * Get payment history for a user.
 * In production, this queries the Convex `payments` table.
 * For now, returns from local state.
 */
export async function getPaymentHistory(
    _userId: string
): Promise<PaymentIntent[]> {
    // In a React component, use: useQuery(api.payments.list, { organizationId })
    // This service function is kept for non-React contexts
    return [];
}

/**
 * Register a payment method for a user.
 */
export async function addPaymentMethod(
    _userId: string,
    method: Omit<PaymentMethod, "id">
): Promise<PaymentMethod> {
    // For now, return the method with a generated ID
    // In production, store in user profile or Stripe Customer
    return {
        id: `PM-${Date.now()}`,
        ...method,
    };
}

/**
 * List all registered and available payment providers.
 */
export function listAvailableProviders() {
    return getGateway().listProviders();
}

/**
 * Check if simulation mode is active.
 */
export function isSimulationMode(): boolean {
    const providers = getGateway().listAvailable();
    return providers.length === 1 && providers[0].name === "simulation";
}
