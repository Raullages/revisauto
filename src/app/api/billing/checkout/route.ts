import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getAppUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const forwardedHost = headerStore.get("x-forwarded-host");

  if (forwardedHost) {
    const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, subscription_tier, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    if (profile.subscription_tier === "premium") {
      return NextResponse.json({ error: "Seu plano Premium já está ativo" }, { status: 400 });
    }

    const stripe = getStripe();
    const admin = createAdminClient();
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        name: profile.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      const { error: updateError } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json({ error: "Erro ao preparar cliente de cobrança" }, { status: 500 });
      }
    }

    const appUrl = await getAppUrl();

    if (!appUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL is not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: getStripePriceId(),
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/premium?checkout=success`,
      cancel_url: `${appUrl}/premium?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao iniciar checkout" },
      { status: 500 },
    );
  }
}
