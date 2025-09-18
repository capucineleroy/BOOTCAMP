"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { fetchProducts, getProduct as fetchProduct } from "../../../lib/supabaseApi";
import type { Product, ProductVariant } from "../../../lib/types";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { add } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const [mainImageSrc, setMainImageSrc] = useState<string | null>(null);
  // recommandations
  const [similar, setSimilar] = useState<Product[]>([]);
  const [similarLoading, setSimilarLoading] = useState<boolean>(false);

  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number | null>(null);

  // Fetch product
  useEffect(() => {
    let mounted = true;
    fetchProduct(params.id)
      .then((p) => {
        if (!mounted) return;
        if (!p) return setProduct(null);
        setProduct(p);

        // init size + color
        const firstSize = p.sizes.find((s) => s.stock > 0)?.size ?? p.sizes[0]?.size;
        setSize(firstSize);
        setColor(p.colors?.[0] ?? p.color);
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

        // Find variant
        const { data: variants } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id)
          .eq('size', String(size))
          .eq('color', color)
          .limit(1);

        const variant = variants?.[0] ?? null;
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

  // Build independent color and size options from all variants
  const colors = (() => {
    if (!product) return [] as string[];
    const unique = new Set(product.sizes.map((v) => v.color).filter(Boolean));
    return Array.from(unique);
  })();
  const sizesAll = (() => {
    if (!product) return [] as string[];
    const unique = new Set(product.sizes.map((v) => String(v.size)));
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

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!product) return notFound();

  const stock = selectedVariant?.stock ?? 0;

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Single image only (left column) */}
        <div className="flex flex-col gap-4">
          <div ref={mainImageRef} className="aspect-[4/3] rounded-xl overflow-hidden border">
            <img src={mainImageSrc ?? product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Details (right column) */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.brand} {product.name}</h1>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">{product.price.toFixed(0)} €</div>
          <div className="w-fit inline-flex text-sm bg-white border rounded px-2 py-1 text-emerald-700">
            {product.co2} kg CO₂e
          </div>
          {/* Sizes (independent; disable invalid combos for current color) */}
          <div>
            <div className="text-sm font-medium mb-3">Choisissez votre taille</div>
            <div className="flex flex-wrap gap-3">
              {sizesAll.map((sz) => {
                const combo = product.sizes.find((v) => String(v.size) === String(sz) && v.color === color);
                const disabled = !combo || combo.stock === 0;
                return (
                  <button
                    key={sz}
                    onClick={() => setSize(String(sz))}
                    disabled={disabled}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${size === sz ? "bg-neutral-900 text-white" : "bg-white"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {sz}
                  </button>
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
                const combo = product.sizes.find((v) => String(v.size) === String(size) && v.color === c);
                const disabled = !combo || combo.stock === 0;
                const stockBadge = combo ? combo.stock : 0;
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    disabled={disabled}
                    title={`Couleur ${c}${combo ? ` — ${combo.stock} en stock pour la taille ${size ?? ''}` : ' — indisponible pour la taille actuelle'}`}
                    aria-label={`Couleur ${c}${combo ? `, ${combo.stock} en stock` : ', indisponible'}`}
                    className={`relative w-8 h-8 rounded-full border-2 ${color === c ? 'ring-2 ring-offset-2 ring-neutral-900' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: c }}
                  >
                    <span className="absolute -bottom-1 -right-1 min-w-[18px] px-1 h-4 rounded-full bg-white border text-[10px] leading-4 text-neutral-700">
                      {stockBadge}
                    </span>
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
            <button
              onClick={() => selectedVariant && add(selectedVariant.id, 1)}
              disabled={!selectedVariant || stock === 0}
              className="px-6 py-3 rounded-lg bg-[color:var(--color-brand-3)] text-white disabled:opacity-50"
            >
              Add to cart
            </button>
            <button onClick={() => router.push("/shop")} className="px-6 py-3 rounded-lg border">Back to shop</button>
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
              <a key={p.id} href={`/product/${p.id}`} className="block group border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images?.[0] ?? '/placeholder.png'} alt={p.name} className="aspect-square w-full object-cover group-hover:opacity-95" />
                <div className="p-2">
                  <div className="text-sm font-medium line-clamp-1">{p.brand} {p.name}</div>
                  <div className="text-sm text-neutral-600">{p.price.toFixed(0)} €</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-600">Aucun similaire trouvé.</div>
        )}
      </div>
    </div>
  );
}
