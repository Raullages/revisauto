import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

function isPremiumStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

async function updateProfileByUserId(
  userId: string,
  payload: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    subscription_status?: string | null;
    subscription_tier?: "free" | "premium";
  },
) {
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(payload).eq("id", userId);

  if (error) {
    throw error;
  }
}

async function updateProfileByCustomerId(
  customerId: string,
  payload: {
    stripe_subscription_id?: string | null;
    subscription_status?: string | null;
    subscription_tier?: "free" | "premium";
  },
) {
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(payload).eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

  if (!userId) {
    return;
  }

  let subscriptionStatus: string | null = session.payment_status;
  let subscriptionTier: "free" | "premium" = session.payment_status === "paid" ? "premium" : "free";

  if (subscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    subscriptionStatus = subscription.status;
    subscriptionTier = isPremiumStatus(subscription.status) ? "premium" : "free";
  }

  await updateProfileByUserId(userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_status: subscriptionStatus,
    subscription_tier: subscriptionTier,
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;

  if (userId) {
    await updateProfileByUserId(userId, {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_tier: isPremiumStatus(subscription.status) ? "premium" : "free",
    });
    return;
  }

  if (!customerId) {
    return;
  }

  await updateProfileByCustomerId(customerId, {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_tier: isPremiumStatus(subscription.status) ? "premium" : "free",
  });
}

export async function POST(request: Request) {
  try {
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 400 },
    );
  }
}
