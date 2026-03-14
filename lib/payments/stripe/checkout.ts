import { getStripe } from "./client";
import type { PaymentRail, CreateSessionInput, CreateSessionResult, NormalizedPaymentEvent } from "../rails/types";

export const stripeRail: PaymentRail = {
  name: "stripe",

  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.customerEmail,
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: input.amountCents,
              product_data: {
                name: `Contribution: ${input.opportunityTitle}`,
                description: "Participation contribution toward curated luxury acquisition",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          contribution_id: input.contributionId,
        },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      },
      {
        idempotencyKey: input.idempotencyKey,
      }
    );

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
    };
  },

  async normalizeWebhookEvent(payload: Buffer, signature: string): Promise<NormalizedPaymentEvent> {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    const eventObj = event.data.object as unknown as Record<string, unknown>;
    const metadata = (eventObj.metadata ?? {}) as Record<string, string>;

    let normalizedStatus: NormalizedPaymentEvent["normalizedStatus"] = "failed";
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      normalizedStatus = "captured";
    } else if (event.type === "charge.refunded") {
      normalizedStatus = "refunded";
    } else if (event.type === "charge.dispute.created") {
      normalizedStatus = "chargeback";
    }

    return {
      processorEventId: event.id,
      eventType: event.type,
      normalizedStatus,
      contributionId: metadata.contribution_id,
      sessionId: eventObj.id as string,
      amountCents: typeof eventObj.amount_total === "number" ? eventObj.amount_total : undefined,
      rawPayload: eventObj,
    };
  },
};
