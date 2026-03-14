import { NextRequest, NextResponse } from "next/server";
import { stripeRail } from "@/lib/payments/stripe/checkout";
import { processPaymentEvent } from "@/modules/contributions/webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = await stripeRail.normalizeWebhookEvent(
      Buffer.from(body),
      signature
    );

    const result = await processPaymentEvent("stripe", event);

    if (result.duplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("[Stripe Webhook Error]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
