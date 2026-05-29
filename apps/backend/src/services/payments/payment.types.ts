export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  // Extend as needed
}

export interface PaymentResult {
  id: string;
  amount: number;
  currency: string;
  // Extend as needed
}

export interface RefundResult {
  id: string;
  amount: number;
  // Extend as needed
}

export interface GatewayEvent {
  data: {
    object: {
      id?: string;
      amount?: number;
      currency?: string;
      metadata?: { userId?: string };
    };
  };
}
