import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type Stripe from "stripe";

type SearchParams = {
  session_id?: string;
};

type NormalisedItem = {
  variantId: string;
  quantity: number;
  unitPrice: number;
};

function parseItemsMetadata(session: Stripe.Checkout.Session): NormalisedItem[] {
  const raw = session.metadata?.items;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<[string, number, number]>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(([variantId, quantity, unitPrice]) => ({
      variantId: String(variantId ?? ""),
      quantity: Number(quantity ?? 1),
      unitPrice: Number(unitPrice ?? 0),
    }));
  } catch (error) {
    console.error("Unable to parse metadata items", error);
    return [];
  }
}

function parseShippingMetadata(session: Stripe.Checkout.Session) {
  const raw = session.metadata?.shipping;
  if (!raw) {
    return session.shipping_details ?? null;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    console.error("Unable to parse shipping metadata", error);
    return session.shipping_details ?? null;
  }
}

async function ensureOrderPersisted(
  session: Stripe.Checkout.Session,
  userId: string,
  items: NormalisedItem[],
  shippingSummary: Record<string, unknown> | Stripe.Checkout.Session.ShippingDetails | null
) {
  const sessionId = session.id;
  const amount = (session.amount_total ?? 0) / 100;

  try {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("shipping_address->>stripe_session_id", sessionId)
      .maybeSingle();

    if (!existingError && existing) {
      return existing.id as string;
    }
  } catch (lookupError) {
    console.error("orders lookup failed", lookupError);
  }

  const shippingPayload: Record<string, unknown> = {
    stripe_session_id: sessionId,
  };

  if (shippingSummary && typeof shippingSummary === "object") {
    Object.assign(shippingPayload, shippingSummary);
  }

  const orderInsertPayload: Record<string, unknown> = {
    user_id: userId,
    total_amount: amount,
    status: "paid",
    shipping_address: shippingPayload,
    billing_address: session.customer_details?.address ?? null,
  };

  try {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert(orderInsertPayload)
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.warn("orders insert failed", insertError);
      return null;
    }

    const orderId = inserted.id as string;

    if (items.length > 0) {
      const orderItemsPayload = items.map((item) => ({
        order_id: orderId,
        variant_id: item.variantId,
        quantity: item.quantity,
        price_at_purchase: item.unitPrice,
      }));

      const { error: orderItemsError } = await supabaseAdmin.from("order_items").insert(orderItemsPayload);
      if (orderItemsError) {
        console.error("order_items insert failed", orderItemsError);
      }
    }

    return orderId;
  } catch (insertException) {
    console.error("orders insert exception", insertException);
    return null;
  }
}

export default async function OrderSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const sessionId = searchParams?.session_id;

  if (!sessionId) {
    redirect("/shop");
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch (error) {
    console.error("Failed to retrieve checkout session", error);
    return notFound();
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("Missing userId in Stripe metadata");
    return notFound();
  }

  const items = parseItemsMetadata(session);
  const shippingSummary = parseShippingMetadata(session);
  const orderId = await ensureOrderPersisted(session, userId, items, shippingSummary);
  const displayOrderId = orderId ?? session.id;
  const amountPaid = (session.amount_total ?? 0) / 100;

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#014545]">Merci !</p>
          <h1 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">Commande confirmee</h1>
          <p className="mt-4 text-sm text-neutral-600">
            Un e-mail de confirmation a ete envoye a {session.customer_details?.email ?? "votre adresse"}.
          </p>

          <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-700">
            <p className="font-semibold text-neutral-900">Numero de commande</p>
            <p className="mt-1 text-base font-mono">{displayOrderId}</p>
            <p className="mt-4 text-neutral-600">
              Montant regle : <span className="font-semibold text-neutral-900">{amountPaid.toFixed(2)} EUR</span>
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-full bg-[#014545] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#026b6b]"
            >
              Historique d'achat
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
