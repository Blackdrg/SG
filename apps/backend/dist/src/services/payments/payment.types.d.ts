export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
}
export interface PaymentResult {
    id: string;
    amount: number;
    currency: string;
}
export interface RefundResult {
    id: string;
    amount: number;
}
export interface GatewayEvent {
    data: {
        object: {
            id?: string;
            amount?: number;
            currency?: string;
            metadata?: {
                userId?: string;
            };
        };
    };
}
