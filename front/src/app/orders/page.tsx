"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type OrderItemRow = {
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  product_variants?: {
    size: string;
    color: string;
    products?: {
      title: string;
    } | null;
  } | null;
};

type OrderRow = {
  id: string;
  created_at: string | null;
  status: string | null;
  total_amount: number | null;
  shipping_address: Record<string, unknown> | null;
  order_items: OrderItemRow[];
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select(
            "id, created_at, status, total_amount, shipping_address, order_items (variant_id, quantity, price_at_purchase, product_variants (size, color, products (title)))"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!active) return;

        if (fetchError) {
          console.error(fetchError);
          setError("Impossible de recuperer vos commandes pour le moment.");
          setOrders([]);
          return;
        }

        setOrders((data as OrderRow[]) ?? []);
      } catch (fetchException) {
        console.error(fetchException);
        if (!active) return;
        setError("Une erreur inattendue est survenue.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const content = useMemo(() => {
    if (!user) {
      return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Connexion requise</h1>
          <p className="mt-3 text-sm text-neutral-600">Connectez-vous pour consulter l'historique de vos commandes.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#014545] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#026b6b]"
          >
            Se connecter
          </Link>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm text-sm text-neutral-600">
          Chargement de vos commandes...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm text-sm text-rose-600">
          {error}
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Aucune commande pour le moment</h2>
          <p className="mt-3 text-sm text-neutral-600">Parcourez notre boutique et lancez-vous dans l'experience Sneco.</p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#014545] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#026b6b]"
          >
            Explorer la boutique
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order) => {
          const createdAt = order.created_at ? dateFormatter.format(new Date(order.created_at)) : "Date inconnue";
          const status = order.status ?? "paid";
          const amount = (order.total_amount ?? 0).toFixed(2);
          const items = order.order_items ?? [];
          const shippingCity = typeof order.shipping_address === "object" && order.shipping_address !== null
            ? (order.shipping_address as Record<string, unknown>).city ?? undefined
            : undefined;

          return (
            <article key={order.id} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Commande</p>
                  <h3 className="mt-1 text-lg font-semibold text-neutral-900">{order.id}</h3>
                  <p className="text-sm text-neutral-500">Passee le {createdAt}</p>
                  {shippingCity ? (
                    <p className="text-xs text-neutral-500">Livraison : {String(shippingCity)}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full border border-[#014545] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#014545]">
                    {status}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-neutral-900">{amount} EUR</p>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {items.map((item, index) => {
                    const variant = item.product_variants;
                    const productTitle = variant?.products?.title ?? "Produit";
                    return (
                      <div
                        key={`${order.id}-${item.variant_id}-${index}`}
                        className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-900">{productTitle}</span>
                          <span className="text-xs text-neutral-500">
                            Variante {item.variant_id} - Taille {variant?.size ?? "-"} - Couleur {variant?.color ?? "-"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block">Qte {item.quantity}</span>
                          <span className="block text-neutral-900">{Number(item.price_at_purchase ?? 0).toFixed(2)} EUR</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                  Aucun article detaille pour cette commande.
                </p>
              )}
            </article>
          );
        })}
      </div>
    );
  }, [user, loading, error, orders]);

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">Historique d'achat</h1>
          <p className="mt-2 text-sm text-neutral-600">Consultez vos commandes passees et suivez leur statut.</p>
        </header>
        {content}
      </div>
    </div>
  );
}

