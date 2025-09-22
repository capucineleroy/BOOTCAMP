"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"] as const;
const maxFileSize = 10 * 1024 * 1024; // 10 Mo

const photoFields = [
  { id: "leftFront", label: "Avant des chaussures" },
  { id: "leftBack", label: "Arrière des chaussures" },
  { id: "leftSide", label: "Côté droit chaussure gauche" },
  { id: "rightFront", label: "Côté gauche chaussure gauche" },
  { id: "rightBack", label: "Côté droit chaussure droite" },
  { id: "rightSide", label: "Côté gauche chaussure droite" },
] as const;

type PhotoFieldId = (typeof photoFields)[number]["id"];
type FileState = Record<PhotoFieldId, File | null>;
type ErrorState = Record<PhotoFieldId, string | null>;

type FormMessage = {
  type: "success" | "error";
  text: string;
};

type ProductRow = {
  title?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover?: string | null;
  main_image?: string | null;
  hero_image?: string | null;
  images?: string[] | null;
  [key: string]: unknown;
};

type ProductVariantRow = {
  size?: string | null;
  color?: string | null;
  products?: ProductRow | null;
  [key: string]: unknown;
};

type OrderItemRow = {
  id?: string;
  quantity?: number | null;
  product_variants?: ProductVariantRow | null;
  [key: string]: unknown;
};

