// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Services: Payment Service
// ═══════════════════════════════════════════════

export interface PaymentMethod {
    id: string;
    type: "mobile_money" | "card" | "bank_transfer";
    provider: string;
    last4?: string;
    isDefault: boolean;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed";
    method: PaymentMethod;
    createdAt: Date;
}

export async function createPayment(
    amount: number,
    currency: string,
    methodId: string
): Promise<PaymentIntent> {
    // TODO: Integrate with payment provider (Airtel Money, etc.)
    throw new Error("Not implemented");
}

export async function getPaymentHistory(
    userId: string
): Promise<PaymentIntent[]> {
    // TODO: Fetch payment history
    return [];
}

export async function addPaymentMethod(
    userId: string,
    method: Omit<PaymentMethod, "id">
): Promise<PaymentMethod> {
    // TODO: Add payment method
    throw new Error("Not implemented");
}
