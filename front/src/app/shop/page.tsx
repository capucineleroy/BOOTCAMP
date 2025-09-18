'use client'
import ProductCard from "../../components/ProductCard";
import { fetchProducts } from "../../lib/supabaseApi";
import { SearchIcon } from "../../components/icons";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Product } from '../../lib/types';
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") ?? "";
  const trimmedQuery = rawQuery.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const [searchValue, setSearchValue] = useState(rawQuery);
  const [productsState, setProductsState] = useState<Product[]>([]);

  const list = useMemo(
    () =>
      normalizedQuery
        ? productsState.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
        : productsState,
    [normalizedQuery, productsState]
  );

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((res) => { if (mounted) setProductsState(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSearchValue(rawQuery);
  }, [rawQuery]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = searchValue.trim();
    if (trimmed) params.set("q", trimmed);
    router.push(params.toString() ? `/shop?${params.toString()}` : "/shop");
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-semibold">Catalogue</h1>
            <form onSubmit={submitSearch} className="hidden w-[360px] max-w-full items-center gap-2 sm:flex">
              <div className="relative flex-1">
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search sneakers..."
                  className="w-full rounded-full border border-[#014545] px-4 py-2 pl-10 text-sm outline-none focus:ring-2 ring-[#014545]"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              </div>
            </form>
          </div>
          {trimmedQuery && (
            <p className="text-sm text-neutral-600">Results for "{trimmedQuery}"</p>
          )}
        </div>
        <div className="text-sm text-neutral-600">{list.length} products</div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

