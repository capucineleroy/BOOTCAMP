import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const FALLBACK_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const MAX_METADATA_LENGTH = 500;

type IncomingItem = {
  name?: string;
  variantId?: string;
  quantity?: number;
  unitPrice?: number;
  image?: string;
};

type IncomingCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

type IncomingShipping = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

function encodeItemsMetadata(items: IncomingItem[]) {
  const compact = items.map((item) => [String(item.variantId ?? ""), Number(item.quantity ?? 1), Number(item.unitPrice ?? 0)]);
  const serialized = JSON.stringify(compact);
  return serialized.length <= MAX_METADATA_LENGTH ? serialized : null;
}

function encodeShippingMetadata(shipping: IncomingShipping) {
  const payload = {
    addressLine1: shipping.addressLine1 ?? "",
    addressLine2: shipping.addressLine2 ?? "",
    city: shipping.city ?? "",
    postalCode: shipping.postalCode ?? "",
    country: shipping.country ?? "",
  };
  const serialized = JSON.stringify(payload);
  return serialized.length <= MAX_METADATA_LENGTH ? serialized : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];
    const customer: IncomingCustomer = body?.customer ?? {};
    const shipping: IncomingShipping = body?.shipping ?? {};
    const userId = typeof body?.userId === "string" && body.userId.trim() ? body.userId.trim() : null;

    if (!items.length) {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }

    if (!customer?.email) {
      return NextResponse.json({ error: "Adresse e-mail requise." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis pour passer commande." }, { status: 401 });
    }

    const lineItems = items.map((item) => {
      const unitAmount = Math.max(0, Math.round(Number(item?.unitPrice ?? 0) * 100));
      const quantity = Math.max(1, Number(item?.quantity ?? 1));
      return {
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          product_data: {
            name: String(item?.name ?? "Produit"),
            images: item?.image ? [String(item.image)] : undefined,
          },
        },
        quantity,
      } as const;
    });

    const metadata: Record<string, string> = { userId };

    const encodedItems = encodeItemsMetadata(items);
    if (encodedItems) {
      metadata.items = encodedItems;
    }

    const encodedShipping = encodeShippingMetadata(shipping);
    if (encodedShipping) {
      metadata.shipping = encodedShipping;
    }

    const successUrl = String(body?.successUrl || `${FALLBACK_ORIGIN}/order-success?session_id={CHECKOUT_SESSION_ID}`);
    const cancelUrl = String(body?.cancelUrl || `${FALLBACK_ORIGIN}/checkout`);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: String(customer.email),
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      metadata,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session creation failed", error);
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
