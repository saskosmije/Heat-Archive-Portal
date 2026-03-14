export interface CreateSessionInput {
  contributionId: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  opportunityTitle: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface CreateSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface NormalizedPaymentEvent {
  processorEventId: string;
  eventType: string;
  normalizedStatus: "captured" | "failed" | "refunded" | "chargeback";
  contributionId?: string;
  sessionId?: string;
  amountCents?: number;
  rawPayload: Record<string, unknown>;
}

export interface PaymentRail {
  name: string;
  createSession(input: CreateSessionInput): Promise<CreateSessionResult>;
  normalizeWebhookEvent(payload: Buffer, signature: string): Promise<NormalizedPaymentEvent>;
}
