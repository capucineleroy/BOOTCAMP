"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../../../components/ProductCard";
import { useCart } from "../../../context/CartContext";
import { useFavorites } from "../../../context/FavoritesContext";
import { useAuth } from "../../../context/AuthContext";
import { HeartIcon } from "../../../components/icons";
import { fetchProducts, getProduct as fetchProduct } from "../../../lib/supabaseApi";
import type { Product, ProductVariant } from "../../../lib/types";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { add } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { role } = useAuth() as any;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [mainImageSrc, setMainImageSrc] = useState<string | null>(null);
  // recommandations
  const [similar, setSimilar] = useState<Product[]>([]);
  const [similarLoading, setSimilarLoading] = useState<boolean>(false);

  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number | null>(null);

  // Fetch product + ensure variants list from DB
  useEffect(() => {
    let mounted = true;
    fetchProduct(params.id)
      .then(async (p) => {
        if (!mounted) return;
        if (!p) { setProduct(null); return; }
        setProduct(p);
        try {
          const { supabase } = await import('../../../lib/supabaseClient');
          const { data: vRows } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', p.id);
          const mapped: ProductVariant[] = (vRows ?? []).map((v: any) => ({
            id: v.id,
            size: String(v.size),
            color: String(v.color ?? ''),
            price: Number(v.price ?? 0),
            stock: Number(v.stock ?? 0),
          }));
          if (mounted) setVariants(mapped);
          const base = mapped.length ? mapped : p.sizes;
          const first = base.find((s) => s.stock > 0) ?? base[0];
          if (first) {
            setSize(String(first.size));
            setColor(first.color);
          }
        } catch {
          // fallback to embedded sizes
          const base = p.sizes;
          setVariants(base);
          const first = base.find((s) => s.stock > 0) ?? base[0];
          if (first) {
            setSize(String(first.size));
            setColor(first.color ?? p.color);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [params.id]);

  // Measure main image height (optional, kept if you need it elsewhere)
  useEffect(() => {
    const measure = () => {
      if (mainImageRef.current) {
        setMainImageHeight(Math.round(mainImageRef.current.getBoundingClientRect().height));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (mainImageRef.current) ro.observe(mainImageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [product]);

  // Update selected variant and single image when size/color change
  useEffect(() => {
    if (!product || !size || !color) return;

    const updateVariantAndImages = async () => {
      try {
        const { supabase } = await import('../../../lib/supabaseClient');

        // Prefer local variants list to avoid extra network if available
        const local = variants.find((v) => String(v.size) === String(size) && v.color === color);
        let variant: any = local ?? null;
        if (!variant) {
          const { data: vRows } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .eq('size', String(size))
            .eq('color', color)
            .limit(1);
          variant = vRows?.[0] ?? null;
        }
        setSelectedVariant(variant);

        // Fetch first image only: prefer variant image; fallback to product image; else product.images[0]
        if (variant) {
          const { data: imgs } = await supabase
            .from('product_images')
            .select('url')
            .eq('product_id', product.id)
            .eq('variant_id', variant.id)
            .order('position', { ascending: true })
            .limit(1);
          if (imgs && imgs.length) {
            setMainImageSrc(imgs[0].url);
          } else {
            const { data: imgsFallback } = await supabase
              .from('product_images')
              .select('url')
              .eq('product_id', product.id)
              .is('variant_id', null)
              .order('position', { ascending: true })
              .limit(1);
            if (imgsFallback && imgsFallback.length) setMainImageSrc(imgsFallback[0].url);
            else setMainImageSrc(product.images?.[0] ?? null);
          }
        } else {
          setMainImageSrc(product.images?.[0] ?? null);
        }

      } catch (e) {
        // fallback
        setMainImageSrc(product.images?.[0] ?? null);
        setSelectedVariant(null);
      }
    };

    updateVariantAndImages();
  }, [product, size, color]);

  // Build independent color and size options from all variants (prefer DB variants)
  const colors = (() => {
    const source = variants.length ? variants : (product?.sizes ?? []);
    const unique = new Set(source.map((v) => v.color).filter(Boolean));
    return Array.from(unique);
  })();
  const [colorPreviews, setColorPreviews] = useState<Record<string, string | null>>({});
  const sizesAll = (() => {
    const source = variants.length ? variants : (product?.sizes ?? []);
    const unique = new Set(source.map((v) => String(v.size)));
    return Array.from(unique);
  })();

  // Load similar products by brand (exclude current)
  useEffect(() => {
    if (!product) return;
    let mounted = true;
    (async () => {
      try {
        setSimilarLoading(true);
        const all = await fetchProducts();
        const sameBrand = all.filter((p) => p.brand === product.brand && p.id !== product.id);
        const top = sameBrand.slice(0, 8);
        if (mounted) setSimilar(top);
      } catch {}
      finally { if (mounted) setSimilarLoading(false); }
    })();
    return () => { mounted = false; };
  }, [product?.id, product?.brand]);

  // Load one thumbnail per color (prefer variant images, fallback to product-level image)
  useEffect(() => {
    if (!product) return;
    const list = colors.length ? colors : (product.colors ?? [product.color]);
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import('../../../lib/supabaseClient');
        const previews: Record<string, string | null> = {};
        for (const c of list) {
          // find variant ids for this color
          const variantIds = variants.filter((v) => v.color === c).map((v) => v.id).filter(Boolean);
          if (variantIds.length) {
            const { data: imgs } = await supabase
              .from('product_images')
              .select('url')
              .in('variant_id', variantIds)
              .order('position', { ascending: true })
              .limit(1);
            previews[c] = imgs && imgs.length ? imgs[0].url : (product.images?.[0] ?? null);
          } else {
            // fallback to product-level image
            const { data: imgs } = await supabase
              .from('product_images')
              .select('url')
              .eq('product_id', product.id)
              .is('variant_id', null)
              .order('position', { ascending: true })
              .limit(1);
            previews[c] = imgs && imgs.length ? imgs[0].url : (product.images?.[0] ?? null);
          }
        }
        if (mounted) setColorPreviews(previews);
      } catch (e) {
        // fallback to product first image for all colors
        const def = product.images?.[0] ?? null;
        const obj: Record<string, string | null> = {};
        for (const c of list) obj[c] = def;
        if (mounted) setColorPreviews(obj);
      }
    })();
    return () => { mounted = false; };
  }, [product, variants]);

  // CO2 index same as ProductCard
  const co2Index = (seed: string | number) => {
    const s = String(seed);
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 46) + 5; // range 5–50
  };
  const co2 = useMemo(() => co2Index((product?.id ?? params.id) as string), [product?.id, params.id]);

  if (loading) return <div className="container py-8">Chargement...</div>;
  if (!product) return notFound();

  const stock = selectedVariant?.stock ?? 0;

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Single image only (left column) */}
        <div className="flex flex-col gap-4">
          <div ref={mainImageRef} className="aspect-[4/3] rounded-xl overflow-hidden">
            <img src={mainImageSrc ?? product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Details (right column) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight flex-1">{product.brand} {product.name}</h1>
            <button
              aria-label={isFavorite(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              title={isFavorite(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={() => toggle(product.id)}
              className="p-2 rounded-full border hover:bg-white text-rose-500"
            >
              <HeartIcon filled={isFavorite(product.id)} className="w-5 h-5 hover:cursor-pointer" />
            </button>
          </div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">{product.price.toFixed(0)} €</div>
           <div className="w-fit inline-flex text-sm bg-white border rounded px-2 py-1 text-emerald-700">
             {co2} g CO₂e
          </div>
          {/* Sizes (independent; disable invalid combos for current color) */}
          <div>
            <div className="text-sm font-medium mb-3">Choisissez votre taille</div>
            <div className="flex flex-wrap gap-3">
              {sizesAll.map((sz) => {
                const source = variants.length ? variants : (product.sizes ?? []);
                const combo = source.find((v) => String(v.size) === String(sz) && v.color === color);
                const outOfStock = !combo || combo.stock === 0;
                return (
                  <div key={sz} className="relative inline-block">
                    <button
                      onClick={() => !outOfStock && setSize(String(sz))}
                      disabled={outOfStock}
                      aria-disabled={outOfStock}
                      aria-label={outOfStock ? `${sz} — Rupture de stock` : `${sz}`}
                      className={`
                        relative px-4 py-2 rounded-xl border text-sm font-medium
                        transition-all duration-200 ease-in-out
                        ${size === sz && !outOfStock 
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.02]" 
                          : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400"}
                        ${outOfStock 
                          ? "bg-red-50 text-red-700 border-red-200 cursor-not-allowed opacity-70" 
                          : "hover:cursor-pointer hover:shadow-sm hover:scale-[1.01]"}
                      `}
                    >
                      {sz}
                    </button>
                  
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-neutral-600 mt-2">{selectedVariant ? (stock > 0 ? `${stock} en stock` : "Rupture de stock") : "Combinaison non disponible"}</div>
          </div>

          {/* Colors (independent; disable invalid combos for current size) */}
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Couleurs disponibles</div>
            <div className="flex items-center gap-3">
              {(colors.length ? colors : (product.colors ?? [product.color])).map((c) => {
                const source = variants.length ? variants : (product.sizes ?? []);
                const combo = source.find((v) => String(v.size) === String(size) && v.color === c);
                const disabled = !combo || combo.stock === 0;
                const preview = colorPreviews[c] ?? null;
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    disabled={disabled}
                    title={`Couleur ${c}${combo ? ` — ${combo.stock} en stock pour la taille ${size ?? ''}` : ' — indisponible pour la taille actuelle'}`}
                    aria-label={`Couleur ${c}${combo ? `, ${combo.stock} en stock` : ', indisponible'}`}
                    className={`
                      relative w-12 h-12 rounded-full overflow-hidden
                      border border-neutral-300 shadow-sm
                      transition-all duration-200 ease-in-out
                      hover:scale-105 hover:shadow-md hover:cursor-pointer
                      ${color === c ? 'ring-2 ring-[var(--color-brand-3)]' : ''}
                      ${disabled ? 'opacity-40 cursor-not-allowed hover:scale-100 hover:shadow-sm' : ''}
                    `}
                  >
                    {preview ? (
                      // show the thumbnail preview for this color
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt={`Aperçu ${c}`} className="w-full h-full object-cover" />
                    ) : (
                      // fallback to colored swatch when no image available
                      <span className="w-full h-full block" style={{ backgroundColor: c }} aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-sm text-neutral-700">
              Couleur sélectionnée: <span className="font-medium">{color ?? '-'}</span>
              {selectedVariant ? (
                stock > 0 ? ` — ${stock} en stock` : ' — rupture de stock'
              ) : ' — combinaison non disponible'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            {role === 'admin' ? (
              <button
                onClick={() => router.push(`/admin/products?id=${product.id}`)}
                className="px-6 py-3 rounded-lg bg-[#014545] text-white hover:bg-[#026b6b] hover:cursor-pointer transition-colors"
              >
                Modifier le produit
              </button>
            ) : (
              <button
                onClick={() => selectedVariant && add(selectedVariant.id, 1)}
                disabled={!selectedVariant || stock === 0}
                className="px-6 py-3 rounded-lg bg-[color:var(--color-brand-3)] text-white disabled:opacity-50 hover:cursor-pointer"
              >
                Ajouter au panier
              </button>
            )}
            <button onClick={() => router.push("/shop")} className="px-6 py-3 rounded-lg border-2 hover:cursor-pointer"
              >Retour au catalogue
            </button>
          </div>
        </div>

        {/* Description: full width under both columns */}
        <div className="md:col-span-2 border-t pt-6 text-neutral-700">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p className="text-sm leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Similar products */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Produits similaires</h2>
        {similarLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg overflow-hidden">
                <div className="aspect-square w-full bg-neutral-200" />
                <div className="p-2 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : similar.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-600">Aucun similaire trouvé.</div>
        )}
      </div>
    </div>
  );
}
