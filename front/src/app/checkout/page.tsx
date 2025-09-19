"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ShippingAddress = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
};

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "CA", label: "Canada" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { detailed } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [shipping, setShipping] = useState<ShippingAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: COUNTRIES[0]?.code ?? "FR",
  });

  useEffect(() => {
    if (!user) return;
    setCustomer((prev) => ({
      ...prev,
      firstName: prev.firstName || (user.user_metadata?.firstName as string) || "",
      lastName: prev.lastName || (user.user_metadata?.lastName as string) || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (detailed.length === 0) {
      const timeout = setTimeout(() => router.replace("/shop"), 2000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [detailed.length, router]);

  const subtotal = useMemo(() => {
    return detailed.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [detailed]);

  const taxes = useMemo(() => {
    return Math.round(subtotal * 0.2 * 100) / 100;
  }, [subtotal]);

  const grandTotal = useMemo(() => subtotal + taxes, [subtotal, taxes]);

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Votre panier est vide</h1>
        <p className="mt-3 text-sm text-neutral-600">Redirection vers la boutique en cours...</p>
        <button
          type="button"
          onClick={() => router.push("/shop")}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[#014545] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#026b6b]"
        >
          Explorer la boutique
        </button>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const origin = window.location.origin;
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          shipping,
          userId: user?.id ?? null,
          items: detailed.map((item) => ({
            name: item.product.name,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.variant.price,
            image: item.product.images?.[0],
          })),
          successUrl: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/checkout`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Creation de la session Stripe impossible.");
      }

      if (data?.url) {
        window.location.href = data.url as string;
        return;
      }

      throw new Error("Reponse Stripe inattendue.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-neutral-900">Finaliser votre commande</h1>
        <p className="mt-2 text-sm text-neutral-600">Renseignez vos coordonnees pour acceder au paiement securise.</p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">Informations client</h2>
              <p className="mt-1 text-sm text-neutral-500">Ces informations serviront pour la facture et le suivi.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label htmlFor="firstName" className="text-sm font-medium text-neutral-700">Prenom</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={customer.firstName}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="lastName" className="text-sm font-medium text-neutral-700">Nom</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={customer.lastName}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, lastName: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={customer.email}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-sm font-medium text-neutral-700">Telephone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={customer.phone}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, phone: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">Adresse de livraison</h2>
              <p className="mt-1 text-sm text-neutral-500">Nous exp?dions en Europe et en Amerique du Nord.</p>

              <div className="mt-6 space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="addressLine1" className="text-sm font-medium text-neutral-700">Adresse</label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    value={shipping.addressLine1}
                    onChange={(event) => setShipping((prev) => ({ ...prev, addressLine1: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="addressLine2" className="text-sm font-medium text-neutral-700">Complement d'adresse (optionnel)</label>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    value={shipping.addressLine2}
                    onChange={(event) => setShipping((prev) => ({ ...prev, addressLine2: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label htmlFor="city" className="text-sm font-medium text-neutral-700">Ville</label>
                    <input
                      id="city"
                      name="city"
                      value={shipping.city}
                      onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
                      className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="postalCode" className="text-sm font-medium text-neutral-700">Code postal</label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      value={shipping.postalCode}
                      onChange={(event) => setShipping((prev) => ({ ...prev, postalCode: event.target.value }))}
                      className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="country" className="text-sm font-medium text-neutral-700">Pays</label>
                  <select
                    id="country"
                    name="country"
                    value={shipping.country}
                    onChange={(event) => setShipping((prev) => ({ ...prev, country: event.target.value }))}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">Resume de commande</h2>
              <div className="mt-4 space-y-4">
                {detailed.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images?.[0] ?? "/placeholder.png"}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{item.product.name}</p>
                        <p className="text-xs text-neutral-500">
                          Taille {item.variant.size}{item.variant.color ? ` ? ${item.variant.color}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-neutral-700">
                        <span>Quantite : {item.quantity}</span>
                        <span className="font-medium">{(item.variant.price * item.quantity).toFixed(2)} EUR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm text-neutral-700">
                <div className="flex items-center justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} EUR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes estimees</span>
                  <span>{taxes.toFixed(2)} EUR</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-neutral-900">
                  <span>Total TTC</span>
                  <span>{grandTotal.toFixed(2)} EUR</span>
                </div>
              </div>
            </section>

            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#014545] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#026b6b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Redirection vers Stripe..." : "Payer avec Stripe"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="w-full rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Continuer mes achats
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}

