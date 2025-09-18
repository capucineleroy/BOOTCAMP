"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { getProduct as fetchProduct } from "../../../lib/supabaseApi";
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
  const [thumbnails, setThumbnails] = useState<string[]>([]);

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

  // Measure main image height
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

  // Update selected variant and images when size/color change
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

        // Fetch images for variant first
        if (variant) {
          const { data: imgs } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', product.id)
            .eq('variant_id', variant.id)
            .order('position', { ascending: true });

          if (imgs && imgs.length) {
            const urls = imgs.map((x: any) => x.url);
            setThumbnails(urls);
            setMainImageSrc(urls[0]);
            return;
          }
        }

        // Fallback: product-level images
        const { data: imgsFallback } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id)
          .is('variant_id', null)
          .order('position', { ascending: true });

        if (imgsFallback && imgsFallback.length) {
          const urls = imgsFallback.map((x: any) => x.url);
          setThumbnails(urls);
          setMainImageSrc(urls[0]);
        } else {
          setThumbnails(product.images ?? []);
          setMainImageSrc(product.images?.[0] ?? null);
        }

      } catch (e) {
        // fallback
        setThumbnails(product.images ?? []);
        setMainImageSrc(product.images?.[0] ?? null);
        setSelectedVariant(null);
      }
    };

    updateVariantAndImages();
  }, [product, size, color]);

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!product) return notFound();

  const stock = selectedVariant?.stock ?? 0;
  const sizesForColor = product.sizes.filter((s) => !color || s.color === color);

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div ref={mainImageRef} className="aspect-[4/3] rounded-xl overflow-hidden border">
            <img src={mainImageSrc ?? product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(thumbnails.length ? thumbnails : product.images).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg border cursor-pointer" onClick={() => setMainImageSrc(src)}>
                <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid" style={mainImageHeight ? { gridTemplateRows: `${mainImageHeight}px 1fr` } : undefined}>
          <div className="flex flex-col gap-4 overflow-auto pr-2">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.brand} {product.name}</h1>
            <div className="mt-2 text-3xl font-extrabold text-neutral-900">{product.price.toFixed(0)} €</div>
            <div className="inline-flex text-sm bg-white border rounded px-2 py-1 text-emerald-700">{product.co2} kg CO₂e</div>

            {/* Sizes */}
            <div>
              <div className="text-sm font-medium mb-3">Choose your size</div>
              <div className="flex flex-wrap gap-3">
                {sizesForColor.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSize(String(s.size))}
                    disabled={s.stock === 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${size === s.size ? "bg-neutral-900 text-white" : "bg-white"} ${s.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
              <div className="text-sm text-neutral-600 mt-2">{stock > 0 ? `${stock} in stock` : "Out of stock"}</div>
            </div>

            {/* Colors */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Available colors</div>
              <div className="flex items-center gap-3">
                {(product.colors ?? [product.color]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'ring-2 ring-offset-2 ring-neutral-900' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
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

          {/* Description */}
          <div className="border-t pt-6 text-neutral-700 overflow-auto">
            <h1 className="text-3xl font-bold mb-2">Description</h1>
            <p className="text-sm font-semiqbold leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