type OrderRow = {
  id: string;
  created_at: string | null;
  order_items: OrderItemRow[];
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const getInitialFileState = (): FileState =>
  photoFields.reduce((acc, field) => {
    acc[field.id] = null;
    return acc;
  }, {} as FileState);

const getInitialErrorState = (): ErrorState =>
  photoFields.reduce((acc, field) => {
    acc[field.id] = null;
    return acc;
  }, {} as ErrorState);

function resolveProductImage(product: ProductRow | null | undefined): string {
  if (!product) return "/repair.jpeg";

  const lookupKeys = [
    "thumbnail_url",
    "image_url",
    "cover",
    "main_image",
    "hero_image",
  ];

  for (const key of lookupKeys) {
    const value = product[key];
    if (typeof value === "string" && value.length > 0) return value;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const candidate = product.images[0];
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }

  return "/repair.jpeg";
}

export default function OrderRepairPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<FileState>(() => getInitialFileState());
  const [errors, setErrors] = useState<ErrorState>(() => getInitialErrorState());
  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);

  const orderId = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : params?.id ?? ""), [params?.id]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (!orderId) {
      setError("Identifiant de commande manquant.");
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select(
            "id, created_at, order_items (id, quantity, product_variants (size, color, products (*)))"
          )
          .eq("id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (fetchError) {
          console.error(fetchError);
          setError("Impossible de recuperer cette commande.");
          setOrder(null);
          return;
        }

        if (!data) {
          setError("Commande introuvable.");
          setOrder(null);
          return;
        }

        setOrder({
          id: data.id,
          created_at: data.created_at,
          order_items: (data.order_items as OrderItemRow[]) ?? [],
        });
      } catch (err) {
        console.error(err);
        if (active) setError("Une erreur inattendue est survenue.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      active = false;
    };
  }, [orderId, user?.id]);

  const isLoggedIn = Boolean(user?.id);

  const handleFileChange = (fieldId: PhotoFieldId) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormMessage(null);

    setFiles((prev) => ({
      ...prev,
      [fieldId]: file,
    }));

    if (!file) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "Merci d'importer une photo.",
      }));
      return;
    }

    if (file.size > maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "La photo depasse 10 Mo.",
      }));
      return;
    }

    if (!allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number])) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "Format non pris en charge (jpg, png, gif).",
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldId]: null,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newErrors = getInitialErrorState();
    let hasError = false;

    photoFields.forEach((field) => {
      const file = files[field.id];

      if (!file) {
        newErrors[field.id] = "Merci d'importer une photo.";
        hasError = true;
        return;
      }

      if (file.size > maxFileSize) {
        newErrors[field.id] = "La photo depasse 10 Mo.";
        hasError = true;
        return;
      }

      if (!allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number])) {
        newErrors[field.id] = "Format non pris en charge (jpg, png, gif).";
        hasError = true;
        return;
      }

      newErrors[field.id] = null;
    });

    setErrors(newErrors);

    if (hasError) {
      setFormMessage({
        type: "error",
        text: "Merci de corriger les erreurs avant de continuer.",
      });
      return;
    }

    setFormMessage({
      type: "success",
      text: "Vous recevrez un devis par email sous 72h.",
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-0">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-lg">
            <h1 className="text-2xl font-semibold text-neutral-900">Connexion requise</h1>
            <p className="mt-3 text-sm text-neutral-600">
              Connectez-vous pour demander une réparation sur l'une de vos commandes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[#014545] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#026b6b]"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#014545] hover:text-[#014545]"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-16 sm:px-6 lg:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#014545]">Réparation</p>
            <h1 className="text-3xl font-semibold text-neutral-900">Demande de réparation</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Ajoutez les photos de votre paire pour que nos artisans établissent un devis sur mesure.
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-700 transition hover:border-[#014545] hover:text-[#014545]"
          >
            Retour commandes
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-lg">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 rounded-2xl bg-neutral-100" />
              <div className="h-4 rounded bg-neutral-100" />
              <div className="h-4 w-2/3 rounded bg-neutral-100" />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-6 text-sm text-rose-600">
              {error}
            </div>
          ) : order ? (
            <article className="space-y-5">
              <header className="flex flex-col gap-3 border-b border-neutral-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Commande</p>
                  <h2 className="text-lg font-semibold text-neutral-900">{order.id}</h2>
                  <p className="text-sm text-neutral-500">
                    Achetée le {order.created_at ? dateFormatter.format(new Date(order.created_at)) : "date inconnue"}
                  </p>
                </div>
              </header>
              <div className="space-y-3">
                {order.order_items?.length ? (
                  order.order_items.map((item, index) => {
                    const variant = item.product_variants;
                    const product = variant?.products as ProductRow | null | undefined;
                    const title = (product?.title as string | undefined) ?? "Produit";
                    const imgSrc = resolveProductImage(product);
                    return (
                      <div
                        key={item.id ?? `${order.id}-${index}`}
                        className="flex flex-col gap-4 rounded-2xl bg-neutral-50 p-4 md:flex-row md:items-center"
                      >
                        <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-white md:h-20 md:w-20">
                          <img
                            src={imgSrc}
                            alt={String(title)}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1 text-sm text-neutral-700">
                          <span className="font-semibold text-neutral-900">{title}</span>
                          <span className="text-xs text-neutral-500">
                            Taille {variant?.size ?? "-"} - Couleur {variant?.color ?? "-"}
                          </span>
                          <span className="text-xs text-neutral-500">Quantité {item.quantity ?? 1}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-neutral-500">Aucun article associé à cette commande.</p>
                )}
              </div>
            </article>
          ) : null}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">Photos obligatoires</h2>
              <p className="text-sm text-neutral-600">
                Formats acceptes : .jpg, .png, .gif - Taille maximale : 10 Mo par photo.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              {photoFields.map((field) => {
                const file = files[field.id];
                const fieldError = errors[field.id];
                return (
                  <label
                    key={field.id}
                    htmlFor={field.id}
                    className="flex flex-col rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-4 text-sm text-neutral-700 transition hover:border-[#014545]"
                  >
                    <span className="font-medium text-neutral-900">{field.label}</span>
                    <input
                      id={field.id}
                      name={field.id}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif"
                      required
                      className="mt-3 text-xs text-neutral-600 file:me-4 file:rounded-full file:border-0 file:bg-[#014545] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:transition hover:file:bg-[#026b6b]"
                      onChange={handleFileChange(field.id)}
                    />
                    <span className="mt-2 text-xs text-neutral-500">
                      {file ? file.name : "Ajoutez une image nette et lumineuse."}
                    </span>
                    {fieldError ? (
                      <span className="mt-2 text-xs font-medium text-rose-600">{fieldError}</span>
                    ) : null}
                  </label>
                );
              })}
            </div>

            {formMessage ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  formMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {formMessage.text}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-neutral-500">
                Conservez vos preuves d'achat et utilisez de la lumière naturelle pour vos photos afin d'accélérer le diagnostic.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#014545] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#014545]/40 transition hover:bg-[#026b6b]"
              >
                Envoyer ma demande de réparation
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}