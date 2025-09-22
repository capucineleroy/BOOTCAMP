"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

// Types (adaptés à ton usage)
type Variant = { id?: string; size: string; color: string; price: number; stock: number };
type ImageRow = { id?: string; url: string; isThumbnail: boolean; position?: number };

type FormData = {
  name: string;              // "title" côté wording
  brand: string;
  category: string;
  description: string;
  price: number;             // prix de base affiché sur la PDP
  variants: Variant[];       // tailles/couleurs/prix/stock par variante
  images: ImageRow[];        // URLs + miniature
};

export default function AdminProductsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const productId = search.get("id"); // si présent => édition

  const [loading, setLoading] = useState<boolean>(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form initial
  const [form, setForm] = useState<FormData>({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: 0,
    variants: [{ size: "", color: "", price: 0, stock: 0 }],
    images: [{ url: "", isThumbnail: true }],
  });

  // ------- Préchargement en mode édition (depuis ta DB / lib existante) -------
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!productId) return;

      try {
        // on s'aligne sur ta page produit: fetch principal + tables variants/images
        const { getProduct } = await import("../../../lib/supabaseApi");
        const p = await getProduct(productId); // ta lib existante renvoie Product (brand, name, price, images, sizes, ...). :contentReference[oaicite:3]{index=3}
        if (!p) {
          setError("Produit introuvable.");
          setLoading(false);
          return;
        }

        // Variants depuis la table product_variants (comme dans la PDP) :contentReference[oaicite:4]{index=4}
        const { supabase } = await import("../../../lib/supabaseClient");
        const { data: vRows } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .order("size", { ascending: true });

        const variants: Variant[] = (vRows ?? []).map((v: any) => ({
          id: v.id,
          size: String(v.size ?? ""),
          color: String(v.color ?? ""),
          price: Number(v.price ?? 0),
          stock: Number(v.stock ?? 0),
        }));

        // Images depuis la table product_images (miniature = isThumbnail / position = 0) :contentReference[oaicite:5]{index=5}
        const { data: iRows } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("position", { ascending: true });

        const images: ImageRow[] =
          (iRows ?? []).map((img: any, index: number) => ({
            id: img.id,
            url: img.url,
            isThumbnail: !!img.is_thumbnail || index === 0,
            position: img.position ?? index,
          })) || [];

        if (!mounted) return;

        setForm({
          name: p.name ?? "",
          brand: p.brand ?? "",
          category: (p.category as string) ?? "",
          description: p.description ?? "",
          price: Number(p.price ?? 0),
          variants: variants.length ? variants : p.sizes?.map((s: any) => ({
            size: String(s.size ?? ""),
            color: String(s.color ?? ""),
            price: Number(s.price ?? p.price ?? 0),
            stock: Number(s.stock ?? 0),
          })) ?? [{ size: "", color: "", price: 0, stock: 0 }],
          images: images.length
            ? images
            : (p.images ?? []).map((url: string, idx: number) => ({
                url,
                isThumbnail: idx === 0,
                position: idx,
              })) || [{ url: "", isThumbnail: true }],
        });

        setLoading(false);
      } catch (e) {
        setError("Erreur lors du chargement du produit.");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  // ------- Handlers champs simples -------
  const setField = (k: keyof FormData, v: any) => setForm((prev) => ({ ...prev, [k]: v }));
  const onInput =
    (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setField(k, e.target.value);
    };

  // ------- Variants -------
  const addVariant = () =>
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { size: "", color: "", price: prev.price ?? 0, stock: 0 }] }));

  const removeVariant = (index: number) =>
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  const setVariant = (index: number, field: keyof Variant, value: string | number) =>
    setForm((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], [field]: field === "price" || field === "stock" ? Number(value) : (value as any) };
      return { ...prev, variants: next };
    });

  // ------- Images -------
  const addImage = () => setForm((prev) => ({ ...prev, images: [...prev.images, { url: "", isThumbnail: false }] }));

  const removeImage = (index: number) =>
    setForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      // si on supprime la miniature, on bascule la 1ère comme miniature
      if (!next.some((i) => i.isThumbnail) && next.length) next[0].isThumbnail = true;
      return { ...prev, images: next };
    });

  const setImage = (index: number, field: keyof ImageRow, value: string | boolean) =>
    setForm((prev) => {
      const next = [...prev.images];
      if (field === "isThumbnail" && value === true) {
        // assurer l'unicité de la miniature
        next.forEach((img, i) => (img.isThumbnail = i === index));
      } else {
        (next[index] as any)[field] = field === "url" ? String(value) : Boolean(value);
      }
      return { ...prev, images: next };
    });

  // ------- Validations rapides -------
  const problems = useMemo(() => {
    const issues: string[] = [];
    if (!form.name?.trim()) issues.push("Le titre est requis.");
    if (form.price < 0) issues.push("Le prix de base doit être positif.");
    if (!form.variants.length) issues.push("Ajoute au moins une variante.");
    form.variants.forEach((v, idx) => {
      if (!v.size) issues.push(`Variante #${idx + 1}: taille manquante.`);
      if (!v.color) issues.push(`Variante #${idx + 1}: couleur manquante.`);
      if (v.price < 0) issues.push(`Variante #${idx + 1}: prix doit être positif.`);
      if (v.stock < 0) issues.push(`Variante #${idx + 1}: stock doit être positif.`);
    });
    if (!form.images.length || !form.images.some((i) => i.url?.trim())) issues.push("Ajoute au moins une image.");
    return issues;
  }, [form]);

  // ------- Submit (POST/PATCH selon mode) -------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (problems.length) {
      setError(problems[0]);
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: form.price,
        variants: form.variants,
        images: form.images,
      };

      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Echec de l’enregistrement.");

      // Retour liste / page produit
      router.replace(productId ? `/product/${productId}` : "/shop");
    } catch (err: any) {
      setError(err?.message ?? "Erreur inconnue.");
      setSaving(false);
    }
  };

  // ------- UI (copie le style du checkout: sections/inputs/boutons) -------
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse h-8 w-52 bg-neutral-200 rounded mb-6" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="h-80 rounded-3xl border border-neutral-200 bg-white" />
          <div className="h-40 rounded-3xl border border-neutral-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-neutral-900">
            {productId ? "Modifier le produit" : "Créer un produit"}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Renseigne les informations produit. Le visuel et les champs reprennent l'ergonomie de la fiche produit.
          </p>

          <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Colonne gauche : Infos produit */}
            <div className="space-y-8">
              {/* Identité */}
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-900">Identité</h2>
                <p className="mt-1 text-sm text-neutral-500">Titre, marque, catégorie et description.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-neutral-700">Titre</label>
                    <input
                      value={form.name}
                      onChange={onInput("name")}
                      className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-neutral-700">Marque</label>
                    <input
                      value={form.brand}
                      onChange={onInput("brand")}
                      className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-neutral-700">Catégorie</label>
                    <input
                      value={form.category}
                      onChange={onInput("category")}
                      className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col">
                  <label className="text-sm font-medium text-neutral-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={onInput("description")}
                    rows={5}
                    className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </section>

              {/* Variantes */}
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-900">Tailles & couleurs</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Gère les combinaisons taille/couleur, leur prix spécifique et le stock.
                </p>

                <div className="mt-6 space-y-4">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid gap-3 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                      <input
                        placeholder="Taille (ex: 42)"
                        value={v.size}
                        onChange={(e) => setVariant(i, "size", e.target.value)}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        required
                      />
                      <input
                        placeholder="Couleur (ex: black)"
                        value={v.color}
                        onChange={(e) => setVariant(i, "color", e.target.value)}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        required
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder={`Prix (def: ${form.price})`}
                        value={v.price}
                        onChange={(e) => setVariant(i, "price", Number(e.target.value))}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        required
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => setVariant(i, "stock", Number(e.target.value))}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                      >
                        Suppr.
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="mt-4 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  + Ajouter une variante
                </button>
              </section>
            </div>

            {/* Colonne droite : actions / résumé simple */}
            <aside className="space-y-6">
              {/* Prix de base */}
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-900">Tarification</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Prix de base (affiché sur la PDP) et prix par variante si nécessaire.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-neutral-700">Prix TTC (base)*</label>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setField("price", Number(e.target.value))}
                      className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      required
                    />
                  </div>
                </div>
              </section>
              
              {/* Images */}
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-900">Images</h2>
                <p className="mt-1 text-sm text-neutral-500">Ajoute/supprime des URLs d'images. Marque une miniature.</p>

                <div className="mt-6 space-y-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                      <input
                        placeholder="https://…"
                        value={img.url}
                        onChange={(e) => setImage(i, "url", e.target.value)}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        required
                      />
                      <label className="inline-flex items-center gap-2 text-sm text-neutral-700 px-2">
                        <input
                          type="checkbox"
                          checked={!!img.isThumbnail}
                          onChange={(e) => setImage(i, "isThumbnail", e.target.checked)}
                        />
                        Miniature
                      </label>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                      >
                        Suppr.
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addImage}
                  className="mt-4 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  + Ajouter une image
                </button>
              </section>
              
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-900">Actions</h2>
                <div className="mt-4 space-y-2 text-sm text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span>Variantes</span>
                    <span className="font-medium">{form.variants.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Images</span>
                    <span className="font-medium">{form.images.filter((i) => i.url.trim()).length}</span>
                  </div>
                </div>

                {error ? (
                  <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                  </p>
                ) : null}
                  
                  <div>
                     <button
                          type="button"
                          onClick={() => router.push("/shop")}
                          className="px-2 py-1 rounded-lg border border-[#015A52] border-2 hover:bg-neutral-50">
                          Retour boutique
                      </button>

                      <button
                          type="submit"
                          disabled={saving}
                          className="px-2 py-1 rounded-lg border border-[#015A52] border-2 bg-[#015A52] text-white hover:opacity-95">
                          {saving ? (productId ? "Mise à jour..." : "Création...") : productId ? "Enregistrer les modifications" : "Créer le produit"}
                      </button> 
                  </div>
                  
                
              </section>
            </aside>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
